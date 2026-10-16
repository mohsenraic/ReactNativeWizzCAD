/**
 * <Stamp> — rubber stamp that thuds down: drops from 2.4× with a hard spring, worn ink texture,
 * double border. `useStampShake(at)` gives the parent a small impact shake.
 *
 * @example
 * <Stamp text="TREND: NOT REVERSED" at={90} style={{ left: 360, top: 420 }} />
 * // number that counts while the stamp lands ({n} is replaced):
 * <Stamp text="{n}+" count={{ to: 1_000_000 }} at={30} />
 * // camera shake on impact:
 * const shake = useStampShake(90);
 * <AbsoluteFill style={{ transform: shake }}>…cards…</AbsoluteFill>
 */
import React, { useId } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRINGS, useTheme } from '../theme';
import { Sfx } from '../lib/sfx';
import { formatNumber } from '../lib/format';

export const Stamp: React.FC<{
  text: string;
  at?: number;
  rotation?: number;
  color?: string;
  fontSize?: number;
  style?: React.CSSProperties;
  /**
   * Count a number inside the stamp: `{n}` in `text` animates from `from` to `to`, starting as the stamp lands.
   * The stamp is sized for the final value so it doesn't resize while counting.
   */
  count?: { to: number; from?: number; decimals?: number; duration?: number; sign?: 'auto' | 'always'; grouping?: boolean };
}> = ({ text: textProp, at = 0, rotation = -9, color: colorProp, fontSize = 120, style, count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const { colors: C, fonts: F } = useTheme();
  const color = colorProp ?? C.accent;
  const s = spring({ frame: frame - at, fps, config: SPRINGS.stamp });
  const scale = interpolate(s, [0, 1], [2.4, 1]);
  const opacity = interpolate(frame, [at, at + 3], [0, 0.94], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const blur = interpolate(frame, [at, at + 5], [6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  let text = textProp;
  let sizingText = textProp;
  if (count) {
    const fmt = (v: number) => formatNumber(v, { decimals: count.decimals ?? 0, sign: count.sign ?? 'auto', grouping: count.grouping ?? true });
    const v = interpolate(frame, [at + 2, at + 2 + (count.duration ?? 30)], [count.from ?? 0, count.to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    text = textProp.replace('{n}', fmt(v));
    sizingText = textProp.replace('{n}', fmt(count.to));
  }

  const padX = fontSize * 0.45;
  const padY = fontSize * 0.25;
  const w = sizingText.length * fontSize * 0.5 + padX * 2;
  const h = fontSize * 1.2 + padY * 2;

  return (
    <div
      style={{
        position: 'absolute',
        transform: `rotate(${rotation}deg) scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        mixBlendMode: 'multiply',
        ...style,
      }}
    >
      <Sfx name="stampThud" at={at + 4} />
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
        <defs>
          <filter id={`worn-${id}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.55" result="mask" />
            <feComposite in="SourceGraphic" in2="mask" operator="in" result="worn" />
            <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves={1} seed={9} result="warp" />
            <feDisplacementMap in="worn" in2="warp" scale={3} />
          </filter>
        </defs>
        <g filter={`url(#worn-${id})`}>
          <rect x={4} y={4} width={w - 8} height={h - 8} rx={10} fill="none" stroke={color} strokeWidth={8} />
          <rect x={18} y={18} width={w - 36} height={h - 36} rx={6} fill="none" stroke={color} strokeWidth={3} />
          <text
            x={w / 2}
            y={h / 2 + fontSize * 0.36}
            textAnchor="middle"
            fill={color}
            fontFamily={F.headline}
            fontWeight={700}
            fontSize={fontSize}
            letterSpacing={fontSize * 0.04}
          >
            {text}
          </text>
        </g>
      </svg>
    </div>
  );
};

/** Short decaying shake starting at `at` — apply as a CSS transform. */
export const useStampShake = (at: number, strength = 10): string => {
  const frame = useCurrentFrame();
  const t = frame - at - 3;
  if (t < 0 || t > 14) return 'none';
  const decay = Math.exp(-t / 3.5);
  return `translate(${Math.sin(t * 2.7) * strength * decay}px, ${Math.cos(t * 3.1) * strength * 0.7 * decay}px)`;
};
