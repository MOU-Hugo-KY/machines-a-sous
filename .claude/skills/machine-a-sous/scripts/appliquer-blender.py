#!/usr/bin/env python3
"""Applique les planches rendues avec Blender à une machine 3D déjà précuite, sans refaire la cuisson.

    python3 .claude/skills/machine-a-sous/scripts/appliquer-blender.py jeux/murim-3d.html

Prend jeux/planches-blender/<page>/<clé>-idle.webp et -win.webp (24 images de 192 px, fond transparent),
les copie dans jeux/planches/<page>/, met à jour planches.json (version, liste « blender ») et la ligne
PLANCHES3D de la page. precuire.js les réapplique aussi à chaque cuisson. Voir references/blender.md.
"""
import sys, json, re, shutil, hashlib, pathlib
page = pathlib.Path(sys.argv[1]); stem = page.stem
bl = page.parent / 'planches-blender' / stem; out = page.parent / 'planches' / stem
pj = out / 'planches.json'
if not pj.exists(): sys.exit(f'{pj} introuvable : lance d\'abord precuire.js')
pl = json.loads(pj.read_text()); keys = []
for idle in sorted(bl.glob('*-idle.webp')):
    key = idle.name[:-len('-idle.webp')]; win = bl / f'{key}-win.webp'
    if not win.exists(): continue
    shutil.copy(idle, out / idle.name); shutil.copy(win, out / win.name)
    pl['items'][key] = {'f': key, 'n': 24}; keys.append(key)
if not keys: sys.exit(f'aucune planche Blender dans {bl}')
h = hashlib.sha1()
for f in sorted(out.glob('*.webp')): h.update(f.read_bytes())
pl['v'] = h.hexdigest()[:8]; pl['blender'] = sorted(set(pl.get('blender', []) + keys))
pj.write_text(json.dumps(pl, ensure_ascii=False, indent=1) + '\n')
html = page.read_text(); line = re.compile(r'^const PLANCHES3D = .*;$', re.M)
if not line.search(html): sys.exit('ligne « const PLANCHES3D = … ; » introuvable')
page.write_text(line.sub(lambda m: 'const PLANCHES3D = ' + json.dumps(pl, ensure_ascii=False, separators=(',', ':')) + ';', html, count=1))
print(f'{page} : planches Blender appliquées ({", ".join(keys)}), version {pl["v"]}')
