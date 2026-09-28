#!/usr/bin/env python3
"""Construit la version 3D d'une machine 2D à partir du kit.

    python3 passer-en-3d.py jeux/constella.html kit/exemple-constella.js kit/decor-constella.js jeux/constella-3d.html "Constella 3D"

Colle KIT3D, les modèles et le décor avant l'interface, ajoute le CSS des symboles 3D et du décor, branche la
et lance CHARGE3D. La machine 2D doit suivre le gabarit de la skill.
"""
import sys, pathlib
src_p, models_p, decor_p, out_p, title = sys.argv[1:6]
here = pathlib.Path(__file__).resolve().parent.parent
src = open(src_p).read()
kit = open(here / 'kit' / 'kit3d.js').read()
models, decor = open(models_p).read(), open(decor_p).read()

def rep(old, new):
    global src
    if src.count(old) != 1:
        sys.exit(f'motif introuvable ou ambigu ({src.count(old)}) : {old[:80]}')
    src = src.replace(old, new)

import re
src = re.sub(r'<title>[^<]*</title>', f'<title>{title}</title>', src, count=1)
CSS = '''/* ---------- symboles 3D : planches d'images cuites au chargement (voir KIT3D) ---------- */
.s3d{display:block; width:92%; height:92%; position:relative}
.s3d b{display:block; width:100%; height:100%; background:var(--idle) 0 0 / calc(var(--n) * 100%) 100% no-repeat; animation:sheet 2.2s steps(var(--n), jump-none) infinite}
.cell.win .s3d b,.cell.scatwin .s3d b,.dance .s3d b{background-image:var(--win); animation-duration:1.1s}
@keyframes sheet{from{background-position-x:0%}to{background-position-x:100%}}
.cell:nth-child(3n) .s3d b{animation-delay:-.7s} .cell:nth-child(5n+1) .s3d b{animation-delay:-1.4s} .cell:nth-child(7n+2) .s3d b{animation-delay:-.35s}
.cell.pending .s3d{visibility:hidden}
.cell.drop .s3d{animation:drop .46s cubic-bezier(.3,1.55,.55,1) both}
.cell.twinkle .s3d,.cell.popin .s3d{animation:pop .5s cubic-bezier(.3,1.6,.5,1) both}
.cell.powhit .s3d{animation:pulse .45s ease-in-out 3}
.cell.shimmer .s3d{animation:shim 1s ease-in-out}
.cell.boom .s3d{animation:boom .35s ease-in forwards}
.cell.bite .s3d{animation:bite .5s cubic-bezier(.3,1.6,.5,1) both}
.cell.gold .s3d{animation:goldpulse 1.4s ease-in-out infinite alternate}
.cell.fade .s3d{transition:opacity .8s, transform .8s; opacity:0; transform:scale(.3)}
.medals .s3d{display:inline-block; width:74px; height:74px; animation:medal .6s cubic-bezier(.3,1.6,.5,1) both}
.introbox.many .medals .s3d{width:58px; height:58px}
.dance .s3d{display:inline-block; width:46px; height:46px}
.offer .s3d{width:58px; height:58px; flex:none}
.rules td .s3d{display:inline-block; width:38px; height:38px; vertical-align:middle}
.fly .s3d,.lvic .s3d{width:100%; height:100%}
#stage3d{position:fixed; inset:0; width:100%; height:100%; z-index:19; pointer-events:none; display:none}
/* ---------- décor 3D en fond : remplace le paysage 2D dès sa première image ---------- */
#decor3d{position:fixed; inset:0; width:100%; height:100%; z-index:0; display:block}
body.decor3d .scene,body.decor3d .flock,body.decor3d .floor .ground,body.decor3d .floor .deco,body.decor3d .floor .animal,body.decor3d .floor .pick,body.decor3d #flies{display:none}
body.decor3d .floor .credit{text-shadow:0 1px 3px rgba(0,0,0,.6)}
@media (prefers-reduced-motion: reduce){ .s3d b{animation:none!important} }
</style>'''
rep('</style>', CSS)
rep("(() => {\nconst E = ENGINE;", kit + "\n" + models + "\n" + decor + "\n(() => {\nconst E = ENGINE;")
rep("setMoney(); showStatic(E.spinBase());\n})();\n</script>",
    "setMoney(); showStatic(E.spinBase());\n// passage en 3D dès que les planches sont prêtes (la grille affichée est redessinée si la machine est au repos)\naddEventListener('art3d', () => { if (!S.busy && !document.body.classList.contains('bonus')) showStatic(E.spinBase()); });\nCHARGE3D(ART, ART3D_MODELS, DECOR3D);\n})();\n</script>")
open(out_p, 'w').write(src)
print(f'{out_p} : {src.count(chr(10))} lignes')
