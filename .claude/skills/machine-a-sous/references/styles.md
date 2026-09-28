# Styles de machines

Une machine a un **style visuel**, en plus de son thème. Le même thème (une mine, un train, une ville zombie) peut se traiter en cartoon tout doux ou en premium sombre et réaliste. Choisis le style dans le brief, puis applique sa fiche : palette, polices, cadre, tuiles, symboles, surbrillance des gains et barre de commande.

On s'inspire d'une **ambiance**, jamais d'un jeu précis. On ne reprend ni le nom, ni le logo, ni les personnages, ni la mise en page exacte d'une machine du commerce. Si on te montre une capture, décris ce qui fait son effet (matières, lumière, cadrage, rythme) et recrée-le avec tes propres dessins.

---

## 1. Cartoon doux (Champi Pop, Constella)

- **Effet** : livre d'images, personnages ronds avec un visage, couleurs chaudes, tout bouge un peu.
- **Palette** : 2 couleurs de fond proches (bois et crème, nuit et lavande), un accent vif, une encre sombre et teintée (jamais du noir pur) pour les contours.
- **Polices** : Chewy ou Baloo 2 pour les titres, Baloo 2 pour le texte.
- **Cadre** : bois, toit ou dôme au-dessus de la machine, coins arrondis (22 à 30 px), contour d'encre épais.
- **Symboles** : tous des personnages avec des joues roses, petits comme gros, sur des cases claires.
- **Gains** : case qui s'écrase et rebondit, contour doré, particules douces (étoiles, feuilles).
- **3D** : matériau toon et contour d'encre (le kit par défaut).

## 2. Premium sombre, industriel

Pour les thèmes de braquage, de train, de science-fiction ou de mafia : ce que les studios haut de gamme font de plus spectaculaire.

- **Effet** : une machine massive, en métal, faite de tuyaux, de rivets, de jauges et d'écrans. Au centre, une grille de **tuiles carrées bien nettes**. Les gros symboles sont des **portraits** de personnages, chacun sur **sa couleur** de fond. Le décor autour reste sombre et chargé de détails, avec des lumières néon cyan et ambre.
- **Palette** : fond `#0B1016` / `#141C24`, métal `#3A4652` → `#9AA8B4` (dégradés), accent néon `#35E0E6`, or `#F2B540` pour le logo et l'achat, tuiles des personnages `#2FA84A` (vert), `#C8342A` (rouge), `#2E6FD8` (bleu), `#E07A1E` (orange), et `#1A2028` pour les petits symboles.
- **Polices** : Teko, Oswald ou Bebas Neue (majuscules serrées) pour le logo et les chiffres, Barlow pour le texte. Les chiffres en `tabular-nums`.
- **Logo** : lettres dorées biseautées (dégradé vertical `#FFF1B8 → #F2B540 → #8A5A10`, contour sombre, reflet blanc en haut), avec un bandeau en dessous : « GAIN MAX 50 000× ».
- **Cadre** : de chaque côté, un montant métallique avec des rivets (`radial-gradient`), un tuyau (bande en dégradé cylindrique `linear-gradient(90deg, sombre, clair 40 %, sombre)`), une jauge ronde et une lampe néon. Un ornement à gauche (crâne mécanique, moteur, coffre-fort), dessiné en SVG ou en 3D. Coins peu arrondis (6 à 10 px) : ici, on veut des angles.
- **Tuiles** : chaque case est une tuile carrée à coins de 4 à 6 px, avec un liseré clair de 1 px en haut (`box-shadow: inset 0 1px 0 rgba(255,255,255,.25)`) et une ombre interne en bas. Personnages : fond dégradé radial de leur couleur. Petits symboles : fond `#1A2028`.
- **Symboles** : les 4 petits sont les **couleurs des cartes** (pique, cœur, carreau, trèfle) en « bonbon » brillant, chacun dans sa couleur. Les 4 gros sont des **bustes** de personnages expressifs : regard de face, épaules cadrées, accessoire marquant (masque, lunettes, chapeau, cicatrice). Les jokers et les spéciaux portent un **cadre doré** et une étiquette en majuscules.
- **Gains** : la tuile s'allume (contour néon de sa couleur plus un halo), les autres s'assombrissent à 30 %, et des étincelles métalliques jaillissent. Pas de rebond cartoon : un léger zoom (1,06) suffit.
- **Barre de commande** : une **bande fine** tout en bas, en métal sombre, avec de petites icônes : menu, mise −/+ (et « MISE » en tout petit dessous), turbo, un **bouton de spin rond au centre** (flèche circulaire), auto, puis GAIN et SOLDE en chiffres. Le bouton d'**achat** est une **pastille ronde en métal** posée à gauche de la grille (anneau métallique, texte doré). Voir « La barre de studio » plus bas.
- **Mécaniques qui vont bien** : symboles d'argent qui affichent une valeur et restent collés (hold & win, 3 respins remis à zéro à chaque nouveau symbole), collecteurs qui ramassent les valeurs, multiplicateurs qui doublent une ligne.
- **3D** : matériaux PBR (`K.pbr`), métal et plastique brillant, sans contour d'encre (`ink: 0`), et une lumière de contour forte, cyan d'un côté et ambre de l'autre. Les bustes sont semi-réalistes : proportions plus justes que le cartoon, pas de joues roses, un vrai regard.

## 3. Mine et western, bois et feu

Pour les thèmes de mine, de chercheurs d'or, de western, de pirates ou de trésors.

- **Effet** : un cadre en **poutres de bois** dans une grotte ou un canyon. Beaucoup de colonnes, et un nombre de lignes qui **varie par rouleau** (comme les « megaways »). Un compteur de façons de gagner gravé sur une plaque en bois. Les gains s'enflamment : **contours orange incandescents** et braises.
- **Palette** : bois `#5A3A1E` → `#A8743A`, roche `#2A2420` / `#4A4038`, feu `#FF8A1F` / `#FFD27A`, or `#E8B040`, cristaux `#B98AE8` en touches, texte crème `#F4E6CC`.
- **Polices** : Rye ou Sancreek pour le logo (lettrage de saloon), Alfa Slab One ou Roboto Slab pour les chiffres et les étiquettes.
- **Cadre** : grille entourée de poutres (dégradé bois, veines en `repeating-linear-gradient`, clous aux coins), et une **plaque gravée** en haut à gauche : « 46 656 FAÇONS » (le produit des hauteurs des rouleaux, mis à jour à chaque spin). Au fond : roche sombre, tonneaux, cristaux violets et lanternes.
- **Symboles** : les petits sont les **figures des cartes** (10, V, D, R, A, ou 9, 10, J, Q, K), **gravées dans la pierre ou le métal**, gris clair biseautés avec un léger relief et chacune un liseré de couleur. Les gros sont les **outils du thème** : carte au trésor, dynamite, bottes, pioche, lanterne, sac d'or. Le joker est une caisse de dynamite marquée WILD, et le scatter une pièce d'or gravée d'un S.
- **Rouleaux variables** : chaque colonne tire sa hauteur (2 à 7 cases), et les cases s'étirent pour remplir la colonne. Gains en façons (comme les chemins du gabarit) : le produit des nombres d'occurrences. C'est l'occasion de brancher un moteur neuf (voir « Sortir du gabarit » dans `architecture.md`).
- **Gains** : contour orange qui pulse (`box-shadow` animé : `0 0 0 2px #FFB040, 0 0 18px #FF7A1F`), braises qui montent, secousse légère sur les gros gains. Les jokers peuvent **exploser** et transformer leurs voisines.
- **Bonus qui vont bien** : pièces avec des valeurs qui remplissent une grille (avec des multiplicateurs ×2 à ×100), chariot de mine qui avance sur des rails (jauge), explosions en chaîne.
- **Interface** : les libellés en petites majuscules dans les coins (MISE, COÛT TOTAL, GAIN TOTAL, SOLDE), avec les chiffres en dessous, et des boutons ronds en métal.
- **3D** : bois et roche en toon avec un contour fin (0,03), métal en PBR, flammes et braises en émissif, et une lumière chaude venant d'en bas (les lanternes).

## 4. Néon arcade

Pour les thèmes rétro, synthwave, bonbons, fête foraine ou espace pop.

- **Effet** : une borne d'arcade des années 80 : tubes néon, grille en perspective au sol, soleil rayé, écran CRT légèrement courbé avec des lignes de balayage.
- **Palette** : fond `#0A0620`, magenta `#FF2BD6`, cyan `#20F0FF`, jaune `#FFE45C`, violet `#7A3CFF`.
- **Polices** : Monoton ou Bungee Shade pour le logo, Orbitron ou Chakra Petch pour les chiffres.
- **Cadre** : tubes néon en SVG (`stroke` épais plus `filter: drop-shadow` de la même couleur en 2 ou 3 couches), scintillement irrégulier (`@keyframes` à paliers), écran avec `repeating-linear-gradient` de lignes fines à 6 % d'opacité.
- **Symboles** : fruits et 7 revisités en néon, ou personnages en pixel art (grilles de `rect` SVG). Surbrillance des gains : le néon passe à pleine intensité et clignote.
- **3D** : émissif fort, contour néon (`inkMat` teinté de la couleur au lieu de l'encre), fond noir.

---

## La barre de studio (styles 2 et 3)

À la place du tableau de commande cartoon, garde les mêmes identifiants (`spin`, `betDown`, `betUp`, `bet`, `balance`, `lastWin`, `autoBtn`, `turboBtn`, `buyBtn`, `anteBtn`) : l'interface commune continue de marcher.

```html
<div class="studio">
  <button class="sb" id="menuBtn" aria-label="Règles et gains">≡</button>
  <div class="sbet"><button class="sb" id="betDown" aria-label="Baisser la mise">−</button><b id="bet">1,00</b><button class="sb" id="betUp" aria-label="Augmenter la mise">+</button><small>MISE</small></div>
  <button class="sb" id="turboBtn" aria-pressed="false" aria-label="Mode turbo">»</button>
  <button class="spin" id="spin" aria-label="Lancer">⟳</button>
  <button class="sb" id="autoBtn" aria-label="Spins automatiques">▶</button>
  <div class="sval"><b id="lastWin">0,00</b><small>GAIN</small></div>
  <div class="sval"><b id="balance">5 000,00</b><small>SOLDE</small></div>
</div>
<button class="buyBadge" id="buyBtn">ACHAT</button> <!-- pastille ronde en métal, posée à gauche de la grille -->
```

```css
.studio{display:grid; grid-template-columns:auto 1fr auto auto auto 1fr 1fr; align-items:center; gap:6px; padding:6px 10px;
  background:linear-gradient(#1A2028,#0B1016); border-top:1px solid #3A4652; border-radius:0 0 10px 10px}
.studio small{display:block; font-size:.6rem; letter-spacing:.12em; color:#7A8A98; text-align:center}
.studio b{font-family:Teko,Oswald,sans-serif; font-size:1.3rem; color:#E8EEF2; font-variant-numeric:tabular-nums}
.sb{width:34px; height:34px; border-radius:50%; border:1px solid #3A4652; background:radial-gradient(circle at 40% 30%, #3A4652, #141C24); color:#C8D4DC}
.studio .spin{width:64px; height:64px; margin-top:-22px; border-radius:50%; border:3px solid #9AA8B4; background:radial-gradient(circle at 40% 30%, #4A5662, #0B1016); box-shadow:0 0 0 4px #141C24, 0 0 18px rgba(53,224,230,.35)}
.buyBadge{position:absolute; left:-18px; bottom:18%; width:74px; height:74px; border-radius:50%; font-family:Teko,sans-serif; font-size:1.5rem; color:#F2B540;
  background:radial-gradient(circle at 40% 30%, #4A5662, #141C24); border:4px solid #9AA8B4; box-shadow:0 0 0 3px #0B1016, 0 6px 14px rgba(0,0,0,.6)}
@media (max-width:420px){ .studio{grid-template-columns:auto 1fr auto auto auto; row-gap:4px} .studio .sval{grid-column:span 2} }
```

À 390 px de large, la barre passe sur deux lignes : les commandes en haut, gain et solde en dessous. Vérifie-la sur la capture téléphone de `check.js`.

## Les tuiles colorées (style 2)

```css
.cell{border-radius:5px; border:1px solid rgba(0,0,0,.6); box-shadow:inset 0 1px 0 rgba(255,255,255,.22), inset 0 -8px 14px rgba(0,0,0,.35)}
.cell.t-vert{background:radial-gradient(circle at 50% 35%, #5FD86A, #1E7A2E)} .cell.t-rouge{background:radial-gradient(circle at 50% 35%, #F2644A, #8A1E14)}
.cell.t-bleu{background:radial-gradient(circle at 50% 35%, #6AA8FF, #1A3E8A)}  .cell.t-orange{background:radial-gradient(circle at 50% 35%, #FFB050, #9A4A0A)}
.cell.t-bas{background:radial-gradient(circle at 50% 35%, #2A323C, #10151C)}
```

Dans `baseCell` / `setCell`, ajoute la classe de tuile selon le symbole (`TILE = ['t-bas','t-bas','t-bas','t-bas','t-vert','t-rouge','t-bleu','t-orange']`).
