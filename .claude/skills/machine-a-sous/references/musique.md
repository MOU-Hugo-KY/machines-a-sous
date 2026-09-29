# Le son : bruitages partagés (SONS) et compositeur (MUSIQUE)

## Les bruitages partagés : `kit/sons.js`

Ce sont eux qui rendent le jeu satisfaisant. Chaque machine prend chez `SONS` le lancement du spin (un souffle qui monte, puis un roulement feutré de petits tocs doux), l'arrêt de chaque rouleau (un **toc boisé accordé**, une note plus haut par colonne sur une gamme pentatonique : l'arrêt des rouleaux joue une petite mélodie) et le clic des boutons. Tout passe par une réverbération courte, pour des sons nets mais jamais secs.

```bash
python3 .claude/skills/machine-a-sous/scripts/installer-sons.py jeux/<nom>.html            # spin, arrêt des rouleaux, clic
python3 .claude/skills/machine-a-sous/scripts/installer-sons.py jeux/masquerade.html --masquerade   # tous les bruitages
```

Les autres bruitages d'une machine peuvent piocher dans `son()` : `chime(note, volume, pan, délai)`, `win(niveau)`, `tick`, `fanfare`, `gong`, `shimmer`, `swish`, `whoosh`, `thunk`, `heartbeat`, `drone`. Évite les voix synthétiques (rires en formants) et les oscillateurs carrés ou en scie non filtrés : ils fatiguent vite.

## La musique

**Pour l'instant, la musique est coupée sur toutes les machines** (`installer-musique.py … --coupee` : `PARTITION = null`, ni musique ni ambiance, bouton musique caché). Le compositeur reste prêt : relance le script sans `--coupee` pour la remettre.

La musique n'est plus un séquenceur écrit note à note : Chaque machine embarque le compositeur `kit/musique.js` et sa **partition** (`kit/partitions.js`).

## Pourquoi

Les anciennes musiques fatiguaient vite : oscillateurs bruts (carrés, scies), aucune réverbération, boucles de 4 mesures répétées sans fin, mélodies qui ne respectaient pas les accords, volume trop fort. Le compositeur règle tout ça d'un coup.

## Ce qu'il fait

- **Harmonie** : une suite d'accords par degrés (`[degré, extension]`, avec `7`, `9`, `maj7`, `maj9`, `6`, `sus`, `sus9`, `add9`), construits en tierces dans la gamme. Chaque accord prend les notes les plus proches du précédent (voicings liés, sans sauts).
- **Mélodie à motifs** : des phrases de 4 mesures, avec un motif, une réponse, le motif transposé sur l'accord, puis une cadence longue sur la fondamentale ou la tierce. Les temps forts tombent sur des notes de l'accord, les temps faibles sur des notes de passage. L'aléatoire a une graine (`seed`) : le début est toujours le même, puis les phrases se renouvellent.
- **Forme** : 32 mesures, puis ça recommence avec d'autres mélodies. Deux phrases d'accords seuls (la batterie arrive à la deuxième), puis la mélodie, puis la mélodie avec un arpège, puis une respiration plus calme. Le bonus est plus rapide et plus plein.
- **Instruments doux** : `epiano` (piano électrique en FM), `mallet` (marimba), `musicbox`, `harp` (harpe feutrée), `flute`, une nappe de scies très filtrées, une basse ronde, et une batterie légère (`lofi`, `brush`, `waltz`, `drive`, `none`).
- **Mixage** : réverbération à convolution (réponse générée), écho filtré sur la mélodie et l'arpège, filtre chaud, compresseur. La nappe et la basse s'effacent un instant sous chaque grosse caisse. Swing et petites variations humaines de vélocité et de placement.

## Écrire une partition

```js
'ma-machine': { key: 62, scale: 'major', bpm: 76, beats: 4, swing: 0.1, seed: 9, bright: 5000, reverb: 2.8,
  prog: [[1, 'maj9'], [6, '9'], [4, 'maj9'], [5, 'sus']],               // une mesure par accord
  sound: { keys: 'epiano', comp: 'chords', lead: 'mallet', bass: 'soft', drums: 'lofi', arp: true, arpInst: 'musicbox' },
  bonus: { bpm: 92, sound: { drums: 'drive' }, prog: [...] } },            // ce qui change pendant le bonus
```

- `key` : la tonique en MIDI (60 = do4, 62 = ré4…). Reste entre 55 et 67 pour que les nappes restent chaudes.
- `scale` : `major`, `minor`, `dorian`, `lydian`, `harmonic` (mineur harmonique, pour un Ve majeur), `mixo`.
- `beats` : 4 ou 3 (valse ; `comp: 'waltz'` et `drums: 'waltz'`).
- `comp` : `chords` (accords rythmés), `broken` (accord égrené), `sparse` (quelques accords aigus), `waltz` (temps 2 et 3).
- Des progressions qui marchent : I–vi–ii–V (`[1,'maj7'],[6,'7'],[2,'7'],[5,'sus9']`), I–vi–IV–V, i–VI–III–VII en mineur, i–iv–V7–i en mineur harmonique.
- Ambiance calme : `bpm` 66 à 84, `drums: 'brush'` ou `'none'`, `lead: 'musicbox'` ou `'flute'`. Ambiance tendue : mineur, `bass: 'pulse'`, `bright` bas (3 500 à 4 000).

## Brancher

```bash
python3 .claude/skills/machine-a-sous/scripts/installer-musique.py jeux/<nom>.html <id>
```

Le script colle le compositeur et la partition avant `Snd`, fait déléguer `startMusic`, `stopMusic`, `setBonus` (et `hush`, `setMad` s'ils existent) au compositeur, et retire l'ancien séquenceur. Relance-le après chaque changement de partition, puis `passer-en-3d.py` pour la version 3D.

Pour écouter sans jouer : `app/musique.html` (régénérée par `construire-salle.py`) joue chaque thème, jeu normal et bonus. Pour vérifier les niveaux sans haut-parleurs, `MUSIQUE(ctx, bus, P).prerender(secondes, bonus)` remplit un `OfflineAudioContext` : un thème doit rester autour de −23 dB RMS, crête sous 0,5.
