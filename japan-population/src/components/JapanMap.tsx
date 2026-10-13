/**
 * <JapanMap> — flat, muted map of Japan's 47 prefectures (@svg-maps/japan, CC BY 4.0).
 * Per-prefecture fill animation, glow, smooth zooms (viewBox interpolation), Plex Mono labels,
 * pulsing dots, and "village" dots scattered inside a prefecture that disappear one by one.
 *
 * Prefecture ids are lowercase romaji: 'akita', 'tokyo', 'okinawa', …
 *
 * @example
 * <JapanMap
 *   width={1100} height={1080} style={{ left: 410, top: 0 }}
 *   fills={[{ id: 'akita', color: COLORS.grey, at: 90 }]}
 *   glow={[{ id: 'tokyo', at: 30 }]}
 *   zooms={[{ target: 'akita', at: 60, duration: 40, padding: 0.6 }]}
 *   villages={[{ id: 'akita', count: 60, at: 70, fadeFrom: 110, fadeDuration: 90 }]}
 *   labels={[{ id: 'akita', text: 'AKITA · −8.1%', at: 100 }]}
 * />
 */
import React, { useId } from 'react';
import japan from '@svg-maps/japan';
import { Easing, interpolate, interpolateColors, random, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../theme';

interface SvgMapLocation {
  id: string;
  name: string;
  path: string;
}
const MAP = japan as unknown as { viewBox: string; locations: SvgMapLocation[] };
const [VB_X, VB_Y, VB_W, VB_H] = MAP.viewBox.split(' ').map(Number);

type Poly = Array<[number, number]>;

/** Parse the map's path data (only relative `m` with implicit lineto, and `z`). */
const parsePath = (d: string): Poly[] => {
  const tokens = d.match(/[mzMZ]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const polys: Poly[] = [];
  let cur: Poly = [];
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let i = 0;
  let mode: 'm' | 'M' = 'm';
  let first = false;
  while (i < tokens.length) {
    const tk = tokens[i];
    if (tk === 'm' || tk === 'M') {
      mode = tk;
      first = true;
      if (cur.length) polys.push(cur);
      cur = [];
      i++;
      continue;
    }
    if (tk === 'z' || tk === 'Z') {
      if (cur.length) polys.push(cur);
      cur = [];
      x = startX;
      y = startY;
      i++;
      continue;
    }
    const nx = Number(tokens[i]);
    const ny = Number(tokens[i + 1]);
    i += 2;
    if (mode === 'm') {
      x += nx;
      y += ny;
    } else {
      x = nx;
      y = ny;
    }
    if (first) {
      startX = x;
      startY = y;
      first = false;
    }
    cur.push([x, y]);
  }
  if (cur.length) polys.push(cur);
  return polys;
};

interface PrefGeo {
  id: string;
  name: string;
  path: string;
  polys: Poly[];
  bbox: [number, number, number, number];
  centroid: [number, number];
}

const GEO: Record<string, PrefGeo> = (() => {
  const out: Record<string, PrefGeo> = {};
  for (const loc of MAP.locations) {
    const polys = parsePath(loc.path);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    // Area-weighted centroid of the largest polygon (main island of the prefecture).
    let best = polys[0];
    let bestArea = 0;
    for (const p of polys) {
      let a = 0;
      for (let k = 0; k < p.length; k++) {
        const [x1, y1] = p[k];
        const [x2, y2] = p[(k + 1) % p.length];
        a += x1 * y2 - x2 * y1;
        minX = Math.min(minX, x1); minY = Math.min(minY, y1); maxX = Math.max(maxX, x1); maxY = Math.max(maxY, y1);
      }
      if (Math.abs(a) > bestArea) { bestArea = Math.abs(a); best = p; }
    }
    let cx = 0, cy = 0, A = 0;
    for (let k = 0; k < best.length; k++) {
      const [x1, y1] = best[k];
      const [x2, y2] = best[(k + 1) % best.length];
      const f = x1 * y2 - x2 * y1;
      A += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
    }
    const centroid: [number, number] = A ? [cx / (3 * A), cy / (3 * A)] : [(minX + maxX) / 2, (minY + maxY) / 2];
    out[loc.id] = { id: loc.id, name: loc.name, path: loc.path, polys, bbox: [minX, minY, maxX, maxY], centroid };
  }
  return out;
})();

const inside = (pt: [number, number], poly: Poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

/** Seeded random points inside a prefecture (map viewBox units). */
export const villagePoints = (id: string, count: number, seed = 'v'): Array<[number, number]> => {
  const g = GEO[id];
  if (!g) return [];
  const [x0, y0, x1, y1] = g.bbox;
  const pts: Array<[number, number]> = [];
  for (let k = 0; pts.length < count && k < count * 40; k++) {
    const p: [number, number] = [x0 + random(`${seed}-${id}-x${k}`) * (x1 - x0), y0 + random(`${seed}-${id}-y${k}`) * (y1 - y0)];
    if (g.polys.some((poly) => inside(p, poly))) pts.push(p);
  }
  return pts;
};

export const prefectureCentroid = (id: string): [number, number] => GEO[id]?.centroid ?? [VB_W / 2, VB_H / 2];
export const PREFECTURE_IDS = Object.keys(GEO);

type ViewBox = [number, number, number, number];
const fullView: ViewBox = [VB_X, VB_Y, VB_W, VB_H];

const viewFor = (target: string | null, padding: number, aspect: number): ViewBox => {
  if (!target) return fullView;
  const g = GEO[target];
  if (!g) return fullView;
  const [x0, y0, x1, y1] = g.bbox;
  let w = (x1 - x0) * (1 + padding * 2);
  let h = (y1 - y0) * (1 + padding * 2);
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return [cx - w / 2, cy - h / 2, w, h];
};

export const JapanMap: React.FC<{
  width?: number;
  height?: number;
  land?: string;
  border?: string;
  fills?: Array<{ id: string; color: string; at: number; duration?: number }>;
  glow?: Array<{ id: string; at: number; color?: string }>;
  zooms?: Array<{ target: string | null; at: number; duration?: number; padding?: number }>;
  villages?: Array<{ id: string; count: number; at: number; fadeFrom: number; fadeDuration: number; color?: string }>;
  labels?: Array<{ id: string; text: string; at: number; dx?: number; dy?: number }>;
  pulses?: Array<{ id: string; at: number; color?: string }>;
  style?: React.CSSProperties;
}> = ({
  width = 1000,
  height = 1080,
  land = '#D9D2C4',
  border = '#F4EFE6',
  fills = [],
  glow = [],
  zooms = [],
  villages = [],
  labels = [],
  pulses = [],
  style,
}) => {
  const frame = useCurrentFrame();
  const uid = useId().replace(/:/g, '');
  const aspect = width / height;

  // Camera: chain zooms in order.
  let prev = viewFor(null, 0.05, aspect);
  let vb: ViewBox = prev;
  for (const z of zooms) {
    const next = viewFor(z.target, z.padding ?? 0.5, aspect);
    const t = interpolate(frame, [z.at, z.at + (z.duration ?? 40)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
    if (t <= 0) break;
    vb = prev.map((v, k) => v + (next[k] - v) * t) as ViewBox;
    prev = next;
    if (t < 1) break;
  }
  const unit = vb[2] / width; // map units per screen px

  const fillOf = (id: string) => {
    let color = land;
    for (const f of fills.filter((q) => q.id === id)) {
      color = interpolateColors(frame, [f.at, f.at + (f.duration ?? 20)], [color, f.color]);
    }
    const gl = glow.find((q) => q.id === id);
    if (gl) color = interpolateColors(frame, [gl.at, gl.at + 15], [color, gl.color ?? COLORS.highlighter]);
    return color;
  };

  return (
    <svg width={width} height={height} viewBox={vb.join(' ')} style={{ position: 'absolute', overflow: 'hidden', ...style }}>
      <defs>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={4 * unit} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {MAP.locations.map((loc) => {
        const isGlow = glow.some((q) => q.id === loc.id && frame >= q.at);
        return (
          <path
            key={loc.id}
            d={loc.path}
            fill={fillOf(loc.id)}
            stroke={border}
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
            filter={isGlow ? `url(#${uid}-glow)` : undefined}
          />
        );
      })}

      {villages.map((v, vi) => {
        const pts = villagePoints(v.id, v.count, `vil${vi}`);
        return (
          <g key={vi}>
            {pts.map((p, k) => {
              const appear = interpolate(frame, [v.at + (k % 12), v.at + (k % 12) + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              const order = random(`vil-order-${vi}-${k}`);
              const goneAt = v.fadeFrom + order * v.fadeDuration;
              const fade = interpolate(frame, [goneAt, goneAt + 8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return <circle key={k} cx={p[0]} cy={p[1]} r={5 * unit} fill={v.color ?? COLORS.ink} opacity={appear * fade * 0.85} />;
            })}
          </g>
        );
      })}

      {pulses.map((pl, i) => {
        if (frame < pl.at) return null;
        const [x, y] = prefectureCentroid(pl.id);
        const cyc = ((frame - pl.at) % 36) / 36;
        const color = pl.color ?? COLORS.red;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={(9 + cyc * 30) * unit} fill="none" stroke={color} strokeWidth={3 * unit} opacity={(1 - cyc) * 0.75} />
            <circle cx={x} cy={y} r={9 * unit} fill={color} stroke="#FBFAF6" strokeWidth={2.5 * unit} />
          </g>
        );
      })}

      {labels.map((lb, i) => {
        const o = interpolate(frame, [lb.at, lb.at + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const [x, y] = prefectureCentroid(lb.id);
        const lx = x + (lb.dx ?? 40) * unit;
        const ly = y + (lb.dy ?? -24) * unit;
        return (
          <g key={i} opacity={o}>
            <line x1={x} y1={y} x2={lx} y2={ly} stroke={COLORS.ink} strokeWidth={1.5 * unit} />
            <text x={lx + 6 * unit} y={ly + 7 * unit} fontFamily={FONTS.mono} fontWeight={500} fontSize={22 * unit} fill={COLORS.ink}>
              {lb.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
