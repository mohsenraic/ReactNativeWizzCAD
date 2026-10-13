/**
 * timeline.ts — single source of truth for scene timing (30 fps, 9000 frames = 5:00).
 *
 * Rebalanced from the original storyboard so Scene 8's narration fits at a natural pace
 * (~54 words needs ~20 s, it had 15 s) while the last 10 s stay clean for the end screen.
 * The 15 s came from scenes with slack: 2 (−5 s), 4 (−5 s), 6 (−5 s).
 *
 *   scene  storyboard      now            words  pace
 *   1      0:00–0:25      0:00–0:25      55     132 wpm
 *   2      0:25–1:00      0:25–0:55      64     128 wpm (incl. chapter card)
 *   3      1:00–1:50      0:55–1:45      119    143 wpm
 *   4      1:50–2:30      1:45–2:20      78     134 wpm
 *   5      2:30–3:30      2:20–3:20      132    132 wpm
 *   6      3:30–4:20      3:20–4:05      88     117 wpm
 *   7      4:20–4:45      4:05–4:30      51     122 wpm
 *   8      4:45–5:00      4:30–5:00      54     ~165 wpm over first 20 s, then 10 s end screen
 */

export const FPS = 30;
export const TOTAL_FRAMES = 9000;

export interface SceneTiming {
  id: number;
  name: string;
  from: number;
  durationInFrames: number;
  /** Chapter card overlaid on the first frames of the scene (no extra time). */
  chapter?: { number: number; title: string };
  /** Frames (relative to scene start) during which narration may play. Defaults to the whole scene. */
  narrationWindow?: { from: number; to: number };
}

export const CHAPTER_CARD_FRAMES = 54; // 1.8 s overlay at the head of a chapter's first scene
export const END_SCREEN_FRAMES = 300; // last 10 s: right side kept clean

export const SCENES: SceneTiming[] = [
  { id: 1, name: 'Hook', from: 0, durationInFrames: 750 },
  { id: 2, name: 'ThePeak', from: 750, durationInFrames: 900, chapter: { number: 1, title: 'THE PEAK' } },
  { id: 3, name: 'ThePyramid', from: 1650, durationInFrames: 1500, chapter: { number: 2, title: 'THE SHAPE' } },
  { id: 4, name: 'BirthsVsDeaths', from: 3150, durationInFrames: 1050 },
  { id: 5, name: 'Why', from: 4200, durationInFrames: 1800, chapter: { number: 3, title: 'WHY' } },
  { id: 6, name: 'Consequences', from: 6000, durationInFrames: 1350, chapter: { number: 4, title: 'WHAT IT MEANS' } },
  { id: 7, name: 'WhatsBeingDone', from: 7350, durationInFrames: 750 },
  {
    id: 8,
    name: 'Outro',
    from: 8100,
    durationInFrames: 900,
    narrationWindow: { from: 0, to: 900 - END_SCREEN_FRAMES + 6 },
  },
];

export const sceneById = (id: number): SceneTiming => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

// Guard against drift: scenes must tile 0…9000 with no gaps.
SCENES.reduce((expectedFrom, s) => {
  if (s.from !== expectedFrom) throw new Error(`Scene ${s.id} starts at ${s.from}, expected ${expectedFrom}`);
  return s.from + s.durationInFrames;
}, 0);
if (SCENES[SCENES.length - 1].from + SCENES[SCENES.length - 1].durationInFrames !== TOTAL_FRAMES) {
  throw new Error('Scenes do not add up to TOTAL_FRAMES');
}
