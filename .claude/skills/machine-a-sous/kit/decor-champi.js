// ---------- DECOR3D : la forêt d'automne de Champi Pop, qui passe à la nuit pendant le bonus ----------
const DECOR3D = (K, M) => ({
  build(scene, cam) {
    const { THREE, part, G, face, TAU, sky, dots } = K;
    const C = c => new THREE.Color(c);
    const toon = (c, o = {}) => { const m = new THREE.MeshToonMaterial({ color: c, gradientMap: K.mat(0xffffff).gradientMap }); if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = o.glow ?? 0; } if (o.opacity != null) { m.transparent = true; m.opacity = o.opacity; m.depthWrite = false; } return m; };
    const P = (geo, m, o = {}) => part(geo, m instanceof THREE.Material ? m : toon(m, o), o);
    const grp = (...c) => { const g = new THREE.Group(); g.add(...c.flat()); return g; };
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })(); // aléatoire reproductible
    const DAY = { top: 0xFBD9A6, mid: 0xF6A96A, bot: 0xE89A62, fog: 0xF3B07A, hemiS: 0xFFF1D6, hemiG: 0xB86A3A, sun: 0xFFE2B0 };
    const NIGHT = { top: 0x141033, mid: 0x4A2E62, bot: 0x2A1E40, fog: 0x3A2A58, hemiS: 0x8A86D8, hemiG: 0x2A2040, sun: 0x9FB0FF };
    const lerp = (a, b, t) => C(a).lerp(C(b), t);

    cam.position.set(0, 3.4, 15); cam.userData.target.set(0, 3.6, 0);
    scene.fog = new THREE.Fog(DAY.fog, 22, 95);
    const skyM = sky(DAY.top, DAY.mid, DAY.bot); scene.add(skyM);
    const hemi = new THREE.HemisphereLight(DAY.hemiS, DAY.hemiG, 1.7); scene.add(hemi);
    const sun = new THREE.DirectionalLight(DAY.sun, 2.0); sun.position.set(-8, 14, 10); scene.add(sun);

    // soleil puis lune, avec leur halo
    const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    const halo = (col, size, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.setScalar(size); return s; };
    const orb = new THREE.Mesh(new THREE.SphereGeometry(4.5, 32, 16), new THREE.MeshBasicMaterial({ color: 0xFFE7A0, fog: false }));
    const orbHalo = halo(0xFFD27A, 34, 0.9); const orbG = grp(orbHalo, orb); orbG.position.set(16, 22, -75); scene.add(orbG);
    const stars = dots(420, () => { const a = rnd() * TAU, e = 0.08 + rnd() * 0.9; return [Math.cos(a) * Math.cos(e) * 85, Math.sin(e) * 85, Math.sin(a) * Math.cos(e) * 85 - 10]; }, () => rnd() < 0.8 ? 0xFFF3C9 : 0xC9C2FF, { size: 9, twinkle: 1.5, opacity: 0 });
    stars.material.fog = false; scene.add(stars);

    // montagnes et collines lointaines
    const mtnM = toon(0xE8B48A), hillM = toon(0xCE8446), groundM = toon(0xB9773A);
    for (let i = 0; i < 16; i++) { const h = 10 + rnd() * 12, m = new THREE.Mesh(new THREE.ConeGeometry(8 + rnd() * 6, h, 7), mtnM); m.position.set(-80 + i * 11 + rnd() * 4, h / 2 - 2, -70 - rnd() * 12); m.rotation.y = rnd() * 3; scene.add(m); }
    const hill = (w, d, h, x, z, mm) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 12, 0, TAU, 0, Math.PI / 2), mm); m.scale.set(w, h, d); m.position.set(x, -0.2, z); scene.add(m); };
    hill(30, 12, 6, -30, -45, hillM); hill(34, 14, 7, 28, -48, hillM); hill(22, 10, 4, 0, -52, hillM);
    // sol : grand plan légèrement vallonné
    const gg = new THREE.PlaneGeometry(240, 240, 80, 80); gg.rotateX(-Math.PI / 2);
    { const p = gg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * 0.15) * Math.cos(z * 0.12) * 0.5 + (z < -25 ? (-z - 25) * 0.08 : 0)); } gg.computeVertexNormals(); }
    const ground = new THREE.Mesh(gg, groundM); scene.add(ground);
    // feuilles mortes au sol
    const leafShape = (() => { const s = new THREE.Shape(); s.moveTo(0, -0.5); s.bezierCurveTo(0.45, -0.3, 0.55, 0.2, 0, 0.55); s.bezierCurveTo(-0.55, 0.2, -0.45, -0.3, 0, -0.5); return s; })();
    const leafGeo = new THREE.ShapeGeometry(leafShape, 6);
    const LEAF_COLS = [0xE8833A, 0xD9602F, 0xE9B949, 0xC8502E, 0xF09A43, 0xB5652B];
    const leafM = new THREE.MeshToonMaterial({ gradientMap: K.mat(0xffffff).gradientMap, side: THREE.DoubleSide });
    const carpet = new THREE.InstancedMesh(leafGeo, leafM, 360), o3 = new THREE.Object3D();
    for (let i = 0; i < 360; i++) { o3.position.set((rnd() - 0.5) * 36, 0.06, 9 - rnd() * 30); o3.rotation.set(-Math.PI / 2, 0, rnd() * TAU); o3.scale.setScalar(0.35 + rnd() * 0.3); o3.updateMatrix(); carpet.setMatrixAt(i, o3.matrix); carpet.setColorAt(i, C(LEAF_COLS[i % 6])); }
    scene.add(carpet);

    // arbres d'automne (géométries partagées, peu de polygones)
    const fol = [G.lumpy(1.3, 0.14, 1, 3), G.lumpy(1.0, 0.16, 2, 3), G.lumpy(0.9, 0.12, 3, 3)], trunkG = G.cyl(0.16, 0.28, 2.6, 10);
    const trees = [];
    function tree(x, z, sc, k) {
      const g = new THREE.Group(), crown = new THREE.Group();
      g.add(P(trunkG, 0x6B4226, { ink: 0.05, pos: [0, 1.3, 0] }));
      [[0, 3.3, 0, 0], [0.85, 2.8, 0.3, 1], [-0.75, 2.9, -0.2, 2], [0.2, 4.1, -0.1, 2]].forEach(([fx, fy, fz, gi], j) => crown.add(P(fol[gi], LEAF_COLS[(k + j) % 6], { ink: 0.06, pos: [fx, fy, fz] })));
      g.add(crown); g.position.set(x, 0, z); g.scale.setScalar(sc); g.rotation.y = rnd() * TAU;
      crown.userData.ph = rnd() * TAU; trees.push(crown); scene.add(g);
    }
    for (let i = 0; i < 44; i++) {
      const side = i % 2 ? 1 : -1, x = side * (3.2 + rnd() * 16), z = 2 - rnd() * 34;
      if (Math.abs(x) < 5 && z > -6) continue;
      tree(x, z, 0.8 + rnd() * 0.7, i);
    }
    [[-2.5, -24], [3, -26], [0, -30], [-7, -20], [8, -19]].forEach(([x, z], i) => tree(x, z, 1.1, i + 3));
    // sapins sombres pour le contraste
    const pineG = G.cone(1.1, 3.4, 9);
    for (let i = 0; i < 14; i++) { const x = (rnd() - 0.5) * 50, z = -14 - rnd() * 20; const g = grp(P(G.cyl(0.12, 0.16, 1, 8), 0x5A3A22, { ink: 0.04, pos: [0, 0.5, 0] }), P(pineG, 0x7C6A3A, { ink: 0.05, pos: [0, 2.4, 0] }), P(G.cone(0.8, 2.4, 9), 0x8E7A42, { ink: 0.05, pos: [0, 3.6, 0] })); g.position.set(x, 0, z); g.scale.setScalar(0.9 + rnd() * 0.6); scene.add(g); }

    // la cabane et sa fumée
    const cabin = new THREE.Group();
    cabin.add(P(G.box(3.2, 2.2, 2.6, 0.08), 0xA8703E, { ink: 0.05, pos: [0, 1.1, 0] }));
    const roofS = new THREE.Shape(); roofS.moveTo(-2.1, 0); roofS.lineTo(0, 1.6); roofS.lineTo(2.1, 0); roofS.lineTo(-2.1, 0);
    cabin.add(P(G.extrude(roofS, 2.6, 0.12), 0xC4562A, { ink: 0.05, pos: [0, 2.95, 0] }));
    cabin.add(P(G.box(0.55, 1.4, 0.55, 0.05), 0x7A4A26, { ink: 0.04, pos: [0.9, 3.7, -0.3] }));
    cabin.add(P(G.box(0.7, 1.2, 0.1, 0.04), 0x6B4226, { ink: 0.03, pos: [-0.6, 0.62, 1.32] }));
    const winM = toon(0x6B4226, { emissive: 0xFFC860, glow: 0 });
    const win = P(G.box(0.7, 0.6, 0.1, 0.04), winM, { ink: 0.03, pos: [0.75, 1.3, 1.32] }); cabin.add(win);
    const winHalo = halo(0xFFB45A, 3.2, 0); winHalo.position.set(0.75, 1.3, 1.6); cabin.add(winHalo);
    cabin.position.set(-7.5, 0, -13); cabin.rotation.y = 0.45; scene.add(cabin);
    const smokeM = new THREE.MeshBasicMaterial({ color: 0xF3E6D6, transparent: true, opacity: 0.6, depthWrite: false });
    const smoke = [0, 1, 2, 3, 4].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), smokeM.clone()); scene.add(m); return m; });
    const chim = new THREE.Vector3(0.9, 4.5, -0.3).applyMatrix4(cabin.matrixWorld.compose(cabin.position, cabin.quaternion, cabin.scale));

    // l'étang, son canard, et la biche qui broute
    const waterM = toon(0x9ED0D8);
    const pond = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.08, 48), waterM); pond.scale.z = 0.55; pond.position.set(7, 0.05, -9); scene.add(pond);
    const rim = P(G.torus(3.6, 0.12), 0x8E6A4A, { ink: 0.03, rot: [Math.PI / 2, 0, 0], pos: [7, 0.08, -9], scale: [1, 0.55, 1] }); scene.add(rim);
    const duck = grp(P(G.sphere(0.4), 0xFFF6EA, { scale: [1.3, 0.8, 0.9] }), P(G.sphere(0.24), 0x5A8A3A, { pos: [0.4, 0.4, 0] }), P(G.cone(0.1, 0.25), 0xE7A628, { pos: [0.66, 0.38, 0], rot: [0, 0, -Math.PI / 2] }));
    scene.add(duck);
    const deer = new THREE.Group();
    deer.add(P(G.capsule(0.45, 1.2), 0xA8703E, { ink: 0.04, rot: [0, 0, Math.PI / 2], pos: [0, 1.3, 0] }));
    [[-0.5, 0.25], [-0.5, -0.25], [0.5, 0.25], [0.5, -0.25]].forEach(([x, z]) => deer.add(P(G.cyl(0.08, 0.07, 1.1, 8), 0x7A4A26, { ink: 0.03, pos: [x, 0.55, z] })));
    const deerHead = new THREE.Group(); deerHead.add(P(G.capsule(0.16, 0.6), 0xA8703E, { ink: 0.03, pos: [0, 0.35, 0] }), P(G.sphere(0.28), 0xA8703E, { ink: 0.04, pos: [0.1, 0.8, 0], scale: [1.3, 1, 1] }), P(G.cone(0.1, 0.3), 0xA8703E, { ink: 0.03, pos: [-0.05, 1.1, 0.15] }), P(G.cone(0.1, 0.3), 0xA8703E, { ink: 0.03, pos: [-0.05, 1.1, -0.15] }));
    deerHead.position.set(0.8, 1.45, 0); deer.add(deerHead); deer.position.set(11.5, 0, -12); deer.rotation.y = -0.6; scene.add(deer);

    // champignons géants au premier plan (ceux de la machine, en grand) : leurs chapeaux luisent la nuit
    const glowCaps = [];
    const giant = (m, x, z, sc, ry) => {
      m.traverse(o => { if (o.isMesh && o.material && !o.material.isMeshBasicMaterial) { o.material = o.material.clone(); } });
      m.position.set(x, 1.05 * sc, z); m.scale.setScalar(sc); m.rotation.y = ry; scene.add(m);
      const cap = m.userData.cap?.userData.mesh; if (cap) { cap.material.emissive = cap.material.color.clone(); cap.material.emissiveIntensity = 0; glowCaps.push(cap.material); }
      return m;
    };
    if (M) {
      giant(M.amanite(), -4.6, 4.5, 1.5, 0.5);
      giant(M.amanite(0xE9A13A), -3.2, 6.2, 0.7, -0.3);
      giant(M.shroom({ cap: 0xA85A26, stem: 0xE9C458, r: 1.02, h: 0.78, sr: 0.5, sh: 1.0, gill: 0xEAC54C, faceKind: 'line' }), 4.8, 4.2, 1.2, -0.5);
      giant(M.amanite(), 3.4, 6.6, 0.55, 0.2);
      giant(M.shroom({ cap: 0xFFF8EE, stem: 0xF4EADA, r: 1.0, h: 0.8, sr: 0.45, sh: 1.05, gill: 0xE4D3B6 }), 6.5, 2.5, 0.8, -0.8);
      giant(M.amanite(0xE4702A), -7, 1.5, 1.1, 0.9);
    }
    // lanternes sur leurs piquets
    const lamps = [];
    [[-3.6, 4.6], [3.8, 4.4], [-6, -3], [5.5, -4], [-9.5, 2]].forEach(([x, z]) => {
      const bulbM = toon(0xFFE7A0, { emissive: 0xFFC860, glow: 0.2 });
      const l = grp(P(G.cyl(0.06, 0.08, 1.8, 8), 0x5A3A22, { ink: 0.03, pos: [0, 0.9, 0] }), P(G.box(0.45, 0.55, 0.45, 0.06), bulbM, { ink: 0.035, pos: [0, 2.0, 0] }), P(G.cone(0.38, 0.3, 4), 0x3E2716, { ink: 0.03, pos: [0, 2.42, 0], rot: [0, Math.PI / 4, 0] }));
      const h = halo(0xFFB45A, 3.5, 0); h.position.set(0, 2, 0); l.add(h);
      l.position.set(x, 0, z); scene.add(l); lamps.push({ bulbM, h });
    });

    // petits habitants : renard assis, lapin qui sautille, hérisson qui trottine
    const fox = new THREE.Group(), foxHead = new THREE.Group(), foxTail = new THREE.Group();
    fox.add(P(G.sphere(0.55), 0xE07A30, { scale: [0.9, 1.1, 0.8], pos: [0, 0.6, 0] }), P(G.sphere(0.35), 0xFFF1DE, { ink: 0.02, scale: [0.8, 1, 0.5], pos: [0, 0.6, 0.35] }));
    foxHead.add(P(G.sphere(0.42), 0xE07A30), P(G.cone(0.16, 0.35), 0xE07A30, { pos: [0, -0.05, 0.45], rot: [Math.PI / 2, 0, 0] }), P(G.sphere(0.06), 0x3E2716, { ink: 0, pos: [0, -0.05, 0.63] }),
      P(G.cone(0.14, 0.34), 0xE07A30, { pos: [-0.24, 0.4, 0], rot: [0, 0, 0.3] }), P(G.cone(0.14, 0.34), 0xE07A30, { pos: [0.24, 0.4, 0], rot: [0, 0, -0.3] }), face(0.42, 'happy', { size: 0.06, spread: 0.16, y: 0.08 }));
    foxHead.position.set(0, 1.35, 0.05); fox.add(foxHead);
    foxTail.add(P(G.capsule(0.2, 0.7), 0xE07A30, { pos: [0, 0.45, 0] }), P(G.sphere(0.2), 0xFFF1DE, { pos: [0, 0.95, 0] })); foxTail.position.set(0.35, 0.25, -0.35); foxTail.rotation.set(-0.5, 0, -0.9); fox.add(foxTail);
    fox.position.set(3.4, 0, 7.6); fox.rotation.y = -0.35; scene.add(fox);
    const rabbit = new THREE.Group(), earL = new THREE.Group(), earR = new THREE.Group();
    rabbit.add(P(G.sphere(0.42), 0xE9DCCB, { scale: [1.1, 0.9, 1], pos: [0, 0.4, 0] }), P(G.sphere(0.3), 0xE9DCCB, { pos: [0.35, 0.78, 0] }), P(G.sphere(0.14), 0xFFFFFF, { pos: [-0.45, 0.45, 0] }));
    earL.add(P(G.capsule(0.07, 0.45), 0xE9DCCB, { pos: [0, 0.25, 0] })); earR.add(P(G.capsule(0.07, 0.45), 0xE9DCCB, { pos: [0, 0.25, 0] }));
    earL.position.set(0.3, 1.0, 0.1); earR.position.set(0.3, 1.0, -0.1); earL.rotation.z = -0.3; earR.rotation.z = -0.5; rabbit.add(earL, earR);
    const rf = face(0.3, 'smile', { size: 0.05, spread: 0.1, y: 0.02 }); rf.position.set(0.35, 0.78, 0); rf.rotation.y = Math.PI / 2; rabbit.add(rf);
    scene.add(rabbit);
    const hedge = new THREE.Group();
    hedge.add(P(G.sphere(0.45, 20, 14), 0x7A4A26, { scale: [1.2, 0.8, 1], pos: [0, 0.35, 0] }));
    for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI - Math.PI / 2, b = rnd() * Math.PI; const d = new THREE.Vector3(Math.cos(b) * Math.cos(a) * 1.2, Math.sin(a) * 0.4 + 0.45, Math.sin(b) * Math.cos(a)).normalize(); if (d.x > 0.6) continue; const sp = P(G.cone(0.07, 0.3, 6), 0x5A3418, { ink: 0.015 }); sp.position.set(d.x * 0.5, 0.35 + d.y * 0.35, d.z * 0.42); sp.lookAt(sp.position.clone().add(d)); sp.rotateX(Math.PI / 2); hedge.add(sp); }
    hedge.add(P(G.sphere(0.25), 0xF2D5A8, { pos: [0.5, 0.3, 0] }), P(G.sphere(0.06), 0x3E2716, { ink: 0, pos: [0.74, 0.3, 0] }));
    scene.add(hedge);

    // premier plan pour le téléphone : visible sous la machine quand on fait défiler la page
    const front = new THREE.Group(); scene.add(front);
    const fh = hedge.clone(true); front.add(fh);
    if (M) {
      [[-1.55, 9.4, 0.42, 0xE4502A], [-1.05, 10.0, 0.26, 0xE9A13A], [1.5, 9.3, 0.4, 0xE4702A], [1.95, 9.9, 0.24, 0xE4502A]].forEach(([x, z, sc, c]) => { const m = M.amanite(c); m.position.set(x, 1.05 * sc, z); m.scale.setScalar(sc); m.rotation.y = x > 0 ? -0.5 : 0.5; front.add(m); });
    }
    const fl = []; [[-2.3, 8.6], [2.3, 8.6]].forEach(([x, z]) => { const bulbM = toon(0xFFE7A0, { emissive: 0xFFC860, glow: 0.2 }); const l = grp(P(G.cyl(0.05, 0.07, 1.4, 8), 0x5A3A22, { ink: 0.03, pos: [0, 0.7, 0] }), P(G.box(0.36, 0.44, 0.36, 0.05), bulbM, { ink: 0.03, pos: [0, 1.6, 0] })); const h = halo(0xFFB45A, 2.6, 0); h.position.y = 1.6; l.add(h); l.position.set(x, 0, z); front.add(l); lamps.push({ bulbM, h }); });
    // feuilles qui tombent (instances recyclées)
    const NF = 110, fall = new THREE.InstancedMesh(leafGeo, leafM, NF), F = [];
    for (let i = 0; i < NF; i++) { F.push({ x: (rnd() - 0.5) * 30, y: rnd() * 14, z: 8 - rnd() * 22, v: 0.5 + rnd() * 0.6, ph: rnd() * TAU, s: 0.25 + rnd() * 0.25 }); fall.setColorAt(i, C(LEAF_COLS[i % 6])); }
    fall.frustumCulled = false; scene.add(fall);
    // lucioles (la nuit) et poussière dorée (le jour)
    const NFF = 70, ffBase = [];
    const flies = dots(NFF, i => { const p = [(rnd() - 0.5) * 26, 0.4 + rnd() * 3.5, 8 - rnd() * 18]; ffBase.push(p); return p; }, () => 0xFFE69A, { size: 10, twinkle: 3, opacity: 0 });
    scene.add(flies);

    return {
      camFor(aspect) {
        const narrow = aspect < 0.8; front.visible = narrow;
        return narrow ? { pos: new THREE.Vector3(0, 3.0, 20), target: new THREE.Vector3(0, 3.1, 0) } : { pos: new THREE.Vector3(0, 3.4, 15), target: new THREE.Vector3(0, 3.6, 0) };
      },
      update(t, dt, s) {
        const b = s.bonus;
        const u = skyM.userData.u; u.top.value = lerp(DAY.top, NIGHT.top, b); u.mid.value = lerp(DAY.mid, NIGHT.mid, b); u.bottom.value = lerp(DAY.bot, NIGHT.bot, b);
        scene.fog.color = lerp(DAY.fog, NIGHT.fog, b);
        hemi.color = lerp(DAY.hemiS, NIGHT.hemiS, b); hemi.groundColor = lerp(DAY.hemiG, NIGHT.hemiG, b); hemi.intensity = 1.7 - b * 0.6;
        sun.color = lerp(DAY.sun, NIGHT.sun, b); sun.intensity = 2.0 - b * 1.2;
        orb.material.color = lerp(0xFFE7A0, 0xF6EED0, b); orbHalo.material.color = lerp(0xFFD27A, 0xB9C2FF, b); orbG.position.y = 22 + Math.sin(t * 0.1) * 0.5;
        stars.userData.u.uOpacity.value = b; stars.userData.u.uTime.value = t;
        mtnM.color = lerp(0xE8B48A, 0x3A3358, b); hillM.color = lerp(0xCE8446, 0x2E2848, b); groundM.color = lerp(0xB9773A, 0x3A2E48, b); waterM.color = lerp(0x9ED0D8, 0x3B4E7A, b);
        leafM.color = lerp(0xffffff, 0x6A5A8A, b);
        winM.emissiveIntensity = b * 1.2; winHalo.material.opacity = b * 0.9;
        for (const l of lamps) { l.bulbM.emissiveIntensity = 0.2 + b * 1.1; l.h.material.opacity = b * (0.8 + Math.sin(t * 7 + l.h.id) * 0.1); }
        for (const m of glowCaps) m.emissiveIntensity = b * 0.35;
        flies.userData.u.uOpacity.value = b; flies.userData.u.uTime.value = t;
        const fp = flies.geometry.attributes.position;
        for (let i = 0; i < NFF; i++) { const p = ffBase[i]; fp.setXYZ(i, p[0] + Math.sin(t * 0.6 + i) * 0.8, p[1] + Math.sin(t * 0.9 + i * 2) * 0.4, p[2] + Math.cos(t * 0.5 + i) * 0.8); }
        fp.needsUpdate = true;
        for (const c of trees) { c.rotation.z = Math.sin(t * 0.8 + c.userData.ph) * 0.03; c.rotation.x = Math.cos(t * 0.6 + c.userData.ph) * 0.02; }
        smoke.forEach((m, i) => { const k = (t * 0.25 + i / 5) % 1; m.position.set(chim.x + k * 1.6 + Math.sin(k * 6 + i) * 0.2, chim.y + k * 4, chim.z); m.scale.setScalar(0.6 + k * 1.8); m.material.opacity = 0.6 * Math.sin(k * Math.PI); m.material.color = lerp(0xF3E6D6, 0x7A6A9A, b); });
        const da = t * 0.35; duck.position.set(7 + Math.cos(da) * 2.2, 0.28 + Math.sin(t * 3) * 0.03, -9 + Math.sin(da) * 1.1); duck.lookAt(7 + Math.cos(da + 0.1) * 2.2, 0.28, -9 + Math.sin(da + 0.1) * 1.1); duck.rotateY(-Math.PI / 2);
        const g = (t % 9) / 9; deerHead.rotation.z = g > 0.3 && g < 0.65 ? -1.0 * Math.sin((g - 0.3) / 0.35 * Math.PI) : 0;
        foxTail.rotation.z = -0.9 + Math.sin(t * 2.4) * 0.25; foxHead.rotation.y = Math.sin(t * 0.5) * 0.5; foxHead.rotation.z = Math.sin(t * 0.7) * 0.08;
        const ra = t * 0.45, hop = Math.abs(Math.sin(t * 5)); rabbit.position.set(-6.8 + Math.cos(ra) * 1.6, hop * 0.35, 3.2 + Math.sin(ra) * 0.8); rabbit.rotation.y = -ra - Math.PI / 2 + Math.PI; earL.rotation.z = -0.3 - hop * 0.2;
        const hx = 5.2 + Math.sin(t * 0.18) * 2.4; hedge.position.set(hx, Math.abs(Math.sin(t * 6)) * 0.03, 7.4); hedge.rotation.y = Math.cos(t * 0.18) >= 0 ? 0 : Math.PI;
        for (let i = 0; i < NF; i++) {
          const f = F[i]; f.y -= f.v * dt; if (f.y < 0.05) { f.y = 14; f.x = (Math.random() - 0.5) * 30; }
          o3.position.set(f.x + Math.sin(t * 1.2 + f.ph) * 0.8, f.y, f.z + Math.cos(t + f.ph) * 0.3);
          o3.rotation.set(t * 1.5 + f.ph, t * 1.1 + f.ph, Math.sin(t * 2 + f.ph)); o3.scale.setScalar(f.s); o3.updateMatrix(); fall.setMatrixAt(i, o3.matrix);
        }
        fall.instanceMatrix.needsUpdate = true;
        fh.position.set(Math.sin(t * 0.25) * 0.9, Math.abs(Math.sin(t * 6)) * 0.03, 10.2); fh.scale.setScalar(0.7); fh.rotation.y = Math.cos(t * 0.25) >= 0 ? 0 : Math.PI;
      },
    };
  },
});
