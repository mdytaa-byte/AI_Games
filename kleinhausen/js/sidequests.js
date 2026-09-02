/* Optional discoveries — playable outside the 16-episode spine. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.SIDEQUESTS = [
    {
      id: "bello",
      title: "Wo ist Bello?",
      need: 1,
      teaser: "Der Hund verschwindet. Die Stadt ist sein Garten.",
      scenes: [
        {
          type: "narrate",
          title: "Leine ohne Hund",
          paras: ["Werner flucht hessisch. Bello ist raus. Tipps: Metzgerei-Geruch, Park, Jonas’ Probe, der Brunnen (Münzen sind kein Futter, sagt er nicht)."],
          en: "Find the dog via town logic."
        },
        {
          type: "read",
          title: "Zettel am Laternenpfahl",
          html: "<p>HUND WEG. Schwarz-weiß, schwanz schuldig. Wenn gesehen: Rosenweg 4 oder 0170… (Nummer nass). Belohnung: Wurst für den Finder, Vorwürfe für den Hund.</p>",
          questions: [{
            de: "Was für ein Hund?",
            options: [
              { de: "Schwarz-weiß, schuldig aussehender Schwanz.", ok: true, feedback: "Das ist Bello." },
              { de: "Ein Wolf.", ok: false, feedback: "Kleinhausen hat Probleme, aber keine Wölfe im Abspann." }
            ]
          }]
        },
        {
          type: "dialogue",
          npc: "otto",
          line: "Er war hier. Er hat den Boden geputzt mit der Nase. Dann Richtung Park. Brötchen gebe ich ihm nicht. Prinzip.",
          options: [
            { de: "Danke, Herr Otto. Ich suche im Park.", ok: true, feedback: "Du findest Bello unter der Bank, stolz, nass, lebendig." },
            { de: "Geben Sie trotzdem ein Brötchen.", ok: false, feedback: "Prinzip. Auch du lernst welche." }
          ]
        }
      ]
    },
    {
      id: "clara",
      title: "Wer steht auf dem Denkmal?",
      need: 2,
      teaser: "Die bronzene Frau vor St. Nikolai hat keinen lesbaren Namen mehr.",
      scenes: [
        {
          type: "narrate",
          title: "Grün vor Alter.",
          paras: ["Lena: „Alle sagen Dichterin. Niemand sagt den Namen. Das ist sehr Kleinhausen.“ Im Museum: Vitrine 4."]
        },
        {
          type: "read",
          title: "Vitrine 4 — Karteikarte",
          html: "<p>Clara Weide, 1841–1909. Gedichte, Schulbücher, eine Rede gegen das Zuschütten des Hahnflusses. Denkmal 1921. Inschrift verwittert. Zitat: <em>„Eine Stadt, die ihr Wasser zudeckt, zudeckt auch ihr Gedächtnis.“</em></p>",
          questions: [{
            de: "Wogegen hat Clara gesprochen?",
            options: [
              { de: "Den Fluss zuzuschütten.", ok: true, feedback: "Wasser = Gedächtnis. Der Festplatz-Streit hat Urgroßeltern." },
              { de: "Gegen Schule.", ok: false, feedback: "Sie schrieb Schulbücher." }
            ]
          }]
        },
        {
          type: "culture",
          title: "Lokale Erinnerung",
          html: "<p>Viele Denkmäler in deutschen Kleinstädten sind undeutlich geworden. Namen fallen ab. Wer liest, gibt sie zurück. Das ist Interpretive Reading als Bürgerpflicht.</p>"
        }
      ]
    },
    {
      id: "rezept",
      title: "Omas Zettel in der Küche",
      need: 4,
      teaser: "Handschrift. Keine Grammzahlen. Trotzdem bindend.",
      scenes: [
        {
          type: "read",
          title: "Apfelkuchen (Ursula)",
          style: "note",
          html: "<p>Äpfel. Mehr als du denkst. Teig: Butter, Zucker, Ei, Mehl, etwas Milch. Nicht zu klug rühren. Ofen: mittel. Wenn es riecht, ist es fast fertig. Wer fragt „wie lange?“, ist nicht aus dieser Küche.</p>",
          questions: [{
            de: "Wann ist der Kuchen fertig?",
            options: [
              { de: "Wenn er riecht (und der Ofen mittel ist).", ok: true, feedback: "Sensorik vor Timer. Kultur." },
              { de: "Nach genau 12 Minuten bei 180,0 °C.", ok: false, feedback: "Das stünde auf einem industriellen Rezept." }
            ]
          }]
        },
        {
          type: "write",
          title: "Dein Rezept in einfachem Deutsch",
          prompt: "Schreib ein Essen aus deiner Herkunft in 5 Sätzen auf Deutsch: Zutaten, ein Schritt, wann fertig, für wen.",
          rubric: { minChars: 50, needles: [["ich", "man"], ["essen", "backen", "kochen", "schneiden", "rühren", "ofen", "wasser"]] }
        }
      ]
    },
    {
      id: "lindenlied",
      title: "Text von Die Linden",
      need: 7,
      teaser: "Jonas lässt ein Blatt in der Küche. Nicht aus Versehen.",
      scenes: [
        {
          type: "cloze",
          title: "Refrain (langsam, Novice)",
          parts: [
            { t: "Wir stehen auf dem " },
            { gap: 0 },
            { t: ", auch wenn es " },
            { gap: 1 },
            { t: ". Kein " },
            { gap: 2 },
            { t: " unter uns, nur Schuhe und " },
            { gap: 3 },
            { t: "." }
          ],
          gaps: [["Platz", "Festplatz", "platz"], ["regnet", "kalt ist"], ["Parkhaus", "parkhaus"], ["Licht", "Lichter", "Musik"]]
        },
        {
          type: "dialogue",
          npc: "jonas",
          line: "Ist nicht Goethe. Ist auch okay. Nicht online stellen, ja? Noch nicht.",
          options: [
            { de: "Ich stelle nichts online. Der Refrain ist gut.", ok: true, trust: 1, feedback: "Er nickt im Takt von nichts." },
            { de: "Ich mache es viral.", ok: false, feedback: "Er nimmt das Blatt zurück. Vertrauen minus." }
          ]
        }
      ]
    },
    {
      id: "strassen",
      title: "Warum heißen die Gassen so?",
      need: 6,
      teaser: "Kurier-Wissen. Etymologie für Leute mit Beinen.",
      scenes: [
        {
          type: "match",
          title: "Name → Grund",
          pairs: [
            { left: "Bäckergasse", right: "Hier war (und ist) der Bäcker." },
            { left: "Kirchweg", right: "Weg zur Kirche." },
            { left: "Schulstraße", right: "Das Gymnasium liegt daran." },
            { left: "Bahnhofstraße", right: "Führt zum Bahnhof." },
            { left: "Lindenallee", right: "Bäume: Linden. Bandname: Die Linden." }
          ]
        },
        {
          type: "culture",
          title: "Sprechende Straßen",
          html: "<p>Deutsche Straßennamen sind oft Berufs-, Baum- oder Richtungsgeschichte. Wer sie liest, braucht weniger GPS. Wer sie nur hört, braucht Episode 6 noch einmal.</p>"
        }
      ]
    },
    {
      id: "turm",
      title: "200 Stufen",
      need: 2,
      teaser: "Der Turm jenseits des Flusses. Beine, Artikel, Aussicht.",
      scenes: [
        {
          type: "narrate",
          title: "Links die Brücke, oben der Wind.",
          paras: ["Ein Schild: <em>200 Stufen. Pause erlaubt. Spucke nicht.</em> Du zählst bis vierzig und verlierst die Zahl. Kleinhausen liegt unter dir wie ein Satz, den du jetzt lesen kannst: Rathaus, Gleise, Festplatz, Rosenweg."]
        },
        {
          type: "write",
          title: "Was siehst du?",
          prompt: "Vier Sätze: ein Gebäude im Westen, eines im Osten, der Fluss, ein Gefühl.",
          rubric: { minChars: 40, needles: [["ich sehe", "sehe", "dort"], ["fluss", "rathaus", "kirche", "bahnhof", "platz", "park"]] }
        }
      ]
    },
    {
      id: "radio",
      title: "Radio Kleinhausen — nur hören",
      need: 3,
      teaser: "UKW und Internet. Dieselbe Moderatorin, dieselbe Gemütlichkeit.",
      scenes: [
        {
          type: "listen",
          title: "Morgensendung",
          listenId: "sq-radio",
          speaker: "hanna",
          audio: "Guten Morgen, Kleinhausen, hier ist Hanna am Mikrofon. Der Hahnfluss führt viel Wasser. Die Bäckerei Sonnenkorn hat heute keine Sonnenblumenkerne, sorry. Um zehn spricht die Bürgermeisterin im Rathaus. Und das Rätsel: Welches Gebäude hat eine goldene Brezel? Anrufen, oder einfach hingehen und hungrig sein.",
          questions: [
            {
              de: "Was fehlt bei Otto?",
              options: [
                { de: "Sonnenblumenkerne.", ok: true, feedback: "Heute keine." },
                { de: "Wasser im Fluss.", ok: false, feedback: "Der Fluss hat viel Wasser." }
              ]
            },
            {
              de: "Welches Gebäude hat die goldene Brezel?",
              options: [
                { de: "Die Bäckerei.", ok: true, feedback: "Du weißt das seit Episode 2." },
                { de: "Das Rathaus.", ok: false, feedback: "Uhr, keine Brezel." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "tram",
      title: "Linie 3",
      need: 5,
      teaser: "Die Straßenbahn ist zu groß für den Ort und fährt trotzdem.",
      scenes: [
        {
          type: "read",
          title: "Fahrplan, Haltestelle Markt",
          html: "<p>Linie 3 · Markt → Bahnhof → Sportplatz</p><p>:15 :35 :55 (nicht sonntags nach 20 Uhr)</p><p>Ticket: Stadtzone 1, 1,80 €. Fahrrad: nein. Hund: ja, wenn müde.",
          questions: [{
            de: "Fährt die Bahn Sonntag um 21 Uhr?",
            options: [
              { de: "Nein.", ok: true, feedback: "Nicht sonntags nach 20 Uhr." },
              { de: "Ja, immer.", ok: false, feedback: "Lies die Klammer." }
            ]
          }]
        }
      ]
    }
  ];
})(window);
