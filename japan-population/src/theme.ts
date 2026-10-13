/**
 * theme.ts — palette, typography and shared motion constants.
 */
import { getInputProps, staticFile } from 'remotion';
import { loadFont as loadLocalFont } from '@remotion/fonts';
import { loadFont as loadOswald } from '@remotion/google-fonts/Oswald';
import { loadFont as loadPlexSans } from '@remotion/google-fonts/IBMPlexSans';
import { loadFont as loadPlexMono } from '@remotion/google-fonts/IBMPlexMono';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';

export const COLORS = {
  paper: '#EFEAE0',
  paperShade: '#E3DCCD',
  charcoal: '#1C1C1E',
  charcoalShade: '#2A2A2D',
  ink: '#1A1A1A',
  inkSoft: '#4A4743',
  highlighter: '#FFE14D',
  red: '#C8102E',
  slate: '#3A5A78',
  slateLight: '#7C93A8',
  grey: '#9A958C',
  greyLight: '#C9C3B8',
  greyDark: '#6B675F',
  white: '#FFFFFF',
  cutoutBorder: '#FBFAF6',
} as const;

export type Tone = 'light' | 'dark';

/** Foreground colours that read on each background. */
export const toneColors = (tone: Tone) =>
  tone === 'dark'
    ? { fg: '#F2EEE6', muted: '#A9A49B', grid: 'rgba(242,238,230,0.12)', bg: COLORS.charcoal }
    : { fg: COLORS.ink, muted: COLORS.greyDark, grid: 'rgba(26,26,26,0.10)', bg: COLORS.paper };

/**
 * Fonts come from @remotion/google-fonts by default. Pass the input prop `fonts: "local"` to use
 * the copies in public/fonts instead (run `npm run fonts:local` once) — useful for offline or
 * locked-down render machines.
 */
const FONT_SOURCE: 'google' | 'local' = (getInputProps() as { fonts?: string }).fonts === 'local' ? 'local' : 'google';

const LOCAL_FONTS = [
  { family: 'Oswald', file: 'oswald', weights: ['500', '700'] },
  { family: 'IBM Plex Sans', file: 'plexsans', weights: ['400', '500', '600'] },
  { family: 'IBM Plex Mono', file: 'plexmono', weights: ['400', '500'] },
  { family: 'Caveat', file: 'caveat', weights: ['500', '700'] },
] as const;

const loadFonts = () => {
  if (FONT_SOURCE === 'local') {
    for (const f of LOCAL_FONTS)
      for (const w of f.weights) loadLocalFont({ family: f.family, url: staticFile(`fonts/${f.file}-${w}.woff2`), weight: w });
    return { headline: 'Oswald', body: 'IBM Plex Sans', mono: 'IBM Plex Mono', hand: 'Caveat' };
  }
  return {
    headline: loadOswald('normal', { weights: ['500', '700'], subsets: ['latin'] }).fontFamily,
    body: loadPlexSans('normal', { weights: ['400', '500', '600'], subsets: ['latin'] }).fontFamily,
    mono: loadPlexMono('normal', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily,
    hand: loadCaveat('normal', { weights: ['500', '700'], subsets: ['latin'] }).fontFamily,
  };
};

export const FONTS = loadFonts();

/** Spring presets. `cutout` has a small overshoot, `stamp` lands hard. */
export const SPRINGS = {
  cutout: { damping: 11, stiffness: 170, mass: 0.7 },
  smooth: { damping: 200, stiffness: 100, mass: 1 },
  snappy: { damping: 18, stiffness: 220, mass: 0.6 },
  stamp: { damping: 9, stiffness: 320, mass: 0.9 },
} as const;

export const SAFE_MARGIN = 96; // px, title-safe inset at 1920×1080
