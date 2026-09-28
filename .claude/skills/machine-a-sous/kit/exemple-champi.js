// ---------- ART3D : les champignons de Champi Pop (construits avec KIT3D) ----------
const ART3D_MODELS = K => {
  const { THREE, part, G, face, mat, TAU } = K;
  K.INK.color = 0x4A2F1D; // encre brun foncé, comme les dessins 2D
  const grp = (...c) => { const g = new THREE.Group(); g.add(...c.flat()); return g; };
  const CREAM = 0xF6EAD2, WHITE = 0xFFF8EE;

  // pied : profil tourné légèrement renflé ; chapeau : dôme en profil tourné (h = hauteur, flat = aplatissement du bord)
  const stemGeo = (r, h, bulge = 1.15) => G.lathe([[0, -h / 2], [r * bulge, -h / 2 + 0.02], [r * bulge * 1.02, -h * 0.3], [r, 0], [r * 0.9, h * 0.35], [r * 0.85, h / 2], [0, h / 2]]);
  const capGeo = (r, h, lip = 0.12) => G.lathe([[0, -lip], [r * 0.7, -lip], [r, -lip * 0.3], [r * 1.02, 0.02], [r * 0.95, h * 0.35], [r * 0.75, h * 0.72], [r * 0.4, h * 0.95], [0, h]]);
  // un champignon complet ; o : { cap, stem, r, h, sr, sh, face, faceKind, spots, gill, base (y du pied, -1.05 par défaut) }
  function shroom(o) {
    const sh = o.sh ?? 1.0, sr = o.sr ?? 0.42, base = o.base ?? -1.05, g = new THREE.Group();
    const stem = part(stemGeo(sr, sh), o.stem ?? CREAM, { pos: [0, base + sh / 2, 0] });
    const topY = base + sh;
    const cap = part(capGeo(o.r ?? 0.9, o.h ?? 0.75), o.cap, { pos: [0, topY + 0.02, 0] });
    g.add(stem, cap);
    if (o.gill) g.add(part(G.cyl((o.r ?? 0.9) * 0.92, sr * 1.05, 0.12, 40), o.gill, { ink: 0.02, pos: [0, topY - 0.02, 0] }));
    if (o.spots) for (const [a, e, s] of o.spots) { // taches du chapeau : [azimut, élévation 0-1, taille]
      const R = o.r ?? 0.9, H = o.h ?? 0.75, y = topY + e * H * 0.88 + 0.03, rr = R * Math.cos(e * 1.3) * 1.04;
      const p = part(G.sphere(s), o.spotCol ?? WHITE, { ink: 0.015, pos: [Math.sin(a) * rr, y, Math.cos(a) * rr], scale: [1, 0.5, 1] });
      p.lookAt(p.position.clone().multiplyScalar(2).setY(y + 1.2)); g.add(p);
    }
    if (o.face !== false) { const f = face(sr * 1.05, o.faceKind ?? 'smile', { size: sr * 0.2, spread: sr * 0.42, y: 0 }); f.position.set(0, base + sh * 0.42, 0); g.add(f); }
    g.userData.cap = cap; return g;
  }
  const squashIdle = cap => ({ idle(t) { cap.scale.set(1 + Math.sin(t * TAU * 2) * 0.03, 1 - Math.sin(t * TAU * 2) * 0.04, 1 + Math.sin(t * TAU * 2) * 0.03); } });

  function enoki() { // bouquet de longues tiges fines à petits chapeaux, sur une motte crème qui sourit
    const base = part(G.lumpy(0.72, 0.05, 3), CREAM, { scale: [1.1, 0.8, 0.9], pos: [0, -0.62, 0] });
    const stems = [];
    [[-0.45, 0.35, -0.3], [-0.22, 0.15, 0.62], [0, 0, 0.8], [0.22, -0.15, 0.62], [0.45, -0.35, -0.3], [-0.1, 0.25, 0.3], [0.12, -0.2, 0.25]].forEach(([x, lean, len], i) => {
      const h = 1.05 + len * 0.5, s = new THREE.Group();
      s.add(part(G.capsule(0.055, h), 0xF8EFDC, { ink: 0.025, pos: [0, h / 2, 0] }), part(G.sphere(0.13), 0xFFF6E4, { ink: 0.03, pos: [0, h + 0.05, 0], scale: [1, 0.72, 1] }));
      s.position.set(x, -0.5, (i % 2 ? 0.12 : -0.12)); s.rotation.z = lean * 0.9; s.rotation.x = (i % 3 - 1) * 0.15; stems.push(s);
    });
    const f = face(0.72, 'o', { y: -0.05, size: 0.1, spread: 0.24 }); f.position.set(0, -0.62, 0.02); f.scale.set(1.1, 0.8, 0.9);
    const g = grp(stems, base, f); g.position.y = -0.05;
    g.userData.anim = { idle(t) { stems.forEach((s, i) => s.rotation.y = Math.sin(t * TAU + i) * 0.12); } };
    return g;
  }
  function paris() {
    const g = shroom({ cap: 0xFFF8EE, stem: 0xF4EADA, r: 1.0, h: 0.8, sr: 0.45, sh: 1.05, gill: 0xE4D3B6, faceKind: 'smile',
      spots: [[0.3, 0.5, 0.05], [1.2, 0.6, 0.04], [-0.8, 0.45, 0.05], [2.4, 0.5, 0.04], [-0.2, 0.75, 0.04], [0.8, 0.3, 0.04]], spotCol: 0xD6C3A3 });
    g.userData.anim = squashIdle(g.userData.cap); return g;
  }
  function shimeji() { // grappe de petits chapeaux bruns
    const base = part(G.lumpy(0.75, 0.05, 5), CREAM, { scale: [1.15, 0.8, 0.95], pos: [0, -0.65, 0] });
    const caps = [[-0.55, 0.05, 0.28], [0.55, 0.05, 0.28], [-0.25, 0.45, 0.33], [0.25, 0.45, 0.33], [0, 0.78, 0.36], [-0.35, -0.12, 0.3], [0.35, -0.12, 0.3]].map(([x, y, r], i) => {
      const s = new THREE.Group();
      s.add(part(G.capsule(0.07, Math.max(0.1, y + 0.35)), 0xF4E6CC, { ink: 0.02, pos: [0, (y + 0.35) / 2, 0] }), part(capGeo(r, r * 0.8, 0.05), i % 2 ? 0x8E6444 : 0xA2744E, { ink: 0.03, pos: [0, y + 0.35, 0] }));
      s.position.set(x * 0.9, -0.5, i < 2 ? -0.1 : 0.1); s.rotation.z = -x * 0.4; return s;
    });
    const f = face(0.75, 'smile', { y: -0.1, size: 0.1, spread: 0.26 }); f.position.set(0, -0.65, 0.04); f.scale.set(1.15, 0.8, 0.95);
    const g = grp(caps, base, f); g.position.y = -0.05;
    g.userData.anim = { idle(t) { caps.forEach((c, i) => c.rotation.x = Math.sin(t * TAU + i * 0.8) * 0.08); } };
    return g;
  }
  function girolle() { // trompette jaune au bord ondulé, et sa petite sœur
    const trumpet = (sc, kind) => {
      const pts = [[0, -0.9], [0.28, -0.88], [0.26, -0.3], [0.34, 0.1], [0.7, 0.45], [0.95, 0.55], [0.9, 0.62], [0.5, 0.52], [0, 0.4]];
      const geo = G.lathe(pts, 64), p = geo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (v.y > 0.3) { const a = Math.atan2(v.z, v.x); v.y += Math.sin(a * 6) * 0.05 * (v.y - 0.3) * 3; } p.setXYZ(i, v.x, v.y, v.z); }
      geo.computeVertexNormals();
      const t = new THREE.Group(); t.add(part(geo, 0xF2B93A));
      const f = face(0.3, kind, { size: 0.07, spread: 0.13, y: 0, blush: kind !== 'line' }); f.position.set(0, -0.4, 0.02); t.add(f);
      t.scale.setScalar(sc); return t;
    };
    const big = trumpet(1.05, 'smile'), small = trumpet(0.62, 'line'); small.position.set(-0.8, -0.38, -0.3); small.rotation.z = 0.2;
    const g = grp(small, big); g.position.y = 0.05;
    g.userData.anim = { idle(t) { small.rotation.z = 0.2 + Math.sin(t * TAU * 2) * 0.08; } };
    return g;
  }
  function pleurote() { // pied épais, petit chapeau brun, deux petits à côté
    const one = (sc, main) => { const s = shroom({ cap: 0x8B5E3C, stem: 0xF4EAD8, r: 0.62, h: 0.42, sr: 0.36, sh: 1.35, face: main, faceKind: 'smile' }); s.scale.setScalar(sc); return s; };
    const a = one(1, true), b = one(0.62, false), c = one(0.55, false);
    b.position.set(-0.72, -0.35, -0.25); b.rotation.z = 0.25; c.position.set(0.72, -0.4, -0.2); c.rotation.z = -0.3;
    return grp(b, c, a);
  }
  function morille() { // chapeau conique alvéolé
    const g = new THREE.Group();
    g.add(part(stemGeo(0.36, 0.8), CREAM, { pos: [0, -0.65, 0] }));
    const cone = G.lathe([[0, -0.05], [0.62, -0.02], [0.66, 0.35], [0.52, 0.8], [0.3, 1.1], [0, 1.25]]);
    const capM = part(cone, 0x9A6A3C, { pos: [0, -0.25, 0] }); g.add(capM);
    for (let row = 0; row < 4; row++) for (let k = 0; k < 7 - row; k++) { // alvéoles sombres
      const a = k / (7 - row) * TAU + row * 0.4, y = 0.05 + row * 0.26, rr = 0.64 - row * 0.1 - (row === 3 ? 0.08 : 0);
      if (Math.cos(a) < -0.2) continue;
      const h = part(G.sphere(0.13 - row * 0.015), 0x3A2313, { ink: 0, pos: [Math.sin(a) * rr, -0.25 + y, Math.cos(a) * rr], scale: [1, 0.8, 0.4] });
      h.lookAt(h.position.clone().multiplyScalar(2)); g.add(h);
    }
    const f = face(0.37, 'smile', { size: 0.075, spread: 0.15, y: 0 }); f.position.set(0, -0.72, 0); g.add(f);
    g.position.y = 0.05; return g;
  }
  function bolet() {
    const g = shroom({ cap: 0xA85A26, stem: 0xE9C458, r: 1.02, h: 0.78, sr: 0.5, sh: 1.0, gill: 0xEAC54C, faceKind: 'line' });
    g.userData.anim = squashIdle(g.userData.cap); return g;
  }
  function amanite(capCol = 0xE4502A) {
    const g = shroom({ cap: capCol, stem: WHITE, r: 1.05, h: 0.82, sr: 0.42, sh: 1.05, gill: 0xE6D6BA, faceKind: 'smile',
      spots: [[0, 0.5, 0.15], [0.85, 0.35, 0.13], [-0.85, 0.35, 0.13], [0.4, 0.8, 0.12], [-0.45, 0.78, 0.11], [1.6, 0.5, 0.12], [-1.6, 0.5, 0.12], [2.5, 0.4, 0.12], [0.35, 0.15, 0.1], [-0.4, 0.18, 0.1], [3.14, 0.6, 0.12]] });
    // collerette
    g.add(part(G.cyl(0.47, 0.5, 0.1, 32), 0xF1E4CC, { ink: 0.02, pos: [0, -0.35, 0] }));
    g.userData.anim = squashIdle(g.userData.cap); return g;
  }
  // médaillon en bois au liseré doré, face à la caméra, avec un motif devant
  function medal(inner, rim = 0xE7A628) {
    const disc = part(G.cyl(1.0, 1.0, 0.22, 48), 0x9A6334, { rot: [Math.PI / 2, 0, 0] });
    const face2 = part(G.cyl(0.84, 0.84, 0.05, 48), 0xF8E6C2, { ink: 0, pos: [0, 0, 0.12], rot: [Math.PI / 2, 0, 0] });
    const ring = part(G.torus(0.92, 0.07), rim, { ink: 0.02 });
    inner.position.z += 0.25;
    return grp(disc, face2, ring, inner);
  }
  function scatter() { // le champignon étoile doré dans son médaillon, entouré d'étincelles
    const gold = shroom({ cap: 0xFFCB45, stem: 0xFFF1D6, r: 0.62, h: 0.5, sr: 0.26, sh: 0.62, faceKind: 'happy' });
    gold.userData.cap.userData.mesh.material = mat(0xFFCB45, { emissive: 0xFFB020, glow: 0.35 });
    gold.scale.setScalar(0.9); gold.position.y = 0.05;
    const star = part(G.extrude(G.star(0.22, 0.1), 0.08, 0.04), mat(0xFFF3B8, { emissive: 0xFFE27A, glow: 0.6 }), { ink: 0.02, pos: [0, 0.62, 0.3] });
    const sparks = [0, 1, 2, 3, 4, 5].map(i => part(G.extrude(G.star(0.1, 0.04, 4), 0.03, 0.02), mat(0xFFE9A8, { emissive: 0xFFE27A, glow: 0.8 }), { ink: 0, pos: [Math.cos(i * TAU / 6) * 1.2, Math.sin(i * TAU / 6) * 1.2, 0.2] }));
    const g = grp(medal(grp(gold, star)), sparks);
    g.userData.anim = { idle(t) { sparks.forEach((s, i) => { const k = 0.6 + 0.4 * Math.sin(t * TAU * 2 + i); s.scale.setScalar(k); s.rotation.z = t * TAU; }); star.rotation.y = t * TAU; }, win(t) { star.rotation.y = t * TAU * 2; sparks.forEach(s => s.rotation.z = t * TAU * 2); } };
    return g;
  }
  // pouvoirs du bonus
  const POW = {
    grow() { // pousse sur sa motte avec ses racines blanches
      const soil = part(G.lumpy(0.5, 0.06, 7), 0x7A4A26, { scale: [1.3, 0.55, 0.7], pos: [0, -0.3, 0] });
      const roots = [[-0.3, -0.55, 0.6], [0.3, -0.55, -0.6], [0, -0.6, 0]].map(([x, y, r]) => part(G.capsule(0.04, 0.45), 0xFFF6E0, { ink: 0.015, pos: [x, y, 0.3], rot: [0, 0, r] }));
      const sprout = shroom({ cap: 0xE4502A, stem: WHITE, r: 0.36, h: 0.3, sr: 0.14, sh: 0.4, face: false, base: 0 }); sprout.position.y = -0.2; sprout.scale.setScalar(1.1);
      const g = grp(soil, roots, sprout);
      g.userData.anim = { idle(t) { sprout.scale.setScalar(1.05 + Math.sin(t * TAU * 2) * 0.08); } };
      return g;
    },
    color() { // lune rousse
      const moon = part(G.sphere(0.5), 0xF3A64A);
      const f = face(0.5, 'smile', { size: 0.08, spread: 0.17 });
      const g = grp(moon, f, part(G.extrude(G.star(0.1, 0.04, 4), 0.03, 0.02), mat(0xFFF3B8, { emissive: 0xFFF3B8, glow: .6 }), { ink: 0, pos: [0.55, 0.45, 0.2] }));
      return g;
    },
    heal() { // gland joufflu
      const nut = part(G.sphere(0.4), 0xC07A35, { scale: [1, 1.15, 1], pos: [0, -0.1, 0] });
      const cup = part(capGeo(0.45, 0.3, 0.06), 0x6B4226, { pos: [0, 0.2, 0] });
      const stalk = part(G.capsule(0.05, 0.15), 0x6B4226, { ink: 0.02, pos: [0.04, 0.55, 0], rot: [0, 0, -0.3] });
      const f = face(0.4, 'happy', { size: 0.07, spread: 0.14, y: -0.05 }); f.position.y = -0.1;
      return grp(nut, cup, stalk, f);
    },
    stack() { // nuage de spores dorées au-dessus d'un bolet
      const s = shroom({ cap: 0x9C6A44, stem: CREAM, r: 0.45, h: 0.36, sr: 0.2, sh: 0.45, face: false, base: 0 }); s.position.y = -0.6;
      const spores = [0, 1, 2, 3, 4, 5, 6].map(i => part(G.sphere(0.07 + (i % 3) * 0.02), mat(0xFFD66B, { emissive: 0xFFD66B, glow: 0.7 }), { ink: 0, pos: [Math.cos(i * 0.9) * 0.5, 0.35 + (i % 3) * 0.14, 0.1] }));
      const g = grp(s, spores);
      g.userData.anim = { idle(t) { spores.forEach((p, i) => p.position.y = 0.35 + (i % 3) * 0.14 + Math.sin(t * TAU + i) * 0.06); } };
      return g;
    },
    ring() { // rond de sorcière : 8 mini champignons en cercle sur l'herbe
      const grass = part(G.cyl(0.62, 0.62, 0.05, 40), 0x7FA84A, { ink: 0, rot: [Math.PI / 2, 0, 0], pos: [0, 0, -0.05] });
      const minis = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i / 8 * TAU; const m = shroom({ cap: i % 2 ? 0xE4502A : 0xF2B93A, stem: WHITE, r: 0.18, h: 0.15, sr: 0.07, sh: 0.2, face: false, base: -0.18 }); m.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.05); return m; });
      const g = grp(grass, minis);
      g.userData.anim = { idle(t) { g.rotation.z = t * TAU / 8; } };
      return g;
    },
  };
  const power = k => () => medal(POW[k]());
  return {
    SYMS: [enoki, paris, shimeji, girolle, pleurote, morille, bolet, () => amanite()],
    SCAT: scatter,
    VARIANTES: { power: { grow: power('grow'), color: power('color'), heal: power('heal'), stack: power('stack'), ring: power('ring') } },
    shroom, amanite, // réutilisés par le décor
  };
};
