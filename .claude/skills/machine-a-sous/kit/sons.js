// @@SONS-DEBUT
// ---------- SONS : bruitages doux et satisfaisants, partagés par les machines ----------
// SONS(ctx, bus) -> { spinStart, spinStop, land(col), click, chime, win, tick, fanfare, gong, shimmer, swish, whoosh, thunk, heartbeat, drone }
// Tout passe par une petite réverbération courte : les sons restent nets mais jamais secs. Voir references/musique.md.
const SONS = (ctx, bus) => {
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const now = () => ctx.currentTime;
  const out = ctx.createGain(); out.gain.value = 0.9; out.connect(bus);
  const wet = ctx.createGain(); wet.gain.value = 0.2; wet.connect(bus);
  const verb = ctx.createConvolver();
  { const len = Math.floor(ctx.sampleRate * 0.9), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lp = 0; for (let i = 0; i < len; i++) { lp += ((Math.random() * 2 - 1) - lp) * 0.3; d[i] = lp * Math.pow(1 - i / len, 3); } }
    verb.buffer = ir; }
  const vin = ctx.createGain(); vin.connect(verb).connect(wet);
  const noise = (() => { const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const dest = (g, rv = 1, pan = 0) => { let n = g; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); n = p; } n.connect(out); if (rv) { const s = ctx.createGain(); s.gain.value = rv; n.connect(s).connect(vin); } };
  function sine(f, t, v, d, o = {}) {
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d * 0.8);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.a || 0.003)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(g); dest(g, o.rv ?? 1, o.pan || 0); osc.start(t); osc.stop(t + d + 0.05);
  }
  function hiss(t, d, v, type, f, q, o = {}) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (o.to) fl.frequency.exponentialRampToValueAtTime(o.to, t + d * 0.9);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.a || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl).connect(g); dest(g, o.rv ?? 0.6, o.pan || 0); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
  }
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
  // toc boisé et accordé : une lame de marimba, un petit clic, un coup sourd en dessous
  function thock(m, t, v = 0.5) {
    const f = mtof(m);
    sine(f, t, v * 0.42, 0.42); sine(f * 2.01, t, v * 0.1, 0.14); sine(f * 3.98, t, v * 0.05, 0.05, { rv: 0.3 });
    sine(120, t, v * 0.45, 0.12, { to: 55, rv: 0 }); hiss(t, 0.014, v * 0.18, 'bandpass', 2600, 1.2, { rv: 0.2 });
  }
  function chime(m, t, v = 0.14, pan = 0) { const f = mtof(m); sine(f, t, v, 1.1, { pan }); sine(f * 2.76, t, v * 0.12, 0.35, { pan }); sine(f * 5.4, t, v * 0.04, 0.15, { pan }); }
  let roll = null;
  const A = {
    // lancement : un souffle qui monte, puis un roulement feutré (petits tocs doux et réguliers)
    spinStart() {
      if (roll) return; const t = now();
      hiss(t, 0.32, 0.12, 'bandpass', 300, 0.9, { to: 1700, a: 0.12 });
      let k = 0; roll = setInterval(() => { const tt = now(); sine(k % 2 ? 1180 : 1320, tt, 0.035, 0.03, { rv: 0.2 }); hiss(tt, 0.012, 0.03, 'highpass', 4000, 0.7, { rv: 0 }); k++; }, 52);
    },
    spinStop() { clearInterval(roll); roll = null; },
    // un rouleau qui s'arrête : un toc accordé, une note plus haut à chaque colonne (gamme pentatonique)
    land(c) { thock(72 + PENTA[Math.min(c, PENTA.length - 1)], now(), 0.55); },
    click() { const t = now(); sine(1900, t, 0.08, 0.025, { rv: 0.2 }); sine(2500, t + 0.012, 0.04, 0.02, { rv: 0.2 }); },
    chime(m, v, pan, dt = 0) { chime(m, now() + dt, v, pan); },
    // gain : un arpège de clochettes qui monte, plus long pour un gros gain
    win(level = 1) { const t = now(), n = level > 1 ? 7 : 4; for (let i = 0; i < n; i++) chime(84 + PENTA[i], t + i * 0.06, 0.12, (i % 2 ? 0.3 : -0.3)); },
    tick(p = 0) { const t = now(); sine(1900 + p * 1200, t, 0.04, 0.03, { rv: 0.3 }); },
    fanfare() { const t = now(); for (let i = 0; i < 10; i++) chime(79 + PENTA[i], t + i * 0.05, 0.11, Math.sin(i) * 0.5); A.gong(43, 0.16); },
    gong(m = 43, v = 0.2) { const t = now(), f = mtof(m); [[1, 1, 3.2], [2.41, 0.4, 2.2], [3.93, 0.2, 1.4], [5.3, 0.1, 0.9]].forEach(([k, a, d]) => sine(f * k, t, v * a, d, { a: 0.01 })); },
    shimmer(v = 1) { const t = now(); for (let i = 0; i < 6; i++) chime(91 + PENTA[Math.floor(Math.random() * 5)], t + i * 0.045 + Math.random() * 0.02, 0.06 * v, Math.random() - 0.5); },
    swish(d = 0.6, v = 0.14) { hiss(now(), d, v, 'bandpass', 1800, 0.7, { to: 400, a: d * 0.35 }); },
    whoosh() { hiss(now(), 0.55, 0.16, 'bandpass', 350, 0.9, { to: 2200, a: 0.2 }); },
    thunk() { const t = now(); sine(95, t, 0.5, 0.28, { to: 48, rv: 0.2 }); hiss(t, 0.06, 0.12, 'lowpass', 400, 0.7, { rv: 0 }); },
    heartbeat() { const t = now(); sine(62, t, 0.45, 0.16, { to: 45, rv: 0 }); sine(58, t + 0.22, 0.32, 0.14, { to: 42, rv: 0 }); },
    drone(d = 2.5) { const t = now(); [[38, 0], [38.08, 0], [45, 0.4]].forEach(([m, dl]) => sine(mtof(m), t + dl, 0.12, d, { a: 0.6, type: 'triangle' })); },
  };
  return A;
};
// @@SONS-FIN
