/* Town memory: choices become later lines, doors, and a compromise with texture. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.FLAG_META = {
    hallerHeard: {
      who: "Frau Haller",
      de: "Haller hat gemerkt, dass du zuhörst. Der Weg bleibt ein Thema — nicht nur die Jugend.",
      en: "Haller registered that you listened."
    },
    hallerColder: {
      who: "Frau Haller",
      de: "Haller ist kühler. Du hast ihre Knie wie Deko behandelt.",
      en: "Haller went colder."
    },
    hallerIgnored: {
      who: "Frau Haller",
      de: "Whatever auf dem Markt: sie dreht sich um, wenn du kommst.",
      en: "You shrugged her off in English."
    },
    hallerPath: {
      who: "Frau Haller",
      de: "Der Weg am Festplatz-Rand ist verhandelt. Sie nickt fast.",
      en: "You kept a path for her knees."
    },
    platzOhneHaller: {
      who: "Frau Haller",
      de: "„Der Platz ist für uns“ — ohne sie. Sie hört das wie Nordpark, nur jünger.",
      en: "You claimed the square without her."
    },
    ottoRegular: {
      who: "Herr Otto",
      de: "Otto legt schon die Roggen bereit. Du bist keine Nummer.",
      en: "Otto knows your rolls."
    },
    marktPunktOnly: {
      who: "Herr Otto",
      de: "Otto sieht die MarktPunkt-Tüte. Die Linie ändert sich — nicht die Stadt.",
      en: "You shopped the chain. Otto’s line changes."
    },
    amiraListened: {
      who: "Amira",
      de: "Kakao und Zuhören. Du sitzt links vom Fenster, nicht nur auf dem Sofa.",
      en: "You listened at Federkiel."
    },
    amiraCocoaOnly: {
      who: "Amira",
      de: "Nur Kakao. Die Flyer bleiben. Sie zählt dich noch nicht.",
      en: "Cocoa only. She has not counted you yet."
    },
    amiraColder: {
      who: "Amira",
      de: "Amira ist präzise und kalt: Gast, der Wegschaut, bleibt Foto.",
      en: "Amira went colder."
    },
    kehrwoche: {
      who: "Opa Werner",
      de: "Du hast gekehrt. Wohnen ist eine Aufgabe. Er gibt dir den Besen wieder.",
      en: "You swept. You live here."
    },
    kehrwocheRefused: {
      who: "Opa Werner",
      de: "Nicht deine Aufgabe, hast du gesagt. Der Flur merkt sich das.",
      en: "You refused the broom."
    },
    treesYes: {
      who: "Herr Tadesse",
      de: "Setzlinge am Rand. Gießen ist jetzt eine Adresse, nicht ein Slogan.",
      en: "You took the seedlings."
    },
    treesNo: {
      who: "Herr Tadesse",
      de: "Bäume helfen nicht, hast du gesagt. Er gießt trotzdem. Ohne dich.",
      en: "You waved the trees off."
    },
    aylinRepaired: {
      who: "Aylin",
      de: "Das Zitat ist korrigiert. Der Gruppenchat ist wieder ein Ort, kein Feuer.",
      en: "You repaired the rumor. Chat opens again."
    },
    aylinRumorStands: {
      who: "Aylin",
      de: "Ignorieren. Für sie ist die Klasse das Internet — und es brennt noch.",
      en: "The rumor still stands."
    },
    aylinEscalated: {
      who: "Aylin",
      de: "Mail an Frau Vogel, bevor die Gruppe es selbst richtet. Zu früh, zu hoch.",
      en: "You escalated upstairs too soon."
    },
    saidWir: {
      who: "Lena",
      de: "Du sagst wir auf der Bühne. Kamera aus. Mensch an.",
      en: "You said we."
    },
    praxisFoto: {
      who: "Lena",
      de: "Die Postkarte liegt im Heft. Turm und Schloss sind keine Touristenkulisse mehr.",
      en: "The postcard is in the journal."
    },
    praxisLiefer: {
      who: "Zentrale",
      de: "Schicht im Heft. Das Rathaus kennt deinen Klingelton.",
      en: "The delivery shift counted."
    },
    praxisMarkt: {
      who: "MarktPunkt",
      de: "Kassenbon im Heft. Hallers Aufzug-Argument hat ein Papier.",
      en: "The chain receipt is filed."
    }
  };

  KH.setFlag = function (name, value) {
    if (!KH.state.flags) KH.state.flags = {};
    if (value === false) delete KH.state.flags[name];
    else KH.state.flags[name] = value == null ? true : value;
    KH.save();
    return KH.state.flags[name];
  };

  KH.hasFlag = function (name) {
    return !!(KH.state.flags && KH.state.flags[name]);
  };

  KH.flag = function (name) {
    return KH.state.flags && KH.state.flags[name];
  };

  KH.applyChoice = function (opt) {
    if (!opt) return;
    if (opt.flag) KH.setFlag(opt.flag, true);
    if (opt.flagOff) KH.setFlag(opt.flagOff, false);
    if (opt.flags) {
      Object.keys(opt.flags).forEach(function (k) {
        KH.setFlag(k, opt.flags[k]);
      });
    }
  };

  KH.openStreet = function (id) {
    if (!id) return;
    KH.state.streets = KH.state.streets || [];
    if (KH.state.streets.indexOf(id) < 0) {
      KH.state.streets.push(id);
      KH.save();
      return true;
    }
    return false;
  };

  KH.streetOpen = function (id) {
    return !KH.state.streets || KH.state.streets.indexOf(id) >= 0 || (KH.state.visited || []).indexOf(id) >= 0;
  };

  KH.sceneOpen = function (scene) {
    if (!scene) return false;
    if (scene.ifFlag && !KH.hasFlag(scene.ifFlag)) return false;
    if (scene.unlessFlag && KH.hasFlag(scene.unlessFlag)) return false;
    if (scene.ifAny && !scene.ifAny.some(function (f) { return KH.hasFlag(f); })) return false;
    return true;
  };

  function pickWhen(map, fallback) {
    if (!map) return fallback;
    const keys = Object.keys(map);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k === "_else") continue;
      if (KH.hasFlag(k)) return map[k];
    }
    return map._else != null ? map._else : fallback;
  }

  KH.resolveScene = function (scene) {
    if (!scene) return scene;
    const out = Object.assign({}, scene);
    if (scene.lineWhen) out.line = pickWhen(scene.lineWhen, scene.line);
    if (scene.lineEnWhen) out.lineEn = pickWhen(scene.lineEnWhen, scene.lineEn);
    if (scene.parasWhen) out.paras = pickWhen(scene.parasWhen, scene.paras);
    if (scene.parasFrom && KH.sceneText[scene.parasFrom]) out.paras = KH.sceneText[scene.parasFrom]();
    if (scene.titleWhen) out.title = pickWhen(scene.titleWhen, scene.title);
    return out;
  };

  KH.placeNpcLine = function (id, loc) {
    loc = loc || (KH.LOCATIONS && KH.LOCATIONS[id]) || {};
    const patched = KH.PLACE_LINES[id];
    if (patched) {
      const hit = pickWhen(patched, null);
      if (hit) return hit;
    }
    return { de: loc.npcLine || "", en: loc.npcLineEn || "" };
  };

  KH.PLACE_LINES = {
    markt: {
      hallerHeard: {
        de: "Sie wieder. Mit den Knien. Aber Sie haben zugehört. Das merkt man selten.",
        en: "You again. The knees. You listened, though."
      },
      hallerColder: {
        de: "Fotografieren Sie weiter. Parken kann man trotzdem nicht. Jugend erklärt gern.",
        en: "Keep photographing. Still nowhere to park."
      },
      hallerIgnored: {
        de: "Whatever. Ich setze mich. Der Brunnen hört besser zu.",
        en: "Whatever. I’ll sit. The fountain listens better."
      }
    },
    baeckerei: {
      ottoRegular: {
        de: "Na. Vier Roggen, zwei Körner — oder heute anders? Die Kette hat Milch. Ich habe Namen.",
        en: "Four rye, two seeded — or different today?"
      },
      marktPunktOnly: {
        de: "Die Tüte kenne ich. MarktPunkt. Roggen ist trotzdem noch warm, wenn du willst. Kein Vorwurf. Eine Feststellung.",
        en: "I know that bag. Rye is still warm if you want it."
      }
    },
    supermarkt: {
      praxisMarkt: {
        de: "Siehst du? Aufzug. Ich mag Otto. Meine Knie mögen das hier. Beides darf in einem Satz stehen.",
        en: "Elevator. I like Otto. My knees like this."
      }
    },
    cafe: {
      amiraColder: {
        de: "Kakao steht auf der Karte. Zuhören ist extra. Heute ist extra teurer.",
        en: "Cocoa is on the menu. Listening costs extra today."
      },
      amiraListened: {
        de: "Fensterplatz ist frei. Wir zählen später. Du kannst schon die Flyer falten.",
        en: "Window seat’s free. You can fold flyers."
      },
      amiraCocoaOnly: {
        de: "Nur Kakao gilt. Die Flyer bleiben liegen. Mittwoch zählen wir ohne Sofa.",
        en: "Cocoa only still counts as cocoa."
      }
    },
    schule: {
      aylinRepaired: {
        de: "Danke fürs Transkript. Der Chat ist wieder langweilig. Langweilig ist gut.",
        en: "Thanks for the transcript. Chat is boring again. Good."
      },
      aylinRumorStands: {
        de: "Setz dich, wenn du willst. Ich lese lieber das Transkript allein.",
        en: "Sit if you want. I’m reading the transcript alone."
      }
    },
    jugend: {
      aylinRepaired: {
        de: "Der Chat ist offen. Kein Drama-Herz. Nur: Weg UND Platz. Willst du mitzählen?",
        en: "Chat is open. Path AND square. Counting?"
      },
      amiraColder: {
        de: "Wir zählen ohne Sofa-Gäste. Zahlen wirken auf Erwachsene. Fotos nicht.",
        en: "We count without sofa guests."
      }
    },
    park: {
      hallerPath: {
        de: "Rand, nicht Mitte. Frau Haller kommt durch. Die Setzlinge auch, wenn jemand gießt.",
        en: "Edge, not middle. Haller can pass."
      },
      platzOhneHaller: {
        de: "Die Mitte ist voll. Der Rollator wartet. Bäume brauchen trotzdem Wasser.",
        en: "The middle is crowded. The walker waits."
      }
    },
    fest: {
      hallerPath: {
        de: "Bank am Rand. Haller sitzt. Die Bühne steht nicht im Keller. Kompromiss als Möbel.",
        en: "Bench at the edge. Haller sits."
      },
      aylinRepaired: {
        de: "Aylin hat den Chat ruhig gemacht. Die Probe klingt danach weniger nach Krieg.",
        en: "Aylin quieted the chat. Rehearsal sounds less like war."
      }
    },
    haus: {
      kehrwoche: {
        de: "Besen an der Wand. Werner sagt nichts, das ist Lob. Dein Zimmer ist immer noch schräg.",
        en: "Broom on the wall. Werner saying nothing is praise."
      },
      kehrwocheRefused: {
        de: "Der Flur ist gekehrt. Nicht von dir. Oma hat Kuchen trotzdem, aber der Besen guckt.",
        en: "The hall is swept. Not by you."
      }
    }
  };

  KH.sceneText = {
    endingOpen: function () {
      const name = KH.state.player.vorname || "Gast";
      const paras = [
        "Kein Held, der Nordpark mit einem Satz besiegt. Ein Kompromiss, der nach Arbeit riecht: Festplatz bleibt, kleiner. Zwölf Parkplätze am Rand, nicht sechzig in der Erde. Jugendzentrum: zwei Jahre Miete vom Kaufhaus Fröhlich gesponsert — Stefan sieht aus, als hätte er das nicht vorgehabt, und hatte es doch."
      ];
      if (KH.hasFlag("hallerPath") || KH.hasFlag("hallerHeard")) {
        paras.push("Frau Haller hat einen Parkplatz mit Schild — und einen Weg, den jemand freigehalten hat. Sie setzt sich, bevor sie klatscht.");
      } else if (KH.hasFlag("hallerColder") || KH.hasFlag("platzOhneHaller")) {
        paras.push("Frau Haller hat einen Parkplatz mit Schild. Sie benutzt ihn. Sie bleibt nicht für die Reden. Das ist auch eine Stimme.");
      } else {
        paras.push("Frau Haller hat einen Parkplatz mit Schild. Amira hat Bäume. Jonas hat eine Bühne, die nicht im Keller steht.");
      }
      if (KH.hasFlag("amiraColder")) {
        paras.push("Amira steht weiter hinten. Sie hat die Zahlen. Sie hat dich nicht auf die Liste der Kistenträger gesetzt.");
      } else if (KH.hasFlag("amiraListened") || KH.hasFlag("treesYes")) {
        paras.push("Amira hat Bäume am Rand und eine Liste, auf der dein Name nicht nur Kakao ist.");
      } else {
        paras.push("Amira hat Bäume. Jonas hat eine Bühne, die nicht im Keller steht.");
      }
      if (KH.hasFlag("aylinRepaired")) {
        paras.push("Aylin sitzt in der zweiten Reihe. Der Chat ist still. Das Gerücht hat das UND nicht behalten — du schon.");
      } else if (KH.hasFlag("aylinRumorStands")) {
        paras.push("Aylin steht am Rand. Der Chat ist nicht geheilt. Sie hört trotzdem zu. Das ist mehr, als das Gerücht verdient.");
      }
      if (KH.hasFlag("marktPunktOnly") && !KH.hasFlag("ottoRegular")) {
        paras.push("Otto hat die Brezel über der Tür poliert und sagt nichts über Tüten. Nur: „Nach der Rede gibt’s Roggen.“");
      } else if (KH.hasFlag("ottoRegular")) {
        paras.push("Otto kennt die Bestellung schon. Nach der Rede: vier Roggen, zwei Körner, ohne zu fragen.");
      }
      paras.push(name + ", du hast eine Nummer auf der Rednerliste. Drei Minuten. Novice High. Es reicht, wenn es wahr ist.");
      paras.push("Lena fotografiert dich von hinten, weil Gesichter in Reden zittern.");
      return paras;
    },
    endingClose: function () {
      const paras = [
        "Punsch. Bello darf kurz auf den Platz, trotz Regel, weil Opa sagt, Regeln brauchen Ausnahmen, und Werner sonst keine macht."
      ];
      if (KH.hasFlag("kehrwoche")) {
        paras.push("Werner gibt dir den Besen nicht mit auf die Bühne. Er lehnt ihn nur so hin, dass du ihn siehst.");
      }
      if (KH.hasFlag("saidWir")) {
        paras.push("Lena sagt nichts zu „wir“. Sie hat es gehört. Das reicht.");
      }
      paras.push("Dein Reisepass im Kurs — nicht der echte — bekommt den letzten Stempel: Jubiläum.");
      paras.push("Du bist nicht fertig mit Deutsch. Novice High ist eine Station, kein Bahnhof zum Bleiben. Aber der Zug, der dich brachte, fährt nicht mehr ohne dass du weißt, wie man auf Gleis 2 wartet.");
      paras.push("Willkommen in Kleinhausen. Immer noch. Jetzt erst recht.");
      return paras;
    }
  };

  KH.memoryCards = function () {
    const cards = [];
    Object.keys(KH.FLAG_META).forEach(function (id) {
      if (!KH.hasFlag(id)) return;
      const m = KH.FLAG_META[id];
      cards.push({ id: id, who: m.who, de: m.de, en: m.en });
    });
    return cards;
  };

  KH.recordPraxis = function (scene, payload) {
    payload = payload || {};
    KH.state.praxis = KH.state.praxis || {};
    const id = (scene && scene.praxisId) || payload.id || (scene && scene.src) || "praxis";
    KH.state.praxis[id] = {
      at: Date.now(),
      weather: payload.weather || (KH.weatherKey && KH.weatherKey()),
      score: payload.score,
      code: payload.code,
      artifact: payload.artifact || payload.title || scene.title
    };
    if (scene && scene.flag) KH.setFlag(scene.flag, true);
    if (scene && scene.flags) {
      Object.keys(scene.flags).forEach(function (k) { KH.setFlag(k, scene.flags[k]); });
    }
    (scene && scene.unlock || []).forEach(function (place) { KH.openStreet(place); });
    const title = (scene && scene.artifactTitle) || payload.title || (scene && scene.title) || "Praxis";
    const text = payload.artifact || payload.text || (scene && scene.artifactText) ||
      ("Mission erledigt" + (payload.code ? " · " + payload.code : "") +
        ((scene && scene.unlock && scene.unlock.length) ? " · Straße offen: " + scene.unlock.join(", ") : ""));
    KH.state.journal = KH.state.journal || [];
    KH.state.journal.push({
      at: Date.now(),
      ep: (scene && scene.ep) || KH.currentEpisode || "",
      kind: "praxis",
      title: title,
      text: text,
      src: scene && scene.src,
      score: payload.score
    });
    KH.save();
    return KH.state.praxis[id];
  };
})(window);
