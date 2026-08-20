/* Arztpraxis Dr. Weber — health, body, modals */
KH.start({
  id: 'arzt',
  prefix: 'ARZ',
  title: 'Arztpraxis Dr. Weber',
  place: 'Kirchweg 2',
  level: 'A2',
  blurb: {
    de: 'Du hast Kopfschmerzen. Melde dich an der Rezeption, warte, und erkläre Dr. Weber, wo es wehtut. Übe Körperteile und Modalverben.',
    en: 'You have a headache. Check in, wait, and tell Dr. Weber what hurts. Practice body parts and modal verbs.'
  },
  how: [
    { de: 'Rezeption → Wartezimmer → Behandlungszimmer.', en: 'Reception → waiting room → exam room.' },
    { de: '„Mir tut der Kopf weh.“ Modalverben: müssen, sollen, können.', en: '“My head hurts.” Modals: must, should, can.' }
  ],
  spawn: { x: 0.8, z: 5.4, yaw: 0 },
  bounds: { minX: -7, maxX: 7, minZ: -7.2, maxZ: 7.2 },
  sky: 0xdce8e4,
  fogColor: 0xd8e0dc,
  fogNear: 10,
  fogFar: 22,
  vocab: [
    { de: 'die Rezeption', en: 'reception' },
    { de: 'der Termin', en: 'the appointment' },
    { de: 'das Wartezimmer', en: 'waiting room' },
    { de: 'der Kopf / der Bauch / der Hals', en: 'head / stomach / throat' },
    { de: 'Mir tut … weh', en: '… hurts' },
    { de: 'müssen / sollen / können', en: 'must / should / can' },
    { de: 'das Rezept', en: 'the prescription' }
  ],
  build: function (w) {
    w.room({ id: 'empfang', x: 0, z: 4.2, w: 8, d: 6, h: 3.1, wallHex: '#e8f0ee',
      floorMap: KH.tex.fliesen('#eef3f0', '#d5ddd8'),
      doors: [{ wall: 's', width: 1.5 }, { wall: 'n', width: 1.4 }, { wall: 'e', width: 1.3 }],
      windows: [{ wall: 's', offset: 2.2, flowers: true }] });
    KH.furn.counter(w, -1.6, 2.0, 3.2, 0.7);
    w.npc({ id: 'rezeption', x: -1.6, z: 1.35, name: 'Frau Novak', color: 0x3E8E4E, hair: 0x2a1a10, facing: 0 });
    w.label('Rezeption', { x: -1.6, y: 2.42, z: 2.0, scale: 0.9 });
    KH.furn.plant(w, 3.15, 6.15);
    KH.furn.clock(w, -3.1, 2.45, 1.32);
    w.pendant(-1.6, 3.2, 2.9);
    w.box(0.35, 0.28, 0.28, { x: -0.5, y: 1.2, z: 2.0, color: 0x1a1a1a, collide: false });
    KH.furn.paper(w, 5.4, 0.08, 4.2);
    KH.furn.paper(w, 5.55, 0.09, 4.35);
    w.room({ id: 'warte', x: 5.0, z: 4.2, w: 5.2, d: 6, h: 3.1, wallHex: '#f4efe6',
      doors: [{ wall: 'w', width: 1.3 }],
      windows: [{ wall: 'e', offset: 0 }] });
    KH.furn.sofa(w, 5.2, 3.35);
    KH.furn.chair(w, 6.35, 5.35, Math.PI);
    KH.furn.rug(w, 5.1, 4.0, 2.4, 1.5, 0x8a9e8c);
    w.hotspot({ id: 'warte', x: 5.2, z: 3.35, r: 1.3, label: 'Wartezimmer' });
    w.label('Wartezimmer', { x: 5.0, y: 2.5, z: 4.2, scale: 0.9 });
    w.pendant(5.0, 4.2, 2.9);
    w.room({ id: 'zimmer', x: 0, z: -2.6, w: 8, d: 6.4, h: 3.1, wallHex: '#e6eef5',
      floorMap: KH.tex.fliesen('#e8eef2', '#c5d0d8'),
      doors: [{ wall: 's', width: 1.4 }] });
    w.box(2.25, 0.62, 0.88, { x: -1.5, y: 0.48, z: -3.75, color: 0xeff1ec, collideR: 0.95 });
    w.box(2.2, 0.04, 0.85, { x: -1.5, y: 0.82, z: -3.75, color: 0xf7f1e3, collide: false });
    w.npc({ id: 'arzt', x: 1.15, z: -2.15, name: 'Dr. Weber', color: 0x123E77, hair: 0x888888, facing: Math.PI });
    w.poster(function (g, W, H) {
      g.fillStyle = '#f4ead4'; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#8B1E1E'; g.lineWidth = 4;
      g.beginPath(); g.arc(W / 2, 90, 50, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#3a2414'; g.font = '24px Georgia'; g.textAlign = 'center';
      g.fillText('Kopf', W / 2, 160);
      g.fillText('Hals', W / 2, 250);
      g.fillText('Bauch', W / 2, 340);
    }, { x: 3.2, y: 1.65, z: -5.35, w: 0.85, h: 1.2 });
    w.hotspot({ id: 'koerper', x: 3.2, z: -4.0, r: 1.2, label: 'Körperbild' });
    w.label('Behandlungszimmer', { x: 0, y: 2.65, z: -5.15, scale: 1.05 });
    w.pendant(0, -2.6, 2.9);
    KH.furn.plant(w, -3.2, -0.5);
  },
  tasks: [
    {
      id: 'anmelden', title: 'Anmelden', hotspot: 'rezeption', kind: 'dialogue', npc: 'Frau Novak', where: 'Rezeption',
      de: 'Melde dich an der Rezeption an.',
      en: 'Check in at reception.',
      line: { de: 'Guten Tag, Praxis Dr. Weber. Haben Sie einen Termin?', en: 'Hello, Dr Weber’s practice. Do you have an appointment?' },
      prompt: 'Was sagst du?',
      choices: [
        { de: 'Guten Tag. Ich habe um zehn Uhr einen Termin. Mein Name steht auf der Liste.', en: 'Hello. I have a ten o’clock appointment.', ok: true, reply: { de: 'Bitte nehmen Sie im Wartezimmer Platz.', en: 'Please take a seat in the waiting room.' } },
        { de: 'Ich will sofort den Chef!', ok: false, tip: { de: 'Zu grob. Sag, dass du einen Termin hast.', en: 'Too rude. Say you have an appointment.' } },
        { de: 'Einmal zum Gleis 3, bitte.', ok: false }
      ]
    },
    {
      id: 'warten', title: 'Warten', hotspot: 'warte', kind: 'inspect', where: 'Wartezimmer',
      de: 'Setz dich ins Wartezimmer.',
      en: 'Sit in the waiting room.',
      inspectDe: 'Du sitzt. Eine Zeitschrift liegt auf dem Tisch. Nach zehn Minuten ruft Frau Novak deinen Namen.',
      inspectEn: 'You sit. A magazine is on the table. After ten minutes Frau Novak calls your name.',
      flavor: { de: '„Bitte kommen Sie ins Behandlungszimmer!“', en: '“Please come into the exam room!”' }
    },
    {
      id: 'symptom', title: 'Symptome', hotspot: 'arzt', kind: 'dialogue', npc: 'Dr. Weber', where: 'Behandlungszimmer',
      de: 'Erkläre, wo es wehtut.',
      en: 'Explain what hurts.',
      line: { de: 'Was fehlt Ihnen denn? Wo tut es weh?', en: 'What’s the matter? Where does it hurt?' },
      prompt: 'Die passende Antwort:',
      choices: [
        { de: 'Mir tut der Kopf weh, und ich habe Husten.', en: 'My head hurts and I have a cough.', ok: true, reply: { de: 'Ich schaue mal. Den Hals auch?', en: 'Let me see. The throat as well?' } },
        { de: 'Mein Kopf ist müde Auto.', ok: false, tip: { de: 'Formel: Mir tut + Körperteil (Nominativ) + weh.', en: 'Pattern: Mir tut + body part + weh.' } },
        { de: 'Ich hätte gern einen Kaffee, bitte.', ok: false }
      ]
    },
    {
      id: 'koerper', title: 'Körperteile', hotspot: 'koerper', kind: 'quiz', where: 'Behandlungszimmer',
      de: 'Zeige am Poster: Welches Wort passt nicht in die Reihe Kopf — Hals — …',
      en: 'On the poster: which word does not belong with head — throat — …',
      question: { de: 'Was ist ein Körperteil?', en: 'Which is a body part?' },
      options: [
        { de: 'der Bauch', en: 'the stomach', ok: true },
        { de: 'der Fahrplan', en: 'the timetable', ok: false, tip: { de: 'Fahrplan gehört zum Bahnhof.', en: 'That’s a station word.' } },
        { de: 'das Gleis', ok: false }
      ]
    },
    {
      id: 'modal', title: 'Rat', hotspot: 'arzt', kind: 'quiz', where: 'Behandlungszimmer',
      de: 'Dr. Weber gibt einen Rat mit Modalverb.',
      en: 'Dr Weber gives advice with a modal verb.',
      question: { de: '„Sie ___ sich ausruhen und viel Wasser trinken.“', en: '“You ___ rest and drink a lot of water.”' },
      options: [
        { de: 'müssen (Notwendigkeit: müssen + Infinitiv)', en: 'müssen = have to', ok: true },
        { de: 'möchtet', ok: false, tip: { de: 'Höflicher Rat an „Sie“: Sie müssen / Sie sollen + Infinitiv.', en: 'Formal you: Sie müssen / sollen + infinitive.' } },
        { de: 'abfahren', ok: false }
      ]
    }
  ]
});
