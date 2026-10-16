/**
 * <VisaMap> — world map where countries flip from grey to turquoise as visa rules relax, one step per year,
 * with a big flipping year label and an "~90 COUNTRIES" counter at the end. Uzbekistan stays lapis with an
 * outline so the eye always finds it.
 *
 * Countries listed in a step are the documented ones (data.ts › visaFree); the counter is the official total,
 * so the map never claims more precision than the data has.
 *
 * @example
 * <VisaMap steps={visaFree.data.map((s, i) => ({ ...s, at: 20 + i * 45 }))}
 *   counter={{ at: 200, to: visaCount2025.data.approxCountries, kicker: 'AROUND' }} />
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BigCounter } from '../../../shared/components/BigCounter';
import { WorldMap } from '../../../shared/components/WorldMap';
import { SPRINGS, useTheme } from '../../../shared/theme';
import { Sfx } from '../../../shared/lib/sfx';
import { PALETTE } from '../theme';

export interface VisaStep {
  label: string;
  isos: string[];
  /** Frame this step starts flipping. */
  at: number;
}

export const VisaMap: React.FC<{
  steps: VisaStep[];
  /** Final total. `kicker` sits above the number (e.g. 'AROUND' for an approximate figure). */
  counter?: { at: number; to: number; kicker?: string; label?: string };
  /** Frames between countries inside one step. */
  stagger?: number;
  tone?: 'light' | 'dark';
  /** Top of the flipping year label (px). */
  labelTop?: number;
}> = ({ steps, counter, stagger = 1, tone = 'light', labelTop = 60 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F, tones } = useTheme();
  const tc = tones[tone];
  const flipColor = PALETTE.turquoise;

  const highlight = [
    { iso: '860', at: 0, color: PALETTE.lapis },
    ...steps.flatMap((s) => s.isos.map((iso, i) => ({ iso, at: s.at + i * stagger, color: flipColor }))),
  ];

  // current step for the year label
  let current = -1;
  steps.forEach((s, i) => {
    if (frame >= s.at) current = i;
  });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <WorldMap
        land={tone === 'dark' ? PALETTE.landOnLapis : '#CFC8BA'}
        highlight={highlight}
        padding={[60, 110]}
        overlay={(api) => {
          const d = api.countryPath('860');
          const pulse = 0.5 + 0.5 * Math.sin(frame / 8);
          return d ? <path d={d} fill="none" stroke={PALETTE.saffron} strokeWidth={3 + pulse * 2} strokeLinejoin="round" /> : null;
        }}
      />
      {steps.map((s, i) => (
        <Sfx key={i} name="paperSlide" at={s.at} volume={0.35} />
      ))}
      {/* flipping year label, top-left */}
      <div style={{ position: 'absolute', left: 110, top: labelTop, width: 900, height: 150, overflow: 'hidden', perspective: 600 }}>
        {steps.map((s, i) => {
          if (i !== current && i !== current - 1) return null;
          const p = spring({ frame: frame - s.at, fps, config: SPRINGS.snappy });
          const isOld = i === current - 1;
          const nextP = isOld ? spring({ frame: frame - steps[current].at, fps, config: SPRINGS.snappy }) : 0;
          const rot = isOld ? nextP * 90 : (1 - p) * -90;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                fontFamily: F.headline,
                fontWeight: 700,
                fontSize: 140,
                lineHeight: 1,
                color: tc.fg,
                transform: `rotateX(${rot}deg)`,
                transformOrigin: '50% 50%',
                opacity: isOld ? 1 - nextP : p,
                whiteSpace: 'nowrap',
              }}
            >
              {s.label}
            </div>
          );
        })}
      </div>
      {counter && frame >= counter.at - 1 && (
        <div style={{ position: 'absolute', left: 110, top: 690 }}>
          {counter.kicker && (
            <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: 3, color: tc.muted, opacity: interpolate(frame, [counter.at, counter.at + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              {counter.kicker}
            </div>
          )}
          <BigCounter to={counter.to} at={counter.at} duration={40} fontSize={170} color={PALETTE.turquoise} clicks />
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 28,
              letterSpacing: 2,
              color: tc.muted,
              opacity: interpolate(frame, [counter.at + 10, counter.at + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            {counter.label ?? 'COUNTRIES WITH EASIER ENTRY'}
          </div>
        </div>
      )}
    </div>
  );
};
