/**
 * Scene 6 — What it means (3:20–4:05).
 * A: muted map of Japan, zoom into Akita (largest 2020→25 fall) where village dots disappear;
 *    Tokyo and Okinawa glow; akiya clipping + counter to ~9,000,000 with houses filling up.
 * B: "workers per retiree" — stick figures holding up a retiree's platform: 4.8 → 2.0 → 1.3.
 * C: sectors short of staff, then the hand-drawn loop in red.
 */
import React from 'react';
import { Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { BigCounter, Cutout, DocumentCard, HandDrawnAnnotation, JapanMap, LoopDiagram, SourceTag, Stamp } from '../components';
import { akiya, mapFocus, workersPerRetiree } from '../data/japan';
import { formatNumber } from '../lib/format';
import { COLORS, FONTS } from '../theme';
import { sceneById } from '../timeline';
import { Fade, SceneShell, cue } from './helpers';

export const SCENE_6_DURATION = sceneById(6).durationInFrames;

const S = 6;

const House: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill="none" stroke={COLORS.ink} strokeWidth={2.4} strokeLinejoin="round">
    <path d="M 0 12 L 14 0 L 28 12" />
    <path d="M 4 10 L 4 28 L 24 28 L 24 10" />
    <rect x={11} y={18} width={7} height={10} />
  </g>
);

const Figure: React.FC<{ x: number; y: number; o: number; old?: boolean }> = ({ x, y, o, old }) => (
  <g transform={`translate(${x} ${y})`} opacity={o} fill="none" stroke={old ? COLORS.red : COLORS.ink} strokeWidth={6} strokeLinecap="round">
    <circle cx={0} cy={-118} r={18} fill={old ? COLORS.red : COLORS.ink} />
    <line x1={0} y1={-98} x2={0} y2={-40} />
    {old ? (
      <>
        <line x1={0} y1={-80} x2={26} y2={-58} />
        <line x1={26} y1={-58} x2={30} y2={0} />
      </>
    ) : (
      <path d="M -30 -132 L 0 -90 L 30 -132" />
    )}
    <path d="M -20 0 L 0 -40 L 20 0" />
  </g>
);

const WorkersFigure: React.FC<{ at: number; steps: number[] }> = ({ at, steps }) => {
  const frame = useCurrentFrame();
  const d = workersPerRetiree.data;
  let k = 0;
  for (let i = 1; i < steps.length; i++) if (frame >= steps[i]) k = i;
  const t = k === 0 ? 1 : interpolate(frame, [steps[k], steps[k] + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const prev = d[Math.max(0, k - 1)].value;
  const cur = d[k].value;
  const ratio = prev + (cur - prev) * t;
  const year = Math.round(d[Math.max(0, k - 1)].year + (d[k].year - d[Math.max(0, k - 1)].year) * t);
  const slots = 6;
  const baseX = 1180;
  const gap = 110;
  const sag = interpolate(ratio, [1.3, 4.8], [26, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const appear = interpolate(frame, [at, at + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const platformY = 828 + sag;

  return (
    <g opacity={appear}>
      <line x1={baseX - 40} y1={platformY - 140} x2={baseX + gap * slots - 70} y2={platformY - 140 + sag} stroke={COLORS.ink} strokeWidth={10} strokeLinecap="round" />
      <Figure x={baseX + (gap * slots) / 2 - 60} y={platformY - 146} o={1} old />
      {Array.from({ length: slots }, (_, i) => {
        const o = Math.max(0, Math.min(1, ratio - i));
        return <Figure key={i} x={baseX + i * gap} y={820} o={o * 0.9 + (o > 0 ? 0.1 : 0)} />;
      })}
      <line x1={baseX - 80} y1={822} x2={baseX + gap * slots} y2={822} stroke={COLORS.greyDark} strokeWidth={3} />
      <foreignObject x={160} y={330} width={860} height={420}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 26, letterSpacing: 3, color: COLORS.greyDark }}>PEOPLE AGED 15–64 PER PERSON 65+</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 26, marginTop: 6 }}>
          <span style={{ fontFamily: FONTS.headline, fontWeight: 700, fontSize: 220, color: COLORS.ink, lineHeight: 1 }}>{formatNumber(ratio, { decimals: 1 })}</span>
          <span style={{ fontFamily: FONTS.mono, fontWeight: 500, fontSize: 64, color: k === 2 ? COLORS.red : COLORS.ink }}>
            {year}
            {k === 2 ? '*' : ''}
          </span>
        </div>
        {k === 2 && <div style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.greyDark, marginTop: 8 }}>* IPSS 2023 PROJECTION</div>}
      </foreignObject>
    </g>
  );
};

export const Scene6Consequences: React.FC = () => {
  const frame = useCurrentFrame();
  const villagesAt = cue(S, 'villages are emptying');
  const schoolsAt = cue(S, 'Schools close');
  const akiyaAt = cue(S, 'vacant homes');
  const nothingAt = cue(S, 'almost nothing');
  const economyAt = cue(S, 'The economy feels');
  const fewerAt = cue(S, 'Fewer workers');
  const pensionsAt = cue(S, 'through pensions');
  const sectorsAt = cue(S, 'Hospitals, construction');
  const staffAt = cue(S, 'struggle to find staff');
  const ruralAt = cue(S, 'In rural areas');
  const loopAt = cue(S, "It's a loop");

  const houses = React.useMemo(
    () => Array.from({ length: 90 }, (_, i) => ({ x: 1040 + (i % 15) * 54 + random(`hx${i}`) * 10, y: 770 + Math.floor(i / 15) * 44, d: random(`hd${i}`) })),
    [],
  );

  return (
    <SceneShell
      id={S}
      paper="light"
      enter="paper"
      exit="whip"
      focus={[700, 500]}
      overlay={
        <>
          <Fade outAt={economyAt - 6}>
            <SourceTag text={`${mapFocus.sourceTag} · ${akiya.sourceTag}`} at={villagesAt} />
          </Fade>
          <Fade inAt={economyAt + 10} outAt={sectorsAt - 6}>
            <SourceTag dataset={workersPerRetiree} at={economyAt + 10} />
          </Fade>
        </>
      }
    >
      {/* A — map, villages, akiya */}
      <Fade outAt={economyAt - 10}>
        <JapanMap
          width={980}
          height={1080}
          style={{ left: 40, top: 0 }}
          glow={mapFocus.glowPrefectures.map((id) => ({ id: id.toLowerCase(), at: villagesAt }))}
          fills={mapFocus.fadeOrder.map((id, i) => ({ id: id.toLowerCase(), color: '#B5AE9F', at: villagesAt + 10 + i * 8 }))}
          zooms={[
            { target: 'akita', at: villagesAt + 6, duration: 45, padding: 0.55 },
            { target: null, at: akiyaAt - 10, duration: 40 },
          ]}
          villages={[{ id: 'akita', count: 80, at: villagesAt + 30, fadeFrom: villagesAt + 70, fadeDuration: 120 }]}
          labels={[{ id: 'akita', text: 'AKITA', at: villagesAt + 50 }]}
          pulses={[{ id: 'tokyo', at: villagesAt + 20, color: COLORS.slate }]}
        />
        <Fade outAt={akiyaAt - 14}>
          <Cutout enterAt={villagesAt + 54} from="right" seed="s6-akita" style={{ left: 1120, top: 220 }} rotation={-2}>
            <div style={{ padding: '18px 28px' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 20, letterSpacing: 2, color: COLORS.greyDark }}>AKITA PREFECTURE · 2020 → 2025</div>
              <BigCounter to={mapFocus.zoomPrefectureChange * 100} decimals={1} suffix="%" at={villagesAt + 60} duration={40} fontSize={110} color={COLORS.red} />
              <div style={{ fontFamily: FONTS.hand, fontWeight: 700, fontSize: 36, color: COLORS.ink }}>largest fall of any prefecture</div>
            </div>
          </Cutout>
          <Cutout enterAt={schoolsAt} from="bottom" seed="s6-school" style={{ left: 1260, top: 560 }} rotation={2.5}>
            <div style={{ padding: '18px 30px', fontFamily: FONTS.headline, fontWeight: 700, fontSize: 52, color: COLORS.ink }}>VILLAGE SCHOOL</div>
          </Cutout>
          <Stamp text="CLOSED" at={schoolsAt + 22} fontSize={70} rotation={-12} style={{ left: 1330, top: 600 }} />
        </Fade>
        <DocumentCard
          variant="clipping"
          meta="REGIONAL"
          title="Empty homes offered for almost nothing"
          paragraphs={[[{ text: 'Vacant houses — ' }, { text: 'akiya', highlight: true }, { text: ' — now number ' }, { text: `about ${formatNumber(akiya.data.vacantHomes)}`, highlight: true }, { text: ', a record.' }]]}
          highlightAt={nothingAt}
          fillerPerParagraph={1}
          enterAt={akiyaAt}
          from="right"
          width={700}
          rotation={2}
          style={{ left: 1080, top: 110 }}
          seed="s6-akiya"
        />
        {frame >= akiyaAt && (
          <>
            <div style={{ position: 'absolute', left: 1080, top: 590 }}>
              <BigCounter to={akiya.data.vacantHomes} at={akiyaAt + 10} duration={70} fontSize={110} color={COLORS.ink} />
              <div style={{ fontFamily: FONTS.mono, fontSize: 22, letterSpacing: 2, color: COLORS.greyDark, marginTop: 10 }}>VACANT HOMES · 2023 · RECORD {Math.round(akiya.data.vacancyRate * 1000) / 10}%</div>
            </div>
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
              {houses.map((h, i) => {
                const hAt = akiyaAt + 10 + h.d * 70;
                const o = interpolate(frame, [hAt, hAt + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return <House key={i} x={h.x} y={h.y} s={1} o={o} />;
              })}
            </svg>
          </>
        )}
      </Fade>

      {/* B — workers per retiree */}
      <Fade inAt={economyAt} outAt={sectorsAt - 8}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <WorkersFigure at={economyAt} steps={[economyAt, fewerAt + 30, pensionsAt + 30]} />
        </svg>
      </Fade>

      {/* C — sectors, then the loop */}
      <Fade inAt={sectorsAt} outAt={ruralAt - 8}>
        {['HOSPITALS', 'CONSTRUCTION', 'LOGISTICS'].map((t, i) => (
          <Cutout key={t} enterAt={sectorsAt + i * 14} from="bottom" seed={`s6-sec${i}`} style={{ left: 170 + i * 560, top: 380 }}>
            <div style={{ padding: '26px 40px', fontFamily: FONTS.headline, fontWeight: 700, fontSize: 64, color: COLORS.ink }}>{t}</div>
          </Cutout>
        ))}
        <HandDrawnAnnotation shape={{ type: 'underline', x: 640, y: 640, width: 640 }} at={staffAt} duration={14} label={{ text: 'help wanted — everywhere', x: 960, y: 720, size: 64 }} seed="s6-staff" />
      </Fade>
      <Fade inAt={ruralAt - 4}>
        <LoopDiagram
          nodes={['depopulation', 'shops & trains close', 'young people leave', 'lowest fertility']}
          center={[960, 560]}
          radius={380}
          at={ruralAt}
          perNode={Math.round((loopAt - ruralAt) / 4)}
          fontSize={58}
        />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: FONTS.hand, fontWeight: 700, fontSize: 90, color: COLORS.red, opacity: interpolate(frame, [loopAt, loopAt + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          a loop
        </div>
      </Fade>
    </SceneShell>
  );
};
