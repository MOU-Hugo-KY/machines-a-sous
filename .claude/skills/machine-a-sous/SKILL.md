---
name: machine-a-sous
description: Crée une machine à sous complète (un seul fichier HTML, crédits fictifs) à partir d'une idée ou d'un thème, au niveau de Champi Pop et Constella - illustrations SVG sur mesure, décor animé avec ses habitants, musique et bruitages générés en direct, bonus à mécanique originale, RTP calibré à 98,5 %. À utiliser dès qu'on demande une machine à sous, un slot, un « jeu de casino » sur un thème, ou qu'on veut modifier/rethématiser une machine existante du dossier jeux/.
---

# Fabriquer une machine à sous à partir d'une idée

Toutes les machines du dépôt partagent le même squelette : une grille 6×6 qui paie en chemins, 8 symboles et un scatter qui lance un bonus à 3 niveaux, l'achat du bonus, la Chance bonus, les spins auto et le turbo. Ce qui change d'une machine à l'autre, c'est **le thème et la mécanique du bonus**. On part donc toujours d'une machine existante, qu'on rethématise en profondeur.

- `jeux/constella.html` : observatoire de nuit. Bonus à **étoiles collantes** : les étoiles restent au ciel, et une forme de constellation qui se dessine paie et déclenche son pouvoir. Le fichier le plus court (~1 300 lignes), le meilleur point de départ par défaut.
- `jeux/champi-pop.html` : forêt d'automne. Bonus en **grille qui grandit** : des champignons paient en chemins, avec des pouvoirs (nouvelle ligne, évolution du symbole, +1 spin, rond de sorcière…).

Avant d'écrire du code, lis `references/architecture.md` : il décrit les modules, les identifiants du DOM à garder, le contrat du moteur et les maths du RTP.

## 1. Le cahier des charges (court)

Transforme l'idée en un brief. Si l'idée est vague, décide toi-même et va jusqu'au bout. Ne pose une question que si deux lectures de l'idée mènent à des jeux vraiment différents. Le brief, que tu montres en quelques lignes avant de coder :

- **Nom** : court et chantant, qui tient sur l'enseigne (comme « Champi Pop » ou « Constella »).
- **Univers et palette** : lieu, moment de la journée, et 6 à 8 couleurs clés. Il y a un décor de jeu de base et une ambiance différente pendant le bonus (jour → nuit, calme → orage…).
- **Symboles** : 4 petits (l1-l4) et 4 gros (h1-h4), du plus fréquent au plus rare, tous des personnages avec un visage. S'y ajoute **le scatter** (l'objet qui lance le bonus : télescope, champignon étoile…).
- **Mécanique du bonus** : une idée qui colle au thème, avec **5 pouvoirs** nommés dans l'univers. Réutilise l'un des deux moteurs de bonus (étoiles collantes ou grille qui grandit) en le rhabillant, ou invente-en un troisième qui respecte le contrat de `references/architecture.md`.
- **Le monde autour** : ce qui trône au-dessus de la machine (toit, dôme, figure de proue…), le paysage au fond, et 3 à 6 habitants animés au sol (animaux, personnages) qui font chacun leur petite vie.
- **Musique** : une ambiance pour le jeu de base et une autre pour le bonus (tonalité, instruments synthétisés, tempo), plus les bruits d'ambiance (vent, vagues, grillons…).
- **Les 4 paliers de gros gain** : le dernier porte un nom au thème (« Supernova ! », « Champi-tastique ! »).

## 2. Construire

1. Copie le modèle le plus proche : `cp jeux/constella.html jeux/<nom-en-kebab>.html`.
2. Réécris les couches **dans cet ordre**, en gardant la structure et les identifiants :
   1. `<title>`, polices, **variables CSS** (`:root`, `body.bonus`) et styles propres au thème (topper, enseigne, décor).
   2. **Dégradés SVG partagés** (`<defs>` en haut du `<body>`) utilisés par les illustrations.
   3. **Paysage de fond** (`.scene`) avec sa version bonus (classes `.day`/`.night` ou variables).
   4. **Topper et enseigne** : le logo en lettres de couleurs qui ondulent, et les boutons musique/son/infos.
   5. **`Snd`** : réécris la musique (accords, mélodie, instruments) des deux ambiances, l'ambiance sonore et les bruitages du thème. Garde toutes les fonctions `fx` qu'appelle l'interface commune (liste dans l'architecture).
   6. **`ENGINE`** : garde le jeu de base à l'identique. Adapte `TIER`, et le bonus si la mécanique change.
   7. **`ART`** : 8 symboles + scatter + éléments du bonus, en SVG `viewBox="0 0 64 64"` dessinés à la main (contour sombre ~2,2 px, dégradés, reflet blanc, visage et joues roses). Aucune image externe, aucun emoji.
   8. **`FX`** : particules au thème (feuilles, bulles, flocons, étincelles…) sur le même canevas, avec les mêmes fonctions (`burst`, `rain`, `firework`…).
   9. **`WORLD`** : les habitants du sol et leurs animations CSS (marche, clignement, queue…).
   10. **Interface** : textes et messages (`msg`, `toast`, entrée du bonus, fin du bonus, règles, offres d'achat, `WIN_TIERS`), le HUD du bonus et l'affichage de la mécanique.
3. Tout le texte visible est **en français**, tutoiement, ton chaleureux. La mention « Crédits fictifs, aucun argent réel. RTP 98,5 %. » reste en bas de page et dans les règles.
4. Un seul fichier autonome : scripts et styles en ligne, Google Fonts comme seule ressource externe, pas de `localStorage` nécessaire.

## 3. Calibrer le RTP

```bash
node .claude/skills/machine-a-sous/scripts/rtp.js jeux/<nom>.html --calibre
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

Le script joue 8 spins puis achète le bonus et le super bonus en accéléré. Il échoue sur toute erreur JavaScript, ressource introuvable ou défilement horizontal sur téléphone. Il enregistre des captures dans `jeux/captures/<nom>/` : accueil sur téléphone et sur ordinateur, partie, entrée, déroulé et fin de chaque bonus, et règles. **Ouvre et regarde les captures** (outil Read sur les PNG). Corrige ce qui déborde, se chevauche, est illisible ou manque de contraste, puis relance jusqu'à obtenir « OK ». Les captures ne se commitent pas (elles sont dans `.gitignore`).

## 5. Livrer

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
- `rtp.js` et `check.js` passent.
