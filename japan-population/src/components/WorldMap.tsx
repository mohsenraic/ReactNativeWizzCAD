/**
 * <WorldMap> — flat Natural Earth world (world-atlas 110m, public domain) with muted land,
 * thin borders, highlighted countries, pulsing dots with Plex Mono labels, and a camera that
 * zooms from a close-up (e.g. Japan) out to the whole map.
 *
 * @example
 * <WorldMap
 *   zoom={{ from: { center: [139, 36], scale: 5 }, to: { center: [60, 25], scale: 1 }, at: 0, duration: 60 }}
 *   highlight={[{ iso: '410', at: 70 }, { iso: '380', at: 85 }, { iso: '156', at: 100 }]}
 *   dots={sameTrajectory.data.map((d, i) => ({ ...d, at: 70 + i * 15 }))}
 * />
 */
import React from 'react';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import countries110 from 'world-atlas/countries-110m.json';
import { Easing, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../theme';

const topo = countries110 as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
const COUNTRIES = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
const BORDERS = mesh(topo, topo.objects.countries, (a, b) => a !== b);

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

export const WorldMap: React.FC<{
  width?: number;
  height?: number;
  land?: string;
  ocean?: string;
  /** ISO 3166-1 numeric ids as strings (Japan 392, S. Korea 410, Italy 380, China 156). */
  highlight?: Array<{ iso: string; at: number; color?: string }>;
  dots?: WorldDot[];
  zoom?: { from: { center: [number, number]; scale: number }; to: { center: [number, number]; scale: number }; at: number; duration: number };
  style?: React.CSSProperties;
}> = ({ width = 1920, height = 1080, land = '#D9D2C4', ocean = 'transparent', highlight = [], dots = [], zoom, style }) => {
  const frame = useCurrentFrame();
  const projection = geoEqualEarth().fitExtent([[40, 60], [width - 40, height - 60]], COUNTRIES);
  const path = geoPath(projection);

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

  return (
    <svg width={width} height={height} style={{ position: 'absolute', background: ocean, ...style }}>
      <g transform={transform}>
        {COUNTRIES.features.map((f, i) => {
          const id = String(f.id ?? i);
          const h = highlight.find((q) => q.iso === id);
          const fill = h ? interpolateColors(frame, [h.at, h.at + 15], [land, h.color ?? '#E3A3A8']) : land;
          return <path key={id + i} d={path(f) ?? ''} fill={fill} />;
        })}
        <path d={path(BORDERS) ?? ''} fill="none" stroke="#F4EFE6" strokeWidth={0.8 / k} />
      </g>
      {dots.map((d, i) => {
        if (frame < d.at) return null;
        const p = projection([d.lon, d.lat]);
        if (!p) return null;
        const sx = width / 2 + (p[0] - center[0]) * k;
        const sy = height / 2 + (p[1] - center[1]) * k;
        const cyc = ((frame - d.at) % 36) / 36;
        const o = interpolate(frame, [d.at, d.at + 10], [0, 1], { extrapolateRight: 'clamp' });
        const color = d.color ?? COLORS.red;
        return (
          <g key={i} opacity={o}>
            <circle cx={sx} cy={sy} r={10 + cyc * 32} fill="none" stroke={color} strokeWidth={3} opacity={(1 - cyc) * 0.7} />
            <circle cx={sx} cy={sy} r={10} fill={color} stroke="#FBFAF6" strokeWidth={3} />
            <text
              x={sx + (d.dx ?? 22)}
              y={sy + (d.dy ?? -18)}
              textAnchor={(d.dx ?? 22) < 0 ? 'end' : 'start'}
              fontFamily={FONTS.mono}
              fontWeight={500}
              fontSize={24}
              fill={COLORS.ink}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
