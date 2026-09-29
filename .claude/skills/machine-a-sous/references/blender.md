# Symboles rendus avec Blender

Pour un rendu vraiment premium, un symbole peut être modélisé et rendu dans **Blender** au lieu du kit Three.js. La page ne change pas : Blender produit exactement les mêmes planches (`jeux/planches/<page>/<clé>-idle.webp` et `-win.webp`, 24 images de 192 px en bande horizontale, fond transparent).

## Installation (sans interface, sans carte graphique)

```bash
pip install bpy pillow        # Blender 5 en module Python (~400 Mo)
```

Avec **Blender installé** (https://www.blender.org/download/) sur un ordinateur qui a une carte graphique, lance plutôt `blender -b -P blender/murim-heavenly-demon.py -- sheet` : le script choisit tout seul la carte graphique (OptiX/CUDA, HIP, Metal ou oneAPI) et va beaucoup plus vite. Sans carte graphique, le moteur **Cycles** tourne sur le processeur ; **EEVEE** ne marche pas sans carte graphique (pas d'EGL). Compte 20 à 40 s par image selon la taille : une paire de planches (48 images) prend un quart d'heure environ. Sur un ordinateur avec carte graphique, Blender va beaucoup plus vite.

## Le script d'un personnage

Exemple complet : `blender/murim-heavenly-demon.py` (le Heavenly Demon de Murim).

```bash
python3 blender/murim-heavenly-demon.py preview 6        # une image d'essai 512 px (image 6 du repos)
python3 blender/murim-heavenly-demon.py preview 6 win    # la même en victoire
python3 blender/murim-heavenly-demon.py sheet            # les deux planches 192 px (demon-idle.webp, demon-win.webp)
```

Les briques utilisées :

- **Tête** : une sphère UV déformée par une fonction (mâchoire fine, menton pointu, arête du nez, orbites), puis subdivisée et lissée.
- **Traits du visage** : des courbes de Bézier à section ronde (paupières, sourcils, nez, bouche), **posées à la surface** par `ray_cast` sur la tête évaluée. Sans ça, elles s'enfoncent dans le visage.
- **Cheveux** : une calotte (sphère coupée + épaisseur) et une centaine de **mèches** : courbes effilées (`radius` qui décroît), tirées par la gravité avec un peu de bruit. L'animation fait onduler les pointes (amplitude au carré le long de la mèche).
- **Vêtements** : volumes déformés pour le buste, **rubans plats** (maillage construit le long d'une spline, avec épaisseur) pour les cols croisés et les broderies d'or.
- **Matériaux** : Principled BSDF (peau avec un peu de subsurface, or métallique, cheveux brillants), iris en émission.
- **Aura** : une ellipse transparente dont l'émission est masquée par un bruit 4D (le paramètre `W` fait boucler l'animation) multiplié par un dégradé radial. Attention : un dégradé sphérique en coordonnées d'objet vaut 0 sur toute la surface d'une sphère ; écrase l'axe de profondeur (`Mapping` échelle `(1, 0, 1)`).
- **Lumière** : clé douce froide, **contre-jour rouge** fort, contre-jour bleu, rebond doré par en dessous. Caméra orthographique.
- **Encre** : Freestyle (silhouettes et bords, 1 px), en excluant l'aura et les pièces sans contour grâce à une collection.
- **Couleurs** : transformation `Standard` (AgX délave les émissions fortes en rose pâle).
- **Animation** : pas d'images clés ; pour chaque image, `pose(t, win)` place tout (respiration, cheveux, main, aura), puis on rend. Rendu à 384 px, réduit à 192 (anticrénelage).

Vérifie toujours les essais **sur fond sombre** (composite sur la couleur des cases) : un fond transparent affiché en blanc trompe sur l'aura et les lueurs.

## Brancher les planches

Range les deux planches dans `jeux/planches-blender/<page>/<clé>-idle.webp` et `<clé>-win.webp`, où la clé est celle du symbole (`s8` pour le 9e symbole de `ENGINE.SYMS`, `scat` pour le scatter). Puis :

```bash
python3 .claude/skills/machine-a-sous/scripts/appliquer-blender.py jeux/<page>.html
```

Le script copie les planches dans `jeux/planches/<page>/`, met à jour `planches.json` (nouvelle version `v`, liste `blender`) et la ligne `PLANCHES3D` de la page. `precuire.js` les réapplique aussi à chaque cuisson : les planches Blender ne sont jamais écrasées par celles du kit. Publie les `.webp` avec la page, comme d'habitude.
