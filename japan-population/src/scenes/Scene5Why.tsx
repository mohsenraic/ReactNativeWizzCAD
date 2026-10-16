/**
 * Scene 5 — Why? (2:20–3:20).
 * A: "2.1" counts up on a paper strip, shrinks and is pinned as the replacement line; the fertility
 *    curve draws below it and lands on 1.14; Tokyo pin at 0.96.
 * B: a corkboard slides up; the four causes are pinned as collage cards and tied with red string,
 *    which tightens into a knot on "Together" — "like a luxury".
 */
import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedLineChart, BigCounter, Cutout, IconCard, KineticTitle, PaperBackground, RedString, SourceTag, makeChartScales, pinOffset } from '../components';
import type { ChartProps, IconName } from '../components';
import { REPLACEMENT_TFR, fertilitySeries, vital2025 } from '../data/japan';
import { tornClipPath } from '../../../shared/lib/sketch';
import { COLORS, FONTS, SPRINGS } from '../../../shared/theme';
import { sceneById } from '../timeline';
import { Fade, SceneShell, cue } from './helpers';

export const SCENE_5_DURATION = sceneById(5).durationInFrames;

const S = 5;
const LEFT = 150;
const TOP = 150;

const CARDS: Array<{ icon: IconName; label: string; note: string; cue: string; pos: [number, number] }> = [
  { icon: 'cost', label: 'COST', note: 'housing · school · wages', cue: 'Cost: housing', pos: [110, 320] },
  { icon: 'work', label: 'WORK', note: 'long hours', cue: 'Work culture', pos: [550, 290] },
  { icon: 'marriage', label: 'MARRIAGE', note: 'later, or never', cue: 'Marriage: in Japan', pos: [990, 320] },
  { icon: 'gender', label: 'GENDER ROLES', note: 'career or family', cue: 'And gender roles', pos: [1430, 290] },
];
const KNOT: [number, number] = [960, 850];

export const Scene5Why: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const keyAt = cue(S, 'The key number');
  const thatsAt = cue(S, "That's the fertility rate");
  const immigAt = cue(S, 'without immigration');
  const japanAt = cue(S, "Japan's is 1.14");
  const tokyoAt = cue(S, 'In Tokyo');
  const tangledAt = cue(S, 'The reasons are tangled');
  const noneAt = cue(S, 'None of these alone');
  const togetherAt = cue(S, 'Together');
  const luxuryAt = cue(S, 'like a luxury');

  // ---- Part A: 2.1 strip → replacement line → fertility curve
  const chart: ChartProps = {
    width: 1640,
    height: 780,
    margin: { top: 40, right: 260, bottom: 60, left: 90 },
    xDomain: [1950, 2025],
    yDomain: [0.5, 4],
    xTicks: [1950, 1970, 1990, 2010],
    yTicks: [1, 2, 3, 4],
    yTickFormat: (v) => v.toFixed(1),
    axesAt: thatsAt + 30,
    series: [
      {
        id: 'repl',
        data: [{ year: 1950, value: REPLACEMENT_TFR }, { year: 2025, value: REPLACEMENT_TFR }],
        color: COLORS.red,
        dashed: true,
        strokeWidth: 5,
        tipDot: false,
        draw: { at: thatsAt + 40, duration: 40 },
        label: { text: 'replacement level', size: 26, dy: -4 },
      },
      {
        id: 'tfr',
        data: fertilitySeries.data,
        color: COLORS.ink,
        strokeWidth: 6,
        draw: { at: immigAt, duration: japanAt + 20 - immigAt },
      },
    ],
  };
  const sc = makeChartScales(chart);
  const stripLand = spring({ frame: frame - (thatsAt + 30), fps, config: SPRINGS.smooth, durationInFrames: 30 });
  const stripX = interpolate(stripLand, [0, 1], [960, LEFT + sc.x(1998)]);
  const stripY = interpolate(stripLand, [0, 1], [470, TOP + sc.y(REPLACEMENT_TFR) - 84]);
  const stripScale = interpolate(stripLand, [0, 1], [1, 0.36]);
  const stripIn = spring({ frame: frame - keyAt, fps, config: SPRINGS.cutout });
  const [endX, endY] = sc.point('tfr', 2025);

  // ---- Part B: corkboard
  const corkIn = interpolate(frame, [tangledAt - 6, tangledAt + 18], [1080, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const gather = interpolate(frame, [togetherAt, togetherAt + 30], [0, 0.32], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const cardAt = CARDS.map((c) => cue(S, c.cue));
  const pos = CARDS.map(({ pos: [x, y] }) => [x + (KNOT[0] - 176 - x) * gather, y + (KNOT[1] - 400 - y) * gather] as [number, number]);
  const pins = pos.map(([x, y]) => [x + pinOffset[0], y + pinOffset[1]] as [number, number]);
  const stringAt = [cardAt[1] + 14, cardAt[2] + 14, cardAt[3] + 14, noneAt + 10];

  return (
    <SceneShell
      id={S}
      paper="light"
      enter="paper"
      exit="whip"
      focus={[960, 520]}
      overlay={
        <Fade outAt={tangledAt - 10}>
          <SourceTag dataset={fertilitySeries} also={[vital2025]} at={thatsAt + 30} />
        </Fade>
      }
    >
      {/* Part A */}
      <Fade outAt={tangledAt + 10}>
        <AnimatedLineChart {...chart} style={{ left: LEFT, top: TOP }} />
        {frame >= keyAt - 2 && (
          <div
            style={{
              position: 'absolute',
              left: stripX,
              top: stripY,
              transform: `translate(-50%, -50%) scale(${stripScale * Math.min(1, stripIn)}) rotate(-2deg)`,
              filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.28))',
            }}
          >
            <div style={{ background: '#F7F3EA', padding: '20px 90px', clipPath: tornClipPath('s5-strip', { edges: ['left', 'right'], depth: 1.4 }) }}>
              <BigCounter to={REPLACEMENT_TFR} decimals={1} at={keyAt} duration={30} fontSize={340} color={COLORS.ink} />
            </div>
            <div style={{ position: 'absolute', top: -10, left: '50%', width: 44, height: 44, marginLeft: -22, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, #F05A6E, ${COLORS.red} 55%, #7A0A1C)`, opacity: stripLand, boxShadow: '3px 6px 6px rgba(0,0,0,0.35)' }} />
          </div>
        )}
        {frame >= japanAt && (
          <div style={{ position: 'absolute', left: LEFT + endX + 26, top: TOP + endY - 64 }}>
            <BigCounter from={REPLACEMENT_TFR} to={vital2025.data.tfr} decimals={2} at={japanAt} duration={30} fontSize={92} color={COLORS.ink} />
            <div style={{ fontFamily: FONTS.hand, fontWeight: 700, fontSize: 40, color: COLORS.red, marginTop: -4 }}>Japan · record low</div>
          </div>
        )}
        <Cutout enterAt={tokyoAt} from="bottom" seed="s5-tokyo" style={{ left: LEFT + endX - 150, top: TOP + sc.y(vital2025.data.tfrTokyo) + 40 }} rotation={-2}>
          <div style={{ padding: '10px 18px', display: 'flex', gap: 14, alignItems: 'baseline' }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.greyDark, letterSpacing: 2 }}>TOKYO</span>
            <BigCounter from={vital2025.data.tfr} to={vital2025.data.tfrTokyo} decimals={2} at={tokyoAt + 6} duration={24} fontSize={54} color={COLORS.red} />
          </div>
        </Cutout>
      </Fade>

      {/* Part B */}
      {frame >= tangledAt - 6 && (
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${corkIn}px)`, boxShadow: '0 -24px 50px rgba(0,0,0,0.35)' }}>
          <PaperBackground tone="cork" seed="s5-cork" />
          {CARDS.map((c, i) => (
            <IconCard key={c.icon} icon={c.icon} label={c.label} note={c.note} enterAt={cardAt[i]} seed={`s5-${c.icon}`} style={{ left: pos[i][0], top: pos[i][1] }} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <RedString key={i} points={[pins[i], pins[(i + 1) % 4]]} at={stringAt[i]} segmentFrames={16} tightenAt={togetherAt + 8} knot={KNOT} />
          ))}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center' }}>
            {frame >= luxuryAt - 6 && <KineticTitle text="like a luxury" highlight={['luxury']} fontSize={96} strip at={luxuryAt} />}
          </div>
        </div>
      )}
    </SceneShell>
  );
};
