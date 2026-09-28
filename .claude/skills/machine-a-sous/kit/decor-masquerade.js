// ---------- DECOR3D : la salle de bal de Masquerade of Madness ; pendant le bonus, les bougies rougissent et la valse s'emballe ----------
const DECOR3D = (K, M) => ({
  build(scene, cam) {
    const { THREE, part, G, TAU, sky, dots } = K;
    const C = c => new THREE.Color(c), lerp = (a, b, t) => C(a).lerp(C(b), t);
    const grad = K.mat(0xffffff).gradientMap;
    const toon = (c, o = {}) => { const m = new THREE.MeshToonMaterial({ color: c, gradientMap: grad }); if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = o.glow ?? 1; } if (o.map) m.map = o.map; return m; };
    const P = (geo, m, o = {}) => part(geo, m instanceof THREE.Material ? m : toon(m, o), { ink: 0.03, ...o });
    const grp = (...c) => { const g = new THREE.Group(); g.add(...c.flat()); return g; };
    const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
    const rnd = (() => { let s = 31; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    const halo = (col, size, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.setScalar(size); return s; };
    const canvasTex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };
    const silver = K.pbr ? K.pbr(0xD8D2C6, { metal: 0.9, rough: 0.3 }) : 0xB9B3A8;
    const N = { top: 0x040305, mid: 0x220610, bot: 0x0A0406, fog: 0x14060C, flame: 0xFFC870, light: 0xFFB060 }, B = { top: 0x0A0002, mid: 0x4A0010, bot: 0x1A0006, fog: 0x3A0010, flame: 0xFF3A4A, light: 0xFF2A3A };

    cam.position.set(0, 3.4, 15); cam.userData.target.set(0, 4, 0);
    scene.fog = new THREE.Fog(N.fog, 22, 80);
    const skyM = sky(N.top, N.mid, N.bot); scene.add(skyM);
    const hemi = new THREE.HemisphereLight(0xFFD8B0, 0x1A0610, 1.0); scene.add(hemi);
    const key = new THREE.DirectionalLight(0xFFE0C0, 0.9); key.position.set(-6, 12, 10); scene.add(key);

    // parquet en damier de marbre, luisant
    const checker = canvasTex(256, 256, (x, w, h) => {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? '#0C0A0E' : '#6E675E'; x.fillRect(i * 128, j * 128, 128, 128); }
      x.strokeStyle = 'rgba(255,255,255,.08)'; x.lineWidth = 2; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(rnd() * w, 0); x.bezierCurveTo(rnd() * w, h * .3, rnd() * w, h * .7, rnd() * w, h); x.stroke(); }
    }, [28, 28]);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshStandardMaterial({ map: checker, roughness: 0.28, metalness: 0.15 }));
    floor.rotation.x = -Math.PI / 2; scene.add(floor);
    // mur du fond : damas sombre, pilastres d'argent, tableaux masqués
    const damask = canvasTex(128, 160, (x, w, h) => {
      x.fillStyle = '#1A0610'; x.fillRect(0, 0, w, h); x.fillStyle = '#2A0A16';
      const fleur = (cx, cy, s) => { x.beginPath(); x.moveTo(cx, cy - 30 * s); x.bezierCurveTo(cx + 22 * s, cy - 6 * s, cx + 16 * s, cy + 14 * s, cx, cy + 30 * s); x.bezierCurveTo(cx - 16 * s, cy + 14 * s, cx - 22 * s, cy - 6 * s, cx, cy - 30 * s); x.fill(); };
      fleur(64, 80, 1.4); fleur(0, 0, 1); fleur(128, 0, 1); fleur(0, 160, 1); fleur(128, 160, 1);
    }, [16, 4]);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(90, 32), toon(0xffffff, { map: damask })); at(wall, 0, 16, -28); scene.add(wall);
    for (let i = -4; i <= 4; i++) { const x = i * 9; scene.add(P(G.box(1.2, 22, 0.8, 0.1), 0x2A2630, { pos: [x, 11, -27.4], ink: 0.02 })); scene.add(P(G.box(1.7, 0.8, 1.1, 0.1), silver, { pos: [x, 22.2, -27.2], ink: 0.02 })); scene.add(P(G.box(1.7, 0.8, 1.1, 0.1), silver, { pos: [x, 0.4, -27.2], ink: 0.02 })); }
    scene.add(P(G.box(90, 1, 1.4, 0.2), silver, { pos: [0, 23, -27.2], ink: 0.02 }));
    const portraitTex = (bg, maskCol, lip) => canvasTex(128, 170, (x, w, h) => {
      x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = '#0A080C'; x.beginPath(); x.ellipse(64, 180, 60, 70, 0, 0, TAU); x.fill();
      x.fillStyle = '#CFC6B4'; x.beginPath(); x.ellipse(64, 78, 30, 40, 0, 0, TAU); x.fill();
      x.fillStyle = maskCol; x.beginPath(); x.moveTo(30, 70); x.bezierCurveTo(44, 54, 84, 54, 98, 70); x.bezierCurveTo(90, 86, 74, 86, 64, 78); x.bezierCurveTo(54, 86, 38, 86, 30, 70); x.fill();
      x.fillStyle = '#000'; x.beginPath(); x.ellipse(50, 71, 6, 3, 0, 0, TAU); x.ellipse(78, 71, 6, 3, 0, 0, TAU); x.fill();
      x.strokeStyle = lip; x.lineWidth = 4; x.beginPath(); x.moveTo(52, 100); x.quadraticCurveTo(64, 108, 76, 100); x.stroke();
    });
    const portraits = [[-18, '#3A0008', '#15121A', '#C8102E'], [-7, '#15121A', '#EFE8DA', '#6A0010'], [7, '#1E1A22', '#C8102E', '#C8102E'], [18, '#3A0008', '#EFE8DA', '#15121A']].map(([x, bg, mk, lp]) => {
      const g = grp(P(G.box(4.4, 5.6, 0.3, 0.15), silver, { ink: 0.02 }), at(new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.8), toon(0xffffff, { map: portraitTex(bg, mk, lp) })), 0, 0, 0.17));
      at(g, x, 11, -27); scene.add(g); return g;
    });
    // lustres : couronnes d'argent, bougies, flammes, lumière chaude
    const flames = [], chandeliers = [], lights = [];
    [[-9, 14, -12, 0.9], [0, 15.5, -16, 1.2], [9, 14, -12, 0.9]].forEach(([x, y, z, s], ci) => {
      const g = new THREE.Group();
      g.add(at(P(G.cyl(0.05, 0.05, 6, 8), 0x3A3733, { ink: 0 }), 0, 3, 0));
      g.add(P(G.torus(2.2, 0.12), silver, { rot: [Math.PI / 2, 0, 0], ink: 0.02 }), at(P(G.torus(1.3, 0.1), silver, { rot: [Math.PI / 2, 0, 0], ink: 0.02 }), 0, 0.9, 0));
      g.add(at(P(G.sphere(0.45), silver, { ink: 0.02 }), 0, -0.3, 0), at(P(G.cone(0.3, 0.8, 16), silver, { ink: 0.02, rot: [Math.PI, 0, 0] }), 0, -0.9, 0));
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 1.3 : 2.2, yy = i % 2 ? 0.9 : 0; g.add(at(P(G.cyl(0.09, 0.09, 0.5, 10), 0xEFE8DA, { ink: 0.01 }), Math.cos(a) * r, yy + 0.3, Math.sin(a) * r));
        const f = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 10), new THREE.MeshBasicMaterial({ color: N.flame })); at(f, Math.cos(a) * r, yy + 0.72, Math.sin(a) * r); g.add(f); flames.push(f); }
      g.add(at(halo(N.light, 9, 0.5), 0, 0.5, 0));
      const l = new THREE.PointLight(N.light, 28, 26, 1.6); l.position.set(0, -0.5, 0); g.add(l); lights.push(l);
      g.scale.setScalar(s); at(g, x, y, z); g.userData.ph = ci * 2; scene.add(g); chandeliers.push(g);
    });
    // rideaux rouges de chaque côté (plis ondulés)
    const curtM = toon(0x8A0A1E);
    const curtain = s => { const geo = new THREE.PlaneGeometry(7, 26, 40, 1), p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 2.4) * 0.35); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, curtM); m.material.side = THREE.DoubleSide; at(m, s * 14.5, 13, -4); m.rotation.y = -s * 0.35; scene.add(m); return m; };
    const curtains = [curtain(-1), curtain(1)];
    scene.add(P(G.box(40, 2.4, 1, 0.2), 0x5A0010, { pos: [0, 25, -4] }));
    // les invités qui valsent au fond : des couples masqués qui tournent sur eux-mêmes
    const guest = (dress, mask, hat) => grp(
      P(G.cone(0.75, 2.1, 20), dress, { pos: [0, 1.05, 0] }), P(G.capsule(0.28, 0.5), dress, { pos: [0, 2.2, 0] }),
      P(G.sphere(0.3), 0xE6DDCC, { pos: [0, 2.85, 0] }), P(G.box(0.46, 0.14, 0.12, 0.05), mask, { pos: [0, 2.9, 0.26], ink: 0.015 }),
      hat ? P(G.cone(0.32, 0.55, 12), hat, { pos: [0, 3.25, 0] }) : P(G.sphere(0.32), 0x15121A, { pos: [0, 3.0, -0.08], scale: [1, 0.8, 1] }));
    const couples = [];
    [[-10, -10], [-5.5, -16], [5.5, -15], [10.5, -9.5], [-14, -18], [14, -19], [0, -21]].forEach(([x, z], i) => {
      const a = guest(i % 2 ? 0x8A0A1E : 0x1E1A22, 0xEFE8DA, i % 3 === 0 ? 0x6A0010 : null), b = guest(0x15121A, i % 2 ? 0xC8102E : 0xB9B3A8, 0x15121A);
      at(a, -0.42, 0, 0); a.rotation.y = Math.PI / 2; at(b, 0.42, 0, 0); b.rotation.y = -Math.PI / 2;
      const c = grp(a, b); at(c, x, 0, z); c.userData = { x, z, ph: rnd() * TAU, sp: 0.5 + rnd() * 0.4, r: 0.8 + rnd() * 1.2 }; scene.add(c); couples.push(c);
    });
    // statues sur socle et vases de roses blanches (elles rougissent pendant le bonus)
    const roseM = toon(0xEFE8DA);
    [-1, 1].forEach(s => {
      const st = grp(P(G.box(1.8, 1.4, 1.8, 0.1), 0x2A2724, { pos: [0, 0.7, 0] }), P(G.cone(0.6, 2.6, 16), 0x9A9284, { pos: [0, 2.7, 0] }), P(G.sphere(0.42), 0x9A9284, { pos: [0, 4.3, 0] }), P(G.box(0.7, 0.16, 0.14, 0.05), 0x2A2724, { pos: [0, 4.35, 0.36], ink: 0.01 }));
      at(st, s * 7.5, 0, -5); st.rotation.y = -s * 0.4; scene.add(st);
      const v = grp(P(G.cyl(0.35, 0.5, 1.1, 16), 0x2A2724, { pos: [0, 0.55, 0] }), ...[[-0.25, 1.4], [0.2, 1.5], [0, 1.75], [0.3, 1.25], [-0.3, 1.2]].map(([x, y]) => P(G.sphere(0.2), roseM, { pos: [x, y, 0], ink: 0.015 })));
      at(v, s * 6, 0, -2.2); scene.add(v);
    });
    // candélabres au sol, près de la machine
    const candel = () => { const g = grp(P(G.cyl(0.08, 0.1, 3.4, 10), silver, { pos: [0, 1.7, 0], ink: 0.015 }), P(G.cyl(0.5, 0.6, 0.12, 16), silver, { pos: [0, 0.06, 0], ink: 0.015 }), P(G.torus(0.6, 0.05, Math.PI), silver, { pos: [0, 3.3, 0], ink: 0.01 }));
      [-0.6, 0, 0.6].forEach(x => { g.add(P(G.cyl(0.07, 0.07, 0.45, 10), 0xEFE8DA, { pos: [x, 3.55 + (x ? 0 : 0.2), 0], ink: 0.01 })); const f = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.26, 10), new THREE.MeshBasicMaterial({ color: N.flame })); at(f, x, 3.92 + (x ? 0 : 0.2), 0); g.add(f, at(halo(N.light, 1.4, 0.8), x, 3.95 + (x ? 0 : 0.2), 0)); flames.push(f); });
      return g; };
    [-1, 1].forEach(s => { const c = candel(); at(c, s * 4.6, 0, 1.5); scene.add(c); });
    // masques qui flottent dans les airs
    const floaters = [];
    if (M) [[-6, 8.5, -8, 'wild'], [6.5, 9.5, -9, 'scat'], [-12, 11, -14, 'scat'], [12, 7.5, -12, 'wild'], [0, 11.5, -12, 'red']].forEach(([x, y, z, k], i) => {
      const m = k === 'scat' ? M.SCAT() : M.VARIANTES.wild[k === 'red' ? 'red' : 'wild'](); const w = grp(m); w.scale.setScalar(0.9); at(w, x, y, z); w.userData = { y, ph: i * 1.3 }; scene.add(w); floaters.push(w);
    });
    // premier plan pour le téléphone : deux candélabres et un Fou juste sous la machine
    const front = new THREE.Group(); scene.add(front);
    [-1, 1].forEach(s => { const c = candel(); c.scale.setScalar(0.6); at(c, s * 1.7, 0, 9.2); front.add(c); });
    if (M && M.shroom) { const f = M.shroom(); const w = grp(f); f.position.y = 1.4; w.scale.setScalar(0.5); at(w, 1.2, 0, 10); w.rotation.y = -0.4; front.add(w); }
    // pétales qui tombent, poussière dorée
    const NP = 90, petals = dots(NP, () => [(rnd() - 0.5) * 36, rnd() * 18, 6 - rnd() * 30], () => (rnd() < 0.7 ? 0xC8102E : 0xFF4A5E), { size: 9, twinkle: 1, additive: false });
    scene.add(petals); const pB = Array.from(petals.geometry.attributes.position.array);
    const dust = dots(160, () => [(rnd() - 0.5) * 40, rnd() * 16, 4 - rnd() * 30], () => (rnd() < 0.6 ? 0xFFD8A0 : 0xFFF3D0), { size: 5, twinkle: 3, opacity: 0.6 });
    scene.add(dust);

    return {
      camFor(aspect) {
        const narrow = aspect < 0.8; front.visible = narrow;
        return narrow ? { pos: new THREE.Vector3(0, 3.0, 20), target: new THREE.Vector3(0, 3.4, 0) } : { pos: new THREE.Vector3(0, 3.4, 15), target: new THREE.Vector3(0, 4.2, 0) };
      },
      update(t, dt, s) {
        const b = s.bonus;
        const u = skyM.userData.u; u.top.value = lerp(N.top, B.top, b); u.mid.value = lerp(N.mid, B.mid, b); u.bottom.value = lerp(N.bot, B.bot, b);
        scene.fog.color = lerp(N.fog, B.fog, b); hemi.color = lerp(0xFFD8B0, 0xFF8A9A, b);
        const fc = lerp(N.flame, B.flame, b), lc = lerp(N.light, B.light, b);
        flames.forEach((f, i) => { f.material.color = fc; f.scale.set(1 + Math.sin(t * 17 + i) * 0.12, 1 + Math.sin(t * 11 + i * 2) * 0.25, 1); });
        lights.forEach((l, i) => { l.color = lc; l.intensity = 26 + Math.sin(t * 9 + i) * 2 + Math.sin(t * 13 + i) * 1.5; });
        chandeliers.forEach(g => { g.rotation.z = Math.sin(t * 0.5 + g.userData.ph) * (0.02 + b * 0.08); g.rotation.y = t * 0.05; });
        const speed = 1 + b * 1.4;
        couples.forEach(c => { const d = c.userData, a = t * 0.25 * speed + d.ph; c.position.set(d.x + Math.cos(a) * d.r, Math.abs(Math.sin(t * 3 * speed + d.ph)) * 0.06, d.z + Math.sin(a) * d.r * 0.5); c.rotation.y = t * d.sp * 2.2 * speed + d.ph; });
        floaters.forEach(w => { const d = w.userData; w.position.y = d.y + Math.sin(t * 0.7 + d.ph) * 0.5; w.rotation.y = Math.sin(t * 0.4 + d.ph) * 0.6; w.rotation.z = Math.sin(t * 0.5 + d.ph) * 0.1; });
        curtains.forEach((c, i) => { c.rotation.y = (i ? -1 : 1) * (0.35 + Math.sin(t * 0.3 + i) * 0.04); });
        roseM.color = lerp(0xEFE8DA, 0xC8102E, b);
        portraits.forEach((p, i) => { p.rotation.y = b * Math.sin(t * 0.8 + i) * 0.08; });
        const pp = petals.geometry.attributes.position;
        for (let i = 0; i < NP; i++) { const k = ((pB[i * 3 + 1] / 18) - t * 0.04 * (1 + b) + 10) % 1; pp.setXYZ(i, pB[i * 3] + Math.sin(t * 0.8 + i) * 1.2, k * 18, pB[i * 3 + 2]); }
        pp.needsUpdate = true; petals.userData.u.uTime.value = t; petals.userData.u.uOpacity.value = 0.5 + b * 0.5;
        dust.userData.u.uTime.value = t;
      },
    };
  },
});
