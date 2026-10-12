import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile} from 'remotion';
import {DATA} from '../data';
import {HEIGHT, WIDTH} from '../lib/constants';
import type {Motion, Transition} from '../lib/timeline';

type Props = {
  src: string;
  focus: {x: number; y: number};
  motion: Motion;
  /** 0 -> 1 over the shot's duration */
  progress: number;
  /** 0 -> 1 entry transition, 1 = fully in */
  enterP?: number;
  enterType?: Transition;
  /** 0 -> 1 exit transition, 0 = not leaving yet */
  exitP?: number;
  exitType?: Transition | null;
  /** Darken the image (0 -> 1) */
  darken?: number;
};

const ease = Easing.inOut(Easing.sin);

/**
 * Full-screen photo (cover, cropped around `focus`) with a camera move:
 * slow zoom in/out, pan left/right, or 2.5D parallax (sharp photo floating
 * over a blurred copy). Dark gradients top/bottom keep text readable.
 */
export const PhotoScene: React.FC<Props> = ({
  src,
  focus,
  motion,
  progress,
  enterP = 1,
  enterType = 'fade',
  exitP = 0,
  exitType = 'fade',
  darken = 0,
}) => {
  const p = ease(Math.min(1, Math.max(0, progress)));
  const file = staticFile(`photos/${src}`);

  // --- Transitions -----------------------------------------------------------
  let opacity = 1;
  let tx = 0;
  let tScale = 1;
  const inP = Easing.out(Easing.cubic)(enterP);
  if (enterP < 1) {
    if (enterType === 'fade') opacity *= inP;
    if (enterType === 'zoomThrough') {
      opacity *= inP;
      tScale *= interpolate(inP, [0, 1], [1.35, 1]);
    }
    if (enterType === 'slide') tx += interpolate(inP, [0, 1], [WIDTH, 0]);
  }
  if (exitP > 0) {
    const outP = Easing.in(Easing.cubic)(exitP);
    if (exitType === 'zoomThrough') {
      tScale *= interpolate(outP, [0, 1], [1, 1.45]);
      opacity *= 1 - outP;
    }
    if (exitType === 'slide') tx += interpolate(outP, [0, 1], [0, -WIDTH * 0.35]);
    // fade: the incoming shot covers this one
  }

  const gradients = (
    <>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(10,26,47,0.55) 0%, rgba(10,26,47,0) 22%, rgba(10,26,47,0) 62%, rgba(10,26,47,0.7) 100%)`,
        }}
      />
      {darken > 0 ? <AbsoluteFill style={{background: DATA.theme.navy, opacity: darken}} /> : null}
    </>
  );

  // --- Camera moves ------------------------------------------------------------
  let content: React.ReactNode;
  if (motion === 'parallax') {
    // 2.5D: blurred background drifts one way, sharp photo the other
    content = (
      <>
        <Img
          src={file}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${focus.x}% ${focus.y}%`,
            filter: 'blur(28px) brightness(0.75) saturate(1.15)',
            transform: `scale(${1.25 + 0.05 * p}) translateX(${interpolate(p, [0, 1], [30, -30])}px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -40,
            right: -40,
            top: HEIGHT * 0.22,
            height: HEIGHT * 0.56,
            overflow: 'hidden',
            borderRadius: 0,
            boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
            transform: `translateX(${interpolate(p, [0, 1], [-28, 28])}px) scale(${interpolate(p, [0, 1], [1, 1.06])})`,
            WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 9%, #000 91%, transparent 100%)',
            maskImage: 'linear-gradient(180deg, transparent 0%, #000 9%, #000 91%, transparent 100%)',
          }}
        >
          <Img
            src={file}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${focus.x}% ${focus.y}%`,
              transform: `scale(${interpolate(p, [0, 1], [1.12, 1.02])})`,
            }}
          />
        </div>
      </>
    );
  } else {
    let scale = 1.06;
    let x = focus.x;
    if (motion === 'zoomIn') scale = interpolate(p, [0, 1], [1.02, 1.18]);
    if (motion === 'zoomOut') scale = interpolate(p, [0, 1], [1.2, 1.03]);
    if (motion === 'panRight') x = interpolate(p, [0, 1], [focus.x - 10, focus.x + 10]);
    if (motion === 'panLeft') x = interpolate(p, [0, 1], [focus.x + 10, focus.x - 10]);
    content = (
      <Img
        src={file}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${Math.min(100, Math.max(0, x))}% ${focus.y}%`,
          transform: `scale(${scale})`,
          transformOrigin: `${focus.x}% ${focus.y}%`,
        }}
      />
    );
  }

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        opacity,
        transform: `translateX(${tx}px) scale(${tScale})`,
        backgroundColor: DATA.theme.navy,
      }}
    >
      {content}
      {gradients}
    </AbsoluteFill>
  );
};
