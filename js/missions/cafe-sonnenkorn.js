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
  spawn: { x: 0.2, z: 2.4, yaw: 0 },
  bounds: { minX: -6.2, maxX: 6.2, minZ: -4.6, maxZ: 5.6 },
  sky: 0xcfe0d4,
  fogColor: 0xd9cbb0,
  fogNear: 10,
  fogFar: 26,
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
    w.room({ id: 'cafe', x: 0, z: 0, w: 12, d: 10, h: 3.2, wallHex: '#efe4d0',
      wallMap: KH.tex.tapete('#efe4d0', 'rgba(139,30,30,.2)'),
      doors: [{ wall: 's', width: 1.6, offset: 0 }],
      windows: [{ wall: 'n', offset: -2.4, flowers: true }, { wall: 'n', offset: 2.4, flowers: true }, { wall: 'e', offset: 0.2, flowers: true }] });
    KH.furn.rug(w, 0, 2.2, 2.2, 1.3, 0x6B2D5B);
    KH.furn.counter(w, 0, -3.55, 6.6, 0.9);
    w.npc({ id: 'lena', x: 0.15, z: -2.65, name: 'Lena', color: 0x8B1E1E, hair: 0x5a3218, facing: 0, apron: true });
    /* pastry case */
    w.box(1.55, 0.08, 0.55, { x: 2.55, y: 1.12, z: -3.45, color: 0xeff8ff, collide: false, transparent: true, opacity: 0.35 });
    w.box(1.55, 0.9, 0.08, { x: 2.55, y: 1.55, z: -3.18, color: 0xeff8ff, collide: false, transparent: true, opacity: 0.25 });
    KH.furn.pastry(w, 2.2, 1.18, -3.5, 0xc9a227);
    KH.furn.pastry(w, 2.5, 1.18, -3.5, 0x8B1E1E);
    KH.furn.pastry(w, 2.8, 1.18, -3.42, 0xe8dcc8);
    w.label('Kuchen', { x: 2.55, y: 2.05, z: -3.15, scale: 0.8 });
    /* espresso + jars */
    w.box(0.55, 0.45, 0.4, { x: -2.4, y: 1.28, z: -3.45, color: 0x2a2a2a, collide: false });
    w.cyl(0.08, 0.2, { x: -2.4, y: 1.58, z: -3.35, color: 0x1a1a1a, collide: false, seg: 8 });
    KH.furn.jar(w, -1.55, 1.18, -3.45, 0x8B1E1E);
    KH.furn.jar(w, -1.35, 1.18, -3.45, 0x3E8E4E);
    KH.furn.jar(w, -1.15, 1.18, -3.5, 0xc9a227);
    w.pendant(-2.4, -2.2);
    w.pendant(0, -2.2);
    w.pendant(2.5, -2.2);
    [[-2.5, 1.55, true], [1.7, 1.7, false], [3.35, 1.15, true], [-2.15, 3.15, false]].forEach(function (p) {
      KH.furn.table(w, p[0], p[1], { check: p[2] });
      KH.furn.chair(w, p[0], p[1] + 0.62, 0);
      w.pendant(p[0], p[1]);
    });
    KH.furn.paper(w, -2.35, 0.82, 1.62);
    KH.furn.shelf(w, -5.35, 2.4);
    KH.furn.clock(w, 0, 2.35, -4.82);
    KH.furn.coat(w, 4.9, 1.2, 3.2);
    w.hotspot({ id: 'tisch', x: -2.5, z: 1.55, r: 1.2, label: 'ein Tisch' });
    w.hotspot({ id: 'karte', x: -4.05, z: -0.15, r: 1.3, label: 'Speisekarte' });
    w.hotspot({ id: 'kasse', x: 2.05, z: -2.45, r: 1.2, label: 'die Kasse' });
    w.poster(function (g, W, H) {
      g.fillStyle = '#f7f1e3'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#8B1E1E'; g.fillRect(0, 0, W, 70);
      g.fillStyle = '#f7f1e3'; g.font = 'bold 36px Georgia'; g.textAlign = 'center';
      g.fillText('Speisekarte', W / 2, 48);
      g.fillStyle = '#3a2414'; g.font = '28px Georgia'; g.textAlign = 'left';
      var lines = ['Kaffee ………… 2,20 €', 'Tee ……………… 1,80 €', 'Brötchen …… 1,50 €', 'Kuchen ……… 2,30 €', 'Apfelschorle  2,00 €'];
      lines.forEach(function (ln, i) { g.fillText(ln, 36, 130 + i * 72); });
    }, { x: -5.72, y: 1.7, z: -0.15, ry: Math.PI / 2, w: 1.05, h: 1.4 });
    w.poster(function (g, W, H) {
      g.fillStyle = '#1a4a28'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#f7f1e3'; g.font = 'italic 32px Georgia'; g.textAlign = 'center';
      g.fillText('Heute', W / 2, 80);
      g.font = 'bold 40px Georgia';
      g.fillText('Kirschkuchen', W / 2, 200);
      g.font = '28px Georgia'; g.fillText('mit Sahne', W / 2, 280);
    }, { x: 5.72, y: 1.75, z: 1.2, ry: -Math.PI / 2, w: 0.85, h: 1.1 });
    KH.furn.plant(w, 5.15, 4.05);
    KH.furn.plant(w, -5.15, 4.05);
    w.box(0.08, 2.15, 1.15, { x: 0, y: 1.1, z: 4.92, map: KH.tex.holz(), collide: false });
    w.label('Café Sonnenkorn', { x: 0, y: 2.45, z: 4.35, scale: 1.45 });
    /* coat hooks */
    w.box(0.7, 0.06, 0.06, { x: 4.9, y: 1.5, z: 3.2, color: 0x5a3a22, collide: false });
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
