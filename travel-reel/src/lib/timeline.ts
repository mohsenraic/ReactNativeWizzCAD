import type {Beat, FactIcon, PlaceData, Word} from '../data/types';

export type Motion = 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' | 'parallax';
export type Transition = 'fade' | 'zoomThrough' | 'slide';

export type Shot = {
  src: string;
  start: number;
  end: number;
  motion: Motion;
  /** Entry transition (the exit uses the next shot's entry) */
  enter: Transition;
  exit: Transition | null;
  focus: {x: number; y: number};
};

export type CaptionChunk = {start: number; end: number; words: Word[]};

export type Timeline = {
  total: number;
  voiceEnd: number;
  hookEnd: number;
  globeStart: number;
  /** Start of the rotation -> zoom switch */
  zoomStart: number;
  zoomEnd: number;
  /** Pin drop start, and the instant it lands (on the place name) */
  pinDrop: number;
  pinLand: number;
  diveStart: number;
  diveEnd: number;
  pinOut: number;
  facts: {start: number; end: number; title: string; icon: FactIcon; index: number}[];
  endCardStart: number;
  shots: Shot[];
  captions: CaptionChunk[];
};

export const TRANSITION_SECONDS = 0.35;

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^a-z0-9']/g, '');

/** Index of the first word of `phrase` found after `after` (s), or -1 */
const findPhrase = (words: Word[], phrase: string, after: number) => {
  const target = phrase.split(/\s+/).map(norm).filter(Boolean);
  for (let i = 0; i <= words.length - target.length; i++) {
    if (words[i].start < after - 0.01) continue;
    if (target.every((t, k) => norm(words[i + k].text) === t)) return i;
  }
  return -1;
};

/** Fallback when no words.json: words spread over the audio by length */
export const estimateWords = (script: string, duration: number): Word[] => {
  const tokens = script.trim().split(/\s+/);
  const weights = tokens.map((w) => w.length + 2 + (/[.?!…]$/.test(w) ? 6 : /,$/.test(w) ? 3 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0.1;
  const span = duration - 0.2;
  return tokens.map((text, i) => {
    const len = (weights[i] / total) * span;
    const w = {text, start: acc, end: acc + len * 0.85};
    acc += len;
    return w;
  });
};

const resolveBeat = (words: Word[], beat: Beat, after: number, fallback: number) => {
  const i = findPhrase(words, beat.phrase, after);
  if (i < 0) {
    // eslint-disable-next-line no-console
    console.warn(`[timeline] phrase not found in voiceover: "${beat.phrase}" — using ${fallback.toFixed(2)}s`);
    return {time: fallback + (beat.offset ?? 0), index: -1};
  }
  return {time: words[i].start + (beat.offset ?? 0), index: i};
};

/** Subtitles: 2 to 4 words, cut on punctuation and pauses */
const buildCaptions = (words: Word[]): CaptionChunk[] => {
  const chunks: CaptionChunk[] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const strongPunct = /[.?!…]$/.test(w.text);
    const comma = /,$/.test(w.text);
    const gap = next ? next.start - w.end : Infinity;
    // Words left in the current sentence after this one
    let left = 0;
    for (let k = i + 1; k < words.length; k++) {
      left++;
      if (/[.?!…]$/.test(words[k].text)) break;
    }
    const cut =
      cur.length >= 4 ||
      // 3 + 2 rather than 4 + 1 (no orphan word)
      (cur.length === 3 && left === 2) ||
      !next ||
      ((strongPunct || gap > 0.45) && cur.length >= 1) ||
      (comma && cur.length >= 2);
    if (cut) {
      chunks.push({start: cur[0].start, end: w.end, words: cur});
      cur = [];
    }
  });
  // Merge single-word chunks into a neighbour when possible (2–4 words)
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    if (c.words.length === 1) {
      const prev = chunks[i - 1];
      const next = chunks[i + 1];
      if (next && next.words.length < 4 && !/[.?!…]$/.test(c.words[0].text)) {
        next.words.unshift(...c.words);
        next.start = c.start;
        chunks.splice(i, 1);
        i--;
      } else if (prev && prev.words.length < 4) {
        prev.words.push(...c.words);
        prev.end = c.end;
        chunks.splice(i, 1);
        i--;
      }
    }
  }
  // Each chunk stays until the next one (or 0.5 s after its last word)
  chunks.forEach((c, i) => {
    const next = chunks[i + 1];
    c.end = next ? Math.min(next.start, c.end + 0.6) : c.end + 0.6;
  });
  return chunks;
};

const MOTIONS: Motion[] = ['zoomIn', 'panRight', 'zoomOut', 'parallax', 'panLeft'];
const TRANSITIONS: Transition[] = ['zoomThrough', 'slide', 'fade'];

export const buildTimeline = (
  data: PlaceData,
  audioDuration: number,
  rawWords: Word[] | null,
  photoFiles: string[],
): Timeline => {
  const words = rawWords && rawWords.length ? rawWords : estimateWords(data.script, audioDuration);
  const voiceEnd = Math.max(audioDuration, words[words.length - 1].end);
  const total = voiceEnd + data.tailSeconds;

  // --- Beats ---------------------------------------------------------------
  const globe = resolveBeat(words, data.beats.globe, 0, Math.min(2, total * 0.07));
  const pin = resolveBeat(words, data.beats.pin, globe.time, globe.time + 3);
  const pinWords = data.beats.pin.phrase.split(/\s+/).length;
  // The pin lands on the last word of the phrase (e.g. "Ksamil")
  const pinLand =
    pin.index >= 0 ? words[Math.min(words.length - 1, pin.index + pinWords - 1)].start : pin.time + 0.5;
  const pinDrop = pinLand - 0.45;

  const factBeats: {time: number; f: PlaceData['facts'][number]}[] = [];
  let after = pinLand;
  data.facts.forEach((f, i) => {
    const r = resolveBeat(words, f, after, pinLand + 1.5 + i * 4);
    factBeats.push({time: r.time, f});
    after = r.time + 0.1;
  });
  const endCard = resolveBeat(words, data.beats.endCard, after, voiceEnd - 2.5);
  const endCardStart = endCard.time - 0.1;

  const globeStart = globe.time - 0.1;
  const hookEnd = globeStart;
  const zoomEnd = Math.max(globeStart + 1.2, pinDrop - 0.1);
  const zoomStart = globeStart + (zoomEnd - globeStart) * 0.42;
  const firstFact = factBeats.length ? factBeats[0].time : endCardStart;
  const diveStart = Math.max(pinLand + 0.5, Math.min(pinLand + 1.0, firstFact - 0.75));
  const diveEnd = diveStart + 0.6;
  const pinOut = Math.min(firstFact - 0.05, diveEnd + 0.9);

  const facts = factBeats.map((b, i) => ({
    start: b.time,
    end: (factBeats[i + 1]?.time ?? endCardStart) - 0.15,
    title: b.f.title,
    icon: b.f.icon,
    index: i + 1,
  }));

  // --- Photo shots -----------------------------------------------------------
  const photos = [...photoFiles].sort();
  const hero = data.photos.hero && photos.includes(data.photos.hero) ? data.photos.hero : photos[0];
  const others = photos.filter((p) => p !== hero);
  // The hero opens and closes the video; it also joins the rotation (after
  // the others) so that few photos still give variety
  const pool = others.length ? [...others, hero] : photos;

  // Segments: from the dive to the end card, cut at each fact
  const bounds = [diveStart + 0.2, ...facts.map((f) => f.start), endCardStart];
  const segments: [number, number][] = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const [a, b] = [bounds[i], bounds[i + 1]];
    if (b - a <= 0.05) continue;
    const last = segments[segments.length - 1];
    if (last && (b - a < 1.4 || last[1] - last[0] < 1.4)) last[1] = b;
    else segments.push([a, b]);
  }

  const shots: Shot[] = [];
  const useCount: Record<string, number> = {};
  let photoCursor = 0;
  segments.forEach(([a, b]) => {
    const n = Math.max(1, Math.ceil((b - a) / data.photos.maxShotSeconds));
    for (let k = 0; k < n; k++) {
      const prev = shots[shots.length - 1];
      const isLastShot = segments[segments.length - 1][1] === b && k === n - 1;
      let src = pool[photoCursor % pool.length];
      // never the same photo twice in a row, and not the hero right before the end card
      if ((prev && src === prev.src) || (isLastShot && src === hero && pool.length > 1)) {
        src = pool[++photoCursor % pool.length];
      }
      photoCursor++;
      const uses = (useCount[src] = (useCount[src] ?? 0) + 1);
      const base = data.photos.hints[src]?.focus ?? {x: 50, y: 50};
      // A reused photo gets a different crop
      const shift = uses === 1 ? 0 : uses % 2 === 0 ? 12 : -12;
      let motion = MOTIONS[shots.length % MOTIONS.length];
      if (prev && prev.motion === motion) motion = MOTIONS[(shots.length + 1) % MOTIONS.length];
      shots.push({
        src,
        start: a + ((b - a) * k) / n,
        end: a + ((b - a) * (k + 1)) / n,
        motion,
        enter: shots.length === 0 ? 'zoomThrough' : TRANSITIONS[shots.length % TRANSITIONS.length],
        exit: null,
        focus: {x: Math.min(85, Math.max(15, base.x + shift)), y: base.y},
      });
    }
  });
  shots.forEach((s, i) => {
    s.exit = shots[i + 1]?.enter ?? 'fade';
  });

  return {
    total,
    voiceEnd,
    hookEnd,
    globeStart,
    zoomStart,
    zoomEnd,
    pinDrop,
    pinLand,
    diveStart,
    diveEnd,
    pinOut,
    facts,
    endCardStart,
    shots,
    captions: buildCaptions(words),
  };
};

export const heroPhoto = (data: PlaceData, photoFiles: string[]) => {
  const photos = [...photoFiles].sort();
  return data.photos.hero && photos.includes(data.photos.hero) ? data.photos.hero : photos[0];
};
