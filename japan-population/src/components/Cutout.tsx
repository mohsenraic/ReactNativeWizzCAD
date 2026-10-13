/**
 * <Cutout> — collage paper cutout: white 6px border, soft drop shadow, seeded ±3° rotation,
 * slides in with a quick spring and a small overshoot. Optional exit.
 *
 * @example
 * <Cutout enterAt={12} from="left" style={{ left: 120, top: 640 }} seed="deaths">
 *   <div style={{ padding: 24 }}>DEATHS <BigCounter to={1_589_489} … /></div>
 * </Cutout>
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, SPRINGS } from '../theme';
import { jitter } from '../lib/sketch';

export type EnterFrom = 'left' | 'right' | 'top' | 'bottom' | 'scale' | 'none';

export const useEnter = (enterAt: number, from: EnterFrom, distance = 180, config = SPRINGS.cutout) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - enterAt, fps, config });
  const off = (1 - s) * distance;
  const translate =
    from === 'left' ? `translateX(${-off}px)` :
    from === 'right' ? `translateX(${off}px)` :
    from === 'top' ? `translateY(${-off}px)` :
    from === 'bottom' ? `translateY(${off}px)` : '';
  const scale = from === 'scale' ? `scale(${0.6 + 0.4 * s})` : '';
  return { progress: s, transform: `${translate} ${scale}`, opacity: from === 'none' ? 1 : Math.min(1, s * 2.2) };
};

export const Cutout: React.FC<{
  children: React.ReactNode;
  enterAt?: number;
  from?: EnterFrom;
  distance?: number;
  /** Frame to slide back out (optional). */
  exitAt?: number;
  exitTo?: Exclude<EnterFrom, 'none' | 'scale'>;
  /** Fixed rotation in degrees; otherwise seeded within ±3°. */
  rotation?: number;
  seed?: string;
  border?: number;
  background?: string;
  shadow?: boolean;
  style?: React.CSSProperties;
  innerStyle?: React.CSSProperties;
}> = ({
  children,
  enterAt = 0,
  from = 'bottom',
  distance = 180,
  exitAt,
  exitTo = 'left',
  rotation,
  seed = 'cutout',
  border = 6,
  background = '#FFFFFF',
  shadow = true,
  style,
  innerStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = useEnter(enterAt, from, distance);
  const rot = rotation ?? jitter(`${seed}-rot`, 3);
  // Tiny settle wobble after landing.
  const settle = Math.sin(Math.max(0, frame - enterAt) / 6) * Math.exp(-Math.max(0, frame - enterAt) / 14) * 1.2;

  let exitTransform = '';
  let exitOpacity = 1;
  if (exitAt !== undefined) {
    const e = spring({ frame: frame - exitAt, fps, config: SPRINGS.snappy });
    const d = e * 1400;
    exitTransform =
      exitTo === 'left' ? `translateX(${-d}px)` :
      exitTo === 'right' ? `translateX(${d}px)` :
      exitTo === 'top' ? `translateY(${-d}px)` : `translateY(${d}px)`;
    exitOpacity = 1 - interpolate(e, [0.7, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  }

  return (
    <div
      style={{
        position: 'absolute',
        transform: `${exitTransform} ${enter.transform} rotate(${rot + settle}deg)`,
        opacity: enter.opacity * exitOpacity,
        ...style,
      }}
    >
      <div
        style={{
          background,
          border: `${border}px solid ${COLORS.cutoutBorder}`,
          boxShadow: shadow ? '0 2px 3px rgba(0,0,0,0.18), 0 14px 28px rgba(0,0,0,0.22)' : undefined,
          ...innerStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};
