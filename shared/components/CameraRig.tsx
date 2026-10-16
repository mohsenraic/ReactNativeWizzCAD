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
  /** Current punch-in from `moves` (null when the scene uses none). */
  move?: { scale: number; focus: [number, number] } | null;
}

/**
 * A camera beat: at frame `at`, ease to `scale` centred on screen point `focus` over `duration` frames
 * (default 18). Moves chain: each starts from wherever the previous one left the camera.
 */
export interface CameraMove {
  at: number;
  scale: number;
  focus: [number, number];
  duration?: number;
}

const moveStateAt = (moves: CameraMove[], frame: number): { scale: number; focus: [number, number] } => {
  let cur = { scale: 1, focus: [960, 540] as [number, number] };
  for (const m of [...moves].sort((a, b) => a.at - b.at)) {
    if (frame < m.at) break;
    const t = interpolate(frame, [m.at, m.at + (m.duration ?? 18)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
    cur = {
      scale: cur.scale + (m.scale - cur.scale) * t,
      focus: [cur.focus[0] + (m.focus[0] - cur.focus[0]) * t, cur.focus[1] + (m.focus[1] - cur.focus[1]) * t],
    };
  }
  return cur;
};

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
  /** Punch-ins / pans keyed to frames (optional). Layers follow in proportion to depth. */
  moves?: CameraMove[];
}> = ({ children, durationInFrames, pushIn = 0.06, focus = [960, 540], offset = [0, 0], drift = [-18, -6], moves }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: seqDuration } = useVideoConfig();
  const d = durationInFrames ?? seqDuration;
  const progress = interpolate(frame, [0, d], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  return (
    <RigContext.Provider value={{ progress, focus, offset, pushIn, drift, move: moves && moves.length ? moveStateAt(moves, frame) : null }}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>{children}</AbsoluteFill>
    </RigContext.Provider>
  );
};

export const ParallaxLayer: React.FC<{ depth?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  depth = 1,
  children,
  style,
}) => {
  const { progress, focus, offset, pushIn, drift, move } = useCamera();
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
      {move ? <MoveWrap move={move} depth={depth}>{children}</MoveWrap> : children}
    </AbsoluteFill>
  );
};

/** Zoom about a moving point without origin jumps: x' = s·x + (1 − s)·f. Background layers zoom less. */
const MoveWrap: React.FC<{ move: { scale: number; focus: [number, number] }; depth: number; children: React.ReactNode }> = ({ move, depth, children }) => {
  const s = 1 + (move.scale - 1) * Math.min(1, depth);
  const tx = (1 - s) * move.focus[0];
  const ty = (1 - s) * move.focus[1];
  return <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: '0 0' }}>{children}</AbsoluteFill>;
};
