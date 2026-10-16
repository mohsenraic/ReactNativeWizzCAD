/**
 * timeline.ts — single source of truth for scene timing (30 fps, 7788 frames ≈ 4:20).
 *
 * Scene lengths are fitted to the recorded voiceover (public/voiceover.mp3, Oct 2026 take):
 * each scene = 0.4 s lead-in + its spoken length + 1 s tail; pauses between sentences are capped at ~0.3 s,
 * and Scene 8 keeps a clean 10 s end screen after the last line. (Tightened Oct 2026 from the original 5:00 cut.)
 * Re-run the alignment (see README → Voiceover) if the narration is re-recorded.
 *
 *   scene  range         length
 *   1      0:00–0:24    25.0 s
 *   2      0:24–0:51    26.0 s
 *   3      0:51–1:31    40.2 s
 *   4      1:31–2:03    32.7 s
 *   5      2:03–2:54    50.6 s
 *   6      2:54–3:29    35.1 s
 *   7      3:29–3:50    21.1 s
 *   8      3:50–4:19    28.9 s
 */

export const FPS = 30;
export const TOTAL_FRAMES = 7788;

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
  { id: 1, name: 'Hook', from: 0, durationInFrames: 749 },
  { id: 2, name: 'ThePeak', from: 749, durationInFrames: 781, chapter: { number: 1, title: 'THE PEAK' } },
  { id: 3, name: 'ThePyramid', from: 1530, durationInFrames: 1207, chapter: { number: 2, title: 'THE SHAPE' } },
  { id: 4, name: 'BirthsVsDeaths', from: 2737, durationInFrames: 982 },
  { id: 5, name: 'Why', from: 3719, durationInFrames: 1519, chapter: { number: 3, title: 'WHY' } },
  { id: 6, name: 'Consequences', from: 5238, durationInFrames: 1052, chapter: { number: 4, title: 'WHAT IT MEANS' } },
  { id: 7, name: 'WhatsBeingDone', from: 6290, durationInFrames: 632 },
  {
    id: 8,
    name: 'Outro',
    from: 6922,
    durationInFrames: 866,
    narrationWindow: { from: 0, to: 866 - END_SCREEN_FRAMES + 6 },
  },
];

export const sceneById = (id: number): SceneTiming => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

// Guard against drift: scenes must tile 0…TOTAL_FRAMES with no gaps.
SCENES.reduce((expectedFrom, s) => {
  if (s.from !== expectedFrom) throw new Error(`Scene ${s.id} starts at ${s.from}, expected ${expectedFrom}`);
  return s.from + s.durationInFrames;
}, 0);
if (SCENES[SCENES.length - 1].from + SCENES[SCENES.length - 1].durationInFrames !== TOTAL_FRAMES) {
  throw new Error('Scenes do not add up to TOTAL_FRAMES');
}
