/**
 * <SourceTag> — small "SOURCE: …" label, bottom-left, IBM Plex Mono.
 * Pass a dataset to pick up its tag and status: placeholder data prints a red warning so it can't
 * slip into a final render unnoticed.
 *
 * @example
 * <SourceTag dataset={birthsSeries} at={10} />
 * <SourceTag text="MHLW, 2026" tone="dark" />
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS, SAFE_MARGIN, Tone, toneColors } from '../theme';
import type { DataStatus } from '../data/japan';

export const SourceTag: React.FC<{
  text?: string;
  dataset?: { sourceTag: string; status: DataStatus };
  /** Extra datasets shown on the same tag (joined with " · "). */
  also?: Array<{ sourceTag: string; status: DataStatus }>;
  at?: number;
  tone?: Tone;
  style?: React.CSSProperties;
}> = ({ text, dataset, also = [], at = 0, tone = 'light', style }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at, at + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const all = [...(dataset ? [dataset] : []), ...also];
  const label = text ?? Array.from(new Set(all.map((d) => d.sourceTag))).join(' · ');
  const placeholder = all.some((d) => d.status === 'placeholder');
  const c = toneColors(tone);
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_MARGIN,
        bottom: 44,
        fontFamily: FONTS.mono,
        fontSize: 18,
        letterSpacing: 1.2,
        color: c.muted,
        opacity,
        textTransform: 'uppercase',
        ...style,
      }}
    >
      SOURCE: {label}
      {placeholder && (
        <span style={{ color: COLORS.red, marginLeft: 16, fontWeight: 500 }}>⚠ PLACEHOLDER DATA — NOT FOR PUBLICATION</span>
      )}
    </div>
  );
};
