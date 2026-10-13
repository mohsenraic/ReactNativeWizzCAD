/**
 * <PopulationPyramid> — 5-year cohorts as paper strips (men left, women right) that morph
 * smoothly between keyframe years. Baby-boom cohorts get a yellow marker band that climbs
 * with them; a cohort range can be tinted (65+); the whole shape can flip and wobble.
 *
 * Geometry is exported (`pyramidGeometry`) so scenes can attach arrows and the 65+ brace.
 *
 * @example
 * <PopulationPyramid
 *   keyframes={[
 *     { data: pyramids.data[0], at: 0 },     // 1950
 *     { data: pyramids.data[1], at: 240 },   // morph → 1990 starting at frame 240
 *     { data: pyramids.data[2], at: 600 },   // → 2025
 *     { data: pyramids.data[3], at: 900 },   // → 2070
 *   ]}
 *   buildAt={20} highlightBoomsAt={300} tintFromAge={{ age: 65, at: 1000 }}
 *   style={{ left: 410, top: 140 }}
 * />
 */
import React, { useId } from 'react';
import { Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, SPRINGS, Tone, toneColors } from '../theme';
import { boomCohortIndex, COHORT_COUNT, PyramidCohort, PyramidYear } from '../data/japan';
import { jitter } from '../lib/sketch';
import { formatNumber } from '../lib/format';

export interface PyramidKeyframe {
  data: PyramidYear;
  /** Frame the morph toward this year starts (ignored for the first keyframe). */
  at: number;
}

export interface PyramidProps {
  keyframes: PyramidKeyframe[];
  morphFrames?: number;
  width?: number;
  height?: number;
  /** Bar scale: thousands of people at full half-width. */
  maxValue?: number;
  centerGap?: number;
  /** Strips fly in one by one starting here. Omit = already built. */
  buildAt?: number;
  /** Show the climbing yellow bands for the two baby booms from this frame. */
  highlightBoomsAt?: number;
  /** Tint cohorts from `age` upward. */
  tintFromAge?: { age: number; at: number; color?: string };
  /** Flip upside-down with a wobble. */
  flip?: { at: number; duration?: number };
  showYear?: boolean;
  tone?: Tone;
  maleColor?: string;
  femaleColor?: string;
  style?: React.CSSProperties;
}

export const pyramidGeometry = ({ width = 1100, height = 820, maxValue = 6000, centerGap = 120 }: Pick<PyramidProps, 'width' | 'height' | 'maxValue' | 'centerGap'>) => {
  const top = 70;
  const bottom = height - 50;
  const rowH = (bottom - top) / COHORT_COUNT;
  const cx = width / 2;
  const half = (width - centerGap) / 2 - 20;
  return {
    cx,
    rowH,
    /** Top y of the strip for cohort index (0 = youngest, at the bottom). Fractional allowed. */
    rowTop: (i: number) => bottom - (i + 1) * rowH,
    rowCenter: (i: number) => bottom - (i + 0.5) * rowH,
    barWidth: (v: number) => (v / maxValue) * half,
    /** Left edge of a male bar / right edge of a female bar of value v. */
    maleEdge: (v: number) => cx - centerGap / 2 - (v / maxValue) * half,
    femaleEdge: (v: number) => cx + centerGap / 2 + (v / maxValue) * half,
    centerGap,
    top,
    bottom,
  };
};

/** Interpolated state at a frame: cohorts, display year, and t of the current morph. */
export const pyramidStateAt = (keyframes: PyramidKeyframe[], frame: number, morphFrames = 45) => {
  let i = 0;
  for (let k = 1; k < keyframes.length; k++) if (frame >= keyframes[k].at) i = k;
  if (i === 0) return { cohorts: keyframes[0].data.cohorts, year: keyframes[0].data.year, from: keyframes[0].data, to: keyframes[0].data, t: 1 };
  const a = keyframes[i - 1].data;
  const b = keyframes[i].data;
  const t = interpolate(frame, [keyframes[i].at, keyframes[i].at + morphFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const cohorts: PyramidCohort[] = a.cohorts.map((c, k) => ({
    ...c,
    male: c.male + (b.cohorts[k].male - c.male) * t,
    female: c.female + (b.cohorts[k].female - c.female) * t,
  }));
  return { cohorts, year: a.year + (b.year - a.year) * t, from: a, to: b, t };
};

export const PopulationPyramid: React.FC<PyramidProps> = (props) => {
  const {
    keyframes,
    morphFrames = 45,
    width = 1100,
    height = 820,
    buildAt,
    highlightBoomsAt,
    tintFromAge,
    flip,
    showYear = true,
    tone = 'light',
    maleColor = COLORS.slate,
    femaleColor = COLORS.slateLight,
    style,
  } = props;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/:/g, '');
  const g = pyramidGeometry(props);
  const st = pyramidStateAt(keyframes, frame, morphFrames);
  const c = toneColors(tone);

  // Flip with a damped wobble after landing.
  let flipDeg = 0;
  if (flip) {
    const fd = flip.duration ?? 30;
    const p = interpolate(frame, [flip.at, flip.at + fd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.back(1.4)) });
    const after = Math.max(0, frame - flip.at - fd);
    flipDeg = p * 180 + Math.sin(after / 4) * Math.exp(-after / 18) * 6 * (p >= 1 ? 1 : 0);
  }

  const booms = highlightBoomsAt === undefined || frame < highlightBoomsAt
    ? []
    : (['boom1', 'boom2'] as const).map((id) => {
        const ia = boomCohortIndex(st.from.year, id);
        const ib = boomCohortIndex(st.to.year, id);
        const appear = interpolate(frame, [highlightBoomsAt, highlightBoomsAt + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        if (ia === null && ib === null) return null;
        if (ia === null) return { id, index: ib!, opacity: st.t * appear };
        if (ib === null) return { id, index: ia, opacity: (1 - st.t) * appear };
        return { id, index: ia + (ib - ia) * st.t, opacity: appear };
      }).filter((b): b is { id: 'boom1' | 'boom2'; index: number; opacity: number } => b !== null);

  const widthAtIndex = (fi: number, side: 'male' | 'female') => {
    const lo = Math.max(0, Math.min(COHORT_COUNT - 1, Math.floor(fi)));
    const hi = Math.min(COHORT_COUNT - 1, lo + 1);
    const t = fi - Math.floor(fi);
    return st.cohorts[lo][side] + (st.cohorts[hi][side] - st.cohorts[lo][side]) * t;
  };

  const tintP = tintFromAge ? interpolate(frame, [tintFromAge.at, tintFromAge.at + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;

  return (
    <div style={{ position: 'absolute', width, height, transform: `rotate(${flipDeg}deg)`, transformOrigin: '50% 50%', ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <filter id={`${uid}-strip`} x="-5%" y="-30%" width="110%" height="160%">
            <feDropShadow dx={0} dy={2} stdDeviation={1.6} floodOpacity={0.22} />
          </filter>
        </defs>

        {showYear && (
          <text x={g.cx} y={height * 0.52} textAnchor="middle" fontFamily={FONTS.headline} fontWeight={700} fontSize={380} fill={c.fg} opacity={0.07}>
            {Math.round(st.year)}
          </text>
        )}

        <g fontFamily={FONTS.headline} fontWeight={700} fontSize={34} fill={c.fg} letterSpacing={2}>
          <text x={g.cx - g.centerGap / 2 - 10} y={34} textAnchor="end">MEN</text>
          <text x={g.cx + g.centerGap / 2 + 10} y={34}>WOMEN</text>
        </g>

        {st.cohorts.map((co, i) => {
          const enter = buildAt === undefined ? 1 : spring({ frame: frame - buildAt - i * 3, fps, config: SPRINGS.cutout });
          if (enter <= 0.001) return null;
          const y = g.rowTop(i) + 2;
          const h = g.rowH - 4;
          const tint = tintFromAge && co.ageFrom >= tintFromAge.age ? tintP : 0;
          const tintColor = tintFromAge?.color ?? COLORS.red;
          const mFill = interpolateColors(tint, [0, 1], [maleColor, tintColor]);
          const fFill = interpolateColors(tint, [0, 1], [femaleColor, tintColor]);
          const mw = g.barWidth(co.male);
          const fw = g.barWidth(co.female);
          const rot = jitter(`strip-${i}`, 0.5);
          return (
            <g key={i} opacity={Math.min(1, enter * 1.5)} filter={`url(#${uid}-strip)`}>
              <g transform={`translate(${(1 - enter) * -260} 0) rotate(${rot} ${g.cx} ${y})`}>
                <rect x={g.cx - g.centerGap / 2 - mw} y={y} width={mw} height={h} fill={mFill} stroke="#FBFAF6" strokeWidth={2.5} />
              </g>
              <g transform={`translate(${(1 - enter) * 260} 0) rotate(${-rot} ${g.cx} ${y})`}>
                <rect x={g.cx + g.centerGap / 2} y={y} width={fw} height={h} fill={fFill} stroke="#FBFAF6" strokeWidth={2.5} />
              </g>
              {i % 2 === 0 && (
                <text x={g.cx} y={y + h / 2 + 6} textAnchor="middle" fontFamily={FONTS.mono} fontSize={16} fill={c.muted}>
                  {co.label}
                </text>
              )}
            </g>
          );
        })}

        {booms.map((b) => {
          const y = g.rowTop(b.index) + 1;
          const mw = g.barWidth(widthAtIndex(b.index, 'male'));
          const fw = g.barWidth(widthAtIndex(b.index, 'female'));
          return (
            <g key={b.id} opacity={b.opacity}>
              <rect x={g.cx - g.centerGap / 2 - mw} y={y + 1} width={mw} height={g.rowH - 4} fill={COLORS.highlighter} stroke={COLORS.ink} strokeWidth={2} />
              <rect x={g.cx + g.centerGap / 2} y={y + 1} width={fw} height={g.rowH - 4} fill={COLORS.highlighter} stroke={COLORS.ink} strokeWidth={2} />
            </g>
          );
        })}

        {/* scale */}
        <g fontFamily={FONTS.mono} fontSize={16} fill={c.muted}>
          {[2000, 4000].map((v) => (
            <React.Fragment key={v}>
              <text x={g.maleEdge(v)} y={g.bottom + 30} textAnchor="middle">{formatNumber(v / 1000)}M</text>
              <text x={g.femaleEdge(v)} y={g.bottom + 30} textAnchor="middle">{formatNumber(v / 1000)}M</text>
            </React.Fragment>
          ))}
        </g>
      </svg>
    </div>
  );
};

/** Current fractional cohort index of a baby boom (for arrows that track it). */
export const boomIndexAt = (keyframes: PyramidKeyframe[], frame: number, boom: 'boom1' | 'boom2', morphFrames = 45): number | null => {
  const st = pyramidStateAt(keyframes, frame, morphFrames);
  const a = boomCohortIndex(st.from.year, boom);
  const b = boomCohortIndex(st.to.year, boom);
  if (a === null || b === null) return b ?? a;
  return a + (b - a) * st.t;
};
