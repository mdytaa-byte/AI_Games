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
  spawn: { x: 0, z: 6.2, yaw: 0 },
  bounds: { minX: -14, maxX: 14, minZ: -14, maxZ: 10 },
  sky: 0x7eb6d9,
  outdoor: true,
  fogFar: 62,
  fogNear: 18,
  sunInt: 0.62,
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
    w.box(34, 0.08, 18, { x: 0, y: 0.02, z: 4, map: KH.tex.gras(), repeat: [16, 8], collide: false, cast: false });
    var water = w.box(34, 0.08, 16, { x: 0, y: 0.02, z: -10, map: KH.tex.wasser(), repeat: [6, 3], collide: false, cast: false, roughness: 0.18, metalness: 0.08 });
    w.tickers.push(function (now) {
      if (water && water.material && water.material.map) {
        var ox = Math.sin(now * 0.00035) * 0.04, oy = (now * 0.00004) % 1;
        water.material.map.offset.set(ox, oy);
        if (water.material.normalMap) water.material.normalMap.offset.set(ox, oy);
      }
    });
    w.obstacles.push({ kind: 'circ', x: 0, z: -10, r: 7.5 });
    var wood = KH.tex.holz();
    w.box(8.2, 0.1, 1.45, { x: 0, y: 0.12, z: -2.15, map: wood, repeat: [6, 1], collide: false });
    w.box(0.08, 0.55, 1.45, { x: -4.05, y: 0.4, z: -2.15, map: wood, collide: false });
    w.box(0.08, 0.55, 1.45, { x: 4.05, y: 0.4, z: -2.15, map: wood, collide: false });
    w.hotspot({ id: 'steg', x: 0, z: -1.55, r: 1.5, label: 'der Steg' });
    KH.furn.tree(w, -6.2, 5.1);
    KH.furn.tree(w, -8.4, 1.8);
    KH.furn.tree(w, 7.2, 4.1);
    KH.furn.tree(w, 9.4, 0.8);
    KH.furn.tree(w, -10.2, 6.4);
    KH.furn.tree(w, 11.2, 5.6);
    KH.furn.laterne(w, -4.5, 6.8);
    KH.furn.laterne(w, 4.8, 6.6);
    w.hotspot({ id: 'baum', x: -6.2, z: 5.1, r: 1.5, label: 'ein Baum' });
    /* ducks */
    [[3.3, -0.55], [2.6, -0.95], [4.1, -0.2]].forEach(function (d) {
      w.cyl(0.16, 0.12, { x: d[0], y: 0.12, z: d[1], color: 0xf4ead4, collide: false, seg: 8 });
      w.cyl(0.08, 0.1, { x: d[0] + 0.12, y: 0.22, z: d[1] + 0.08, color: 0x3a2a10, collide: false, seg: 8 });
      w.cyl(0.035, 0.05, { x: d[0] + 0.18, y: 0.2, z: d[1] + 0.14, color: 0xe07020, collide: false, seg: 6 });
    });
    w.hotspot({ id: 'ente', x: 3.4, z: -0.5, r: 1.3, label: 'die Ente' });
    [-3.4, -2.6, -3.0].forEach(function (rx, i) {
      w.cyl(0.07, 0.85 + i * 0.12, { x: rx, y: 0.45, z: 0.15 + i * 0.2, color: 0x4E8B5C, r2: 0.02, collide: false, seg: 6 });
    });
    w.label('Schilf', { x: -3.1, y: 1.25, z: 0.25, scale: 0.7 });
    KH.furn.bin(w, 6, 7.2, 0x2A63A8, 'Glas');
    KH.furn.bin(w, 7.4, 7.2, 0xF2C230, 'Papier');
    KH.furn.bin(w, 8.8, 7.2, 0x888888, 'Plastik');
    KH.furn.bin(w, 10.2, 7.2, 0x3E8E4E, 'Bio');
    w.hotspot({ id: 'muell', x: 8, z: 7.2, r: 2.2, label: 'Recycling' });
    w.poster(function (g, W, H) {
      g.fillStyle = '#123E77'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#F2C230'; g.font = 'bold 34px sans-serif'; g.textAlign = 'center';
      g.fillText('Umweltschutz', W / 2, 70);
      g.fillStyle = '#eff1ec'; g.font = '24px Georgia';
      g.fillText('Bitte den See', W / 2, 160);
      g.fillText('sauber halten.', W / 2, 210);
    }, { x: -8, y: 1.45, z: 7.35, w: 1.2, h: 1.5 });
    w.hotspot({ id: 'schild', x: -8, z: 6.55, r: 1.3, label: 'Infotafel' });
    KH.furn.bench(w, 0, 4);
    KH.furn.rug(w, 1.6, 3.2, 1.6, 1.1, 0xc45c4a);
    w.box(0.35, 0.22, 0.28, { x: 1.85, y: 0.18, z: 3.05, map: KH.tex.holz(), collide: false });
    KH.furn.jar(w, 1.55, 0.22, 3.15, 0x2A63A8);
    KH.furn.paper(w, 1.4, 0.08, 3.35);
    w.npc({ id: 'ranger', x: -1.2, z: 6.4, name: 'Frau Sowinski', color: 0x3E8E4E, hair: 0x4a3018, facing: Math.PI });
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
