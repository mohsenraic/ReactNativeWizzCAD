/**
 * theme.ts — Uzbekistan palette, passed to every shared component through <ThemeProvider theme={uzbekistanTheme}>.
 */
import { extendTheme, japanTheme } from '../../shared/theme';

export const PALETTE = {
  paper: '#EFEAE0',
  /** Night / desert scenes. */
  lapisPaper: '#1B2F5B',
  turquoise: '#1F8A9E',
  turquoiseLight: '#5FB8C6',
  lapis: '#26619C',
  saffron: '#D9A441',
  terracotta: '#B5523B',
  ink: '#1A1A1A',
  onDark: '#F2EEE6',
  highlighter: '#FFE14D',
  /** The open-loop "?" cutout. */
  questionRed: '#C0392B',
  grey: '#9A958C',
  greyLight: '#C9C3B8',
  greyDark: '#6B675F',
  /** Muted land on warm paper / on lapis paper. */
  landOnPaper: '#D9D2C4',
  landOnLapis: '#3D5E96',
  tileWhite: '#F7F3EA',
} as const;

/** Tile colours for the geometric patterns, in the order they are cycled. */
export const TILE_COLORS = [PALETTE.turquoise, PALETTE.lapis, PALETTE.saffron, PALETTE.tileWhite, PALETTE.terracotta] as const;

export const uzbekistanTheme = extendTheme(japanTheme, {
  colors: {
    paperDark: PALETTE.lapisPaper,
    highlighter: PALETTE.highlighter,
    accent: PALETTE.terracotta,
    accentLight: '#D07A63',
    accentDeep: '#7E3324',
    secondary: PALETTE.turquoise,
    land: PALETTE.landOnPaper,
  },
  tones: {
    dark: { bg: PALETTE.lapisPaper, fg: PALETTE.onDark, muted: '#A9B4CC', grid: 'rgba(242,238,230,0.12)' },
  },
});
