/**
 * Root.tsx — "Uzbekistan" (the full video), one composition per scene (Uzbekistan-SceneNN) for previews,
 * and one demo per new component (Uzbekistan-Demo-*).
 *
 * Render:  npx remotion render Uzbekistan out/uzbekistan.mp4
 */
import React from 'react';
import { Composition } from 'remotion';
import { ThemeProvider } from '../../shared/theme';
import { DEMOS, DEMO_FRAMES } from './examples/demos';
import { SCENE_COMPONENTS } from './scenes';
import { uzbekistanTheme } from './theme';
import { FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH, sec } from './timings';
import { Uzbekistan, defaultUzbekistanProps } from './Uzbekistan';
import { Short, defaultShortProps } from './short/Short';
import { SHORT_FRAMES, SHORT_HEIGHT, SHORT_WIDTH } from './short/timings';

const themed = (C: React.FC): React.FC => {
  const Themed: React.FC = () => (
    <ThemeProvider theme={uzbekistanTheme}>
      <C />
    </ThemeProvider>
  );
  return Themed;
};

const sceneSum = SCENES.reduce((n, s) => n + sec(s.seconds), 0);
if (sceneSum !== TOTAL_FRAMES) throw new Error(`Scenes add up to ${sceneSum} frames, expected ${TOTAL_FRAMES}`);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Uzbekistan" component={Uzbekistan} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={defaultUzbekistanProps} />
    <Composition id="Uzbekistan-Short" component={Short} durationInFrames={SHORT_FRAMES} fps={FPS} width={SHORT_WIDTH} height={SHORT_HEIGHT} defaultProps={defaultShortProps} />
    {SCENES.map((s, i) => {
      const C = SCENE_COMPONENTS[s.id];
      return C ? (
        <Composition key={s.id} id={`Uzbekistan-Scene${String(i + 1).padStart(2, '0')}`} component={themed(C)} durationInFrames={sec(s.seconds)} fps={FPS} width={WIDTH} height={HEIGHT} />
      ) : null;
    })}
    {DEMOS.map(({ id, component }) => (
      <Composition key={id} id={id} component={component} durationInFrames={DEMO_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    ))}
  </>
);
