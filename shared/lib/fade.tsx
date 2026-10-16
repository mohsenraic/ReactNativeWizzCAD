/**
 * fade.tsx — opacity helpers used by every scene.
 *
 * @example
 * const o = useFade(30, 120);          // in at 30, out at 120
 * <Fade inAt={30} outAt={120}>…</Fade>  // unmounts when fully transparent
 */
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

/** 0→1 fade-in at `inAt`, 1→0 fade-out at `outAt` (optional). */
export const useFade = (inAt: number, outAt?: number, len = 12): number => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [inAt, inAt + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const b = outAt === undefined ? 1 : interpolate(frame, [outAt, outAt + len], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return a * b;
};

export const Fade: React.FC<{ inAt?: number; outAt?: number; len?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  inAt = 0,
  outAt,
  len = 12,
  children,
  style,
}) => {
  const o = useFade(inAt, outAt, len);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ opacity: o, ...style }}>{children}</AbsoluteFill>;
};
