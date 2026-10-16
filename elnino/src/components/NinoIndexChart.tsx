/**
 * <NinoIndexChart> — thin wrapper around the shared <AnimatedLineChart> for the Niño 3.4 history:
 *   - NOAA ONI since 1980 (draws on left → right), anomalies above the +0.5 °C threshold tinted warm
 *   - dashed threshold line "+0.5 °C" with a direct label
 *   - past-event tags (1982–83, 1997–98, 2015–16) as paper cutouts whose peak values count up
 *   - the 2026 forecast as a dotted segment ending in a point. WMO publishes no numeric range (spread
 *     "narrow"), so no band or whisker is drawn.
 *
 * Geometry is exposed via `ninoChartScales(props)` so the scene can circle the forecast point.
 *
 * @example
 * <NinoIndexChart drawAt={0} tagsAt={[100, 130, 160]} forecastAt={200} style={{ left: 120, top: 160 }} />
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { AnimatedLineChart, BigCounter, Cutout, makeChartScales } from '../../../shared/components';
import type { ChartProps } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { nino2026Forecast, ninoThreshold, oniSeries, pastGiants, wmoOct2026 } from '../data/elnino';
import { PALETTE } from '../theme';

export interface NinoChartTiming {
  /** Frame the axes appear and the ONI line starts drawing. */
  drawAt: number;
  drawDuration?: number;
  /** Frame the threshold line + label appear. */
  thresholdAt?: number;
  /** Frames the three past-event tags pop in (1982, 1997, 2015). */
  tagsAt?: [number, number, number];
  /** Frame the forecast segment draws (and the band reveals). */
  forecastAt?: number;
}

const ONI = oniSeries(1980);
const { lastObserved, forecast } = nino2026Forecast.data;

export const ninoChartProps = (t: NinoChartTiming, width = 1640, height = 760): ChartProps => ({
  width,
  height,
  margin: { top: 70, right: 230, bottom: 70, left: 100 },
  xDomain: [1980, 2027.5],
  yDomain: [-2.5, 4.4],
  xTicks: [1980, 1990, 2000, 2010, 2020],
  yTicks: [-2, -1, 0, 1, 2, 3, 4],
  yTickFormat: (v) => (v > 0 ? `+${v}°` : `${v}°`.replace('-', '−')),
  axesAt: t.drawAt,
  series: [
    { id: 'oni', data: ONI, color: PALETTE.ink, strokeWidth: 3.5, draw: { at: t.drawAt, duration: t.drawDuration ?? 120 }, tipDot: true },
    {
      id: 'fc',
      data: [{ year: lastObserved.year, value: lastObserved.value }, { year: forecast.year, value: forecast.value }],
      color: PALETTE.warm,
      strokeWidth: 6,
      dashed: true,
      draw: { at: t.forecastAt ?? 1e6, duration: 24 },
      tipDot: false,
    },
  ],
  areas: [
    // El Niño episodes: ONI above the threshold, tinted warm as the line draws.
    { id: 'warm', upper: 'oni', lower: ninoThreshold.data.value, xRange: [1980, lastObserved.year], color: PALETTE.warm, opacity: 0.35, reveal: { at: t.drawAt, duration: t.drawDuration ?? 120 } },
  ],
});

export const ninoChartScales = (t: NinoChartTiming, width?: number, height?: number) => makeChartScales(ninoChartProps(t, width, height));

export const NinoIndexChart: React.FC<NinoChartTiming & { width?: number; height?: number; style?: React.CSSProperties }> = ({ width = 1640, height = 760, style, ...t }) => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const props = ninoChartProps(t, width, height);
  const sc = makeChartScales(props);
  const thrAt = t.thresholdAt ?? t.drawAt;
  const thrO = Math.max(0, Math.min(1, (frame - thrAt) / 12));
  const yT = sc.y(ninoThreshold.data.value);
  const fcO = t.forecastAt === undefined ? 0 : Math.max(0, Math.min(1, (frame - t.forecastAt - 20) / 12));
  const [fx, fy] = [sc.x(forecast.year), sc.y(forecast.value)];
  const left = (style?.left as number) ?? 0;
  const top = (style?.top as number) ?? 0;

  return (
    <>
      <AnimatedLineChart
        {...props}
        style={style}
        overlay={() => (
          <g opacity={thrO}>
            <line x1={sc.plot.left} x2={sc.plot.right} y1={yT} y2={yT} stroke={PALETTE.warm} strokeWidth={2.5} strokeDasharray="10 8" />
            <rect x={sc.plot.left + 4} y={yT + 10} width={350} height={30} fill="#EFEAE0" opacity={0.92} />
            <text x={sc.plot.left + 12} y={yT + 32} fontFamily={F.mono} fontSize={20} fontWeight={500} fill={PALETTE.warm} letterSpacing={1}>
              +{(ninoThreshold.data.value * Math.min(1, Math.max(0, (frame - thrAt) / 15))).toFixed(1)}°C · EL NIÑO THRESHOLD
            </text>
            <line x1={sc.plot.left} x2={sc.plot.right} y1={sc.y(0)} y2={sc.y(0)} stroke={PALETTE.ink} strokeOpacity={0.25} strokeWidth={1.5} />
            {fcO > 0 && (
              <g opacity={fcO} stroke={PALETTE.warm} strokeWidth={3} strokeLinecap="round">
                <circle cx={fx} cy={fy} r={9} fill={PALETTE.warm} stroke="#FBFAF6" strokeWidth={3} />
              </g>
            )}
          </g>
        )}
      />
      {/* past giants: cutout tags pinned above each peak */}
      {t.tagsAt &&
        pastGiants.data.map((g, i) => {
          const at = t.tagsAt![i];
          if (frame < at - 2) return null;
          const px = left + sc.x(g.peakX);
          const py = top + sc.y(g.peak);
          return (
            <React.Fragment key={g.id}>
              <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
                <line x1={px} y1={py - 8} x2={px} y2={py - 70} stroke={PALETTE.ink} strokeWidth={2} opacity={Math.min(1, (frame - at) / 6)} />
              </svg>
              <Cutout enterAt={at} from="scale" seed={`giant-${g.id}`} style={{ left: px - 80, top: py - 160 }} innerStyle={{ width: 160, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontFamily: F.mono, fontSize: 19, color: PALETTE.greyDark, letterSpacing: 1 }}>{g.label}</div>
                <BigCounter to={g.peak} decimals={1} sign="always" suffix="°C" at={at + 6} duration={22} fontSize={44} color={PALETTE.ink} digitWidth={0.5} />
              </Cutout>
            </React.Fragment>
          );
        })}
      {/* forecast label */}
      {t.forecastAt !== undefined && (
        <div style={{ position: 'absolute', left: left + fx + 26, top: top + fy - 26, opacity: fcO }}>
          <BigCounter from={lastObserved.value} to={wmoOct2026.data.ondForecast} decimals={1} sign="always" suffix="°C" at={t.forecastAt + 20} duration={24} fontSize={64} color={PALETTE.warm} digitWidth={0.5} />
          <div style={{ fontFamily: F.mono, fontSize: 17, color: PALETTE.warm, letterSpacing: 1, marginTop: 4, width: 300 }}>
            OCT–DEC 2026 FORECAST
            <br />
            WMO BASELINE 1993–2009
            <br />
            MODEL SPREAD: NARROW
          </div>
        </div>
      )}
    </>
  );
};
