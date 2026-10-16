/**
 * ElNino2026.tsx — the full video: a <Series> of the 8 scenes (chapter cards overlay the first 40 frames of
 * scenes 2–6), the El Niño theme, the voiceover and an optional music bed. No subtitles of any kind.
 *
 * Audio lives in public/: voiceover.wav (built by scripts/voiceover/fit_voiceover.py from the recorded take)
 * and music.mp3 (same bed as the Japan video, on by default — disable with --props='{"music":false}'). Sound effects: drop files into public/sfx/
 * (names in shared/lib/sfx.tsx); synthesized with ffmpeg, on by default (--props='{"sfx":false}' to mute).
 */
import React from 'react';
import { AbsoluteFill, Audio, Series, interpolate, staticFile, useVideoConfig } from 'remotion';
import { ThemeProvider } from '../../shared/theme';
import { SfxProvider } from '../../shared/lib/sfx';
import {
  SCENE_1_DURATION, SCENE_2_DURATION, SCENE_3_DURATION, SCENE_4_DURATION, SCENE_5_DURATION, SCENE_6_DURATION,
  SCENE_7_DURATION, SCENE_8_DURATION, Scene1Hook, Scene2Normal, Scene3Mechanism, Scene4ThisYear, Scene5Impacts,
  Scene6Economy, Scene7BiggerPicture, Scene8Outro,
} from './scenes';
import { PALETTE, elninoTheme } from './theme';

export type ElNino2026Props = {
  voiceover: boolean;
  music: boolean;
  /** Music bed level (0–1), kept low under the narration. */
  musicVolume: number;
  /** Sound effects (public/sfx/, synthesized: whoosh, paper slide, thud, click, marker, pen). */
  sfx: boolean;
};

// Music: same bed as the Japan video (public/music.mp3, copied from japan-population/public), looped at 8 %.
export const defaultElNino2026Props: ElNino2026Props = { voiceover: true, music: true, musicVolume: 0.08, sfx: true };

export const SCENES: Array<{ name: string; duration: number; C: React.FC }> = [
  { name: '1 Hook', duration: SCENE_1_DURATION, C: Scene1Hook },
  { name: '2 The normal Pacific', duration: SCENE_2_DURATION, C: Scene2Normal },
  { name: '3 When it breaks', duration: SCENE_3_DURATION, C: Scene3Mechanism },
  { name: '4 Why 2026 is different', duration: SCENE_4_DURATION, C: Scene4ThisYear },
  { name: '5 Opposite disasters', duration: SCENE_5_DURATION, C: Scene5Impacts },
  { name: '6 On your plate', duration: SCENE_6_DURATION, C: Scene6Economy },
  { name: '7 The bigger picture', duration: SCENE_7_DURATION, C: Scene7BiggerPicture },
  { name: '8 Outro', duration: SCENE_8_DURATION, C: Scene8Outro },
];

export const TOTAL_DURATION = SCENES.reduce((s, x) => s + x.duration, 0);

export const ElNino2026: React.FC<ElNino2026Props> = ({ voiceover, music, musicVolume, sfx }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <ThemeProvider theme={elninoTheme}>
      <SfxProvider enabled={sfx} gain={0.6}>
      <AbsoluteFill style={{ backgroundColor: PALETTE.navy }}>
        <Series>
          {SCENES.map(({ name, duration, C }) => (
            <Series.Sequence key={name} durationInFrames={duration} name={name}>
              <C />
            </Series.Sequence>
          ))}
        </Series>
        {voiceover && <Audio src={staticFile('voiceover.wav')} volume={1} />}
        {music && (
          <Audio
            src={staticFile('music.mp3')}
            loop
            volume={(f) =>
              musicVolume *
              interpolate(f, [0, 45, durationInFrames - 90, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            }
          />
        )}
      </AbsoluteFill>
      </SfxProvider>
    </ThemeProvider>
  );
};
