/**
 * timeline.ts — single source of truth for scene timing (30 fps, 9000 frames = 5:00).
 *
 * Scene lengths are fitted to the recorded voiceover (public/voiceover.mp3, Oct 2026 take):
 * each scene = its spoken length + 0.4 s lead-in + a share of the spare time, total fixed at 5:00,
 * and Scene 8 keeps a clean 10 s end screen after the last line.
 * Re-run the alignment (see README → Voiceover) if the narration is re-recorded.
 *
 *   scene  range         length
 *   1      0:00–0:28    28.3 s
 *   2      0:28–0:57    29.4 s
 *   3      0:57–1:44    46.5 s
 *   4      1:44–2:22    37.8 s
 *   5      2:22–3:23    61.4 s
 *   6      3:23–4:04    40.8 s
 *   7      4:04–4:28    23.7 s
 *   8      4:28–5:00    32.0 s
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
  { id: 1, name: 'Hook', from: 0, durationInFrames: 849 },
  { id: 2, name: 'ThePeak', from: 849, durationInFrames: 882, chapter: { number: 1, title: 'THE PEAK' } },
  { id: 3, name: 'ThePyramid', from: 1731, durationInFrames: 1394, chapter: { number: 2, title: 'THE SHAPE' } },
  { id: 4, name: 'BirthsVsDeaths', from: 3125, durationInFrames: 1135 },
  { id: 5, name: 'Why', from: 4260, durationInFrames: 1843, chapter: { number: 3, title: 'WHY' } },
  { id: 6, name: 'Consequences', from: 6103, durationInFrames: 1225, chapter: { number: 4, title: 'WHAT IT MEANS' } },
  { id: 7, name: 'WhatsBeingDone', from: 7328, durationInFrames: 712 },
  {
    id: 8,
    name: 'Outro',
    from: 8040,
    durationInFrames: 960,
    narrationWindow: { from: 0, to: 960 - END_SCREEN_FRAMES + 6 },
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
