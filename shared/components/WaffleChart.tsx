/**
 * <WaffleChart> — 10 × 10 grid, one square per 1 %. Squares fill category by category (a quick ripple),
 * each category labelled directly beside its block (no legend). The remainder can glow later
 * ("the rest come from much further away").
 *
 * @example
 * <WaffleChart at={10} style={{ left: 260, top: 180 }}
 *   categories={[
 *     { id: 'kg', label: 'KYRGYZSTAN', squares: 28, color: '#1F8A9E' },
 *     { id: 'tj', label: 'TAJIKISTAN', squares: 23, color: '#26619C' },
 *     { id: 'kz', label: 'KAZAKHSTAN', squares: 23, color: '#B5523B' },
 *   ]}
 *   rest={{ label: 'EVERYONE ELSE', glowAt: 140, glowColor: '#D9A441' }} />
 */
import React from 'react';
import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRINGS, Tone, useTheme } from '../theme';

export interface WaffleCategory {
  id: string;
  label: string;
  squares: number;
  color: string;
  /** Frame this category starts filling (default: right after the previous one). */
  at?: number;
}

export const WaffleChart: React.FC<{
  categories: WaffleCategory[];
  /** Total squares (default 100 = 10 × 10). */
  total?: number;
  columns?: number;
  cell?: number;
  gap?: number;
  at?: number;
  /** Frames between squares inside a category. */
  perSquare?: number;
  /** Pause between categories, frames. */
  categoryGap?: number;
  rest?: { label?: string; glowAt?: number; glowColor?: string };
  /** Label column to the right of the grid. */
  labels?: boolean;
  /** Show "{n}%" next to each label (counts up). */
  percent?: boolean;
  tone?: Tone;
  style?: React.CSSProperties;
}> = ({
  categories,
  total = 100,
  columns = 10,
  cell = 56,
  gap = 8,
  at = 0,
  perSquare = 0.6,
  categoryGap = 12,
  rest,
  labels = true,
  percent = true,
  tone = 'light',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = useTheme();
  const tc = th.tones[tone];
  const F = th.fonts;
  const empty = tone === 'dark' ? 'rgba(242,238,230,0.14)' : 'rgba(26,26,26,0.10)';

  // Fill order: bottom-left → right, row by row upwards (reads like a rising level).
  const pos = (n: number) => {
    const row = Math.floor(n / columns);
    const col = n % columns;
    const rows = Math.ceil(total / columns);
    return { x: col * (cell + gap), y: (rows - 1 - row) * (cell + gap) };
  };

  const starts: number[] = [];
  let cursor = at;
  let index = 0;
  const ranges = categories.map((c) => {
    const start = c.at ?? cursor;
    starts.push(start);
    cursor = start + c.squares * perSquare + categoryGap;
    const r = { from: index, to: index + c.squares, start };
    index += c.squares;
    return r;
  });
  const filled = index;
  const gridW = columns * (cell + gap) - gap;
  const gridH = Math.ceil(total / columns) * (cell + gap) - gap;

  const squares = Array.from({ length: total }, (_, n) => {
    const { x, y } = pos(n);
    const ci = ranges.findIndex((r) => n >= r.from && n < r.to);
    let fill = empty;
    let scale = 1;
    if (ci >= 0) {
      const sAt = ranges[ci].start + (n - ranges[ci].from) * perSquare;
      const s = spring({ frame: frame - sAt, fps, config: SPRINGS.cutout });
      fill = s > 0.01 ? categories[ci].color : empty;
      scale = 0.4 + 0.6 * Math.min(1.08, s);
      if (s <= 0.01) scale = 1;
    } else if (rest?.glowAt !== undefined) {
      const g = interpolate(frame, [rest.glowAt + (n - filled) * 0.5, rest.glowAt + (n - filled) * 0.5 + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      fill = interpolateColors(g, [0, 1], [empty, rest.glowColor ?? th.colors.highlighter]);
    }
    return <rect key={n} x={x + (cell * (1 - scale)) / 2} y={y + (cell * (1 - scale)) / 2} width={cell * scale} height={cell * scale} rx={4} fill={fill} />;
  });

  const glowO = rest?.glowAt !== undefined ? interpolate(frame, [rest.glowAt + 10, rest.glowAt + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;

  return (
    <div style={{ position: 'absolute', ...style }}>
      <svg width={gridW} height={gridH} style={{ display: 'block', overflow: 'visible' }}>
        {squares}
        {rest?.glowAt !== undefined && glowO > 0 && (
          <rect x={-10} y={-10} width={gridW + 20} height={gridH + 20} rx={10} fill="none" stroke={rest.glowColor ?? th.colors.highlighter} strokeWidth={4} opacity={glowO * 0.6} />
        )}
      </svg>
      {labels &&
        categories.map((c, i) => {
          const r = ranges[i];
          const midRow = Math.floor((r.from + r.to - 1) / 2 / columns);
          const y = pos(midRow * columns).y + cell / 2;
          const o = interpolate(frame, [starts[i] + 6, starts[i] + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const pct = Math.round(interpolate(frame, [starts[i], starts[i] + c.squares * perSquare + 6], [0, (c.squares / total) * 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
          return (
            <div key={c.id} style={{ position: 'absolute', left: gridW + 40, top: y - 28, opacity: o, display: 'flex', alignItems: 'baseline', gap: 16, whiteSpace: 'nowrap' }}>
              <span style={{ width: 18, height: 18, background: c.color, display: 'inline-block', borderRadius: 3 }} />
              <span style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 46, color: tc.fg, letterSpacing: 1 }}>{c.label}</span>
              {percent && <span style={{ fontFamily: F.mono, fontSize: 30, color: tc.muted }}>{pct}%</span>}
            </div>
          );
        })}
      {labels && rest?.label && glowO > 0 && (
        <div style={{ position: 'absolute', left: gridW + 40, top: 0, opacity: glowO, fontFamily: F.headline, fontWeight: 700, fontSize: 46, color: rest.glowColor ?? th.colors.highlighter, whiteSpace: 'nowrap' }}>
          {rest.label}
        </div>
      )}
    </div>
  );
};
