/**
 * JapanPopulation.tsx — the full video: a <Series> of the 8 scenes, voiceover + music slots,
 * optional captions.
 *
 * Audio files go in public/: voiceover.mp3 (recorded separately, 5:00) and music.mp3 (optional).
 * They are off by default so a render never fails on a missing file; enable with
 *   --props='{"voiceover":true,"music":true}'
 */
import React from 'react';
import { AbsoluteFill, Audio, Series, interpolate, staticFile, useVideoConfig } from 'remotion';
import { Captions } from './components';
import {
  SCENE_1_DURATION, SCENE_2_DURATION, SCENE_3_DURATION, SCENE_4_DURATION, SCENE_5_DURATION, SCENE_6_DURATION,
  SCENE_7_DURATION, SCENE_8_DURATION, Scene1Hook, Scene2Peak, Scene3Pyramid, Scene4BirthsDeaths, Scene5Why,
  Scene6Consequences, Scene7Response, Scene8Outro,
} from './scenes';
import { COLORS } from './theme';

export type JapanPopulationProps = {
  voiceover: boolean;
  music: boolean;
  /** Music bed level (0–1). Kept low under the narration. */
  musicVolume: number;
  captions: boolean;
};

export const defaultJapanPopulationProps: JapanPopulationProps = {
  voiceover: false,
  music: false,
  musicVolume: 0.08,
  captions: false,
};

const SCENES: Array<{ name: string; duration: number; C: React.FC }> = [
  { name: '1 Hook', duration: SCENE_1_DURATION, C: Scene1Hook },
  { name: '2 The Peak', duration: SCENE_2_DURATION, C: Scene2Peak },
  { name: '3 The Shape', duration: SCENE_3_DURATION, C: Scene3Pyramid },
  { name: '4 Births vs Deaths', duration: SCENE_4_DURATION, C: Scene4BirthsDeaths },
  { name: '5 Why', duration: SCENE_5_DURATION, C: Scene5Why },
  { name: '6 What it means', duration: SCENE_6_DURATION, C: Scene6Consequences },
  { name: '7 What is being done', duration: SCENE_7_DURATION, C: Scene7Response },
  { name: '8 Outro', duration: SCENE_8_DURATION, C: Scene8Outro },
];

export const TOTAL_DURATION = SCENES.reduce((s, x) => s + x.duration, 0);

export const JapanPopulation: React.FC<JapanPopulationProps> = ({ voiceover, music, musicVolume, captions }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.charcoal }}>
      <Series>
        {SCENES.map(({ name, duration, C }) => (
          <Series.Sequence key={name} durationInFrames={duration} name={name}>
            <C />
          </Series.Sequence>
        ))}
      </Series>
      {voiceover && <Audio src={staticFile('voiceover.mp3')} volume={1} />}
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
      <Captions enabled={captions} />
    </AbsoluteFill>
  );
};
