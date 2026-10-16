#!/usr/bin/env python3
"""
fit_voiceover.py — fit the recorded El Niño narration to the video, as tight as it reads well.

  python3 scripts/voiceover/fit_voiceover.py <narration.wav> <vosk-model-dir> [--speed 1.1] [--pause 0.3]

1. Speeds the take up (`--speed`, default 1.1; pitch preserved via ffmpeg atempo).
2. Transcribes it offline with Vosk (word timestamps). Needs `pip install vosk` and a Vosk English model
   (e.g. vosk-model-small-en-us-0.15 from https://alphacephei.com/vosk/models) and ffmpeg on PATH.
3. Caps every pause between words at `--pause` seconds (default 0.3) by cutting the middle of longer gaps
   (10 ms fades, so no clicks).
4. Aligns the words to scripts/voiceover/narration.txt (difflib; unmatched words are interpolated).
5. Scene length = short lead-in + spoken length + short tail. Chapter cards (CHAPTER_FRAMES) play over the
   first words of their scene rather than over silence. Scene 8 keeps an END_SCREEN-frame end screen.
   No padding to a fixed total — the video is as long as the narration needs.
6. Resolves every phrase in src/timing/anchors.json to frames relative to its scene → src/timing/timing.json.
   Only these anchors are stored — no transcript, no captions.
7. Places each scene's audio at its scene start → public/voiceover.wav (mono, source sample rate).

Input must be mono 16-bit PCM WAV (convert first with ffmpeg if needed).
"""
import array, difflib, json, os, re, subprocess, sys, tempfile, wave

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FPS = 30
CHAPTER_SCENES = {2, 3, 4, 5, 6}
LEAD, CHAPTER_LEAD, TAIL = 0.25, 0.45, 0.35   # seconds
END_SCREEN = 240                               # frames (8 s), Scene 8
PAD_BEFORE, PAD_AFTER = 0.08, 0.22             # audio kept around each scene's first/last word


def arg(name, default):
    if name in sys.argv:
        return float(sys.argv[sys.argv.index(name) + 1])
    return default


def norm(text):
    t = text.lower().replace('ñ', 'n').replace('’', "'").replace('-', ' ')
    t = t.replace('metre', 'meter').replace('kilometres', 'kilometers')
    return re.findall(r"[a-z']+", t)


def load_script():
    scenes, cur = {}, None
    for line in open(os.path.join(ROOT, 'scripts/voiceover/narration.txt'), encoding='utf-8'):
        line = line.strip()
        if line.startswith('## '):
            cur = int(line[3:]); scenes[cur] = []
        elif line and not line.startswith('#') and cur:
            scenes[cur] += norm(line)
    return scenes


def transcribe(wav_path, model_dir):
    from vosk import Model, KaldiRecognizer, SetLogLevel
    SetLogLevel(-1)
    wf = wave.open(wav_path, 'rb')
    rec = KaldiRecognizer(Model(model_dir), wf.getframerate()); rec.SetWords(True)
    words = []
    while True:
        data = wf.readframes(4000)
        if not data: break
        if rec.AcceptWaveform(data): words += json.loads(rec.Result()).get('result', [])
    words += json.loads(rec.FinalResult()).get('result', [])
    return words


def cap_pauses(pcm, rate, words, cap):
    """Cut the middle of every inter-word gap longer than `cap`. Returns new pcm, time-mapping fn, cut total."""
    cuts = []  # (start, end) in seconds, sorted
    for a, b in zip(words, words[1:]):
        gap = b['start'] - a['end']
        if gap > cap:
            mid = (a['end'] + b['start']) / 2
            half = (gap - cap) / 2
            cuts.append((mid - half, mid + half))
    out = array.array('h')
    pos = 0
    f = rate // 100
    for s, e in cuts:
        si, ei = round(s * rate), round(e * rate)
        seg = pcm[pos:si]
        if len(seg) > 2 * f:
            for k in range(f):
                seg[-1 - k] = int(seg[-1 - k] * k / f)
        out.extend(seg)
        pos = ei
        nxt = pcm[pos:pos + f]
        for k in range(len(nxt)):
            pcm[pos + k] = int(nxt[k] * k / f)
    out.extend(pcm[pos:])

    def remap(t):
        removed = 0.0
        for s, e in cuts:
            if t >= e: removed += e - s
            elif t > s: removed += t - s
        return t - removed

    return out, remap, sum(e - s for s, e in cuts)


def align(script_tokens, words):
    """Start/end time for every script token."""
    heard = [w['word'].lower() for w in words]
    sm = difflib.SequenceMatcher(None, script_tokens, heard, autojunk=False)
    times = [None] * len(script_tokens)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            times[a + k] = (words[b + k]['start'], words[b + k]['end'])
    known = [i for i, t in enumerate(times) if t]
    for i, t in enumerate(times):
        if t: continue
        prev = max((k for k in known if k < i), default=None)
        nxt = min((k for k in known if k > i), default=None)
        if prev is None: times[i] = times[nxt]
        elif nxt is None: times[i] = times[prev]
        else:
            fr = (i - prev) / (nxt - prev)
            s = times[prev][1] + (times[nxt][0] - times[prev][1]) * fr
            times[i] = (s, s + 0.2)
    return times, len(known)


def main():
    wav_path, model_dir = sys.argv[1], sys.argv[2]
    speed, cap = arg('--speed', 1.1), arg('--pause', 0.3)
    script = load_script()
    order = sorted(script)
    flat, owner = [], []
    for s in order:
        flat += script[s]; owner += [s] * len(script[s])

    # 1. speed up
    tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False).name
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav_path, '-af', f'atempo={speed}', '-ac', '1', '-c:a', 'pcm_s16le', tmp], check=True)
    src = wave.open(tmp, 'rb')
    rate, width, ch = src.getframerate(), src.getsampwidth(), src.getnchannels()
    assert width == 2 and ch == 1, 'expects mono 16-bit PCM'
    pcm = array.array('h', src.readframes(src.getnframes()))
    orig_len = len(pcm) / rate

    # 2–3. transcribe, cap pauses, remap word times
    words = transcribe(tmp, model_dir)
    pcm, remap, removed = cap_pauses(pcm, rate, words, cap)
    for w in words:
        w['start'], w['end'] = remap(w['start']), remap(w['end'])
    print(f'speed ×{speed}: {orig_len:.1f} s; pauses capped at {cap}s: −{removed:.1f} s → {len(pcm) / rate:.1f} s of audio')

    # 4. align
    times, matched = align(flat, words)
    print(f'aligned {matched}/{len(flat)} script words to {len(words)} heard words')

    spans = {}
    for s in order:
        idx = [i for i, o in enumerate(owner) if o == s]
        spans[s] = (max(0.0, times[idx[0]][0] - PAD_BEFORE), times[idx[-1]][1] + PAD_AFTER, idx[0])
    # never overlap the next scene's first word
    for a, b in zip(order, order[1:]):
        if spans[a][1] > spans[b][0]:
            mid = (times[[i for i, o in enumerate(owner) if o == a][-1]][1] + times[spans[b][2]][0]) / 2
            spans[a] = (spans[a][0], mid, spans[a][2]); spans[b] = (mid, spans[b][1], spans[b][2])

    # 5. scene lengths
    lead = {s: (CHAPTER_LEAD if s in CHAPTER_SCENES else LEAD) for s in order}
    dur = {s: round((lead[s] + spans[s][1] - spans[s][0] + TAIL) * FPS) + (END_SCREEN if s == order[-1] else 0) for s in order}
    total = sum(dur.values())

    anchors_spec = json.load(open(os.path.join(ROOT, 'src/timing/anchors.json')))
    timing = {'fps': FPS, 'totalFrames': total, 'endScreenFrames': END_SCREEN, 'speed': speed, 'pauseCap': cap, 'scenes': [], 'anchors': {}}
    frm = 0
    for s in order:
        audio_start = spans[s][0]
        narr_from = round(lead[s] * FPS)
        rel = lambda t: narr_from + round((t - audio_start) * FPS)
        timing['scenes'].append({
            'id': s, 'from': frm, 'durationInFrames': dur[s], 'narrationFrom': narr_from,
            'narrationTo': rel(spans[s][1]), 'audio': [round(spans[s][0], 3), round(spans[s][1], 3)],
        })
        toks = script[s]; base_i = spans[s][2]
        res = {}
        for phrase in [p for p in anchors_spec.get(str(s), [])]:
            p = norm(phrase)
            hit = next((i for i in range(len(toks) - len(p) + 1) if toks[i:i + len(p)] == p), None)
            if hit is None: sys.exit(f'anchor "{phrase}" not found in scene {s} script')
            res[phrase] = {'from': rel(times[base_i + hit][0]), 'to': rel(times[base_i + hit + len(p) - 1][1])}
        timing['anchors'][str(s)] = res
        frm += dur[s]
    json.dump(timing, open(os.path.join(ROOT, 'src/timing/timing.json'), 'w'), indent=1)

    # 7. assemble public/voiceover.wav
    out = array.array('h', bytes(2 * round(total / FPS * rate)))
    for sc in timing['scenes']:
        a, b = (max(0, round(t * rate)) for t in sc['audio'])
        at = round((sc['from'] + sc['narrationFrom']) / FPS * rate)
        seg = pcm[a:b]
        f = min(len(seg) // 2, rate // 100)
        for k in range(f):
            seg[k] = int(seg[k] * k / f); seg[-1 - k] = int(seg[-1 - k] * k / f)
        out[at:at + len(seg)] = seg
    os.makedirs(os.path.join(ROOT, 'public'), exist_ok=True)
    w = wave.open(os.path.join(ROOT, 'public/voiceover.wav'), 'wb')
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(out.tobytes()); w.close()
    os.unlink(tmp)

    for sc in timing['scenes']:
        print(f"scene {sc['id']}: from {sc['from']:5d}  {sc['durationInFrames']:5d} frames ({sc['durationInFrames']/FPS:5.1f} s)  narration {sc['narrationFrom']}–{sc['narrationTo']}")
    print(f'TOTAL {total} frames = {total // FPS // 60}:{total // FPS % 60:02d}')


if __name__ == '__main__':
    main()
