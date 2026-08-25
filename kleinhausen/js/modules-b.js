/* Episodes 9–16 */
(function (global) {
  const KH = global.KH = global.KH || {};
  KH.MODULES = KH.MODULES || [];

  KH.MODULES.push({
    id: "e09",
    n: 9,
    title: "Familie",
    titleLong: "Oma hat Geburtstag — das Haus hat Regeln",
    season: "November · Sonntag · 6°",
    skills: ["reading", "writing", "speaking"],
    canDo: [
      { de: "Ich kann Familienmitglieder und Beziehungen beschreiben.", en: "I can describe family members and relationships." },
      { de: "Ich kann ein Geschenk auswählen und begründen.", en: "I can choose a gift and say why." }
    ],
    vocab: ["die Mutter", "der Vater", "die Oma", "der Opa", "das Geschenk", "der Geburtstag", "die Kehrwoche"],
    grammar: "Possessivartikel (mein/meine) in Chunks; Datumsangaben",
    places: ["haus", "kaufhaus"],
    scenes: [
      {
        type: "narrate",
        title: "Sonntag riecht nach Kaffee und nach Verantwortung.",
        paras: [
          "Oma Ursula wird 75 — ein Jahr für jedes Jahrzehnt der Stadt plus Kleingeld, sagt Opa, und niemand versteht den Witz außer ihm.",
          "Stefan: „Kaufhaus-Rabatt FAMILIE10. Budget: nicht verrückt werden.“ Jonas soll Gitarrenseiten nicht mit Omas Krimi verwechseln.",
          "Beim Essen kippt das Gespräch: Festplatz. Birgit will Kompromiss. Werner will Ordnung auf dem Platz, nicht Beton. Ursula will, dass die Stadt nicht langweilig stirbt. Du sitzt in einer Familie, die nicht einer Meinung ist. Das ist Deutschland auch."
        ],
        en: "Birthday logistics, then the civic argument at Sunday lunch. Families disagree without becoming villains."
      },
      {
        type: "match",
        title: "Wer ist wer?",
        pairs: [
          { left: "Birgit", right: "Gastmutter, Sparkasse" },
          { left: "Stefan", right: "Gastvater, Kaufhaus" },
          { left: "Lena", right: "Gastschwester, Kamera" },
          { left: "Jonas", right: "Gastbruder, Band" },
          { left: "Ursula", right: "Oma, Krimis" },
          { left: "Werner", right: "Opa, Rosen" }
        ]
      },
      {
        type: "activity",
        title: "Kaufhaus Fröhlich — Geschenke",
        src: "praxis/kaufhaus.html",
        de: "Der Online-Shop ist das Kaufhaus der Familie, nicht Leipzig: Marktstraße, Kleinhausen. Lies die Wunschzettel, halte das Budget, nutze den Code, wenn du ihn findest.",
        en: "Gift simulation. Canon: the family store.",
        points: 12
      },
      {
        type: "culture",
        title: "Kehrwoche, Kaffee, kein Smalltalk über Geld",
        html: "<p><strong>Kehrwoche</strong> (besonders im Süden): wer dran ist, kehrt den Hausflur. Werner hält das für Moral.</p><p>Zum Geburtstag: Kaffee und Kuchen am Nachmittag sind oft wichtiger als eine riesige Party. Nach dem Preis eines Geschenks fragt man nicht. Nach dem Inhalt schon: <em>Warum das?</em></p>",
        en: "Stair-cleaning rotas as civic practice at house scale. Coffee and cake. Don’t ask what it cost."
      },
      {
        type: "dialogue",
        npc: "werner",
        line: "Du kehrst mit. Nicht weil du Schuld bist. Weil du hier wohnst. Danach trinken wir Saft. Und dann sagst du mir: Ist ein Festplatz Dreck — oder ein Versprechen?",
        options: [
          { de: "Ich kehre mit. Ich denke, ein Platz kann beides sein. Man kann ihn sauber halten und feiern.", ok: true, trust: 1, feedback: "Er gibt dir den Besen, als wäre das ein Ritterschlag." },
          { de: "Das ist nicht meine Aufgabe.", ok: false, trust: -1, feedback: "Für Werner ist Wohnen eine Aufgabe. Punkt." },
          { de: "Was heißt kehren?", ok: "ok", feedback: "Fegen. Dann die große Frage noch einmal." }
        ]
      },
      {
        type: "ipa",
        title: "Familientisch",
        interpretive: {
          type: "read",
          title: "Einladungskarte",
          style: "note",
          html: "<p>Ursula 75</p><p>Sonntag, 16 Uhr · Kaffee &amp; Kuchen · Rosenweg</p><p>Bitte keine Kerzen-Feuerwerk-Ideen (Rauchmelder).</p><p>Wünsche: Krimi, kein Staubsauger, Bello nicht färben.</p>",
          questions: [
            {
              de: "Wann ist die Feier?",
              options: [
                { de: "Sonntag um 16 Uhr.", ok: true, feedback: "Kaffeezeit, nicht Abendessen." },
                { de: "Samstagabend.", ok: false, feedback: "Sonntag." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "ursula",
          line: "Ach, du. Setz dich. Wie findest du uns? Zu laut? Und liesst du Krimis, oder nur Schulbuch?",
          followUp: { de: "Welches Buch willst du zuerst — und warum?", en: "Which book first, and why?" },
          options: [
            { de: "Ich finde euch gut. Ein bisschen laut, aber gut. Krimis: vielleicht. Welches Buch magst du?", ok: true, trust: 1, feedback: "Mord im Schwarzwald wandert über den Tisch." },
            { de: "Zu laut.", ok: false, feedback: "Nur das. Sie ist 75 und hört den Rest." },
            { de: "Schulbuch.", ok: "ok", feedback: "Ehrlich. Sie schenkt dir trotzdem den Krimi „für später“." }
          ]
        },
        presentational: {
          type: "write",
          title: "Familie Fröhlich in sechs Sätzen",
          prompt: "Beschreib die Familie: Wer wohnt wo, ein Charakterzug pro Person (mindestens drei Personen), ein Sonntagsdetail.",
          rubric: { minChars: 80, needles: [["birgit", "stefan", "lena", "jonas", "oma", "ursula", "werner", "bello"], ["mein", "meine", "familie"], ["sonntag", "kuchen", "kaufhaus", "kehren"]] }
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e10",
    n: 10,
    title: "SV Kleinhausen",
    titleLong: "Körper, Verein, Wochenende",
    season: "November · Sportplatz · 5°, klar",
    skills: ["speaking", "listening", "reading"],
    canDo: [
      { de: "Ich kann über Sport und den Körper sprechen.", en: "I can talk about sports and the body." },
      { de: "Ich kann sagen, was weh tut und was ich mag.", en: "I can say what hurts and what I like." }
    ],
    vocab: ["spielen", "trainieren", "das Bein", "der Arm", "müde", "das Team", "das Wochenende"],
    grammar: "Modalverb wollen/möchten in Chunks; Körperteile mit Artikel",
    places: ["sport"],
    scenes: [
      {
        type: "narrate",
        title: "Vereinsheim, Tee, der Geruch von kalter Luft und Liniment.",
        paras: [
          "Karl leiht dir ein zu großes Trikot. „Gastspieler“, sagt der Trainer, „kein Vertrag, kein Druck, laufen.“",
          "Nach dem Spiel sitzen alle nicht im Parkhaus-Prospekt, sondern auf dem Festplatz-Rand: Cola, Beine, Dunkelheit. Vermesser-Stangen stehen schon da, orange, wie ein falsches Tor.",
          "Jonas kommt mit Gitarre, nicht mit Ball. „Falls ihr verliert, gibt’s Akustik.“ Ihr verliert. Es gibt Akustik."
        ],
        en: "Sports club as belonging technology. The festival square is already being marked."
      },
      {
        type: "match",
        title: "Körper und Sport",
        pairs: [
          { left: "der Kopf", right: "Helm / Kopfball / Achtung!" },
          { left: "das Bein", right: "laufen, treten, Krampf" },
          { left: "der Arm", right: "werfen, halten" },
          { left: "müde", right: "Ich brauche Pause." },
          { left: "das Team", right: "Wir spielen zusammen." }
        ]
      },
      {
        type: "dialogue",
        npc: "karl",
        line: "Gut gelaufen. Also, mittel. Willst du nächste Woche wieder? Und ehrlich: tut was weh?",
        options: [
          { de: "Das Bein ist müde, aber okay. Ja, ich will wieder kommen. Danke fürs Trikot.", ok: true, trust: 1, feedback: "Karl klopft dir auf die Schulter, zu fest, freundlich." },
          { de: "Ich bin der Beste.", ok: false, feedback: "Ihr habt verloren. Die Gruppe lacht, nicht mit dir." },
          { de: "Alles tut weh. Ich sterbe.", ok: "ok", feedback: "Drama. Auf Deutsch reicht: Ich bin müde. Mein Bein tut weh." }
        ]
      },
      {
        type: "culture",
        title: "Verein ist Infrastruktur",
        html: "<p>Der <strong>eingetragene Verein</strong> (e. V.) ist, wie viele Deutsche Freundschaft organisieren: Satzung, Beitrag, Training dienstags.</p><p>Ohne Sportplatz, Turnhalle, Festplatz gibt es weniger Verein. Deshalb ist „nur ein Parkplatz“ für Karl keine neutrale Fläche. Es ist, wo nach dem Spiel das Leben weitergeht.</p>",
        en: "Clubs are how social life is scheduled. Fields and squares are not empty."
      },
      {
        type: "listen",
        title: "Trainer an der Linie",
        intro: "Hör zu. Was soll das Team tun?",
        audio: "Okay, Leute, zuhört! Wir spielen auf rechts. Karl, pass das Ball — den Ball — auf Lena… gast, äh, auf unseren Gast. Nicht so aggressiv. Nach zwanzig Minuten Wechsel. Wasser trinken! Und nach dem Spiel den Platz aufräumen, bitte, die Dosen sind peinlich.",
        questions: [
          {
            de: "Was soll nach dem Spiel passieren?",
            options: [
              { de: "Aufräumen, Dosen weg.", ok: true, feedback: "Der Trainer schämt sich für Müll — Episode 11 winkt." },
              { de: "Nur Wasser trinken und gehen.", ok: false, feedback: "Wasser ja, aber aufräumen auch." }
            ]
          }
        ]
      },
      {
        type: "ipa",
        title: "Nach dem Spiel",
        interpretive: {
          type: "read",
          title: "Aushang im Vereinsheim",
          html: "<p>Training: Di + Do 17:00</p><p>Beitrag Jugend: 8 € / Monat</p><p>Gäste: drei Male frei, dann anmelden</p><p>Erste-Hilfe-Kasten: neben der Theke. Eis: im Kühlschrank, nicht für Cola.",
          questions: [
            {
              de: "Wie oft darfst du kostenlos kommen?",
              options: [
                { de: "Dreimal.", ok: true, feedback: "Dann anmelden." },
                { de: "Immer, du bist Gastschüler.", ok: false, feedback: "Der Aushang sagt drei Male." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "amira",
          line: "Schöne Stangen, was? Die Vermessung. Sie tun so, als wäre der Platz schon tot. Kommst du Mittwoch zur AG? Wir zählen, wer den Platz wirklich nutzt.",
          followUp: { de: "Mittwoch: um wie viel Uhr, und wen bringst du mit?", en: "Wednesday: what time, and who comes with you?" },
          options: [
            { de: "Ja. Ich habe gesehen, dass wir hier sitzen. Ich komme.", ok: true, trust: 1, feedback: "Sie macht ein Häkchen. Du bist nicht mehr nur Kakao." },
            { de: "Sport und Politik mischen sich nicht.", ok: false, feedback: "Ihr sitzt im Gemisch. Es ist zu spät für diese Theorie." },
            { de: "Was heißt vermessen?", ok: "ok", feedback: "Land vermessen: messen, planen, oft vor dem Bauen." }
          ]
        },
        presentational: {
          type: "speak",
          title: "Körperwetterbericht",
          prompt: "Sag: welchen Sport du magst (oder nicht), was dein Körper heute sagt, ob du zum Verein gehst.",
          model: "Ich mag Fußball ein bisschen. Heute sind meine Beine müde. Mein Arm ist okay. Ich will am Dienstag zum Training."
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e11",
    n: 11,
    title: "Am Fluss",
    titleLong: "Pfand, Müll, ein Schild, das bleibt",
    season: "Dezember · nass · 4°",
    skills: ["reading", "writing", "speaking"],
    canDo: [
      { de: "Ich kann über Umwelt im Alltag sprechen (Müll, Pfand, Park).", en: "I can talk about everyday environment: trash, deposits, the park." },
      { de: "Ich kann ein einfaches Schild oder einen Aufruf schreiben.", en: "I can write a simple sign or appeal." }
    ],
    vocab: ["der Müll", "die Tonne", "das Pfand", "sauber", "schmutzig", "der Fluss", "die Umwelt"],
    grammar: "man + Verb; sollen als Regel-Chunk",
    places: ["park", "gaertnerei"],
    scenes: [
      {
        type: "narrate",
        title: "Der Hahnfluss ist klein und ehrlich.",
        paras: [
          "Zwischen Park und Festplatz: Plastik, eine Dose, ein Plakat von Nordpark, nass und eingerissen. Aylin hat Handschuhe. Amira hat eine Waage. „Wir wiegen den Müll. Zahlen wirken auf Erwachsene.“",
          "Herr Tadesse bringt Säcke aus der Gärtnerei. „Ich putze Blumen. Ihr putzt Argumente.“",
          "Frau Haller kommt mit dem Rollator den Weg herunter und bleibt stehen. Nicht um zu helfen. Um zu sehen, ob ihr Platz zum Durchkommen bleibt."
        ],
        en: "Cleanup as civic data. Haller needs a path. Both can be true."
      },
      {
        type: "match",
        title: "Wohin damit?",
        pairs: [
          { left: "die Flasche mit Pfand", right: "Pfandautomat / zurück zum Markt" },
          { left: "Papier", right: "blaue Tonne / Altpapier" },
          { left: "Bio / Apfelrest", right: "braune Tonne" },
          { left: "Verpackung (Joghurtbecher)", right: "gelbe Tonne / gelber Sack" },
          { left: "Restmüll", right: "schwarze / graue Tonne" }
        ]
      },
      {
        type: "simulate",
        title: "In der Hand, in die Tonne",
        intro: "Du hältst vier Dinge. Wohin damit — in Kleinhausen, nicht in einem Idealsatz.",
        steps: [
          {
            de: "Eine Wasserflasche mit Pfandlogo.",
            options: [
              { de: "Zurück zum Automat / Markt. Pfand.", ok: true, feedback: "8 oder 25 Cent, je nach Flasche." },
              { de: "Gelbe Tonne.", ok: false, feedback: "Pfand ist ein Kreislauf, kein Gelber Sack zuerst." }
            ]
          },
          {
            de: "Ein nasses Nordpark-Plakat (Papier).",
            options: [
              { de: "Altpapier / blaue Tonne — wenn trocken genug. Sonst Rest.", ok: true, feedback: "Nasses Papier nervt die Tonne, aber die Idee ist Papier." },
              { de: "In den Fluss. Symbolisch.", ok: false, feedback: "Amira hat eine Waage, keine Performance." }
            ]
          },
          {
            de: "Apfelrest von Ottos Tüte.",
            options: [
              { de: "Braune Tonne / Bio.", ok: true, feedback: "Bio ist Alltag, nicht Moralpredigt." },
              { de: "Gelbe Tonne, steckt in Plastik.", ok: false, feedback: "Der Rest ist Bio. Die Tüte separat." }
            ]
          }
        ]
      },
      {
        type: "dialogue",
        npc: "tadesse",
        line: "Danke, dass ihr kommt. Eine Stadt ohne Bäume ist ein Parkplatz mit Laternen. Wollt ihr Setzlinge für den Festplatz-Rand? Kostenlos. Bedingung: gießen.",
        options: [
          { de: "Ja, bitte. Wir gießen. Wie oft?", ok: true, trust: 1, feedback: "Zweimal die Woche, sagt er, außer wenn es regnet. Es regnet oft." },
          { de: "Bäume helfen nicht gegen Autos.", ok: false, feedback: "Er sieht dich an, als hättest du gesagt, Brot hilft nicht gegen Hunger." },
          { de: "Ich habe keinen grünen Daumen.", ok: "ok", feedback: "Idiom verstanden. Er: Dann hast du eine Gießkanne. Das reicht am Anfang." }
        ]
      },
      {
        type: "culture",
        title: "Pfand ist ein System, kein Slogan",
        html: "<p>Viele Flaschen und Dosen haben <strong>Pfand</strong>. Du zahlst extra, du bekommst extra zurück. Das ist nicht Hippie — das ist Automat am Eingang vom Supermarkt.</p><p>Mülltrennung nervt Lernende. Sie ist trotzdem Alltagskompetenz wie Siezen: wer sie kann, wohnt hier; wer sie verweigert, wohnt nur im Foto.</p>",
        en: "Bottle deposits and sorting are daily competence, not extra credit."
      },
      {
        type: "ipa",
        title: "Das Schild",
        interpretive: {
          type: "read",
          title: "Entwurf — noch zu förmlich",
          html: "<p>Sehr geehrte Bürgerinnen und Bürger, hiermit möchten wir Sie inständig bitten, etwaige Abfälle nicht unsachgemäß zu entsorgen im Hinblick auf das bevorstehende Jubiläum.</p><p>Amira: „Kein Mensch liest das. Schreib, als wärst du du.“</p>",
          questions: [
            {
              de: "Was ist das Problem des Textes?",
              options: [
                { de: "Er ist zu schwer und unpersönlich.", ok: true, feedback: "Novice High darf klar sein. Klar ist höflich zu mehr Menschen." },
                { de: "Er hat keine Grammatik.", ok: false, feedback: "Er hat zu viel Amtsgrammatik." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "haller",
          line: "Lasst einen Weg! Ich muss durch. Ihr seid lieb, aber der Platz ist auch für alte Knie. Wenn ihr pflanzt, nicht in der Mitte, ja?",
          followUp: { de: "Wer hält den Weg frei, wenn wir pflanzen — du oder wir alle?", en: "Who keeps the path free — you, or all of us?" },
          options: [
            { de: "Ja, Frau Haller. Der Weg bleibt frei. Die Pflanzen an den Rand.", ok: true, trust: 1, feedback: "Sie nickt. Fast ein Lächeln. Das ist viel." },
            { de: "Der Platz ist für uns.", ok: false, trust: -1, feedback: "„Uns“ ohne sie ist der Fehler, den Nordpark auch macht, nur mit Geld." },
            { de: "Sorry.", ok: "ok", feedback: "Dann auf Deutsch die Lösung: Weg frei, Rand pflanzen." }
          ]
        },
        presentational: {
          type: "write",
          title: "Schild in einfachem Deutsch",
          prompt: "Maximal 6 kurze Sätze oder Imperative. Inhalt: Müll mitnehmen, Pfand zurück, Weg für Kinderwagen/Rollator frei, Bäume gießen, Jubiläum.",
          checklist: ["kurze Sätze", "ihr oder Sie bewusst wählen", "eine konkrete Handlung"],
          rubric: { minChars: 40, needles: [["müll", "muell", "pfand", "flasche", "weg"], ["bitte", "nicht", "frei"], ["fest", "jubiläum", "jubilaeum", "platz", "baum", "bäume"]] }
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e12",
    n: 12,
    title: "Gesundheit",
    titleLong: "Lena bleibt liegen — du gehst zur Löwen-Apotheke",
    season: "Dezember · Fieberwetter · 2°",
    skills: ["speaking", "listening", "reading"],
    canDo: [
      { de: "Ich kann sagen, was weh tut, und um Hilfe bitten.", en: "I can say what hurts and ask for help." },
      { de: "Ich kann eine Packungsbeilage / ein Schild in der Apotheke verstehen.", en: "I can understand a simple pharmacy label or sign." }
    ],
    vocab: ["der Kopf", "der Hals", "Fieber", "die Apotheke", "das Rezept", "ich bin krank", "Gute Besserung"],
    grammar: "haben + Körper (Kopfschmerzen); möchten; formell in der Apotheke",
    places: ["apotheke", "haus"],
    scenes: [
      {
        type: "narrate",
        title: "Bello wartet vor der Zimmertür. Das ist Diagnose genug.",
        paras: [
          "Lena: heiser, stolz, fotografiert nicht. Birgit ist in der Sparkasse. Stefan im Kaufhaus. Jonas Probe. Du bist da.",
          "Zettel: <em>Fieberthermometer im Bad. Tee. Anrufen wenn schlimmer. Apotheke: Löwen, Lindenallee. Rezept unnötig für Tee und Nasenspray — FRAU SOWINSKI FRAGEN.</em>",
          "Draußen glatte Steine. Innen die Verantwortung, die sich anfühlt wie Erwachsenwerden auf Zeit."
        ],
        en: "You are the functioning household. Pharmacy is a formal, high-stakes Novice task."
      },
      {
        type: "match",
        title: "Was fehlt?",
        pairs: [
          { left: "Kopfschmerzen", right: "der Kopf tut weh" },
          { left: "Halsschmerzen", right: "der Hals tut weh" },
          { left: "Fieber", right: "die Temperatur ist hoch" },
          { left: "müde", right: "ich brauche Schlaf" },
          { left: "Gute Besserung", right: "was man Kranken sagt" }
        ]
      },
      {
        type: "dialogue",
        npc: "sowinski",
        line: "Guten Tag. Wie kann ich helfen? Wer ist krank — Sie oder jemand zu Hause? Allergien? Wie lange schon?",
        options: [
          { de: "Guten Tag. Meine Gastschwester Lena. Hals und Fieber seit gestern. Keine Allergie, glaube ich. Was können wir tun — ohne Rezept?", ok: true, trust: 1, feedback: "Sie erklärt Tee, Spray, wann ein Arzt nötig ist. Du darfst nachschreiben." },
          { de: "Geben Sie Medizin. Schnell.", ok: false, feedback: "Befehlston. Und welche Medizin? Sie ist keine Verkaufsautomat." },
          { de: "I need drugs for my sister.", ok: false, feedback: "Englisch + „drugs“ klingt falsch. Auf Deutsch: Medizin / etwas gegen Fieber." }
        ]
      },
      {
        type: "culture",
        title: "Apotheke ist nicht Drogerie",
        html: "<p>Die <strong>Apotheke</strong> (oft mit großem A oder Löwen/Adler) berät. Drogerie (dm, Rossmann) verkauft Shampoo und Vitamin C.</p><p>Sonntags: Notdienst-Apotheke, wechselnd, Schild an der Tür. Man siezt. Man stellt sich an. Man erzählt Symptome, nicht Lebensgeschichte — außer die Lebensgeschichte ist das Symptom.</p>",
        en: "Pharmacy ≠ drugstore. Formal, advisory, rota for Sundays."
      },
      {
        type: "read",
        title: "Packung (vereinfacht)",
        html: "<p><strong>Nasenspray</strong></p><p>Nur für Erwachsene und Jugendliche ab 12. 2-mal täglich. Nicht länger als 5 Tage. Bei Fieber über 39 °C oder Atemnot: Ärztin / Arzt.</p><p>Außerhalb der Reichweite von Kindern … und von Bello.</p>",
        questions: [
          {
            de: "Wann zum Arzt?",
            options: [
              { de: "Bei sehr hohem Fieber oder Atemnot.", ok: true, feedback: "Über 39 oder Atemnot." },
              { de: "Immer sofort, Spray ist gefährlich.", ok: false, feedback: "Spray ist erlaubt — mit Grenzen." },
              { de: "Nach fünf Minuten.", ok: false, feedback: "Fünf Tage, nicht fünf Minuten." }
            ]
          }
        ]
      },
      {
        type: "ipa",
        title: "Gute Besserung",
        interpretive: {
          type: "listen",
          title: "Birgit am Telefon",
          audio: "Ich bin gleich da. Danke, dass du gegangen bist. Ist Lena wach? Hat sie getrunken? Wenn das Fieber steigt, rufst du mich an, nicht Jonas, der hört Musik. Und kauf bitte Zitronen, wenn die Apotheke welche hat. Ich bringe Brötchen.",
          questions: [
            {
              de: "Wen sollst du anrufen, wenn es schlimmer wird?",
              options: [
                { de: "Birgit.", ok: true, feedback: "Nicht Jonas." },
                { de: "Jonas.", ok: false, feedback: "Musik." },
                { de: "Frau Vogel.", ok: false, feedback: "Nicht in diesem Anruf." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "lena",
          line: "Du siehst aus wie ein Arzt im Film. Schrecklich. Danke. Erzähl was vom Festplatz, ich langweile mich. Aber leise.",
          followUp: { de: "Was soll ich trinken, und kommt Birgit bald?", en: "What should I drink, and is Birgit coming soon?" },
          options: [
            { de: "Gute Besserung. Wir haben Müll gewogen. Frau Haller will einen Weg. Amira will Bäume. Du fotografierst später.", ok: true, trust: 1, feedback: "Sie schließt die Augen. Das ist Zufriedenheit, nicht Schlaf nur." },
            { de: "Du hast die Demo verpasst, schade.", ok: false, feedback: "Sie ist krank, nicht faul." },
            { de: "Schlaf.", ok: "ok", feedback: "Fürsorglich knapp. Ein Satz Geschichte wäre ein Geschenk." }
          ]
        },
        presentational: {
          type: "write",
          title: "Zettel an die Familie",
          prompt: "Was Lena hat, was du gekauft hast, wann Birgit kommt, was Bello nicht tun soll (Spray nicht essen).",
          rubric: { minChars: 50, needles: [["lena", "fieber", "hals"], ["apotheke", "spray", "tee"], ["bello", "nicht"]] }
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e13",
    n: 13,
    title: "Unterwegs",
    titleLong: "Gleis 2, Verspätung, Plan B",
    season: "Januar · Klassenfahrt-Tag · −1°",
    skills: ["reading", "listening", "speaking"],
    canDo: [
      { de: "Ich kann Fahrpläne und Tickets verstehen.", en: "I can understand schedules and tickets." },
      { de: "Ich kann bei einem Problem am Bahnhof um Hilfe bitten.", en: "I can ask for help when travel goes wrong." }
    ],
    vocab: ["die Fahrkarte", "das Gleis", "die Verspätung", "umsteigen", "der Anschluss", "hin und zurück"],
    grammar: "Uhrzeiten; trennbare Verben als Chunks (umsteigen, abfahren)",
    places: ["bahnhof"],
    scenes: [
      {
        type: "narrate",
        title: "Ziel: Museum in der Großstadt. Realität: Anzeigetafel.",
        paras: [
          "Frau Vogel hat Listen. Karl hat zu viele Snacks. Aylin hat Kopfhörer und einen Plan B, weil Frankfurt sie gelehrt hat, dass Züge Meinungen haben.",
          "Auf Gleis 1: Werbung, so groß wie ein Haus: <strong>NORDPARK — Endlich ankommen. Endlich parken.</strong> Daneben die echte Tafel: <em>Verspätung 25 Min. Anschluss in … gefährdet.</em>",
          "Du wolltest nur fahren. Die Stadt will, dass du auch hier liest."
        ],
        en: "Travel literacy + the antagonist’s billboard in the station you first arrived in."
      },
      {
        type: "read",
        title: "Fahrkarte (Auszug)",
        style: "signage",
        html: "<p>KLEINHAUSEN Hbf → FRANKFURT (M) Hbf</p><p>hin und zurück · Person 1 · Klasse 2</p><p>ab 8:12 Gleis 2 · an 9:48</p><p>ICE nicht enthalten. RB / RE gültig. Anschluss Frankfurt: U-Bahn extra.</p>",
        questions: [
          {
            de: "Wann fährt der Zug (planmäßig)?",
            options: [
              { de: "Um 8:12 von Gleis 2.", ok: true, feedback: "Steht auf der Karte." },
              { de: "Um 9:48 von Gleis 2.", ok: false, feedback: "9:48 ist Ankunft." },
              { de: "ICE um 8:12.", ok: false, feedback: "ICE nicht enthalten." }
            ]
          }
        ]
      },
      {
        type: "listen",
        title: "Heute die Durchsage, die niemand will",
        audio: "Liebe Fahrgäste, der Regionalzug nach Frankfurt hat fünfundzwanzig Minuten Verspätung. Grund: Eis auf der Oberleitung. Bitte bleiben Sie auf Gleis zwei. Der Anschluss um neun Uhr zweiundfünfzig ist gefährdet. Ersatz: Bussteig B, Abfahrt acht Uhr vierzig, nur bei Bedarf. Wir bitten um Entschuldigung.",
        questions: [
          {
            de: "Was sollt ihr tun?",
            options: [
              { de: "Auf Gleis 2 bleiben (Zug kommt später).", ok: true, feedback: "25 Minuten, Gleis zwei bleibt." },
              { de: "Sofort alle zu Bussteig B rennen, immer.", ok: false, feedback: "Nur bei Bedarf — Frau Vogel entscheidet." },
              { de: "Nach Hause gehen.", ok: false, feedback: "Klassenfahrt, nicht aufgeben." }
            ]
          }
        ]
      },
      {
        type: "dialogue",
        npc: "vogel",
        line: "Plan B: Wir warten. Wenn der Anschluss fällt, Museum nachmittags, Vormittag: Aufgaben am Bahnhof. Du — frag am Schalter, ob die Tickets bei Bus gelten. Siezen. Vollständiger Satz.",
        options: [
          { de: "Ich gehe zum Schalter. Ich frage: Guten Tag, gelten unsere Tickets auch im Bus nach Frankfurt?", ok: true, feedback: "Sie gibt dir die Kartenmappe. Vertrauen ist eine Fahrkarte." },
          { de: "Das kann Aylin machen, die kennt Frankfurt.", ok: false, feedback: "Aylin ist nicht dein Übersetzer auf Dauer." },
          { de: "Tickets? Whatever.", ok: false, feedback: "Register + Inhalt falsch. Es ist Januar. Es ist kalt. Es ist deine Aufgabe." }
        ]
      },
      {
        type: "culture",
        title: "DB, Streik, Eis, Höflichkeit",
        html: "<p>Deutsche Bahn: pünktlich im Mythos, verspätet im Winter. <strong>Anschluss gefährdet</strong> heißt: lauf nicht blind, lies die Tafel neu.</p><p>Schalter und Ansagen: Sie. „Bei Bedarf“ heißt: nicht immer. Streiks und Wetter sind Alltagsthemen — und in Klasse 10b politischer Gesprächsstoff, aber heute geht es ums Ankommen.</p>",
        en: "Read the board twice. Formal at the counter. ‘On demand’ is not ‘always’."
      },
      {
        type: "ipa",
        title: "Plan B bestehen",
        interpretive: {
          type: "read",
          title: "Tafel, 8:31",
          html: "<p>RB 2410 Frankfurt: +25 · Gleis 2</p><p>Bus Frankfurt: 8:40 · Steig B · nur bei Ausfall</p><p>RE Kassel: pünktlich · Gleis 4 · nicht unser Zug</p>",
          questions: [
            {
              de: "Ist euer Zug ausgefallen?",
              options: [
                { de: "Nein, nur verspätet.", ok: true, feedback: "+25, nicht „fällt aus“." },
                { de: "Ja, deshalb Bus.", ok: false, feedback: "Bus nur bei Ausfall." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "aylin",
          line: "In Frankfurt wäre ich schon im Museum. Hier lerne ich Warten. Willst du Karten oder Wortschatz? Ich quizze dich: Was heißt ‚der Anschluss‘?",
          followUp: { de: "Was machen wir jetzt — warten, Karten oder Wortschatz?", en: "What now — wait, cards, or vocab?" },
          options: [
            { de: "Der nächste Zug oder Bus, den man braucht.", ok: true, trust: 1, feedback: "Sie wirft dir einen Gummibär. Pädagogik." },
            { de: "Ein Stecker fürs Handy.", ok: "ok", feedback: "Auch Anschluss. Hier: Verkehr." },
            { de: "Keine Ahnung, ich will nur ankommen.", ok: false, feedback: "Ankommen IST das Wort lernen." }
          ]
        },
        presentational: {
          type: "write",
          title: "Kurze Nachricht an Birgit",
          prompt: "Zug hat Verspätung. Ihr wartet / fahrt später. Wann (ungefähr). Alles okay. Kein Drama-Deutsch, klares Deutsch.",
          rubric: { minChars: 40, needles: [["zug", "verspät", "verspaet", "bahn"], ["warten", "später", "spaeter", "gleis", "frankfurt"], ["okay", "gut", "alles"]] }
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e14",
    n: 14,
    title: "Lichter",
    titleLong: "Laternen, Markt, der Platz beweist sich",
    season: "Februar · Laternen und Wintermarkt · 0°",
    skills: ["listening", "speaking", "reading", "writing"],
    canDo: [
      { de: "Ich kann über Feste und Traditionen in einfachen Sätzen sprechen.", en: "I can talk about festivals in simple sentences." },
      { de: "Ich kann ein Event-Schild verstehen und jemanden einladen.", en: "I can read an event sign and invite someone." }
    ],
    vocab: ["das Fest", "die Laterne", "der Markt", "die Musik", "einladen", "die Tradition"],
    grammar: "Datums- und Uhrzeitchunks; möchtest du …?",
    places: ["fest", "markt"],
    scenes: [
      {
        type: "narrate",
        title: "Wenn der Platz voll ist, klingt „Parkhaus“ wie ein schlechter Witz. Bis Montag.",
        paras: [
          "Kleinhausen mischt: Reste von Sankt Martin (Laternen, Kinder), ein kleiner Wintermarkt, Jonas’ Band auf einer zu tiefen Bühne, Herr Tadesse mit Glühwein ohne Wein für Jugendliche — Punsch, heiß, ehrlich.",
          "Frau Haller sitzt, weil Amira eine Bank in den Weg gestellt hat. Kompromiss als Möbel.",
          "Du trägst Kisten. Du gehörst zu den Leuten, die Kisten tragen. Das ist eine Sprache ohne Artikel."
        ],
        en: "Festival as evidence. Belonging as carrying boxes. A bench as compromise."
      },
      {
        type: "read",
        title: "Programmzettel",
        html: "<p><strong>Kleinhausen leuchtet</strong> · Festplatz &amp; Markt</p><p>16:00 Laternenumzug Kinder (Kirchplatz → Festplatz)</p><p>17:30 Die Linden (Jugendbühne)</p><p>18:00 Punsch &amp; Brezeln · Sonnenkorn</p><p>Bitte: Müll mitnehmen · Weg für Rollatoren frei · Kein Feuerwerk</p>",
        questions: [
          {
            de: "Wo endet der Umzug?",
            options: [
              { de: "Am Festplatz.", ok: true, feedback: "Kirchplatz → Festplatz." },
              { de: "Am Bahnhof.", ok: false, feedback: "Nicht auf dem Zettel." },
              { de: "Im Parkhaus.", ok: false, feedback: "Das existiert (noch) nicht. Absicht." }
            ]
          }
        ]
      },
      {
        type: "dialogue",
        npc: "aydin",
        line: "Ich zähle Köpfe. Das ist nicht poesie, das ist Haushalt. Sagen Sie mir in einem Satz, warum dieser Abend den Platz verdient — ohne zu schreien.",
        options: [
          { de: "Weil Kinder, Band, Punsch und Frau Haller hier zusammen sind. Ein Parkhaus trennt das.", ok: true, trust: 1, feedback: "Sie schreibt nichts. Sie merkt sich das. Schlimmer / besser." },
          { de: "Weil Tradition immer gewinnt.", ok: false, feedback: "Sie hat gegen Traditionen gewonnen, die weh taten. Zu einfach." },
          { de: "Ich weiß nicht, ich trage nur Kisten.", ok: "ok", feedback: "Kisten sind ehrlich. Dann: ein Satz extra, sie hat gefragt." }
        ]
      },
      {
        type: "culture",
        title: "Jahreskreis, ohne Klischee-Oktoberfest-Zwang",
        html: "<p>Nicht jedes Dorf ist München. Kleinhausen hat <strong>Markt, Verein, Kirche als Uhr, Schule als Kalender</strong>. Sankt Martin: Teilen, Laternen, nicht Kostümwettbewerb.</p><p>Glühwein ist Erwachsenentee mit Regeln. Jugend: Punsch. Wer das respektiert, darf länger bleiben.</p>",
        en: "Local calendar ≠ postcard Oktoberfest. Martin’s lanterns, clubs, market."
      },
      {
        type: "speak",
        title: "Einladen",
        prompt: "Lade Karl ODER Oma Ursula zum Abend ein. Uhrzeit, Ort, warum.",
        model: "Möchtest du um siebzehn Uhr dreißig auf den Festplatz kommen? Jonas spielt. Es gibt Punsch. Der Weg ist frei.",
        options: [
          { de: "Möchtest du um 17:30 auf den Festplatz kommen? Es gibt Musik und Punsch.", ok: true, feedback: "Einladung = Zeit + Ort + Lockmittel." },
          { de: "Komm!", ok: false, feedback: "Wohin, wann, warum?" },
          { de: "You should come to the party.", ok: false, feedback: "Deutschkurs. Deutsch." }
        ]
      },
      {
        type: "ipa",
        title: "Nach den Lichtern",
        interpretive: {
          type: "listen",
          title: "Die Linden, zwischen zwei Songs",
          audio: "Hey. Wir sind Die Linden. Danke, dass ihr hier steht und nicht im Wohnzimmer. Dieser Platz ist kalt und wichtig. Nächster Song ist leise, weil Oma in der ersten Reihe sitzt. Danach räumt ihr mit uns auf. Das ist der Refrain des Abends.",
          questions: [
            {
              de: "Was passiert nach dem leisen Song?",
              options: [
                { de: "Aufräumen zusammen.", ok: true, feedback: "Refrain des Abends." },
                { de: "Feuerwerk.", ok: false, feedback: "Verboten auf dem Zettel." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "ursula",
          line: "Ich habe Krimi und Punsch. Die Band ist laut genug. Sag: Feiern wir 750 Jahre — oder verabschieden wir den Platz?",
          followUp: { de: "Ein Satz mehr: warum ist der Platz wichtig für dich?", en: "One more sentence: why does the square matter to you?" },
          options: [
            { de: "Heute feiern wir. Morgen reden wir. Der Platz ist noch da.", ok: true, trust: 1, feedback: "Sie stößt mit Punsch an. Zucker, Zimt, Ernst." },
            { de: "Der Platz ist schon weg.", ok: false, feedback: "Vermessung ist nicht Abriss. Sprache vorsichtig." },
            { de: "Sie entscheiden das.", ok: "ok", feedback: "Frau Aydin entscheidet mit Stadtrat. Du sammelst Stimmen. Das ist auch eine Entscheidung." }
          ]
        },
        presentational: {
          type: "write",
          title: "Drei Fotos beschreiben (ohne Foto)",
          prompt: "Als wärst du Lena: 1 Laterne, 1 Bank mit Frau Haller, 1 Bühne. Je 2 Sätze. Präsens.",
          rubric: { minChars: 70, needles: [["laterne", "licht", "kind"], ["bank", "haller", "weg"], ["bühne", "buehne", "band", "linden", "jonas"]] }
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e15",
    n: 15,
    title: "Stimmen",
    titleLong: "Interviews, ein Gerücht, die Anthologie",
    season: "März · grau, aber länger hell",
    skills: ["listening", "speaking", "reading", "writing"],
    canDo: [
      { de: "Ich kann einfache Interviews führen und wiedergeben.", en: "I can do a simple interview and report it." },
      { de: "Ich kann in einem Konflikt deeskalieren.", en: "I can de-escalate a conflict in simple language." }
    ],
    vocab: ["die Stimme", "die Meinung", "finden, dass", "das Gerücht", "entschuldigen", "das Interview"],
    grammar: "weil / denn als Anfang; Meinungschunks (ich finde, ich glaube)",
    places: ["museum", "jugend", "schule"],
    scenes: [
      {
        type: "narrate",
        title: "Das Museum will ein Buch: 750 Stimmen. Ihr habt zwölf, dann zwanzig, dann eine zu viel.",
        paras: [
          "Ihr nehmt auf: Otto (Brötchen und Platz), Haller (Knie und Aufzug), Tadesse (Bäume), Karl (nach dem Spiel), Aydin (Haushalt).",
          "Im Gruppenchat taucht ein Screenshot auf, falsch zitiert: Aylin hätte gesagt, Frau Haller sei „gegen Jugend“. Hat sie nicht. Der Chat brennt trotzdem.",
          "Register-Lektion, zweite Stufe: nicht nur Sie/du. Sondern Wahrheit gegen Tempo."
        ],
        en: "Oral history + rumor. School-appropriate conflict: misquoted classmate, repair in public."
      },
      {
        type: "read",
        title: "Das Gerücht (Chat-Export, gekürzt)",
        html: "<p>Anon: aylin hasst haller lol sie blockt den platz</p><p>Karl: was</p><p>Lena: STOP. Das hat sie nicht gesagt. Interview-Transkript: „Ich will einen Weg für sie UND den Platz.“</p><p>Du: ?</p>",
        questions: [
          {
            de: "Was hat Aylin laut Lena wirklich gesagt?",
            options: [
              { de: "Weg für Frau Haller und den Platz.", ok: true, feedback: "Beides. Das Gerücht hat das UND gelöscht." },
              { de: "Sie hasst Frau Haller.", ok: false, feedback: "Das ist das Gerücht." }
            ]
          }
        ]
      },
      {
        type: "simulate",
        title: "Interview am Brunnen — zwei Minuten",
        intro: "Du hältst ein Handy. Die Person vor dir hat wenig Zeit. Frag so, dass eine Stimme für das Buch bleibt.",
        steps: [
          {
            who: "Otto",
            de: "Ich backe. Frag schnell.",
            options: [
              { de: "Herr Otto, ist der Festplatz wichtig für die Bäckerei? Warum?", ok: true, feedback: "Name, Thema, warum. Novice High reicht." },
              { de: "Autos oder Feste, choose.", ok: false, feedback: "Englisch und eine Falle. Er backt um drei Uhr." }
            ]
          },
          {
            who: "Frau Haller",
            de: "Wenn das ins Buch kommt, dann richtig.",
            options: [
              { de: "Was brauchen Sie auf dem Platz — außer Parken?", ok: true, feedback: "Sie sagt: einen Weg. Das UND überlebt." },
              { de: "Warum hassen Sie Jugendliche?", ok: false, feedback: "Das ist das Gerücht. Du wiederholst es." }
            ]
          },
          {
            who: "Du, nachher im Chat",
            de: "Jemand kürzt das Zitat.",
            options: [
              { de: "Ich schreibe das Transkript dazu. Weg UND Platz.", ok: true, feedback: "Tempo verliert. Genauigkeit bleibt." },
              { de: "lol egal", ok: false, feedback: "Für Aylin ist die Klasse das Internet." }
            ]
          }
        ]
      },
      {
        type: "dialogue",
        npc: "aylin",
        line: "Ich will nicht, dass du Held spielst. Ich will, dass jemand schreibt: Ich war dabei, das Zitat ist falsch. Kurz. Öffentlich. Ohne Drama-Herz-Emojis.",
        options: [
          { de: "Ich schreibe in die Gruppe: Das Zitat ist falsch. Aylin will Weg UND Platz. Hier ist das Transkript.", ok: true, trust: 1, feedback: "Sie atmet aus. Freundschaft ist ein Korrekturlesen." },
          { de: "Ignorieren. Internet.", ok: false, trust: -1, feedback: "Für sie ist die Klasse das Internet. Es hat zwanzig Personen." },
          { de: "Ich schreibe Frau Vogel eine Mail über alle.", ok: false, feedback: "Eskalation nach oben, bevor die Gruppe es selbst richtet. Zu früh." }
        ]
      },
      {
        type: "culture",
        title: "Meinung sagen, ohne zu vernichten",
        html: "<p>Novice High reicht für: <em>Ich finde, dass der Platz wichtig ist, weil …</em> Es reicht nicht für Gerichtsverfahren. Gut so.</p><p>Deutsche Debatte in der Kleinstadt: oft direkt, oft mit Kuchen danach. Wer nur direkt ohne Kuchen ist, bleibt fremd. Wer nur Kuchen ohne Meinung ist, bleibt Deko.</p>",
        en: "Directness plus continuing to share a table. Both are cultural."
      },
      {
        type: "ipa",
        title: "Für das Buch",
        interpretive: {
          type: "listen",
          title: "Herr Otto, Aufnahme 3",
          audio: "Ich backe seit dreißig Jahren. Der Festplatz? Da standen Buden, da haben Leute geweint und getanzt. Ein Parkhaus kauft niemand Brötchen um sechs Uhr früh. Aber Frau Haller hat recht mit den Treppen. Baut einen Aufzug zu mir, nicht nur Beton für Autos.",
          questions: [
            {
              de: "Was will Otto?",
              options: [
                { de: "Den Platz behalten und Barrierefreiheit beim Bäcker.", ok: true, feedback: "Aufzug zu ihm, nicht nur Parkhaus." },
                { de: "Nur mehr Autos.", ok: false, feedback: "Autos kaufen um sechs kein Brot, sagt er." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "haller",
          line: "Man hat gesagt, ich hasse Jugend. Ich hasse Treppen. Unterschied. Willst du das so ins Buch schreiben? Wortlich?",
          followUp: { de: "Schreibst du auch, was die Jugend will — oder nur mich?", en: "Will you also write what the youth want — or only me?" },
          options: [
            { de: "Ja. Sie hassen Treppen, nicht Jugend. Ich schreibe das so. Danke, dass Sie reden.", ok: true, trust: 1, feedback: "Sie klopft auf den Rollator. Interview beendet, Beziehung nicht." },
            { de: "Alle hassen irgendwas.", ok: false, feedback: "Zu cool für 67 und für 15." },
            { de: "Ich zensiere das.", ok: false, feedback: "Sie will genau diese Klarheit." }
          ]
        },
        presentational: {
          type: "write",
          title: "Eine Stimme, fair",
          prompt: "Schreib 8–10 Sätze für die Anthologie: zwei Meinungen (z. B. Haller und Amira/Otto), ein UND, dein Satz „Ich finde, dass… weil…“, kein Beleidigen.",
          rubric: { minChars: 120, needles: [["finde", "glaube", "meine"], ["weil", "denn"], ["haller", "knie", "weg", "treppe"], ["platz", "fest", "jugend", "baum", "amira", "otto"]] }
        }
      }
    ]
  });

  KH.MODULES.push({
    id: "e16",
    n: 16,
    title: "Jubiläum",
    titleLong: "Du gehörst dazu — mit Kompromiss",
    season: "April · 750 Jahre · 13°, Sonne",
    skills: ["reading", "writing", "listening", "speaking"],
    canDo: [
      { de: "Ich kann in allen vier Modi auf Novice High eine Situation in der Stadt bewältigen.", en: "I can handle a familiar town situation in all four modalities at Novice High." },
      { de: "Ich kann sagen, wer ich in Kleinhausen geworden bin.", en: "I can say who I have become in this town." }
    ],
    vocab: ["das Jubiläum", "der Kompromiss", "die Rede", "wir", "bleiben", "danke", "zuhause"],
    grammar: "Review: sein/haben, gern, Sie/du, Weg-Chunks, Meinung",
    places: ["rathaus", "fest", "markt"],
    scenes: [
      {
        type: "narrate",
        title: "Der Stadtrat entscheidet nicht wie ein Film.",
        paras: [
          "Kein Held, der Nordpark mit einem Satz besiegt. Ein Kompromiss, der nach Arbeit riecht: Festplatz bleibt, kleiner. Zwölf Parkplätze am Rand, nicht sechzig in der Erde. Jugendzentrum: zwei Jahre Miete vom Kaufhaus Fröhlich gesponsert — Stefan sieht aus, als hätte er das nicht vorgehabt, und hatte es doch.",
          "Frau Haller hat einen Parkplatz mit Schild. Amira hat Bäume. Jonas hat eine Bühne, die nicht im Keller steht. Du hast eine Nummer auf der Rednerliste. Drei Minuten. Novice High. Es reicht, wenn es wahr ist.",
          "Lena fotografiert dich von hinten, weil Gesichter in Reden zittern."
        ],
        en: "Adult ending: compromise, not annihilation. You speak. You live here."
      },
      {
        type: "read",
        title: "Beschluss (leicht gemacht)",
        html: "<p>Der Festplatz bleibt öffentliche Fläche. Ein Streifen Parken (12) am Nordrand, barrierefrei. Bäume: Gärtnerei Tadesse. Jugendzentrum: Sicherung 24 Monate. Nordpark GmbH: Angebot abgelehnt in der beantragten Form. Jubiläumsfest: 14 Uhr, Markt &amp; Platz. Reden: Bürgermeisterin, Chor, Gastschüler/in.</p>",
        questions: [
          {
            de: "Was passiert mit Nordparks großem Parkhaus?",
            options: [
              { de: "So nicht. Abgelehnt in der Form.", ok: true, feedback: "Kompromiss ≠ ihr Plan." },
              { de: "Es wird gebaut, 60 Plätze unter der Erde.", ok: false, feedback: "Genau das nicht." },
              { de: "Nichts ändert sich.", ok: false, feedback: "12 Parkplätze und Bäume sind Änderung." }
            ]
          }
        ]
      },
      {
        type: "culture",
        title: "Heimat auf Zeit",
        html: "<p>Austauschjahr heißt: du gehst wieder. Trotzdem darf der Satz <em>Ich wohne hier</em> wahr sein.</p><p>Kompromiss ist eine deutsche Verwaltungstugend und eine menschliche. Er fühlt sich selten wie Gewinn an. Er fühlt sich wie Bleiben an.</p>",
        en: "You can belong without staying forever. Compromise is the local plot armor."
      },
      {
        type: "activity",
        title: "Letzte Postkarte",
        src: "praxis/foto-schnitzeljagd.html",
        de: "Wenn du willst: noch einmal durch die Stadt, Fotos, Postkarte nach Hause. Diesmal nicht als Tourist. Als jemand, der den Brunnen mit Streit und mit Punsch kennt.",
        en: "Optional replay of the photo hunt as a resident, not a visitor.",
        points: 6
      },
      {
        type: "ipa",
        title: "Abschluss-IPA · Novice High",
        interpretive: {
          type: "listen",
          title: "Frau Aydin eröffnet",
          audio: "Liebe Gäste, liebe Kleinhausenerinnen und Kleinhausener. Wir sind 750 Jahre alt und immer noch nicht fertig. Danke an die, die gekehrt, geliefert, gemessen, widersprochen und Punsch gekocht haben. Unser Gast aus dem Austauschjahr spricht jetzt — kurz, klar, auf Deutsch. Bitte begrüßt …",
          questions: [
            {
              de: "Was sollst du tun?",
              options: [
                { de: "Kurz und klar auf Deutsch sprechen.", ok: true, feedback: "Die Latte liegt auf deinem Niveau. Gut so." },
                { de: "Einen Rap auf Englisch.", ok: false, feedback: "Sie hat Deutsch gesagt." }
              ]
            }
          ]
        },
        interpersonal: {
          npc: "lena",
          line: "Bevor du raufgehst: Wir sind nervös. Sag ‚wir‘, wenn du willst. Du musst nicht perfekt sein. Du musst da sein. Bello ist zu Hause, der versteht Reden nicht. Ich schon.",
          followUp: { de: "Wen dankst du zuerst auf der Bühne — und warum?", en: "Who do you thank first on stage, and why?" },
          options: [
            { de: "Danke. Ich sage wir. Ich bin da.", ok: true, trust: 1, feedback: "Sie drückt deine Schulter. Kamera aus. Mensch an." },
            { de: "Ich will allein Held sein.", ok: false, feedback: "Falscher Film. Falsche Stadt." },
            { de: "Ich kann nicht.", ok: "ok", feedback: "Angst ist erlaubt. Dann: zwei Sätze. Name, Dank, Platz. Das ist eine Rede." }
          ]
        },
        presentational: {
          type: "write",
          title: "Die drei Minuten (Skript)",
          prompt: "Schreib deine Rede (10–14 Sätze, Novice High): Anrede, wer du bist, was du gelernt hast (Sprache ODER Stadt), der Platz, Dank an konkrete Personen, ein Satz Zukunft (ich bleibe / ich gehe / ich komme wieder).",
          checklist: ["Anrede (Sie/ihr bewusst)", "Ich heiße / ich bin Gastschüler/in", "eine Person namentlich danken", "Festplatz in einem Satz", "Schluss"],
          rubric: { minChars: 140, needles: [["hallo", "liebe", "guten"], ["ich"], ["danke", "dank"], ["platz", "fest", "kleinhausen"], ["lena", "amira", "haller", "vogel", "familie", "aylin", "otto", "karl"]] }
        }
      },
      {
        type: "speak",
        title: "Sag’s laut, wenn du kannst",
        prompt: "Lies deine Rede oder sag sie frei. Mut-Punkte zählen. Perfektion nicht.",
        model: "Guten Tag. Ich heiße … und ich wohne bei Familie Fröhlich. Ich lerne Deutsch in eurer Stadt. Ich finde, der Festplatz ist wichtig, weil wir uns dort treffen. Danke, Lena. Danke, Kleinhausen. Ich gehöre ein bisschen dazu."
      },
      {
        type: "narrate",
        title: "Danach.",
        paras: [
          "Punsch. Bello darf kurz auf den Platz, trotz Regel, weil Opa sagt, Regeln brauchen Ausnahmen, und Werner sonst keine macht.",
          "Dein Reisepass im Kurs — nicht der echte — bekommt den letzten Stempel: Jubiläum.",
          "Du bist nicht fertig mit Deutsch. Novice High ist eine Station, kein Bahnhof zum Bleiben. Aber der Zug, der dich brachte, fährt nicht mehr ohne dass du weißt, wie man auf Gleis 2 wartet.",
          "Willkommen in Kleinhausen. Immer noch. Jetzt erst recht."
        ],
        en: "Stamp. Belonging. The language course continues; the story of year one closes."
      }
    ]
  });
})(window);
