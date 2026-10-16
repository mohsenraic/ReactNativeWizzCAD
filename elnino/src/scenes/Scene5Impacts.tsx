/**
 * Scene 5 — Same ocean, opposite disasters. <ImpactMap>: drought regions fill ochre one by one as they are
 * named, then wet regions fill teal; small cutout icons (wilted crop, fire, flood, rain). On "the dice are
 * loaded toward heat" a warm wash spreads over all land with a pair of dice. Final split screen: the same
 * Pacific in the middle, DROUGHT left, FLOOD right.
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Cutout, Fade, KineticTitle, SceneShell, SourceTag, WeatherIcon, worldProjection } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { impactRegions, wmoOct2026 } from '../data/elnino';
import { ImpactMap } from '../components/ImpactMap';
import { SSTAnomalyMap } from '../components/SSTAnomalyMap';
import { CHAPTERS, CHAPTER_CARD_FRAMES, cue, sceneById } from '../timeline';
import { PALETTE } from '../theme';

const S = 5;
export const SCENE_5_DURATION = sceneById(S).durationInFrames;

/** Same projection as <ImpactMap> (Pacific-centred Equal Earth). Icon cutouts are ~136 px. */
const WORLD = worldProjection({ centerLon: 180 });
const iconAt = (ll: [number, number]): React.CSSProperties => {
  const [x, y] = WORLD(ll)!;
  return { left: x - 68, top: y - 68 };
};

const Dice: React.FC<{ t: number }> = ({ t }) => {
  const r = Math.max(0, 1 - t / 30);
  const die = (x: number, rot: number, pips: Array<[number, number]>) => (
    <g transform={`translate(${x} 20) rotate(${rot * r * 2 + (x > 100 ? 8 : -6)} 60 60)`}>
      <rect x={0} y={0} width={120} height={120} rx={18} fill="#FBFAF6" stroke={PALETTE.ink} strokeWidth={6} />
      {pips.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={11} fill={PALETTE.warm} />
      ))}
    </g>
  );
  return (
    <svg width={300} height={170} viewBox="0 0 300 170" style={{ overflow: 'visible' }}>
      {die(10, -40, [[30, 30], [60, 60], [90, 90], [30, 90], [90, 30]])}
      {die(160, 50, [[30, 30], [90, 30], [30, 60], [90, 60], [30, 90], [90, 90]])}
    </svg>
  );
};

export const Scene5Impacts: React.FC = () => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const indoAt = cue(S, 'indonesia');
  const droughtAt = cue(S, 'drought brings');
  const fireAt = cue(S, 'wildfires');
  const safAt = cue(S, 'southern africa');
  const monsoonAt = cue(S, 'monsoon');
  const amazonAt = cue(S, 'amazon');
  const peruAt = cue(S, 'peru and ecuador');
  const sbrAt = cue(S, 'southern brazil');
  const usAt = cue(S, 'united states');
  const eafAt = cue(S, 'east africa');
  const wetterAt = cue(S, 'wetter');
  const diceAt = cue(S, 'dice');
  const wmoAt = cue(S, 'world meteorological');
  const sameAt = cue(S, 'same ocean');
  const oppAt = cue(S, 'opposite');

  const splitAt = sameAt - 24;
  const mapOpacity = interpolate(frame, [splitAt - 10, splitAt + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const iconOut = splitAt - 30;

  return (
    <SceneShell
      durationInFrames={SCENE_5_DURATION}
      paper="light"
      seed="s5"
      chapter={CHAPTERS[S]}
      chapterFrames={CHAPTER_CARD_FRAMES}
      enter="whip"
      exit="whip"
      moves={[
        { at: indoAt - 8, scale: 1.45, focus: WORLD([128, -10])! as [number, number], duration: 18 },
        { at: safAt - 8, scale: 1.45, focus: WORLD([28, -22])! as [number, number], duration: 16 },
        { at: monsoonAt - 8, scale: 1.45, focus: WORLD([80, 18])! as [number, number], duration: 16 },
        { at: amazonAt - 8, scale: 1.45, focus: WORLD([-58, -6])! as [number, number], duration: 16 },
        { at: peruAt - 8, scale: 1.4, focus: WORLD([-70, -18])! as [number, number], duration: 16 },
        { at: usAt - 8, scale: 1, focus: [960, 540], duration: 18 },
        { at: diceAt - 6, scale: 1.12, focus: [960, 700], duration: 20 },
        { at: splitAt - 10, scale: 1, focus: [960, 540], duration: 12 },
      ]}
      overlay={
        <>
          <Fade inAt={indoAt} outAt={wmoAt - 10}>
            <SourceTag dataset={impactRegions} at={indoAt} text="NOAA CPC · WMO, OCT 2026 · TYPICAL EL NIÑO IMPACTS, SCHEMATIC" />
          </Fade>
          <Fade inAt={wmoAt} outAt={splitAt}>
            <SourceTag dataset={wmoOct2026} at={wmoAt} />
          </Fade>
        </>
      }
    >
      {mapOpacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: mapOpacity }}>
          <ImpactMap
            at={{
              maritime: indoAt,
              eAustralia: indoAt + 40,
              sAfrica: safAt,
              india: monsoonAt - 10,
              nBrazil: amazonAt - 6,
              peruEcuador: peruAt,
              seSouthAmerica: sbrAt,
              southernUS: usAt,
              eastAfrica: eafAt,
            }}
            heatAt={diceAt + 6}
          />
          {/* icons */}
          <Cutout enterAt={droughtAt} from="scale" seed="s5-crop" style={iconAt([100, -38])} innerStyle={{ padding: 8 }} exitAt={iconOut} exitTo="bottom">
            <WeatherIcon name="wiltedCrop" t={frame - droughtAt} size={120} />
          </Cutout>
          <Cutout enterAt={fireAt} from="scale" seed="s5-fire" style={iconAt([93, -10])} innerStyle={{ padding: 8 }} exitAt={iconOut} exitTo="bottom">
            <WeatherIcon name="fire" t={frame - fireAt} size={120} />
          </Cutout>
          <Cutout enterAt={peruAt + 24} from="scale" seed="s5-flood" style={iconAt([-114, 8])} innerStyle={{ padding: 8 }} exitAt={iconOut} exitTo="bottom">
            <WeatherIcon name="flood" t={frame - peruAt - 24} size={120} />
          </Cutout>
          <Cutout enterAt={wetterAt} from="scale" seed="s5-rain" style={iconAt([-40, -48])} innerStyle={{ padding: 8 }} exitAt={iconOut} exitTo="bottom">
            <WeatherIcon name="rain" t={frame - wetterAt} size={120} />
          </Cutout>
          <Cutout enterAt={diceAt} from="top" seed="s5-dice" style={{ left: 820, top: 790 }} innerStyle={{ padding: '12px 18px' }} exitAt={iconOut} exitTo="bottom">
            <Dice t={frame - diceAt} />
          </Cutout>
          <Fade inAt={wmoAt + 6} outAt={iconOut}>
            <div style={{ position: 'absolute', left: 1220, top: 860, width: 560, fontFamily: F.mono, fontSize: 21, letterSpacing: 1.5, color: '#9A2E12', lineHeight: 1.45 }}>
              WMO OUTLOOK, OCT–DEC 2026:
              <br />
              WARMER THAN AVERAGE ACROSS LARGE AREAS OF THE GLOBE
            </div>
          </Fade>
        </div>
      )}

      {/* ── split screen ── */}
      {frame >= splitAt && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 640, height: 1080, background: PALETTE.drought, opacity: 0.22 * interpolate(frame, [splitAt, splitAt + 15], [0, 1], { extrapolateRight: 'clamp' }) }} />
          <div style={{ position: 'absolute', left: 1280, top: 0, width: 640, height: 1080, background: PALETTE.flood, opacity: 0.22 * interpolate(frame, [oppAt - 10, oppAt + 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }} />
          <Cutout enterAt={splitAt} from="scale" seed="s5-pac" rotation={-1} style={{ left: 660, top: 330 }} innerStyle={{ width: 600, height: 400, overflow: 'hidden', position: 'relative', background: PALETTE.navy }}>
            <SSTAnomalyMap intensity={1} tone="dark" width={600} height={400} equator={false} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontFamily: F.mono, fontSize: 18, letterSpacing: 3, color: '#F2EEE6' }}>SAME PACIFIC</div>
          </Cutout>
          <div style={{ position: 'absolute', left: 60, top: 340, width: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Cutout enterAt={sameAt} from="left" seed="s5-dry" style={{ position: 'relative' }} innerStyle={{ padding: 10 }}>
              <WeatherIcon name="wiltedCrop" t={frame - sameAt} size={150} color="#8A6A10" />
            </Cutout>
            <KineticTitle text="DROUGHT" at={sameAt + 6} fontSize={110} color="#7A5F0E" seed="s5-dt" />
          </div>
          <div style={{ position: 'absolute', left: 1320, top: 340, width: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Cutout enterAt={oppAt} from="right" seed="s5-wet" style={{ position: 'relative' }} innerStyle={{ padding: 10 }}>
              <WeatherIcon name="flood" t={frame - oppAt} size={150} color={PALETTE.flood} />
            </Cutout>
            <KineticTitle text="FLOOD" at={oppAt + 6} fontSize={110} color="#0E5E55" seed="s5-ft" />
          </div>
        </div>
      )}
    </SceneShell>
  );
};
