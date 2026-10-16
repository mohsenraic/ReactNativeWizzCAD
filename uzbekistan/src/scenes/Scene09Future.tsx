/**
 * Scene 9 — What's next (7:28–8:16). Chapter "5 — WHAT'S NEXT".
 * The bar chart returns and extends: 2025 (11.7M) → dotted 2030 target bar (20M), "+71%" brace, UN Tourism badge.
 * "Won't be easy" → three pinned challenge cards: hotels & guides (icons multiply), overtourism (crowd heatmap
 * over a stylized old town), awareness (Central Asia greyed out on a world map, then filling with colour).
 * "The momentum is real" → visas / travellers / 2026 growth counters tick up together, new routes draw behind,
 * a polaroid of the blue domes lands.
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedBarChart } from '../../../shared/components/AnimatedBarChart';
import { BigCounter } from '../../../shared/components/BigCounter';
import { Cutout } from '../../../shared/components/Cutout';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { IconCard } from '../../../shared/components/IconCard';
import { PhotoCutout } from '../../../shared/components/PhotoCutout';
import { RouteMap } from '../../../shared/components/RouteMap';
import { SourceTag } from '../../../shared/components/SourceTag';
import { WorldMap } from '../../../shared/components/WorldMap';
import { SPRINGS, useTheme } from '../../../shared/theme';
import { Heatmap } from '../components/illustrations';
import { SilkIcon, SilkIconSvg } from '../components/silkIcons';
import { arrivals2025, arrivalsSeries, momentum, newRoutes, regions, start2026, target2030, TARGET_INCREASE_PCT, visaCount2025 } from '../data/data';
import { photoProps } from '../data/photos';
import { PALETTE } from '../theme';
import { Between, QuestionPin, UzScene, useScene, Beat } from './common';

/** Extra visual beats as [cue, offset s] (null = seconds from scene start) — checked by retentionGaps(). */
export const BEATS_S09: Beat<'s09'>[] = [['next', 0], ['target', 0], ['unTourism', 0], ['twoThirds', 0], ['notEasy', 0], ['hotels', 0], ['hotels', 0.8], ['overtourism', 0], ['overtourism', 0.4], ['venice', 0], ['awareness', 0], ['blankSpace', 0], ['blankSpace', 1.4], ['momentum', 0], ['everyRoute', 0], ['photos', 0]];

const TASHKENT: [number, number] = [69.24, 41.31];

export const Scene09Future: React.FC = () => {
  const { c } = useScene('s09');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  const series = arrivalsSeries.data.filter((p) => p.year >= 2016);
  const bars = [
    ...series.map((p) => ({ label: String(p.year), value: p.value })),
    { label: `${target2030.data.year}`, value: target2030.data.touristsM, kind: 'projection' as const, at: c('target'), color: PALETTE.terracotta },
  ];
  const iTarget = bars.length - 1;
  const i2025 = bars.length - 2;
  const box = { width: 1400, height: 800 };
  const cardsIn = c('notEasy');
  const mapIn = c('blankSpace') - 10;
  const momIn = c('momentum') - 6;

  return (
    <UzScene
      id="s09"
      pushIn={0.03}
      moves={[
        { at: c('twoThirds'), scale: 1.1, focus: [1300, 400], duration: 30 },
        { at: cardsIn - 10, scale: 1.0, focus: [960, 540], duration: 14 },
      ]}
      overlay={
        <>
          <QuestionPin at={0} outAt={cardsIn - 20} />
          <Between from={0} to={cardsIn - 6}>
            <SourceTag dataset={arrivalsSeries} also={[target2030]} />
          </Between>
          <Between from={momIn}>
            <SourceTag dataset={momentum} also={[newRoutes]} />
          </Between>
        </>
      }
    >
      {/* ── the target bar ─────────────────────────────────────────────────────────────────────────── */}
      <Between from={0} to={cardsIn - 4} fade={8}>
        <AnimatedBarChart
          {...box}
          style={{ left: 160, top: 150 }}
          bars={bars}
          yMax={21}
          yTicks={[5, 10, 15, 20]}
          yTickFormat={(v) => `${v}M`}
          grow={{ at: c('next'), stagger: 3, duration: 16 }}
          valueLabels={[i2025]}
          valueFormat={{ decimals: 1, suffix: 'M' }}
          highlight={{ index: iTarget, at: c('target'), color: PALETTE.terracotta, marker: true }}
          overlay={(s) => {
            const a = s.bar(i2025);
            const b = s.bar(iTarget);
            return (
              <HandDrawnAnnotation
                shape={{ type: 'arrow', from: [a.cx, a.top - 70], to: [b.cx - 30, b.top - 20], bend: -0.25 }}
                at={c('twoThirds')}
                width={box.width}
                height={box.height}
                label={{ text: '{n}%', x: (a.cx + b.cx) / 2 - 40, y: Math.min(a.top, b.top) - 80, size: 84, count: { to: TARGET_INCREASE_PCT, sign: 'always' } }}
              />
            );
          }}
        />
        <Cutout enterAt={c('unTourism')} from="left" rotation={-2} seed="untourism" style={{ left: 220, top: 70 }} background="#FBFAF6">
          <div style={{ padding: '14px 26px', fontFamily: F.mono, fontSize: 24, letterSpacing: 2, color: PALETTE.lapis }}>
            GOVERNMENT TARGET · WITH UN TOURISM COOPERATION
          </div>
        </Cutout>
      </Between>

      {/* ── three challenges ──────────────────────────────────────────────────────────────────────── */}
      <Between from={cardsIn - 4} to={mapIn + 4} fade={8}>
        {(
          [
            ['hotel', 'HOTELS & GUIDES', 'capacity', c('hotels')],
            ['crowd', 'OVERTOURISM', 'fragile old towns', c('overtourism')],
            ['mapBlank', 'AWARENESS', 'perception', c('awareness')],
          ] as const
        ).map(([icon, label, note, at], i) => (
          <IconCard key={label} icon={<SilkIconSvg name={icon} size={150} />} label={label} note={note} enterAt={at} from="top" seed={`ch-${i}`} rotation={[-3, 2, -1.5][i]} style={{ left: 150 + i * 560, top: 70 }} />
        ))}
        {/* hotels & guides: supply has to keep up */}
        <Between from={c('hotels', 0.6)} to={c('overtourism') - 4}>
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            {Array.from({ length: 18 }, (_, i) => {
              const s = spring({ frame: frame - (c('hotels', 0.8) + i * 3), fps, config: SPRINGS.cutout });
              return s > 0.01 ? (
                <g key={i} transform={`translate(${260 + (i % 9) * 170} ${610 + Math.floor(i / 9) * 170}) scale(${s})`}>
                  <SilkIcon name={i % 3 === 2 ? 'guide' : 'hotel'} size={110} />
                </g>
              ) : null;
            })}
          </svg>
        </Between>
        {/* overtourism: heat over an old town */}
        <Between from={c('overtourism') - 4} to={c('awareness') - 4}>
          <Heatmap at={c('overtourism', 0.4)} x={520} y={540} w={880} h={440} hotspots={[[0.42, 0.45], [0.6, 0.6], [0.3, 0.7]]} />
          <div style={{ position: 'absolute', left: 1440, top: 640, fontFamily: F.mono, fontSize: 28, letterSpacing: 2, color: PALETTE.greyDark, opacity: interpolate(frame, [c('venice'), c('venice') + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            SEEN IN:
            <div style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 56, color: PALETTE.ink, letterSpacing: 1 }}>VENICE</div>
            <div style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 56, color: PALETTE.ink, letterSpacing: 1 }}>BARCELONA</div>
          </div>
          <div style={{ position: 'absolute', left: 530, top: 990, fontFamily: F.mono, fontSize: 20, letterSpacing: 2, color: PALETTE.greyDark }}>STYLIZED OLD-TOWN PLAN · ILLUSTRATIVE CROWD DENSITY</div>
        </Between>
      </Between>

      {/* ── "a blank space on the map" ────────────────────────────────────────────────────────────── */}
      <Between from={mapIn} to={momIn + 4} fade={8}>
        <WorldMap
          centerLon={60}
          padding={[60, 100]}
          land="#8FB0C4"
          highlight={regions.centralAsia.map((iso, i) => ({ iso, at: 0, color: '#EDE7DA', outAt: c('blankSpace', 1.4) + i * 4 }))}
          overlay={(api) => {
            const p = api.project([66, 42])!;
            const fillP = interpolate(frame, [c('blankSpace', 1.4), c('blankSpace', 2)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <>
                {regions.centralAsia.map((iso) => (
                  <path key={iso} d={api.countryPath(iso)} fill={iso === regions.uzbekistan ? PALETTE.turquoise : PALETTE.turquoiseLight} opacity={fillP} />
                ))}
                <text x={p[0]} y={p[1] - 120} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={64} fill={PALETTE.questionRed} opacity={1 - fillP}>
                  blank?
                </text>
              </>
            );
          }}
        />
      </Between>

      {/* ── the momentum is real ──────────────────────────────────────────────────────────────────── */}
      <Between from={momIn}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
          <RouteMap
            centerLon={64}
            fitBounds={{ west: -10, east: 135, south: -5, north: 62 }}
            land="#DDD5C5"
            borders={false}
            routes={newRoutes.data.map((r, i) => ({ id: r.city, points: [r.lonLat, TASHKENT], at: c('everyRoute') + i * 5, duration: 30, color: PALETTE.lapis, width: 3, bend: 0.2 }))}
          />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 120 }}>
          {(
            [
              [visaCount2025.data.approxCountries, 0, '', '', 'AROUND', 'VISA-EASY COUNTRIES'],
              [arrivals2025.data.totalM, 1, '', 'M', 'IN 2025', 'FOREIGN VISITORS'],
              [start2026.data.increasePct, 0, '+', '%', 'JAN–FEB 2026', 'VS. A YEAR EARLIER'],
            ] as const
          ).map(([v, dec, pre, suf, kicker, label], i) => (
            <div key={label} style={{ textAlign: 'center', opacity: interpolate(frame, [momIn + i * 4, momIn + i * 4 + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: 2, color: PALETTE.greyDark }}>{kicker}</div>
              <BigCounter to={v} decimals={dec} prefix={pre} suffix={suf} at={momIn + i * 4} duration={50} fontSize={150} color={[PALETTE.turquoise, PALETTE.lapis, PALETTE.terracotta][i]} clicks={i === 1} />
              <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: 2, color: PALETTE.ink }}>{label}</div>
            </div>
          ))}
        </div>
        <PhotoCutout {...photoProps('P04')} width={520} height={340} enterAt={c('photos')} from="bottom" rotation={-7} seed="polaroid" border={18} style={{ left: 1280, top: 640 }} />
      </Between>
    </UzScene>
  );
};
