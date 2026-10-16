/**
 * weatherIcons.tsx — animated ink icons for weather and climate hazards, in the same hand-inked style
 * as icons.tsx. Each draws in a 200×200 box and takes `t` = frames since the icon appeared.
 *   fire         flickering flame
 *   rain         cloud with falling rain
 *   cloud        drifting cloud
 *   flood        house with water rising
 *   wiltedCrop   stalk drooping over cracked ground
 *   sun          sun with turning rays
 *   thermometer  mercury rising
 *
 * Use inside <Cutout> / <IconCard icon={<WeatherIcon … />}>.
 *
 * @example
 * <Cutout enterAt={30} style={{ left: 1500, top: 700 }}><WeatherIcon name="fire" t={frame - 30} size={140} /></Cutout>
 */
import React from 'react';
import { interpolate } from 'remotion';
import { useTheme } from '../theme';

export type WeatherIconName = 'fire' | 'rain' | 'cloud' | 'flood' | 'wiltedCrop' | 'sun' | 'thermometer';

const CLOUD = 'M 52 118 Q 30 118 30 98 Q 30 78 52 78 Q 56 52 84 52 Q 106 52 114 70 Q 122 62 136 64 Q 156 68 156 90 Q 172 92 172 106 Q 172 118 156 118 Z';

export const WeatherIcon: React.FC<{
  name: WeatherIconName;
  t: number;
  size?: number;
  /** Main tint (flame, water, mercury…). Defaults per icon from the theme. */
  color?: string;
  /** Ink colour. Defaults to the theme ink. */
  ink?: string;
}> = ({ name, t, size = 200, color, ink: inkProp }) => {
  const { colors: C } = useTheme();
  const T = Math.max(0, t);
  const inkC = inkProp ?? C.ink;
  const ink = { fill: 'none', stroke: inkC, strokeWidth: 6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let body: React.ReactNode = null;

  if (name === 'fire') {
    const f1 = Math.sin(T / 3.1) * 0.05 + Math.sin(T / 1.7) * 0.03;
    const sway = Math.sin(T / 4.3) * 4;
    body = (
      <g transform={`translate(100 172) scale(${1 + f1} ${1 - f1 * 0.6}) skewX(${sway}) translate(-100 -172)`}>
        <path d="M 100 30 C 128 66 154 86 150 124 C 147 154 126 172 100 172 C 74 172 53 154 50 124 C 48 98 66 84 74 62 C 84 82 92 88 96 92 C 98 70 96 50 100 30 Z" fill={color ?? C.accent} {...{ stroke: inkC, strokeWidth: 6, strokeLinejoin: 'round' }} />
        <path d="M 100 92 C 114 112 126 124 124 142 C 122 158 112 166 100 166 C 88 166 78 158 76 142 C 75 128 84 120 90 108 C 94 116 98 118 100 120 Z" fill={C.highlighter} stroke={inkC} strokeWidth={4} strokeLinejoin="round" />
      </g>
    );
  } else if (name === 'rain' || name === 'cloud') {
    const drift = name === 'cloud' ? Math.sin(T / 20) * 8 : 0;
    const drops = name === 'rain'
      ? Array.from({ length: 6 }, (_, i) => {
          const x = 52 + i * 21;
          const y = 128 + ((T * 3.2 + i * 17) % 52);
          const o = interpolate(y, [128, 140, 170, 180], [0, 1, 1, 0]);
          return <line key={i} x1={x} y1={y} x2={x - 5} y2={y + 14} stroke={color ?? C.secondary} strokeWidth={6} strokeLinecap="round" opacity={o} />;
        })
      : null;
    body = (
      <>
        <g transform={`translate(${drift} 0)`}>
          <path d={CLOUD} fill="#FFFFFF" {...{ stroke: inkC, strokeWidth: 6, strokeLinejoin: 'round' }} />
        </g>
        {drops}
      </>
    );
  } else if (name === 'flood') {
    const rise = interpolate(T, [0, 70], [0, 34], { extrapolateRight: 'clamp' });
    const wave = (y: number, ph: number) =>
      `M 10 ${y} ` + Array.from({ length: 9 }, (_, i) => `Q ${30 + i * 22} ${y + (i % 2 ? 7 : -7) * Math.sin(T / 6 + ph)} ${42 + i * 22} ${y}`).join(' ');
    body = (
      <>
        <path d="M 50 104 L 100 60 L 150 104" {...ink} />
        <path d="M 62 96 L 62 150 L 138 150 L 138 96" {...ink} />
        <rect x={88} y={116} width={24} height={34} {...ink} />
        <g>
          <path d={`${wave(170 - rise, 0)} L 190 200 L 10 200 Z`} fill={color ?? C.secondary} opacity={0.85} />
          <path d={wave(170 - rise, 0)} fill="none" stroke={inkC} strokeWidth={4} strokeLinecap="round" />
          <path d={wave(184 - rise, 1.4)} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
        </g>
      </>
    );
  } else if (name === 'wiltedCrop') {
    const droop = interpolate(T, [6, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const tipX = 100 + droop * 46;
    const tipY = 52 + droop * 56;
    body = (
      <>
        <path d="M 22 160 L 178 160" {...ink} />
        <path d="M 40 160 L 52 172 L 46 186 M 92 160 L 86 176 L 98 190 M 140 160 L 152 174 L 146 188" fill="none" stroke={inkC} strokeWidth={3} strokeLinecap="round" />
        <path d={`M 100 160 Q 100 ${110 - droop * 10} ${100 + droop * 20} ${80 + droop * 6} Q ${108 + droop * 34} ${60 + droop * 30} ${tipX} ${tipY}`} {...ink} stroke={color ?? '#8A7A2A'} />
        <path d={`M 100 128 Q ${76 - droop * 6} ${118 + droop * 22} ${64 - droop * 4} ${124 + droop * 30}`} {...ink} stroke={color ?? '#8A7A2A'} />
        <path d={`M 100 116 Q ${124 + droop * 4} ${104 + droop * 22} ${136 + droop * 6} ${110 + droop * 32}`} {...ink} stroke={color ?? '#8A7A2A'} />
        <ellipse cx={tipX} cy={tipY} rx={9} ry={15} transform={`rotate(${droop * 70} ${tipX} ${tipY})`} fill={C.highlighter} stroke={inkC} strokeWidth={4} />
      </>
    );
  } else if (name === 'sun') {
    const rot = T * 0.8;
    body = (
      <>
        <g transform={`rotate(${rot} 100 100)`}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <line key={i} x1={100 + Math.cos(a) * 56} y1={100 + Math.sin(a) * 56} x2={100 + Math.cos(a) * 82} y2={100 + Math.sin(a) * 82} {...ink} />;
          })}
        </g>
        <circle cx={100} cy={100} r={40} fill={color ?? C.highlighter} stroke={inkC} strokeWidth={6} />
      </>
    );
  } else {
    const level = interpolate(T, [4, 60], [0.25, 0.92], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const top = 140 - level * 104;
    body = (
      <>
        <rect x={86} y={28} width={28} height={124} rx={14} fill="#FFFFFF" stroke={inkC} strokeWidth={6} />
        <rect x={94} y={top} width={12} height={150 - top} fill={color ?? C.accent} />
        <circle cx={100} cy={160} r={22} fill={color ?? C.accent} stroke={inkC} strokeWidth={6} />
        {[52, 76, 100, 124].map((y) => (
          <line key={y} x1={118} y1={y} x2={130} y2={y} stroke={inkC} strokeWidth={3} strokeLinecap="round" />
        ))}
      </>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
      {body}
    </svg>
  );
};
