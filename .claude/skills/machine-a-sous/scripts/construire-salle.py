#!/usr/bin/env python3
"""Construit la Promenade (index.html à la racine du dépôt) à partir de :
  - app/salle-modele.html   : la page (scène 3D, panneaux, logique) ;
  - app/catalogue.json      : la liste des machines, dans l'ordre du boulevard ;
  - le kit 3D et les modèles 3D de chaque machine (décor au pied des bornes).
Met aussi à jour la liste des fichiers de sw.js et change sa VERSION (les téléphones récupèrent la nouvelle salle).

    python3 .claude/skills/machine-a-sous/scripts/construire-salle.py
"""
import json, pathlib, re, time

root = pathlib.Path(__file__).resolve().parents[4]
kit_dir = pathlib.Path(__file__).resolve().parents[1] / 'kit'
cat = json.loads((root / 'app/catalogue.json').read_text())
games = cat['machines']
page = (root / 'app/salle-modele.html').read_text()
kit = (kit_dir / 'kit3d.js').read_text()

modeles = []
for g in games:
    f = g.get('modeles')
    if not f or not (root / f).exists():
        continue
    src = (root / f).read_text()
    src2 = src.replace('const ART3D_MODELS = K =>', f"MODELES[{json.dumps(g['id'])}] = K =>", 1)
    if src2 == src:
        raise SystemExit(f"{f} : « const ART3D_MODELS = K => » introuvable")
    modeles.append(src2)

public = [{k: v for k, v in g.items() if k != 'modeles'} for g in games]
out = page.replace('/*@@CATALOGUE@@*/[]', json.dumps(public, ensure_ascii=False, indent=1))
out = out.replace('/*@@KIT3D@@*/', kit).replace('/*@@MODELES@@*/', '\n'.join(modeles))
for mark in ('@@CATALOGUE@@', '@@KIT3D@@', '@@MODELES@@'):
    if mark in out:
        raise SystemExit(f'marqueur {mark} resté dans la page')
(root / 'index.html').write_text(out)

# service worker : tout ce qu'il faut pour jouer hors ligne
files = ['./', 'index.html', 'manifest.webmanifest', 'app/icones/icone-192.png', 'app/icones/icone-512.png']
for g in games:
    for k in ('page', 'lite', 'vignette'):
        if g.get(k): files.append(g[k])
sw = (root / 'sw.js').read_text()
sw = re.sub(r"const VERSION = '[^']*';", f"const VERSION = 'promenade-{int(time.time())}';", sw)
sw = re.sub(r"const FICHIERS = \[[^\]]*\];", 'const FICHIERS = [\n  ' + ',\n  '.join(json.dumps(x) for x in files) + ',\n];', sw, flags=re.S)
(root / 'sw.js').write_text(sw)
print(f"index.html : {len(games)} machines sur le boulevard ({len(modeles)} avec leur décor 3D) ; sw.js : {len(files)} fichiers")
