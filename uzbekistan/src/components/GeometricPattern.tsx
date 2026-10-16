/**
 * <GeometricPattern> — original, procedurally generated Islamic-style tile patterns (8- and 12-point stars,
 * girih-like lattices), built with Hankin's "polygons in contact" method:
 *   1. tile the plane with regular polygons (4.8.8 octagons + squares, 6.6.6 hexagons, 3.12.12 dodecagons + triangles);
 *   2. from the midpoint of every edge, cast two rays into the polygon at the contact angle θ;
 *   3. stop each ray where it meets the ray from the neighbouring edge → every polygon gets a star motif.
 * Nothing is copied from an existing pattern; change θ and the tiling to get new ones.
 *
 * Three ways to use it:
 *   <GeometricPattern … draw={{ at, duration }} />   lines draw themselves outward from `origin` (signature move)
 *   <GeometricPattern … fill={{ at, mode: 'in' }} />  the tiles fill with colour, staggered (mosaic)
 *   <PatternWipe phase="cover" | "reveal" />          scene transition: pattern draws + tiles fill to cover the frame,
 *                                                     then the next scene opens by shrinking the tiles away
 *
 * @example
 * <GeometricPattern tiling="4.8.8" size={110} origin={[960, 540]} draw={{ at: 0, duration: 50 }} stroke="#D9A441" />
 * // last 18 frames of scene A:          first 18 frames of scene B:
 * <PatternWipe phase="cover" at={d - 18} />   <PatternWipe phase="reveal" at={0} />
 */
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { Sfx } from '../../../shared/lib/sfx';
import { PALETTE, TILE_COLORS } from '../theme';

export type Tiling = '4.8.8' | '6.6.6' | '3.12.12';
type Pt = [number, number];

interface Poly {
  /** Vertices, any winding. */
  v: Pt[];
  c: Pt;
  /** Polygon kind: index of the shape in the tiling (0 = main star cell, 1 = filler). */
  kind: 0 | 1;
}

/** Default contact angles that give the classic look for each tiling. */
const DEFAULT_THETA: Record<Tiling, number> = { '4.8.8': 67.5, '6.6.6': 60, '3.12.12': 72 };

const regular = (c: Pt, n: number, R: number, rot: number): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = rot + (i * 2 * Math.PI) / n;
    return [c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)];
  });

/** Polygons of a tiling covering [x0, x1] × [y0, y1]. `a` = edge length. */
export const tilingPolygons = (tiling: Tiling, a: number, x0: number, y0: number, x1: number, y1: number): Poly[] => {
  const out: Poly[] = [];
  if (tiling === '4.8.8') {
    const w = a * (1 + Math.SQRT2); // octagon width = lattice pitch
    const Ro = a / (2 * Math.sin(Math.PI / 8));
    for (let gx = Math.floor(x0 / w) - 1; gx <= Math.ceil(x1 / w) + 1; gx++)
      for (let gy = Math.floor(y0 / w) - 1; gy <= Math.ceil(y1 / w) + 1; gy++) {
        const c: Pt = [gx * w, gy * w];
        out.push({ v: regular(c, 8, Ro, Math.PI / 8), c, kind: 0 });
        const sc: Pt = [c[0] + w / 2, c[1] + w / 2];
        out.push({ v: regular(sc, 4, a / Math.SQRT2, 0), c: sc, kind: 1 });
      }
  } else if (tiling === '6.6.6') {
    const dx = Math.sqrt(3) * a;
    const dy = 1.5 * a;
    for (let r = Math.floor(y0 / dy) - 1; r <= Math.ceil(y1 / dy) + 1; r++)
      for (let q = Math.floor(x0 / dx) - 2; q <= Math.ceil(x1 / dx) + 1; q++) {
        const c: Pt = [q * dx + (r & 1 ? dx / 2 : 0), r * dy];
        out.push({ v: regular(c, 6, a, Math.PI / 6), c, kind: 0 });
      }
  } else {
    // 3.12.12: dodecagons on a triangular lattice, equilateral triangles in the gaps.
    const Rd = a / (2 * Math.sin(Math.PI / 12));
    const ap = a / (2 * Math.tan(Math.PI / 12));
    const pitch = 2 * ap;
    const dy = (pitch * Math.sqrt(3)) / 2;
    const center = (q: number, r: number): Pt => [q * pitch + (r & 1 ? pitch / 2 : 0), r * dy];
    for (let r = Math.floor(y0 / dy) - 1; r <= Math.ceil(y1 / dy) + 1; r++)
      for (let q = Math.floor(x0 / pitch) - 2; q <= Math.ceil(x1 / pitch) + 1; q++) {
        const c = center(q, r);
        out.push({ v: regular(c, 12, Rd, Math.PI / 12), c, kind: 0 });
        // two gap triangles per lattice cell: (c, right, down-right) and (c, down-left, down)
        const right = center(q + 1, r);
        const downs = r & 1 ? [center(q, r + 1), center(q + 1, r + 1)] : [center(q - 1, r + 1), center(q, r + 1)];
        for (const tri of [
          [c, right, downs[1]],
          [c, downs[0], downs[1]],
        ] as Pt[][]) {
          const g: Pt = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3];
          const mids: Pt[] = [
            [(tri[0][0] + tri[1][0]) / 2, (tri[0][1] + tri[1][1]) / 2],
            [(tri[1][0] + tri[2][0]) / 2, (tri[1][1] + tri[2][1]) / 2],
            [(tri[2][0] + tri[0][0]) / 2, (tri[2][1] + tri[0][1]) / 2],
          ];
          const Rt = a / Math.sqrt(3);
          const v = mids.map((m): Pt => {
            const L = Math.hypot(m[0] - g[0], m[1] - g[1]);
            return [g[0] + ((m[0] - g[0]) / L) * Rt, g[1] + ((m[1] - g[1]) / L) * Rt];
          });
          out.push({ v, c: g, kind: 1 });
        }
      }
  }
  return out.filter((p) => p.c[0] > x0 - a * 4 && p.c[0] < x1 + a * 4 && p.c[1] > y0 - a * 4 && p.c[1] < y1 + a * 4);
};

const rot = (v: Pt, deg: number): Pt => {
  const r = (deg * Math.PI) / 180;
  return [v[0] * Math.cos(r) - v[1] * Math.sin(r), v[0] * Math.sin(r) + v[1] * Math.cos(r)];
};
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];
const norm = (v: Pt): Pt => {
  const L = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / L, v[1] / L];
};
/** Intersection of p + t·d and q + s·e. */
const intersect = (p: Pt, d: Pt, q: Pt, e: Pt): Pt | null => {
  const den = d[0] * e[1] - d[1] * e[0];
  if (Math.abs(den) < 1e-9) return null;
  const t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den;
  return [p[0] + d[0] * t, p[1] + d[1] * t];
};

/** Hankin motif for one polygon: a closed star path through edge midpoints and ray contacts. */
export const hankinPath = (poly: Poly, theta: number): string => {
  const { v, c } = poly;
  const n = v.length;
  const mids = v.map((p, i): Pt => [(p[0] + v[(i + 1) % n][0]) / 2, (p[1] + v[(i + 1) % n][1]) / 2]);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const e1 = norm(sub(v[j], v[i])); // edge i direction (towards shared vertex j)
    const e2 = norm(sub(v[(j + 1) % n], v[j])); // edge j direction
    const inward = (m: Pt, cand: Pt[]) => (dot(cand[0], sub(c, m)) > dot(cand[1], sub(c, m)) ? cand[0] : cand[1]);
    const dA = inward(mids[i], [rot(e1, theta), rot(e1, -theta)]);
    const minus2: Pt = [-e2[0], -e2[1]];
    const dB = inward(mids[j], [rot(minus2, theta), rot(minus2, -theta)]);
    const x = intersect(mids[i], dA, mids[j], dB) ?? v[j];
    pts.push(mids[i], x);
  }
  return 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z';
};

const polyPath = (v: Pt[]) => 'M' + v.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z';

export const GeometricPattern: React.FC<{
  tiling?: Tiling;
  /** Polygon edge length in px. */
  size?: number;
  /** Contact angle in degrees (changes the star shape). */
  theta?: number;
  width?: number;
  height?: number;
  /** Where the drawing / filling starts spreading from. */
  origin?: Pt;
  /** Line draw-on: every motif draws itself, delayed by its distance from `origin`. Omit = fully drawn. */
  draw?: { at: number; duration?: number; spread?: number };
  /** Tile colour fill: 'in' grows tiles from nothing, 'out' shrinks them away. Omit = no fill. */
  fill?: { at: number; duration?: number; spread?: number; mode: 'in' | 'out'; colors?: readonly string[]; overlap?: number };
  stroke?: string;
  strokeWidth?: number;
  /** Fill colour of the star motifs themselves (e.g. a subtle background). */
  motifFill?: string;
  opacity?: number;
  /** Rotate the whole pattern (deg). */
  rotation?: number;
  seed?: string;
  style?: React.CSSProperties;
}> = ({
  tiling = '4.8.8',
  size = 110,
  theta,
  width = 1920,
  height = 1080,
  origin = [width / 2, height / 2],
  draw,
  fill,
  stroke = PALETTE.saffron,
  strokeWidth = 4,
  motifFill = 'none',
  opacity = 1,
  rotation = 0,
  seed = 'pattern',
  style,
}) => {
  const frame = useCurrentFrame();
  const th = theta ?? DEFAULT_THETA[tiling];
  // generate in a square big enough to survive rotation
  const R = Math.hypot(width, height) / 2;
  const cx = width / 2;
  const cy = height / 2;
  const polys = React.useMemo(() => tilingPolygons(tiling, size, cx - R, cy - R, cx + R, cy + R), [tiling, size, cx, cy, R]);
  const motifs = React.useMemo(() => polys.map((p) => hankinPath(p, th)), [polys, th]);
  const maxDist = R * 1.2;
  const delay = (p: Poly, spread: number) => (Math.hypot(p.c[0] - origin[0], p.c[1] - origin[1]) / maxDist) * spread;

  return (
    <svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, opacity, ...style }}>
      <g transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}>
        {fill &&
          polys.map((p, i) => {
            const d0 = fill.at + delay(p, fill.spread ?? 14);
            const t = interpolate(frame, [d0, d0 + (fill.duration ?? 8)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            const s = (fill.mode === 'in' ? t : 1 - t) * (fill.overlap ?? 1.06);
            if (s <= 0.001) return null;
            const colors = fill.colors ?? TILE_COLORS;
            const color = colors[Math.floor(random(`${seed}-c${i}-${p.kind}`) * colors.length)];
            return (
              <path
                key={`f${i}`}
                d={polyPath(p.v)}
                fill={p.kind === 1 ? PALETTE.lapis : color}
                stroke={PALETTE.tileWhite}
                strokeWidth={2}
                transform={`translate(${p.c[0]} ${p.c[1]}) scale(${s}) translate(${-p.c[0]} ${-p.c[1]})`}
              />
            );
          })}
        {motifs.map((d, i) => {
          const p = polys[i];
          let prog = 1;
          if (draw) {
            const d0 = draw.at + delay(p, draw.spread ?? 30);
            prog = interpolate(frame, [d0, d0 + (draw.duration ?? 24)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
            if (prog <= 0) return null;
          }
          return (
            <path
              key={i}
              d={d}
              fill={motifFill === 'none' ? 'none' : motifFill}
              fillOpacity={draw ? prog : 1}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={prog < 1 ? '1 1' : undefined}
              strokeDashoffset={prog < 1 ? 1 - prog : undefined}
            />
          );
        })}
      </g>
    </svg>
  );
};

/**
 * Scene transition built from the pattern. `cover` (end of scene A): the pattern races out from `origin`
 * and the tiles fill until the frame is covered. `reveal` (start of scene B): starts covered, the tiles
 * shrink away from `origin`, revealing the scene. Both fit inside `frames` (default 18).
 */
export const PatternWipe: React.FC<{
  phase: 'cover' | 'reveal';
  at?: number;
  frames?: number;
  origin?: Pt;
  tiling?: Tiling;
  size?: number;
  colors?: readonly string[];
  stroke?: string;
  sound?: boolean;
  /** Frame size (default 1920 × 1080; pass 1080 × 1920 for vertical). */
  width?: number;
  height?: number;
}> = ({ phase, at = 0, frames = 18, origin = [960, 540], tiling = '4.8.8', size = 120, colors, stroke = PALETTE.tileWhite, sound = true, width = 1920, height = 1080 }) => {
  const frame = useCurrentFrame();
  if (frame < at - 1 || frame > at + frames + 1) return null;
  const spread = Math.round(frames * 0.55);
  const dur = frames - spread;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {sound && phase === 'cover' && <Sfx name="whooshSoft" at={at} volume={0.5} />}
      <GeometricPattern
        tiling={tiling}
        size={size}
        width={width}
        height={height}
        origin={origin}
        fill={{ at, duration: dur, spread, mode: phase === 'cover' ? 'in' : 'out', colors }}
        draw={phase === 'cover' ? { at: at - 2, duration: Math.max(4, dur - 2), spread } : undefined}
        stroke={phase === 'reveal' ? 'transparent' : stroke}
        strokeWidth={3}
        opacity={phase === 'reveal' ? interpolate(frame, [at + frames - 3, at + frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1}
        seed={`wipe-${tiling}`}
      />
    </AbsoluteFill>
  );
};
