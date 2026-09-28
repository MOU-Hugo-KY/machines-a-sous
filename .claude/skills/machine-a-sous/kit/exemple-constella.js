// ---------- ART3D : les modèles 3D de Constella (construits avec KIT3D) ----------
const ART3D_MODELS = K => {
  const { THREE, part, G, face, mat, TAU } = K;
  const grp = (...c) => { const g = new THREE.Group(); g.add(...c); return g; };
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

  function moon() {
    // croissant extrudé : arc extérieur, puis arc intérieur décalé
    const s = new THREE.Shape();
    s.absarc(0, 0, 1.15, Math.PI * 0.32, Math.PI * 1.68, false);
    s.absarc(0.55, 0, 0.9, Math.PI * 1.45, Math.PI * 0.55, true);
    const body = part(G.extrude(s, 0.5, 0.16), 0xFFE9A0);
    const cap = part(G.cone(0.28, 0.7), 0x6B7BD8, { pos: [0.45, 1.05, 0], rot: [0, 0, -0.9] });
    const pom = part(G.sphere(0.14), 0xffffff, { pos: [0.78, 1.28, 0] });
    const f = face(1, 'sleep', { z: 0.42, size: 0.13, spread: 0.2, y: 0.05 }); f.position.x = -0.6;
    const craters = [[-0.75, 0.55, 0.08], [-0.5, -0.7, 0.06]].map(([x, y, r]) => part(G.sphere(r), 0xE9D48A, { ink: 0, pos: [x, y, 0.4], scale: [1, 1, 0.3] }));
    const g = grp(body, cap, pom, f, ...craters); g.rotation.z = -0.15;
    return g;
  }
  function asteroid() {
    const body = part(G.lumpy(1.05, 0.1, 2), 0xAFA6DA);
    const cr = [[-0.45, 0.5, 0.2], [0.55, -0.45, 0.16], [0.6, 0.45, 0.1]].map(([x, y, r]) => { const p = new THREE.Vector3(x, y, 0).setZ(Math.sqrt(1 - x * x - y * y) * 0.98); return part(G.sphere(r), 0x8C84B8, { ink: 0.02, pos: [p.x, p.y, p.z], scale: [1, 1, 0.35] }); });
    cr.forEach(c => c.lookAt(c.position.clone().multiplyScalar(2)));
    return grp(body, ...cr, face(1.05, 'smile', { y: -0.05 }));
  }
  function comet() {
    // queue : cônes translucides dont la base touche la tête et la pointe file en haut à gauche (sans contour : il se verrait à travers)
    const tail = new THREE.Group(), dir = new THREE.Vector2(-0.707, 0.707);
    [[0.72, 2.3, 0x8FD3FF, 0.7], [0.45, 1.7, 0xffffff, 0.6]].forEach(([r, h, c, op]) => {
      tail.add(part(G.cone(r, h), mat(c, { opacity: op }), { ink: 0, pos: [0.35 + dir.x * h / 2, -0.35 + dir.y * h / 2, -0.25], rot: [0, 0, Math.PI / 4] }));
    });
    const head = part(G.sphere(0.72), 0xBDEBFF, { pos: [0.35, -0.35, 0.2] });
    const f = face(0.72, 'happy', {}); f.position.set(0.35, -0.35, 0.2);
    const g = grp(tail, head, f); g.userData.anim = { idle(t) { tail.scale.y = 1 + Math.sin(t * TAU * 2) * 0.06; } };
    return g;
  }
  function ringed() {
    const planet = part(G.sphere(0.82), 0xFFB1D0);
    const bands = [0.25, -0.3].map(y => part(G.torus(Math.sqrt(0.82 ** 2 - y * y) + 0.005, 0.045), 0xF58FB8, { ink: 0, pos: [0, y, 0], rot: [Math.PI / 2, 0, 0] }));
    const ring = part(G.torus(1.3, 0.1), 0xFFD66B, { rot: [Math.PI / 2 - 0.35, 0.25, 0], scale: [1, 1, 0.5] });
    return grp(planet, ...bands, ring, face(0.82, 'smile', {}));
  }
  function cat() {
    const head = part(G.sphere(0.72), 0xffffff, { pos: [0, -0.1, 0] });
    const ears = [-1, 1].map(s => grp(part(G.cone(0.24, 0.45), 0xffffff, { pos: [s * 0.45, 0.5, 0], rot: [0, 0, -s * 0.35] }), part(G.cone(0.12, 0.25), 0xFF9EC7, { ink: 0, pos: [s * 0.44, 0.48, 0.1], rot: [0, 0, -s * 0.35] })));
    const f = face(0.72, 'smile', {}); f.position.y = -0.1;
    const whisk = [-1, 1].flatMap(s => [0.02, -0.1].map(y => part(G.cyl(0.012, 0.012, 0.5, 6), K.INK.color, { ink: 0, pos: [s * 0.62, -0.28 + y, 0.5], rot: [0, 0, Math.PI / 2 + s * y * 1.5] })));
    const glass = grp(part(G.sphere(1.12), mat(0xCFE3FF, { opacity: 0.22 }), { ink: 0 }), part(G.torus(0.8, 0.05, 1.2), 0xffffff, { ink: 0, pos: [0, 0, 0.72], rot: [0, 0, 1.9] }));
    const collar = part(G.torus(0.78, 0.13), 0x9AA6E8, { pos: [0, -0.92, 0], rot: [Math.PI / 2, 0, 0] });
    const antenna = grp(part(G.cyl(0.03, 0.03, 0.4), 0xE0A94A, { ink: 0.02, pos: [0.55, 1.15, 0] }), part(G.sphere(0.1), 0xFF9EC7, { emissive: 0xFF9EC7, pos: [0.55, 1.38, 0] }));
    return grp(head, ...ears, f, ...whisk, collar, antenna, glass);
  }
  function rocket() {
    const body = part(G.lathe([[0, -0.9], [0.42, -0.85], [0.55, -0.3], [0.52, 0.3], [0.36, 0.8], [0, 1.15]]), 0xF6F3FF);
    const nose = part(G.lathe([[0, 0.72], [0.38, 0.76], [0.2, 1.02], [0, 1.16]]), 0xFF7AA8, { ink: 0 });
    const win = part(G.torus(0.26, 0.07), 0xE0A94A, { pos: [0, 0.2, 0.52] });
    const glass = part(G.sphere(0.24), 0x9FE8FF, { ink: 0, pos: [0, 0.2, 0.46], scale: [1, 1, 0.4] });
    const f = face(0.5, 'happy', { size: 0.06, spread: 0.1, y: 0.02, z: 0.02, blush: false }); f.position.set(0, 0.2, 0.52);
    const fins = [0, 1, 2].map(i => { const a = i * TAU / 3 + Math.PI / 2; const fin = part(G.box(0.08, 0.6, 0.45, 0.03), 0x6B7BD8, { pos: [Math.cos(a) * 0.5, -0.65, Math.sin(a) * 0.5] }); fin.rotation.y = -a; return fin; });
    const flame = grp(part(G.cone(0.3, 0.8), mat(0xFF8A4C, { emissive: 0xFF8A4C, glow: 0.9 }), { ink: 0, pos: [0, -1.25, 0], rot: [Math.PI, 0, 0] }), part(G.cone(0.16, 0.5), mat(0xFFE27A, { emissive: 0xFFE27A, glow: 1 }), { ink: 0, pos: [0, -1.13, 0.02], rot: [Math.PI, 0, 0] }));
    const g = grp(body, nose, win, glass, f, ...fins, flame); g.rotation.z = -0.35; g.scale.setScalar(0.82); g.position.y = 0.12;
    g.userData.anim = { idle(t) { flame.scale.set(1, 1 + Math.sin(t * TAU * 4) * 0.2, 1); }, win(t) { flame.scale.set(1.2, 1.6 + Math.sin(t * TAU * 6) * 0.3, 1.2); } };
    return g;
  }
  function sun() {
    const core = part(G.sphere(0.72), 0xFFD35A);
    const rays = new THREE.Group();
    for (let i = 0; i < 10; i++) { const a = i * TAU / 10; rays.add(part(G.cone(0.17, 0.42), i % 2 ? 0xFFB13A : 0xFFE27A, { pos: [Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0], rot: [0, 0, a - Math.PI / 2] })); }
    const glasses = grp(...[-1, 1].map(s => part(G.torus(0.17, 0.04), 0x2B2350, { ink: 0, pos: [s * 0.25, 0.12, 0.68] })), part(G.cyl(0.03, 0.03, 0.18, 8), 0x2B2350, { ink: 0, pos: [0, 0.14, 0.7], rot: [0, 0, Math.PI / 2] }));
    const g = grp(rays, core, face(0.72, 'smile', { y: 0.05 }), glasses);
    g.userData.anim = { idle(t) { rays.rotation.z = -t * TAU / 10; }, win(t) { rays.rotation.z = -t * TAU / 5; } };
    return g;
  }
  function owl() {
    const body = part(G.sphere(0.85), 0x8C7BD8, { scale: [1, 1.1, 0.95], pos: [0, -0.2, 0] });
    const belly = part(G.sphere(0.6), 0xE6DAFF, { ink: 0.02, scale: [1, 1.05, 0.6], pos: [0, -0.4, 0.45] });
    const eyes = new THREE.Group(); eyes.name = 'eyes';
    [-1, 1].forEach(s => { eyes.add(part(G.sphere(0.3), 0xffffff, { pos: [s * 0.3, 0.12, 0.62], scale: [1, 1, 0.45] }), part(G.sphere(0.14), K.INK.color, { ink: 0, pos: [s * 0.28, 0.1, 0.76], scale: [1, 1, 0.5] }), part(G.sphere(0.05), 0xffffff, { ink: 0, pos: [s * 0.24, 0.16, 0.82] })); });
    const beak = part(G.cone(0.1, 0.25), 0xFFC43A, { pos: [0, -0.1, 0.8], rot: [Math.PI / 2 + 0.3, 0, 0] });
    const hat = grp(part(G.cone(0.55, 1.0), 0x3B3C9A, { pos: [0, 0.95, 0], rot: [0, 0, 0.18] }), part(G.cyl(0.8, 0.8, 0.08), 0x3B3C9A, { pos: [0, 0.5, 0] }), part(G.extrude(G.star(0.16, 0.07), 0.04, 0.02), 0xFFE27A, { ink: 0.015, pos: [0.02, 0.95, 0.46], rot: [-0.45, 0, 0.18] }));
    const wings = [-1, 1].map(s => part(G.sphere(0.35), 0x6B5BC0, { scale: [0.5, 1, 0.8], pos: [s * 0.8, -0.3, 0.05], rot: [0, 0, s * 0.25] }));
    const g = grp(body, belly, ...wings, eyes, beak, hat, part(G.sphere(0.08), 0xFF9EC7, { ink: 0, pos: [-0.55, -0.15, 0.6], scale: [1.3, .7, .4], opacity: .8 }), part(G.sphere(0.08), 0xFF9EC7, { ink: 0, pos: [0.55, -0.15, 0.6], scale: [1.3, .7, .4], opacity: .8 }));
    g.scale.setScalar(0.92);
    g.userData.anim = { idle(t) { wings.forEach((w, i) => w.rotation.z = (i ? 1 : -1) * (0.25 + Math.max(0, Math.sin(t * TAU * 2)) * 0.2)); } };
    return g;
  }
  function telescope() {
    const tube = grp(part(G.cyl(0.3, 0.38, 1.7), 0xE0A94A), part(G.torus(0.34, 0.07), 0x6B7BD8, { pos: [0, 0.3, 0], rot: [Math.PI / 2, 0, 0] }), part(G.cyl(0.42, 0.42, 0.22), 0x6B7BD8, { pos: [0, 0.9, 0] }), part(G.cyl(0.36, 0.36, 0.05), mat(0x9FE8FF, { emissive: 0x9FE8FF, glow: .7 }), { ink: 0, pos: [0, 1.02, 0] }), part(G.cyl(0.1, 0.1, 0.35), 0x2B2350, { pos: [0, -1, 0] }));
    tube.rotation.z = -0.8; tube.position.set(0.1, 0.35, 0);
    const legs = [0, 1, 2].map(i => { const a = i * TAU / 3 + 0.4; const l = part(G.cyl(0.05, 0.05, 1.3, 12), 0x8E6A3A, { pos: [Math.cos(a) * 0.35, -0.55, Math.sin(a) * 0.35] }); l.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); return l; });
    const star = part(G.extrude(G.star(0.3, 0.13), 0.1, 0.05), mat(0xFFE27A, { emissive: 0xFFE27A, glow: 0.5 }), { pos: [0.95, 1.05, 0.1] });
    const g = grp(...legs, tube, star);
    g.userData.anim = { idle(t) { star.rotation.y = t * TAU; star.scale.setScalar(1 + Math.sin(t * TAU * 2) * 0.1); }, win(t) { star.rotation.y = t * TAU * 2; } };
    return g;
  }
  function starCell(kind) {
    const col = { star: 0xFFF3B0, lit: 0xC9F4FF, gold: 0xFFC43A }[kind];
    const s = part(G.extrude(G.star(1.05, 0.5), 0.35, 0.14), mat(col, kind === 'star' ? {} : { emissive: col, glow: kind === 'gold' ? 0.35 : 0.5 }));
    const f = face(1, kind === 'lit' ? 'happy' : 'smile', { z: 0.33, size: 0.11, spread: 0.2, y: 0.05 });
    return grp(s, f);
  }
  return { SYMS: [moon, asteroid, comet, ringed, cat, rocket, sun, owl], SCAT: telescope, VARIANTES: { star: { star: () => starCell('star'), lit: () => starCell('lit'), gold: () => starCell('gold') } } };
};
