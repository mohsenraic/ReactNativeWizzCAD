/**
 * Scene 3 — When it breaks. <PacificCrossSection> animates normal → El Niño: the trade winds shrink and
 * reverse, the warm layer sloshes east with a bathtub overshoot, the thermocline flattens and the upwelling
 * stops. Evaporation rises off the warm water; clouds and rain migrate east with it. Zoom out to the world:
 * jet streams bend, the Indian monsoon arrows weaken. Final beat: a paper fishing boat off Peru, a Christmas
 * star doodle and "El Niño = 'the child'" in Caveat.
 */
import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Cutout, Fade, HandDrawnAnnotation, SceneShell, WeatherIcon, WorldMap, useStampShake, worldProjection } from '../../../shared/components';
import type { MapApi } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { Sfx } from '../../../shared/lib/sfx';
import { PacificCrossSection } from '../components/PacificCrossSection';
import { CHAPTERS, CHAPTER_CARD_FRAMES, cue, ramp, sceneById } from '../timeline';
import { PALETTE } from '../theme';

const S = 3;
export const SCENE_3_DURATION = sceneById(S).durationInFrames;
/** India on the Pacific-centred world map (same projection as the <WorldMap> below). */
const INDIA = worldProjection({ centerLon: 180 })([76, 15])! as [number, number];
const CS_LEFT = 160;
const CS_TOP = 170;

/** A wavy jet-stream line across a band of longitudes; `bend` 0 → 1 deepens and shifts the waves. */
const jetStream = (api: MapApi, latBase: number, bend: number, phase: number, draw: number, key: string) => {
  const pts: string[] = [];
  for (let lon = 100; lon <= 330; lon += 4) {
    const L = lon > 180 ? lon - 360 : lon;
    const amp = 5 + bend * 9;
    const lat = latBase + Math.sin((lon / 360) * Math.PI * 2 * 4 + phase + bend * 1.4) * amp;
    const p = api.project([L, lat]);
    if (p) pts.push(`${p[0].toFixed(1)} ${p[1].toFixed(1)}`);
  }
  return (
    <path
      key={key}
      d={`M ${pts.join(' L ')}`}
      fill="none"
      stroke="#F2EEE6"
      strokeWidth={5}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - draw}
      opacity={0.9}
    />
  );
};

const STAR = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
};

const Boat: React.FC<{ t: number }> = ({ t }) => {
  const bob = Math.sin(t / 10) * 4;
  const rock = Math.sin(t / 13) * 3;
  return (
    <svg width={420} height={300} viewBox="0 0 420 300" style={{ overflow: 'visible' }}>
      <g transform={`translate(0 ${bob}) rotate(${rock} 210 200)`}>
        <path d="M 60 190 L 360 190 L 320 250 L 100 250 Z" fill="#B5652B" stroke={PALETTE.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 120 190 L 120 210 M 180 190 L 180 214 M 240 190 L 240 214 M 300 190 L 300 210" stroke={PALETTE.ink} strokeWidth={3} />
        <path d="M 210 190 L 210 40" stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M 214 50 L 330 176 L 214 176 Z" fill="#FBFAF6" stroke={PALETTE.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 206 70 L 120 176 L 206 176 Z" fill="#EDE6D2" stroke={PALETTE.ink} strokeWidth={5} strokeLinejoin="round" />
      </g>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${20 + i * 10} ${262 + i * 14} q 30 -14 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`}
          fill="none"
          stroke={PALETTE.cool}
          strokeWidth={5}
          strokeLinecap="round"
          transform={`translate(${Math.sin(t / 12 + i) * 10} 0)`}
        />
      ))}
    </svg>
  );
};

export const Scene3Mechanism: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  const breaksAt = cue(S, 'something breaks');
  const weakenAt = cue(S, 'weaken');
  const reverseAt = cue(S, 'reverse');
  const sloshAt = cue(S, 'sloshing');
  const stopsAt = cue(S, 'stops rising');
  const heatsAt = cue(S, 'heats up');
  const evapAt = cue(S, 'evaporation');
  const rainAt = cue(S, 'rain moves');
  const stormsAt = cue(S, 'storms');
  const atmosAt = cue(S, 'atmosphere');
  const jetAt = cue(S, 'jet streams');
  const monsoonAt = cue(S, 'monsoons');
  const fishAt = cue(S, 'fishermen');
  const xmasAt = cue(S, 'christmas');
  const childAt = cue(S, 'the child');

  // Winds weaken, then reverse — before the water moves.
  const wind = interpolate(frame, ramp(weakenAt, weakenAt + 24, reverseAt, reverseAt + 24), [1, 0.3, 0.3, -0.35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // The slosh: warm water runs east with a bathtub overshoot.
  const slosh = spring({ frame: frame - sloshAt, fps, config: { damping: 7, stiffness: 22, mass: 1.6 } });
  const e = interpolate(frame, [weakenAt, sloshAt], [0, 0.12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) + slosh * 0.88;
  // Storms follow the warm water.
  const atmos = interpolate(frame, [rainAt, stormsAt + 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const evap = interpolate(frame, ramp(evapAt, evapAt + 15, rainAt + 40, rainAt + 60), [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const shake = useStampShake(breaksAt, 8);

  // Zoom out from the cross-section to the world.
  const out = interpolate(frame, [atmosAt - 10, atmosAt + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const csScale = 1 - out * 0.55;
  const jetDraw = interpolate(frame, [atmosAt + 20, atmosAt + 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bend = interpolate(frame, [jetAt, jetAt + 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) });
  const monsoonIn = interpolate(frame, [atmosAt + 30, atmosAt + 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const monsoonWeak = interpolate(frame, [monsoonAt, monsoonAt + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const mapOut = fishAt - 16;

  return (
    <SceneShell durationInFrames={SCENE_3_DURATION} paper="dark" seed="s3" chapter={CHAPTERS[S]}
      chapterFrames={CHAPTER_CARD_FRAMES} enter="whip" exit="whip"
      moves={[
        { at: weakenAt - 6, scale: 1.3, focus: [CS_LEFT + 760, CS_TOP + 262], duration: 16 },
        { at: sloshAt - 4, scale: 1, focus: [960, 540], duration: 14 },
        { at: stopsAt - 6, scale: 1.35, focus: [CS_LEFT + 1300, CS_TOP + 500], duration: 14 },
        { at: evapAt - 6, scale: 1.25, focus: [CS_LEFT + 1000, CS_TOP + 330], duration: 16 },
        { at: stormsAt + 20, scale: 1, focus: [960, 540], duration: 20 },
        { at: monsoonAt - 6, scale: 1.45, focus: INDIA, duration: 16 },
        { at: fishAt - 18, scale: 1, focus: [960, 540], duration: 14 },
      ]}>
      {/* ── cross-section ── */}
      {out < 1 && (
        <div style={{ position: 'absolute', inset: 0, transform: `${shake === 'none' ? '' : shake} scale(${csScale})`, transformOrigin: '960px 540px', opacity: 1 - out }}>
          <PacificCrossSection elNino={e} wind={wind} atmosphere={atmos} evaporation={evap} reveal={{ atmosphere: rainAt - 10 }} style={{ left: CS_LEFT, top: CS_TOP }} />
          <HandDrawnAnnotation shape={{ type: 'x', cx: CS_LEFT + 1340, cy: CS_TOP + 520, size: 120 }} at={stopsAt} duration={14} color="white" strokeWidth={7} seed="s3-x" />
          <Cutout enterAt={heatsAt} from="scale" seed="s3-therm" style={{ left: CS_LEFT + 1190, top: CS_TOP + 60 }} innerStyle={{ padding: 8 }} exitAt={rainAt} exitTo="right">
            <WeatherIcon name="thermometer" t={frame - heatsAt} size={130} />
          </Cutout>
          <Sfx name="stampThud" at={breaksAt + 2} volume={0.4} />
        </div>
      )}

      {/* ── world: jet streams + monsoon ── */}
      <Fade inAt={atmosAt} outAt={mapOut} len={20}>
        <WorldMap
          centerLon={180}
          land={PALETTE.landOnNavy}
          zoom={{ from: { center: [-170, 0], scale: 2.2 }, to: { center: [-170, 10], scale: 1 }, at: atmosAt - 10, duration: 50 }}
          overlay={(api) => {
            const india = api.project([79, 18]);
            const sea = api.project([72, -2]);
            const lbl = api.project([-120, 52]);
            return (
              <>
                <g opacity={jetDraw > 0 ? 1 : 0}>
                  {jetStream(api, 42, bend, 0.4, jetDraw, 'nh')}
                  {jetStream(api, -44, bend * 0.6, 2.1, jetDraw, 'sh')}
                  {lbl && (
                    <text x={lbl[0]} y={lbl[1]} textAnchor="middle" fontFamily={F.mono} fontSize={22} letterSpacing={3} fill="#F2EEE6" opacity={jetDraw}>
                      JET STREAM
                    </text>
                  )}
                </g>
                {india && sea && (
                  <g opacity={monsoonIn * (1 - monsoonWeak * 0.55)}>
                    {[-1, 0, 1].map((k) => {
                      const sx = sea[0] + k * 40;
                      const len = 1 - monsoonWeak * 0.6;
                      const tx = sx + (india[0] - sea[0]) * len + k * 10;
                      const ty = sea[1] + (india[1] - sea[1]) * len;
                      return (
                        <g key={k}>
                          <path d={`M ${sx} ${sea[1]} Q ${sx - 30} ${(sea[1] + ty) / 2} ${tx} ${ty}`} fill="none" stroke={PALETTE.flood} strokeWidth={8} strokeLinecap="round" />
                          <circle cx={tx} cy={ty} r={8} fill={PALETTE.flood} />
                        </g>
                      );
                    })}
                    <text x={india[0] + 40} y={india[1] - 50} fontFamily={F.mono} fontSize={22} letterSpacing={3} fill="#F2EEE6">
                      MONSOON
                    </text>
                  </g>
                )}
              </>
            );
          }}
        />
      </Fade>

      {/* ── fishermen, Christmas, "the child" ── */}
      <Cutout enterAt={fishAt} from="bottom" seed="s3-boat" style={{ left: 820, top: 420 }} innerStyle={{ padding: 18, background: '#EFEAE0' }}>
        <Boat t={frame - fishAt} />
        <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: 2, color: PALETTE.greyDark, textAlign: 'center', marginTop: 4 }}>OFF PERU</div>
      </Cutout>
      <HandDrawnAnnotation shape={{ type: 'path', d: STAR(1290, 360, 64) }} at={xmasAt} duration={24} color={PALETTE.highlighter} strokeWidth={6} seed="s3-star" />
      <Sfx name="penScratch" at={xmasAt} volume={0.4} />
      <div
        style={{
          position: 'absolute',
          left: 420,
          top: 800,
          fontFamily: F.hand,
          fontWeight: 700,
          fontSize: 92,
          color: PALETTE.highlighter,
          transform: 'rotate(-3deg)',
          clipPath: `inset(0 ${100 - interpolate(frame, [childAt, childAt + 30], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}% 0 0)`,
        }}
      >
        El Niño = ‘the child’
      </div>
    </SceneShell>
  );
};
