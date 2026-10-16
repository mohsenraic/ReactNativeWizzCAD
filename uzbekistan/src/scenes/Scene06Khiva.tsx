/**
 * Scene 6 — Khiva (4:04–4:46). Signature move: a top-down plan whose walls draw themselves.
 * CityCard "KHIVA" on lapis paper. Itchan Kala plan: crenellated walls draw (650 × 400 m), monuments pop in
 * as photo cutouts (P09 walls, P10 Kalta Minor) and 51 dots. "Fifteen minutes" → dotted walk + stopwatch.
 * "UNESCO" → FIRST IN CENTRAL ASIA · 1990. "Turns gold" → P11 with a gold duotone sweep, film-set framing.
 * "Why are tourists only arriving now?" → the red "?" returns big. Mid-roll breath at the end.
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BigCounter } from '../../../shared/components/BigCounter';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { PhotoCutout } from '../../../shared/components/PhotoCutout';
import { SourceTag } from '../../../shared/components/SourceTag';
import { Stamp } from '../../../shared/components/Stamp';
import { useTheme } from '../../../shared/theme';
import { CityCard } from '../components/CityCard';
import { KHIVA_PLAN_POINTS, KhivaPlan, Stopwatch } from '../components/illustrations';
import { khiva } from '../data/data';
import { photoProps } from '../data/photos';
import { PALETTE } from '../theme';
import { Between, QuestionPin, UzScene, useScene, Beat } from './common';

/** Extra visual beats as [cue, offset s] (null = seconds from scene start) — checked by retentionGaps(). */
export const BEATS_S06: Beat<'s06'>[] = [['khiva', 0], ['desert', 0], ['walls', 0], ['walls', 1], ['walls', 1.3], ['inside', 0], ['inside', 0.5], ['packed', 0], ['fifteen', 0], ['unesco', 0], ['sunset', 0], ['turnsGold', 0], ['filmSet', 0], ['filmSet', 1], ['question', 0]];

export const Scene06Khiva: React.FC = () => {
  const { c } = useScene('s06');
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const planIn = c('walls') - 12;
  const photoIn = c('sunset') - 6;
  // plan: 400 m (E–W) × 650 m (N–S), drawn portrait
  const plan = { x: 710, y: 150, w: 480, h: 780 };
  const [wx, wy] = KHIVA_PLAN_POINTS.westGate;
  const [ex, ey] = KHIVA_PLAN_POINTS.eastGate;
  const walkP = interpolate(frame, [c('fifteen'), c('fifteen') + 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pathD = `M${plan.x + wx * plan.w},${plan.y + wy * plan.h} C ${plan.x + 0.3 * plan.w},${plan.y + 0.44 * plan.h} ${plan.x + 0.6 * plan.w},${plan.y + 0.66 * plan.h} ${plan.x + ex * plan.w},${plan.y + ey * plan.h}`;
  const muted = '#C9D2E6';

  return (
    <UzScene
      id="s06"
      pushIn={0.03}
      moves={[
        { at: c('fifteen') - 6, scale: 1.06, focus: [950, 560], duration: 30 },
        { at: c('unesco', 1.2), scale: 1.0, focus: [960, 540], duration: 24 },
        { at: c('question'), scale: 1.06, focus: [960, 540], duration: 40 },
      ]}
      overlay={
        <>
          <QuestionPin at={0} outAt={c('question') - 14} />
          <QuestionPin at={c('question')} big />
          <Between from={0} to={c('question') - 10}>
            <SourceTag dataset={khiva} tone="dark" />
          </Between>
        </>
      }
    >
      <Between from={0} to={planIn + 8} fade={6}>
        <CityCard
          name="KHIVA"
          lonLat={[60.36, 41.38]}
          at={c('khiva')}
          tone="dark"
          age={{ to: 2000, suffix: '+ YEARS', label: 'ITCHAN KALA' }}
          subtitle="at the edge of the desert"
          subtitleAt={c('desert')}
          outAt={planIn - 4}
          inset={{ left: 1300, top: 620 }}
        />
      </Between>

      {/* ── Itchan Kala from above ────────────────────────────────────────────────────────────────── */}
      <Between from={planIn} to={photoIn + 4} fade={10}>
        <KhivaPlan at={c('walls')} {...plan} dotsAt={c('packed')} dots={khiva.data.monuments} />
        {/* dimensions */}
        <HandDrawnAnnotation shape={{ type: 'underline', x: plan.x, y: plan.y - 40, width: plan.w }} at={c('walls', 1)} color="white" strokeWidth={4} label={{ text: '{n} m', x: plan.x + plan.w / 2, y: plan.y - 56, size: 48, count: { to: khiva.data.sizeM[1] } }} />
        <HandDrawnAnnotation shape={{ type: 'brace', x: plan.x + plan.w + 30, y1: plan.y, y2: plan.y + plan.h, dir: 'right' }} at={c('walls', 1.3)} color="white" strokeWidth={4} label={{ text: '{n} m', x: plan.x + plan.w + 90, y: plan.y + plan.h / 2 + 16, size: 48, anchor: 'start', count: { to: khiva.data.sizeM[0] } }} />
        {/* monuments pop in */}
        <PhotoCutout {...photoProps('P09')} width={520} height={340} enterAt={c('inside')} from="left" rotation={-3} seed="p09" style={{ left: 110, top: 170 }} creditPlacement="photo">
          <HandDrawnAnnotation shape={{ type: 'underline', x: 120, y: 300, width: 280 }} at={c('inside', 0.6)} width={520} height={340} color="white" label={{ text: 'mud-brick walls', x: 260, y: 285, size: 44 }} />
        </PhotoCutout>
        <PhotoCutout {...photoProps('P10')} width={460} height={340} enterAt={c('inside', 0.5)} from="right" rotation={3} seed="p10" style={{ left: 1400, top: 690 }}>
          <HandDrawnAnnotation shape={{ type: 'underline', x: 110, y: 300, width: 260 }} at={c('inside', 1.1)} width={460} height={340} color="white" label={{ text: 'Kalta Minor', x: 240, y: 285, size: 44 }} />
        </PhotoCutout>
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
          <line x1={430} y1={510} x2={plan.x + KHIVA_PLAN_POINTS.kunyaArk[0] * plan.w} y2={plan.y + KHIVA_PLAN_POINTS.kunyaArk[1] * plan.h} stroke="#F2EEE6" strokeWidth={2} strokeDasharray="6 6" opacity={interpolate(frame, [c('inside', 0.8), c('inside', 1.2)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
          <line x1={1410} y1={780} x2={plan.x + KHIVA_PLAN_POINTS.kaltaMinor[0] * plan.w} y2={plan.y + KHIVA_PLAN_POINTS.kaltaMinor[1] * plan.h} stroke="#F2EEE6" strokeWidth={2} strokeDasharray="6 6" opacity={interpolate(frame, [c('inside', 1.3), c('inside', 1.7)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
          {/* the walk: dotted line west gate → east gate */}
          <path d={pathD} fill="none" stroke={PALETTE.saffron} strokeWidth={7} strokeLinecap="round" strokeDasharray="0.1 16" opacity={walkP > 0 ? 1 : 0} style={{ clipPath: `inset(0 ${(1 - walkP) * 100}% 0 0)` }} />
        </svg>
        <Between from={c('packed') - 2} to={c('fifteen') - 6}>
          <div style={{ position: 'absolute', left: 120, top: 640 }}>
            <BigCounter to={khiva.data.monuments} at={c('packed')} duration={40} fontSize={150} color={PALETTE.saffron} />
            <div style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: 2, color: muted }}>MONUMENTS INSIDE THE WALLS</div>
          </div>
        </Between>
        <Between from={c('fifteen') - 2}>
          <div style={{ position: 'absolute', left: 110, top: 640 }}>
            <Stopwatch at={c('fifteen')} to={khiva.data.crossOnFootMinutes} duration={60} prefix="~" />
            <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: 2, color: muted, marginTop: 6 }}>ON FOOT, GATE TO GATE</div>
          </div>
        </Between>
        <Stamp text="UNESCO · FIRST IN CENTRAL ASIA · {n}" count={{ from: 1950, to: khiva.data.unescoYear, duration: 26, grouping: false }} at={c('unesco')} fontSize={56} rotation={-11} color={PALETTE.saffron} style={{ left: 430, top: 440 }} />
      </Between>

      {/* ── sunset: the city turns gold ───────────────────────────────────────────────────────────── */}
      <Between from={photoIn}>
        <PhotoCutout
          {...photoProps('P11')}
          width={1520}
          height={880}
          enterAt={photoIn}
          from="bottom"
          rotation={-1}
          seed="p11"
          style={{ left: 200, top: 100 }}
          kenBurns={{ from: { scale: 1.05, focus: [0.4, 0.55] }, to: { scale: 1.2, focus: [0.62, 0.5] }, at: photoIn, duration: c('question') - photoIn }}
          treatment={{ type: 'duotone', colors: ['#3B2A12', '#F6C762'], amount: 0.85, sweep: { at: c('turnsGold'), duration: 36 } }}
        >
          {/* film-set framing: viewfinder corners + REC */}
          {frame >= c('filmSet') && (
            <>
              {[
                'M60,140 L60,60 L140,60',
                'M1380,60 L1460,60 L1460,140',
                'M60,740 L60,820 L140,820',
                'M1460,740 L1460,820 L1380,820',
              ].map((d, i) => (
                <HandDrawnAnnotation key={i} shape={{ type: 'path', d }} at={c('filmSet') + i * 3} duration={10} width={1520} height={880} color="#FBFAF6" strokeWidth={7} />
              ))}
              <div style={{ position: 'absolute', left: 100, top: 90, display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.mono, fontSize: 30, color: '#FBFAF6', opacity: Math.floor(frame / 15) % 2 ? 1 : 0.4 }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, background: PALETTE.questionRed, display: 'inline-block' }} /> REC
              </div>
              <HandDrawnAnnotation shape={{ type: 'underline', x: 1000, y: 160, width: 380 }} at={c('filmSet', 1)} width={1520} height={880} color="#FBFAF6" label={{ text: 'a film set?', x: 1190, y: 140, size: 64 }} />
            </>
          )}
        </PhotoCutout>
      </Between>
    </UzScene>
  );
};
