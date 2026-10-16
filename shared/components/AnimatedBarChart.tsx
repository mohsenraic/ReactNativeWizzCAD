/**
 * <AnimatedBarChart> — vertical bars in the editorial style: thin gridlines, bars that grow with a spring,
 * count-up value labels written directly on the bars (no legend), one highlighted bar, others dimmed on cue,
 * and projection bars (dashed outline + hatch) for targets.
 *
 * Bar geometry is exported (`barChartScales`) so scenes can place <HandDrawnAnnotation>s on a bar.
 *
 * @example
 * <AnimatedBarChart width={1500} height={760} style={{ left: 210, top: 150 }}
 *   bars={arrivalsSeries.data.map((d) => ({ label: String(d.year), value: d.value }))}
 *   yMax={12} yTicks={[4, 8, 12]} yTickFormat={(v) => `${v}M`}
 *   grow={{ at: 0, stagger: 3, duration: 18 }}
 *   valueLabels="last" valueFormat={{ decimals: 1, suffix: 'M' }}
 *   highlight={{ index: 15, at: 90, dimOthers: true }} />
 * // a dotted target bar appearing later:
 * bars={[…, { label: '2030', value: 20, kind: 'projection', at: 200 }]}
 */
import React, { useId } from 'react';
import { Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRINGS, Tone, useTheme } from '../theme';
import { formatNumber } from '../lib/format';
import { Highlighter } from './Highlighter';

export interface Bar {
  label: string;
  value: number;
  color?: string;
  /** 'projection' = dashed outline + light hatch (targets, forecasts). */
  kind?: 'actual' | 'projection';
  /** Grow start for this bar (overrides grow.at + i × stagger). */
  at?: number;
}

export interface BarChartScales {
  plot: { left: number; top: number; right: number; bottom: number };
  /** Bar index → { x (left), w, top (at full height), cx }. */
  bar: (i: number) => { x: number; w: number; top: number; cx: number };
  y: (v: number) => number;
}

export interface BarChartProps {
  width: number;
  height: number;
  bars: Bar[];
  yMax: number;
  yTicks?: number[];
  yTickFormat?: (v: number) => string;
  margin?: { top: number; right: number; bottom: number; left: number };
  /** 0–1 share of the slot each bar fills. */
  barWidth?: number;
  grow?: { at: number; stagger?: number; duration?: number };
  /** Which bars get a count-up value label: all, none, the last, or a list of indices. */
  valueLabels?: 'all' | 'none' | 'last' | number[];
  valueFormat?: { decimals?: number; prefix?: string; suffix?: string };
  /** Show only every n-th x label (e.g. 5 → 2010, 2015, 2020…); the highlighted / last bar is always labelled. */
  labelEvery?: number;
  highlight?: { index: number; at: number; color?: string; dimOthers?: boolean; marker?: boolean };
  axesAt?: number;
  tone?: Tone;
  color?: string;
  style?: React.CSSProperties;
  /** Drawn above the chart with its scales (annotations in chart coordinates). */
  overlay?: (s: BarChartScales) => React.ReactNode;
}

export const barChartScales = (p: Pick<BarChartProps, 'width' | 'height' | 'bars' | 'yMax' | 'margin' | 'barWidth'>): BarChartScales => {
  const m = p.margin ?? { top: 70, right: 30, bottom: 70, left: 90 };
  const plot = { left: m.left, top: m.top, right: p.width - m.right, bottom: p.height - m.bottom };
  const slot = (plot.right - plot.left) / p.bars.length;
  const w = slot * (p.barWidth ?? 0.72);
  const y = (v: number) => plot.bottom - (v / p.yMax) * (plot.bottom - plot.top);
  return {
    plot,
    y,
    bar: (i) => {
      const x = plot.left + slot * i + (slot - w) / 2;
      return { x, w, top: y(p.bars[i].value), cx: x + w / 2 };
    },
  };
};

export const AnimatedBarChart: React.FC<BarChartProps> = (props) => {
  const {
    width,
    height,
    bars,
    yTicks = [],
    yTickFormat = (v) => String(v),
    grow = { at: 0 },
    valueLabels = 'last',
    valueFormat = {},
    labelEvery = 1,
    highlight,
    axesAt = 0,
    tone = 'light',
    color,
    style,
    overlay,
  } = props;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = useTheme();
  const tc = th.tones[tone];
  const C = th.colors;
  const F = th.fonts;
  const sc = barChartScales(props);
  const hatchId = `bar-hatch-${useId().replace(/:/g, '')}`;
  const base = color ?? (tone === 'dark' ? tc.fg : C.secondary);
  const hlColor = highlight?.color ?? C.accent;
  const axesO = interpolate(frame, [axesAt, axesAt + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hlP = highlight ? interpolate(frame, [highlight.at, highlight.at + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const showValue = (i: number) =>
    valueLabels === 'all' || (valueLabels === 'last' && i === bars.length - 1) || (Array.isArray(valueLabels) && valueLabels.includes(i)) || highlight?.index === i;

  return (
    <div style={{ position: 'absolute', width, height, ...style }}>
      <svg width={width} height={height} style={{ position: 'absolute', overflow: 'visible' }}>
        <defs>
          <pattern id={hatchId} width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={12} stroke={base} strokeWidth={3} opacity={0.35} />
          </pattern>
        </defs>
        <g opacity={axesO}>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={sc.plot.left} x2={sc.plot.right} y1={sc.y(v)} y2={sc.y(v)} stroke={tc.grid} strokeWidth={2} />
              <text x={sc.plot.left - 16} y={sc.y(v) + 8} textAnchor="end" fontFamily={F.mono} fontSize={24} fill={tc.muted}>
                {yTickFormat(v)}
              </text>
            </g>
          ))}
          <line x1={sc.plot.left} x2={sc.plot.right} y1={sc.plot.bottom} y2={sc.plot.bottom} stroke={tc.fg} strokeWidth={3} />
        </g>
        {bars.map((b, i) => {
          const at = b.at ?? grow.at + i * (grow.stagger ?? 3);
          const g = spring({ frame: frame - at, fps, config: SPRINGS.snappy, durationInFrames: grow.duration ?? 20 });
          const { x, w } = sc.bar(i);
          const top = sc.y(b.value * g);
          const isHl = highlight?.index === i;
          const own = b.color ?? base;
          const fill = isHl ? interpolateColors(hlP, [0, 1], [own, hlColor]) : own;
          const dim = highlight?.dimOthers && !isHl ? 1 - 0.6 * hlP : 1;
          const projection = b.kind === 'projection';
          return (
            <g key={i} opacity={(frame >= at ? 1 : 0) * dim}>
              {projection ? (
                <>
                  <rect x={x} y={top} width={w} height={sc.plot.bottom - top} fill={`url(#${hatchId})`} />
                  <rect x={x} y={top} width={w} height={sc.plot.bottom - top} fill="none" stroke={fill} strokeWidth={4} strokeDasharray="12 9" />
                </>
              ) : (
                <rect x={x} y={top} width={w} height={sc.plot.bottom - top} fill={fill} />
              )}
            </g>
          );
        })}
        {bars.map((b, i) => {
          const always = i === bars.length - 1 || highlight?.index === i;
          if (!always && i % labelEvery !== 0) return null;
          const { cx } = sc.bar(i);
          const at = b.at ?? grow.at + i * (grow.stagger ?? 3);
          const o = interpolate(frame, [at, at + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <text key={`l${i}`} x={cx} y={sc.plot.bottom + 40} textAnchor="middle" fontFamily={F.mono} fontSize={24} fill={tc.muted} opacity={o * axesO}>
              {b.label}
            </text>
          );
        })}
      </svg>
      {/* count-up value labels (HTML so the highlighted one can take a marker sweep) */}
      {bars.map((b, i) => {
        if (!showValue(i)) return null;
        const at = b.at ?? grow.at + i * (grow.stagger ?? 3);
        const dur = (grow.duration ?? 20) + 10;
        const v = interpolate(frame, [at, at + dur], [0, b.value], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
        const g = spring({ frame: frame - at, fps, config: SPRINGS.snappy, durationInFrames: grow.duration ?? 20 });
        const { cx } = sc.bar(i);
        const top = sc.y(b.value * g);
        const isHl = highlight?.index === i;
        const text = `${valueFormat.prefix ?? ''}${formatNumber(v, { decimals: valueFormat.decimals ?? 0 })}${valueFormat.suffix ?? ''}`;
        const label = (
          <span style={{ fontFamily: F.headline, fontWeight: 700, fontSize: isHl ? 64 : 40, color: isHl ? C.ink : tc.fg }}>{text}</span>
        );
        return (
          <div
            key={`v${i}`}
            style={{ position: 'absolute', left: cx, top: top - (isHl ? 82 : 56), transform: 'translateX(-50%)', opacity: frame >= at ? 1 : 0, whiteSpace: 'nowrap' }}
          >
            {isHl && highlight?.marker !== false && tone === 'light' ? <Highlighter at={highlight!.at + 6}>{label}</Highlighter> : label}
          </div>
        );
      })}
      {overlay?.(sc)}
    </div>
  );
};
