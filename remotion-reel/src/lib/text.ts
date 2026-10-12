const NBSP = ' ';

/**
 * Découpe un texte en mots. Les nombres à séparateur de milliers (« 2 000 »)
 * et la ponctuation haute française (« allé ? ») restent attachés.
 */
export const splitWords = (text: string): string[] => {
  const raw = text.trim().split(/\s+/);
  const out: string[] = [];
  for (const w of raw) {
    const prev = out[out.length - 1];
    const thousands = prev && /^\d{1,3}$/.test(prev) && /^\d{3}\D*$/.test(w);
    const punctuation = prev && /^[?!:;»]+$/.test(w);
    if (thousands || punctuation) {
      out[out.length - 1] = `${prev}${NBSP}${w}`;
    } else {
      out.push(w);
    }
  }
  return out;
};

const normalize = (w: string) =>
  w
    .toLowerCase()
    .replace(/[\s  ]/g, ' ')
    .replace(/^[«"'(\s]+|[»"'.,;:!?)\s]+$/g, '');

/** Le mot fait-il partie de la liste d'accents ? (insensible à la casse et à la ponctuation) */
export const isAccent = (word: string, accents: readonly string[]) => {
  const n = normalize(word);
  return accents.some((a) => {
    const na = normalize(a);
    return n === na || n.endsWith(`'${na}`) || n.endsWith(`’${na}`);
  });
};

/** 2000 -> « 2 000 » (espace insécable) */
export const formatNumberFr = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
