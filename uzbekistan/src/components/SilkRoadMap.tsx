/**
 * <SilkRoadMap> — Eurasia with the Silk Road: caravan routes draw from Chang'an to the Mediterranean, goods
 * (silk, spices, paper, glass, horses) travel along them, caravanserais drop onto the route, the three great
 * Uzbek cities pulse, and the camera can zoom onto Uzbekistan. Optional extras for Scene 3 and the outro:
 *   landlocked   the shortest way to the open ocean (Persian Gulf) with the 2 border crossings numbered
 *   flights      modern flight paths overlaid on the ancient routes (outro)
 *
 * Routes are STYLIZED (city-to-city, not surveyed tracks): print "ROUTES SIMPLIFIED" in the scene's SourceTag.
 *
 * @example
 * <SilkRoadMap routesAt={20} goodsAt={70} caravanseraiAt={150} citiesAt={190}
 *   zoom={{ at: 230, duration: 50, scale: 3.2 }} />
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MapApi, WorldMap } from '../../../shared/components/WorldMap';
import { Route, RouteLayer, RouteNode } from '../../../shared/components/RouteMap';
import { SPRINGS, useTheme } from '../../../shared/theme';
import { silkRoad } from '../data/data';
import { PALETTE } from '../theme';
import { SilkIcon, SilkIconName } from './silkIcons';

type LL = [number, number];

/** Stylized network (lon, lat). Main corridor west ← east, plus the Tarim southern branch and the Khiva / steppe branch. */
export const SILK_ROUTES: Record<string, LL[]> = {
  main: [
    [108.9, 34.3], // Chang'an (Xi'an)
    [103.8, 36.1], // Lanzhou
    [94.7, 40.1], // Dunhuang
    [89.2, 42.9], // Turpan
    [83.0, 41.7], // Kucha
    [76.0, 39.5], // Kashgar
    [72.8, 40.5], // Fergana valley (Osh)
    [69.24, 41.31], // Tashkent
    [66.97, 39.65], // Samarkand
    [64.42, 39.77], // Bukhara
    [61.8, 37.6], // Merv
    [58.8, 36.2], // Nishapur
    [51.4, 35.6], // Rey
    [48.5, 34.8], // Hamadan
    [44.4, 33.3], // Baghdad
    [38.3, 34.6], // Palmyra
    [36.2, 36.2], // Antioch
    [35.5, 33.9], // Mediterranean coast
  ],
  south: [
    [94.7, 40.1], // Dunhuang
    [86.6, 38.2], // Miran
    [79.9, 37.1], // Khotan
    [76.0, 39.5], // Kashgar
  ],
  north: [
    [64.42, 39.77], // Bukhara
    [60.36, 41.38], // Khiva
    [53.0, 45.5], // Ustyurt steppe
    [47.0, 48.7], // Sarai on the Volga
    [35.4, 45.0], // Caffa (Black Sea)
    [28.98, 41.01], // Constantinople
  ],
};

/** Caravanserai drop points (a few stops along the corridor). */
const STOPS: LL[] = [
  [99.0, 39.0],
  [89.2, 42.9],
  [76.0, 39.5],
  [61.8, 37.6],
  [55.0, 36.0],
  [44.4, 33.3],
  [53.0, 45.5],
];

/** Shortest overland way from Uzbekistan to the open ocean: 2 borders (UZ→TM at Alat, TM→IR at Sarakhs). */
const TO_OCEAN: LL[] = [
  [64.42, 39.77], // Bukhara
  [63.85, 39.42], // Alat / Farap — border 1
  [61.8, 37.6], // Mary
  [61.2, 36.5], // Sarakhs — border 2
  [59.6, 36.3], // Mashhad
  [57.0, 31.0],
  [56.3, 27.2], // Bandar Abbas (Persian Gulf)
];

/** Modern flight paths for the outro (Tashkent / Samarkand hubs). */
const FLIGHTS: Array<[LL, LL]> = [
  [[69.24, 41.31], [2.35, 48.86]], // Paris
  [[69.24, 41.31], [13.4, 52.5]], // Berlin
  [[69.24, 41.31], [28.98, 41.01]], // Istanbul
  [[69.24, 41.31], [55.27, 25.2]], // Dubai
  [[69.24, 41.31], [116.4, 39.9]], // Beijing
  [[69.24, 41.31], [126.98, 37.57]], // Seoul
  [[66.97, 39.65], [37.6, 55.75]], // Moscow
  [[66.97, 39.65], [77.2, 28.6]], // Delhi
];

const GOODS: Array<{ name: SilkIconName; westward: boolean }> = [
  { name: 'silk', westward: true },
  { name: 'paper', westward: true },
  { name: 'spices', westward: true },
  { name: 'glass', westward: false },
  { name: 'horses', westward: false },
];

export const EURASIA = { west: -12, east: 128, south: 12, north: 60 };

export const SilkRoadMap: React.FC<{
  routesAt?: number;
  routesDuration?: number;
  goodsAt?: number;
  caravanseraiAt?: number;
  citiesAt?: number;
  /** Frame Uzbekistan fills turquoise. */
  uzbekistanAt?: number;
  /** Camera zoom onto Uzbekistan. */
  zoom?: { at: number; duration?: number; scale?: number; outAt?: number };
  /** Camera keyframes (supersedes `zoom`): each eases from the previous state to { center, scale }. */
  zoomKeys?: Array<{ at: number; duration?: number; scale: number; center?: LL }>;
  landlockedAt?: number;
  /** Fade the landlocked route + border marks out. */
  landlockedOutAt?: number;
  flightsAt?: number;
  /** Fade the ancient routes back (e.g. while the landlocked route is shown). */
  routesOpacity?: number;
  tone?: 'light' | 'dark';
  /** Extra overlay content with the map api. */
  overlay?: (api: MapApi) => React.ReactNode;
}> = ({
  routesAt = 0,
  routesDuration = 90,
  goodsAt,
  caravanseraiAt,
  citiesAt,
  uzbekistanAt = 0,
  zoom,
  zoomKeys,
  landlockedAt,
  landlockedOutAt,
  flightsAt,
  routesOpacity = 1,
  tone = 'light',
  overlay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  const dark = tone === 'dark';
  const land = dark ? PALETTE.landOnLapis : PALETTE.landOnPaper;
  const routeColor = dark ? PALETTE.saffron : PALETTE.terracotta;
  const uzCenter: LL = [64.5, 41.4];

  // zoom in (and optionally back out) around Uzbekistan
  let zoomProp: React.ComponentProps<typeof WorldMap>['zoom'];
  if (zoomKeys && zoomKeys.length) {
    const home: LL = [(EURASIA.west + EURASIA.east) / 2, (EURASIA.south + EURASIA.north) / 2];
    let state = { center: home, scale: 1 };
    const keys = [...zoomKeys].sort((a, b) => a.at - b.at);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const target = { center: k.center ?? (k.scale > 1 ? uzCenter : home), scale: k.scale };
      const next = keys[i + 1];
      if (!next || frame < next.at) {
        zoomProp = { from: state, to: target, at: k.at, duration: k.duration ?? 45 };
        break;
      }
      state = target;
    }
  } else if (zoom) {
    const center: LL = [(EURASIA.west + EURASIA.east) / 2, (EURASIA.south + EURASIA.north) / 2];
    const zin = { center: uzCenter, scale: zoom.scale ?? 3.2 };
    zoomProp =
      zoom.outAt !== undefined && frame >= zoom.outAt
        ? { from: zin, to: { center, scale: 1 }, at: zoom.outAt, duration: zoom.duration ?? 45 }
        : { from: { center, scale: 1 }, to: zin, at: zoom.at, duration: zoom.duration ?? 45 };
  }

  const routes: Route[] = [];
  if (routesAt !== undefined) {
    routes.push(
      {
        id: 'main',
        points: SILK_ROUTES.main,
        at: routesAt,
        duration: routesDuration,
        color: routeColor,
        width: 5,
        style: 'dashed',
        bend: 0.06,
        opacity: routesOpacity,
        markers:
          goodsAt === undefined
            ? []
            : GOODS.map((g, i) => ({
                at: goodsAt + i * 14,
                duration: 150,
                from: g.westward ? 0 : 1,
                to: g.westward ? 1 : 0,
                loop: { gap: 40 },
                render: () => <SilkIcon name={g.name} size={52} />,
              })),
      },
      { id: 'south', points: SILK_ROUTES.south, at: routesAt + routesDuration * 0.3, duration: routesDuration * 0.5, color: routeColor, width: 4, style: 'dashed', bend: 0.08, opacity: routesOpacity * 0.85 },
      { id: 'north', points: SILK_ROUTES.north, at: routesAt + routesDuration * 0.5, duration: routesDuration * 0.6, color: routeColor, width: 4, style: 'dashed', bend: 0.08, opacity: routesOpacity * 0.85 },
    );
  }
  if (landlockedAt !== undefined)
    routes.push({ id: 'ocean', points: TO_OCEAN, at: landlockedAt, duration: 50, color: PALETTE.questionRed, width: 6, style: 'dotted', bend: 0.04, arrow: true, outAt: landlockedOutAt });
  if (flightsAt !== undefined)
    FLIGHTS.forEach(([a, b], i) =>
      routes.push({ id: `fl${i}`, points: [a, b], at: flightsAt + i * 6, duration: 36, color: dark ? PALETTE.turquoiseLight : PALETTE.turquoise, width: 3.5, bend: 0.22, markers: [{ at: flightsAt + i * 6 + 20, duration: 60, orient: true, loop: { gap: 30 }, render: () => <SilkIcon name="plane" size={34} token={false} /> }] }),
    );

  const nodes: RouteNode[] =
    citiesAt === undefined
      ? []
      : [
          ...silkRoad.cities.map((c, i) => ({ id: c.id, lonLat: c.lonLat, label: c.name, at: citiesAt + i * 8, pulse: true, color: PALETTE.turquoise, r: 11, dx: c.id === 'khiva' ? -18 : 18, dy: c.id === 'bukhara' ? 30 : -14 })),
          { id: 'xian', lonLat: silkRoad.ends.east.lonLat, label: "CHANG'AN", at: citiesAt + 30, color: routeColor, r: 7 },
          { id: 'med', lonLat: silkRoad.ends.west.lonLat, label: 'MEDITERRANEAN', at: citiesAt + 34, color: routeColor, r: 7, dx: -14 },
        ];

  return (
    <WorldMap
      fitBounds={EURASIA}
      projection="equirectangular"
      land={land}
      zoom={zoomProp}
      resolution="50m"
      highlight={[{ iso: '860', at: uzbekistanAt, color: PALETTE.turquoise }]}
      overlay={(api) => (
        <>
          <RouteLayer api={api} routes={routes} />
          {caravanseraiAt !== undefined &&
            STOPS.map((ll, i) => {
              const p = api.project(ll);
              if (!p) return null;
              const s = spring({ frame: frame - (caravanseraiAt + i * 5), fps, config: SPRINGS.cutout });
              if (s <= 0.01) return null;
              return (
                <g key={i} transform={`translate(${p[0]} ${p[1] - 34 - (1 - s) * 80}) scale(${0.6 + 0.4 * s})`} opacity={Math.min(1, s * 2)}>
                  <SilkIcon name="caravanserai" size={58} />
                </g>
              );
            })}
          <RouteLayer api={api} nodes={nodes} />
          {landlockedAt !== undefined && <BorderMarks api={api} at={landlockedAt} outAt={landlockedOutAt} font={F.headline} />}
          {overlay?.(api)}
        </>
      )}
    />
  );
};

/** Numbered border crossings on the way to the ocean. */
const BorderMarks: React.FC<{ api: MapApi; at: number; outAt?: number; font: string }> = ({ api, at, outAt, font }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = outAt === undefined ? 1 : interpolate(frame, [outAt, outAt + 12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      {[TO_OCEAN[1], TO_OCEAN[3]].map((ll, i) => {
        const p = api.project(ll);
        if (!p) return null;
        const s = spring({ frame: frame - (at + 12 + i * 16), fps, config: SPRINGS.stamp });
        if (s <= 0.01) return null;
        return (
          <g key={i} transform={`translate(${p[0]} ${p[1]}) scale(${interpolate(s, [0, 1], [2, 1])})`} opacity={Math.min(1, s * 2)}>
            <circle r={24} fill={PALETTE.questionRed} stroke="#FBFAF6" strokeWidth={4} />
            <text y={11} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={32} fill="#FBFAF6">
              {i + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
};
