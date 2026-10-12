import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {CROSSFADE, VIDEO} from '../config';
import {sec, SceneContext} from '../lib/time';

type Props = {
  /** Début logique (s) */
  start: number;
  /** Fin logique (s) */
  end: number;
  name?: string;
  children: React.ReactNode;
};

const TOTAL = VIDEO.durationInSeconds;

/**
 * Monte une scène avec un fondu enchaîné : elle apparaît CROSSFADE/2 avant
 * `start` et disparaît CROSSFADE/2 après `end`.
 */
export const SceneSequence: React.FC<Props> = ({start, end, name, children}) => {
  const half = CROSSFADE / 2;
  const fadeIn = start > 0;
  const fadeOut = end < TOTAL;
  const visStart = fadeIn ? start - half : 0;
  const visEnd = fadeOut ? end + half : TOTAL;
  const fromFrame = sec(visStart);
  const duration = sec(visEnd) - fromFrame;

  return (
    <Sequence from={fromFrame} durationInFrames={duration} name={name} layout="none">
      <SceneContext.Provider value={{sceneStart: start, fromFrame}}>
        <FadeLayer
          fadeIn={fadeIn}
          fadeOut={fadeOut}
          durationFrames={duration}
          fadeFrames={sec(CROSSFADE)}
        >
          {children}
        </FadeLayer>
      </SceneContext.Provider>
    </Sequence>
  );
};

const FadeLayer: React.FC<{
  fadeIn: boolean;
  fadeOut: boolean;
  durationFrames: number;
  fadeFrames: number;
  children: React.ReactNode;
}> = ({fadeIn, fadeOut, durationFrames, fadeFrames, children}) => {
  // useCurrentFrame est relatif à la Sequence
  const frame = useCurrentFrame();
  const inOpacity = fadeIn
    ? interpolate(frame, [0, fadeFrames], [0, 1], {extrapolateRight: 'clamp'})
    : 1;
  const outOpacity = fadeOut
    ? interpolate(frame, [durationFrames - fadeFrames, durationFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;
  return <AbsoluteFill style={{opacity: Math.min(inOpacity, outOpacity)}}>{children}</AbsoluteFill>;
};
