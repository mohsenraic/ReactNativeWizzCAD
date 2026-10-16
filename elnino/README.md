# How One Patch of Ocean Controls the World's Weather

Remotion 4 explainer, 1920×1080, 30 fps, ~3:50 (6907 frames; length follows the fitted narration). Composition `ElNino2026`.
Reusable components come from [`../shared`](../shared/README.md); topic components live in `src/components`.

```bash
npm install
npm run studio            # preview (run inside this folder)
npm run check:data        # placeholders, banned terms, timeline
npx remotion render ElNino2026 out/elnino.mp4
```

Music: `public/music.mp3` (the Japan video's bed) plays at 8 % by default; `--props='{"music":false}'` turns it off.
Other options: `--props='{"sfx":true}'`
(needs `public/sfx/*.mp3`, names in `shared/lib/sfx.tsx`), `--props='{"fonts":"local"}'` (offline fonts in `public/fonts`).

## Layout

```
src/
├── ElNino2026.tsx         the full video: <Series> of 8 scenes + voiceover + music
├── Root.tsx               ElNino2026, ElNino-Scene1…8, ElNino-Demo-* (one demo per component)
├── timeline.ts            scene lengths + cue(scene, phrase) from timing/timing.json
├── theme.ts               El Niño palette → <ThemeProvider theme={elninoTheme}>
├── data/elnino.ts         every number, typed and sourced (✓ / TODO: VERIFY / PLACEHOLDER)
├── timing/anchors.json    narration phrases the visuals sync to
├── timing/timing.json     generated: scene lengths + anchor frames
├── components/            PacificCrossSection, SSTAnomalyMap, ImpactMap, NinoIndexChart,
│                          CommodityCards, AnchovySchool, commodityIcons
├── scenes/                Scene1Hook … Scene8Outro
└── examples/demos.tsx
scripts/
├── voiceover/fit_voiceover.py   aligns the recorded take, fits scene lengths, writes public/voiceover.wav
├── voiceover/narration.txt      the final script, for alignment only (never rendered)
└── check-data.ts
```

## Voiceover and pacing

The take is sped up 10 % (pitch preserved), pauses between words are capped at 0.3 s, and the result is
aligned offline with Vosk. Each scene gets its spoken length plus a 0.25–0.45 s lead-in and a 0.35 s tail,
with no padding to a fixed total. Chapter cards (1.3 s) play over the first words of their scene, and
Scene 8 keeps an 8 s end screen.

```bash
pip install vosk   # plus a model, e.g. vosk-model-small-en-us-0.15
python3 scripts/voiceover/fit_voiceover.py "<take>.wav" <vosk-model-dir> --speed 1.1 --pause 0.3
```

Re-run this after any re-record or pacing change. Every visual beat, including the camera punch-ins
(`moves` on each scene's `SceneShell`), follows automatically, because scenes use `cue()`. Use `ramp()`
for keyframes that mix cues with fixed offsets, so they stay valid at any pace. To sync a new visual, add
a phrase to `src/timing/anchors.json` and re-run.

Sound: music bed (`public/music.mp3`, the Japan video's track) at 8 %. Sound effects in `public/sfx/`
were synthesized with ffmpeg and play at 60 %. Turn either off with `--props='{"music":false}'` /
`--props='{"sfx":false}'`.

## Rules baked in

- No subtitles or captions, and no on-screen text that transcribes the narration.
- "Super El Niño" never appears on screen; `check:data` fails if it shows up in the source.
- 2026 values are labelled FORECAST. WMO's baseline is 1993–2009 and NOAA's ONI uses rolling 30-year bases,
  and both are labelled on the chart.
- Every on-screen quantity counts up (BigCounter, counting annotation labels, counting document segments).
