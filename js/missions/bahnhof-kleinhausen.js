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
  spawn: { x: 0, z: 5.8, yaw: 0 },
  bounds: { minX: -10, maxX: 10, minZ: -12, maxZ: 9 },
  sky: 0x9bb8c8,
  outdoor: true,
  fogColor: 0xb8c4c8,
  fogNear: 16,
  fogFar: 48,
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
    w.box(24, 0.08, 26, { x: 0, y: 0.02, z: -1, map: KH.tex.pflaster(), repeat: [12, 12], collide: false, cast: false });
    w.box(6, 0.04, 22, { x: -9.2, y: 0.05, z: -1, map: KH.tex.gehweg(), repeat: [3, 10], collide: false, cast: false });
    w.box(6, 0.04, 22, { x: 9.2, y: 0.05, z: -1, map: KH.tex.gehweg(), repeat: [3, 10], collide: false, cast: false });
    w.room({ id: 'halle', x: 0, z: 4, w: 14, d: 10, h: 4.2, wallHex: '#d5dee4',
      floorMap: KH.tex.pflaster(),
      doors: [{ wall: 'n', width: 3.2 }, { wall: 's', width: 2.4 }],
      windows: [{ wall: 'e', offset: -2, flowers: false }, { wall: 'e', offset: 2, flowers: false }, { wall: 'w', offset: 0, flowers: false }] });
    w.box(1.05, 1.75, 0.55, { x: -4.2, y: 0.9, z: 5.5, color: 0x123E77, collideR: 0.7 });
    w.box(0.85, 0.35, 0.12, { x: -4.2, y: 1.45, z: 5.22, color: 0x1a1a1a, collide: false });
    w.label('Automat', { x: -4.2, y: 2.12, z: 5.5, scale: 0.85 });
    w.hotspot({ id: 'automat', x: -4.2, z: 5.5, r: 1.3, label: 'Fahrkartenautomat' });
    w.box(3.4, 1.7, 0.1, { x: 3.4, y: 1.85, z: 0.15, color: 0x12141A, collide: false });
    w.poster(function (g, W, H) {
      g.fillStyle = '#111'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#F2C230'; g.font = 'bold 36px sans-serif'; g.textAlign = 'left';
      g.fillText('Abfahrt', 24, 50);
      g.fillStyle = '#eff1ec'; g.font = '28px sans-serif';
      g.fillText('München    14:22   Gl. 3', 24, 130);
      g.fillText('Ulm            14:40   Gl. 2', 24, 190);
      g.fillText('Augsburg  15:05   Gl. 4', 24, 250);
    }, { x: 3.4, y: 1.85, z: 0.28, w: 2.4, h: 1.35, cw: 640, ch: 360 });
    w.hotspot({ id: 'tafel', x: 3.4, z: 1.0, r: 1.4, label: 'Anzeigetafel' });
    w.npc({ id: 'schaffner', x: 1.2, z: 6.15, name: 'Schaffner', color: 0x123E77, hair: 0x1a1a1a, facing: Math.PI });
    KH.furn.bench(w, -3, 2.4);
    KH.furn.bench(w, 5.4, 2.4);
    KH.furn.plant(w, 6.1, 7.4);
    KH.furn.clock(w, 0, 3.15, 8.85);
    w.pendant(-3, 4, 3.9);
    w.pendant(3, 4, 3.9);
    w.box(18, 0.18, 8, { x: 0, y: 0.08, z: -7, color: 0x5a5e64, collide: false });
    w.box(18, 0.05, 0.22, { x: 0, y: 0.2, z: -3.9, color: 0xF2C230, collide: false });
    w.box(18, 0.15, 1.15, { x: 0, y: 0.12, z: -10.5, color: 0x2a2a2a, collide: false });
    [-6, 0, 6].forEach(function (gx, i) {
      w.box(2.2, 2.1, 0.1, { x: gx, y: 1.2, z: -4.15, color: 0xF2C230, collide: false });
      w.label('Gleis ' + (i + 2), { x: gx, y: 1.95, z: -3.75, scale: 0.9 });
    });
    w.hotspot({ id: 'gleis3', x: 0, z: -6.2, r: 1.6, label: 'Gleis 3' });
    w.box(6.2, 1.55, 1.45, { x: 0, y: 0.9, z: -9.45, color: 0xb13228, collideR: 1.5 });
    w.box(5.6, 0.55, 0.08, { x: 0, y: 1.35, z: -8.7, color: 0xcfe3ef, collide: false, transparent: true, opacity: 0.45 });
    w.label('RE 72', { x: 0, y: 1.85, z: -9.45, scale: 0.9 });
    KH.furn.laterne(w, -7.2, 7.6);
    KH.furn.laterne(w, 7.2, 7.6);
    KH.furn.laterne(w, -7.2, -2.2);
    KH.furn.haus(w, -9.6, 8.4, { stil: 'putz', wand: '#C5CCD0', dach: '#5E5B56', ry: Math.PI / 2, w: 4.2, d: 3.2, stock: 2 });
    KH.furn.haus(w, 9.8, 8.2, { stil: 'fachwerk', wand: '#E4D5C0', dach: '#6B3A32', ry: -Math.PI / 2, w: 4.0, d: 3.2 });
    KH.furn.tree(w, -9.5, -5.5);
    KH.furn.tree(w, 9.6, -5.2);
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
