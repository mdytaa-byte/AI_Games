/* "Wo stehe ich?": per-skill results, can-do map, weak spots with a practice replay.
   Scene results are recorded as students play; practice never changes grades,
   town memory, trust or points. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.SKILLS = [
    { id: "hoeren", de: "Hören", en: "Listening", again: "Noch einmal hören" },
    { id: "lesen", de: "Lesen", en: "Reading", again: "Noch einmal lesen" },
    { id: "sprechen", de: "Sprechen", en: "Speaking", again: "Gespräch üben" },
    { id: "schreiben", de: "Schreiben", en: "Writing", again: "Noch einmal schreiben" }
  ];

  /* Only scenes that clearly test one skill count. Rooms, culture, games don't. */
  const SKILL_OF = {
    listen: "hoeren", funk: "hoeren",
    read: "lesen", match: "lesen",
    dialogue: "sprechen", choice: "sprechen", speak: "sprechen",
    write: "schreiben", form: "schreiben", cloze: "schreiben"
  };
  const RECENT = 6;
  const SOLID = 80;
  const WEAK = 70;

  function results() {
    if (!KH.state.results || typeof KH.state.results !== "object") KH.state.results = {};
    return KH.state.results;
  }

  function scoreOf(res) {
    if (!res) return null;
    if (typeof res.score === "number") return res.score;
    if (typeof res.ok === "boolean") return res.ok ? 100 : 50;
    return null;
  }

  function put(ep, key, type, score) {
    const k = SKILL_OF[type];
    if (!k || score == null) return;
    const all = results();
    const byEp = all[ep] = all[ep] || {};
    const r = byEp[key];
    if (r) {
      r.s = score;
      r.n = (r.n || 1) + 1;
      r.at = Date.now();
    } else {
      byEp[key] = { k: k, t: type, s: score, f: score, n: 1, at: Date.now() };
    }
  }

  /* IPA parts are stored as "<scene>.0/1/2" so each counts for its own skill. */
  function ipaParts(scene) {
    return [
      Object.assign({ type: scene.interpretive.type || "read" }, scene.interpretive),
      Object.assign({ type: "dialogue", ipa: true, ipaPart: "interpersonal" }, scene.interpersonal),
      Object.assign({ type: scene.presentational.type || "write", ipa: true, ipaPart: "presentational" }, scene.presentational)
    ];
  }

  KH.recordResult = function (ep, index, scene, res) {
    if (!scene || !res) return;
    if (scene.type === "ipa" && res.parts) {
      ipaParts(scene).forEach(function (p, i) {
        if (typeof res.parts[i] === "number") put(ep, index + "." + i, p.type, res.parts[i]);
      });
    } else {
      put(ep, String(index), scene.type, scoreOf(res));
    }
    KH.save();
  };

  KH.sceneAt = function (ep, key) {
    const mod = KH.mod(ep);
    if (!mod) return null;
    const bits = String(key).split(".");
    let scene = mod.scenes[+bits[0]];
    if (!scene) return null;
    if (KH.resolveScene) scene = KH.resolveScene(scene);
    if (bits.length > 1 && scene.type === "ipa") return ipaParts(scene)[+bits[1]] || null;
    return scene;
  };

  function sceneTitle(scene, mod) {
    if (!scene) return mod.title;
    if (scene.title) return scene.title;
    if (scene.npc && KH.NPCS[scene.npc]) return "Gespräch mit " + KH.NPCS[scene.npc].short;
    return mod.title;
  }

  function avg(list) {
    return list.length ? Math.round(list.reduce(function (a, b) { return a + b; }, 0) / list.length) : null;
  }

  function doneCount(state) {
    return Object.values(state.episodes || {}).filter(function (e) { return e.status === "done"; }).length;
  }

  /* One skill: entries in story order, recent average, trend, and a position
     on the way to Novice High (reached = all 16 episodes at a solid level). */
  KH.skillReport = function (state) {
    state = state || KH.state;
    const all = state.results || {};
    const coverage = doneCount(state) / 16;
    return KH.SKILLS.map(function (sk) {
      const entries = [];
      Object.keys(all).sort().forEach(function (ep) {
        Object.keys(all[ep]).sort(function (a, b) { return parseFloat(a) - parseFloat(b); }).forEach(function (key) {
          const r = all[ep][key];
          if (r.k === sk.id) entries.push({ ep: ep, key: key, s: r.s, f: r.f, n: r.n });
        });
      });
      const scores = entries.map(function (e) { return e.s; });
      const recent = avg(scores.slice(-RECENT));
      const last3 = avg(scores.slice(-3));
      const prev3 = scores.length >= 6 ? avg(scores.slice(-6, -3)) : null;
      const trend = last3 == null || prev3 == null ? 0 : (last3 - prev3 >= 10 ? 1 : (prev3 - last3 >= 10 ? -1 : 0));
      const pos = recent == null ? null : Math.min(1, coverage * Math.min(1, recent / SOLID));
      return Object.assign({}, sk, { entries: entries, recent: recent, trend: trend, pos: pos, level: levelOf(pos) });
    });
  };

  function levelOf(pos) {
    if (pos == null) return null;
    if (pos >= 0.98) return { de: "Novice High", note: "Ziel erreicht" };
    if (pos >= 2 / 3) return { de: "Novice High", note: "auf dem Weg" };
    if (pos >= 1 / 3) return { de: "Novice Mid", note: "" };
    return { de: "Novice Low", note: "" };
  }

  function epRangeLabel(eps) {
    const n = eps.map(function (ep) { return parseInt(ep.slice(1), 10); }).sort(function (a, b) { return a - b; });
    if (n.length === 1) return "E" + n[0];
    return "E" + n[0] + "–E" + n[n.length - 1];
  }

  /* At most one spot per skill: the episodes below WEAK, and the weakest scene to replay. */
  KH.weakSpots = function () {
    const spots = [];
    KH.skillReport().forEach(function (sk) {
      const byEp = {};
      sk.entries.forEach(function (e) { (byEp[e.ep] = byEp[e.ep] || []).push(e); });
      const weakEps = Object.keys(byEp).filter(function (ep) {
        return avg(byEp[ep].map(function (e) { return e.s; })) < WEAK;
      });
      if (!weakEps.length) return;
      const worst = weakEps.reduce(function (acc, ep) { return acc.concat(byEp[ep]); }, [])
        .sort(function (a, b) { return a.s - b.s || (a.ep < b.ep ? 1 : -1); })[0];
      spots.push({
        skill: sk,
        eps: weakEps,
        score: avg(weakEps.reduce(function (acc, ep) { return acc.concat(byEp[ep].map(function (e) { return e.s; })); }, [])),
        worst: worst
      });
    });
    return spots.sort(function (a, b) { return a.score - b.score; }).slice(0, 3);
  };

  /* Evidence for an episode's can-dos: the IPA if there is one, else the scene average. */
  function evidence(ep) {
    const st = KH.state.episodes[ep];
    if (!st || st.status === "locked") return null;
    let s = st.summative && typeof st.summative.score === "number" ? st.summative.score : null;
    if (s == null) {
      const r = (KH.state.results || {})[ep] || {};
      s = avg(Object.keys(r).map(function (k) { return r[k].s; }));
    }
    if (s == null) return st.status === "done" ? { id: "done", de: "erledigt", icon: "✓" } : null;
    if (s >= SOLID) return { id: "solid", de: "sicher", icon: "✓", s: s };
    if (s >= 60) return { id: "ok", de: "geht", icon: "~", s: s };
    return { id: "practice", de: "üben", icon: "!", s: s };
  }

  const SELF = [
    { de: "noch nicht", short: "noch nicht" },
    { de: "mit Hilfe", short: "mit Hilfe" },
    { de: "kann ich", short: "kann ich" }
  ];

  function selfRatings() {
    if (!KH.state.cando || typeof KH.state.cando !== "object") KH.state.cando = {};
    return KH.state.cando;
  }

  /* Finished writing tasks (incl. IPA writing parts) that can be replayed with feedback. */
  function writingTasks() {
    const out = [];
    (KH.MODULES || []).forEach(function (m) {
      if (KH.state.episodes[m.id].status !== "done") return;
      m.scenes.forEach(function (s, i) {
        if (s.type === "write") out.push({ ep: m.id, key: String(i), n: m.n, title: s.title });
        if (s.type === "ipa" && (s.presentational.type || "write") === "write") out.push({ ep: m.id, key: i + ".2", n: m.n, title: s.presentational.title });
      });
    });
    return out;
  }

  function writingPracticeHtml() {
    if (KH.state.player.exam) return "";
    const tasks = writingTasks();
    if (!tasks.length) return "";
    return "<h2>Schreiben üben</h2>" +
      "<p>Schreib eine Aufgabe noch einmal — mit Schreib-Check und Tutor-Feedback. Keine Note, dein Stempel bleibt.</p>" +
      '<div class="row-btns st-write">' + tasks.map(function (t) {
        return '<button class="btn ghost" type="button" data-write-ep="' + t.ep + '" data-write-key="' + t.key + '">E' + t.n + " · " + KH.esc(t.title || "Text") + "</button>";
      }).join("") + "</div>";
  }

  /* ---------- View ---------- */

  KH.view.stand = function () {
    const report = KH.skillReport();
    const spots = KH.weakSpots();
    const done = doneCount(KH.state);
    const rated = selfRatings();
    const due = KH.wordsDue ? KH.wordsDue().length : 0;

    const meters = report.map(function (sk) {
      const has = sk.pos != null;
      const pct = has ? Math.round(sk.pos * 100) : 0;
      const trend = sk.trend > 0 ? '<span class="st-trend up">↑ besser</span>' : sk.trend < 0 ? '<span class="st-trend down">↓ zuletzt schwächer</span>' : "";
      return '<li class="st-skill">' +
        '<div class="st-skill-head"><strong>' + sk.de + '</strong> <span class="st-skill-en">' + sk.en + "</span>" + trend + "</div>" +
        '<div class="st-track" role="img" aria-label="' + sk.de + ": " + (has ? sk.level.de + (sk.level.note ? ", " + sk.level.note : "") + ", " + pct + " Prozent des Wegs" : "noch keine Ergebnisse") + '">' +
        '<span class="st-fill" style="width:' + pct + '%"></span>' +
        '<span class="st-tick" style="left:33.33%"></span><span class="st-tick" style="left:66.67%"></span></div>' +
        '<div class="st-scale" aria-hidden="true"><span>Novice Low</span><span>Novice Mid</span><span>Novice High</span></div>' +
        '<p class="st-skill-line">' + (has
          ? "<strong>" + sk.level.de + "</strong>" + (sk.level.note ? " · " + sk.level.note : "") +
            " · zuletzt " + sk.recent + " % richtig (" + Math.min(sk.entries.length, RECENT) + " Aufgaben)"
          : "Noch keine Ergebnisse — kommt mit der ersten Episode.") + "</p></li>";
    }).join("");

    const spotHtml = spots.length
      ? spots.map(function (sp, i) {
        const mod = KH.mod(sp.worst.ep);
        const scene = KH.sceneAt(sp.worst.ep, sp.worst.key);
        const grams = KH.grammarFor ? KH.grammarFor(sp.worst.ep).slice(0, 2) : [];
        return '<li class="card st-spot"><p class="kicker">' + sp.skill.de + " · " + epRangeLabel(sp.eps) + "</p>" +
          "<p><strong>" + sp.skill.de + " in " + epRangeLabel(sp.eps) + ": " + sp.score + " %.</strong> " +
          "Am schwersten war „" + KH.esc(sceneTitle(scene, mod)) + "“ (Episode " + mod.n + ", " + sp.worst.s + " %).</p>" +
          '<div class="row-btns"><button class="btn post" type="button" data-practice="' + i + '">' + sp.skill.again + "</button>" +
          (KH.tutorPanel && !KH.state.player.exam ? '<button class="btn ghost" type="button" data-tutor-focus="' + i + '">Mit dem Tutor üben</button>' : "") +
          grams.map(function (c) { return '<button class="btn ghost" type="button" data-gram="' + c.id + '">Grammatik: ' + KH.esc(c.title.split(" — ")[0]) + "</button>"; }).join("") +
          "</div></li>";
      }).join("")
      : '<li class="feedback ok">' + (report.some(function (s) { return s.pos != null; })
        ? "Keine Schwachstelle unter " + WEAK + " %. Weiter so — die nächste Episode wartet."
        : "Noch nichts zu sehen. Spiel Episode 1, dann steht hier, was du üben kannst.") + "</li>";

    const tiles = KH.MODULES.map(function (m) {
      const st = KH.state.episodes[m.id];
      const ev = evidence(m.id);
      const open = st.status !== "locked";
      const rows = m.canDo.map(function (c, ci) {
        const key = m.id + "." + ci;
        const r = rated[key];
        const mismatch = ev && ev.id === "practice" && r === 2;
        return '<li class="st-cd">' +
          '<p lang="de">' + KH.esc(c.de) + '</p><p class="en">' + KH.esc(c.en) + "</p>" +
          (open
            ? '<div class="st-self" role="group" aria-label="Wie gut kannst du das?">' + SELF.map(function (o, oi) {
              return '<button type="button" class="choice" data-cd="' + key + '" data-v="' + oi + '" aria-pressed="' + (r === oi) + '">' + o.short + "</button>";
            }).join("") + "</div>" +
              (mismatch ? '<p class="st-mismatch">Du sagst: kann ich. Die Aufgaben sagen: üben. Beides ist ehrlich — schau, was fehlt.</p>' : "")
            : "") + "</li>";
      }).join("");
      const can = m.canDo.filter(function (_, ci) { return rated[m.id + "." + ci] === 2; }).length;
      const fill = Math.round(can / m.canDo.length * 100);
      return '<li class="st-tile st-' + st.status + '">' +
        '<div class="st-tile-head"><span class="num">' + m.n + '</span><div><strong>' + KH.esc(m.title) + "</strong>" +
        '<span class="st-tile-meta">' + (st.status === "locked" ? "noch zu" : st.status === "done" ? "Stempel" : "offen") +
        (ev ? ' · <span class="st-ev st-ev-' + ev.id + '"><span aria-hidden="true">' + ev.icon + "</span> " + ev.de + (ev.s != null ? " (" + ev.s + " %)" : "") + "</span>" : "") +
        "</span></div></div>" +
        '<div class="st-tile-fill" role="img" aria-label="' + can + " von " + m.canDo.length + ' Kann-Sätzen: kann ich"><span style="width:' + fill + '%"></span></div>' +
        '<ul class="st-cds">' + rows + "</ul></li>";
    }).join("");

    KH.shell(
      '<p class="kicker">Wo stehe ich?</p><h1>Dein Deutsch nach ' + done + " von 16 Episoden</h1>" +
      '<p class="lede">Ziel des Jahres: <strong>Novice High</strong> in allen vier Fertigkeiten. Das hier ist eine Schätzung aus deinen Aufgaben — kein Test und keine Note.</p>' +
      '<p class="en">Each bar is how far along the road to Novice High you are: how much of the course you’ve done × how solid your recent answers are (80 % = solid).</p>' +
      '<h2>Vier Fertigkeiten</h2><ul class="st-skills">' + meters + "</ul>" +
      "<h2>Was du jetzt üben kannst</h2>" +
      '<ul class="st-spots">' + spotHtml + "</ul>" +
      (KH.tutorPanel && !KH.state.player.exam
        ? '<div class="card st-tutor"><p><strong>' + KH.esc((KH.TUTOR && KH.TUTOR.name) || "KI-Tutor") + "</strong> weiß, wo du stehst, wenn du ihm deinen Tutor-Brief schickst: Episode, Fertigkeiten, Schwachstellen, wackelige Wörter.</p>" +
          '<div class="row-btns"><button class="btn" type="button" id="st-tutor">Tutor-Brief öffnen</button></div></div>'
        : "") +
      (due ? '<p class="voice-chip">' + due + ' Wörter warten im <button type="button" class="chip" data-go="words">Wortschatz</button></p>' : "") +
      writingPracticeHtml() +
      "<h2>Kann-Sätze</h2>" +
      '<p>Für jede Episode: Was zeigen deine Aufgaben, und was sagst du selbst? <span class="st-legend"><span class="st-ev st-ev-solid">✓ sicher</span> <span class="st-ev st-ev-ok">~ geht</span> <span class="st-ev st-ev-practice">! üben</span></span></p>' +
      '<ul class="st-map">' + tiles + "</ul>",
      { here: "stand" }
    );

    document.querySelectorAll("[data-practice]").forEach(function (b) {
      b.addEventListener("click", function () {
        const sp = spots[+b.getAttribute("data-practice")];
        KH.view.practice(sp.worst.ep, sp.worst.key);
      });
    });
    if (KH.bindGrammarChips) KH.bindGrammarChips(document.querySelector(".st-spots"));
    document.querySelectorAll("[data-tutor-focus]").forEach(function (b) {
      b.addEventListener("click", function () { KH.tutorPanel({ focus: +b.getAttribute("data-tutor-focus") }); });
    });
    document.querySelectorAll("[data-write-ep]").forEach(function (b) {
      b.addEventListener("click", function () { KH.view.practice(b.getAttribute("data-write-ep"), b.getAttribute("data-write-key")); });
    });
    const stTutor = document.getElementById("st-tutor");
    if (stTutor) stTutor.addEventListener("click", function () { KH.tutorPanel({}); });
    document.querySelectorAll("[data-cd]").forEach(function (b) {
      b.addEventListener("click", function () {
        const key = b.getAttribute("data-cd");
        const v = +b.getAttribute("data-v");
        const r = selfRatings();
        if (r[key] === v) delete r[key];
        else r[key] = v;
        KH.save();
        const y = window.scrollY;
        KH.view.stand();
        window.scrollTo(0, y);
        const again = document.querySelector('[data-cd="' + key + '"][data-v="' + v + '"]');
        if (again) again.focus({ preventScroll: true });
      });
    });
  };

  /* ---------- Practice: replay one scene, ungraded ---------- */

  KH.view.practice = function (ep, key) {
    const mod = KH.mod(ep);
    const scene = KH.sceneAt(ep, key);
    if (!mod || !scene) return KH.view.stand();
    const skill = KH.SKILLS.find(function (s) { return s.id === SKILL_OF[scene.type]; });
    const prior = ((KH.state.results || {})[ep] || {})[key];
    const was = prior ? prior.s : null;
    KH.shell(
      '<div class="ep-head"><div><p class="kicker">Üben · Episode ' + mod.n + " · " + (skill ? skill.de : "") + " · keine Note</p>" +
      "<h1>" + KH.esc(sceneTitle(scene, mod)) + "</h1>" +
      "<p>Das zählt nicht für den Stempel und ändert nichts in der Stadt. Es zeigt nur dir, ob es jetzt besser geht.</p>" +
      (skill && skill.id === "sprechen" ? '<p class="voice-chip">Sag deine Antwort laut, bevor du klickst.</p>' : "") +
      '</div><button class="btn ghost" type="button" id="pr-back">Zurück zu „Wo stehe ich?“</button></div>' +
      '<div id="scene-root"></div>',
      { here: "stand" }
    );
    KH.practiceMode = true;
    KH.currentEpisode = null;
    KH.voiceSpine = false;
    document.getElementById("pr-back").addEventListener("click", KH.view.stand);
    KH.mountScene(document.getElementById("scene-root"), Object.assign({ ep: ep }, scene), function (res) {
      KH.practiceMode = false;
      put(ep, key, scene.type, scoreOf(res));
      KH.save();
      const now = scoreOf(res);
      KH.shell(
        '<p class="kicker">Üben · fertig</p><h1>' + (now != null ? now + " %" : "Geschafft") + "</h1>" +
        (now != null && was != null
          ? "<p>Vorher " + was + " %, jetzt " + now + " %. " + (now > was ? "Besser — das zählt ab jetzt in deinem Stand." : now === was ? "Gleich geblieben." : "Heute schwerer. Morgen noch einmal?") + "</p>"
          : "") +
        '<div class="row-btns"><button class="btn post" type="button" data-go="stand">Zurück zu „Wo stehe ich?“</button>' +
        '<button class="btn ghost" type="button" id="pr-again">Noch einmal</button></div>',
        { here: "stand" }
      );
      document.getElementById("pr-again").addEventListener("click", function () { KH.view.practice(ep, key); });
    });
  };
})(window);
