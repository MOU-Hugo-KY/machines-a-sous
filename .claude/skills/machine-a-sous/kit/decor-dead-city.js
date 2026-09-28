// ---------- DECOR3D : la ville évacuée de Dead City, nuit rouge ; pendant le bonus, le nuage toxique monte et la horde envahit la rue ----------
const DECOR3D = (K, M) => ({
  build(scene, cam) {
    const { THREE, part, G, TAU, sky, dots } = K;
    const C = c => new THREE.Color(c), lerp = (a, b, t) => C(a).lerp(C(b), t);
    const grad = K.mat(0xffffff).gradientMap;
    const toon = (c, o = {}) => { const m = new THREE.MeshToonMaterial({ color: c, gradientMap: grad }); if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = o.glow ?? 1; } if (o.opacity != null) { m.transparent = true; m.opacity = o.opacity; m.depthWrite = false; } return m; };
    const P = (geo, m, o = {}) => part(geo, m instanceof THREE.Material ? m : toon(m, o), { ink: 0.05, ...o });
    const grp = (...c) => { const g = new THREE.Group(); g.add(...c.flat()); return g; };
    const rnd = (() => { let s = 23; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    const halo = (col, size, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.setScalar(size); return s; };
    const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
    const N = { top: 0x12060C, mid: 0x7A1A14, bot: 0x2A0C10, fog: 0x5A1A18 }, B = { top: 0x0A140A, mid: 0x3A5A1A, bot: 0x14200E, fog: 0x2E4A1A };

    cam.position.set(0, 3.4, 15); cam.userData.target.set(0, 4, 0);
    scene.fog = new THREE.Fog(N.fog, 24, 100);
    const skyM = sky(N.top, N.mid, N.bot); scene.add(skyM);
    const hemi = new THREE.HemisphereLight(0xFF9A7A, 0x2A1020, 1.3); scene.add(hemi);
    const fireLight = new THREE.DirectionalLight(0xFF7A3A, 1.8); fireLight.position.set(-6, 10, 8); scene.add(fireLight);
    const copLight = new THREE.PointLight(0x3AA0FF, 0, 18, 1.5); copLight.position.set(6.2, 2.4, -1.2); scene.add(copLight);
    const copLight2 = new THREE.PointLight(0xFF2A2A, 0, 18, 1.5); copLight2.position.set(6.2, 2.4, -1.2); scene.add(copLight2);

    // lune rouge, étoiles pâles, fumée
    const moon = grp(halo(0xFF5A2A, 46, 0.7), new THREE.Mesh(new THREE.SphereGeometry(5.5, 32, 16), new THREE.MeshBasicMaterial({ color: 0xFF6A3A, fog: false })));
    moon.position.set(18, 26, -72); scene.add(moon);
    const stars = dots(300, () => { const a = rnd() * TAU, e = 0.3 + rnd() * 1.1; return [Math.cos(a) * Math.cos(e) * 85, Math.sin(e) * 85, Math.sin(a) * Math.cos(e) * 85 - 10]; }, () => 0xFFD6C0, { size: 6, twinkle: 1.5, opacity: 0.5 });
    stars.material.fog = false; scene.add(stars);
    const smokeM = new THREE.MeshBasicMaterial({ color: 0x2A1014, transparent: true, opacity: 0.55, depthWrite: false });
    const plumes = [[-14, -30], [9, -34], [22, -26]].map(([x, z]) => { const g = new THREE.Group(); for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), smokeM.clone()); g.add(m); } g.position.set(x, 0, z); scene.add(g); return g; });

    // sol : bitume, trottoirs, ligne jaune
    const road = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), toon(0x1E1418)); road.rotation.x = -Math.PI / 2; scene.add(road);
    const lineM = toon(0xFFC21A, { emissive: 0xFFC21A, glow: 0.15 });
    for (let i = 0; i < 14; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 1.6), lineM); l.rotation.x = -Math.PI / 2; l.position.set(0, 0.02, 12 - i * 3.5); scene.add(l); }
    [-5.5, 5.5].forEach(x => { const s = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 90), toon(0x3A2A30)); s.position.set(x + Math.sign(x) * 1.5, 0.12, -30); scene.add(s); });

    // immeubles : fenêtres allumées, éteintes, en feu
    const winLit = [], fires = [];
    const bM = [0x2A1A24, 0x3A2430, 0x241820, 0x33202A];
    function building(x, z, w, h, d) {
      const g = new THREE.Group();
      g.add(P(G.box(w, h, d, 0.08), bM[Math.floor(rnd() * 4)], { pos: [0, h / 2, 0], ink: 0.06 }));
      const cols = Math.max(2, Math.floor(w / 1.1)), rows = Math.max(2, Math.floor(h / 1.4));
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const k = rnd(); if (k < 0.45) continue;
        const lit = k > 0.8, m = lit ? toon(0x3A2A20, { emissive: rnd() < 0.3 ? 0xFF7A3A : 0xFFC860, glow: 0.9 }) : toon(0x120A0E);
        if (lit) winLit.push(m);
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), m); win.position.set(-w / 2 + (c + 0.5) * w / cols, 1 + r * (h - 1.5) / rows, d / 2 + 0.01); g.add(win);
      }
      if (rnd() < 0.35) { const f = P(G.cone(0.7, 2, 10), toon(0xFF7A1F, { emissive: 0xFF5A1F, glow: 1.2 }), { ink: 0, pos: [(rnd() - 0.5) * w * 0.6, h + 0.9, 0] }); g.add(f, at(halo(0xFF6A2A, 7, 0.8), f.position.x, h + 1, 0)); fires.push(f); }
      g.position.set(x, 0, z); scene.add(g); return g;
    }
    for (let i = 0; i < 12; i++) { const side = i % 2 ? 1 : -1; building(side * (12 + (i % 4) * 0.8), -12 - Math.floor(i / 2) * 7, 5 + rnd() * 2, 6 + rnd() * 9, 5); }
    for (let i = 0; i < 9; i++) building(-26 + i * 6.5, -48 - rnd() * 6, 5 + rnd() * 2, 12 + rnd() * 14, 5);

    // voitures abandonnées, voiture de police aux gyrophares, barricade
    function car(x, z, ry, col, cop = false) {
      const g = grp(P(G.box(3.4, 0.9, 1.6, 0.2), col, { pos: [0, 0.75, 0] }), P(G.box(2, 0.7, 1.45, 0.2), col, { pos: [-0.2, 1.45, 0] }), P(G.box(1.9, 0.5, 1.5, 0.1), toon(0x3A4A5A), { pos: [-0.2, 1.45, 0], ink: 0 }));
      [[-1.1, 0.8], [1.1, 0.8], [-1.1, -0.8], [1.1, -0.8]].forEach(([a, b]) => g.add(P(G.cyl(0.38, 0.38, 0.3, 16), 0x1A1A1A, { pos: [a, 0.38, b], rot: [Math.PI / 2, 0, 0], ink: 0.03 })));
      let lights = null;
      if (cop) { const r = toon(0xFF2A2A, { emissive: 0xFF2A2A, glow: 0 }), bl = toon(0x3AA0FF, { emissive: 0x3AA0FF, glow: 0 }); g.add(P(G.box(0.35, 0.2, 0.4, 0.05), r, { pos: [-0.2, 1.9, -0.25] }), P(G.box(0.35, 0.2, 0.4, 0.05), bl, { pos: [-0.2, 1.9, 0.25] })); lights = { r, bl }; }
      g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); return lights;
    }
    const cop = car(6.2, -1.5, -0.5, 0xF4F0EA, true);
    car(-6.4, -3, 0.35, 0x8A3A2A); car(-3.8, -10, 1.3, 0x3A5A7A); car(4.2, -14, -1.1, 0x6A6A3A); car(-4.5, -22, 0.2, 0x5A2A5A);
    const hazard = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 16; const x = c.getContext('2d'); for (let i = -2; i < 8; i++) { x.fillStyle = i % 2 ? '#1A0F14' : '#FFC21A'; x.beginPath(); x.moveTo(i * 10, 16); x.lineTo(i * 10 + 10, 16); x.lineTo(i * 10 + 18, 0); x.lineTo(i * 10 + 8, 0); x.fill(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); return t; })();
    [[-4.2, 3.2, 0.3], [4.4, 3.6, -0.25]].forEach(([x, z, ry]) => { const g = grp(P(G.box(2.6, 0.35, 0.2, 0.04), new THREE.MeshToonMaterial({ map: hazard, gradientMap: grad }), { pos: [0, 0.9, 0] }), P(G.box(0.12, 0.9, 0.12, 0.02), 0x5A4A5E, { pos: [-1.1, 0.45, 0] }), P(G.box(0.12, 0.9, 0.12, 0.02), 0x5A4A5E, { pos: [1.1, 0.45, 0] })); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); });
    // barils en feu, réverbères qui grésillent
    const barrels = [[-8.2, 1.5], [8.6, -5], [-3.4, -9]].map(([x, z]) => { const f = [P(G.cone(0.42, 1.2, 10), toon(0xFF7A1F, { emissive: 0xFF5A1F, glow: 1.2 }), { ink: 0, pos: [0, 1.6, 0] }), P(G.cone(0.24, 0.8, 10), toon(0xFFE27A, { emissive: 0xFFE27A, glow: 1.2 }), { ink: 0, pos: [0, 1.4, 0.05] })]; const h = halo(0xFF7A2A, 5, 0.9); h.position.y = 1.5; const g = grp(P(G.cyl(0.45, 0.45, 1, 16), 0x9A4A22, { pos: [0, 0.5, 0] }), f, h); g.position.set(x, 0, z); scene.add(g); return { f, h }; });
    const lamps = [[-6.6, 0], [6.6, -8], [-6.6, -18]].map(([x, z], i) => { const bulb = toon(0xFFE9B0, { emissive: 0xFFD27A, glow: 1 }); const h = halo(0xFFC870, 5, 0.8); const g = grp(P(G.cyl(0.07, 0.09, 5, 8), 0x3A3440, { pos: [0, 2.5, 0], ink: 0.03 }), P(G.box(0.9, 0.12, 0.2, 0.03), 0x3A3440, { pos: [x < 0 ? 0.4 : -0.4, 5, 0], ink: 0.03 }), P(G.sphere(0.18), bulb, { pos: [x < 0 ? 0.8 : -0.8, 4.85, 0], ink: 0.02 })); h.position.set(x < 0 ? 0.8 : -0.8, 4.8, 0); g.add(h); g.position.set(x, 0, z); scene.add(g); return { bulb, h, ph: i * 1.7 }; });

    // projecteurs qui fouillent le ciel, hélico qui passe
    const beamM = new THREE.MeshBasicMaterial({ color: 0xFFE9B0, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
    const beams = [[-16, -40], [18, -44]].map(([x, z]) => { const piv = new THREE.Group(), c = new THREE.Mesh(new THREE.ConeGeometry(2.4, 50, 20, 1, true), beamM); c.position.y = 25; c.rotation.x = Math.PI; piv.add(c); piv.position.set(x, 0, z); scene.add(piv); return piv; });
    const heli = new THREE.Group(), rotor = new THREE.Group();
    heli.add(P(G.sphere(1), 0x2A3A4A, { scale: [1.5, 0.9, 0.9] }), P(G.box(2.6, 0.25, 0.25, 0.05), 0x2A3A4A, { pos: [-2, 0.2, 0] }), P(G.sphere(0.5), toon(0xCFF3FF, { emissive: 0x9FE8FF, glow: 0.4 }), { pos: [0.9, 0.1, 0], ink: 0.03 }));
    rotor.add(P(G.box(5, 0.05, 0.25, 0.02), 0x1A1A1A, { ink: 0.02 }), P(G.box(0.25, 0.05, 5, 0.02), 0x1A1A1A, { ink: 0.02 })); rotor.position.y = 1.05; heli.add(rotor);
    const spot = new THREE.Mesh(new THREE.ConeGeometry(2.8, 24, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    spot.position.y = -12; heli.add(spot); heli.add(at(halo(0xFF3A3A, 2, 1), -3.2, 0.4, 0));
    scene.add(heli);

    // la horde : des zombies qui traînent la patte dans la rue (plus nombreux pendant le bonus)
    const walkers = [];
    const mkZ = () => { const z = M && M.zombie ? M.zombie(false) : P(G.capsule(0.5, 1), 0x7CD84A); z.traverse(o => { if (o.isMesh && o.material && o.material.side !== THREE.BackSide) o.material = o.material.clone(); }); return z; };
    for (let i = 0; i < 9; i++) {
      const z = mkZ(), w = new THREE.Group(); w.add(z); z.position.y = 1.55; w.scale.setScalar(0.75 + rnd() * 0.25);
      const lane = i < 4 ? 0 : 1; // 0 : toujours là ; 1 : seulement pendant le bonus
      w.userData = { lane, z: -2 - rnd() * 20, x0: (rnd() - 0.5) * 7, sp: 0.35 + rnd() * 0.3, ph: rnd() * 100, dir: rnd() < 0.5 ? 1 : -1 };
      scene.add(w); walkers.push(w);
    }
    // premier plan pour le téléphone : deux zombies et un baril juste sous la machine
    const front = new THREE.Group(); scene.add(front);
    const fz = [mkZ(), mkZ()]; fz.forEach((z, i) => { const w = new THREE.Group(); w.add(z); z.position.y = 1.55; w.scale.setScalar(0.55); w.position.set(i ? 1.3 : -1.4, 0, 9.4 + i * 0.4); w.rotation.y = i ? -0.5 : 0.5; front.add(w); });

    // braises qui montent, cendres qui tombent, nuage toxique (bonus)
    const embers = dots(140, () => [(rnd() - 0.5) * 40, rnd() * 14, 6 - rnd() * 40], () => (rnd() < 0.6 ? 0xFF8A3A : 0xFFD27A), { size: 6, twinkle: 5 });
    scene.add(embers); const emB = Array.from(embers.geometry.attributes.position.array);
    const toxic = dots(120, () => [(rnd() - 0.5) * 40, 0.3 + rnd() * 2.5, 8 - rnd() * 40], () => (rnd() < 0.5 ? 0x7CFF4F : 0xB6FF7A), { size: 26, twinkle: 1, opacity: 0, additive: true });
    scene.add(toxic);

    return {
      camFor(aspect) {
        const narrow = aspect < 0.8; front.visible = narrow;
        return narrow ? { pos: new THREE.Vector3(0, 3.0, 20), target: new THREE.Vector3(0, 3.4, 0) } : { pos: new THREE.Vector3(0, 3.4, 15), target: new THREE.Vector3(0, 4, 0) };
      },
      update(t, dt, s) {
        const b = s.bonus;
        const u = skyM.userData.u; u.top.value = lerp(N.top, B.top, b); u.mid.value = lerp(N.mid, B.mid, b); u.bottom.value = lerp(N.bot, B.bot, b);
        scene.fog.color = lerp(N.fog, B.fog, b); hemi.color = lerp(0xFF9A7A, 0xB6FF9A, b * 0.7);
        moon.children[1].material.color = lerp(0xFF6A3A, 0xB6FF6A, b); moon.children[0].material.color = lerp(0xFF5A2A, 0x7CFF4F, b);
        stars.userData.u.uTime.value = t;
        // gyrophares : bleu, rouge, bleu, rouge…
        const ph = Math.floor(t * (6 + b * 6)) % 2;
        if (cop) { cop.r.emissiveIntensity = ph ? 1.6 : 0.1; cop.bl.emissiveIntensity = ph ? 0.1 : 1.6; }
        copLight.intensity = ph ? 0 : 6; copLight2.intensity = ph ? 6 : 0;
        fireLight.intensity = 1.6 + Math.sin(t * 9) * 0.15 + Math.sin(t * 13) * 0.1;
        for (const f of fires) f.scale.set(1 + Math.sin(t * 11 + f.id) * 0.12, 1 + Math.sin(t * 8 + f.id) * 0.2, 1);
        for (const br of barrels) { br.f.forEach((f, i) => f.scale.set(1, 1 + Math.sin(t * 12 + i) * 0.25, 1)); br.h.material.opacity = 0.75 + Math.sin(t * 10) * 0.15; }
        for (const l of lamps) { const flick = Math.sin(t * 23 + l.ph) > 0.93 ? 0.1 : 1; l.bulb.emissiveIntensity = flick; l.h.material.opacity = 0.8 * flick; }
        for (const m of winLit) m.emissiveIntensity = 0.8 + Math.sin(t * 3 + m.id) * 0.1;
        plumes.forEach((g, j) => g.children.forEach((m, i) => { const k = (t * 0.06 + i / 7 + j * 0.3) % 1; m.position.set(Math.sin(k * 5 + i) * 1.5 + k * 6, 6 + k * 22, 0); m.scale.setScalar(2 + k * 7); m.material.opacity = 0.55 * Math.sin(k * Math.PI); }));
        beams.forEach((p, i) => { p.rotation.z = Math.sin(t * 0.35 + i * 2) * 0.5; p.rotation.x = Math.cos(t * 0.27 + i) * 0.25; });
        const hk = (t * 0.035) % 1; heli.position.set(-50 + hk * 100, 17 + Math.sin(t * 0.5) * 1.2, -28); heli.rotation.z = 0.12; rotor.rotation.y = t * 30; spot.rotation.z = Math.sin(t * 0.8) * 0.3; heli.visible = hk > 0.02 && hk < 0.98;
        for (const w of walkers) {
          const d = w.userData, show = d.lane === 0 || b > 0.4; w.visible = show;
          const x = ((d.x0 * 5 + d.dir * (t + d.ph) * d.sp) % 22 + 33) % 22 - 11;
          w.position.set(x, Math.abs(Math.sin((t + d.ph) * 4)) * 0.08, d.z); w.rotation.y = d.dir > 0 ? Math.PI / 2 - 0.3 : -Math.PI / 2 + 0.3;
          const z = w.children[0]; z.rotation.z = Math.sin((t + d.ph) * 4) * 0.12; z.userData.anim?.idle?.(((t + d.ph) * 0.5) % 1, z);
        }
        front.children.forEach((w, i) => { const z = w.children[0]; z.rotation.z = Math.sin(t * 3 + i) * 0.15; z.userData.anim?.idle?.((t * 0.5 + i * 0.3) % 1, z); });
        const ep = embers.geometry.attributes.position;
        for (let i = 0; i < 140; i++) { const k = (t * 0.05 + i / 140) % 1; ep.setXYZ(i, emB[i * 3] + Math.sin(t + i) * 0.8, k * 16, emB[i * 3 + 2]); }
        ep.needsUpdate = true; embers.userData.u.uTime.value = t;
        toxic.userData.u.uOpacity.value = b * 0.35; toxic.userData.u.uTime.value = t; toxic.position.x = Math.sin(t * 0.1) * 3;
      },
    };
  },
});
