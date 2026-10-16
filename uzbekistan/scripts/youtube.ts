/**
 * npm run youtube — writes the YouTube texts, computed from src/timings.ts and src/data:
 *   youtube/description.md     pitch, chapters, condensed sources, photo credits — checked ≤ 5,000 characters
 *   youtube/pinned-comment.md  the full source list with every URL (comments allow 10,000 characters)
 *   ad-break timestamps for YouTube Studio (in description.md, outside the paste block)
 */
import fs from 'node:fs';
import path from 'node:path';
import { ALL_DATASETS } from '../src/data/data';
import { PHOTOS } from '../src/data/photos';
import { AD_BREAKS, FPS, SCENES, TOTAL_FRAMES, sceneStart } from '../src/timings';

const DESCRIPTION_LIMIT = 5000;
const COMMENT_LIMIT = 10000;

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ts = (frames: number) => {
  const s = Math.round(frames / FPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const title = (t: string) => t.charAt(0) + t.slice(1).toLowerCase().replace(/'s\b/, "'s");

const PITCH = `11.7 million foreign visitors in 2025, a record. How did Uzbekistan go from one of the hardest countries in Central Asia to visit to one of the fastest-growing destinations in the world? Samarkand, Bukhara and Khiva, the Silk Road, visa reforms, high-speed trains, and what comes next.`;

const chapters = ['0:00 Intro'];
for (const s of SCENES) if ('chapter' in s && s.chapter) chapters.push(`${ts(sceneStart(s.id))} ${title(s.chapter.title)}`);

/** Condensed sources for the description: one line each, one short link. Full list → pinned comment. */
const SOURCES_SHORT = [
  'National Statistics Committee of Uzbekistan (arrivals 2025, Jan–Feb 2026): stat.uz',
  'Tourism Committee of Uzbekistan (April 2025 record, ~90 countries, 2030 target): gov.uz/en/uzbektourism',
  'World Bank / UN Tourism, international arrivals: data.worldbank.org/indicator/ST.INT.ARVL?locations=UZ',
  'UNESCO World Heritage: whc.unesco.org/en/list/603 (Samarkand) · /602 (Bukhara) · /543 (Itchan Kala)',
  'UNESCO Intangible Heritage, palov (2016): ich.unesco.org/en/RL/01166',
  'Ulugh Beg, sidereal year: arxiv.org/abs/1804.08352',
  'NASA Earth Observatory, Aral Sea: science.nasa.gov/earth/earth-observatory/shrinking-aral-sea',
  'Visa decrees UP-5551 (2018), UP-5611 (2019), US visa-free 2026: kun.uz, fergana.agency',
  'Afrosiyob openings and timetable: uzdaily.uz, advantour.com',
  'Full source list with links: pinned comment',
];

const credits = Object.values(PHOTOS).map((p) => `${p.subject.split(' — ')[0].replace(/ \(.*\)/, '')}: ${p.author}, ${p.license} ${p.shortUrl ?? p.sourceUrl}`);

const description = [
  PITCH,
  '',
  'CHAPTERS',
  ...chapters,
  '',
  'SOURCES',
  ...SOURCES_SHORT.map((s) => `• ${s}`),
  '',
  'PHOTOS (Wikimedia Commons; cropped, colour-treated and annotated)',
  ...credits,
  'Licences: creativecommons.org/licenses (CC BY 2.0, CC BY 4.0, CC BY-SA 3.0, CC BY-SA 4.0) · CC0: creativecommons.org/publicdomain/zero/1.0',
  '',
  'Music: same library bed as our previous videos.',
].join('\n');

const sources = Array.from(new Set(Object.values(ALL_DATASETS as Record<string, { sourceTag: string; source: string }>).map((d) => `• ${d.sourceTag}: ${d.source}`)));
const comment = ['Sources for every number in this video:', '', ...sources].join('\n');

const errors: string[] = [];
if (description.length > DESCRIPTION_LIMIT) errors.push(`description is ${description.length} characters (limit ${DESCRIPTION_LIMIT})`);
if (/[<>]/.test(description)) errors.push('description contains < or >, which YouTube rejects');
if (comment.length > COMMENT_LIMIT) errors.push(`pinned comment is ${comment.length} characters (limit ${COMMENT_LIMIT})`);

const md = `# YouTube — "Why Everyone Is Suddenly Visiting Uzbekistan"

Length: ${ts(TOTAL_FRAMES)} (${TOTAL_FRAMES} frames @ ${FPS} fps)

## Mid-roll ad breaks (YouTube Studio → Monetization → Ad breaks → place manually)

${AD_BREAKS.map((b) => `- **${b.timestamp}** — ${b.reason} (0.5 s visual breath just before)`).join('\n')}

## Paste into the description (${description.length} / ${DESCRIPTION_LIMIT} characters)

\`\`\`
${description}
\`\`\`
`;

fs.mkdirSync(path.join(root, 'youtube'), { recursive: true });
fs.writeFileSync(path.join(root, 'youtube/description.md'), md);
fs.writeFileSync(
  path.join(root, 'youtube/pinned-comment.md'),
  `# Pinned comment (${comment.length} / ${COMMENT_LIMIT} characters)\n\n\`\`\`\n${comment}\n\`\`\`\n`,
);
console.log(`description: ${description.length} / ${DESCRIPTION_LIMIT} characters`);
console.log(`pinned comment: ${comment.length} / ${COMMENT_LIMIT} characters`);
console.log('wrote youtube/description.md and youtube/pinned-comment.md');
if (errors.length) {
  errors.forEach((e) => console.log(`✗ ${e}`));
  process.exit(1);
}
