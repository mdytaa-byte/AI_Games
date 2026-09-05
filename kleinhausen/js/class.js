/* Canvas-as-class: minutes-on-task, teacher roster, printable IPA rubric. */
(function (global) {
  const KH = global.KH = global.KH || {};
  const ROSTER_KEY = "kleinhausen.roster.v1";

  KH.ensureTime = function () {
    if (!KH.state.time) KH.state.time = { totalMs: 0, lastTick: Date.now(), sessions: 0 };
    if (KH.state.time.lastTick == null) KH.state.time.lastTick = Date.now();
  };

  KH.tickTime = function () {
    KH.ensureTime();
    const now = Date.now();
    const last = KH.state.time.lastTick || now;
    let dt = now - last;
    if (dt < 0 || dt > 120000) dt = 0;
    if (dt) {
      KH.state.time.totalMs += dt;
      const ep = KH.currentEpisode;
      if (ep && KH.state.episodes[ep]) {
        KH.state.episodes[ep].timeMs = (KH.state.episodes[ep].timeMs || 0) + dt;
      }
    }
    KH.state.time.lastTick = now;
  };

  KH.startClock = function () {
    KH.ensureTime();
    KH.state.time.lastTick = Date.now();
    if (KH._clock) return;
    KH._clock = setInterval(function () {
      if (document.hidden) return;
      KH.tickTime();
      KH.save();
    }, 10000);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) KH.tickTime();
      else {
        KH.ensureTime();
        KH.state.time.lastTick = Date.now();
      }
    });
  };

  KH.minutesOnTask = function (ms) {
    const n = typeof ms === "number" ? ms : (KH.state.time && KH.state.time.totalMs) || 0;
    return Math.round(n / 60000);
  };

  KH.episodeMinutes = function (id) {
    const e = KH.state.episodes[id];
    return KH.minutesOnTask(e && e.timeMs);
  };

  KH.summarizeStudent = function (state) {
    state = state || KH.state;
    const eps = state.episodes || {};
    const done = Object.keys(eps).filter(function (id) { return eps[id].status === "done"; });
    const scored = done.map(function (id) { return eps[id].summative && eps[id].summative.score; }).filter(function (n) { return typeof n === "number"; });
    const avg = scored.length ? Math.round(scored.reduce(function (a, b) { return a + b; }, 0) / scored.length) : null;
    const spoken = (state.recordings || []).reduce(function (set, r) {
      if (!r || !r.ep || r.mode === "exam") return set;
      if (r.mode === "text" || (r.seconds || 0) >= 15 || r.ready) set[r.ep] = true;
      return set;
    }, {});
    const codes = done.map(function (id) {
      return (eps[id].summative && eps[id].summative.code) || "";
    }).filter(Boolean);
    const flags = Object.keys(state.flags || {}).filter(function (k) { return k !== "demo" && state.flags[k]; });
    return {
      vorname: (state.player && state.player.vorname) || "Gast",
      herkunft: (state.player && state.player.herkunft) || "",
      done: done.length,
      spoken: Object.keys(spoken).length,
      ipa: avg,
      minutes: KH.minutesOnTask(state.time && state.time.totalMs),
      codes: codes,
      flags: flags,
      exam: !!(state.player && state.player.exam),
      accommodation: !!(state.player && state.player.accommodation),
      importedAt: Date.now()
    };
  };

  KH.rosterLoad = function () {
    try {
      return JSON.parse(localStorage.getItem(ROSTER_KEY) || "[]");
    } catch (e) {
      return [];
    }
  };

  KH.rosterSave = function (rows) {
    try { localStorage.setItem(ROSTER_KEY, JSON.stringify(rows)); } catch (e) { /* quota */ }
  };

  KH.rosterAdd = function (state) {
    const row = KH.summarizeStudent(state);
    const rows = KH.rosterLoad();
    const i = rows.findIndex(function (r) { return r.vorname === row.vorname && r.codes[0] === row.codes[0]; });
    if (i >= 0) rows[i] = row;
    else rows.push(row);
    KH.rosterSave(rows);
    return row;
  };

  KH.rosterClear = function () {
    KH.rosterSave([]);
  };

  KH.IPA_RUBRIC = {
    title: "Kleinhausen · IPA-Rubrik (ACTFL Novice High)",
    modes: [
      {
        mode: "Interpretive · Lesen / Hören",
        rows: [
          ["4 Ziel", "Versteht die Hauptaussage und ein Detail. Tempo ½ ist erlaubt; Transkript ist kein Ersatz."],
          ["3 Fast", "Hauptaussage stimmt, Detail unsicher oder geraten."],
          ["2 Ansatz", "Einzelne Wörter, nicht die Situation."],
          ["1 Nicht", "Leer, falsch Sprache, oder nur Englisch."]
        ]
      },
      {
        mode: "Interpersonal · Gespräch",
        rows: [
          ["4 Ziel", "Geübte Sätze + überlebt eine unerwartete Nachfrage. Verständlich für wohlwollende Ohren. Genus/Kasus-Fehler okay."],
          ["3 Fast", "Linie sitzt, Nachfrage nur ja/nein oder Englisch."],
          ["2 Ansatz", "Einzelne Brocken, kein Gespräch."],
          ["1 Nicht", "Nur Klick, oder Prüfungsmodus ohne Aufsichtsgrund."]
        ]
      },
      {
        mode: "Presentational · Schreiben / Rede",
        rows: [
          ["4 Ziel", "10–14 Sätze oder die drei Minuten: Anrede, ich, ein UND, Dank namentlich, Schluss. Verständlich."],
          ["3 Fast", "Botschaft da, Register kippt oder Personen fehlen."],
          ["2 Ansatz", "Liste statt Sätzen."],
          ["1 Nicht", "Zu kurz oder nicht auf Deutsch."]
        ]
      }
    ],
    notes: [
      "Auto-Score im Kurs ist ein erster Durchgang. Diese Rubrik ist die Note.",
      "Sprechen: 15-Sekunden-Aufnahme + Nachfrage. Partnerzettel im Heft.",
      "Nachteilsausgleich: Text statt Aufnahme, dieselbe Rubrik.",
      "Ende bleibt Kompromiss, nicht Bösewicht-Sieg. Inhalt zählt, nicht Heldentum."
    ]
  };

  KH.rubricHtml = function () {
    const r = KH.IPA_RUBRIC;
    let html = '<article class="rubric-sheet"><p class="kicker">Druck · Lehrerzimmer</p><h1>' +
      KH.esc(r.title) + "</h1><p>Name: ____________ · Episode: ______ · Datum: ________</p>";
    r.modes.forEach(function (m) {
      html += "<h2>" + KH.esc(m.mode) + "</h2><table class=\"rubric-table\"><thead><tr><th>Note</th><th>Beschreibung</th><th>Kreis</th></tr></thead><tbody>";
      m.rows.forEach(function (row) {
        html += "<tr><th>" + KH.esc(row[0]) + "</th><td>" + KH.esc(row[1]) + "</td><td class=\"tick\">☐</td></tr>";
      });
      html += "</tbody></table>";
    });
    html += "<h2>Notizen</h2><ul>" + r.notes.map(function (n) { return "<li>" + KH.esc(n) + "</li>"; }).join("") +
      "</ul><p class=\"rubric-score\">Summe / 12: ______ · Note: ______</p></article>";
    return html;
  };
})(window);
