/**
 * Pre-render check: npm run check:data
 * Lists placeholder / to-verify datasets, scans the source for banned on-screen terms ("Super El Niño"),
 * checks the timeline. Exits non-zero if anything would make a final render wrong.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ALL_DATASETS, BANNED_ON_SCREEN, hasPlaceholders } from '../src/data/elnino';
import { SCENES, TOTAL_FRAMES } from '../src/timeline';

let failed = false;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const ph = hasPlaceholders();
console.log(ph.length ? `⚠ placeholder datasets (SourceTag shows a warning): ${ph.join(', ')}` : '✓ no placeholder datasets');
if (ph.length) failed = true;

const toVerify = Object.entries(ALL_DATASETS as Record<string, { status: string }>).filter(([, d]) => d.status === 'toVerify').map(([k]) => k);
console.log(toVerify.length ? `• to verify before lock: ${toVerify.join(', ')}` : '✓ every dataset verified');

const files: string[] = [];
const walk = (dir: string) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(tsx?|json)$/.test(f.name)) files.push(p);
  }
};
walk(path.join(root, 'src'));
walk(path.join(root, '..', 'shared'));
let banned = 0;
for (const f of files) {
  if (f.endsWith(path.join('data', 'elnino.ts'))) continue; // the banned list itself lives there
  const text = fs.readFileSync(f, 'utf8').toLowerCase();
  for (const b of BANNED_ON_SCREEN)
    if (text.includes(b)) {
      console.log(`✗ banned term "${b}" in ${path.relative(root, f)}`);
      banned++;
      failed = true;
    }
}
if (!banned) console.log('✓ no banned on-screen terms');

const end = SCENES[SCENES.length - 1].from + SCENES[SCENES.length - 1].durationInFrames;
console.log(end === TOTAL_FRAMES ? `✓ ${SCENES.length} scenes tile ${TOTAL_FRAMES} frames` : `✗ scenes end at ${end}`);
if (end !== TOTAL_FRAMES) failed = true;

process.exit(failed ? 1 : 0);
