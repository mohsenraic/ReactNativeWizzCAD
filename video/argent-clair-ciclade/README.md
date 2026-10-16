# Cash en Bref — « De l'argent à ton nom ? » (Ciclade)

Vertical 9:16 motion-design video, 1080×1920, 30 fps, 48 s, H.264 + AAC.

- `out/cash-en-bref-ciclade.mp4` — final video (voice-over + ducked music + SFX, about −14 LUFS)
- `out/cover.jpg` — cover frame · `publication.md` — caption, hashtags, alt text
- `logo.png` / `logo.js` — Cash en Bref badge (the page loads `logo.js`, a data URI, so the canvas can be exported)
- `voiceover.wav` — the voice-over; `mix.sh` ducks the music under it and writes `out/mix.wav`
- `out/music.wav` — the soundtrack on its own (pluck bed + SFX, about −23 LUFS so a voice-over sits on top)
- `scene.html` — the whole animation as a canvas drawn from a single time value (open `scene.html?play` to preview it live)
- `render.cjs` — renders the frames with headless Chromium and encodes them with ffmpeg
- `audio.py` — builds the soundtrack (`--no-sfx` for music only)

Captions are listed in `CAP` at the top of `scene.html`. Edit them there, then rebuild:

```bash
python3 audio.py && ./mix.sh && node render.cjs          # full render (~2.5 min)
node render.cjs --stills 1.5,20 --safe       # check frames, Instagram UI zones shaded red
```

Scene cuts are placed in the voice-over's pauses (`CUTS` in `scene.html`, `VO_CUTS` in `audio.py`).

| Time | Scene |
|------|-------|
| 0–4.15 s | Vault cracks open, lime light leaks out, « TOI ? » tag |
| 4.15–9.75 s | Livret A, dusty card and « Assurance vie » envelope drop in |
| 9.75–15.9 s | Calendar flips to « 10 ANS », bank closes, money flies to the Caisse des dépôts |
| 15.9–23.25 s | 164 400 000 € returned in 2025, then 943 € average per claim |
| 23.25–31.3 s | « 30 ANS » hourglass, the vault stamped with a tricolour slams shut, « 640 M€ perdus depuis 2017 » struck through |
| 31.3–39.2 s | Phone search « Ciclade » → officiel / gratuit, fake « payant » button crossed out |
| 39.2–48 s | Paper plane share, Cash en Bref logo, tagline, « Abonne-toi » button clicked |
