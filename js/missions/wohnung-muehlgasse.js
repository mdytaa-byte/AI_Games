/* Wohnung Mühlgasse — furniture + two-way prepositions */
KH.start({
  id: 'wohnung',
  prefix: 'WOH',
  title: 'Wohnung in der Mühlgasse',
  place: 'Mühlgasse 4',
  level: 'A1–A2',
  blurb: {
    de: 'Oma Ursula braucht Hilfe: Finde Möbel in der Wohnung und sag, wo die Dinge stehen — mit Präpositionen und Artikeln.',
    en: 'Grandma Ursula needs help: find furniture and say where things are — with prepositions and articles.'
  },
  how: [
    { de: 'Geh von Raum zu Raum. Drücke E am gelben Ring.', en: 'Walk room to room. Press E at a yellow ring.' },
    { de: 'Achte auf Wechselpräpositionen: auf + Dativ (wo?), in + Dativ, neben, an.', en: 'Watch two-way prepositions: auf + dative (location), in, neben, an.' }
  ],
  spawn: { x: 0, z: 7.2, yaw: 0 },
  bounds: { minX: -7.5, maxX: 7.5, minZ: -8.5, maxZ: 9.2 },
  sky: 0xe4d4b8,
  fogColor: 0xe6d5b8,
  fogNear: 9,
  fogFar: 24,
  vocab: [
    { de: 'das Sofa', en: 'the sofa' },
    { de: 'der Tisch', en: 'the table' },
    { de: 'der Kühlschrank', en: 'the fridge' },
    { de: 'das Bett', en: 'the bed' },
    { de: 'das Waschbecken', en: 'the sink' },
    { de: 'auf dem Tisch', en: 'on the table' },
    { de: 'in der Küche', en: 'in the kitchen' },
    { de: 'neben dem Sofa', en: 'next to the sofa' }
  ],
  build: function (w) {
    w.room({ id: 'flur', x: 0, z: 7, w: 4, d: 4.5, h: 2.95, wallHex: '#efe6d6',
      doors: [{ wall: 's', width: 1.4 }, { wall: 'n', width: 1.4 }, { wall: 'w', width: 1.3 }, { wall: 'e', width: 1.3 }] });
    w.label('Flur', { x: 0, y: 2.55, z: 7, scale: 0.85 });
    KH.furn.plant(w, 1.35, 8.4);
    w.box(0.5, 0.9, 0.22, { x: -1.3, y: 0.9, z: 8.5, map: KH.tex.holz(), collide: false });
    w.room({ id: 'wohn', x: 0, z: 1.2, w: 8, d: 6.2, h: 2.95, wallHex: '#dce6d8',
      wallMap: KH.tex.tapete('#dce6d8', 'rgba(70,110,80,.2)'),
      doors: [{ wall: 's', width: 1.4 }],
      windows: [{ wall: 'n', offset: -1.6 }, { wall: 'n', offset: 1.6 }] });
    KH.furn.rug(w, -0.2, 0.5, 3.2, 2.0, 0x6a3a32);
    KH.furn.sofa(w, -1.7, 0.35);
    KH.furn.table(w, 0.7, 0.55, { check: false });
    KH.furn.paper(w, 0.85, 0.82, 0.62);
    KH.furn.lamp(w, 2.45, 2.35);
    KH.furn.shelf(w, -3.45, -0.85);
    KH.furn.clock(w, 0, 2.25, -1.75);
    w.pendant(0.2, 1.0, 2.7);
    w.hotspot({ id: 'sofa', x: -1.7, z: 0.35, r: 1.3, label: 'das Sofa' });
    w.hotspot({ id: 'tisch', x: 0.7, z: 0.55, r: 1.15, label: 'der Tisch' });
    w.label('Wohnzimmer', { x: 0, y: 2.62, z: -1.35, scale: 1.05 });
    w.poster(function (g, W, H) {
      g.fillStyle = '#8aa8c0'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#e8dcc0'; g.fillRect(0, H * 0.55, W, H * 0.45);
      g.fillStyle = '#f2c230'; g.beginPath(); g.arc(W * 0.7, H * 0.28, 40, 0, Math.PI * 2); g.fill();
    }, { x: 3.72, y: 1.7, z: 0.4, ry: -Math.PI / 2, w: 0.7, h: 0.9 });
    w.room({ id: 'kueche', x: -5.2, z: 7, w: 5.2, d: 4.5, h: 2.95, wallHex: '#f3e6d8',
      floorMap: KH.tex.fliesen('#f4f1ea', '#d8c8b4'),
      doors: [{ wall: 'e', width: 1.3 }],
      windows: [{ wall: 'w', offset: 0 }] });
    w.box(2.5, 0.95, 0.68, { x: -6.45, y: 0.48, z: 5.55, map: KH.tex.holz(), collideR: 0.9 });
    w.box(0.72, 1.75, 0.68, { x: -3.65, y: 0.88, z: 5.5, color: 0xc5ccd0, collideR: 0.55 });
    w.box(0.5, 0.08, 0.5, { x: -6.1, y: 1.02, z: 5.5, color: 0xeff1ec, collide: false });
    w.cyl(0.08, 0.12, { x: -5.7, y: 1.08, z: 5.45, color: 0xc45c4a, collide: false, seg: 8 });
    KH.furn.jar(w, -6.45, 1.12, 5.48, 0x3E8E4E);
    KH.furn.jar(w, -6.25, 1.12, 5.52, 0xc9a227);
    w.hotspot({ id: 'kuehl', x: -3.65, z: 5.5, r: 1.2, label: 'der Kühlschrank' });
    w.label('Küche', { x: -5.2, y: 2.5, z: 7, scale: 0.85 });
    w.pendant(-5.2, 6.6, 2.7);
    w.room({ id: 'schlaf', x: 5.2, z: 7, w: 5.2, d: 4.5, h: 2.95, wallHex: '#ead4e0',
      wallMap: KH.tex.tapete('#ead4e0', 'rgba(110,50,90,.18)'),
      doors: [{ wall: 'w', width: 1.3 }],
      windows: [{ wall: 'e', offset: 0.2 }] });
    KH.furn.bed(w, 5.55, 6.55);
    w.box(0.48, 0.52, 0.38, { x: 6.85, y: 0.3, z: 8.25, map: KH.tex.holz(), collideR: 0.32 });
    w.cyl(0.07, 0.28, { x: 6.85, y: 0.72, z: 8.25, color: 0xf7f1e3, collide: false, emissive: 0x332200, seg: 8 });
    w.lamps.push({ x: 6.85, y: 0.85, z: 8.25, color: 0xffe2b0, int: 0.35, dist: 3 });
    w.hotspot({ id: 'bett', x: 5.55, z: 6.55, r: 1.3, label: 'das Bett' });
    w.label('Schlafzimmer', { x: 5.2, y: 2.5, z: 7, scale: 0.85 });
    w.room({ id: 'bad', x: 0, z: -4.4, w: 4.2, d: 3.6, h: 2.95, wallHex: '#d7e4ea',
      floorMap: KH.tex.fliesen('#eef3f5', '#c5d4dc'),
      doors: [{ wall: 'n', width: 1.2 }] });
    w.box(0.85, 0.52, 0.42, { x: -1.15, y: 0.32, z: -5.25, color: 0xeff1ec, collideR: 0.45 });
    w.cyl(0.3, 0.42, { x: 1.0, z: -5.15, color: 0xeff1ec, collideR: 0.38, seg: 12 });
    w.box(0.5, 0.7, 0.04, { x: -1.15, y: 1.35, z: -5.55, color: 0xc5d8e4, collide: false, transparent: true, opacity: 0.4 });
    w.hotspot({ id: 'bad', x: -1.15, z: -5.25, r: 1.2, label: 'das Waschbecken' });
    w.label('Bad', { x: 0, y: 2.42, z: -4.4, scale: 0.75 });
  },
  tasks: [
    {
      id: 'sofa', title: 'Wohnzimmer', hotspot: 'sofa', kind: 'quiz', where: 'Wohnzimmer',
      de: 'Finde das Sofa im Wohnzimmer.',
      en: 'Find the sofa in the living room.',
      question: { de: 'Welcher Artikel? ___ Sofa steht im Wohnzimmer.', en: 'Which article? ___ sofa is in the living room.' },
      options: [
        { de: 'das Sofa', en: 'das Sofa (neuter)', ok: true },
        { de: 'der Sofa', ok: false, tip: { de: 'Sofa ist sächlich: das Sofa.', en: 'Sofa is neuter.' } },
        { de: 'die Sofa', ok: false }
      ]
    },
    {
      id: 'tisch', title: 'Wo liegt die Tasse?', hotspot: 'tisch', kind: 'quiz', where: 'Wohnzimmer',
      de: 'Die Tasse steht auf dem Tisch. Welche Präposition + Fall?',
      en: 'The cup is on the table. Which preposition + case?',
      question: { de: 'Wo ist die Tasse?', en: 'Where is the cup?' },
      options: [
        { de: 'auf dem Tisch (Dativ — Ort)', en: 'auf + dative for location', ok: true },
        { de: 'auf den Tisch (Akkusativ — Ziel)', en: 'auf + accusative is for motion onto', ok: false, tip: { de: '„Wo?“ nimmt Dativ. „Wohin?“ nimmt Akkusativ.', en: '“Where?” takes dative.' } },
        { de: 'in die Tisch', ok: false }
      ]
    },
    {
      id: 'kuehl', title: 'Küche', hotspot: 'kuehl', kind: 'dialogue', npc: 'Oma Ursula', where: 'Küche',
      de: 'Oma ruft aus der Küche. Sag, wo der Kühlschrank ist.',
      en: 'Grandma calls from the kitchen. Say where the fridge is.',
      line: { de: 'Wo ist die Milch, Liebes?', en: 'Where is the milk, dear?' },
      prompt: 'Deine Antwort:',
      choices: [
        { de: 'Die Milch ist in dem Kühlschrank, in der Küche.', en: 'The milk is in the fridge, in the kitchen.', ok: true, reply: { de: 'Ach ja! Danke.', en: 'Ah yes! Thanks.' } },
        { de: 'Die Milch ist auf dem Kühlschrank unter das Bett.', ok: false, tip: { de: 'Milch gehört in den Kühlschrank, nicht auf ihn.', en: 'Milk belongs in the fridge.' } },
        { de: 'Ich hätte gern einen Kaffee.', ok: false }
      ]
    },
    {
      id: 'bett', title: 'Schlafzimmer', hotspot: 'bett', kind: 'quiz', where: 'Schlafzimmer',
      de: 'Finde das Bett. Die Lampe steht auf dem Nachttisch neben dem Bett.',
      en: 'Find the bed. The lamp is on the nightstand next to the bed.',
      question: { de: '„neben ___ Bett“ — welcher Artikel im Dativ?', en: '“next to ___ bed” — dative article?' },
      options: [
        { de: 'neben dem Bett', ok: true },
        { de: 'neben den Bett', ok: false, tip: { de: 'Dativ Maskulinum/Neutrum: dem.', en: 'Dative masc/neut: dem.' } },
        { de: 'neben der Bett', ok: false }
      ]
    },
    {
      id: 'bad', title: 'Bad', hotspot: 'bad', kind: 'quiz', where: 'Bad',
      de: 'Im Bad: Wo ist die Zahnbürste?',
      en: 'In the bathroom: where is the toothbrush?',
      question: { de: 'Die Zahnbürste liegt …', en: 'The toothbrush is …' },
      options: [
        { de: 'im Bad, neben dem Waschbecken', en: 'in the bathroom, next to the sink', ok: true },
        { de: 'auf dem Sofa in der Küche', ok: false },
        { de: 'unter der Straßenbahn', ok: false }
      ]
    }
  ]
});
