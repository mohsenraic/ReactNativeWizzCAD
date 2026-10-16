# Cash en Bref — « Une taxe sur une taxe ? » (TVA sur l'accise carburant)

Vertical 9:16 motion-design video, 1080×1920, 30 fps, 48 s, H.264 + AAC.

- `out/cash-en-bref-taxe-sur-taxe.mp4` — the video (music + SFX; no voice-over yet)
- `out/cover.jpg` — cover frame · `publication.md` — caption, hashtags, sources
- `scene.html` — the whole animation, drawn from a single time value (`scene.html?play` previews it live)
- `render.cjs` — renders frames with headless Chromium and encodes them with ffmpeg (uses `out/mix.wav` if present, else `out/music.wav`)
- `audio.py` — builds the soundtrack · `mix.sh` — ducks it under `voiceover.wav` → `out/mix.wav`

## Adding the voice-over
1. Save it as `voiceover.wav` here.
2. Move the scene cuts into its pauses: `CUTS` in `scene.html` and `VO_CUTS` in `audio.py` (same values).
3. `python3 audio.py && ./mix.sh && node render.cjs`

Captions are in `CAP` at the top of `scene.html`. `node render.cjs --stills 1.5,20 --safe` renders check frames, with the Instagram UI zones shaded red.

| Time | Scene |
|------|-------|
| 0–3 s | Fuel nozzle; a « TAXE » tag, then smaller « TAXE » tags stacked on it |
| 3–9 s | One litre: 0,61 € of accise goes to the State |
| 9–16 s | A « TVA 20 % » stamp hits the litre, then the 0,61 € tax label (screen shake) |
| 16–23 s | 50 small bottles fill a tank: 6 € of TVA on the tax |
| 23–31 s | Receipt « Plein 50 L : 118 € »; bar 58 % / 42 % taxes ≈ 50 € |
| 31–38 s | 52 weeks, one coin a week: ≈ 300 € / an |
| 38–48 s | Paper plane share, Cash en Bref logo, « Abonne-toi » |

Figures are for diesel (gazole), October 2026 — see `publication.md`.
