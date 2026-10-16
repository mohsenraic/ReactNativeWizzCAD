# Cash en Bref — « Plus cher = plus vendu ? » (prix finissant par 9)

Vertical 9:16 motion-design video, 1080×1920, 30 fps, 51 s, H.264 + AAC (voice-over + ducked pizzicato bed + SFX, about −14 LUFS).

- `out/cash-en-bref-prix-en-9.mp4` — the video · `out/cover.jpg` — cover frame · `publication.md` — caption, hashtags, sources
- `scene.html` — the whole animation, drawn from a single time value (`scene.html?play` previews it live)
- `render.cjs` — renders frames with headless Chromium and encodes them with ffmpeg
- `audio.py` — builds music + SFX · `mix.sh` — ducks them under `voiceover.wav` → `out/mix.wav`

`voiceover.wav` is 48.9 s; scene cuts sit in its pauses (`CUTS` in `scene.html`, `VO_CUTS` in `audio.py`) and the end card holds to 51 s.
Rebuild: `python3 audio.py && ./mix.sh && node render.cjs`. Check frames: `node render.cjs --stills 1.5,20 --safe`.

| Time | Scene |
|------|-------|
| 0–3.8 s | Tag flips 44 $ → 49 $, sales arrow shoots up (boing) |
| 3.8–9.5 s | Catalogue: the same dress at 44 $, 49 $, 54 $; magnifying glass |
| 9.5–16.15 s | Sales bars: 44 $ ≈ 54 $ |
| 16.15–22.9 s | 49 $ bar keeps rising, glows, trophy |
| 22.9–31.75 s | A 9 floats into a brain and becomes a « PROMO » sticker |
| 31.75–38.6 s | Catalogue pages with sales counters; « jusqu'à +30 % » |
| 38.6–51 s | 9,99 € melts into 10 €, paper plane, Cash en Bref logo, « Abonne-toi » |
