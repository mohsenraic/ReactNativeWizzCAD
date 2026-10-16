/**
 * types.ts — dataset conventions shared by every video.
 *
 * Every on-screen number lives in a typed `Dataset` with a short source tag and a status:
 *   'verified'    every value confirmed
 *   'toVerify'    mostly confirmed; individual TODOs remain
 *   'placeholder' contains stand-in values → <SourceTag> prints "⚠ PLACEHOLDER" in renders
 */

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

/** Linear interpolation on a year-sorted series (clamped at both ends). */
export const valueAt = (series: YearValue[], year: number): number => {
  if (year <= series[0].year) return series[0].value;
  for (let i = 1; i < series.length; i++) {
    const a = series[i - 1];
    const b = series[i];
    if (year <= b.year) return a.value + ((b.value - a.value) * (year - a.year)) / (b.year - a.year);
  }
  return series[series.length - 1].value;
};

/** Names of datasets in `all` whose status is 'placeholder'. */
export const placeholdersIn = (all: Record<string, { status: DataStatus }>): string[] =>
  Object.entries(all)
    .filter(([, d]) => d.status === 'placeholder')
    .map(([k]) => k);

// ─────────────────────────────────────────────────────────────────────────────
// Photos — every photo a video uses is registered with its licence (see uzbekistan/src/data/photos.ts).
// ─────────────────────────────────────────────────────────────────────────────

/** Open licences we accept for photos (Wikimedia Commons, Unsplash, Pexels, Pixabay). */
export type PhotoLicense =
  | 'CC0'
  | 'Public domain'
  | 'CC BY 2.0'
  | 'CC BY 3.0'
  | 'CC BY 4.0'
  | 'CC BY-SA 2.0'
  | 'CC BY-SA 3.0'
  | 'CC BY-SA 4.0'
  | 'Unsplash License'
  | 'Pexels License'
  | 'Pixabay Content License';

export interface PhotoCandidate {
  sourceUrl: string;
  author: string;
  license: PhotoLicense;
}

export interface PhotoCredit {
  id: string;
  /** File name in the video's public/photos/. */
  file: string;
  subject: string;
  /** File page (e.g. Wikimedia Commons). */
  sourceUrl: string;
  author: string;
  license: PhotoLicense;
  licenseUrl: string;
  /** Ready-to-print credit line (TASL: title, author, source, licence). */
  attributionText: string;
  /** Pixel size of the file in public/photos/. */
  width: number;
  height: number;
  /** Date taken, from the file page. */
  taken?: string;
  /** Crop / treatment notes for the scenes. */
  notes?: string;
  alternates: PhotoCandidate[];
}
