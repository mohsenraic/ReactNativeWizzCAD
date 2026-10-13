#!/usr/bin/env python3
"""
fit_voiceover.py — fit a recorded narration to the video.

  python3 scripts/voiceover/fit_voiceover.py <narration.wav|mp3> <vosk-model-dir>

1. Transcribes the audio offline with Vosk (word timestamps).
2. Aligns the words to the exact script in src/data/captions.ts (numbers expanded to how they're
   spoken: "1970s" → "nineteen seventies").
3. Sets each scene's length = spoken length + 0.4 s lead-in + a share of the spare time, keeping the
   total at 9000 frames and a clean 10 s end screen in Scene 8 → rewrites src/timeline.ts.
4. Re-times every caption chunk → rewrites src/data/captions.ts (every visual cue follows).
5. Places each scene's audio at its scene start → public/voiceover.mp3.

Requirements: `pip install vosk`, a Vosk English model (e.g. vosk-model-small-en-us-0.15 from
https://alphacephei.com/vosk/models), and `npx` (uses Remotion's bundled ffmpeg).
The narration must follow the script word for word (one take, all 8 scenes in order).
"""
import array, difflib, json, math, os, re, subprocess, sys, tempfile, wave

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FPS, TOTAL, END, LEAD = 30, 9000, 300, 0.4

# ── spoken forms of numbers ──────────────────────────────────────────────────
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = '_ _ twenty thirty forty fifty sixty seventy eighty ninety'.split()
def w99(n): return ONES[n] if n < 20 else TENS[n // 10] + (' ' + ONES[n % 10] if n % 10 else '')
def w999(n): return (ONES[n // 100] + ' hundred' + (' ' + w99(n % 100) if n % 100 else '')) if n >= 100 else w99(n)
def words(n):
    out = []
    for v, name in ((10**9, 'billion'), (10**6, 'million'), (1000, 'thousand')):
        if n >= v: out.append(w999(n // v) + ' ' + name); n %= v
    if n or not out: out.append(w999(n))
    return ' '.join(out)
def year(n): return w99(n // 100) + ' ' + (w99(n % 100) if n % 100 >= 10 else ('hundred' if n % 100 == 0 else 'oh ' + ONES[n % 100]))
def spoken(tok):
    t = tok.replace(',', '')
    if m := re.fullmatch(r'(\d{4})s', t):
        y = year(int(m.group(1)))
        return y[:-2] + 'ties' if y.endswith('ty') else y + 's'
    if re.fullmatch(r'(19|20)\d\d', t): return year(int(t))
    if m := re.fullmatch(r'(\d+)\.(\d+)', t): return words(int(m.group(1))) + ' point ' + ' '.join(ONES[int(d)] for d in m.group(2))
    if m := re.fullmatch(r'(\d+)(st|nd|rd|th)', t): return words(int(m.group(1))) + 'th'
    if t.isdigit(): return words(int(t))
    return tok
def tokens(text):
    out = []
    for tok in re.findall(r"\d[\d,.]*\d(?:s|st|nd|rd|th)?|\d(?:st|nd|rd|th)?|[A-Za-z’'-]+", text):
        t = spoken(tok.rstrip('.,')) if tok[0].isdigit() else tok
        out += re.findall(r"[a-z']+", t.lower().replace('’', "'").replace('-', ' '))
    return out

def run(cmd, **kw): return subprocess.run(cmd, check=True, cwd=ROOT, **kw)

def main(audio, model_dir):
    from vosk import KaldiRecognizer, Model, SetLogLevel
    tmp = tempfile.mkdtemp()
    raw, a16 = os.path.join(tmp, 'raw.wav'), os.path.join(tmp, '16k.wav')
    run(['npx', 'remotion', 'ffmpeg', '-y', '-i', audio, '-ac', '1', '-c:a', 'pcm_s16le', raw], capture_output=True)
    run(['npx', 'remotion', 'ffmpeg', '-y', '-i', raw, '-ar', '16000', a16], capture_output=True)

    # 1. transcribe
    SetLogLevel(-1)
    wf = wave.open(a16, 'rb'); rec = KaldiRecognizer(Model(model_dir), wf.getframerate()); rec.SetWords(True)
    asr = []
    while data := wf.readframes(4000):
        if rec.AcceptWaveform(data): asr += json.loads(rec.Result()).get('result', [])
    asr += json.loads(rec.FinalResult()).get('result', [])

    # 2. align to the script
    exporter = os.path.join(tmp, 'export.ts')
    open(exporter, 'w').write(f"import {{ captions }} from '{ROOT}/src/data/captions';\nconsole.log(JSON.stringify(captions.map((c) => ({{ scene: c.scene, text: c.lines.join(' ') }}))));\n")
    chunks = json.loads(run(['npx', 'tsx', exporter], capture_output=True, text=True).stdout)
    script = [(w, k) for k, c in enumerate(chunks) for w in tokens(c['text'])]
    sm = difflib.SequenceMatcher(a=[w for w, _ in script], b=[w['word'] for w in asr], autojunk=False)
    match = {b.a + d: b.b + d for b in sm.get_matching_blocks() for d in range(b.size)}
    print(f'matched {len(match)}/{len(script)} script words ({len(match) / len(script):.0%})')
    T = []
    for k in range(len(chunks)):
        idx = [i for i, (_, kk) in enumerate(script) if kk == k]
        m = [match[i] for i in idx if i in match]
        T.append([asr[m[0]]['start'], asr[m[-1]]['end'], idx[0] in match, idx[-1] in match] if m else None)
    for k, t in enumerate(T):
        if t is None:
            p = next(T[j] for j in range(k - 1, -1, -1) if T[j]); n = next(T[j] for j in range(k + 1, len(T)) if T[j])
            T[k] = [p[1] + 0.05, n[0] - 0.05, True, True]
    for k, t in enumerate(T):
        if not t[3] and k + 1 < len(T): t[1] = max(t[1], T[k + 1][0] - 0.08)
        if not t[2] and k > 0: t[0] = min(t[0], T[k - 1][1] + 0.08)

    # 3. scene lengths
    scenes = sorted({c['scene'] for c in chunks})
    first = {s: min(k for k, c in enumerate(chunks) if c['scene'] == s) for s in scenes}
    last = {s: max(k for k, c in enumerate(chunks) if c['scene'] == s) for s in scenes}
    spokenlen = {s: T[last[s]][1] - T[first[s]][0] for s in scenes}
    base = {s: spokenlen[s] + LEAD for s in scenes}
    d_last = math.ceil(base[scenes[-1]] * FPS) + END + 6
    rest = TOTAL - d_last
    slack = rest / FPS - sum(base[s] for s in scenes[:-1])
    if slack < 0: sys.exit(f'Narration is {-slack:.1f} s too long for a 5:00 video — raise TOTAL_FRAMES or trim.')
    w = sum(spokenlen[s] for s in scenes[:-1])
    dur = {s: math.floor((base[s] + slack * spokenlen[s] / w) * FPS) for s in scenes[:-1]}
    for s in sorted(dur, key=lambda s: -spokenlen[s])[: rest - sum(dur.values())]: dur[s] += 1
    dur[scenes[-1]] = d_last
    start, acc = {}, 0
    for s in scenes: start[s] = acc; acc += dur[s]

    p = os.path.join(ROOT, 'src/timeline.ts'); src = open(p).read()
    for s in scenes:
        src = re.sub(r"(id: %d,\s*name: '[A-Za-z]+',\s*from: )\d+(,\s*durationInFrames: )\d+" % s, lambda m: f'{m.group(1)}{start[s]}{m.group(2)}{dur[s]}', src)
    src = re.sub(r'narrationWindow: \{ from: 0, to: \d+ - END_SCREEN_FRAMES', f'narrationWindow: {{ from: 0, to: {dur[scenes[-1]]} - END_SCREEN_FRAMES', src)
    fmt = lambda f: f'{int(f / FPS) // 60}:{int(f / FPS) % 60:02d}'
    rows = '\n'.join(f' *   {s}      {fmt(start[s])}–{fmt(start[s] + dur[s])}   {dur[s] / FPS:5.1f} s' for s in scenes)
    src = re.sub(r' \*   scene  range         length\n(?: \*   \d .*\n)+', f' *   scene  range         length\n{rows}\n', src)
    open(p, 'w').write(src)

    # 4. captions
    caps = []
    for k, c in enumerate(chunks):
        s = c['scene']; off = start[s] / FPS + LEAD - T[first[s]][0]
        caps.append([s, math.floor((T[k][0] + off) * FPS), math.ceil((T[k][1] + off) * FPS) + 3])
    for k in range(len(caps) - 1):
        caps[k][2] = min(caps[k][2], caps[k + 1][1], start[caps[k][0]] + dur[caps[k][0]])
    p = os.path.join(ROOT, 'src/data/captions.ts'); src = open(p).read()
    lines = re.findall(r'  \{ scene: \d+, from: \d+, to: \d+, lines: (\[.*?\]) \},', src)
    body = '\n'.join(f'  {{ scene: {s}, from: {a}, to: {b}, lines: {ln} }},' for (s, a, b), ln in zip(caps, lines))
    i0 = src.index('export const captions: Caption[] = [\n') + len('export const captions: Caption[] = [\n')
    open(p, 'w').write(src[:i0] + body + src[src.index('\n];', i0):])

    # 5. audio placed on the timeline
    rw = wave.open(raw, 'rb'); sr = rw.getframerate(); data = array.array('h', rw.readframes(rw.getnframes()))
    out = array.array('h', bytes(2 * int(TOTAL / FPS * sr)))
    for i, s in enumerate(scenes):
        a = max(0.0, T[first[s]][0] - 0.12)
        b = T[first[scenes[i + 1]]][0] - 0.12 if i + 1 < len(scenes) else len(data) / sr
        dst = int((start[s] / FPS + LEAD - 0.12) * sr)
        seg = data[int(a * sr):int(b * sr)][: max(0, int((start[s] + dur[s]) / FPS * sr) - dst)]
        out[dst:dst + len(seg)] = seg
    placed = os.path.join(tmp, 'placed.wav')
    with wave.open(placed, 'wb') as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes(out.tobytes())
    run(['npx', 'remotion', 'ffmpeg', '-y', '-i', placed, '-c:a', 'libmp3lame', '-b:a', '128k', 'public/voiceover.mp3'], capture_output=True)
    for s in scenes: print(f'scene {s}: {dur[s] / FPS:5.1f} s (spoken {spokenlen[s]:.1f} s)')
    print('Updated src/timeline.ts, src/data/captions.ts, public/voiceover.mp3. Run: npm run check:data')

if __name__ == '__main__':
    if len(sys.argv) != 3: sys.exit(__doc__)
    main(os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2]))
