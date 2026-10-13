/**
 * Root.tsx — JapanPopulation (the 5:00 video) plus the component gallery and one composition per
 * scene for quick previews.
 */
import React from 'react';
import { Composition, Series } from 'remotion';
import { DEMOS, DEMO_FRAMES } from './examples/demos';
import { JapanPopulation, TOTAL_DURATION, defaultJapanPopulationProps } from './JapanPopulation';
import {
  SCENE_1_DURATION, SCENE_2_DURATION, SCENE_3_DURATION, SCENE_4_DURATION, SCENE_5_DURATION, SCENE_6_DURATION,
  SCENE_7_DURATION, SCENE_8_DURATION, Scene1Hook, Scene2Peak, Scene3Pyramid, Scene4BirthsDeaths, Scene5Why,
  Scene6Consequences, Scene7Response, Scene8Outro,
} from './scenes';
import { FPS, TOTAL_FRAMES } from './timeline';

if (TOTAL_DURATION !== TOTAL_FRAMES) throw new Error(`Scenes add up to ${TOTAL_DURATION} frames, expected ${TOTAL_FRAMES}`);

const Gallery: React.FC = () => (
  <Series>
    {DEMOS.map(({ id, component: C }) => (
      <Series.Sequence key={id} durationInFrames={DEMO_FRAMES} name={id}>
        <C />
      </Series.Sequence>
    ))}
  </Series>
);

const SCENE_COMPS: Array<[string, React.FC, number]> = [
  ['Scene1-Hook', Scene1Hook, SCENE_1_DURATION],
  ['Scene2-Peak', Scene2Peak, SCENE_2_DURATION],
  ['Scene3-Pyramid', Scene3Pyramid, SCENE_3_DURATION],
  ['Scene4-BirthsDeaths', Scene4BirthsDeaths, SCENE_4_DURATION],
  ['Scene5-Why', Scene5Why, SCENE_5_DURATION],
  ['Scene6-Consequences', Scene6Consequences, SCENE_6_DURATION],
  ['Scene7-Response', Scene7Response, SCENE_7_DURATION],
  ['Scene8-Outro', Scene8Outro, SCENE_8_DURATION],
];

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="JapanPopulation"
      component={JapanPopulation}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={defaultJapanPopulationProps}
    />
    {SCENE_COMPS.map(([id, C, d]) => (
      <Composition key={id} id={id} component={C} durationInFrames={d} fps={FPS} width={1920} height={1080} />
    ))}
    <Composition id="ComponentGallery" component={Gallery} durationInFrames={DEMO_FRAMES * DEMOS.length} fps={FPS} width={1920} height={1080} />
    {DEMOS.map(({ id, component }) => (
      <Composition key={id} id={id} component={component} durationInFrames={DEMO_FRAMES} fps={FPS} width={1920} height={1080} />
    ))}
  </>
);
