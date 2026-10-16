/**
 * <SceneShell> — background + camera rig + chapter-card overlay + transitions for one scene.
 * Children are the main plane (depth 1); `under` sits at depth 0.6, `foreground` at depth 1.3;
 * `overlay` is unaffected by the camera (source tags, labels that must stay put).
 *
 * @example
 * <SceneShell durationInFrames={1008} paper="dark" chapter={{ number: 1, title: 'THE NORMAL PACIFIC' }}
 *   overlay={<SourceTag dataset={wmoOct2026} tone="dark" />}>
 *   …scene content…
 * </SceneShell>
 */
import React from 'react';
import { Sequence } from 'remotion';
import { CameraMove, CameraRig, ParallaxLayer } from './CameraRig';
import { ChapterCard } from './ChapterCard';
import { PaperBackground, PaperVariant } from './PaperBackground';
import { SceneTransition, TransitionType } from './SceneTransition';

export const SceneShell: React.FC<{
  durationInFrames: number;
  paper?: PaperVariant;
  /** Seed for the paper fibres (vary per scene). */
  seed?: string;
  chapter?: { number: number; title: string; titleSize?: number };
  /** Chapter card length in frames. Default 54 (1.8 s). */
  chapterFrames?: number;
  enter?: TransitionType;
  exit?: TransitionType;
  direction?: 'horizontal' | 'vertical';
  focus?: [number, number];
  offset?: [number, number];
  drift?: [number, number];
  pushIn?: number;
  /** Camera punch-ins / pans keyed to frames. */
  moves?: CameraMove[];
  children: React.ReactNode;
  under?: React.ReactNode;
  foreground?: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({
  durationInFrames,
  paper = 'light',
  seed = 'paper',
  chapter,
  chapterFrames = 54,
  enter = 'whip',
  exit = 'none',
  direction,
  focus,
  offset,
  drift,
  pushIn,
  moves,
  children,
  under,
  foreground,
  overlay,
}) => (
  <SceneTransition enter={enter} exit={exit} frames={12} durationInFrames={durationInFrames} direction={direction}>
    <CameraRig focus={focus} offset={offset} drift={drift} pushIn={pushIn} durationInFrames={durationInFrames} moves={moves}>
      <ParallaxLayer depth={0.3}>
        <PaperBackground tone={paper} seed={seed} />
      </ParallaxLayer>
      {under && <ParallaxLayer depth={0.6}>{under}</ParallaxLayer>}
      <ParallaxLayer depth={1}>{children}</ParallaxLayer>
      {foreground && <ParallaxLayer depth={1.3}>{foreground}</ParallaxLayer>}
    </CameraRig>
    {overlay}
    {chapter && (
      <Sequence durationInFrames={chapterFrames} name="chapter-card">
        <ChapterCard number={chapter.number} title={chapter.title} titleSize={chapter.titleSize} />
      </Sequence>
    )}
  </SceneTransition>
);
