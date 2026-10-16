/**
 * <WorldMap> — flat Natural Earth world (world-atlas 110m, public domain) with muted land,
 * thin borders, highlighted countries, pulsing dots with Plex Mono labels, and a camera that
 * zooms from a close-up (e.g. Japan) out to the whole map.
 *
 * Optional (all backward-compatible):
 *   projection / centerLon   Equal Earth or equirectangular, centred on any longitude (180 = Pacific-centred)
 *   fitBounds                frame a lon/lat box instead of the whole world (e.g. the tropical Pacific)
 *   regions                  custom polygons that fade in: solid, cracked (drought) or rain-line (wet) hatch
 *   underlay / overlay       render props that get a `project` function in screen space (fields, arrows, labels)
 *   borders                  toggle country borders
 *   resolution               '50m' for close-ups (default '110m'; the 50m file is only parsed when used)
 *   highlight[].outAt        fade a highlighted country back to land colour
 *   highlight[].pattern      'hatch' draws diagonal hatching over the fill (e.g. an "iron curtain")
 *   api.countryPath(iso)     screen-space SVG path of one country (outlines, glows, masks)
 *
 * @example
 * <WorldMap
 *   zoom={{ from: { center: [139, 36], scale: 5 }, to: { center: [60, 25], scale: 1 }, at: 0, duration: 60 }}
 *   highlight={[{ iso: '410', at: 70 }, { iso: '380', at: 85 }, { iso: '156', at: 100 }]}
 *   dots={sameTrajectory.data.map((d, i) => ({ ...d, at: 70 + i * 15 }))}
 * />
 * // Pacific-centred, with a drought region and an arrow drawn in map coordinates:
 * <WorldMap centerLon={180} projection="equirectangular"
 *   regions={[{ id: 'aus', polygon: [[135, -12], [153, -25], [141, -39], [135, -33]], fill: 'cracks', color: '#C9A227', at: 30 }]}
 *   overlay={({ project }) => { const [x, y] = project([-150, 0])!; return <circle cx={x} cy={y} r={8} />; }} />
 */
import React, { useId } from 'react';
import { geoArea, geoEqualEarth, geoEquirectangular, geoPath } from 'd3-geo';
import type { GeoProjection } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry, MultiPoint, Polygon } from 'geojson';
import countries110 from 'world-atlas/countries-110m.json';
import { Easing, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { useTheme } from '../theme';

type CountriesTopo = Topology<{ countries: GeometryCollection<{ name: string }> }>;
const topo = countries110 as unknown as CountriesTopo;
const COUNTRIES = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
const BORDERS = mesh(topo, topo.objects.countries, (a, b) => a !== b);

/** 50m geometry, parsed on first use only (videos that never ask for it never pay for it). */
let hi: { countries: FeatureCollection<Geometry, { name: string }>; borders: ReturnType<typeof mesh> } | null = null;
const hiRes = () => {
  if (!hi) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const t = require('world-atlas/countries-50m.json') as CountriesTopo;
    hi = {
      countries: feature(t, t.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>,
      borders: mesh(t, t.objects.countries, (a, b) => a !== b),
    };
  }
  return hi;
};

export interface WorldDot {
  name: string;
  label: string;
  lon: number;
  lat: number;
  at: number;
  color?: string;
  /** Label offset in screen px; a negative dx right-aligns the label to the left of the dot. */
  dx?: number;
  dy?: number;
}

export type RegionFill = 'solid' | 'cracks' | 'rain';

export interface MapRegion {
  id: string;
  /** Outer ring as [lon, lat] pairs (either winding — it is normalised). */
  polygon: Array<[number, number]>;
  fill?: RegionFill;
  color: string;
  /** Frame the region starts fading in. */
  at: number;
  duration?: number;
  /** Max opacity of the tint under the hatch. */
  opacity?: number;
  /** Frame it fades back out (optional). */
  outAt?: number;
}

/** Screen-space helpers passed to `underlay` / `overlay`. */
export interface MapApi {
  /** [lon, lat] → screen px (after the zoom camera), or null if not visible. */
  project: (lonLat: [number, number]) => [number, number] | null;
  /** Current zoom factor (1 = whole map). */
  k: number;
  /** The d3 projection (pre-camera) for advanced use. */
  projection: GeoProjection;
  width: number;
  height: number;
  /** Screen-space SVG path of one country (ISO numeric id), after the zoom camera. Empty string if unknown. */
  countryPath: (iso: string) => string;
}

export interface MapBounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

/** Ring winding that d3-geo reads as the small area (not the whole globe minus the region). */
const normaliseRing = (ring: Array<[number, number]>): Feature<Polygon> => {
  const closed = [...ring, ring[0]];
  const f: Feature<Polygon> = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [closed] } };
  if (geoArea(f) > 2 * Math.PI) f.geometry.coordinates = [[...closed].reverse()];
  return f;
};

/** Corner + edge points of a lon/lat box (east may be < west to cross the dateline). */
const boundsPoints = (b: MapBounds): Feature<MultiPoint> => {
  const east = b.east < b.west ? b.east + 360 : b.east;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 8; i++) {
    const lon = b.west + ((east - b.west) * i) / 8;
    const l = lon > 180 ? lon - 360 : lon;
    pts.push([l, b.south], [l, b.north]);
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'MultiPoint', coordinates: pts } };
};

/**
 * The (pre-camera) projection a <WorldMap> with these props uses — handy for placing HTML cutouts over a map.
 * @example const p = worldProjection({ centerLon: 180 }); const [x, y] = p([151, -34])!;
 */
export const worldProjection = ({
  width = 1920,
  height = 1080,
  projection = 'equalEarth',
  centerLon = 0,
  fitBounds,
  padding = [40, 60],
}: {
  width?: number;
  height?: number;
  projection?: 'equalEarth' | 'equirectangular';
  centerLon?: number;
  fitBounds?: MapBounds;
  padding?: [number, number];
} = {}): GeoProjection => {
  const base = projection === 'equirectangular' ? geoEquirectangular() : geoEqualEarth();
  if (centerLon) base.rotate([-centerLon, 0]);
  const extent: [[number, number], [number, number]] = [[padding[0], padding[1]], [width - padding[0], height - padding[1]]];
  return fitBounds ? base.fitExtent(extent, boundsPoints(fitBounds)) : base.fitExtent(extent, COUNTRIES);
};

export const WorldMap: React.FC<{
  width?: number;
  height?: number;
  land?: string;
  ocean?: string;
  /** ISO 3166-1 numeric ids as strings (Japan 392, S. Korea 410, Italy 380, China 156). */
  highlight?: Array<{ iso: string; at: number; color?: string; outAt?: number; pattern?: 'hatch' }>;
  dots?: WorldDot[];
  zoom?: { from: { center: [number, number]; scale: number }; to: { center: [number, number]; scale: number }; at: number; duration: number };
  style?: React.CSSProperties;
  /** Map projection. Default 'equalEarth'. */
  projection?: 'equalEarth' | 'equirectangular';
  /** Central meridian in degrees (180 = Pacific-centred). Default 0. */
  centerLon?: number;
  /** Fit this lon/lat box to the frame instead of the whole world. */
  fitBounds?: MapBounds;
  /** Inset (px) used when fitting. Default [40, 60]. */
  padding?: [number, number];
  regions?: MapRegion[];
  /** Drawn above the ocean, below the land (e.g. a sea-surface field). */
  underlay?: (api: MapApi) => React.ReactNode;
  /** Drawn above everything (arrows, labels, boxes). */
  overlay?: (api: MapApi) => React.ReactNode;
  /** Country borders. Default true. */
  borders?: boolean;
  /** Land opacity (e.g. to fade the map). Default 1. */
  landOpacity?: number;
  /** Country geometry detail. '50m' for close-ups of small countries. Default '110m'. */
  resolution?: '110m' | '50m';
}> = ({
  width = 1920,
  height = 1080,
  land: landProp,
  ocean = 'transparent',
  highlight = [],
  dots = [],
  zoom,
  style,
  projection: kind = 'equalEarth',
  centerLon = 0,
  fitBounds,
  padding = [40, 60],
  regions = [],
  underlay,
  overlay,
  borders = true,
  landOpacity = 1,
  resolution = '110m',
}) => {
  const frame = useCurrentFrame();
  const { colors: C, fonts: F } = useTheme();
  const uid = useId().replace(/:/g, '');
  const land = landProp ?? C.land;
  const projection = worldProjection({ width, height, projection: kind, centerLon, fitBounds, padding });
  const path = geoPath(projection);
  const geo = resolution === '50m' ? hiRes() : { countries: COUNTRIES, borders: BORDERS };

  // Camera: scale around a projected center.
  let k = 1;
  let center: [number, number] = [width / 2, height / 2];
  if (zoom) {
    const t = interpolate(frame, [zoom.at, zoom.at + zoom.duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
    // Interpolate log-scale for a natural zoom feel.
    k = Math.exp(Math.log(zoom.from.scale) + (Math.log(zoom.to.scale) - Math.log(zoom.from.scale)) * t);
    const a = projection(zoom.from.center) ?? center;
    const b = projection(zoom.to.center) ?? center;
    center = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  const transform = `translate(${width / 2} ${height / 2}) scale(${k}) translate(${-center[0]} ${-center[1]})`;
  const api: MapApi = {
    project: (ll) => {
      const p = projection(ll);
      return p ? [width / 2 + (p[0] - center[0]) * k, height / 2 + (p[1] - center[1]) * k] : null;
    },
    k,
    projection,
    width,
    height,
    countryPath: (iso) => {
      const f = geo.countries.features.find((c) => String(c.id) === iso);
      if (!f) return '';
      // pre-camera path, then the same camera transform as the map group
      const d = path(f) ?? '';
      return d ? transformPath(d, (x, y) => [width / 2 + (x - center[0]) * k, height / 2 + (y - center[1]) * k]) : '';
    },
  };
  const hatched = highlight.filter((h) => h.pattern === 'hatch');

  return (
    <svg width={width} height={height} style={{ position: 'absolute', background: ocean, ...style }}>
      {underlay?.(api)}
      {regions.length > 0 && <RegionPatterns uid={uid} regions={regions} />}
      {hatched.length > 0 && (
        <defs>
          <pattern id={`${uid}-hatch`} width={10} height={10} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={10} stroke="rgba(26,26,26,0.55)" strokeWidth={2.4} />
          </pattern>
        </defs>
      )}
      <g transform={transform}>
        <LandGroup opacity={landOpacity}>
          {geo.countries.features.map((f, i) => {
            const id = String(f.id ?? i);
            const h = highlight.find((q) => q.iso === id);
            let fill = h ? interpolateColors(frame, [h.at, h.at + 15], [land, h.color ?? '#E3A3A8']) : land;
            if (h?.outAt !== undefined && frame > h.outAt) fill = interpolateColors(frame, [h.outAt, h.outAt + 15], [h.color ?? '#E3A3A8', land]);
            return <path key={id + i} d={path(f) ?? ''} fill={fill} />;
          })}
          {hatched.map((h) => {
            const f = geo.countries.features.find((c) => String(c.id) === h.iso);
            if (!f) return null;
            const o = interpolate(frame, [h.at, h.at + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) *
              (h.outAt === undefined ? 1 : interpolate(frame, [h.outAt, h.outAt + 15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
            return o > 0 ? <path key={`hatch-${h.iso}`} d={path(f) ?? ''} fill={`url(#${uid}-hatch)`} opacity={o} /> : null;
          })}
          {borders && <path d={path(geo.borders) ?? ''} fill="none" stroke={C.landBorder} strokeWidth={0.8 / k} />}
        </LandGroup>
        {regions.map((r) => {
          const len = r.duration ?? 18;
          const a = interpolate(frame, [r.at, r.at + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
          const out = r.outAt === undefined ? 1 : interpolate(frame, [r.outAt, r.outAt + 12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const o = a * out;
          if (o <= 0) return null;
          const d = path(normaliseRing(r.polygon)) ?? '';
          return (
            <g key={r.id} opacity={o}>
              <path d={d} fill={r.color} opacity={r.opacity ?? (r.fill && r.fill !== 'solid' ? 0.55 : 0.85)} />
              {r.fill && r.fill !== 'solid' && <path d={d} fill={`url(#${uid}-${r.fill}-${r.id})`} />}
              <path d={d} fill="none" stroke={r.color} strokeWidth={2.2 / k} strokeLinejoin="round" />
            </g>
          );
        })}
      </g>
      {dots.map((d, i) => {
        if (frame < d.at) return null;
        const p = projection([d.lon, d.lat]);
        if (!p) return null;
        const sx = width / 2 + (p[0] - center[0]) * k;
        const sy = height / 2 + (p[1] - center[1]) * k;
        const cyc = ((frame - d.at) % 36) / 36;
        const o = interpolate(frame, [d.at, d.at + 10], [0, 1], { extrapolateRight: 'clamp' });
        const color = d.color ?? C.accent;
        return (
          <g key={i} opacity={o}>
            <circle cx={sx} cy={sy} r={10 + cyc * 32} fill="none" stroke={color} strokeWidth={3} opacity={(1 - cyc) * 0.7} />
            <circle cx={sx} cy={sy} r={10} fill={color} stroke={C.card} strokeWidth={3} />
            <text
              x={sx + (d.dx ?? 22)}
              y={sy + (d.dy ?? -18)}
              textAnchor={(d.dx ?? 22) < 0 ? 'end' : 'start'}
              fontFamily={F.mono}
              fontWeight={500}
              fontSize={24}
              fill={C.ink}
            >
              {d.label}
            </text>
          </g>
        );
      })}
      {overlay?.(api)}
    </svg>
  );
};

/** Wraps land in an opacity group only when faded, so the default markup is unchanged. */
const LandGroup: React.FC<{ opacity: number; children: React.ReactNode }> = ({ opacity, children }) =>
  opacity === 1 ? <>{children}</> : <g opacity={opacity}>{children}</g>;

/** Hatch patterns per region: 'cracks' = dry-earth crazing, 'rain' = slanted rain dashes. */
const RegionPatterns: React.FC<{ uid: string; regions: MapRegion[] }> = ({ uid, regions }) => (
  <defs>
    {regions
      .filter((r) => r.fill === 'cracks' || r.fill === 'rain')
      .map((r) =>
        r.fill === 'cracks' ? (
          <pattern key={r.id} id={`${uid}-cracks-${r.id}`} width={28} height={28} patternUnits="userSpaceOnUse">
            <path
              d="M0 9 L7 11 L11 4 L18 6 L28 3 M7 11 L9 19 L4 28 M9 19 L17 17 L22 24 L28 22 M17 17 L18 6 M22 24 L20 28"
              fill="none"
              stroke="rgba(60,40,10,0.55)"
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          </pattern>
        ) : (
          <pattern key={r.id} id={`${uid}-rain-${r.id}`} width={14} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
            <line x1={4} y1={1} x2={4} y2={9} stroke="rgba(10,50,60,0.6)" strokeWidth={1.6} strokeLinecap="round" />
            <line x1={11} y1={10} x2={11} y2={17} stroke="rgba(10,50,60,0.6)" strokeWidth={1.6} strokeLinecap="round" />
          </pattern>
        ),
      )}
  </defs>
);

/** Apply a point transform to every coordinate pair of an absolute SVG path (as produced by d3-geo: M/L/Z only). */
const transformPath = (d: string, fn: (x: number, y: number) => [number, number]): string =>
  d.replace(/(-?\d*\.?\d+(?:e-?\d+)?),(-?\d*\.?\d+(?:e-?\d+)?)/g, (_, x, y) => {
    const [a, b] = fn(Number(x), Number(y));
    return `${a.toFixed(2)},${b.toFixed(2)}`;
  });
