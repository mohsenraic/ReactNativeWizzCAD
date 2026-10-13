/**
 * Root.tsx — Phase 3: component gallery only. The JapanPopulation composition is added in Phase 4.
 */
import React from 'react';
import { Composition, Series } from 'remotion';
import { DEMOS, DEMO_FRAMES } from './examples/demos';
import { FPS } from './timeline';

const Gallery: React.FC = () => (
  <Series>
    {DEMOS.map(({ id, component: C }) => (
      <Series.Sequence key={id} durationInFrames={DEMO_FRAMES} name={id}>
        <C />
      </Series.Sequence>
    ))}
  </Series>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ComponentGallery" component={Gallery} durationInFrames={DEMO_FRAMES * DEMOS.length} fps={FPS} width={1920} height={1080} />
    {DEMOS.map(({ id, component }) => (
      <Composition key={id} id={id} component={component} durationInFrames={DEMO_FRAMES} fps={FPS} width={1920} height={1080} />
    ))}
  </>
);
