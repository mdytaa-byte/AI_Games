/* Café Sonnenkorn — A1 ordering in Kleinhausen */
KH.start({
  id: 'cafe',
  prefix: 'CAF',
  title: 'Café Sonnenkorn',
  place: 'Bäckergasse',
  level: 'A1',
  blurb: {
    de: 'Du kommst in die Bäckerei-Café Sonnenkorn am Markt. Lies die Speisekarte, bestelle höflich und bezahle auf Deutsch.',
    en: 'You enter Café Sonnenkorn by the market. Read the menu, order politely, and pay in German.'
  },
  how: [
    { de: 'Lauf zur Speisekarte an der Wand.', en: 'Walk to the menu on the wall.' },
    { de: 'Setze dich an einen Tisch.', en: 'Sit at a table.' },
    { de: 'Sprich mit Lena an der Theke — höflich, bitte.', en: 'Talk to Lena at the counter — be polite.' }
  ],
  spawn: { x: 0, z: 2.6, yaw: 0 },
  bounds: { minX: -6.2, maxX: 6.2, minZ: -4.6, maxZ: 5.6 },
  sky: 0xcfe3ef,
  vocab: [
    { de: 'die Speisekarte', en: 'the menu' },
    { de: 'die Theke', en: 'the counter' },
    { de: 'der Kaffee', en: 'coffee' },
    { de: 'das Brötchen', en: 'bread roll' },
    { de: 'der Kuchen', en: 'cake' },
    { de: 'ich hätte gern', en: 'I would like' },
    { de: 'bitte / danke', en: 'please / thank you' },
    { de: 'Das macht … Euro', en: 'That comes to … euros' }
  ],
  build: function (w) {
    w.room({ id: 'cafe', x: 0, z: 0, w: 12, d: 10, h: 3.15, wall: 0xe8d9c4, floor: 0x7a5136, ceil: 0xf7f1e3,
      doors: [{ wall: 's', width: 1.6, offset: 0 }],
      windows: [{ wall: 'n', offset: -2.2 }, { wall: 'n', offset: 2.2 }, { wall: 'e', offset: 0 }] });
    KH.furn.counter(w, 0, -3.6, 6.5, 0.85);
    w.box(1.4, 1.1, 0.5, { x: 3.2, y: 1.65, z: -3.55, color: 0x8B1E1E, collide: false });
    w.label('Kuchen', { x: 3.2, y: 2.35, z: -3.2, scale: 0.9 });
    w.box(0.9, 0.7, 0.5, { x: -3.0, y: 1.5, z: -3.55, color: 0x6B4423, collide: false });
    w.npc({ id: 'lena', x: 0.2, z: -2.7, name: 'Lena', color: 0x8B1E1E, hair: 0x3a2214, facing: 0 });
    w.plane(1.8, 1.2, { x: -4.6, y: 1.7, z: -0.2, ry: Math.PI / 2, color: 0xf7f1e3 });
    w.label('Speisekarte', { x: -4.3, y: 2.45, z: -0.2, scale: 1.15 });
    w.hotspot({ id: 'karte', x: -4.0, z: -0.2, r: 1.3, label: 'Speisekarte' });
    [[-2.4, 1.6], [1.8, 1.8], [3.4, 1.2], [-2.2, 3.2]].forEach(function (p) {
      KH.furn.table(w, p[0], p[1]);
      KH.furn.chair(w, p[0], p[1] + 0.7, 0);
    });
    w.hotspot({ id: 'tisch', x: -2.4, z: 1.6, r: 1.2, label: 'ein Tisch' });
    KH.furn.plant(w, 5.1, 4.0);
    KH.furn.plant(w, -5.1, 4.0);
    w.box(0.08, 2.2, 1.2, { x: 0, y: 1.1, z: 5.05, color: 0x6B4423, collide: false });
    w.label('Café Sonnenkorn', { x: 0, y: 2.55, z: 4.4, scale: 1.6 });
    w.hotspot({ id: 'kasse', x: 2.1, z: -2.5, r: 1.2, label: 'die Kasse' });
  },
  tasks: [
    {
      id: 'karte', title: 'Speisekarte', hotspot: 'karte', kind: 'quiz', where: 'Café Sonnenkorn',
      de: 'Lies die Speisekarte an der Wand.',
      en: 'Read the menu on the wall.',
      question: { de: 'Was ist „das Brötchen“?', en: 'What is “das Brötchen”?' },
      options: [
        { de: 'ein kleines Brot — article: das', en: 'a small bread roll — das', ok: true },
        { de: 'ein Kuchen — article: der', en: 'a cake — der', ok: false, tip: { de: 'Der Kuchen ist süß. Das Brötchen isst man zum Frühstück.', en: 'Cake is der Kuchen.' } },
        { de: 'ein Tee — article: die', en: 'a tea — die', ok: false, tip: { de: 'Tee ist der Tee.', en: 'Tea is der Tee.' } }
      ]
    },
    {
      id: 'tisch', title: 'Platz nehmen', hotspot: 'tisch', kind: 'inspect', where: 'am Tisch',
      de: 'Geh zu einem Tisch und setze dich.',
      en: 'Go to a table and sit down.',
      inspectDe: 'Hier ist ein Tisch. Du setzt dich. Lena sieht dich und lächelt.',
      inspectEn: 'Here is a table. You sit. Lena sees you and smiles.',
      flavor: { de: '„Einen Moment, ich komme gleich!“', en: '“One moment, I’ll be right there!”' }
    },
    {
      id: 'bestellen', title: 'Bestellen', hotspot: 'lena', kind: 'dialogue', npc: 'Lena', where: 'an der Theke',
      de: 'Bestelle höflich an der Theke.',
      en: 'Order politely at the counter.',
      line: { de: 'Guten Tag! Was darf es sein?', en: 'Hello! What can I get you?' },
      prompt: 'Was sagst du?', promptEn: 'What do you say?',
      choices: [
        { de: 'Gib mir Kaffee.', en: 'Gimme coffee.', ok: false, tip: { de: 'Zu grob. Sag „ich hätte gern … bitte“.', en: 'Too blunt. Use “ich hätte gern … bitte”.' } },
        { de: 'Ich hätte gern einen Kaffee und ein Brötchen, bitte.', en: 'I would like a coffee and a roll, please.', ok: true, reply: { de: 'Sehr gern. Das macht 4,50 Euro.', en: 'Of course. That’s 4.50 euros.' } },
        { de: 'Wo ist der Bahnhof?', en: 'Where is the station?', ok: false, tip: { de: 'Das ist die falsche Frage fürs Café.', en: 'Wrong question for a café.' } }
      ]
    },
    {
      id: 'zahlen', title: 'Bezahlen', hotspot: 'kasse', kind: 'quiz', where: 'an der Kasse',
      de: 'Bezahle an der Kasse. Lena sagt: „Das macht 4,50 Euro.“',
      en: 'Pay at the till. Lena says it costs €4.50.',
      question: { de: 'Wie viel kostet die Bestellung?', en: 'How much does the order cost?' },
      options: [
        { de: 'vier Euro fünfzig (4,50 €)', en: 'four euros fifty', ok: true },
        { de: 'fünfzehn Euro (15 €)', en: 'fifteen euros', ok: false },
        { de: 'vierzig Euro (40 €)', en: 'forty euros', ok: false }
      ]
    },
    {
      id: 'tschuss', title: 'Verabschieden', hotspot: 'lena', kind: 'dialogue', npc: 'Lena', where: 'an der Theke',
      de: 'Verabschiede dich, bevor du gehst.',
      en: 'Say goodbye before you leave.',
      line: { de: 'Danke schön! Einen schönen Tag noch.', en: 'Thank you! Have a nice day.' },
      prompt: 'Die höfliche Antwort:',
      choices: [
        { de: 'Tschüss, Alter!', en: 'Bye, dude!', ok: false, tip: { de: 'Zu salopp für die Bäckerei.', en: 'Too casual for the bakery.' } },
        { de: 'Auf Wiedersehen, und danke!', en: 'Goodbye, and thank you!', ok: true, reply: { de: 'Bis bald in Kleinhausen!', en: 'See you soon in Kleinhausen!' } },
        { de: 'Ich heiße Jonas.', en: 'My name is Jonas.', ok: false, tip: { de: 'Das ist eine Vorstellung, kein Abschied.', en: 'That’s an introduction, not a goodbye.' } }
      ]
    }
  ]
});
