/**
 * <BigCounter> — animated number: counts up or down, locale grouping, true minus sign,
 * optional "+" sign, decimals, prefix/suffix. Digits use fixed-width slots so the number
 * doesn't jitter as it changes.
 *
 * @example
 * <BigCounter from={0} to={-918_253} at={20} duration={75} fontSize={220} color="#C8102E" />
 * <BigCounter to={1.14} decimals={2} at={10} suffix=" births per woman" />
 * <BigCounter to={3.6} decimals={1} prefix="¥" suffix="T" />
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { useTheme } from '../theme';
import { FormatOptions, formatNumber } from '../lib/format';
import { Sfx } from '../lib/sfx';

export const useCountValue = (
  from: number,
  to: number,
  at: number,
  duration: number,
  easing: (t: number) => number = Easing.out(Easing.cubic),
) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [at, at + duration], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
};

export const BigCounter: React.FC<{
  from?: number;
  to: number;
  at?: number;
  duration?: number;
  decimals?: number;
  sign?: FormatOptions['sign'];
  locale?: string;
  /** Thousands separators (default true). Pass false for years: 1370, not 1,370. */
  grouping?: boolean;
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  /** Width of a digit slot in em. Oswald ≈ 0.52, Plex Mono ≈ 0.6. */
  digitWidth?: number;
  easing?: (t: number) => number;
  /** Play light counter clicks while counting (sound-design slot). */
  clicks?: boolean;
  style?: React.CSSProperties;
  suffixStyle?: React.CSSProperties;
}> = ({
  from = 0,
  to,
  at = 0,
  duration = 60,
  decimals = 0,
  sign = 'auto',
  locale = 'en-US',
  grouping = true,
  prefix = '',
  suffix = '',
  fontSize = 160,
  color,
  fontFamily,
  fontWeight = 700,
  digitWidth = 0.54,
  easing,
  clicks = false,
  style,
  suffixStyle,
}) => {
  const { colors: C, fonts: F } = useTheme();
  const value = useCountValue(from, to, at, duration, easing);
  const text = formatNumber(value, { decimals, sign, locale, grouping });
  const clickFrames = clicks ? Array.from({ length: Math.floor(duration / 4) }, (_, i) => at + i * 4) : [];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', fontFamily: fontFamily ?? F.headline, fontWeight, fontSize, color: color ?? C.ink, lineHeight: 1, ...style }}>
      {clickFrames.map((f) => (
        <Sfx key={f} name="counterClick" at={f} volume={0.25} />
      ))}
      {prefix && <span>{prefix}</span>}
      {text.split('').map((ch, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: /\d/.test(ch) ? `${digitWidth}em` : undefined,
            textAlign: 'center',
          }}
        >
          {ch}
        </span>
      ))}
      {suffix && <span style={{ marginLeft: '0.12em', ...suffixStyle }}>{suffix}</span>}
    </div>
  );
};
