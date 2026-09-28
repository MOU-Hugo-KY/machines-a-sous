// ---------- DECOR3D : la colline de Constella sous un ciel plein d'étoiles ; les aurores s'embrasent pendant le bonus ----------
const DECOR3D = (K, M) => ({
  build(scene, cam) {
    const { THREE, part, G, face, TAU, sky, dots } = K;
    const C = c => new THREE.Color(c), lerp = (a, b, t) => C(a).lerp(C(b), t);
    const grad = K.mat(0xffffff).gradientMap;
    const toon = (c, o = {}) => { const m = new THREE.MeshToonMaterial({ color: c, gradientMap: grad }); if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = o.glow ?? 1; } return m; };
    const P = (geo, m, o = {}) => part(geo, m instanceof THREE.Material ? m : toon(m, o), { ink: 0.05, ...o });
    const grp = (...c) => { const g = new THREE.Group(); g.add(...c.flat()); return g; };
    const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    const halo = (col, size, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.setScalar(size); return s; };

    cam.position.set(0, 3.4, 15); cam.userData.target.set(0, 4, 0);
    scene.fog = new THREE.Fog(0x2A2266, 30, 110);
    const skyM = sky(0x0A0824, 0x2C2266, 0x3A2E78); scene.add(skyM);
    const hemi = new THREE.HemisphereLight(0x9FB0FF, 0x2A2050, 1.5); scene.add(hemi);
    const moonLight = new THREE.DirectionalLight(0xC9D4FF, 1.6); moonLight.position.set(10, 14, 6); scene.add(moonLight);

    // étoiles, voie lactée
    const onSky = (e, a, r = 85) => [Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r - 10];
    const STAR_COLS = [0xFFF6DA, 0xFFF6DA, 0xFFFFFF, 0xB7C3FF, 0xFFD6EC, 0x9FE8FF];
    const stars = dots(1400, () => onSky(0.05 + Math.pow(rnd(), 0.7) * 1.45, rnd() * TAU), i => STAR_COLS[i % 6], { size: 7, twinkle: 2 }); stars.material.fog = false; scene.add(stars);
    const band = new THREE.Matrix4().makeRotationZ(0.5).multiply(new THREE.Matrix4().makeRotationX(1.2));
    const milky = dots(1600, () => { const a = rnd() * TAU, w = (rnd() - 0.5) * 0.25 * (rnd() + 0.3); const v = new THREE.Vector3(Math.cos(a) * 84, w * 84, Math.sin(a) * 84).applyMatrix4(band); return [v.x, Math.abs(v.y) + 4, v.z - 10]; }, () => rnd() < 0.5 ? 0xC9C2FF : 0xFFE9F4, { size: 4, twinkle: 1, opacity: 0.55 });
    milky.material.fog = false; scene.add(milky);
    // aurores : rubans qui ondulent (shader), plus forts pendant le bonus
    const aurU = { uTime: { value: 0 }, uStr: { value: 0.35 } };
    const aurM = new THREE.ShaderMaterial({ uniforms: aurU, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: 'uniform float uTime; varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; p.z += sin(p.x * 0.08 + uTime * 0.5) * 6.0; p.y += sin(p.x * 0.05 - uTime * 0.3) * 3.0 + uv.y * sin(p.x * 0.2 + uTime) * 1.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
      fragmentShader: 'uniform float uTime, uStr; varying vec2 vUv; void main(){ vec3 g = vec3(0.42, 1.0, 0.78), c = vec3(0.62, 0.91, 1.0), v = vec3(0.79, 0.64, 1.0); vec3 col = mix(g, mix(c, v, smoothstep(0.4, 1.0, vUv.y)), smoothstep(0.0, 0.5, vUv.y)); float curtain = 0.6 + 0.4 * sin(vUv.x * 60.0 + uTime * 1.5) * sin(vUv.x * 23.0 - uTime); float a = smoothstep(0.0, 0.15, vUv.y) * (1.0 - smoothstep(0.35, 1.0, vUv.y)) * smoothstep(0.0, 0.15, vUv.x) * (1.0 - smoothstep(0.85, 1.0, vUv.x)); gl_FragColor = vec4(col, a * curtain * uStr);\n#include <colorspace_fragment>\n}' });
    [[0, 26, -62, 130, 22], [8, 34, -70, 110, 16], [-10, 20, -58, 100, 14]].forEach(([x, y, z, w, h]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 160, 1), aurM); m.position.set(x, y, z); m.rotation.x = -0.25; scene.add(m); });
    // la lune qui dort et la planète à anneau (celles de la machine, en géant)
    const moonG = new THREE.Group(); moonG.add(halo(0xFFF1C0, 42, 0.45));
    if (M) { const mo = M.SYMS[0](); mo.scale.setScalar(4.2); moonG.add(mo); }
    moonG.position.set(19, 25, -62); scene.add(moonG);
    const planet = M ? M.SYMS[3]() : new THREE.Group(); planet.scale.setScalar(4.2); planet.position.set(-24, 24, -58); scene.add(planet);
    // astres lointains : ni brouillard ni ombre trop dure, ils luisent doucement
    const skyLit = o => o.traverse(m => { if (m.isMesh && m.material && m.material.side !== THREE.BackSide) { m.material = m.material.clone(); m.material.fog = false; if (m.material.emissive && !m.material.isMeshBasicMaterial && m.material.color) { m.material.emissive = m.material.color.clone(); m.material.emissiveIntensity = 0.35; } } });
    skyLit(moonG); skyLit(planet);
    const planet2 = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), toon(0x8FC8F0)); planet2.scale.setScalar(2.2); planet2.position.set(30, 14, -50); scene.add(planet2);
    // étoiles filantes
    const shooters = [0, 1, 2].map(() => { const g = grp(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.12, 9, 6), new THREE.MeshBasicMaterial({ color: 0xFFF6DA, transparent: true, opacity: 0, fog: false, blending: THREE.AdditiveBlending, depthWrite: false }))); g.children[0].position.y = -4.5; g.add(halo(0xFFFFFF, 3, 0)); scene.add(g); return { g, t: -rnd() * 8, from: new THREE.Vector3(), dir: new THREE.Vector3() }; });
    // la fusée qui passe de temps en temps (la nuit du bonus surtout)
    const rocket = M ? M.SYMS[5]() : null; if (rocket) { rocket.scale.setScalar(1.6); scene.add(rocket); }

    // collines, sapins, village, moulin, observatoire
    const hillMats = [toon(0x2C2560), toon(0x221C4C), toon(0x1B1640)];
    const hill = (w, d, h, x, z, k) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 14, 0, TAU, 0, Math.PI / 2), hillMats[k]); m.scale.set(w, h, d); m.position.set(x, -0.3, z); scene.add(m); return m; };
    hill(40, 16, 9, -34, -52, 0); hill(46, 18, 11, 30, -56, 0); hill(26, 12, 7, -4, -48, 1); hill(20, 10, 6, -16, -34, 1); hill(24, 10, 5, 20, -32, 1);
    const gg = new THREE.PlaneGeometry(240, 240, 60, 60); gg.rotateX(-Math.PI / 2);
    { const p = gg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * 0.13) * Math.cos(z * 0.1) * 0.6); } gg.computeVertexNormals(); }
    const groundM = toon(0x233A5C); scene.add(new THREE.Mesh(gg, groundM));
    const pineG = [G.cone(1, 3.2, 8), G.cone(0.75, 2.4, 8)];
    for (let i = 0; i < 46; i++) { const side = i % 2 ? 1 : -1, x = side * (4 + rnd() * 22), z = 1 - rnd() * 38; if (Math.abs(x) < 6 && z > -8) continue; const g = grp(P(G.cyl(0.1, 0.14, 0.8, 6), 0x2A1E3A, { ink: 0.03, pos: [0, 0.4, 0] }), P(pineG[0], 0x1F3A4A, { pos: [0, 2.0, 0] }), P(pineG[1], 0x264A58, { pos: [0, 3.2, 0] })); g.position.set(x, 0, z); g.scale.setScalar(0.7 + rnd() * 0.8); scene.add(g); }
    const lit = [];
    const winMat = () => { const m = toon(0x3A3070, { emissive: 0xFFD98A, glow: 0.9 }); lit.push(m); return m; };
    function house(x, z, s, ry) {
      const g = grp(P(G.box(1.6, 1.3, 1.4, 0.06), 0x3B3290, { pos: [0, 0.65, 0] }));
      const rs = new THREE.Shape(); rs.moveTo(-1.05, 0); rs.lineTo(0, 0.9); rs.lineTo(1.05, 0); rs.lineTo(-1.05, 0);
      g.add(P(G.extrude(rs, 1.4, 0.06), 0x5B47C9, { pos: [0, 1.75, 0] }), P(G.box(0.36, 0.34, 0.06, 0.02), winMat(), { ink: 0.02, pos: [0.4, 0.8, 0.72] }), P(G.box(0.36, 0.34, 0.06, 0.02), winMat(), { ink: 0.02, pos: [-0.4, 0.8, 0.72] }));
      const h = halo(0xFFC870, 2.5, 0.5); h.position.set(0, 0.8, 1); g.add(h);
      g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = ry; scene.add(g);
    }
    [[-15, -19, 1.2, 0.4], [-17.5, -22, 1, 0.2], [-13, -23, 0.9, -0.1], [-19.5, -17.5, 0.8, 0.6]].forEach(a => house(...a));
    const mill = new THREE.Group(), blades = new THREE.Group();
    mill.add(P(G.cyl(0.6, 1.1, 5, 12), 0x3B3290, { pos: [0, 2.5, 0] }), P(G.cone(0.9, 1.3, 12), 0x5B47C9, { pos: [0, 5.6, 0] }), P(G.box(0.3, 0.45, 0.06, 0.02), winMat(), { ink: 0.02, pos: [0, 3, 0.85] }));
    for (let i = 0; i < 4; i++) { const b = P(G.box(0.4, 3.2, 0.06, 0.03), 0xE6DAFF, { ink: 0.03, pos: [0, 1.7, 0] }); const piv = new THREE.Group(); piv.add(b); piv.rotation.z = i * TAU / 4; blades.add(piv); }
    blades.add(P(G.sphere(0.25), 0xFFD66B, { ink: 0.03 })); blades.position.set(0, 4.6, 1.1); mill.add(blades);
    mill.position.set(-11, 0, -20); mill.rotation.y = 0.35; scene.add(mill);
    const obs = new THREE.Group(), dome = new THREE.Group();
    obs.add(P(G.cyl(1.9, 2.1, 2.4, 24), 0xE9E6FF, { pos: [0, 1.2, 0] }), P(G.torus(2.05, 0.12), 0xE0A94A, { ink: 0.03, pos: [0, 2.4, 0], rot: [Math.PI / 2, 0, 0] }));
    dome.add(P(new THREE.SphereGeometry(2, 32, 16, 0, TAU, 0, Math.PI / 2), 0xFFFFFF), P(G.box(0.7, 2.1, 0.3, 0.05), toon(0x171339, { emissive: 0x6C5AE0, glow: 1.2 }), { ink: 0.03, pos: [0, 1.0, 1.75], rot: [-0.45, 0, 0] }));
    const scope = P(G.cyl(0.25, 0.32, 2.2, 12), 0xE0A94A, { ink: 0.04, pos: [0, 1.8, 1.2], rot: [-0.8, 0, 0] }); dome.add(scope);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(1.4, 16, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x9FB0FF, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
    beam.position.set(0, 9, 7); beam.rotation.x = -0.8 + Math.PI; dome.add(beam);
    dome.position.y = 2.45; obs.add(dome); obs.add(halo(0xB7A8FF, 6, 0.4)); obs.children.at(-1).position.set(0, 3.5, 1.8);
    obs.position.set(13, 0, -27); obs.rotation.y = -0.4; obs.scale.setScalar(1.4); scene.add(obs);

    // premier plan : tente et feu de camp, rochers, fleurs qui luisent, chat qui regarde le ciel
    const tent = new THREE.Group(), tentS = new THREE.Shape(); tentS.moveTo(-1.6, 0); tentS.lineTo(0, 2.2); tentS.lineTo(1.6, 0); tentS.lineTo(-1.6, 0);
    tent.add(P(G.extrude(tentS, 2.6, 0.08), 0xE0A94A, { pos: [0, 1.1, 0] }), P(G.box(0.9, 1.2, 0.1, 0.05), toon(0x3A2A20, { emissive: 0xFFB45A, glow: 0.5 }), { ink: 0.03, pos: [0, 0.6, 1.36] }));
    tent.position.set(-7.2, 0, 2.6); tent.rotation.y = 0.5; scene.add(tent);
    const fire = new THREE.Group(), flames = [];
    [[-0.25, 0], [0.25, 0.15], [0, -0.2]].forEach(([x, z]) => fire.add(P(G.capsule(0.09, 0.9), 0x6B4226, { ink: 0.03, pos: [x * 0.6, 0.12, z * 0.6], rot: [Math.PI / 2, 0, x * 3] })));
    [[0.45, 1.1, 0xFF8A4C], [0.3, 0.8, 0xFFE27A]].forEach(([r, h, c]) => { const f = P(G.cone(r, h, 12), toon(c, { emissive: c, glow: 1.2 }), { ink: 0, pos: [0, h / 2 + 0.1, 0] }); fire.add(f); flames.push(f); });
    const fireHalo = halo(0xFF9A40, 6, 0.9); fireHalo.position.y = 0.8; fire.add(fireHalo);
    fire.position.set(-4.6, 0, 4.6); scene.add(fire);
    const embers = dots(30, () => [-4.6, 0.5, 4.6], () => 0xFFB45A, { size: 5, twinkle: 6 }); scene.add(embers);
    const rocks = [[5.4, 3.8, 1.2], [6.6, 4.8, 0.7], [-9, 5, 0.9]].map(([x, z, s]) => { const r = P(G.lumpy(0.8, 0.18, x, 3), 0x6F66A8, { pos: [x, 0.3 * s, z], scale: [s * 1.3, s * 0.8, s] }); scene.add(r); return r; });
    const FLOWER = [0xFF9EC7, 0x9FE8FF, 0xFFE27A, 0xC9A2FF];
    const flowers = new THREE.Group(); scene.add(flowers);
    const flower = (x, z, k, parent = flowers) => { const c = FLOWER[k % 4]; const f = grp(P(G.cyl(0.03, 0.03, 0.6, 5), 0x3F8A6A, { ink: 0.015, pos: [0, 0.3, 0] }), P(G.sphere(0.16), toon(c, { emissive: c, glow: 0.8 }), { ink: 0.02, pos: [0, 0.65, 0] })); f.position.set(x, 0, z); f.userData.ph = rnd() * TAU; parent.add(f); return f; };
    for (let i = 0; i < 40; i++) { const x = (rnd() - 0.5) * 22, z = 8 - rnd() * 10; if (Math.abs(x) < 2.5 && z > 2) continue; flower(x, z, i); }
    const cat = new THREE.Group(), catTail = new THREE.Group(), catHead = new THREE.Group();
    cat.add(P(G.sphere(0.5), 0x2E2A6E, { scale: [0.85, 1.05, 0.8], pos: [0, 0.5, 0] }));
    catHead.add(P(G.sphere(0.36), 0x2E2A6E), P(G.cone(0.13, 0.3), 0x2E2A6E, { pos: [-0.2, 0.33, 0], rot: [0, 0, 0.3] }), P(G.cone(0.13, 0.3), 0x2E2A6E, { pos: [0.2, 0.33, 0], rot: [0, 0, -0.3] }));
    catHead.position.set(0, 1.12, 0); cat.add(catHead);
    catTail.add(P(G.capsule(0.07, 0.8), 0x2E2A6E, { pos: [0, 0.45, 0] })); catTail.position.set(0.25, 0.15, -0.3); catTail.rotation.set(-0.6, 0, -0.9); cat.add(catTail);
    cat.position.set(5.6, 0.9, 3.8); cat.rotation.y = Math.PI; scene.add(cat); // assis sur le rocher, de dos, il regarde les étoiles
    const flies = dots(80, () => [(rnd() - 0.5) * 26, 0.4 + rnd() * 4, 8 - rnd() * 18], () => rnd() < 0.6 ? 0xFFF3B0 : 0x9FE8FF, { size: 9, twinkle: 3 }); scene.add(flies);
    const flyBase = Array.from(flies.geometry.attributes.position.array);
    // premier plan pour le téléphone
    const front = new THREE.Group(); scene.add(front);
    [[-1.5, 7.4], [-1.1, 7.9], [-1.9, 8.1], [1.4, 7.3], [1.8, 7.9], [1.1, 8.2], [-0.5, 8.5], [0.4, 8.4]].forEach(([x, z], i) => flower(x, z, i, front));
    const fcat = cat.clone(true); fcat.position.set(0.8, 0, 8.3); fcat.rotation.y = Math.PI + 0.4; fcat.scale.setScalar(0.5); front.add(fcat);

    return {
      camFor(aspect) {
        const narrow = aspect < 0.8; front.visible = narrow;
        return narrow ? { pos: new THREE.Vector3(0, 3.0, 20), target: new THREE.Vector3(0, 3.4, 0) } : { pos: new THREE.Vector3(0, 3.4, 15), target: new THREE.Vector3(0, 4, 0) };
      },
      update(t, dt, s) {
        const b = s.bonus;
        const u = skyM.userData.u; u.top.value = lerp(0x0A0824, 0x0C0A30, b); u.mid.value = lerp(0x2C2266, 0x2A2A70, b); u.bottom.value = lerp(0x3A2E78, 0x3E5A9A, b);
        scene.fog.color = lerp(0x2A2266, 0x2A3A7A, b);
        aurU.uTime.value = t; aurU.uStr.value = 0.3 + b * 0.75;
        stars.userData.u.uTime.value = t; stars.userData.u.uOpacity.value = 0.85 + b * 0.15; milky.userData.u.uTime.value = t;
        hemi.color = lerp(0x9FB0FF, 0x9FF0E0, b * 0.5);
        moonG.position.y = 25 + Math.sin(t * 0.2) * 0.8; moonG.rotation.z = Math.sin(t * 0.15) * 0.08;
        planet.rotation.y = t * 0.15; planet.position.y = 24 + Math.sin(t * 0.25 + 1) * 0.6;
        blades.rotation.z = -t * 0.8; dome.rotation.y = Math.sin(t * 0.1) * 0.6; scope.rotation.x = -0.8 + Math.sin(t * 0.3) * 0.1;
        for (const m of lit) m.emissiveIntensity = 0.8 + Math.sin(t * 2 + m.id) * 0.1;
        flames.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 13 + i) * 0.1, 1 + Math.sin(t * 9 + i * 2) * 0.2, 1); });
        fireHalo.material.opacity = 0.75 + Math.sin(t * 11) * 0.1 + Math.sin(t * 7) * 0.08;
        const ep = embers.geometry.attributes.position;
        for (let i = 0; i < 30; i++) { const k = (t * 0.4 + i / 30) % 1; ep.setXYZ(i, -4.6 + Math.sin(i * 7 + t) * 0.3 * k, 0.4 + k * 3, 4.6 + Math.cos(i * 3 + t) * 0.3 * k); }
        ep.needsUpdate = true; embers.userData.u.uTime.value = t;
        const fp = flies.geometry.attributes.position;
        for (let i = 0; i < 80; i++) fp.setXYZ(i, flyBase[i * 3] + Math.sin(t * 0.6 + i) * 0.8, flyBase[i * 3 + 1] + Math.sin(t * 0.9 + i * 2) * 0.4, flyBase[i * 3 + 2] + Math.cos(t * 0.5 + i) * 0.8);
        fp.needsUpdate = true; flies.userData.u.uTime.value = t;
        for (const f of flowers.children) f.rotation.z = Math.sin(t * 1.3 + f.userData.ph) * 0.12;
        for (const f of front.children) if (f.userData.ph != null) f.rotation.z = Math.sin(t * 1.3 + f.userData.ph) * 0.12;
        catTail.rotation.z = -0.9 + Math.sin(t * 1.8) * 0.3; catHead.rotation.y = Math.sin(t * 0.4) * 0.4;
        // étoiles filantes : plus fréquentes pendant le bonus
        for (const sh of shooters) {
          sh.t += dt * (1 + b * 1.5);
          if (sh.t > 1.6) { sh.t = -(2 + rnd() * 6); sh.from.set((rnd() - 0.3) * 60, 30 + rnd() * 15, -50 - rnd() * 10); sh.dir.set(-(0.6 + rnd() * 0.4), -0.45, 0).normalize(); }
          const k = Math.max(0, sh.t), vis = sh.t > 0 && sh.t < 1.2 ? Math.sin(sh.t / 1.2 * Math.PI) : 0;
          sh.g.position.copy(sh.from).addScaledVector(sh.dir, k * 40); sh.g.lookAt(sh.g.position.clone().sub(sh.dir)); sh.g.rotateX(Math.PI / 2);
          sh.g.children[0].material.opacity = vis * 0.9; sh.g.children[1].material.opacity = vis;
        }
        if (rocket) { const k = ((t * 0.045) % 1), x = -40 + k * 80; rocket.visible = b > 0.5 || (k > 0.05 && k < 0.95 && Math.floor(t * 0.045) % 3 === 0); rocket.position.set(x, 18 + Math.sin(k * Math.PI) * 8, -30); rocket.rotation.z = -Math.PI / 2 + 0.35 - Math.cos(k * Math.PI) * 0.3; }
      },
    };
  },
});
