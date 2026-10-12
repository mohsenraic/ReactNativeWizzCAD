/**
 * ============================================================================
 *  KSAMIL, ALBANIA — all the data for this Reel
 * ============================================================================
 *  To make a video about another place:
 *   1. duplicate this file (e.g. src/data/zanzibar.ts) and edit it,
 *   2. replace public/audio/voiceover.mp3 (+ voiceover.words.json),
 *   3. replace the images in public/photos/,
 *   4. point src/data/index.ts at the new file.
 *
 *  Scene timings are NOT hard-coded in seconds: each beat is anchored on a
 *  phrase of the voiceover and resolved from the word timestamps
 *  (public/audio/voiceover.words.json). A new voice = automatic re-sync.
 * ============================================================================
 */
import type {PlaceData} from './types';

export const ksamil: PlaceData = {
  compositionId: 'KsamilReel',

  place: {
    name: 'Ksamil',
    country: 'Albania',
    flag: '🇦🇱',
    /** ISO 3166-1 numeric code used by world-atlas (Albania = 008) */
    countryIsoNumeric: '008',
    lat: 39.7667,
    lon: 20.0,
  },

  /** Exact voiceover script (used as subtitle fallback when there is no words.json) */
  script:
    "Wait… is this really in Europe? Most people think this is the Maldives… but it's Ksamil, in Albania. It sits on the Ionian Sea, right across from the Greek island of Corfu. You can swim or kayak to tiny islands just off the beach. And just minutes away, the ancient city of Butrint, a UNESCO World Heritage Site. The best part? It costs a fraction of the Greek islands. Would you go here? Tell me in the comments.",

  audio: {
    voiceover: 'audio/voiceover.mp3',
    words: 'audio/voiceover.words.json',
    /** Optional: used only if the file exists */
    music: 'audio/music.mp3',
    musicVolume: 0.15,
    /** Music volume under the voice (ducking) */
    musicDuckedVolume: 0.06,
  },

  /** Seconds added after the end of the voice (end card) */
  tailSeconds: 1.2,

  hook: {
    text: 'Wow! Is this really in Europe?!',
    accentWords: ['Europe?!'],
  },

  /**
   * Story beats anchored on phrases of the voiceover. `phrase` is searched
   * (case/punctuation-insensitive) in the word timestamps, after the previous
   * beat. `offset` shifts the beat (s).
   */
  beats: {
    globe: {phrase: 'Most people think'},
    pin: {phrase: "but it's Ksamil"},
    endCard: {phrase: 'Would you go here'},
  },

  globe: {
    /** Starting point of the rotation (Atlantic) */
    from: {lon: -35, lat: 28, scale: 400},
    /** Globe stopped on the country */
    country: {lon: 20.1, lat: 41.2, scale: 430},
    /** End of the zoom (southern coast) */
    zoomTo: {lon: 20.0, lat: 39.77, scale: 13000},
    /** Region labels shown during the zoom (optional) */
    labels: [
      {text: 'ALBANIA', lon: 20.0, lat: 41.1},
      {text: 'CORFU', lon: 19.85, lat: 39.62},
      {text: 'IONIAN SEA', lon: 19.35, lat: 39.25},
    ],
  },

  pinLabel: 'KSAMIL, ALBANIA',

  facts: [
    {phrase: 'It sits on', title: 'Ionian Sea, facing Corfu', icon: 'wave'},
    {phrase: 'You can swim', title: 'Swim to tiny islands', icon: 'swim'},
    {phrase: 'And just minutes away', title: 'UNESCO site nearby', icon: 'column'},
    {phrase: 'The best part', title: 'Way cheaper than Greece', icon: 'price'},
  ],

  endCard: {
    text: 'Would you go? 👇',
  },

  /**
   * Photos: every image in public/photos/ is used automatically (sorted by
   * file name). The first one (or `hero`) opens and closes the video — put
   * the most spectacular one first. `focus` = subject to keep centered when
   * cropping to 9:16 (x, y in % of the image).
   */
  photos: {
    hero: '01-aerial-island.webp',
    hints: {
      '01-aerial-island.webp': {focus: {x: 50, y: 50}},
      '02-aerial-islands.webp': {focus: {x: 62, y: 48}},
      '03-pier.webp': {focus: {x: 51, y: 58}},
      '04-hand-sculpture.webp': {focus: {x: 53, y: 55}},
    },
    /** Max shot length (s): a visual change every 2–3 s */
    maxShotSeconds: 2.6,
  },

  theme: {
    turquoise: '#00C2C7',
    navy: '#0A1A2F',
    white: '#FFFFFF',
    sand: '#F4D9A6',
  },

  layout: {
    /** Margins kept free for the Instagram / YouTube UI (px) */
    safeTop: 200,
    safeBottom: 260,
    /** Vertical center of the subtitles (central third) */
    captionsY: 1130,
  },
};
