/**
 * <SourceTag> — small "SOURCE: …" label, bottom-left, IBM Plex Mono.
 * Pass a dataset to pick up its tag and status: placeholder data prints a red warning so it can't
 * slip into a final render unnoticed.
 *
 * @example
 * <SourceTag dataset={birthsSeries} at={10} />
 * <SourceTag text="MHLW, 2026" tone="dark" />
 * // photo credit, bottom-right:
 * <SourceTag prefix="PHOTO:" text="Ekrem Canli / CC BY-SA 3.0" align="right" />
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { SAFE_MARGIN, Tone, useTheme, useTone } from '../theme';
import type { DataStatus } from '../data/types';

export const SourceTag: React.FC<{
  text?: string;
  dataset?: { sourceTag: string; status: DataStatus };
  /** Extra datasets shown on the same tag (joined with " · "). */
  also?: Array<{ sourceTag: string; status: DataStatus }>;
  at?: number;
  tone?: Tone;
  style?: React.CSSProperties;
  /** Label before the text. Default "SOURCE:" (use "PHOTO:" for photo credits). */
  prefix?: string;
  /** Corner: 'left' (default, bottom-left) or 'right' (bottom-right, e.g. photo credits). */
  align?: 'left' | 'right';
}> = ({ text, dataset, also = [], at = 0, tone = 'light', style, prefix = 'SOURCE:', align = 'left' }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at, at + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const all = [...(dataset ? [dataset] : []), ...also];
  const label = text ?? Array.from(new Set(all.map((d) => d.sourceTag))).join(' · ');
  const placeholder = all.some((d) => d.status === 'placeholder');
  const c = useTone(tone);
  const { colors: C, fonts: F } = useTheme();
  return (
    <div
      style={{
        position: 'absolute',
        ...(align === 'right' ? { right: SAFE_MARGIN, textAlign: 'right' as const } : { left: SAFE_MARGIN }),
        bottom: 44,
        fontFamily: F.mono,
        fontSize: 18,
        letterSpacing: 1.2,
        color: c.muted,
        opacity,
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {prefix} {label}
      {placeholder && (
        <span style={{ color: C.warning, marginLeft: 16, fontWeight: 500 }}>⚠ PLACEHOLDER DATA — NOT FOR PUBLICATION</span>
      )}
    </div>
  );
};
