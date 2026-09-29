// ---------- PARTITIONS : le morceau de chaque machine (lu par MUSIQUE, voir references/musique.md) ----------
// key : tonique en MIDI (60 = do4) ; scale : major, minor, dorian, lydian, harmonic, mixo ; prog : [degré, extension] par mesure
// sound : keys (accompagnement), comp (façon de jouer : chords, broken, sparse, waltz), lead (mélodie), bass (soft, pulse), drums (lofi, brush, waltz, drive, none), arp
const PARTITIONS = {
  // Champi Pop : balade d'automne, piano électrique et marimba, un groove tout doux
  'champi-pop': { key: 65, scale: 'major', bpm: 84, beats: 4, swing: 0.14, seed: 11, bright: 5200, reverb: 2.4,
    prog: [[1, 'maj7'], [6, '7'], [2, '7'], [5, 'sus9'], [1, 'maj7'], [3, '7'], [4, 'maj7'], [5, '7']],
    sound: { keys: 'epiano', comp: 'chords', lead: 'mallet', bass: 'soft', drums: 'lofi', arp: true, arpInst: 'mallet', padBright: 700 },
    bonus: { bpm: 100, sound: { drums: 'lofi', arpInst: 'musicbox' }, prog: [[4, 'maj7'], [5, '6'], [3, '7'], [6, '7'], [2, '7'], [5, 'sus9'], [1, 'maj9'], [1, 'maj9']] } },
  // Constella : nuit étoilée, nappes, boîte à musique, presque pas de batterie
  'constella': { key: 62, scale: 'major', bpm: 70, beats: 4, swing: 0.08, seed: 23, bright: 4800, reverb: 3.4,
    prog: [[1, 'maj9'], [6, '9'], [4, 'maj9'], [5, 'sus'], [1, 'maj9'], [3, '7'], [4, 'maj9'], [4, 'maj9']],
    sound: { keys: 'musicbox', comp: 'sparse', lead: 'flute', bass: 'soft', drums: 'brush', arp: true, arpInst: 'musicbox', padBright: 800 },
    bonus: { bpm: 82, sound: { keys: 'epiano', comp: 'chords', lead: 'musicbox' } } },
  // Dead City : nuit tendue mais écoutable, basse qui pulse, piano sombre
  'dead-city': { key: 57, scale: 'minor', bpm: 90, beats: 4, swing: 0.05, seed: 37, bright: 3800, reverb: 2.8,
    prog: [[1, '9'], [6, 'maj7'], [3, 'maj7'], [7, ''], [1, '9'], [6, 'maj7'], [4, '7'], [5, 'sus']],
    sound: { keys: 'epiano', comp: 'sparse', lead: 'harp', bass: 'pulse', drums: 'lofi', arp: true, arpInst: 'mallet', padBright: 550 },
    bonus: { bpm: 112, sound: { drums: 'drive', comp: 'chords' } } },
  // Masquerade : valse baroque à trois temps, harpe, cordes, boîte à musique
  'masquerade': { key: 62, scale: 'harmonic', bpm: 84, beats: 3, swing: 0, seed: 5, bright: 5000, reverb: 3.2,
    prog: [[1, ''], [4, ''], [5, '7'], [1, ''], [6, ''], [4, ''], [5, '7'], [1, '']],
    sound: { keys: 'harp', comp: 'waltz', lead: 'musicbox', bass: 'soft', drums: 'waltz', arp: true, arpInst: 'harp', padBright: 900 },
    bonus: { bpm: 104, sound: { lead: 'flute', arpInst: 'musicbox' } } },
};
if (typeof module !== 'undefined') module.exports = PARTITIONS;
