/**
 * format.ts — number formatting for on-screen counters.
 * Uses a true minus sign (U+2212) so negative numbers align with digits in Oswald / Plex.
 */

export const MINUS = '−';

export interface FormatOptions {
  decimals?: number;
  /** 'auto' → minus only; 'always' → + or −; 'never' → absolute value. */
  sign?: 'auto' | 'always' | 'never';
  locale?: string;
  /** Group thousands (1,234,567). Default true. */
  grouping?: boolean;
}

export const formatNumber = (
  value: number,
  { decimals = 0, sign = 'auto', locale = 'en-US', grouping = true }: FormatOptions = {},
): string => {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  const abs = Math.abs(rounded);
  const body = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  }).format(abs);
  if (sign === 'never' || rounded === 0) return body;
  if (rounded < 0) return MINUS + body;
  return sign === 'always' ? `+${body}` : body;
};

/** 671236 → "671K", 1589489 → "1.6M" (decimals apply to millions; thousands are whole). */
export const formatCompact = (value: number, decimals = 0): string => {
  const abs = Math.abs(value);
  const s = value < 0 ? MINUS : '';
  if (abs >= 1e6) return `${s}${(abs / 1e6).toFixed(decimals || (abs % 1e6 === 0 ? 0 : 1))}M`;
  if (abs >= 1e3) return `${s}${Math.round(abs / 1e3)}K`;
  return `${s}${abs.toFixed(decimals)}`;
};
