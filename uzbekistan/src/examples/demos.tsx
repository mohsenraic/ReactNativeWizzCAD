/**
 * demos.tsx — one usage example per new component (shared + Uzbekistan), each registered as its own
 * composition (Uzbekistan-Demo-*) so it can be scrubbed in Studio or rendered as stills.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AnimatedBarChart } from '../../../shared/components/AnimatedBarChart';
import { CameraRig, ParallaxLayer } from '../../../shared/components/CameraRig';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { KineticTitle } from '../../../shared/components/KineticTitle';
import { PaperBackground } from '../../../shared/components/PaperBackground';
import { PhotoCutout } from '../../../shared/components/PhotoCutout';
import { RouteMap } from '../../../shared/components/RouteMap';
import { SourceTag } from '../../../shared/components/SourceTag';
import { Stamp } from '../../../shared/components/Stamp';
import { WaffleChart } from '../../../shared/components/WaffleChart';
import { ThemeProvider } from '../../../shared/theme';
import { CityCard } from '../components/CityCard';
import { GeometricPattern, PatternWipe } from '../components/GeometricPattern';
import { SilkIcon } from '../components/silkIcons';
import { SilkRoadMap } from '../components/SilkRoadMap';
import { VisaMap } from '../components/VisaMap';
import {
  afrosiyob,
  arrivals2025,
  arrivalsSeries,
  DECADE_AGO_YEAR,
  monthlyRecord,
  samarkand,
  topOrigins2025,
  visaCount2025,
  visaFree,
  waffle2025,
} from '../data/data';
import { PHOTO_MASKS, PHOTOS, photoProps, photoSrc } from '../data/photos';
import { PALETTE, uzbekistanTheme } from '../theme';

export const DEMO_FRAMES = 180;

const Stage: React.FC<{ children: React.ReactNode; tone?: 'light' | 'dark'; pushIn?: number }> = ({ children, tone = 'light', pushIn = 0.04 }) => (
  <ThemeProvider theme={uzbekistanTheme}>
    <AbsoluteFill>
      <CameraRig pushIn={pushIn}>
        <ParallaxLayer depth={0.3}>
          <PaperBackground tone={tone} seed="uz-demo" />
        </ParallaxLayer>
        <ParallaxLayer depth={1}>{children}</ParallaxLayer>
      </CameraRig>
    </AbsoluteFill>
  </ThemeProvider>
);

// ── <GeometricPattern>: one tile draws itself, then the pattern multiplies across the frame ───────────────
const DemoPattern: React.FC = () => (
  <Stage tone="dark">
    <GeometricPattern tiling="4.8.8" size={120} origin={[960, 540]} draw={{ at: 0, duration: 28, spread: 90 }} stroke={PALETTE.saffron} strokeWidth={4} />
    <GeometricPattern tiling="3.12.12" size={60} origin={[960, 540]} draw={{ at: 70, duration: 30, spread: 60 }} stroke={PALETTE.turquoiseLight} strokeWidth={2.5} opacity={0.55} />
  </Stage>
);

// ── <PatternWipe>: cover at 60, reveal at 100 (a scene cut sits between them) ─────────────────────────────
const DemoWipe: React.FC = () => (
  <Stage>
    <KineticTitle text="Scene A" at={0} fontSize={150} style={{ position: 'absolute', left: 0, right: 0, top: 440 }} />
    <PatternWipe phase="cover" at={60} frames={20} origin={[200, 900]} />
    <PatternWipe phase="reveal" at={100} frames={20} origin={[200, 900]} />
  </Stage>
);

// ── <PhotoCutout>: Ken Burns + masked dome lift + annotation + credit ─────────────────────────────────────
const DemoPhotoLift: React.FC = () => (
  <Stage>
    <PhotoCutout
      {...photoProps('P04')}
      width={1280}
      height={780}
      enterAt={0}
      rotation={-1.5}
      style={{ left: 320, top: 140 }}
      kenBurns={{ from: { scale: 1.0, focus: [0.4, 0.45] }, to: { scale: 1.12, focus: [0.38, 0.4] } }}
      lift={{ path: PHOTO_MASKS.P04dome, at: 40, by: 60, scale: 1.05 }}
    >
      <HandDrawnAnnotation shape={{ type: 'arrow', from: [1040, 160], to: [760, 230] }} at={70} width={1280} height={780} label={{ text: 'ribbed dome, 15th c.', x: 1050, y: 130, size: 48 }} />
    </PhotoCutout>
  </Stage>
);

// ── <PhotoCutout>: gold duotone sweep (Khiva "turns gold") ───────────────────────────────────────────────
const DemoPhotoDuotone: React.FC = () => (
  <Stage tone="dark">
    <PhotoCutout
      {...photoProps('P11')}
      width={1400}
      height={820}
      enterAt={0}
      style={{ left: 260, top: 120 }}
      kenBurns={{ from: { scale: 1.05, focus: [0.5, 0.5] }, to: { scale: 1.15, focus: [0.62, 0.45] } }}
      treatment={{ type: 'duotone', colors: ['#3B2A12', '#F6C762'], sweep: { at: 40, duration: 40 } }}
    />
  </Stage>
);

// ── <PhotoCutout>: halftone (left) vs desaturated (right) — Moynaq ───────────────────────────────────────
const DemoPhotoHalftone: React.FC = () => (
  <Stage>
    <PhotoCutout {...photoProps('P19')} width={820} height={560} enterAt={0} rotation={-2} style={{ left: 110, top: 240 }} treatment={{ type: 'halftone', colors: [PALETTE.lapisPaper, PALETTE.paper], dot: 8 }} />
    <PhotoCutout {...photoProps('P19')} width={820} height={560} enterAt={10} rotation={2} style={{ left: 990, top: 240 }} treatment={{ type: 'desaturate' }} seed="b" />
  </Stage>
);

// ── <AnimatedBarChart>: arrivals 2010–2025, 2016 circled, 2025 highlighted ──────────────────────────────
const DemoBars: React.FC = () => {
  const bars = arrivalsSeries.data.map((d) => ({ label: String(d.year), value: d.value }));
  const i2016 = arrivalsSeries.data.findIndex((d) => d.year === DECADE_AGO_YEAR);
  return (
    <Stage>
      <AnimatedBarChart
        width={1600}
        height={800}
        style={{ left: 160, top: 120 }}
        bars={bars}
        yMax={12}
        yTicks={[4, 8, 12]}
        yTickFormat={(v) => `${v}M`}
        grow={{ at: 0, stagger: 3, duration: 18 }}
        labelEvery={3}
        valueLabels={[i2016]}
        valueFormat={{ decimals: 1, suffix: 'M' }}
        highlight={{ index: bars.length - 1, at: 80, dimOthers: true }}
        overlay={(s) => {
          const b = s.bar(i2016);
          return (
            <HandDrawnAnnotation
              shape={{ type: 'circle', cx: b.cx, cy: b.top - 30, rx: 70, ry: 110 }}
              at={110}
              width={1600}
              height={800}
              label={{ text: 'a decade ago', x: b.cx, y: b.top - 160, size: 52 }}
            />
          );
        }}
      />
      <Stamp text={`+${arrivals2025.data.increasePct}%`} at={100} fontSize={90} style={{ left: 1260, top: 60 }} />
      <SourceTag dataset={arrivalsSeries} also={[arrivals2025]} />
    </Stage>
  );
};

// ── <WaffleChart>: 74 of 100 squares from three neighbours; the rest glow gold ──────────────────────────
const DemoWaffle: React.FC = () => {
  const colors = [PALETTE.turquoise, PALETTE.lapis, PALETTE.terracotta];
  return (
    <Stage>
      <WaffleChart
        at={8}
        style={{ left: 220, top: 170 }}
        categories={waffle2025.categories.map((c, i) => ({ ...c, color: colors[i] }))}
        rest={{ label: 'FROM FURTHER AWAY', glowAt: 120, glowColor: PALETTE.saffron }}
      />
      <SourceTag dataset={topOrigins2025} />
    </Stage>
  );
};

// ── <RouteMap>: Afrosiyob line with the P12 train riding it ─────────────────────────────────────────────
const TrainMarker: React.FC = () => (
  <g transform="translate(0 -70) rotate(-3)">
    <rect x={-104} y={-58} width={208} height={116} fill="#FBFAF6" />
    <image href={photoSrc('P12')} x={-98} y={-52} width={196} height={104} preserveAspectRatio="xMidYMid slice" />
  </g>
);
const DemoRoute: React.FC = () => (
  <Stage>
    <RouteMap
      fitBounds={{ west: 58.5, east: 72.5, south: 37.2, north: 44.2 }}
      resolution="50m"
      highlight={[{ iso: '860', at: 0, color: '#E4DED2' }]}
      nodes={afrosiyob.data.stops.map((s, i) => ({ id: s.id, lonLat: s.lonLat, label: s.name, at: 6 + i * 6, color: PALETTE.lapis, dy: s.id === 'bukhara' ? 34 : -16 }))}
      routes={[
        {
          id: 'hsr',
          points: afrosiyob.data.stops.map((s) => s.lonLat),
          at: 20,
          duration: 50,
          color: PALETTE.turquoise,
          width: 8,
          bend: 0.05,
          markers: [{ at: 50, duration: 110, render: () => <TrainMarker /> }],
        },
      ]}
    />
    <SourceTag dataset={afrosiyob} />
    <SourceTag prefix="PHOTO:" text={`${PHOTOS.P12.author} / ${PHOTOS.P12.license}`} align="right" />
  </Stage>
);

// ── <SilkRoadMap>: routes, goods, caravanserais, cities, zoom onto Uzbekistan ───────────────────────────
const DemoSilkRoad: React.FC = () => (
  <Stage pushIn={0}>
    <SilkRoadMap routesAt={0} routesDuration={70} goodsAt={40} caravanseraiAt={70} citiesAt={95} uzbekistanAt={0} zoom={{ at: 130, duration: 40, scale: 3 }} />
    <SourceTag text="ROUTES SIMPLIFIED" />
  </Stage>
);

// ── <SilkRoadMap> landlocked + flights variant (Scene 3 / outro) ─────────────────────────────────────────
const DemoSilkRoadExtras: React.FC = () => (
  <Stage tone="dark" pushIn={0}>
    <SilkRoadMap routesAt={0} routesDuration={20} routesOpacity={0.35} landlockedAt={20} flightsAt={90} tone="dark" />
  </Stage>
);

// ── <CityCard> ───────────────────────────────────────────────────────────────────────────────────────────
const DemoCityCard: React.FC = () => (
  <Stage>
    <CityCard
      name="SAMARKAND"
      lonLat={[66.97, 39.65]}
      at={0}
      age={{ to: samarkand.data.ageYears, suffix: '+ YEARS' }}
      subtitle="roughly as old as Rome"
      inset={{ left: 1300, top: 640 }}
    />
    <SourceTag dataset={samarkand} />
  </Stage>
);

// ── <VisaMap> ────────────────────────────────────────────────────────────────────────────────────────────
const DemoVisa: React.FC = () => (
  <Stage pushIn={0.02}>
    <VisaMap steps={visaFree.data.map((s, i) => ({ label: s.label, isos: s.isos, at: 10 + i * 26 }))} counter={{ at: 130, to: visaCount2025.data.approxCountries, kicker: 'AROUND' }} />
    <SourceTag dataset={visaFree} also={[visaCount2025]} />
  </Stage>
);

// ── shared props added for this video: Stamp count, KineticTitle hand font, SilkIcons ────────────────────
const DemoSharedProps: React.FC = () => (
  <Stage>
    <Stamp text="{n}+" count={{ to: monthlyRecord.data.atLeast }} at={10} fontSize={110} style={{ left: 200, top: 160 }} />
    <KineticTitle text="So what exactly are they coming for?" font="hand" uppercase={false} at={40} fontSize={110} style={{ position: 'absolute', left: 160, right: 160, top: 520 }} />
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
      {(['silk', 'spices', 'paper', 'glass', 'horses', 'caravanserai', 'camel', 'plane', 'train', 'padlock', 'padlockOpen', 'hotel', 'guide', 'crowd', 'mapBlank'] as const).map((n, i) => (
        <g key={n} transform={`translate(${170 + i * 112} 900)`}>
          <SilkIcon name={n} size={84} />
        </g>
      ))}
    </svg>
    <SourceTag dataset={monthlyRecord} />
  </Stage>
);

export const DEMOS: Array<{ id: string; component: React.FC }> = [
  { id: 'Uzbekistan-Demo-Pattern', component: DemoPattern },
  { id: 'Uzbekistan-Demo-PatternWipe', component: DemoWipe },
  { id: 'Uzbekistan-Demo-PhotoLift', component: DemoPhotoLift },
  { id: 'Uzbekistan-Demo-PhotoDuotone', component: DemoPhotoDuotone },
  { id: 'Uzbekistan-Demo-PhotoHalftone', component: DemoPhotoHalftone },
  { id: 'Uzbekistan-Demo-BarChart', component: DemoBars },
  { id: 'Uzbekistan-Demo-Waffle', component: DemoWaffle },
  { id: 'Uzbekistan-Demo-RouteMap', component: DemoRoute },
  { id: 'Uzbekistan-Demo-SilkRoad', component: DemoSilkRoad },
  { id: 'Uzbekistan-Demo-SilkRoadExtras', component: DemoSilkRoadExtras },
  { id: 'Uzbekistan-Demo-CityCard', component: DemoCityCard },
  { id: 'Uzbekistan-Demo-VisaMap', component: DemoVisa },
  { id: 'Uzbekistan-Demo-SharedProps', component: DemoSharedProps },
];
