/* Kleinhausener See — nature, recycling, weil/deshalb */
KH.start({
  id: 'see',
  prefix: 'SEE',
  title: 'Kleinhausener See',
  place: 'am See',
  level: 'B1',
  blurb: {
    de: 'Spazier am See, benenne die Natur, sortiere Müll richtig und schreib einen Satz mit „weil“ oder „deshalb“ zum Umweltschutz.',
    en: 'Walk by the lake, name nature words, sort recycling, and write a “weil” / “deshalb” sentence about the environment.'
  },
  how: [
    { de: 'Steg → Bäume → Enten → Recyclingstation.', en: 'Pier → trees → ducks → recycling station.' },
    { de: 'weil + Verb am Ende; deshalb + normale Stellung.', en: 'weil sends the verb to the end; deshalb does not.' }
  ],
  spawn: { x: 0, z: 6.5, yaw: 0 },
  bounds: { minX: -14, maxX: 14, minZ: -14, maxZ: 10 },
  sky: 0x7eb6d9,
  fogFar: 60,
  vocab: [
    { de: 'der See', en: 'the lake' },
    { de: 'der Steg', en: 'the pier' },
    { de: 'die Ente', en: 'the duck' },
    { de: 'das Schilf', en: 'the reeds' },
    { de: 'der Müll / recyceln', en: 'trash / to recycle' },
    { de: 'Glas, Papier, Plastik, Bio', en: 'glass, paper, plastic, organic' },
    { de: 'weil / deshalb', en: 'because / therefore' }
  ],
  build: function (w) {
    w.box(32, 0.08, 18, { x: 0, y: 0.02, z: 4, color: 0x4E8B5C, collide: false, map: KH.tex.gras() });
    w.box(32, 0.05, 16, { x: 0, y: 0.01, z: -10, color: 0x2A63A8, collide: false, map: KH.tex.wasser() });
    /* keep player out of deep water */
    w.obstacles.push({ kind: 'circ', x: 0, z: -10, r: 7.5 });
    w.box(8, 0.12, 1.4, { x: 0, y: 0.12, z: -2.2, color: 0x6B4423, collide: false });
    w.hotspot({ id: 'steg', x: 0, z: -1.6, r: 1.5, label: 'der Steg' });
    KH.furn.tree(w, -6, 5);
    KH.furn.tree(w, -8, 2);
    KH.furn.tree(w, 7, 4);
    KH.furn.tree(w, 9, 1);
    w.hotspot({ id: 'baum', x: -6, z: 5, r: 1.5, label: 'ein Baum' });
    w.cyl(0.18, 0.2, { x: 3.2, y: 0.15, z: -0.8, color: 0x3a2a10, collide: false });
    w.cyl(0.22, 0.12, { x: 3.5, y: 0.22, z: -0.5, color: 0xc9a227, collide: false });
    w.hotspot({ id: 'ente', x: 3.4, z: -0.6, r: 1.3, label: 'die Ente' });
    w.box(1.2, 0.9, 0.4, { x: -3, y: 0.5, z: 0.2, color: 0x6a8f4e, collideR: 0.5 });
    w.label('Schilf', { x: -3, y: 1.3, z: 0.2, scale: 0.8 });
    KH.furn.bin(w, 6, 7.2, 0x2A63A8, 'Glas');
    KH.furn.bin(w, 7.4, 7.2, 0xF2C230, 'Papier');
    KH.furn.bin(w, 8.8, 7.2, 0x888888, 'Plastik');
    KH.furn.bin(w, 10.2, 7.2, 0x3E8E4E, 'Bio');
    w.hotspot({ id: 'muell', x: 8, z: 7.2, r: 2.2, label: 'Recycling' });
    w.box(1.8, 1.6, 0.1, { x: -8, y: 1.1, z: 7.5, color: 0x123E77, collide: false });
    w.label('Umweltschutz', { x: -8, y: 2.1, z: 7.5, scale: 1.1 });
    w.hotspot({ id: 'schild', x: -8, z: 6.6, r: 1.3, label: 'Infotafel' });
    KH.furn.bench(w, 0, 4);
    w.npc({ id: 'ranger', x: -1.2, z: 6.5, name: 'Frau Sowinski', color: 0x3E8E4E, hair: 0x4a3018, facing: Math.PI });
  },
  tasks: [
    {
      id: 'steg', title: 'Am Steg', hotspot: 'steg', kind: 'quiz', where: 'Steg',
      de: 'Geh auf den Steg und schau aufs Wasser.',
      en: 'Walk onto the pier and look at the water.',
      question: { de: 'Welcher Artikel? ___ See ist still am Morgen.', en: 'Which article? ___ lake is quiet in the morning.' },
      options: [
        { de: 'der See', ok: true },
        { de: 'die See', ok: false, tip: { de: 'der See = lake. die See = the sea (north).', en: 'der See = lake; die See = sea.' } },
        { de: 'das See', ok: false }
      ]
    },
    {
      id: 'baum', title: 'Natur', hotspot: 'baum', kind: 'inspect', where: 'Uferweg',
      de: 'Bleib unter einem Baum stehen.',
      en: 'Stand under a tree.',
      inspectDe: 'Ein alter Baum. Vögel singen. Hinter dir wächst Schilf am Ufer.',
      inspectEn: 'An old tree. Birds sing. Behind you, reeds grow on the bank.',
      flavor: { de: '„Bitte bleibt auf dem Weg — das Schilf ist ein Nest für Enten.“', en: '“Please stay on the path — the reeds are a nest for ducks.”' }
    },
    {
      id: 'ente', title: 'Tiere', hotspot: 'ente', kind: 'quiz', where: 'Ufer',
      de: 'Eine Ente schwimmt nah am Steg.',
      en: 'A duck is swimming near the pier.',
      question: { de: 'Wie heißt das Tier?', en: 'What is the animal called?' },
      options: [
        { de: 'die Ente', ok: true },
        { de: 'der Kühlschrank', ok: false },
        { de: 'das Gleis', ok: false }
      ]
    },
    {
      id: 'muell', title: 'Recycling', hotspot: 'muell', kind: 'sort', where: 'Recyclingstation',
      de: 'Sortiere den Müll in die richtigen Behälter.',
      en: 'Sort the trash into the correct bins.',
      wrongDe: 'Schau nochmal: Glas, Papier, Plastik, Bio — nicht mixen.',
      items: [
        { id: 'flasche', de: 'eine leere Glasflasche', en: 'empty glass bottle', bin: 'glas' },
        { id: 'zeitung', de: 'eine Zeitung', en: 'a newspaper', bin: 'papier' },
        { id: 'becher', de: 'ein Plastikbecher', en: 'a plastic cup', bin: 'plastik' },
        { id: 'apfel', de: 'ein Apfelrest', en: 'an apple core', bin: 'bio' }
      ],
      bins: [
        { id: 'glas', de: 'Glas' },
        { id: 'papier', de: 'Papier' },
        { id: 'plastik', de: 'Plastik' },
        { id: 'bio', de: 'Bio' }
      ]
    },
    {
      id: 'weil', title: 'weil / deshalb', hotspot: 'schild', kind: 'write', where: 'Infotafel',
      de: 'Lies die Tafel und schreib mindestens acht Wörter. Benutze „weil“ (Verb ans Ende).',
      en: 'Read the sign and write at least eight words. Use “weil” (verb to the end).',
      minWords: 8,
      mustInclude: ['weil'],
      chunks: ['Wir schützen', 'den See', ',', 'weil', 'Tiere', 'hier', 'leben', 'und', 'das Wasser', 'sauber', 'bleiben soll.'],
      placeholder: 'Ich recycel, weil …'
    }
  ]
});
