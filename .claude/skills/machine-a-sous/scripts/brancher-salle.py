#!/usr/bin/env python3
"""Branche une machine (version 2D, avant passer-en-3d.py) sur la Promenade : porte-monnaie commun en lucioles
et statistiques pour les records et les trophées.

    python3 brancher-salle.py jeux/<nom>.html <id>

- ajoute le module SALLE (localStorage, clé « promenade.* ») juste avant l'interface ;
- le solde de départ vient du porte-monnaie commun (5 000 lucioles s'il est vide) et y retourne à chaque changement ;
- compte les spins, les gains (meilleur gain et meilleur multiplicateur), les bonus déclenchés et achetés ;
- remplace « crédits » par « lucioles » dans les textes visibles.
Relançable sans risque : une machine déjà branchée est laissée telle quelle.
Les trophées propres à une machine s'ajoutent à la main avec SALLE.flag('clé') ou SALLE.compte('clé')
(voir les exemples de EXTRAS ci-dessous) ; la Promenade lit ces clés dans app/catalogue.json.
"""
import sys, re

path, jeu = sys.argv[1], sys.argv[2]
s = open(path).read()
if 'const SALLE = (() =>' in s:
    print(f'{path} : déjà branchée'); sys.exit(0)

def rep(old, new, count=1, required=True):
    global s
    n = s.count(old)
    if n != count:
        if required: sys.exit(f'{path} : motif trouvé {n} fois au lieu de {count} : {old[:70]}')
        return
    s = s.replace(old, new)

SALLE = """// ---------- la Promenade : porte-monnaie commun (lucioles) et statistiques, partagés entre toutes les machines ----------
const SALLE = (() => {
  const JEU = '%s', P = 'promenade.';
  const get = (k, d) => { try { const v = localStorage.getItem(P + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} };
  const up = f => { const all = get('stats', {}); const j = all[JEU] = all[JEU] || { spins: 0, meilleur: 0, meilleurX: 0, bonus: {}, achats: {}, flags: {}, compte: {} }; f(j); set('stats', all); };
  return {
    solde: d => { const v = get('lucioles', null); return typeof v === 'number' && isFinite(v) && v >= 0 ? v : d; },
    garder: v => set('lucioles', Math.round(v * 100) / 100),
    spin: () => up(j => { j.spins++; }),
    gain: (v, mise) => { if (v > 0) up(j => { j.meilleur = Math.max(j.meilleur, v); j.meilleurX = Math.max(j.meilleurX, v / mise); }); return v; },
    bonus: (tier, achete) => up(j => { j.bonus[tier] = (j.bonus[tier] || 0) + 1; if (achete) j.achats[tier] = (j.achats[tier] || 0) + 1; }),
    flag: k => up(j => { j.flags[k] = true; }),
    compte: (k, n = 1) => up(j => { j.compte[k] = (j.compte[k] || 0) + n; }),
  };
})();
""" % jeu

rep("(() => {\nconst E = ENGINE;", SALLE + "(() => {\nconst E = ENGINE;")
s = re.sub(r"const S = \{ balance: (\d+),", lambda m: f"const S = {{ balance: SALLE.solde({m.group(1)}),", s, count=1)
rep("function setMoney() { $('balance').textContent = fmt(S.balance);", "function setMoney() { SALLE.garder(S.balance); $('balance').textContent = fmt(S.balance);")
rep("S.balance -= cost(); setMoney();", "S.balance -= cost(); SALLE.spin(); setMoney();")
s, n = re.subn(r"\$\('lastWin'\)\.textContent = fmt\(([a-zA-Z0-9_.]+)\)", r"$('lastWin').textContent = fmt(SALLE.gain(\1, bet()))", s)
if n < 2: sys.exit(f'{path} : affichages du gain introuvables')
rep("async function runBonus(tier, bought, count) {\n  const b0 = bet();", "async function runBonus(tier, bought, count) {\n  const b0 = bet(); SALLE.bonus(tier, bought);")

# la monnaie : des lucioles
for a, b in [("<small>Crédits</small>", "<small>Lucioles</small>"), ("Plus de crédits", "Plus de lucioles"),
             ("recharger des crédits fictifs", "recharger des lucioles (monnaie fictive)"), ("'Recharger 5 000'", "'Recharger 5 000 lucioles'"),
             ("crédits ajoutés", "lucioles ajoutées"), ("} crédits (", "} lucioles ("), ("Crédits fictifs, aucun argent réel", "Lucioles : monnaie fictive, aucun argent réel")]:
    s = s.replace(a, b)
rep("</style>", """/* la luciole devant le solde */
.meter:first-child small::before{content:""; display:inline-block; width:7px; height:7px; margin-right:5px; vertical-align:1px; border-radius:50%; background:#FFF3A0; box-shadow:0 0 6px 2px rgba(255,236,120,.85)}
</style>""")

# trophées propres à chaque machine
EXTRAS = {
    'constella': [("st.counts[e.id] = (st.counts[e.id] || 0) + 1;", "st.counts[e.id] = (st.counts[e.id] || 0) + 1; SALLE.compte('constellations');")],
    'champi-pop': [("st.lv = Math.min(7, st.lv + 1);", "st.lv = Math.min(7, st.lv + 1); if (st.lv === 7) SALLE.flag('amanites');")],
    'dead-city': [("await cityFalls();", "SALLE.flag('ville'); await cityFalls();"), ("    if (ev.roof) {", "    if (ev.roof) { SALLE.flag('extraction');")],
}
for a, b in EXTRAS.get(jeu, []):
    n = s.count(a)
    if not n: sys.exit(f'{path} : motif de trophée introuvable : {a}')
    s = s.replace(a, b)

open(path, 'w').write(s)
print(f'{path} : branchée sur la Promenade ({jeu})')
