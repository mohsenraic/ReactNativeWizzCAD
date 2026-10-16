/**
 * Scene 5 — Bukhara (3:26–4:04). Signature move: walking POV through photos.
 * CityCard "BUKHARA". "Walking through it" → P07 then P08 slide past laterally with parallax labels, as if
 * strolling the old town (bazaar ambience). "Kalyan Minaret, built in 1127" → P06 tilts up the tower, height
 * brace. "Genghis Khan" (1220) → paper horsemen gallop in, flames (illustrated) rise around the minaret, which
 * stays standing; "STILL STANDING" highlighted.
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BigCounter } from '../../../shared/components/BigCounter';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { KineticTitle } from '../../../shared/components/KineticTitle';
import { PhotoCutout } from '../../../shared/components/PhotoCutout';
import { SourceTag } from '../../../shared/components/SourceTag';
import { Stamp } from '../../../shared/components/Stamp';
import { useTheme } from '../../../shared/theme';
import { Sfx } from '../../../shared/lib/sfx';
import { CityCard } from '../components/CityCard';
import { Flames, Horsemen } from '../components/illustrations';
import { bukhara } from '../data/data';
import { photoProps } from '../data/photos';
import { PALETTE } from '../theme';
import { Between, QuestionPin, UzScene, useScene, Beat } from './common';

/** Extra visual beats as [cue, offset s] (null = seconds from scene start) — checked by retentionGaps(). */
export const BEATS_S05: Beat<'s05'>[] = [['bukhara', 0], ['living', 0], ['walking', -0.6], ['walking', 0.6], ['streets', 0], ['streets', 1], ['streets', 3.5], ['kalyan', 0], ['built1127', 0], ['built1127', 0.4], ['built1127', 0.8], ['legend', 0], ['genghis', 0], ['lookedUp', 0], ['spared', 0], ['burned', 0], ['stillStanding', 0]];

export const Scene05Bukhara: React.FC = () => {
  const { c } = useScene('s05');
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const walkIn = c('walking') - 18;
  const towerIn = c('kalyan') - 6;
  // a gentle "footstep" bob while walking
  const bob = frame >= walkIn && frame < towerIn ? Math.sin((frame - walkIn) / 5) * 4 : 0;
  const dusk = interpolate(frame, [c('genghis') - 10, c('genghis') + 20], [0, 0.55], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <UzScene
      id="s05"
      pushIn={0.03}
      drift={[-40, 0]}
      moves={[
        { at: c('genghis'), scale: 1.06, focus: [960, 700], duration: 30 },
        { at: c('stillStanding') - 6, scale: 1.12, focus: [960, 300], duration: 30 },
      ]}
      overlay={
        <>
          <QuestionPin at={0} />
          <SourceTag dataset={bukhara} at={c('bukhara')} />
          <Sfx name="bazaarAmbience" at={walkIn} durationInFrames={towerIn - walkIn + 20} loop fade={20} volume={0.35} />
        </>
      }
    >
      <Between from={0} to={walkIn + 10} fade={6}>
        <CityCard
          name="BUKHARA"
          lonLat={[64.42, 39.77]}
          at={c('bukhara')}
          age={{ to: bukhara.data.historyYears, suffix: '+ YEARS', label: 'HISTORIC CENTRE · UNESCO' }}
          subtitle="the living city"
          subtitleAt={c('living')}
          outAt={walkIn - 4}
          inset={{ left: 1300, top: 620 }}
        />
      </Between>

      {/* ── walking POV: photos slide past laterally ──────────────────────────────────────────────── */}
      <Between from={walkIn} to={towerIn + 6} fade={8}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${bob}px)` }}>
          <PhotoCutout
            {...photoProps('P07')}
            width={1500}
            height={880}
            enterAt={walkIn}
            from="right"
            exitAt={c('streets') + 6}
            exitTo="left"
            rotation={-1}
            seed="p07"
            style={{ left: 210, top: 100 }}
            kenBurns={{ from: { scale: 1.12, focus: [0.25, 0.5] }, to: { scale: 1.2, focus: [0.75, 0.5] }, at: walkIn, duration: c('streets') - walkIn + 20 }}
          >
            <HandDrawnAnnotation shape={{ type: 'arrow', from: [560, 120], to: [760, 300] }} at={c('walking', 0.6)} width={1500} height={880} color="ink" label={{ text: 'domed bazaar, still trading', x: 420, y: 90, size: 52 }} />
          </PhotoCutout>
          <PhotoCutout
            {...photoProps('P08')}
            width={1500}
            height={880}
            enterAt={c('streets')}
            from="right"
            rotation={1}
            seed="p08"
            style={{ left: 210, top: 100 }}
            kenBurns={{ from: { scale: 1.12, focus: [0.3, 0.5] }, to: { scale: 1.22, focus: [0.7, 0.45] }, at: c('streets'), duration: towerIn - c('streets') }}
          >
            <HandDrawnAnnotation shape={{ type: 'underline', x: 520, y: 760, width: 460 }} at={c('streets', 1)} width={1500} height={880} color="#FBFAF6" label={{ text: 'Lyab-i Hauz', x: 750, y: 730, size: 56 }} />
            <HandDrawnAnnotation shape={{ type: 'arrow', from: [1180, 140], to: [960, 300] }} at={c('streets', 3.5)} width={1500} height={880} color="ink" label={{ text: 'pool & madrasa', x: 1220, y: 110, size: 52 }} />
          </PhotoCutout>
        </div>
      </Between>

      {/* ── Kalyan minaret: tilt-up, date, height ─────────────────────────────────────────────────── */}
      <Between from={towerIn}>
        <div style={{ position: 'absolute', inset: 0, background: `rgba(27,47,91,${dusk})` }} />
        <PhotoCutout
          {...photoProps('P06')}
          width={720}
          height={960}
          enterAt={towerIn}
          from="bottom"
          rotation={0.8}
          seed="p06"
          style={{ left: 600, top: 60 }}
          kenBurns={{ from: { scale: 1.55, focus: [0.83, 0.92] }, to: { scale: 1.55, focus: [0.83, 0.18] }, at: towerIn + 4, duration: 60 }}
        >
          <HandDrawnAnnotation
            shape={{ type: 'brace', x: 690, y1: 40, y2: 920, dir: 'right' }}
            at={c('built1127', 0.4)}
            width={720}
            height={960}
            style={{ overflow: 'visible' }}
          />
        </PhotoCutout>
        <Between from={c('built1127', 0.7)}>
        <div style={{ position: 'absolute', left: 1360, top: 430 }}>
          <BigCounter to={bukhara.data.kalyanHeightM} decimals={1} suffix=" M" at={c('built1127', 0.8)} duration={30} fontSize={96} color={dusk > 0.2 ? '#F2EEE6' : PALETTE.ink} />
          <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: 2, color: dusk > 0.2 ? '#C9D2E6' : PALETTE.greyDark }}>TALL</div>
        </div>
        </Between>
        <div style={{ position: 'absolute', left: 140, top: 150 }}>
          <div style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: 2, color: dusk > 0.2 ? '#C9D2E6' : PALETTE.greyDark, opacity: interpolate(frame, [c('built1127'), c('built1127') + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            KALYAN MINARET · BUILT
          </div>
          <BigCounter grouping={false} from={1000} to={bukhara.data.kalyanBuilt} at={c('built1127')} duration={24} fontSize={130} color={PALETTE.terracotta} />
        </div>
        {/* Genghis Khan, 1220 — LEGEND */}
        <Stamp text="LEGEND" at={c('legend')} fontSize={70} rotation={-8} color={PALETTE.saffron} style={{ left: 150, top: 380 }} />
        <Between from={c('genghis') - 4}>
          <div style={{ position: 'absolute', left: 140, top: 560 }}>
            <div style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: 2, color: '#C9D2E6' }}>GENGHIS KHAN TAKES BUKHARA</div>
            <BigCounter grouping={false} from={1127} to={bukhara.data.genghisYear} at={c('genghis')} duration={24} fontSize={110} color="#F2EEE6" />
          </div>
        </Between>
        <Horsemen at={c('genghis')} y={880} count={6} color="#1A1612" />
        <HandDrawnAnnotation shape={{ type: 'arrow', from: [520, 820], to: [880, 160], bend: 0.18 }} at={c('lookedUp')} color={PALETTE.saffron} strokeWidth={6} />
        <HandDrawnAnnotation shape={{ type: 'circle', cx: 960, cy: 300, rx: 200, ry: 300 }} at={c('spared')} color={PALETTE.saffron} strokeWidth={6} />
        <Flames at={c('burned')} x={0} y={1080} width={600} seed="fl-l" />
        <Flames at={c('burned', 0.2)} x={1320} y={1080} width={600} seed="fl-r" />
        <KineticTitle text="STILL STANDING" strip highlight={['STANDING']} at={c('stillStanding')} fontSize={110} style={{ position: 'absolute', left: 1130, top: 220 }} />
      </Between>
    </UzScene>
  );
};
