/**
 * theme.ts — El Niño palette, passed to every shared component through <ThemeProvider theme={elninoTheme}>.
 */
import { interpolateColors } from 'remotion';
import { extendTheme, japanTheme } from '../../shared/theme';

export const PALETTE = {
  paper: '#EFEAE0',
  navy: '#14213D',
  navyLight: '#22335A',
  ink: '#1A1A1A',
  onDark: '#F2EEE6',
  highlighter: '#FFE14D',
  warm: '#E4572E',
  cool: '#2E86AB',
  drought: '#C9A227',
  flood: '#1B998B',
  grey: '#9A958C',
  greyDark: '#6B675F',
  /** Muted land on navy paper. */
  landOnNavy: '#3A4B70',
  landOnNavyBorder: '#14213D',
  /** Muted land on warm paper. */
  landOnPaper: '#D9D2C4',
} as const;

export const elninoTheme = extendTheme(japanTheme, {
  colors: {
    paperDark: PALETTE.navy,
    accent: PALETTE.warm,
    accentLight: '#F28B6B',
    accentDeep: '#9A2E12',
    secondary: PALETTE.cool,
    land: PALETTE.landOnPaper,
  },
  tones: {
    dark: { bg: PALETTE.navy, fg: PALETTE.onDark, muted: '#9FA9BD', grid: 'rgba(242,238,230,0.12)' },
  },
});

/** Diverging sea-temperature scale: −1 → cool, 0 → paper, +1 → warm. */
export const sstColor = (v: number): string =>
  interpolateColors(Math.max(-1, Math.min(1, v)), [-1, -0.35, 0, 0.35, 1], [PALETTE.cool, '#8EC1D6', PALETTE.paper, '#F0A07A', PALETTE.warm]);
