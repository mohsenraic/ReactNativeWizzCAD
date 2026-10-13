/**
 * japan.ts — every number shown in "Why Japan Is Losing Millions of People".
 *
 * Status of each dataset:
 *   'verified'    → supplied as verified in the production brief (MHLW final 2025 figures, June 2026)
 *   'toVerify'    → real published figures recalled from official series; check against the URL
 *                   in the TODO before lock. Marked `// TODO: VERIFY`.
 *   'placeholder' → NOT real data. Shape/plausibility stand-ins so the animation can be built.
 *                   Must be replaced before render. Marked `// PLACEHOLDER`.
 *
 * Scenes should read `status` and let <SourceTag> print "⚠ PLACEHOLDER" in preview renders
 * whenever a placeholder dataset is on screen (see `hasPlaceholders()` at the bottom).
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
// 1. Headline vital statistics, 2025 (Scene 1, Scene 4, Scene 5)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: MHLW, Vital Statistics, final 2025 figures (published June 2026). Japanese nationals in Japan.
export const vital2025 = {
  sourceTag: 'MHLW, 2026',
  source:
    'Ministry of Health, Labour and Welfare — Vital Statistics, final figures for 2025 (June 2026). https://www.mhlw.go.jp/toukei/list/81-1a.html',
  status: 'verified',
  notes: 'Japanese nationals in Japan. Natural change only (births − deaths); excludes migration.',
  data: {
    births: 671_236,
    births2024: 686_173,
    deaths: 1_589_489,
    deaths2024: 1_605_378,
    naturalChange: -918_253, // = 671,236 − 1,589,489
    tfr: 1.14,
    tfr2024: 1.15,
    tfrTokyo: 0.96, // lowest prefecture
    tfrOkinawa: 1.52, // highest prefecture
    /** Deaths have exceeded births every year since 2007 → 2007…2025 inclusive. */
    consecutiveYearsOfDecline: 19,
    naturalDeclineSince: 2007,
  },
} satisfies Dataset<unknown>;

// SOURCE: MHLW (brief). Used for Scene 3 baby-boom callouts.
export const babyBooms = {
  sourceTag: 'MHLW',
  source: 'MHLW Vital Statistics, historical births. https://www.mhlw.go.jp/toukei/list/81-1a.html',
  status: 'verified',
  data: [
    { id: 'boom1', years: [1947, 1949] as const, label: '~2.5M births / year', birthsPerYear: 2_500_000 },
    { id: 'boom2', years: [1971, 1974] as const, label: '>2M births / year', birthsPerYear: 2_000_000 },
  ],
} satisfies Dataset<unknown>;

// SOURCE: Children and Families Agency — "Acceleration Plan" for children/child-rearing (brief).
export const policySpending = {
  sourceTag: 'CFA, 2026',
  source:
    'Children and Families Agency (こども家庭庁), Children’s Future Strategy / Acceleration Plan, ~¥3.6 trillion per year. https://www.cfa.go.jp/',
  status: 'verified',
  data: {
    yenPerYear: 3_600_000_000_000,
    /** Display unit for the counter: counts 0 → 3.6, suffix "trillion yen / year". */
    displayValue: 3.6,
    displaySuffix: 'TRILLION ¥ / YEAR',
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// 2. Total population 1950 → latest (Scene 2, Scene 8)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: Statistics Bureau of Japan — Population Estimates (Oct 1 each year) and Census; Historical Statistics of Japan.
// TODO: VERIFY every point against https://www.stat.go.jp/english/data/chouki/02.html
//       and https://www.stat.go.jp/english/data/jinsui/index.html
export const totalPopulation = {
  sourceTag: 'STATISTICS BUREAU OF JAPAN',
  source:
    'Statistics Bureau of Japan, Population Estimates & Census, total population incl. foreign residents, as of Oct 1. https://www.stat.go.jp/english/data/jinsui/index.html',
  status: 'toVerify',
  notes:
    '1950–1970 values exclude Okinawa (returned 1972), which explains a ~1M step around 1972. Unit: millions.',
  data: [
    { year: 1950, value: 83.2 }, // TODO: VERIFY (census incl. Okinawa = 84.1M)
    { year: 1955, value: 89.276 }, // TODO: VERIFY
    { year: 1960, value: 93.419 }, // TODO: VERIFY
    { year: 1965, value: 98.275 }, // TODO: VERIFY
    { year: 1970, value: 103.72 }, // TODO: VERIFY
    { year: 1975, value: 111.94 }, // TODO: VERIFY
    { year: 1980, value: 117.06 }, // TODO: VERIFY
    { year: 1984, value: 120.305 }, // TODO: VERIFY — first year above 120M ("by the mid-1980s")
    { year: 1985, value: 121.049 }, // TODO: VERIFY
    { year: 1990, value: 123.611 }, // TODO: VERIFY
    { year: 1995, value: 125.57 }, // TODO: VERIFY
    { year: 2000, value: 126.926 }, // TODO: VERIFY
    { year: 2005, value: 127.768 }, // TODO: VERIFY
    { year: 2008, value: 128.084 }, // TODO: VERIFY — peak (estimate)
    { year: 2010, value: 128.057 }, // TODO: VERIFY — census
    { year: 2015, value: 127.095 }, // TODO: VERIFY
    { year: 2020, value: 126.146 }, // TODO: VERIFY
    { year: 2021, value: 125.502 }, // TODO: VERIFY
    { year: 2022, value: 124.947 }, // TODO: VERIFY
    { year: 2023, value: 124.352 }, // TODO: VERIFY
    { year: 2024, value: 123.802 }, // TODO: VERIFY — latest figure I can source with confidence
    // PLACEHOLDER: Oct 1, 2025 estimate (released ~April 2026) not filled — add it here once checked.
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

export const populationPeak = {
  sourceTag: 'STATISTICS BUREAU OF JAPAN',
  source: totalPopulation.source,
  status: 'toVerify',
  data: {
    year: 2008, // TODO: VERIFY
    millions: 128.084, // TODO: VERIFY
    annotation: 'peak: ~128M', // Caveat handwriting in Scene 2
  },
} satisfies Dataset<unknown>;

/** "−X million" label for the hatched decline area (Scene 2). Derived — no new numbers. */
export const lossFromPeakMillions = (): number => {
  const last = totalPopulation.data[totalPopulation.data.length - 1];
  return Math.round((populationPeak.data.millions - last.value) * 10) / 10; // 128.084 − 123.802 ≈ 4.3
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. IPSS 2023 projection (Scene 3, Scene 8)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: National Institute of Population and Social Security Research (IPSS),
//         Population Projections for Japan (2023), medium-fertility / medium-mortality variant.
// TODO: VERIFY against https://www.ipss.go.jp/pp-zenkoku/e/zenkoku_e2023/pp2023e_Summary.pdf
export const ipssProjection = {
  sourceTag: 'IPSS, 2023',
  source:
    'IPSS, Population Projections for Japan (2023 revision), medium variant, total population incl. foreign residents. https://www.ipss.go.jp/pp-zenkoku/e/zenkoku_e2023/pp2023e_Summary.pdf',
  status: 'toVerify',
  notes: 'Unit: millions. Plot dotted, starting from the last observed point.',
  data: [
    { year: 2030, value: 120.116 }, // TODO: VERIFY
    { year: 2040, value: 112.837 }, // TODO: VERIFY
    { year: 2050, value: 104.686 }, // TODO: VERIFY
    { year: 2060, value: 96.148 }, // TODO: VERIFY
    { year: 2070, value: 86.996 }, // TODO: VERIFY — "~87M" endpoint circled in Scene 8
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

export const ipss2070 = {
  sourceTag: 'IPSS, 2023',
  source: ipssProjection.source,
  status: 'toVerify',
  data: {
    populationMillions: 86.996, // TODO: VERIFY
    share65plus: 0.387, // TODO: VERIFY — on screen as "~39%"
    label65plus: '~39%',
    labelPopulation: '~87M',
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// 4. Population pyramids — 5-year cohorts, thousands (Scene 3)
// ─────────────────────────────────────────────────────────────────────────────

// PLACEHOLDER — ALL FOUR PYRAMIDS.
// These are hand-shaped approximations, scaled so each year sums to its sourced total
// (1950: 83.2M, 1990: 123.6M, 2025: 123.8M = 2024 level, 2070: 87.0M) and so 65+ shares are
// close to published values (≈5%, ≈12%, ≈30%, ≈39%). Baby-boom bulges sit in the right cohorts.
// They are good enough to build and time the morph, NOT to publish.
// Replace with:
//   1950, 1990 → Census by 5-year age group & sex, e-Stat:
//                https://www.e-stat.go.jp/en/stat-search/files?toukei=00200521
//   2025       → Population Estimates, Oct 1 2025, Table 1 (age group × sex):
//                https://www.stat.go.jp/english/data/jinsui/index.html
//   2070       → IPSS 2023 medium variant, Table 1-9 (age group × sex):
//                https://www.ipss.go.jp/pp-zenkoku/e/zenkoku_e2023/pp2023e_Summary.pdf

const AGE_LABELS = [
  '0–4', '5–9', '10–14', '15–19', '20–24', '25–29', '30–34', '35–39', '40–44', '45–49',
  '50–54', '55–59', '60–64', '65–69', '70–74', '75–79', '80–84', '85–89', '90–94', '95+',
] as const;

const buildCohorts = (male: number[], female: number[]): PyramidCohort[] =>
  AGE_LABELS.map((label, i) => ({ ageFrom: i * 5, label, male: male[i], female: female[i] }));

export const pyramids = {
  sourceTag: 'STATISTICS BUREAU / IPSS',
  source:
    'Statistics Bureau of Japan (Census, Population Estimates); IPSS 2023 projections (medium variant) for 2070.',
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
        [2095, 2421, 2668, 2786, 3014, 3142, 3211, 3508, 3903, 4496, 4891, 4150, 3804, 3508, 3952, 4100, 2569, 1482, 543, 119],
        [1996, 2302, 2539, 2638, 2875, 2984, 3073, 3389, 3784, 4377, 4802, 4130, 3853, 3705, 4397, 4891, 3409, 2470, 1334, 494],
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
 * Which cohort index each baby boom occupies in each pyramid year (for yellow strips + arrows).
 * Derived from birth years, not data: index = floor((year − birthYear) / 5).
 * Returns null when the cohort isn't born yet, or is past 100 (boom 1 in 2070) — no strip to track.
 */
export const boomCohortIndex = (pyramidYear: number, boom: 'boom1' | 'boom2'): number | null => {
  const midBirthYear = boom === 'boom1' ? 1948 : 1972.5;
  const age = pyramidYear - midBirthYear;
  if (age < 0 || age >= 100) return null;
  return Math.min(Math.floor(age / 5), AGE_LABELS.length - 1);
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Births & deaths 1950–2025 (Scene 4)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: MHLW Vital Statistics, annual births and deaths, Japanese nationals in Japan.
// 2024 and 2025 are verified (brief). Earlier points: TODO: VERIFY against
// https://www.e-stat.go.jp/en/stat-search/files?toukei=00450011 (Vital Statistics, "Trends in vital statistics")
// Note: key years only — the chart interpolates. Pull the full annual series from e-Stat before lock.
export const birthsSeries = {
  sourceTag: 'MHLW, 2026',
  source: 'MHLW Vital Statistics, live births by year. https://www.mhlw.go.jp/toukei/list/81-1a.html',
  status: 'toVerify',
  data: [
    { year: 1950, value: 2_337_507 }, // TODO: VERIFY
    { year: 1955, value: 1_730_692 }, // TODO: VERIFY
    { year: 1960, value: 1_606_041 }, // TODO: VERIFY
    { year: 1965, value: 1_823_697 }, // TODO: VERIFY
    { year: 1966, value: 1_360_974 }, // TODO: VERIFY — hinoeuma dip (keep or drop for readability)
    { year: 1970, value: 1_934_239 }, // TODO: VERIFY
    { year: 1973, value: 2_091_983 }, // TODO: VERIFY — second baby-boom peak
    { year: 1975, value: 1_901_440 }, // TODO: VERIFY
    { year: 1980, value: 1_576_889 }, // TODO: VERIFY
    { year: 1985, value: 1_431_577 }, // TODO: VERIFY
    { year: 1990, value: 1_221_585 }, // TODO: VERIFY
    { year: 1995, value: 1_187_064 }, // TODO: VERIFY
    { year: 2000, value: 1_190_547 }, // TODO: VERIFY
    { year: 2005, value: 1_062_530 }, // TODO: VERIFY
    { year: 2006, value: 1_092_674 }, // TODO: VERIFY
    { year: 2007, value: 1_089_818 }, // TODO: VERIFY
    { year: 2010, value: 1_071_305 }, // TODO: VERIFY
    { year: 2015, value: 1_005_721 }, // TODO: VERIFY
    { year: 2016, value: 977_242 }, // TODO: VERIFY — first year < 1M (verified fact; check exact count)
    { year: 2017, value: 946_146 }, // TODO: VERIFY
    { year: 2018, value: 918_400 }, // TODO: VERIFY
    { year: 2019, value: 865_239 }, // TODO: VERIFY
    { year: 2020, value: 840_835 }, // TODO: VERIFY
    { year: 2021, value: 811_622 }, // TODO: VERIFY
    { year: 2022, value: 770_759 }, // TODO: VERIFY
    { year: 2023, value: 727_288 }, // TODO: VERIFY
    { year: 2024, value: 686_173 }, // verified (brief)
    { year: 2025, value: 671_236 }, // verified (brief)
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

export const deathsSeries = {
  sourceTag: 'MHLW, 2026',
  source: 'MHLW Vital Statistics, deaths by year. https://www.mhlw.go.jp/toukei/list/81-1a.html',
  status: 'toVerify',
  data: [
    { year: 1950, value: 904_876 }, // TODO: VERIFY
    { year: 1955, value: 693_523 }, // TODO: VERIFY
    { year: 1960, value: 706_599 }, // TODO: VERIFY
    { year: 1965, value: 700_438 }, // TODO: VERIFY
    { year: 1970, value: 712_962 }, // TODO: VERIFY
    { year: 1975, value: 702_275 }, // TODO: VERIFY
    { year: 1980, value: 722_801 }, // TODO: VERIFY
    { year: 1985, value: 752_283 }, // TODO: VERIFY
    { year: 1990, value: 820_305 }, // TODO: VERIFY
    { year: 1995, value: 922_139 }, // TODO: VERIFY
    { year: 2000, value: 961_653 }, // TODO: VERIFY
    { year: 2005, value: 1_083_796 }, // TODO: VERIFY — NB: exceeds 2005 births (see editorial note)
    { year: 2006, value: 1_084_450 }, // TODO: VERIFY
    { year: 2007, value: 1_108_334 }, // TODO: VERIFY
    { year: 2010, value: 1_197_014 }, // TODO: VERIFY
    { year: 2015, value: 1_290_444 }, // TODO: VERIFY
    { year: 2020, value: 1_372_755 }, // TODO: VERIFY
    { year: 2021, value: 1_439_856 }, // TODO: VERIFY
    { year: 2022, value: 1_569_050 }, // TODO: VERIFY
    { year: 2023, value: 1_576_016 }, // TODO: VERIFY
    { year: 2024, value: 1_605_378 }, // verified (brief)
    { year: 2025, value: 1_589_489 }, // verified (brief)
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

/** Milestone flags on the births line (Scene 4). Values reference the series above. */
export const birthMilestones: Milestone[] = [
  { year: 1975, value: 1_901_440, label: '1975 ↓' }, // TODO: VERIFY value (follows birthsSeries)
  { year: 2016, value: 977_242, label: '< 1M · 2016' }, // TODO: VERIFY value
  { year: 2024, value: 686_173, label: '< 700K · 2024' },
];

/** Crossover marked with the hand-drawn "X" (Scene 4). */
export const crossover = { year: 2007, label: '2007' } as const;

// IPSS 2023 expected births (medium variant, Japanese nationals) — torn-paper "what they expected" line.
// PLACEHOLDER: shape only. The brief's verified claim is that IPSS did not expect births this low
// (≈671K) until the 2040s; these points are built to cross 671K in the early 2040s and nothing more.
// Replace with IPSS 2023 reference table "Births (Japanese), medium variant":
//   https://www.ipss.go.jp/pp-zenkoku/j/zenkoku2023/pp_zenkoku2023.asp
export const ipssBirthsForecast = {
  sourceTag: 'IPSS, 2023',
  source: 'IPSS, Population Projections for Japan (2023), medium variant, births of Japanese nationals.',
  status: 'placeholder',
  data: [
    { year: 2023, value: 760_000 }, // PLACEHOLDER
    { year: 2025, value: 749_000 }, // PLACEHOLDER
    { year: 2030, value: 729_000 }, // PLACEHOLDER
    { year: 2035, value: 706_000 }, // PLACEHOLDER
    { year: 2040, value: 680_000 }, // PLACEHOLDER
    { year: 2043, value: 668_000 }, // PLACEHOLDER
  ] as YearValue[],
  labels: { expected: 'what they expected', actual: 'what happened' },
} satisfies Dataset<YearValue[]> & { labels: { expected: string; actual: string } };

// ─────────────────────────────────────────────────────────────────────────────
// 6. Total fertility rate (Scene 5)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: MHLW Vital Statistics, total fertility rate. 2024–2025 verified (brief).
// TODO: VERIFY 1950–2023 against https://www.mhlw.go.jp/toukei/list/81-1a.html
//       (or IPSS Population Statistics table 4-3: https://www.ipss.go.jp/syoushika/tohkei/Popular/Popular2025.asp)
export const fertilitySeries = {
  sourceTag: 'MHLW, 2026',
  source: 'MHLW Vital Statistics, total fertility rate (TFR).',
  status: 'toVerify',
  data: [
    { year: 1950, value: 3.65 }, // TODO: VERIFY
    { year: 1955, value: 2.37 }, // TODO: VERIFY
    { year: 1960, value: 2.0 }, // TODO: VERIFY
    { year: 1965, value: 2.14 }, // TODO: VERIFY
    { year: 1966, value: 1.58 }, // TODO: VERIFY — hinoeuma
    { year: 1970, value: 2.13 }, // TODO: VERIFY
    { year: 1975, value: 1.91 }, // TODO: VERIFY — first full year clearly below 2.1 after 1974
    { year: 1980, value: 1.75 }, // TODO: VERIFY
    { year: 1985, value: 1.76 }, // TODO: VERIFY
    { year: 1990, value: 1.54 }, // TODO: VERIFY
    { year: 1995, value: 1.42 }, // TODO: VERIFY
    { year: 2000, value: 1.36 }, // TODO: VERIFY
    { year: 2005, value: 1.26 }, // TODO: VERIFY — previous record low
    { year: 2010, value: 1.39 }, // TODO: VERIFY
    { year: 2015, value: 1.45 }, // TODO: VERIFY
    { year: 2020, value: 1.33 }, // TODO: VERIFY
    { year: 2021, value: 1.3 }, // TODO: VERIFY
    { year: 2022, value: 1.26 }, // TODO: VERIFY
    { year: 2023, value: 1.2 }, // TODO: VERIFY
    { year: 2024, value: 1.15 }, // verified (brief)
    { year: 2025, value: 1.14 }, // verified (brief)
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

/** Replacement-level fertility — demographic convention, not a Japan-specific measurement. */
export const REPLACEMENT_TFR = 2.1;

// ─────────────────────────────────────────────────────────────────────────────
// 7. Consequences (Scene 6)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: Statistics Bureau, 2023 Housing and Land Survey (preliminary/final results, 2024).
// TODO: VERIFY https://www.stat.go.jp/english/data/jyutaku/index.html
export const akiya = {
  sourceTag: 'STATISTICS BUREAU, 2024',
  source: 'Statistics Bureau of Japan, 2023 Housing and Land Survey — vacant dwellings.',
  status: 'toVerify',
  data: {
    vacantHomes: 9_000_000, // TODO: VERIFY — reported as ~9.0M (record), vacancy rate ~13.8%
    vacancyRate: 0.138, // TODO: VERIFY
    label: '~9,000,000',
  },
} satisfies Dataset<unknown>;

// SOURCE: Ratio of people aged 15–64 to people aged 65+.
// 1990 & latest from Statistics Bureau population estimates; 2070 from IPSS 2023 medium variant.
// TODO: VERIFY — recompute as (pop 15–64) / (pop 65+) from:
//   https://www.stat.go.jp/english/data/jinsui/index.html  and  IPSS 2023 summary table.
export const workersPerRetiree = {
  sourceTag: 'STATISTICS BUREAU / IPSS',
  source: 'Statistics Bureau of Japan (1990, 2024); IPSS 2023 medium variant (2070). Ratio 15–64 : 65+.',
  status: 'toVerify',
  notes: '"Workers" = working-age population (15–64), not employed persons. Stick figures round to nearest 0.5.',
  data: [
    { year: 1990, value: 5.8 }, // TODO: VERIFY (≈ 85.9M / 14.9M)
    { year: 2024, value: 2.0 }, // TODO: VERIFY (≈ 73.7M / 36.2M)
    { year: 2070, value: 1.3 }, // TODO: VERIFY (≈ 45.4M / 33.7M)
  ] as YearValue[],
} satisfies Dataset<YearValue[]>;

// ─────────────────────────────────────────────────────────────────────────────
// 8. Responses (Scene 7)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: Immigration Services Agency of Japan, foreign residents statistics.
// TODO: VERIFY and update to the newest release (end-2025 figures published ~March 2026; mid-2026 ~Oct 2026):
//   https://www.moj.go.jp/isa/policies/statistics/toukei_ichiran_touroku.html
export const foreignResidents = {
  sourceTag: 'IMMIGRATION SERVICES AGENCY',
  source: 'Immigration Services Agency of Japan — number of foreign residents (record high).',
  status: 'toVerify',
  data: {
    asOf: 'end of 2024', // TODO: VERIFY — likely superseded by a newer record
    count: 3_768_977, // TODO: VERIFY
  },
} satisfies Dataset<unknown>;

// Robotics card: needs ONE defensible number about care / service robotics in Japan.
// PLACEHOLDER — no figure filled. Candidates to check:
//   - IFR World Robotics (operational industrial robot stock in Japan): https://ifr.org/worldrobotics/
//   - MHLW/METI nursing-care robot subsidy programme (number of facilities / units subsidised)
// Keep the narration claim ("leads the world in care robotics") aligned with whatever metric is chosen.
export const robotics = {
  sourceTag: 'TBD',
  source: 'TBD — see TODO above.',
  status: 'placeholder',
  data: {
    value: 0, // PLACEHOLDER
    label: 'PLACEHOLDER', // PLACEHOLDER
  },
} satisfies Dataset<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// 9. Hook comparison & outro comparisons (Scene 1, Scene 8)
// ─────────────────────────────────────────────────────────────────────────────

// SOURCE: US Census Bureau, Vintage population estimates, Austin city, Texas.
// TODO: VERIFY and use the latest vintage: https://www.census.gov/quickfacts/austincitytexas
export const austin = {
  sourceTag: 'US CENSUS BUREAU',
  source: 'US Census Bureau, city population estimates, Austin, Texas.',
  status: 'toVerify',
  notes: 'Comparison is approximate: Japan’s natural decline (≈918K) is ~94% of Austin (≈980K).',
  data: {
    population: 979_882, // TODO: VERIFY — July 1, 2023 estimate; 2020 census = 961,855
    asOf: 2023,
  },
} satisfies Dataset<unknown>;

// Outro world map. Labels show latest TFR for each country.
// TODO: VERIFY each: KOSTAT (https://kostat.go.kr), ISTAT (https://www.istat.it), NBS China / UN WPP 2024.
export const sameTrajectory = {
  sourceTag: 'KOSTAT · ISTAT · UN WPP',
  source: 'KOSTAT (South Korea), ISTAT (Italy), UN World Population Prospects 2024 (China).',
  status: 'toVerify',
  data: [
    { name: 'Japan', label: 'JAPAN · TFR 1.14', lon: 139.69, lat: 35.69 },
    { name: 'South Korea', label: 'S. KOREA · TFR 0.75', lon: 126.98, lat: 37.57 }, // TODO: VERIFY (2024)
    { name: 'Italy', label: 'ITALY · TFR 1.18', lon: 12.5, lat: 41.9 }, // TODO: VERIFY (2024)
    { name: 'China', label: 'CHINA · TFR ~1.0', lon: 116.4, lat: 39.9 }, // TODO: VERIFY (UN WPP estimate)
  ] as GeoPoint[],
} satisfies Dataset<GeoPoint[]>;

// ─────────────────────────────────────────────────────────────────────────────
// 10. Map data (Scene 6) — which prefectures fade vs. glow
// ─────────────────────────────────────────────────────────────────────────────

// Editorial grouping for the animation, not a statistic. Highlighted rural prefecture for the zoom:
// Akita has had Japan's fastest population decline in recent estimates — TODO: VERIFY
// https://www.stat.go.jp/english/data/jinsui/index.html (prefectural rate of change table).
export const mapFocus = {
  zoomPrefecture: 'Akita', // TODO: VERIFY choice
  glowPrefectures: ['Tokyo'],
  /** Order in which rural prefectures fade to grey. Editorial. */
  fadeOrder: ['Akita', 'Aomori', 'Iwate', 'Yamagata', 'Kochi', 'Shimane', 'Tottori', 'Tokushima', 'Wakayama', 'Nagasaki'],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const pyramidTotal = (p: PyramidYear): number =>
  p.cohorts.reduce((sum, c) => sum + c.male + c.female, 0);

export const pyramidShare = (p: PyramidYear, minAge: number): number =>
  p.cohorts.filter((c) => c.ageFrom >= minAge).reduce((s, c) => s + c.male + c.female, 0) / pyramidTotal(p);

export const naturalChangeSeries = (): YearValue[] =>
  birthsSeries.data
    .map(({ year, value }) => {
      const d = deathsSeries.data.find((x) => x.year === year);
      return d ? { year, value: value - d.value } : null;
    })
    .filter((x): x is YearValue => x !== null);

/** All datasets, for a pre-render check that prints any placeholder still in use. */
export const ALL_DATASETS = {
  vital2025, babyBooms, policySpending, totalPopulation, populationPeak, ipssProjection, ipss2070,
  pyramids, birthsSeries, deathsSeries, ipssBirthsForecast, fertilitySeries, akiya, workersPerRetiree,
  foreignResidents, robotics, austin, sameTrajectory,
} as const;

export const hasPlaceholders = (): string[] =>
  Object.entries(ALL_DATASETS)
    .filter(([, d]) => d.status === 'placeholder')
    .map(([k]) => k);
