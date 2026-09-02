/* First-person locations: you stand in the street, not on a worksheet. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.LOCATIONS = {
    bahnhof: {
      facade: "station",
      you: "Du stehst in der Bahnhofshalle. Es riecht nach Kaffee und nassem Mantel. Die Anzeigetafel tickt.",
      youEn: "You are in the station hall. Coffee, wet coats, the board ticking.",
      looks: [
        { id: "tafel", label: "die Anzeigetafel", de: "KLEINHAUSEN — an. Kassel — Gleis 2, +10. Frankfurt — Verspätung.", en: "Arrivals and delays in yellow on black." },
        { id: "plakat", label: "das Plakat", de: "750 Jahre Kleinhausen. Darunter, kleiner: Nordpark GmbH — Moderne Mobilität.", en: "Jubilee poster with a parking-company sting.", discover: "plakat-nordpark" },
        { id: "kiosk", label: "der Kiosk", de: "Kaugummi, Fahrpläne, ein verblasstes Foto vom alten Festplatz.", en: "Gum, timetables, a faded fairground photo." }
      ],
      npc: "stefan",
      npcLine: "Da bist du. Der Koffer ist schwer, ja? Lena wartet draußen mit Bello. Der Hund hat keine Geduld.",
      npcLineEn: "There you are. Lena’s outside with Bello.",
      episode: "e01",
      side: null
    },
    haus: {
      facade: "fachwerk",
      you: "Rosenweg 4. Fachwerk, ein Besen an der Wand, Bello hinter der Tür. Du wohnst hier — irgendwann fühlt sich der Schlüssel nicht mehr fremd an.",
      youEn: "The Fröhlich house. Timber frame, a broom, a dog.",
      looks: [
        { id: "matte", label: "die Fußmatte", de: "Bitte Schuhe ausziehen. Kein Schlüssel darunter — Birgit hat es extra groß geschrieben.", en: "Shoes off. No key under the mat." },
        { id: "zettel", label: "der Zettel", de: "Kuchen um vier. WLAN fragen. Bello nicht füttern.", en: "Cake at four. Ask for wifi. Don’t feed the dog." },
        { id: "rose", label: "die Rose", de: "Opas Stolz. Ein Schild: Kehrwoche — diese Woche Werner.", en: "Werner’s rose. Stair-cleaning rota." }
      ],
      npc: "lena",
      npcLine: "Komm rein. Das ist kein Hotel. Das ist unser Chaos. Dein Zimmer ist oben, schräg.",
      npcLineEn: "Come in. Not a hotel. Your room is upstairs, under the slope.",
      episode: "e01",
      side: "bello"
    },
    markt: {
      facade: "markt",
      you: "Marktplatz. Brunnen, Stimmen, Fahrräder. Hier entscheidet die Stadt, ohne es zu merken, wer dazugehört.",
      youEn: "The square. Fountain, voices, bikes.",
      looks: [
        { id: "brunnen", label: "der Brunnen", de: "Münzen unten. Lena sagt, Wünsche auf Deutsch gelten besser.", en: "Coins. Wishes in German allegedly work better." },
        { id: "nordpark", label: "der Plan unter dem Arm", de: "Jemand hat eine Rolle Papier: Parkhaus, grau, wo jetzt Buden stehen.", en: "A rolled plan of a garage where stalls stand.", discover: "plan-parkhaus" },
        { id: "bank", label: "die Bank", de: "Eine leere Bank in der Sonne. Später sitzt hier Frau Haller.", en: "An empty bench. Haller later." }
      ],
      npc: "haller",
      npcLine: "Schöner Brunnen. Parken kann man trotzdem nicht. Mit den Knien zählt das.",
      npcLineEn: "Pretty fountain. Still nowhere to park, and my knees keep score.",
      episode: "e02",
      side: "clara"
    },
    rathaus: {
      facade: "rathaus",
      you: "Das Rathaus hat eine Uhr, die recht haben will. Drinnen: Formulare, und eine Bürgermeisterin, die zwei Wahrheiten gleichzeitig hält.",
      youEn: "Town hall. A clock that wants to be right.",
      looks: [
        { id: "uhr", label: "der Uhrturm", de: "Fünf nach. Pünktlichkeit ist hier eine Tugend und eine Waffe.", en: "Five past. Punctuality as virtue and weapon." },
        { id: "fahne", label: "die Fahne", de: "Hessenfarben, etwas ausgewaschen. 750 Jahre steht auf einem Banner schief.", en: "State colours, a crooked 750 banner." },
        { id: "eingang", label: "der Eingang", de: "Ein Schild: Bitte meld en — nein: Bitte melden. Jemand hat das n nachgetragen.", en: "Please check in. A missing letter, added later." }
      ],
      npc: "aydin",
      npcLine: "Wenn Sie den Kurier spielen: Stapel „kontrovers“. Wenn Sie Einwohner spielen: später. Ich höre beides.",
      npcLineEn: "Courier: controversial pile. Resident: later. I hear both.",
      episode: "e06",
      side: null
    },
    kirche: {
      facade: "kirche",
      you: "St. Nikolai. Glocken um zwölf, Grünspan am Denkmal. Du musst nicht glauben. Du musst die Inschrift lesen können.",
      youEn: "St. Nikolai. Bells at noon. The statue’s name is weather.",
      looks: [
        { id: "denkmal", label: "das Denkmal", de: "Bronze, grün, Name fast weg. Eine Frau. Ein Buch in der Hand.", en: "Green bronze. A woman. A book. Name gone.", discover: "clara-hint" },
        { id: "glocke", label: "die Glocken", de: "Um zwölf machen Gespräche Pause, auch Streit.", en: "At noon, even arguments pause." },
        { id: "portal", label: "das Portal", de: "Steinerne Blätter. Ein Zettel: Chorprobe Donnerstag.", en: "Stone leaves. Choir Thursday." }
      ],
      npc: null,
      episode: "e02",
      side: "clara"
    },
    museum: {
      facade: "museum",
      you: "Säulen, zu groß für die Stadt, genau richtig für das Gedächtnis. Drinnen will ein Buch 750 Stimmen.",
      youEn: "The museum wants 750 voices.",
      looks: [
        { id: "vitrine", label: "Vitrine 4", de: "Clara Weide, 1841–1909. Rede gegen das Zuschütten des Flusses.", en: "Clara Weide. She argued against covering the river.", discover: "clara-vitrine" },
        { id: "modell", label: "das Schlossmodell", de: "Winzig, genau, ohne Parkhaus.", en: "Tiny castle. No garage." },
        { id: "kasse", label: "die Kasse", de: "Eintritt frei für Schüler/innen. Bitte Tasche schließen.", en: "Free for students. Close your bag." }
      ],
      npc: null,
      episode: "e15",
      side: "clara"
    },
    schule: {
      facade: "schule",
      you: "Gelbe Klinker, Fahnenmast, Bodenwachs. Du gehst hierher, bis der Körper den Weg ohne Kopf kennt.",
      youEn: "Yellow brick Gymnasium. Floor wax.",
      looks: [
        { id: "pinnwand", label: "die Pinnwand", de: "Chor. Umwelt-AG. Nordpark-Flyer. Darunter Stift: Nicht ohne uns.", en: "Choir, eco-club, parking flyer, handwritten refusal." },
        { id: "glocke", label: "die Schulglocke", de: "Sie klingt wie eine Meinung.", en: "The bell sounds like an opinion." },
        { id: "raum12", label: "Raum 12", de: "Frau Vogel. Tür schließt mit der letzten Schwingung der Glocke.", en: "Frau Vogel. Door with the last swing of the bell." }
      ],
      npc: "aylin",
      npcLine: "Auch neu, fast. Setz dich, wenn du willst. Der Flyer ist Drama, aber echtes Drama.",
      npcLineEn: "Also new, almost. Sit if you want. The flyer is real drama.",
      episode: "e03",
      side: null
    },
    cafe: {
      facade: "cafe",
      you: "Café Federkiel. Holz, Zeitung an der Stange, Zimt. Links vom Fenster ist inoffiziell Umwelt-AG.",
      youEn: "Wood, newspapers on rods, cinnamon. Eco-club by the window.",
      looks: [
        { id: "karte", label: "die Speisekarte", de: "Kaffee 2,80. Kakao 3,00. Kuchen, der nach Großmutter schmeckt, ohne eine zu sein.", en: "Coffee 2.80. Cocoa 3. Cake that tastes like someone’s grandmother." },
        { id: "stange", label: "die Zeitungsstange", de: "Lokalteil: Debatte um Festplatz geht weiter. Keine Überraschung.", en: "Local paper: square debate continues." },
        { id: "fenster", label: "der Fensterplatz", de: "Beschlagen. Draußen der Markt, innen die Verschwörung der Jugendlichen mit Punschplänen.", en: "Fogged glass. Market outside, plots inside." }
      ],
      npc: "amira",
      npcLine: "Kakao oder Zuhören? Beides ist erlaubt. Nur Wegschauen wird teuer.",
      npcLineEn: "Cocoa or listening? Both allowed. Looking away costs.",
      episode: "e07",
      side: "lindenlied"
    },
    baeckerei: {
      facade: "baeckerei",
      you: "Goldene Brezel. Wärme. Herr Otto kennt Bestellungen, bevor die Stadt dich kennt.",
      youEn: "Golden pretzel. Heat. Otto is faster than the town.",
      looks: [
        { id: "brezel", label: "die Brezel über der Tür", de: "Gold, etwas schief. Wahrzeichen, nicht Marketing.", en: "Gold, slightly crooked. Landmark, not marketing.", discover: "brezel" },
        { id: "theke", label: "die Theke", de: "Roggen, Körner, etwas Süßes für Leute mit Oma-Terminen.", en: "Rye, seeds, something sweet for grandmother appointments." },
        { id: "nummer", label: "die Nummer", de: "Kein Automat. Du sagst, was du willst. Das ist die Übung.", en: "No ticket machine. You speak. That’s the exercise." }
      ],
      npc: "otto",
      npcLine: "Na? Neu? Roggen ist noch warm. Die Kette am Ortsrand ist billiger. Ich bin pünktlicher als ihre Brötchen.",
      npcLineEn: "New? Rye is warm. The chain is cheaper. I’m more punctual than their rolls.",
      episode: "e05",
      side: "radio"
    },
    kaufhaus: {
      facade: "kaufhaus",
      you: "Kaufhaus Fröhlich. Gelb wie die Post, Stolz wie Stefan. Hier kauft die Stadt Geschenke und Ausreden.",
      youEn: "The family department store. Yellow as the post.",
      looks: [
        { id: "logo", label: "das Logo", de: "Ein F, das wie ein Paket aussieht, wenn man müde ist.", en: "An F that looks like a parcel when you’re tired." },
        { id: "rabatt", label: "der Zettel FAMILIE10", de: "Nur Sonntag, nur wenn Stefan nicht hinsieht — er sieht immer hin und tut es trotzdem.", en: "Family code. Stefan always sees and still allows it." },
        { id: "rolltreppe", label: "die Rolltreppe", de: "Eine. Nach oben. Nach unten sind Treppen. Frau Haller kennt das.", en: "One escalator, up. Down is stairs. Haller knows." }
      ],
      npc: "stefan",
      npcLine: "Wenn du suchst: zweite Etage Haushaltswaren. Wenn du gehörst: sag Hallo zu den Stammkunden. Namen später.",
      npcLineEn: "Looking: second floor housewares. Belonging: say hello. Names later.",
      episode: "e09",
      side: "rezept"
    },
    post: {
      facade: "post",
      you: "Postamt. Horn, Wartenummer, Funk. Deine Beine sind das GPS der Stadt.",
      youEn: "Post office. Horn, queue ticket, radio.",
      looks: [
        { id: "horn", label: "das Posthorn", de: "Gelb auf blau. Wer es sieht, denkt an Briefe, nicht an Apps.", en: "Yellow on blue. Letters, not apps." },
        { id: "funk", label: "das Funkgerät", de: "Zentrale spricht Imperative. Du antwortest in ganzen Sätzen, wenn du Mut hast.", en: "Dispatch speaks imperatives." },
        { id: "paket", label: "der Umschlag Nordpark", de: "Logo wie ein Parkhaus. Rathaus, Stapel kontrovers. Du bist nur der Kurier. Du liest trotzdem.", en: "You are only the courier. You read anyway." }
      ],
      npc: "hvogel",
      npcLine: "Wenn das Sekretariat zu ist, liegt die Schulpost bei mir. Kette ölen: Schülerpreis. Nicht heute, wenn du hetzt.",
      npcLineEn: "School mail lands here after hours. Student price on chains. Not today if you’re rushing.",
      episode: "e06",
      side: "strassen"
    },
    park: {
      facade: "park",
      you: "Stadtpark am Hahnfluss. Enten, eine Bank, Müll, der Argumente wiegt, wenn Amira eine Waage mitbringt.",
      youEn: "Park by the river. Ducks, a bench, trash that becomes data.",
      looks: [
        { id: "ente", label: "die Ente", de: "Sie interessiert sich nicht für Nordpark. Das ist eine politische Position.", en: "The duck has no opinion. That’s a position." },
        { id: "tonne", label: "die Tonne", de: "Gelb, blau, braun, grau. Wer falsch wirft, wohnt nur im Foto.", en: "Yellow, blue, brown, grey. Sorting is residency." },
        { id: "fluss", label: "der Hahnfluss", de: "Klein, ehrlich, zu wenig für ein Schiff, genug für ein Gedächtnis.", en: "Small, honest, enough for memory.", discover: "hahnfluss" }
      ],
      npc: "tadesse",
      npcLine: "Setzlinge für den Rand, nicht für die Mitte. Frau Haller braucht einen Weg. Bäume brauchen Gießen.",
      npcLineEn: "Seedlings at the edge, not the middle. Haller needs a path. Trees need water.",
      episode: "e11",
      side: "bello"
    },
    fest: {
      facade: "fest",
      you: "Festplatz. Jetzt: Grasnarbe, orange Vermessungsstangen, der Geist von Punsch. Später: Beweis, dass ein Platz keine Lücke ist.",
      youEn: "Fairground. Grass, survey stakes, the ghost of punch.",
      looks: [
        { id: "stange", label: "die Vermessungsstange", de: "Orange. Sie tun so, als wäre der Platz schon tot. Er atmet noch.", en: "Orange stakes. They pretend the square is already dead." },
        { id: "buehne", label: "die Bühne", de: "Zu tief für Jonas’ Ego, genau richtig für Oma in der ersten Reihe.", en: "Too low for Jonas’s ego, right for Ursula in row one." },
        { id: "jugend", label: "das Jugendzentrum", de: "Ein Bau mit zu wenig Farbe und zu viel Bedeutung.", en: "Too little paint, too much meaning." }
      ],
      npc: "jonas",
      npcLine: "Wenn das zu ist, Keller. Keller ist ehrlich. Kalt auch. Ich mag den Platz trotzdem. Sag das nicht zu laut, ich habe einen Ruf.",
      npcLineEn: "If this closes: basement. Honest, cold. I still like the square. Don’t quote me.",
      episode: "e14",
      side: "lindenlied"
    },
    apotheke: {
      facade: "apotheke",
      you: "Löwen-Apotheke. Grünes A, Schlange, leise Stimmen. Hier siezt man, auch wenn der Hals brennt.",
      youEn: "Lion pharmacy. Green A. You use Sie even with a sore throat.",
      looks: [
        { id: "loewe", label: "der Löwe", de: "Schild. Nicht süß. Zuständig.", en: "The lion is not cute. It is in charge.", discover: "loewe" },
        { id: "regal", label: "das Regal", de: "Packungen mit Warnungen, die länger sind als Novice-High-Sätze. Frau Sowinski übersetzt.", en: "Warnings longer than Novice High. Sowinski translates." },
        { id: "nummern", label: "die Nummer", de: "Ziehen. Warten. Nicht vordrängeln. Kultur als Schlange.", en: "Take a number. Culture as a queue." }
      ],
      npc: "sowinski",
      npcLine: "Guten Tag. Wer ist krank — Sie oder jemand zu Hause? Allergien? Wie lange schon? Langsam ist hier schnell genug.",
      npcLineEn: "Who is ill — you or someone at home? Allergies? How long? Slow is fast enough.",
      episode: "e12",
      side: null
    },
    sparkasse: {
      facade: "sparkasse",
      you: "Sparkasse. Glas, ruhige Stimmen, Birgit irgendwo hinter einem Bildschirm, der Zahlen wie Wetter behandelt.",
      youEn: "Savings bank. Glass, quiet, Birgit somewhere behind a screen.",
      looks: [
        { id: "automat", label: "der Automat", de: "Karte, PIN, bitte. Die Maschine siezt dich nicht. Die Menschen schon.", en: "Card, PIN. The machine doesn’t use Sie. People do." },
        { id: "termin", label: "der Terminzettel", de: "Ohne Termin lange warten. Mit Termin pünktlich sein.", en: "No appointment: wait. With one: be on time." }
      ],
      npc: "birgit",
      npcLine: "Pssst — ich bin gleich Feierabend. Zu Hause gibt’s Tee. Hier nur Formulare. Du siehst müde aus. Das ist erlaubt.",
      npcLineEn: "I’m off soon. Tea at home. Forms here. Tired is allowed.",
      episode: "e03",
      side: null
    },
    sport: {
      facade: "sport",
      you: "Sportplatz SV Kleinhausen. Kälte, Liniment, ein zu großes Trikot. Nach dem Spiel sitzt man nicht im Prospekt, sondern am Rand des Festplatzes.",
      youEn: "Club pitch. Cold, liniment, a loaned shirt.",
      looks: [
        { id: "tor", label: "das Tor", de: "Ein Netz mit Loch. Karl kennt das Loch persönlich.", en: "A net with a hole Karl knows personally." },
        { id: "trikot", label: "die Wäscheleine", de: "Alte Trikots, Nummern verblasst. Verein ist Infrastruktur.", en: "Faded numbers. Clubs are infrastructure." },
        { id: "theke", label: "die Vereinstheke", de: "Tee, Cola, Eis im Kühlschrank — nicht für Cola, sagt der Aushang.", en: "Tea, cola, ice not for cola." }
      ],
      npc: "karl",
      npcLine: "Gastspieler, kein Vertrag. Laufen. Danach aufräumen. Dosen sind peinlich.",
      npcLineEn: "Guest player, no contract. Run. Then tidy. Cans are embarrassing.",
      episode: "e10",
      side: null
    },
    werkstatt: {
      facade: "werkstatt",
      you: "Werkstatt Vogel. Öl, Klingel, weniger Worte als in Raum 12, mehr Hände.",
      youEn: "Vogel’s workshop. Oil, a bell, fewer words.",
      looks: [
        { id: "kette", label: "die Fahrradkette", de: "Schülerpreis. Nicht billig, fair.", en: "Student price. Not cheap. Fair." },
        { id: "radio", label: "das Radio", de: "Radio Kleinhausen, leise, damit niemand merkt, dass Herr Vogel die Nachrichten kennt.", en: "Radio low, so no one notices he follows the news." }
      ],
      npc: "hvogel",
      npcLine: "Schwester streng, ja. Stolz. Paket auf die Werkbank, nicht in den Dreck.",
      npcLineEn: "Sister’s strict. Proud. Parcel on the bench, not in the dirt.",
      episode: "e06",
      side: "tram"
    },
    supermarkt: {
      facade: "kette",
      you: "MarktPunkt an der Umgehung. Aufzug, Parkplätze, Anonymität. Frau Hallers Knie sind hier Bürger.",
      youEn: "The chain on the bypass. Elevator, parking, anonymity.",
      looks: [
        { id: "aufzug", label: "der Aufzug", de: "Er funktioniert. Das ist das Argument, nicht die Seele der Stadt.", en: "It works. That’s the argument, not the town’s soul." },
        { id: "schild", label: "das Preisschild", de: "Milch 1,09. Otto hat keine Milch. Otto hat Namen.", en: "Milk 1.09. Otto has names, not milk." }
      ],
      npc: "haller",
      npcLine: "Ich mag Otto. Meine Knie mögen den Aufzug. Du darfst beides denken. Die Stadt muss das auch.",
      npcLineEn: "I like Otto. My knees like the elevator. You’re allowed both thoughts.",
      episode: "e05",
      side: null
    },
    jugend: {
      facade: "jugend",
      you: "Jugendzentrum. Zu wenig Farbe, zu viele Kabel, Probezeiten an der Tür. Zwei Jahre Miete können eine Band am Leben halten.",
      youEn: "Youth centre. Too little paint, too many cables.",
      looks: [
        { id: "probe", label: "der Probenplan", de: "Die Linden: Samstag. Wenn Strom da ist.", en: "Die Linden: Saturday. If there’s power." },
        { id: "sofa", label: "das Sofa", de: "Es hat Meinungen aufgenommen. Manche davon stimmen.", en: "The sofa has absorbed opinions. Some are true." }
      ],
      npc: "amira",
      npcLine: "Wir zählen, wer den Platz nutzt. Zahlen wirken auf Erwachsene. Willst du mitzählen oder nur Sofa?",
      npcLineEn: "We count who uses the square. Numbers work on adults.",
      episode: "e15",
      side: "lindenlied"
    },
    schloss: {
      facade: "schloss",
      you: "Das Schloss der Grafen — Museumskulisse und Fotohintergrund. Niemand wohnt mehr da. Alle tun so, als wäre das normal.",
      youEn: "The counts’ castle. Nobody lives there. Everyone pretends that’s normal.",
      looks: [
        { id: "turm", label: "der Schlossturm", de: "Nicht der Aussichtsturm. Verwechslung kostet 200 Stufen Umweg.", en: "Not the lookout tower. Mix-up costs 200 steps." },
        { id: "graben", label: "der Graben", de: "Kein Wasser mehr. Gras. Argumente über Pflege.", en: "No water. Grass. Arguments about upkeep." }
      ],
      npc: null,
      episode: "e02",
      side: "turm"
    },
    turm: {
      facade: "turm",
      you: "200 Stufen. Pause erlaubt. Spucke nicht. Oben liegt Kleinhausen wie ein Satz, den du endlich lesen kannst.",
      youEn: "200 steps. Rest allowed. Don’t spit. The town becomes a readable sentence.",
      looks: [
        { id: "schild", label: "das Schild", de: "200 Stufen. Pause erlaubt. Spucke nicht.", en: "200 steps. Rest allowed. Don’t spit." },
        { id: "ausblick", label: "der Ausblick", de: "Rathaus, Gleise, Festplatz, Rosenweg. Dein Jahr in einem Blick.", en: "Hall, tracks, fairground, Rosenweg. Your year in one look.", discover: "ausblick" }
      ],
      npc: null,
      episode: "e02",
      side: "turm"
    },
    gaertnerei: {
      facade: "garten",
      you: "Gärtnerei Tadesse. Erde unter den Nägeln der Stadt. Wer Blumen für den Markt zieht, zieht auch Argumente.",
      youEn: "Tadesse’s nursery. The town’s dirt under its nails.",
      looks: [
        { id: "setzling", label: "die Setzlinge", de: "Kostenlos, Bedingung: gießen. Zweimal die Woche, außer Regen.", en: "Free if you water. Twice a week except rain." },
        { id: "schild2", label: "das handgeschriebene Schild", de: "Eine Stadt ohne Bäume ist ein Parkplatz mit Laternen.", en: "A city without trees is a parking lot with lamps.", discover: "tadesse-satz" }
      ],
      npc: "tadesse",
      npcLine: "Nimm zwei. Rand, nicht Mitte. Und danke, dass du kommst, bevor der Beton kommt.",
      npcLineEn: "Take two. Edge, not middle. Thanks for coming before the concrete.",
      episode: "e11",
      side: null
    }
  };

  KH.weatherKey = function () {
    const s = (function () {
      const done = Object.values(KH.state.episodes).filter(function (e) { return e.status === "done"; }).length;
      const m = KH.MODULES[Math.min(done, 15)];
      return (m && m.season) || "";
    })();
    if (/Regen|nass|Wind/i.test(s)) return "rain";
    if (/Sonne|klar|Jubiläum/i.test(s)) return "sun";
    if (/Schnee|−|Fieber|0°|2°|5°/i.test(s) && /Jan|Dez|Nov|Feb/.test(s)) return "cold";
    return "overcast";
  };
})(window);
