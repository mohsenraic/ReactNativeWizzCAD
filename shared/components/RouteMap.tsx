/**
 * <RouteMap> — animated routes between places on a <WorldMap>: lines that draw on (solid, dashed or dotted,
 * gently bent so they read as journeys), labelled nodes that pop in, and markers that travel along a route
 * (a dot, an icon, a photo cutout…), optionally oriented to the direction of travel.
 *
 * Two ways to use it:
 *   <RouteMap … />                          a WorldMap + routes in one
 *   <WorldMap overlay={(api) => <RouteLayer api={api} … />} />   routes on a map you already configure
 *
 * Route points are [lon, lat]; everything is projected through the map's camera, so routes follow zooms.
 *
 * @example
 * <RouteMap fitBounds={{ west: 55, east: 74, south: 36, north: 46 }} resolution="50m"
 *   highlight={[{ iso: '860', at: 0, color: '#D9D2C4' }]}
 *   nodes={[{ id: 'tas', label: 'TASHKENT', lonLat: [69.24, 41.31], at: 10 }, …]}
 *   routes={[{ id: 'hsr', points: [[69.24, 41.31], [66.97, 39.65], [64.42, 39.77]], at: 20, duration: 60,
 *              color: '#1F8A9E', width: 7,
 *              markers: [{ at: 40, duration: 90, render: () => <circle r={12} fill="#D9A441" /> }] }]} />
 */
import React, { useId } from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRINGS, useTheme } from '../theme';
import { MapApi, WorldMap } from './WorldMap';

export interface RouteMarker {
  /** Frame the marker leaves the start. */
  at: number;
  /** Frames to reach the end. */
  duration: number;
  /** Start / end as fractions of the route (default 0 → 1). */
  from?: number;
  to?: number;
  /** Repeat the trip every `duration + gap` frames. */
  loop?: { gap: number };
  /** SVG content drawn centred on (0, 0). `angle` is the travel direction in degrees. Default: a dot. */
  render?: (p: { angle: number; progress: number }) => React.ReactNode;
  /** Rotate the marker to the travel direction. */
  orient?: boolean;
  /** Fade the marker in / out at the ends. */
  fade?: boolean;
}

export interface Route {
  id: string;
  /** [lon, lat] waypoints. */
  points: Array<[number, number]>;
  at: number;
  duration?: number;
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  /** Sideways bend of each leg as a share of its length (0 = straight). Default 0.12. */
  bend?: number;
  opacity?: number;
  /** Frame the route fades out (optional). */
  outAt?: number;
  markers?: RouteMarker[];
  /** Arrowhead at the end. */
  arrow?: boolean;
}

export interface RouteNode {
  id: string;
  lonLat: [number, number];
  label?: string;
  at: number;
  color?: string;
  /** Label offset in px. Negative dx right-aligns the label. */
  dx?: number;
  dy?: number;
  /** Pulsing ring. */
  pulse?: boolean;
  /** Dot radius (default 9). */
  r?: number;
  outAt?: number;
}

type Pt = [number, number];

/** Sample a bent polyline (quadratic legs) into screen points + cumulative lengths. */
export const routeGeometry = (pts: Pt[], bend = 0.12, perLeg = 32): { pts: Pt[]; len: number[]; total: number } => {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    // alternate the bend side so multi-leg routes undulate like a road, not a spiral
    const side = i % 2 === 0 ? 1 : -1;
    const c: Pt = [mx - dy * bend * side, my + dx * bend * side];
    for (let k = i === 0 ? 0 : 1; k <= perLeg; k++) {
      const t = k / perLeg;
      out.push([(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]);
    }
  }
  const len = [0];
  for (let i = 1; i < out.length; i++) len.push(len[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { pts: out, len, total: len[len.length - 1] || 1 };
};

/** Point + direction (deg) at fraction `f` of a sampled route. */
export const pointAlong = (g: ReturnType<typeof routeGeometry>, f: number): { p: Pt; angle: number } => {
  const target = Math.max(0, Math.min(1, f)) * g.total;
  let i = 1;
  while (i < g.len.length - 1 && g.len[i] < target) i++;
  const a = g.pts[i - 1];
  const b = g.pts[i];
  const seg = g.len[i] - g.len[i - 1] || 1;
  const t = (target - g.len[i - 1]) / seg;
  return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], angle: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
};

/** Routes + nodes for a map's overlay. */
export const RouteLayer: React.FC<{ api: MapApi; routes?: Route[]; nodes?: RouteNode[] }> = ({ api, routes = [], nodes = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors: C, fonts: F } = useTheme();
  const uid = useId().replace(/:/g, '');

  return (
    <g>
      {routes.map((r) => {
        const screen = r.points.map((ll) => api.project(ll)).filter(Boolean) as Pt[];
        if (screen.length < 2) return null;
        const g = routeGeometry(screen, r.bend ?? 0.12);
        const d = 'M' + g.pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L');
        const p = interpolate(frame, [r.at, r.at + (r.duration ?? 40)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
        const out = r.outAt === undefined ? 1 : interpolate(frame, [r.outAt, r.outAt + 12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        if (p <= 0 || out <= 0) return null;
        const color = r.color ?? C.accent;
        const w = r.width ?? 5;
        const dash = r.style === 'dashed' ? `${w * 3} ${w * 2}` : r.style === 'dotted' ? `0.1 ${w * 2.2}` : undefined;
        const tip = pointAlong(g, p);
        return (
          <g key={r.id} opacity={(r.opacity ?? 1) * out}>
            {dash ? (
              // dashed / dotted lines reveal through a mask so the dash pattern itself doesn't crawl
              <>
                <defs>
                  <mask id={`route-${uid}-${r.id}`} maskUnits="userSpaceOnUse">
                    <path d={d} fill="none" stroke="#fff" strokeWidth={w * 3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
                  </mask>
                </defs>
                <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} mask={`url(#route-${uid}-${r.id})`} />
              </>
            ) : (
              <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
            )}
            {r.arrow && p > 0.98 && (
              <g transform={`translate(${tip.p[0]} ${tip.p[1]}) rotate(${tip.angle})`}>
                <path d={`M${-w * 3.2},${-w * 2.2} L0,0 L${-w * 3.2},${w * 2.2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
            {(r.markers ?? []).map((m, mi) => {
              let local = frame - m.at;
              if (m.loop && local > 0) local %= m.duration + m.loop.gap;
              if (local < 0 || local > m.duration) return null;
              const t = Easing.inOut(Easing.sin)(local / m.duration);
              const f = (m.from ?? 0) + ((m.to ?? 1) - (m.from ?? 0)) * t;
              if (f > p + 0.001) return null; // never run ahead of the drawn line
              const { p: mp, angle } = pointAlong(g, f);
              const fo = m.fade === false ? 1 : Math.min(1, local / 6, (m.duration - local) / 6);
              return (
                <g key={mi} transform={`translate(${mp[0]} ${mp[1]})${m.orient ? ` rotate(${angle})` : ''}`} opacity={fo}>
                  {m.render ? m.render({ angle, progress: f }) : <circle r={w * 1.8} fill={color} stroke={C.card} strokeWidth={3} />}
                </g>
              );
            })}
          </g>
        );
      })}
      {nodes.map((n) => {
        const sp = api.project(n.lonLat);
        if (!sp || frame < n.at) return null;
        const s = spring({ frame: frame - n.at, fps, config: SPRINGS.cutout });
        const out = n.outAt === undefined ? 1 : interpolate(frame, [n.outAt, n.outAt + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const color = n.color ?? C.accent;
        const r = n.r ?? 9;
        const cyc = ((frame - n.at) % 40) / 40;
        const dx = n.dx ?? 18;
        return (
          <g key={n.id} transform={`translate(${sp[0]} ${sp[1]})`} opacity={out}>
            {n.pulse && <circle r={r + cyc * 30} fill="none" stroke={color} strokeWidth={3} opacity={(1 - cyc) * 0.7} />}
            <circle r={r * s} fill={color} stroke={C.card} strokeWidth={3} />
            {n.label && (
              <text
                x={dx}
                y={n.dy ?? -14}
                textAnchor={dx < 0 ? 'end' : 'start'}
                fontFamily={F.mono}
                fontWeight={500}
                fontSize={24}
                fill={C.ink}
                opacity={Math.min(1, s * 1.5)}
                stroke={C.paper}
                strokeWidth={6}
                paintOrder="stroke"
              >
                {n.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** A <WorldMap> with routes and nodes. All other props pass through to the map. */
export const RouteMap: React.FC<
  Omit<React.ComponentProps<typeof WorldMap>, 'overlay'> & {
    routes?: Route[];
    nodes?: RouteNode[];
    /** Extra overlay drawn above the routes. */
    overlay?: (api: MapApi) => React.ReactNode;
  }
> = ({ routes, nodes, overlay, ...map }) => (
  <WorldMap
    {...map}
    overlay={(api) => (
      <>
        <RouteLayer api={api} routes={routes} nodes={nodes} />
        {overlay?.(api)}
      </>
    )}
  />
);
