/**
 * Scene 4 — Samarkand (2:32–3:26). Signature move: tiles assembling.
 * CityCard (2,500+ years). "Timur" → his empire spreads out from Samarkand on a paper map (capital from 1370).
 * "Best architects and craftsmen" → small cutouts converge on Samarkand from conquered lands. "Mission" → a
 * blueprint pattern draws. Timur → Shah Rukh → Ulugh Beg name tags. "The Registan" → P01 with the three madrasas
 * labelled one by one, then P02 where a mosaic assembles tile by tile over the photo. "Ulugh Beg" → P05 + star
 * chart + the sidereal-year card. "Scientific capitals" → P04's dome, annotated.
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Cutout } from '../../../shared/components/Cutout';
import { DocumentCard } from '../../../shared/components/DocumentCard';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { PhotoCutout } from '../../../shared/components/PhotoCutout';
import { RouteLayer } from '../../../shared/components/RouteMap';
import { SourceTag } from '../../../shared/components/SourceTag';
import { WorldMap } from '../../../shared/components/WorldMap';
import { BigCounter } from '../../../shared/components/BigCounter';
import { useTheme } from '../../../shared/theme';
import { CityCard } from '../components/CityCard';
import { GeometricPattern } from '../components/GeometricPattern';
import { StarChart } from '../components/illustrations';
import { SilkIcon } from '../components/silkIcons';
import { samarkand, ulughBeg } from '../data/data';
import { photoProps } from '../data/photos';
import { PALETTE } from '../theme';
import { Between, QuestionPin, UzScene, useScene, Words, Beat } from './common';

/** Extra visual beats as [cue, offset s] (null = seconds from scene start) — checked by retentionGaps(). */
export const BEATS_S04: Beat<'s04'>[] = [['samarkand', 0], ['asOldAsRome', 0], ['timur', 0], ['timur', 0.6], ['empire', 0], ['craftsmen', 0], ['mission', 0], ['mission', 0.3], ['descendants', 0], ['registan', 0], ['registan', 0.6], ['registan', 1.1], ['registan', 1.6], ['tiles', 0], ['tiles', 0.4], ['tiles', 1.5], ['tiles', 2.4], ['ulughBeg', 0], ['ulughBeg', 0.8], ['ulughBeg', 1.4], ['yearLength', 0], ['precision', 0], ['scientific', 0], ['scientific', 0.6]];

const SAMARKAND: [number, number] = [66.97, 39.65];
/** Stylized extent of Timur's realm at its height (schematic, not a historical border). */
const TIMUR_POLY: Array<[number, number]> = [
  [29, 40.5], [34, 42], [41, 42.5], [47, 44], [52, 46.5], [58, 47.5], [66, 47], [74, 45.5], [79, 43], [80, 37], [78, 30.5], [74, 27.5],
  [66, 26.5], [60, 25.5], [56, 26.5], [51, 28.5], [47, 30.5], [43, 32], [38, 33.5], [35, 35.5], [31, 37],
];
const CONQUERED: Array<[number, number]> = [
  [46.3, 38.1], // Tabriz
  [52.5, 29.6], // Shiraz
  [77.2, 28.6], // Delhi
  [36.3, 33.5], // Damascus
  [44.4, 33.3], // Baghdad
  [62.2, 34.3], // Herat
];

export const Scene04Samarkand: React.FC = () => {
  const { c } = useScene('s04');
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const mapIn = c('timur') - 6;
  const registanIn = c('registan');
  const madrasaX = [0.2, 0.5, 0.8];
  const madrasaOrder = [0, 2, 1]; // data order: Ulugh Beg (left), Sher-Dor (right), Tilya-Kori (centre)

  return (
    <UzScene
      id="s04"
      pushIn={0.03}
      moves={[
        { at: c('empire'), scale: 1.12, focus: [900, 520], duration: 40 },
        { at: c('descendants') - 10, scale: 1.0, focus: [960, 540], duration: 20 },
        { at: c('tiles', 1.5), scale: 1.1, focus: [1100, 520], duration: 50 },
        { at: c('ulughBeg') - 8, scale: 1.0, focus: [960, 540], duration: 16 },
        { at: c('scientific'), scale: 1.08, focus: [1000, 400], duration: 50 },
      ]}
      overlay={
        <>
          <QuestionPin at={0} />
          <Between from={0} to={c('ulughBeg') - 10}>
            <SourceTag dataset={samarkand} />
          </Between>
          <Between from={c('ulughBeg')}>
            <SourceTag dataset={ulughBeg} />
          </Between>
        </>
      }
    >
      {/* ── City card ─────────────────────────────────────────────────────────────────────────────── */}
      <Between from={0} to={mapIn + 8} fade={6}>
        <CityCard
          name="SAMARKAND"
          lonLat={SAMARKAND}
          at={c('samarkand')}
          age={{ to: samarkand.data.ageYears, suffix: '+ YEARS', label: `FOUNDED ${samarkand.data.foundedLabel}` }}
          subtitle="roughly as old as Rome"
          subtitleAt={c('asOldAsRome')}
          outAt={mapIn - 4}
          inset={{ left: 1300, top: 620 }}
        />
      </Between>

      {/* ── Timur's empire spreads from Samarkand ─────────────────────────────────────────────────── */}
      <Between from={mapIn} to={c('descendants') - 4} fade={10}>
        <WorldMap
          fitBounds={{ west: 24, east: 90, south: 18, north: 52 }}
          resolution="50m"
          land="#DDD5C5"
          overlay={(api) => {
            const sc = api.project(SAMARKAND)!;
            const d = 'M' + TIMUR_POLY.map((ll) => api.project(ll)!.map((v) => v.toFixed(1)).join(',')).join('L') + 'Z';
            const r = interpolate(frame, [c('timur', 0.6), c('empire', 0.6)], [0, 1500], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 2) });
            const ends: Array<[string, [number, number], number]> = [
              ['ANATOLIA', [31, 39], 0],
              ['INDIA', [77, 29], 1],
            ];
            return (
              <>
                <defs>
                  <clipPath id="timur-spread">
                    <circle cx={sc[0]} cy={sc[1]} r={r} />
                  </clipPath>
                </defs>
                <g clipPath="url(#timur-spread)">
                  <path d={d} fill={PALETTE.terracotta} opacity={0.35} />
                  <path d={d} fill="none" stroke={PALETTE.terracotta} strokeWidth={4} strokeDasharray="10 7" />
                </g>
                {ends.map(([name, ll, i]) => {
                  const p = api.project(ll)!;
                  return (
                    <foreignObject key={name} x={p[0] - 160} y={p[1] - 30} width={320} height={70}>
                      <Words words={[name]} at={c('empire') + i * 14} font="headline" size={44} color={PALETTE.ink} style={{ left: 0, right: 0, justifyContent: 'center' }} />
                    </foreignObject>
                  );
                })}
                <RouteLayer
                  api={api}
                  nodes={[{ id: 'sam', lonLat: SAMARKAND, label: 'SAMARKAND', at: c('timur'), pulse: true, color: PALETTE.lapis, r: 12 }]}
                  routes={CONQUERED.map((ll, i) => ({
                    id: `cr${i}`,
                    points: [ll, SAMARKAND],
                    at: c('craftsmen') + i * 5,
                    duration: 30,
                    color: PALETTE.lapis,
                    width: 3,
                    style: 'dotted',
                    bend: 0.15,
                    markers: [{ at: c('craftsmen') + 10 + i * 5, duration: 60, render: () => <SilkIcon name={(['guide', 'glass', 'paper', 'guide', 'silk', 'guide'] as const)[i]} size={48} /> }],
                  }))}
                />
              </>
            );
          }}
        />
        <Cutout enterAt={c('timur', 0.4)} from="left" rotation={-2} seed="timur" style={{ left: 120, top: 740 }} background="#FBFAF6">
          <div style={{ padding: '22px 34px' }}>
            <div style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 64, color: PALETTE.ink }}>TIMUR</div>
            <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 44, color: PALETTE.terracotta }}>"Tamerlane" in the West</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 6, fontFamily: F.mono, fontSize: 24, color: PALETTE.greyDark }}>
              CAPITAL SAMARKAND FROM
              <BigCounter grouping={false} from={1300} to={samarkand.data.timurCapitalFrom} at={c('timur', 0.8)} duration={30} fontSize={52} color={PALETTE.ink} />
            </div>
          </div>
        </Cutout>
        {/* "one mission": a blueprint pattern draws on a lapis card */}
        <Cutout enterAt={c('mission')} from="bottom" rotation={3} seed="blueprint" style={{ left: 1260, top: 560 }} background={PALETTE.lapisPaper}>
          <div style={{ position: 'relative', width: 480, height: 360, overflow: 'hidden' }}>
            <GeometricPattern tiling="3.12.12" size={40} width={480} height={360} origin={[240, 180]} draw={{ at: c('mission', 0.3), duration: 20, spread: 50 }} stroke="#F2EEE6" strokeWidth={2} />
            <div style={{ position: 'absolute', left: 16, bottom: 10, fontFamily: F.mono, fontSize: 20, letterSpacing: 3, color: '#F2EEE6' }}>THE BRIEF</div>
          </div>
        </Cutout>
      </Between>

      {/* ── his descendants kept building ─────────────────────────────────────────────────────────── */}
      <Between from={c('descendants') - 4} to={registanIn - 4} fade={6}>
        <Words words={['TIMUR', '→  SHAH RUKH', '→  ULUGH BEG']} at={c('descendants')} stagger={10} font="headline" size={84} gap={20} direction="column" style={{ left: 560, top: 300 }} />
      </Between>

      {/* ── The Registan: three madrasas, labelled one by one ─────────────────────────────────────── */}
      <Between from={registanIn - 2} to={c('ulughBeg') - 6} fade={8}>
        <PhotoCutout
          {...photoProps('P01')}
          width={1520}
          height={860}
          enterAt={registanIn}
          from="scale"
          rotation={-1}
          style={{ left: 200, top: 110 }}
          kenBurns={{ from: { scale: 1.0, focus: [0.5, 0.5] }, to: { scale: 1.08, focus: [0.5, 0.45] }, at: registanIn, duration: 160 }}
        >
          {madrasaOrder.map((di, k) => {
            const m = samarkand.data.madrasas[di];
            const x = madrasaX[k] * 1520;
            const at = registanIn + 18 + k * 16;
            return (
              <HandDrawnAnnotation
                key={m.name}
                shape={{ type: 'underline', x: x - 170, y: 780, width: 340 }}
                at={at}
                width={1520}
                height={860}
                color="ink"
                strokeWidth={6}
                label={{ text: `${m.name.replace(' MADRASA', '')} · {n}`, x, y: 760, size: 46, count: { from: m.fromYear - 60, to: m.fromYear, duration: 22, grouping: false } }}
              />
            );
          })}
        </PhotoCutout>
        {/* P02: the mosaic assembles over the tile detail */}
        <PhotoCutout {...photoProps('P02')} width={1000} height={660} enterAt={c('tiles')} from="right" rotation={3} seed="p02" style={{ left: 820, top: 300 }} kenBurns={{ from: { scale: 1.15, focus: [0.5, 0.58] }, to: { scale: 1.3, focus: [0.45, 0.6] }, at: c('tiles'), duration: 120 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: interpolate(frame, [c('tiles', 2.4), c('tiles', 3.2)], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            <GeometricPattern tiling="4.8.8" size={56} width={1000} height={660} origin={[0, 660]} fill={{ at: c('tiles', 0.4), duration: 8, spread: 40, mode: 'in', colors: [PALETTE.turquoise, PALETTE.lapis, PALETTE.saffron] }} stroke="#FBFAF6" strokeWidth={2} />
          </div>
        </PhotoCutout>
        <div style={{ position: 'absolute', left: 230, top: 990, display: 'flex', gap: 24 }}>
          {(
            [
              ['TURQUOISE', PALETTE.turquoise],
              ['COBALT', PALETTE.lapis],
              ['GOLD', PALETTE.saffron],
            ] as const
          ).map(([n, col], i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: interpolate(frame, [c('tiles') + 8 + i * 8, c('tiles') + 16 + i * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <span style={{ width: 34, height: 34, background: col, display: 'inline-block' }} />
              <span style={{ fontFamily: F.mono, fontSize: 28, letterSpacing: 2, color: PALETTE.ink }}>{n}</span>
            </div>
          ))}
        </div>
      </Between>

      {/* ── Ulugh Beg: observatory, star chart, the year ──────────────────────────────────────────── */}
      <Between from={c('ulughBeg') - 6} to={c('scientific') - 6} fade={8}>
        <PhotoCutout {...photoProps('P05')} width={860} height={560} enterAt={c('ulughBeg')} from="left" rotation={-2} seed="p05" style={{ left: 110, top: 150 }} kenBurns={{ from: { scale: 1.05, focus: [0.4, 0.55] }, to: { scale: 1.18, focus: [0.35, 0.55] }, at: c('ulughBeg'), duration: 200 }}>
          <HandDrawnAnnotation shape={{ type: 'arrow', from: [700, 120], to: [470, 260] }} at={c('ulughBeg', 1.4)} width={860} height={560} color="#FBFAF6" label={{ text: "Ulugh Beg's observatory", x: 640, y: 90, size: 46 }} />
        </PhotoCutout>
        <StarChart at={c('ulughBeg', 0.8)} x={1060} y={130} w={720} h={420} />
        <DocumentCard
          variant="paper"
          header="ZIJ-I SULTANI"
          meta={String(ulughBeg.data.measuredIn)}
          kicker="ULUGH BEG · SAMARKAND"
          title="Length of the sidereal year"
          paragraphs={[
            [
              { text: '{n} d ', count: { to: ulughBeg.data.days, at: c('yearLength', 0.5), duration: 30 }, style: { fontSize: 44, fontWeight: 700, color: PALETTE.ink } },
              { text: '{n} h ', count: { to: ulughBeg.data.hours, at: c('yearLength', 0.9), duration: 14 }, style: { fontSize: 44, fontWeight: 700, color: PALETTE.ink } },
              { text: '{n} min ', count: { to: ulughBeg.data.minutes, at: c('yearLength', 1.2), duration: 14 }, style: { fontSize: 44, fontWeight: 700, color: PALETTE.ink } },
              { text: '{n} s', count: { to: ulughBeg.data.seconds, at: c('yearLength', 1.5), duration: 14 }, style: { fontSize: 44, fontWeight: 700, color: PALETTE.ink } },
            ],
            [{ text: 'off the modern value by only ' }, { text: '{n} seconds', highlight: true, count: { to: ulughBeg.data.errorSeconds, duration: 24 } }],
          ]}
          fillerPerParagraph={1}
          highlightAt={c('precision')}
          enterAt={c('yearLength')}
          from="bottom"
          width={760}
          seed="zij"
          style={{ left: 980, top: 470 }}
        />
      </Between>

      {/* ── "one of the scientific capitals of its time" ──────────────────────────────────────────── */}
      <Between from={c('scientific') - 4}>
        <PhotoCutout {...photoProps('P04')} width={1300} height={800} enterAt={c('scientific')} from="bottom" rotation={1.5} seed="p04-s4" style={{ left: 310, top: 140 }} kenBurns={{ from: { scale: 1.0, focus: [0.4, 0.45] }, to: { scale: 1.1, focus: [0.4, 0.38] }, at: c('scientific'), duration: 100 }}>
          <HandDrawnAnnotation shape={{ type: 'circle', cx: 520, cy: 330, rx: 330, ry: 260 }} at={c('scientific', 0.6)} width={1300} height={800} color={PALETTE.saffron} label={{ text: 'a scientific capital', x: 1000, y: 140, size: 64 }} />
        </PhotoCutout>
      </Between>
    </UzScene>
  );
};
