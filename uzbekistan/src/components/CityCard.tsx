/**
 * <CityCard> — city title card: huge Oswald name whose letters rise one by one, an age counter
 * ("2,500+ YEARS"), a handwritten subtitle, and a paper map inset locating the city inside Uzbekistan.
 *
 * @example
 * <CityCard name="SAMARKAND" lonLat={[66.97, 39.65]} at={0}
 *   age={{ to: 2500, suffix: '+ YEARS', label: 'FOUNDED 7TH CENTURY BC' }} subtitle="the monument" />
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BigCounter } from '../../../shared/components/BigCounter';
import { Cutout } from '../../../shared/components/Cutout';
import { RouteMap } from '../../../shared/components/RouteMap';
import { SPRINGS, Tone, useTheme } from '../../../shared/theme';
import { Sfx } from '../../../shared/lib/sfx';
import { PALETTE } from '../theme';

const UZ_BOUNDS = { west: 55.8, east: 73.3, south: 37.0, north: 45.7 };

export const CityCard: React.FC<{
  name: string;
  lonLat: [number, number];
  at?: number;
  age?: { to: number; prefix?: string; suffix?: string; label?: string };
  subtitle?: string;
  /** Frame the subtitle appears (default at + 30). */
  subtitleAt?: number;
  tone?: Tone;
  /** Exit frame (the card slides away). */
  outAt?: number;
  /** Top-left of the name block. */
  left?: number;
  top?: number;
  inset?: { left: number; top: number; width?: number; height?: number };
}> = ({ name, lonLat, at = 0, age, subtitle, subtitleAt, tone = 'light', outAt, left = 150, top = 300, inset = { left: 1250, top: 150 } }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = useTheme();
  const tc = th.tones[tone];
  const F = th.fonts;
  const letters = name.split('');
  const out = outAt === undefined ? 0 : spring({ frame: frame - outAt, fps, config: SPRINGS.snappy });
  const lineP = interpolate(frame, [at + letters.length * 2, at + letters.length * 2 + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const iw = inset.width ?? 520;
  const ih = inset.height ?? 320;

  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-out * 2200}px)` }}>
      <Sfx name="paperSlide" at={at} />
      <div style={{ position: 'absolute', left, top }}>
        <div style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 260, lineHeight: 0.9, color: tc.fg, letterSpacing: 6, whiteSpace: 'nowrap' }}>
          {letters.map((ch, i) => {
            const s = spring({ frame: frame - (at + i * 2), fps, config: SPRINGS.cutout });
            return (
              <span key={i} style={{ display: 'inline-block', transform: `translateY(${(1 - s) * 140}px)`, opacity: Math.min(1, s * 2) }}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{ height: 12, width: `${lineP * 100}%`, background: PALETTE.turquoise, marginTop: 10 }} />
        {age && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 26 }}>
            <BigCounter to={age.to} at={at + 16} duration={50} prefix={age.prefix} suffix={age.suffix} fontSize={110} color={PALETTE.terracotta} clicks />
            {age.label && (
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 28,
                  letterSpacing: 2,
                  color: tc.muted,
                  opacity: interpolate(frame, [at + 40, at + 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                }}
              >
                {age.label}
              </span>
            )}
          </div>
        )}
        {subtitle && (
          <div
            style={{
              fontFamily: F.hand,
              fontWeight: 700,
              fontSize: 72,
              color: tone === 'dark' ? PALETTE.saffron : PALETTE.lapis,
              marginTop: 8,
              opacity: interpolate(frame, [subtitleAt ?? at + 30, (subtitleAt ?? at + 30) + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <Cutout enterAt={at + 8} from="right" seed={`inset-${name}`} rotation={2.5} style={{ left: inset.left, top: inset.top }} background={PALETTE.tileWhite}>
        <div style={{ position: 'relative', width: iw, height: ih }}>
          <RouteMap
            width={iw}
            height={ih}
            fitBounds={UZ_BOUNDS}
            padding={[18, 18]}
            resolution="50m"
            land="#E4DED2"
            highlight={[{ iso: '860', at: at + 14, color: PALETTE.turquoiseLight }]}
            nodes={[{ id: name, lonLat, label: name, at: at + 24, pulse: true, color: PALETTE.terracotta, r: 10, dx: lonLat[0] < 62 ? 18 : -18 }]}
          />
          <div style={{ position: 'absolute', left: 14, bottom: 10, fontFamily: F.mono, fontSize: 16, letterSpacing: 2, color: PALETTE.greyDark }}>UZBEKISTAN</div>
        </div>
      </Cutout>
    </div>
  );
};
