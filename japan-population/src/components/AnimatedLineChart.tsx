/**
 * <AnimatedLineChart> — multi-series line chart in the editorial style: thin gridlines, direct
 * labels (no legend), lines that draw on left → right, filled or hatched areas between two
 * series (or a series and a constant), milestone flags, pulsing markers, an optional year ticker,
 * and a torn-paper backing for overlay lines ("what they expected").
 *
 * Geometry helpers (`makeChartScales`, `seriesTip`) are exported so scenes can place
 * <HandDrawnAnnotation>s on data points or make the camera follow the line tip.
 * Lines are linear between published points (no smoothing that would invent values).
 *
 * @example
 * <AnimatedLineChart
 *   width={1600} height={800} style={{ left: 160, top: 120 }}
 *   xDomain={[1950, 2025]} yDomain={[70, 135]} yTicks={[80, 100, 120]} yTickFormat={(v) => `${v}M`}
 *   series={[{ id: 'pop', data: totalPopulation.data, color: COLORS.ink, draw: { at: 0, duration: 240 },
 *              label: { text: 'Population' } }]}
 *   areas={[{ id: 'loss', upper: 128.084, lower: 'pop', xRange: [2008, 2025], fill: 'hatch',
 *             color: COLORS.red, reveal: { at: 260, duration: 30 } }]}
 *   markers={[{ seriesId: 'pop', year: 2008, at: 200, pulse: true }]}
 *   yearTicker={{ seriesId: 'pop', x: 1500, y: 60 }}
 * />
 */
import React, { useId } from 'react';
import { Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, SPRINGS, Tone, toneColors } from '../theme';
import { valueAt, YearValue } from '../data/japan';
import { jitter } from '../lib/sketch';
import { formatNumber } from '../lib/format';

export interface ChartSeries {
  id: string;
  data: YearValue[];
  color: string;
  /** Colour shift over time (e.g. deaths grey → red). */
  colorTo?: { color: string; at: number; duration?: number };
  strokeWidth?: number;
  dashed?: boolean;
  /** Draw-on from the first to the last point between these frames. Omit = fully drawn. */
  draw?: {
    at: number;
    duration: number;
    /**
     * Optional [frame, year] pairs to sync the tip to narration (e.g. reach 2008 on "in 2008").
     * Overrides at/duration for the reveal; holds between equal years.
     */
    keyframes?: Array<[number, number]>;
  };
  /** Direct label next to the line end; appears when drawing finishes. */
  label?: { text: string; dx?: number; dy?: number; at?: number; size?: number };
  /** White torn-paper band behind the line. */
  backing?: 'tornPaper';
  /** Dot riding the tip while drawing. Default true. */
  tipDot?: boolean;
  opacity?: number;
}

export interface ChartArea {
  id: string;
  /** Series id or constant value. Fill only where upper > lower. */
  upper: string | number;
  lower: string | number;
  xRange?: [number, number];
  fill?: 'solid' | 'hatch';
  color: string;
  opacity?: number;
  /** Reveal left → right between these frames. */
  reveal: { at: number; duration: number };
  label?: { text: string; x: number; y: number; at?: number; size?: number; font?: 'hand' | 'headline' };
}

export interface ChartMilestone {
  seriesId: string;
  year: number;
  label: string;
  at: number;
  side?: 'above' | 'below';
  /** Pole length in px. */
  length?: number;
  /** Count a number inside the flag: label becomes `${prefix}${value}${suffix}`. */
  count?: { to: number; from?: number; decimals?: number; prefix?: string; suffix?: string; duration?: number };
}

export interface ChartMarker {
  seriesId: string;
  year: number;
  at: number;
  color?: string;
  pulse?: boolean;
  /** Flash ring on appearance (e.g. the 2007 crossover). */
  flash?: boolean;
}

export interface ChartProps {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks?: number[];
  yTicks?: number[];
  xTickFormat?: (v: number) => string;
  yTickFormat?: (v: number) => string;
  series: ChartSeries[];
  areas?: ChartArea[];
  milestones?: ChartMilestone[];
  markers?: ChartMarker[];
  yearTicker?: { seriesId: string; x: number; y: number; fontSize?: number };
  /** Frame the axes/grid fade in. */
  axesAt?: number;
  tone?: Tone;
  /** Extra SVG drawn in chart coordinates (annotations, custom marks). */
  overlay?: (s: ChartScales) => React.ReactNode;
  style?: React.CSSProperties;
}

export interface ChartScales {
  x: (v: number) => number;
  y: (v: number) => number;
  plot: { left: number; top: number; right: number; bottom: number };
  /** Data value of a series at a year (linear). */
  valueOf: (seriesId: string, year: number) => number;
  /** Pixel point of a series at a year. */
  point: (seriesId: string, year: number) => [number, number];
}

const DEFAULT_MARGIN = { top: 40, right: 220, bottom: 60, left: 90 };

export const makeChartScales = (p: Pick<ChartProps, 'width' | 'height' | 'margin' | 'xDomain' | 'yDomain' | 'series'>): ChartScales => {
  const m = p.margin ?? DEFAULT_MARGIN;
  const plot = { left: m.left, top: m.top, right: p.width - m.right, bottom: p.height - m.bottom };
  const x = (v: number) => plot.left + ((v - p.xDomain[0]) / (p.xDomain[1] - p.xDomain[0])) * (plot.right - plot.left);
  const y = (v: number) => plot.bottom - ((v - p.yDomain[0]) / (p.yDomain[1] - p.yDomain[0])) * (plot.bottom - plot.top);
  const byId = (id: string) => {
    const s = p.series.find((q) => q.id === id);
    if (!s) throw new Error(`AnimatedLineChart: unknown series "${id}"`);
    return s;
  };
  const valueOf = (id: string, year: number) => valueAt(byId(id).data, year);
  return { x, y, plot, valueOf, point: (id, year) => [x(year), y(valueOf(id, year))] };
};

/** First and last frame of a series' draw-on (keyframes win over at/duration). */
export const drawSpan = (s: ChartSeries): [number, number] | null => {
  if (!s.draw) return null;
  const kf = s.draw.keyframes;
  if (kf && kf.length >= 2) return [kf[0][0], kf[kf.length - 1][0]];
  return [s.draw.at, s.draw.at + s.draw.duration];
};

/** Data x the series has drawn to at `frame`. */
export const revealX = (s: ChartSeries, frame: number): number => {
  const first = s.data[0].year;
  const last = s.data[s.data.length - 1].year;
  if (!s.draw) return last;
  const kf = s.draw.keyframes;
  if (kf && kf.length >= 2) {
    return interpolate(frame, kf.map((k) => k[0]), kf.map((k) => k[1]), {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.sin),
    });
  }
  return interpolate(frame, [s.draw.at, s.draw.at + s.draw.duration], [first, last], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
};

/** Pixel position of a series' drawing tip at `frame` (for camera follow). */
export const seriesTip = (props: ChartProps, seriesId: string, frame: number): [number, number] => {
  const sc = makeChartScales(props);
  const s = props.series.find((q) => q.id === seriesId)!;
  const rx = revealX(s, frame);
  return [sc.x(rx), sc.y(valueAt(s.data, rx))];
};

const pathOf = (data: YearValue[], sc: ChartScales) =>
  data.map((d, i) => `${i ? 'L' : 'M'} ${sc.x(d.year).toFixed(2)} ${sc.y(d.value).toFixed(2)}`).join(' ');

export const AnimatedLineChart: React.FC<ChartProps> = (props) => {
  const { width, height, xDomain, series, areas = [], milestones = [], markers = [], tone = 'light', axesAt = 0, style } = props;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/:/g, '');
  const sc = makeChartScales(props);
  const c = toneColors(tone);
  const xTicks = props.xTicks ?? [];
  const yTicks = props.yTicks ?? [];
  const xFmt = props.xTickFormat ?? ((v: number) => String(v));
  const yFmt = props.yTickFormat ?? ((v: number) => String(v));
  const axesOpacity = interpolate(frame, [axesAt, axesAt + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const seriesColor = (s: ChartSeries) =>
    s.colorTo
      ? interpolateColors(frame, [s.colorTo.at, s.colorTo.at + (s.colorTo.duration ?? 20)], [s.color, s.colorTo.color])
      : s.color;

  const valueOrConst = (v: string | number, year: number) => (typeof v === 'number' ? v : sc.valueOf(v, year));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', overflow: 'visible', ...style }}>
      <defs>
        {series.map((s) => (
          <clipPath id={`${uid}-clip-${s.id}`} key={s.id}>
            <rect x={-50} y={-height} width={Math.max(0, sc.x(revealX(s, frame)) + 50)} height={height * 3} />
          </clipPath>
        ))}
        {areas.map((a) => {
          const [x0, x1] = a.xRange ?? xDomain;
          const rx = interpolate(frame, [a.reveal.at, a.reveal.at + a.reveal.duration], [x0, x1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.quad),
          });
          return (
            <React.Fragment key={a.id}>
              <clipPath id={`${uid}-aclip-${a.id}`}>
                <rect x={sc.x(x0)} y={-height} width={Math.max(0, sc.x(rx) - sc.x(x0))} height={height * 3} />
              </clipPath>
              <pattern id={`${uid}-hatch-${a.id}`} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1={0} y1={0} x2={0} y2={14} stroke={a.color} strokeWidth={4} />
              </pattern>
            </React.Fragment>
          );
        })}
        <filter id={`${uid}-paper`} x="-10%" y="-30%" width="120%" height="160%">
          <feDropShadow dx={0} dy={6} stdDeviation={6} floodOpacity={0.25} />
        </filter>
      </defs>

      {/* grid + ticks */}
      <g opacity={axesOpacity} fontFamily={FONTS.mono} fontSize={19} fill={c.muted}>
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={sc.plot.left} x2={sc.plot.right} y1={sc.y(v)} y2={sc.y(v)} stroke={c.grid} strokeWidth={1.5} />
            <text x={sc.plot.left - 14} y={sc.y(v) + 6} textAnchor="end">
              {yFmt(v)}
            </text>
          </g>
        ))}
        <line x1={sc.plot.left} x2={sc.plot.right} y1={sc.plot.bottom} y2={sc.plot.bottom} stroke={c.muted} strokeOpacity={0.5} strokeWidth={1.5} />
        {xTicks.map((v) => (
          <text key={`x${v}`} x={sc.x(v)} y={sc.plot.bottom + 34} textAnchor="middle">
            {xFmt(v)}
          </text>
        ))}
      </g>

      {/* areas */}
      {areas.map((a) => {
        const [x0, x1] = a.xRange ?? xDomain;
        const years = new Set<number>([x0, x1]);
        for (let yv = Math.ceil(x0); yv <= x1; yv++) years.add(yv);
        [a.upper, a.lower].forEach((v) => {
          if (typeof v === 'string') series.find((s) => s.id === v)?.data.forEach((d) => d.year >= x0 && d.year <= x1 && years.add(d.year));
        });
        const xs = [...years].sort((p, q) => p - q);
        const top = xs.map((yr) => [sc.x(yr), sc.y(valueOrConst(a.upper, yr))] as const);
        const bottom = xs.map((yr) => {
          const up = valueOrConst(a.upper, yr);
          const lo = valueOrConst(a.lower, yr);
          return [sc.x(yr), sc.y(Math.min(up, lo))] as const;
        });
        const d = `M ${top.map((p) => p.join(' ')).join(' L ')} L ${[...bottom].reverse().map((p) => p.join(' ')).join(' L ')} Z`;
        const labelOpacity = a.label
          ? interpolate(frame, [a.label.at ?? a.reveal.at + a.reveal.duration, (a.label.at ?? a.reveal.at + a.reveal.duration) + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          : 0;
        return (
          <g key={a.id}>
            <path
              d={d}
              clipPath={`url(#${uid}-aclip-${a.id})`}
              fill={a.fill === 'hatch' ? `url(#${uid}-hatch-${a.id})` : a.color}
              opacity={a.opacity ?? (a.fill === 'hatch' ? 0.7 : 0.28)}
            />
            {a.label && (
              <text
                x={a.label.x}
                y={a.label.y}
                fill={a.color}
                opacity={labelOpacity}
                fontFamily={a.label.font === 'headline' ? FONTS.headline : FONTS.hand}
                fontWeight={700}
                fontSize={a.label.size ?? 54}
                textAnchor="middle"
              >
                {a.label.text}
              </text>
            )}
          </g>
        );
      })}

      {/* torn-paper backings sit beneath every line so they never hide real data */}
      {series.filter((s) => s.backing === 'tornPaper').map((s) => (
        <g key={`backing-${s.id}`} opacity={!drawSpan(s) || frame >= drawSpan(s)![0] ? 1 : 0}>
          <g clipPath={`url(#${uid}-clip-${s.id})`} filter={`url(#${uid}-paper)`}>
            <path
              d={(() => {
                const pts = s.data.map((d) => [sc.x(d.year), sc.y(d.value)] as const);
                const up = pts.map(([px, py], i) => `${px.toFixed(1)} ${(py - 34 + jitter(`${s.id}-u${i}`, 6)).toFixed(1)}`);
                const dn = [...pts].reverse().map(([px, py], i) => `${px.toFixed(1)} ${(py + 34 + jitter(`${s.id}-d${i}`, 6)).toFixed(1)}`);
                const pad = 24;
                return `M ${pts[0][0] - pad} ${pts[0][1] - 30} L ${up.join(' L ')} L ${pts[pts.length - 1][0] + pad} ${pts[pts.length - 1][1]} L ${dn.join(' L ')} L ${pts[0][0] - pad} ${pts[0][1] + 30} Z`;
              })()}
              fill="#FBF8F1"
            />
          </g>
        </g>
      ))}

      {/* series */}
      {series.map((s) => {
        const color = seriesColor(s);
        const rx = revealX(s, frame);
        const tip: [number, number] = [sc.x(rx), sc.y(valueAt(s.data, rx))];
        const span = drawSpan(s);
        const drawing = span !== null && frame >= span[0] && frame < span[1];
        const last = s.data[s.data.length - 1];
        const labelAt = s.label?.at ?? (span ? span[1] : 0);
        const labelOpacity = interpolate(frame, [labelAt, labelAt + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const started = !span || frame >= span[0];
        return (
          <g key={s.id} opacity={(s.opacity ?? 1) * (started ? 1 : 0)}>
            <path
              d={pathOf(s.data, sc)}
              fill="none"
              stroke={color}
              strokeWidth={s.strokeWidth ?? 5}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={s.dashed ? '2 12' : undefined}
              clipPath={`url(#${uid}-clip-${s.id})`}
            />
            {drawing && s.tipDot !== false && <circle cx={tip[0]} cy={tip[1]} r={(s.strokeWidth ?? 5) * 1.6} fill={color} />}
            {s.label && (
              <text
                x={sc.x(last.year) + 16 + (s.label.dx ?? 0)}
                y={sc.y(last.value) + 8 + (s.label.dy ?? 0)}
                fill={color}
                opacity={labelOpacity}
                fontFamily={FONTS.body}
                fontWeight={600}
                fontSize={s.label.size ?? 28}
              >
                {s.label.text}
              </text>
            )}
          </g>
        );
      })}

      {/* markers */}
      {markers.map((mk, i) => {
        if (frame < mk.at) return null;
        const [px, py] = sc.point(mk.seriesId, mk.year);
        const color = mk.color ?? COLORS.red;
        const pop = spring({ frame: frame - mk.at, fps, config: SPRINGS.snappy });
        const cycle = ((frame - mk.at) % 36) / 36;
        const flash = mk.flash ? interpolate(frame - mk.at, [0, 16], [1, 0], { extrapolateRight: 'clamp' }) : 0;
        return (
          <g key={i}>
            {mk.pulse && <circle cx={px} cy={py} r={10 + cycle * 34} fill="none" stroke={color} strokeWidth={3} opacity={(1 - cycle) * 0.7} />}
            {flash > 0 && <circle cx={px} cy={py} r={20 + (1 - flash) * 90} fill={color} opacity={flash * 0.35} />}
            <circle cx={px} cy={py} r={11 * pop} fill={color} stroke="#FBFAF6" strokeWidth={3} />
          </g>
        );
      })}

      {/* milestone flags */}
      {milestones.map((ms, i) => {
        if (frame < ms.at) return null;
        const [px, py] = sc.point(ms.seriesId, ms.year);
        const up = (ms.side ?? 'above') === 'above';
        const len = (ms.length ?? 90) * spring({ frame: frame - ms.at, fps, config: SPRINGS.snappy });
        const flagS = spring({ frame: frame - ms.at - 6, fps, config: SPRINGS.cutout });
        const ty = up ? py - len : py + len;
        let text = ms.label;
        if (ms.count) {
          const v = interpolate(frame, [ms.at + 4, ms.at + 4 + (ms.count.duration ?? 24)], [ms.count.from ?? 0, ms.count.to], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });
          text = `${ms.count.prefix ?? ''}${formatNumber(v, { decimals: ms.count.decimals ?? 0 })}${ms.count.suffix ?? ''}`;
        }
        const fw = Math.max(ms.label.length, text.length) * 13 + 30;
        return (
          <g key={i}>
            <line x1={px} y1={py} x2={px} y2={ty} stroke={COLORS.ink} strokeWidth={2.5} />
            <circle cx={px} cy={py} r={6} fill={COLORS.ink} />
            <g transform={`translate(${px} ${up ? ty : ty - 40}) scale(${flagS}) rotate(${jitter(`flag-${i}`, 2)})`}>
              <rect x={0} y={0} width={fw} height={40} fill="#FBFAF6" stroke={COLORS.ink} strokeWidth={2} />
              <text x={15} y={27} fontFamily={FONTS.mono} fontWeight={500} fontSize={21} fill={COLORS.ink}>
                {text}
              </text>
            </g>
          </g>
        );
      })}

      {props.yearTicker && (() => {
        const s = series.find((q) => q.id === props.yearTicker!.seriesId)!;
        const year = Math.floor(revealX(s, frame));
        const span = drawSpan(s);
        const started = !span || frame >= span[0];
        return (
          <text
            x={props.yearTicker.x}
            y={props.yearTicker.y}
            textAnchor="end"
            fontFamily={FONTS.mono}
            fontWeight={500}
            fontSize={props.yearTicker.fontSize ?? 64}
            fill={c.fg}
            opacity={started ? 0.85 : 0}
          >
            {year}
          </text>
        );
      })()}

      {props.overlay?.(sc)}
    </svg>
  );
};
