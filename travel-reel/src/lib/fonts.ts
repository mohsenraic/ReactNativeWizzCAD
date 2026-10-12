import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadEmoji} from '@remotion/google-fonts/NotoColorEmoji';

const montserrat = loadMontserrat('normal', {
  weights: ['600', '700', '800'],
  subsets: ['latin', 'latin-ext'],
});
const emoji = loadEmoji('normal', {subsets: ['emoji']});

/** Montserrat + color emoji (flags, 👇) */
export const FONT = `${montserrat.fontFamily}, ${emoji.fontFamily}`;
export const W_SEMIBOLD = 600;
export const W_EXTRABOLD = 800;
