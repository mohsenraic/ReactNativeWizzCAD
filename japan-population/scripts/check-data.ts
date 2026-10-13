/**
 * Pre-render data check: npm run check:data
 * Lists placeholder datasets, validates captions and the timeline, prints derived numbers.
 * Exits non-zero if anything would make a final render wrong.
 */
import { hasPlaceholders, pyramids, pyramidShare, pyramidTotal, lossFromPeakMillions, vital2025, naturalChangeSeries } from '../src/data/japan';
import { validateCaptions, captions } from '../src/data/captions';
import { SCENES, TOTAL_FRAMES } from '../src/timeline';

let failed = false;

const ph = hasPlaceholders();
console.log(ph.length ? `⚠ placeholder datasets: ${ph.join(', ')}` : '✓ no placeholder datasets');
if (ph.length) failed = true;

const cap = validateCaptions();
console.log(cap.length ? `✗ caption problems:\n  ${cap.join('\n  ')}` : `✓ ${captions.length} captions valid`);
if (cap.length) failed = true;

const end = SCENES[SCENES.length - 1].from + SCENES[SCENES.length - 1].durationInFrames;
console.log(end === TOTAL_FRAMES ? `✓ ${SCENES.length} scenes tile ${TOTAL_FRAMES} frames` : `✗ scenes end at ${end}`);

const { births, deaths, naturalChange } = vital2025.data;
if (births - deaths !== naturalChange) { console.log('✗ natural change does not equal births − deaths'); failed = true; }
console.log(`  natural change 2025: ${naturalChange.toLocaleString('en-US')}`);
console.log(`  loss from peak: ${lossFromPeakMillions()}M`);
console.log(`  natural-decline years in series: ${naturalChangeSeries().filter((d) => d.value < 0).map((d) => d.year).join(', ')}`);
for (const p of pyramids.data)
  console.log(`  pyramid ${p.year} [${p.status}]: ${(pyramidTotal(p) / 1000).toFixed(1)}M, 65+ ${(pyramidShare(p, 65) * 100).toFixed(1)}%`);

process.exit(failed ? 1 : 0);
