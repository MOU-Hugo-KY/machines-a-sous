#!/usr/bin/env node
// Calibre et vérifie le RTP d'une machine à sous construite sur le gabarit de la skill.
//
//   node rtp.js jeux/ma-machine.html            -> rapport (RTP de chaque mode, fréquences, volatilité)
//   node rtp.js jeux/ma-machine.html --calibre  -> calcule SCAT_W et BONUS_K puis les réécrit dans le fichier
//
// Options : --rtp 0.985  --n 20000 (bonus simulés par niveau)  --spins 300000 (spins de base simulés)
//           --mega 2000 (gain moyen visé du méga bonus, en fois la mise)  --graine 1
//
// Le script lit le bloc `const ENGINE = (() => { ... })();` du fichier HTML et l'exécute dans Node.
// Contrat attendu (voir references/architecture.md) : SYMS, TIER[t].cap, BUY, ANTE, spinBase, evalBase,
// analyticBase, scatProbs, newBonus(tier), bonusSpin(b) qui fait monter b.raw et passe b.done à true,
// et les accesseurs SCAT_W, BASE_SCALE, BONUS_K. Le gain du bonus vaut min(cap, raw × BONUS_K[tier]).
'use strict';
const fs = require('fs');
const vm = require('vm');

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? Number(args[i + 1]) : d; };
const flag = k => args.includes('--' + k);
if (!file) { console.error('usage : node rtp.js <fichier.html> [--calibre] [--rtp 0.985] [--n 20000] [--spins 300000] [--mega 2000]'); process.exit(1); }

const RTP = opt('rtp', 0.985), N = opt('n', 20000), SPINS = opt('spins', 300000), MEGA = opt('mega', 2000);
const html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('const ENGINE = (() => {');
const endMark = "if (typeof module !== 'undefined') module.exports = ENGINE;";
const end = html.indexOf(endMark, start);
if (start < 0 || end < 0) { console.error("Bloc ENGINE introuvable : il doit commencer par `const ENGINE = (() => {` et finir par la ligne module.exports."); process.exit(1); }

// générateur pseudo-aléatoire à graine (mulberry32), pour des résultats reproductibles
let seed = opt('graine', 1) >>> 0;
const rng = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const sandbox = { module: { exports: {} }, console };
sandbox.Math = Object.create(Math); sandbox.Math.random = rng;
vm.createContext(sandbox);
vm.runInContext(html.slice(start, end + endMark.length).replace('const ENGINE', 'var ENGINE'), sandbox);
const E = sandbox.module.exports;

const fmt = (x, d = 2) => x.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = x => fmt(x * 100, 2) + ' %';
const tiers = [3, 4, 5];

// ---------- bonus : gains bruts (sans plafond), une fois pour toutes ----------
function simRaw(tier, n) {
  const T = E.TIER[tier], cap = T.cap, K = E.BONUS_K[tier];
  T.cap = Infinity; E.BONUS_K = { ...E.BONUS_K, [tier]: 1 };
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const b = E.newBonus(tier); let guard = 0;
    while (!b.done) { E.bonusSpin(b); if (++guard > 10000) throw new Error(`bonus ${tier} : plus de 10 000 spins, b.done ne passe jamais à true`); }
    out[i] = b.raw;
  }
  T.cap = cap; E.BONUS_K = { ...E.BONUS_K, [tier]: K };
  return out;
}
const meanCapped = (raw, K, cap) => { let s = 0; for (const r of raw) s += Math.min(cap, r * K); return s / raw.length; };
function solveK(raw, target, cap) {
  let m = 0; for (const r of raw) m += r; m /= raw.length;
  if (m <= 0) throw new Error('le bonus ne rapporte jamais rien (raw moyen nul)');
  let lo = 0, hi = target / m;
  while (meanCapped(raw, hi, cap) < target) { hi *= 2; if (hi > 1e30) throw new Error(`cible ${target} impossible sous le plafond ${cap}`); }
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; (meanCapped(raw, mid, cap) < target ? (lo = mid) : (hi = mid)); }
  return (lo + hi) / 2;
}
function stats(raw, K, cap) {
  const v = Array.from(raw, r => Math.min(cap, r * K)).sort((a, b) => a - b);
  const mean = v.reduce((a, x) => a + x, 0) / v.length;
  const sd = Math.sqrt(v.reduce((a, x) => a + (x - mean) ** 2, 0) / v.length);
  const q = p => v[Math.min(v.length - 1, Math.floor(p * v.length))];
  return { mean, sd, med: q(0.5), p10: q(0.1), p90: q(0.9), p99: q(0.99), max: v[v.length - 1], capRate: v.filter(x => x >= cap).length / v.length };
}

// ---------- jeu de base ----------
const base = mode => E.analyticBase(mode, E.BASE_SCALE[mode]);
function rtpOf(mode, sw, target) {
  const P = E.scatProbs(mode, sw); const save = E.SCAT_W;
  E.SCAT_W = { ...save, [mode]: sw }; const b = base(mode); E.SCAT_W = save;
  return b + tiers.reduce((a, t) => a + P[t] * target[t], 0);
}
function solveScat(mode, target, cost) {
  let lo = 1e-6, hi = 1;
  while (rtpOf(mode, hi, target) < RTP * cost) { hi *= 2; if (hi > 1e6) throw new Error(`impossible d'atteindre le RTP en mode ${mode} : baisse BASE_SCALE ou les gains des bonus`); }
  if (rtpOf(mode, lo, target) > RTP * cost) throw new Error(`le jeu de base seul dépasse déjà ${pct(RTP)} en mode ${mode} : baisse BASE_SCALE`);
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; (rtpOf(mode, mid, target) < RTP * cost ? (lo = mid) : (hi = mid)); }
  return (lo + hi) / 2;
}
function simBase(mode, n) {
  let win = 0, hits = 0, bon = 0;
  for (let i = 0; i < n; i++) { const r = E.evalBase(E.spinBase(mode), mode); win += r.total; if (r.total > 0) hits++; if (r.scats >= 3) bon++; }
  return { rtp: win / n, hit: hits / n, bonus: bon / n };
}

console.log(`\n${file}\n`);
console.log(`Simulation de ${N.toLocaleString('fr-FR')} bonus par niveau…`);
const RAW = {}; for (const t of tiers) RAW[t] = simRaw(t, N);

let target = { 3: RTP * E.BUY[3], 4: RTP * E.BUY[4], 5: MEGA };
if (flag('calibre')) {
  const K = {}; for (const t of tiers) K[t] = solveK(RAW[t], target[t], E.TIER[t].cap);
  E.BONUS_K = K;
  E.SCAT_W = { normal: solveScat('normal', target, 1), ante: solveScat('ante', target, E.ANTE) };
  let out = html
    .replace(/let SCAT_W = \{[^}]*\};/, `let SCAT_W = { normal: ${E.SCAT_W.normal}, ante: ${E.SCAT_W.ante} };`)
    .replace(/let BONUS_K = \{[^}]*\};/, `let BONUS_K = { 3: ${K[3]}, 4: ${K[4]}, 5: ${K[5]} };`);
  if (out === html) console.log('Attention : les lignes `let SCAT_W = {…};` / `let BONUS_K = {…};` sont introuvables, rien n\'a été écrit.');
  else { fs.writeFileSync(file, out); console.log(`Constantes réécrites dans ${file} :`); }
  console.log(`  SCAT_W  = { normal: ${E.SCAT_W.normal}, ante: ${E.SCAT_W.ante} }`);
  console.log(`  BONUS_K = { 3: ${K[3]}, 4: ${K[4]}, 5: ${K[5]} }`);
}

// ---------- rapport ----------
const S = {}; for (const t of tiers) S[t] = stats(RAW[t], E.BONUS_K[t], E.TIER[t].cap);
const names = { 3: 'Bonus', 4: 'Super bonus', 5: 'Méga bonus' };
console.log('\nBonus (en fois la mise)');
console.log('  niveau          moyenne    médiane       p10       p90       p99         max  plafonné  écart-type');
for (const t of tiers) { const s = S[t]; console.log(`  ${names[t].padEnd(12)}${fmt(s.mean).padStart(11)}${fmt(s.med).padStart(11)}${fmt(s.p10).padStart(10)}${fmt(s.p90).padStart(10)}${fmt(s.p99).padStart(10)}${fmt(s.max).padStart(12)}${pct(s.capRate).padStart(10)}${fmt(s.sd).padStart(12)}`); }
const cible = t => t === 5 ? MEGA : RTP * E.BUY[t];
for (const t of tiers) { const err = S[t].mean / cible(t) - 1; if (Math.abs(err) > 0.03) console.log(`  ! ${names[t]} : moyenne ${fmt(S[t].mean)} au lieu de ${fmt(cible(t))} visés (${err > 0 ? '+' : ''}${pct(err)}) -> relance avec --calibre`); }

console.log('\nRTP');
for (const mode of ['normal', 'ante']) {
  const cost = mode === 'ante' ? E.ANTE : 1, P = E.scatProbs(mode), b = base(mode);
  const bonusPart = tiers.reduce((a, t) => a + P[t] * S[t].mean, 0);
  const sim = simBase(mode, SPINS);
  const total = (b + bonusPart) / cost;
  console.log(`  ${mode === 'normal' ? 'Jeu normal   ' : 'Chance bonus '} ${pct(total)}  (base ${pct(b / cost)} + bonus ${pct(bonusPart / cost)})` +
    `   bonus 1 spin sur ${Math.round(1 / (P[3] + P[4] + P[5])).toLocaleString('fr-FR')}   spins gagnants ${pct(sim.hit)}`);
  console.log(`                base simulée sur ${SPINS.toLocaleString('fr-FR')} spins : ${pct(sim.rtp / cost)} (écart normal de quelques dixièmes)`);
  if (Math.abs(total - RTP) > 0.005) console.log(`  ! RTP ${mode} loin de ${pct(RTP)} -> relance avec --calibre`);
}
for (const t of [3, 4]) console.log(`  Achat ${names[t].toLowerCase().padEnd(12)} ${pct(S[t].mean / E.BUY[t])}  (${E.BUY[t]}× la mise)`);
console.log('');
