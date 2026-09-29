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

## 5. Gravure baroque (Masquerade of Madness)

Pour les thèmes de bal masqué, de vampires, d'opéra, de cour royale décadente ou de gothique : l'esthétique des gravures à l'eau-forte.

- **Effet** : aucune couleur de casino. Noir presque absolu, ivoire et argent vieilli, et **un seul rouge carmin**, très intense, réservé à ce qui compte (le sang, les lèvres, les jokers rouges, le bouton de spin). Beaucoup de détails fins : hachures, dentelle, perles, filigranes. Une élégance qui devient inquiétante.
- **Palette** : noir `#050407` / `#0A080C`, velours `#1E1A22`, ivoire `#EFE8DA`, argent `#B9B3A8` → `#6E6962`, carmin `#C8102E` / `#FF2340`, sang `#6A0010`.
- **Polices** : Cinzel Decorative pour le logo et les titres, Cinzel pour les chiffres et les étiquettes (petites majuscules espacées), Cormorant Garamond (italique) pour le texte.
- **Hachures** : en CSS, une trame `repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 1px, transparent 1px 4px)` sur les fonds ; en SVG, des `<pattern>` de traits fins (`mHatch`, `mHatchL`) posés en calque sur le côté ombré de chaque forme. C'est ce qui donne l'effet gravé.
- **Cadre** : laque noire à liseré d'argent, montants gravés (dégradé cylindrique argent + rainures), chandelles allumées aux coins ; les colonnes de la grille sont des **miroirs baroques** (fond vitré sombre avec un reflet en biais, haut en arche).
- **Tuiles** : style 2, mais en noir, ivoire, argent, carmin et sang. Les petits symboles sont des **lettres de cartes gravées** (10, J, Q, K, A) en Cinzel Decorative, remplies d'un dégradé argent ou carmin, avec leur enseigne au-dessus et un filigrane dessous.
- **Symboles** : bustes de personnages masqués (loup vénitien, coiffe de bouffon à clochettes, tricorne, chignon à plumes), crâne couronné, rose qui saigne. Le joker est un **masque fendu en deux** ; le scatter, un masque moitié argent, moitié carmin.
- **Décor vivant** : salle de bal (rideaux rouges, lustres, tableaux, statues, damier), invités masqués en silhouette. Une jauge qui descend change le décor par paliers (classes `s75`, `s50`, `s25`, `mad` sur `body`) : les invités bougent, les masques sourient, les tableaux regardent, les roses blanches rougissent, les bougies passent au rouge.
- **Musique** : clavecin (corde pincée très brillante), basse continue, menuet à trois temps en mineur ; la valse du bonus avec cordes et timbales ; une boîte à musique désaccordée pour la folie, des rires lointains.
- **3D** : toon à contour fin (0,03), ivoire, noir et carmin, argent en PBR, bougies émissives et lumières chaudes ponctuelles.
- **Perspective (la touche « design de fou »)** : la machine vit dans l'espace, en CSS 3D.
  - `main{perspective:1400px}` et un plateau `.rig{transform-style:preserve-3d; transform:rotateX(var(--rx)) rotateY(var(--ry))}` qui suit la souris ou le gyroscope (lissage à 5 % par image), avec un léger balancement quand personne ne touche. Coupé si `prefers-reduced-motion`.
  - Chaque couche a sa profondeur (`translateZ`) : enseigne +46 px, pastilles et message +44, colonnes du cadre +30, ornements d'angle et drapé +22 à +26, grille +10. **Rien ne doit reculer (Z négatif) derrière un parent opaque** : en 3D partagée, le fond du parent le cacherait.
  - **Écran incurvé** : `perspective` sur `.grid`, et chaque colonne tournée vers le centre (`rotateY` ±17° et ±8°, `translateZ` +26 et +7 px pour les bords). Une case gagnante avance de 18 px. Les animations des cases se font sur leur contenu (`.cell>*`), jamais sur la case elle-même.
  - **Décor en plans** : le fond en trois SVG (mur, invités, rideaux) décalés de 14, 30 et 60 px selon la même inclinaison, plus des faisceaux de lumière (`conic-gradient` en `mix-blend-mode:screen`), une brume au sol et de la poussière qui monte.
  - **Théâtre** : ornements d'angle en SVG, masque en clé de voûte, drapé de velours à pompons qui se balancent, plancher en damier en perspective sous la grille (`perspective(260px) rotateX(62deg)` + `mask-image`), cadre en moulures successives (`box-shadow` en anneaux argent/noir), logo en relief (une copie derrière avec des `text-shadow` étagés, la face dessus en dégradé métal).

---

## La barre de studio (styles 2, 3 et 5)

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

## 6. Encre de manhwa (Murim : Heavenly Demon)

Pour les thèmes d'arts martiaux, de wuxia, de cultivation, de sectes et de démons célestes : l'esthétique des manhwas Murim premium.

- **Effet** : encre noire, papier, **rouge sang** et quelques touches d'or. Traits nets, contrastes forts, énormes manifestations de Qi (auras, lignes de vitesse, éclats), calligraphie. Jamais de couleurs de casino.
- **Palette** : encre `#070608`, nuit `#0C0B0E` / `#16141A`, papier `#F2ECDF` / `#D9CFBC`, sang `#B3141F` / `#E8202F` / `#5A060C`, or `#D8A845` / `#F7D98A` / `#8A6420`.
- **Polices** : Zhi Mang Xing (pinceau) pour les caractères chinois et les grandes annonces, Teko pour les chiffres et les étiquettes, Spectral (italique) pour le texte.
- **Cadre** : pagode laquée noire aux avant-toits relevés, plaque dorée, **sceau rouge** (天魔) légèrement de biais, montants rouges laqués, pompons qui se balancent.
- **Tuiles** : les petits symboles sont des objets du Jianghu (pièce trouée, parchemin, talisman, gourde, lotus) ; les gros, des **bustes de maîtres** au visage de manhwa (yeux en amande très fins, sourcils en trait de pinceau, menton pointu), chacun sur un fond de couleur (papier, or, nuit, sang, ciel). Le joker est un caractère 氣 doré, le scatter un **manuel interdit** enchaîné.
- **Mise en scène** : chaque temps fort a son caractère au pinceau qui jaillit (`.pow.brush` : 天魔一指, 八門開, 天龍, 禁) ; la frappe du héros = sa figure qui descend au-dessus de la grille, **une ligne noire** qui traverse l'écran, des gouttes de sang, puis la grille qui se fend (`.grid.shatter`). Tout ce qui passe devant les cases courbées reçoit `translate:0 0 90px` (sinon, en 3D partagée, il passe derrière).
- **Décor vivant** : la montagne sacrée (pics de granit, mer de nuages, pavillon, cerisiers, pétales qui tombent en continu, pluie la nuit). Il **évolue avec la progression** : six mondes superposés (`.world.w0`…`w5`) dont un seul est visible selon la classe `scN` de `body`, avec un fondu de 1,8 s.
- **3D** : toon à contour d'encre (0,035), bustes avec cheveux en mèches effilées, yeux en amande (sphères très aplaties), auras en disques émissifs transparents, or et acier en PBR. Les objets et le joker gardent leur dessin 2D.

