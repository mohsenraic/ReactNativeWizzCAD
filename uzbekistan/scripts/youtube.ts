/**
 * npm run youtube — writes youtube/description.md: chapters, mid-roll ad-break timestamps and the photo
 * credits block, all computed from src/timings.ts and src/data (so they stay right after re-timing).
 */
import fs from 'node:fs';
import path from 'node:path';
import { ALL_DATASETS } from '../src/data/data';
import { PHOTOS } from '../src/data/photos';
import { AD_BREAKS, FPS, SCENES, TOTAL_FRAMES, sceneStart } from '../src/timings';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ts = (frames: number) => {
  const s = Math.round(frames / FPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const title = (t: string) => t.charAt(0) + t.slice(1).toLowerCase().replace(/'s\b/, "'s");

const chapters = ['0:00 Intro'];
for (const s of SCENES) if ('chapter' in s && s.chapter) chapters.push(`${ts(sceneStart(s.id))} ${title(s.chapter.title)}`);

const credits = Object.values(PHOTOS).map((p) => `${p.id} ${p.subject.split(' — ')[0]}: ${p.author}, ${p.license} — ${p.sourceUrl}`);
const sources = Array.from(new Set(Object.values(ALL_DATASETS as Record<string, { sourceTag: string; source: string }>).map((d) => `• ${d.sourceTag}: ${d.source}`)));

const md = `# YouTube — "Why Everyone Is Suddenly Visiting Uzbekistan"

Length: ${ts(TOTAL_FRAMES)} (${TOTAL_FRAMES} frames @ ${FPS} fps)

## Mid-roll ad breaks (YouTube Studio → Monetization → Ad breaks → place manually)

${AD_BREAKS.map((b) => `- **${b.timestamp}** — ${b.reason} (0.5 s visual breath just before)`).join('\n')}

## Paste into the description

\`\`\`
CHAPTERS
${chapters.join('\n')}

SOURCES
${sources.join('\n')}

PHOTO CREDITS (Wikimedia Commons; photos cropped, colour-treated and annotated)
${credits.join('\n')}

Licences: CC BY 2.0 https://creativecommons.org/licenses/by/2.0/ · CC BY 4.0 https://creativecommons.org/licenses/by/4.0/ · CC BY-SA 3.0 https://creativecommons.org/licenses/by-sa/3.0/ · CC BY-SA 4.0 https://creativecommons.org/licenses/by-sa/4.0/ · CC0 https://creativecommons.org/publicdomain/zero/1.0/
Music: same library bed as our previous videos.
\`\`\`
`;
fs.mkdirSync(path.join(root, 'youtube'), { recursive: true });
fs.writeFileSync(path.join(root, 'youtube/description.md'), md);
console.log(md.split('## Paste')[0]);
console.log(chapters.join('\n'));
console.log('\nwrote youtube/description.md');
