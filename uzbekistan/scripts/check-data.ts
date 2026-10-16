/**
 * Pre-render check: npm run check:data
 *   - datasets: lists placeholder / to-verify ones (placeholders fail the check)
 *   - photos: every registered photo exists in public/photos and is ≥ 1920 px wide
 *   - timing: scenes add up, every cue lies inside its scene, retention rule (no gap > 6 s between visual beats)
 *   - no captions: no subtitle / caption component or file anywhere in src/
 *   - audio: voiceover / music present; voiceover length vs. video length
 * Exits non-zero if anything would make a final render wrong.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ALL_DATASETS } from '../src/data/data';
import { PHOTOS } from '../src/data/photos';
import { SCENE_BEATS } from '../src/scenes';
import { AD_BREAKS, FPS, SCENES, TOTAL_FRAMES, retentionGaps, sec } from '../src/timings';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
let failed = false;
const fail = (msg: string) => {
  console.log(`✗ ${msg}`);
  failed = true;
};

// datasets
const entries = Object.entries(ALL_DATASETS as Record<string, { status: string }>);
const ph = entries.filter(([, d]) => d.status === 'placeholder').map(([k]) => k);
const tv = entries.filter(([, d]) => d.status === 'toVerify').map(([k]) => k);
if (ph.length) fail(`placeholder datasets: ${ph.join(', ')}`);
else console.log(`✓ ${entries.length} datasets, no placeholders`);
console.log(tv.length ? `• to verify before lock: ${tv.join(', ')}` : '✓ every dataset verified');

// photos
for (const p of Object.values(PHOTOS)) {
  const f = path.join(root, 'public/photos', p.file);
  if (!fs.existsSync(f)) fail(`missing photo ${p.id}: ${p.file}`);
  else if (p.width < 1920) fail(`${p.id} narrower than 1920 px`);
}
console.log(`✓ ${Object.keys(PHOTOS).length} photos registered and present`);

// timing
const sum = SCENES.reduce((n, s) => n + sec(s.seconds), 0);
if (sum !== TOTAL_FRAMES) fail(`scenes add up to ${sum}, TOTAL_FRAMES is ${TOTAL_FRAMES}`);
for (const s of SCENES)
  for (const [name, t] of Object.entries(s.cues as Record<string, number>)) if (t < 0 || t > s.seconds) fail(`cue ${s.id}.${name} (${t} s) outside its scene (${s.seconds} s)`);
const gaps = retentionGaps(SCENE_BEATS);
if (gaps.length) gaps.forEach((g) => fail(`retention: ${g.scene} ${g.from}–${g.to} s has no new visual beat (${g.gap} s)`));
else console.log('✓ retention: a new visual beat at least every 6 s in every scene');
console.log(`✓ ${SCENES.length} scenes, ${TOTAL_FRAMES} frames = ${Math.floor(TOTAL_FRAMES / FPS / 60)}:${String(Math.round(TOTAL_FRAMES / FPS) % 60).padStart(2, '0')}`);
console.log(`• ad breaks: ${AD_BREAKS.map((b) => b.timestamp).join(', ')}`);
if (TOTAL_FRAMES < 8 * 60 * FPS) fail('video shorter than 8:00 — YouTube will not allow mid-roll ad breaks (raise END_HOLD in fit_timings.py)');
else console.log('✓ ≥ 8:00, mid-roll ad breaks allowed');

// no captions
const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((f) => (f.isDirectory() ? walk(path.join(dir, f.name)) : [path.join(dir, f.name)]));
const hits = walk(path.join(root, 'src'))
  .filter((f) => !f.includes(`${path.sep}short${path.sep}`)) // the vertical Short has subtitles on purpose
  .filter((f) => /caption|subtitle|\.srt$|\.vtt$/i.test(path.basename(f)) || /<Captions|<Subtitle/.test(fs.readFileSync(f, 'utf8')));
if (hits.length) fail(`caption/subtitle files or components found: ${hits.map((h) => path.relative(root, h)).join(', ')}`);
else console.log('✓ no captions / subtitles in the long video (the Short has them by request)');

// audio
const probe = (f: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());
const vo = path.join(root, 'public/voiceover.wav');
if (!fs.existsSync(vo)) console.log('• public/voiceover.wav missing — the render will be silent');
else {
  const d = probe(vo);
  const video = TOTAL_FRAMES / FPS;
  if (d > video) fail(`voiceover (${d.toFixed(1)} s) is longer than the video (${video.toFixed(1)} s) — re-run scripts/voiceover/fit_timings.py`);
  else console.log(`✓ voiceover ${d.toFixed(1)} s, video ${video.toFixed(1)} s`);
}
console.log(fs.existsSync(path.join(root, 'public/music.mp3')) ? '✓ music bed present' : '• no music.mp3 (music off)');

process.exit(failed ? 1 : 0);
