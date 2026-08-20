/* Gymnasium Kleinhausen — school day, times, subjects */
KH.start({
  id: 'schule',
  prefix: 'GYM',
  title: 'Gymnasium Kleinhausen',
  place: 'Schulstraße',
  level: 'A1–A2',
  blurb: {
    de: 'Es ist Montag. Lies den Stundenplan, finde Raum 12 und die Tafel, und sprich mit Frau Vogel in der Deutschstunde. Uhrzeiten und Schulfächer.',
    en: 'It’s Monday. Read the timetable, find room 12 and the board, and talk to Frau Vogel in German class. Times and school subjects.'
  },
  how: [
    { de: 'Stundenplan an der Wand → Klassenzimmer 12 → Tafel.', en: 'Timetable on the wall → classroom 12 → blackboard.' },
    { de: 'Uhrzeiten: um acht Uhr, um Viertel nach acht.', en: 'Clock times: at eight, at quarter past eight.' }
  ],
  spawn: { x: 0, z: 7.2, yaw: 0 },
  bounds: { minX: -9, maxX: 9, minZ: -8, maxZ: 9 },
  sky: 0xb9d0c8,
  fogColor: 0xd4cbb8,
  fogNear: 11,
  fogFar: 28,
  vocab: [
    { de: 'der Stundenplan', en: 'the timetable' },
    { de: 'das Klassenzimmer', en: 'the classroom' },
    { de: 'die Tafel', en: 'the blackboard' },
    { de: 'der Rucksack', en: 'the backpack' },
    { de: 'das Heft', en: 'the exercise book' },
    { de: 'Deutsch / Mathe / Sport', en: 'German / math / PE' },
    { de: 'um acht Uhr', en: 'at eight o’clock' }
  ],
  build: function (w) {
    w.room({ id: 'gang', x: 0, z: 6, w: 12, d: 6, h: 3.3, wallHex: '#ebe3d4',
      doors: [{ wall: 's', width: 1.6 }, { wall: 'n', width: 1.8 }, { wall: 'w', width: 1.4 }],
      windows: [{ wall: 'e', offset: 0, flowers: false }] });
    w.poster(function (g, W, H) {
      g.fillStyle = '#f7f1e3'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#123E77'; g.font = 'bold 28px sans-serif'; g.textAlign = 'center';
      g.fillText('Stundenplan', W / 2, 48);
      g.fillStyle = '#3a2414'; g.font = '22px sans-serif'; g.textAlign = 'left';
      g.fillText('Mo  8:00  Deutsch  R12', 28, 120);
      g.fillText('Mo  8:55  Mathe    R12', 28, 175);
      g.fillText('Mo  9:50  Sport    Halle', 28, 230);
    }, { x: 4.4, y: 1.7, z: 3.15, w: 1.15, h: 1.35 });
    w.hotspot({ id: 'plan', x: 4.2, z: 3.55, r: 1.3, label: 'Stundenplan' });
    w.label('Raum 12 →', { x: -4.5, y: 2.15, z: 6, scale: 0.9 });
    KH.furn.plant(w, 5.35, 8.15);
    KH.furn.clock(w, -2.4, 2.45, 3.18);
    w.box(0.45, 1.5, 0.4, { x: 3.2, y: 0.75, z: 7.6, color: 0x8B1E1E, collide: false });
    w.box(0.45, 1.5, 0.4, { x: 3.75, y: 0.75, z: 7.6, color: 0x123E77, collide: false });
    w.box(0.45, 1.5, 0.4, { x: 4.3, y: 0.75, z: 7.6, color: 0xF2C230, collide: false });
    w.room({ id: 'kl12', x: -6.4, z: 0.6, w: 8, d: 9, h: 3.3, wallHex: '#f4efe6',
      doors: [{ wall: 'e', width: 1.4 }],
      windows: [{ wall: 'w', offset: -2, flowers: false }, { wall: 'w', offset: 2, flowers: false }] });
    KH.furn.board(w, -6.4, 1.85, -3.45, 0, 0x1a4a28);
    w.hotspot({ id: 'tafel', x: -6.4, z: -3.05, r: 1.4, label: 'die Tafel' });
    KH.furn.desk(w, -6.4, -1.55);
    w.npc({ id: 'vogel', x: -5.2, z: -1.45, name: 'Frau Vogel', color: 0x6B2D5B, hair: 0x3b2a18, facing: 0 });
    [[-8.2, 1.2], [-4.6, 1.2], [-8.2, 3.0], [-4.6, 3.0], [-8.2, 4.8], [-4.6, 4.8]].forEach(function (p) {
      KH.furn.desk(w, p[0], p[1]);
      KH.furn.chair(w, p[0], p[1] + 0.62);
    });
    w.box(0.38, 0.48, 0.26, { x: -4.6, y: 0.88, z: 1.2, color: 0x123E77, collide: false });
    w.hotspot({ id: 'rucksack', x: -4.6, z: 1.2, r: 1.1, label: 'der Rucksack' });
    w.label('Klassenzimmer 12', { x: -6.4, y: 2.85, z: 0.6, scale: 1.15 });
    w.pendant(-6.4, 0.6, 3.05);
    w.pendant(-6.4, 3.2, 3.05);
    w.box(16, 0.06, 8, { x: 0, y: 0.02, z: -5.5, map: KH.tex.gras(), repeat: [8, 4], collide: false, cast: false });
    KH.furn.tree(w, 3, -6.5);
    KH.furn.tree(w, 5.4, -7.2);
    KH.furn.bench(w, -2, -6.2);
    KH.furn.laterne(w, 1.2, -6.4);
    KH.furn.haus(w, 7.4, -6.8, { stil: 'putz', wand: '#D8D0C0', dach: '#6B3A32', ry: Math.PI, w: 4.2, d: 3.2, stock: 2 });
  },
  tasks: [
    {
      id: 'plan', title: 'Stundenplan', hotspot: 'plan', kind: 'quiz', where: 'Schulgang',
      de: 'Lies den Stundenplan: Montag, 1. Stunde — Deutsch, Raum 12, 8:00.',
      en: 'Read the timetable: Monday, period 1 — German, room 12, 8:00.',
      question: { de: 'Wo ist die erste Stunde am Montag?', en: 'Where is first period on Monday?' },
      options: [
        { de: 'Deutsch in Raum 12, um acht Uhr', en: 'German in room 12 at eight', ok: true },
        { de: 'Sport am See, um vierzehn Uhr', ok: false },
        { de: 'Mathe am Bahnhof, Gleis 3', ok: false }
      ]
    },
    {
      id: 'raum', title: 'Raum 12', hotspot: 'vogel', kind: 'dialogue', npc: 'Frau Vogel', where: 'Klassenzimmer 12',
      de: 'Geh in Raum 12 und begrüße Frau Vogel.',
      en: 'Go into room 12 and greet Frau Vogel.',
      line: { de: 'Guten Morgen. Setzt euch bitte. Habt ihr eure Hefte dabei?', en: 'Good morning. Please sit down. Do you have your notebooks?' },
      prompt: 'Deine Antwort:',
      choices: [
        { de: 'Guten Morgen, Frau Vogel. Ja, ich habe mein Heft im Rucksack.', en: 'Good morning. Yes, my notebook is in my backpack.', ok: true, reply: { de: 'Sehr gut. Heute üben wir Uhrzeiten.', en: 'Very good. Today we practice clock times.' } },
        { de: 'Hey Lehrerin, wo ist das Klo?', ok: false, tip: { de: 'Zu salopp. Sag „Frau Vogel“ und „Guten Morgen“.', en: 'Too casual. Use her name and Guten Morgen.' } },
        { de: 'Ich hätte gern einen Kaffee.', ok: false }
      ]
    },
    {
      id: 'tafel', title: 'Tafel', hotspot: 'tafel', kind: 'quiz', where: 'Klassenzimmer 12',
      de: 'An der Tafel steht: Es ist Viertel nach acht.',
      en: 'On the board: it is quarter past eight.',
      question: { de: 'Wie spät ist es?', en: 'What time is it?' },
      options: [
        { de: 'Es ist Viertel nach acht (8:15).', ok: true },
        { de: 'Es ist Viertel vor acht (7:45).', ok: false, tip: { de: '„Nach“ = nach der vollen Stunde. „Vor“ = davor.', en: 'Nach = after the hour.' } },
        { de: 'Es ist halb neun (8:30) — genau.', ok: false }
      ]
    },
    {
      id: 'rucksack', title: 'Schulsachen', hotspot: 'rucksack', kind: 'quiz', where: 'Klassenzimmer 12',
      de: 'Finde den Rucksack. Was ist drin?',
      en: 'Find the backpack. What’s inside?',
      question: { de: 'Welcher Artikel? Ich packe ___ Heft in ___ Rucksack.', en: 'Which articles?' },
      options: [
        { de: 'das Heft / den Rucksack (Akkusativ)', en: 'das Heft / den Rucksack (accusative)', ok: true },
        { de: 'der Heft / die Rucksack', ok: false, tip: { de: 'das Heft (sächlich), der Rucksack → Akk. den Rucksack.', en: 'Neuter Heft; masculine backpack → den in accusative.' } },
        { de: 'die Heft / dem Rucksack', ok: false }
      ]
    },
    {
      id: 'fach', title: 'Fächer', hotspot: 'plan', kind: 'quiz', where: 'Schulgang',
      de: 'Zurück am Stundenplan: Welches Fach kommt nach Deutsch?',
      en: 'Back at the timetable: which subject comes after German?',
      question: { de: '2. Stunde Montag ist Mathe. Was sagst du?', en: '2nd period Monday is math.' },
      options: [
        { de: 'Nach Deutsch habe ich Mathe.', en: 'After German I have math.', ok: true },
        { de: 'Ich fahre um 14:22 von Gleis 3 ab.', ok: false },
        { de: 'Mir tut der Kopf weh — das ist Sport.', ok: false }
      ]
    }
  ]
});
