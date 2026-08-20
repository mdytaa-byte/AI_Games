/* Heimatmuseum — describing, adjective endings, opinions */
KH.start({
  id: 'museum',
  prefix: 'MUS',
  title: 'Heimatmuseum Kleinhausen',
  place: 'Kirchplatz',
  level: 'B1',
  blurb: {
    de: 'Im Museum beschreibst du Exponate: Adjektivendungen, Meinungen („ich finde …“, „es gefällt mir“) und höfliches Sie.',
    en: 'In the museum you describe exhibits: adjective endings, opinions (“ich finde…”, “es gefällt mir”), and formal Sie.'
  },
  how: [
    { de: 'Vier Vitrinen: Fachwerk, Tracht, Straßenbahn, Gemälde.', en: 'Four cases: timber house, costume, tram, painting.' },
    { de: 'ein altes Fachwerkhaus — Adjektiv nach unbestimmtem Artikel.', en: 'ein altes Fachwerkhaus — adjective after ein.' }
  ],
  spawn: { x: 0, z: 4.2, yaw: 0 },
  bounds: { minX: -8, maxX: 8, minZ: -7, maxZ: 7.2 },
  sky: 0xcfc4b0,
  fogColor: 0xddd0b8,
  fogNear: 10,
  fogFar: 26,
  vocab: [
    { de: 'das Exponat', en: 'the exhibit' },
    { de: 'das Fachwerkhaus', en: 'timber-framed house' },
    { de: 'die Tracht', en: 'traditional costume' },
    { de: 'das Gemälde', en: 'the painting' },
    { de: 'ich finde …', en: 'I find / think …' },
    { de: 'es gefällt mir', en: 'I like it' },
    { de: 'ein altes …', en: 'an old … (neuter)' }
  ],
  build: function (w) {
    w.room({ id: 'saal', x: 0, z: 0, w: 14, d: 12, h: 4.1, wallHex: '#e9dcc6',
      wallMap: KH.tex.tapete('#e9dcc6', 'rgba(110,70,40,.18)'),
      doors: [{ wall: 's', width: 1.8 }],
      windows: [{ wall: 'n', offset: -3, flowers: false }, { wall: 'n', offset: 3, flowers: false }] });
    KH.furn.rug(w, 0, 0, 4.5, 6.5, 0x6a3a32);
    KH.furn.exhibit(w, -4.2, -2.5, 0x8B5A2B);
    w.label('Fachwerk', { x: -4.2, y: 1.95, z: -2.5, scale: 0.85 });
    w.hotspot({ id: 'fachwerk', x: -4.2, z: -1.5, r: 1.3, label: 'Fachwerkhaus' });
    KH.furn.exhibit(w, 4.2, -2.5, 0x2A63A8);
    w.label('Tracht', { x: 4.2, y: 1.95, z: -2.5, scale: 0.85 });
    w.hotspot({ id: 'tracht', x: 4.2, z: -1.5, r: 1.3, label: 'Tracht' });
    KH.furn.exhibit(w, -4.2, 2.8, 0xC25B4A);
    w.label('Straßenbahn', { x: -4.2, y: 1.95, z: 2.8, scale: 0.85 });
    w.hotspot({ id: 'tram', x: -4.2, z: 3.55, r: 1.3, label: 'alte Straßenbahn' });
    w.poster(function (g, W, H) {
      g.fillStyle = '#6a8cae'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#e8dcc0'; g.fillRect(0, H * 0.58, W, H * 0.42);
      g.fillStyle = '#8B1E1E'; g.fillRect(W * 0.3, H * 0.4, W * 0.4, H * 0.22);
      g.fillStyle = '#F2C230'; g.beginPath(); g.arc(W * 0.22, H * 0.22, 36, 0, Math.PI * 2); g.fill();
    }, { x: 4.0, y: 1.7, z: 5.55, w: 1.5, h: 1.15 });
    w.hotspot({ id: 'bild', x: 4.0, z: 2.55, r: 1.3, label: 'Gemälde' });
    w.npc({ id: 'guide', x: 0, z: -3.75, name: 'Herr Otto', color: 0x4a4038, hair: 0xcccccc, facing: 0 });
    KH.furn.plant(w, 6.15, 5.15);
    KH.furn.plant(w, -6.15, 5.15);
    KH.furn.bench(w, 0, 0.4);
    KH.furn.clock(w, 0, 3.05, -5.82);
    w.label('Heimatmuseum', { x: 0, y: 3.35, z: 0, scale: 1.55 });
    w.pendant(-4.2, -2.5, 3.7);
    w.pendant(4.2, -2.5, 3.7);
    w.pendant(-4.2, 2.8, 3.7);
    w.pendant(4.0, 3.2, 3.7);
  },
  tasks: [
    {
      id: 'fachwerk', title: 'Fachwerk', hotspot: 'fachwerk', kind: 'quiz', where: 'Saal 1',
      de: 'Beschreibe das Modell: Adjektivendung nach „ein“.',
      en: 'Describe the model: adjective ending after “ein”.',
      question: { de: 'Kleinhausen hat ___ Fachwerkhaus am Markt.', en: 'Kleinhausen has ___ timber house on the market square.' },
      options: [
        { de: 'ein altes (ein + sächlich + Nominativ → -es)', en: 'ein altes (neuter nominative)', ok: true },
        { de: 'ein alter', ok: false, tip: { de: 'das Haus → sächlich: ein altes Haus.', en: 'das Haus is neuter: ein altes.' } },
        { de: 'eine alte', ok: false }
      ]
    },
    {
      id: 'tracht', title: 'Tracht', hotspot: 'tracht', kind: 'dialogue', npc: 'Texttafel', where: 'Saal 1',
      de: 'Lies die Tafel zur Tracht und wähle die Meinung.',
      en: 'Read the costume plaque and choose an opinion.',
      line: { de: 'Diese Tracht trug man zu Festen am Kleinhausener See um 1900.', en: 'This costume was worn at festivals by the lake around 1900.' },
      prompt: 'Wie sagst du deine Meinung höflich?',
      choices: [
        { de: 'Ich finde die Tracht interessant, aber für heute etwas unpraktisch.', en: 'I find the costume interesting but a bit impractical today.', ok: true, reply: { de: 'Eine klare, höfliche Meinung — gut.', en: 'A clear, polite opinion — good.' } },
        { de: 'Ist voll cringe, ey.', ok: false, tip: { de: 'Im Museum: Standardsprache. „Ich finde …“ / „Es gefällt mir (nicht).“', en: 'Use standard German in the museum.' } },
        { de: 'Gib mir Kaffee.', ok: false }
      ]
    },
    {
      id: 'tram', title: 'Straßenbahn', hotspot: 'tram', kind: 'quiz', where: 'Saal 1',
      de: 'Die alte Straßenbahn: Adjektiv nach bestimmtem Artikel.',
      en: 'The old tram: adjective after the definite article.',
      question: { de: '___ Straßenbahn fuhr bis 1978 durch Kleinhausen.', en: '___ tram ran through Kleinhausen until 1978.' },
      options: [
        { de: 'Die gelbe (die + feminin + Nominativ → -e)', ok: true },
        { de: 'Der gelbes', ok: false, tip: { de: 'die Straßenbahn ist feminin: die gelbe Straßenbahn.', en: 'Feminine: die gelbe.' } },
        { de: 'Das gelber', ok: false }
      ]
    },
    {
      id: 'bild', title: 'Gemälde', hotspot: 'bild', kind: 'dialogue', npc: 'Herr Otto', where: 'an der Wand',
      de: 'Frag den Museumsführer höflich (Sie) nach dem Bild.',
      en: 'Ask the guide politely (Sie) about the painting.',
      line: { de: 'Das Bild zeigt den Marktplatz im Winter 1924.', en: 'The painting shows the market square in winter 1924.' },
      prompt: 'Die höfliche Frage:',
      choices: [
        { de: 'Könnten Sie mir bitte mehr darüber erzählen?', en: 'Could you please tell me more about it?', ok: true, reply: { de: 'Gern. Der Maler hieß Haller und wohnte in der Mühlgasse.', en: 'Gladly. The painter was named Haller and lived on Mühlgasse.' } },
        { de: 'Erzähl mal, was das soll.', ok: false, tip: { de: 'Zu grob. Konjunktiv II + Sie: Könnten Sie …?', en: 'Too blunt. Use Könnten Sie…?' } },
        { de: 'Wann fährt das Bild ab?', ok: false }
      ]
    },
    {
      id: 'meinung', title: 'Gefallen', hotspot: 'guide', kind: 'write', where: 'Foyer',
      de: 'Schreib eine kurze Meinung (mind. acht Wörter). Benutze „finde“ oder „gefällt“.',
      en: 'Write a short opinion (at least eight words). Use “finde” or “gefällt”.',
      minWords: 8,
      mustInclude: ['finde'],
      chunks: ['Ich finde', 'das Museum', 'spannend', ',', 'weil', 'die alten', 'Exponate', 'die Stadtgeschichte', 'zeigen.'],
      placeholder: 'Ich finde das Museum …'
    }
  ]
});
