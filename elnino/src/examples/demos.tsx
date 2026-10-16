/**
 * demos.tsx — one usage example per El Niño component (registered as "ElNino-Demo-*" compositions).
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { PaperBackground } from '../../../shared/components';
import { ThemeProvider } from '../../../shared/theme';
import { elninoTheme } from '../theme';
import { PacificCrossSection } from '../components/PacificCrossSection';
import { SSTAnomalyMap } from '../components/SSTAnomalyMap';
import { ImpactMap } from '../components/ImpactMap';
import { NinoIndexChart } from '../components/NinoIndexChart';
import { CommodityCards, commodityPin } from '../components/CommodityCards';
import type { CommodityLayout } from '../components/CommodityCards';
import { AnchovySchool } from '../components/AnchovySchool';
import { RedString, WeatherIcon, Cutout } from '../../../shared/components';

export const DEMO_FRAMES = 240;

const Shell: React.FC<{ tone?: 'light' | 'dark'; children: React.ReactNode }> = ({ tone = 'dark', children }) => (
  <ThemeProvider theme={elninoTheme}>
    <AbsoluteFill>
      <PaperBackground tone={tone} seed="demo" />
      {children}
    </AbsoluteFill>
  </ThemeProvider>
);

/** Normal → El Niño with a bathtub-slosh overshoot (frames 60–180). */
const DemoCrossSection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - 60, fps, config: { damping: 9, stiffness: 30, mass: 1.6 } });
  return (
    <Shell>
      <PacificCrossSection elNino={e} style={{ left: 160, top: 130 }} />
      <div style={{ position: 'absolute', left: 160, top: 60, color: '#F2EEE6', fontFamily: 'monospace', fontSize: 28 }}>
        elNino = {interpolate(e, [0, 1], [0, 1]).toFixed(2)}
      </div>
    </Shell>
  );
};

/** Tongue grows from a small glow (frames 0–120), Niño 3.4 box draws at 130. */
const DemoSST: React.FC = () => {
  const frame = useCurrentFrame();
  const g = interpolate(frame, [0, 120], [0.05, 1], { extrapolateRight: 'clamp' });
  return (
    <Shell>
      <SSTAnomalyMap intensity={g} spread={g} nino34={{ at: 130 }} />
    </Shell>
  );
};

/** Drought regions, then wet regions, then the warm wash. */
const DemoImpact: React.FC = () => (
  <Shell tone="light">
    <ImpactMap
      at={{ maritime: 10, eAustralia: 22, sAfrica: 34, india: 46, nBrazil: 58, peruEcuador: 90, seSouthAmerica: 102, southernUS: 114, eastAfrica: 126 }}
      heatAt={170}
    />
  </Shell>
);

const DemoNinoChart: React.FC = () => (
  <Shell tone="light">
    <NinoIndexChart drawAt={0} drawDuration={100} thresholdAt={20} tagsAt={[110, 125, 140]} forecastAt={160} style={{ left: 120, top: 180 }} />
  </Shell>
);

const LAYOUT: CommodityLayout = {
  scale: 0.6,
  slots: [
    { x: 120, y: 90 }, { x: 420, y: 90 }, { x: 720, y: 90 },
    { x: 1080, y: 690 }, { x: 1380, y: 690 }, { x: 1680, y: 690 },
  ],
};

const DemoCommodities: React.FC = () => (
  <Shell tone="light">
    <CommodityCards layout={LAYOUT} enterAt={[10, 18, 26, 34, 42, 50]} arrowsAt={90} />
    <RedString points={[commodityPin(0, LAYOUT), [800, 600]]} at={70} />
  </Shell>
);

const DemoAnchovy: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell>
      <AnchovySchool center={[900, 420]} warm={interpolate(frame, [60, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
    </Shell>
  );
};

const DemoWeatherIcons: React.FC = () => {
  const frame = useCurrentFrame();
  const names = ['fire', 'rain', 'cloud', 'flood', 'wiltedCrop', 'sun', 'thermometer'] as const;
  return (
    <Shell tone="light">
      {names.map((n, i) => (
        <Cutout key={n} enterAt={i * 6} seed={`wi-${n}`} style={{ left: 90 + i * 255, top: 420 }} innerStyle={{ padding: 16 }}>
          <WeatherIcon name={n} t={frame - i * 6} size={180} />
        </Cutout>
      ))}
    </Shell>
  );
};

export const DEMOS: Array<{ id: string; component: React.FC }> = [
  { id: 'ElNino-Demo-CrossSection', component: DemoCrossSection },
  { id: 'ElNino-Demo-SSTMap', component: DemoSST },
  { id: 'ElNino-Demo-ImpactMap', component: DemoImpact },
  { id: 'ElNino-Demo-NinoChart', component: DemoNinoChart },
  { id: 'ElNino-Demo-Commodities', component: DemoCommodities },
  { id: 'ElNino-Demo-Anchovy', component: DemoAnchovy },
  { id: 'ElNino-Demo-WeatherIcons', component: DemoWeatherIcons },
];
