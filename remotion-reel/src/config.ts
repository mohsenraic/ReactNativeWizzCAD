/**
 * ============================================================================
 *  REEL CONFIGURATION — ENGLISH (Ushguli)
 * ============================================================================
 *  This is the ONLY file you need to edit to reuse the template for another
 *  place: name, country, coordinates, on-screen texts, subtitle segments,
 *  timings (seconds), colors, map camera, altitude profile, towers…
 *
 *  All times are in SECONDS from the start of the video, unless a comment
 *  says "relative to the scene".
 *
 *  A French preset lives in src/presets/ushguli.fr.ts (copy it over this file
 *  to render the French version).
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Camera = {
  /** Longitude at screen center (degrees, East positive) */
  lon: number;
  /** Latitude at screen center (degrees, North positive) */
  lat: number;
  /** d3 orthographic scale (globe radius in px) */
  scale: number;
};

export type SubtitleSegment = {
  /** Segment start (s) */
  start: number;
  /** Segment end (s) */
  end: number;
  /** 2 to 4 words. Words are spread across [start, end] proportionally to their length. */
  text: string;
  /**
   * Optional: start time of each word (s) for word-accurate sync.
   * Must contain exactly as many values as there are words in `text`.
   */
  wordStarts?: number[];
};

export type Tower = {
  /** Horizontal position of the tower's base (0 = left, 1 = right) */
  x: number;
  /** Height in px */
  height: number;
  /** Base width in px */
  width: number;
};

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInSeconds: 32,
} as const;

/** Instagram / YouTube safe zones (px) */
export const SAFE_ZONE = {
  top: 250,
  bottom: 400,
  side: 60,
} as const;

export const DEBUG = {
  /** Shows the forbidden UI zones in red (turn off for the final render) */
  showSafeZones: false,
} as const;

// ---------------------------------------------------------------------------
// Place
// ---------------------------------------------------------------------------

export const PLACE = {
  name: 'USHGULI',
  country: 'Georgia',
  /** ISO 3166-1 numeric country code (the id used by world-atlas). Georgia = 268 */
  countryIsoNumeric: '268',
  lat: 42.92,
  lon: 43.01,
  /** Shown under the pin label */
  coordinatesLabel: '42.92° N · 43.01° E',
} as const;

// ---------------------------------------------------------------------------
// Colors, fonts, numbers
// ---------------------------------------------------------------------------

export const COLORS = {
  background: '#0B1426',
  backgroundLight: '#13213B',
  ocean: '#0D1A30',
  land: '#26385A', // slate blue
  landHighlight: '#36507E',
  border: '#7FB0E6', // glowing borders
  borderHighlight: '#BFE0FF',
  graticule: '#3A5A8C',
  accent: '#F5B841', // warm gold
  accentSoft: '#FFD57E',
  text: '#F4F6FB',
  textMuted: '#9BAAC4',
  stone: '#1B2944',
  stoneLight: '#2C3F63',
  mountainFar: '#16243F',
  mountainMid: '#1C2D4C',
  mountainNear: '#22365A',
  ice: '#A9D4FF',
  snow: '#FFFFFF',
} as const;

/** Number formatting: thousands separator (2,000) */
export const NUMBERS = {
  thousandsSeparator: ',',
} as const;

export const FONTS = {
  /** 'Montserrat' or 'Inter' */
  display: 'Montserrat' as 'Montserrat' | 'Inter',
  body: 'Inter' as 'Montserrat' | 'Inter',
};

/** Cinematic grain & vignette */
export const FILM = {
  grainOpacity: 0.07,
  vignetteStrength: 0.75,
} as const;

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

export const AUDIO = {
  /** File inside /public */
  voiceover: 'voiceover.mp3',
  /** Set to false to preview without the audio file */
  enabled: true,
  volume: 1,
  /** Voiceover offset (s). Positive = the voice starts later. */
  offset: 0,
} as const;

// ---------------------------------------------------------------------------
// Scene timings (s)
// ---------------------------------------------------------------------------

export const SCENES = {
  hook: {start: 0, end: 3},
  globe: {start: 3, end: 7},
  zoom: {start: 7, end: 13},
  altitude: {start: 13, end: 19},
  towers: {start: 19, end: 24},
  winter: {start: 24, end: 27},
  cta: {start: 27, end: 32},
} as const;

/** Crossfade duration between scenes (s) */
export const CROSSFADE = 0.45;

// ---------------------------------------------------------------------------
// Scene 1 — Hook
// ---------------------------------------------------------------------------

export const HOOK = {
  text: "This village doesn't exist on any tourist map",
  /** Words shown in gold (case-insensitive) */
  accentWords: ['any'],
  /** Delay before the first word (s, relative to the scene) */
  firstWordDelay: 0.15,
  /** Delay between two words (s) */
  wordInterval: 0.25,
  /** Slow push-in: final scale */
  zoomTo: 1.08,
};

// ---------------------------------------------------------------------------
// Scenes 2 & 3 — Globe then map zoom (one continuous camera)
// ---------------------------------------------------------------------------

export const MAP = {
  /** Vertical center of the map on screen (px) */
  centerY: 820,
  camera: {
    /** Globe rotation start */
    globeStart: {lon: -45, lat: 12, scale: 360} as Camera,
    /** Globe stopped on the region (Caucasus) */
    globeEnd: {lon: 43.8, lat: 42.3, scale: 390} as Camera,
    /** Country view */
    country: {lon: 43.6, lat: 42.3, scale: 7200} as Camera,
    /** Place view (final zoom) */
    place: {lon: PLACE.lon, lat: PLACE.lat, scale: 19000} as Camera,
    /** Zoomed-out CTA view: moves from `ctaFrom` to `cta` */
    ctaFrom: {lon: PLACE.lon, lat: PLACE.lat, scale: 12000} as Camera,
    cta: {lon: 43.4, lat: 42.55, scale: 5200} as Camera,
  },
  /** Globe rotation stops at (s) */
  globeStopAt: 6.4,
  /** Globe -> country zoom (s) */
  zoomToCountry: {start: 7.0, end: 9.4},
  /** Country -> place zoom (s) */
  zoomToPlace: {start: 9.4, end: 11.0},
  /** Pin drop (s) */
  pinDropAt: 10.5,
  /** Label slide-in (s) */
  labelAt: 11.1,
  /** Subtle label shown on the globe */
  regionLabel: 'CAUCASUS',
};

// ---------------------------------------------------------------------------
// Scene 4 — Altitude
// ---------------------------------------------------------------------------

export const ALTITUDE = {
  /** Final counter value */
  value: 2000,
  prefix: '',
  suffix: '+ m',
  title: "Among Europe's highest inhabited villages",
  accentWords: ['highest'],
  /**
   * Terrain profile: [x (0→1), altitude in m].
   * Here: Enguri valley → Ushguli → Shkhara massif (5,193 m).
   */
  profile: [
    [0.0, 900],
    [0.08, 1300],
    [0.16, 1150],
    [0.26, 1750],
    [0.34, 1600],
    [0.44, 2100],
    [0.52, 2150],
    [0.6, 2900],
    [0.68, 3700],
    [0.76, 5193],
    [0.84, 4300],
    [0.92, 4700],
    [1.0, 3600],
  ] as [number, number][],
  /** Axis max (m) */
  maxAltitude: 5600,
  /** Village position on the profile (x 0→1) and its real altitude */
  village: {x: 0.48, altitude: 2100, label: 'USHGULI · 2,100 m'},
  /** Named peak (optional, set to null to hide) */
  peak: {x: 0.76, label: 'SHKHARA · 5,193 m'} as {x: number; label: string} | null,
  /** Axis ticks (m) */
  ticks: [1000, 2000, 3000, 4000, 5000],
  /** Timings relative to the scene (s) */
  drawStart: 0.25,
  drawEnd: 3.2,
  counterStart: 0.5,
  counterEnd: 3.0,
};

// ---------------------------------------------------------------------------
// Scene 5 — Towers
// ---------------------------------------------------------------------------

export const TOWERS = {
  title: 'Medieval defensive towers',
  accentWords: ['medieval'],
  /** Ground line (px from top) */
  groundY: 1110,
  /** Delay before the first tower, and delay between towers (s) */
  firstDelay: 0.35,
  stagger: 0.42,
  towers: [
    {x: 0.2, height: 300, width: 78},
    {x: 0.37, height: 400, width: 86},
    {x: 0.52, height: 340, width: 80},
    {x: 0.68, height: 450, width: 92},
    {x: 0.83, height: 320, width: 76},
  ] as Tower[],
};

// ---------------------------------------------------------------------------
// Scene 6 — Winter
// ---------------------------------------------------------------------------

export const WINTER = {
  title: 'Cut off from the world in winter',
  accentWords: ['winter'],
  snowflakes: 220,
  /** Cool-down duration of the image (s) */
  coolDownDuration: 1.4,
  /** Icy tint color */
  tint: '#7FB8F0',
  tintOpacity: 0.32,
};

// ---------------------------------------------------------------------------
// Scene 7 — CTA
// ---------------------------------------------------------------------------

export const CTA = {
  question: 'Would you go?',
  buttonLabel: 'Follow',
  buttonSub: '1 hidden gem / week',
  /** Timings relative to the scene (s) */
  questionAt: 0.3,
  buttonAt: 1.5,
  /** Moment of the button "tap" */
  tapAt: 3.1,
};

// ---------------------------------------------------------------------------
// Karaoke subtitles (synced to the voiceover)
// ---------------------------------------------------------------------------

export const SUBTITLES = {
  /** Vertical center of the subtitles (lower part of the central third) */
  centerY: 1200,
  fontSize: 62,
  /** Words always shown in gold, even when not active (optional) */
  alwaysAccent: ['Ushguli', 'thousand'],
  /**
   * Time ranges (s) where subtitles are hidden. By default the hook, because
   * the same sentence is already animated big on screen. Use [] to show them.
   */
  hiddenRanges: [[0, 3]] as [number, number][],
  /**
   * Voiceover: "This village doesn't exist on any tourist map. Yet people have
   * lived here for over a thousand years. Welcome to Ushguli, hidden in the
   * Caucasus mountains of Georgia. Sitting above two thousand meters, it's one
   * of the highest permanently inhabited villages in Europe. Its medieval
   * stone towers protected families from invaders and from clan feuds. And in
   * winter, snow can cut it off from the world for weeks. Would you go?
   * Follow for one hidden gem every week."
   *
   * Segments of 2 to 4 words. Re-sync `start` / `end` to your actual voiceover.
   */
  segments: [
    // 0–3 s · Hook
    {start: 0.15, end: 0.9, text: 'This village'},
    {start: 0.9, end: 1.6, text: "doesn't exist"},
    {start: 1.6, end: 2.15, text: 'on any'},
    {start: 2.15, end: 2.9, text: 'tourist map.'},
    // 3–7 s · Globe
    {start: 3.05, end: 3.9, text: 'Yet people'},
    {start: 3.9, end: 4.9, text: 'have lived here'},
    {start: 4.9, end: 5.5, text: 'for over'},
    {start: 5.5, end: 6.85, text: 'a thousand years.'},
    // 7–13 s · Zoom
    {start: 7.05, end: 8.4, text: 'Welcome to Ushguli,'},
    {start: 8.4, end: 9.1, text: 'hidden in'},
    {start: 9.1, end: 10.6, text: 'the Caucasus mountains'},
    {start: 10.6, end: 11.6, text: 'of Georgia.'},
    // 13–19 s · Altitude
    {start: 13.0, end: 13.8, text: 'Sitting above'},
    {start: 13.8, end: 15.0, text: 'two thousand meters,'},
    {start: 15.0, end: 15.7, text: "it's one of"},
    {start: 15.7, end: 17.0, text: 'the highest permanently'},
    {start: 17.0, end: 18.1, text: 'inhabited villages'},
    {start: 18.1, end: 18.9, text: 'in Europe.'},
    // 19–24 s · Towers
    {start: 19.05, end: 19.9, text: 'Its medieval'},
    {start: 19.9, end: 20.8, text: 'stone towers'},
    {start: 20.8, end: 21.9, text: 'protected families'},
    {start: 21.9, end: 22.8, text: 'from invaders'},
    {start: 22.8, end: 23.9, text: 'and from clan feuds.'},
    // 24–27 s · Winter
    {start: 24.0, end: 24.7, text: 'And in winter,'},
    {start: 24.7, end: 25.5, text: 'snow can cut it'},
    {start: 25.5, end: 26.25, text: 'off from the world'},
    {start: 26.25, end: 26.95, text: 'for weeks.'},
    // 27–32 s · CTA
    {start: 27.2, end: 28.3, text: 'Would you go?'},
    {start: 28.6, end: 29.6, text: 'Follow for'},
    {start: 29.6, end: 30.6, text: 'one hidden gem'},
    {start: 30.6, end: 31.7, text: 'every week.'},
  ] as SubtitleSegment[],
};
