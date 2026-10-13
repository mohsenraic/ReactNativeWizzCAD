/**
 * icons.tsx — animated ink icons for Scene 5's IconCards. Each takes `t` = frames since the card
 * landed and draws in a 200×200 box.
 *   cost     house + price tag that keeps growing
 *   work     clock with fast-spinning hands
 *   marriage two rings drifting apart
 *   gender   balance scale tipping
 */
import React from 'react';
import { interpolate, spring } from 'remotion';
import { COLORS, FONTS, SPRINGS } from '../theme';

const ink = { fill: 'none', stroke: COLORS.ink, strokeWidth: 6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export type IconName = 'cost' | 'work' | 'marriage' | 'gender';

export const AnimatedIcon: React.FC<{ name: IconName; t: number; fps: number; size?: number }> = ({ name, t, fps, size = 200 }) => {
  const clampT = Math.max(0, t);
  let body: React.ReactNode = null;

  if (name === 'cost') {
    const grow = interpolate(clampT, [0, 90], [0.55, 1.35], { extrapolateRight: 'clamp' });
    const swing = Math.sin(clampT / 7) * 6;
    body = (
      <>
        <path d="M 30 100 L 85 52 L 140 100" {...ink} />
        <path d="M 42 92 L 42 160 L 128 160 L 128 92" {...ink} />
        <rect x={70} y={118} width={28} height={42} {...ink} />
        <g transform={`translate(150 66) rotate(${swing}) scale(${grow})`}>
          <line x1={0} y1={0} x2={0} y2={14} stroke={COLORS.ink} strokeWidth={3} />
          <path d="M -22 14 L 22 14 L 22 58 L 0 72 L -22 58 Z" fill={COLORS.highlighter} stroke={COLORS.ink} strokeWidth={4} strokeLinejoin="round" />
          <text x={0} y={50} textAnchor="middle" fontFamily={FONTS.headline} fontWeight={700} fontSize={30} fill={COLORS.ink}>¥</text>
        </g>
      </>
    );
  } else if (name === 'work') {
    const minute = clampT * 24; // fast-spinning
    const hour = clampT * 2;
    body = (
      <>
        <circle cx={100} cy={104} r={70} {...ink} />
        <path d="M 66 40 L 54 26 M 134 40 L 146 26" {...ink} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={100 + Math.cos(a) * 58} y1={104 + Math.sin(a) * 58} x2={100 + Math.cos(a) * 64} y2={104 + Math.sin(a) * 64} stroke={COLORS.ink} strokeWidth={3} />;
        })}
        <line x1={100} y1={104} x2={100} y2={58} {...ink} transform={`rotate(${minute} 100 104)`} />
        <line x1={100} y1={104} x2={100} y2={76} {...ink} stroke={COLORS.red} transform={`rotate(${hour} 100 104)`} />
        <circle cx={100} cy={104} r={5} fill={COLORS.ink} />
      </>
    );
  } else if (name === 'marriage') {
    const apart = interpolate(clampT, [10, 110], [0, 34], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    body = (
      <>
        <circle cx={78 - apart} cy={110} r={40} {...ink} />
        <circle cx={122 + apart} cy={110} r={40} {...ink} stroke={COLORS.slate} />
        <path d={`M ${108 + apart} 62 l 14 -16 l 14 16 z`} fill={COLORS.highlighter} stroke={COLORS.ink} strokeWidth={3} />
      </>
    );
  } else {
    const tip = spring({ frame: clampT - 12, fps, config: SPRINGS.cutout }) * 16;
    body = (
      <>
        <line x1={100} y1={40} x2={100} y2={164} {...ink} />
        <path d="M 66 168 L 134 168" {...ink} />
        <g transform={`rotate(${tip} 100 56)`}>
          <line x1={34} y1={56} x2={166} y2={56} {...ink} />
          <g transform={`rotate(${-tip} 40 56)`}>
            <path d="M 40 56 L 22 104 M 40 56 L 58 104 M 16 104 Q 40 124 64 104 Z" {...ink} />
            <circle cx={40} cy={94} r={8} fill={COLORS.red} />
          </g>
          <g transform={`rotate(${-tip} 160 56)`}>
            <path d="M 160 56 L 142 104 M 160 56 L 178 104 M 136 104 Q 160 124 184 104 Z" {...ink} />
          </g>
        </g>
      </>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      {body}
    </svg>
  );
};
