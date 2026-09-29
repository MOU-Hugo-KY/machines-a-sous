#!/usr/bin/env python3
"""Installe le compositeur MUSIQUE (kit/musique.js) et la partition de la machine dans une page, à la place
de l'ancien séquenceur. Les bruitages (Snd.fx) et l'ambiance ne changent pas.

    python3 .claude/skills/machine-a-sous/scripts/installer-musique.py jeux/champi-pop.html champi-pop

La partition vient de kit/partitions.js (PARTITIONS[id]). Relancer le script met à jour le compositeur et la
partition (bloc entre // @@MUSIQUE-DEBUT et // @@MUSIQUE-FIN). À faire sur la page 2D, avant passer-en-3d.py.
"""
import sys, re, json, pathlib, subprocess

page, pid = sys.argv[1], sys.argv[2]
kit = pathlib.Path(__file__).resolve().parents[1] / 'kit'
p = pathlib.Path(page); s = p.read_text()
musique = (kit / 'musique.js').read_text().rstrip('\n')
part = json.loads(subprocess.check_output(['node', '-e', f"const P = require({json.dumps(str(kit / 'partitions.js'))}); process.stdout.write(JSON.stringify(P[{json.dumps(pid)}] || null))"]))
if not part: sys.exit(f'partition « {pid} » introuvable dans kit/partitions.js')
block = musique.replace('// @@MUSIQUE-FIN', f'const PARTITION = {json.dumps(part, ensure_ascii=False)};\n// @@MUSIQUE-FIN')

def need(cond, what):
    if not cond: sys.exit(f'motif introuvable : {what}')

# 1. le compositeur et la partition, juste avant Snd
s = re.sub(r'// @@MUSIQUE-DEBUT.*?// @@MUSIQUE-FIN\n', '', s, flags=re.S)
need('const Snd = (() => {' in s, 'const Snd = (() => {')
s = s.replace('const Snd = (() => {', block + '\nconst Snd = (() => {', 1)
# 2. Snd délègue la musique au compositeur
if 'let orch = null;' not in s:
    s = s.replace('const Snd = (() => {\n', 'const Snd = (() => {\n  let orch = null; // le compositeur (MUSIQUE), créé au premier geste\n', 1)
old_timer = 'if (!timer) { next = ctx.currentTime + 0.05; timer = setInterval(tick, 25); }'
if old_timer in s: s = s.replace(old_timer, 'if (!orch) orch = MUSIQUE(ctx, musicBus, PARTITION); orch.start(bonus);')
need('orch.start(bonus)' in s, 'démarrage de la musique')
s = re.sub(r'function stopMusic\(\) \{ if \(timer\) \{ clearInterval\(timer\); timer = null; \}', 'function stopMusic() { if (orch) orch.stop();', s)
need('function stopMusic() { if (orch) orch.stop();' in s, 'stopMusic')
s = re.sub(r'setBonus\(v\) \{ bonus = v; step = 0;( hush = false;)? if \(ctx\) next = Math\.max\(next, ctx\.currentTime \+ 0\.1\); \}',
           lambda m: 'setBonus(v) { bonus = v;' + (' hush = false;' if m.group(1) else '') + ' if (orch) orch.setBonus(v); }', s)
need('if (orch) orch.setBonus(v);' in s, 'setBonus')
s = s.replace('hush(v) { hush = v; },', 'hush(v) { hush = v; if (orch) orch.hush(v); },')
s = s.replace('setMad(v) { mad = v; },', "setMad(v) { mad = v; if (orch) orch.setMood(v ? 'mad' : ''); },")

# 3. on retire l'ancien séquenceur (fonctions de pas, tick, tableaux d'accords et de mélodie devenus inutiles)
def cut_block(src, start):
    """retire une déclaration qui commence à start, jusqu'à sa fin (accolades/crochets équilibrés, puis ; ou })"""
    i, depth, seen = start, 0, False
    while i < len(src):
        ch = src[i]
        if ch in '([{': depth += 1; seen = True
        elif ch in ')]}':
            depth -= 1
            if depth == 0 and src.startswith('function', start) and ch == '}': i += 1; break
        elif ch == ';' and depth == 0 and seen: i += 1; break
        i += 1
    j = src.rfind('\n', 0, start) + 1
    while i < len(src) and src[i] in ' \t': i += 1
    if i < len(src) and src[i] == '\n': i += 1
    return src[:j] + src[i:]
snd0 = s.index('const Snd = (() => {'); snd1 = s.index('\n})();', snd0)
snd = s[snd0:snd1]
for fn in ('playStep', 'playBonusStep', 'tick'):
    m = re.search(r'^\s*function ' + fn + r'\(', snd, re.M)
    if m: snd = cut_block(snd, m.start() + len(m.group(0)) - len('function ' + fn + '('))
changed = True
while changed:
    changed = False
    for m in re.finditer(r'^  const (\w+) = ', snd, re.M):
        name = m.group(1)
        if name in ('S',): continue
        if len(re.findall(r'\b' + name + r'\b', snd)) == 1 and name.isupper() or (name.endswith('At') and len(re.findall(r'\b' + name + r'\b', snd)) == 1):
            snd = cut_block(snd, m.start() + 2); changed = True; break
# variables du séquenceur qui ne servent plus
snd = re.sub(r'let step = 0, next = 0, ', 'let ', snd)
snd = re.sub(r'\n  // ---------- musique[^\n]*\n(?=\s*// ----------|\s*function start)', '\n', snd)
s = s[:snd0] + snd + s[snd1:]
p.write_text(s)
print(f'{page} : compositeur installé, partition « {pid} » ({part["bpm"]} bpm, {part["beats"]} temps)')
