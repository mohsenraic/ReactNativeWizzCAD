/**
 * Scene 7 — The opening (4:46–6:10). Chapter "3 — WHY NOW". Three-part structure with 1 / 2 / 3 tabs.
 * "Soviet Union" → USSR hatched, Uzbekistan lit; 1991. "Hardest to visit" → a messy pile of paperwork with stamps.
 * "2016" → the year flips, the documents fly away, arrivals start climbing. "First, visas" → <VisaMap>, ~90.
 * Passport. "Second, trains" → Afrosiyob route with the P12 train riding it; road vs. rail bars; three cities in
 * one week. "Third, flights" → new routes multiply into Tashkent, hotels / airports pop.
 * "Uzbekistan is open" → the padlock opens and the "?" pinned since Scene 1 is crossed out.
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedBarChart } from '../../../shared/components/AnimatedBarChart';
import { BigCounter } from '../../../shared/components/BigCounter';
import { Cutout } from '../../../shared/components/Cutout';
import { DocumentCard } from '../../../shared/components/DocumentCard';
import { usePhotoReady } from '../../../shared/components/PhotoCutout';
import { RouteMap } from '../../../shared/components/RouteMap';
import { SourceTag } from '../../../shared/components/SourceTag';
import { Stamp, useStampShake } from '../../../shared/components/Stamp';
import { WorldMap } from '../../../shared/components/WorldMap';
import { SPRINGS, useTheme } from '../../../shared/theme';
import { Sfx } from '../../../shared/lib/sfx';
import { Passport } from '../components/illustrations';
import { SilkIcon } from '../components/silkIcons';
import { VisaMap } from '../components/VisaMap';
import { afrosiyob, arrivalsSeries, newRoutes, openingTimeline, regions, visaCount2025, visaFree } from '../data/data';
import { photoSrc, PHOTOS } from '../data/photos';
import { PALETTE } from '../theme';
import { Between, QuestionPin, UzScene, useScene, Words, Beat } from './common';

/** Extra visual beats as [cue, offset s] (null = seconds from scene start) — checked by retentionGaps(). */
export const BEATS_S07: Beat<'s07'>[] = [['hard', 0], ['soviet', 0], ['soviet', 0.5], ['independence', 0], ['hardest', 0], ['hardest', 0.4], ['paperwork', 0], ['paperwork', 0.5], ['paperwork', 1], ['y2016', 0], ['openUp', 0], ['threeChanges', 0], ['visas', 0], ['evisa', 0], ['visaFree', 0], ['visaFree', 2.4], ['ninety', 0], ['passport', 0], ['passport', 0.7], ['trains', 0], ['afrosiyob', 0], ['afrosiyob', 1], ['fullDay', 0], ['fewHours', 0], ['threeCities', 0], ['singleWeek', 0], ['flights', 0], ['flights', 1], ['hotels', 0], ['cheaper', 0], ['open', 0], ['open', 0.7], ['forVisitors', 0]];

const TASHKENT: [number, number] = [69.24, 41.31];

const TrainMarker: React.FC = () => <TrainImage />;
const TrainImage: React.FC = () => (
  <g transform="translate(0 -74) rotate(-3)">
    <rect x={-110} y={-62} width={220} height={124} fill="#FBFAF6" />
    <image href={photoSrc('P12')} x={-104} y={-56} width={208} height={112} preserveAspectRatio="xMidYMid slice" />
  </g>
);

export const Scene07Opening: React.FC = () => {
  const { c } = useScene('s07');
  usePhotoReady(photoSrc('P12'));
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  const docsOut = c('y2016', 0.3);
  const tabsIn = c('threeChanges');
  const tabActive = frame >= c('flights') ? 2 : frame >= c('trains') ? 1 : frame >= c('visas') ? 0 : -1;
  const lockAt = c('open') - 8;
  const lockShake = useStampShake(c('forVisitors'), 10);
  const sparkYears = arrivalsSeries.data.filter((p) => p.year >= 2016 && p.year <= 2019);

  const docs: Array<{ title: string; kicker: string; variant: 'brief' | 'report' | 'clipping' | 'paper'; stamp: string; x: number; y: number; r: number; exit: 'left' | 'right' | 'top' | 'bottom' }> = [
    { title: 'Visa application', kicker: 'FORM 1 · CONSULATE', variant: 'brief', stamp: 'PENDING', x: 180, y: 160, r: -6, exit: 'left' },
    { title: 'Registration slip', kicker: 'EVERY NIGHT, EVERY HOTEL', variant: 'report', stamp: 'REQUIRED', x: 820, y: 120, r: 5, exit: 'top' },
    { title: 'Letter of invitation', kicker: 'SPONSOR · NOTARISED', variant: 'paper', stamp: 'MISSING', x: 300, y: 520, r: 3, exit: 'bottom' },
    { title: 'Currency exchange', kicker: 'OFFICIAL RATE ONLY', variant: 'clipping', stamp: 'VOID', x: 1050, y: 480, r: -4, exit: 'right' },
  ];

  return (
    <UzScene
      id="s07"
      pushIn={0.02}
      moves={[
        { at: c('independence'), scale: 1.15, focus: [760, 470], duration: 30 },
        { at: c('hardest') - 10, scale: 1.0, focus: [960, 540], duration: 20 },
        { at: c('singleWeek'), scale: 1.06, focus: [960, 560], duration: 30 },
        { at: c('flights') - 4, scale: 1.0, focus: [960, 540], duration: 12 },
        { at: c('cheaper'), scale: 1.12, focus: [1000, 470], duration: 40 },
        { at: c('open') - 12, scale: 1.0, focus: [960, 540], duration: 10 },
      ]}
      overlay={
        <>
          <QuestionPin at={0} crossAt={c('open', 0.7)} />
          {/* 1 / 2 / 3 tabs */}
          {frame >= tabsIn && frame < c('open') && (
            <div style={{ position: 'absolute', left: 110, top: 36, display: 'flex', gap: 18 }}>
              {['VISAS', 'TRAINS', 'FLIGHTS'].map((t, i) => {
                const s = spring({ frame: frame - (tabsIn + i * 5), fps, config: SPRINGS.cutout });
                const active = i === tabActive;
                return (
                  <div
                    key={t}
                    style={{
                      transform: `translateY(${(1 - s) * -80}px) rotate(${active ? -2 : 0}deg) scale(${active ? 1.08 : 1})`,
                      background: active ? PALETTE.turquoise : '#FBFAF6',
                      color: active ? '#FBFAF6' : PALETTE.ink,
                      fontFamily: F.headline,
                      fontWeight: 700,
                      fontSize: 40,
                      padding: '8px 22px',
                      boxShadow: '0 6px 14px rgba(0,0,0,0.2)',
                      letterSpacing: 2,
                    }}
                  >
                    <span style={{ color: active ? PALETTE.saffron : PALETTE.terracotta, marginRight: 12 }}>{i + 1}</span>
                    {t}
                  </div>
                );
              })}
            </div>
          )}
          <Between from={0} to={c('threeChanges') - 6}>
            <SourceTag dataset={openingTimeline} also={[arrivalsSeries]} />
          </Between>
          <Between from={c('visas')} to={c('trains') - 6}>
            <SourceTag dataset={visaFree} also={[visaCount2025]} />
          </Between>
          <Between from={c('trains')} to={c('flights') - 6}>
            <SourceTag dataset={afrosiyob} />
            <SourceTag prefix="PHOTO:" text={`${PHOTOS.P12.author} / ${PHOTOS.P12.license}`} align="right" />
          </Between>
          <Between from={c('flights')} to={c('open') - 6}>
            <SourceTag dataset={newRoutes} />
          </Between>
        </>
      }
    >
      {/* ── A. USSR → independence ────────────────────────────────────────────────────────────────── */}
      <Between from={0} to={c('hardest') - 4} fade={10}>
        <WorldMap
          fitBounds={{ west: 18, east: 180, south: 30, north: 80 }}
          projection="equirectangular"
          land="#D9D2C4"
          highlight={[
            { iso: regions.uzbekistan, at: c('soviet'), color: PALETTE.turquoise },
            ...regions.ussr.filter((i) => i !== regions.uzbekistan).map((iso, k) => ({ iso, at: c('hard') + k * 3, color: '#BFAF98', pattern: 'hatch' as const })),
          ]}
        />
        <div style={{ position: 'absolute', left: 1240, top: 720 }}>
          <Words words={['USSR']} at={c('soviet', 0.5)} font="headline" size={120} color={PALETTE.ink} style={{ position: 'relative' }} />
        </div>
        <Between from={c('independence') - 2}>
          <div style={{ position: 'absolute', left: 200, top: 760 }}>
            <div style={{ fontFamily: F.mono, fontSize: 28, letterSpacing: 2, color: PALETTE.greyDark }}>INDEPENDENCE</div>
            <BigCounter grouping={false} from={1960} to={1991} at={c('independence')} duration={24} fontSize={150} color={PALETTE.turquoise} />
          </div>
        </Between>
      </Between>

      {/* ── B. the paperwork pile ─────────────────────────────────────────────────────────────────── */}
      <Between from={c('hardest') - 6} to={c('openUp') - 6} fade={8}>
        {docs.map((d, i) => (
          <React.Fragment key={d.title}>
            <DocumentCard
              variant={d.variant}
              kicker={d.kicker}
              title={d.title}
              paragraphs={['Name · nationality · purpose of visit', 'Dates · address · sponsor']}
              fillerPerParagraph={2}
              enterAt={c('hardest') + i * 12}
              from={(['left', 'top', 'bottom', 'right'] as const)[i]}
              exitAt={docsOut + i * 3}
              rotation={d.r}
              width={620}
              seed={`doc-${i}`}
              style={{ left: d.x, top: d.y }}
            />
            {frame < docsOut + i * 3 + 4 && <Stamp text={d.stamp} at={c('paperwork') + i * 14} fontSize={74} rotation={-12 + i * 6} color={PALETTE.questionRed} style={{ left: d.x + 260, top: d.y + 180 }} />}
          </React.Fragment>
        ))}
        {/* 2016: the year flips, everything flies away */}
        <Between from={c('y2016') - 4}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center' }}>
            <BigCounter grouping={false} from={1991} to={2016} at={c('y2016')} duration={22} fontSize={300} color={PALETTE.ink} />
            <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: 3, color: PALETTE.greyDark, opacity: interpolate(frame, [c('y2016', 0.8), c('y2016', 1.2)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              SHAVKAT MIRZIYOYEV ELECTED · DEC 2016
            </div>
          </div>
        </Between>
      </Between>

      {/* ── "began to open up. Fast." — arrivals 2016 → 2019 ──────────────────────────────────────── */}
      <Between from={c('openUp') - 6} to={c('visas') - 4} fade={6}>
        <AnimatedBarChart
          width={900}
          height={560}
          style={{ left: 510, top: 250 }}
          bars={sparkYears.map((p) => ({ label: String(p.year), value: p.value }))}
          yMax={7.5}
          yTicks={[2, 4, 6]}
          yTickFormat={(v) => `${v}M`}
          grow={{ at: c('openUp'), stagger: 6, duration: 14 }}
          valueLabels="all"
          valueFormat={{ decimals: 1, suffix: 'M' }}
          barWidth={0.6}
          color={PALETTE.turquoise}
        />
      </Between>

      {/* ── 1. VISAS ─────────────────────────────────────────────────────────────────────────────── */}
      <Between from={c('visas') - 4} to={c('passport') + 40} fade={8}>
        <VisaMap
          steps={[
            { ...visaFree.data[0], at: c('visas') },
            { ...visaFree.data[1], at: c('evisa') },
            { ...visaFree.data[2], at: c('visaFree') },
            { ...visaFree.data[3], at: c('visaFree', 2.4) },
            { ...visaFree.data[4], at: c('ninety') - 10 },
          ]}
          counter={{ at: c('ninety'), to: visaCount2025.data.approxCountries, kicker: 'AROUND', label: 'COUNTRIES WITH EASIER ENTRY' }}
          labelTop={150}
        />
        <Words words={['E-VISA FROM JULY 2018']} at={c('evisa')} font="mono" size={30} color={PALETTE.lapis} style={{ left: 120, top: 300 }} outAt={c('visaFree')} />
      </Between>
      <Between from={c('passport') - 4} to={c('trains') - 4} fade={6}>
        <Cutout enterAt={c('passport')} from="bottom" rotation={-6} seed="passport" style={{ left: 790, top: 300 }} background={PALETTE.lapis} border={0}>
          <Passport />
        </Cutout>
        <Stamp text="ENTRY" at={c('passport', 0.7)} fontSize={80} rotation={-14} color={PALETTE.turquoise} style={{ left: 1010, top: 650 }} />
      </Between>

      {/* ── 2. TRAINS ────────────────────────────────────────────────────────────────────────────── */}
      <Between from={c('trains') - 4} to={c('flights') - 4} fade={8}>
        <RouteMap
          fitBounds={{ west: 57.5, east: 73, south: 36.5, north: 45 }}
          resolution="50m"
          land="#E4DED2"
          highlight={[{ iso: '860', at: 0, color: '#D6CDB9' }]}
          nodes={afrosiyob.data.stops.map((s, i) => ({ id: s.id, lonLat: s.lonLat, label: s.name, at: c('afrosiyob') + i * 8, color: PALETTE.lapis, r: frame >= c('threeCities') ? 14 : 10, pulse: frame >= c('threeCities'), dy: s.id === 'bukhara' ? 38 : -18 }))}
          routes={[
            {
              id: 'hsr',
              points: afrosiyob.data.stops.map((s) => s.lonLat),
              at: c('afrosiyob'),
              duration: 50,
              color: PALETTE.turquoise,
              width: 9,
              bend: 0.04,
              markers: [{ at: c('afrosiyob') + 30, duration: 140, render: () => <TrainMarker /> }],
            },
          ]}
        />
        {/* road vs rail */}
        <Cutout enterAt={c('fullDay')} from="right" rotation={1.5} seed="bars" style={{ left: 1200, top: 790 }} background="#FBFAF6">
          <div style={{ width: 640, padding: '24px 28px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: 2, color: PALETTE.greyDark, marginBottom: 10 }}>TASHKENT → BUKHARA</div>
            {(
              [
                ['ROAD', afrosiyob.data.roadTashkentBukharaHours[1], `${afrosiyob.data.roadTashkentBukharaHours[0]}–`, PALETTE.terracotta, c('fullDay', 0.3)],
                ['TRAIN', afrosiyob.data.railTashkentBukharaHours, 'ABOUT ', PALETTE.turquoise, c('fewHours')],
              ] as const
            ).map(([label, h, pre, col, at]) => {
              const w = interpolate(frame, [at, at + 24], [0, (h / 10) * 380], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, height: 70 }}>
                  <span style={{ width: 90, fontFamily: F.headline, fontWeight: 700, fontSize: 34, color: PALETTE.ink }}>{label}</span>
                  <span style={{ width: w, height: 34, background: col, display: 'inline-block' }} />
                  {frame >= at && (
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontFamily: F.mono, fontSize: 22, color: PALETTE.greyDark }}>
                      {pre}
                      <BigCounter to={h} at={at} duration={24} suffix=" H" fontSize={42} color={col} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Cutout>
        {/* three cities in a single week */}
        <Between from={c('singleWeek') - 6}>
          <div style={{ position: 'absolute', left: 140, top: 780, display: 'flex', gap: 10 }}>
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => {
              const city = i === 0 ? 'TASHKENT' : i === 2 ? 'SAMARKAND' : i === 4 ? 'BUKHARA' : '';
              const o = interpolate(frame, [c('singleWeek') + i * 3, c('singleWeek') + i * 3 + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <div key={d} style={{ width: 118, height: 120, background: city ? PALETTE.turquoise : '#FBFAF6', opacity: o, boxShadow: '0 4px 10px rgba(0,0,0,0.15)', padding: 10 }}>
                  <div style={{ fontFamily: F.mono, fontSize: 20, color: city ? '#FBFAF6' : PALETTE.greyDark }}>{d}</div>
                  {city && <div style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 22, color: '#FBFAF6', marginTop: 30 }}>{city}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 140, top: 700, display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <BigCounter to={3} at={c('singleWeek')} duration={14} fontSize={72} color={PALETTE.lapis} />
            <span style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 44, color: PALETTE.ink }}>CITIES ·</span>
            <BigCounter to={1} at={c('singleWeek', 0.3)} duration={10} fontSize={72} color={PALETTE.lapis} />
            <span style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 44, color: PALETTE.ink }}>WEEK</span>
          </div>
        </Between>
      </Between>

      {/* ── 3. FLIGHTS & INVESTMENT ──────────────────────────────────────────────────────────────── */}
      <Between from={c('flights') - 4} to={c('open') - 6} fade={8}>
        <RouteMap
          centerLon={64}
          fitBounds={{ west: -10, east: 135, south: -5, north: 62 }}
          land="#D9D2C4"
          highlight={[{ iso: '860', at: c('flights'), color: PALETTE.turquoise }]}
          nodes={[
            { id: 'tas', lonLat: TASHKENT, label: 'TASHKENT', at: c('flights'), color: PALETTE.lapis, r: 12, pulse: true },
            ...newRoutes.data.map((r, i) => ({ id: r.city, lonLat: r.lonLat, label: r.city, at: c('flights') + 6 + i * 7, color: PALETTE.terracotta, r: 7, dx: r.lonLat[0] < 60 ? -14 : 14 })),
          ]}
          routes={newRoutes.data.map((r, i) => ({
            id: r.city,
            points: [r.lonLat, TASHKENT],
            at: c('flights') + 8 + i * 7,
            duration: 34,
            color: PALETTE.lapis,
            width: 3.5,
            bend: 0.2,
            markers: [{ at: c('flights') + 30 + i * 7, duration: 60, orient: true, loop: { gap: 26 }, render: () => <SilkIcon name="plane" size={36} token={false} /> }],
          }))}
          overlay={(api) => {
            const spots: Array<[[number, number], 'hotel' | 'plane' | 'caravanserai']> = [
              [[69.24, 41.31], 'plane'],
              [[66.97, 39.65], 'hotel'],
              [[64.42, 39.77], 'hotel'],
              [[60.6, 41.55], 'plane'],
            ];
            return (
              <>
                {spots.map(([ll, icon], i) => {
                  const p = api.project(ll)!;
                  const s = spring({ frame: frame - (c('hotels') + i * 8), fps, config: SPRINGS.cutout });
                  if (s <= 0.01) return null;
                  return (
                    <g key={i} transform={`translate(${p[0] + (i % 2 ? 40 : -40)} ${p[1] - 50 - i * 12}) scale(${s})`}>
                      <SilkIcon name={icon} size={64} />
                    </g>
                  );
                })}
              </>
            );
          }}
        />
      </Between>

      {/* ── "Uzbekistan is open" ─────────────────────────────────────────────────────────────────── */}
      <Between from={lockAt}>
        <Sfx name="stampThud" at={c('open') + 6} />
        <div style={{ position: 'absolute', inset: 0, transform: lockShake }}>
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            {(() => {
              const s = spring({ frame: frame - lockAt, fps, config: SPRINGS.stamp });
              const opened = frame >= c('open') + 4;
              return (
                <g transform={`translate(960 470) scale(${interpolate(s, [0, 1], [5, 3.2])})`} opacity={Math.min(1, s * 3)}>
                  <SilkIcon name={opened ? 'padlockOpen' : 'padlock'} size={160} />
                </g>
              );
            })()}
          </svg>
          <Stamp text="OPEN" at={c('forVisitors')} fontSize={170} rotation={-8} color={PALETTE.turquoise} style={{ left: 760, top: 700 }} />
        </div>
      </Between>
    </UzScene>
  );
};
