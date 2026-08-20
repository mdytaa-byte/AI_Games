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
  spawn: { x: 0, z: 7.4, yaw: 0 },
  bounds: { minX: -12, maxX: 12, minZ: -12, maxZ: 10 },
  sky: 0x8ec4e8,
  outdoor: true,
  fogFar: 58,
  fogNear: 18,
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
    w.box(30, 0.08, 30, { x: 0, y: 0.02, z: -1, map: KH.tex.gras(), repeat: [14, 14], collide: false });
    w.box(8, 0.04, 10, { x: 0, y: 0.05, z: 1, map: KH.tex.pflaster(), repeat: [4, 5], collide: false });
    KH.furn.stall(w, -5, 2, 0x8B1E1E, 'Bratwurst', '#8B1E1E', '#F2C230');
    KH.furn.stall(w, 5, 2, 0x2A63A8, 'Karussell', '#2A63A8', '#F2C230');
    KH.furn.stall(w, -5, -5, 0x6B2D5B, 'Bühne / Musik', '#6B2D5B', '#e8dcc8');
    KH.furn.stall(w, 5, -5, 0x3E8E4E, 'Info-Stand', '#3E8E4E', '#F2C230');
    w.hotspot({ id: 'wurst', x: -5, z: 3.4, r: 1.45, label: 'Bratwurst' });
    w.hotspot({ id: 'karussell', x: 5, z: 3.4, r: 1.45, label: 'Karussell-Kasse' });
    w.hotspot({ id: 'buehne', x: -5, z: -3.6, r: 1.45, label: 'Bühne / Musik' });
    w.hotspot({ id: 'info', x: 5, z: -3.6, r: 1.45, label: 'Info-Stand' });
    w.npc({ id: 'metzger', x: -5, z: 3.45, name: 'Herr Kern', color: 0x8B1E1E, hair: 0x222222, facing: 0, apron: true });
    /* carousel */
    var car = new THREE.Group();
    function mcol(c) { return new THREE.MeshLambertMaterial({ color: c }); }
    var base = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.85, 0.35, 16), mcol(0xC25B4A));
    base.position.y = 0.2;
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), mcol(0xF2C230));
    pole.position.y = 1.3;
    var roof = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 2.0, 0.45, 12), mcol(0x8B1E1E));
    roof.position.y = 2.35;
    car.add(base, pole, roof);
    car.position.set(5, 0, 5.7);
    w.scene.add(car);
    w.obstacles.push({ kind: 'circ', x: 5, z: 5.7, r: 1.6 });
    w.tickers.push(function (now) { car.rotation.y = now * 0.0006; });
    KH.furn.tree(w, -9.2, -8);
    KH.furn.tree(w, 9.2, -8);
    KH.furn.tree(w, -9.2, 6.2);
    KH.furn.bench(w, 0, -0.8);
    KH.furn.bench(w, -1.6, 6.6);
    KH.furn.bench(w, 1.6, 6.6);
    w.label('Kleinhausener Stadtfest', { x: 0, y: 3.15, z: 6.4, scale: 1.9 });
    /* bunting */
    for (var i = -4; i <= 4; i++) {
      w.box(0.18, 0.22, 0.04, { x: i * 0.7, y: 2.7, z: 5.4, color: i % 2 ? 0xF2C230 : 0x8B1E1E, collide: false });
    }
    /* lanterns along the path */
    [-3.2, -1.1, 1.1, 3.2].forEach(function (lx) {
      w.cyl(0.04, 1.6, { x: lx, z: 0.4, color: 0x3a2a18, collide: false, seg: 6 });
      w.cyl(0.12, 0.16, { x: lx, y: 1.7, z: 0.4, color: 0xf2c230, collide: false, emissive: 0x442200, seg: 8 });
      w.lamps.push({ x: lx, y: 1.7, z: 0.4, color: 0xffd9a0, int: 0.28, dist: 4 });
    });
    KH.furn.pastry(w, -5.15, 1.12, 2.35, 0xc45c4a);
    KH.furn.pastry(w, -4.85, 1.12, 2.4, 0xc9a227);
    w.lamps.push({ x: -5, y: 2.4, z: 2, color: 0xffd9a0, int: 0.4, dist: 6 });
    w.lamps.push({ x: 5, y: 2.4, z: 2, color: 0xffd9a0, int: 0.4, dist: 6 });
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
