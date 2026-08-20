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
  spawn: { x: 0, z: 7.4, yaw: 0 },
  bounds: { minX: -7.5, maxX: 7.5, minZ: -8.5, maxZ: 9.2 },
  sky: 0xe8dcc8,
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
    /* hallway */
    w.room({ id: 'flur', x: 0, z: 7, w: 4, d: 4.5, h: 3, wall: 0xe4d5c0, floor: 0xc4a574,
      doors: [{ wall: 's', width: 1.4 }, { wall: 'n', width: 1.4 }, { wall: 'w', width: 1.3 }, { wall: 'e', width: 1.3 }] });
    w.label('Flur', { x: 0, y: 2.6, z: 7, scale: 1 });
    KH.furn.plant(w, 1.4, 8.5);
    /* living */
    w.room({ id: 'wohn', x: 0, z: 1.2, w: 8, d: 6.2, h: 3, wall: 0xd9e0d4, floor: 0x8b5a2b,
      doors: [{ wall: 's', width: 1.4 }] });
    KH.furn.sofa(w, -1.6, 0.4);
    KH.furn.table(w, 0.6, 0.6);
    KH.furn.lamp(w, 2.4, 2.4);
    w.hotspot({ id: 'sofa', x: -1.6, z: 0.4, r: 1.3, label: 'das Sofa' });
    w.hotspot({ id: 'tisch', x: 0.6, z: 0.6, r: 1.15, label: 'der Tisch' });
    w.label('Wohnzimmer', { x: 0, y: 2.7, z: -1.4, scale: 1.2 });
    /* kitchen west */
    w.room({ id: 'kueche', x: -5.2, z: 7, w: 5.2, d: 4.5, h: 3, wall: 0xf0e6d8, floor: 0xc8c4bc,
      doors: [{ wall: 'e', width: 1.3 }] });
    w.box(2.4, 1.0, 0.7, { x: -6.4, y: 0.5, z: 5.6, color: 0xeff1ec, collideR: 0.9 });
    w.box(0.7, 1.7, 0.7, { x: -3.7, y: 0.85, z: 5.5, color: 0x9aa3a8, collideR: 0.55 });
    w.hotspot({ id: 'kuehl', x: -3.7, z: 5.5, r: 1.2, label: 'der Kühlschrank' });
    w.label('Küche', { x: -5.2, y: 2.6, z: 7, scale: 1 });
    /* bedroom east */
    w.room({ id: 'schlaf', x: 5.2, z: 7, w: 5.2, d: 4.5, h: 3, wall: 0xe4d0e0, floor: 0x7a5136,
      doors: [{ wall: 'w', width: 1.3 }] });
    KH.furn.bed(w, 5.6, 6.6);
    w.box(0.5, 0.55, 0.4, { x: 6.8, y: 0.32, z: 8.3, color: 0x6B4423, collideR: 0.35 });
    w.hotspot({ id: 'bett', x: 5.6, z: 6.6, r: 1.3, label: 'das Bett' });
    w.label('Schlafzimmer', { x: 5.2, y: 2.6, z: 7, scale: 1 });
    /* bath south of living? put south */
    w.room({ id: 'bad', x: 0, z: -4.4, w: 4.2, d: 3.6, h: 3, wall: 0xd7e4ea, floor: 0xe8eef0,
      doors: [{ wall: 'n', width: 1.2 }] });
    w.box(0.8, 0.55, 0.45, { x: -1.1, y: 0.35, z: -5.3, color: 0xeff1ec, collideR: 0.45 });
    w.cyl(0.32, 0.45, { x: 1.0, z: -5.2, color: 0xeff1ec, collideR: 0.4 });
    w.hotspot({ id: 'bad', x: -1.1, z: -5.3, r: 1.2, label: 'das Waschbecken' });
    w.label('Bad', { x: 0, y: 2.5, z: -4.4, scale: 0.9 });
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
