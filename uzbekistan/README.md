# Why Everyone Is Suddenly Visiting Uzbekistan

Remotion 4 explainer, 1920 × 1080 @ 30 fps, 8:05 (14,548 frames — ≥ 8:00 so mid-roll ads are allowed), fitted to `public/voiceover.wav`.
It uses the shared library in `../shared` (see `../shared/README.md`) with the Uzbekistan theme.

## Render

```bash
npm install
npm run check:data                                   # must pass before a final render
npx remotion render Uzbekistan out/uzbekistan.mp4    # = npm run render
npm run preview                                      # optional 540p share copy
```

Props: `--props='{"music":false}'`, `{"sfx":false}`, `{"voiceover":false}`, `{"musicVolume":0.06}`.
Studio: `npm run studio`. There, each scene is also its own composition (`Uzbekistan-Scene01…10`), and each new component has a demo (`Uzbekistan-Demo-*`).

## After re-recording the voiceover

1. Replace `public/voiceover.wav`.
2. Run `npm run voiceover:fit`. It is fully offline: ffmpeg finds the pauses and a sentence-level alignment
   against `scripts/voiceover/narration.txt` rewrites every scene length and cue in `src/timings.ts`.
3. Run `npm run check:data`. It checks scenes add up, cues sit inside scenes, nothing on screen stays static for more than 6 s, and there are no captions.
4. Run `npm run youtube` to regenerate the chapters, ad-break timestamps and credits in `youtube/description.md`.

You can still hand-tune anything in `src/timings.ts`, which is in seconds. Scenes only ever read `cue('sNN', 'name')`.

## Layout

| Path | What it holds |
|---|---|
| `src/timings.ts` | Every scene length and narration cue, plus open loops, ad breaks and the retention check |
| `src/data/data.ts` | Every on-screen number, typed and sourced. All datasets are verified; see `FACT_CHECK.md` |
| `src/data/photos.ts` | The 20 photos, with licence, attribution and alternates (credits in `CREDITS.md`) |
| `src/scenes/` | The 10 scenes and `common.tsx` (transitions, the "?" pin, whip-pan) |
| `src/components/` | Topic components: `GeometricPattern`/`PatternWipe`, `SilkRoadMap`, `CityCard`, `VisaMap`, icons, illustrations |
| `../shared/components/` | Added for this video: `PhotoCutout`, `AnimatedBarChart`, `WaffleChart`, `RouteMap` (plus optional props on existing components) |
| `public/sfx/` | Sound-design slots. Six are copied from El Niño; `whoosh-soft` and `bazaar-ambience` are synthesized placeholders. Replace the bazaar bed with a real licensed ambience |
| `youtube/description.md` | Chapters, mid-roll ad breaks and the description credits block (generated) |

## Mid-roll ad breaks

The video holds a 0.5 s visual "breath" just before each one. Place them manually in YouTube Studio.

- **1:37**: end of chapter 1, right after "So what exactly are they coming for?"
- **4:23**: right after "…why are tourists only arriving now?"
- **6:48**: end of the chapter 4 montage, "All in one country."
