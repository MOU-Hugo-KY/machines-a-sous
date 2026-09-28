# Architecture d'une machine

Un fichier HTML autonome. De haut en bas :

| Bloc | Rôle | Propre au thème ? |
|---|---|---|
| `<style>` | variables `:root` (palette), `body.bonus` (palette du bonus), machine, grille, fenêtres, décor | styles du décor et palette oui, mécanique des classes non |
| `<svg><defs>` | dégradés partagés (`id` préfixés : `g…` dans Champi Pop, `o…` dans Constella) | oui |
| `.scene` | paysage fixe en fond (SVG `viewBox 0 0 1600 1000`, `preserveAspectRatio="xMidYMax slice"`) | oui |
| `<main id="main">` | `.topper` (toit, enseigne, boutons) puis `.cabinet` (écran, message, tableau de commande) | habillage oui, identifiants non |
| `section.floor` | le sol sous la machine, avec ses décors (`.deco`) et ses habitants (`.animal`), plus la mention des crédits fictifs | oui |
| calques | `#fx` (canevas), `#intro`/`#introLayer`, `#bigwin`/`#bwLayer`, `#overlay`/`#card`, `#toast` | non |
| `<script>` | les modules `Snd`, `ENGINE`, `ART`, `FX`, `WORLD`, puis l'interface dans une IIFE | voir ci-dessous |

## Identifiants du DOM utilisés par l'interface (à garder)

`main`, `musicBtn`, `sfxBtn`, `infoBtn`, `hud`, `tierName`, `tierSize`, `chipSpins`, `spinsLeft`, `chipMult`/`multN` (ou l'équivalent du thème), `chipTotal`, `bonusTotal`, `gridwrap`, `grid`, `msg`, `balance`, `betDown`, `bet`, `betUp`, `lastWin`, `buyBtn`, `anteBtn`, `spin`, `autoBtn`, `turboBtn`, `fx`, `intro`, `introLayer`, `introbox`, `bigwin`, `bwLayer`, `bw`, `overlay`, `card`, `toast`. Créés à la volée : `introBtn`, `ovBtn`, `bwv`.

`scripts/check.js` s'appuie sur `spin`, `turboBtn`, `buyBtn`, `.offer[data-t]`, `introBtn`, `intro.show`, `bwLayer.show`, `overlay.show`, `ovBtn`, `infoBtn`, `balance` et `body.bonus`.

## Classes pilotées par le code

- `body.bonus` : pendant tout le bonus (palette, décor de nuit, HUD visible, boutons de mise masqués).
- Grille : `.grid.big` (plus de 6 colonnes), `.grid.dimmed` (on éteint tout sauf les gagnants).
- Cellule : `.pending` (pas encore tombée), `.drop` (chute), `.win` (gagnante), `.antic` (suspense, 2 scatters déjà là), `.scat` (anneau à l'arrivée d'un scatter), `.scatwin` (scatter qui lance le bonus), plus les états propres au bonus (`.lit`, `.gold`, `.fill`, `.soil`, `.popin`, `.powhit`…).
- `main.shake` : secousse sur les gros gains.
- `.spin.go` (rotation de l'icône), `.spin.stop` (en auto, le bouton sert à arrêter), `.btn.on` (option active).

## Modules

### `Snd` (Web Audio, rien à télécharger)

API : `start()` (au premier geste : crée le contexte et lance la musique), `toggleMusic()`, `toggleSfx()`, `setBonus(bool)` (change de musique), `fx(nom, ...args)`.

Structure interne à reprendre : bus `master` → compresseur, `musicBus`, `sfxBus`, `ambBus`, et un tampon de bruit blanc. Les instruments sont des fonctions : `tone`, `noiseHit`, `pluck` (Karplus-Strong), `bell` (partiels inharmoniques), `flute`, `woodblock`, `shaker`. La musique est un séquenceur à pas (`playStep`) planifié en avance, avec des accords `CH`, un arpège `ARP` et une mélodie `MEL` ; le bonus a ses propres `BCH`/`BMEL`. L'ambiance tourne sur une minuterie à part.

Bruitages appelés par l'interface commune (ils doivent exister) : `click`, `reelStart`, `reelStop`, `stop(col)`, `scatter(n)`, `antic`, `win(level)`, `tick(p)`, `fanfare`, `bonus`, `thunk`, `whoosh`. Ajoute-en autant que le bonus en demande (un par pouvoir, un pour l'arrivée d'un élément…).

### `ENGINE` (pur calcul, sans DOM, exécutable dans Node)

Il commence par `const ENGINE = (() => {` et se termine par `})();` suivi de la ligne `if (typeof module !== 'undefined') module.exports = ENGINE;`. `scripts/rtp.js` repère le bloc grâce à ces deux marqueurs. Tout tirage passe par `Math.random`.

**Jeu de base, commun à toutes les machines (ne pas modifier, sauf les gains de `SYMS` si besoin) :**

- Grille de 6 colonnes × 6 lignes. Chaque case est tirée indépendamment selon les poids `SYMS[i].w`, ou le scatter (`-1`) avec le poids `SCAT_W[mode]`.
- Gains en chemins : un symbole présent dans les colonnes 1…L consécutives (L ≥ 3) paie `pay[L-3] × (produit des nombres d'occurrences par colonne) × BASE_SCALE`, en multiples de la mise.
- `analyticBase` donne l'espérance exacte du jeu de base (les colonnes sont indépendantes). `scatProbs` donne la probabilité d'avoir 3, 4 ou 5+ scatters (loi binomiale sur 36 cases).
- Le nombre de scatters fixe le niveau du bonus : 3 → Bonus, 4 → Super bonus, 5+ → Méga bonus.
- `BUY = { 3: 100, 4: 400 }` (prix en fois la mise), `ANTE = 1.25` (la Chance bonus coûte 25 % de plus et augmente `SCAT_W`).

**Contrat du bonus (libre, tant qu'il le respecte) :**

```js
TIER = { 3: { spins, cap: 10000, ... }, 4: { ..., cap: 25000 }, 5: { ..., cap: 50000 } }
newBonus(tier) -> b      // b.spinsLeft, b.raw = 0, b.total = 0, b.done = false, b.capped = false
bonusSpin(b) -> ev       // joue un spin : b.spinsLeft--, ajoute au gain brut b.raw, puis
                         //   b.total = Math.min(T.cap, b.raw * BONUS_K[b.tier]);
                         //   if (b.total >= T.cap) { b.capped = true; b.done = true; }
                         //   if (b.spinsLeft <= 0) b.done = true;
                         // renvoie de quoi animer le spin (ce qui est tombé, les événements, ev.win)
```

`BONUS_K` ramène le gain brut à l'échelle voulue : c'est ce qui permet d'inventer n'importe quelle mécanique (formes, chemins, grappes, collecte, multiplicateurs…) sans faire de calcul à la main. Le niveau 4 et le niveau 5 doivent être nettement plus généreux que le niveau 3 (grille plus grande, cadeaux au départ, multiplicateur de départ…). Chaque niveau a **5 pouvoirs** au thème, par exemple : +spins, multiplicateur ×2, élément ajouté au hasard, tout monte d'un cran, nettoyage/agrandissement de la grille.

Exports : `COLS, ROWS, SYMS, TIER, BUY, ANTE`, les tables propres au bonus, `spinBase, evalBase, analyticBase, scatProbs, newBonus, bonusSpin`, et les accesseurs `SCAT_W`, `BASE_SCALE`, `BONUS_K` (get/set, utilisés par `rtp.js`).

Les lignes `let SCAT_W = { normal: …, ante: … };` et `let BONUS_K = { 3: …, 4: …, 5: … };` doivent rester sur une seule ligne chacune : `rtp.js --calibre` les réécrit.

### Maths du RTP (fait par `rtp.js`)

- Cibles : bonus moyen = 98,5 % × prix d'achat (98,5 et 394 fois la mise), méga bonus = 2 000 fois la mise.
- `BONUS_K[t]` : on simule des bonus sans plafond pour obtenir la distribution de `raw`, puis on résout `moyenne(min(cap, K × raw)) = cible` par dichotomie.
- `SCAT_W[mode]` : on résout `base(mode) + Σ P(t) × cible(t) = 0,985 × coût`, avec coût = 1 en normal et 1,25 en Chance bonus.
- Avec `BASE_SCALE ≈ 0,766` et la table de gains actuelle, le jeu de base rend ~60,5 % et le bonus tombe une fois sur ~325 spins (~205 avec la Chance bonus). Pour un bonus plus fréquent, baisse `BASE_SCALE`. Pour moins de spins morts, monte-le.

### `ART`

Renvoie les chaînes SVG : `SYMS` (8, dans l'ordre de `ENGINE.SYMS`), `SCAT`, et ce que demande le bonus (`star(kind)`, `power(type)`, `constIcon(k)`…). Modèle d'un symbole :

```js
const svg = inner => `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="60.5" rx="17" ry="2.4" fill="#000" opacity=".2"/>${inner}</svg>`;
```

Style : contour de la couleur d'encre du thème (`K`) d'environ 2,2 px, remplissage en dégradé radial (défini dans `<defs>`), un reflet blanc semi-transparent, un visage (`face(cx, cy, kind)` : smile/happy/sleep/o) avec des joues roses. Les 4 gros symboles sont plus riches et plus colorés que les 4 petits.

### `ART3D_MODELS`, `KIT3D`, `CHARGE3D`, `STAGE3D` (machines en 3D)

Voir `references/3d.md`. Ils remplacent le contenu d'`ART` une fois les planches cuites (`ART.SYMS`, `ART.SCAT` et les `VARIANTES` deviennent des `<i class="s3d">` avec deux planches d'images). Toute chaîne d'`ART` doit donc pouvoir être soit un `<svg>`, soit un `.s3d` : ne suppose jamais qu'elle commence par `<svg`, sauf pour un `.replace('<svg', …)` purement décoratif.

### `FX` (canevas `#fx`)

`burst(type, x, y, n, vitesse)`, `rain(type, durée, densité)`, `stopRain()`, `firework(x, y)`, `center(el) -> [x, y]`, `W()`, `H()`. Les types de particules sont au thème (`star`, `spark`, `dust`, `shoot` ; `leaf`, `acorn`, `spore`…). Ne rien faire si `prefers-reduced-motion`.

### `WORLD`

`A` : les SVG des habitants et des décors. `build()` les place dans `section.floor` (et dans le topper s'il y a une mascotte). Les animations sont en CSS : déplacement du conteneur (`@keyframes xxMove`), retournement du corps (`xxBody`), pattes (`.legs .l1/.l2`), queue, clignement des yeux, tête qui se tourne. Les positions utilisent `--k` pour grandir sur les écrans larges.

### Interface (IIFE finale)

État `S = { balance: 1000, betIdx, busy, auto, turbo, ante }`, mises `BETS = [0.2 … 20]`, `sleep` qui tient compte du turbo et des mouvements réduits.

- Jeu de base : `spin()` → `revealBase(g)` (chute colonne par colonne, suspense dès 2 scatters) → gains (`win`, `mediumWin`, `bigWin` selon `WIN_TIERS` : 20/50/150/500 fois la mise) → `presentScatters` → `runBonus(tier, bought, count)`.
- Bonus : `introBonus` (médailles de scatter, titre, explication, bouton Commencer), puis la boucle `while (!b.done) { const ev = E.bonusSpin(b); …animer… }`, `bigWin` à la fin, fenêtre de résultat, retour au jeu de base.
- Autour : `openBuy`/`buy` (achat : on force `tier` scatters sur une grille de base), `chooseAuto`/`autoLoop`, `showRules` (tables de gains calculées depuis `ENGINE`, fréquences depuis `scatProbs`), `noCredits` (recharge de 1 000 crédits fictifs), et la barre d'espace pour lancer.

## Sortir du gabarit (moteur neuf)

Quand l'idée ne rentre pas dans la grille 6×6 en chemins (autre taille de grille, grappes, cascades, fonctions aléatoires, jauge qui persiste, bonus à choix…), écris un moteur neuf en gardant ce contrat. Dead City (`jeux/dead-city.html`) en est l'exemple complet.

- **Toujours présents** : `SYMS`, `TIER` (avec `cap`), `BUY`, `ANTE`, `scatProbs(mode, w)`, `newBonus(tier)`, `bonusSpin(b)` (qui fait monter `b.raw` et passe `b.done` à true), les accesseurs `SCAT_W`, `BASE_SCALE`, `BONUS_K`, et les deux marqueurs du bloc `ENGINE`.
- **Jeu de base à cascades ou à état** : `playBase(état, mode)` joue un spin complet et renvoie toutes les étapes à animer. `analyticBase(mode, scale)` renvoie l'espérance d'un spin par simulation **à graine fixe**, mise en cache par valeur de `SCAT_W` (sinon la dichotomie de `rtp.js` tremble). `fullBase(mode)` joue un spin avec un état persistant et renvoie `{ total, scats }`, pour la ligne « base simulée » de `rtp.js`.
- **Calibrage** : `rtp.js --calibre --freq N` fixe la fréquence du bonus (un spin sur N), puis ajuste `BASE_SCALE` pour que le jeu de base comble le reste du RTP. La ligne `let BASE_SCALE = {…};` doit alors tenir sur une ligne.
- **Bonus au gain moyen connu** (pari équitable, prime fixe) : déclare `EXACT_K = { tier: valeur }`. `rtp.js` l'utilise à la place de la simulation, ce qui retire tout bruit statistique.
- **Bonus à choix** : `bonusSpin(b, choix)`. Pour que le RTP ne dépende pas du joueur, rends chaque choix **équitable**, c'est-à-dire que continuer ne change pas l'espérance du gain (exemple de Last Stand : ×1,3 à 55 %, ×1,6 à 15 %, ×0,15 à 30 %). La simulation joue la politique par défaut (sans argument). Dans la page, marque le choix par défaut avec `data-auto` : `check.js` le clique.
- **Ce qui paie** : vise 20 à 30 % de spins gagnants, et une cascade doit rarement en déclencher plus de 2 ou 3. Sur une grille 5×5, les chemins font gagner presque à chaque spin : préfère les grappes (5 cases ou plus qui se touchent).
- **Effets** : même avec des cascades en chaîne, limite les particules à quelques-unes par étape (une énorme grappe ne doit pas recouvrir l'écran).
