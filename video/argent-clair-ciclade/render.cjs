// Renders scene.html frame-by-frame with headless Chromium and pipes JPEGs into ffmpeg.
//   node render.cjs                      -> out/argent-clair-ciclade.mp4 (needs out/music.wav)
//   node render.cjs --stills 1.5,6,12    -> out/still-<t>.png contact frames
//   add --safe to draw the Instagram UI zones in red
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30, DURATION = 48;
const dir = __dirname, out = path.join(dir, 'out');
fs.mkdirSync(out, { recursive: true });
const args = process.argv.slice(2);
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;

(async () => {
  const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? undefined : undefined });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => { console.error('[page error]', e); process.exit(1); });
  await page.goto('file://' + path.join(dir, 'scene.html'));
  await page.evaluate(() => window.ready);
  if (args.includes('--safe')) await page.evaluate(() => { window.SHOW_SAFE = true; });

  if (stillsArg) {
    for (const t of stillsArg.split(',').map(Number)) {
      const data = await page.evaluate(t => window.frame(t, 'image/png'), t);
      fs.writeFileSync(path.join(out, `still-${t.toFixed(2)}.png`), Buffer.from(data.split(',')[1], 'base64'));
    }
    await browser.close();
    return;
  }

  const audio = path.join(out, 'music.wav');
  const target = path.join(out, 'argent-clair-ciclade.mp4');
  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', audio,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-maxrate', '5M', '-bufsize', '10M', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-t', String(DURATION), '-movflags', '+faststart', target], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = FPS * DURATION;
  for (let f = 0; f < total; f++) {
    const data = await page.evaluate(t => window.frame(t), f / FPS);
    const buf = Buffer.from(data.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
  await browser.close();
  console.log('wrote', target);
})();
