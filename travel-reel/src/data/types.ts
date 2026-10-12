export type Camera = {lon: number; lat: number; scale: number};

export type FactIcon = 'wave' | 'swim' | 'column' | 'price';

export type Beat = {
  /** Phrase of the voiceover the beat is anchored on */
  phrase: string;
  /** Shift in seconds (negative = earlier) */
  offset?: number;
};

export type PlaceData = {
  compositionId: string;
  place: {
    name: string;
    country: string;
    flag: string;
    countryIsoNumeric: string;
    lat: number;
    lon: number;
  };
  script: string;
  audio: {
    voiceover: string;
    words: string;
    music: string;
    musicVolume: number;
    musicDuckedVolume: number;
  };
  tailSeconds: number;
  hook: {text: string; accentWords: string[]};
  beats: {globe: Beat; pin: Beat; endCard: Beat};
  globe: {
    from: Camera;
    country: Camera;
    zoomTo: Camera;
    labels: {text: string; lon: number; lat: number}[];
  };
  pinLabel: string;
  facts: (Beat & {title: string; icon: FactIcon})[];
  endCard: {text: string};
  photos: {
    hero?: string;
    hints: Record<string, {focus?: {x: number; y: number}}>;
    maxShotSeconds: number;
  };
  theme: {turquoise: string; navy: string; white: string; sand: string};
  layout: {safeTop: number; safeBottom: number; captionsY: number};
};

export type Word = {text: string; start: number; end: number};

/** Props computed by calculateMetadata (from the audio file) */
export type ReelProps = {
  audioDuration: number;
  words: Word[] | null;
};
