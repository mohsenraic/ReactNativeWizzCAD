# shared

Component library, theme and helpers used by every video in this repo. Each video is its own Remotion
project in a sibling folder (`japan-population/`, `elnino/`, …) and imports from here with relative paths:

```ts
import { Cutout, BigCounter, SourceTag } from '../../shared/components';
import { COLORS, FONTS } from '../../shared/theme';
```

```
shared/
├── components/   PaperBackground, CameraRig, Highlighter, HandDrawnAnnotation, Cutout, DocumentCard,
│                 ChapterCard, SourceTag, BigCounter, AnimatedLineChart, KineticTitle, IconCard, Stamp,
│                 LoopDiagram, RedString, SceneTransition, WorldMap, icons,
│                 PhotoCutout, AnimatedBarChart, WaffleChart, RouteMap (+ RouteLayer)  (+ index.ts barrel)
├── lib/          sketch.ts (hand-drawn paths), format.ts (numbers), sfx.tsx (sound-design slots)
├── data/         types.ts — Dataset / DataStatus / YearValue / valueAt / PhotoCredit
├── remotion/     webpack-override.mjs
└── theme.ts      palette, fonts, springs
```

There is no `package.json` here: shared code is compiled by whichever video imports it, against that
video's `node_modules`, so there is only ever one copy of React and Remotion.

## Adding a new video

1. Copy `elnino/package.json`, `tsconfig.json`, `remotion.config.ts`, `.gitignore` and `scripts/` into a new
   folder, then `npm install` there.
2. Keep these two pieces of config — they are what make `../shared` work:
   - `remotion.config.ts` → `Config.overrideWebpackConfig(makeWebpackOverride(process.cwd()))`
     (and pass `webpackOverride: makeWebpackOverride(root)` to any script that calls `bundle()` directly).
   - `tsconfig.json` → `"include": [..., "../shared"]`, `"baseUrl": "."` and the `paths` entries that point
     package lookups at the project's own `node_modules`.
3. Run the Remotion CLI from inside the video folder (`npx remotion studio`).

## Rules

- Never copy a shared component into a video folder. If a video needs more, add **optional** props so every
  other video still renders identically, and re-render that video's stills to prove it.
- Topic-specific components stay in the video folder.
