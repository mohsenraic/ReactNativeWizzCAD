/**
 * <CameraRig> + <ParallaxLayer> — slow push-in (scale 1 → 1.06) with depth layers.
 *
 * The rig computes one eased progress for the whole scene; each <ParallaxLayer> scales and
 * drifts in proportion to its `depth` (0 = static background, 1 = main plane, >1 = foreground).
 * `focus` sets the point the camera pushes toward. `offset` lets a scene pan the camera
 * (e.g. follow a chart's line tip) — layers move by offset × depth.
 *
 * @example
 * <CameraRig focus={[960, 540]}>
 *   <ParallaxLayer depth={0.3}><PaperBackground /></ParallaxLayer>
 *   <ParallaxLayer depth={1}><AnimatedLineChart … /></ParallaxLayer>
 *   <ParallaxLayer depth={1.4}><Cutout …>note</Cutout></ParallaxLayer>
 * </CameraRig>
 */
import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface RigState {
  progress: number;
  focus: [number, number];
  offset: [number, number];
  pushIn: number;
  drift: [number, number];
}

const RigContext = createContext<RigState>({
  progress: 0,
  focus: [960, 540],
  offset: [0, 0],
  pushIn: 0.06,
  drift: [0, 0],
});

export const useCamera = () => useContext(RigContext);

export const CameraRig: React.FC<{
  children: React.ReactNode;
  /** Defaults to the enclosing sequence's duration. */
  durationInFrames?: number;
  /** Total extra scale at the end of the scene. Default 0.06 (1 → 1.06). */
  pushIn?: number;
  focus?: [number, number];
  /** Camera pan in px (e.g. follow a point). Applied × depth per layer. */
  offset?: [number, number];
  /** Slow lateral drift across the scene, px at depth 1. */
  drift?: [number, number];
}> = ({ children, durationInFrames, pushIn = 0.06, focus = [960, 540], offset = [0, 0], drift = [-18, -6] }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: seqDuration } = useVideoConfig();
  const d = durationInFrames ?? seqDuration;
  const progress = interpolate(frame, [0, d], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  return (
    <RigContext.Provider value={{ progress, focus, offset, pushIn, drift }}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>{children}</AbsoluteFill>
    </RigContext.Provider>
  );
};

export const ParallaxLayer: React.FC<{ depth?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  depth = 1,
  children,
  style,
}) => {
  const { progress, focus, offset, pushIn, drift } = useCamera();
  const scale = 1 + pushIn * progress * depth;
  const tx = (drift[0] * progress - offset[0]) * depth;
  const ty = (drift[1] * progress - offset[1]) * depth;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
        transformOrigin: `${focus[0]}px ${focus[1]}px`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
