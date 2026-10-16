/**
 * timings.ts — every scene length and narration cue for the Uzbekistan video, in SECONDS.
 *
 * This is the only file to edit after the voiceover is recorded:
 *   1. set each scene's `seconds` to the real length of its narration paragraph (+ breathing room);
 *   2. nudge cue times (seconds from the start of that scene) to where the phrase in the comment is spoken.
 * Scenes never hard-code frames: they call cue('s04', 'registan') and everything follows.
 *
 * Current values: FITTED to public/voiceover.wav by scripts/voiceover/fit_timings.py (re-run after re-recording).
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Seconds → frames (rounded). */
export const sec = (s: number): number => Math.round(s * FPS);

/** Chapter cards overlay the first frames of their scene (≤ 1.5 s, punchy). */
export const CHAPTER_CARD_SECONDS = 1.4;
export const CHAPTER_CARD_FRAMES = sec(CHAPTER_CARD_SECONDS);

/** Visual "breath" held at the end of a scene that carries a mid-roll ad marker. */
export const BREATH_SECONDS = 0.5;

/** Retention rule: something must change on screen at least this often. */
export const MAX_STATIC_SECONDS = 6;

/** Last N seconds of the video stay clean on the right for YouTube end-screen elements. */
export const END_SCREEN_SECONDS = 10;

export interface SceneTiming {
  id: SceneId;
  name: string;
  seconds: number;
  chapter?: { number: number; title: string; titleSize?: number };
  /** Narration anchors: seconds from the start of the scene. */
  cues: Record<string, number>;
}

export type SceneId = 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07' | 's08' | 's09' | 's10';

export const SCENES = [
  {
    id: 's01',
    name: 'ColdOpen',
    seconds: 33.57,
    cues: {
      blueDomes: 7.2, // “Blue domes…”
      beforeRome: 11.6, // “before the Roman Empire…”
      millions: 15.1, // “millions of travelers…”
      whyNotHeard: 17.5, // “So why haven't…”
      howDidItGo: 20.5, // “And how did it go…”
      fewYears: 21.6, // “in just a few years…”
      mostClosed: 23.7, // “most closed…”
      fastestGrowing: 26.0, // “fastest-growing…”
      roads: 29.2, // “story about roads…”
      ancientNew: 30.6, // “An ancient one…”
    },
  },
  {
    id: 's02',
    name: 'TheNumbers',
    seconds: 63.4,
    chapter: { number: 1, title: "THE BOOM" },
    cues: {
      numbers: 0.5, // “Let's start…”
      total2025: 4.2, // “eleven point seven…”
      record: 7.2, // “That's a record…”
      plus37: 8.4, // “three point seven million more…”
      pct47: 12.3, // “almost forty-seven…”
      april: 15.6, // “In April…”
      firstTimeEver: 16.7, // “for the first time ever…”
      singleMonth: 19.9, // “in a single month…”
      started2026: 22.2, // “twenty twenty-six started…”
      decadeAgo: 25.3, // “a decade ago…”
      catch: 27.2, // “But here's the catch…”
      whereFrom: 33.1, // “where these visitors…”
      threeOfFour: 37.4, // “Kyrgyzstan, Tajikistan…”
      neighbors: 43.4, // “Many of them are neighbors…”
      crossBorder: 44.5, // “crossing the border…”
      realStory: 47.8, // “So the real story…”
      furtherAway: 51.9, // “much further away…”
      regions: 53.4, // “From Europe…”
      flying: 56.9, // “Flying thousands…”
      question: 61.4, // “So what exactly…”
    },
  },
  {
    id: 's03',
    name: 'SilkRoad',
    seconds: 46.06,
    chapter: { number: 2, title: "THE MIDDLE OF THE MAP", titleSize: 110 },
    cues: {
      map: 1.8, // “look at a map…”
      middle: 4.9, // “middle of Eurasia…”
      doublyLandlocked: 10.0, // “doubly landlocked…”
      twoBorders: 13.3, // “at least two borders…”
      disadvantage: 16.0, // “sounds like a disadvantage…”
      silkRoad: 21.6, // “heart of the Silk Road…”
      network: 23.3, // “the network of trade…”
      goods: 28.6, // “Silk, spices…”
      placesToStop: 34.0, // “places to stop…”
      richest: 38.9, // “richest cities…”
      threeStanding: 41.0, // “Three of them…”
      nothingElse: 44.1, // “like nothing else…”
    },
  },
  {
    id: 's04',
    name: 'Samarkand',
    seconds: 49.9,
    cues: {
      samarkand: 0.3, // “The first is Samarkand…”
      asOldAsRome: 5.0, // “as old as Rome…”
      timur: 8.0, // “the conqueror Timur…”
      empire: 12.7, // “stretching from Turkey…”
      craftsmen: 16.1, // “best architects…”
      mission: 20.8, // “one mission…”
      descendants: 26.2, // “descendants kept…”
      registan: 29.1, // “the Registan…”
      tiles: 32.8, // “millions of turquoise…”
      ulughBeg: 36.6, // “Ulugh Beg…”
      yearLength: 41.3, // “measured the length…”
      precision: 43.5, // “astonishing precision…”
      scientific: 48.1, // “scientific capitals…”
    },
  },
  {
    id: 's05',
    name: 'Bukhara',
    seconds: 34.9,
    cues: {
      bukhara: 0.3, // “The second is Bukhara…”
      living: 5.1, // “living city…”
      walking: 10.9, // “walking through…”
      streets: 14.1, // “domed bazaars…”
      kalyan: 21.0, // “Kalyan Minaret…”
      built1127: 22.3, // “eleven twenty-seven…”
      legend: 23.6, // “Legend says…”
      genghis: 24.6, // “Genghis Khan…”
      lookedUp: 26.7, // “looked up…”
      spared: 29.4, // “ordered it spared…”
      burned: 30.7, // “Almost everything…”
      stillStanding: 33.0, // “The minaret is still…”
    },
  },
  {
    id: 's06',
    name: 'Khiva',
    seconds: 35.54,
    cues: {
      khiva: 1.0, // “there's Khiva…”
      desert: 4.2, // “edge of the desert…”
      walls: 8.3, // “mud-brick walls…”
      inside: 9.6, // “Inside, mosques…”
      packed: 12.4, // “packed into…”
      fifteen: 16.8, // “fifteen minutes…”
      unesco: 18.7, // “first site in Central Asia…”
      sunset: 22.6, // “At sunset…”
      turnsGold: 24.0, // “turns gold…”
      filmSet: 27.4, // “film set…”
      question: 30.3, // “So if Uzbekistan…”
    },
  },
  {
    id: 's07',
    name: 'TheOpening',
    seconds: 73.82,
    chapter: { number: 3, title: "WHY NOW" },
    cues: {
      hard: 2.3, // “getting here was hard…”
      soviet: 6.3, // “Soviet Union…”
      independence: 9.3, // “After independence…”
      hardest: 12.6, // “hardest countries…”
      paperwork: 14.9, // “complicated visas…”
      currency: 17.6, // “a currency that…”
      y2016: 21.2, // “twenty sixteen…”
      openUp: 24.1, // “began to open up…”
      fast: 25.7, // “Fast.…”
      threeChanges: 26.9, // “Three changes…”
      visas: 28.7, // “First: visas…”
      evisa: 33.1, // “electronic visas…”
      visaFree: 34.4, // “visa-free entry…”
      ninety: 39.6, // “around ninety…”
      passport: 44.2, // “nothing more than a passport…”
      trains: 46.3, // “Second: trains…”
      afrosiyob: 48.1, // “The Afrosiyob…”
      fullDay: 53.8, // “full day by road…”
      fewHours: 54.6, // “now takes just…”
      threeCities: 56.6, // “you can see the three…”
      singleWeek: 58.1, // “single week…”
      flights: 59.0, // “Third: flights…”
      hotels: 63.6, // “renovated airports…”
      cheaper: 66.6, // “cheaper and easier…”
      message: 69.0, // “The message is simple…”
      open: 70.4, // “Uzbekistan is open…”
      forVisitors: 72.5, // “and for visitors…”
    },
  },
  {
    id: 's08',
    name: 'BeyondTheDomes',
    seconds: 70.87,
    chapter: { number: 4, title: "THE SURPRISES" },
    cues: {
      surprised: 1.8, // “many are surprised…”
      food: 6.0, // “Start with the food…”
      plov: 7.7, // “national dish is plov…”
      cauldrons: 12.0, // “giant cauldrons…”
      feedHundreds: 14.2, // “feed hundreds…”
      unesco: 18.3, // “UNESCO recognized…”
      tashkent: 23.0, // “Then there's Tashkent…”
      metro: 27.8, // “beautiful metro…”
      palaces: 34.3, // “underground palaces…”
      tianShan: 37.1, // “the Tian Shan…”
      twoHours: 42.4, // “less than two hours…”
      fergana: 46.2, // “Fergana Valley…”
      ceramics: 48.7, // “making ceramics…”
      moynaq: 51.8, // “in the far west…”
      haunting: 54.2, // “most haunting…”
      oldPort: 56.0, // “old port of Moynaq…”
      ships: 57.5, // “rusting ships…”
      aral: 60.3, // “what's left of the Aral…”
      montage: 63.2, // “Ancient cities.…”
      oneCountry: 69.3, // “All in one country…”
    },
  },
  {
    id: 's09',
    name: 'TheFuture',
    seconds: 38.62,
    chapter: { number: 5, title: "WHAT'S NEXT" },
    cues: {
      next: 0.8, // “what comes next…”
      target: 3.3, // “twenty million…”
      unTourism: 6.8, // “UN Tourism…”
      twoThirds: 9.1, // “two-thirds higher…”
      notEasy: 12.2, // “won't be easy…”
      hotels: 13.4, // “Hotels and guides…”
      overtourism: 17.8, // “overtourism…”
      venice: 20.4, // “Venice…”
      awareness: 23.9, // “convince travelers…”
      blankSpace: 26.6, // “blank space…”
      momentum: 29.3, // “momentum is real…”
      everyRoute: 30.7, // “Every new route…”
      photos: 34.4, // “photos of those blue domes…”
    },
  },
  {
    id: 's10',
    name: 'Outro',
    seconds: 38.23,
    cues: {
      centuries: 0.3, // “For centuries…”
      merchants: 3.6, // “Merchants…”
      cutOff: 9.0, // “cut off…”
      roadsOpen: 10.7, // “roads are open…”
      notNew: 13.0, // “isn't a new destination…”
      rediscovering: 15.7, // “ancient one, that…”
      wondering: 19.1, // “if you're wondering…”
      beforeEveryone: 20.3, // “before everyone else…”
      middleOfMap: 22.5, // “middle of the map…”
    },
  },
] as const satisfies readonly SceneTiming[];

type SceneOf<S extends SceneId> = Extract<(typeof SCENES)[number], { id: S }>;
export type CueName<S extends SceneId> = keyof SceneOf<S>['cues'] & string;

const byId = <S extends SceneId>(id: S): SceneOf<S> => SCENES.find((s) => s.id === id) as SceneOf<S>;

/** Scene length in frames. */
export const sceneFrames = (id: SceneId): number => sec(byId(id).seconds);

/** First frame of a scene in the full video. */
export const sceneStart = (id: SceneId): number => {
  let f = 0;
  for (const s of SCENES) {
    if (s.id === id) return f;
    f += sec(s.seconds);
  }
  throw new Error(`Unknown scene ${id}`);
};

/** Frame (relative to the scene) where a narration cue lands, plus an optional offset in seconds. */
export const cue = <S extends SceneId>(id: S, name: CueName<S>, offsetSeconds = 0): number =>
  sec((byId(id).cues as Record<string, number>)[name] + offsetSeconds);

export const TOTAL_FRAMES = SCENES.reduce((n, s) => n + sec(s.seconds), 0);
export const TOTAL_SECONDS = TOTAL_FRAMES / FPS;

/**
 * Open loops: a question asked on screen stays pinned (the red "?" cutout) until it is answered.
 * Scenes read these to know when to show / retire the pin.
 */
export const OPEN_LOOPS = [
  { id: 'whyUnknown', asked: { scene: 's01', cue: 'whyNotHeard' }, answered: { scene: 's07', cue: 'hard' } },
  { id: 'comingFor', asked: { scene: 's02', cue: 'question' }, answered: { scene: 's03', cue: 'silkRoad' } },
  { id: 'whyNow', asked: { scene: 's06', cue: 'question' }, answered: { scene: 's07', cue: 'open' } },
] as const;

/**
 * Suggested mid-roll ad breaks: natural pauses right after an open question or at a chapter end.
 * Each scene ends with a BREATH_SECONDS hold (no new element, camera settles) so the break feels intentional.
 * Place the YouTube mid-roll marker at `timestamp` (= end of the scene).
 */
export const AD_BREAK_SCENES: Array<{ after: SceneId; reason: string }> = [
  { after: 's02', reason: 'End of chapter 1, right after "So what exactly are they coming for?"' },
  { after: 's06', reason: 'Right after "…why are tourists only arriving now?" (the big red "?")' },
  { after: 's08', reason: 'End of chapter 4 montage, "All in one country."' },
];

const mmss = (frames: number): string => {
  const s = Math.round(frames / FPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const AD_BREAKS = AD_BREAK_SCENES.map((b) => {
  const end = sceneStart(b.after) + sceneFrames(b.after);
  return { ...b, frame: end, breathFrom: end - sec(BREATH_SECONDS), timestamp: mmss(end) };
});

/** Scenes whose last BREATH_SECONDS should hold still. */
export const hasBreath = (id: SceneId): boolean => AD_BREAK_SCENES.some((b) => b.after === id);

/**
 * Gaps longer than MAX_STATIC_SECONDS between consecutive visual beats (cues + extra beats a scene adds).
 * Used by scripts/check-timings.ts and by the scenes in dev: an empty array means the retention rule holds.
 */
export const retentionGaps = (
  extraBeats: Partial<Record<SceneId, number[]>> = {},
): Array<{ scene: SceneId; from: number; to: number; gap: number }> => {
  const out: Array<{ scene: SceneId; from: number; to: number; gap: number }> = [];
  for (const s of SCENES) {
    const beats = [0, ...Object.values(s.cues as Record<string, number>), ...(extraBeats[s.id] ?? []), s.seconds].sort((a, b) => a - b);
    for (let i = 1; i < beats.length; i++) {
      const gap = +(beats[i] - beats[i - 1]).toFixed(2);
      if (gap > MAX_STATIC_SECONDS) out.push({ scene: s.id, from: beats[i - 1], to: beats[i], gap });
    }
  }
  return out;
};
