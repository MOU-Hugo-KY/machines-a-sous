# Le Heavenly Demon de Murim dans Blender (bpy 5, Cycles sur processeur) : buste, cheveux en mèches, robe croisée brodée d'or, main aux deux doigts, aura de Qi.
# Usage : python3 murim-heavenly-demon.py preview [image] [win]   |   python3 murim-heavenly-demon.py sheet    (voir references/blender.md)
import bpy, bmesh, math, sys, os, random
from mathutils import Vector, noise

OUT = os.path.dirname(os.path.abspath(__file__))
MODE = sys.argv[1] if len(sys.argv) > 1 else 'preview'
TAU = math.tau
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
import addon_utils; addon_utils.enable('cycles', default_set=True)
S = bpy.context.scene

# ---------- matériaux ----------
def mat(name, base, metal=0.0, rough=0.5, emit=None, estr=0.0, sss=0.0, coat=0.0, spec=0.5, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    def put(k, v):
        if k in b.inputs: b.inputs[k].default_value = v
    put('Base Color', (*base, 1)); put('Metallic', metal); put('Roughness', rough); put('Specular IOR Level', spec)
    put('Subsurface Weight', sss); put('Subsurface Radius', (0.9, 0.35, 0.25)); put('Coat Weight', coat); put('Alpha', alpha)
    if emit: put('Emission Color', (*emit, 1)); put('Emission Strength', estr)
    return m
def srgb(h):
    c = [((h >> s) & 255) / 255 for s in (16, 8, 0)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)
SKIN = mat('skin', srgb(0xF1E3D3), rough=0.45, sss=0.25)
HAIR = mat('hair', srgb(0x0D0B12), rough=0.38, coat=0.25, spec=0.6)
ROBE = mat('robe', srgb(0x121016), rough=0.7, spec=0.3)
ROBE2 = mat('robe2', srgb(0x1C1820), rough=0.55, spec=0.4)
RED = mat('red', srgb(0x9A0E18), rough=0.45, spec=0.5)
GOLD = mat('gold', srgb(0xE3B34C), metal=1.0, rough=0.22)
EYE = mat('eye', srgb(0x050406), rough=0.2)
IRIS = mat('iris', srgb(0xFF2030), emit=srgb(0xFF1020), estr=6.0)
LIP = mat('lip', srgb(0x7A2A2E), rough=0.4)
# aura : émission rouge masquée par un bruit animé (transparente ailleurs)
def aura_mat():
    m = bpy.data.materials.new('aura'); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    for n in list(N): N.remove(n)
    out = N.new('ShaderNodeOutputMaterial'); mix = N.new('ShaderNodeMixShader'); tr = N.new('ShaderNodeBsdfTransparent'); em = N.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*srgb(0xFF2A30), 1); em.inputs['Strength'].default_value = 3.0
    tc = N.new('ShaderNodeTexCoord'); nz = N.new('ShaderNodeTexNoise'); nz.noise_dimensions = '4D'; nz.inputs['Scale'].default_value = 2.2; nz.inputs['Detail'].default_value = 8; nz.inputs['Distortion'].default_value = 1.5
    grad = N.new('ShaderNodeTexGradient'); grad.gradient_type = 'SPHERICAL'
    mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1.0, 0.0, 1.0)
    mul = N.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
    ramp = N.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position = 0.3; ramp.color_ramp.elements[1].position = 0.4
    L.new(tc.outputs['Object'], nz.inputs['Vector']); L.new(tc.outputs['Object'], mp.inputs['Vector']); L.new(mp.outputs['Vector'], grad.inputs['Vector'])
    L.new(nz.outputs['Fac'], mul.inputs[0]); L.new(grad.outputs['Fac'], mul.inputs[1])
    L.new(mul.outputs[0], ramp.inputs['Fac']); L.new(ramp.outputs['Color'], mix.inputs['Fac'])
    L.new(tr.outputs[0], mix.inputs[1]); L.new(em.outputs[0], mix.inputs[2]); L.new(mix.outputs[0], out.inputs['Surface'])
    m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
    return m, nz, em, mul
AURA, AURA_NZ, AURA_EM, _ = aura_mat()

def link(o):
    S.collection.objects.link(o); return o
def smooth(o, lv=2):
    for p in o.data.polygons: p.use_smooth = True
    if lv: m = o.modifiers.new('sub', 'SUBSURF'); m.levels = lv; m.render_levels = lv
    return o
def uvsphere(name, r=1, seg=32, ring=16):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=r); bm.to_mesh(me); bm.free()
    return link(bpy.data.objects.new(name, me))
def cyl(name, r1, r2, h, seg=32):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r1, radius2=r2, depth=h); bm.to_mesh(me); bm.free()
    return link(bpy.data.objects.new(name, me))
def deform(o, f):
    for v in o.data.vertices: v.co = f(v.co.copy())
def setmat(o, *ms):
    for m in ms: o.data.materials.append(m)
    return o
def curve(name, pts, radii, m, bevel=0.03, res=4, closed=False):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = bevel; cu.bevel_resolution = res; cu.resolution_u = 10
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1); sp.use_cyclic_u = closed
    for bp, p, r in zip(sp.bezier_points, pts, radii): bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'; bp.radius = r
    o = link(bpy.data.objects.new(name, cu)); cu.materials.append(m); return o

# ---------- la tête ----------
HEAD_Z = 0.42
head = uvsphere('head', 0.5, 48, 24)
def headshape(c):
    x, y, z = c.x, c.y, c.z
    z *= 1.0
    if z < 0: k = 1 - 0.5 * (-z / 0.5) ** 1.5; x *= k; y *= 0.72 + 0.28 * k    # mâchoire fine, menton pointu
    x *= 0.86
    if y < -0.3 and abs(x) < 0.09 and -0.18 < z < 0.1: y -= 0.05 * (1 - abs(x) / 0.09) * (1 - abs(z + 0.04) / 0.14)  # arête du nez
    if y < -0.2 and 0.02 < z < 0.14 and 0.08 < abs(x) < 0.28: y += 0.025  # orbites
    return Vector((x, y, z + HEAD_Z))
deform(head, headshape); smooth(head, 1); setmat(head, SKIN)
ncol = setmat(smooth(cyl('ncol', 0.26, 0.3, 0.16), 1), ROBE2); ncol.location = (0, 0.04, -0.34)
neck = setmat(smooth(cyl('neck', 0.17, 0.2, 0.5), 1), SKIN); neck.location = (0, 0.03, -0.12)
ears = []
for s in (-1, 1):
    e = setmat(smooth(uvsphere('ear', 0.09, 16, 8), 1), SKIN); e.scale = (0.4, 0.8, 1.2); e.location = (s * 0.42, 0.05, HEAD_Z - 0.02); ears.append(e)

bpy.context.view_layer.update()
_dg = bpy.context.evaluated_depsgraph_get(); _he = head.evaluated_get(_dg)
def F(x, z, lift=0.012):
    ok, loc, nrm, _ = _he.ray_cast(Vector((x, -2, z)), Vector((0, 1, 0)))
    return Vector((x, (loc.y if ok else -0.45) - lift, z))
# yeux de manhwa : un trait noir en amande, iris rouge fin, sourcils en trait de pinceau
eyes = []
H = HEAD_Z
for s in (-1, 1):
    lid = curve('lid', [F(s * 0.06, H + 0.05), F(s * 0.16, H + 0.085), F(s * 0.27, H + 0.115)], [0.7, 1.0, 0.4], EYE, bevel=0.02)
    low = curve('low', [F(s * 0.09, H + 0.04), F(s * 0.17, H + 0.045), F(s * 0.24, H + 0.08)], [0.3, 0.6, 0.2], EYE, bevel=0.008)
    ir = setmat(uvsphere('iris', 0.04, 16, 8), IRIS); ir.scale = (1.4, 0.4, 0.55); ir.location = F(s * 0.165, H + 0.066, 0.004); ir.rotation_euler = (0, s * -0.25, 0)
    brow = curve('brow', [F(s * 0.05, H + 0.14), F(s * 0.17, H + 0.18), F(s * 0.3, H + 0.2)], [0.9, 1.0, 0.25], HAIR, bevel=0.018)
    eyes += [lid, low, ir, brow]
nose = curve('nose', [F(0.02, H - 0.02), F(0.035, H - 0.1), F(0.0, H - 0.13, 0.02)], [0.3, 0.6, 0.8], LIP, bevel=0.007)
mouth = curve('mouth', [F(-0.055, H - 0.225), F(0, H - 0.232), F(0.055, H - 0.222)], [0.5, 1.0, 0.5], LIP, bevel=0.011)
mark = setmat(uvsphere('mark', 0.018, 12, 6), IRIS); mark.location = F(0, H + 0.3, 0.0); mark.scale = (0.6, 0.4, 1.6)
eyes.append(nose)
# ---------- les cheveux : longues mèches effilées ----------
strands = []   # (objet, points de base) pour l'animation
def strand(root, dirs, length, width, n=6, curl=0.0):
    pts, p = [], Vector(root)
    d = Vector(dirs).normalized()
    for i in range(n):
        pts.append(p.copy())
        grav = Vector((0, 0.0, -1)) * (i / n) * 0.9
        d = (d + grav * 0.35 + Vector((noise.noise(p * 3) * curl, noise.noise(p * 3 + Vector((5, 1, 2))) * curl * 0.4, 0))).normalized()
        p = p + d * (length / (n - 1))
    radii = [1.0 - 0.9 * (i / (n - 1)) ** 2 for i in range(n)]
    o = curve('strand', pts, radii, HAIR, bevel=width, res=3)
    strands.append((o, [q.copy() for q in pts])); return o
# calotte : fine coque de cheveux sur le crâne
cap = uvsphere('cap', 0.535, 48, 24)
def capshape(c):
    x, y, z = c.x * 0.9, c.y * 1.02, c.z * 1.08
    return Vector((x, y + 0.02, z + HEAD_Z + 0.03))
deform(cap, capshape)
bm = bmesh.new(); bm.from_mesh(cap.data)   # on retire le visage et le bas de la sphère
kill = [v for v in bm.verts if (v.co.z < HEAD_Z + 0.2 and v.co.y < -0.12) or v.co.z < HEAD_Z - 0.15 or (v.co.z < HEAD_Z + 0.05 and abs(v.co.x) > 0.33 and v.co.y < 0.1)]
bmesh.ops.delete(bm, geom=kill, context='VERTS'); bm.to_mesh(cap.data); bm.free()
smooth(cap, 1); setmat(cap, HAIR); cap.modifiers.new('sol', 'SOLIDIFY').thickness = 0.03
backhair = setmat(smooth(uvsphere('backhair', 1.0, 32, 16), 1), HAIR); backhair.scale = (0.62, 0.3, 1.0); backhair.location = (0, 0.32, HEAD_Z - 0.55)
# frange : mèches pointues qui tombent sur le front, séparées au milieu
for i in range(16):
    u = (i + 0.5) / 16 * 2 - 1
    if abs(u) < 0.12: continue
    ang = u * 1.25
    root = Vector((math.sin(ang) * 0.3, -0.36 * math.cos(ang) - 0.04, HEAD_Z + 0.45 - abs(u) * 0.08))
    side = abs(u) > 0.62
    d = Vector((math.sin(ang) * 0.5 + u * 0.3, -0.4, -1.0))
    strand(root, d, (0.62 if side else 0.2 + 0.12 * abs(u)) + random.random() * 0.05, 0.045, n=5, curl=0.18)
# côtés et dos : mèches longues jusqu'à la poitrine et dans le dos
for i in range(84):
    a = -0.62 * math.pi + i / 83 * 1.24 * math.pi
    back = math.cos(a)  # 1 = derrière
    root = Vector((math.sin(a) * 0.44, 0.08 + math.cos(a) * 0.34, HEAD_Z + 0.34 - 0.06 * random.random()))
    d = Vector((math.sin(a) * 0.32, math.cos(a) * 0.35 + 0.15, -1.0))
    L = 1.35 + 0.25 * random.random() + 0.2 * back
    strand(root, d, L, 0.065, n=7, curl=0.22)
# deux longues mèches devant les épaules
for s in (-1, 1):
    for k in range(3):
        strand(Vector((s * (0.4 + k * 0.03), -0.1 + k * 0.05, HEAD_Z + 0.12)), Vector((s * 0.3, -0.3, -1)), 1.3 + k * 0.1, 0.05, n=7, curl=0.3)

def ribbon(name, pts, w, m, th=0.02):
    from mathutils import geometry
    P = [pts[0]]
    for i in range(len(pts) - 1):
        a, b = pts[max(0, i - 1)], pts[min(len(pts) - 1, i + 2)]
        for k in range(1, 9):
            t = k / 8; p0, p1, p2, p3 = pts[max(0, i - 1)], pts[i], pts[i + 1], pts[min(len(pts) - 1, i + 2)]
            P.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    V, F = [], []
    for i, p in enumerate(P):
        tg = (P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]).normalized(); side = tg.cross(Vector((0, -1, 0))).normalized() * (w / 2)
        V += [p - side, p + side]
        if i: F.append((2 * i - 2, 2 * i - 1, 2 * i + 1, 2 * i))
    me = bpy.data.meshes.new(name); me.from_pydata(V, [], F); o = link(bpy.data.objects.new(name, me)); setmat(o, m)
    o.modifiers.new('sol', 'SOLIDIFY').thickness = th; smooth(o, 1); return o
# ---------- le buste : robe noire croisée, col rouge, broderies d'or ----------
torso = uvsphere('torso', 1.0, 48, 24)
def torsoshape(c):
    x, y, z = c.x, c.y, c.z
    x *= 1.12 + 0.12 * max(0, z); y *= 0.62; z *= 0.66
    if z > 0.35: x *= 1 - (z - 0.35) * 1.2
    return Vector((x, y + 0.08, z - 1.02))
deform(torso, torsoshape); smooth(torso, 2); setmat(torso, ROBE)
# revers du col croisé (hanfu) : deux bandes rouges et or qui se croisent en V
def lapel(s, m, w, off, end, dy=0.0):
    pts = [Vector((s * 0.19, -0.16, -0.32)), Vector((s * 0.22, -0.42, -0.54)), Vector((s * 0.06, -0.58 + dy, -0.86)), Vector((end, -0.62 + dy, -1.3))]
    return ribbon('lapel', [p + Vector((s * off, -0.01 - dy, 0)) for p in pts], w, m)
for s, end, dy in ((-1, 0.05, 0.0), (1, -0.42, -0.03)):
    lapel(s, RED, 0.16, 0.0, end, dy); lapel(s, GOLD, 0.035, 0.1, end, dy - 0.01)
# ---------- la main : deux doigts dressés ----------
hand = bpy.data.objects.new('hand', None); link(hand); hand.location = (0.42, -0.9, -0.95); hand.scale = (2.1, 2.1, 2.1)
sleeve = setmat(smooth(uvsphere('sleeve', 0.3, 24, 12), 1), ROBE); sleeve.scale = (0.8, 0.8, 1.3); sleeve.parent = hand; sleeve.location = (0.06, 0.1, -0.3); sleeve.scale = (0.55, 0.55, 0.8); sleeve.rotation_euler = (0.5, -0.3, 0)
palm = setmat(smooth(cyl('palm', 0.1, 0.09, 0.22, 16), 2), SKIN); palm.parent = hand; palm.scale = (1.0, 0.55, 1)
fingers = []
for i, (x, L, up) in enumerate([(-0.034, 0.26, True), (0.036, 0.28, True), (0.1, 0.12, False), (0.14, 0.1, False)]):
    f = setmat(smooth(uvsphere('finger', 0.5, 16, 8), 1), SKIN); f.scale = (0.06, 0.06, L); f.parent = hand
    if up: f.location = (x, 0, 0.08 + L / 2)
    else: f.location = (x - 0.03, -0.07, 0.05); f.rotation_euler = (1.4, 0, 0); f.scale = (0.07, 0.07, 0.12)
    fingers.append(f)
thumb = setmat(smooth(cyl('thumb', 0.03, 0.024, 0.14, 12), 1), SKIN); thumb.parent = hand; thumb.location = (-0.1, -0.05, 0.02); thumb.rotation_euler = (0.7, 0, 0.9)

# ---------- aura de Qi derrière lui ----------
aura = setmat(uvsphere('aura', 1.0, 32, 16), AURA); aura.scale = (2.0, 0.2, 2.0); aura.location = (0, 0.9, -0.05)
glow = aura

# ---------- lumières, caméra, contour d'encre ----------
def light(kind, loc, energy, color, size=1.0, rot=None):
    d = bpy.data.lights.new(kind, kind); d.energy = energy; d.color = color
    if kind == 'AREA': d.size = size
    o = link(bpy.data.objects.new(kind, d)); o.location = loc
    tgt = Vector((0, 0, -0.2)); o.rotation_euler = (tgt - Vector(loc)).to_track_quat('-Z', 'Y').to_euler() if rot is None else rot
    return o
light('AREA', (-2.6, -3.2, 2.4), 420, (1.0, 0.96, 0.92), 2.5)              # clé froide et douce
RIM = light('AREA', (2.4, 2.2, 1.6), 700, (1.0, 0.12, 0.1), 1.6).data     # contre-jour rouge sang
light('AREA', (-2.4, 2.0, 1.0), 260, (0.55, 0.65, 1.0), 1.4)               # contre-jour bleu nuit
light('AREA', (0.5, -2.4, -2.2), 60, (1.0, 0.75, 0.4), 2.0)                # rebond doré par en dessous
camd = bpy.data.cameras.new('cam'); camd.type = 'ORTHO'; camd.ortho_scale = 2.95
cam = link(bpy.data.objects.new('cam', camd)); cam.location = (0.05, -8, -0.3); cam.rotation_euler = (math.radians(90), 0, 0); S.camera = cam

S.render.engine = 'CYCLES'; S.cycles.device = 'CPU'
S.cycles.samples = 48 if MODE == 'sheet' else 64; S.cycles.use_denoising = True
S.cycles.max_bounces = 6; S.cycles.transparent_max_bounces = 12
S.render.film_transparent = True
S.view_settings.view_transform = 'Standard'; S.view_settings.look = 'None'; S.view_settings.exposure = -0.35
S.render.use_freestyle = True; S.render.line_thickness_mode = 'ABSOLUTE'
vl = S.view_layers[0]; fs = vl.freestyle_settings
ls = fs.linesets[0] if len(fs.linesets) else fs.linesets.new('ink')
if ls.linestyle is None: ls.linestyle = bpy.data.linestyles.new('ink')
ls.select_by_visibility = True; ls.select_by_edge_types = True; ls.select_silhouette = True; ls.select_border = True; ls.select_crease = False
ls.linestyle.color = (0.01, 0.005, 0.01); ls.linestyle.thickness = 1.4
aura.visible_camera = True
for o in [aura, glow]:
    o.hide_render = False
# les courbes fines (yeux, bouche) n'ont pas besoin de contour : on exclut l'aura et le halo du tracé
ex = bpy.data.collections.new('noink'); S.collection.children.link(ex)
[(S.collection.objects.unlink(o), ex.objects.link(o)) for o in (aura, neck)]
ls.select_by_collection = True; ls.collection = ex; ls.collection_negation = 'EXCLUSIVE'

# ---------- animation : une image par appel ----------
head_objs = [head, cap, *ears, *eyes, mouth, mark] + [s for s, _ in strands]
base_loc = {o.name: o.location.copy() for o in head_objs}
def pose(t, win):
    ph = t * TAU
    breathe = math.sin(ph) * 0.012
    torso.scale = (1 + breathe * 0.5, 1 + breathe, 1 + breathe)
    tilt = math.sin(ph) * 0.02 + (math.sin(ph) * 0.05 if win else 0)
    # cheveux : les pointes ondulent (amplitude au carré le long de la mèche)
    for i, (o, base) in enumerate(strands):
        sp = o.data.splines[0]; n = len(base)
        for j, bp in enumerate(sp.bezier_points):
            u = j / (n - 1); a = (0.05 + (0.08 if win else 0)) * u * u
            bp.co = base[j] + Vector((math.sin(ph + i * 0.7) * a, math.cos(ph * (2 if win else 1) + i) * a * 0.6, math.sin(ph * 2 + i) * a * 0.3))
    # la tête suit un léger balancement
    for o in [head, cap, *ears, *eyes, mouth, mark]:
        o.rotation_euler = (0, tilt, 0)
    # main : au repos devant la poitrine ; en victoire elle se lève, deux doigts tendus vers l'avant
    k = max(0.0, math.sin(ph)) if win else 0.0
    hand.location = (0.42 - 0.08 * k, -0.9 - 0.2 * k, -0.95 + 0.55 * k + math.sin(ph) * 0.01)
    hand.rotation_euler = (-0.35 * k, 0, -0.15 * k)
    # Qi : le bruit défile, l'aura s'embrase en victoire
    AURA_NZ.inputs['W'].default_value = math.sin(ph) * 0.6 + math.cos(ph) * 0.6
    AURA_EM.inputs['Strength'].default_value = (2.6 + 1.6 * k) if win else 2.4 + 0.5 * math.sin(ph * 2)
    aura.scale = (2.0 + 0.25 * k, 0.2, 2.0 + 0.3 * k)
    IRIS.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 6 + (14 * k if win else 2 * math.sin(ph))
    RIM.energy = 700 + (900 * k if win else 0)
    lift = 0.12 * k
    for o in head_objs: o.location = base_loc[o.name] + Vector((0, 0, lift * 0.4))
    torso.location.z = lift * 0.4

def render(path, size):
    S.render.resolution_x = S.render.resolution_y = size; S.render.filepath = path
    bpy.ops.render.render(write_still=True)

if MODE == 'preview':
    f = int(sys.argv[2]) if len(sys.argv) > 2 else 0; win = len(sys.argv) > 3
    pose(f / 24, win); render(os.path.join(OUT, f'prev-{"win" if win else "idle"}-{f}.png'), 512)
else:
    from PIL import Image
    size = 192; S.render.line_thickness = 1.0; ls.linestyle.thickness = 1.0
    for kind in ('idle', 'win'):
        sheet = Image.new('RGBA', (size * 24, size))
        for f in range(24):
            pose(f / 24, kind == 'win'); p = os.path.join(OUT, f'fr-{kind}-{f:02d}.png'); render(p, size * 2)
            sheet.paste(Image.open(p).convert('RGBA').resize((size, size), Image.LANCZOS), (f * size, 0))
        sheet.save(os.path.join(OUT, f'demon-{kind}.webp'), 'WEBP', quality=86, method=6)
        print('planche', kind, 'ok')
