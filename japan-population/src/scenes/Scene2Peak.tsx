/**
 * Scene 2 — The Peak (0:25–0:55). Population line draws 1950 → 2025 in sync with the narration,
 * camera follows the tip, the 2008 peak is circled by hand ("peak: ~128M") and the decline is
 * hatched in red with a counting "−5.1M".
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { AnimatedLineChart, BigCounter, HandDrawnAnnotation, SourceTag, makeChartScales, seriesTip } from '../components';
import type { ChartProps } from '../components';
import { lossFromPeakMillions, populationPeak, totalPopulation } from '../data/japan';
import { COLORS, FONTS } from '../../../shared/theme';
import { sceneById } from '../timeline';
import { SceneShell, cue, useFade } from './helpers';

export const SCENE_2_DURATION = sceneById(2).durationInFrames;

const S = 2;
const LEFT = 150;
const TOP = 150;

/** Shared with Scene 8, which brings this chart back. */
export const populationChartBase = (xMax: number): Omit<ChartProps, 'series'> => ({
  width: 1640,
  height: 800,
  margin: { top: 40, right: 230, bottom: 60, left: 90 },
  xDomain: [1950, xMax],
  yDomain: [75, 135],
  xTicks: xMax > 2030 ? [1950, 1970, 1990, 2010, 2030, 2050, 2070] : [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020],
  yTicks: [80, 90, 100, 110, 120, 130],
  yTickFormat: (v) => `${v}M`,
});

export const Scene2Peak: React.FC = () => {
  const frame = useCurrentFrame();

  const startAt = cue(S, '83 million');
  const mid80sAt = cue(S, '120 million');
  const peakAt = cue(S, 'Then, in 2008', 40);
  const fallAt = cue(S, 'began to fall');
  const fasterAt = cue(S, 'Then faster');
  const todayAt = cue(S, 'Today, Japan');
  const accelAt = cue(S, 'accelerating');

  const chart: ChartProps = {
    ...populationChartBase(2025),
    axesAt: 50,
    series: [
      {
        id: 'pop',
        data: totalPopulation.data,
        color: COLORS.ink,
        strokeWidth: 6,
        draw: {
          at: startAt,
          duration: todayAt - startAt,
          keyframes: [
            [startAt, 1950],
            [mid80sAt + 60, 1985],
            [peakAt, 2008],
            [fallAt + 25, 2012],
            [fasterAt + 70, 2021],
            [todayAt + 50, 2025],
          ],
        },
        label: { text: 'Japan', dy: -4 },
      },
    ],
    areas: [
      {
        id: 'loss',
        upper: populationPeak.data.millions,
        lower: 'pop',
        xRange: [populationPeak.data.year, 2025],
        fill: 'hatch',
        color: COLORS.red,
        reveal: { at: todayAt + 52, duration: 30 },
      },
    ],
    milestones: [
      { seriesId: 'pop', year: 1950, label: '83M · 1950', at: startAt + 4, side: 'above', length: 70, count: { to: 83.2, decimals: 1, suffix: 'M · 1950' } },
      { seriesId: 'pop', year: 1985, label: '121M · 1985', at: mid80sAt + 60, side: 'below', length: 90, count: { to: 121, suffix: 'M · 1985' } },
    ],
    markers: [{ seriesId: 'pop', year: populationPeak.data.year, at: peakAt, pulse: true }],
    yearTicker: { seriesId: 'pop', x: 1600, y: 10, fontSize: 72 },
  };

  const sc = makeChartScales(chart);
  const [px, py] = sc.point('pop', populationPeak.data.year);
  const [tx, ty] = seriesTip(chart, 'pop', frame);
  const follow: [number, number] = [(LEFT + tx - 960) * 0.18, (TOP + ty - 540) * 0.12];
  const lossOpacity = useFade(todayAt + 70);
  const [ax0, ay0] = sc.point('pop', 2014);
  const [ax1, ay1] = sc.point('pop', 2024);

  return (
    <SceneShell
      id={S}
      paper="light"
      enter="paper"
      exit="whip"
      offset={follow}
      focus={[LEFT + px, TOP + py]}
      overlay={<SourceTag dataset={totalPopulation} at={60} />}
    >
      <AnimatedLineChart {...chart} style={{ left: LEFT, top: TOP }} />
      <HandDrawnAnnotation
        shape={{ type: 'circle', cx: LEFT + px, cy: TOP + py, rx: 70, ry: 44 }}
        at={peakAt + 6}
        duration={18}
        seed="s2-peak"
        label={{ text: populationPeak.data.annotation, x: LEFT + px - 40, y: TOP + py - 74, anchor: 'end', size: 56 }}
      />
      {lossOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: LEFT + sc.x(2013),
            top: TOP + sc.y(populationPeak.data.millions) - 150,
            opacity: lossOpacity,
            transform: 'rotate(-4deg)',
          }}
        >
          <BigCounter from={0} to={-lossFromPeakMillions()} decimals={1} suffix="M" at={todayAt + 70} duration={36} fontSize={76} fontFamily={FONTS.hand} color={COLORS.red} digitWidth={0.46} />
          <div style={{ fontFamily: FONTS.hand, fontWeight: 700, fontSize: 36, color: COLORS.red, marginTop: -6 }}>since the peak</div>
        </div>
      )}
      <HandDrawnAnnotation
        shape={{ type: 'arrow', from: [LEFT + ax0 - 40, TOP + ay0 + 120], to: [LEFT + ax1 - 6, TOP + ay1 + 30], bend: 0.18 }}
        at={accelAt}
        duration={16}
        color="ink"
        seed="s2-accel"
        label={{ text: 'accelerating', x: LEFT + ax0 - 60, y: TOP + ay0 + 170, size: 44 }}
      />
    </SceneShell>
  );
};
