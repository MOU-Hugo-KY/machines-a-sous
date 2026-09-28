---
name: machine-a-sous
description: Crée une machine à sous complète (un seul fichier HTML, crédits fictifs) à partir d'une idée ou d'un thème, au niveau de Champi Pop et Constella - illustrations SVG sur mesure ou personnages modélisés en 3D (Three.js, rendu dessin animé, animations fluides), décor animé avec ses habitants, musique et bruitages générés en direct, bonus à mécanique originale, RTP calibré à 98,5 %. À utiliser dès qu'on demande une machine à sous, un slot, un « jeu de casino » sur un thème, ou qu'on veut modifier/rethématiser une machine existante du dossier jeux/.
---

# Fabriquer une machine à sous à partir d'une idée

Toutes les machines du dépôt partagent le même squelette : une grille 6×6 qui paie en chemins, 8 symboles et un scatter qui lance un bonus à 3 niveaux, l'achat du bonus, la Chance bonus, les spins auto et le turbo. Ce qui change d'une machine à l'autre, c'est **le thème et la mécanique du bonus**. On part donc toujours d'une machine existante, qu'on rethématise en profondeur.

- `jeux/constella.html` : observatoire de nuit. Bonus à **étoiles collantes** : les étoiles restent au ciel, et une forme de constellation qui se dessine paie et déclenche son pouvoir. Le fichier le plus court (~1 300 lignes), le meilleur point de départ par défaut.
- `jeux/champi-pop.html` : forêt d'automne. Bonus en **grille qui grandit** : des champignons paient en chemins, avec des pouvoirs (nouvelle ligne, évolution du symbole, +1 spin, rond de sorcière…).
- `jeux/constella-3d.html` et `jeux/champi-pop-3d.html` : les deux mêmes, **en 3D**. Les symboles sont des personnages Three.js cuits en animations fluides, un **décor 3D vivant entoure la machine** (colline étoilée avec aurores, forêt d'automne qui passe à la nuit). C'est le point de départ d'une machine en 3D.
- `jeux/dead-city.html` et `jeux/dead-city-3d.html` : invasion zombie, **hors gabarit**. Grille 5×5 en **grappes avec cascades**, zombie joker, fonctions aléatoires en jeu normal (horde, patient zéro), **jauge d'invasion persistante**, et trois bonus différents selon le nombre de sirènes, dont un **bonus à choix** (portes, fuite avec le gain). C'est le point de départ quand l'idée demande un moteur neuf (voir « Sortir du gabarit » dans `references/architecture.md`).
- `jeux/masquerade.html` et `jeux/masquerade-3d.html` : bal masqué en **gravure baroque** (style 5), avec la **barre de studio**. Même moteur en grappes que Dead City, avec 11 symboles, deux fonctions aléatoires (Fou Rouge, Fou Noir), une jauge qui descend (SANITY → MADNESS MODE), un **choix équitable** au début du bonus (trois danses rendues égales par `DANCE_K`) et une **révélation en couches** (masques sous les masques). En 3D, les cartes gravées gardent leur dessin 2D (`SYMS[i] = null` dans `ART3D_MODELS`).

Avant d'écrire du code, lis `references/architecture.md` : il décrit les modules, les identifiants du DOM à garder, le contrat du moteur et les maths du RTP. Pour une machine en 3D, lis aussi `references/3d.md` (kit 3D, écriture des modèles, branchement).

## 1. Le cahier des charges (court)

Transforme l'idée en un brief. Si l'idée est vague, décide toi-même et va jusqu'au bout. Ne pose une question que si deux lectures de l'idée mènent à des jeux vraiment différents. Le brief, que tu montres en quelques lignes avant de coder :

- **Style visuel** : cartoon doux, premium sombre industriel, mine et western, ou néon arcade (fiches dans `references/styles.md`). Si on te montre des captures de machines du commerce, choisis le style le plus proche et reprends leur ambiance, jamais leur nom, logo ou personnages. Le style décide de la palette, des polices, du cadre, des tuiles, des symboles (personnages ronds, bustes sur tuiles colorées, figures de cartes gravées…) et de la barre de commande.
- **Nom** : court et chantant, qui tient sur l'enseigne (comme « Champi Pop » ou « Constella »).
- **Univers et palette** : lieu, moment de la journée, et 6 à 8 couleurs clés. Il y a un décor de jeu de base et une ambiance différente pendant le bonus (jour → nuit, calme → orage…).
- **Symboles** : 4 petits (l1-l4) et 4 gros (h1-h4), du plus fréquent au plus rare, tous des personnages avec un visage. S'y ajoute **le scatter** (l'objet qui lance le bonus : télescope, champignon étoile…).
- **Mécanique du bonus** : une idée qui colle au thème, avec **5 pouvoirs** nommés dans l'univers. Réutilise l'un des deux moteurs de bonus (étoiles collantes ou grille qui grandit) en le rhabillant, ou invente-en un troisième qui respecte le contrat de `references/architecture.md`.
- **Le monde autour** : ce qui trône au-dessus de la machine (toit, dôme, figure de proue…), le paysage au fond, et 3 à 6 habitants animés au sol (animaux, personnages) qui font chacun leur petite vie.
- **Musique** : une ambiance pour le jeu de base et une autre pour le bonus (tonalité, instruments synthétisés, tempo), plus les bruits d'ambiance (vent, vagues, grillons…).
- **Les 4 paliers de gros gain** : le dernier porte un nom au thème (« Supernova ! », « Champi-tastique ! »).
- **Rendu** : **2D** (SVG dessinés à la main) ou **3D** (personnages modélisés, ombrage dessin animé, animations de repos et de victoire, décor 3D vivant autour de la machine). En 3D, décris aussi le décor : ses 4 plans, ce qui bouge et ce que change le bonus. Choisis la 3D si on la demande ou si on parle de modèles, de rendu « clean » ou « pro ». Sinon, garde la 2D et propose la 3D en une ligne.

## 2. Construire

1. Copie le modèle le plus proche : `cp jeux/constella.html jeux/<nom-en-kebab>.html` (en 3D : `jeux/constella-3d.html`).
2. Réécris les couches **dans cet ordre**, en gardant la structure et les identifiants :
   1. `<title>`, polices, **variables CSS** (`:root`, `body.bonus`) et styles propres au thème (topper, enseigne, décor), en suivant la fiche du style choisi (`references/styles.md`) : cadre, tuiles, surbrillance des gains, barre de commande cartoon ou « barre de studio ».
   2. **Dégradés SVG partagés** (`<defs>` en haut du `<body>`) utilisés par les illustrations.
   3. **Paysage de fond** (`.scene`) avec sa version bonus (classes `.day`/`.night` ou variables).
   4. **Topper et enseigne** : le logo en lettres de couleurs qui ondulent, et les boutons musique/son/infos.
   5. **`Snd`** : réécris la musique (accords, mélodie, instruments) des deux ambiances, l'ambiance sonore et les bruitages du thème. Garde toutes les fonctions `fx` qu'appelle l'interface commune (liste dans l'architecture).
   6. **`ENGINE`** : garde le jeu de base à l'identique. Adapte `TIER`, et le bonus si la mécanique change.
   7. **`ART`** : 8 symboles + scatter + éléments du bonus, en SVG `viewBox="0 0 64 64"` dessinés à la main (contour sombre ~2,2 px, dégradés, reflet blanc, visage et joues roses). Aucune image externe, aucun emoji. **En 3D**, écris aussi `ART3D_MODELS` (mêmes symboles, dans le même ordre) et `DECOR3D` en suivant `references/3d.md`, puis assemble le tout avec `scripts/passer-en-3d.py` et précuis les planches avec `node scripts/precuire.js jeux/<nom>-3d.html` (la 3D apparaît alors sans attendre). Les SVG restent l'affichage de secours pendant le chargement et hors ligne.
   8. **`FX`** : particules au thème (feuilles, bulles, flocons, étincelles…) sur le même canevas, avec les mêmes fonctions (`burst`, `rain`, `firework`…).
   9. **`WORLD`** : les habitants du sol et leurs animations CSS (marche, clignement, queue…).
   10. **Interface** : textes et messages (`msg`, `toast`, entrée du bonus, fin du bonus, règles, offres d'achat, `WIN_TIERS`), le HUD du bonus et l'affichage de la mécanique.
3. Tout le texte visible est **en français**, tutoiement, ton chaleureux. La mention « Crédits fictifs, aucun argent réel. RTP 98,5 %. » reste en bas de page et dans les règles (une fois branchée sur la Promenade, elle devient « Lucioles : monnaie fictive, aucun argent réel »).
4. Un seul fichier autonome : scripts et styles en ligne, pas de `localStorage` nécessaire. Seules ressources externes : Google Fonts, et Three.js via jsDelivr pour la 3D (chargé par `CHARGE3D`, avec retour automatique à la 2D).

## 3. Calibrer le RTP

```bash
node .claude/skills/machine-a-sous/scripts/rtp.js jeux/<nom>.html --calibre            # gabarit 6×6
node .claude/skills/machine-a-sous/scripts/rtp.js jeux/<nom>.html --calibre --freq 280 # moteur neuf : bonus 1 spin sur 280, BASE_SCALE ajusté
node .claude/skills/machine-a-sous/scripts/rtp.js jeux/<nom>.html --graine 7   # vérification avec un autre tirage
```

`--calibre` simule 20 000 bonus par niveau, calcule `BONUS_K` (gain moyen de 98,5, 394 et 2 000 fois la mise) et `SCAT_W` (RTP de 98,5 % en jeu normal comme avec la Chance bonus), puis réécrit ces deux lignes dans le fichier. Le rapport doit montrer, pour les deux modes et les deux achats, un RTP entre 97,5 et 99,5 % (les bonus ont une longue traîne, d'où cet écart). Vérifie aussi :

- **Plafonné** : moins de 1 % des bonus doivent atteindre le gain maximum, sinon la mécanique est trop explosive. Réduis alors les pouvoirs de multiplication dans `TIER`.
- **Médiane / moyenne** : entre 0,3 et 0,7. En dessous, la plupart des bonus déçoivent.
- **Méga ≥ super ≥ bonus** : chaque niveau doit se sentir nettement plus riche que le précédent.

Si tu modifies `TIER` ou le bonus, relance `--calibre`.

## 4. Tester dans le navigateur

```bash
node .claude/skills/machine-a-sous/scripts/check.js jeux/<nom>.html
```

Pour une machine en 3D, installe d'abord Three.js en local une fois pour toutes (`npm i --prefix .claude/skills/machine-a-sous/scripts`). Le script attend alors la cuisson des modèles et échoue si la 3D ne se charge pas. Il joue 8 spins puis achète le bonus et le super bonus en accéléré. Il échoue sur toute erreur JavaScript, ressource introuvable ou défilement horizontal sur téléphone. Il enregistre des captures dans `jeux/captures/<nom>/` : accueil sur téléphone et sur ordinateur, partie, entrée, déroulé et fin de chaque bonus, et règles. **Ouvre et regarde les captures** (outil Read sur les PNG). Corrige ce qui déborde, se chevauche, est illisible ou manque de contraste, puis relance jusqu'à obtenir « OK ». Les captures ne se commitent pas (elles sont dans `.gitignore`).

## 5. Livrer

0. **Mets la machine sur la Promenade** (le lobby 3D, `index.html`) :
   - branche-la sur le porte-monnaie commun et les stats : `python3 .claude/skills/machine-a-sous/scripts/brancher-salle.py jeux/<nom>.html <id>`, sur la version 2D **avant** `passer-en-3d.py`. La monnaie devient les **lucioles**, le solde est partagé entre toutes les machines, et spins, gains et bonus sont comptés. Pour un trophée propre à la machine, ajoute `SALLE.flag('clé')` ou `SALLE.compte('clé')` au bon endroit du code (exemples dans `EXTRAS` du script) ;
   - ajoute son entrée dans `app/catalogue.json` (id, nom, sous-titre, pages 3D et 2D, vignette 900×800 dans `app/vignettes/`, fichier de modèles 3D, fichier de décor 3D (`decor`), couleur du néon, description, tags, fréquence du bonus, grille, gain max, trophées) ;
   - reconstruis la Promenade : `python3 .claude/skills/machine-a-sous/scripts/construire-salle.py`. Sa borne apparaît sur le boulevard, avec ses personnages 3D au pied et son scatter au-dessus ; quand on la regarde, son monde (le décor 3D de la machine) apparaît derrière elle, avec un fondu au noir d'une borne à l'autre. Laisse le centre du décor dégagé et cache son premier plan dans `camFor` pour une vue large, comme dans les trois exemples. `sw.js` est mis à jour ;
   - republie la Promenade : artifact `index.html`, avec en `files` les pages des machines, les vignettes, les icônes et `manifest.webmanifest`. Ne modifie jamais `index.html` à la main : la page vient de `app/salle-modele.html`.
1. Publie la page en artifact (`Artifact`, `file_path: jeux/<nom>.html`, `icon: "game"`, une phrase de description). Pour une nouvelle version, republie le même chemin.
2. Ajoute la machine au tableau du `README.md` (nom, thème, mécanique du bonus).
3. Commite et pousse (`jeux/<nom>.html`, README).
4. Dans ta réponse, donne le lien, le brief en 3 lignes et les chiffres clés du rapport RTP (fréquence du bonus, gains moyens).

## Le niveau attendu

Compare-toi à Champi Pop et Constella. Une machine est terminée quand :

- chaque symbole est un petit personnage reconnaissable au premier coup d'œil, même en 50 px ;
- le décor vit (au moins 3 animations en continu), et le passage en bonus change l'ambiance (couleurs, musique, lumières) ;
- la mécanique du bonus se comprend en regardant : animations pour chaque pouvoir, HUD clair, texte d'entrée qui l'explique en deux phrases ;
- la musique et les bruitages sont faits avec Web Audio, sans fichier son, et coupables séparément ;
- `prefers-reduced-motion` coupe les animations, les boutons ont un `aria-label` et un focus visible, et tout tient à 390 px de large ;
- en 3D : le décor a de la profondeur, au moins 8 animations et une vraie bascule d'ambiance au bonus, et il reste beau sur téléphone comme sur ordinateur (regarde les deux captures d'accueil) ; chaque personnage se lit bien en 50 px, les contours sont nets, aucun ne sort de sa case pendant le saut de victoire, et chacun a sa propre petite animation ;
- `rtp.js` et `check.js` passent.
