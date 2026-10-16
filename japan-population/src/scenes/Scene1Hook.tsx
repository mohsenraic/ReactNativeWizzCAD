/**
 * Scene 1 — Hook (0:00–0:25). Charcoal paper. A report page slides in, −918,253 is highlighted,
 * lifts off the page and becomes the big counter. Deaths / births land as cutouts, a dot-built
 * city the size of Austin dissolves, and "19 YEARS IN A ROW" is circled in red.
 */
import React from 'react';
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BigCounter, Cutout, DocumentCard, HandDrawnAnnotation, SourceTag } from '../components';
import { austin, vital2025 } from '../data/japan';
import { MINUS } from '../../../shared/lib/format';
import { COLORS, FONTS, SPRINGS } from '../../../shared/theme';
import { sceneById } from '../timeline';
import { SceneShell, cue, useFade } from './helpers';

export const SCENE_1_DURATION = sceneById(1).durationInFrames;

const S = 1;
const PAPER_WHITE = '#F2EEE6';

/** Skyline of dots that disappear one by one. */
const DotCity: React.FC<{ at: number; dissolveAt: number; dissolveFrames: number }> = ({ at, dissolveAt, dissolveFrames }) => {
  const frame = useCurrentFrame();
  const dots = React.useMemo(() => {
    const out: Array<{ x: number; y: number; order: number; row: number }> = [];
    let x = 930;
    let b = 0;
    while (x < 1780) {
      const w = 40 + Math.round(random(`bw${b}`) * 60);
      const h = 50 + Math.round(random(`bh${b}`) * (b % 5 === 2 ? 230 : 150));
      for (let dx = 0; dx < w; dx += 13)
        for (let dy = 0; dy < h; dy += 13) out.push({ x: x + dx, y: 900 - dy, order: random(`o${out.length}`), row: dy });
      x += w + 8;
      b++;
    }
    return out;
  }, []);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {dots.map((d, i) => {
        const appear = interpolate(frame, [at + d.row / 10, at + d.row / 10 + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const goneAt = dissolveAt + d.order * dissolveFrames;
        const fade = interpolate(frame, [goneAt, goneAt + 6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const o = appear * fade;
        if (o <= 0) return null;
        return <circle key={i} cx={d.x} cy={d.y - (1 - fade) * 14} r={4} fill={PAPER_WHITE} opacity={o * 0.8} />;
      })}
    </svg>
  );
};

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { births, deaths, naturalChange, consecutiveYearsOfDecline } = vital2025.data;

  const hlAt = cue(S, 'nearly a million', 30);
  const liftAt = cue(S, 'Not to war', -6);
  const deathsAt = cue(S, '1.59 million deaths');
  const birthsAt = cue(S, '671,000 births');
  const austinAt = cue(S, 'Austin');
  const dissolveAt = cue(S, 'disappearing');
  const yearsAt = cue(S, 'nineteen years');

  // The highlighted number lifts off the page and flies to the headline position.
  const lift = spring({ frame: frame - liftAt, fps, config: SPRINGS.smooth, durationInFrames: 36 });
  const fx = interpolate(lift, [0, 1], [300, 880]);
  const fy = interpolate(lift, [0, 1], [520, 110]);
  const fs = interpolate(lift, [0, 1], [0.18, 1]);
  const liftShadow = interpolate(lift, [0, 0.5, 1], [0, 30, 10]);

  const cityOpacity = useFade(austinAt, yearsAt - 20);

  return (
    <SceneShell
      id={S}
      paper="dark"
      enter="none"
      exit="whip"
      focus={[1100, 420]}
      overlay={
        <>
          <SourceTag dataset={vital2025} also={[austin]} tone="dark" at={10} />
        </>
      }
    >
      <DocumentCard
        variant="report"
        meta="2025 · FINAL"
        kicker="Vital statistics · annual summary"
        title="Population dynamics of Japanese nationals, 2025"
        paragraphs={[
          'Final figures for Japanese nationals resident in Japan.',
          [{ text: 'Natural change: ' }, { text: `${MINUS}918,253`, highlight: true, id: 'num', style: { fontSize: 34 } }],
          'Deaths exceeded births for the nineteenth consecutive year.',
        ]}
        highlightAt={hlAt}
        hiddenIds={['num']}
        hideAt={liftAt}
        enterAt={6}
        from="left"
        width={660}
        rotation={-2.5}
        style={{ left: 110, top: 150 }}
        seed="s1-report"
      />

      {frame >= liftAt && (
        <div
          style={{
            position: 'absolute',
            left: fx,
            top: fy,
            transform: `scale(${fs})`,
            transformOrigin: '0 0',
            filter: `drop-shadow(0 ${liftShadow}px ${liftShadow}px rgba(0,0,0,0.5))`,
          }}
        >
          <BigCounter from={0} to={naturalChange} at={liftAt} duration={80} fontSize={220} color={PAPER_WHITE} clicks />
          <div style={{ fontFamily: FONTS.mono, fontSize: 24, color: '#A9A49B', letterSpacing: 2, marginTop: 10, opacity: lift }}>
            JAPAN · NATURAL CHANGE · 2025
          </div>
        </div>
      )}

      <Cutout enterAt={deathsAt} from="right" seed="s1-deaths" style={{ left: 900, top: 450 }} rotation={-2}>
        <div style={{ padding: '18px 30px 22px' }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 20, letterSpacing: 2, color: COLORS.greyDark }}>DEATHS · 2025</div>
          <BigCounter to={deaths} at={deathsAt + 4} duration={50} fontSize={92} color={COLORS.red} />
        </div>
      </Cutout>
      <Cutout enterAt={birthsAt} from="right" seed="s1-births" style={{ left: 1390, top: 470 }} rotation={2.2}>
        <div style={{ padding: '18px 30px 22px' }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 20, letterSpacing: 2, color: COLORS.greyDark }}>BIRTHS · 2025</div>
          <BigCounter to={births} at={birthsAt + 4} duration={50} fontSize={92} color={COLORS.slate} />
        </div>
      </Cutout>

      {cityOpacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: cityOpacity }}>
          <DotCity at={austinAt} dissolveAt={dissolveAt} dissolveFrames={70} />
          <Cutout enterAt={austinAt + 6} from="bottom" seed="s1-austin" style={{ left: 930, top: 930 }} rotation={-1.5} background="#FBFAF6">
            <div style={{ padding: '8px 18px', fontFamily: FONTS.mono, fontSize: 22, color: COLORS.ink, display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <span>AUSTIN, TX · POP.</span>
              <BigCounter to={austin.data.population} at={austinAt + 10} duration={40} fontSize={26} fontFamily={FONTS.mono} fontWeight={500} digitWidth={0.6} color={COLORS.ink} />
            </div>
          </Cutout>
        </div>
      )}

      {frame >= yearsAt - 4 && (
        <div
          style={{
            position: 'absolute',
            left: 960,
            top: 730,
            display: 'flex',
            alignItems: 'baseline',
            gap: 22,
            fontFamily: FONTS.hand,
            fontWeight: 700,
            fontSize: 96,
            color: PAPER_WHITE,
            opacity: interpolate(frame, [yearsAt - 4, yearsAt + 6], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `rotate(-3deg) translateY(${interpolate(frame, [yearsAt - 4, yearsAt + 10], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })}px)`,
          }}
        >
          <BigCounter to={consecutiveYearsOfDecline} at={yearsAt} duration={30} fontSize={96} fontFamily={FONTS.hand} color={PAPER_WHITE} digitWidth={0.5} />
          <span>YEARS IN A ROW</span>
        </div>
      )}
      <HandDrawnAnnotation shape={{ type: 'circle', cx: 1300, cy: 795, rx: 380, ry: 92 }} at={yearsAt + 28} duration={20} color="red" strokeWidth={6} seed="s1-circle" />
    </SceneShell>
  );
};
