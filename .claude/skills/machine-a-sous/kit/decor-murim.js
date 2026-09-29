// ---------- DECOR3D : la cour d'une secte au pied des pics de granit de la montagne sacrée ----------
// Le décor suit la cultivation comme la version 2D (classes sc0…sc5 sur <body>) : cour sous la pluie la nuit, sommet à l'aube,
// palais doré, champ de bataille au crépuscule, domaine démoniaque, royaume céleste blanc et or. Pétales de cerisier partout.
const DECOR3D = (K, M) => ({
  build(scene, cam) {
    const { THREE, part, G, TAU, sky, dots } = K;
    const C = c => new THREE.Color(c), lerp = (a, b, t) => C(a).lerp(C(b), t);
    const grad = K.mat(0xffffff).gradientMap;
    const toon = (c, o = {}) => { const m = new THREE.MeshToonMaterial({ color: c, gradientMap: grad }); if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = o.glow ?? 1; } if (o.map) m.map = o.map; return m; };
    const P = (geo, m, o = {}) => part(geo, m instanceof THREE.Material ? m : toon(m, o), { ink: 0.03, ...o });
    const grp = (...c) => { const g = new THREE.Group(); g.add(...c.flat()); return g; };
    const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
    const rnd = (() => { let s = 97; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    const halo = (col, size, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.setScalar(size); return s; };
    const canvasTex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };
    // six mondes : ciel (haut, horizon, bas), brouillard, lumière, astre, pics, nuages, pétales, pluie
    const W = [
      { top: 0x0A0E18, mid: 0x28303F, bot: 0x0A0B10, fog: 0x1A202C, hemi: 0x8A9ABA, key: 0x9AB0D0, sun: 0xDDE6F0, peak: 0x2A303C, cloud: 0x5A6478, petal: 0xF7C0D0, rain: 1 },
      { top: 0xE0B4A4, mid: 0xF6E2D0, bot: 0xB9A6A8, fog: 0xEAD6CC, hemi: 0xFFE8DC, key: 0xFFD8C0, sun: 0xFFB8A0, peak: 0x6A6070, cloud: 0xFFF6F0, petal: 0xFFC8D8, rain: 0 },
      { top: 0xD8A060, mid: 0xF6D9A0, bot: 0x8A5A34, fog: 0xE8C088, hemi: 0xFFE0A8, key: 0xFFD890, sun: 0xFFF0B0, peak: 0x8A6A50, cloud: 0xFFEAC0, petal: 0xFFD0DC, rain: 0 },
      { top: 0x2A0806, mid: 0xB0401A, bot: 0x2A0A06, fog: 0x6A200C, hemi: 0xFF9A6A, key: 0xFF8A4A, sun: 0xFF7A2A, peak: 0x3A1410, cloud: 0x8A3A1A, petal: 0xFF8A5A, rain: 0 },
      { top: 0x000000, mid: 0x3A040A, bot: 0x050001, fog: 0x2A0208, hemi: 0xFF4A5A, key: 0xFF2A3A, sun: 0xE8202F, peak: 0x14040A, cloud: 0x3A0610, petal: 0xE8202F, rain: 0 },
      { top: 0xFFF6E0, mid: 0xFBEBC0, bot: 0xD8B870, fog: 0xF8ECCC, hemi: 0xFFFFFF, key: 0xFFF3D0, sun: 0xFFFBEA, peak: 0xC8B8A0, cloud: 0xFFFFFF, petal: 0xFFE8A0, rain: 0 },
    ];
    const cur = Object.fromEntries(Object.entries(W[0]).map(([k, v]) => [k, k === 'rain' ? v : C(v)]));

    cam.position.set(0, 3.4, 15); cam.userData.target.set(0, 4.2, 0);
    scene.fog = new THREE.Fog(W[0].fog, 26, 110);
    const skyM = sky(W[0].top, W[0].mid, W[0].bot, 150); scene.add(skyM);
    const hemi = new THREE.HemisphereLight(W[0].hemi, 0x14101A, 1.1); scene.add(hemi);
    const key = new THREE.DirectionalLight(W[0].key, 1.0); key.position.set(-8, 14, 10); scene.add(key);

    // l'astre : lune dans la pluie, soleil rose de l'aube, soleil d'or, soleil couchant, lune de sang, soleil blanc
    const sunM = new THREE.MeshBasicMaterial({ color: W[0].sun, fog: false });
    const sun = at(new THREE.Mesh(new THREE.CircleGeometry(6, 48), sunM), 18, 30, -120); scene.add(sun);
    const sunHalo = at(halo(W[0].sun, 46, 0.5), 18, 30, -119); scene.add(sunHalo);

    // les pics de granit : de hautes colonnes bosselées, des pins accrochés au sommet
    const peakM = toon(W[0].peak), pineM = toon(0x14201A);
    const peaks = [[-46, -90, 7, 40], [-30, -78, 5, 30], [-18, -100, 8, 52], [0, -110, 9, 58], [20, -96, 7, 46], [34, -80, 5, 32], [50, -92, 8, 42], [-60, -70, 6, 26], [64, -72, 6, 28]];
    for (const [x, z, r, h] of peaks) {
      const m = new THREE.Mesh(G.lumpy(r, 0.18, Math.round(x + z), 3), peakM); m.scale.set(1, h / r / 2, 0.8); at(m, x, h / 2 - 6, z); scene.add(m);
      for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.ConeGeometry(1.2 + rnd(), 2.4, 7), pineM); at(p, x + (rnd() - 0.5) * r, h - 7 + rnd() * 2, z + r * 0.5); p.scale.y = 0.6; scene.add(p); }
    }
    // la mer de nuages entre les pics
    const cloudM = new THREE.MeshToonMaterial({ color: W[0].cloud, gradientMap: grad, transparent: true, opacity: 0.85 });
    const clouds = [];
    for (let i = 0; i < 16; i++) { const c = new THREE.Mesh(G.lumpy(5 + rnd() * 5, 0.2, i + 3, 2), cloudM); c.scale.set(2.2, 0.35, 1); const x = (rnd() - 0.5) * 150, z = -50 - rnd() * 50; at(c, x, 2 + rnd() * 10, z); c.userData = { x, sp: 0.3 + rnd() * 0.5 }; scene.add(c); clouds.push(c); }

    // la cour : dalles de pierre
    const slabs = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#2A2830'; x.fillRect(0, 0, w, h);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const o = j % 2 ? 32 : 0, g = 58 + Math.floor(rnd() * 20); x.fillStyle = `rgb(${g},${g - 2},${g + 6})`; x.fillRect(i * 64 + o + 2, j * 64 + 2, 60, 60); }
      x.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 40; k++) x.fillRect(rnd() * w, rnd() * h, 2, 2);
    }, [30, 30]);
    const floorM = new THREE.MeshStandardMaterial({ map: slabs, roughness: 0.35, metalness: 0.1 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), floorM); floor.rotation.x = -Math.PI / 2; scene.add(floor);

    // le pavillon de la secte : terrasse, colonnes rouges, toit aux avant-toits relevés, plaque dorée
    const eave = (w, d) => { // profil du toit (courbe qui remonte aux extrémités), extrudé en profondeur
      const s = new THREE.Shape(); s.moveTo(-w / 2 - 1.2, 0.9); s.quadraticCurveTo(-w / 2 + 0.6, 0, -w / 4, 0.6); s.lineTo(0, 2.4); s.lineTo(w / 4, 0.6); s.quadraticCurveTo(w / 2 - 0.6, 0, w / 2 + 1.2, 0.9); s.lineTo(w / 2 + 1.1, 1.3); s.quadraticCurveTo(w / 2 - 0.6, 0.6, w / 4, 1.1); s.lineTo(0, 3.0); s.lineTo(-w / 4, 1.1); s.quadraticCurveTo(-w / 2 + 0.6, 0.6, -w / 2 - 1.1, 1.3); s.closePath();
      return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
    };
    const gold = K.pbr ? K.pbr(0xE8B850, { metal: 0.8, rough: 0.3 }) : 0xD8A845;
    const hall = new THREE.Group(); at(hall, 0, 0, -30); scene.add(hall);
    hall.add(P(G.box(34, 1.6, 12, 0.2), 0x3A3640, { pos: [0, 0.8, 0], ink: 0.02 }));
    for (let i = 0; i < 4; i++) hall.add(P(G.box(12 - i * 2, 0.3, 1.2, 0.05), 0x4A4650, { pos: [0, 0.15 + i * 0.4, 6.4 + (3 - i) * 0.7], ink: 0.01 }));
    hall.add(P(G.box(28, 8, 8, 0.1), 0x1A1418, { pos: [0, 5.6, -1], ink: 0.02 }));
    for (const x of [-12, -6, 0, 6, 12]) if (x) hall.add(P(G.cyl(0.45, 0.5, 8, 16), 0x8A1A12, { pos: [x, 5.6, 3.4], ink: 0.02 }));
    hall.add(P(G.box(6, 6.6, 0.3, 0.05), 0x2A0E0A, { pos: [0, 4.9, 3.1], ink: 0.02 }));
    const roofM = toon(0x0E0C10);
    const roof1 = new THREE.Mesh(eave(30, 11), roofM); at(roof1, 0, 9.4, -6.5); hall.add(roof1);
    const roof2 = new THREE.Mesh(eave(18, 8), roofM); at(roof2, 0, 12.6, -5); roof2.scale.set(1, 0.9, 1); hall.add(roof2);
    hall.add(P(G.box(30, 0.3, 11.4, 0.05), gold, { pos: [0, 9.5, -1], ink: 0 }));
    hall.add(P(G.box(4.4, 1.8, 0.3, 0.1), 0x0A0606, { pos: [0, 10.8, 4.4], ink: 0.02 }), P(G.box(4.8, 2.2, 0.2, 0.1), gold, { pos: [0, 10.8, 4.3], ink: 0 }));
    // lanternes rouges suspendues devant le pavillon
    const lanterns = [], lights = [];
    [-9, -3, 3, 9].forEach((x, i) => {
      const l = grp(at(P(G.cyl(0.03, 0.03, 1.6, 6), 0x2A1A10, { ink: 0 }), 0, 0.8, 0), P(G.sphere(0.7), toon(0xE8202F, { emissive: 0xB3141F, glow: 0.8 }), { scale: [1, 1.25, 1], ink: 0.02 }), at(P(G.cyl(0.3, 0.3, 0.2, 12), gold, { ink: 0 }), 0, -0.95, 0), at(halo(0xFF5A3A, 5, 0.55), 0, 0, 0.4));
      at(l, x, 8.2, 4.2); l.userData.ph = i; hall.add(l); lanterns.push(l);
    });
    const hallLight = new THREE.PointLight(0xFF5A3A, 30, 30, 1.6); hallLight.position.set(0, 7, 6); hall.add(hallLight); lights.push(hallLight);

    // cerisiers de part et d'autre de la cour
    const bark = toon(0x2A1410), blossomM = toon(0xF7C0D0), blossom2 = toon(0xFFE4EC);
    const tube = (pts, r) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 20, r, 10, false);
    const tree = (s, sc) => {
      const g = new THREE.Group();
      g.add(P(tube([[0, 0, 0], [s * 0.6, 3, 0], [s * 0.2, 6, 0.4], [s * 1.6, 8.5, 0]], 0.55), bark, { ink: 0.03 }));
      g.add(P(tube([[s * 0.3, 5, 0], [s * -1.8, 7, 0.4], [s * -3, 8, 0]], 0.3), bark, { ink: 0.02 }), P(tube([[s * 0.8, 6.5, 0], [s * 2.8, 7.2, 0.5], [s * 4.2, 7, 0]], 0.28), bark, { ink: 0.02 }));
      [[s * 1.6, 9, 0, 2.4], [s * -2.8, 8.6, 0.3, 2], [s * 4, 7.8, 0, 1.9], [s * 0.4, 9.6, -0.6, 2.2], [s * 2.8, 9.4, 0.8, 1.8], [s * -1, 9.8, 0.6, 1.7]].forEach(([x, y, z, r], i) => g.add(at(P(G.lumpy(r, 0.22, i + 7, 3), i % 3 ? blossomM : blossom2, { ink: 0.025 }), x, y, z)));
      g.scale.setScalar(sc); return g;
    };
    const trees = [at(tree(-1, 1.1), -13, 0, -10), at(tree(1, 1.0), 14, 0, -14), at(tree(1, 0.8), -24, 0, -22)];
    trees.forEach(t => scene.add(t));
    // deux disciples qui répètent leur kata dans la cour
    const disciple = (robe) => {
      const g = new THREE.Group();
      g.add(P(G.cone(0.7, 2.0, 16), robe, { pos: [0, 1.0, 0] }), P(G.capsule(0.28, 0.5), robe, { pos: [0, 2.2, 0] }), P(G.sphere(0.3), 0xEFE2CF, { pos: [0, 2.85, 0] }), P(G.sphere(0.32), 0x070608, { pos: [0, 3.0, -0.08], scale: [1, 0.8, 1] }), P(G.sphere(0.14), 0x070608, { pos: [0, 3.3, -0.1] }));
      const arm = new THREE.Group(); arm.position.set(0.3, 2.4, 0); g.add(arm);
      arm.add(P(G.capsule(0.1, 0.6), robe, { pos: [0.4, 0, 0], rot: [0, 0, Math.PI / 2], ink: 0.02 }), P(G.box(0.06, 1.8, 0.04, 0.02), K.pbr ? K.pbr(0xDDE6F0, { metal: 0.9, rough: 0.2 }) : 0xDDE6F0, { pos: [0.85, 0.85, 0], ink: 0.01 }));
      g.userData.arm = arm; return g;
    };
    const disciples = [[-6, -8, 0xF2ECDF, 0.5], [6.5, -9, 0xB3141F, -0.5]].map(([x, z, c, r], i) => { const d = disciple(c); at(d, x, 0, z); d.rotation.y = r; d.userData.ph = i * Math.PI; scene.add(d); return d; });
    // portique et bannières rouges sur les côtés
    [-1, 1].forEach(s => {
      const g = grp(P(G.cyl(0.14, 0.16, 9, 10), 0x2A1A10, { pos: [0, 4.5, 0], ink: 0.02 }), P(G.box(1.8, 5, 0.08, 0.04), 0xB3141F, { pos: [s * 1, 6, 0], ink: 0.02 }), P(G.box(1.2, 1.2, 0.1, 0.05), gold, { pos: [s * 1, 7, 0.08], ink: 0 }));
      g.scale.setScalar(0.8); at(g, s * 17, 0, -16); scene.add(g);
    });
    // manuels interdits qui flottent pendant le bonus
    const floaters = [];
    if (M) [[-7, 8, -9], [7.5, 9, -10], [0, 11.5, -14]].forEach(([x, y, z], i) => { const w = grp(M.SCAT()); w.scale.setScalar(0); at(w, x, y, z); w.userData = { y, ph: i * 1.7 }; scene.add(w); floaters.push(w); });
    // premier plan pour le téléphone : deux lanternes et le Heavenly Demon juste sous la machine
    const front = new THREE.Group(); scene.add(front);
    [-1, 1].forEach(s => front.add(at(grp(P(G.cyl(0.08, 0.1, 2.6, 8), 0x2A1A10, { pos: [0, 1.3, 0], ink: 0.02 }), P(G.sphere(0.45), toon(0xE8202F, { emissive: 0xB3141F, glow: 0.8 }), { pos: [0, 2.9, 0], scale: [1, 1.25, 1], ink: 0.02 }), at(halo(0xFF5A3A, 3, 0.6), 0, 2.9, 0.3)), s * 1.9, 0, 9.2)));
    if (M && M.shroom) { const f = M.shroom(); const w = grp(f); f.position.y = 1.4; w.scale.setScalar(0.55); at(w, 1.2, 0, 10); w.rotation.y = -0.35; front.add(w); }

    // pétales de cerisier, pluie, braises
    const NP = 140, petals = dots(NP, () => [(rnd() - 0.5) * 44, rnd() * 20, 6 - rnd() * 34], () => (rnd() < 0.6 ? 0xFFFFFF : 0xFFE4EC), { size: 9, twinkle: 1, additive: false });
    scene.add(petals); const pB = Array.from(petals.geometry.attributes.position.array);
    const NR = 700, rainG = new THREE.BufferGeometry(), rainP = new Float32Array(NR * 6), rB = [];
    for (let i = 0; i < NR; i++) { const x = (rnd() - 0.5) * 50, y = rnd() * 24, z = 8 - rnd() * 40; rB.push([x, y, z]); }
    rainG.setAttribute('position', new THREE.BufferAttribute(rainP, 3));
    const rainM = new THREE.LineBasicMaterial({ color: 0xC8D2E6, transparent: true, opacity: 0.35, depthWrite: false });
    const rain = new THREE.LineSegments(rainG, rainM); rain.frustumCulled = false; scene.add(rain);
    const embers = dots(120, () => [(rnd() - 0.5) * 40, rnd() * 16, 4 - rnd() * 30], () => (rnd() < 0.6 ? 0xFFB050 : 0xFF5A3A), { size: 5, twinkle: 3, opacity: 0 });
    scene.add(embers);

    let level = 0;
    return {
      camFor(aspect) {
        const narrow = aspect < 0.8; front.visible = narrow;
        return narrow ? { pos: new THREE.Vector3(0, 3.0, 20), target: new THREE.Vector3(0, 3.6, 0) } : { pos: new THREE.Vector3(0, 3.4, 15), target: new THREE.Vector3(0, 4.4, 0) };
      },
      update(t, dt, s) {
        // le monde visé : la classe scN posée par la machine
        const cl = document.body.className.match(/\bsc(\d)\b/); level = cl ? +cl[1] : 0;
        const w = W[level], k = dt ? Math.min(1, dt * 2.5) : 1;
        for (const n of ['top', 'mid', 'bot', 'fog', 'hemi', 'key', 'sun', 'peak', 'cloud', 'petal']) cur[n].lerp(C(w[n]), k);
        cur.rain += (w.rain - cur.rain) * k;
        const u = skyM.userData.u; u.top.value.copy(cur.top); u.mid.value.copy(cur.mid); u.bottom.value.copy(cur.bot);
        scene.fog.color.copy(cur.fog); hemi.color.copy(cur.hemi); key.color.copy(cur.key);
        sunM.color.copy(cur.sun); sunHalo.material.color.copy(cur.sun); peakM.color.copy(cur.peak); cloudM.color.copy(cur.cloud);
        const bright = level === 1 || level === 2 || level === 5;
        hemi.intensity += ((bright ? 1.6 : 1.0) - hemi.intensity) * k; floorM.color.lerp(C(bright ? 0xFFFFFF : level === 4 ? 0x8A5A60 : 0xB0B0C0), k);
        clouds.forEach((c, i) => { c.position.x = ((c.userData.x + t * c.userData.sp + 90) % 180) - 90; });
        lanterns.forEach(l => { l.rotation.z = Math.sin(t * 0.9 + l.userData.ph) * 0.06; });
        lights.forEach(l => { l.intensity = 26 + Math.sin(t * 7) * 2 + (level === 0 ? 8 : 0); });
        disciples.forEach(d => { const a = t * 2.2 + d.userData.ph; d.userData.arm.rotation.z = Math.sin(a) * 0.9; d.rotation.y += Math.sin(a * 0.5) * 0.004; d.position.y = Math.abs(Math.sin(a)) * 0.05; });
        trees.forEach((tr, i) => { tr.rotation.z = Math.sin(t * 0.5 + i) * 0.01; });
        floaters.forEach(f => { const d = f.userData; f.scale.setScalar(0.9 * s.bonus); f.position.y = d.y + Math.sin(t * 0.7 + d.ph) * 0.5; f.rotation.y = Math.sin(t * 0.4 + d.ph) * 0.5; });
        // pétales : plus nombreux et plus rapides pendant le bonus ; leur couleur suit le monde
        const pp = petals.geometry.attributes.position, fall = 0.05 * (1 + s.bonus);
        for (let i = 0; i < NP; i++) { const kk = ((pB[i * 3 + 1] / 20) - t * fall + 10) % 1; pp.setXYZ(i, pB[i * 3] + Math.sin(t * 0.8 + i) * 1.4 - kk * 6, kk * 20, pB[i * 3 + 2]); }
        pp.needsUpdate = true; petals.userData.u.uTime.value = t; petals.userData.u.uOpacity.value = 0.7 + s.bonus * 0.3;
        const pc = petals.geometry.attributes.color; if (!pc.userData) pc.userData = {};
        if (pc.userData.lv !== level) { pc.userData.lv = level; const c1 = C(W[level].petal); for (let i = 0; i < NP; i++) { const c = i % 3 ? c1 : C(0xFFFFFF).lerp(c1, 0.5); pc.setXYZ(i, c.r, c.g, c.b); } pc.needsUpdate = true; }
        // pluie : seulement dans la cour de nuit
        rainM.opacity = 0.35 * cur.rain; rain.visible = cur.rain > 0.02;
        if (rain.visible) { const rp = rainG.attributes.position; for (let i = 0; i < NR; i++) { const [x, y0, z] = rB[i], y = ((y0 - t * 22) % 24 + 24) % 24; rp.setXYZ(i * 2, x, y, z); rp.setXYZ(i * 2 + 1, x - 0.25, y - 0.9, z); } rp.needsUpdate = true; }
        embers.userData.u.uTime.value = t; embers.userData.u.uOpacity.value = level === 3 || level === 4 ? 0.8 : 0;
        const ep = embers.geometry.attributes.position; for (let i = 0; i < 120; i++) { ep.setY(i, (ep.getY(i) + dt * 1.2) % 16); } ep.needsUpdate = true;
      },
    };
  },
});
