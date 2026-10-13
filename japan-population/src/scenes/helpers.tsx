/**
 * helpers.tsx — shared scene plumbing.
 *
 * `cue(scene, phrase)` returns the frame (relative to the scene start) at which the caption chunk
 * containing `phrase` begins. Every visual beat is keyed to narration this way, so re-timing
 * captions.ts to the recorded voiceover automatically re-times the animation.
 */
import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { captionsForScene } from '../data/captions';
import { CHAPTER_CARD_FRAMES, sceneById } from '../timeline';
import { CameraRig, ChapterCard, PaperBackground, ParallaxLayer, SceneTransition } from '../components';
import type { PaperVariant, TransitionType } from '../components';

export const cue = (scene: number, phrase: string, offset = 0): number => {
  const c = captionsForScene(scene).find((x) => x.lines.join(' ').includes(phrase));
  if (!c) throw new Error(`cue(): phrase "${phrase}" not found in scene ${scene} captions`);
  return c.from + offset;
};

/** End frame (relative) of the caption chunk containing `phrase`. */
export const cueEnd = (scene: number, phrase: string, offset = 0): number => {
  const c = captionsForScene(scene).find((x) => x.lines.join(' ').includes(phrase));
  if (!c) throw new Error(`cueEnd(): phrase "${phrase}" not found in scene ${scene} captions`);
  return c.to + offset;
};

/** 0→1 fade-in at `inAt`, 1→0 fade-out at `outAt` (optional). */
export const useFade = (inAt: number, outAt?: number, len = 12): number => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [inAt, inAt + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const b = outAt === undefined ? 1 : interpolate(frame, [outAt, outAt + len], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return a * b;
};

export const Fade: React.FC<{ inAt?: number; outAt?: number; len?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ inAt = 0, outAt, len = 12, children, style }) => {
  const o = useFade(inAt, outAt, len);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ opacity: o, ...style }}>{children}</AbsoluteFill>;
};

/**
 * <SceneShell> — background + camera rig + chapter card overlay + transitions for one scene.
 * Children are the main plane (depth 1); `foreground` sits at depth 1.3; `overlay` is unaffected by
 * the camera (source tags, stamps that must stay put).
 */
export const SceneShell: React.FC<{
  id: number;
  paper?: PaperVariant;
  enter?: TransitionType;
  exit?: TransitionType;
  focus?: [number, number];
  offset?: [number, number];
  pushIn?: number;
  children: React.ReactNode;
  foreground?: React.ReactNode;
  overlay?: React.ReactNode;
  /** Extra layer under the main plane (e.g. a second paper that slides in). */
  under?: React.ReactNode;
}> = ({ id, paper = 'light', enter = 'whip', exit = 'none', focus, offset, pushIn, children, foreground, overlay, under }) => {
  const scene = sceneById(id);
  return (
    <SceneTransition enter={enter} exit={exit} frames={12} durationInFrames={scene.durationInFrames}>
      <CameraRig focus={focus} offset={offset} pushIn={pushIn} durationInFrames={scene.durationInFrames}>
        <ParallaxLayer depth={0.3}>
          <PaperBackground tone={paper} seed={`paper-${id}`} />
        </ParallaxLayer>
        {under && <ParallaxLayer depth={0.6}>{under}</ParallaxLayer>}
        <ParallaxLayer depth={1}>{children}</ParallaxLayer>
        {foreground && <ParallaxLayer depth={1.3}>{foreground}</ParallaxLayer>}
      </CameraRig>
      {overlay}
      {scene.chapter && (
        <Sequence durationInFrames={CHAPTER_CARD_FRAMES} name="chapter-card">
          <ChapterCard number={scene.chapter.number} title={scene.chapter.title} />
        </Sequence>
      )}
    </SceneTransition>
  );
};
