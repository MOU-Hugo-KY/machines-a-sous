#!/usr/bin/env node
// Précuit les planches 3D d'une machine : les personnages sont « photographiés » une fois ici, et la page
// les charge ensuite comme de simples images (la grille passe en 3D presque tout de suite, sans cuisson).
//
//   node precuire.js jeux/ma-machine-3d.html [--qualite 0.9]
//
// Écrit jeux/planches/<page>/*.webp + planches.json, puis met à jour PLANCHES3D dans la page.
// À relancer après chaque passer-en-3d.py qui change les modèles (passer-en-3d.py prévient si c'est le cas).
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  try { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
  catch (e2) { console.error('Playwright introuvable : npm i -g playwright (sans télécharger de navigateur si Chromium est déjà là).'); process.exit(1); }
}

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
if (!file) { console.error('usage : node precuire.js <machine-3d.html> [--qualite 0.9]'); process.exit(1); }
const Q = Number(opt('qualite', 0.9));
const stem = path.basename(file, '.html');
const outDir = path.join(path.dirname(file), 'planches', stem);
const exe = ['/opt/pw-browsers/chromium', process.env.CHROMIUM_PATH].filter(p => p && fs.existsSync(p) && fs.statSync(p).isFile())[0];
const THREE_DIR = [__dirname, process.cwd()].map(b => path.join(b, 'node_modules', 'three')).find(d => fs.existsSync(path.join(d, 'build'))) || null;

(async () => {
  const browser = await chromium.launch({ ...(exe ? { executablePath: exe } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
  if (THREE_DIR) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.+)$/, route => {
    const rel = route.request().url().match(/three@[^/]+\/(.+)$/)[1], f = path.join(THREE_DIR, rel);
    fs.existsSync(f) ? route.fulfill({ path: f, contentType: 'text/javascript', headers: { 'Access-Control-Allow-Origin': '*' } }) : route.continue();
  });
  page.on('pageerror', e => console.error('erreur JS :', e.message));
  await page.goto('file://' + path.resolve(file) + '?cuire');
  process.stdout.write('cuisson des modèles');
  const tick = setInterval(() => process.stdout.write('.'), 5000);
  await page.waitForFunction(() => window.ART3D_STATE && window.ART3D_STATE !== 'chargement', null, { timeout: 900000, polling: 1000 });
  clearInterval(tick); console.log();
  const [st, err] = await page.evaluate(() => [window.ART3D_STATE, window.ART3D_ERROR]);
  if (st !== 'ok') { console.error('la cuisson a échoué :', err); process.exit(1); }

  // chaque planche (PNG en mémoire dans la page) → WebP avec transparence
  const res = await page.evaluate(async q => {
    const toWebp = async u => {
      const bm = await createImageBitmap(await (await fetch(u)).blob());
      const c = document.createElement('canvas'); c.width = bm.width; c.height = bm.height; c.getContext('2d').drawImage(bm, 0, 0);
      const b = await new Promise(r => c.toBlob(r, 'image/webp', q));
      const bytes = new Uint8Array(await b.arrayBuffer()); let s = '';
      for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return btoa(s);
    };
    const out = {};
    for (const [key, b] of Object.entries(window.ART3D_BAKES)) out[key] = { n: b.frames, idle: await toWebp(b.idle), win: await toWebp(b.win) };
    return { sig: window.ART3D_SIG, out };
  }, Q);
  await browser.close();

  fs.rmSync(outDir, { recursive: true, force: true }); fs.mkdirSync(outDir, { recursive: true });
  const hash = crypto.createHash('sha1'), items = {}; let total = 0;
  for (const [key, it] of Object.entries(res.out)) {
    const f = key.replace(/\|/g, '-').replace(/[^A-Za-z0-9_-]/g, '_');
    for (const k of ['idle', 'win']) { const buf = Buffer.from(it[k], 'base64'); fs.writeFileSync(path.join(outDir, `${f}-${k}.webp`), buf); hash.update(buf); total += buf.length; }
    items[key] = { f, n: it.n };
  }
  const pl = { dir: `planches/${stem}/`, v: hash.digest('hex').slice(0, 8), sig: res.sig, items };
  fs.writeFileSync(path.join(outDir, 'planches.json'), JSON.stringify(pl, null, 1) + '\n');

  // la page utilise tout de suite ses planches (passer-en-3d.py les reprendra aussi tant que les modèles ne changent pas)
  const html = fs.readFileSync(file, 'utf8'), line = /^const PLANCHES3D = .*;$/m;
  if (!line.test(html)) { console.error('ligne « const PLANCHES3D = … ; » introuvable : relance passer-en-3d.py'); process.exit(1); }
  fs.writeFileSync(file, html.replace(line, () => `const PLANCHES3D = ${JSON.stringify(pl)};`));
  console.log(`${Object.keys(items).length} symboles, ${Object.keys(items).length * 2} planches, ${(total / 1024).toFixed(0)} Ko → ${outDir}`);
})().catch(e => { console.error(e); process.exit(1); });
