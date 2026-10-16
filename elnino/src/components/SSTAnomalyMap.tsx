/**
 * <SSTAnomalyMap> — stylised sea-surface temperature anomaly field over the tropical Pacific.
 *
 * Procedural, not data: smooth noise shaped like the El Niño "tongue" of warm water along the equator
 * (narrow near the date line, widening and strongest toward South America), plus a faint cool horseshoe in
 * the west. `intensity` 0 → 1 scales the whole field; `spread` 0 → 1 grows it outward from its centre
 * (the Scene 1 "small glow that spreads"). Colours use the diverging scale cool → paper → warm.
 *
 * Built on the shared <WorldMap> (Pacific-centred, equirectangular so the Niño 3.4 box is a true rectangle).
 * Pass any WorldMap camera props (`zoom`, `fitBounds`) — Scene 8 pulls back from the Pacific to the world.
 *
 * @example
 * <SSTAnomalyMap intensity={0.9} nino34={{ at: 40 }} tone="dark" />
 * // Scene 1 glow:
 * <SSTAnomalyMap intensity={interpolate(frame, [60, 300], [0, 0.6])} spread={interpolate(frame, [60, 300], [0.1, 1])} />
 */
import React, { useId } from 'react';
import { geoEquirectangular } from 'd3-geo';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { WorldMap } from '../../../shared/components';
import type { MapApi, MapBounds } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { sketchLine, smoothNoise } from '../../../shared/lib/sketch';
import { nino34Box } from '../data/elnino';
import { PALETTE, sstColor } from '../theme';

export const PACIFIC_BOUNDS: MapBounds = { west: 100, east: -70, south: -32, north: 32 };

/**
 * Screen position of [lon, lat] on an un-zoomed SSTAnomalyMap (same projection as the component), for
 * placing HTML cutouts over the map.
 */
export const projectPacific = (ll: [number, number], width = 1920, height = 1080, bounds = PACIFIC_BOUNDS): [number, number] => {
  const east = bounds.east < bounds.west ? bounds.east + 360 : bounds.east;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 8; i++) {
    const lon = bounds.west + ((east - bounds.west) * i) / 8;
    pts.push([lon > 180 ? lon - 360 : lon, bounds.south], [lon > 180 ? lon - 360 : lon, bounds.north]);
  }
  const p = geoEquirectangular()
    .rotate([-195, 0])
    .fitExtent([[0, 0], [width, height]], { type: 'MultiPoint', coordinates: pts });
  return p(ll) ?? [0, 0];
};

/**
 * Normal-year pattern in [-1, 1]: warm pool piled up in the west, cool tongue along the equator in the east.
 * (Shown as warm/cool water, not as an anomaly — labelled as such on screen.)
 */
export const normalField = (lon: number, lat: number, seed = 'sst'): number => {
  const L = lon < 0 ? lon + 360 : lon;
  const noise = smoothNoise(`${seed}-n`);
  const warm = Math.exp(-Math.pow((L - 145) / 30, 2)) * Math.exp(-Math.pow(lat / 16, 2));
  const coolW = interpolate(L, [200, 250, 282], [0, 0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cool = coolW * Math.exp(-Math.pow((lat + 1 - noise(L / 20)) / 5, 2));
  return Math.max(-1, Math.min(1, 0.9 * warm - 0.75 * cool));
};

/** Anomaly in [-1, 1] at (lon, lat). lon in −180…180. */
export const sstField = (lon: number, lat: number, spread = 1, seed = 'sst'): number => {
  const L = lon < 0 ? lon + 360 : lon; // 0…360, Pacific contiguous
  const noise = smoothNoise(`${seed}-a`);
  const noise2 = smoothNoise(`${seed}-b`);
  // Tongue: centred near 120°W (240°E), from ~160°E to the coast at ~80°W (280°E).
  const along = interpolate(L, [155, 185, 230, 262, 282], [0, 0.45, 0.95, 1, 0.75], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const width = interpolate(L, [160, 280], [4.5, 10], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const wobble = noise(L / 22) * 1.6;
  const across = Math.exp(-Math.pow((lat - wobble) / width, 2));
  let v = along * across * (0.88 + 0.12 * noise2(L / 9 + lat / 7));
  // Spread from the centre outward.
  const dist = Math.hypot((L - 235) / 60, lat / 14);
  v *= interpolate(dist, [spread * 1.6 - 0.25, spread * 1.6 + 0.05], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Faint cool horseshoe in the west Pacific.
  const cool = -0.28 * Math.exp(-Math.pow((L - 150) / 22, 2)) * (Math.exp(-Math.pow((lat - 14) / 8, 2)) + Math.exp(-Math.pow((lat + 14) / 8, 2)));
  return Math.max(-1, Math.min(1, v + cool * Math.min(1, spread * 1.5)));
};

const CELL = 2.5;

export const SSTAnomalyMap: React.FC<{
  intensity: number;
  spread?: number;
  /** 'dark' = navy paper (land muted blue-grey), 'light' = warm paper. */
  tone?: 'light' | 'dark';
  /** Draw the Niño 3.4 box by hand starting at `at`. */
  nino34?: { at: number; duration?: number; label?: boolean };
  /** Faint equator line + lat labels. */
  equator?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  zoom?: React.ComponentProps<typeof WorldMap>['zoom'];
  fitBounds?: MapBounds;
  /** Extra overlay drawn in map space (arrows, labels). */
  overlay?: (api: MapApi) => React.ReactNode;
  seed?: string;
  /** 'elnino' anomaly tongue (default) or the 'normal' warm-west / cool-east pattern. */
  pattern?: 'elnino' | 'normal';
}> = ({ intensity, spread = 1, tone = 'dark', nino34, equator = true, width = 1920, height = 1080, style, zoom, fitBounds = PACIFIC_BOUNDS, overlay, seed = 'sst', pattern = 'elnino' }) => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const uid = useId().replace(/:/g, '');
  const dark = tone === 'dark';
  const land = dark ? PALETTE.landOnNavy : PALETTE.landOnPaper;
  const ink = dark ? PALETTE.onDark : PALETTE.ink;

  // Field cells (lon 100E → 290E, lat ±32) — computed once per spread/seed, coloured per frame.
  const cells = React.useMemo(() => {
    const out: Array<{ lon: number; lat: number; v: number }> = [];
    for (let L = 100; L < 290; L += CELL)
      for (let lat = -32; lat < 32; lat += CELL) {
        const lon = L > 180 ? L - 360 : L;
        out.push({ lon, lat, v: pattern === 'normal' ? normalField(lon + CELL / 2, lat + CELL / 2, seed) : sstField(lon + CELL / 2, lat + CELL / 2, spread, seed) });
      }
    return out;
  }, [spread, seed, pattern]);

  const underlay = (api: MapApi) => (
    <g>
      <defs>
        <filter id={`${uid}-blur`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={9 * api.k} />
        </filter>
      </defs>
      <g filter={`url(#${uid}-blur)`}>
        {cells.map((c, i) => {
          const a = api.project([c.lon, c.lat + CELL]);
          const b = api.project([c.lon + CELL, c.lat]);
          if (!a || !b) return null;
          const v = c.v * intensity;
          if (Math.abs(v) < 0.02) return null;
          return <rect key={i} x={a[0] - 1} y={a[1] - 1} width={b[0] - a[0] + 2} height={b[1] - a[1] + 2} fill={sstColor(v)} opacity={Math.min(1, Math.abs(v) * 2.2)} />;
        })}
      </g>
    </g>
  );

  const mapOverlay = (api: MapApi) => {
    const nodes: React.ReactNode[] = [];
    if (equator) {
      const a = api.project([100, 0]);
      const b = api.project([-70, 0]);
      if (a && b)
        nodes.push(
          <g key="eq" opacity={0.55}>
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={ink} strokeWidth={1.5} strokeDasharray="4 10" />
            <text x={a[0] + 80} y={a[1] - 10} fontFamily={F.mono} fontSize={18} letterSpacing={2} fill={ink}>EQUATOR</text>
          </g>,
        );
    }
    if (nino34) {
      const { north, south, west, east } = nino34Box.data;
      const tl = api.project([west, north]);
      const br = api.project([east, south]);
      if (tl && br) {
        const [x, y, w, h] = [tl[0], tl[1], br[0] - tl[0], br[1] - tl[1]];
        const p = interpolate(frame, [nino34.at, nino34.at + (nino34.duration ?? 26)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
        const d = sketchLine([[x - 6, y + 2], [x + w, y], [x + w + 2, y + h], [x, y + h + 1], [x + 1, y - 6]], 'nino34', 1.6, 10);
        const lo = interpolate(frame, [nino34.at + 20, nino34.at + 32], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        nodes.push(
          <g key="box" opacity={p > 0 ? 1 : 0}>
            <path d={d} fill="none" stroke={PALETTE.highlighter} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
            {nino34.label !== false && (
              <text x={x + w / 2} y={y - 22} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={52} fill={PALETTE.highlighter} opacity={lo}>
                Niño 3.4
              </text>
            )}
          </g>,
        );
      }
    }
    if (overlay) nodes.push(<React.Fragment key="ov">{overlay(api)}</React.Fragment>);
    return <>{nodes}</>;
  };

  return (
    <WorldMap
      width={width}
      height={height}
      style={style}
      projection="equirectangular"
      centerLon={195}
      fitBounds={fitBounds}
      zoom={zoom}
      padding={[0, 0]}
      land={land}
      borders={false}
      underlay={underlay}
      overlay={mapOverlay}
    />
  );
};
