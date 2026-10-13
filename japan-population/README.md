# Why Japan Is Losing Millions of People — Remotion project

5-minute data explainer (1920×1080, 30 fps, 9000 frames), built entirely from motion graphics.

## Status

- **Phase 2 — data** ✔ `src/data/japan.ts`, `src/data/captions.ts`, `src/timeline.ts`, `DATA_NOTES.md`
- **Phase 3 — components** ✔ `src/components/*`, previewable in the `ComponentGallery` composition
- **Phase 4 — scenes, final Root** ✔ `src/scenes/*`, `src/JapanPopulation.tsx`, `src/Root.tsx`

Before publishing: replace the placeholder pyramids (`npm run check:data` must pass) and record the voiceover.

## Run

```bash
npm install
npm run studio            # Remotion Studio: ComponentGallery + one Demo-* composition per component
npm run check:data        # fails while any placeholder dataset remains (currently: pyramids)
npm run typecheck
```

Render the video:

```bash
npx remotion render JapanPopulation out/japan.mp4
# with audio + subtitles burned in:
npx remotion render JapanPopulation out/japan.mp4 --props='{"voiceover":true,"music":true,"captions":true}'
```

Compositions: `JapanPopulation` (5:00), `Scene1-Hook` … `Scene8-Outro` (one per scene), `ComponentGallery`, `Demo-*`.
Quick review stills: `node scripts/render-stills.mjs '[["Scene4-BirthsDeaths", 700, "s4"]]'` → `out/stills/s4.png`.

### Audio

- `public/voiceover.mp3` — the recorded narration (5:00). Prop `voiceover: true`.
- `public/music.mp3` — optional bed, looped, faded in/out, at `musicVolume` (default 0.08). Prop `music: true`.
- Both are off by default so a render never fails on a missing file.

### Timing is keyed to the narration

Every animation beat uses `cue(scene, "phrase")` (`src/scenes/helpers.tsx`), which reads the frame of the caption
chunk containing that phrase. After recording the voiceover, re-time `src/data/captions.ts` to the audio (e.g. Whisper
word timestamps) and the whole video follows. Scene lengths live in `src/timeline.ts`.

### Fonts

Default: `@remotion/google-fonts` (Oswald, IBM Plex Sans, IBM Plex Mono, Caveat).
For offline or locked-down machines: `npm run fonts:local` once, then add `--props='{"fonts":"local"}'`
to any render/still command. The four families are SIL OFL, so the copies in `public/fonts` may be committed.

### Sound design

`src/lib/sfx.tsx` defines the slots (paper slide, marker squeak, stamp thud, counter click, whoosh, pen).
Drop files into `public/sfx/` and render with `--props='{"sfx":true}'`. Disabled slots render nothing.

## Layout

```
src/
  timeline.ts            scene frame ranges (rebalanced so Scene 8 fits), chapter-card + end-screen lengths
  theme.ts               palette, fonts, spring presets
  data/japan.ts          every number on screen, typed, sourced, ✓ / TODO: VERIFY / PLACEHOLDER
  data/captions.ts       90 narration chunks (≤ 2 lines × 42 chars), provisional timing
  lib/sketch.ts          seeded hand-drawn path generators (ellipse, line, arrow, X, brace, torn edges)
  lib/format.ts          counters: locale grouping, true minus sign, compact axis labels
  lib/sfx.tsx            sound-effect slots
  components/            reusable components (each file starts with an @example)
  examples/demos.tsx     usage demos rendered in the gallery
  scenes/                Scene1Hook … Scene8Outro, helpers (cue, SceneShell, Fade)
  JapanPopulation.tsx    the <Series> of 8 scenes + voiceover/music slots + captions
  Root.tsx               compositions
scripts/check-data.ts    pre-render data check
scripts/fetch-fonts.sh   local font copies
scripts/render-stills.mjs  bundle once, render review stills
```

## Components

| Component | What it does |
|---|---|
| `AnimatedLineChart` | multi-series draw-on, direct labels, solid/hatched area between series or a constant, milestone flags, pulsing/flash markers, year ticker, torn-paper backing, colour shift; exports `makeChartScales`, `seriesTip` |
| `PopulationPyramid` | 5-year paper strips, M/F, smooth morph between keyframe years, climbing baby-boom highlight, age tint, flip + wobble; exports `pyramidGeometry`, `boomIndexAt` |
| `BigCounter` | count up/down, locale grouping, sign handling, fixed-width digits, optional clicks |
| `JapanMap` | 47 prefectures, per-prefecture fills, glow, chained zooms, village dots that vanish, labels, pulses |
| `WorldMap` | Natural Earth world, highlighted countries, pulsing labelled dots, log-scale zoom |
| `DocumentCard` | report / clipping / brief / article cards, highlighted segments, hide-a-segment hand-off |
| `IconCard` + `icons` | pinned cutout with animated icons: cost, work, marriage, gender roles |
| `RedString` | sagging string between pins, tightens into a knot |
| `LoopDiagram` | hand-drawn cycle with red arrows, slow spin when complete |
| `Stamp` | thudding worn-ink stamp + `useStampShake` |
| `KineticTitle` | word-by-word Oswald title, highlighted words, optional torn paper strip |
| `PaperBackground` | light paper, charcoal paper, cork board |
| `CameraRig` / `ParallaxLayer` | push-in 1 → 1.06, depth parallax, pan offset |
| `Highlighter` | ragged yellow marker sweep (multiply) |
| `HandDrawnAnnotation` | circle / underline / arrow / X / brace + Caveat label |
| `Cutout` | collage cutout: border, shadow, ±3°, springy entrance/exit |
| `ChapterCard` | "1 — THE PEAK" taped paper strip |
| `SourceTag` | bottom-left "SOURCE: …", warns on placeholder data |
| `SceneTransition` | whip-pan / paper-slide in & out within a scene |
| `Captions` | optional subtitle overlay |

## Credits

Japan map: `@svg-maps/japan` by VictorCazanave, CC BY 4.0 (credit in the video description).
World map: Natural Earth via `world-atlas`. Data sources: see `DATA_NOTES.md`.
