/**
 * Scene 8 — Outro. Back to the Scene 1 Pacific, the warm patch glowing; the camera pulls back to the whole
 * world. Weather / food / year cutouts pop on cue, a final Oswald line on a paper strip, and the Niño 3.4 box
 * is drawn on "where to look". Last 10 s: end screen — SUBSCRIBE + sources, bottom-left only; the map dims so
 * the right side stays clean.
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { Cutout, EndCard, Fade, KineticTitle, SceneShell, SourceTag, WeatherIcon } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { wmoOct2026 } from '../data/elnino';
import { CommodityIcon } from '../components/commodityIcons';
import { SSTAnomalyMap } from '../components/SSTAnomalyMap';
import { END_SCREEN_FRAMES, cue, sceneById } from '../timeline';
import { PALETTE } from '../theme';

const S = 8;
export const SCENE_8_DURATION = sceneById(S).durationInFrames;

const Calendar: React.FC<{ t: number }> = ({ t }) => {
  const flip = Math.min(1, Math.max(0, t / 20));
  return (
    <svg width={130} height={130} viewBox="0 0 200 200">
      <rect x={30} y={44} width={140} height={130} rx={12} fill="#FBFAF6" stroke={PALETTE.ink} strokeWidth={6} />
      <rect x={30} y={44} width={140} height={34} fill={PALETTE.warm} stroke={PALETTE.ink} strokeWidth={6} />
      <path d="M 66 30 L 66 58 M 134 30 L 134 58" stroke={PALETTE.ink} strokeWidth={8} strokeLinecap="round" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={46 + (i % 4) * 28} y={92 + Math.floor(i / 4) * 26} width={16} height={14} rx={3} fill={i < flip * 12 ? PALETTE.warm : '#D9D2C4'} />
      ))}
    </svg>
  );
};

export const Scene8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const newAt = cue(S, "what's new");
  const patchAt = cue(S, 'patch of ocean');
  const weatherAt = cue(S, 'weather');
  const foodAt = cue(S, 'food');
  const yearAt = cue(S, 'their year');
  const lookAt = cue(S, 'where to look');
  const endAt = SCENE_8_DURATION - END_SCREEN_FRAMES;

  const dim = interpolate(frame, [endAt - 20, endAt + 10], [1, 0.18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const iconsOut = endAt - 10;

  return (
    <SceneShell
      durationInFrames={SCENE_8_DURATION}
      paper="dark"
      seed="s8"
      enter="whip"
      exit="none"
      pushIn={0.03}
      overlay={
        <Fade outAt={endAt - 20}>
          <SourceTag text="STYLISED SEA-SURFACE ANOMALY · WMO, OCT 2026" dataset={wmoOct2026} tone="dark" at={10} />
        </Fade>
      }
    >
      <div style={{ position: 'absolute', inset: 0, opacity: dim }}>
        <SSTAnomalyMap
          intensity={1}
          tone="dark"
          equator={false}
          zoom={{ from: { center: [-140, 0], scale: 1.15 }, to: { center: [-160, 8], scale: 0.52 }, at: newAt - 10, duration: 110 }}
          nino34={{ at: lookAt, duration: 24, label: true }}
        />
      </div>

      {/* final line, left half only */}
      {frame >= patchAt - 8 && (
        <div style={{ position: 'absolute', left: 110, top: 110 }}>
          <KineticTitle text="Keep an eye on Niño 3.4" fontSize={88} strip align="left" at={patchAt} seed="s8-line" maxWidth={1000} highlight={['niño', '3.4']} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 130, top: 330, display: 'flex', gap: 34 }}>
        <Cutout enterAt={weatherAt} from="scale" seed="s8-w" style={{ position: 'relative' }} innerStyle={{ padding: 8 }} exitAt={iconsOut} exitTo="bottom">
          <WeatherIcon name="rain" t={frame - weatherAt} size={130} />
        </Cutout>
        <Cutout enterAt={foodAt} from="scale" seed="s8-f" style={{ position: 'relative' }} innerStyle={{ padding: 8 }} exitAt={iconsOut + 4} exitTo="bottom">
          <CommodityIcon id="rice" t={frame - foodAt} size={130} />
        </Cutout>
        <Cutout enterAt={yearAt} from="scale" seed="s8-y" style={{ position: 'relative' }} innerStyle={{ padding: 8 }} exitAt={iconsOut + 8} exitTo="bottom">
          <Calendar t={frame - yearAt} />
        </Cutout>
      </div>

      <EndCard at={endAt} tone="dark" />
      <Fade inAt={endAt + 30}>
        <div style={{ position: 'absolute', left: 120, top: 640, fontFamily: F.headline, fontWeight: 700, fontSize: 64, letterSpacing: 2, color: PALETTE.onDark, opacity: interpolate(frame, [endAt + 30, endAt + 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }) }}>
          HOW ONE PATCH OF OCEAN
          <br />
          CONTROLS THE WORLD’S WEATHER
        </div>
      </Fade>
    </SceneShell>
  );
};
