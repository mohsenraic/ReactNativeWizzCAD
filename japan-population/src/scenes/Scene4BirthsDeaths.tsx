/**
 * Scene 4 — Births vs Deaths (1:45–2:20). Two lines with direct labels; births slide past their
 * milestones, deaths turn red and cross them (hand-drawn X on 2007, footnote "first dip: 2005"),
 * the natural decline fills red, and the IPSS forecast arrives on torn paper:
 * "what they expected" vs "what happened".
 */
import React from 'react';
import { AnimatedLineChart, HandDrawnAnnotation, SourceTag, makeChartScales } from '../components';
import type { ChartProps } from '../components';
import { birthMilestones, birthsSeries, crossover, deathsSeries, ipssBirthsForecast } from '../data/japan';
import { formatCompact } from '../lib/format';
import { COLORS } from '../theme';
import { sceneById } from '../timeline';
import { SceneShell, cue } from './helpers';

export const SCENE_4_DURATION = sceneById(4).durationInFrames;

const S = 4;
const LEFT = 110;
const TOP = 120;

export const Scene4BirthsDeaths: React.FC = () => {
  const twoLinesAt = cue(S, 'Two lines');
  const seventiesAt = cue(S, 'In the 1970s');
  const slidingAt = cue(S, 'births started sliding');
  const below1MAt = cue(S, 'below one million');
  const below700At = cue(S, 'below 700,000');
  const meanwhileAt = cue(S, 'Meanwhile');
  const crossedAt = cue(S, 'lines crossed');
  const redAt = cue(S, 'Everything in red');
  const forecastAt = cue(S, "government's own forecasters");
  const expectedAt = cue(S, "hadn't expected");

  const chart: ChartProps = {
    width: 1700,
    height: 820,
    margin: { top: 40, right: 240, bottom: 60, left: 100 },
    xDomain: [1950, 2045],
    yDomain: [0, 2_800_000],
    xTicks: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040],
    yTicks: [500_000, 1_000_000, 1_500_000, 2_000_000, 2_500_000],
    yTickFormat: (v) => formatCompact(v, 1),
    axesAt: 20,
    series: [
      {
        id: 'births',
        data: birthsSeries.data,
        color: COLORS.slate,
        strokeWidth: 6,
        draw: {
          at: twoLinesAt,
          duration: meanwhileAt - twoLinesAt,
          keyframes: [
            [twoLinesAt, 1950],
            [seventiesAt + 40, 1973],
            [slidingAt + 20, 1975],
            [below1MAt + 30, 2016],
            [below700At + 30, 2024],
            [meanwhileAt - 10, 2025],
          ],
        },
        label: { text: 'Births', dy: 128, dx: -10 },
      },
      {
        id: 'deaths',
        data: deathsSeries.data,
        color: COLORS.grey,
        colorTo: { color: COLORS.red, at: meanwhileAt, duration: 30 },
        strokeWidth: 6,
        draw: {
          at: twoLinesAt,
          duration: crossedAt - twoLinesAt,
          keyframes: [
            [twoLinesAt, 1950],
            [seventiesAt + 40, 1973],
            [slidingAt + 20, 1975],
            [meanwhileAt, 1975],
            [crossedAt - 10, 2025],
          ],
        },
        label: { text: 'Deaths' },
      },
      {
        id: 'ipss',
        data: ipssBirthsForecast.data,
        color: COLORS.ink,
        dashed: true,
        backing: 'tornPaper',
        draw: { at: forecastAt + 20, duration: 50 },
        label: { text: ipssBirthsForecast.labels.expected, size: 26, dy: -10 },
      },
    ],
    areas: [
      {
        id: 'decline',
        upper: 'deaths',
        lower: 'births',
        xRange: [crossover.firstDipYear, 2025],
        color: COLORS.red,
        opacity: 0.3,
        reveal: { at: redAt, duration: 30 },
      },
    ],
    milestones: [
      { seriesId: 'births', year: birthMilestones[0].year, label: birthMilestones[0].label, at: slidingAt + 20, side: 'below', length: 110 },
      { seriesId: 'births', year: birthMilestones[1].year, label: birthMilestones[1].label, at: below1MAt + 30, side: 'below', length: 70 },
      { seriesId: 'births', year: birthMilestones[2].year, label: birthMilestones[2].label, at: below700At + 30, side: 'below', length: 70, count: { from: 1000, to: 700, prefix: '< ', suffix: 'K · 2024' } },
    ],
    markers: [{ seriesId: 'births', year: crossover.year, at: crossedAt, flash: true }],
  };

  const sc = makeChartScales(chart);
  const [cx, cy] = sc.point('births', crossover.year);
  const [b73x, b73y] = sc.point('births', 1971);
  const [, d73y] = sc.point('deaths', 1971);
  const [bEndX, bEndY] = sc.point('births', 2025);
  const [declX0, declY] = [sc.x(2034), sc.y(1_250_000)];
  const declTo = sc.x(2022);

  return (
    <SceneShell id={S} paper="light" enter="whip" exit="whip" focus={[LEFT + cx, TOP + cy]} overlay={<SourceTag dataset={birthsSeries} also={[deathsSeries, ipssBirthsForecast]} at={20} />}>
      <AnimatedLineChart {...chart} style={{ left: LEFT, top: TOP }} />

      <HandDrawnAnnotation
        shape={{ type: 'arrow', from: [LEFT + b73x, TOP + d73y - 12], to: [LEFT + b73x, TOP + b73y + 16], bend: 0.04 }}
        at={seventiesAt + 44}
        duration={14}
        color="ink"
        seed="s4-gap"
        label={{ text: 'far more births', x: LEFT + b73x + 30, y: TOP + (b73y + d73y) / 2, size: 40, anchor: 'start' }}
      />
      <HandDrawnAnnotation
        shape={{ type: 'x', cx: LEFT + cx, cy: TOP + cy, size: 54 }}
        at={crossedAt + 4}
        duration={14}
        seed="s4-x"
        label={{ text: crossover.footnote, x: LEFT + cx - 16, y: TOP + cy - 62, size: 36, anchor: 'end' }}
      />
      <HandDrawnAnnotation
        shape={{ type: 'arrow', from: [LEFT + declX0, TOP + declY], to: [LEFT + declTo, TOP + declY + 6], bend: -0.15 }}
        at={redAt + 26}
        duration={12}
        seed="s4-decl"
        label={{ text: 'natural decline', x: LEFT + declX0 + 10, y: TOP + declY - 22, size: 46, anchor: 'start' }}
      />
      <HandDrawnAnnotation
        shape={{ type: 'arrow', from: [LEFT + bEndX + 330, TOP + bEndY + 70], to: [LEFT + bEndX + 16, TOP + bEndY + 8], bend: 0.18 }}
        at={expectedAt}
        duration={16}
        seed="s4-happened"
        label={{ text: 'what happened', x: LEFT + bEndX + 360, y: TOP + bEndY + 120, size: 46 }}
      />
    </SceneShell>
  );
};
