/**
 * Review helper: bundle once, render many half-size stills.
 *   node scripts/render-stills.mjs '[["ElNino2026", 900, "s2"]]'
 * Output: out/stills/<name>.png. Uses local fonts; set REMOTION_BROWSER to a Chrome binary if needed.
 */
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import { makeWebpackOverride } from '../../shared/remotion/webpack-override.mjs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const jobs = JSON.parse(process.argv[2]); // [[compId, frame, outName], ...]
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public'), webpackOverride: makeWebpackOverride(root) });
const inputProps = { fonts: 'local' };
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const cache = {};
for (const [id, frame, name] of jobs) {
  cache[id] ??= await selectComposition({ serveUrl, id, inputProps, browserExecutable });
  await renderStill({ composition: cache[id], serveUrl, frame, output: path.join(root, 'out/stills', name + '.png'), inputProps, browserExecutable, scale: 0.5 });
  console.log('ok', name);
}
