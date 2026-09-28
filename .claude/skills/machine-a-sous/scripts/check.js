#!/usr/bin/env node
// Essai automatique d'une machine dans Chromium : chargement, spins, achat des deux bonus, captures d'écran.
//
//   node check.js jeux/ma-machine.html [--spins 8] [--sortie captures]
//
// Échoue (code 1) s'il y a une erreur JavaScript, une ressource introuvable, un défilement horizontal
// sur téléphone, ou si une partie ne se termine pas. Les captures vont dans le dossier --sortie.
'use strict';
const path = require('path');
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  try { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
  catch (e2) { console.error('Playwright introuvable : npm i -g playwright (sans télécharger de navigateur si Chromium est déjà là).'); process.exit(1); }
}

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
if (!file) { console.error('usage : node check.js <fichier.html> [--spins 8] [--sortie captures]'); process.exit(1); }
const SPINS = Number(opt('spins', 8));
const OUT = opt('sortie', path.join(path.dirname(file), 'captures', path.basename(file, '.html')));
fs.mkdirSync(OUT, { recursive: true });

const errors = [];
const exe = ['/opt/pw-browsers/chromium', process.env.CHROMIUM_PATH].filter(p => p && fs.existsSync(p) && fs.statSync(p).isFile())[0];

(async () => {
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const url = 'file://' + path.resolve(file);

  // 1. rendu réel (animations) à largeur de téléphone, puis sur ordinateur
  for (const [name, vp] of [['telephone', { width: 390, height: 844 }], ['ordinateur', { width: 1280, height: 900 }]]) {
    const page = await browser.newPage({ viewport: vp });
    watch(page, name);
    await page.goto(url); await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${name}-accueil.png` });
    if (name === 'telephone') {
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > vp.width + 1) errors.push(`défilement horizontal sur téléphone : largeur ${sw}px pour ${vp.width}px`);
    }
    await page.close();
  }

  // 2. partie accélérée (mouvements réduits + turbo) : spins puis achat des deux bonus
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  watch(page, 'partie');
  await page.goto(url); await page.waitForTimeout(500);
  await page.click('#turboBtn');
  const b0 = await balance(page);
  for (let i = 0; i < SPINS; i++) { await page.click('#spin'); await settle(page, `spin ${i + 1}`); }
  const b1 = await balance(page);
  console.log(`${SPINS} spins : solde ${b0} -> ${b1}`);
  if (!(b1 !== b0)) errors.push('le solde ne bouge pas après les spins');
  await page.screenshot({ path: `${OUT}/partie-apres-spins.png` });

  for (const t of [3, 4]) {
    await page.click('#buyBtn');
    await page.waitForSelector(`.offer[data-t="${t}"]:not([disabled])`, { timeout: 5000 });
    await page.click(`.offer[data-t="${t}"]`);
    await settle(page, `bonus ${t}`, true, `${OUT}/bonus-${t}`);
    console.log(`bonus ${t} acheté et joué : solde ${await balance(page)}`);
  }
  await page.click('#infoBtn'); await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/regles.png`, fullPage: false });
  await page.click('#ovBtn');
  await browser.close();

  console.log(`captures : ${OUT}`);
  if (errors.length) { console.log('\nPROBLÈMES :\n- ' + [...new Set(errors)].join('\n- ')); process.exit(1); }
  console.log('OK : aucune erreur.');
})().catch(e => { console.error(e); process.exit(1); });

function watch(page, tag) {
  page.on('pageerror', e => errors.push(`[${tag}] erreur JS : ${e.message}`));
  // les ressources manquantes sont signalées par requestfailed (avec leur adresse) ; Google Fonts est facultatif
  page.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) errors.push(`[${tag}] console : ${m.text()}`); });
  page.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errors.push(`[${tag}] ressource introuvable : ${r.url()}`); });
}
const balance = page => page.$eval('#balance', e => e.textContent.trim());

// Clique sur tout ce qui attend le joueur (entrée du bonus, gros gain, fenêtres) jusqu'à ce que la machine soit libre.
async function settle(page, what, bonus = false, shot = null) {
  const t0 = Date.now(); let shotMid = false, sawBonus = false;
  while (Date.now() - t0 < 240000) {
    await page.waitForTimeout(250);
    const st = await page.evaluate(() => {
      const vis = id => { const e = document.getElementById(id); return !!e && e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden'; };
      const shown = id => { const e = document.getElementById(id); return !!e && e.classList.contains('show'); };
      return { intro: vis('introBtn') && shown('intro'), big: shown('bwLayer'), over: shown('overlay') && vis('ovBtn'),
        inBonus: document.body.classList.contains('bonus'), free: !document.getElementById('spin').disabled && !document.getElementById('buyBtn').disabled };
    });
    if (st.inBonus) sawBonus = true;
    if (shot && st.inBonus && !shotMid && Date.now() - t0 > 6000) { await page.screenshot({ path: `${shot}-en-cours.png` }); shotMid = true; }
    if (st.intro) { if (shot) await page.screenshot({ path: `${shot}-entree.png` }); await page.click('#introBtn'); continue; }
    if (st.big) { await page.click('#bwLayer'); continue; }
    if (st.over) { if (shot && sawBonus) await page.screenshot({ path: `${shot}-fin.png` }); await page.click('#ovBtn'); continue; }
    if (st.free && !st.inBonus && (!bonus || sawBonus)) return;
  }
  errors.push(`${what} : la partie ne se termine pas au bout de 4 minutes`);
  throw new Error(errors.join('\n'));
}
