/* Bahnhof Kleinhausen — travel, times, separable verbs */
KH.start({
  id: 'bahnhof',
  prefix: 'BHF',
  title: 'Bahnhof Kleinhausen',
  place: 'Bahnhofstraße',
  level: 'A2',
  blurb: {
    de: 'Du fährst nach München. Kaufe eine Fahrkarte, lies den Fahrplan und finde das richtige Gleis. Hör dir die Durchsage an.',
    en: 'You are going to Munich. Buy a ticket, read the timetable, and find the right platform. Listen to the announcement.'
  },
  how: [
    { de: 'Automat → Anzeigetafel → Gleis 3.', en: 'Machine → departure board → platform 3.' },
    { de: 'Trennbare Verben: abfahren, ankommen, umsteigen.', en: 'Separable verbs: depart, arrive, change trains.' }
  ],
  spawn: { x: 0, z: 6.2, yaw: 0 },
  bounds: { minX: -10, maxX: 10, minZ: -12, maxZ: 9 },
  sky: 0x8aa8b8,
  fogFar: 50,
  vocab: [
    { de: 'die Fahrkarte', en: 'the ticket' },
    { de: 'der Fahrkartenautomat', en: 'ticket machine' },
    { de: 'das Gleis', en: 'the platform / track' },
    { de: 'der Fahrplan', en: 'the timetable' },
    { de: 'abfahren', en: 'to depart' },
    { de: 'ankommen', en: 'to arrive' },
    { de: 'umsteigen', en: 'to change trains' },
    { de: 'Gleis 3', en: 'platform 3' }
  ],
  build: function (w) {
    w.box(22, 0.08, 24, { x: 0, y: 0.02, z: -1, color: 0x6d7178, collide: false, map: KH.tex.putz('#6d7178') });
    /* hall */
    w.room({ id: 'halle', x: 0, z: 4, w: 14, d: 10, h: 4.2, wall: 0xc5d0d6, floor: 0x8a9098, ceil: 0xe8eef2,
      doors: [{ wall: 'n', width: 3.2 }, { wall: 's', width: 2.4 }],
      windows: [{ wall: 'e', offset: -2 }, { wall: 'e', offset: 2 }, { wall: 'w', offset: 0 }] });
    w.box(1.1, 1.8, 0.6, { x: -4.2, y: 0.9, z: 5.5, color: 0x123E77, collideR: 0.7 });
    w.label('Automat', { x: -4.2, y: 2.15, z: 5.5, scale: 1 });
    w.hotspot({ id: 'automat', x: -4.2, z: 5.5, r: 1.3, label: 'Fahrkartenautomat' });
    w.box(3.2, 1.6, 0.12, { x: 3.4, y: 1.8, z: 0.2, color: 0x12141A, collide: false });
    w.label('München  14:22  Gl. 3', { x: 3.4, y: 2.55, z: 0.5, scale: 1.5 });
    w.hotspot({ id: 'tafel', x: 3.4, z: 1.0, r: 1.4, label: 'Anzeigetafel' });
    w.npc({ id: 'schaffner', x: 1.2, z: 6.2, name: 'Schaffner', color: 0x123E77, hair: 0x1a1a1a, facing: Math.PI });
    /* platforms outdoors north */
    w.box(18, 0.2, 8, { x: 0, y: 0.08, z: -7, color: 0x4a4e54, collide: false });
    w.box(18, 0.15, 1.2, { x: 0, y: 0.12, z: -10.5, color: 0x333333, collide: false });
    w.box(4, 2.4, 0.12, { x: -6, y: 1.3, z: -4.2, color: 0xF2C230, collide: false });
    w.label('Gleis 2', { x: -6, y: 2.0, z: -3.8, scale: 1.1 });
    w.box(4, 2.4, 0.12, { x: 0, y: 1.3, z: -4.2, color: 0xF2C230, collide: false });
    w.label('Gleis 3', { x: 0, y: 2.0, z: -3.8, scale: 1.1 });
    w.hotspot({ id: 'gleis3', x: 0, z: -6.2, r: 1.6, label: 'Gleis 3' });
    w.box(4, 2.4, 0.12, { x: 6, y: 1.3, z: -4.2, color: 0xF2C230, collide: false });
    w.label('Gleis 4', { x: 6, y: 2.0, z: -3.8, scale: 1.1 });
    w.box(5.5, 1.4, 1.4, { x: 0, y: 0.85, z: -9.5, color: 0xc0392b, collideR: 1.4 });
    w.label('RE 72', { x: 0, y: 1.8, z: -9.5, scale: 1 });
    KH.furn.bench(w, -3, 2.5);
    KH.furn.plant(w, 6.2, 7.5);
  },
  tasks: [
    {
      id: 'karte', title: 'Fahrkarte', hotspot: 'automat', kind: 'dialogue', npc: 'Automat', where: 'Bahnhofshalle',
      de: 'Kaufe am Automaten eine Fahrkarte nach München.',
      en: 'Buy a ticket to Munich at the machine.',
      line: { de: 'Ziel eingeben. Einfach oder hin und zurück?', en: 'Enter destination. One-way or return?' },
      prompt: 'Was wählst du?',
      choices: [
        { de: 'Einfache Fahrt nach München, bitte. Zweite Klasse.', en: 'One-way to Munich, second class.', ok: true, reply: { de: 'Fahrkarte wird gedruckt. Gute Reise!', en: 'Printing ticket. Have a good trip!' } },
        { de: 'Ich hätte gern ein Brötchen.', ok: false, tip: { de: 'Das ist der Bahnhof, nicht das Café.', en: 'This is the station, not the café.' } },
        { de: 'Gleis null, erste Klasse, nach Kleinhausen.', ok: false, tip: { de: 'Du bist schon in Kleinhausen. Ziel ist München.', en: 'You are already in Kleinhausen.' } }
      ]
    },
    {
      id: 'tafel', title: 'Fahrplan', hotspot: 'tafel', kind: 'quiz', where: 'Anzeigetafel',
      de: 'Lies die Anzeigetafel: München — 14:22 — Gleis 3.',
      en: 'Read the board: Munich — 14:22 — platform 3.',
      question: { de: 'Wann fährt der Zug nach München ab?', en: 'When does the train to Munich depart?' },
      options: [
        { de: 'Er fährt um vierzehn Uhr zweiundzwanzig ab.', en: 'It departs at 14:22.', ok: true },
        { de: 'Er kommt um 14:22 an — hier in Kleinhausen.', ok: false, tip: { de: '„Abfahren“ = losfahren. „Ankommen“ = am Ziel sein.', en: 'Abfahren = leave; ankommen = arrive.' } },
        { de: 'Er steigt in München um.', ok: false }
      ]
    },
    {
      id: 'durchsage', title: 'Durchsage', hotspot: 'schaffner', kind: 'dialogue', npc: 'Schaffner', where: 'Halle',
      de: 'Hör die Durchsage und antworte dem Schaffner.',
      en: 'Listen to the announcement and answer the conductor.',
      line: { de: 'Achtung, eine Durchsage: Der Regionalexpress nach München fährt heute von Gleis 3. Nicht von Gleis 2. Bitte steigen Sie umgehend ein.', en: 'Attention: the regional express to Munich leaves from platform 3 today, not 2. Please board immediately.' },
      prompt: 'Was machst du?',
      choices: [
        { de: 'Ich gehe zu Gleis 3 und steige ein.', en: 'I go to platform 3 and get on.', ok: true, reply: { de: 'Richtig. Der Zug fährt bald ab.', en: 'Correct. The train is about to leave.' } },
        { de: 'Ich warte auf Gleis 2, wie immer.', ok: false, tip: { de: 'Heute Gleis 3 — die Durchsage ändert den Plan.', en: 'Today platform 3.' } },
        { de: 'Ich steige in Nürnberg um, ohne Ticket.', ok: false }
      ]
    },
    {
      id: 'gleis', title: 'Gleis 3', hotspot: 'gleis3', kind: 'inspect', where: 'Gleis 3',
      de: 'Geh nach draußen zu Gleis 3 und stell dich am Zug auf.',
      en: 'Go outside to platform 3 and stand by the train.',
      inspectDe: 'Hier ist Gleis 3. Der rote Regionalexpress wartet. Türen auf!',
      inspectEn: 'This is platform 3. The red regional express is waiting. Doors open!',
      flavor: { de: '„Einsteigen bitte, der Zug fährt ab.“', en: '“All aboard, the train is departing.”' }
    },
    {
      id: 'verb', title: 'Trennbare Verben', hotspot: 'gleis3', kind: 'quiz', where: 'Gleis 3',
      de: 'Wähle die richtige Form im Satz.',
      en: 'Choose the correct verb form.',
      question: { de: 'Der Zug nach München ___ um 14:22 ___ .', en: 'The train to Munich ___ at 14:22.' },
      options: [
        { de: 'fährt … ab', en: 'separable: abfahren', ok: true },
        { de: 'abfährt … an', ok: false, tip: { de: 'Präsens: fährt … ab (Präfix ans Ende).', en: 'Present tense: prefix goes to the end.' } },
        { de: 'kommt … um', ok: false }
      ]
    }
  ]
});
