/**
 * Root.tsx — ElNino2026 (the 5:00 video), one composition per scene for quick previews, and one demo per
 * El Niño component.
 */
import React from 'react';
import { Composition } from 'remotion';
import { ThemeProvider } from '../../shared/theme';
import { ElNino2026, SCENES, TOTAL_DURATION, defaultElNino2026Props } from './ElNino2026';
import { DEMOS, DEMO_FRAMES } from './examples/demos';
import { elninoTheme } from './theme';
import { FPS, TOTAL_FRAMES } from './timeline';

if (TOTAL_DURATION !== TOTAL_FRAMES) throw new Error(`Scenes add up to ${TOTAL_DURATION} frames, expected ${TOTAL_FRAMES}`);

const themed = (C: React.FC): React.FC => {
  const Themed: React.FC = () => (
    <ThemeProvider theme={elninoTheme}>
      <C />
    </ThemeProvider>
  );
  return Themed;
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ElNino2026"
      component={ElNino2026}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={defaultElNino2026Props}
    />
    {SCENES.map(({ name, duration, C }, i) => (
      <Composition key={name} id={`ElNino-Scene${i + 1}`} component={themed(C)} durationInFrames={duration} fps={FPS} width={1920} height={1080} />
    ))}
    {DEMOS.map(({ id, component }) => (
      <Composition key={id} id={id} component={component} durationInFrames={DEMO_FRAMES} fps={FPS} width={1920} height={1080} />
    ))}
  </>
);
