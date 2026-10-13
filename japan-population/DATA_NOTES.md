# Data notes — "Why Japan Is Losing Millions of People"

Verification pass: October 2026. Values live in `src/data/japan.ts`; this file records what was checked,
what changed, and what is still open. The container's network policy blocked direct access to
stat.go.jp / mhlw.go.jp / ipss.go.jp / e-stat.go.jp, so checks were made via web search against official
tables and press reports that quote them.

## Corrections made

| Item | Was | Now | Source |
|---|---|---|---|
| Births 2010 | 1,071,305 | **1,071,304** | MHLW table |
| Births 2015 | 1,005,721 | **1,005,677** | MHLW 平成27年 確定数 |
| Births 2016 | 977,242 | **976,978** | Gender Equality Bureau / MHLW |
| Births 2017 | 946,146 | **946,065** | MHLW (via nippon.com) |
| Total population, latest | 123.80M (2024 est.) | **122.97M (2025 census, final)** | Census released 29 Sep 2026 |
| Loss from peak | 4.3M | **5.1M** | 128.08 − 122.97 |
| Foreign residents | 3,768,977 (end 2024) | **4,125,395 (end 2025)** | Immigration Services Agency, 27 Mar 2026 |
| Austin, TX | 979,882 (2023) | **1,002,632 (2025)** | US Census Bureau Vintage 2025 |
| S. Korea TFR | 0.75 (2024) | **0.80 (2025)** | Ministry of Data and Statistics, prelim. |
| Italy TFR | 1.18 (2024) | **1.14 (2025)** | ISTAT, provisional |
| Workers per 65+ | 1990: 5.8 (unconfirmed) | **1995: 4.8** | 1995 census shares 69.4% / 14.5% |
| Robotics card | placeholder | **38% of world robot production** | IFR, July 2025 |
| IPSS line | 2030/40/50/60 values (unconfirmed) | **2045: 108.8M, 2056: <100M, 2070: 87.0M** | IPSS 2023 via press |
| IPSS births forecast | invented shape | **2025: 749K, 2040: 675K** (secondary, TODO) | ISVD analysis |
| Pyramid 2025 total | 123.8M | 123.0M (placeholder rescaled to census) | — |

Dropped (could not confirm, not needed for the story): births/deaths 1965, deaths 2010, population 1984,
IPSS 2030/2040/2050/2060.

## Still open

1. **Population pyramids (all four years) — PLACEHOLDER.** Spreadsheet-only sources, blocked here.
   Download the tables listed in `japan.ts` §4 (or allow `www.e-stat.go.jp` and `www.ipss.go.jp` in the
   environment's network settings) and they drop straight in.
2. Census totals 1985, 1990, 1995 (121.049 / 123.611 / 125.570M) — standard values, not re-confirmed.
3. Final death counts 2005 (1,083,796) and 2006 (1,084,450) — the crossover logic holds either way.
4. IPSS births forecast points (749K in 2025, 675K in 2040) — secondary source only.
5. Foreign residents: the end-June 2026 count is due around now; swap it in if it's a new record.

## Editorial flags (narration is final — handled visually)

- **2005 vs 2007 crossover.** Deaths first exceeded births in 2005, births led again in 2006, and deaths
  have led every year since 2007. At chart scale the gap is a few pixels; the X sits on 2007 with the note
  "for good since 2007", matching the narration. Put the 2005 detail in the description, e.g.:
  *"Deaths first outnumbered births briefly in 2005; births edged ahead again in 2006, and deaths have
  exceeded births every year since 2007."*
- **"Every year since 1975."** Births fell overall but rose slightly in some years (e.g. 2006, 2010, 2015 —
  MHLW: "decline with repeated increases and decreases"). The chart shows the real line.
- **"Deaths keep rising."** 2025 deaths fell for the first time in five years (1,605,378 → 1,589,489).
  The chart shows the real line.
- **"2.5 million births a year."** 1947–49 averaged ~2.7M. On-screen label: "> 2.5M births / year".
- **"Leads the world in care robotics."** No country-level care-robot statistic found. The card uses
  IFR's 38% share of global robot production and is labelled as such.
- **Austin.** 918K natural decline ≈ 92% of Austin's 1.0M — fine as a round comparison.
- **"Japan lost nearly a million people."** That is the natural decline of Japanese nationals.
  The total population fell by less because foreign residents rose.

## Description-box sources

- MHLW Vital Statistics — https://www.mhlw.go.jp/toukei/list/81-1a.html
- Statistics Bureau of Japan, Population Census & Estimates — https://www.stat.go.jp/english/data/jinsui/index.html
- IPSS, Population Projections for Japan (2023) — https://www.ipss.go.jp/pp-zenkoku/e/zenkoku_e2023/pp2023e_Summary.pdf
- Statistics Bureau, 2023 Housing and Land Survey — https://www.stat.go.jp/english/data/jyutaku/index.html
- Immigration Services Agency — https://www.moj.go.jp/isa/policies/statistics/toukei_ichiran_touroku.html
- Children's Future Strategy (Dec 2023) — https://www.cfa.go.jp/
- International Federation of Robotics — https://ifr.org/
- US Census Bureau — https://www.census.gov/quickfacts/austincitytexas
- Korea Ministry of Data and Statistics; ISTAT; UN World Population Prospects 2024

## Map credits

- Japan prefectures: `@svg-maps/japan` (CC BY 4.0) — credit "Map of Japan by VictorCazanave/svg-maps, CC BY 4.0".
- World: `world-atlas` (Natural Earth, public domain; package ISC).
