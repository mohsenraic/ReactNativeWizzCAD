import {createContext, useContext} from 'react';
import {Easing, interpolate, spring, SpringConfig, useCurrentFrame} from 'remotion';
import {VIDEO} from '../config';

/** Secondes -> frames */
export const sec = (s: number) => Math.round(s * VIDEO.fps);

type SceneInfo = {
  /** Début logique de la scène (s) */
  sceneStart: number;
  /** Frame absolue où commence la <Sequence> (fondu d'entrée compris) */
  fromFrame: number;
};

export const SceneContext = createContext<SceneInfo>({sceneStart: 0, fromFrame: 0});

/**
 * Temps courant, en absolu et relatif au début logique de la scène.
 * `t` peut être légèrement négatif pendant le fondu d'entrée.
 */
export const useSceneTime = () => {
  const frame = useCurrentFrame();
  const {sceneStart, fromFrame} = useContext(SceneContext);
  const absFrame = fromFrame + frame;
  const abs = absFrame / VIDEO.fps;
  return {absFrame, abs, t: abs - sceneStart};
};

/** Progression 0 -> 1 entre deux instants (s), bornée, avec easing doux par défaut */
export const progress = (
  time: number,
  start: number,
  end: number,
  easing: (n: number) => number = Easing.inOut(Easing.cubic),
) =>
  interpolate(time, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const SOFT_SPRING: Partial<SpringConfig> = {damping: 200, mass: 0.9, stiffness: 90};
export const POP_SPRING: Partial<SpringConfig> = {damping: 13, mass: 0.8, stiffness: 120};

/** spring() déclenché à un instant donné (s, même référentiel que `time`) */
export const springAt = (
  time: number,
  at: number,
  config: Partial<SpringConfig> = SOFT_SPRING,
  durationInFrames?: number,
) => {
  const f = (time - at) * VIDEO.fps;
  if (f <= 0) return 0;
  return spring({frame: f, fps: VIDEO.fps, config, durationInFrames});
};
