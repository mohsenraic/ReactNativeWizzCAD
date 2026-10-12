/**
 * ============================================================================
 *  CONFIGURATION DU REEL
 * ============================================================================
 *  C'est le SEUL fichier à modifier pour réutiliser le template sur un autre
 *  lieu : nom, pays, coordonnées, textes, timings (en secondes), couleurs,
 *  sous-titres, caméra de la carte, profil d'altitude, tours…
 *
 *  Tous les temps sont exprimés en SECONDES depuis le début de la vidéo
 *  (sauf mention contraire « relatif à la scène »).
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Camera = {
  /** Longitude du centre de l'écran (degrés, Est positif) */
  lon: number;
  /** Latitude du centre de l'écran (degrés, Nord positif) */
  lat: number;
  /** Échelle d3 de la projection orthographique (rayon du globe en px) */
  scale: number;
};

export type SubtitleSegment = {
  /** Début du segment (s) */
  start: number;
  /** Fin du segment (s) */
  end: number;
  /** 2 à 4 mots. Les mots sont répartis dans [start, end] au prorata de leur longueur. */
  text: string;
  /**
   * Optionnel : instants de début de chaque mot (s), pour un calage précis.
   * Doit contenir autant de valeurs que de mots dans `text`.
   */
  wordStarts?: number[];
};

export type Tower = {
  /** Position horizontale du pied de la tour (0 = gauche, 1 = droite) */
  x: number;
  /** Hauteur en px */
  height: number;
  /** Largeur à la base en px */
  width: number;
};

// ---------------------------------------------------------------------------
// Vidéo
// ---------------------------------------------------------------------------

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInSeconds: 32,
} as const;

/** Zones de sécurité Instagram / YouTube (px) */
export const SAFE_ZONE = {
  top: 250,
  bottom: 400,
  side: 60,
} as const;

export const DEBUG = {
  /** Affiche les zones interdites en rouge (à désactiver pour le rendu final) */
  showSafeZones: false,
} as const;

// ---------------------------------------------------------------------------
// Lieu
// ---------------------------------------------------------------------------

export const PLACE = {
  name: 'USHGULI',
  country: 'Géorgie',
  /** Code ISO 3166-1 numérique du pays (identifiant utilisé par world-atlas). Géorgie = 268 */
  countryIsoNumeric: '268',
  lat: 42.92,
  lon: 43.01,
  /** Texte affiché sous l'étiquette du pin */
  coordinatesLabel: '42.92° N · 43.01° E',
} as const;

// ---------------------------------------------------------------------------
// Couleurs & typo
// ---------------------------------------------------------------------------

export const COLORS = {
  background: '#0B1426',
  backgroundLight: '#13213B',
  ocean: '#0D1A30',
  land: '#26385A', // bleu ardoise
  landHighlight: '#36507E',
  border: '#7FB0E6', // frontières lumineuses
  borderHighlight: '#BFE0FF',
  graticule: '#3A5A8C',
  accent: '#F5B841', // or chaud
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

export const FONTS = {
  /** 'Montserrat' ou 'Inter' */
  display: 'Montserrat' as 'Montserrat' | 'Inter',
  body: 'Inter' as 'Montserrat' | 'Inter',
};

/** Grain & vignette cinématographiques */
export const FILM = {
  grainOpacity: 0.07,
  vignetteStrength: 0.75,
} as const;

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

export const AUDIO = {
  /** Fichier dans /public */
  voiceover: 'voiceover.mp3',
  /** Mettre à false pour prévisualiser sans le fichier audio */
  enabled: true,
  volume: 1,
  /** Décalage de la voix off (s). Positif = la voix démarre plus tard. */
  offset: 0,
} as const;

// ---------------------------------------------------------------------------
// Timings des scènes (s)
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

/** Durée des fondus enchaînés entre scènes (s) */
export const CROSSFADE = 0.45;

// ---------------------------------------------------------------------------
// Scène 1 — Accroche
// ---------------------------------------------------------------------------

export const HOOK = {
  text: "Ce village n'existe sur aucune carte touristique",
  /** Mots affichés en or (comparaison insensible à la casse) */
  accentWords: ['aucune'],
  /** Délai avant le premier mot (s, relatif à la scène) */
  firstWordDelay: 0.15,
  /** Intervalle entre deux mots (s) */
  wordInterval: 0.25,
  /** Zoom lent : échelle de fin */
  zoomTo: 1.08,
};

// ---------------------------------------------------------------------------
// Scènes 2 & 3 — Globe puis zoom carte (caméra continue)
// ---------------------------------------------------------------------------

export const MAP = {
  /** Centre vertical de la carte à l'écran (px) */
  centerY: 820,
  camera: {
    /** Début de la rotation du globe */
    globeStart: {lon: -45, lat: 12, scale: 360} as Camera,
    /** Globe arrêté sur la région (Caucase) */
    globeEnd: {lon: 43.8, lat: 42.3, scale: 390} as Camera,
    /** Vue pays */
    country: {lon: 43.6, lat: 42.3, scale: 7200} as Camera,
    /** Vue lieu (zoom final) */
    place: {lon: PLACE.lon, lat: PLACE.lat, scale: 19000} as Camera,
    /** Vue dézoomée du CTA : on part de `ctaFrom` pour arriver à `cta` */
    ctaFrom: {lon: PLACE.lon, lat: PLACE.lat, scale: 12000} as Camera,
    cta: {lon: 43.4, lat: 42.55, scale: 5200} as Camera,
  },
  /** La rotation du globe s'arrête à cet instant (s) */
  globeStopAt: 6.4,
  /** Zoom globe -> pays (s) */
  zoomToCountry: {start: 7.0, end: 9.4},
  /** Zoom pays -> lieu (s) */
  zoomToPlace: {start: 9.4, end: 11.0},
  /** Chute du pin (s) */
  pinDropAt: 10.5,
  /** Apparition de l'étiquette (s) */
  labelAt: 11.1,
  /** Étiquettes discrètes affichées sur le globe */
  regionLabel: 'CAUCASE',
};

// ---------------------------------------------------------------------------
// Scène 4 — Altitude
// ---------------------------------------------------------------------------

export const ALTITUDE = {
  /** Valeur finale du compteur */
  value: 2000,
  prefix: '',
  suffix: '+ m',
  title: "Parmi les villages habités les plus hauts d'Europe",
  accentWords: ['plus', 'hauts'],
  /**
   * Profil du relief : [x (0→1), altitude en m].
   * Ici : vallée de l'Enguri → Ushguli → massif du Shkhara (5 193 m).
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
  /** Altitude max de l'axe (m) */
  maxAltitude: 5600,
  /** Position du village sur le profil (x 0→1) et son altitude réelle */
  village: {x: 0.48, altitude: 2100, label: 'USHGULI · 2 100 m'},
  /** Sommet nommé (optionnel) */
  peak: {x: 0.76, label: 'SHKHARA · 5 193 m'} as {x: number; label: string} | null,
  /** Graduations de l'axe (m) */
  ticks: [1000, 2000, 3000, 4000, 5000],
  /** Timings relatifs à la scène (s) */
  drawStart: 0.25,
  drawEnd: 3.2,
  counterStart: 0.5,
  counterEnd: 3.0,
};

// ---------------------------------------------------------------------------
// Scène 5 — Tours
// ---------------------------------------------------------------------------

export const TOWERS = {
  title: 'Tours médiévales défensives',
  accentWords: ['médiévales'],
  /** Ligne de sol (px depuis le haut) */
  groundY: 1110,
  /** Délai avant la 1re tour, et intervalle entre tours (s) */
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
// Scène 6 — Hiver
// ---------------------------------------------------------------------------

export const WINTER = {
  title: "Coupé du monde l'hiver",
  accentWords: ['hiver'],
  snowflakes: 220,
  /** Durée du refroidissement de l'image (s) */
  coolDownDuration: 1.4,
  /** Couleur de la teinte glacée */
  tint: '#7FB8F0',
  tintOpacity: 0.32,
};

// ---------------------------------------------------------------------------
// Scène 7 — CTA
// ---------------------------------------------------------------------------

export const CTA = {
  question: 'Tu y serais allé ?',
  buttonLabel: 'Abonne-toi',
  buttonSub: '1 trésor caché / semaine',
  /** Timings relatifs à la scène (s) */
  questionAt: 0.3,
  buttonAt: 1.5,
  /** Instant du « clic » sur le bouton */
  tapAt: 3.1,
};

// ---------------------------------------------------------------------------
// Sous-titres karaoké (calés sur la voix off)
// ---------------------------------------------------------------------------

export const SUBTITLES = {
  /** Position verticale du centre des sous-titres (bas du tiers central) */
  centerY: 1200,
  fontSize: 62,
  /** Mots toujours en or même lorsqu'ils ne sont pas actifs (optionnel) */
  alwaysAccent: ['2 000', 'Ushguli'],
  /**
   * Segments de 2 à 4 mots. Pas de sous-titres pendant l'accroche : le texte
   * est déjà à l'écran. Recalez `start` / `end` sur votre voix off.
   */
  segments: [
    {start: 3.1, end: 4.3, text: 'Cap sur le'},
    {start: 4.3, end: 5.6, text: 'Caucase, aux confins'},
    {start: 5.6, end: 6.9, text: "de l'Europe."},
    {start: 7.2, end: 8.6, text: 'Au cœur de'},
    {start: 8.6, end: 10.1, text: 'la Svanétie, en Géorgie,'},
    {start: 10.3, end: 11.4, text: 'se cache'},
    {start: 11.4, end: 12.8, text: 'Ushguli.'},
    {start: 13.2, end: 14.6, text: 'Perché à plus'},
    {start: 14.6, end: 16.0, text: 'de 2 000 mètres,'},
    {start: 16.0, end: 17.4, text: "c'est l'un des villages"},
    {start: 17.4, end: 18.8, text: "les plus hauts d'Europe."},
    {start: 19.2, end: 20.6, text: 'Ses tours de pierre'},
    {start: 20.6, end: 22.0, text: 'le protégeaient'},
    {start: 22.0, end: 23.8, text: 'des envahisseurs.'},
    {start: 24.1, end: 25.4, text: "L'hiver, la neige"},
    {start: 25.4, end: 26.9, text: 'le coupe du monde.'},
    {start: 27.2, end: 28.6, text: 'Tu y serais allé ?'},
    {start: 28.8, end: 30.2, text: 'Abonne-toi pour'},
    {start: 30.2, end: 31.0, text: 'un trésor caché'},
    {start: 31.0, end: 31.9, text: 'par semaine.'},
  ] as SubtitleSegment[],
};
