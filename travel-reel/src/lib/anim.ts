import {Easing, interpolate, spring, SpringConfig} from 'remotion';
import {FPS} from './constants';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** 0 -> 1 between two times (s), clamped, soft easing by default */
export const progress = (
  t: number,
  start: number,
  end: number,
  easing: (n: number) => number = Easing.inOut(Easing.cubic),
) =>
  end <= start
    ? t >= end
      ? 1
      : 0
    : interpolate(t, [start, end], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing,
      });

export const SOFT: Partial<SpringConfig> = {damping: 200, stiffness: 100, mass: 0.8};
export const POP: Partial<SpringConfig> = {damping: 11, stiffness: 140, mass: 0.7};

/** spring() triggered at a given time (s) */
export const springAt = (t: number, at: number, config: Partial<SpringConfig> = SOFT) => {
  const f = (t - at) * FPS;
  return f <= 0 ? 0 : spring({frame: f, fps: FPS, config});
};
