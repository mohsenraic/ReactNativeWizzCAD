/**
 * demos.tsx — one short demo per component (usage examples you can scrub in Remotion Studio).
 * Each demo is also registered as its own composition (see Root.tsx) for quick stills.
 * These are previews, not the final scenes (Phase 4).
 */
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../theme';
import {
  AnimatedLineChart, BigCounter, CameraRig, ChapterCard, Cutout, DocumentCard, HandDrawnAnnotation,
  IconCard, JapanMap, KineticTitle, LoopDiagram, PaperBackground, ParallaxLayer, PopulationPyramid,
  RedString, SourceTag, Stamp, WorldMap, makeChartScales, pyramidGeometry, boomIndexAt, useStampShake,
} from '../components';
import type { ChartProps, PyramidKeyframe } from '../components';
import {
  birthsSeries, deathsSeries, ipssBirthsForecast, ipssProjection, populationPeak, pyramids, sameTrajectory,
  totalPopulation, vital2025, lossFromPeakMillions, birthMilestones, crossover, akiya, foreignResidents,
  policySpending, robotics, mapFocus,
} from '../data/japan';
import { MINUS, formatCompact, formatNumber } from '../lib/format';

export const DEMO_FRAMES = 180;

const Label: React.FC<{ children: React.ReactNode; tone?: 'light' | 'dark' }> = ({ children, tone = 'light' }) => (
  <div style={{ position: 'absolute', right: 40, top: 30, fontFamily: FONTS.mono, fontSize: 20, color: tone === 'dark' ? '#888' : COLORS.greyDark }}>
    {children}
  </div>
);

/* 1 — PaperBackground + CameraRig + KineticTitle + Highlighter */
export const DemoTitle: React.FC = () => (
  <CameraRig>
    <ParallaxLayer depth={0.3}><PaperBackground tone="light" /></ParallaxLayer>
    <ParallaxLayer depth={1}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <KineticTitle text="Why Japan is losing millions of people" highlight={['millions']} at={10} fontSize={130} maxWidth={1500} />
      </AbsoluteFill>
    </ParallaxLayer>
    <ParallaxLayer depth={1.4}>
      <Cutout enterAt={50} from="right" style={{ right: 160, bottom: 140 }} seed="note">
        <div style={{ padding: '16px 26px', fontFamily: FONTS.hand, fontWeight: 700, fontSize: 44, color: COLORS.red }}>a 5-minute explainer</div>
      </Cutout>
    </ParallaxLayer>
    <Label>PaperBackground · CameraRig · KineticTitle · Highlighter · Cutout</Label>
  </CameraRig>
);

/* 2 — DocumentCard + BigCounter + Cutout + HandDrawnAnnotation (Scene 1 language) */
export const DemoHook: React.FC = () => {
  const { births, deaths, naturalChange } = vital2025.data;
  return (
    <CameraRig>
      <ParallaxLayer depth={0.3}><PaperBackground tone="dark" /></ParallaxLayer>
      <ParallaxLayer depth={1}>
        <DocumentCard
          variant="report"
          meta="2025 · FINAL"
          kicker="Vital statistics · annual summary"
          title="Population dynamics of Japanese nationals, 2025"
          paragraphs={[
            'Births and deaths recorded during the calendar year.',
            [{ text: 'Natural change: ' }, { text: `${MINUS}918,253`, highlight: true, id: 'num', style: { fontSize: 34 } }],
          ]}
          highlightAt={40}
          hiddenIds={['num']}
          hideAt={80}
          enterAt={0}
          width={700}
          style={{ left: 140, top: 120 }}
          seed="report"
        />
        <Sequence from={80} layout="none">
          <div style={{ position: 'absolute', left: 930, top: 170 }}>
            <BigCounter from={0} to={naturalChange} duration={70} fontSize={200} color="#F2EEE6" />
          </div>
        </Sequence>
        <Cutout enterAt={110} from="right" style={{ left: 960, top: 460 }} seed="deaths">
          <div style={{ padding: '18px 28px' }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.greyDark }}>DEATHS</div>
            <BigCounter to={deaths} at={115} duration={50} fontSize={84} color={COLORS.red} />
          </div>
        </Cutout>
        <Cutout enterAt={125} from="right" style={{ left: 1420, top: 480 }} seed="births">
          <div style={{ padding: '18px 28px' }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.greyDark }}>BIRTHS</div>
            <BigCounter to={births} at={130} duration={50} fontSize={84} color={COLORS.slate} />
          </div>
        </Cutout>
        <div style={{ position: 'absolute', left: 1000, top: 760, fontFamily: FONTS.hand, fontWeight: 700, fontSize: 72, color: '#F2EEE6' }}>
          19 YEARS IN A ROW
        </div>
        <HandDrawnAnnotation shape={{ type: 'circle', cx: 1225, cy: 795, rx: 290, ry: 70 }} at={150} color="red" />
      </ParallaxLayer>
      <SourceTag dataset={vital2025} tone="dark" at={20} />
      <Label tone="dark">DocumentCard · BigCounter · Cutout · HandDrawnAnnotation</Label>
    </CameraRig>
  );
};

/* 3 — AnimatedLineChart: population, peak circle, hatched decline, year ticker */
const popChart: ChartProps = {
  width: 1680,
  height: 860,
  xDomain: [1950, 2070],
  yDomain: [70, 135],
  xTicks: [1950, 1970, 1990, 2010, 2030, 2050, 2070],
  yTicks: [80, 90, 100, 110, 120, 130],
  yTickFormat: (v) => `${v}M`,
  series: [
    { id: 'pop', data: totalPopulation.data, color: COLORS.ink, draw: { at: 0, duration: 110 } },
    {
      id: 'proj',
      data: [totalPopulation.data[totalPopulation.data.length - 1], ...ipssProjection.data],
      color: COLORS.greyDark,
      dashed: true,
      draw: { at: 130, duration: 40 },
      label: { text: '~87M · 2070', dy: 4 },
    },
  ],
  areas: [
    {
      id: 'loss',
      upper: populationPeak.data.millions,
      lower: 'pop',
      xRange: [2008, 2025],
      fill: 'hatch',
      color: COLORS.red,
      reveal: { at: 112, duration: 20 },
      label: { text: `${MINUS}${lossFromPeakMillions()}M`, x: 0, y: 0 },
    },
  ],
  markers: [{ seriesId: 'pop', year: populationPeak.data.year, at: 95, pulse: true }],
  yearTicker: { seriesId: 'pop', x: 1660, y: 40 },
};

export const DemoLineChart: React.FC = () => {
  const sc = makeChartScales(popChart);
  const [px, py] = sc.point('pop', 2008);
  const chart = { ...popChart, areas: popChart.areas!.map((a) => ({ ...a, label: { ...a.label!, x: sc.x(2016.5), y: sc.y(124.6) + 60 } })) };
  return (
    <CameraRig>
      <ParallaxLayer depth={0.3}><PaperBackground /></ParallaxLayer>
      <ParallaxLayer depth={1}>
        <AnimatedLineChart {...chart} style={{ left: 120, top: 120 }} />
        <HandDrawnAnnotation shape={{ type: 'circle', cx: 120 + px, cy: 120 + py, rx: 62, ry: 40 }} at={100} label={{ text: populationPeak.data.annotation, x: 120 + px - 40, y: 120 + py - 70, anchor: 'end' }} />
      </ParallaxLayer>
      <SourceTag dataset={totalPopulation} also={[ipssProjection]} at={10} />
      <Label>AnimatedLineChart · HandDrawnAnnotation (circle)</Label>
    </CameraRig>
  );
};

/* 4 — Births vs deaths: milestones, crossover X, area, torn-paper forecast */
const bdChart: ChartProps = {
  width: 1700,
  height: 860,
  xDomain: [1950, 2045],
  yDomain: [0, 2_800_000],
  xTicks: [1950, 1970, 1990, 2010, 2030],
  yTicks: [500_000, 1_000_000, 1_500_000, 2_000_000, 2_500_000],
  yTickFormat: (v) => formatCompact(v, 1),
  series: [
    { id: 'births', data: birthsSeries.data, color: COLORS.slate, draw: { at: 0, duration: 90 }, label: { text: 'Births', dy: 128, dx: -10 } },
    { id: 'deaths', data: deathsSeries.data, color: COLORS.grey, colorTo: { color: COLORS.red, at: 95 }, draw: { at: 0, duration: 90 }, label: { text: 'Deaths' } },
    { id: 'ipss', data: ipssBirthsForecast.data, color: COLORS.ink, dashed: true, backing: 'tornPaper', draw: { at: 130, duration: 25 }, label: { text: ipssBirthsForecast.labels.expected, size: 24, dy: -8 } },
  ],
  areas: [{ id: 'decline', upper: 'deaths', lower: 'births', xRange: [2005, 2025], color: COLORS.red, reveal: { at: 100, duration: 20 } }],
  milestones: birthMilestones.map((m, i) => ({ seriesId: 'births', year: m.year, label: m.label, at: 40 + i * 20, side: 'below' as const, length: i === 0 ? 110 : 70 })),
  markers: [{ seriesId: 'births', year: crossover.year, at: 92, flash: true }],
};

export const DemoBirthsDeaths: React.FC = () => {
  const sc = makeChartScales(bdChart);
  const [cx, cy] = sc.point('births', crossover.year);
  return (
    <CameraRig>
      <ParallaxLayer depth={0.3}><PaperBackground /></ParallaxLayer>
      <ParallaxLayer depth={1}>
        <AnimatedLineChart {...bdChart} style={{ left: 100, top: 110 }} />
        <HandDrawnAnnotation shape={{ type: 'x', cx: 100 + cx, cy: 110 + cy, size: 46 }} at={92} duration={12} label={{ text: crossover.footnote, x: 100 + cx - 10, y: 110 + cy - 52, size: 34, anchor: 'end' }} />
      </ParallaxLayer>
      <SourceTag dataset={birthsSeries} also={[ipssBirthsForecast]} at={10} />
      <Label>AnimatedLineChart (milestones, colorTo, area, tornPaper) · X</Label>
    </CameraRig>
  );
};

/* 5 — PopulationPyramid: build, morph, boom tracking, 65+ brace, flip */
const keyframes: PyramidKeyframe[] = [
  { data: pyramids.data[0], at: 0 },
  { data: pyramids.data[1], at: 45 },
  { data: pyramids.data[2], at: 85 },
  { data: pyramids.data[3], at: 120 },
];
const pyrProps = { width: 1100, height: 900 };

export const DemoPyramid: React.FC = () => {
  const frame = useCurrentFrame();
  const g = pyramidGeometry(pyrProps);
  const left = 410;
  const top = 110;
  const boom2 = boomIndexAt(keyframes, frame, 'boom2', 30);
  return (
    <CameraRig>
      <ParallaxLayer depth={0.3}><PaperBackground /></ParallaxLayer>
      <ParallaxLayer depth={1}>
        <PopulationPyramid keyframes={keyframes} morphFrames={30} buildAt={0} highlightBoomsAt={30} {...pyrProps} style={{ left, top }} />
        {boom2 !== null && frame < 150 && (
          <HandDrawnAnnotation shape={{ type: 'arrow', from: [left + g.femaleEdge(5000) + 180, top + g.rowCenter(boom2) + 60], to: [left + g.femaleEdge(5000) + 30, top + g.rowCenter(boom2)] }} at={50} duration={14} color="ink" seed="boom2" />
        )}
        <HandDrawnAnnotation shape={{ type: 'brace', x: left + g.femaleEdge(3500) + 30, y1: top + g.rowTop(19), y2: top + g.rowTop(12), dir: 'right', depth: 40 }} at={150} label={{ text: '~39%', x: left + g.femaleEdge(3500) + 140, y: top + g.rowCenter(16), size: 80 }} />
      </ParallaxLayer>
      <SourceTag dataset={pyramids} at={10} />
      <Label>PopulationPyramid · brace · arrow</Label>
    </CameraRig>
  );
};

/* 6 — Corkboard: "2.1" strip, IconCards, RedString tightening into a knot */
const CARD_POS: Array<[number, number]> = [[110, 340], [550, 310], [990, 340], [1430, 310]];
export const DemoCorkboard: React.FC = () => {
  const frame = useCurrentFrame();
  const gather = Math.min(1, Math.max(0, (frame - 140) / 25)) * 0.4;
  const pos = CARD_POS.map(([x, y]) => [x + (790 - x) * gather * 0.35, y + (360 - y) * gather * 0.35] as [number, number]);
  const pins = pos.map(([x, y]) => [x + 176, y + 13] as [number, number]);
  return (
    <AbsoluteFill>
      <PaperBackground tone="cork" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center' }}>
        <KineticTitle text="2.1" fontSize={150} strip at={0} />
      </div>
      {(['cost', 'work', 'marriage', 'gender'] as const).map((icon, i) => (
        <IconCard key={icon} icon={icon} label={['COST', 'WORK', 'MARRIAGE', 'GENDER ROLES'][i]} note={['housing, school', 'long hours', 'later, or never', 'care falls on women'][i]} enterAt={20 + i * 18} seed={icon} style={{ left: pos[i][0], top: pos[i][1] }} />
      ))}
      <RedString points={pins} at={95} closed tightenAt={140} knot={[960, 760]} />
      <Label>PaperBackground cork · KineticTitle strip · IconCard · RedString</Label>
    </AbsoluteFill>
  );
};

/* 7 — JapanMap + clipping DocumentCard */
export const DemoMap: React.FC = () => (
  <CameraRig>
    <ParallaxLayer depth={0.3}><PaperBackground /></ParallaxLayer>
    <ParallaxLayer depth={1}>
      <JapanMap
        width={1000}
        height={1080}
        style={{ left: 80, top: 0 }}
        glow={mapFocus.glowPrefectures.map((id) => ({ id: id.toLowerCase(), at: 10 }))}
        fills={mapFocus.fadeOrder.map((id, i) => ({ id: id.toLowerCase(), color: '#B9B2A4', at: 20 + i * 6 }))}
        zooms={[{ target: 'akita', at: 40, duration: 40, padding: 0.5 }]}
        villages={[{ id: 'akita', count: 70, at: 60, fadeFrom: 90, fadeDuration: 70 }]}
        labels={[{ id: 'akita', text: `AKITA · ${MINUS}8.1%`, at: 85 }]}
      />
      <DocumentCard
        variant="clipping"
        meta="REGIONAL"
        title="Empty houses offered for almost nothing"
        paragraphs={[[{ text: 'Japan now counts ' }, { text: `about ${formatNumber(akiya.data.vacantHomes)} vacant homes`, highlight: true }, { text: ', a record.' }]]}
        highlightAt={120}
        enterAt={95}
        from="right"
        width={620}
        style={{ left: 1160, top: 300 }}
        seed="akiya"
      />
    </ParallaxLayer>
    <SourceTag dataset={akiya} text="STATISTICS BUREAU, 2025 CENSUS · 2023 HOUSING AND LAND SURVEY" at={10} />
    <Label>JapanMap · DocumentCard (clipping)</Label>
  </CameraRig>
);

/* 8 — LoopDiagram */
export const DemoLoop: React.FC = () => (
  <AbsoluteFill>
    <PaperBackground />
    <LoopDiagram nodes={['depopulation', 'closures', 'migration to cities', 'lower fertility']} center={[960, 560]} radius={360} at={10} perNode={30} />
    <Label>LoopDiagram</Label>
  </AbsoluteFill>
);

/* 9 — three DocumentCards + Stamp */
export const DemoStamp: React.FC = () => {
  const shake = useStampShake(120);
  const cards = [
    { variant: 'brief' as const, kicker: 'Policy brief', title: 'Family support package', num: <BigCounter to={policySpending.data.displayValue} decimals={1} at={30} duration={40} fontSize={96} color={COLORS.ink} />, unit: policySpending.data.displaySuffix },
    { variant: 'report' as const, kicker: 'Immigration report', title: 'Foreign residents, record high', num: <BigCounter to={foreignResidents.data.count} at={45} duration={45} fontSize={78} color={COLORS.ink} />, unit: foreignResidents.data.asOf.toUpperCase() },
    { variant: 'article' as const, kicker: 'Technology', title: 'Robot makers', num: <BigCounter to={robotics.data.displayValue} at={60} duration={40} fontSize={96} color={COLORS.ink} suffix="%" />, unit: robotics.data.label },
  ];
  return (
    <AbsoluteFill style={{ transform: shake }}>
      <PaperBackground />
      {cards.map((c, i) => (
        <DocumentCard key={i} variant={c.variant} kicker={c.kicker} title={c.title} paragraphs={[]} fillerPerParagraph={0} enterAt={i * 12} from="bottom" width={500} style={{ left: 120 + i * 580, top: 200 }} seed={`card${i}`}>
          <div style={{ margin: '20px 0 10px' }}>
            <span style={{ background: COLORS.highlighter, padding: '0 8px' }}>{c.num}</span>
            <div style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.greyDark, marginTop: 12 }}>{c.unit}</div>
          </div>
        </DocumentCard>
      ))}
      <Stamp text="TREND: NOT REVERSED" at={120} style={{ left: 330, top: 420 }} fontSize={130} />
      <SourceTag text={`${policySpending.sourceTag} · ${foreignResidents.sourceTag} · ${robotics.sourceTag}`} at={10} />
      <Label>DocumentCard ×3 · BigCounter · Stamp</Label>
    </AbsoluteFill>
  );
};

/* 10 — WorldMap + ChapterCard */
export const DemoWorld: React.FC = () => (
  <AbsoluteFill>
    <PaperBackground />
    <WorldMap
      zoom={{ from: { center: [138, 37], scale: 6 }, to: { center: [70, 30], scale: 1.25 }, at: 0, duration: 70 }}
      highlight={[{ iso: '392', at: 0, color: '#E07A85' }, { iso: '410', at: 80 }, { iso: '380', at: 95 }, { iso: '156', at: 110 }]}
      dots={sameTrajectory.data.map((d, i) => ({
        ...d,
        at: i === 0 ? 0 : 75 + i * 15,
        ...[{ dx: 24, dy: 34 }, { dx: -24, dy: -24 }, {}, { dx: -24, dy: 44 }][i],
      }))}
    />
    <Sequence from={120} durationInFrames={54}>
      <ChapterCard number={4} title="WHAT IT MEANS" />
    </Sequence>
    <SourceTag dataset={sameTrajectory} at={10} />
    <Label>WorldMap · ChapterCard</Label>
  </AbsoluteFill>
);

export const DEMOS: Array<{ id: string; component: React.FC }> = [
  { id: 'Demo-Title', component: DemoTitle },
  { id: 'Demo-Hook', component: DemoHook },
  { id: 'Demo-LineChart', component: DemoLineChart },
  { id: 'Demo-BirthsDeaths', component: DemoBirthsDeaths },
  { id: 'Demo-Pyramid', component: DemoPyramid },
  { id: 'Demo-Corkboard', component: DemoCorkboard },
  { id: 'Demo-Map', component: DemoMap },
  { id: 'Demo-Loop', component: DemoLoop },
  { id: 'Demo-Stamp', component: DemoStamp },
  { id: 'Demo-World', component: DemoWorld },
];
