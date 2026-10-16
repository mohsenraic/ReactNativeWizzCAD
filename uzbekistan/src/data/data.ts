/**
 * data.ts — every number shown in the Uzbekistan video, typed and sourced.
 *
 * Conventions (shared/data/types.ts):
 *   status 'verified'    every value confirmed against the cited source(s)
 *   status 'toVerify'    values found in secondary sources only; each open item is tagged // TODO: VERIFY
 *   status 'placeholder' stand-in values → <SourceTag> prints "⚠ PLACEHOLDER DATA" in renders
 *
 * Fact-check pass: 14 Oct 2026. Primary sources were preferred (World Bank API, UNESCO WHC/ICH pages, stat.uz,
 * gov.uz); where only secondary sources exist, at least two independent ones agree. Notes record every
 * disagreement found and which value was chosen.
 *
 * Never type a number into a scene: import it from here so a correction lands everywhere at once.
 * Derived numbers (shares, % changes) are computed below from the source values, never typed by hand.
 */
import type { Dataset, YearValue } from '../../../shared/data/types';

// ─────────────────────────────────────────────────────────────────────────────
// Scene 2 — the boom
// ─────────────────────────────────────────────────────────────────────────────

/** 2025 headline — preliminary figures, National Statistics Committee, January 2026. */
export const arrivals2025: Dataset<{ totalM: number; increaseM: number; increasePct: number; preliminary: true }> = {
  sourceTag: 'NATIONAL STATISTICS COMMITTEE OF UZBEKISTAN, 2026 (PRELIM.)',
  source:
    'National Statistics Committee, "11.7 million tourists visited Uzbekistan" (Jan 2026) — https://stat.uz/oz/matbuot-markazi-2/qo-mita-yangiliklar-2/66311-11-7-million-touristsvisited- ; Kun.uz, 20 Jan 2026 — https://kun.uz/en/news/2026/01/20/foreign-tourist-arrivals-to-uzbekistan-jump-by-nearly-47-percent-in-2025',
  status: 'verified',
  notes:
    'Counts trips by foreign citizens "for tourism purposes", incl. visiting relatives (67.3%), leisure (16.5%), business (11.3%). Preliminary.',
  data: { totalM: 11.7, increaseM: 3.7, increasePct: 46.8, preliminary: true },
};

/**
 * Annual foreign arrivals, millions. Bar chart in Scenes 2 and 9.
 *   2010–2019  World Bank WDI ST.INT.ARVL (UN Tourism data) — read from the World Bank API, Oct 2026.
 *   2020–2023  UN Tourism series (worlddata.info), cross-checked with stat.uz / press: 2021 1.9M, 2022 5.2M, 2023 6.6M.
 *   2024       8.0 = 11.7 − 3.7: the base the official 2025 release compares against.
 *   2025       arrivals2025.
 */
export const arrivalsSeries: Dataset<YearValue[]> = {
  sourceTag: 'WORLD BANK / UN TOURISM; NATIONAL STATISTICS COMMITTEE OF UZBEKISTAN',
  source:
    'World Bank API — https://api.worldbank.org/v2/country/UZB/indicator/ST.INT.ARVL (2010–2019); UN Tourism via https://www.worlddata.info/asia/uzbekistan/tourism.php (2020–2023); stat.uz 2022 release (5.2M) — https://kun.uz/en/news/2023/01/18/more-than-52-million-tourists-visited-uzbekistan-in-2022 ; 2024–2025: stat.uz Jan 2026 release.',
  status: 'verified',
  notes:
    'Two definitions are stitched (UN Tourism "arrivals" to 2023, national "entered for tourism purposes" from 2024); they agree where both exist (2022: 5.23 vs 5.2; 2023: 6.63 vs 6.6). 2024 was first published as 8.2M (Feb 2025); the Jan 2026 release implies 8.0M — 8.0 is used so the +3.7M / +46.8% shown on screen stays consistent.',
  data: [
    { year: 2010, value: 0.975 },
    { year: 2011, value: 1.393 },
    { year: 2012, value: 1.895 },
    { year: 2013, value: 1.969 },
    { year: 2014, value: 1.862 },
    { year: 2015, value: 1.918 },
    { year: 2016, value: 2.027 }, // narration: "a decade ago … only around two million" ✓
    { year: 2017, value: 2.69 },
    { year: 2018, value: 5.346 },
    { year: 2019, value: 6.749 },
    { year: 2020, value: 1.504 },
    { year: 2021, value: 1.881 },
    { year: 2022, value: 5.233 },
    { year: 2023, value: 6.626 },
    { year: 2024, value: 8.0 },
    { year: 2025, value: 11.7 },
  ],
};

/** Bar to circle when the narration says "a decade ago". */
export const DECADE_AGO_YEAR = 2016;

/** Top origin countries 2025 (millions of trips). ISO 3166-1 numeric ids match <WorldMap>. */
export const topOrigins2025: Dataset<Array<{ country: string; iso: string; valueM: number }>> = {
  sourceTag: 'NATIONAL STATISTICS COMMITTEE OF UZBEKISTAN, 2026 (PRELIM.)',
  source:
    'National Statistics Committee, Jan 2026; country detail: bne IntelliNews — https://www.intellinews.com/uzbekistan-s-foreign-arrivals-jump-sixfold-from-1-9mn-in-2021-to-11-7mn-in-2025-430648/ ; Kun.uz (20 Jan 2026).',
  status: 'verified',
  notes: 'Headline rounding: Kyrgyzstan 3.3M, Tajikistan 2.7M, Kazakhstan 2.7M. All neighbouring countries: 9.5M (81.5%).',
  data: [
    { country: 'Kyrgyzstan', iso: '417', valueM: 3.32 },
    { country: 'Tajikistan', iso: '762', valueM: 2.7 },
    { country: 'Kazakhstan', iso: '398', valueM: 2.67 },
  ],
};

/** Share of all 2025 arrivals from the top 3 (≈ 74%, "about three out of every four"). Computed, not typed. */
export const TOP3_SHARE_PCT = Math.round(
  (topOrigins2025.data.reduce((n, d) => n + d.valueM, 0) / arrivals2025.data.totalM) * 100,
); // = 74

/** Waffle chart: one square per 1% of 2025 arrivals. */
export const waffle2025 = {
  total: 100,
  categories: topOrigins2025.data.map((d) => ({
    id: d.country.toLowerCase(),
    label: d.country.toUpperCase(),
    squares: Math.round((d.valueM / arrivals2025.data.totalM) * 100), // 28 + 23 + 23 = 74
  })),
};

/** Regions the far-away visitors fly in from (Scene 2 plane icons). Illustrative origins — no values shown. */
export const longHaulOrigins = [
  { id: 'europe', label: 'EUROPE', lonLat: [10, 50] as [number, number] },
  { id: 'eastAsia', label: 'EAST ASIA', lonLat: [125, 36] as [number, number] },
  { id: 'middleEast', label: 'MIDDLE EAST', lonLat: [46, 25] as [number, number] },
  { id: 'americas', label: 'AMERICAS', lonLat: [-95, 40] as [number, number] },
];

/** April 2025 — first month ever above one million foreign tourists. */
export const monthlyRecord: Dataset<{ month: string; year: number; atLeast: number }> = {
  sourceTag: 'TOURISM COMMITTEE OF UZBEKISTAN, MAY 2025',
  source: 'Tourism Committee (Uzbektourism), 7 May 2025 — https://gov.uz/en/uzbektourism/news/view/52257',
  status: 'verified',
  notes: 'Only "more than 1 million" was published: show "1,000,000+", never an exact figure.',
  data: { month: 'APRIL', year: 2025, atLeast: 1_000_000 },
};

/** "And 2026 started even faster." */
export const start2026: Dataset<{ period: string; arrivals: number; increasePct: number }> = {
  sourceTag: 'NATIONAL STATISTICS COMMITTEE OF UZBEKISTAN, MAR 2026',
  source:
    'stat.uz — https://stat.uz/en/press-center/news-of-committee/67400-2-ojda-zbekistonga-1-7-mlndan-orti-turist-kelgan-4 ; Uzbektourism — https://gov.uz/en/uzbektourism/news/view/145218',
  status: 'verified',
  data: { period: 'JAN–FEB 2026', arrivals: 1_776_336, increasePct: 33 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 3 — the middle of the map
// ─────────────────────────────────────────────────────────────────────────────

export const geography: Dataset<{ doublyLandlockedCountries: string[]; bordersToOcean: number }> = {
  sourceTag: 'WORLDATLAS; BRITANNICA',
  source:
    'WorldAtlas, "The World\'s Two Double Landlocked Countries" — https://www.worldatlas.com/articles/doubly-landlocked-countries.html ; Wharton WRDS Classroom; Wikipedia "Landlocked country".',
  status: 'verified',
  notes: 'All five neighbours (KAZ, KGZ, TJK, AFG, TKM) are landlocked; the Caspian counts as a lake. Liechtenstein is the other one.',
  data: { doublyLandlockedCountries: ['Uzbekistan', 'Liechtenstein'], bordersToOcean: 2 },
};

/**
 * Silk Road goods and city nodes. Routes are stylized in <SilkRoadMap>: they show the network,
 * not a surveyed track — the SourceTag says "ROUTES SIMPLIFIED".
 */
export const silkRoad = {
  goods: ['silk', 'spices', 'paper', 'glass', 'horses'] as const,
  ends: {
    east: { name: "CHANG'AN (XI'AN)", lonLat: [108.9, 34.3] as [number, number] },
    west: { name: 'MEDITERRANEAN', lonLat: [35.5, 33.9] as [number, number] },
  },
  cities: [
    { id: 'samarkand', name: 'SAMARKAND', lonLat: [66.97, 39.65] as [number, number] },
    { id: 'bukhara', name: 'BUKHARA', lonLat: [64.42, 39.77] as [number, number] },
    { id: 'khiva', name: 'KHIVA', lonLat: [60.36, 41.38] as [number, number] },
  ],
  tashkent: { name: 'TASHKENT', lonLat: [69.24, 41.31] as [number, number] },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 1 — cold open
// ─────────────────────────────────────────────────────────────────────────────

/**
 * "Blue domes that have stood for six centuries" (Gur-e-Amir, 1403–04) and "markets … before the Roman Empire
 * even existed" (Samarkand founded 7th c. BC; the Roman Empire dates from Augustus, 27 BC).
 */
export const coldOpen: Dataset<{ gurEmirBuilt: number; domeAgeYears: number; romanEmpireFrom: number; samarkandFromCentury: number }> = {
  sourceTag: 'UNESCO WHC 603; BRITANNICA',
  source:
    'Gur-e-Amir mausoleum built 1403–1404 — Wikipedia "Gur-e-Amir", UNESCO WHC 603 (Timurid ensembles); Roman Empire from 27 BC (Augustus) — Britannica "Roman Empire"; Samarkand founded 7th c. BC — UNESCO WHC 603.',
  status: 'verified',
  notes: 'Dome age shown as "600+ YEARS" (2026 − 1404 = 622).',
  data: { gurEmirBuilt: 1404, domeAgeYears: 600, romanEmpireFrom: -27, samarkandFromCentury: -7 },
};

/** ex-USSR republics (ISO numeric) for the Scene 7 map; Central Asia for Scene 9. */
export const regions = {
  ussr: ['643', '804', '112', '498', '233', '428', '440', '268', '051', '031', '398', '417', '762', '795', '860'],
  centralAsia: ['398', '417', '762', '795', '860'],
  uzbekistan: '860',
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 4 — Samarkand
// ─────────────────────────────────────────────────────────────────────────────

export const samarkand: Dataset<{
  ageYears: number;
  foundedLabel: string;
  timurCapitalFrom: number;
  madrasas: Array<{ name: string; built: string; fromYear: number }>;
}> = {
  sourceTag: 'UNESCO WORLD HERITAGE CENTRE',
  source:
    'UNESCO, "Samarkand – Crossroad of Cultures" (WHC 603): "Founded in the 7th century B.C."; "a history of over two and a half millennia" — https://whc.unesco.org/en/list/603/ ; Timur 1370: Britannica "Timur", Met Museum Heilbrunn Timeline "The Timurid Dynasty"; madrasa dates: Wikipedia "Registan", "Tilya Kori Madrasa", Advantour.',
  status: 'verified',
  notes:
    'Counter shows "2,500+ YEARS" (UNESCO wording), not 2,700/2,750: the 2,750th anniversary (2007) is a celebration date, UNESCO only commits to "over two and a half millennia". Tilya-Kori was begun 1646 and finished ~1660 after its patron died.',
  data: {
    ageYears: 2500,
    foundedLabel: '7TH CENTURY BC',
    timurCapitalFrom: 1370,
    madrasas: [
      { name: 'ULUGH BEG MADRASA', built: '1417–1420', fromYear: 1417 },
      { name: 'SHER-DOR MADRASA', built: '1619–1636', fromYear: 1619 },
      { name: 'TILYA-KORI MADRASA', built: '1646–1660', fromYear: 1646 },
    ],
  },
};

/** Timur's empire extent named in the narration ("from Turkey to India"). Polygon is drawn stylized. */
export const timurEmpire = {
  // Verified: Timur defeated the Ottomans at Ankara (1402) and sacked Delhi (1398); his realm is commonly summarised
  // "from India to Anatolia" (Wikipedia "Timurid Empire"; Met Museum). Shown as a stylized spread, no borders claimed.
  from: 'ANATOLIA',
  to: 'INDIA',
};

export const ulughBeg: Dataset<{ measuredIn: number; days: number; hours: number; minutes: number; seconds: number; errorSeconds: number }> = {
  sourceTag: 'ZIJ-I SULTANI (1437)',
  source:
    'K. Krisciunas et al., "Ulugh Beg, Prince of Stars" — https://arxiv.org/abs/1804.08352 : sidereal year "365 days 6 hours 10 minutes and 8 seconds, a difference of 58 seconds (0.04%) with the modern value of 365.25636304 days".',
  status: 'verified',
  notes:
    'MacTutor (St Andrews) instead quotes a tropical year of 365d 5h 49m 15s. The card shows the sidereal value and labels it "SIDEREAL YEAR" so both stay correct.',
  data: { measuredIn: 1437, days: 365, hours: 6, minutes: 10, seconds: 8, errorSeconds: 58 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 5 — Bukhara
// ─────────────────────────────────────────────────────────────────────────────

export const bukhara: Dataset<{ historyYears: number; kalyanBuilt: number; kalyanCompleted: number; kalyanHeightM: number; genghisYear: number }> = {
  sourceTag: 'UNESCO WORLD HERITAGE CENTRE',
  source:
    'UNESCO, "Historic Centre of Bukhara" (WHC 602): "more than 2,000 years old"; "the Mongol invasions of Genghis Khan in 1220" — https://whc.unesco.org/en/list/602/ ; Kalyan minaret: Wikipedia "Kalyan Minaret" (inscriptions dated 1127 at the base, 1129 at the top; 45.6 m).',
  status: 'verified',
  notes:
    'Height varies by source (45.6 m most common; 46.5–48 m incl. the finial). The "spared by Genghis Khan" story is a LEGEND — keep the word "LEGEND" on screen.',
  data: { historyYears: 2000, kalyanBuilt: 1127, kalyanCompleted: 1129, kalyanHeightM: 45.6, genghisYear: 1220 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 6 — Khiva
// ─────────────────────────────────────────────────────────────────────────────

export const khiva: Dataset<{ unescoYear: number; firstInCentralAsia: true; crossOnFootMinutes: number; sizeM: [number, number]; wallsM: number; monuments: number }> = {
  sourceTag: 'UNESCO WORLD HERITAGE CENTRE',
  source:
    'UNESCO, "Itchan Kala" (WHC 543): inscribed 1990; "a regular rectangle (650 by 400 meters) … walls that are up to ten meters high" — https://whc.unesco.org/en/list/543/ ; first in Central Asia: Ichan-Kala museum — https://khivamuseum.uz/en/node/183 (no other Central Asian site predates 1990: Bukhara 1993, Merv 1999, Yasawi 2003, Sulaiman-Too 2009, Sarazm 2010).',
  status: 'verified',
  notes: '"About fifteen minutes" is the narration\'s rounding: 650 m end to end is ~8–10 min in a straight line, longer through the lanes. Stopwatch shows "~15 MIN".',
  // monuments: "The property is the site of 51 ancient monumental structures" (WHC 543).
  data: { unescoYear: 1990, firstInCentralAsia: true, crossOnFootMinutes: 15, sizeM: [650, 400], wallsM: 10, monuments: 51 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 7 — the opening
// ─────────────────────────────────────────────────────────────────────────────

export const openingTimeline: Dataset<Array<{ year: number; date: string; label: string }>> = {
  sourceTag: 'GOV.UZ; CENTRAL BANK OF UZBEKISTAN',
  source:
    'Mirziyoyev elected 4 Dec 2016 — Wikipedia "2016 Uzbek presidential election"; som free conversion from 5 Sep 2017 (Decree UP-5177) — RFE/RL https://www.rferl.org/a/uzbekistan-currency-sum-dollar-convertible-liberalization-exchange/28714017.html ; e-visa from 15 Jul 2018 (Decree PP-3836) — https://www.un.int/uzbekistan/news/republic-uzbekistan-introduces-e-visa-system-51-countries-and-5-day-transit-visa-free-procedure ; 45 countries visa-free from 1 Feb 2019 (Decree UP-5611).',
  status: 'verified',
  data: [
    { year: 1991, date: '1991-08-31', label: 'INDEPENDENCE' },
    { year: 2016, date: '2016-12-04', label: 'NEW PRESIDENT' },
    { year: 2017, date: '2017-09-05', label: 'CURRENCY FREED' },
    { year: 2018, date: '2018-07-15', label: 'E-VISA' },
    { year: 2019, date: '2019-02-01', label: 'VISA-FREE FOR 45 MORE' },
  ],
};

/**
 * Countries whose citizens can enter visa-free, by the year they joined (ISO numeric ids for <VisaMap>).
 * NOT exhaustive (the official total is ~86–90; the on-screen counter uses visaCount2025, not these lists).
 * Microstates (Andorra, Monaco, San Marino, Vatican, Liechtenstein, Malta) are absent from the 110m map but still count.
 */
export const visaFree: Dataset<Array<{ year: number; label: string; isos: string[] }>> = {
  sourceTag: 'MFA OF UZBEKISTAN; PRESIDENTIAL DECREES',
  source:
    'Feb 2018 group (from 10 Feb 2018), Tajikistan (Mar 2018), France (5 Oct 2018, Decree UP-5551) — https://kun.uz/en/news/2018/10/05/visa-free-regime-comes-into-force-for-citizens-of-france ; Germany 15 Jan 2019 and 45 countries from 1 Feb 2019 (UP-5611) — https://www.bal.com/perspectives/bal-news/uzbekistan-visa-free-travel-extended-to-nationals-of-45-countries/ ; Gulf states + China 2021 (10 days) — https://gratanet.com/news/uzbekistan-visa-free-regime-for-citizens ; Saudi Arabia 1 Jan 2023; 2025 group (30 days) — https://en.fergana.agency/news/141948 ; USA from 1 Jan 2026 (decree 3 Nov 2025) — https://www.kun.uz/en/news/2025/11/03/uzbekistan-to-introduce-visa-free-regime-for-us-citizens-from-2026',
  status: 'verified',
  notes:
    'CIS partners before 2018 per secondary sources (Ukraine not confirmed → left grey). The animation stops at "TODAY" with the US step, matching "today, around ninety countries".',
  data: [
    { year: 2017, label: 'BEFORE 2018', isos: ['643', '398', '417', '031', '051', '112', '268', '498'] },
    // Israel, Indonesia, S. Korea, Malaysia, Singapore, Turkey, Japan (Feb) · Tajikistan (Mar) · France (Oct)
    { year: 2018, label: '2018', isos: ['376', '360', '410', '458', '702', '792', '392', '762', '250'] },
    {
      year: 2019,
      label: '2019',
      // Germany (15 Jan) + the 45 countries of Decree UP-5611 (1 Feb).
      isos: [
        '276',
        '020', '032', '036', '040', '056', '070', '076', '096', '100', '124', '152', '191', '196', '203', '208', '233', '246', '300',
        '348', '352', '372', '380', '428', '438', '440', '442', '470', '492', '496', '499', '528', '554', '578', '616', '620', '642',
        '674', '688', '703', '705', '724', '752', '756', '336', '826',
      ],
    },
    // 2021: Bahrain, Qatar, Kuwait, Oman, China (10 days) · 2023: Saudi Arabia · 2025: Egypt, Jordan (+ 30 days for the rest).
    { year: 2025, label: '2021–2025', isos: ['048', '634', '414', '512', '156', '682', '818', '400'] },
    { year: 2026, label: 'TODAY', isos: ['840'] },
  ],
};

/** "Today, citizens of around ninety countries benefit from easier entry." */
export const visaCount2025: Dataset<{ approxCountries: number; chinaVisaFreeFrom: string }> = {
  sourceTag: 'TOURISM COMMITTEE OF UZBEKISTAN, 2025',
  source:
    'Tourism Committee (2025): ~90 countries with visa-free or simplified entry; 86 visa-free countries after the 2025 group (Fergana Agency — https://en.fergana.agency/news/141948); China 30-day visa-free from 1 Jun 2025 — https://english.beijing.gov.cn/latest/news/202505/t20250516_4090500.html',
  status: 'verified',
  notes: 'Shown as "~90" (86 visa-free + the US from 2026, plus simplified entry).',
  data: { approxCountries: 90, chinaVisaFreeFrom: '2025-06-01' },
};

/** Afrosiyob high-speed line (Scene 7 RouteMap + comparison bars). */
export const afrosiyob: Dataset<{
  stops: Array<{ id: string; name: string; lonLat: [number, number] }>;
  openings: Array<{ section: string; date: string }>;
  railTashkentBukharaHours: number;
  roadTashkentBukharaHours: [number, number];
  roadKm: number;
}> = {
  sourceTag: 'UZBEKISTAN RAILWAYS; ADVANTOUR',
  source:
    'Openings: UzDaily — https://www.uzdaily.uz/en/uzbekistans-afrosiyob-high-speed-train-marks-15-years/ (8 Oct 2011), https://www.uzdaily.uz/en/high-speed-train-afrosiyob-starts-to-run-on-route-tashkent-bukhara/ (25 Aug 2016), Railway Gazette "Talgo 250 reaches Bukhara"; times: Advantour timetable — https://www.advantour.com/uzbekistan/trains/tashkent-bukhara.htm (4h12–4h22), road 548–580 km, 7–10 h.',
  status: 'verified',
  notes:
    'Bars: ROAD "7–10 H" vs TRAIN "~4 H". Khiva high-speed service is not mentioned in the narration and stays off screen.',
  data: {
    stops: [
      { id: 'tashkent', name: 'TASHKENT', lonLat: [69.24, 41.31] },
      { id: 'samarkand', name: 'SAMARKAND', lonLat: [66.97, 39.65] },
      { id: 'bukhara', name: 'BUKHARA', lonLat: [64.42, 39.77] },
    ],
    openings: [
      { section: 'TASHKENT–SAMARKAND', date: '2011-10-08' },
      { section: 'SAMARKAND–BUKHARA', date: '2016-08-25' },
    ],
    railTashkentBukharaHours: 4,
    roadTashkentBukharaHours: [7, 10],
    roadKm: 570,
  },
};

/**
 * New international air routes approved / launched 2025–26 (Scene 7 "new international routes"). Not exhaustive —
 * these are documented examples; no official total exists, so no count is shown.
 */
export const newRoutes: Dataset<Array<{ city: string; lonLat: [number, number]; carrier: string }>> = {
  sourceTag: 'CIVIL AVIATION AGENCY OF UZBEKISTAN (VIA PRESS), 2025–26',
  source:
    'Times of Central Asia, "Uzbekistan approves regular flights from Malaysia, South Korea and Egypt" (Feb 2025) — https://timesca.com/uzbekistan-approves-regular-flights-from-malaysia-south-korea-and-egypt/ ; Kun.uz, China Eastern Xi\'an–Tashkent (Jul 2025) — https://kun.uz/en/news/2025/07/04/china-eastern-airlines-to-launch-flights-to-uzbekistan ; Daryo, Etihad Abu Dhabi–Tashkent (Aug 2026) — https://daryo.uz/en/2026/08/10/etihad-airways-launches-daily-direct-flights-between-abu-dhabi-and-tashkent/ ; AeroRoutes, Centrum Air NS25 — https://aeroroutes.com/eng/241226-c6ns25',
  status: 'verified',
  notes: 'Examples only; shown as routes drawing in, with no total.',
  data: [
    { city: 'KUALA LUMPUR', lonLat: [101.7, 3.14], carrier: 'AirAsia X' },
    { city: 'SEOUL', lonLat: [126.98, 37.57], carrier: "T'way Air" },
    { city: 'SHARM EL-SHEIKH', lonLat: [34.33, 27.92], carrier: 'Red Sea Airlines' },
    { city: "XI'AN", lonLat: [108.94, 34.34], carrier: 'China Eastern' },
    { city: 'BEIJING', lonLat: [116.4, 39.9], carrier: 'Air China' },
    { city: 'ABU DHABI', lonLat: [54.37, 24.45], carrier: 'Etihad' },
    { city: 'FRANKFURT', lonLat: [8.68, 50.11], carrier: 'Centrum Air' },
    { city: 'BANGKOK', lonLat: [100.5, 13.75], carrier: 'Centrum Air' },
    { city: 'ALMATY', lonLat: [76.95, 43.24], carrier: 'Centrum Air' },
    { city: 'ISTANBUL', lonLat: [29.31, 40.9], carrier: 'Centrum Air (Sabiha Gökçen)' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 8 — beyond the domes
// ─────────────────────────────────────────────────────────────────────────────

export const plov: Dataset<{ unescoYear: number; listing: string }> = {
  sourceTag: 'UNESCO INTANGIBLE CULTURAL HERITAGE',
  source:
    'UNESCO ICH, "Palov culture and tradition", Decision 11.COM 10.B.35 (1 Dec 2016) — https://ich.unesco.org/en/RL/palov-culture-and-tradition-01166',
  status: 'verified',
  data: { unescoYear: 2016, listing: 'PALOV CULTURE AND TRADITION' },
};

export const tianShan: Dataset<{ peakName: string; peakM: number; shownAs: string; driveFromTashkentHours: number; driveKm: number }> = {
  sourceTag: 'PEAKVISOR; VISIT TASHKENT',
  source:
    'Mount Adelung 4,301 m, Pskem range (West Tian Shan), highest point of Tashkent region — https://peakvisor.com/peak/adelunga.html , Wikipedia "Mount Adelung"; Amirsoy/Chimgan ~80 km, ~1.5 h from Tashkent — https://www.rome2rio.com/s/Tashkent/Amirsoy , voyage.uz.',
  status: 'verified',
  notes: 'Counter shows "4,000+ M" (narration wording); annotation "< 2 H FROM TASHKENT".',
  data: { peakName: 'ADELUNG', peakM: 4301, shownAs: '4,000+ M', driveFromTashkentHours: 1.5, driveKm: 80 },
};

export const moynaq: Dataset<{ kmToShore: number; aralRankOnceLargestLake: number }> = {
  sourceTag: 'NASA EARTH OBSERVATORY; ATLAS OBSCURA',
  source:
    'NASA Earth Observatory, "Shrinking Aral Sea": "once the fourth-largest lake in the world"; rivers diverted in the 1960s — https://science.nasa.gov/earth/earth-observatory/shrinking-aral-sea/ ; Moynaq ~150 km from the water — Wikipedia "Moynaq", Atlas Obscura "Moynaq ghost town".',
  status: 'verified',
  notes:
    'Distance shown as "~150 KM" (Wikipedia, Atlas Obscura, Amusing Planet agree; an older 2022 blog says 80+ km). The shrinking-sea map is stylized and labeled "NOT TO SCALE".',
  data: { kmToShore: 150, aralRankOnceLargestLake: 4 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 9 — what's next
// ─────────────────────────────────────────────────────────────────────────────

export const target2030: Dataset<{ year: number; touristsM: number; partner: string }> = {
  sourceTag: 'GOVERNMENT OF UZBEKISTAN; UN TOURISM',
  source:
    'Uzbektourism, 16 Jan 2026: "by 2030 it is expected to reach 20 million" — https://gov.uz/en/uzbektourism/news/view/120827 ; President meets UN Tourism Secretary-General (1 Apr 2026), joint projects & cooperation — https://gov.uz/en/digital/news/view/148569',
  status: 'verified',
  notes:
    'The 20M goal is the government\'s; UN Tourism\'s role is cooperation (joint projects, training), not a co-signed target. On screen: "20M BY 2030" + small "WITH UN TOURISM COOPERATION" — not "UN TARGET".',
  data: { year: 2030, touristsM: 20, partner: 'UN TOURISM' },
};

/** "+71%" — 20M vs the 2025 record. Computed. */
export const TARGET_INCREASE_PCT = Math.round((target2030.data.touristsM / arrivals2025.data.totalM - 1) * 100); // = 71

/**
 * Momentum counters ("every new route, every visa removed, every traveler…").
 * No official total of new air routes exists, so the third counter is the verified Jan–Feb 2026 growth instead.
 */
export const momentum: Dataset<{ visaCountries: number; travelersM: number; growth2026Pct: number }> = {
  sourceTag: 'TOURISM COMMITTEE; NATIONAL STATISTICS COMMITTEE',
  source: 'visaCount2025, arrivals2025, start2026 (see above).',
  status: 'verified',
  data: {
    visaCountries: visaCount2025.data.approxCountries,
    travelersM: arrivals2025.data.totalM,
    growth2026Pct: start2026.data.increasePct,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fact-check index — every dataset, so scripts/check-data.ts can list placeholders / TODOs before a render.
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_DATASETS = {
  arrivals2025,
  arrivalsSeries,
  topOrigins2025,
  monthlyRecord,
  start2026,
  geography,
  samarkand,
  ulughBeg,
  bukhara,
  khiva,
  coldOpen,
  openingTimeline,
  visaFree,
  visaCount2025,
  afrosiyob,
  newRoutes,
  plov,
  tianShan,
  moynaq,
  target2030,
  momentum,
};
