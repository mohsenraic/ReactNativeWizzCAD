# Argent Clair — « De l'argent à ton nom ? » (Ciclade)

Vertical 9:16 motion-design video, 1080×1920, 30 fps, 48 s, H.264 + AAC.

- `out/argent-clair-ciclade.mp4` — final video (voice-over + ducked music + SFX, about −14 LUFS)
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
| 0–4 s | Vault cracks open, lime light leaks out, « TOI ? » tag |
| 4–8.9 s | Livret A, dusty card and « Assurance vie » envelope drop in |
| 8.9–15.75 s | Calendar flips to « 10 ANS », bank closes, money flies to the Caisse des dépôts |
| 15.75–23 s | 164 000 000 € counter, then an envelope reveals 943 € |
| 23–31.4 s | « 30 ANS » hourglass, the vault stamped with a tricolour slams shut, « 640 M€ perdus » struck through |
| 31.4–39 s | Phone search « Ciclade » → officiel / gratuit, fake « payant » button crossed out |
| 39–48 s | Paper plane share, Argent Clair logo, tagline, « Abonne-toi » button clicked |
