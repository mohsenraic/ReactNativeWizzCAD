/**
 * elnino.ts — every number and map footprint shown in "How One Patch of Ocean Controls the World's Weather".
 *
 * Verification passes: 14 October 2026 (data build) and 14 October 2026 (fact-check of every TODO). Each value is tagged:
 *   // ✓ <source>     confirmed against the primary source (table, release or paper abstract)
 *   // TODO: VERIFY   not confirmed against a primary source in this pass — check the named source before lock
 *   // PLACEHOLDER    not real data; must be replaced before render
 *
 * Dataset-level `status` follows shared/data/types.ts — 'placeholder' datasets make <SourceTag>
 * print "⚠ PLACEHOLDER DATA" in every frame that uses them.
 *
 * Editorial rules baked into this file:
 *   - "Super El Niño" is not an official WMO classification → never used in any on-screen string.
 *   - 2026 values are FORECASTS → every label derived from them carries "FORECAST".
 *   - WMO measures Niño 3.4 against 1993–2009; NOAA's ONI uses centred 30-year base periods.
 *     The two are close but not identical → the Niño index chart must say so on screen.
 */
import type { Dataset, YearValue } from '../../../shared/data/types';
import { placeholdersIn } from '../../../shared/data/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** [longitude, latitude] in degrees, longitude in −180…180. */
export type LonLat = [number, number];

export interface Quote {
  /** Verbatim text, as published. */
  text: string;
  speaker: string;
  date: string;
}

export interface ElNinoEpisode {
  /** Season label of the first/last month the threshold was met, e.g. "MJJ 1997". */
  start: string;
  end: string;
  /** Peak 3-month ONI value and its season. */
  peak: number;
  peakSeason: string;
  /** Fractional year of the peak (season centre) for chart placement. */
  peakX: number;
}

export interface ImpactRegion {
  id: string;
  kind: 'dry' | 'wet';
  /** Plex Mono label on the map. */
  label: string;
  /** Simplified outline (schematic, not a forecast contour). */
  polygon: LonLat[];
  /** Where the label sits. */
  labelAt: LonLat;
  /** Narration keyword used by cues.ts to time the fill. */
  cue: string;
  /** Season when the signal is typically strongest (NH seasons). */
  season: string;
}

export interface Producer {
  name: string;
  lonLat: LonLat;
}

export interface Commodity {
  id: 'cocoa' | 'coffee' | 'palmOil' | 'rice' | 'sugar' | 'fish';
  label: string;
  /** Short Caveat note on the card — no numbers unless sourced. */
  note: string;
  producers: Producer[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. WMO, October 2026 — the hook and Scene 4 (Scenes 1, 4, 5, 7)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: WMO press release "Sea-surface temperatures reflect strengthening El Niño", 8 Oct 2026
//   https://wmo.int/news/media-centre/sea-surface-temperatures-reflect-strengthening-el-nino
// SOURCE: WMO Global Seasonal Climate Update for Oct–Nov–Dec 2026, 8 Oct 2026
//   https://wmo.int/resources/publication-series/global-seasonal-climate-updates/gscu-ond2026
export const wmoOct2026 = {
  sourceTag: 'WMO, OCT 2026',
  source:
    'World Meteorological Organization — Global Seasonal Climate Update OND 2026 and press release “Sea-surface temperatures reflect strengthening El Niño”, 8 October 2026. https://wmo.int/news/media-centre/sea-surface-temperatures-reflect-strengthening-el-nino',
  status: 'verified',
  notes:
    'Niño 3.4 anomalies relative to the 1993–2009 baseline (WMO figure caption). OND = October–November–December seasonal mean. All 2026 OND values are forecasts.',
  data: {
    /** Forecast seasonal-mean Niño 3.4 SST anomaly, Oct–Dec 2026, °C. */
    ondForecast: 3.7, // ✓ "forecast to reach approximately +3.7°C, peaking around December"
    peakMonth: 'DEC 2026', // ✓
    /** Observed monthly means quoted by WMO, °C (1993–2009 baseline). */
    observedJun: 1.6, // ✓ "+1.6 °C above normal in June 2026"
    observedAug: 2.5, // ✓ "+2.5 °C above normal in August"
    /** The record WMO compares against. Matches NOAA ONI NDJ 2015–16 (2.59). */
    previousRecord: { value: 2.6, period: 'NOV 2015 – JAN 2016' }, // ✓ "previous record of + 2.6 °C in November 2015-January 2016"
    /** Likelihood El Niño persists through Feb 2027, %. Narration: "near one hundred percent". */
    persistThroughFeb2027: 100, // ✓ "near-100 per cent likelihood" — display as "~100%"
    baseline: '1993–2009', // ✓ figure caption
    forecastCentres: 13, // ✓ consensus of 13 forecasting centres (press release)
    /** Positive Indian Ocean Dipole, OND 2026 seasonal mean, °C. */
    iodOnd: 0.5, // ✓ GSCU OND 2026: "positive IOD is predicted to peak in October 2026 and then decline … +0.5°C"
    globalTempOutlook: 'Above-average temperatures across large areas of the globe, Oct–Dec 2026', // ✓ paraphrase of release
    quotes: {
      firmlyEstablished: {
        text: 'El Niño is firmly established and strengthening rapidly.',
        speaker: 'Celeste Saulo, WMO Secretary-General',
        date: '8 Oct 2026',
      }, // ✓ verbatim
      noNewHeat: {
        text: 'El Niño doesn’t add new heat to the planet.',
        speaker: 'Celeste Saulo, WMO Secretary-General',
        date: '8 Oct 2026',
      }, // ✓ verbatim
    } satisfies Record<string, Quote>,
    /** WMO wording for strength — use this on screen instead of the narration's "strongest ever measured". */
    strengthWording: 'potentially one of the strongest since at least 1950', // ✓ verbatim fragment
    recordWording: 'record sea-surface temperatures forecast for Oct–Dec 2026', // ✓ paraphrase ("forecast to reach record levels")
  },
} satisfies Dataset<unknown>;

// SOURCE: WMO El Niño/La Niña Update, 3 Sep 2026 ("El Niño set to become very strong…") — IOD context.
//   https://wmo.int/news/media-centre/el-nino-set-become-very-strong-raising-risks-of-extreme-weather-2027
// The July 2026 update (brief) first flagged a positive IOD; Sep and Oct updates confirm it.
export const indianOceanDipole = {
  sourceTag: 'WMO, 2026',
  source:
    'WMO El Niño/La Niña Update, 3 Sep 2026; WMO Global Seasonal Climate Update OND 2026 (8 Oct 2026). https://wmo.int/news/media-centre/el-nino-set-become-very-strong-raising-risks-of-extreme-weather-2027',
  status: 'verified',
  notes: 'Not narrated. Available for an optional Scene 5 cutout ("+ a positive Indian Ocean Dipole").',
  data: {
    sonForecast: 0.9, // ✓ Sep 2026 update: SON 2026 seasonal mean 0.9 °C
    ondForecast: 0.5, // ✓ Oct 2026 GSCU: OND 2026 seasonal mean +0.5 °C, peak in October
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// 2. How El Niño is defined (Scene 4)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: NOAA CPC, "Cold & Warm Episodes by Season (ERSSTv6)"
//   https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/
export const ninoThreshold = {
  sourceTag: 'NOAA CPC',
  source:
    'NOAA Climate Prediction Center — ONI definition: 3-month running mean of ERSST.v6 SST anomalies in Niño 3.4, threshold ±0.5 °C for at least 5 consecutive overlapping seasons. https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/',
  status: 'verified',
  notes:
    'Narration "for several months" = NOAA’s 5 consecutive overlapping 3-month seasons. NOAA now uses the Relative ONI (RONI) for official monitoring; the chart uses the classic ONI because that is the series WMO’s “previous record +2.6 °C” matches.',
  data: {
    value: 0.5, // ✓ °C
    minSeasons: 5, // ✓
  },
} satisfies Dataset<unknown>;

// SOURCE: NOAA CPC Niño regions — Niño 3.4 = 5°N–5°S, 170°W–120°W.
//   https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/
export const nino34Box = {
  sourceTag: 'NOAA CPC',
  source: 'NOAA CPC — Niño 3.4 region 5°N–5°S, 120°–170°W.',
  status: 'verified',
  data: {
    north: 5, // ✓
    south: -5, // ✓
    west: -170, // ✓ 170°W
    east: -120, // ✓ 120°W
  },
} satisfies Dataset<{ north: number; south: number; west: number; east: number }>;

// ─────────────────────────────────────────────────────────────────────────────
// 3. Niño 3.4 history — Oceanic Niño Index (Scene 4 chart)
// ─────────────────────────────────────────────────────────────────────────────

export const ONI_SEASONS = ['DJF', 'JFM', 'FMA', 'MAM', 'AMJ', 'MJJ', 'JJA', 'JAS', 'ASO', 'SON', 'OND', 'NDJ'] as const;

// SOURCE: NOAA CPC ONI table (ERSST.v6), downloaded 14 Oct 2026, file last modified 3 Oct 2026.
//   https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt
// ✓ Values copied programmatically from the file (column ANOM), 2 decimals. One row per year,
//   12 overlapping 3-month seasons DJF…NDJ; the 2026 row stops at JAS (latest available).
//   Recent values may be revised for up to two months (CPC note).
export const oni = {
  sourceTag: 'NOAA CPC (ONI, ERSST.v6)',
  source:
    'NOAA Climate Prediction Center — Oceanic Niño Index, ERSST.v6, centred 30-year base periods updated every 5 years. https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt',
  status: 'verified',
  notes: 'Unit: °C anomaly, 3-month running mean. Baseline differs from WMO’s 1993–2009 — label the chart.',
  data: {
    1950: [-1.32, -1.20, -1.12, -1.08, -1.10, -0.90, -0.62, -0.57, -0.56, -0.62, -0.66, -0.79],
    1951: [-0.66, -0.36, -0.04, 0.16, 0.27, 0.50, 0.71, 0.90, 1.02, 1.03, 0.96, 0.71],
    1952: [0.52, 0.27, 0.33, 0.18, -0.07, -0.44, -0.45, -0.20, 0.03, 0.04, -0.11, 0.06],
    1953: [0.25, 0.50, 0.48, 0.56, 0.77, 0.74, 0.63, 0.68, 0.59, 0.78, 0.52, 0.56],
    1954: [0.41, 0.35, 0.01, -0.27, -0.48, -0.48, -0.67, -0.83, -0.73, -0.52, -0.40, -0.44],
    1955: [-0.50, -0.48, -0.58, -0.76, -0.78, -0.88, -0.72, -0.92, -1.11, -1.44, -1.59, -1.51],
    1956: [-1.17, -0.81, -0.57, -0.51, -0.49, -0.47, -0.55, -0.52, -0.43, -0.39, -0.37, -0.39],
    1957: [-0.27, -0.06, 0.26, 0.63, 0.72, 0.82, 0.96, 1.03, 1.12, 1.15, 1.39, 1.62],
    1958: [1.69, 1.59, 1.17, 0.84, 0.57, 0.49, 0.43, 0.32, 0.28, 0.30, 0.36, 0.56],
    1959: [0.60, 0.64, 0.48, 0.39, 0.24, 0.02, -0.19, -0.23, -0.04, 0.11, 0.23, 0.14],
    1960: [0.02, 0.03, 0.06, 0.17, 0.04, 0.00, 0.01, 0.15, 0.19, 0.08, -0.07, -0.07],
    1961: [0.00, 0.03, 0.01, 0.05, 0.22, 0.22, 0.08, -0.20, -0.32, -0.22, -0.11, -0.05],
    1962: [-0.16, -0.17, -0.15, -0.20, -0.19, -0.13, 0.00, -0.10, -0.16, -0.25, -0.25, -0.32],
    1963: [-0.33, -0.17, 0.01, 0.13, 0.12, 0.45, 0.76, 1.09, 1.09, 1.13, 1.19, 1.13],
    1964: [0.95, 0.52, 0.06, -0.35, -0.60, -0.66, -0.67, -0.70, -0.72, -0.80, -0.79, -0.75],
    1965: [-0.51, -0.25, -0.04, 0.16, 0.47, 0.79, 1.10, 1.27, 1.55, 1.70, 1.82, 1.60],
    1966: [1.24, 0.95, 0.76, 0.43, 0.24, 0.18, 0.25, 0.13, -0.09, -0.12, -0.23, -0.35],
    1967: [-0.46, -0.48, -0.50, -0.37, -0.15, 0.05, -0.02, -0.26, -0.40, -0.40, -0.36, -0.42],
    1968: [-0.62, -0.73, -0.63, -0.48, -0.10, 0.17, 0.44, 0.38, 0.34, 0.50, 0.66, 0.93],
    1969: [0.98, 0.98, 0.77, 0.69, 0.62, 0.48, 0.37, 0.41, 0.61, 0.71, 0.81, 0.71],
    1970: [0.46, 0.23, 0.23, 0.28, 0.11, -0.26, -0.55, -0.72, -0.69, -0.72, -0.78, -1.10],
    1971: [-1.29, -1.36, -1.08, -0.81, -0.72, -0.69, -0.68, -0.60, -0.68, -0.78, -0.86, -0.78],
    1972: [-0.57, -0.27, 0.04, 0.25, 0.48, 0.70, 1.00, 1.26, 1.49, 1.69, 1.84, 1.77],
    1973: [1.55, 1.13, 0.56, -0.03, -0.51, -0.80, -0.99, -1.11, -1.26, -1.58, -1.89, -2.04],
    1974: [-1.87, -1.59, -1.24, -0.99, -0.71, -0.64, -0.46, -0.40, -0.47, -0.69, -0.88, -0.71],
    1975: [-0.56, -0.55, -0.61, -0.66, -0.80, -0.92, -1.08, -1.12, -1.29, -1.32, -1.47, -1.58],
    1976: [-1.49, -1.11, -0.65, -0.45, -0.23, 0.00, 0.23, 0.40, 0.60, 0.79, 0.81, 0.84],
    1977: [0.71, 0.66, 0.33, 0.26, 0.26, 0.46, 0.39, 0.35, 0.45, 0.68, 0.84, 0.82],
    1978: [0.71, 0.52, 0.17, -0.06, -0.28, -0.24, -0.37, -0.37, -0.44, -0.27, -0.07, 0.11],
    1979: [0.19, 0.21, 0.29, 0.32, 0.29, 0.14, 0.09, 0.22, 0.34, 0.47, 0.50, 0.64],
    1980: [0.62, 0.47, 0.35, 0.34, 0.45, 0.40, 0.18, -0.06, -0.17, -0.07, 0.08, -0.05],
    1981: [-0.27, -0.42, -0.41, -0.27, -0.28, -0.27, -0.28, -0.23, -0.08, -0.16, -0.19, -0.14],
    1982: [-0.05, 0.02, 0.07, 0.34, 0.65, 0.73, 0.78, 0.99, 1.45, 1.82, 2.03, 2.12],
    1983: [2.14, 1.91, 1.52, 1.23, 0.95, 0.62, 0.25, -0.06, -0.43, -0.76, -0.96, -0.89],
    1984: [-0.63, -0.51, -0.38, -0.47, -0.55, -0.52, -0.39, -0.22, -0.32, -0.62, -0.95, -1.06],
    1985: [-1.01, -0.86, -0.85, -0.80, -0.79, -0.60, -0.44, -0.33, -0.31, -0.30, -0.28, -0.36],
    1986: [-0.40, -0.38, -0.25, -0.17, -0.09, 0.02, 0.24, 0.46, 0.64, 0.86, 1.06, 1.21],
    1987: [1.18, 1.13, 1.02, 0.94, 0.95, 1.11, 1.30, 1.46, 1.49, 1.41, 1.20, 1.00],
    1988: [0.63, 0.37, -0.03, -0.45, -0.99, -1.30, -1.30, -1.14, -1.27, -1.54, -1.81, -1.85],
    1989: [-1.64, -1.38, -1.09, -0.85, -0.61, -0.40, -0.37, -0.36, -0.33, -0.25, -0.12, -0.04],
    1990: [0.18, 0.19, 0.30, 0.27, 0.25, 0.25, 0.26, 0.32, 0.31, 0.27, 0.31, 0.34],
    1991: [0.35, 0.26, 0.23, 0.29, 0.49, 0.63, 0.77, 0.67, 0.72, 0.83, 1.18, 1.43],
    1992: [1.54, 1.50, 1.40, 1.30, 1.08, 0.72, 0.35, 0.08, -0.15, -0.22, -0.24, -0.05],
    1993: [0.13, 0.31, 0.50, 0.73, 0.76, 0.56, 0.28, 0.22, 0.20, 0.20, 0.20, 0.19],
    1994: [0.07, 0.00, 0.04, 0.17, 0.25, 0.23, 0.30, 0.30, 0.47, 0.66, 0.93, 0.97],
    1995: [0.88, 0.65, 0.46, 0.19, 0.03, -0.11, -0.30, -0.55, -0.81, -0.97, -1.05, -1.01],
    1996: [-0.88, -0.70, -0.52, -0.36, -0.25, -0.24, -0.22, -0.27, -0.30, -0.33, -0.39, -0.41],
    1997: [-0.41, -0.26, -0.03, 0.30, 0.71, 1.13, 1.48, 1.79, 2.04, 2.24, 2.34, 2.37],
    1998: [2.22, 1.91, 1.40, 1.03, 0.40, -0.08, -0.63, -0.83, -1.02, -1.12, -1.31, -1.47],
    1999: [-1.51, -1.25, -0.93, -0.80, -0.79, -0.84, -0.90, -0.94, -1.00, -1.13, -1.35, -1.53],
    2000: [-1.47, -1.26, -0.98, -0.81, -0.67, -0.62, -0.48, -0.40, -0.42, -0.54, -0.76, -0.78],
    2001: [-0.76, -0.54, -0.43, -0.29, -0.19, -0.08, -0.05, -0.13, -0.15, -0.26, -0.33, -0.32],
    2002: [-0.15, 0.07, 0.11, 0.15, 0.30, 0.45, 0.57, 0.63, 0.78, 0.99, 1.19, 1.08],
    2003: [0.90, 0.59, 0.38, -0.01, -0.18, -0.13, 0.09, 0.14, 0.23, 0.23, 0.29, 0.29],
    2004: [0.34, 0.27, 0.19, 0.10, 0.12, 0.22, 0.39, 0.54, 0.58, 0.61, 0.64, 0.71],
    2005: [0.62, 0.55, 0.40, 0.37, 0.27, 0.09, -0.04, -0.14, -0.11, -0.27, -0.57, -0.82],
    2006: [-0.86, -0.80, -0.63, -0.45, -0.19, -0.05, 0.12, 0.33, 0.54, 0.71, 0.88, 0.88],
    2007: [0.62, 0.19, -0.12, -0.32, -0.34, -0.41, -0.49, -0.77, -1.05, -1.38, -1.57, -1.72],
    2008: [-1.76, -1.61, -1.37, -1.05, -0.85, -0.56, -0.33, -0.20, -0.25, -0.36, -0.57, -0.79],
    2009: [-0.89, -0.84, -0.63, -0.35, 0.03, 0.34, 0.50, 0.56, 0.66, 0.92, 1.31, 1.50],
    2010: [1.47, 1.21, 0.88, 0.38, -0.16, -0.66, -0.98, -1.24, -1.43, -1.54, -1.57, -1.48],
    2011: [-1.29, -1.06, -0.85, -0.68, -0.50, -0.34, -0.37, -0.50, -0.76, -0.94, -1.02, -0.92],
    2012: [-0.71, -0.56, -0.44, -0.35, -0.18, 0.03, 0.28, 0.39, 0.37, 0.28, 0.13, -0.03],
    2013: [-0.24, -0.28, -0.23, -0.20, -0.30, -0.38, -0.45, -0.34, -0.32, -0.14, -0.12, -0.11],
    2014: [-0.24, -0.21, -0.02, 0.25, 0.35, 0.22, 0.07, 0.07, 0.24, 0.51, 0.70, 0.80],
    2015: [0.73, 0.65, 0.72, 0.86, 1.04, 1.19, 1.44, 1.73, 2.02, 2.28, 2.45, 2.59],
    2016: [2.50, 2.21, 1.69, 1.11, 0.57, 0.09, -0.19, -0.34, -0.42, -0.51, -0.49, -0.37],
    2017: [-0.08, 0.08, 0.27, 0.32, 0.35, 0.32, 0.14, -0.07, -0.23, -0.44, -0.61, -0.76],
    2018: [-0.71, -0.67, -0.55, -0.35, -0.07, 0.13, 0.20, 0.30, 0.52, 0.82, 1.04, 1.05],
    2019: [0.99, 0.94, 0.87, 0.82, 0.71, 0.59, 0.38, 0.20, 0.31, 0.51, 0.72, 0.75],
    2020: [0.71, 0.66, 0.57, 0.33, 0.04, -0.18, -0.29, -0.43, -0.77, -1.00, -1.11, -1.06],
    2021: [-0.99, -0.85, -0.74, -0.56, -0.40, -0.31, -0.35, -0.46, -0.64, -0.77, -0.91, -0.83],
    2022: [-0.76, -0.68, -0.77, -0.86, -0.83, -0.73, -0.70, -0.78, -0.87, -0.89, -0.82, -0.70],
    2023: [-0.55, -0.33, -0.11, 0.19, 0.46, 0.73, 1.00, 1.25, 1.50, 1.74, 1.90, 1.99],
    2024: [1.84, 1.53, 1.18, 0.77, 0.43, 0.18, 0.06, -0.04, -0.12, -0.19, -0.29, -0.43],
    2025: [-0.46, -0.22, -0.08, 0.02, -0.04, -0.02, -0.11, -0.26, -0.43, -0.57, -0.61, -0.60],
    2026: [-0.39, -0.21, 0.11, 0.46, 0.95, 1.39, 1.80, 2.16],
  } as Record<number, number[]>,
} satisfies Dataset<Record<number, number[]>>;

/** Flat chart series: x = year + season-centre month (DJF → mid-January). */
export const oniSeries = (fromYear = 1950, toYear = 9999): YearValue[] =>
  Object.entries(oni.data)
    .map(([y, vals]) => ({ y: Number(y), vals }))
    .filter(({ y }) => y >= fromYear && y <= toYear)
    .flatMap(({ y, vals }) => vals.map((value, i) => ({ year: y + (i + 0.5) / 12, value })));

const seasonLabel = (year: number, i: number) => `${ONI_SEASONS[i]} ${year}`;

/** El Niño episodes from the ONI using NOAA's rule (≥ threshold for ≥ minSeasons consecutive seasons). */
export const elNinoEpisodes = (threshold = ninoThreshold.data.value, minSeasons = ninoThreshold.data.minSeasons): ElNinoEpisode[] => {
  const flat = Object.entries(oni.data).flatMap(([y, vals]) => vals.map((v, i) => ({ year: Number(y), i, v })));
  const out: ElNinoEpisode[] = [];
  let run: typeof flat = [];
  const flush = () => {
    if (run.length >= minSeasons) {
      const pk = run.reduce((a, b) => (b.v > a.v ? b : a));
      out.push({
        start: seasonLabel(run[0].year, run[0].i),
        end: seasonLabel(run[run.length - 1].year, run[run.length - 1].i),
        peak: pk.v,
        peakSeason: seasonLabel(pk.year, pk.i),
        peakX: pk.year + (pk.i + 0.5) / 12,
      });
    }
    run = [];
  };
  for (const s of flat) {
    // ONI values are rounded to 0.1 in NOAA's episode table; ≥ 0.5 on the 2-decimal value is the same test.
    if (s.v >= threshold) run.push(s);
    else flush();
  }
  flush();
  return out;
};

// SOURCE: derived from `oni` above; cross-checked against the CPC episode table.
// ✓ 1982–83 peak 2.14 (DJF 1983) · 1997–98 peak 2.37 (NDJ 1997) · 2015–16 peak 2.59 (NDJ 2015)
//   For reference, the Relative ONI (RONI, NOAA's official index since 2025) peaks lower:
//   2.40 (DJF 1983) · 2.28 (NDJ 1997) · 2.25 (NDJ 2015) — https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt
export const pastGiants = {
  sourceTag: 'NOAA CPC (ONI)',
  source: oni.source,
  status: 'verified',
  notes:
    'On-screen tags show 1 decimal. WMO’s “previous record +2.6 °C, Nov 2015–Jan 2016” equals ONI NDJ 2015 (2.59), so the comparison with the +3.7 °C forecast is like-for-like in magnitude even though baselines differ slightly.',
  data: [
    { id: '1982', label: '1982–83', peak: 2.14, peakSeason: 'DJF 1983', peakX: 1983 + 0.5 / 12 }, // ✓
    { id: '1997', label: '1997–98', peak: 2.37, peakSeason: 'NDJ 1997', peakX: 1997 + 11.5 / 12 }, // ✓
    { id: '2015', label: '2015–16', peak: 2.59, peakSeason: 'NDJ 2015', peakX: 2015 + 11.5 / 12 }, // ✓
  ],
} satisfies Dataset<Array<{ id: string; label: string; peak: number; peakSeason: string; peakX: number }>>;

// SOURCE: last observed ONI (JAS 2026) joined to WMO's OND 2026 forecast.
// ✓ Observed end point = ONI JAS 2026 2.16; forecast point = WMO OND 2026 +3.7 (1993–2009 baseline).
// ✓ Range: WMO publishes no numeric spread — the GSCU says only that "the spread among individual forecast
//   systems generally remains narrow" (checked 14 Oct 2026). So no band/whisker is drawn: an invented range
//   would be false precision. The chart prints the point, "FORECAST" and the baseline instead.
export const nino2026Forecast = {
  sourceTag: 'NOAA CPC · WMO, OCT 2026',
  source: `${oni.source} · ${wmoOct2026.source}`,
  status: 'verified',
  notes:
    'Dotted forecast segment joins two different baselines (ONI → WMO 1993–2009). The chart prints “OCT–DEC 2026 FORECAST · WMO BASELINE 1993–2009”.',
  data: {
    lastObserved: { year: 2026 + 7.5 / 12, value: 2.16, season: 'JAS 2026' }, // ✓ ONI
    forecast: { year: 2026 + 10.5 / 12, value: 3.7, season: 'OND 2026' }, // ✓ WMO
    spread: 'narrow (qualitative, no range published)', // ✓ GSCU OND 2026
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// 4. The normal Pacific (Scene 2 cross-section)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: NOAA PMEL TAO project, "What is an El Niño?" — "the sea surface is about 1/2 meter higher at
//   Indonesia than at Ecuador"; NASA Earth Observatory gives ~45 cm (Indonesia vs Ecuador).
//   https://www.pmel.noaa.gov/elnino/what-is-el-nino · https://earthobservatory.nasa.gov/images/7192
// ✓ Both checked on the primary pages (14 Oct 2026). PMEL: "the sea surface is about 1/2 meter (1 1/2 feet)
//   higher at Indonesia than at Ecuador"; "about 8ºC (14ºF) warmer off the coast of Asia than in the eastern Pacific".
export const normalPacific = {
  sourceTag: 'NOAA PMEL · NASA',
  source:
    'NOAA PMEL TAO, “What is an El Niño?”; NASA Earth Observatory, “Another Kelvin Wave Strengthens El Niño”. https://earthobservatory.nasa.gov/images/7192',
  status: 'verified',
  notes: 'Normal (non-El Niño) conditions. On screen: “+~0.5 m” bracket on the western bulge (counts 0 → 0.5).',
  data: {
    seaLevelDiffM: 0.5, // ✓ PMEL ~1/2 m · NASA ~0.45 m
    /** West–east SST difference in normal conditions, °C — optional label on the cross-section. */
    sstDiffC: 8, // ✓ PMEL
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// 5. Regional footprint (Scene 5 ImpactMap)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: NOAA CPC El Niño teleconnection maps (after Ropelewski & Halpert) and the WMO 8 Oct 2026 outlook.
//   https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ensoyears.shtml (impacts pages)
//   https://wmo.int/news/media-centre/sea-surface-temperatures-reflect-strengthening-el-nino
// Outlines are SCHEMATIC simplifications chosen to match the narration — not forecast contours.
// ✓ Fact-check 14 Oct 2026 — each tendency is supported by:
//   drier: Indonesia/Philippines, eastern Australia, southern Africa, India (monsoon), northern Brazil/Amazon —
//     WMO 8 Oct 2026 ("western Pacific", "Indian subcontinent" drier); Australian BoM; Al Jazeera/Reuters summaries
//     of NOAA/WMO guidance (southern Africa's 2023–24 drought; Amazon drought and fire risk).
//   wetter: Greater Horn of Africa, North America south of 45°N, southeastern South America (WMO 8 Oct 2026);
//     coastal Peru/Ecuador in strong events (Jan–Apr; 1983, 1998 floods).
//   Note: WMO's Oct–Dec list says "northwestern South America" drier — that is Colombia/Venezuela in OND; the
//   coastal Peru/Ecuador rains come later (Jan–Apr), so both are consistent.
// WMO OND 2026 cross-check: drier — western Pacific, Indian subcontinent, northwestern South America,
//   southern Central America; wetter — Greater Horn of Africa, North America south of 45°N, southeastern
//   South America. (Coastal Peru/Ecuador wetness peaks Jan–Apr, after this outlook window.)
export const impactRegions = {
  sourceTag: 'NOAA CPC · WMO, OCT 2026',
  source:
    'NOAA Climate Prediction Center, typical El Niño impacts (DJF / JJA composites); WMO Global Seasonal Climate Update OND 2026.',
  status: 'verified',
  notes: 'Typical tendencies, not certainties; outlines schematic (SourceTag says "TYPICAL EL NIÑO IMPACTS, SCHEMATIC").',
  data: [
    // ── dry (narration order) ───────────────────────────────────────────────
    {
      id: 'maritime', kind: 'dry', label: 'INDONESIA · PHILIPPINES', cue: 'indonesia', season: 'JJA–SON', // ✓ tendency (see fact-check note above)
      polygon: [[95, 6], [105, 8], [118, 19], [127, 19], [128, 6], [141, -2], [141, -9], [118, -10], [105, -8], [95, -2]],
      labelAt: [152, 12],
    },
    {
      id: 'eAustralia', kind: 'dry', label: 'EASTERN AUSTRALIA', cue: 'australia', season: 'JJA–SON', // ✓ tendency (see fact-check note above)
      polygon: [[135, -12], [145, -10], [153, -25], [151, -34], [141, -39], [135, -33]],
      labelAt: [143, -24],
    },
    {
      id: 'sAfrica', kind: 'dry', label: 'SOUTHERN AFRICA', cue: 'southern africa', season: 'DJF', // ✓ tendency (see fact-check note above)
      polygon: [[14, -14], [36, -11], [40, -16], [33, -27], [26, -34], [18, -33], [14, -22]],
      labelAt: [26, -22],
    },
    {
      id: 'india', kind: 'dry', label: 'INDIA · WEAKER MONSOON', cue: 'monsoon', season: 'JJA', // ✓ tendency (see fact-check note above)
      polygon: [[68, 23], [74, 32], [88, 27], [90, 22], [80, 9], [73, 15]],
      labelAt: [74, 33],
    },
    {
      id: 'nBrazil', kind: 'dry', label: 'NORTHERN BRAZIL · AMAZON', cue: 'amazon', season: 'DJF', // ✓ tendency (see fact-check note above)
      polygon: [[-72, 4], [-60, 6], [-50, 3], [-40, -3], [-45, -10], [-60, -11], [-73, -7]],
      labelAt: [-47, 3],
    },
    // ── wet ────────────────────────────────────────────────────────────────
    {
      id: 'peruEcuador', kind: 'wet', label: 'COASTAL PERU · ECUADOR', cue: 'peru and ecuador', season: 'JFM', // ✓ tendency (see fact-check note above)
      polygon: [[-81, 2], [-78, 1], [-77, -5], [-78, -10], [-80, -8], [-82, -3]],
      labelAt: [-104, -6],
    },
    {
      id: 'seSouthAmerica', kind: 'wet', label: 'S. BRAZIL · URUGUAY · N. ARGENTINA', cue: 'uruguay', season: 'SON–DJF', // ✓ tendency (see fact-check note above)
      polygon: [[-62, -24], [-50, -22], [-48, -28], [-53, -34], [-58, -36], [-63, -32]],
      labelAt: [-55, -30],
    },
    {
      id: 'southernUS', kind: 'wet', label: 'SOUTHERN UNITED STATES', cue: 'united states', season: 'DJF', // ✓ tendency (see fact-check note above)
      polygon: [[-120, 34], [-105, 36], [-90, 35], [-79, 33], [-81, 25], [-97, 26], [-110, 31]],
      labelAt: [-100, 31],
    },
    {
      id: 'eastAfrica', kind: 'wet', label: 'EAST AFRICA', cue: 'east africa', season: 'OND', // ✓ tendency (see fact-check note above)
      polygon: [[33, 4], [42, 12], [51, 11], [48, 2], [41, -6], [36, -6], [32, -2]],
      labelAt: [55, 6],
    },
  ],
} satisfies Dataset<ImpactRegion[]>;

// ─────────────────────────────────────────────────────────────────────────────
// 6. Economy (Scene 6)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: Callahan, C. W. & Mankin, J. S. (2023) "Persistent effect of El Niño on global economic growth",
//   Science 380(6649):1064–1069, DOI 10.1126/science.adf2983 (published 18 May 2023 online, 9 Jun 2023 issue).
// ✓ Abstract (via Crossref): "we attribute $4.1 trillion and $5.7 trillion in global income losses to the
//   1982–83 and 1997–98 El Niño events, respectively" and "$84 trillion in 21st-century economic losses".
// ✓ Window: Dartmouth release — "$4.1 trillion and $5.7 trillion, respectively, in the half-decade after each
//   of these events". Dollar year: Grist reports them "in 2017 dollars".
//   https://home.dartmouth.edu/news/2023/05/years-after-el-nino-global-economy-loses-trillions
export const economicCost = {
  sourceTag: 'CALLAHAN & MANKIN, SCIENCE, 2023',
  source:
    'Callahan & Mankin (2023), “Persistent effect of El Niño on global economic growth”, Science 380:1064–1069. https://doi.org/10.1126/science.adf2983',
  status: 'verified',
  notes: 'Model-based estimates of lost global income in the five years after each event (2017 US$), not observed totals.',
  data: {
    loss1982: 4.1, // ✓ trillion US$ (abstract)
    loss1997: 5.7, // ✓ trillion US$ (abstract)
    projection21stCentury: 84, // ✓ trillion US$, pledge-consistent emissions scenario (abstract) — not narrated
    dollarYear: '2017 US$', // ✓ Grist (reporting the paper)
    windowYears: 5, // ✓ Dartmouth release
  },
} satisfies Dataset<unknown>;

// SOURCE: producing regions — FAOSTAT production rankings / USDA FAS PSD.
//   https://www.fao.org/faostat/en/#data/QCL · https://apps.fas.usda.gov/psdonline/
// ✓ Fact-check 14 Oct 2026: cocoa — Côte d'Ivoire and Ghana are the top two producers (FAO data via Intelpoint;
//   2023–24 shipments fell ~35–39% amid El Niño-linked weather, Reuters/StoneX); palm oil — Indonesia and Malaysia
//   are the top two (FAO 2022); robusta coffee — Vietnam and Indonesia, where 2016 El Niño water shortages cut
//   output (Reuters, Aug 2026); rice and sugar — India and Thailand are leading exporters in El Niño-sensitive
//   monsoon regions. No market shares or price numbers are printed on screen (narration gives none).
export const commodities = {
  sourceTag: 'FAOSTAT · USDA FAS',
  source: 'FAOSTAT crop production (QCL); USDA Foreign Agricultural Service PSD Online.',
  status: 'verified',
  notes:
    'Producers listed are ones inside El Niño drought footprints. Brazil (coffee, sugar) is a major producer but its centre-south belt is not a classic El Niño drought zone, so it is left out to avoid implying that it is.',
  data: [
    { id: 'cocoa', label: 'COCOA', note: 'West Africa', producers: [{ name: 'Côte d’Ivoire', lonLat: [-5.5, 7.5] }, { name: 'Ghana', lonLat: [-1.0, 7.9] }] }, // ✓
    { id: 'coffee', label: 'COFFEE', note: 'Vietnam · Indonesia', producers: [{ name: 'Vietnam', lonLat: [108.0, 12.7] }, { name: 'Indonesia', lonLat: [104.0, -4.5] }] }, // ✓
    { id: 'palmOil', label: 'PALM OIL', note: 'Indonesia · Malaysia', producers: [{ name: 'Indonesia', lonLat: [101.5, 0.5] }, { name: 'Malaysia', lonLat: [113.5, 3.0] }] }, // ✓
    { id: 'rice', label: 'RICE', note: 'India · Thailand', producers: [{ name: 'India', lonLat: [80.0, 21.0] }, { name: 'Thailand', lonLat: [101.0, 15.5] }] }, // ✓
    { id: 'sugar', label: 'SUGAR', note: 'India · Thailand', producers: [{ name: 'India', lonLat: [75.5, 19.5] }, { name: 'Thailand', lonLat: [102.5, 16.0] }] }, // ✓
    { id: 'fish', label: 'FISHMEAL', note: 'Peru anchovy', producers: [{ name: 'Peru', lonLat: [-78.5, -9.0] }] }, // ✓ PRODUCE
  ],
} satisfies Dataset<Commodity[]>;

// SOURCE (2026): PRODUCE / IMARPE via trade press — SeafoodSource, Undercurrent News (Apr–Oct 2026).
//   https://www.undercurrentnews.com/2026/04/01/peru-sets-first-season-anchovy-quota-at-1-91m-metric-tons-down-36-year-on-year/
//   https://www.seafoodsource.com/news/peru-media-reports-second-anchovy-season-likely-to-be-cancelled-amid-el-ni-o
// SOURCE (1997–98): ICES J. Mar. Sci. 82(12) fsaf214 (2025); FAO Review of the state of world marine fishery resources.
// Nothing here is narrated as a number; values are for an optional Plex Mono label in the anchovy shot.
export const peruAnchovy = {
  sourceTag: 'PRODUCE · IMARPE · FAO',
  source:
    'Peru Ministry of Production (PRODUCE) / IMARPE communiqués 2026 (via SeafoodSource, Undercurrent News); FAO, Review of the state of world marine fishery resources; ICES JMS (2025) fsaf214.',
  status: 'verified',
  notes:
    'Visuals stay qualitative (the school swims south-west, out of the warm patch). Not used and therefore removed: 1997–98 biomass figures (single 2025 study) and the 2026 second-season outlook (unconfirmed as of 14 Oct 2026).',
  data: {
    quota2026FirstSeasonMt: 1.914, // ✓ RM N° 000085-2026-PRODUCE (31 Mar 2026): 1,914,049 t, North-Centre zone
    caughtShare2026FirstSeason: 0.2461, // ✓ PRODUCE via Infobae (15 Sep 2026): "un avance de 24,61% de la cuota"
    seasonClosed: '21 Aug 2026', // ✓ PRODUCE closed the first season early on IMARPE's advice
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// 7. Global temperature (Scene 7)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: NASA GISS Surface Temperature Analysis v4, global annual means (J–D), downloaded 14 Oct 2026.
//   https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv
// ✓ Values copied programmatically from the file, °C relative to 1951–1980.
export const globalTemp = {
  sourceTag: 'NASA GISTEMP v4',
  source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4), annual global land–ocean anomaly vs 1951–1980. https://data.giss.nasa.gov/gistemp/',
  status: 'verified',
  notes:
    'Axis label must say “°C vs 1951–1980”. Do not mix with WMO’s “vs 1850–1900” numbers on the same axis. 2023 was also a record year in this series; the narration names 2016 and 2024 only — the chart circles those two and leaves 2023 visible but unmarked.',
  data: [
    { year: 1880, value: -0.17 }, { year: 1881, value: -0.09 }, { year: 1882, value: -0.11 }, { year: 1883, value: -0.18 }, { year: 1884, value: -0.28 }, { year: 1885, value: -0.33 }, { year: 1886, value: -0.31 }, { year: 1887, value: -0.36 },
    { year: 1888, value: -0.18 }, { year: 1889, value: -0.11 }, { year: 1890, value: -0.36 }, { year: 1891, value: -0.22 }, { year: 1892, value: -0.27 }, { year: 1893, value: -0.31 }, { year: 1894, value: -0.30 }, { year: 1895, value: -0.23 },
    { year: 1896, value: -0.11 }, { year: 1897, value: -0.11 }, { year: 1898, value: -0.28 }, { year: 1899, value: -0.18 }, { year: 1900, value: -0.08 }, { year: 1901, value: -0.16 }, { year: 1902, value: -0.28 }, { year: 1903, value: -0.37 },
    { year: 1904, value: -0.47 }, { year: 1905, value: -0.26 }, { year: 1906, value: -0.22 }, { year: 1907, value: -0.38 }, { year: 1908, value: -0.42 }, { year: 1909, value: -0.48 }, { year: 1910, value: -0.44 }, { year: 1911, value: -0.44 },
    { year: 1912, value: -0.37 }, { year: 1913, value: -0.34 }, { year: 1914, value: -0.15 }, { year: 1915, value: -0.14 }, { year: 1916, value: -0.36 }, { year: 1917, value: -0.46 }, { year: 1918, value: -0.30 }, { year: 1919, value: -0.27 },
    { year: 1920, value: -0.27 }, { year: 1921, value: -0.18 }, { year: 1922, value: -0.28 }, { year: 1923, value: -0.26 }, { year: 1924, value: -0.27 }, { year: 1925, value: -0.22 }, { year: 1926, value: -0.11 }, { year: 1927, value: -0.22 },
    { year: 1928, value: -0.20 }, { year: 1929, value: -0.36 }, { year: 1930, value: -0.15 }, { year: 1931, value: -0.09 }, { year: 1932, value: -0.16 }, { year: 1933, value: -0.28 }, { year: 1934, value: -0.13 }, { year: 1935, value: -0.20 },
    { year: 1936, value: -0.15 }, { year: 1937, value: -0.03 }, { year: 1938, value: 0.00 }, { year: 1939, value: -0.02 }, { year: 1940, value: 0.12 }, { year: 1941, value: 0.18 }, { year: 1942, value: 0.06 }, { year: 1943, value: 0.09 },
    { year: 1944, value: 0.20 }, { year: 1945, value: 0.09 }, { year: 1946, value: -0.07 }, { year: 1947, value: -0.03 }, { year: 1948, value: -0.11 }, { year: 1949, value: -0.11 }, { year: 1950, value: -0.17 }, { year: 1951, value: -0.07 },
    { year: 1952, value: 0.01 }, { year: 1953, value: 0.08 }, { year: 1954, value: -0.13 }, { year: 1955, value: -0.14 }, { year: 1956, value: -0.19 }, { year: 1957, value: 0.05 }, { year: 1958, value: 0.06 }, { year: 1959, value: 0.03 },
    { year: 1960, value: -0.02 }, { year: 1961, value: 0.06 }, { year: 1962, value: 0.03 }, { year: 1963, value: 0.05 }, { year: 1964, value: -0.20 }, { year: 1965, value: -0.11 }, { year: 1966, value: -0.06 }, { year: 1967, value: -0.02 },
    { year: 1968, value: -0.08 }, { year: 1969, value: 0.05 }, { year: 1970, value: 0.03 }, { year: 1971, value: -0.08 }, { year: 1972, value: 0.01 }, { year: 1973, value: 0.16 }, { year: 1974, value: -0.07 }, { year: 1975, value: -0.01 },
    { year: 1976, value: -0.10 }, { year: 1977, value: 0.18 }, { year: 1978, value: 0.07 }, { year: 1979, value: 0.16 }, { year: 1980, value: 0.26 }, { year: 1981, value: 0.32 }, { year: 1982, value: 0.14 }, { year: 1983, value: 0.31 },
    { year: 1984, value: 0.16 }, { year: 1985, value: 0.12 }, { year: 1986, value: 0.18 }, { year: 1987, value: 0.32 }, { year: 1988, value: 0.39 }, { year: 1989, value: 0.27 }, { year: 1990, value: 0.45 }, { year: 1991, value: 0.41 },
    { year: 1992, value: 0.22 }, { year: 1993, value: 0.23 }, { year: 1994, value: 0.31 }, { year: 1995, value: 0.45 }, { year: 1996, value: 0.33 }, { year: 1997, value: 0.47 }, { year: 1998, value: 0.61 }, { year: 1999, value: 0.38 },
    { year: 2000, value: 0.39 }, { year: 2001, value: 0.53 }, { year: 2002, value: 0.63 }, { year: 2003, value: 0.62 }, { year: 2004, value: 0.53 }, { year: 2005, value: 0.68 }, { year: 2006, value: 0.64 }, { year: 2007, value: 0.66 },
    { year: 2008, value: 0.54 }, { year: 2009, value: 0.66 }, { year: 2010, value: 0.72 }, { year: 2011, value: 0.61 }, { year: 2012, value: 0.65 }, { year: 2013, value: 0.67 }, { year: 2014, value: 0.75 }, { year: 2015, value: 0.89 },
    { year: 2016, value: 1.01 }, { year: 2017, value: 0.91 }, { year: 2018, value: 0.85 }, { year: 2019, value: 0.98 }, { year: 2020, value: 1.01 }, { year: 2021, value: 0.85 }, { year: 2022, value: 0.89 }, { year: 2023, value: 1.17 },
    { year: 2024, value: 1.28 }, { year: 2025, value: 1.18 },
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

/** Years that beat every earlier year in a series (record-setters). */
export const recordYears = (series: YearValue[], fromYear = 1950): number[] => {
  let best = -Infinity;
  const out: number[] = [];
  for (const d of series) {
    if (d.value > best) {
      if (d.year >= fromYear) out.push(d.year);
      best = d.value;
    }
  }
  return out;
};

// SOURCE: WMO State of the Global Climate 2024 (19 Mar 2025) — https://wmo.int/files/state-of-global-climate-2024
// ✓ 2024: 1.55 ± 0.13 °C above 1850–1900, warmest year in the 175-year record.
// ✓ 2016 was the warmest year on record at the time (WMO State of the Global Climate 2016), later
//   surpassed by 2023 (1.45 °C) and 2024.
export const temperatureRecords = {
  sourceTag: 'WMO',
  source: 'WMO State of the Global Climate 2016 and 2024. https://wmo.int/files/state-of-global-climate-2024',
  status: 'verified',
  notes: 'Optional count-up label next to the 2024 circle: “+1.55 °C vs PRE-INDUSTRIAL (WMO)”, set apart from the GISTEMP axis.',
  data: {
    record2024: 1.55, // ✓ °C vs 1850–1900
    record2024Uncertainty: 0.13, // ✓
    record2023: 1.45, // ✓ °C vs 1850–1900
    strongElNinoBefore: { 2016: '2015–16', 2024: '2023–24' }, // ✓ ONI episodes above
  },
} satisfies Dataset<unknown>;

// SOURCE: Met Office blog "Record-breaking El Niño surpasses previous benchmarks", 22 Sep 2026.
//   https://www.metoffice.gov.uk/blog/2026/record-breaking-el-nino-surpasses-previous-benchmarks
//   Consistent with Carbon Brief and Climate Central (2026), who also favour 2027 for a record.
// Narration: "Many scientists expect 2027 could be next." On screen only “2027?” — no forecast value.
export const expectations2027 = {
  sourceTag: 'MET OFFICE, SEP 2026',
  source: 'UK Met Office, “Record-breaking El Niño surpasses previous benchmarks”, 22 Sep 2026.',
  status: 'verified',
  notes: 'Strong El Niños lift global temperature most "in the calendar year following the winter peak" (Met Office), so a December 2026 peak mostly lifts 2027. On screen only "2027?" — no forecast value.',
  data: {
    metOffice: '2027 is very likely to replace 2024 as the warmest year on record', // ✓ Met Office blog, 22 Sep 2026 (Dr Nick Dunstone)
    lag: 'calendar year following the winter peak', // ✓ same post
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// Registry + checks
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_DATASETS = {
  wmoOct2026,
  indianOceanDipole,
  ninoThreshold,
  nino34Box,
  oni,
  pastGiants,
  nino2026Forecast,
  normalPacific,
  impactRegions,
  economicCost,
  commodities,
  peruAnchovy,
  globalTemp,
  temperatureRecords,
  expectations2027,
};

/** Names of datasets that still contain placeholder values. */
export const hasPlaceholders = (): string[] => placeholdersIn(ALL_DATASETS);

/** Strings that must never appear on screen (checked by the El Niño data script in Phase 4). */
export const BANNED_ON_SCREEN = ['super el niño', 'super el nino'];
