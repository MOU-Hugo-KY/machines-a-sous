// @@MUSIQUE-DEBUT
// ---------- MUSIQUE : un petit compositeur (harmonie, voicings liés, mélodies à motifs) et des instruments doux ----------
// MUSIQUE(ctx, bus, partition) -> { start(bonus), stop(), setBonus(v), hush(v), setMood(m) }
// La partition décrit le morceau (tonalité, gamme, tempo, suite d'accords, instruments) ; tout le reste est composé ici,
// avec un aléatoire à graine : le morceau est toujours le même au début, puis ses mélodies varient à chaque tour.
// Voir references/musique.md.
const MUSIQUE = (() => {
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], harmonic: [0, 2, 3, 5, 7, 8, 11], mixo: [0, 2, 4, 5, 7, 9, 10] };
  // notes d'un accord bâti en tierces sur un degré de la gamme ; ext : '', '7', '9', 'maj7' (= 7), 'maj9' (= 9), '6', 'sus', 'sus9', 'add9'
  function chord(P, deg, ext = '') {
    const sc = SCALES[P.scale], at = i => sc[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7), d = deg - 1;
    const idx = [d, ext.startsWith('sus') ? d + 3 : d + 2, d + 4];
    if (/7|9/.test(ext) && ext !== 'add9') idx.push(d + 6);
    if (/9/.test(ext)) idx.push(d + 8);
    if (ext === '6') idx.push(d + 5);
    return { root: at(d), tones: idx.map(at) };
  }
  // voicing : chaque note prend l'octave la plus proche de la voix précédente (enchaînements doux, sans sauts)
  function voice(prev, tones, key, lo, hi) {
    const center = prev ? prev.reduce((a, b) => a + b, 0) / prev.length : (lo + hi) / 2;
    return tones.map(t => { let m = key + t; while (m < center - 6) m += 12; while (m > center + 6) m -= 12; while (m < lo) m += 12; while (m > hi) m -= 12; return m; }).sort((a, b) => a - b);
  }
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  return function create(ctx, bus, P) {
    const R = rng(P.seed || 7);
    // ---------- mixage : sec + réverbération (réponse impulsionnelle générée) + écho, filtre chaud, compresseur ----------
    const out = ctx.createGain(); out.gain.value = 0; out.connect(bus);
    const warm = ctx.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = P.bright || 6000; warm.Q.value = 0.3;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.02; comp.release.value = 0.3;
    warm.connect(comp).connect(out);
    const dry = ctx.createGain(); dry.connect(warm);
    const verb = ctx.createConvolver(), verbIn = ctx.createGain(); verbIn.gain.value = 1;
    { const len = Math.floor(ctx.sampleRate * (P.reverb || 2.6)), ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lp = 0; for (let i = 0; i < len; i++) { lp += ((Math.random() * 2 - 1) - lp) * 0.35; d[i] = lp * Math.pow(1 - i / len, 2.4); } }
      verb.buffer = ir; }
    const verbOut = ctx.createGain(); verbOut.gain.value = 0.55; verbIn.connect(verb).connect(verbOut).connect(warm);
    const delay = ctx.createDelay(2), fb = ctx.createGain(), dlp = ctx.createBiquadFilter(), dOut = ctx.createGain();
    dlp.type = 'lowpass'; dlp.frequency.value = 2200; fb.gain.value = 0.32; dOut.gain.value = 0.22;
    delay.connect(dlp).connect(fb).connect(delay); dlp.connect(dOut).connect(warm);
    // groupes « ducking » : la nappe et la basse s'effacent un instant sous chaque grosse caisse (respiration)
    const padBus = ctx.createGain(); padBus.connect(dry); const padSend = ctx.createGain(); padSend.gain.value = 0.5; padBus.connect(padSend).connect(verbIn);
    const bassBus = ctx.createGain(); bassBus.connect(dry);
    const send = (node, rv = 0.3, dl = 0) => { node.connect(dry); if (rv) { const g = ctx.createGain(); g.gain.value = rv; node.connect(g).connect(verbIn); } if (dl) { const g = ctx.createGain(); g.gain.value = dl; node.connect(g).connect(delay); } };

    let mood = '';
    const det = () => (mood === 'mad' ? (Math.random() - 0.5) * 70 : 0); // la folie désaccorde tout
    function env(g, t, a, peak, d, r = 0.3) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.setTargetAtTime(0.0001, t + a + d, r); }
    const osc = (type, f, t, stop, dt = 0) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = dt; o.start(t); o.stop(stop); return o; };
    // ---------- instruments ----------
    const I = {
      // piano électrique (FM : la brillance du marteau s'éteint vite, reste un son rond)
      epiano(m, t, dur, v) {
        const f = mtof(m), end = t + dur + 1.6, c = osc('sine', f, t, end, det()), mo = osc('sine', f, t, end), mg = ctx.createGain(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
        mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * 0.25, t + 0.5); mo.connect(mg).connect(c.frequency);
        const tine = osc('sine', f * 7, t, t + 0.3), tg = ctx.createGain(); env(tg, t, 0.002, v * 0.05, 0.02, 0.05); tine.connect(tg).connect(g);
        lp.type = 'lowpass'; lp.frequency.value = 2600; env(g, t, 0.006, v * 0.22, dur * 0.4, dur * 0.6 + 0.3);
        c.connect(g); g.connect(lp); send(lp, 0.28, 0.08);
      },
      // marimba : bois chaud, partiel à ×4 très bref
      mallet(m, t, dur, v) {
        const f = mtof(m), g = ctx.createGain(), a = osc('sine', f, t, t + 1.4, det()), b = osc('sine', f * 4, t, t + 0.25), bg = ctx.createGain();
        env(g, t, 0.003, v * 0.28, 0.05, 0.28); env(bg, t, 0.002, v * 0.06, 0.01, 0.03); a.connect(g); b.connect(bg).connect(g); send(g, 0.3, 0.12);
      },
      // boîte à musique : partiels de cloche doux, longue résonance
      musicbox(m, t, dur, v) {
        const f = mtof(m), g = ctx.createGain(); env(g, t, 0.002, v * 0.12, 0.02, 0.7);
        [[1, 1], [3, 0.28], [6.1, 0.08], [9.4, 0.03]].forEach(([k, a]) => { const o = osc('sine', f * k, t, t + 2.4, det()), og = ctx.createGain(); og.gain.value = a; o.connect(og).connect(g); });
        send(g, 0.45, 0.2);
      },
      // harpe feutrée (corde pincée, filtrée pour rester douce)
      harp(m, t, dur, v) {
        const f = mtof(m), g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800 + v * 800;
        const a = osc('triangle', f, t, t + 2, det()), b = osc('sine', f * 2, t, t + 1, det()), bg = ctx.createGain(); bg.gain.value = 0.3;
        env(g, t, 0.004, v * 0.2, 0.05, 0.55); a.connect(g); b.connect(bg).connect(g); g.connect(lp); send(lp, 0.4, 0.1);
      },
      // flûte : sinus, souffle, vibrato qui arrive tard
      flute(m, t, dur, v) {
        const f = mtof(m), end = t + dur + 0.6, o = osc('sine', f, t, end, det()), g = ctx.createGain(), vib = osc('sine', 5, t, end), vg = ctx.createGain();
        vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.006, t + Math.min(0.5, dur)); vib.connect(vg).connect(o.frequency);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * 0.14, t + 0.06); g.gain.setTargetAtTime(v * 0.1, t + 0.1, 0.2); g.gain.setTargetAtTime(0.0001, t + dur, 0.12);
        o.connect(g); send(g, 0.4, 0.18);
      },
      // nappe : scies désaccordées très filtrées, attaque et relâche lentes
      pad(notes, t, dur, v, bright = 650) {
        notes.forEach((m, i) => {
          const f = mtof(m), end = t + dur + 3, g = ctx.createGain(), lp = ctx.createBiquadFilter(), lfo = osc('sine', 0.13 + i * 0.03, t, end), lg = ctx.createGain();
          lp.type = 'lowpass'; lp.frequency.value = bright; lp.Q.value = 0.5; lg.gain.value = bright * 0.35; lfo.connect(lg).connect(lp.frequency);
          [-9, 9].forEach(dt => osc('sawtooth', f, t, end, dt + det()).connect(g));
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * 0.035, t + 1.1); g.gain.setTargetAtTime(0.0001, t + dur, 0.9);
          g.connect(lp).connect(padBus);
        });
      },
      bass(m, t, dur, v) {
        const f = mtof(m), g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
        osc('sine', f, t, t + dur + 0.5).connect(g); const tr = osc('triangle', f, t, t + dur + 0.5), tg = ctx.createGain(); tg.gain.value = 0.35; tr.connect(tg).connect(g);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * 0.34, t + 0.012); g.gain.setTargetAtTime(v * 0.2, t + 0.05, 0.15); g.gain.setTargetAtTime(0.0001, t + dur, 0.08);
        g.connect(lp).connect(bassBus);
      },
    };
    const noise = (() => { const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
    function hit(t, type, freq, q, v, dur, rv = 0.15) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = type; f.frequency.value = freq; f.Q.value = q; env(g, t, 0.002, v, 0.005, dur); s.connect(f).connect(g); send(g, rv); s.start(t, Math.random() * 0.5); s.stop(t + dur * 5 + 0.1); }
    const D = {
      kick(t, v) { const o = osc('sine', 110, t, t + 0.4), g = ctx.createGain(); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); env(g, t, 0.003, v * 0.5, 0.04, 0.09); o.connect(g).connect(dry);
        [padBus, bassBus].forEach(b => { b.gain.cancelScheduledValues(t); b.gain.setValueAtTime(0.45, t); b.gain.setTargetAtTime(1, t + 0.03, 0.09); }); },
      snare(t, v) { hit(t, 'bandpass', 1900, 0.8, v * 0.09, 0.07, 0.3); hit(t, 'lowpass', 900, 0.7, v * 0.05, 0.04); },
      rim(t, v) { const o = osc('triangle', 1700, t, t + 0.06), g = ctx.createGain(); env(g, t, 0.001, v * 0.05, 0.003, 0.012); o.connect(g); send(g, 0.25); },
      hat(t, v) { hit(t, 'highpass', 8000, 0.7, v * 0.028, 0.018, 0.05); },
      brush(t, v) { hit(t, 'bandpass', 3200, 0.6, v * 0.035, 0.09, 0.2); },
    };

    // ---------- composition ----------
    const beats = P.beats || 4, SPB = 4, BAR = beats * SPB; // 16 pas par mesure en 4/4, 12 en 3/4
    const RHY = beats === 3 ? [[0, 4, 8], [0, 6, 8], [0, 2, 4, 8], [0, 8], [4, 8, 10]] : [[0, 4, 8, 12], [0, 6, 8, 14], [0, 3, 6, 10], [2, 4, 8, 11], [0, 8, 10, 12], [0, 6, 12], [4, 6, 8]];
    let prevPad = null, prevKeys = null, lastLead = P.key + 12;
    const scale = SCALES[P.scale];
    const inScale = m => scale.includes(((m - P.key) % 12 + 12) % 12);
    const nearestIn = (m, pcs) => { for (let d = 0; d < 12; d++) for (const s of [1, -1]) { const x = m + d * s; if (pcs.includes(((x - P.key) % 12 + 12) % 12)) return x; } return m; };
    const stepScale = (m, n) => { let x = m; const dir = Math.sign(n); for (let k = 0; k < Math.abs(n); k++) { do x += dir; while (!inScale(x)); } return x; };
    // une phrase de 4 mesures : motif, réponse, motif transposé sur l'accord, cadence longue
    function phrase(prog, bar0) {
      const notes = [], r1 = RHY[Math.floor(R() * RHY.length)], r2 = RHY[Math.floor(R() * RHY.length)], lo = P.lead?.lo ?? P.key + 5, hi = P.lead?.hi ?? P.key + 21;
      let motif = null;
      for (let b = 0; b < 4; b++) {
        const c = chord(P, ...prog[(bar0 + b) % prog.length]), pcs = c.tones.map(t => ((t % 12) + 12) % 12);
        const rhy = b === 3 ? [0] : b === 1 ? r2 : r1;
        if (b === 2 && motif) { const shift = nearestIn(motif[0], pcs) - motif[0]; rhy.forEach((s, i) => notes.push({ bar: b, s, m: Math.max(lo, Math.min(hi, motif[i] + shift)) })); lastLead = notes.at(-1).m; continue; }
        const cur = [];
        rhy.forEach((s, i) => {
          let m;
          if (b === 3) m = nearestIn(lastLead, [pcs[0], pcs[1]]);                  // cadence : fondamentale ou tierce
          else if (s % (SPB * 2) === 0) m = nearestIn(stepScale(lastLead, Math.round((R() - 0.5) * 4)), pcs); // temps fort : note de l'accord
          else m = stepScale(lastLead, R() < 0.5 ? 1 : -1);                         // temps faible : note de passage
          if (m > hi) m -= 12; if (m < lo) m += 12;
          lastLead = m; cur.push(m); notes.push({ bar: b, s, m });
        });
        if (b === 0) motif = cur;
      }
      // durée de chaque note : jusqu'à la suivante (legato), la dernière tient deux temps
      notes.forEach((n, i) => { const nx = notes[i + 1]; n.len = nx ? (nx.bar - n.bar) * BAR + nx.s - n.s : SPB * 2; });
      return notes;
    }
    // forme sur 32 mesures : A (accords, basse, batterie légère), B (mélodie), B' (mélodie + arpège), C (respiration)
    const section = bar => ['A', 'A', 'B', 'B', 'B', 'B', 'C', 'C'][Math.floor(bar / 4) % 8];
    let phr = null, phrBar = -1;

    // ---------- séquenceur ----------
    let bonus = false, timer = null, next = 0, step = 0, bar = 0, hushed = false;
    const tempo = () => (bonus ? P.bonus?.bpm || P.bpm * 1.18 : P.bpm);
    const cfg = () => (bonus ? { ...P.sound, ...(P.bonus?.sound || {}) } : P.sound);
    const progNow = () => (bonus && P.bonus?.prog) || P.prog;
    function playStep(t, sd) {
      const s = step % BAR, S = cfg(), prog = progNow(), sec = bonus ? (['A', 'B', 'B', 'B'][Math.floor(bar / 4) % 4]) : section(bar);
      const c = chord(P, ...prog[bar % prog.length]);
      const sw = (s % 2 === 1 ? (P.swing ?? 0.1) * sd : 0) + (Math.random() - 0.5) * 0.006, tt = t + sw, vel = () => 0.85 + Math.random() * 0.2;
      // nappe : l'accord entier, tenu toute la mesure
      if (s === 0 && S.pad !== false) { prevPad = voice(prevPad, c.tones, P.key, P.key - 7, P.key + 10); I.pad(prevPad, t, sd * BAR, sec === 'C' ? 0.8 : 1, S.padBright || 650); }
      // basse
      if (S.bass) {
        const root = P.key - 24 + ((c.root % 12) + 12) % 12, fifth = root + 7;
        if (S.bass === 'pulse') { if (s % 2 === 0) I.bass(s % 8 === 0 ? root : (s % 8 === 4 ? fifth : root), tt, sd * 1.6, s % 4 === 0 ? 1 : 0.7); }
        else if (beats === 3) { if (s === 0) I.bass(root, t, sd * 10, 1); }
        else { if (s === 0) I.bass(root, t, sd * 6, 1); if (s === 8) I.bass(R() < 0.6 ? fifth : root, tt, sd * 5, 0.8); if (s === 14 && R() < 0.3) I.bass(root + 12, tt, sd * 1.5, 0.6); }
      }
      // accompagnement
      const K = I[S.keys];
      if (K) {
        if (s === 0) prevKeys = voice(prevKeys, c.tones, P.key, P.key - 2, P.key + 14);
        const v = prevKeys || [];
        if (S.comp === 'waltz') { if (s === 4 || s === 8) v.forEach((m, i) => K(m, tt + i * 0.012, sd * 3, 0.55 * vel())); }
        else if (S.comp === 'broken') { if (s % 2 === 0) K(v[(s / 2) % v.length] + (s >= BAR / 2 ? 12 : 0), tt, sd * 2, 0.5 * vel()); }
        else if (S.comp === 'sparse') { if (s === 0 || (s === 10 && R() < 0.5)) v.slice(0, 3).forEach((m, i) => K(m + 12, tt + i * 0.05, sd * 6, 0.5 * vel())); }
        else { if (s === 0 || s === 6 || (s === 10 && R() < 0.6)) v.forEach((m, i) => K(m, tt + i * 0.008, sd * (s === 0 ? 6 : 3), (s === 0 ? 0.6 : 0.45) * vel())); }
      }
      // arpège (bonus, et second passage de la mélodie)
      if (S.arp && (bonus || sec === 'B' && bar % 8 >= 4) && s % 2 === 0) { const A = I[S.arpInst || 'musicbox'], tones = c.tones.map(x => P.key + 12 + x); A(tones[(s / 2) % tones.length] + ((s / 2) % 8 >= 4 ? 12 : 0), tt, sd * 2, 0.32 * vel()); }
      // mélodie : une phrase de 4 mesures, recomposée à chaque phrase
      if (S.lead && (sec === 'B' || (sec === 'C' && bar % 4 < 2))) {
        const pb = bar - (bar % 4);
        if (pb !== phrBar) { phr = phrase(prog, pb); phrBar = pb; }
        for (const n of phr) if (n.bar === bar % 4 && n.s === s) I[S.lead](n.m, tt, sd * n.len * 0.92, (sec === 'C' ? 0.6 : 0.8) * vel());
      }
      // batterie
      const dr = S.drums, drumsOn = dr && dr !== 'none' && (bonus || sec === 'B' || (sec === 'A' && bar % 8 >= 4));
      if (drumsOn) {
        if (dr === 'waltz') { if (s === 0) D.kick(t, 0.6); if (s === 4 || s === 8) D.brush(tt, 0.7); if (s % 2 === 1) D.hat(tt, 0.4); }
        else if (dr === 'brush') { if (s === 0) D.kick(t, 0.5); if (s % 4 === 2) D.brush(tt, 0.6); if (s === 4 || s === 12) D.rim(tt, 0.6); }
        else if (dr === 'drive') { if (s % 4 === 0) D.kick(t, 0.8); if (s === 4 || s === 12) D.snare(tt, 0.9); if (s % 2 === 0) D.hat(tt, s % 4 === 2 ? 1 : 0.5); }
        else { if (s === 0 || s === 10) D.kick(t, 0.75); if (s === 4 || s === 12) (bonus ? D.snare : D.rim)(tt, 0.8); if (s % 2 === 0) D.hat(tt, s % 4 === 2 ? 0.9 : 0.5); }
      }
    }
    function tick() {
      const sd = 60 / tempo() / SPB;
      while (next < ctx.currentTime + 0.2) {
        if (!hushed) playStep(next, sd);
        next += sd; step++; if (step % BAR === 0) bar++;
      }
    }
    const fade = (v, tc = 0.8) => { out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(v, ctx.currentTime, tc); };
    const vol = () => P.volume ?? 0.9;
    return {
      // rendu hors temps réel (OfflineAudioContext) : pour les tests et les aperçus
      prerender(sec, b = false) { bonus = b; next = 0.05; step = 0; bar = 0; out.gain.value = vol(); const sd = 60 / tempo() / SPB; while (next < sec) { playStep(next, sd); next += sd; step++; if (step % BAR === 0) bar++; } },
      start(b = false) { bonus = b; if (timer) return; next = ctx.currentTime + 0.1; step = 0; bar = 0; timer = setInterval(tick, 40); fade(vol(), 1.2); },
      stop() { fade(0, 0.25); clearInterval(timer); timer = null; }, // les notes déjà planifiées s'éteignent dans le fondu
      setBonus(v) { if (v === bonus) return; bonus = v; bar = 0; step = step - (step % BAR); phrBar = -1; },
      hush(v) { hushed = v; fade(v ? 0 : vol(), v ? 0.15 : 0.8); },
      setMood(m) { mood = m; warm.frequency.setTargetAtTime(m === 'mad' ? 1800 : P.bright || 6000, ctx.currentTime, 0.8); },
    };
  };
})();
// @@MUSIQUE-FIN
