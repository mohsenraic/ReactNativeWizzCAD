/**
 * <HandDrawnAnnotation> — pen-drawn circle / underline / arrow / X / brace that draws on with
 * stroke-dashoffset, plus an optional Caveat label that fades in once the stroke lands.
 *
 * Coordinates are in the SVG's own space (default 1920×1080 = the frame), so annotations can be
 * placed with the same numbers the scene uses for layout or chart geometry.
 *
 * @example
 * <HandDrawnAnnotation shape={{ type: 'circle', cx: 820, cy: 300, rx: 120, ry: 60 }} at={20}
 *   label={{ text: 'peak: ~128M', x: 960, y: 220 }} />
 * <HandDrawnAnnotation shape={{ type: 'arrow', from: [400, 700], to: [620, 560] }} at={40} color="ink" />
 * <HandDrawnAnnotation shape={{ type: 'brace', x: 1400, y1: 200, y2: 520, dir: 'right' }} at={60}
 *   label={{ text: '~39%', x: 1460, y: 370, size: 64 }} />
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../theme';
import { Pt, sketchArrow, sketchBrace, sketchEllipse, sketchLine, sketchX } from '../lib/sketch';

export type AnnotationShape =
  | { type: 'circle'; cx: number; cy: number; rx: number; ry: number }
  | { type: 'underline'; x: number; y: number; width: number }
  | { type: 'arrow'; from: Pt; to: Pt; bend?: number; headSize?: number }
  | { type: 'x'; cx: number; cy: number; size: number }
  | { type: 'brace'; x: number; y1: number; y2: number; dir: 'left' | 'right'; depth?: number };

export interface AnnotationLabel {
  text: string;
  x: number;
  y: number;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
  rotate?: number;
}

const COLOR_MAP: Record<string, string> = { red: COLORS.red, ink: COLORS.ink, white: '#F2EEE6' };

export const HandDrawnAnnotation: React.FC<{
  shape: AnnotationShape;
  /** Frame the stroke starts drawing. */
  at?: number;
  /** Draw duration in frames. */
  duration?: number;
  color?: 'red' | 'ink' | 'white' | string;
  strokeWidth?: number;
  seed?: string;
  label?: AnnotationLabel;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}> = ({ shape, at = 0, duration = 18, color = 'red', strokeWidth = 5, seed = 'ann', label, width = 1920, height = 1080, style }) => {
  const frame = useCurrentFrame();
  const stroke = COLOR_MAP[color] ?? color;
  const prog = (from: number, len: number) =>
    interpolate(frame, [from, from + len], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });

  const paths: Array<{ d: string; p: number }> = [];
  switch (shape.type) {
    case 'circle':
      paths.push({ d: sketchEllipse(shape.cx, shape.cy, shape.rx, shape.ry, seed), p: prog(at, duration) });
      break;
    case 'underline': {
      const { x, y, width: w } = shape;
      paths.push({ d: sketchLine([[x, y], [x + w * 0.55, y + 2], [x + w, y - 3]], seed, 2), p: prog(at, duration) });
      break;
    }
    case 'arrow': {
      const a = sketchArrow(shape.from, shape.to, seed, { bend: shape.bend, headSize: shape.headSize });
      const shaftLen = Math.round(duration * 0.75);
      paths.push({ d: a.shaft, p: prog(at, shaftLen) });
      paths.push({ d: a.head, p: prog(at + shaftLen, duration - shaftLen + 2) });
      break;
    }
    case 'x': {
      const [a, b] = sketchX(shape.cx, shape.cy, shape.size, seed);
      const half = Math.round(duration / 2);
      paths.push({ d: a, p: prog(at, half) });
      paths.push({ d: b, p: prog(at + half + 2, half) });
      break;
    }
    case 'brace':
      paths.push({ d: sketchBrace(shape.x, shape.y1, shape.y2, shape.dir, shape.depth), p: prog(at, duration) });
      break;
  }

  const labelOpacity = interpolate(frame, [at + duration - 4, at + duration + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const labelLift = interpolate(labelOpacity, [0, 1], [8, 0]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', ...style }}
    >
      {paths.map(({ d, p }, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - p}
          opacity={p > 0 ? 1 : 0}
        />
      ))}
      {label && (
        <text
          x={label.x}
          y={label.y + labelLift}
          fill={stroke}
          opacity={labelOpacity}
          fontFamily={FONTS.hand}
          fontWeight={700}
          fontSize={label.size ?? 48}
          textAnchor={label.anchor ?? 'middle'}
          transform={label.rotate ? `rotate(${label.rotate} ${label.x} ${label.y})` : undefined}
        >
          {label.text}
        </text>
      )}
    </svg>
  );
};
