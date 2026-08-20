/* Stadtfest Kleinhausen — culture, food, perfect tense */
KH.start({
  id: 'fest',
  prefix: 'FES',
  title: 'Stadtfest Kleinhausen',
  place: 'Festplatz',
  level: 'A2–B1',
  blurb: {
    de: 'Heute ist Stadtfest. Besuche die Stände, hol dir Stempel, iss eine Bratwurst und schreib zwei Sätze im Perfekt über deinen Tag.',
    en: 'Today is the town festival. Visit booths, collect stamps, eat a bratwurst, and write two perfect-tense sentences about your day.'
  },
  how: [
    { de: 'Vier Stände: Bratwurst, Karussell, Bühne, Info.', en: 'Four booths: sausage, carousel, stage, info.' },
    { de: 'Perfekt: ich habe … gegessen / gehört / getanzt.', en: 'Perfect tense: I have eaten / heard / danced.' }
  ],
  spawn: { x: 0, z: 7.2, yaw: 0 },
  bounds: { minX: -12, maxX: 12, minZ: -12, maxZ: 10 },
  sky: 0x8ec4e8,
  fogFar: 55,
  vocab: [
    { de: 'das Stadtfest', en: 'town festival' },
    { de: 'die Bratwurst', en: 'bratwurst' },
    { de: 'das Karussell', en: 'the carousel' },
    { de: 'die Bühne', en: 'the stage' },
    { de: 'der Stand', en: 'the booth' },
    { de: 'ich habe gegessen', en: 'I ate / have eaten' },
    { de: 'die Tradition', en: 'tradition' }
  ],
  build: function (w) {
    w.box(28, 0.08, 28, { x: 0, y: 0.02, z: -1, color: 0x6a8f4e, collide: false, map: KH.tex.gras() });
    /* stalls */
    function stall(x, z, col, title, id) {
      w.box(3.2, 2.2, 2.0, { x: x, y: 1.1, z: z, color: col, collideR: 1.5 });
      w.box(3.4, 0.08, 2.2, { x: x, y: 2.28, z: z, color: 0xF2C230, collide: false });
      w.label(title, { x: x, y: 2.55, z: z, scale: 1.1 });
      w.hotspot({ id: id, x: x, z: z + 1.4, r: 1.4, label: title });
    }
    stall(-5, 2, 0x8B1E1E, 'Bratwurst', 'wurst');
    stall(5, 2, 0x2A63A8, 'Karussell-Kasse', 'karussell');
    stall(-5, -5, 0x6B2D5B, 'Bühne / Musik', 'buehne');
    stall(5, -5, 0x3E8E4E, 'Info-Stand', 'info');
    w.cyl(1.8, 0.4, { x: 5, y: 0.5, z: 5.5, color: 0xC25B4A, collideR: 1.5 });
    w.cyl(0.12, 2.2, { x: 5, y: 1.4, z: 5.5, color: 0xF2C230, collide: false });
    w.npc({ id: 'metzger', x: -5, z: 3.5, name: 'Herr Kern', color: 0x8B1E1E, hair: 0x222, facing: 0 });
    KH.furn.tree(w, -9, -8);
    KH.furn.tree(w, 9, -8);
    KH.furn.tree(w, -9, 6);
    KH.furn.bench(w, 0, -1);
    w.label('Kleinhausener Stadtfest', { x: 0, y: 3.2, z: 6, scale: 2.1 });
    w.box(0.3, 4, 0.3, { x: -10, y: 2, z: 8.5, color: 0xF2C230, collideR: 0.3 });
  },
  tasks: [
    {
      id: 'wurst', title: 'Bratwurst', hotspot: 'wurst', kind: 'dialogue', npc: 'Herr Kern', where: 'Festplatz',
      de: 'Kauf eine Bratwurst am Stand von Metzgerei Kern.',
      en: 'Buy a bratwurst at Metzgerei Kern’s booth.',
      line: { de: 'Eine Bratwurst mit Senf? Das macht 3,50 Euro.', en: 'A bratwurst with mustard? That’s €3.50.' },
      prompt: 'Bestellung:',
      choices: [
        { de: 'Ja, bitte, eine Bratwurst mit Senf. Hier sind vier Euro.', en: 'Yes please, one bratwurst with mustard. Here’s four euros.', ok: true, reply: { de: 'Und 50 Cent zurück. Guten Appetit! Stempel für dich.', en: '50 cents change. Enjoy! A stamp for you.' } },
        { de: 'Ich will das Karussell essen.', ok: false, tip: { de: 'Man isst die Bratwurst, man fährt Karussell.', en: 'You eat sausage; you ride the carousel.' } },
        { de: 'Mir tut der Hals weh, ohne Termin.', ok: false }
      ]
    },
    {
      id: 'karussell', title: 'Karussell', hotspot: 'karussell', kind: 'quiz', where: 'Festplatz',
      de: 'Am Karussell: Wie fragt man nach dem Preis?',
      en: 'At the carousel: how do you ask the price?',
      question: { de: 'Die höfliche Frage:', en: 'The polite question:' },
      options: [
        { de: 'Was kostet eine Fahrt, bitte?', en: 'What does a ride cost, please?', ok: true },
        { de: 'Wann fährt der Zug ab?', ok: false },
        { de: 'Wo ist das Waschbecken?', ok: false }
      ]
    },
    {
      id: 'buehne', title: 'Musik', hotspot: 'buehne', kind: 'inspect', where: 'an der Bühne',
      de: 'Geh zur Bühne. Eine Blaskapelle spielt.',
      en: 'Go to the stage. A brass band is playing.',
      inspectDe: 'Die Kapelle spielt ein Volksmusikstück. Leute klatschen im Takt. Das gehört zum Stadtfest in Kleinhausen seit 1962.',
      inspectEn: 'The band plays a folk tune. People clap along. This has been part of the Kleinhausen festival since 1962.',
      flavor: { de: '„Und jetzt ein Lied für unsere Gäste!“', en: '“And now a song for our guests!”' }
    },
    {
      id: 'info', title: 'Was ist ein Stadtfest?', hotspot: 'info', kind: 'quiz', where: 'Info-Stand',
      de: 'Am Info-Stand: Kulturquiz.',
      en: 'At the info booth: culture quiz.',
      question: { de: 'Was ist ein Stadtfest in Deutschland oft?', en: 'What is a German town festival often like?' },
      options: [
        { de: 'ein öffentliches Fest mit Essen, Musik und Ständen für die ganze Stadt', en: 'a public festival with food, music, and booths for the whole town', ok: true },
        { de: 'nur eine Prüfung im Gymnasium', ok: false },
        { de: 'ein Zug nach München um 14:22', ok: false }
      ]
    },
    {
      id: 'perfekt', title: 'Perfekt', hotspot: 'info', kind: 'write', where: 'Info-Stand',
      de: 'Schreib mindestens acht Wörter im Perfekt über deinen Festtag. Benutze „habe“ und „gegessen“ oder „gehört“.',
      en: 'Write at least eight words in the perfect tense about your festival day. Use “habe” and “gegessen” or “gehört”.',
      minWords: 8,
      mustInclude: ['habe'],
      chunks: ['Ich habe', 'eine Bratwurst', 'gegessen', 'und', 'Musik', 'gehört', 'auf dem Festplatz', 'in Kleinhausen.'],
      placeholder: 'Ich habe …'
    }
  ]
});
