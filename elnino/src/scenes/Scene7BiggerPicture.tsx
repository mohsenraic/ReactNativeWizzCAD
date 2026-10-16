/**
 * Scene 7 — The bigger picture. The WMO line "El Niño doesn't add new heat to the planet" on a card, a quick
 * ocean → air arrow, then the global temperature line (NASA GISTEMP, long-term rise) with strong El Niño
 * years as warm bands (from NOAA's ONI). Record years 2016 and 2024 circled by hand; a dotted "2027?" in Caveat.
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { AnimatedLineChart, Cutout, DocumentCard, Fade, HandDrawnAnnotation, SceneShell, SourceTag, WeatherIcon, makeChartScales } from '../../../shared/components';
import type { ChartProps } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { elNinoEpisodes, globalTemp, oni, wmoOct2026 } from '../data/elnino';
import { cue, sceneById } from '../timeline';
import { PALETTE } from '../theme';

const S = 7;
export const SCENE_7_DURATION = sceneById(S).durationInFrames;
const LEFT = 120;
const TOP = 170;

const STRONG = elNinoEpisodes().filter((e) => e.peak >= 1.5);
const SERIES = globalTemp.data.filter((d) => d.year >= 1950);
const at = (y: number) => SERIES.find((d) => d.year === y)!.value;

export const Scene7BiggerPicture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const newHeatAt = cue(S, 'new heat');
  const movesAt = cue(S, 'moves heat');
  const onTopAt = cue(S, 'on top');
  const recordsAt = cue(S, 'records');
  const y16 = cue(S, 'twenty sixteen');
  const y24 = cue(S, 'twenty twenty four');
  const y27 = cue(S, 'twenty twenty seven');
  const chartAt = onTopAt - 30;

  const chart: ChartProps = {
    width: 1680,
    height: 780,
    margin: { top: 60, right: 260, bottom: 70, left: 100 },
    xDomain: [1950, 2028],
    yDomain: [-0.4, 1.6],
    xTicks: [1950, 1970, 1990, 2010, 2025],
    yTicks: [0, 0.5, 1, 1.5],
    yTickFormat: (v) => (v > 0 ? `+${v}°` : `${v}°`),
    axesAt: chartAt,
    series: [{ id: 't', data: SERIES, color: PALETTE.ink, strokeWidth: 5, draw: { at: chartAt + 6, duration: recordsAt - chartAt - 20 } }],
    areas: STRONG.map((e, i) => ({
      id: `nino-${i}`,
      upper: 1.6,
      lower: -0.4,
      xRange: [e.peakX - 0.55, e.peakX + 0.75] as [number, number],
      color: PALETTE.warm,
      opacity: 0.18,
      reveal: { at: chartAt + 6 + ((e.peakX - 1950) / 76) * (recordsAt - chartAt - 20), duration: 8 },
    })),
    milestones: [
      { seriesId: 't', year: 2016, label: '2016', at: y16 + 10, side: 'below', length: 110, count: { to: at(2016), decimals: 2, prefix: '2016: +', suffix: '°C' } },
      { seriesId: 't', year: 2024, label: '2024', at: y24 + 10, side: 'above', length: 70, count: { to: at(2024), decimals: 2, prefix: '2024: +', suffix: '°C' } },
    ],
  };
  const sc = makeChartScales(chart);
  const [x16, yy16] = sc.point('t', 2016);
  const [x24, yy24] = sc.point('t', 2024);
  const [x25, yy25] = sc.point('t', 2025);
  const x27 = sc.x(2027);
  const y27px = sc.y(at(2024) + 0.12);
  const qP = interpolate(frame, [y27, y27 + 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <SceneShell
      durationInFrames={SCENE_7_DURATION}
      paper="light"
      seed="s7"
      enter="whip"
      exit="whip"
      moves={[
        { at: newHeatAt - 6, scale: 1.15, focus: [520, 330], duration: 16 },
        { at: movesAt - 4, scale: 1, focus: [960, 540], duration: 14 },
        { at: y16 - 8, scale: 1.4, focus: [LEFT + x16, TOP + yy16], duration: 16 },
        { at: y24 - 8, scale: 1.4, focus: [LEFT + x24, TOP + yy24], duration: 14 },
        { at: y27 - 4, scale: 1.3, focus: [LEFT + x27, TOP + y27px], duration: 14 },
      ]}
      overlay={
        <>
          <Fade outAt={chartAt}>
            <SourceTag dataset={wmoOct2026} at={newHeatAt} />
          </Fade>
          <Fade inAt={chartAt}>
            <SourceTag dataset={globalTemp} also={[oni]} at={chartAt} text="NASA GISTEMP v4 · EL NIÑO YEARS: NOAA CPC ONI (PEAK ≥ 1.5 °C)" />
          </Fade>
        </>
      }
    >
      {/* the twist: no new heat, just moved */}
      <DocumentCard
        variant="brief"
        kicker="WMO · 8 OCT 2026"
        title="Celeste Saulo, WMO Secretary-General"
        paragraphs={[[{ text: '“' }, { text: wmoOct2026.data.quotes.noNewHeat.text, highlight: true }, { text: '”' }]]}
        fillerPerParagraph={1}
        highlightAt={newHeatAt + 4}
        enterAt={newHeatAt - 14}
        exitAt={chartAt - 6}
        width={760}
        seed="s7-doc"
        rotation={-1}
        style={{ left: 140, top: 220 }}
      />
      <Cutout enterAt={movesAt} from="scale" seed="s7-ocean" style={{ left: 1060, top: 560 }} innerStyle={{ padding: 10 }} exitAt={chartAt - 6} exitTo="bottom">
        <WeatherIcon name="flood" t={frame - movesAt} size={140} color={PALETTE.warm} />
        <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: 2, textAlign: 'center', color: PALETTE.greyDark }}>OCEAN</div>
      </Cutout>
      <Cutout enterAt={movesAt + 16} from="scale" seed="s7-air" style={{ left: 1480, top: 300 }} innerStyle={{ padding: 10 }} exitAt={chartAt - 6} exitTo="bottom">
        <WeatherIcon name="thermometer" t={frame - movesAt - 16} size={140} />
        <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: 2, textAlign: 'center', color: PALETTE.greyDark }}>AIR</div>
      </Cutout>
      <Fade outAt={chartAt - 6}>
        <HandDrawnAnnotation shape={{ type: 'arrow', from: [1240, 600], to: [1460, 420], bend: -0.2 }} at={movesAt + 8} duration={16} seed="s7-arrow" />
        <div style={{ position: 'absolute', left: 1250, top: 470, fontFamily: F.hand, fontWeight: 700, fontSize: 44, color: PALETTE.warm, transform: 'rotate(-8deg)', opacity: interpolate(frame, [movesAt + 24, movesAt + 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          heat
        </div>
      </Fade>

      {/* global temperature */}
      {frame >= chartAt && (
        <>
          <div style={{ position: 'absolute', left: LEFT + 100, top: 90, fontFamily: F.mono, fontSize: 22, letterSpacing: 2, color: PALETTE.greyDark }}>
            GLOBAL SURFACE TEMPERATURE · °C VS 1951–1980 · SHADED: STRONG EL NIÑO YEARS
          </div>
          <AnimatedLineChart {...chart} style={{ left: LEFT, top: TOP }} />
          <HandDrawnAnnotation shape={{ type: 'circle', cx: LEFT + x16, cy: TOP + yy16, rx: 44, ry: 38 }} at={y16} duration={14} seed="s7-c16" />
          <HandDrawnAnnotation shape={{ type: 'circle', cx: LEFT + x24, cy: TOP + yy24, rx: 44, ry: 38 }} at={y24} duration={14} seed="s7-c24" />
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            {qP > 0 && (
              <path
                d={(() => {
                  // quadratic from the 2025 point toward "2027?", sampled up to qP so it grows while staying dotted
                  const P0 = [LEFT + x25, TOP + yy25];
                  const P1 = [LEFT + (x25 + x27) / 2, TOP + yy25];
                  const P2 = [LEFT + x27, TOP + y27px];
                  const pts: string[] = [];
                  for (let i = 0; i <= 24; i++) {
                    const u = (i / 24) * qP;
                    const m = 1 - u;
                    pts.push(`${m * m * P0[0] + 2 * m * u * P1[0] + u * u * P2[0]} ${m * m * P0[1] + 2 * m * u * P1[1] + u * u * P2[1]}`);
                  }
                  return `M ${pts.join(' L ')}`;
                })()}
                fill="none"
                stroke={PALETTE.warm}
                strokeWidth={5}
                strokeDasharray="2 12"
                strokeLinecap="round"
              />
            )}
          </svg>
          <div style={{ position: 'absolute', left: LEFT + x27 - 30, top: TOP + y27px - 110, fontFamily: F.hand, fontWeight: 700, fontSize: 76, color: PALETTE.warm, opacity: interpolate(frame, [y27 + 14, y27 + 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: 'rotate(-6deg)' }}>
            2027?
          </div>
        </>
      )}
    </SceneShell>
  );
};
