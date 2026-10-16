#!/usr/bin/env python3
"""
fit_timings.py — fit src/timings.ts to the recorded voiceover, fully offline (ffmpeg only, no speech recognition).

  python3 scripts/voiceover/fit_timings.py                 # reads public/voiceover.wav, rewrites src/timings.ts
  python3 scripts/voiceover/fit_timings.py --dry-run       # report only
  python3 scripts/voiceover/fit_timings.py --short         # the 30 s vertical Short (public/short/voiceover.wav)

How it works
  1. ffmpeg silencedetect finds every pause in the take.
  2. The narration (scripts/voiceover/narration.txt) is split into sentences. A dynamic-programming pass chooses
     which pauses are sentence boundaries so that each sentence's length matches its word count at the speaker's
     pace (longer pauses are preferred as boundaries, paragraph ends even more).
  3. Each scene starts just before the first word of its paragraph (a little earlier for chapter-card scenes);
     the last scene runs to the end of the take + END_HOLD seconds (end screen).
  4. Every cue phrase in scripts/voiceover/cues.json gets the time of its word inside its sentence.
  5. The numbers in src/timings.ts (`seconds:` and each cue) are rewritten in place — comments and structure stay,
     so you can still hand-tune afterwards. The audio itself is never edited.
"""
import json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SHORT = '--short' in sys.argv
WAV = os.path.join(ROOT, 'public', 'short', 'voiceover.wav') if SHORT else os.path.join(ROOT, 'public', 'voiceover.wav')
TIMINGS = os.path.join(ROOT, 'src', 'short', 'timings.ts') if SHORT else os.path.join(ROOT, 'src', 'timings.ts')
NARRATION = 'scripts/voiceover/short-narration.txt' if SHORT else 'scripts/voiceover/narration.txt'
CUES = 'scripts/voiceover/short-cues.json' if SHORT else 'scripts/voiceover/cues.json'
CHAPTER_SCENES = set() if SHORT else {2, 3, 7, 8, 9}
LEAD, CHAPTER_LEAD = 0.30, 0.50  # seconds of air before a scene's first word
END_HOLD = 1.2 if SHORT else 15.0  # seconds after the last word (end screen) — keeps the video ≥ 8:00 so YouTube allows mid-roll ads
MIN_PAUSE = 0.25


def silences(path):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'silencedetect=noise=-38dB:d=0.15', '-f', 'null', '-'], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    dur = float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', out).group(3)) + 60 * float(re.search(r'Duration: (\d+):(\d+)', out).group(2))
    if len(ends) < len(starts):
        ends.append(dur)
    return list(zip(starts, ends)), dur


def words(text):
    return re.findall(r"[A-Za-z0-9'’-]+", text)


def load():
    paras, cur = {}, None
    for line in open(os.path.join(ROOT, NARRATION), encoding='utf-8'):
        line = line.rstrip('\n')
        if line.startswith('## '):
            cur = int(line[3:])
            paras[cur] = ''
        elif cur and line and not line.startswith('#'):
            paras[cur] += (' ' if paras[cur] else '') + line
    cues = json.load(open(os.path.join(ROOT, CUES), encoding='utf-8'))
    return paras, cues


def main():
    dry = '--dry-run' in sys.argv
    if not os.path.exists(WAV):
        raise SystemExit(f'no voiceover at {os.path.relpath(WAV, ROOT)} — record it from {NARRATION} first')
    sil, total = silences(WAV)
    speech_start = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    speech_end = sil[-1][0] if sil and sil[-1][1] >= total - 0.05 else total
    cands = [(s, e) for s, e in sil if s > speech_start + 0.2 and e < speech_end - 0.2 and e - s >= MIN_PAUSE]

    paras, cues = load()
    sents = []  # (para, text, nwords)
    for p in sorted(paras):
        for s in re.split(r'(?<=[.?!])\s+', paras[p].strip()):
            if s:
                sents.append((p, s, len(words(s))))
    N, C = len(sents), len(cands)
    W = sum(n for _, _, n in sents)
    rate = W / (speech_end - speech_start)

    INF = float('inf')
    for _ in range(3):  # re-estimate the pace from the chosen boundaries
        # dp[i][j]: best cost with sentence i ending at candidate j (i < N-1); last sentence ends at speech_end
        dp = [[INF] * C for _ in range(N)]
        back = [[-1] * C for _ in range(N)]
        def cost(i, t0, t1, pause, para_break):
            e = sents[i][2] / rate
            d = t1 - t0
            return (d - e) ** 2 / max(e, 1.0) - (4.0 if para_break else 1.5) * pause
        for j in range(C):
            dp[0][j] = cost(0, speech_start, cands[j][0], cands[j][1] - cands[j][0], sents[0][0] != sents[1][0])
        for i in range(1, N - 1):
            pb = sents[i][0] != sents[i + 1][0]
            for j in range(i, C):
                best, arg = INF, -1
                for k in range(i - 1, j):
                    if dp[i - 1][k] == INF:
                        continue
                    v = dp[i - 1][k] + cost(i, cands[k][1], cands[j][0], cands[j][1] - cands[j][0], pb)
                    if v < best:
                        best, arg = v, k
                dp[i][j], back[i][j] = best, arg
        # last sentence
        best, arg = INF, -1
        for k in range(C):
            if dp[N - 2][k] < INF:
                v = dp[N - 2][k] + cost(N - 1, cands[k][1], speech_end, 0, False)
                if v < best:
                    best, arg = v, k
        ends = [arg]
        for i in range(N - 2, 0, -1):
            ends.append(back[i][ends[-1]])
        ends.reverse()  # ends[i] = candidate index ending sentence i (i < N-1)
        bounds = []
        t0 = speech_start
        for i in range(N):
            t1 = cands[ends[i]][0] if i < N - 1 else speech_end
            bounds.append((t0, t1))
            t0 = cands[ends[i]][1] if i < N - 1 else None
        spoken = sum(b - a for a, b in bounds)
        rate = W / spoken

    # scene starts
    first = {}
    for (p, _, _), (a, _) in zip(sents, bounds):
        first.setdefault(p, a)
    scene_ids = sorted(paras)
    starts = {}
    for p in scene_ids:
        starts[p] = 0.0 if p == scene_ids[0] else first[p] - (CHAPTER_LEAD if p in CHAPTER_SCENES else LEAD)
    lengths = {}
    for i, p in enumerate(scene_ids):
        nxt = starts[scene_ids[i + 1]] if i + 1 < len(scene_ids) else speech_end + END_HOLD
        lengths[p] = round(nxt - starts[p], 2)

    # cue times
    def word_time(p, phrase):
        text = paras[p]
        idx = text.find(phrase)
        if idx < 0:
            raise SystemExit(f'cue phrase not found in paragraph {p}: {phrase!r}')
        wi = len(words(text[:idx]))
        n = 0
        for (sp, s, nw), (a, b) in zip(sents, bounds):
            if sp != p:
                continue
            if wi < n + nw:
                return a + (b - a) * (wi - n) / max(nw, 1)
            n += nw
        raise SystemExit(f'word index out of range for {phrase!r}')

    fitted = {}
    for p in scene_ids:
        sid = 'sh1' if SHORT else f's{p:02d}'
        fitted[sid] = {'seconds': lengths[p], 'cues': {n: round(max(0.3, word_time(p, ph) - starts[p]), 1) for n, ph in cues[sid]}}

    if SHORT:
        write_subtitles(sents, bounds, sil)
    print(f'voiceover: {total:.1f} s · speech {speech_start:.2f}–{speech_end:.2f} s · {N} sentences, {C} pause candidates, pace {rate:.2f} words/s')
    tot = 0
    for p in scene_ids:
        sid = 'sh1' if SHORT else f's{p:02d}'
        tot += lengths[p]
        print(f'  {sid}: start {starts[p]:7.2f} s  length {lengths[p]:6.2f} s')
    print(f'  total {tot:.2f} s = {round(tot * 30)} frames')
    if dry:
        return

    src = open(TIMINGS, encoding='utf-8').read()
    for sid, f in fitted.items():
        a = src.index(f"id: '{sid}'")
        b = src.find("\n  },", a)
        block = src[a:b]
        block = re.sub(r'seconds: [\d.]+,', f"seconds: {f['seconds']},", block, count=1)
        for name, t in f['cues'].items():
            block, n = re.subn(rf'(\n      {name}: )[\d.]+(,)', rf'\g<1>{t}\g<2>', block, count=1)
            if n != 1:
                raise SystemExit(f'cue {sid}.{name} not found in timings.ts')
        src = src[:a] + block + src[b:]
    src = re.sub(r' \* Current values are .*?\n \* narration — .*?\n', ' * Current values: FITTED to public/voiceover.wav by scripts/voiceover/fit_timings.py (re-run after re-recording).\n', src, flags=re.S)
    open(TIMINGS, 'w', encoding='utf-8').write(src)
    print('rewrote', os.path.relpath(TIMINGS, ROOT))



def write_subtitles(sents, bounds, sil, max_words=4):
    """Short only: word timings inside each fitted sentence (weighted by word length) grouped into short
    on-screen chunks that break at punctuation → src/short/subtitles.json."""
    chunks = []
    for (_, text, _), (a, b) in zip(sents, bounds):
        toks = text.split()
        weights = [len(re.sub(r'[^A-Za-z0-9]', '', t)) + 2 for t in toks]
        # anchor commas / colons to the matching pause inside the sentence: segments [(first word, t0, t1)]
        inner = [(s0, e0) for s0, e0 in sil if a + 0.1 < s0 and e0 < b - 0.1]
        cum = [sum(weights[:i]) / sum(weights) for i in range(len(toks) + 1)]
        segs, start_i, t0 = [], 0, a
        for i, tok in enumerate(toks[:-1]):
            if re.search(r'[,:;]$', tok) and inner:
                guess = a + (b - a) * cum[i + 1]
                best = min(inner, key=lambda p: abs((p[0] + p[1]) / 2 - guess))
                if abs((best[0] + best[1]) / 2 - guess) < 0.9 and best[0] > t0:
                    segs.append((start_i, i + 1, t0, best[0]))
                    start_i, t0 = i + 1, best[1]
                    inner.remove(best)
        segs.append((start_i, len(toks), t0, b))
        times = []
        for i0, i1, s0, s1 in segs:
            tot = sum(weights[i0:i1])
            t = s0
            for w in weights[i0:i1]:
                times.append(round(t, 2))
                t += (s1 - s0) * w / tot
        cur = []
        for i, tok in enumerate(toks):
            cur.append({'w': tok, 't': times[i]})
            if len(cur) >= max_words or re.search(r'[,.:?!]$', tok) or i == len(toks) - 1:
                chunks.append({'start': cur[0]['t'], 'end': round(b if i == len(toks) - 1 else times[i + 1], 2), 'words': cur})
                cur = []
    out = os.path.join(ROOT, 'src', 'short', 'subtitles.json')
    json.dump(chunks, open(out, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(f'wrote {os.path.relpath(out, ROOT)} ({len(chunks)} subtitle chunks)')


if __name__ == '__main__':
    main()
