/**
 * <ImpactMap> — Pacific-centred world map where El Niño's typical footprints animate in: drought regions
 * in ochre with a cracked-earth hatch, wet regions in teal with rain lines, each with a Plex Mono label.
 * An optional warm wash tints all land ("the dice are loaded toward heat").
 *
 * Region outlines come from `impactRegions` in data/elnino.ts (schematic, sourced, TODO: VERIFY).
 * Built on the shared <WorldMap regions>.
 *
 * @example
 * <ImpactMap at={{ maritime: 20, eAustralia: 40, peruEcuador: 120 }} heatAt={300} />
 */
import React from 'react';
import { Easing, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { WorldMap } from '../../../shared/components';
import type { MapApi, MapRegion } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { impactRegions } from '../data/elnino';
import type { ImpactRegion } from '../data/elnino';
import { PALETTE } from '../theme';

export const ImpactMap: React.FC<{
  /** Frame each region (by id) fills in. Regions without a frame stay hidden. */
  at: Partial<Record<string, number>>;
  /** Frame the warm wash starts spreading over all land. */
  heatAt?: number;
  /** Frame all regions/labels fade out (e.g. before a split screen). */
  outAt?: number;
  /** Hide labels (keep fills). */
  labels?: boolean;
  zoom?: React.ComponentProps<typeof WorldMap>['zoom'];
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  overlay?: (api: MapApi) => React.ReactNode;
}> = ({ at, heatAt, outAt, labels = true, zoom, width = 1920, height = 1080, style, overlay }) => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const shown = impactRegions.data.filter((r) => at[r.id] !== undefined);
  const regions: MapRegion[] = shown.map((r) => ({
    id: r.id,
    polygon: r.polygon,
    fill: r.kind === 'dry' ? 'cracks' : 'rain',
    color: r.kind === 'dry' ? PALETTE.drought : PALETTE.flood,
    at: at[r.id]!,
    duration: 16,
    outAt,
  }));
  const heat = heatAt === undefined ? 0 : interpolate(frame, [heatAt, heatAt + 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const land = interpolateColors(heat, [0, 1], [PALETTE.landOnPaper, '#E8C4AE']);

  const labelLayer = (api: MapApi) =>
    shown.map((r: ImpactRegion) => {
      const t0 = at[r.id]! + 8;
      const o =
        interpolate(frame, [t0, t0 + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) *
        (outAt === undefined ? 1 : interpolate(frame, [outAt, outAt + 12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
      const p = api.project(r.labelAt);
      if (!p || o <= 0) return null;
      const color = r.kind === 'dry' ? '#7A5F0E' : '#0E5E55';
      const w = r.label.length * 12.6 + 24;
      return (
        <g key={r.id} opacity={o} transform={`translate(${p[0]} ${p[1] + (1 - o) * 8})`}>
          <rect x={-w / 2} y={-19} width={w} height={34} fill="#FBFAF6" stroke={color} strokeWidth={2} />
          <text textAnchor="middle" y={5} fontFamily={F.mono} fontWeight={500} fontSize={20} letterSpacing={1} fill={color}>
            {r.label}
          </text>
        </g>
      );
    });

  return (
    <WorldMap
      width={width}
      height={height}
      style={style}
      centerLon={180}
      zoom={zoom}
      land={land}
      regions={regions}
      overlay={(api) => (
        <>
          {labels && labelLayer(api)}
          {overlay?.(api)}
        </>
      )}
    />
  );
};
