#!/usr/bin/env python3
"""
make_captions.py — YouTube caption file (.srt) for the fitted narration. Uploaded separately to YouTube
(closed captions); never burned into the video.

  python3 scripts/voiceover/make_captions.py <narration.wav> <vosk-model-dir> [out.srt]

Re-runs the same speed-up / pause-cap / alignment as fit_voiceover.py (settings read from timing.json), maps
every word to its time in the final video, and groups words into short cues (≤ 42 characters, ≤ 3.2 s,
breaking at sentence ends). Spoken numbers are written as digits ("three point seven" → "3.7").
"""
import array, json, os, re, subprocess, sys, tempfile, wave

sys.path.insert(0, os.path.dirname(__file__))
from fit_voiceover import ROOT, align, cap_pauses, norm, transcribe  # noqa: E402

MAX_CHARS, MAX_DUR, MIN_DUR = 42, 3.2, 0.9

# spoken form → caption form (matched on normalised tokens)
NUMBERS = [
    ('nino three point four', 'Niño 3.4'),
    ('three point seven degrees', '3.7 degrees'),
    ('one hundred percent', '100%'),
    ('february twenty twenty seven', 'February 2027'),
    ('nineteen eighty two', '1982,'),
    ('nineteen ninety seven', '1997,'),
    ('twenty fifteen', '2015.'),
    ('twenty sixteen', '2016'),
    ('twenty twenty four', '2024'),
    ('twenty twenty seven', '2027'),
]


def display_words(scene_lines):
    """[(display text, number of normalised tokens)] for one scene, numbers collapsed to digits."""
    raw = ' '.join(scene_lines).split()
    items = [(w, len(norm(w))) for w in raw if norm(w)]
    out, i = [], 0
    while i < len(items):
        hit = None
        for spoken, shown in NUMBERS:
            sp = spoken.split()
            j, toks = i, []
            while j < len(items) and len(toks) < len(sp):
                toks += norm(items[j][0]); j += 1
            if toks == sp:
                # keep the punctuation that followed the last spoken word, unless the caption form has its own
                m = re.search(r'[^\w’\']+$', items[j - 1][0])
                tail = m.group(0) if m and shown[-1] not in ',.' else ''
                hit = (shown + tail, sum(n for _, n in items[i:j]), j)
                break
        if hit:
            out.append((hit[0], hit[1])); i = hit[2]
        else:
            out.append(items[i]); i += 1
    return out


def load_lines():
    scenes, cur = {}, None
    for line in open(os.path.join(ROOT, 'scripts/voiceover/narration.txt'), encoding='utf-8'):
        line = line.strip()
        if line.startswith('## '):
            cur = int(line[3:]); scenes[cur] = []
        elif line and not line.startswith('#') and cur:
            scenes[cur].append(line)
    return scenes


def ts(t):
    ms = max(0, round(t * 1000))
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'


def main():
    wav_path, model_dir = sys.argv[1], sys.argv[2]
    out_path = sys.argv[3] if len(sys.argv) > 3 else os.path.join(ROOT, 'out/elnino-captions.srt')
    timing = json.load(open(os.path.join(ROOT, 'src/timing/timing.json')))
    fps, speed, cap = timing['fps'], timing['speed'], timing['pauseCap']

    tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False).name
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav_path, '-af', f'atempo={speed}', '-ac', '1', '-c:a', 'pcm_s16le', tmp], check=True)
    src = wave.open(tmp, 'rb')
    pcm = array.array('h', src.readframes(src.getnframes()))
    words = transcribe(tmp, model_dir)
    _, remap, _ = cap_pauses(pcm, src.getframerate(), words, cap)
    for w in words:
        w['start'], w['end'] = remap(w['start']), remap(w['end'])
    os.unlink(tmp)

    lines = load_lines()
    order = sorted(lines)
    flat = [t for s in order for t in norm(' '.join(lines[s]))]
    times, _ = align(flat, words)

    cues, k = [], 0
    for s in order:
        sc = timing['scenes'][s - 1]
        offset = (sc['from'] + sc['narrationFrom']) / fps - sc['audio'][0]
        cur, start = [], None
        for text, n in display_words(lines[s]):
            t0, t1 = times[k][0] + offset, times[k + n - 1][1] + offset
            k += n
            ends = re.search(r'[.?!:]["”’]?$', text)
            limit = MAX_CHARS + 8 if ends and len(text) <= 9 else MAX_CHARS  # no one-word orphans like "it."
            if cur and (len(' '.join(cur + [text])) > limit or t1 - start > MAX_DUR + (0.6 if ends else 0)):
                cues.append([start, prev_end, ' '.join(cur)]); cur, start = [], None
            if start is None: start = t0
            cur.append(text); prev_end = t1
            # break at sentence ends, and at commas once the cue is reasonably full
            if re.search(r'[.?!:]["”’]?$', text) or (text.endswith(',') and len(' '.join(cur)) >= 22):
                cues.append([start, prev_end, ' '.join(cur)]); cur, start = [], None
        if cur:
            cues.append([start, prev_end, ' '.join(cur)])

    # readability: minimum on-screen time, never overlapping the next cue
    for i, c in enumerate(cues):
        nxt = cues[i + 1][0] if i + 1 < len(cues) else c[1] + 2
        c[1] = min(max(c[1] + 0.15, c[0] + MIN_DUR), nxt - 0.04)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        for i, (a, b, text) in enumerate(cues, 1):
            f.write(f'{i}\n{ts(a)} --> {ts(b)}\n{text}\n\n')
    print(f'{len(cues)} cues → {out_path} (last ends {ts(cues[-1][1])})')


if __name__ == '__main__':
    main()
