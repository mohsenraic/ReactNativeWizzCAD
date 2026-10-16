# Fact-check log — "How One Patch of Ocean Controls the World's Weather"

Checked 14 October 2026. Every number and claim on screen traces to `src/data/elnino.ts`, where each value
is tagged ✓ with its source. `npm run check:data` reports: no placeholders, every dataset verified, no banned terms.

## On-screen numbers

| On screen | Value | Source | Status |
|---|---|---|---|
| Niño 3.4 Oct–Dec 2026 forecast | +3.7 °C, peak ~December | WMO press release and GSCU OND 2026, 8 Oct 2026 | ✓ |
| Previous record | +2.6 °C, Nov 2015–Jan 2016 | WMO, 8 Oct 2026; equals NOAA ONI NDJ 2015 (2.59) | ✓ |
| WMO baseline | 1993–2009 | WMO figure caption | ✓ |
| "firmly established and strengthening rapidly" | quote | Celeste Saulo, WMO, 8 Oct 2026 | ✓ verbatim |
| "doesn't add new heat to the planet" | quote | Celeste Saulo, WMO, 8 Oct 2026 | ✓ verbatim |
| Persistence through Feb 2027 | ~100 % | WMO ("near-100 per cent likelihood") | ✓ |
| "potentially one of the strongest since at least 1950" | wording | WMO, 8 Oct 2026 | ✓ verbatim |
| Forecast model spread | "narrow", no range drawn | WMO GSCU (publishes no numeric range) | ✓ (invented band removed) |
| El Niño threshold | +0.5 °C for 5 overlapping 3-month seasons | NOAA CPC ONI (ERSST.v6) | ✓ |
| Niño 3.4 box | 5°N–5°S, 170°W–120°W | NOAA CPC | ✓ |
| Past peaks (ONI) | 1982–83 +2.1, 1997–98 +2.4, 2015–16 +2.6 | NOAA CPC oni.ascii.txt (downloaded 14 Oct 2026) | ✓ |
| Sea-level difference, normal year | ~0.5 m | NOAA PMEL ("about 1/2 meter higher at Indonesia than at Ecuador"); NASA EO ~45 cm | ✓ |
| Global temperature line | GISTEMP v4 annual, vs 1951–1980; 2016 = +1.01, 2024 = +1.28 | NASA GISS (downloaded 14 Oct 2026) | ✓ |
| Strong El Niño bands | ONI episodes with peak ≥ 1.5 °C | derived from NOAA ONI | ✓ |
| El Niño losses | $4.1 T (1982–83), $5.7 T (1997–98), 5 years after each, 2017 US$ | Callahan & Mankin, *Science* 2023 (abstract); Dartmouth release (window); Grist (dollar year) | ✓ |

## Claims without numbers

| Claim | Support | Status |
|---|---|---|
| Record SSTs forecast Oct–Dec 2026 (shown as "FORECAST") | WMO 8 Oct 2026 | ✓ |
| Drier: Indonesia/Philippines, E. Australia, southern Africa, India monsoon, N. Brazil/Amazon | WMO 8 Oct 2026 regional list; Australian BoM; NOAA-based summaries | ✓ (outlines schematic) |
| Wetter: coastal Peru/Ecuador, SE South America, southern US, East Africa | WMO 8 Oct 2026 (Greater Horn, N. America south of 45°N, SE South America); 1983/1998 Peru floods | ✓ |
| Above-average temperatures across large parts of the globe, Oct–Dec | WMO 8 Oct 2026 | ✓ |
| Commodity producers in El Niño footprints (cocoa CI/Ghana, palm oil Indonesia/Malaysia, robusta Vietnam/Indonesia, rice and sugar India/Thailand) | FAO data via Intelpoint; Reuters/CNBC/StoneX reporting of El Niño crop impacts | ✓ (no prices shown) |
| Warm water drives Peru's anchovies away | PRODUCE closed the 2026 first season early (21 Aug) at 24.61 % of a 1,914,049 t quota (RM 000085-2026-PRODUCE; Infobae 15 Sep 2026) | ✓ |
| Records in 2016 and 2024 after strong El Niños | WMO State of the Global Climate 2016 / 2024 (2024: 1.55 ± 0.13 °C vs 1850–1900) | ✓ |
| 2027 could be next | Met Office, 22 Sep 2026: "2027 is very likely to replace 2024 as the warmest year on record" | ✓ ("2027?" only, no value) |
| "El Niño, the child … after the baby Jesus"; fishermen noticed centuries ago | NOAA Ocean Service ("El Niño de Navidad", fishermen in the 1600s); NOAA "referring to the Christ child" | ✓ |

## Editorial notes

- **The narration overstates two points compared with WMO.** It says "never recorded before" and "strongest ever measured"; WMO says *forecast* record levels and *potentially* one of the strongest since 1950. On-screen text uses WMO's wording and labels every 2026 value FORECAST.
- **Index choice.** NOAA now uses the Relative ONI (RONI) for official monitoring; its peaks are lower (2.40 / 2.28 / 2.25). The chart uses the classic ONI because it is the series WMO's +2.6 °C record matches.
- **"Super El Niño" never appears on screen.** Some 2026 press uses the term; WMO does not.
- **Removed as unsupported or unused:** the invented forecast range (3.3–4.1 °C), the 1997–98 anchovy biomass figures (single study), the 2026 second-season outlook (unconfirmed), and Carbon Brief's 1.7 °C projection.
