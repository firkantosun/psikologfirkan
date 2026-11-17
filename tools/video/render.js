// Kullanım: node tools/video/render.js <src dir> <out dir> [slug...]
// src/games.json ve src/games-extra.json'dan her alan için 33 sn'lik video üretir (1280x720, 24 fps, H.264).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const SRC = process.argv[2], OUT = process.argv[3], ONLY = process.argv.slice(4);
const areas = JSON.parse(fs.readFileSync(path.join(SRC, 'areas.json'), 'utf8')).areas;
const games = JSON.parse(fs.readFileSync(path.join(SRC, 'games.json'), 'utf8')).games;
const extra = JSON.parse(fs.readFileSync(path.join(SRC, 'games-extra.json'), 'utf8'));
const jobs = games.map(g => {
  const a = areas.find(x => x.slug === g.slug);
  return Object.assign({}, g, { vtitle: a.name, vsub: 'Döngüyü tanı, döngüyü kır', vend: g.takeaway.split('. ')[0].replace(/\.$/, '') + '.' });
});
jobs.unshift(Object.assign({}, extra.yaklasim[0], { slug: 'bdt', vtitle: 'Bilişsel Davranışçı Terapi', vsub: 'Olay değil, ona yüklediğimiz anlam', vend: 'Durum değişmedi; değişen, ona yüklediğin anlam.' }));
const FPS = 24;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  for (const j of jobs) {
    if (ONLY.length && !ONLY.includes(j.slug)) continue;
    await p.goto('file://' + path.join(__dirname, 'video.html'));
    await p.evaluate(d => window.setup(d), j);
    const dur = await p.evaluate(() => window.DUR);
    const out = path.join(OUT, j.slug + '.mp4');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(dur * FPS);
    for (let i = 0; i < n; i++) {
      await p.evaluate(t => window.seek(t), i / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 88 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i === Math.round(14 * FPS)) await p.screenshot({ path: path.join(OUT, j.slug + '.jpg'), type: 'jpeg', quality: 80 });
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log(j.slug, (fs.statSync(out).size / 1e6).toFixed(2) + ' MB');
  }
  await b.close();
})();
