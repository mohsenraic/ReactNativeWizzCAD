import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {FONTS} from '../config';

const montserrat = loadMontserrat('normal', {
  weights: ['500', '600', '700', '800', '900'],
  subsets: ['latin', 'latin-ext'],
});

const inter = loadInter('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['latin', 'latin-ext'],
});

const families = {
  Montserrat: montserrat.fontFamily,
  Inter: inter.fontFamily,
};

export const displayFont = families[FONTS.display];
export const bodyFont = families[FONTS.body];
