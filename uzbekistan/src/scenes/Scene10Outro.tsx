/**
 * Scene 10 — Outro (8:16–8:44), lapis paper.
 * The Silk Road map returns: caravan routes and goods; "cut off" → the routes fade behind a veil; "the roads are
 * open again" → routes return with modern flight paths overlaid. Final line on a paper strip over P01 at golden
 * hour. "Middle of the map" → pull back to the world map with Uzbekistan glowing turquoise at its centre.
 * The last 10 s keep the right side clean for YouTube end-screen elements; subscribe card bottom-left.
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { EndCard } from '../../../shared/components/EndCard';
import { KineticTitle } from '../../../shared/components/KineticTitle';
import { PhotoCutout } from '../../../shared/components/PhotoCutout';
import { SourceTag } from '../../../shared/components/SourceTag';
import { WorldMap } from '../../../shared/components/WorldMap';
import { RouteLayer } from '../../../shared/components/RouteMap';
import { newRoutes, silkRoad } from '../data/data';
import { SILK_ROUTES } from '../components/SilkRoadMap';
import { SilkIcon } from '../components/silkIcons';
import { SilkRoadMap } from '../components/SilkRoadMap';
import { photoProps } from '../data/photos';
import { PALETTE } from '../theme';
import { END_SCREEN_SECONDS, sec } from '../timings';
import { Between, UzScene, useScene, Beat } from './common';

/** Extra visual beats as [cue, offset s] (null = seconds from scene start) — checked by retentionGaps(). */
export const BEATS_S10: Beat<'s10'>[] = [['centuries', 0], ['merchants', 0], ['cutOff', 0], ['roadsOpen', 0], ['notNew', 0], ['rediscovering', 0], ['wondering', 0], ['middleOfMap', 0], ['middleOfMap', 3.5], ['middleOfMap', 8], ['middleOfMap', 12], ['middleOfMap', 16]];

export const Scene10Outro: React.FC = () => {
  const { c, d } = useScene('s10');
  const frame = useCurrentFrame();
  const endAt = d - sec(END_SCREEN_SECONDS);
  const photoIn = c('notNew') - 10;
  const routesO = interpolate(frame, [c('cutOff') - 6, c('cutOff') + 10, c('roadsOpen'), c('roadsOpen') + 12], [1, 0.15, 0.15, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const veil = interpolate(frame, [c('cutOff') - 6, c('cutOff') + 10, c('roadsOpen'), c('roadsOpen') + 12], [0, 0.45, 0.45, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pull = interpolate(frame, [c('wondering'), c('middleOfMap')], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) });
  const glow = 0.5 + 0.5 * Math.sin(frame / 7);

  return (
    <UzScene
      id="s10"
      pushIn={0.02}
      overlay={
        <>
          <Between from={0} to={photoIn}>
            <SourceTag text="ROUTES SIMPLIFIED · CITY-TO-CITY" tone="dark" />
          </Between>
          <EndCard at={endAt} tone="dark" left={110} top={900} />
        </>
      }
    >
      {/* ── the roads, ancient and new ────────────────────────────────────────────────────────────── */}
      <Between from={0} to={photoIn + 6} fade={8}>
        <SilkRoadMap tone="dark" routesAt={c('centuries')} routesDuration={60} routesOpacity={routesO} goodsAt={c('merchants')} citiesAt={c('centuries') + 30} uzbekistanAt={0} flightsAt={c('roadsOpen')} />
        <div style={{ position: 'absolute', inset: 0, background: `rgba(10,18,40,${veil})` }} />
      </Between>

      {/* ── the final line over the Registan at golden hour ───────────────────────────────────────── */}
      <Between from={photoIn} to={c('wondering') + 4} fade={10}>
        <PhotoCutout
          {...photoProps('P01')}
          width={1560}
          height={880}
          enterAt={photoIn}
          from="scale"
          rotation={-1}
          seed="p01-outro"
          style={{ left: 180, top: 100 }}
          kenBurns={{ from: { scale: 1.12, focus: [0.5, 0.42] }, to: { scale: 1.0, focus: [0.5, 0.5] }, at: photoIn, duration: c('wondering') - photoIn }}
        />
        <KineticTitle text="ANCIENT · REDISCOVERED" strip highlight={['REDISCOVERED']} at={c('rediscovering')} fontSize={120} style={{ position: 'absolute', left: 300, top: 760 }} />
      </Between>

      {/* ── pull back: the middle of the map (left 60 %, the right side stays clean) ──────────────── */}
      <Between from={c('wondering')} fade={10}>
        <div style={{ position: 'absolute', left: 30, top: 90, width: 1180, height: 780, WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)', maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)' }}>
        <WorldMap
          width={1180}
          height={780}
          centerLon={64}
          land={PALETTE.landOnLapis}
          borders={false}
          zoom={{ from: { center: [64, 41], scale: 5 }, to: { center: [64, 30], scale: 1.45 }, at: c('wondering'), duration: c('middleOfMap') - c('wondering') }}
          highlight={[{ iso: '860', at: c('wondering'), color: PALETTE.turquoise }]}
          overlay={(api) => {
            const p = api.project([64, 41.4])!;
            return (
              <>
                <circle cx={p[0]} cy={p[1]} r={30 + glow * 26 + (1 - pull) * 40} fill="none" stroke={PALETTE.turquoiseLight} strokeWidth={4} opacity={0.35 + 0.4 * glow} />
                <path d={api.countryPath('860')} fill="none" stroke={PALETTE.saffron} strokeWidth={3} />
                <RouteLayer
                  api={api}
                  routes={[
                    ...newRoutes.data.map((r, i) => ({
                      id: r.city,
                      points: [[69.24, 41.31], r.lonLat] as Array<[number, number]>,
                      at: c('middleOfMap', 3.5) + i * 3,
                      duration: 30,
                      color: PALETTE.turquoiseLight,
                      width: 2.5,
                      bend: 0.22,
                      opacity: 0.7,
                      markers: [{ at: c('middleOfMap', 4.5) + i * 9, duration: 75, orient: true, loop: { gap: 45 }, render: () => <SilkIcon name="plane" size={26} token={false} /> }],
                    })),
                    { id: 'caravan', points: SILK_ROUTES.main, at: c('middleOfMap', 8), duration: 70, color: PALETTE.saffron, width: 3, style: 'dashed' as const, bend: 0.05, opacity: 0.8 },
                  ]}
                  nodes={silkRoad.cities.map((city, i) => ({ id: city.id, lonLat: city.lonLat, at: c('middleOfMap', 12) + i * 6, color: PALETTE.saffron, r: 5, pulse: true }))}
                />
                <text x={p[0]} y={p[1] + 70 + (1 - pull) * 30} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize={26} letterSpacing={3} fill={PALETTE.onDark} opacity={pull}>
                  UZBEKISTAN
                </text>
              </>
            );
          }}
        />
        </div>
      </Between>
    </UzScene>
  );
};
