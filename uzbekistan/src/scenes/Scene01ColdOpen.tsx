/**
 * Scene 1 — Cold open (0:00–0:38).
 * A single tile draws itself on lapis paper, the pattern multiplies, then wipes open on the Registan (P01).
 * "Blue domes" → Gur-e-Amir's dome lifts off its photo. "Before the Roman Empire" → paper timeline strip.
 * "Why haven't you heard" → blank map of Asia, Uzbekistan outlined, red "?" pinned (stays until Scene 7).
 * "Most closed" → padlock stamp; "fastest-growing" → padlock springs open.
 * "An ancient one, and some very new ones" → a caravan route and a train line draw at the same time.
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { PhotoCutout } from '../../../shared/components/PhotoCutout';
import { RouteLayer } from '../../../shared/components/RouteMap';
import { SourceTag } from '../../../shared/components/SourceTag';
import { Stamp, useStampShake } from '../../../shared/components/Stamp';
import { WorldMap } from '../../../shared/components/WorldMap';
import { BigCounter } from '../../../shared/components/BigCounter';
import { SPRINGS, useTheme } from '../../../shared/theme';
import { Sfx } from '../../../shared/lib/sfx';
import { GeometricPattern, PatternWipe } from '../components/GeometricPattern';
import { SILK_ROUTES } from '../components/SilkRoadMap';
import { SilkIcon } from '../components/silkIcons';
import { afrosiyob, arrivals2025, arrivalsSeries, coldOpen, samarkand } from '../data/data';
import { PHOTO_MASKS, photoProps } from '../data/photos';
import { PALETTE } from '../theme';
import { Between, QuestionPin, UzScene, useScene, Beat } from './common';

/** Extra visual beats as [cue, offset s] (null = seconds from scene start) — checked by retentionGaps(). */
export const BEATS_S01: Beat<'s01'>[] = [[null, 0.2], [null, 1.3], [null, 3.2], [null, 3.8], ['blueDomes', 0.5], ['blueDomes', 1.6], ['beforeRome', 0], ['beforeRome', 2], ['millions', 0], ['whyNotHeard', 0.8], ['whyNotHeard', 1], ['howDidItGo', 0], ['fewYears', 0], ['fewYears', 0.7], ['mostClosed', 0.8], ['fastestGrowing', 0.3], ['fastestGrowing', 0.8], ['roads', 0.2], ['ancientNew', 0], ['ancientNew', 1.2]];

const ASIA = { west: 18, east: 112, south: 14, north: 62 };

export const Scene01ColdOpen: React.FC = () => {
  const { c } = useScene('s01');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  const photoIn = 114;
  const mapIn = c('whyNotHeard');
  const shake = useStampShake(c('mostClosed') + 6, 8);
  const v2016 = arrivalsSeries.data.find((p) => p.year === 2016)!.value;

  return (
    <UzScene
      id="s01"
      pushIn={0.05}
      moves={[
        { at: mapIn + 20, scale: 1.0, focus: [960, 540], duration: 1 },
        { at: c('howDidItGo'), scale: 1.25, focus: [820, 470], duration: 40 },
        { at: c('roads') - 10, scale: 1.0, focus: [960, 540], duration: 30 },
      ]}
      overlay={
        <>
          <QuestionPin at={c('whyNotHeard', 0.8)} />
          <Between from={photoIn} to={mapIn - 10}>
            <SourceTag dataset={coldOpen} tone="dark" also={[samarkand]} at={c('blueDomes')} />
          </Between>
          <Between from={mapIn}>
            <SourceTag dataset={arrivalsSeries} also={[arrivals2025]} tone="dark" at={10} />
          </Between>
        </>
      }
    >
      {/* ── 0–4 s: one tile draws itself, then the pattern multiplies ───────────────────────────────── */}
      <Between from={0} to={photoIn + 18} fade={1}>
        <Sfx name="penScratch" at={6} volume={0.35} />
        <GeometricPattern tiling="4.8.8" size={230} origin={[960, 540]} draw={{ at: 6, duration: 34, spread: 70 }} stroke={PALETTE.saffron} strokeWidth={5} />
        <GeometricPattern tiling="4.8.8" size={230} origin={[960, 540]} fill={{ at: 40, duration: 24, spread: 60, mode: 'in', colors: [PALETTE.turquoise] }} opacity={0.18} stroke="transparent" />
      </Between>
      <PatternWipe phase="cover" at={photoIn - 18} frames={18} origin={[960, 540]} />
      <PatternWipe phase="reveal" at={photoIn} frames={18} origin={[960, 540]} sound={false} />

      {/* ── Registan, Ken Burns push ───────────────────────────────────────────────────────────────── */}
      <Between from={photoIn} to={mapIn - 12} fade={8}>
        <PhotoCutout
          {...photoProps('P01')}
          width={1560}
          height={900}
          enterAt={photoIn}
          from="none"
          rotation={-1}
          style={{ left: 180, top: 90 }}
          kenBurns={{ from: { scale: 1.0, focus: [0.5, 0.55] }, to: { scale: 1.22, focus: [0.5, 0.42] }, at: photoIn, duration: mapIn - photoIn }}
        />
        {/* "Blue domes … six centuries": Gur-e-Amir, dome lifted onto its own layer */}
        <PhotoCutout
          {...photoProps('P04')}
          width={900}
          height={600}
          enterAt={c('blueDomes')}
          from="right"
          exitAt={c('beforeRome') - 12}
          exitTo="right"
          rotation={3}
          seed="p04-s1"
          style={{ left: 930, top: 300 }}
          lift={{ path: PHOTO_MASKS.P04dome, at: c('blueDomes', 0.5), by: 46 }}
        >
          <HandDrawnAnnotation
            shape={{ type: 'arrow', from: [760, 120], to: [560, 170] }}
            at={c('blueDomes', 1.6)}
            width={900}
            height={600}
            color={PALETTE.terracotta}
            label={{ text: '{n}+ years', x: 760, y: 90, size: 64, count: { to: coldOpen.data.domeAgeYears, duration: 30 } }}
          />
        </PhotoCutout>
        {/* "Before the Roman Empire": paper timeline strip */}
        <TimelineStrip at={c('beforeRome')} outAt={c('millions') + 30} />
        {/* "millions of travelers" */}
        <Stamp text="{n}M VISITORS · 2025" count={{ to: arrivals2025.data.totalM, decimals: 1, duration: 26 }} at={c('millions')} fontSize={78} rotation={-6} style={{ left: 980, top: 120 }} />
      </Between>

      {/* ── "Why haven't you heard much about Uzbekistan?" — blank map of Asia ─────────────────────────── */}
      <Between from={mapIn} fade={12}>
        <div style={{ position: 'absolute', inset: 0, transform: shake }}>
          <WorldMap
            fitBounds={ASIA}
            land={PALETTE.landOnLapis}
            resolution="50m"
            borders={false}
            highlight={[{ iso: '860', at: mapIn + 30, color: '#5B80BE' }]}
            overlay={(api) => {
              const uz = api.countryPath('860');
              const p = interpolate(frame, [mapIn + 6, mapIn + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              const uzC = api.project([64.5, 41.4])!;
              const lockAt = c('mostClosed');
              const openAt = c('fastestGrowing');
              const lockS = spring({ frame: frame - lockAt, fps, config: SPRINGS.stamp });
              const opened = frame >= openAt;
              const popS = spring({ frame: frame - openAt, fps, config: SPRINGS.cutout });
              return (
                <>
                  <path d={uz} fill="none" stroke={PALETTE.saffron} strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinejoin="round" />
                  <RouteLayer
                    api={api}
                    routes={[
                      { id: 'caravan', points: SILK_ROUTES.main, at: c('roads') + 6, duration: 70, color: PALETTE.saffron, width: 6, style: 'dashed', bend: 0.05, markers: [{ at: c('ancientNew'), duration: 120, render: () => <SilkIcon name="camel" size={58} /> }] },
                      { id: 'rail', points: afrosiyob.data.stops.map((s) => s.lonLat), at: c('roads') + 6, duration: 70, color: PALETTE.turquoiseLight, width: 9, bend: 0.03, markers: [{ at: c('ancientNew'), duration: 80, render: () => <SilkIcon name="train" size={58} /> }] },
                    ]}
                  />
                  {frame >= lockAt && (
                    <g transform={`translate(${uzC[0]} ${uzC[1] - 10}) scale(${interpolate(lockS, [0, 1], [2.6, 1.15])}) rotate(${opened ? -6 * popS : 0})`} opacity={Math.min(1, lockS * 3)}>
                      <SilkIcon name={opened ? 'padlockOpen' : 'padlock'} size={150} />
                    </g>
                  )}
                </>
              );
            }}
          />
        </div>
        <Sfx name="stampThud" at={c('mostClosed') + 4} />
        <Stamp text="CLOSED" at={c('mostClosed', 0.8)} fontSize={96} rotation={-10} color={PALETTE.questionRed} style={{ left: 980, top: 600 }} />
        {/* the lock springs open: the closed stamp is wiped by the arrow */}
        <HandDrawnAnnotation shape={{ type: 'x', cx: 1180, cy: 680, size: 200 }} at={c('fastestGrowing', 0.3)} color="white" strokeWidth={8} />
        <HandDrawnAnnotation
          shape={{ type: 'arrow', from: [1300, 760], to: [1480, 420], bend: -0.1 }}
          at={c('fastestGrowing', 0.8)}
          color={PALETTE.saffron}
          strokeWidth={8}
          label={{ text: 'fastest-growing', x: 1530, y: 380, size: 64, anchor: 'middle' }}
        />
        {/* how did it go… in just a few years: two numbers */}
        <Between from={c('fewYears')} to={c('mostClosed') - 10}>
          <div style={{ position: 'absolute', left: 820, top: 700, display: 'flex', alignItems: 'baseline', gap: 26, fontFamily: F.mono, fontSize: 28, color: PALETTE.onDark }}>
            <span>2016</span>
            <BigCounter to={v2016} decimals={1} suffix="M" at={c('fewYears')} duration={24} fontSize={84} color={PALETTE.onDark} />
            <span style={{ fontSize: 60 }}>→</span>
            <span>2025</span>
            <BigCounter to={arrivals2025.data.totalM} decimals={1} suffix="M" at={c('fewYears', 0.7)} duration={30} fontSize={84} color={PALETTE.saffron} />
          </div>
        </Between>
        {/* labels for the two roads */}
        <Between from={c('ancientNew')}>
          <div style={{ position: 'absolute', left: 140, top: 150, fontFamily: F.hand, fontWeight: 700, fontSize: 60, color: PALETTE.saffron }}>an ancient road…</div>
          <div style={{ position: 'absolute', left: 1150, top: 820, fontFamily: F.hand, fontWeight: 700, fontSize: 60, color: PALETTE.turquoiseLight, opacity: interpolate(frame, [c('ancientNew', 1.2), c('ancientNew', 1.6)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            …and some very new ones
          </div>
        </Between>
      </Between>
    </UzScene>
  );
};

/** Paper strip: 800 BC → today. Samarkand's founding sits well before the Roman Empire (27 BC). */
const TimelineStrip: React.FC<{ at: number; outAt: number }> = ({ at, outAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  const s = spring({ frame: frame - at, fps, config: SPRINGS.cutout });
  const out = spring({ frame: frame - outAt, fps, config: SPRINGS.snappy });
  if (frame < at) return null;
  const x0 = 120;
  const W = 1680;
  const from = -800;
  const to = 2026;
  const X = (y: number) => x0 + ((y - from) / (to - from)) * W;
  const cursorYear = interpolate(frame, [at + 10, at + 60], [from, coldOpen.data.romanEmpireFrom], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const yearLabel = (y: number) => (y < 0 ? `${Math.round(-y)} BC` : `AD ${Math.round(y)}`);
  const marks = [
    { y: coldOpen.data.samarkandFromCentury * 100, label: 'SAMARKAND FOUNDED · 7TH C. BC', color: PALETTE.terracotta, at: at + 14, up: true },
    { y: coldOpen.data.romanEmpireFrom, label: 'ROMAN EMPIRE BEGINS · 27 BC', color: PALETTE.greyDark, at: at + 60, up: false },
    { y: 2026, label: 'TODAY', color: PALETTE.lapis, at: at + 70, up: true },
  ];
  return (
    <div style={{ position: 'absolute', left: 0, top: 760, width: 1920, height: 260, transform: `translateY(${(1 - s) * 400 + out * 500}px) rotate(-1deg)` }}>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 40, bottom: 20, background: '#F5F0E6', boxShadow: '0 14px 30px rgba(0,0,0,0.35)' }} />
      <svg width={1920} height={260} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={x0} x2={x0 + W} y1={150} y2={150} stroke={PALETTE.ink} strokeWidth={4} />
        <rect x={X(-700)} y={140} width={X(cursorYear) - X(-700)} height={20} fill={PALETTE.terracotta} opacity={0.35} />
        {marks.map((m, i) => {
          const o = interpolate(frame, [m.at, m.at + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <g key={i} opacity={o}>
              <line x1={X(m.y)} x2={X(m.y)} y1={120} y2={180} stroke={m.color} strokeWidth={5} />
              <text x={X(m.y)} y={m.up ? 100 : 222} textAnchor={i === 2 ? 'end' : i === 0 ? 'start' : 'middle'} fontFamily={F.mono} fontWeight={500} fontSize={26} fill={m.color}>
                {m.label}
              </text>
            </g>
          );
        })}
        <circle cx={X(cursorYear)} cy={150} r={12} fill={PALETTE.ink} />
      </svg>
      <div style={{ position: 'absolute', left: X(cursorYear) - 80, top: 176, width: 160, textAlign: 'center', fontFamily: F.headline, fontWeight: 700, fontSize: 34, color: PALETTE.ink }}>{yearLabel(cursorYear)}</div>
    </div>
  );
};
