/**
 * <SceneTransition> — wraps a scene and animates its first/last frames:
 *   'whip'  fast horizontal whip-pan with motion blur and skew
 *   'paper' the scene slides in/out like a sheet of paper (slight rotation + shadow)
 * Transitions sit inside each scene's own duration, so the Series timing is unchanged.
 *
 * @example
 * <SceneTransition enter="paper" exit="whip">
 *   <Scene2 />
 * </SceneTransition>
 */
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sfx } from '../lib/sfx';

export type TransitionType = 'whip' | 'paper' | 'none';

const style = (type: TransitionType, p: number, dir: 1 | -1): React.CSSProperties => {
  // p: 0 = fully off-screen, 1 = settled
  if (type === 'whip') {
    const x = (1 - p) * 1920 * dir;
    const blur = (1 - p) * 40;
    return { transform: `translateX(${x}px) skewX(${(1 - p) * -8 * dir}deg)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined };
  }
  if (type === 'paper') {
    const y = (1 - p) * 1150;
    return {
      transform: `translateY(${y}px) rotate(${(1 - p) * 4}deg)`,
      boxShadow: p < 1 ? '0 -20px 50px rgba(0,0,0,0.35)' : undefined,
    };
  }
  return {};
};

export const SceneTransition: React.FC<{
  children: React.ReactNode;
  enter?: TransitionType;
  exit?: TransitionType;
  frames?: number;
  /** Defaults to the enclosing sequence's duration. */
  durationInFrames?: number;
}> = ({ children, enter = 'none', exit = 'none', frames = 12, durationInFrames: d }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: seq } = useVideoConfig();
  const durationInFrames = d ?? seq;
  const ease = Easing.out(Easing.cubic);
  const pIn = enter === 'none' ? 1 : interpolate(frame, [0, frames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const pOut =
    exit === 'none'
      ? 1
      : interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.in(Easing.cubic),
        });
  const inStyle = pIn < 1 ? style(enter, pIn, 1) : {};
  const outStyle = pOut < 1 ? style(exit, pOut, -1) : {};
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {enter === 'whip' && <Sfx name="whoosh" at={0} volume={0.4} />}
      {enter === 'paper' && <Sfx name="paperSlide" at={0} />}
      <AbsoluteFill style={{ ...inStyle, ...outStyle }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
