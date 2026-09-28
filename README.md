# Machines à sous

Des machines à sous thématiques, chacune dans un seul fichier HTML à ouvrir dans un navigateur. On joue avec des crédits fictifs, sans aucun argent réel.

| Machine | Thème | Bonus |
|---|---|---|
| [Champi Pop](jeux/champi-pop.html) | Forêt d'automne, machine en bois sous un toit-champignon | Tours gratuits : les champignons paient en chemins, avec des pouvoirs (mycélium, lune rousse, écureuil, spores, rond de sorcière) |
| [Constella](jeux/constella.html) | Observatoire sur une colline, la nuit | Les étoiles restent au ciel et dessinent des constellations qui paient et déclenchent un pouvoir |
| [Champi Pop 3D](jeux/champi-pop-3d.html) | Champi Pop en 3D, dans une forêt d'automne 3D vivante qui passe à la nuit pendant le bonus | Le même, avec une ronde 3D à l'entrée du bonus et sur les gros gains |
| [Dead City 3D](jeux/dead-city-3d.html) ([2D](jeux/dead-city.html)) | Ville évacuée pendant une invasion zombie, nuit rouge, en 3D | Grille 5×5 en grappes avec cascades, jauge d'invasion, horde et patient zéro ; The Outbreak (zombies collants), Last Stand (portes à choisir, fuite avec le butin), Extraction (grimper jusqu'à l'hélico) |
| [Constella 3D](jeux/constella-3d.html) | Constella en 3D, sur une colline étoilée 3D (aurores, lune, planètes, village, feu de camp) | Le même, avec une ronde 3D à l'entrée du bonus et sur les gros gains |

Toutes partagent le même cœur : une grille 6×6 qui paie en chemins, un bonus à 3 niveaux, l'achat du bonus, la Chance bonus, les spins auto, le turbo, et un RTP de 98,5 %.

## Créer une nouvelle machine

Le dépôt contient une skill Claude Code, dans `.claude/skills/machine-a-sous/`. Dans une session Claude Code ouverte sur ce dépôt, il suffit de demander, par exemple :

> Fais-moi une machine à sous sur le thème des pirates, avec un bonus où on déterre des trésors.

Claude rédige un court cahier des charges (nom, symboles, bonus, décor, musique, rendu 2D ou 3D), construit la machine à partir des modèles, calibre le RTP, la teste dans un navigateur, puis la publie.

### Outils

```bash
# RTP : rapport, ou calibrage automatique des constantes
node .claude/skills/machine-a-sous/scripts/rtp.js jeux/constella.html
node .claude/skills/machine-a-sous/scripts/rtp.js jeux/ma-machine.html --calibre

# Essai dans Chromium (Playwright) : spins, achat des bonus, captures dans jeux/captures/
# (machines 3D : npm i --prefix .claude/skills/machine-a-sous/scripts, une fois)
node .claude/skills/machine-a-sous/scripts/check.js jeux/ma-machine.html
```
