/**
 * Scene 8 — Outro (4:30–5:00). The Scene 2 chart returns, its x-axis stretches to 2070 and the line
 * extends dotted to the circled "~87M". Zoom out to a flat world map: South Korea, Italy and China
 * get pulsing red dots. Final question on paper strips (left half), then the end screen with the
 * right side kept clean for the last 10 seconds.
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { AnimatedLineChart, BigCounter, Cutout, HandDrawnAnnotation, KineticTitle, SourceTag, WorldMap, makeChartScales } from '../components';
import type { ChartProps } from '../components';
import { ipss2070, ipssProjection, sameTrajectory, totalPopulation } from '../data/japan';
import { COLORS, FONTS } from '../../../shared/theme';
import { END_SCREEN_FRAMES, sceneById } from '../timeline';
import { populationChartBase } from './Scene2Peak';
import { Fade, SceneShell, cue } from './helpers';

export const SCENE_8_DURATION = sceneById(8).durationInFrames;

const S = 8;
const LEFT = 150;
const TOP = 150;
const ISO = { Japan: '392', 'South Korea': '410', Italy: '380', China: '156' } as const;
const LABEL_OFFSETS: Record<string, { dx?: number; dy?: number }> = { Japan: { dx: 24, dy: 40 }, 'South Korea': { dx: -24, dy: -26 }, China: { dx: -24, dy: 48 } };

export const Scene8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const fallAt = cue(S, '87 million');
  const firstAt = cue(S, 'first major country');
  const koreaAt = cue(S, 'South Korea');
  const questionAt = cue(S, "The question isn't");
  const wellAt = cue(S, 'shrink well');
  const whatAt = cue(S, 'What would you do');
  const endAt = SCENE_8_DURATION - END_SCREEN_FRAMES;

  const xMax = interpolate(frame, [4, 46], [2025, 2070], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const last = totalPopulation.data[totalPopulation.data.length - 1];
  const chart: ChartProps = {
    ...populationChartBase(xMax),
    xTicks: [1950, 1970, 1990, 2010, 2030, 2050, 2070].filter((y) => y <= xMax + 0.5),
    series: [
      { id: 'pop', data: totalPopulation.data, color: COLORS.ink, strokeWidth: 6 },
      {
        id: 'proj',
        data: [last, ...ipssProjection.data],
        color: COLORS.red,
        dashed: true,
        strokeWidth: 6,
        draw: { at: fallAt, duration: 70 },
      },
    ],
    milestones: ipssProjection.milestones.map((m) => ({ seriesId: 'proj', year: m.year, label: m.label, at: fallAt + 46, side: 'above' as const, length: 80 })),
  };
  const sc = makeChartScales(chart);
  const [ex, ey] = sc.point('proj', 2070);
  const chartOut = firstAt - 6;

  const mapIn = firstAt - 10;
  const mapOut = endAt - 20;
  const dim = interpolate(frame, [questionAt - 10, questionAt + 10], [1, 0.45], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dots = sameTrajectory.data.map((d, i) => ({ ...d, at: i === 0 ? firstAt : koreaAt + (i - 1) * 18, ...LABEL_OFFSETS[d.name] }));

  return (
    <SceneShell
      id={S}
      paper="light"
      enter="whip"
      exit="none"
      overlay={
        <>
          <Fade outAt={chartOut}>
            <SourceTag dataset={totalPopulation} also={[ipssProjection]} at={0} />
          </Fade>
          <Fade inAt={chartOut + 12} outAt={endAt - 20}>
            <SourceTag dataset={sameTrajectory} at={chartOut + 12} />
          </Fade>
        </>
      }
    >
      <Fade outAt={chartOut}>
        <AnimatedLineChart {...chart} style={{ left: LEFT, top: TOP }} />
        <HandDrawnAnnotation shape={{ type: 'circle', cx: LEFT + ex, cy: TOP + ey, rx: 66, ry: 46 }} at={fallAt + 68} duration={16} seed="s8-87" />
        {frame >= fallAt + 72 && (
          <div style={{ position: 'absolute', left: LEFT + ex + 70, top: TOP + ey - 50, transform: 'rotate(-4deg)' }}>
            <BigCounter from={last.value} to={ipss2070.data.populationMillions} prefix="~" suffix="M" at={fallAt + 72} duration={30} fontSize={92} fontFamily={FONTS.hand} color={COLORS.red} digitWidth={0.46} />
            <div style={{ fontFamily: FONTS.hand, fontWeight: 700, fontSize: 38, color: COLORS.red, marginTop: -6 }}>by 2070</div>
          </div>
        )}
      </Fade>

      <Fade inAt={mapIn} outAt={mapOut} len={18}>
        <div style={{ position: 'absolute', inset: 0, opacity: dim }}>
          <WorldMap
            zoom={{ from: { center: [138, 37], scale: 5 }, to: { center: [70, 30], scale: 1.2 }, at: firstAt, duration: 70 }}
            highlight={sameTrajectory.data.map((d, i) => ({ iso: ISO[d.name as keyof typeof ISO], at: i === 0 ? firstAt : koreaAt + (i - 1) * 18, color: i === 0 ? '#E07A85' : '#E3A3A8' }))}
            dots={dots}
          />
        </div>
      </Fade>

      {/* Final question — left half only, so the end screen's right side stays clean */}
      <div style={{ position: 'absolute', left: 110, top: 150, width: 820 }}>
        {frame >= questionAt - 6 && <KineticTitle text="The question isn’t whether Japan will shrink." fontSize={74} strip align="left" at={questionAt} seed="s8-q1" maxWidth={760} />}
        <div style={{ height: 40 }} />
        {frame >= wellAt - 6 && <KineticTitle text="It’s whether it can shrink well." highlight={['shrink', 'well.']} fontSize={74} strip align="left" at={wellAt} seed="s8-q2" maxWidth={760} />}
        <div style={{ fontFamily: FONTS.hand, fontWeight: 700, fontSize: 84, color: COLORS.red, marginTop: 30, opacity: interpolate(frame, [whatAt, whatAt + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: 'rotate(-3deg)' }}>
          What would you do?
        </div>
      </div>

      {/* End screen (last 10 s): left column only */}
      <Cutout enterAt={endAt + 10} from="bottom" seed="s8-sub" rotation={-2} style={{ left: 120, top: 880 }} background={COLORS.red}>
        <div style={{ padding: '14px 40px', fontFamily: FONTS.headline, fontWeight: 700, fontSize: 54, color: '#FFFFFF', letterSpacing: 3 }}>SUBSCRIBE</div>
      </Cutout>
      <Fade inAt={endAt + 24}>
        <div style={{ position: 'absolute', left: 520, top: 920, fontFamily: FONTS.mono, fontSize: 22, letterSpacing: 2, color: COLORS.greyDark }}>
          ALL SOURCES IN THE DESCRIPTION
        </div>
      </Fade>
    </SceneShell>
  );
};
