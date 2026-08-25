/* Episodes 1–8 */
(function (global) {
  const KH = global.KH = global.KH || {};
  KH.MODULES = KH.MODULES || [];

  KH.MODULES.push({
    id: "e01",
    n: 1,
    title: "Ankunft",
    titleLong: "Nächster Halt: Kleinhausen",
    season: "September · bewölkt · 16°",
    skills: ["listening", "speaking", "reading", "writing"],
    canDo: [
      { de: "Ich kann mich begrüßen und vorstellen.", en: "I can greet and introduce myself." },
      { de: "Ich kann einfache Durchsagen und Schilder verstehen.", en: "I can understand simple announcements and signs." },
      { de: "Ich kann sagen, woher ich komme und wie es mir geht.", en: "I can say where I’m from and how I am." }
    ],
    vocab: ["Hallo", "Guten Tag", "Ich heiße", "Ich komme aus", "der Bahnhof", "die Familie", "das Zimmer", "Willkommen", "danke", "bitte"],
    grammar: "sein; W-Fragen (wie, wo, woher); Sie vs. du",
    places: ["bahnhof", "haus"],
    scenes: [
      {
        type: "narrate",
        kicker: "Episode 1 · Du-Perspektive",
        title: "Der Zug hält.",
        paras: [
          "Der Lautsprecher knackt. Dein Koffer ist zu schwer. Draußen: Fachwerk, ein gelbes Schild, Regen auf dem Bahnsteig.",
          "Du bist nicht im Urlaub. Du wohnst jetzt hier. Ein Jahr. Familie Fröhlich holt dich ab — hoffentlich.",
          "Auf einem Plakat am kiosk: <strong>750 Jahre Kleinhausen. Wir feiern. Oder wir parken.</strong> Du verstehst nicht alles. Noch nicht."
        ],
        en: "The train stops. You live here now. A poster already hints at the town fight: celebrate 750 years — or build parking."
      },
      {
        type: "listen",
        title: "Durchsage am Bahnhof",
        intro: "Hör die Bahnhofsansage. Was ist wichtig für dich?",
        introEn: "Listen to the station announcement.",
        listenId: "e01-bahnhof",
        speaker: "ansage",
        audio: "Nächster Halt: Kleinhausen. Bitte aussteigen. Der Zug nach Kassel fährt heute von Gleis zwei. Achtung, der Aufzug ist defekt. Nutzen Sie bitte die Treppe. Willkommen in Kleinhausen.",
        questions: [
          {
            de: "Wo bist du?",
            en: "Where are you?",
            options: [
              { de: "In Kleinhausen.", en: "In Kleinhausen.", ok: true, feedback: "Genau — nächster Halt war Kleinhausen.", feedbackEn: "Correct." },
              { de: "In Kassel.", ok: false, feedback: "Kassel ist ein anderer Zug — Gleis zwei." },
              { de: "Im Aufzug.", ok: false, feedback: "Der Aufzug ist defekt. Du nimmst die Treppe." }
            ]
          },
          {
            de: "Was ist kaputt?",
            en: "What is broken?",
            options: [
              { de: "Der Aufzug.", ok: true, feedback: "Ja. defekt = kaputt." },
              { de: "Gleis zwei.", ok: false, feedback: "Gleis zwei ist in Ordnung." },
              { de: "Das Plakat.", ok: false, feedback: "Das steht nicht in der Durchsage." }
            ]
          }
        ]
      },
      {
        type: "read",
        kicker: "Schilder lesen",
        title: "Am Bahnsteig",
        style: "signage",
        html: "<p>AUSGANG → Stadt</p><p>TAXI  |  BUS Linie 3 → Marktplatz</p><p>FAMILIE FRÖHLICH — Treffpunkt: Uhr / Kiosk</p><p>ACHTUNG: Gleis 1 heute gesperrt</p>",
        plain: "Ausgang Stadt. Taxi. Bus Linie 3 zum Marktplatz. Familie Fröhlich Treffpunkt Uhr Kiosk. Gleis 1 heute gesperrt.",
        en: "Exit to town. Bus 3 to the market. Meet the Fröhlichs at the clock / kiosk. Track 1 closed today.",
        questions: [
          {
            de: "Wo wartest du auf die Familie?",
            options: [
              { de: "An der Uhr beim Kiosk.", ok: true, feedback: "Treffpunkt: Uhr / Kiosk." },
              { de: "Auf Gleis 1.", ok: false, feedback: "Gleis 1 ist gesperrt — und sie warten in der Halle." },
              { de: "Im Zug nach Kassel.", ok: false, feedback: "Du steigst aus, du fährst nicht weiter." }
            ]
          }
        ]
      },
      {
        type: "dialogue",
        npc: "stefan",
        line: "Guten Tag! Sind Sie … unser Gast? Ich bin Stefan Fröhlich. Willkommen!",
        lineEn: "Hello! Are you our guest? I’m Stefan. Welcome!",
        prompt: "Du antwortest. Er ist Erwachsener — und fremd.",
        promptEn: "He is an adult you just met.",
        options: [
          { de: "Guten Tag, Herr Fröhlich. Ja, ich bin's. Ich heiße … Danke!", ok: "good", trust: 1, feedback: "Höflich und klar. Siezen am ersten Tag ist richtig.", feedbackEn: "Formal 'Sie' is right on day one." },
          { de: "Hey, was geht?", ok: false, trust: -1, feedback: "Zu cool. Stefan lächelt unsicher. In Deutschland siezt man Erwachsene zuerst." },
          { de: "Ja. Ich komme. Wo ist das Zimmer.", ok: "ok", feedback: "Verständlich, aber kurz. Ein Hallo und ein Name helfen." }
        ]
      },
      {
        type: "dialogue",
        npc: "lena",
        line: "Endlich! Ich bin Lena. Du kannst du sagen. Das ist Bello. Er stinkt ein bisschen, aber er mag dich schon.",
        lineEn: "I’m Lena. We can use 'du'. This is Bello.",
        prompt: "Lena ist in deinem Alter.",
        options: [
          { de: "Hallo Lena! Ich freue mich. Hallo Bello!", ok: true, trust: 1, feedback: "Warm. Lena fotografiert euch sofort." },
          { de: "Guten Tag, Frau Fröhlich.", ok: false, feedback: "Sie ist 15, nicht deine Chefin. Zu viel Siezen kann auch komisch sein." },
          { de: "Der Hund ist schrecklich.", ok: false, trust: -1, feedback: "Bello hört das. Lena auch." }
        ]
      },
      {
        type: "culture",
        title: "Siezen, Duzen, Ankommen",
        html: "<p>Am Bahnhof: <strong>Sie</strong> zu Erwachsenen, die du nicht kennst. In der Familie und mit Lena: bald <strong>du</strong>. Oft sagt jemand: <em>„Sagen Sie ruhig du.“</em></p><p>Das ist keine Kleinigkeit — es ist der erste soziale Code der Stadt. Wer duzt ohne Einladung, klingt nicht modern, sondern unhöflich.</p>",
        en: "Use Sie with unknown adults. Family and teens will invite you to du."
      },
      {
        type: "room",
        title: "Dein Zimmer unter dem Dach",
        intro: "Die Schräge, ein Fenster zum Rosenweg, ein Zettel von Oma. Klicke alles an.",
        hotspots: [
          { x: 18, y: 60, label: "das Bett", de: "Das Bett ist frisch. Es riecht nach Waschmittel.", en: "The bed is freshly made." },
          { x: 70, y: 28, label: "das Fenster", de: "Vom Fenster siehst du Fachwerk und den Turm weit weg.", en: "The window looks onto timber-frame houses." },
          { x: 42, y: 48, label: "der Schreibtisch", de: "Auf dem Schreibtisch: ein Heft, ein Stift, ein Stadtplan.", en: "Desk with a notebook and a town map." },
          { x: 80, y: 70, label: "der Koffer", de: "Dein Koffer. Noch nicht ausgepackt. Das Jahr fängt an.", en: "Your suitcase. The year starts now." },
          { x: 28, y: 22, label: "der Zettel", de: "Oma Ursula schreibt: Willkommen! Kuchen um vier. Bitte die Schuhe ausziehen.", en: "Welcome note: cake at four. Shoes off." }
        ]
      },
      {
        type: "write",
        title: "Nachricht nach Hause",
        prompt: "Schreib 5–7 Sätze auf Deutsch an eine Person zu Hause (Handy-Nachricht). Wer bist du, wo bist du, wie geht’s, wer ist Lena, was siehst du?",
        promptEn: "Write a short German message home.",
        checklist: ["Begrüßung", "Ich heiße / ich bin in Kleinhausen", "Familie oder Lena", "ein Gefühl (gut, müde, nervös)", "Schluss (bis bald / tschüss)"],
        rubric: { minChars: 80, needles: [["hallo", "lieber", "liebe", "hi"], ["kleinhausen", "stadt", "bahnhof", "zimmer"], ["lena", "familie", "bello", "stefan"], ["bin", "heisse", "heiße", "komme"]] }
      },
      {
        type: "ipa",
        title: "Can-Do Check: Ankommen",
        interpretive: {
          type: "read",
          title: "Zettel an der Tür",
          style: "note",
          html: "<p>Willkommen!</p><p>Schlüssel: unter der Matte? NEIN — bei Birgit.</p><p>Abendessen: 18:30. Wir essen zusammen.</p><p>WLAN: Fröhlich-Gast / bitte fragen</p><p>Bello nicht füttern. Er lügt mit den Augen.</p>",
          questions: [
            {
              de: "Wann isst die Familie?",
              options: [
                { de: "Um halb sieben.", ok: true, feedback: "18:30 = halb sieben." },
                { de: "Um sechs.", ok: false, feedback: "18:30 ist später als 18:00." },
                { de: "Um vier, mit Kuchen.", ok: false, feedback: "Kuchen war früher. Abendessen steht auf dem Zettel." }
              ]
            },
            {
              de: "Wo ist der Schlüssel nicht?",
              options: [
                { de: "Unter der Matte.", ok: true, feedback: "Großes NEIN." },
                { de: "Bei Birgit.", ok: false, feedback: "Bei Birgit IST er." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "birgit",
          line: "So, du bist da. Wie war die Reise? Bist du müde? Möchtest du Wasser oder Tee?",
          lineEn: "How was the trip? Tired? Water or tea?",
          followUp: { de: "Mit Zucker oder ohne? Und warum bist du müde — Flugzeug oder Zug?", en: "Sugar? And why tired — plane or train?" },
          prompt: "Antworte in ganzen, einfachen Sätzen.",
          options: [
            { de: "Danke, Frau Fröhlich. Die Reise war lang. Ich bin müde. Tee, bitte.", ok: true, feedback: "Höflich, vollständig, klar." },
            { de: "Ja.", ok: false, feedback: "Zu wenig. Sie hat drei Fragen gestellt." },
            { de: "Gib mir Cola.", ok: false, feedback: "Klingt nach Befehl. Bitte fehlt. Cola steht nicht auf dem Tablett." }
          ]
        },
        presentational: {
          type: "speak",
          title: "Wer bin ich?",
          prompt: "Stell dich der Familie vor: Name, Herkunft, Alter (oder Klasse), ein Hobby, ein Gefühl heute.",
          promptEn: "Introduce yourself: name, origin, one hobby, how you feel.",
          model: "Hallo, ich heiße Alex. Ich komme aus den USA. Ich bin fünfzehn. Ich mag Musik. Heute bin ich nervös, aber auch froh."
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e02",
    n: 2,
    title: "Meine Stadt",
    titleLong: "Rund um den Marktplatz",
    season: "September · Sonne nach Regen · 18°",
    skills: ["reading", "listening", "writing"],
    canDo: [
      { de: "Ich kann Gebäude und Schilder in der Stadt erkennen.", en: "I can identify buildings and signs in town." },
      { de: "Ich kann einfache Wegangaben verstehen.", en: "I can understand simple directions." }
    ],
    vocab: ["das Rathaus", "der Brunnen", "die Kirche", "die Bäckerei", "links", "rechts", "geradeaus", "der Marktplatz"],
    grammar: "bestimmte Artikel (der/die/das); Lokaladverbien",
    places: ["markt", "rathaus", "kirche", "museum"],
    scenes: [
      {
        type: "narrate",
        kicker: "Episode 2",
        title: "Lena hat eine Kamera. Du hast Aufgaben.",
        paras: [
          "„Touristen fotografieren Zufall. Einwohner fotografieren Absicht“, sagt Lena. „Heute lernst du die Stadt. Nicht Instagram. Namen.“",
          "Am Brunnen stehen zwei Leute. Die eine hat einen Kinderwagen. Der andere hat Pläne unter dem Arm, auf denen ein graues Parkhaus klebt.",
          "Du hörst: <em>Festplatz</em>. <em>unmöglich</em>. <em>endlich Parkplätze</em>. Dann: Kirchenglocken."
        ],
        en: "Lena takes you on a names-not-selfies tour. At the fountain, the town argument has already started."
      },
      {
        type: "match",
        title: "Was ist das?",
        pairs: [
          { left: "das Rathaus", leftEn: "town hall", right: "Hier arbeitet die Bürgermeisterin." },
          { left: "der Brunnen", leftEn: "fountain", right: "In der Mitte vom Marktplatz. Münzen hinein." },
          { left: "die Kirche", leftEn: "church", right: "St. Nikolai. Glocken um zwölf." },
          { left: "die Bäckerei", leftEn: "bakery", right: "Goldene Brezel über der Tür." },
          { left: "das Museum", leftEn: "museum", right: "Alte Fotos, ein Schlossmodell, 750 Jahre." }
        ]
      },
      {
        type: "dialogue",
        npc: "haller",
        line: "Junge Leute fotografieren den Brunnen. Schön. Aber wissen Sie, dass man hier nicht parken kann? Mit den Knien … der Festplatz wäre besser als Parkhaus.",
        lineEn: "Pretty fountain. But you can’t park here. With my knees, a garage on the festival square would be better.",
        prompt: "Du kennst sie noch nicht. Sie ist älter.",
        options: [
          { de: "Guten Tag. Ich bin neu hier. Ich höre zu.", ok: true, trust: 1, feedback: "Du widersprichst nicht und du verachtest nicht. Das ist der Anfang von Nachbarschaft." },
          { de: "Parkhäuser sind hässlich!", ok: false, trust: -1, feedback: "Vielleicht wahr — aber du kennst ihre Knie nicht. Lena zieht dich weg." },
          { de: "Whatever.", ok: false, feedback: "Englisch und Desinteresse. Sie dreht sich um." }
        ]
      },
      {
        type: "activity",
        title: "Foto-Schnitzeljagd",
        src: "praxis/foto-schnitzeljagd.html",
        de: "Lauf in der Ich-Perspektive durch Kleinhausen. Lies die Aufgaben auf Deutsch, finde die Gebäude, mach Fotos. Am Ende: eine Postkarte.",
        en: "First-person 3D photo hunt through town. This is the same Kleinhausen — now it counts as Episode 2 praxis.",
        points: 12
      },
      {
        type: "culture",
        title: "Marktplatz-Logik",
        html: "<p>Viele deutsche Kleinstädte drehen sich um den <strong>Markt</strong>: Rathaus, Kirche, Brunnen, Bäcker. Der Platz ist Bühne — Markt, Fastnacht, Gedenken, Demonstration.</p><p>Wenn jemand den Platz in Parkplätze verwandeln will, geht es selten nur um Autos. Es geht darum, <em>wo Öffentlichkeit stattfindet</em>.</p>",
        en: "The market square is civic stage, not leftover space. That’s why the parking fight hurts."
      },
      {
        type: "ipa",
        title: "Stadtrallye — Nachweis",
        interpretive: {
          type: "listen",
          title: "Lena im Walkie (okay, im Handy)",
          intro: "Lena schickt eine Sprachnachricht.",
          listenId: "e02-lena",
          speaker: "lena",
          audio: "Okay. Du stehst am Brunnen. Das Rathaus ist das große Gebäude mit der Uhr. Links von dir ist die Bäckerei, rechts die Gasse zur Kirche. Geradeaus siehst du das Kaufhaus — das ist uns. Komm zum Café Federkiel, neben dem Kaufhaus. Ich bestelle schon.",
          questions: [
            {
              de: "Wo ist Café Federkiel?",
              options: [
                { de: "Neben dem Kaufhaus.", ok: true, feedback: "Neben dem Kaufhaus — Lena hat es gesagt." },
                { de: "Links vom Brunnen, in der Kirche.", ok: false, feedback: "Kirche ist rechts die Gasse entlang." },
                { de: "Am Bahnhof.", ok: false, feedback: "Nicht in dieser Nachricht." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "otto",
          line: "Na? Neu in der Stadt? Ein Brötchen? Wir haben Roggen, Körner, und — für Touristen — etwas Süßes.",
          followUp: { de: "Zum Mitnehmen oder hier essen? Und wie heißt du?", en: "To go or here? What’s your name?" },
          prompt: "Bestelle höflich. Du bist hungrig.",
          options: [
            { de: "Guten Tag. Ein Körnerbrötchen, bitte.", ok: true, feedback: "Klassiker. Herr Otto nickt wie eine Note." },
            { de: "Gib Brötchen.", ok: false, feedback: "Artikel, Bitte, Begrüßung — alles fehlt." },
            { de: "Ich bin kein Tourist. Ich wohne hier.", ok: "ok", feedback: "Stimmt, aber du hast nichts zu essen. Danach: bitte bestellen." }
          ]
        },
        presentational: {
          type: "write",
          title: "Drei Sätze für den Stadtplan",
          prompt: "Schreib drei Sätze: Wo ist das Rathaus? Was magst du? Was ist ein Problem in der Stadt (Parken / Festplatz)?",
          rubric: { minChars: 50, needles: [["rathaus", "markt", "brunnen", "bäckerei", "baeckerei"], ["ich"], ["fest", "park", "platz", "auto"]] }
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e03",
    n: 3,
    title: "Schule",
    titleLong: "Gymnasium Kleinhausen, Raum 12",
    season: "September · Wochentag · 14°",
    skills: ["reading", "speaking", "listening"],
    canDo: [
      { de: "Ich kann meinen Stundenplan lesen.", en: "I can read a class schedule." },
      { de: "Ich kann sagen, welche Fächer ich habe und mag.", en: "I can say which subjects I have and like." }
    ],
    vocab: ["der Stundenplan", "das Fach", "die Pause", "die Klassenlehrerin", "Mathe", "Deutsch", "die erste Stunde"],
    grammar: "Uhrzeit (offiziell); gern / nicht gern; Artikel im Nominativ",
    places: ["schule"],
    scenes: [
      {
        type: "narrate",
        title: "Der Rucksack ist neu. Das Gefühl auch.",
        paras: [
          "Gymnasium Kleinhausen: gelbe Klinker, ein Fahnenmast, ein Geruch nach Bodenwachs. Aylin steht auch allein. Sie kommt aus Frankfurt und kennt die Stadt erst seit Juni.",
          "An der Pinnwand: Chor. Umwelt-AG. Und ein Flyer: <strong>Nordpark GmbH — Moderne Mobilität für Kleinhausen.</strong> Darunter, mit Stift: <em>„Nicht ohne uns.“</em>",
          "Raum 12. Frau Vogel schließt die Tür, als die Glocke noch klingt."
        ],
        en: "First day. Aylin is new too. The parking company already has a flyer on the school board."
      },
      {
        type: "read",
        title: "Stundenplan — Klasse 10b",
        style: "",
        html: "<table><thead><tr><th></th><th>Mo</th><th>Di</th><th>Mi</th><th>Do</th><th>Fr</th></tr></thead><tbody><tr><td>8:00</td><td>Deutsch</td><td>Mathe</td><td>Englisch</td><td>Deutsch</td><td>Sport</td></tr><tr><td>8:55</td><td>Mathe</td><td>Biologie</td><td>Geschichte</td><td>Kunst</td><td>Mathe</td></tr><tr><td>10:05</td><td>Englisch</td><td>Deutsch</td><td>Chemie</td><td>Musik</td><td>Erdkunde</td></tr><tr><td>12:00</td><td>Mittag</td><td>Mittag</td><td>AG-Zeit</td><td>Mittag</td><td>Mittag</td></tr></tbody></table><p>Klassenlehrerin: Frau Vogel · Raum 12 · Bitte pünktlich.</p>",
        plain: "Montag erste Stunde Deutsch. Dienstag Mathe. Mittwoch AG-Zeit um zwölf. Freitag Sport um acht. Klassenlehrerin Frau Vogel.",
        questions: [
          {
            de: "Was hast du am Freitag um 8:00?",
            options: [
              { de: "Sport.", ok: true, feedback: "Freitag, 8:00: Sport. Pack Turnschuhe ein." },
              { de: "Deutsch.", ok: false, feedback: "Deutsch ist Montag und Donnerstag um 8:00." },
              { de: "AG-Zeit.", ok: false, feedback: "AG ist Mittwoch um 12:00." }
            ]
          },
          {
            de: "Wer ist die Klassenlehrerin?",
            needles: ["vogel"],
            hint: "Der Name steht unter dem Plan.",
            okText: "Frau Vogel."
          }
        ]
      },
      {
        type: "dialogue",
        npc: "vogel",
        line: "Guten Morgen. Du bist unser Gastschüler — Gastschülerin. In dieser Klasse siezen wir die Lehrer. Wir duzen uns untereinander. Wie heißt du, und woher kommst du?",
        prompt: "Formell, vollständig.",
        options: [
          { de: "Guten Morgen, Frau Vogel. Ich heiße … und ich komme aus den USA. Freut mich.", ok: true, trust: 1, feedback: "Sie notiert nichts Sichtbares. Das ist bei ihr ein Kompliment." },
          { de: "Hi, ich bin der Neue.", ok: false, trust: -1, feedback: "„Hi“ und kein Name. Frau Vogel wartet. Die Klasse spürt die Sekunde." },
          { de: "Ich verstehe nicht.", ok: "ok", feedback: "Ehrlich. Dann langsam: Ich heiße … Ich komme aus …" }
        ]
      },
      {
        type: "dialogue",
        npc: "aylin",
        line: "Pssst — ich bin Aylin. Auch neu. Also, fast. Die Schule ist okay, die Stadt ist klein. Sitzt du hier? Neben mir ist frei. Und der Flyer da vorne ist Drama.",
        prompt: "Du kannst eine Freundin gebrauchen.",
        options: [
          { de: "Danke, Aylin. Ja, gern. Was ist mit dem Flyer?", ok: true, trust: 1, feedback: "Sie rückt die Tasche. Platz gemacht. Plot angenommen." },
          { de: "Ich sitze lieber allein.", ok: "ok", trust: 0, feedback: "Geht. Sie zuckt. Später könnt ihr trotzdem Verbündete sein." },
          { de: "Drama ist dumm.", ok: false, feedback: "Du weißt noch nicht, was der Festplatz für sie bedeutet." }
        ]
      },
      {
        type: "culture",
        title: "Gymnasium, Noten, du/Sie",
        html: "<p>Das <strong>Gymnasium</strong> führt zum Abitur. Die Klassenlehrerin bleibt oft Jahre. Man siezt Lehrkräfte; Schüler untereinander duzen sich sofort.</p><p>Stunden dauern 45 Minuten. Nach der zweiten Stunde: große Pause, oft mit Brötchen. Wer ohne Hausschuhe in manchen Schulen rumläuft — hier nicht, aber Pünktlichkeit ist heilig.</p>",
        en: "Gymnasium tracks toward Abitur. Students duzen each other; teachers are Sie."
      },
      {
        type: "speak",
        title: "In der Pause",
        prompt: "Karl fragt: Welche Fächer magst du? Was hast du am Montag? Bist du in einer AG?",
        model: "Ich mag Musik und Sport. Am Montag habe ich Deutsch, Mathe und Englisch. Ich bin noch in keiner AG. Vielleicht Umwelt?",
        options: [
          { de: "Ich mag Sport. Am Montag habe ich Deutsch. Ich bin noch in keiner AG.", ok: true, feedback: "Klar, Novice-High, und du öffnest die Tür zur Umwelt-AG." },
          { de: "Schule ist Schule.", ok: false, feedback: "Philosophisch, aber null Information." },
          { de: "What is AG?", ok: "ok", feedback: "Okay als echte Frage — auf Deutsch: AG bedeutet Arbeitsgemeinschaft, ein Club nach dem Unterricht." }
        ]
      },
      {
        type: "ipa",
        title: "Erste Woche — Nachweis",
        interpretive: {
          type: "listen",
          title: "Frau Vogel, nach der Glocke",
          intro: "Sie spricht in die Klasse. Nicht ins Portal.",
          listenId: "e03-vogel",
          speaker: "vogel",
          audio: "Achtung, zehn b. Morgen fällt die zweite Stunde aus. Frau Klein ist krank. Bitte in der Bibliothek arbeiten. Die Umwelt-A-G trifft sich Mittwoch, zwölf Uhr zehn, Raum B drei. Gäste willkommen — auch Gastschülerinnen und Gastschüler. Mit freundlichen Grüßen. Vogel.",
          questions: [
            {
              de: "Was fällt aus?",
              options: [
                { de: "Die zweite Stunde morgen.", ok: true, feedback: "Frau Klein ist krank." },
                { de: "Die Umwelt-AG.", ok: false, feedback: "Die findet statt." },
                { de: "Die Bibliothek.", ok: false, feedback: "Dorthin sollt ihr." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "karl",
          line: "Hey. Ich bin Karl. Spielst du Fußball? Oder bist du eher … Bücher?",
          followUp: { de: "Spielst du mit, oder schaust du nur zu? Warum?", en: "Play along or only watch? Why?" },
          options: [
            { de: "Hallo Karl. Ich mag Sport, aber ich bin neu. Darf ich zuschauen?", ok: true, feedback: "Einladung angenommen, Druck raus." },
            { de: "Fußball ist langweilig.", ok: false, feedback: "Karl ist SV. Du hast eine Tür zugemacht, keine Meinung geöffnet." },
            { de: "Bücher. Und Fußball. Vielleicht.", ok: "ok", feedback: "Ehrliche Unentschiedenheit. Karl kann damit leben." }
          ]
        },
        presentational: {
          type: "write",
          title: "E-Mail an Frau Vogel",
          prompt: "Schreib eine kurze, formelle E-Mail: Betreff, Anrede (Sie), du bist angekommen, ein Fach gefällt dir, eine Frage zum Stundenplan, Gruß.",
          checklist: ["Betreff", "Sehr geehrte Frau Vogel", "Sie-Form", "Mit freundlichen Grüßen"],
          rubric: { minChars: 70, needles: [["geehrte", "frau vogel"], ["sie"], ["grüßen", "grüssen", "gruß", "gruss"], ["fach", "stunde", "plan", "deutsch", "sport"]] }
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e04",
    n: 4,
    title: "Was ziehe ich an?",
    titleLong: "Wetter, Kleidung, der erste Eindruck",
    season: "Oktober · Wind · 9°",
    skills: ["reading", "listening", "speaking"],
    canDo: [
      { de: "Ich kann Kleidung und Wetter beschreiben.", en: "I can describe clothes and weather." },
      { de: "Ich kann sagen, was ich anziehe und warum.", en: "I can say what I am wearing and why." }
    ],
    vocab: ["die Jacke", "die Jeans", "der Schal", "es regnet", "es ist kalt", "anziehen", "die Farbe"],
    grammar: "Adjektive in festen Phrasen; Wetterimpersonalien (es ist, es regnet)",
    places: ["haus", "schule"],
    scenes: [
      {
        type: "narrate",
        title: "Der Himmel über Kleinhausen ändert seine Meinung.",
        paras: [
          "Morgens Sonne auf dem Fachwerk. Um zehn: Wind. Lena steht vor deinem Schrank, als wäre er öffentlich.",
          "„Heute ist Referat in Bio, danach Sport, danach — vielleicht — Demo-Treffen am Festplatz. Du kannst nicht so aussehen wie ein Tourist im Juli.“",
          "Unten ruft Opa Werner: „Die Kehrwoche ist nicht im Schrank, aber die Schuhe sind dreckig!“"
        ],
        en: "Weather, school, and civic life all want different outfits. Welcome to German October."
      },
      {
        type: "match",
        title: "Wetter → Kleidung",
        pairs: [
          { left: "Es schneit.", right: "die Winterjacke, die Handschuhe" },
          { left: "Es ist heiß und sonnig.", right: "das T-Shirt, die Sonnenbrille" },
          { left: "Es regnet.", right: "die Regenjacke, die Schuhe mit Profil" },
          { left: "Es ist windig und 9 Grad.", right: "der Pullover, der Schal, die Jeans" },
          { left: "Sportunterricht.", right: "die Turnschuhe, die Trainingshose" }
        ]
      },
      {
        type: "simulate",
        title: "Packen unter Zeitdruck",
        intro: "Drei Termine, ein Rucksack. Wähle, was du einpackst.",
        introEn: "Three events, one bag.",
        steps: [
          {
            who: "Lena",
            de: "Bio-Referat. Die Klasse sitzt. Es ist 9 Grad, aber die Heizung ist laut.",
            options: [
              { de: "Pullover, Jeans, ordentliche Schuhe.", ok: true, feedback: "Referat ist kein Sport und kein Strand." },
              { de: "Trainingsanzug und Turnschuhe.", ok: false, feedback: "Sport ist später. Frau Vogel sieht den Anzug." },
              { de: "T-Shirt und Sonnenbrille.", ok: false, feedback: "Oktober. Die Sonnenbrille wartet aufs Wochenende." }
            ]
          },
          {
            who: "Karl (Nachricht)",
            de: "Danach Sport. Bringst du Turnschuhe? Der Platz ist nass.",
            options: [
              { de: "Ja. Turnschuhe extra im Beutel, nicht an den Füßen im Referat.", ok: true, feedback: "Schichten, auch im Rucksack." },
              { de: "Ich mache Sport in den schönen Schuhen.", ok: false, feedback: "Die Schuhe und der Platz überleben das nicht." }
            ]
          },
          {
            who: "Opa Werner",
            de: "Die Schuhe an der Tür sind dreckig. Kehrwoche sieht das.",
            options: [
              { de: "Ich putze sie. Dann die Regenjacke, es windet.", ok: true, feedback: "Nachbarschaft beginnt am Schuh." },
              { de: "Ist mir egal.", ok: false, feedback: "Für Werner ist Wohnen eine Aufgabe." }
            ]
          }
        ]
      },
      {
        type: "activity",
        title: "Kleiderschrank Kleinhausen",
        src: "praxis/kleiderschrank.html",
        de: "Lies jede Situation (Wetter, Fest, Schule, Sport). Öffne den Schrank. Zieh an, was passt — und begründe.",
        en: "The wardrobe game is canon: you live here, you dress for Kleinhausen weather and rituals.",
        points: 12
      },
      {
        type: "culture",
        title: "Schichtziehen und Anlässe",
        html: "<p>In Deutschland zieht man oft <strong>Schichten</strong>: T-Shirt, Pullover, Jacke. Indoor ist warm, draußen nass.</p><p>Es gibt ungeschriebene Dresscodes: Vorstellungsgespräch (Sparkasse) ≠ Stadtfest ≠ Sportverein. Tracht ist kein Kostüm für alle — am Fest kann sie Stolz sein, im Bio-Referat ist sie merkwürdig.</p>",
        en: "Layers. Occasion matters. Dirndl/Lederhose are not year-round school wear."
      },
      {
        type: "ipa",
        title: "Anziehen unter Druck",
        interpretive: {
          type: "listen",
          title: "Wetterbericht — Radio Kleinhausen",
          listenId: "e04-hanna",
          speaker: "hanna",
          audio: "Guten Morgen, Kleinhausen. Heute früh neun Grad, später Regen von Westen. Windig. Morgen etwas milder, fünfzehn Grad, Wolken. Am Wochenende Sonne — ideal für den Markt, schlecht für Leute ohne Sonnenhut. Und jetzt die Nachrichten: Die Debatte um den Festplatz geht weiter.",
          questions: [
            {
              de: "Wie ist das Wetter heute?",
              options: [
                { de: "Kalt, windig, später Regen.", ok: true, feedback: "Neun Grad, Wind, Regen von Westen." },
                { de: "Heiß und sonnig den ganzen Tag.", ok: false, feedback: "Sonne ist am Wochenende." },
                { de: "Schnee.", ok: false, feedback: "Oktober, kein Schnee in der Durchsage." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "lena",
          line: "Also? Jacke oder nur Pullover? Wir müssen pünktlich sein. Frau Vogel sieht nasse Haare als Charakter.",
          followUp: { de: "Und die Schuhe — Turnschuhe oder Stiefel? Warum?", en: "Sneakers or boots — why?" },
          options: [
            { de: "Ich ziehe die Regenjacke an. Es regnet später. Und den Schal.", ok: true, feedback: "Praktisch und lokal." },
            { de: "Ich ziehe das T-Shirt an. Mode.", ok: false, feedback: "Neun Grad. Mode hilft nicht gegen Husten in Episode 12." },
            { de: "Was ziehst du an?", ok: "ok", feedback: "Gute Frage — dann aber selbst entscheiden." }
          ]
        },
        presentational: {
          type: "speak",
          title: "Outfit-Check",
          prompt: "Beschreibe, was du heute anziehst und warum (Wetter + Termin).",
          model: "Heute ist es kalt und windig. Ich ziehe Jeans, einen Pullover und eine Jacke an. Nachmittags habe ich Sport, dann ziehe ich Turnschuhe an."
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e05",
    n: 5,
    title: "Einkaufen",
    titleLong: "Sonnenkorn oder MarktPunkt?",
    season: "Oktober · Samstag · 11°",
    skills: ["reading", "speaking", "listening"],
    canDo: [
      { de: "Ich kann Lebensmittel benennen und einkaufen.", en: "I can name foods and shop for them." },
      { de: "Ich kann Preise und Mengen verstehen.", en: "I can understand prices and quantities." }
    ],
    vocab: ["das Brot", "die Milch", "der Käse", "der Apfel", "teuer", "billig", "bitte", "das macht"],
    grammar: "gern + Essen; Pluralansätze; euro-Preise",
    places: ["baeckerei", "supermarkt"],
    scenes: [
      {
        type: "narrate",
        title: "Birgit gibt dir einen Zettel und zwanzig Euro.",
        paras: [
          "„Brötchen von Otto, Milch und Äpfel kannst du entscheiden. Der große MarktPunkt am Ortsrand ist billiger. Otto kennt deinen Namen bald, wenn du ihn lernst.“",
          "Jonas murmelt vom Sofa: „Kapitalismus, Brötchen, whatever.“ Lena: „Sag das Otto ins Gesicht.“",
          "Du gehst. Der Zettel ist dein erster Auftrag als Mitbewohner, nicht als Gast."
        ],
        en: "Errand as belonging. Independent baker versus edge-of-town chain."
      },
      {
        type: "dialogue",
        npc: "otto",
        line: "Guten Morgen. Was darf's sein? Die Roggen sind noch warm. Die süßen Teilchen sind für Leute, die es eilig haben, ihre Großmutter zu beeindrucken.",
        options: [
          { de: "Guten Morgen. Sechs Brötchen, bitte. Vier Roggen, zwei Körner.", ok: true, trust: 1, feedback: "Er legt sie in die Tüte, als wäre das schon Routine." },
          { de: "Alles, was billig ist.", ok: false, feedback: "Otto hebt eine Augenbraue. Billig ist der MarktPunkt. Hier ist warm." },
          { de: "Ich hätte gern ein Brot und … äh … das da.", ok: "ok", feedback: "Zeigen geht am Anfang. Nächstes Mal: das Wort." }
        ]
      },
      {
        type: "activity",
        title: "Supermarkt — Einkaufszettel",
        src: "praxis/supermarkt.html",
        de: "Lauf durch die Gänge, lies Schilder, nimm, was auf dem Zettel steht, zahl an der Kasse. In der Story ist das der MarktPunkt am Ortsrand — praktisch, anonym, billig.",
        en: "Relocate this supermarket in your head: MarktPunkt on the bypass road.",
        points: 10
      },
      {
        type: "culture",
        title: "Pfand, Bäcker, Samstagmorgen",
        html: "<p>Für viele Flaschen zahlst du <strong>Pfand</strong> — 8 oder 25 Cent, zurück zur Station. Der Bäcker am Morgen ist soziales GPS: wer da ist, gehört zum Ort.</p><p>Ketten am Ortsrand sind nicht „böse“. Sie sind nah mit dem Auto, haben Parkplätze, und genau das ist Frau Hallers Argument. Otto hat keine Rampe für ihre Knie.</p>",
        en: "Bottle deposits. Baker as social GPS. The chain’s parking is part of the civic fight."
      },
      {
        type: "read",
        title: "Kassenbon gegen Brottüte",
        html: "<p><strong>Bäckerei Sonnenkorn</strong> · Bäckergasse 2<br>6 Brötchen  4,80 €<br>1 Laib Roggen  3,40 €</p><p><strong>MarktPunkt</strong> · Umgehungsstraße<br>Milch 1,09 € · Äpfel 2,49 € · Butter 2,19 €</p><p>Summe bar: du hast 20,00 € gegeben.</p>",
        questions: [
          {
            de: "Wo sind die Brötchen her?",
            options: [
              { de: "Von Sonnenkorn.", ok: true, feedback: "Bäckergasse." },
              { de: "Vom MarktPunkt.", ok: false, feedback: "Dort: Milch, Äpfel, Butter." }
            ]
          },
          {
            de: "Ungefähr wie viel bleibt von 20 €? (ohne Taschenrechner-Drama: mehr oder weniger als 5 €?)",
            options: [
              { de: "Mehr als 5 €.", ok: true, feedback: "4,80+3,40+1,09+2,49+2,19 ≈ 14 €. Es bleiben etwa 6 €." },
              { de: "Weniger als 1 €.", ok: false, feedback: "Du hast nicht so viel ausgegeben." }
            ]
          }
        ]
      },
      {
        type: "ipa",
        title: "Einkauf — Nachweis",
        interpretive: {
          type: "listen",
          title: "An der Kasse",
          listenId: "e05-kasse",
          speaker: "kasse",
          audio: "So, das macht zwölf Euro dreißig. Haben Sie eine Kundenkarte? Nein? Bar oder Karte? Die Tüte kostet zehn Cent, oder haben Sie eine eigene?",
          questions: [
            {
              de: "Was kostet der Einkauf?",
              options: [
                { de: "12,30 €.", ok: true, feedback: "zwölf Euro dreißig." },
                { de: "10 Cent.", ok: false, feedback: "Das ist die Tüte." },
                { de: "Zwanzig Euro.", ok: false, feedback: "Das war Birgits Schein, nicht der Preis." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "haller",
          line: "Sie auch hier? Der MarktPunkt hat einen Aufzug. Otto hat Treppen. Ich mag Otto. Meine Knie mögen den Aufzug.",
          followUp: { de: "Was kaufst du bei Otto, und was hier?", en: "What from Otto, and what here?" },
          options: [
            { de: "Ja, ich verstehe. Ich war auch bei Otto. Beides ist die Stadt.", ok: true, trust: 1, feedback: "Du hältst zwei Wahrheiten. Das braucht Kleinhausen." },
            { de: "Dann kaufen Sie halt nur hier.", ok: false, feedback: "Klingt nach Abweisen. Sie wollte gesehen werden, nicht belehrt." },
            { de: "Was ist ein Aufzug?", ok: "ok", feedback: "Fair. Aufzug = elevator. Dann zur Sache zurück." }
          ]
        },
        presentational: {
          type: "write",
          title: "Zettel für Birgit",
          prompt: "Schreib, was du gekauft hast, wo, und was es ungefähr gekostet hat. Ein Satz Meinung: Bäcker oder Kette?",
          rubric: { minChars: 60, needles: [["brot", "brötchen", "broetchen", "milch", "apfel", "äpfel"], ["euro", "€", "kost"], ["otto", "sonnenkorn", "markt"]] }
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e06",
    n: 6,
    title: "Der Kurier",
    titleLong: "Schicht A im Postamt",
    season: "Oktober · Wochentag nach der Schule · 12°",
    skills: ["listening", "reading", "speaking"],
    canDo: [
      { de: "Ich kann Wegbeschreibungen folgen.", en: "I can follow directions." },
      { de: "Ich kann nach dem Weg fragen.", en: "I can ask for the way." }
    ],
    vocab: ["links", "rechts", "die Straße", "die Kreuzung", "gegenüber", "die Lieferung", "klingeln"],
    grammar: "Imperativ (gehen Sie / geh); Wechselpräpositionen als lexikalische Chunks",
    places: ["post", "werkstatt", "rathaus"],
    scenes: [
      {
        type: "narrate",
        title: "Ein Aushang: Aushilfe gesucht.",
        paras: [
          "Postamt Kleinhausen. Du brauchst Taschengeld. Sie brauchen Beine. Die Zentrale funkt auf Deutsch — keine Karte mit blinkendem Punkt.",
          "Erste Tour: ein Umschlag ins Rathaus. Auf dem Umschlag ein Logo wie ein Parkhaus. Nordpark.",
          "Du bist nur der Kurier. Du liest nicht. Du liest trotzdem."
        ],
        en: "Part-time courier. Your first envelope is from the parking company to city hall."
      },
      {
        type: "cloze",
        title: "Funkspruch",
        parts: [
          { t: "Geh die Bahnhofstraße " },
          { gap: 0 },
          { t: ", dann " },
          { gap: 1 },
          { t: " in die Marktstraße. Das Rathaus ist " },
          { gap: 2 },
          { t: " der Sparkasse. Klingle an der " },
          { gap: 3 },
          { t: " Tür." }
        ],
        gaps: [["entlang", "geradeaus"], ["links", "rechts"], ["gegenüber", "neben"], ["großen", "roten", "grossen"]]
      },
      {
        type: "activity",
        title: "Lieferdienst Kleinhausen",
        src: "praxis/lieferdienst.html",
        de: "Du bist Kurier/Kurierin. Folge den Wegbeschreibungen in der Ich-Perspektive. Falsche Abzweigung = Umleitung, kein Game Over. Schicht A ist dein Job in dieser Episode.",
        en: "First-person delivery sim. Canon job: the post office.",
        points: 14
      },
      {
        type: "dialogue",
        npc: "aydin",
        line: "Danke. Sie sind der neue Kurier? Legen Sie das bitte auf den Stapel „kontrovers“. Und: Wie finden Sie Kleinhausen — zu klein zum Parken, oder groß genug zum Feiern?",
        options: [
          { de: "Ich bin neu, Frau Aydin. Ich lerne die Stadt noch. Der Marktplatz gefällt mir.", ok: true, trust: 1, feedback: "Sie lächelt knapp. Politikerinnen hören, was du nicht entscheidest." },
          { de: "Parkhaus. Punkt.", ok: false, feedback: "Zu schnell. Du hast Amiras Seite noch nicht gehört." },
          { de: "Ich darf das Paket nicht kommentieren.", ok: "ok", feedback: "Beruflich korrekt. Menschlich eine verpasste Chance." }
        ]
      },
      {
        type: "culture",
        title: "Linksverkehr der Sprache: der Weg",
        html: "<p>Deutsche Wegbeschreibungen lieben <strong>Imperative</strong> und Landmarks: <em>gehen Sie bis zum Brunnen, dann links, gegenüber der Apotheke</em>.</p><p>GPS spricht man trotzdem. Aber wer nur dem Pfeil folgt, lernt die Stadt nicht — und besteht Frau Vogels „Beschreib den Weg“-Test nicht.</p>",
        en: "Directions as landmarks + imperatives. GPS is allowed; literacy is the course goal."
      },
      {
        type: "ipa",
        title: "Schichtende",
        interpretive: {
          type: "read",
          title: "Zettel von der Zentrale",
          html: "<p>Tour 2: Paket für Herr Tadesse, Gärtnerei, Parkweg. Nicht vor 15 Uhr (Mittagspause).</p><p>Tour 3: Brief für Frau Haller, Rosenweg 7, zweite Etage, keine Aufschrift „Werbung“.</p><p>Wenn niemand da ist: Zettel in den Briefkasten, Paket zurück.",
          questions: [
            {
              de: "Wann darfst du nicht bei Herrn Tadesse klingeln?",
              options: [
                { de: "Vor 15 Uhr.", ok: true, feedback: "Mittagspause." },
                { de: "Nach 15 Uhr.", ok: false, feedback: "Dann DARFST du." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "hvogel",
          line: "Werkstatt. Ja? Ah, Post. Steht das auf Vogel oder auf die Schule? Meine Schwester lässt alles hier, wenn das Sekretariat zu ist. Und: Fahrradkette ölen lassen? Schülerpreis.",
          followUp: { de: "Ist das ein Brief oder Werkzeug? Wohin gehst du danach?", en: "Letter or tools? Where next?" },
          options: [
            { de: "Das Paket ist für die Werkstatt, denke ich. Danke. Die Kette … vielleicht nächste Woche?", ok: true, feedback: "Sachlich. Er nimmt beides ernst." },
            { de: "Ihre Schwester ist streng.", ok: false, feedback: "Er ist stolz auf sie. Falsches Smalltalk-Thema." },
            { de: "Wo ist Rosenweg?", ok: "ok", feedback: "Gute Frage für einen Kurier. Er zeigt nach Norden." }
          ]
        },
        presentational: {
          type: "speak",
          title: "Funk an die Zentrale",
          prompt: "Melde dich: Wer du bist, was du geliefert hast, ob ein Problem da war.",
          model: "Hier ist die Aushilfe. Rathaus: zugestellt. Gärtnerei: nach fünfzehn Uhr. Frau Haller: Zettel im Briefkasten, niemand zu Hause."
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e07",
    n: 7,
    title: "Federkiel",
    titleLong: "Bestellen, sitzen, dazugehören",
    season: "November · früh dunkel · 7°",
    skills: ["speaking", "listening", "reading"],
    canDo: [
      { de: "Ich kann im Café bestellen und bezahlen.", en: "I can order and pay in a café." },
      { de: "Ich kann sagen, was ich gern trinke und esse.", en: "I can say what I like to drink and eat." }
    ],
    vocab: ["der Kaffee", "der Tee", "die Limonade", "die Rechnung", "zusammen", "getrennt", "ich hätte gern"],
    grammar: "Konjunktiv II als Höflichkeitschunk (ich hätte gern); gern",
    places: ["cafe"],
    scenes: [
      {
        type: "narrate",
        title: "Fensterplatz, beschlagene Scheiben.",
        paras: [
          "Café Federkiel: Holz, Zeitungen an Stangen, ein Kuchen unter Glas, der nach Zimt riecht. Aylin hat schon ihre Tasche auf einen Stuhl gelegt — Platzhalten, deutsche Hochkunst.",
          "Amira kommt später, mit Flyer. Jonas kommt vielleicht, mit Kopfhörern.",
          "Heute lernst du bestellen. Und du lernst, dass „nur ein Tee“ trotzdem Politik sein kann, wenn der Flyer auf dem Tisch liegt."
        ],
        en: "Café as classroom and civic table."
      },
      {
        type: "match",
        title: "Bestellchunks",
        pairs: [
          { left: "Ich hätte gern einen Kaffee.", right: "Höfliche Bestellung" },
          { left: "Geht noch ein Stück Kuchen?", right: "Nachbestellen" },
          { left: "Die Rechnung, bitte. Getrennt.", right: "Jeder zahlt für sich" },
          { left: "Zusammen, bitte.", right: "Eine Person zahlt" },
          { left: "Zum Mitnehmen.", right: "Nicht hier sitzen" }
        ]
      },
      {
        type: "dialogue",
        npc: "amira",
        line: "Hi. Ich bin Amira. Umwelt-AG. Wir treffen uns hier, weil das Jugendzentrum bald keinen Strom mehr hat, wenn der Festplatz weg ist. Willst du nur Kakao, oder willst du auch zuhören?",
        options: [
          { de: "Beides. Einen Kakao, bitte — und erzähl langsam.", ok: true, trust: 1, feedback: "Sie lacht. Langsam kann sie. Wütend auch." },
          { de: "Nur Kakao. Keine Politik.", ok: "ok", trust: 0, feedback: "Erlaubt. Die Flyer bleiben trotzdem liegen." },
          { de: "Ich bin nur Gast. Das ist nicht mein Problem.", ok: false, trust: -1, feedback: "Aylin sieht dich an. Sie ist auch Gast. Fast." }
        ]
      },
      {
        type: "activity",
        title: "Gesprächspartner — Café",
        src: "praxis/gespraechspartner.html",
        de: "Übe gesprochene Dialoge. Wähle Niveau Anfänger (Novice). Thema Café / Essen passt zu dieser Episode; andere Themen sind Freispiel.",
        en: "Speaking trees. Stay Novice for now; later episodes will send you back.",
        points: 10
      },
      {
        type: "culture",
        title: "Stammtisch, To-go, Trinkgeld",
        html: "<p>Im Café bleibt man. To-go gibt es, klingt aber nach Bahnhof. Trinkgeld: aufrunden oder 5–10 Prozent, nicht amerikanisch-groß.</p><p>„Stammtisch“ heißt: immer derselbe Tisch, dieselben Leute. Federkiel hat keinen offiziellen, aber die Umwelt-AG sitzt immer links vom Fenster. Das ist fast dasselbe.</p>",
        en: "Linger. Round up the bill. Regular tables are social architecture."
      },
      {
        type: "ipa",
        title: "Der Zettel auf dem Tisch",
        interpretive: {
          type: "read",
          title: "Speisekarte (Auszug)",
          html: "<p>Kaffee 2,80 · Milchkaffee 3,20 · Tee 2,50 · Kakao 3,00</p><p>Apfelkuchen 3,40 · Käsebrot 4,10</p><p>WLAN: federkiel-gast · Toilettenschlüssel an der Theke</p>",
          questions: [
            {
              de: "Was kostet ein Tee und ein Apfelkuchen?",
              options: [
                { de: "5,90 €.", ok: true, feedback: "2,50 + 3,40." },
                { de: "2,50 €.", ok: false, feedback: "Nur der Tee." },
                { de: "7,20 €.", ok: false, feedback: "Das wäre Milchkaffee plus Kuchen falsch addiert." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "jonas",
          line: "Stehst du auf Amiras Liste, oder trinkst du nur? Ich spiel Samstag mit den Linden am Jugendzentrum. Wenn das zu ist, spielen wir im Keller. Kellerakustik ist ehrlich, aber kalt.",
          followUp: { de: "Kommst du Samstag wirklich? Band oder nur Tee — was ist wichtiger?", en: "Are you really coming Saturday? Band or just tea?" },
          options: [
            { de: "Ich weiß noch nicht. Ich will eure Band hören. Und ich will verstehen, was der Festplatz ist.", ok: true, trust: 1, feedback: "Jonas zieht ein Ohrhörerkabel raus. Respekt light." },
            { de: "Keller ist cool.", ok: "ok", feedback: "Ästhetik. Politik später." },
            { de: "Musik ohne Fest ist besser.", ok: false, feedback: "Er rollt mit den Augen. Er hat dort seinen ersten Gig gespielt." }
          ]
        },
        presentational: {
          type: "write",
          title: "Bestellung + eine Meinung",
          prompt: "Schreib, was du bestellst (2 Dinge) und 2–3 Sätze: Warum das Café wichtig für Jugendliche ist.",
          rubric: { minChars: 50, needles: [["hätte", "hatte", "bitte", "kaffee", "tee", "kakao", "kuchen"], ["jugend", "fest", "café", "cafe", "treffen", "freunde"]] }
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e08",
    n: 8,
    title: "Schreib zurück!",
    titleLong: "Chat, Register, ein Fehler",
    season: "November · Handylicht im Dunkeln",
    skills: ["reading", "writing"],
    canDo: [
      { de: "Ich kann informelle Nachrichten und formelle Mails unterscheiden.", en: "I can tell informal chats from formal email." },
      { de: "Ich kann auf eine Nachricht angemessen antworten.", en: "I can reply in the right register." }
    ],
    vocab: ["lg", "hdgdl", "bda", "die Mail", "mit freundlichen Grüßen", "die Gruppe"],
    grammar: "Register; Satzzeichen als soziale Signale",
    places: ["haus", "schule"],
    scenes: [
      {
        type: "narrate",
        title: "Du bist in der Gruppenchat. Das ist gefährlicher als Mathe.",
        paras: [
          "Lena nimmt dich auf: <em>10b + Gäste</em>. Memes, Hausaufgaben, ein Foto vom Federkiel-Kuchen.",
          "Dann: ein Link zur Petition. Dann: ein Witz über Frau Vogel. Dann schreibst du — zu schnell — eine Mail an sie, im Ton des Chats.",
          "Betreff: <em>stunde morgen????</em> Text: <em>hey, fällt was aus oderso, lg</em>",
          "Drei Minuten später verstehst du, was du getan hast. Die Stadt hat Regeln für Straßen. Die Sprache auch."
        ],
        en: "Register crash: chat voice into teacher email. Repair is the lesson."
      },
      {
        type: "simulate",
        title: "Drei Empfänger, drei Töne",
        intro: "Dieselbe Information: Die Deutschstunde findet statt. Wähle den passenden Text.",
        introEn: "Same news, three audiences.",
        steps: [
          {
            who: "Lena (Chat)",
            de: "deutsch fällt nicht aus, oder?",
            options: [
              { de: "ne, findet statt. bis morgen, lg", ok: true, feedback: "Kurz, du, kein Sie." },
              { de: "Sehr geehrte Lena, hiermit teile ich mit …", ok: false, feedback: "Sie ist 15 und in deinem Chat." }
            ]
          },
          {
            who: "Die Bande (Gruppe)",
            de: "petition festplatz — kommt ihr????",
            options: [
              { de: "ja, 17 uhr. bda wenn nicht.", ok: true, feedback: "Gruppe darf Slang. Inhalt bleibt klar." },
              { de: "hey fällt deutsch aus oderso lg", ok: false, feedback: "Falsche Info, falscher Thread." }
            ]
          },
          {
            who: "Frau Vogel (E-Mail)",
            de: "Betreff und Ton.",
            options: [
              { de: "Betreff: Deutschstunde morgen. Text: Sehr geehrte Frau Vogel, findet die Stunde statt? Mit freundlichen Grüßen", ok: true, feedback: "Anrede, Frage, Gruß. Kein lg." },
              { de: "hey, fällt was aus oderso lg", ok: false, feedback: "Genau das ist der Fehler dieser Episode." }
            ]
          }
        ]
      },
      {
        type: "activity",
        title: "Chatsprache & Abkürzungen",
        src: "praxis/chat.html",
        de: "Lerne lg, hdgdl, Register. Lena, die Bande, Aylin, Frau Vogel — dieselben Namen wie in der Serie. Pass auf: Was für Lena okay ist, ist für Frau Vogel eine kleine Katastrophe.",
        en: "Slang trainer. Canon names already match.",
        points: 12
      },
      {
        type: "read",
        title: "Zwei Texte, eine Absicht",
        html: "<p><strong>Chat an Lena:</strong> hdl, kommst du? festplatz um 5, bda wenn nicht 😅</p><p><strong>Mail an Frau Vogel (falsch):</strong> hey fällt deutsch aus oderso lg</p><p><strong>Mail (richtig, später):</strong> Sehr geehrte Frau Vogel, ich möchte fragen, ob die Deutschstunde morgen stattfindet. Mit freundlichen Grüßen</p>",
        questions: [
          {
            de: "Welcher Text ist für die Lehrerin okay?",
            options: [
              { de: "Die dritte, mit Anrede und Gruß.", ok: true, feedback: "Sehr geehrte … Mit freundlichen Grüßen." },
              { de: "hey fällt deutsch aus oderso lg", ok: false, feedback: "Das ist der Fehler dieser Episode." },
              { de: "hdl, kommst du?", ok: false, feedback: "Nur für Lena." }
            ]
          }
        ]
      },
      {
        type: "culture",
        title: "Emojis sind nicht unhöflich. Falsche Empfänger schon.",
        html: "<p>Jugendliche schreiben <strong>lg, hdl, bda, wd</strong>. Erwachsene in Ämtern schreiben <strong>MfG</strong>. Beides ist Deutsch.</p><p>Der Fehler ist nicht Slang. Der Fehler ist Slang an die falsche Person. Reparieren: kurze Entschuldigung, dann die Mail noch einmal, richtig.</p>",
        en: "Slang isn’t the villain. Audience is."
      },
      {
        type: "ipa",
        title: "Die Korrektur",
        interpretive: {
          type: "listen",
          title: "Sprachnachricht von Lena",
          listenId: "e08-lena",
          speaker: "lena",
          audio: "Okay. Atme. Frau Vogel ist streng, aber nicht gemein. Schreib: Entschuldigung, die letzte Mail war unpassend. Dann die Frage klar. Keine Emojis. Keine lg. Du schaffst das. Und komm trotzdem um fünf zum Festplatz.",
          questions: [
            {
              de: "Was soll in der neuen Mail nicht stehen?",
              options: [
                { de: "Emojis und „lg“.", ok: true, feedback: "Lena ist in Registerfragen überraschend traditionell." },
                { de: "Eine Entschuldigung.", ok: false, feedback: "Die SOLL hinein." },
                { de: "Die Frage zur Stunde.", ok: false, feedback: "Die Frage ist der Inhalt." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "vogel",
          line: "Ich habe deine erste Mail erhalten. Und die zweite. Danke für die Korrektur. In meiner Klasse darf man Fehler machen. Man muss sie aber ausbessern. Verstanden?",
          followUp: { de: "Eine Frage noch: wann schreibst du formell, und wann lg?", en: "When is a mail formal, and when is lg okay?" },
          options: [
            { de: "Ja, Frau Vogel. Danke. Es tut mir leid. Die Frage war, ob die Stunde stattfindet.", ok: true, trust: 1, feedback: "Sie nickt. Thema beendet. Das ist Gnade." },
            { de: "Es war nur ein Witz.", ok: false, trust: -1, feedback: "Sie mag Witze. Nicht als Ausrede." },
            { de: "Im Chat schreiben alle so.", ok: false, feedback: "Stimmt für den Chat. Dies war kein Chat." }
          ]
        },
        presentational: {
          type: "write",
          title: "Zwei Register, eine Nachricht",
          prompt: "Schreib (1) eine Chat-Antwort an Lena: du kommst um 17 Uhr zum Festplatz. (2) Eine formelle Mail an Frau Vogel mit Entschuldigung und klarer Frage. Trenn die Texte mit einer Linie.",
          rubric: { minChars: 90, needles: [["lg", "hdl", "komm", "5", "17", "fest"], ["geehrte", "frau"], ["grüßen", "grüssen", "gruß"], ["entschuldigung", "leid", "tut"]] }
        }
      }
    ]
  });
})(window);
