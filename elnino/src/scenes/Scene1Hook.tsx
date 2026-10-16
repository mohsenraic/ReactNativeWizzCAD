/**
 * Scene 1 — Hook. Navy paper; slow push into an empty Pacific. A small warm glow appears on the equator and
 * spreads. Cutouts pop in on cue — fire over Australia, rain over Peru, a coffee cup — then "EL NIÑO" slams
 * in and a WMO summary card highlights the strength wording (WMO's own phrasing, not the narration's).
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { Cutout, DocumentCard, Fade, HandDrawnAnnotation, KineticTitle, SceneShell, SourceTag, WeatherIcon } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { wmoOct2026 } from '../data/elnino';
import { CommodityIcon } from '../components/commodityIcons';
import { SSTAnomalyMap, projectPacific } from '../components/SSTAnomalyMap';
import { cue, sceneById } from '../timeline';
import { PALETTE } from '../theme';

const S = 1;
export const SCENE_1_DURATION = sceneById(S).durationInFrames;

const CITIES: Array<{ name: string; ll: [number, number] }> = [
  { name: 'SYDNEY', ll: [151.2, -33.9] },
  { name: 'LIMA', ll: [-77.0, -12.0] },
  { name: 'JAKARTA', ll: [106.8, -6.2] },
  { name: 'LOS ANGELES', ll: [-118.2, 34.0] },
];
const GLOW: [number, number] = [-140, 0];

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const patchAt = cue(S, 'patch');
  const recordAt = cue(S, 'never recorded');
  const farAt = cue(S, 'thousands');
  const ausAt = cue(S, 'australia');
  const peruAt = cue(S, 'peru floods');
  const coffeeAt = cue(S, 'coffee');
  const nameAt = cue(S, 'its name');
  const strongAt = cue(S, 'strongest');

  const grow = interpolate(frame, [patchAt - 10, ausAt], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const dimMap = interpolate(frame, [nameAt, nameAt + 15], [1, 0.35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glow = projectPacific(GLOW);
  const aus = projectPacific([136, -25]);
  const peru = projectPacific([-76, -8]);
  const titleAt = cue(S, 'el nino') - 2;

  return (
    <SceneShell
      durationInFrames={SCENE_1_DURATION}
      paper="dark"
      seed="s1"
      enter="none"
      exit="whip"
      focus={glow}
      pushIn={0.08}
      moves={[
        { at: recordAt - 4, scale: 1.18, focus: glow, duration: 24 },
        { at: ausAt - 8, scale: 1.3, focus: aus, duration: 16 },
        { at: peruAt - 8, scale: 1.3, focus: peru, duration: 16 },
        { at: coffeeAt - 8, scale: 1, focus: [960, 540], duration: 16 },
      ]}
      overlay={
        <>
          <Fade outAt={nameAt}>
            <SourceTag text="STYLISED SEA-SURFACE ANOMALY · WMO, OCT 2026" tone="dark" at={patchAt} />
          </Fade>
          <Fade inAt={strongAt - 6}>
            <SourceTag dataset={wmoOct2026} tone="dark" at={strongAt - 6} />
          </Fade>
        </>
      }
    >
      <div style={{ position: 'absolute', inset: 0, opacity: dimMap }}>
        {/* faint glow from frame 0 (no empty opening), pulsing gently until it starts to spread */}
        <SSTAnomalyMap intensity={0.95 * Math.max(grow, 0.32 + 0.06 * Math.sin(frame / 7))} spread={0.12 + 0.88 * grow} tone="dark" />
        {/* far from any major city: faint dashed lines from the glow to the coasts */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {CITIES.map((c, i) => {
            const p = projectPacific(c.ll);
            const t = interpolate(frame, [farAt + i * 6, farAt + i * 6 + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const out = interpolate(frame, [ausAt - 10, ausAt + 5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            if (t <= 0 || out <= 0) return null;
            return (
              <g key={c.name} opacity={out}>
                <line x1={glow[0]} y1={glow[1]} x2={glow[0] + (p[0] - glow[0]) * t} y2={glow[1] + (p[1] - glow[1]) * t} stroke="#F2EEE6" strokeWidth={2} strokeDasharray="6 10" opacity={0.7} />
                <circle cx={p[0]} cy={p[1]} r={7} fill="#F2EEE6" opacity={t} />
                <text x={p[0] + (p[0] < 960 ? 14 : -14)} y={p[1] - 12} textAnchor={p[0] < 960 ? 'start' : 'end'} fontFamily={F.mono} fontSize={20} letterSpacing={2} fill="#F2EEE6" opacity={t}>
                  {c.name}
                </text>
              </g>
            );
          })}
        </svg>
        <HandDrawnAnnotation
          style={{ opacity: interpolate(frame, [nameAt - 10, nameAt + 4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}
          shape={{ type: 'arrow', from: [glow[0] - 330, glow[1] - 230], to: [glow[0] - 120, glow[1] - 50], bend: 0.2 }}
          at={recordAt}
          duration={18}
          color="white"
          seed="s1-rec"
          label={{ text: 'record heat — forecast', x: glow[0] - 330, y: glow[1] - 255, size: 46 }}
        />
      </div>

      {/* on-cue cutouts */}
      <Cutout enterAt={ausAt} from="scale" seed="s1-fire" style={{ left: aus[0] - 85, top: aus[1] - 110 }} innerStyle={{ padding: 10 }} exitAt={nameAt + 4} exitTo="bottom">
        <WeatherIcon name="fire" t={frame - ausAt} size={150} />
      </Cutout>
      <Cutout enterAt={peruAt} from="scale" seed="s1-rain" style={{ left: peru[0] - 170, top: peru[1] - 150 }} innerStyle={{ padding: 10 }} exitAt={nameAt + 8} exitTo="bottom">
        <WeatherIcon name="rain" t={frame - peruAt} size={150} />
      </Cutout>
      <Cutout enterAt={coffeeAt} from="bottom" seed="s1-coffee" style={{ left: 1290, top: 720 }} innerStyle={{ padding: 10 }} exitAt={nameAt + 12} exitTo="bottom">
        <CommodityIcon id="coffee" t={frame - coffeeAt} size={150} />
      </Cutout>

      {/* EL NIÑO */}
      {frame >= titleAt - 2 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 240, display: 'flex', justifyContent: 'center' }}>
          <KineticTitle text="EL NIÑO" at={titleAt} entrance="slam" fontSize={260} tone="dark" color={PALETTE.onDark} stagger={6} seed="s1-title" />
        </div>
      )}
      <DocumentCard
        variant="brief"
        kicker="WMO · SEASONAL CLIMATE UPDATE · 8 OCT 2026"
        title="El Niño outlook, Oct–Dec 2026"
        paragraphs={[[{ text: 'El Niño is ' }, { text: wmoOct2026.data.strengthWording, highlight: true }]]}
        fillerPerParagraph={2}
        highlightAt={strongAt + 4}
        enterAt={strongAt - 18}
        width={820}
        seed="s1-doc"
        rotation={-1.5}
        style={{ left: 550, top: 600 }}
      />
    </SceneShell>
  );
};
