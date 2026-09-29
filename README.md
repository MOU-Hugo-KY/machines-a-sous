# Machines à sous

## La Promenade (le lobby)

`index.html` est **la Promenade** : une allée de bornes d'arcade en 3D, chacune avec son enseigne néon et ses personnages. Derrière la borne que tu regardes s'ouvre le monde de sa machine : la salle de bal aux lustres et aux masques qui flottent pour Masquerade, la ville détruite en feu et ses zombies pour Dead City, la forêt d'automne et ses animaux pour Champi Pop, l'espace avec le soleil, la lune et les étoiles pour Constella. Tu glisses pour te promener, et quand tu touches une borne, la caméra plonge dans son écran et la machine s'ouvre. Au bout du boulevard, **le Grand Levier** choisit une machine au hasard.

- **Son** : les bruitages du spin sont partagés (`kit/sons.js` : souffle, roulement feutré, toc boisé accordé à chaque rouleau). La musique est coupée pour l'instant ; le compositeur `kit/musique.js` et les partitions (`kit/partitions.js`) restent prêts, et `app/musique.html` permet d'écouter les thèmes.
- **Lucioles** : la monnaie fictive de la Promenade, partagée entre toutes les machines (5 000 au départ).
- **Coffre du jour** : des lucioles chaque jour, avec un bonus quand tu reviens plusieurs jours de suite (7 jours affichés).
- **Records et trophées** : meilleurs gains, bonus déclenchés, et trophées généraux ou propres à chaque machine.
- **Vue liste** (bouton en haut à droite), qui sert aussi de secours si la 3D ne se charge pas.
- **Appli installable** (PWA, marche hors ligne). Il faut la mettre en ligne en https, par exemple avec GitHub Pages (Settings → Pages → `main`, dossier `/`), gratuit pour un dépôt public. Ensuite, dans Chrome sur Android : ⋮ → « Ajouter à l'écran d'accueil ».

La page est générée : modifie `app/salle-modele.html` ou `app/catalogue.json`, puis lance `python3 .claude/skills/machine-a-sous/scripts/construire-salle.py`.

| Machine | Thème | Bonus |
|---|---|---|
| [Champi Pop](jeux/champi-pop.html) | Forêt d'automne, machine en bois sous un toit-champignon | Tours gratuits : les champignons paient en chemins, avec des pouvoirs (mycélium, lune rousse, écureuil, spores, rond de sorcière) |
| [Constella](jeux/constella.html) | Observatoire sur une colline, la nuit | Les étoiles restent au ciel et dessinent des constellations qui paient et déclenchent un pouvoir |
| [Champi Pop 3D](jeux/champi-pop-3d.html) | Champi Pop en 3D, dans une forêt d'automne 3D vivante qui passe à la nuit pendant le bonus | Le même, avec une ronde 3D à l'entrée du bonus et sur les gros gains |
| [Masquerade of Madness 3D](jeux/masquerade-3d.html) ([2D](jeux/masquerade.html)) | Bal masqué décadent dans un palais baroque, gravure noir, ivoire et carmin, en 3D | Grille 5×5 en grappes avec cascades, Fou Rouge (chaîne de jokers et rire ×2 à ×25) et Fou Noir (chasse les petites cartes), jauge SANITY qui mène au MADNESS MODE ; The Masquerade (dernière danse : 3 partenaires, même gain moyen, risque différent), Remove the Mask (masques sous les masques), Le Bal des Fous (les deux Fous, multiplicateur sans fin) |
| [Dead City 3D](jeux/dead-city-3d.html) ([2D](jeux/dead-city.html)) | Ville évacuée pendant une invasion zombie, nuit rouge, en 3D | Grille 5×5 en grappes avec cascades, jauge d'invasion, horde et patient zéro ; The Outbreak (zombies collants), Last Stand (portes à choisir, fuite avec le butin), Extraction (grimper jusqu'à l'hélico) |
| [Constella 3D](jeux/constella-3d.html) | Constella en 3D, sur une colline étoilée 3D (aurores, lune, planètes, village, feu de camp) | Le même, avec une ronde 3D à l'entrée du bonus et sur les gros gains |

Toutes partagent le même cœur : une grille 6×6 qui paie en chemins, un bonus à 3 niveaux, l'achat du bonus, la Chance bonus, les spins auto, le turbo, et un RTP de 98,5 %.

## Créer une nouvelle machine

Le dépôt contient une skill Claude Code, dans `.claude/skills/machine-a-sous/`. Dans une session Claude Code ouverte sur ce dépôt, il suffit de demander, par exemple :

> Fais-moi une machine à sous sur le thème des pirates, avec un bonus où on déterre des trésors.

Claude rédige un court cahier des charges (style visuel, nom, symboles, bonus, décor, musique, rendu 2D ou 3D), construit la machine à partir des modèles, calibre le RTP, la teste dans un navigateur, puis la publie.

### Outils

```bash
# RTP : rapport, ou calibrage automatique des constantes
node .claude/skills/machine-a-sous/scripts/rtp.js jeux/constella.html
node .claude/skills/machine-a-sous/scripts/rtp.js jeux/ma-machine.html --calibre

# Essai dans Chromium (Playwright) : spins, achat des bonus, captures dans jeux/captures/
# (machines 3D : npm i --prefix .claude/skills/machine-a-sous/scripts, une fois)
node .claude/skills/machine-a-sous/scripts/check.js jeux/ma-machine.html
```
