// ---------- KIT 3D : personnages en 3D façon dessin animé (Three.js), cuits en planches animées ----------
// À coller tel quel dans la machine, juste avant ART3D. Aucune dépendance autre que THREE (passé en paramètre).
// Voir .claude/skills/machine-a-sous/references/3d.md
// HTML d'un symbole cuit : la planche défile en arrière-plan (background-position), sans calque graphique par case,
// ce qui reste léger même avec 144 cases ; le CSS choisit la planche (.cell.win -> victoire)
const S3D_HTML = (b, cls = '') => `<i class="s3d ${cls}" style="--n:${b.frames}; --idle:url(${b.idle}); --win:url(${b.win})"><b></b></i>`;
const KIT3D = THREE => {
  const TAU = Math.PI * 2;
  // dégradé en 4 paliers : l'ombrage « cel » des dessins animés
  const grad = (() => { const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 4, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
  const INK = { color: 0x2B2350 };
  const cache = new Map();

  // matériau toon ; opts : { emissive, glow, opacity }
  function mat(color, o = {}) {
    const key = color + JSON.stringify(o);
    if (cache.has(key)) return cache.get(key);
    const m = new THREE.MeshToonMaterial({ color, gradientMap: grad, transparent: o.opacity != null && o.opacity < 1, opacity: o.opacity ?? 1 });
    if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.glow ?? 0.6; }
    cache.set(key, m); return m;
  }
  // contour noir par « coque inversée » : la face arrière, gonflée le long des normales
  function inkMat(w) {
    const key = 'ink' + w;
    if (cache.has(key)) return cache.get(key);
    const m = new THREE.MeshBasicMaterial({ color: INK.color, side: THREE.BackSide });
    m.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normal * ${w.toFixed(4)};`); };
    cache.set(key, m); return m;
  }
  // une pièce : géométrie + couleur, avec contour (o.ink = épaisseur, 0 pour aucun)
  function part(geo, color, o = {}) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(geo, color instanceof THREE.Material ? color : mat(color, o));
    g.add(m);
    const w = o.ink ?? 0.05;
    if (w > 0) { const e = new THREE.Mesh(geo, inkMat(w)); e.renderOrder = -1; g.add(e); }
    if (o.pos) g.position.set(...o.pos);
    if (o.rot) g.rotation.set(...o.rot);
    if (o.scale) typeof o.scale === 'number' ? g.scale.setScalar(o.scale) : g.scale.set(...o.scale);
    g.userData.mesh = m;
    return g;
  }
  // raccourcis de géométries (segments assez nombreux pour que le contour reste lisse)
  const G = {
    sphere: (r = 1) => new THREE.SphereGeometry(r, 40, 28),
    box: (w, h, d, r = 0.12) => roundedBox(w, h, d, r),
    cyl: (rt, rb, h, s = 32) => new THREE.CylinderGeometry(rt, rb, h, s),
    cone: (r, h, s = 32) => new THREE.ConeGeometry(r, h, s),
    torus: (R, r, arc = TAU) => new THREE.TorusGeometry(R, r, 20, 64, arc),
    capsule: (r, len) => new THREE.CapsuleGeometry(r, len, 12, 24),
    lathe: (pts, s = 48) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s),
    // extrusion d'une forme 2D (étoile, cœur, lune…) avec bords arrondis
    extrude: (shape, depth = 0.3, bevel = 0.08) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 32 }); g.center(); g.computeVertexNormals(); return g; },
    star: (R = 1, r = 0.45, n = 5) => { const s = new THREE.Shape(); for (let i = 0; i < n * 2; i++) { const a = Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R; i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } return s; },
    // bosselle une sphère (rochers, nuages, buissons) ; graine fixe pour garder la même forme
    lumpy: (r = 1, amp = 0.12, seed = 1, detail = 5) => { const g = new THREE.IcosahedronGeometry(r, detail), p = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * 3.1 + seed) * Math.sin(v.y * 2.7 + seed * 2) * Math.sin(v.z * 3.3 + seed * 3); v.multiplyScalar(1 + n * amp); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; },
  };
  function roundedBox(w, h, d, r) {
    const s = new THREE.Shape(), x = w / 2 - r, y = h / 2 - r;
    s.moveTo(-x, -h / 2); s.lineTo(x, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -y); s.lineTo(w / 2, y); s.quadraticCurveTo(w / 2, h / 2, x, h / 2);
    s.lineTo(-x, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, y); s.lineTo(-w / 2, -y); s.quadraticCurveTo(-w / 2, -h / 2, -x, -h / 2);
    return G.extrude(s, Math.max(0.01, d - 2 * r), r);
  }
  // visage posé à la surface d'une tête de rayon R (centre 0,0,0), regard vers +z
  // kind : 'smile' | 'happy' | 'sleep' | 'o' ; o : { y, spread, size, blush, z }
  function face(R, kind = 'smile', o = {}) {
    const f = new THREE.Group(), s = o.size ?? R * 0.16, y = o.y ?? R * 0.1, sp = o.spread ?? R * 0.36;
    const onSurf = (x, yy, lift = 0) => { const z = (o.z != null ? o.z : Math.sqrt(Math.max(0, R * R - x * x - yy * yy))) + lift; return [x, yy, z]; }; // o.z : visage posé sur une face plate
    const out = p => o.z != null ? new THREE.Vector3(p[0], p[1], p[2] + 1) : new THREE.Vector3(p[0] * 2, p[1] * 2, p[2] * 2);
    const eyes = new THREE.Group(); eyes.name = 'eyes';
    for (const sx of [-1, 1]) {
      const p = onSurf(sx * sp, y, -s * 0.25);
      if (kind === 'happy' || kind === 'sleep') {
        const arc = part(G.torus(s * 0.9, s * 0.22, Math.PI), INK.color, { ink: 0, pos: p });
        arc.lookAt(out(p)); // l'arc (∩) regarde vers l'extérieur
        if (kind === 'sleep') arc.rotateZ(Math.PI); // paupières closes (∪)
        eyes.add(arc);
      } else {
        const e = part(new THREE.SphereGeometry(s, 24, 16), INK.color, { ink: 0, pos: p, scale: [1, 1.18, 0.6] });
        const hi = part(new THREE.SphereGeometry(s * 0.34, 12, 8), 0xffffff, { ink: 0, pos: [p[0] + s * 0.35, p[1] + s * 0.4, p[2] + s * 0.45] });
        hi.children[0].material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        eyes.add(e, hi);
      }
    }
    f.add(eyes);
    if (o.blush !== false) for (const sx of [-1, 1]) {
      const p = onSurf(sx * sp * 1.45, y - s * 1.5, -s * 0.2);
      const b = part(new THREE.SphereGeometry(s * 0.9, 20, 12), 0xFF9EC7, { ink: 0, pos: p, scale: [1.3, 0.7, 0.35], opacity: 0.8 });
      b.lookAt(out(p)); f.add(b);
    }
    const mp = onSurf(0, y - s * 2.1, -s * 0.2);
    let mouth;
    if (kind === 'o') mouth = part(new THREE.SphereGeometry(s * 0.55, 16, 12), INK.color, { ink: 0, pos: mp, scale: [0.9, 1.1, 0.5] });
    else { mouth = part(G.torus(s * 0.75, s * 0.18, Math.PI), INK.color, { ink: 0, pos: mp }); mouth.lookAt(out(mp)); mouth.rotateZ(Math.PI); }
    f.add(mouth);
    return f;
  }

  // ---------- studio : lumières et caméra communes aux planches et à la scène en direct ----------
  function studio(opt = {}) {
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(opt.sky ?? 0xffffff, opt.ground ?? 0x8a7fd0, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-2.5, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(opt.rim ?? 0x9fe8ff, 2.4); rim.position.set(3, 2, -4); scene.add(rim);
    const cam = new THREE.PerspectiveCamera(opt.fov ?? 26, opt.aspect ?? 1, 0.1, 100); cam.position.set(0, 0.35, opt.dist ?? 7.8); cam.lookAt(0, 0, 0);
    return { scene, cam, key, rim };
  }
  const renderer = (w, h, canvas) => {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !canvas });
    r.setPixelRatio(1); r.setSize(w, h, false); r.setClearColor(0x000000, 0); r.outputColorSpace = THREE.SRGBColorSpace;
    return r;
  };

  // ---------- animations en boucle (t de 0 à 1, la fin rejoint le début) ----------
  // Chaque modèle peut avoir userData.anim = { idle(t, obj), win(t, obj) } pour remplacer ou compléter celles-ci.
  const ease = { inOut: x => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2, out: x => 1 - (1 - x) ** 3 };
  const ANIM = {
    idle(t, o) { // respiration, léger balancement, clignement vers 80 %
      const s = Math.sin(t * TAU);
      o.position.y = s * 0.06; o.rotation.y = Math.sin(t * TAU + 1) * 0.22; o.rotation.z = Math.sin(t * TAU) * 0.04;
      o.scale.set(1 + s * 0.02, 1 - s * 0.02, 1 + s * 0.02);
      blink(o, t > 0.78 && t < 0.84);
    },
    win(t, o) { // accroupi, saut joyeux avec un petit dandinement, réception écrasée ; le personnage reste de face
      let y = 0, sy = 1, ry = 0;
      if (t < 0.18) { sy = 1 - 0.18 * ease.out(t / 0.18); }
      else if (t < 0.7) { const k = (t - 0.18) / 0.52; y = Math.sin(k * Math.PI) * 0.36; sy = 1 + 0.1 * Math.sin(k * Math.PI); ry = Math.sin(k * TAU) * 0.3; }
      else { const k = (t - 0.7) / 0.3; sy = 1 - 0.15 * Math.sin(k * Math.PI) * (1 - k); }
      o.position.y = y - 0.12; o.rotation.set(0, ry, 0); const sc = 0.9; o.scale.set(sc * (1 + (1 - sy) * 0.6), sc * sy, sc * (1 + (1 - sy) * 0.6)); // un peu plus petit pour que le saut tienne dans la case
      blink(o, false);
    },
  };
  function blink(o, closed) { o.traverse(c => { if (c.name === 'eyes') c.scale.y = closed ? 0.12 : 1; }); }

  // ---------- cuisson : un modèle -> deux planches d'images (repos, victoire) en URL blob ----------
  // opts : { size: 192, frames: 24, dist, fov, sky, ground, rim }
  let bakeR = null;
  async function bake(model, o = {}) {
    const size = o.size ?? 192, N = o.frames ?? 24;
    if (!bakeR) bakeR = renderer(size, size);
    bakeR.setSize(size, size, false);
    const st = studio(o), pivot = new THREE.Group(); pivot.add(model); st.scene.add(pivot);
    const sheet = document.createElement('canvas'); sheet.width = size * N; sheet.height = size;
    const cx = sheet.getContext('2d'), out = {};
    for (const name of ['idle', 'win']) {
      cx.clearRect(0, 0, sheet.width, size);
      for (let i = 0; i < N; i++) {
        const t = i / N;
        ANIM[name](t, pivot);
        if (model.userData.anim?.[name]) model.userData.anim[name](t, model);
        bakeR.render(st.scene, st.cam);
        cx.drawImage(bakeR.domElement, i * size, 0);
      }
      out[name] = URL.createObjectURL(await new Promise(r => sheet.toBlob(r, 'image/png')));
    }
    ANIM.idle(0, pivot);
    return { ...out, frames: N, model };
  }
  const html = S3D_HTML;

  // ---------- scène en direct : entrée du bonus ----------
  // const st = K.live(canvas); st.set([modèles]); st.play((t, objs) => {...}); st.stop();
  function live(canvas) {
    const r = renderer(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, canvas);
    r.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    const st = studio({ aspect: innerWidth / innerHeight, dist: 12, fov: 32 });
    const root = new THREE.Group(); st.scene.add(root);
    let raf = 0, fn = null, t0 = 0;
    const size = () => { const w = innerWidth, h = innerHeight; r.setSize(w, h, false); st.cam.aspect = w / h; st.cam.updateProjectionMatrix(); };
    addEventListener('resize', size); size();
    const loop = now => { const t = (now - t0) / 1000; fn && fn(t, root.children, st); r.render(st.scene, st.cam); raf = requestAnimationFrame(loop); };
    return {
      THREE, scene: st.scene, cam: st.cam, root,
      set(objs) { root.clear(); for (const o of objs) root.add(o); },
      play(f) { fn = f; cancelAnimationFrame(raf); t0 = performance.now(); canvas.style.display = 'block'; raf = requestAnimationFrame(loop); },
      stop() { cancelAnimationFrame(raf); fn = null; canvas.style.display = 'none'; root.clear(); },
    };
  }
  // ---------- décor : ciel en dégradé, nuées de points lumineux ----------
  // ciel : grande sphère vue de l'intérieur, trois couleurs (haut, horizon, bas) qu'on peut changer à chaque image
  function sky(top, mid, bottom, r = 90) {
    const u = { top: { value: new THREE.Color(top) }, mid: { value: new THREE.Color(mid) }, bottom: { value: new THREE.Color(bottom) } };
    const m = new THREE.ShaderMaterial({ uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top, mid, bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h * 1.6, 0.0, 1.0), 0.8)) : mix(mid, bottom, clamp(-h * 3.0, 0.0, 1.0)); gl_FragColor = vec4(c, 1.0);\n#include <colorspace_fragment>\n}' });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), m); mesh.renderOrder = -10; mesh.userData.u = u;
    return mesh;
  }
  // points doux qui scintillent (étoiles, lucioles, spores, poussière) ; pos(i) -> [x, y, z], col(i) -> couleur
  // opts : { size, additive, twinkle (vitesse), opacity } ; la nuée expose .userData.u (uTime, uOpacity, uSize)
  function dots(n, pos, col, o = {}) {
    const P = new Float32Array(n * 3), C = new Float32Array(n * 3), F = new Float32Array(n), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const p = pos(i); P.set(p, i * 3); c.set(col(i)); C.set([c.r, c.g, c.b], i * 3); F[i] = Math.random() * 6.28; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(F, 1));
    const u = { uTime: { value: 0 }, uOpacity: { value: o.opacity ?? 1 }, uSize: { value: o.size ?? 6 }, uTw: { value: o.twinkle ?? 1 }, uPx: { value: Math.min(1.5, devicePixelRatio || 1) } };
    const m = new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false, blending: o.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending, vertexColors: true,
      vertexShader: 'attribute float aPh; uniform float uTime, uSize, uTw, uPx; varying vec3 vC; varying float vA; void main(){ vC = color; vA = 0.55 + 0.45 * sin(uTime * uTw + aPh); vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = uSize * uPx * (0.7 + 0.3 * vA) * (30.0 / -mv.z); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform float uOpacity; varying vec3 vC; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard; float a = smoothstep(0.5, 0.0, r); a = a * a; gl_FragColor = vec4(vC, a * vA * uOpacity);\n#include <colorspace_fragment>\n}' });
    const pts = new THREE.Points(g, m); pts.userData.u = u; pts.frustumCulled = false;
    return pts;
  }
  const lerpColor = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t);
  // matériau réaliste (style premium) : métal, plastique brillant ; à utiliser avec ink: 0
  const pbr = (color, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, metalness: o.metal ?? 0.6, roughness: o.rough ?? 0.35 }); if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.glow ?? 0.6; } return m; };
  const endBake = () => { if (bakeR) { bakeR.dispose(); bakeR.forceContextLoss(); bakeR = null; } };
  return { THREE, TAU, mat, pbr, inkMat, part, G, face, studio, ANIM, ease, blink, bake, endBake, html, live, INK, sky, dots, lerpColor };
};

// ---------- chargement progressif : la machine démarre avec ses dessins 2D, puis passe en 3D dès que tout est cuit ----------
// MODELS(K) renvoie { SYMS: [8 fonctions], SCAT: fonction, VARIANTES: { nomDansART: { argument: fonction } } }.
// Exemple : VARIANTES: { star: { star: () => …, gold: () => … } } remplace ART.star('gold') par sa version 3D.
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
const STAGE3D = { intro() {}, big() {}, stop() {} }; // restent vides exprès : pas de personnages 3D qui tournent autour des grands écrans
window.ART3D_STATE = 'chargement';
// DECOR (facultatif) : décor 3D en fond d'écran, voir setupDecor
// Planches précuites (scripts/precuire.js) : PLANCHES3D = { dir, v, items: { s0…s7, scat, "v|nom|arg": { f, n } } }.
// Avec elles, la grille passe en 3D dès que les images sont là, sans attendre Three.js ni la cuisson.
async function usePlanches(ART, P) {
  const url = (it, k) => new URL(`${P.dir}${it.f}-${k}.webp?v=${P.v}`, location.href).href;
  const all = Object.entries(P.items).map(([key, it]) => ({ key, b: { idle: url(it, 'idle'), win: url(it, 'win'), frames: it.n } }));
  const load = src => new Promise((ok, ko) => { const im = new Image(); im.onload = ok; im.onerror = () => ko(new Error('planche introuvable : ' + src)); im.src = src; });
  await Promise.race([Promise.all(all.flatMap(x => [load(x.b.idle), load(x.b.win)])), new Promise((_, ko) => setTimeout(() => ko(new Error('planches trop lentes')), 20000))]);
  const get = k => all.find(x => x.key === k)?.b;
  const syms = []; for (let i = 0; get('s' + i); i++) syms.push(S3D_HTML(get('s' + i)));
  const scat = get('scat'); if (!syms.length || !scat) throw new Error('planches incomplètes');
  const variants = {};
  for (const x of all) { if (!x.key.startsWith('v|')) continue; const [, name, arg] = x.key.split('|'); (variants[name] ??= {})[arg] = S3D_HTML(x.b); }
  ART.SYMS = syms; ART.SCAT = S3D_HTML(scat);
  for (const [name, v] of Object.entries(variants)) { const old = ART[name]; ART[name] = (arg, ...rest) => v[arg] ?? old(arg, ...rest); }
}
function passe3d() {
  window.ART3D_STATE = 'ok';
  document.body.classList.add('art3d-in'); setTimeout(() => document.body.classList.remove('art3d-in'), 900); // fondu doux 2D → 3D
  dispatchEvent(new Event('art3d'));
}
async function CHARGE3D(ART, MODELS, DECOR) {
  // ?cuire : ignore les planches précuites (c'est ce que fait precuire.js pour les refaire)
  const P = typeof PLANCHES3D !== 'undefined' && PLANCHES3D && !/[?&]cuire\b/.test(location.search) ? PLANCHES3D : null;
  let pret = false;
  if (P) { try { await usePlanches(ART, P); pret = true; passe3d(); } catch (e) { console.warn('planches précuites indisponibles, cuisson en direct :', e); } }
  try {
    const THREE = await import(THREE_URL);
    const K = KIT3D(THREE), M = MODELS(K), frame = () => new Promise(r => requestAnimationFrame(r));
    if (DECOR) { try { setupDecor(K, DECOR, M); } catch (e) { console.warn('décor 3D indisponible :', e); } await frame(); }
    if (pret) return;
    const bakes = {}, syms = [];
    for (const [i, f] of M.SYMS.entries()) { bakes['s' + i] = await K.bake(f()); syms.push(K.html(bakes['s' + i])); await frame(); }
    bakes.scat = await K.bake(M.SCAT()); const scat = K.html(bakes.scat);
    const variants = {};
    for (const [name, table] of Object.entries(M.VARIANTES || {})) {
      variants[name] = {};
      for (const [arg, f] of Object.entries(table)) { const b = await K.bake(f()); bakes[`v|${name}|${arg}`] = b; variants[name][arg] = K.html(b); await frame(); }
    }
    K.endBake();
    window.ART3D_BAKES = bakes; // lu par precuire.js
    ART.SYMS = syms; ART.SCAT = scat;
    for (const [name, v] of Object.entries(variants)) { const old = ART[name]; ART[name] = (arg, ...rest) => v[arg] ?? old(arg, ...rest); }
    // plus de ronde 3D autour de l'entrée du bonus ni des gros gains : trop chargé, l'écran reste lisible
    passe3d();
  } catch (e) {
    if (pret) { console.warn('décor 3D indisponible (les symboles restent en 3D) :', e); return; }
    window.ART3D_STATE = 'erreur'; window.ART3D_ERROR = String(e && e.stack || e);
    console.warn('3D indisponible, la machine garde ses dessins 2D :', e);
  }
}
// scène en direct : les personnages tournent en ronde autour du texte (entrée du bonus)
function setupStage(K, M) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { THREE, TAU, ANIM, ease } = K;
  const cv = document.createElement('canvas'); cv.id = 'stage3d'; cv.setAttribute('aria-hidden', 'true');
  const fx = document.getElementById('fx'); fx ? fx.before(cv) : document.body.appendChild(cv);
  const st = K.live(cv);
  const wrap = model => { const p = new THREE.Group(), pivot = new THREE.Group(); pivot.add(model); p.add(pivot); p.userData = { pivot, model }; return p; };
  function ring(models, win) {
    st.set(models.map(wrap));
    st.play((t, kids) => {
      const asp = innerWidth / innerHeight, halfH = Math.tan(16 * Math.PI / 180) * 12;
      const rx = Math.min(halfH * asp * 0.74, 4.6), ry = halfH * 0.74, sc = Math.min(1, halfH * asp / 2.4) * 0.6;
      kids.forEach((p, i) => {
        const n = kids.length, a = Math.PI / 2 + i / n * TAU + t * 0.3, k = ease.out(Math.min(1, Math.max(0, (t - i * 0.1) / 0.9)));
        p.position.set(Math.cos(a) * rx * k, Math.sin(a) * ry * k - (1 - k) * 7, -1 + Math.sin(a) * 0.6);
        p.scale.setScalar(sc * (0.4 + 0.6 * k));
        const ph = (t * (win ? 0.85 : 0.45) + i / n) % 1, { pivot, model } = p.userData;
        ANIM[win ? 'win' : 'idle'](ph, pivot);
        model.userData.anim?.[win ? 'win' : 'idle']?.(ph, model);
      });
    });
  }
  STAGE3D.intro = n => ring(Array.from({ length: Math.min(n, 6) }, () => M.SCAT()), false);
  STAGE3D.stop = () => st.stop();
}

// ---------- décor 3D en fond d'écran ----------
// DECOR(K, M) renvoie { build(scene, cam) -> { update(t, dt, s) } } ; M = les modèles de la machine (pour réutiliser ses personnages). build place la caméra (cam.position) et sa cible
// (cam.userData.target, un Vector3) ; camFor(aspect) (facultatif) renvoie { pos, target } pour recadrer sur téléphone ; update anime la scène à chaque image, avec s = { bonus: 0 → 1 (transition douce),
// px, py : position du doigt ou de la souris (-1 → 1), scroll : 0 → 1 }. Le kit ajoute une légère parallaxe à la caméra.
// Une fois la première image affichée, <body> reçoit la classe decor3d : c'est au CSS de la page de masquer alors le décor 2D.
function setupDecor(K, DECOR, M) {
  const { THREE } = K, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas'); cv.id = 'decor3d'; cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1)); r.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  cam.userData.target = new THREE.Vector3(0, 2, 0);
  const d = DECOR(K, M).build(scene, cam);
  const base = cam.position.clone(), tgt = cam.userData.target.clone();
  const size = () => {
    const w = innerWidth, h = innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const c = d.camFor?.(cam.aspect); if (c) { base.copy(c.pos); tgt.copy(c.target); } // cadrage selon la forme de l'écran
  };
  addEventListener('resize', size); size();
  const s = { bonus: 0, px: 0, py: 0, scroll: 0 }; let tx = 0, ty = 0, last = performance.now(), t = 0, shown = false;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  addEventListener('deviceorientation', e => { if (e.gamma != null) { tx = Math.max(-1, Math.min(1, e.gamma / 30)); ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); } }, { passive: true });
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const covered = document.querySelector('.bigwin.show, .intro.show');
    if (!document.hidden && !(covered && shown)) {
      t += dt;
      const target = document.body.classList.contains('bonus') ? 1 : 0;
      s.bonus += (target - s.bonus) * (reduce ? 1 : Math.min(1, dt * 1.2));
      s.px += (tx - s.px) * Math.min(1, dt * 2); s.py += (ty - s.py) * Math.min(1, dt * 2);
      const sh = document.documentElement.scrollHeight - innerHeight; s.scroll = sh > 0 ? scrollY / sh : 0;
      cam.position.set(base.x + s.px * 0.8, base.y - s.py * 0.35 - s.scroll * 1.2, base.z);
      cam.lookAt(tgt.x + s.px * 0.3, tgt.y - s.scroll * 1.6, tgt.z);
      d.update(reduce ? 4 : t, reduce ? 0 : dt, s);
      r.render(scene, cam);
      if (!shown) { shown = true; document.body.classList.add('decor3d'); }
    }
    reduce ? setTimeout(() => requestAnimationFrame(frame), 400) : requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
