#!/usr/bin/env python3
"""Installe les bruitages partagés SONS (kit/sons.js) dans une machine : lancement du spin (souffle + roulement
feutré), arrêt de chaque rouleau (toc boisé accordé, une note plus haut par colonne) et clic des boutons.

    python3 .claude/skills/machine-a-sous/scripts/installer-sons.py jeux/champi-pop.html
    python3 .claude/skills/machine-a-sous/scripts/installer-sons.py jeux/masquerade.html --masquerade   # remplace tous ses bruitages

Relancer le script met à jour le bloc entre // @@SONS-DEBUT et // @@SONS-FIN. À faire sur la page 2D, avant passer-en-3d.py.
"""
import sys, re, pathlib
page = sys.argv[1]
kit = pathlib.Path(__file__).resolve().parents[1] / 'kit'
p = pathlib.Path(page); s = p.read_text()
block = (kit / 'sons.js').read_text().rstrip('\n')
s = re.sub(r'// @@SONS-DEBUT.*?// @@SONS-FIN\n', '', s, flags=re.S)
if 'const Snd = (() => {' not in s: sys.exit('const Snd introuvable')
s = s.replace('const Snd = (() => {', block + '\nconst Snd = (() => {', 1)
if 'const son = () =>' not in s:
    s = s.replace('const Snd = (() => {\n', 'const Snd = (() => {\n  let sons = null; const son = () => sons || (sons = SONS(ctx, sfxBus)); // bruitages partagés (kit/sons.js)\n', 1)
NEW = {
    'click': "    click() { son().click(); },",
    'reelStart': "    reelStart() { son().spinStart(); },",
    'reelStop': "    reelStop() { son().spinStop(); },",
    'stop': "    stop(c) { son().land(c); },",
}
if '--masquerade' in sys.argv:
    # tous les bruitages de Masquerade : clochettes, souffles, gong feutré, battements de cœur ; plus de rires synthétiques
    S = '''  const S = {
    click() { son().click(); },
    reelStart() { son().spinStart(); },
    reelStop() { son().spinStop(); },
    stop(c) { son().land(c); },
    scatter(n) { const o = son(); o.chime(86 + n * 2, 0.16); o.chime(93 + n * 2, 0.1, 0.2, 0.07); }, // cling
    antic() { son().heartbeat(); setTimeout(() => son().heartbeat(), 800); },
    win(level) { son().win(level); },
    tick(p) { son().tick(p); },
    fanfare() { son().fanfare(); },
    bonus() { const o = son(); o.gong(38, 0.24); o.shimmer(1); o.swish(1.2, 0.1); },
    thunk() { son().thunk(); },
    whoosh() { son().whoosh(); },
    laugh() { const o = son(); o.shimmer(0.7); o.swish(0.5, 0.08); },
    red() { const o = son(); [88, 84, 81, 76].forEach((m, i) => o.chime(m, 0.12, 0, i * 0.08)); },
    point() { son().chime(91, 0.1); },
    curtain() { son().swish(0.8, 0.12); },
    sticky() { const o = son(); o.chime(79, 0.14); o.chime(86, 0.09, 0, 0.08); },
    myst() { son().shimmer(0.9); },
    reveal() { const o = son(); o.swish(0.3, 0.08); o.chime(84, 0.13, 0, 0.18); },
    mult(k = 0) { const o = son(), b = 81 + Math.min(k, 7); [0, 4, 7].forEach((d, i) => o.chime(b + d, 0.11, 0, i * 0.06)); },
    mask() { const o = son(); o.swish(0.4, 0.1); o.chime(81, 0.12, 0, 0.2); o.chime(88, 0.09, 0, 0.28); },
    deeper() { son().gong(45, 0.16); },
    dance() { const o = son(); [74, 78, 81, 86].forEach((m, i) => o.chime(m, 0.1, 0, i * 0.05)); },
    madness() { const o = son(); o.drone(3); o.gong(33, 0.2); setTimeout(() => o.shimmer(0.8), 900); },
    bell() { son().chime(84, 0.15); },
  };'''
    a = s.index('  const S = {', s.index('const Snd = (() => {')); b = s.index('\n  };', a) + len('\n  };')
    s = s[:a] + S + s[b:]
else:
    for k, v in NEW.items():
        s, n = re.subn(r'^    ' + k + r'\([^)]*\) \{.*\},$', v, s, count=1, flags=re.M)
        if not n: sys.exit(f'bruitage {k} introuvable')
p.write_text(s)
print(f'{page} : bruitages partagés installés' + (' (tous, version Masquerade)' if '--masquerade' in sys.argv else ' (spin, arrêt des rouleaux, clic)'))
