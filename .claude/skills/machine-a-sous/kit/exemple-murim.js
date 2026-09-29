// ---------- ART3D : les maîtres de Murim : Heavenly Demon (construits avec KIT3D) ----------
// Encre de manhwa en 3D : noir, papier, rouge sang et touches d'or, contour d'encre net.
// Les cinq objets du Jianghu (pièce, parchemin, talisman, gourde, lotus) et le joker 氣 gardent leur dessin 2D (null) :
// la calligraphie et les caractères rendent mieux à plat.
const ART3D_MODELS = K => {
  const { THREE, part, G, mat, TAU } = K;
  K.INK.color = 0x070608;
  const grp = (...c) => { const g = new THREE.Group(); g.add(...c.flat()); return g; };
  const PAPER = 0xF2ECDF, SKIN = 0xEFE2CF, PALE = 0xE8DCCC, BLACK = 0x0E0C10, INKC = 0x070608, RED = 0xB3141F, BLOOD = 0xE8202F, BLUE = 0x1E3A6A, GREY = 0x8C8A92, BROWN = 0x6A4A2A;
  const ink = 0.035;
  const gold = K.pbr ? K.pbr(0xE8B850, { metal: 0.85, rough: 0.3 }) : 0xD8A845;
  const steel = K.pbr ? K.pbr(0xDDE6F0, { metal: 0.9, rough: 0.22 }) : 0xB9B3A8;
  const jade = K.pbr ? K.pbr(0x4AA878, { metal: 0.2, rough: 0.25 }) : 0x4AA878;
  const glow = (c, op = 0.4, r = 1.3, z = -0.6) => part(G.cyl(r, r, 0.02, 48), mat(c, { emissive: c, glow: 1, opacity: op }), { ink: 0, pos: [0, 0.1, z], rot: [Math.PI / 2, 0, 0] });
  const tube = (pts, r = 0.1) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 24, r, 12, false);
  // yeux de manhwa : deux amandes fines et pointues (iris sombre ou rouge), sourcils en trait de pinceau
  function eyes(R, iris = INKC, o = {}) {
    const g = new THREE.Group(); g.name = 'eyes';
    const y = o.y ?? 0.02, sp = o.sp ?? 0.21, slant = o.slant ?? 0.18;
    for (const s of [-1, 1]) {
      const z = Math.sqrt(Math.max(0, R * R - sp * sp - y * y)) - 0.01;
      g.add(part(G.sphere(0.075), iris, { ink: 0, pos: [s * sp, y, z], scale: [1.7, 0.42, 0.35], rot: [0, 0, s * slant] }));
      if (iris !== INKC) g.add(part(G.sphere(0.03), mat(iris, { emissive: iris, glow: 1 }), { ink: 0, pos: [s * sp, y, z + 0.02] }));
      g.add(part(G.box(0.2, 0.035, 0.03, 0.012), INKC, { ink: 0, pos: [s * (sp + 0.01), y + (o.brow ?? 0.13), z - 0.01], rot: [0, s * 0.3, s * (o.angry ?? 0.25)] }));
    }
    return g;
  }
  const mouth = (R, y = -0.3, w = 0.12, c = INKC) => part(G.box(w, 0.022, 0.02, 0.01), c, { ink: 0, pos: [0, y, Math.sqrt(R * R - y * y) - 0.005] });
  // un buste : robe croisée, cou, tête ; renvoie aussi la tête pour y poser cheveux et visage
  function bust(robe, o = {}) {
    const g = new THREE.Group();
    g.add(part(G.sphere(0.9), robe, { ink, scale: [1.1, 0.62, 0.74], pos: [0, -1.02, 0] }));
    // col croisé du hanfu (deux bandes qui se croisent en V)
    for (const s of [-1, 1]) g.add(part(G.box(0.14, 0.72, 0.06, 0.03), o.collar ?? PAPER, { ink: 0.015, pos: [s * 0.14, -0.78, 0.6], rot: [-0.35, 0, s * 0.55] }));
    if (o.sash) g.add(part(G.box(1.5, 0.16, 0.9, 0.06), o.sash, { ink: 0.015, pos: [0, -1.28, 0.08] }));
    g.add(part(G.cyl(0.19, 0.23, 0.32, 16), o.skin ?? SKIN, { ink, pos: [0, -0.5, 0] }));
    const head = new THREE.Group(); head.position.y = 0.06;
    head.add(part(G.sphere(0.54), o.skin ?? SKIN, { ink, scale: [0.9, 1.06, 0.94] }));
    head.add(part(G.cone(0.2, 0.3, 16), o.skin ?? SKIN, { ink: 0.02, pos: [0, -0.48, 0.12], rot: [Math.PI + 0.3, 0, 0], scale: [1.4, 1, 0.8] })); // menton fin
    g.add(head); g.userData.head = head;
    return g;
  }
  // cheveux : calotte noire, frange effilée, et mèches longues optionnelles
  function hair(head, col, o = {}) {
    head.add(part(G.sphere(0.58), col, { ink, pos: [0, 0.14, -0.06], scale: [0.95, 0.9, 0.95] }));
    for (let i = -2; i <= 2; i++) head.add(part(G.cone(0.12, 0.42, 8), col, { ink: 0.02, pos: [i * 0.14, 0.3, 0.38], rot: [0.5 + Math.abs(i) * 0.1, 0, i * 0.25] }));
    const locks = [];
    if (o.long) for (const s of [-1, 1]) { const l = part(tube([[s * 0.42, 0.1, -0.05], [s * 0.55, -0.5, -0.05], [s * 0.6, -1.3, -0.2]], 0.13), col, { ink: 0.02 }); head.add(l); locks.push(l); }
    if (o.long) head.add(part(G.box(1.0, 1.6, 0.25, 0.12), col, { ink: 0.02, pos: [0, -0.6, -0.42] }));
    if (o.bun) { head.add(part(G.sphere(0.22), col, { ink: 0.02, pos: [0, 0.66, -0.12] })); head.add(part(G.cyl(0.02, 0.02, 0.8, 8), o.pin ?? gold, { ink: 0.01, pos: [0, 0.66, -0.1], rot: [0, 0, Math.PI / 2 - 0.2] })); }
    return locks;
  }

  // ---------- l'Épéiste : robe blanche, ceinture bleue, chignon, sabre sur l'épaule ----------
  function epeiste() {
    const g = bust(PAPER, { collar: BLUE, sash: BLUE }), h = g.userData.head;
    hair(h, INKC, { bun: true });
    h.add(eyes(0.54, 0x1E2A40, { angry: 0.2 }), mouth(0.54, -0.32, 0.1));
    const sword = grp(part(G.box(0.07, 1.9, 0.03, 0.015), steel, { ink: 0.015, pos: [0, 0.95, 0] }), part(G.box(0.34, 0.06, 0.12, 0.02), gold, { ink: 0.015, pos: [0, 0, 0] }), part(G.cyl(0.05, 0.05, 0.42, 10), BLUE, { ink: 0.015, pos: [0, -0.24, 0] }));
    sword.position.set(0.72, -0.2, -0.3); sword.rotation.z = -0.5; g.add(sword);
    g.scale.setScalar(1.1); g.position.y = 0.02;
    g.userData.anim = { idle(t) { sword.rotation.z = -0.5 + Math.sin(t * TAU) * 0.04; }, win(t) { sword.rotation.z = -0.5 - Math.sin(t * TAU) * 0.35; } };
    return g;
  }
  // ---------- le Maître de la Paume : robe brune, cheveux gris, barbe, paume dorée qui s'illumine ----------
  function paume() {
    const g = bust(BROWN, { collar: 0x3A2A1A, sash: 0x3A2A1A }), h = g.userData.head;
    hair(h, 0xB8B0A8, { bun: true, pin: 0x5A3A20 });
    h.add(eyes(0.54, INKC, { angry: 0.05, slant: 0.1 }), mouth(0.54, -0.28, 0.14));
    h.add(part(G.cone(0.22, 0.62, 20), 0xE8E2DA, { ink: 0.02, pos: [0, -0.62, 0.3], rot: [Math.PI - 0.25, 0, 0] })); // barbe
    for (const s of [-1, 1]) h.add(part(tube([[s * 0.08, -0.28, 0.5], [s * 0.26, -0.36, 0.44], [s * 0.34, -0.6, 0.36]], 0.03), 0xE8E2DA, { ink: 0.01 })); // moustache
    const palm = new THREE.Group(); palm.position.set(0.82, -0.2, 0.4);
    palm.add(part(G.capsule(0.12, 0.5), BROWN, { ink: 0.02, pos: [-0.12, -0.34, -0.1], rot: [0, 0, 0.4] }));
    palm.add(part(G.box(0.34, 0.4, 0.12, 0.05), gold, { ink: 0.02 }));
    for (let i = 0; i < 4; i++) palm.add(part(G.capsule(0.04, 0.16), gold, { ink: 0.012, pos: [-0.12 + i * 0.08, 0.3, 0] }));
    const aura = part(G.sphere(0.5), mat(0xF7D98A, { emissive: 0xF7B040, glow: 1, opacity: 0.35 }), { ink: 0 }); palm.add(aura);
    g.add(palm);
    g.scale.setScalar(1.1); g.position.y = 0.02;
    g.userData.anim = { idle(t) { aura.scale.setScalar(0.9 + Math.sin(t * TAU * 2) * 0.12); }, win(t) { palm.position.z = 0.4 + Math.max(0, Math.sin(t * TAU)) * 0.35; aura.scale.setScalar(1.1 + Math.sin(t * TAU * 2) * 0.3); } };
    return g;
  }
  // ---------- l'Assassin : capuche noire, masque sur le bas du visage, yeux rouges, dague ----------
  function assassin() {
    const g = bust(BLACK, { collar: 0x2A2530 }), h = g.userData.head;
    h.add(part(G.sphere(0.66), 0x16141A, { ink, pos: [0, 0.1, -0.1], scale: [0.98, 1.05, 0.98] })); // capuche
    h.add(part(G.cone(0.4, 0.6, 16), 0x16141A, { ink: 0.02, pos: [0, 0.62, -0.28], rot: [-0.9, 0, 0] }));
    h.add(part(new THREE.SphereGeometry(0.56, 40, 20, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.52, Math.PI * 0.4), 0x1E1A22, { ink: 0.015, scale: [0.92, 1.06, 0.96] })); // masque du bas
    h.add(eyes(0.54, BLOOD, { angry: 0.4, slant: 0.25, y: 0.04 }));
    const dagger = grp(part(G.cone(0.07, 0.7, 4), steel, { ink: 0.015, pos: [0, 0.35, 0] }), part(G.box(0.24, 0.05, 0.08, 0.02), 0x3A3440, { ink: 0.01 }), part(G.cyl(0.04, 0.04, 0.26, 8), RED, { ink: 0.01, pos: [0, -0.16, 0] }));
    dagger.position.set(-0.8, -0.5, 0.45); dagger.rotation.z = 0.6; g.add(dagger);
    g.scale.setScalar(1.1); g.position.y = 0.02;
    const ey = h.children.find(c => c.name === 'eyes');
    g.userData.anim = { idle(t) { ey.children.forEach(e => e.scale.y = 1 + Math.sin(t * TAU * 2) * 0.05); dagger.rotation.z = 0.6 + Math.sin(t * TAU) * 0.08; }, win(t) { dagger.rotation.z = 0.6 + Math.sin(t * TAU * 2) * 0.6; } };
    return g;
  }
  // ---------- le Maître Démoniaque : longs cheveux, couronne de cornes rouges, yeux de sang, aura rouge ----------
  function demon() {
    const g = bust(BLACK, { collar: RED, sash: RED }), h = g.userData.head;
    const halo = glow(BLOOD, 0.38, 1.35); g.add(halo);
    hair(h, INKC, { long: true });
    h.children[0].userData.mesh.material = mat(PALE); // teint pâle
    h.add(eyes(0.54, BLOOD, { angry: 0.45, slant: 0.28 }), mouth(0.54, -0.33, 0.1, 0x5A060C));
    const horns = [[-0.3, 0.55, -0.2, 0.5], [0.3, 0.55, -0.2, -0.5], [0, 0.66, -0.1, 0]].map(([x, y, z, r]) => part(G.cone(0.07, 0.42, 12), RED, { ink: 0.015, pos: [x, y, z], rot: [-0.2, 0, r] }));
    horns.forEach(c => h.add(c));
    g.add(part(G.torus(0.62, 0.035, Math.PI), gold, { ink: 0.01, pos: [0, -0.86, 0.3], rot: [0.6, 0, Math.PI] }));
    g.scale.setScalar(1.1); g.position.y = 0.02;
    g.userData.anim = { idle(t) { halo.scale.setScalar(1 + Math.sin(t * TAU * 2) * 0.08); halo.children[0].material.opacity = 0.3 + Math.sin(t * TAU) * 0.1; }, win(t) { halo.scale.setScalar(1.1 + Math.sin(t * TAU * 2) * 0.2); } };
    return g;
  }
  // ---------- le Maître Céleste : robe blanc et or, cheveux blancs, épingle de jade, auréole d'or ----------
  function celeste() {
    const g = bust(0xFFFBF2, { collar: 0xD8A845, sash: 0xD8A845 }), h = g.userData.head;
    const ring = part(G.torus(0.95, 0.045), gold, { ink: 0.01, pos: [0, 0.2, -0.5] }); g.add(ring);
    const halo = glow(0xF7D98A, 0.35, 1.25); g.add(halo);
    hair(h, 0xF2ECDF, { long: true, bun: true, pin: jade });
    h.add(eyes(0.54, INKC, { angry: -0.05, slant: 0.05, brow: 0.15 }), mouth(0.54, -0.3, 0.1));
    h.add(part(G.sphere(0.03), RED, { ink: 0, pos: [0, 0.2, 0.52] })); // marque rouge sur le front
    g.scale.setScalar(1.1); g.position.y = 0.02;
    g.userData.anim = { idle(t) { ring.rotation.z = t * TAU; halo.scale.setScalar(1 + Math.sin(t * TAU) * 0.06); }, win(t) { ring.rotation.z = t * TAU * 2; ring.scale.setScalar(1 + Math.sin(t * TAU * 2) * 0.1); } };
    return g;
  }
  // ---------- le manuel interdit (scatter) : couverture noire et rouge, étiquette jaune, chaînes, lueur de sang ----------
  function manual() {
    const g = new THREE.Group();
    const halo = glow(BLOOD, 0.4, 1.45, -0.5); g.add(halo);
    const book = new THREE.Group(); book.rotation.set(0.25, -0.35, 0.08); g.add(book);
    book.add(part(G.box(1.35, 1.75, 0.34, 0.05), PAPER, { ink: 0.02, pos: [0.04, 0, 0] })); // pages
    const back = part(G.box(1.45, 1.85, 0.08, 0.04), 0x3A0408, { ink: 0.025, pos: [0, 0, -0.2] }); book.add(back);
    const cover = new THREE.Group(); cover.position.set(-0.72, 0, 0.2); book.add(cover); // la couverture pivote sur la reliure
    cover.add(part(G.box(1.45, 1.85, 0.08, 0.04), 0x16141A, { ink: 0.025, pos: [0.72, 0, 0] }));
    cover.add(part(G.box(0.42, 1.0, 0.03, 0.02), 0xF2D060, { ink: 0.012, pos: [0.42, 0.1, 0.05] })); // étiquette 禁
    for (let i = 0; i < 3; i++) cover.add(part(G.box(0.26, 0.05, 0.02, 0.01), RED, { ink: 0, pos: [0.42, 0.35 - i * 0.24, 0.07] }));
    for (let i = 0; i < 3; i++) cover.add(part(G.box(0.36, 0.04, 0.02, 0.01), BLOOD, { ink: 0, pos: [1.0, 0.4 - i * 0.3, 0.06] }));
    book.add(part(G.box(0.16, 1.85, 0.46, 0.05), RED, { ink: 0.02, pos: [-0.72, 0, 0] })); // reliure rouge
    // chaînes croisées
    const links = [];
    for (const [a, y] of [[0.35, 0.25], [-0.35, -0.3]]) for (let i = -4; i <= 4; i++) { const l = part(G.torus(0.09, 0.025), steel, { ink: 0.008, pos: [i * 0.17, y + i * 0.17 * Math.tan(a), 0.3], rot: [0, i % 2 ? Math.PI / 2 : 0, a] }); book.add(l); links.push(l); }
    book.add(part(G.cyl(0.16, 0.16, 0.12, 20), gold, { ink: 0.015, pos: [0, 0, 0.34], rot: [Math.PI / 2, 0, 0] })); // cadenas
    g.scale.setScalar(1.05);
    g.userData.anim = {
      idle(t) { halo.scale.setScalar(1 + Math.sin(t * TAU * 2) * 0.07); cover.rotation.y = -Math.max(0, Math.sin(t * TAU)) * 0.12; },
      win(t) { cover.rotation.y = -Math.max(0, Math.sin(t * TAU)) * 0.9; halo.scale.setScalar(1.15 + Math.sin(t * TAU * 2) * 0.15); },
    };
    return g;
  }
  // ---------- le Heavenly Demon (vedette de la Promenade) : cheveux noirs, robe noire liserée de rouge et d'or, deux doigts levés ----------
  function heavenlyDemon() {
    const g = bust(BLACK, { collar: RED, sash: 0x16141A }), h = g.userData.head;
    hair(h, INKC, { long: true });
    h.children[0].userData.mesh.material = mat(PALE);
    h.add(eyes(0.54, BLOOD, { angry: 0.15, slant: 0.22 }), mouth(0.54, -0.33, 0.09));
    h.add(part(G.sphere(0.028), RED, { ink: 0, pos: [0, 0.22, 0.52] }));
    g.add(part(G.torus(0.6, 0.03, Math.PI), gold, { ink: 0.01, pos: [0, -0.9, 0.32], rot: [0.6, 0, Math.PI] }));
    // la main : deux doigts dressés
    const hand = new THREE.Group(); hand.position.set(0.72, -0.25, 0.45);
    hand.add(part(G.capsule(0.13, 0.5), BLACK, { ink: 0.02, pos: [-0.05, -0.36, -0.1], rot: [0, 0, 0.2] }));
    hand.add(part(G.box(0.24, 0.26, 0.14, 0.05), PALE, { ink: 0.015 }));
    for (const x of [-0.05, 0.05]) hand.add(part(G.capsule(0.035, 0.28), PALE, { ink: 0.01, pos: [x, 0.3, 0] }));
    hand.add(part(G.capsule(0.035, 0.12), PALE, { ink: 0.01, pos: [0.12, 0.08, 0.05], rot: [0, 0, -0.9] }));
    g.add(hand);
    const qi = glow(BLOOD, 0.25, 1.4); g.add(qi);
    g.scale.setScalar(1.1); g.position.y = 0.02;
    g.userData.anim = { idle(t) { qi.scale.setScalar(1 + Math.sin(t * TAU) * 0.08); }, win(t) { hand.position.y = -0.25 + Math.max(0, Math.sin(t * TAU)) * 0.2; qi.scale.setScalar(1.2 + Math.sin(t * TAU * 2) * 0.2); } };
    return g;
  }
  return {
    SYMS: [null, null, null, null, null, epeiste, paume, assassin, demon, celeste],
    SCAT: manual,
    shroom: heavenlyDemon, // le personnage vedette (utilisé par la Promenade et le décor)
  };
};
