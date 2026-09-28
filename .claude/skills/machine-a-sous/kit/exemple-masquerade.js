// ---------- ART3D : les invités de Masquerade of Madness (construits avec KIT3D) ----------
// Gravure baroque en 3D : ivoire, argent, noir velours et un seul rouge carmin, contour d'encre fin.
// Les cinq cartes gravées (10, J, Q, K, A) gardent leur dessin 2D (null) : leurs lettres baroques rendent mieux à plat.
const ART3D_MODELS = K => {
  const { THREE, part, G, mat, TAU } = K;
  K.INK.color = 0x050407;
  const grp = (...c) => { const g = new THREE.Group(); g.add(...c.flat()); return g; };
  const IVORY = 0xEFE8DA, SKIN = 0xE6DDCC, SILVER = 0xB9B3A8, DARK = 0x1E1A22, BLACK = 0x0E0C10, RED = 0xC8102E, DEEP = 0x6A0010;
  const ink = 0.035;
  const silver = K.pbr ? K.pbr(0xD8D2C6, { metal: 0.9, rough: 0.28 }) : SILVER;
  const tube = (pts, r = 0.1) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 24, r, 12, false);
  const bell = (x, y, z, r = 0.13) => part(G.sphere(r), silver, { ink: 0.02, pos: [x, y, z] });
  // collerette plissée : une couronne de petites boules ivoire
  function ruff(y, R = 0.62, n = 16, r = 0.15) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) { const a = i / n * TAU; g.add(part(G.sphere(r), IVORY, { ink: 0.02, pos: [Math.cos(a) * R, y + (i % 2) * 0.03, Math.sin(a) * R * 0.8], scale: [1, 0.75, 1] })); }
    return g;
  }
  // loup vénitien : un bandeau bombé sur les yeux, deux trous sombres
  function eyeMask(R, color, trim = SILVER, y = 0.12) {
    const g = new THREE.Group();
    g.add(part(new THREE.SphereGeometry(R * 1.035, 40, 20, Math.PI * 0.08, Math.PI * 0.84, Math.PI * 0.38, Math.PI * 0.16), color, { ink: 0.02, pos: [0, y - R * 0.05, 0] })); // bandeau sur l'avant (phi 0..π = côté +z)
    for (const s of [-1, 1]) {
      const e = part(G.sphere(R * 0.14), BLACK, { ink: 0, pos: [s * R * 0.34, y + R * 0.02, R * 0.96], scale: [1.35, 0.7, 0.4] }); g.add(e);
      g.add(part(G.torus(R * 0.2, R * 0.03, Math.PI), trim, { ink: 0, pos: [s * R * 0.34, y + R * 0.1, R * 0.98], rot: [0, 0, 0] }));
    }
    const eyes = new THREE.Group(); eyes.name = 'eyes'; g.add(eyes);
    return g;
  }
  const lips = (R, color = RED, y = -0.3) => part(G.sphere(R * 0.11), color, { ink: 0.015, pos: [0, y * R, R * 0.93], scale: [1.7, 0.55, 0.5] });

  // ---------- la rose ensanglantée ----------
  function rose() {
    const g = new THREE.Group();
    g.add(part(G.sphere(0.34), RED, { ink, pos: [0, 0.45, 0.05], scale: [1, 1.1, 1] }));
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; g.add(part(G.sphere(0.42), RED, { ink, pos: [Math.cos(a) * 0.3, 0.38, Math.sin(a) * 0.3], scale: [0.9, 0.95, 0.42], rot: [0, -a + Math.PI / 2, 0.35] })); }
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.4; g.add(part(G.sphere(0.5), 0x9A0A22, { ink, pos: [Math.cos(a) * 0.52, 0.22, Math.sin(a) * 0.52], scale: [0.9, 0.75, 0.36], rot: [0.5, -a + Math.PI / 2, 0.55] })); }
    g.add(part(G.cyl(0.07, 0.08, 1.4, 12), DARK, { ink: 0.02, pos: [0, -0.5, 0] }));
    const leaf = new THREE.Shape(); leaf.moveTo(0, 0); leaf.bezierCurveTo(0.25, 0.1, 0.35, 0.35, 0, 0.6); leaf.bezierCurveTo(-0.35, 0.35, -0.25, 0.1, 0, 0);
    [[-1, -0.55], [1, -0.85]].forEach(([s, y]) => g.add(part(G.extrude(leaf, 0.04, 0.02), DARK, { ink: 0.02, pos: [s * 0.3, y, 0], rot: [0, 0, -s * 1.1] })));
    [[0.12, -0.3], [-0.1, -0.65]].forEach(([x, y]) => g.add(part(G.cone(0.04, 0.14, 8), SILVER, { ink: 0.01, pos: [x, y, 0], rot: [0, 0, x > 0 ? -1.3 : 1.3] })));
    const drops = [[-0.35, -0.05], [0.4, -0.2]].map(([x, y]) => grp(part(G.sphere(0.08), RED, { ink: 0.015, pos: [x, y, 0.25] }), part(G.cone(0.08, 0.14, 12), RED, { ink: 0.015, pos: [x, y + 0.1, 0.25] })));
    g.add(...drops);
    g.rotation.x = 0.25; g.scale.setScalar(1.4); g.position.y = 0.12;
    g.userData.anim = { idle(t) { drops.forEach((d, i) => { const k = (t * 2 + i * 0.5) % 1; d.position.y = -k * 0.35; d.scale.setScalar(1 - k * 0.6); }); } };
    return g;
  }
  // ---------- le crâne couronné ----------
  function crane() {
    const g = new THREE.Group();
    g.add(part(G.sphere(0.72), IVORY, { ink, pos: [0, 0.18, 0], scale: [1, 0.98, 0.95] }));
    g.add(part(G.box(0.8, 0.42, 0.6, 0.16), IVORY, { ink, pos: [0, -0.42, 0.12] }));
    const eyes = new THREE.Group(); eyes.name = 'eyes';
    for (const s of [-1, 1]) g.add(part(G.sphere(0.2), BLACK, { ink: 0, pos: [s * 0.26, 0.1, 0.56], scale: [1, 1.1, 0.6] }));
    for (const s of [-1, 1]) eyes.add(part(G.sphere(0.05), mat(RED, { emissive: RED, glow: 0.9 }), { ink: 0, pos: [s * 0.26, 0.1, 0.66] }));
    g.add(eyes);
    g.add(part(G.cone(0.09, 0.18, 3), BLACK, { ink: 0, pos: [0, -0.12, 0.66], rot: [Math.PI, 0, 0] }));
    for (let i = 0; i < 6; i++) g.add(part(G.box(0.1, 0.16, 0.08, 0.02), IVORY, { ink: 0.012, pos: [-0.26 + i * 0.105, -0.46, 0.44] }));
    const crown = new THREE.Group(); crown.position.set(0.05, 0.8, 0); crown.rotation.z = -0.18;
    crown.add(part(G.cyl(0.46, 0.5, 0.26, 32), silver, { ink: 0.025 }));
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; crown.add(part(G.cone(0.1, 0.3, 12), silver, { ink: 0.02, pos: [Math.cos(a) * 0.45, 0.26, Math.sin(a) * 0.45] })); crown.add(part(G.sphere(0.055), RED, { ink: 0.01, pos: [Math.cos(a) * 0.49, 0.02, Math.sin(a) * 0.49] })); }
    g.add(crown);
    g.scale.setScalar(1.25);
    g.userData.anim = { idle(t) { eyes.children.forEach(e => e.scale.setScalar(0.8 + Math.max(0, Math.sin(t * TAU * 2)) * 0.5)); } };
    return g;
  }
  // un buste : épaules, cou, tête
  function bust(cloth, o = {}) {
    const g = new THREE.Group();
    g.add(part(G.sphere(0.9), cloth, { ink, scale: [1.08, 0.6, 0.72], pos: [0, -1.0, 0] }));
    g.add(part(G.cyl(0.2, 0.24, 0.32, 16), o.skin ?? SKIN, { ink, pos: [0, -0.48, 0] }));
    const head = new THREE.Group(); head.position.y = 0.08;
    head.add(part(G.sphere(0.58), o.skin ?? SKIN, { ink, scale: [0.92, 1.05, 0.95] }));
    g.add(head); g.userData.head = head;
    return g;
  }
  // ---------- les Fous : coiffe à trois pointes et clochettes ----------
  function jester(o) {
    const g = bust(o.cloth), h = g.userData.head;
    g.add(ruff(-0.5, 0.52, 16, 0.14));
    // losanges d'arlequin sur le torse
    g.add(part(G.box(0.34, 0.34, 0.08, 0.04), o.diamond, { ink: 0.015, pos: [0, -0.92, 0.66], rot: [0, 0, Math.PI / 4] }));
    h.add(eyeMask(0.58, o.mask, o.trim));
    h.add(lips(0.58, o.lips, -0.42));
    if (o.tear) h.add(part(G.sphere(0.05), RED, { ink: 0.01, pos: [-0.2, -0.12, 0.54], scale: [0.8, 1.3, 0.5] }));
    const cap = part(G.sphere(0.62), o.hatM, { ink, pos: [0, 0.2, -0.02], scale: [1, 0.62, 1] }); h.add(cap);
    h.add(part(G.torus(0.56, 0.06), o.trim, { ink: 0.015, pos: [0, 0.22, 0], rot: [Math.PI / 2 - 0.1, 0, 0] }));
    const horns = [
      [tube([[-0.35, 0.3, 0], [-0.8, 0.55, 0], [-1.05, 0.2, 0.05]], 0.12), o.hatL, [-1.05, 0.12, 0.05]],
      [tube([[0.35, 0.3, 0], [0.8, 0.55, 0], [1.05, 0.2, 0.05]], 0.12), o.hatR, [1.05, 0.12, 0.05]],
      [tube([[0, 0.5, 0], [0.1, 1.0, -0.05], [0.35, 1.18, 0]], 0.12), o.hatM, [0.4, 1.12, 0]],
    ];
    const bells = [];
    for (const [geo, col, bp] of horns) { h.add(part(geo, col, { ink: 0.025 })); const b = bell(...bp); h.add(b); bells.push(b); }
    g.scale.setScalar(1.08); g.position.y = 0.05;
    g.userData.anim = { idle(t) { bells.forEach((b, i) => { b.position.y += Math.sin(t * TAU * 4 + i) * 0.004; }); h.rotation.z = Math.sin(t * TAU) * 0.08; } };
    return g;
  }
  const fouNoir = () => jester({ cloth: DARK, diamond: silver, mask: silver, trim: SILVER, lips: BLACK, hatL: BLACK, hatR: silver, hatM: BLACK });
  const fouRouge = () => jester({ cloth: RED, diamond: BLACK, mask: IVORY, trim: IVORY, lips: RED, hatL: RED, hatR: BLACK, hatM: RED, tear: true });
  // ---------- le Prince sans Visage : tricorne, plume, masque lisse ----------
  function prince() {
    const g = new THREE.Group();
    g.add(part(G.sphere(0.9), RED, { ink, scale: [1.12, 0.62, 0.74], pos: [0, -1.0, 0] }));
    for (const s of [-1, 1]) g.add(part(G.box(0.5, 0.72, 0.08, 0.06), DEEP, { ink: 0.02, pos: [s * 0.42, -0.42, -0.12], rot: [0.15, s * 0.5, s * -0.25] }));
    g.add(part(G.torus(0.3, 0.035), silver, { ink: 0.01, pos: [0, -0.7, 0.42], rot: [0.9, 0, 0] }));
    g.add(part(G.sphere(0.09), IVORY, { ink: 0.01, pos: [0, -0.82, 0.6] }));
    const head = new THREE.Group(); head.position.y = 0.06; g.add(head);
    head.add(part(G.sphere(0.56), IVORY, { ink, scale: [0.88, 1.08, 0.92] })); // aucun trait : ni yeux, ni bouche
    head.add(part(G.sphere(0.07), 0xFFFFFF, { ink: 0, pos: [-0.18, 0.22, 0.46], scale: [1, 1.6, 0.4] }));
    const hat = new THREE.Group(); hat.position.y = 0.46; head.add(hat);
    hat.add(part(G.cyl(0.78, 0.78, 0.07, 3), BLACK, { ink: 0.025, rot: [0, Math.PI / 6, 0] }));
    hat.add(part(G.sphere(0.5), BLACK, { ink: 0.025, pos: [0, 0.12, 0], scale: [1, 0.78, 1] }));
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + Math.PI / 2; hat.add(part(G.box(0.95, 0.42, 0.05, 0.02), BLACK, { ink: 0.02, pos: [Math.cos(a) * 0.42, 0.12, Math.sin(a) * 0.42], rot: [0, -a + Math.PI / 2, 0] })); }
    hat.add(part(G.torus(0.52, 0.025), silver, { ink: 0, pos: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0] }));
    const plume = part(tube([[0.3, 0.1, 0.1], [0.6, 0.5, 0.05], [0.95, 0.55, 0], [1.1, 0.3, 0]], 0.1), IVORY, { ink: 0.02 }); hat.add(plume);
    g.scale.setScalar(1.1); g.position.y = 0.0;
    g.userData.anim = { idle(t) { plume.rotation.z = Math.sin(t * TAU) * 0.1; } };
    return g;
  }
  // ---------- la Dame au Masque : chignon, loup noir, plumes rouges, perles ----------
  function dame() {
    const g = bust(RED), h = g.userData.head;
    for (let i = 0; i < 11; i++) { const a = Math.PI * (0.15 + 0.7 * i / 10); g.add(part(G.sphere(0.055), IVORY, { ink: 0.01, pos: [Math.cos(a) * 0.3, -0.62 - Math.sin(a) * 0.12, Math.sin(a) * 0.26 + 0.08] })); }
    h.add(part(G.sphere(0.6), BLACK, { ink, pos: [0, 0.2, -0.26], scale: [1.02, 0.95, 0.8] }));
    h.add(part(G.sphere(0.34), BLACK, { ink, pos: [0, 0.7, -0.22] }));
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; h.add(part(G.sphere(0.045), IVORY, { ink: 0.01, pos: [Math.cos(a) * 0.3, 0.7 + Math.sin(a) * 0.3, -0.05] })); }
    const face = part(G.sphere(0.52), SKIN, { ink: 0.025, pos: [0, -0.06, 0.16], scale: [0.88, 1.06, 0.88] }); h.add(face);
    const m = eyeMask(0.47, BLACK, SILVER, 0.04); m.position.set(0, -0.04, 0.16); h.add(m);
    h.add(part(G.sphere(0.055), RED, { ink: 0.01, pos: [0, -0.3, 0.6], scale: [1.7, 0.55, 0.5] }));
    for (const s of [-1, 1]) h.add(part(G.sphere(0.06), IVORY, { ink: 0.01, pos: [s * 0.46, -0.26, 0.14] }));
    const plumes = [0, 1, 2].map(i => part(tube([[0.35, 0.3, 0], [0.6 + i * 0.1, 0.8 + i * 0.1, -0.05], [0.8 + i * 0.12, 1.1 + i * 0.08, -0.15]], 0.07), RED, { ink: 0.02 }));
    plumes.forEach(p => h.add(p));
    g.scale.setScalar(1.1); g.position.y = 0.0;
    g.userData.anim = { idle(t) { plumes.forEach((p, i) => { p.rotation.z = Math.sin(t * TAU + i) * 0.06; }); } };
    return g;
  }
  // ---------- le joker : masque vénitien blanc fendu en deux, sourire rouge ----------
  function volto(face, smile) {
    const g = new THREE.Group();
    for (const s of [-1, 1]) { // la coque avant, fendue en deux (gauche : phi 0..π/2, droite : π/2..π), un peu décalée
      const half = part(new THREE.SphereGeometry(0.72, 40, 28, s < 0 ? 0 : Math.PI / 2, Math.PI / 2), face, { ink: 0.03, scale: [0.8, 1.12, 0.55] });
      half.position.set(s * 0.05, s * 0.05, 0); half.rotation.z = s * -0.06; g.add(half);
    }
    for (const s of [-1, 1]) g.add(part(G.sphere(0.12), BLACK, { ink: 0, pos: [s * 0.23, 0.18, 0.36], scale: [1.4, 0.8, 0.5] }));
    g.add(part(G.torus(0.24, 0.05, Math.PI), smile, { ink: 0.015, pos: [0, -0.34, 0.3], rot: [0.25, 0, Math.PI] }));
    const eyes = new THREE.Group(); eyes.name = 'eyes'; g.add(eyes);
    g.add(part(G.torus(0.5, 0.03, Math.PI), silver, { ink: 0, pos: [0, 0.42, 0.18], rot: [0.5, 0, 0] }));
    g.scale.setScalar(1.5); g.position.y = 0.05;
    return g;
  }
  // ---------- le masque du Fou (scatter) : moitié argent, moitié carmin, clochettes ----------
  function foolMask() {
    const g = new THREE.Group();
    const halo = part(G.cyl(1.35, 1.35, 0.02, 48), mat(RED, { emissive: RED, glow: 1, opacity: 0.35 }), { ink: 0, pos: [0, 0, -0.5], rot: [Math.PI / 2, 0, 0] }); g.add(halo);
    const cols = [silver, RED];
    [0, 1].forEach(i => g.add(part(new THREE.SphereGeometry(0.68, 40, 28, i * Math.PI / 2, Math.PI / 2), cols[i], { ink: 0.03, scale: [0.95, 1.0, 0.55] }))); // moitié argent à gauche, carmin à droite
    for (const s of [-1, 1]) g.add(part(G.sphere(0.13), BLACK, { ink: 0, pos: [s * 0.26, 0.05, 0.34], scale: [1.4, 0.75, 0.5] }));
    g.add(part(G.box(0.12, 0.12, 0.05, 0.02), RED, { ink: 0.01, pos: [-0.26, -0.2, 0.33], rot: [0, 0, Math.PI / 4] }), part(G.box(0.12, 0.12, 0.05, 0.02), IVORY, { ink: 0.01, pos: [0.26, -0.2, 0.33], rot: [0, 0, Math.PI / 4] }));
    const bells = [];
    [[tube([[-0.4, 0.3, 0], [-0.85, 0.6, 0], [-1.1, 0.3, 0.05]], 0.11), silver, [-1.1, 0.22, 0.05]], [tube([[0.4, 0.3, 0], [0.85, 0.6, 0], [1.1, 0.3, 0.05]], 0.11), RED, [1.1, 0.22, 0.05]], [tube([[0, 0.5, 0], [0.1, 0.95, -0.05], [0.35, 1.1, 0]], 0.11), BLACK, [0.4, 1.05, 0]]]
      .forEach(([geo, col, bp]) => { g.add(part(geo, col, { ink: 0.025 })); const b = bell(...bp, 0.14); g.add(b); bells.push(b); });
    g.scale.setScalar(1.2);
    g.userData.anim = { idle(t) { halo.scale.setScalar(1 + Math.sin(t * TAU * 2) * 0.06); bells.forEach((b, i) => { b.rotation.z = Math.sin(t * TAU * 3 + i) * 0.5; }); } };
    return g;
  }
  return {
    SYMS: [null, null, null, null, null, rose, crane, fouNoir, fouRouge, prince, dame],
    SCAT: foolMask,
    VARIANTES: { wild: { wild: () => volto(IVORY, RED), red: () => volto(RED, BLACK) } },
    shroom: fouRouge, // le personnage vedette (utilisé par la Promenade et le décor)
  };
};
