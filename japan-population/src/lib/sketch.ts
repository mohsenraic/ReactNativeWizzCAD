/**
 * sketch.ts — deterministic "hand-drawn" SVG path generators.
 *
 * Everything is seeded through Remotion's random() so a frame always renders identically
 * (required for multi-process rendering). Paths are meant to be drawn on with
 * pathLength={1} + strokeDashoffset (see <HandDrawnAnnotation>).
 */
import { random } from 'remotion';

export type Pt = [number, number];

/** Smooth, low-frequency noise in [-1, 1] built from three seeded sines. */
export const smoothNoise = (seed: string | number) => {
  const p1 = random(`${seed}-p1`) * Math.PI * 2;
  const p2 = random(`${seed}-p2`) * Math.PI * 2;
  const p3 = random(`${seed}-p3`) * Math.PI * 2;
  return (t: number) =>
    (Math.sin(t * 2 + p1) * 0.5 + Math.sin(t * 5.3 + p2) * 0.3 + Math.sin(t * 11.7 + p3) * 0.2);
};

/** Catmull-Rom spline through points → cubic Bézier path string. */
export const catmullRom = (pts: Pt[], closed = false, tension = 0.5): string => {
  if (pts.length < 2) return '';
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const [x2, y2] = p[i + 1];
    const [x3, y3] = p[i + 2];
    const c1x = x1 + ((x2 - x0) * tension) / 3;
    const c1y = y1 + ((y2 - y0) * tension) / 3;
    const c2x = x2 - ((x3 - x1) * tension) / 3;
    const c2y = y2 - ((y3 - y1) * tension) / 3;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
  return d;
};

/**
 * Loose hand-drawn ellipse that overshoots its start (like a pen circle).
 * @param overshoot extra turn fraction past 360° (0.12 ≈ 43°)
 * @param wobble radial jitter as a fraction of the radius
 */
export const sketchEllipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: string | number,
  { overshoot = 0.14, wobble = 0.05, tilt = -0.08 }: { overshoot?: number; wobble?: number; tilt?: number } = {},
): string => {
  const noise = smoothNoise(seed);
  const start = -Math.PI / 2 - 0.6 + random(`${seed}-start`) * 0.4;
  const steps = 56;
  const total = Math.PI * 2 * (1 + overshoot);
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + total * t;
    // Spiral slightly outward so the overshoot doesn't sit on the first stroke.
    const grow = 1 + 0.06 * t;
    const r = 1 + noise(t * 3) * wobble;
    const x = Math.cos(a) * rx * r * grow;
    const y = Math.sin(a) * ry * r * grow;
    pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
  }
  return catmullRom(pts);
};

/** Wobbly line through the given points (perpendicular jitter of `amp` px). */
export const sketchLine = (points: Pt[], seed: string | number, amp = 2.5, stepsPerSegment = 8): string => {
  const noise = smoothNoise(seed);
  const pts: Pt[] = [];
  let s = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    for (let k = 0; k < stepsPerSegment; k++) {
      const t = k / stepsPerSegment;
      const off = noise(s) * amp * Math.sin(Math.PI * Math.min(1, (i + t) / Math.max(1, points.length - 1) * 4));
      pts.push([ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off]);
      s += 0.15;
    }
  }
  pts.push(points[points.length - 1]);
  return catmullRom(pts);
};

/** Point and tangent on a quadratic Bézier. */
const quad = (a: Pt, c: Pt, b: Pt, t: number): { p: Pt; tan: Pt } => {
  const mt = 1 - t;
  return {
    p: [mt * mt * a[0] + 2 * mt * t * c[0] + t * t * b[0], mt * mt * a[1] + 2 * mt * t * c[1] + t * t * b[1]],
    tan: [2 * mt * (c[0] - a[0]) + 2 * t * (b[0] - c[0]), 2 * mt * (c[1] - a[1]) + 2 * t * (b[1] - c[1])],
  };
};

/**
 * Curved hand-drawn arrow. Returns separate shaft and head paths so the head can be drawn
 * after the shaft finishes.
 * @param bend sideways offset of the curve's control point, as a fraction of the length
 */
export const sketchArrow = (
  from: Pt,
  to: Pt,
  seed: string | number,
  { bend = 0.18, headSize = 22 }: { bend?: number; headSize?: number } = {},
): { shaft: string; head: string } => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const ctrl: Pt = [from[0] + dx / 2 - (dy / len) * len * bend, from[1] + dy / 2 + (dx / len) * len * bend];
  const pts: Pt[] = [];
  const noise = smoothNoise(seed);
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const { p, tan } = quad(from, ctrl, to, t);
    const tl = Math.hypot(tan[0], tan[1]) || 1;
    const off = noise(t * 4) * 1.6 * Math.sin(Math.PI * t);
    pts.push([p[0] - (tan[1] / tl) * off, p[1] + (tan[0] / tl) * off]);
  }
  const { tan } = quad(from, ctrl, to, 1);
  const ang = Math.atan2(tan[1], tan[0]);
  const spread = 0.5 + random(`${seed}-head`) * 0.12;
  const l: Pt = [to[0] - Math.cos(ang - spread) * headSize, to[1] - Math.sin(ang - spread) * headSize];
  const r: Pt = [to[0] - Math.cos(ang + spread) * headSize, to[1] - Math.sin(ang + spread) * headSize];
  return {
    shaft: catmullRom(pts),
    head: `M ${l[0].toFixed(1)} ${l[1].toFixed(1)} L ${to[0].toFixed(1)} ${to[1].toFixed(1)} L ${r[0].toFixed(1)} ${r[1].toFixed(1)}`,
  };
};

/** Two-stroke hand-drawn "X" centred on (cx, cy). */
export const sketchX = (cx: number, cy: number, size: number, seed: string | number): [string, string] => {
  const h = size / 2;
  const j = (k: string) => (random(`${seed}-${k}`) - 0.5) * size * 0.12;
  return [
    sketchLine([[cx - h + j('a'), cy - h + j('b')], [cx + h + j('c'), cy + h + j('d')]], `${seed}-1`, 1.5, 6),
    sketchLine([[cx + h + j('e'), cy - h + j('f')], [cx - h + j('g'), cy + h + j('h')]], `${seed}-2`, 1.5, 6),
  ];
};

/**
 * Vertical curly brace from y1 to y2 at x, pointing `left` or `right` (the side the tip points to).
 */
export const sketchBrace = (x: number, y1: number, y2: number, dir: 'left' | 'right', depth = 28): string => {
  const s = dir === 'right' ? 1 : -1;
  const m = (y1 + y2) / 2;
  const q = depth * s;
  return [
    `M ${x} ${y1}`,
    `C ${x + q * 0.6} ${y1} ${x + q * 0.5} ${y1 + 12} ${x + q * 0.5} ${y1 + 30}`,
    `L ${x + q * 0.5} ${m - 24}`,
    `C ${x + q * 0.5} ${m - 8} ${x + q * 0.7} ${m} ${x + q} ${m}`,
    `C ${x + q * 0.7} ${m} ${x + q * 0.5} ${m + 8} ${x + q * 0.5} ${m + 24}`,
    `L ${x + q * 0.5} ${y2 - 30}`,
    `C ${x + q * 0.5} ${y2 - 12} ${x + q * 0.6} ${y2} ${x} ${y2}`,
  ].join(' ');
};

/** Jagged polygon for torn-paper edges. Returns a CSS clip-path polygon(). */
export const tornClipPath = (
  seed: string | number,
  { edges = ['top', 'bottom'], depth = 1.6, teeth = 28 }: { edges?: Array<'top' | 'bottom' | 'left' | 'right'>; depth?: number; teeth?: number } = {},
): string => {
  const pts: string[] = [];
  const j = (k: string | number) => (random(`${seed}-${k}`) * depth).toFixed(2);
  // top edge (left → right)
  for (let i = 0; i <= teeth; i++) pts.push(`${((i / teeth) * 100).toFixed(2)}% ${edges.includes('top') ? j(`t${i}`) : 0}%`);
  // right edge
  for (let i = 1; i < teeth / 2; i++)
    pts.push(`${edges.includes('right') ? 100 - Number(j(`r${i}`)) : 100}% ${((i / (teeth / 2)) * 100).toFixed(2)}%`);
  // bottom edge (right → left)
  for (let i = teeth; i >= 0; i--)
    pts.push(`${((i / teeth) * 100).toFixed(2)}% ${edges.includes('bottom') ? 100 - Number(j(`b${i}`)) : 100}%`);
  // left edge
  for (let i = Math.floor(teeth / 2) - 1; i > 0; i--)
    pts.push(`${edges.includes('left') ? j(`l${i}`) : 0}% ${((i / (teeth / 2)) * 100).toFixed(2)}%`);
  return `polygon(${pts.join(', ')})`;
};

/** Seeded value in [-range, range]. */
export const jitter = (seed: string | number, range: number) => (random(seed) * 2 - 1) * range;
