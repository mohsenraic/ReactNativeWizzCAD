/**
 * short/timings.ts — the 30 s vertical Short (1080 × 1920), in SECONDS.
 *
 * Current values: FITTED to public/short/voiceover.wav by `npm run voiceover:fit:short`
 * (also writes src/short/subtitles.json). Re-run after re-recording.
 */
import { FPS, sec } from '../timings';

export const SHORT_WIDTH = 1080;
export const SHORT_HEIGHT = 1920;

export const SHORT_SCENES = [
  {
    id: 'sh1',
    name: 'Short',
    seconds: 30.98,
    cues: {
      hook: 0.3, // “Eleven point seven…”
      record: 3.6, // “A record…”
      why: 4.7, // “So why…”
      domes: 8.3, // “Blue domes…”
      cities: 11.2, // “Samarkand, Bukhara…”
      nothingElse: 14.6, // “look like nothing…”
      closed: 17.8, // “For decades…”
      visas: 20.7, // “Then visas…”
      trains: 22.1, // “high-speed trains…”
      opened: 24.7, // “the doors opened…”
      fullStory: 26.7, // “Want the full story…”
      channel: 27.8, // “Watch the complete…”
    },
  },
] as const;

export type ShortCue = keyof (typeof SHORT_SCENES)[0]['cues'];
export const SHORT_FRAMES = sec(SHORT_SCENES[0].seconds);
export const shortCue = (name: ShortCue, offsetSeconds = 0) => sec(SHORT_SCENES[0].cues[name] + offsetSeconds);
export const SHORT_FPS = FPS;
