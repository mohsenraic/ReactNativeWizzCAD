/**
 * japan.ts — every number shown in "Why Japan Is Losing Millions of People".
 *
 * Verification pass: October 2026. Each value is tagged:
 *   // ✓ <source>     confirmed against an official table or release (or a press report quoting it)
 *   // TODO: VERIFY   could not be confirmed in this pass — check the URL before lock
 *   // PLACEHOLDER    not real data; must be replaced before render
 * Full log with links: /DATA_NOTES.md
 *
 * Dataset-level `status`:
 *   'verified'    every value confirmed
 *   'toVerify'    mostly confirmed; individual TODOs remain
 *   'placeholder' contains stand-in values → <SourceTag> prints "⚠ PLACEHOLDER" in renders
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DataStatus = 'verified' | 'toVerify' | 'placeholder';

export interface Dataset<T> {
  /** Short label printed by <SourceTag>, e.g. "MHLW, 2026". */
  sourceTag: string;
  /** Full citation / URL for the description box and fact-check. */
  source: string;
  status: DataStatus;
  /** Free-text caveats (definition changes, coverage, etc.). */
  notes?: string;
  data: T;
}

export interface YearValue {
  year: number;
  value: number;
}

export interface Milestone {
  year: number;
  value: number;
  /** On-screen flag text. */
  label: string;
}

export interface PyramidCohort {
  /** Lower bound of the 5-year band (95 = "95+"). */
  ageFrom: number;
  /** Display label, e.g. "20–24". */
  label: string;
  /** Thousands of people. */
  male: number;
  /** Thousands of people. */
  female: number;
}

export interface PyramidYear {
  year: number;
  status: DataStatus;
  cohorts: PyramidCohort[];
}

export interface GeoPoint {
  name: string;
  /** Plex Mono label shown next to the pulsing dot. */
  label: string;
  lon: number;
  lat: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Headline vital statistics, 2025 (Scenes 1, 4, 5)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: MHLW, Vital Statistics 2025 (final figures for Japanese nationals in Japan, June 2026).
// ✓ MHLW 令和7年人口動態統計月報年計(概数)の概況 https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/geppo/nengai25/dl/gaikyouR7.pdf
// ✓ nippon.com "Baby Decline" (Jun 2026) https://www.nippon.com/en/japan-data/h02802/
export const vital2025 = {
  sourceTag: 'MHLW, 2026',
  source:
    'Ministry of Health, Labour and Welfare — Vital Statistics 2025 (June 2026). https://www.mhlw.go.jp/toukei/list/81-1a.html',
  status: 'verified',
  notes: 'Japanese nationals in Japan. Natural change only (births − deaths); excludes migration.',
  data: {
    births: 671_236, // ✓
    births2024: 686_173, // ✓ (final 2024; the June 2025 provisional figure was 686,061)
    deaths: 1_589_489, // ✓ first annual fall in deaths in five years
    deaths2024: 1_605_378, // ✓
    naturalChange: -918_253, // = 671,236 − 1,589,489
    tfr: 1.14, // ✓ 10th consecutive annual decline
    tfr2024: 1.15, // ✓
    tfrTokyo: 0.96, // ✓ lowest prefecture
    tfrOkinawa: 1.52, // ✓ highest prefecture
    /** Deaths have exceeded births every year since 2007 → 2007…2025 inclusive. */
    consecutiveYearsOfDecline: 19, // ✓ Stat. Bureau: 2024 was the 18th year running
    naturalDeclineSince: 2007,
  },
} satisfies Dataset<unknown>;

// SOURCE: MHLW Vital Statistics (births 1947–49 and 1971–74).
// ✓ 1947 2,678,792 · 1949 2,696,638 (all-time peak) · 1973 2,091,983 — MHLW annual tables.
export const babyBooms = {
  sourceTag: 'MHLW',
  source: 'MHLW Vital Statistics, historical births. https://www.mhlw.go.jp/toukei/list/81-1a.html',
  status: 'verified',
  notes:
    'Narration says "2.5 million births a year"; actual 1947–49 births were ~2.7M/yr, so on-screen labels say "> 2.5M" to stay true and consistent with the voice.',
  data: [
    { id: 'boom1', years: [1947, 1949] as const, label: '> 2.5M births / year', peakBirths: 2_696_638 },
    { id: 'boom2', years: [1971, 1974] as const, label: '> 2M births / year', peakBirths: 2_091_983 },
  ],
} satisfies Dataset<unknown>;

// SOURCE: Children's Future Strategy (こども未来戦略), cabinet decision 22 Dec 2023, ¥3.6 trillion/yr "Acceleration Plan".
// ✓ International IDEA Democracy Tracker, Dec 2023; Children and Families Agency https://www.cfa.go.jp/
export const policySpending = {
  sourceTag: 'CABINET OFFICE / CFA, 2023',
  source:
    'Government of Japan, Children’s Future Strategy (cabinet decision, 22 Dec 2023): ~¥3.6 trillion per year in additional spending. https://www.cfa.go.jp/',
  status: 'verified',
  data: {
    yenPerYear: 3_600_000_000_000,
    /** Counter animates 0 → 3.6 with suffix. */
    displayValue: 3.6,
    displaySuffix: 'TRILLION ¥ / YEAR',
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// 2. Total population 1950 → 2025 (Scenes 2, 8)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: Statistics Bureau of Japan — Population Census (census years) and Population Estimates (Oct 1).
// Chart series uses census counts + the 2008 peak estimate, so the line is one consistent series.
// 1950–1970 exclude Okinawa (returned 1972) → small step into 1975.
export const totalPopulation = {
  sourceTag: 'STATISTICS BUREAU OF JAPAN',
  source:
    'Statistics Bureau of Japan, Population Census 1950–2025 (total incl. foreign residents, Oct 1); 2008 from Population Estimates. https://www.stat.go.jp/english/data/kokusei/index.html',
  status: 'toVerify',
  notes: 'Unit: millions. 1950–1970 exclude Okinawa. 2025 = final census result (Sept 2026).',
  data: [
    { year: 1950, value: 83.2 }, // ✓ census 83,199,637 (excl. Okinawa)
    { year: 1955, value: 89.276 }, // ✓ census 89,275,529
    { year: 1960, value: 93.419 }, // ✓ census 93,418,501
    { year: 1965, value: 98.275 }, // ✓ census 98,274,961
    { year: 1970, value: 103.72 }, // ✓ census 103,720,060
    { year: 1975, value: 111.94 }, // ✓ census 111,939,643
    { year: 1980, value: 117.06 }, // ✓ census 117,060,396
    { year: 1985, value: 121.049 }, // TODO: VERIFY census 121,048,923 — https://www.stat.go.jp/english/data/chouki/02.html
    { year: 1990, value: 123.611 }, // TODO: VERIFY census 123,611,167 — same URL
    { year: 1995, value: 125.57 }, // TODO: VERIFY census 125,570,246 — same URL
    { year: 2000, value: 126.926 }, // ✓ census 126,925,843
    { year: 2005, value: 127.768 }, // ✓ census 127,767,994
    { year: 2008, value: 128.084 }, // ✓ estimate 128,083,960 (revised series; Stat. Bureau 2012 table) — peak
    { year: 2010, value: 128.057 }, // ✓ census 128,057,352
    { year: 2015, value: 127.095 }, // ✓ census 127,094,745
    { year: 2020, value: 126.146 }, // ✓ census 126,146,099
    { year: 2025, value: 122.973 }, // ✓ census final 122,972,528 (released 29 Sep 2026)
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

/**
 * Oct 1 annual estimates between censuses. Not plotted on the main line: they are based on the
 * 2020 census and will be revised down after the 2025 census (2024 → 2025 would otherwise look
 * like an 830K one-year drop). Kept for reference / on-screen year ticker if wanted.
 */
export const annualEstimates2021to2024 = {
  sourceTag: 'STATISTICS BUREAU OF JAPAN',
  source: 'Statistics Bureau of Japan, Current Population Estimates as of October 1 (2021–2024 releases).',
  status: 'verified',
  data: [
    { year: 2021, value: 125.502 }, // ✓
    { year: 2022, value: 124.947 }, // ✓
    { year: 2023, value: 124.352 }, // ✓
    { year: 2024, value: 123.802 }, // ✓ 14th straight annual fall; 65+ = 29.3%
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

export const populationPeak = {
  sourceTag: 'STATISTICS BUREAU OF JAPAN',
  source: totalPopulation.source,
  status: 'verified',
  notes:
    'The originally published 2008 estimate (127.69M) implied a 2007 peak; after revision to the 2010 census the series peaks in 2008 at 128.08M, which is the figure the Bureau uses today.',
  data: {
    year: 2008, // ✓
    millions: 128.084, // ✓
    annotation: 'peak: ~128M', // Caveat handwriting in Scene 2
  },
} satisfies Dataset<unknown>;

/** "−X million" label for the hatched decline area (Scene 2): 128.084 − 122.973 = 5.1. */
export const lossFromPeakMillions = (): number => {
  const last = totalPopulation.data[totalPopulation.data.length - 1];
  return Math.round((populationPeak.data.millions - last.value) * 10) / 10;
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. IPSS 2023 projection (Scenes 3, 8)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: IPSS, Population Projections for Japan (2023 revision), medium-fertility/medium-mortality.
// Only points confirmed in this pass are plotted; the dotted line interpolates between them.
// ✓ nippon.com h01664; Xinhua/China Daily; Anadolu; Nature HSSC 2026 (2045 value).
export const ipssProjection = {
  sourceTag: 'IPSS, 2023',
  source:
    'IPSS, Population Projections for Japan (2023 revision): 2021 to 2070, medium variant. https://www.ipss.go.jp/pp-zenkoku/e/zenkoku_e2023/pp2023e_Summary.pdf',
  status: 'verified',
  notes: 'Unit: millions. Draw dotted from the 2025 census point.',
  data: [
    { year: 2045, value: 108.8 }, // ✓
    { year: 2070, value: 86.996 }, // ✓ "about 87M", 69.0% of 2020 level
  ] as YearValue[],
  milestones: [{ year: 2056, value: 100, label: '< 100M · 2056' }] as Milestone[], // ✓ falls below 100M in 2056
} satisfies Dataset<YearValue[]> & { milestones: Milestone[] };

export const ipss2070 = {
  sourceTag: 'IPSS, 2023',
  source: ipssProjection.source,
  status: 'verified',
  data: {
    populationMillions: 86.996, // ✓
    aged65plusMillions: 33.67, // ✓
    share65plus: 0.387, // ✓ on screen as "~39%"
    workingAgeMillions: 45.35, // ✓ ages 15–64
    foreignResidentsMillions: 9.39, // ✓ 10.8% of the population (assumption-driven)
    label65plus: '~39%',
    labelPopulation: '~87M',
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// 4. Population pyramids — 5-year cohorts, thousands (Scene 3)
// ─────────────────────────────────────────────────────────────────────────────

// PLACEHOLDER — ALL FOUR PYRAMIDS. Could not be verified from this environment: the official
// tables are e-Stat / IPSS spreadsheet downloads, and the session's network policy blocks those hosts.
// Hand-shaped, scaled to verified totals (83.2M, 123.6M, 123.0M, 87.0M) with 65+ shares close to
// published values (≈5%, ≈12%, ≈29%, ≈39%) and baby-boom bulges in the right cohorts.
// Replace with:
//   1950, 1990 → Census, population by 5-year age group & sex (e-Stat, toukei=00200521)
//   2025       → 2025 Census final results, 5-year age group × sex (released Sept 2026)
//   2070       → IPSS 2023 medium variant, 5-year age group × sex (pp2023 detailed tables)
// Paste the four CSVs and they slot straight into `buildCohorts(male[], female[])` below.

const AGE_LABELS = [
  '0–4', '5–9', '10–14', '15–19', '20–24', '25–29', '30–34', '35–39', '40–44', '45–49',
  '50–54', '55–59', '60–64', '65–69', '70–74', '75–79', '80–84', '85–89', '90–94', '95+',
] as const;

export const COHORT_COUNT = AGE_LABELS.length;

const buildCohorts = (male: number[], female: number[]): PyramidCohort[] =>
  AGE_LABELS.map((label, i) => ({ ageFrom: i * 5, label, male: male[i], female: female[i] }));

export const pyramids = {
  sourceTag: 'STATISTICS BUREAU / IPSS',
  source:
    'Statistics Bureau of Japan (Population Census 1950, 1990, 2025); IPSS 2023 projections, medium variant (2070).',
  status: 'placeholder',
  notes: 'Unit: thousands. Men left, women right. Index 0 = youngest cohort.',
  data: [
    {
      year: 1950,
      status: 'placeholder', // PLACEHOLDER
      cohorts: buildCohorts(
        [5606, 4751, 4285, 4197, 3731, 2876, 2419, 2371, 2264, 2060, 1797, 1457, 1185, 894, 573, 291, 97, 24, 4, 1],
        [5392, 4615, 4197, 4139, 3789, 3255, 2856, 2614, 2303, 2021, 1768, 1496, 1292, 1059, 777, 466, 204, 58, 12, 2],
      ),
    },
    {
      year: 1990,
      status: 'placeholder', // PLACEHOLDER
      cohorts: buildCohorts(
        [3383, 3898, 4342, 5180, 4463, 4080, 3959, 4615, 5504, 4393, 4019, 3736, 3080, 2171, 1616, 1161, 626, 222, 50, 8],
        [3221, 3706, 4130, 4928, 4312, 4009, 3918, 4564, 5473, 4413, 4100, 3928, 3534, 2868, 2353, 1818, 1141, 505, 151, 30],
      ),
    },
    {
      year: 2025,
      status: 'placeholder', // PLACEHOLDER
      cohorts: buildCohorts(
        [2081, 2405, 2650, 2767, 2994, 3121, 3189, 3484, 3877, 4466, 4858, 4122, 3778, 3484, 3925, 4072, 2552, 1472, 539, 118],
        [1983, 2287, 2522, 2620, 2856, 2964, 3052, 3366, 3759, 4348, 4770, 4102, 3827, 3680, 4367, 4858, 3386, 2453, 1325, 491],
      ),
    },
    {
      year: 2070,
      status: 'placeholder', // PLACEHOLDER
      cohorts: buildCohorts(
        [1551, 1610, 1670, 1765, 1909, 2028, 2088, 2147, 2207, 2326, 2445, 2565, 2744, 2923, 3042, 3101, 2744, 2028, 1074, 418],
        [1479, 1539, 1598, 1694, 1837, 1932, 2004, 2064, 2135, 2255, 2386, 2505, 2696, 2923, 3101, 3280, 3221, 2803, 1968, 1193],
      ),
    },
  ] as PyramidYear[],
} satisfies Dataset<PyramidYear[]>;

/**
 * Cohort index each baby boom occupies in a pyramid year (yellow strips + arrows).
 * Derived from birth years, not data: index = floor(age / 5).
 * Null when the cohort isn't born yet, or is past 100 (boom 1 in 2070) — no strip to track.
 */
export const boomCohortIndex = (pyramidYear: number, boom: 'boom1' | 'boom2'): number | null => {
  const midBirthYear = boom === 'boom1' ? 1948 : 1972.5;
  const age = pyramidYear - midBirthYear;
  if (age < 0 || age >= 100) return null;
  return Math.min(Math.floor(age / 5), COHORT_COUNT - 1);
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Births & deaths 1950–2025 (Scene 4)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: MHLW Vital Statistics (final counts), Japanese nationals in Japan.
// Key years only; the chart interpolates linearly. 1947–1972 exclude Okinawa.
// Years that could not be confirmed (1965, deaths 2010) were dropped rather than kept unverified.
export const birthsSeries = {
  sourceTag: 'MHLW, 2026',
  source: 'MHLW Vital Statistics, live births by year (final). https://www.mhlw.go.jp/toukei/list/81-1a.html',
  status: 'verified',
  data: [
    { year: 1950, value: 2_337_507 }, // ✓ IPSS birth-order table / MHLW
    { year: 1955, value: 1_730_692 }, // ✓ IPSS table
    { year: 1960, value: 1_606_041 }, // ✓ MHLW 第1表
    { year: 1966, value: 1_360_974 }, // ✓ hinoeuma dip
    { year: 1970, value: 1_934_239 }, // ✓
    { year: 1973, value: 2_091_983 }, // ✓ second baby-boom peak
    { year: 1975, value: 1_901_440 }, // ✓
    { year: 1980, value: 1_576_889 }, // ✓
    { year: 1985, value: 1_431_577 }, // ✓
    { year: 1990, value: 1_221_585 }, // ✓
    { year: 1995, value: 1_187_064 }, // ✓
    { year: 2000, value: 1_190_547 }, // ✓
    { year: 2005, value: 1_062_530 }, // ✓
    { year: 2006, value: 1_092_674 }, // ✓
    { year: 2007, value: 1_089_818 }, // ✓
    { year: 2010, value: 1_071_304 }, // ✓ (corrected from 1,071,305)
    { year: 2015, value: 1_005_677 }, // ✓ (corrected from 1,005,721)
    { year: 2016, value: 976_978 }, // ✓ first year < 1M (corrected from 977,242)
    { year: 2017, value: 946_065 }, // ✓ (corrected from 946,146)
    { year: 2018, value: 918_400 }, // ✓
    { year: 2019, value: 865_239 }, // ✓
    { year: 2020, value: 840_835 }, // ✓
    { year: 2021, value: 811_622 }, // ✓
    { year: 2022, value: 770_759 }, // ✓
    { year: 2023, value: 727_288 }, // ✓
    { year: 2024, value: 686_173 }, // ✓
    { year: 2025, value: 671_236 }, // ✓
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

export const deathsSeries = {
  sourceTag: 'MHLW, 2026',
  source: 'MHLW Vital Statistics, deaths by year (final). https://www.mhlw.go.jp/toukei/list/81-1a.html',
  status: 'toVerify',
  data: [
    { year: 1950, value: 904_876 }, // ✓
    { year: 1955, value: 693_523 }, // ✓
    { year: 1960, value: 706_599 }, // ✓
    { year: 1970, value: 712_962 }, // ✓
    { year: 1975, value: 702_275 }, // ✓
    { year: 1980, value: 722_801 }, // ✓
    { year: 1985, value: 752_283 }, // ✓
    { year: 1990, value: 820_305 }, // ✓
    { year: 1995, value: 922_139 }, // ✓
    { year: 2000, value: 961_653 }, // ✓
    { year: 2005, value: 1_083_796 }, // TODO: VERIFY final count (provisional was 1,084,012; > births either way)
    { year: 2006, value: 1_084_450 }, // TODO: VERIFY final count (< 2006 births either way)
    { year: 2007, value: 1_108_334 }, // ✓
    { year: 2015, value: 1_290_444 }, // ✓
    { year: 2018, value: 1_362_470 }, // ✓
    { year: 2019, value: 1_381_093 }, // ✓
    { year: 2020, value: 1_372_755 }, // ✓
    { year: 2021, value: 1_439_856 }, // ✓
    { year: 2022, value: 1_569_050 }, // ✓
    { year: 2023, value: 1_576_016 }, // ✓
    { year: 2024, value: 1_605_378 }, // ✓
    { year: 2025, value: 1_589_489 }, // ✓ first fall in five years
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

/** Milestone flags on the births line (Scene 4). */
export const birthMilestones: Milestone[] = [
  { year: 1975, value: 1_901_440, label: '1975 ↓' },
  { year: 2016, value: 976_978, label: '< 1M · 2016' },
  { year: 2024, value: 686_173, label: '< 700K · 2024' },
];

/**
 * Crossover (Scene 4). Deaths first exceeded births in 2005 (by ~21K), births edged ahead again
 * in 2006, and deaths have exceeded births every year since 2007. At chart scale the 2005–2007
 * lines are within a few pixels, so the hand-drawn "X" sits on 2007 and the Caveat note reads
 * "for good since 2007", matching the narration. The 2005 dip is explained in the video description
 * (see DATA_NOTES.md).
 */
export const crossover = {
  year: 2007,
  label: '2007',
  firstDipYear: 2005,
  footnote: 'for good since 2007',
} as const;

// IPSS 2023 expected births (Japanese nationals, medium variant) — torn-paper "what they expected" line.
// Only two published points found; drawn as a straight dotted segment between them.
// TODO: VERIFY both against IPSS 2023 reference table (日本人人口の参考推計, 出生数):
//   https://www.ipss.go.jp/pp-zenkoku/j/zenkoku2023/pp_zenkoku2023.asp
// Secondary source: ISVD, "Japan's 2025 Births Fall to 671,000 — 15 Years Ahead of Projections"
//   https://isvd.or.jp/en/columns/birthrate-2025-671k-acceleration
export const ipssBirthsForecast = {
  sourceTag: 'IPSS, 2023',
  source: 'IPSS, Population Projections for Japan (2023), medium variant, births of Japanese nationals.',
  status: 'toVerify',
  notes: 'Supports the verified claim that 2025 births (671K) arrived ~15 years ahead of the IPSS projection.',
  data: [
    { year: 2025, value: 749_000 }, // TODO: VERIFY (secondary source)
    { year: 2040, value: 675_000 }, // TODO: VERIFY (secondary source)
  ] as YearValue[],
  labels: { expected: 'what they expected', actual: 'what happened' },
} satisfies Dataset<YearValue[]> & { labels: { expected: string; actual: string } };

// ─────────────────────────────────────────────────────────────────────────────
// 6. Total fertility rate (Scene 5)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: MHLW Vital Statistics, total fertility rate (IPSS Population Statistics tables).
export const fertilitySeries = {
  sourceTag: 'MHLW, 2026',
  source: 'MHLW Vital Statistics, total fertility rate; IPSS Population Statistics (table 4-3).',
  status: 'verified',
  data: [
    { year: 1950, value: 3.65 }, // ✓ IPSS
    { year: 1955, value: 2.37 }, // ✓
    { year: 1960, value: 2.0 }, // ✓
    { year: 1965, value: 2.14 }, // ✓
    { year: 1966, value: 1.58 }, // ✓ hinoeuma
    { year: 1970, value: 2.13 }, // ✓
    { year: 1975, value: 1.91 }, // ✓
    { year: 1980, value: 1.75 }, // ✓
    { year: 1985, value: 1.76 }, // ✓
    { year: 1989, value: 1.57 }, // ✓ the "1.57 shock"
    { year: 1990, value: 1.54 }, // ✓
    { year: 1995, value: 1.42 }, // ✓
    { year: 2000, value: 1.36 }, // ✓
    { year: 2005, value: 1.26 }, // ✓
    { year: 2010, value: 1.39 }, // ✓
    { year: 2015, value: 1.45 }, // ✓
    { year: 2019, value: 1.36 }, // ✓
    { year: 2020, value: 1.33 }, // ✓
    { year: 2021, value: 1.3 }, // ✓
    { year: 2023, value: 1.2 }, // ✓
    { year: 2024, value: 1.15 }, // ✓
    { year: 2025, value: 1.14 }, // ✓ record low
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

/** Replacement-level fertility — demographic convention (ISTAT, UN, etc.), not a measurement. */
export const REPLACEMENT_TFR = 2.1;

// ─────────────────────────────────────────────────────────────────────────────
// 7. Consequences (Scene 6)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: Statistics Bureau, 2023 Housing and Land Survey.
// ✓ nippon.com h01987; JEF Economic Indicators 258.
export const akiya = {
  sourceTag: 'STATISTICS BUREAU, 2024',
  source: 'Statistics Bureau of Japan, 2023 Housing and Land Survey — vacant dwellings (as of 1 Oct 2023).',
  status: 'verified',
  data: {
    vacantHomes: 9_000_000, // ✓ 9.0M, record (+~510K vs 2018)
    vacancyRate: 0.138, // ✓ record 13.8%
    label: '~9,000,000',
  },
} satisfies Dataset<unknown>;

// SOURCE: ratio of people aged 15–64 to people aged 65+.
// 1990 → 1995: the 1990 age split could not be confirmed; 1995 census shares are confirmed.
export const workersPerRetiree = {
  sourceTag: 'STATISTICS BUREAU / IPSS',
  source:
    'Statistics Bureau of Japan (1995 Census; Oct 2024 Population Estimates); IPSS 2023 medium variant (2070). Ratio 15–64 : 65+.',
  status: 'verified',
  notes: '"Workers" = working-age population (15–64), not employed persons.',
  data: [
    { year: 1995, value: 4.8 }, // ✓ 69.4% / 14.5%
    { year: 2024, value: 2.0 }, // ✓ 73.73M / 36.24M = 2.03
    { year: 2070, value: 1.3 }, // ✓ 45.35M / 33.67M = 1.35
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

/** Prefecture focus for the Scene 6 map. 2025 census: Akita −8.1% (largest fall); only Tokyo and Okinawa grew. */
export const mapFocus = {
  sourceTag: 'STATISTICS BUREAU, 2025 CENSUS',
  zoomPrefecture: 'Akita', // ✓ largest decline 2020→2025 (−8.07%)
  zoomPrefectureChange: -0.081,
  glowPrefectures: ['Tokyo', 'Okinawa'], // ✓ the only two that grew
  /** Order in which rural prefectures fade to grey — steepest 2020→25 declines first. */
  fadeOrder: ['Akita', 'Aomori', 'Iwate', 'Yamagata'], // ✓ −8.07, −7.88, −7.02, −7.01
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 8. Responses (Scene 7)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: Immigration Services Agency, foreign residents as of 31 Dec 2025 (released 27 Mar 2026).
// ✓ Jiji via nippon.com / adnkronos. End-June 2026 figure is due ~Oct 2026 — swap in if newer.
export const foreignResidents = {
  sourceTag: 'IMMIGRATION SERVICES AGENCY, 2026',
  source: 'Immigration Services Agency of Japan — foreign residents at end of 2025 (4th consecutive record).',
  status: 'verified',
  data: {
    asOf: 'end of 2025',
    count: 4_125_395, // ✓ first time above 4M
  },
} satisfies Dataset<unknown>;

// SOURCE: IFR (International Federation of Robotics), July 2025: Japan = 38% of global robot production.
// Note: this is industrial robot manufacturing, not care robots specifically — on-screen label says so.
export const robotics = {
  sourceTag: 'IFR, 2025',
  source: 'International Federation of Robotics, statement by IFR president, July 2025. https://ifr.org/',
  status: 'verified',
  data: {
    shareOfGlobalProduction: 0.38, // ✓
    displayValue: 38,
    label: '% OF THE WORLD’S ROBOTS ARE MADE IN JAPAN',
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// 9. Hook comparison & outro comparisons (Scenes 1, 8)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: US Census Bureau, Vintage 2025 estimates (July 1, 2025): Austin passed 1M for the first time.
export const austin = {
  sourceTag: 'US CENSUS BUREAU, 2026',
  source: 'US Census Bureau, city population estimates (Vintage 2025), Austin city, Texas.',
  status: 'verified',
  notes: 'Japan’s natural decline (918,253) ≈ 92% of Austin — "a city the size of Austin" is a fair round comparison.',
  data: {
    population: 1_002_632, // ✓
    asOf: 2025,
  },
} satisfies Dataset<unknown>;

// Outro world map — latest TFR for each country.
export const sameTrajectory = {
  sourceTag: 'KOSTAT · ISTAT · UN WPP',
  source:
    'Ministry of Data and Statistics (Korea), 2025 preliminary; ISTAT, 2025 provisional; UN World Population Prospects 2024 (China — no official TFR published).',
  status: 'verified',
  data: [
    { name: 'Japan', label: 'JAPAN · TFR 1.14', lon: 139.69, lat: 35.69 }, // ✓ MHLW 2025
    { name: 'South Korea', label: 'S. KOREA · TFR 0.80', lon: 126.98, lat: 37.57 }, // ✓ 2025 (up from 0.72 in 2023)
    { name: 'Italy', label: 'ITALY · TFR 1.14', lon: 12.5, lat: 41.9 }, // ✓ 2025 provisional, record low
    { name: 'China', label: 'CHINA · TFR ~1.0', lon: 116.4, lat: 39.9 }, // ✓ UN WPP 2024 est. 1.02 for 2025
  ] as GeoPoint[],
} satisfies Dataset<GeoPoint[]>;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const pyramidTotal = (p: PyramidYear): number =>
  p.cohorts.reduce((sum, c) => sum + c.male + c.female, 0);

export const pyramidShare = (p: PyramidYear, minAge: number): number =>
  p.cohorts.filter((c) => c.ageFrom >= minAge).reduce((s, c) => s + c.male + c.female, 0) / pyramidTotal(p);

/** Linear interpolation of a sparse series at any x (clamped to the ends). */
export const valueAt = (series: YearValue[], year: number): number => {
  if (year <= series[0].year) return series[0].value;
  for (let i = 1; i < series.length; i++) {
    const a = series[i - 1];
    const b = series[i];
    if (year <= b.year) return a.value + ((b.value - a.value) * (year - a.year)) / (b.year - a.year);
  }
  return series[series.length - 1].value;
};

/** Births − deaths on years present in both series. */
export const naturalChangeSeries = (): YearValue[] =>
  birthsSeries.data
    .map(({ year, value }) => {
      const d = deathsSeries.data.find((x) => x.year === year);
      return d ? { year, value: value - d.value } : null;
    })
    .filter((x): x is YearValue => x !== null);

/** All datasets, for a pre-render check that lists any placeholder still in use. */
export const ALL_DATASETS = {
  vital2025, babyBooms, policySpending, totalPopulation, annualEstimates2021to2024, populationPeak,
  ipssProjection, ipss2070, pyramids, birthsSeries, deathsSeries, ipssBirthsForecast, fertilitySeries,
  akiya, workersPerRetiree, foreignResidents, robotics, austin, sameTrajectory,
} as const;

export const hasPlaceholders = (): string[] =>
  Object.entries(ALL_DATASETS)
    .filter(([, d]) => d.status === 'placeholder')
    .map(([k]) => k);
