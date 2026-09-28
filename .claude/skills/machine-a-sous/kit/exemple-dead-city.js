// ---------- ART3D : les personnages de Dead City (construits avec KIT3D) ----------
const ART3D_MODELS = K => {
  const { THREE, part, G, face, mat, TAU } = K;
  K.INK.color = 0x1A0F14;
  const grp = (...c) => { const g = new THREE.Group(); g.add(...c.flat()); return g; };
  const SKIN = 0xF2B98E;

  function can() {
    const body = part(G.cyl(0.62, 0.62, 1.5, 40), 0xC8C0C8);
    const label = part(G.cyl(0.635, 0.635, 0.75, 40), 0xE0331E, { ink: 0 });
    const stripe = part(G.cyl(0.64, 0.64, 0.12, 40), 0xFFC21A, { ink: 0, pos: [0, -0.22, 0] });
    const lid = part(G.torus(0.58, 0.07), 0xE8E2EA, { ink: 0.02, pos: [0, 0.75, 0], rot: [Math.PI / 2, 0, 0] });
    const f = face(0.64, 'smile', { size: 0.1, spread: 0.2, y: 0.08 });
    const g = grp(body, label, stripe, lid, f); g.scale.setScalar(1.12);
    return g;
  }
  function bat() {
    const wood = part(G.lathe([[0, -1.25], [0.13, -1.2], [0.12, -0.3], [0.2, 0.2], [0.3, 0.8], [0.3, 1.1], [0, 1.25]]), 0xD8A060);
    const grip = part(G.cyl(0.15, 0.15, 0.5, 16), 0x2A2A2A, { pos: [0, -0.95, 0] });
    const nails = [[0.3, 0.9, 0.4], [-0.3, 0.6, -0.5], [0.28, 0.45, 2.5]].map(([x, y, a]) => part(G.cyl(0.025, 0.025, 0.3, 6), 0xB8B8C0, { ink: 0.015, pos: [x * 0.9, y, 0.1], rot: [0, 0, x > 0 ? -Math.PI / 2 : Math.PI / 2] }));
    const f = face(0.3, 'brave', { size: 0.06, spread: 0.12, y: 0 }); f.position.y = 0.72;
    const g = grp(wood, grip, nails, f); g.rotation.z = -0.6; g.scale.setScalar(1.05);
    return g;
  }
  function radio() {
    const body = part(G.box(1.1, 1.6, 0.5, 0.14), 0x3A3F4A);
    const screen = part(G.box(0.8, 0.55, 0.08, 0.04), mat(0x9FE8A0, { emissive: 0x7CFF4F, glow: 0.35 }), { ink: 0.02, pos: [0, 0.35, 0.27] });
    const f = face(1, 'o', { z: 0.33, size: 0.07, spread: 0.14, y: 0.35, blush: false });
    const ant = grp(part(G.cyl(0.04, 0.04, 0.8, 8), 0x2A2A2A, { ink: 0.02, pos: [0.35, 1.15, 0] }), part(G.sphere(0.1), mat(0xE0331E, { emissive: 0xE0331E, glow: 0.6 }), { ink: 0.02, pos: [0.35, 1.58, 0] }));
    const btns = [[-0.25, -0.2], [0, -0.2], [0.25, -0.2], [-0.25, -0.45], [0, -0.45], [0.25, -0.45]].map(([x, y]) => part(G.sphere(0.07), 0x1A1A22, { ink: 0, pos: [x, y, 0.26], scale: [1, 1, 0.5] }));
    const g = grp(body, screen, f, ant, btns); g.scale.setScalar(1.05);
    g.userData.anim = { idle(t) { ant.children[1].scale.setScalar(1 + Math.max(0, Math.sin(t * TAU * 3)) * 0.4); } };
    return g;
  }
  function medkit() {
    const box = part(G.box(1.5, 1.1, 0.7, 0.16), 0xFFF6E6);
    const c1 = part(G.box(0.26, 0.7, 0.08, 0.03), 0xE0331E, { ink: 0.02, pos: [0, 0, 0.37] }), c2 = part(G.box(0.7, 0.26, 0.08, 0.03), 0xE0331E, { ink: 0.02, pos: [0, 0, 0.37] });
    const handle = part(G.torus(0.3, 0.06, Math.PI), 0x3A3F4A, { ink: 0.02, pos: [0, 0.55, 0] });
    const f = face(1, 'smile', { z: 0.43, size: 0.055, spread: 0.1, y: 0.02, blush: false });
    const g = grp(box, c1, c2, handle, f); g.scale.setScalar(1.1); return g;
  }
  // un survivant en buste : épaules, tête, puis ses accessoires
  function bust(shirt, o = {}) {
    const g = new THREE.Group();
    g.add(part(G.sphere(0.9), shirt, { scale: [1.05, 0.62, 0.72], pos: [0, -0.95, 0] }));
    g.add(part(G.cyl(0.22, 0.26, 0.3, 16), o.skin ?? SKIN, { pos: [0, -0.45, 0] }));
    const head = new THREE.Group(); head.position.y = 0.12;
    head.add(part(G.sphere(0.62), o.skin ?? SKIN), face(0.62, o.kind ?? 'brave', { size: 0.09, spread: 0.22, y: 0 }));
    g.add(head); g.userData.head = head;
    return g;
  }
  function skater() {
    const g = bust(0xFFC21A, { kind: 'smile' }), h = g.userData.head;
    h.add(part(G.sphere(0.64), 0x3AA0FF, { pos: [0, 0.1, 0], scale: [1, 0.72, 1], ink: 0.04 }));
    h.add(part(G.cyl(0.42, 0.42, 0.07, 24), 0x3AA0FF, { pos: [0, 0.22, 0.5], scale: [1, 1, 0.6] }));
    [-1, 1].forEach(s => h.add(part(G.capsule(0.1, 0.4), 0xE07A2A, { pos: [s * 0.58, -0.25, -0.1], rot: [0, 0, s * 0.2] })));
    const board = part(G.box(1.1, 0.09, 0.32, 0.05), 0xE0331E, { pos: [0.72, -1.05, 0.35], rot: [0.2, 0.3, -0.35] });
    g.add(board);
    return g;
  }
  function mechanic() {
    const g = bust(0x3A6A9A), h = g.userData.head;
    h.add(part(G.sphere(0.64), 0x5A3A22, { pos: [0, 0.18, -0.05], scale: [1, 0.6, 1] }));
    h.add(part(G.sphere(0.5), 0x6B4226, { pos: [0, -0.3, 0.2], scale: [1.1, 0.6, 0.7], ink: 0.03 }));
    const wrench = grp(part(G.box(0.14, 1.0, 0.08, 0.03), 0xB8B8C0), part(G.torus(0.14, 0.06, TAU * 0.8), 0xB8B8C0, { pos: [0, 0.58, 0], rot: [0, 0, 1.3] }));
    wrench.position.set(0.85, -0.3, 0.4); wrench.rotation.z = -0.6; g.add(wrench);
    g.userData.anim = { idle(t) { wrench.rotation.z = -0.6 + Math.sin(t * TAU * 2) * 0.15; } };
    return g;
  }
  function nurse() {
    const g = bust(0x9FE8D8, { skin: 0xE0A07A, kind: 'smile' }), h = g.userData.head;
    h.add(part(G.sphere(0.66), 0x2A1A14, { pos: [0, 0.08, -0.12], scale: [1, 0.9, 0.9] }));
    const cap = grp(part(G.box(0.8, 0.28, 0.4, 0.06), 0xFFF6E6), part(G.box(0.08, 0.2, 0.04, 0.01), 0xE0331E, { ink: 0, pos: [0, 0, 0.21] }), part(G.box(0.2, 0.08, 0.04, 0.01), 0xE0331E, { ink: 0, pos: [0, 0, 0.21] }));
    cap.position.set(0, 0.62, 0.1); h.add(cap);
    g.add(part(G.box(0.08, 0.34, 0.04, 0.01), 0xE0331E, { ink: 0, pos: [0, -0.7, 0.62] }), part(G.box(0.34, 0.08, 0.04, 0.01), 0xE0331E, { ink: 0, pos: [0, -0.7, 0.62] }));
    return g;
  }
  function sheriff() {
    const g = bust(0x8A6A3A), h = g.userData.head;
    const hat = grp(part(G.cyl(0.95, 0.95, 0.07, 32), 0xA86A2A, { scale: [1, 1, 0.8] }), part(G.cyl(0.45, 0.55, 0.45, 24), 0xC8843A, { pos: [0, 0.25, 0] }), part(G.cyl(0.555, 0.555, 0.08, 24), 0x5A3A1A, { ink: 0, pos: [0, 0.07, 0] }));
    hat.position.y = 0.5; hat.rotation.x = -0.12; h.add(hat);
    h.add(part(G.capsule(0.07, 0.32), 0x6B4226, { pos: [0, -0.22, 0.58], rot: [0, 0, Math.PI / 2], ink: 0.02 }));
    const star = part(G.extrude(G.star(0.2, 0.09), 0.06, 0.03), mat(0xFFC21A, { emissive: 0xFFB020, glow: 0.3 }), { ink: 0.02, pos: [-0.35, -0.72, 0.62], rot: [-0.3, 0, 0] });
    g.add(star);
    g.userData.anim = { idle(t) { star.rotation.y = Math.sin(t * TAU) * 0.4; } };
    return g;
  }
  // le zombie joker (et le patient zéro, plus pâle, qui luit)
  function zombie(zero = false) {
    const g = new THREE.Group();
    g.add(part(G.sphere(0.9), zero ? 0xE6E0D8 : 0x6A5A8A, { scale: [1.05, 0.62, 0.72], pos: [0, -0.95, 0] }));
    const arms = [-1, 1].map(s => part(G.capsule(0.14, 0.9), 0x7CD84A, { pos: [s * 0.55, -0.55, 0.55], rot: [Math.PI / 2 - 0.2, 0, s * 0.1] }));
    const head = new THREE.Group(); head.position.y = 0.12;
    head.add(part(G.lumpy(0.64, 0.08, zero ? 9 : 4, 4), zero ? mat(0xB6FF7A, { emissive: 0x7CFF4F, glow: 0.35 }) : 0x7CD84A));
    const eyeL = part(G.sphere(0.2), 0xFFF6C8, { pos: [-0.22, 0.08, 0.5] }), eyeR = part(G.sphere(0.14), 0xFFF6C8, { pos: [0.24, 0.05, 0.52] });
    const pupils = grp(part(G.sphere(0.08), 0x1A0F14, { ink: 0, pos: [-0.2, 0.06, 0.68] }), part(G.sphere(0.06), 0x1A0F14, { ink: 0, pos: [0.25, 0.03, 0.65] }));
    pupils.name = 'eyes';
    const mouth = part(G.torus(0.2, 0.06, Math.PI), 0x1A0F14, { ink: 0, pos: [0, -0.28, 0.55], rot: [0, 0, Math.PI] });
    const tongue = part(G.capsule(0.06, 0.12), 0xE0507A, { ink: 0.015, pos: [0.08, -0.42, 0.56] });
    const hair = [[-0.3, 0.55], [0, 0.62], [0.28, 0.55]].map(([x, y], i) => part(G.cone(0.08, 0.3, 6), 0x3F2A1A, { ink: 0.02, pos: [x, y, 0.1], rot: [0, 0, (i - 1) * 0.5] }));
    const stitch = part(G.box(0.3, 0.04, 0.03, 0.01), 0x1A0F14, { ink: 0, pos: [0.42, 0.32, 0.35], rot: [0, 0.6, 0.3] });
    head.add(eyeL, eyeR, pupils, mouth, tongue, ...hair, stitch);
    g.add(head, ...arms);
    if (zero) g.add(part(G.torus(0.95, 0.05), mat(0xB6FF3A, { emissive: 0x7CFF4F, glow: 1 }), { ink: 0, pos: [0, 0.1, -0.2] }));
    g.userData.head = head;
    g.userData.anim = { idle(t) { head.rotation.z = Math.sin(t * TAU) * 0.18; arms.forEach((a, i) => a.rotation.x = Math.PI / 2 - 0.2 + Math.sin(t * TAU * 2 + i * 2) * 0.15); } };
    return g;
  }
  // la sirène : dôme rouge qui luit, faisceaux qui tournent
  function siren() {
    const base = part(G.cyl(0.8, 0.9, 0.35, 32), 0x3A3F4A, { pos: [0, -0.75, 0] });
    const dome = part(G.lathe([[0, -0.58], [0.66, -0.58], [0.66, 0.1], [0.5, 0.55], [0.2, 0.75], [0, 0.78]]), mat(0xE0331E, { emissive: 0xFF3A1F, glow: 0.45 }));
    const beams = new THREE.Group();
    [0, Math.PI].forEach(a => { const c = part(G.cone(0.45, 1.6, 20), mat(0xFF7A5A, { opacity: 0.35, emissive: 0xFF5A3A, glow: 1 }), { ink: 0 }); c.rotation.z = Math.PI / 2; c.position.x = 0.9; const p = new THREE.Group(); p.add(c); p.rotation.y = a; beams.add(p); });
    beams.position.y = 0.05;
    const f = face(0.66, 'o', { size: 0.08, spread: 0.18, y: -0.18, blush: false });
    const g = grp(base, beams, dome, f);
    g.userData.anim = { idle(t) { beams.rotation.y = t * TAU; }, win(t) { beams.rotation.y = t * TAU * 2; } };
    return g;
  }
  return {
    SYMS: [can, bat, radio, medkit, skater, mechanic, nurse, sheriff],
    SCAT: siren,
    VARIANTES: { wild: { wild: () => zombie(false), zero: () => zombie(true) } },
    zombie, // réutilisé par le décor
  };
};
