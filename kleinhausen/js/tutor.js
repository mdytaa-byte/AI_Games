/* Tutor-Brief: tell the AI tutor where this student is.
   - KH.tutorBrief(): one student's position, skills, weak spots, words, town memory.
     The student sees the full text before it leaves the page.
   - KH.tutorGuide(): the teacher's one-time standing instructions for the tutor.
   Off during IPAs and in Prüfungsmodus. */
(function (global) {
  const KH = global.KH = global.KH || {};

  function cfg() {
    return KH.TUTOR || { name: "KI-Tutor", url: "", prefill: "" };
  }

  function epLabel(m) {
    return "Episode " + m.n + " „" + m.title + "“ (" + m.titleLong + ")";
  }

  /* The episode the student is in, or the first one not yet stamped. */
  /* inScene: opened from an episode header, so KH.currentEpisode is live. */
  function currentMod(inScene) {
    if (inScene && KH.currentEpisode && KH.mod(KH.currentEpisode)) return KH.mod(KH.currentEpisode);
    const open = (KH.MODULES || []).find(function (m) { return KH.state.episodes[m.id].status === "open"; });
    if (open) return open;
    const done = (KH.MODULES || []).filter(function (m) { return KH.state.episodes[m.id].status === "done"; });
    return done.length ? done[done.length - 1] : KH.MODULES[0];
  }

  function sceneLine(mod, inScene) {
    const st = KH.state.episodes[mod.id];
    if (!inScene || st.status === "done") return null;
    const scene = mod.scenes[st.scene || 0];
    if (!scene) return null;
    const title = scene.title || (scene.npc && KH.NPCS[scene.npc] ? "Gespräch mit " + KH.NPCS[scene.npc].name : scene.type);
    return "Szene " + ((st.scene || 0) + 1) + " von " + mod.scenes.length + ": „" + title + "“ (" + scene.type + ")";
  }

  KH.tutorBlocked = function (inScene) {
    if (KH.state.player.exam) return "Prüfungsmodus ist an — der Tutor ist aus.";
    if (inScene && KH.currentEpisode) {
      const mod = KH.mod(KH.currentEpisode);
      const st = KH.state.episodes[KH.currentEpisode];
      const scene = mod && mod.scenes[st.scene || 0];
      if (scene && scene.type === "ipa") return "Während der IPA hilft der Tutor nicht. Danach gern.";
    }
    return null;
  };

  function bullet(list) {
    return list.length ? list.map(function (x) { return "- " + x; }).join("\n") : "- —";
  }

  KH.tutorBrief = function (opts) {
    opts = opts || {};
    const p = KH.state.player;
    const mod = currentMod(opts.inScene);
    const st = KH.state.episodes[mod.id];
    const done = KH.MODULES.filter(function (m) { return KH.state.episodes[m.id].status === "done"; });
    const known = Math.max(mod.n, done.length);
    const lines = [];

    lines.push("KLEINHAUSEN · TUTOR-BRIEF");
    lines.push("Stand: " + new Date().toLocaleDateString("de-DE") + " · Ziel: ACTFL Novice High");
    lines.push("");
    lines.push("## Wer");
    lines.push((p.vorname || "Gast") + " · " + (KH.rolleNoun ? KH.rolleNoun() : "Gastschüler/in") + " aus " + (p.herkunft || "?") +
      " · Rang in der Stadt: " + KH.residentRank().de);
    const access = [];
    if (p.accommodation) access.push("Nachteilsausgleich: spricht als Text statt Aufnahme");
    if (p.font === "lesbar" || (p.size && p.size !== "m")) access.push("braucht gut lesbaren, kurzen Text");
    if (access.length) lines.push("Hinweise: " + access.join("; "));

    lines.push("");
    lines.push("## Wo in der Geschichte");
    lines.push(done.length + " von 16 Episoden gestempelt. Jetzt: " + epLabel(mod) + " — " +
      (st.status === "done" ? "fertig" : st.status === "open" ? "offen" : "noch zu") + ".");
    const sl = sceneLine(mod, opts.inScene);
    if (sl) lines.push("Gerade in " + sl + ".");
    lines.push("Can-Do dieser Episode: " + mod.canDo.map(function (c) { return c.de; }).join(" / "));
    lines.push("Grammatik dieser Episode: " + mod.grammar);
    lines.push("Wortschatz dieser Episode: " + mod.vocab.join(", "));
    lines.push("KEINE SPOILER: Kennt Episoden 1–" + known + ". Nichts aus Episode " + (known + 1) + "–16 verraten. Wortschatz möglichst bis Episode " + known + ".");

    if (KH.skillReport) {
      const rep = KH.skillReport();
      lines.push("");
      lines.push("## Fertigkeiten (Schätzung aus Auto-Scores, keine Note)");
      lines.push(bullet(rep.map(function (s) {
        if (s.recent == null) return s.de + ": noch keine Daten";
        return s.de + ": " + s.level.de + (s.level.note ? " (" + s.level.note + ")" : "") + ", zuletzt " + s.recent + " %" +
          (s.trend > 0 ? ", steigt" : s.trend < 0 ? ", fällt" : "");
      })));
      if (rep.some(function (s) { return s.id === "sprechen" && s.recent != null; })) {
        lines.push("(Sprechen misst nur, ob die gewählte Antwort passt — nicht Aussprache oder Flüssigkeit.)");
      }
    }

    const spots = KH.weakSpots ? KH.weakSpots() : [];
    const focus = opts.focus != null && spots[opts.focus] ? spots[opts.focus] : null;
    if (spots.length) {
      lines.push("");
      lines.push("## Schwachstellen");
      lines.push(bullet(spots.map(function (sp) {
        const m = KH.mod(sp.worst.ep);
        const sc = KH.sceneAt ? KH.sceneAt(sp.worst.ep, sp.worst.key) : null;
        return sp.skill.de + " in Episode " + sp.eps.map(function (e) { return parseInt(e.slice(1), 10); }).join(", ") + ": " + sp.score +
          " % — am schwersten „" + ((sc && sc.title) || m.title) + "“ (" + sp.worst.s + " %)";
      })));
    }

    const rated = KH.state.cando || {};
    const gaps = [];
    KH.MODULES.forEach(function (m) {
      m.canDo.forEach(function (c, i) {
        const r = rated[m.id + "." + i];
        const es = KH.state.episodes[m.id].summative;
        if (r === 0 || r === 1) gaps.push(c.de + " (selbst: " + (r === 0 ? "noch nicht" : "mit Hilfe") + ", E" + m.n + ")");
        else if (r === 2 && es && es.score < 60) gaps.push(c.de + " (selbst: kann ich — Aufgaben: üben, E" + m.n + ")");
      });
    });
    if (gaps.length) {
      lines.push("");
      lines.push("## Kann-Sätze, die noch wackeln");
      lines.push(bullet(gaps.slice(0, 6)));
    }

    const words = KH.state.words || {};
    const shaky = Object.keys(words).filter(function (id) { return words[id].w > 0 || (words[id].n > 0 && words[id].b <= 1); })
      .sort(function (a, b) { return (words[b].w - words[a].w) || (words[a].b - words[b].b); })
      .slice(0, 10)
      .map(function (id) { const i = KH.wordInfo && KH.wordInfo(id); return i ? i.de + " (" + i.en + ")" : null; })
      .filter(Boolean);
    if (Object.keys(words).length) {
      const ws = KH.wordStats ? KH.wordStats() : { total: 0, known: 0, due: 0 };
      lines.push("");
      lines.push("## Wörter");
      lines.push(ws.total + " im Wortschatz, " + ws.known + " sicher, " + ws.due + " heute fällig.");
      if (shaky.length) lines.push("Wackelig: " + shaky.join(", "));
    }

    const g = KH.state.grammar || {};
    const passed = Object.keys(g.check || {}).filter(function (k) { return g.check[k] === "ok"; });
    const tried = Object.keys(g.check || {}).filter(function (k) { return g.check[k] === "tried"; });
    if (passed.length || tried.length) {
      const t = function (id) { const c = KH.grammarCard && KH.grammarCard(id); return c ? c.title : id; };
      lines.push("");
      lines.push("## Grammatik-Ecke");
      if (passed.length) lines.push("Kurz-Check geschafft: " + passed.map(t).join("; "));
      if (tried.length) lines.push("Kurz-Check noch nicht geschafft: " + tried.map(t).join("; "));
    }

    const mem = KH.memoryCards ? KH.memoryCards() : [];
    const trust = Object.keys(KH.state.npcs || {}).filter(function (id) { return KH.NPCS[id]; })
      .map(function (id) { return KH.NPCS[id].short + " " + (KH.state.npcs[id].trust || 0) + "/5"; });
    if (mem.length || trust.length) {
      lines.push("");
      lines.push("## Was die Stadt sich merkt (meine Entscheidungen)");
      if (mem.length) lines.push(bullet(mem.map(function (c) { return c.who + ": " + c.de; })));
      if (trust.length) lines.push("Vertrauen: " + trust.join(", "));
    }

    if (opts.writing) {
      const w = opts.writing;
      lines.push("");
      lines.push("## Schreibaufgabe: „" + (w.title || "Text") + "“");
      if (w.prompt) lines.push(String(w.prompt).replace(/<[^>]+>/g, ""));
      if (w.checklist && w.checklist.length) lines.push("Checkliste: " + w.checklist.join(" · "));
      lines.push("");
      lines.push("## Mein Entwurf");
      lines.push(String(w.text || "").slice(0, 1500));
    } else if (opts.lastText) {
      const j = (KH.state.journal || []).filter(function (x) { return x.text && x.kind !== "praxis"; }).slice(-1)[0];
      if (j) {
        lines.push("");
        lines.push("## Letzter eigener Text: „" + (j.title || "Text") + "“");
        lines.push(String(j.text).slice(0, 600));
      }
    }

    lines.push("");
    lines.push("## Bitte");
    if (opts.writing) {
      lines.push("Gib mir Feedback zu meinem Entwurf: zuerst eine Sache, die schon gut ist. Dann höchstens zwei Muster (z. B. Verbposition, Artikel): Zeig die Stelle, nenn die Regel, gib ein Beispiel aus Kleinhausen.");
      lines.push("Schreib meinen Text NICHT neu und gib mir keine fertigen Sätze — ich verbessere selbst und schicke dir die neue Version.");
    } else if (focus) {
      lines.push("Ich möchte heute üben: " + focus.skill.de + " (Episode " + focus.eps.map(function (e) { return parseInt(e.slice(1), 10); }).join(", ") + ").");
    } else if (sl) {
      lines.push("Ich hänge gerade in dieser Szene. Hilf mir, ohne die Antwort zu verraten.");
    } else {
      lines.push("Üb mit mir, was mir am meisten hilft.");
    }
    lines.push("Sprich Deutsch auf meinem Niveau, kurze Sätze, Englisch nur zur Hilfe. Nutze Orte und Personen aus Kleinhausen.");
    return lines.join("\n");
  };

  /* ---------- Student panel ---------- */

  KH.tutorPanel = function (opts) {
    opts = opts || {};
    const c = cfg();
    const blocked = KH.tutorBlocked(opts.inScene);
    const opener = document.activeElement;
    const old = document.getElementById("tutor-modal");
    if (old) old.remove();
    const wrap = document.createElement("div");
    wrap.id = "tutor-modal";
    wrap.className = "gr-modal";
    let lastText = false;
    function body() {
      if (blocked) {
        return '<p class="feedback no">' + KH.esc(blocked) + "</p>";
      }
      const brief = KH.tutorBrief({ focus: opts.focus, inScene: opts.inScene, lastText: lastText, writing: opts.writing });
      const hasText = !opts.writing && (KH.state.journal || []).some(function (x) { return x.text && x.kind !== "praxis"; });
      return "<p>Damit dein Tutor weiß, wo du stehst: Kopier diesen Brief und schick ihn als erste Nachricht. " +
        (c.url ? "Oder öffne den Tutor direkt." : "") + "</p>" +
        '<p class="en">This is everything that gets shared: your first name, your progress, your choices in the story. No recordings, no e-mail, no grades.</p>' +
        (hasText ? '<label class="tutor-opt"><input type="checkbox" id="tutor-last"' + (lastText ? " checked" : "") + "> Meinen letzten Text mitschicken (für Feedback)</label>" : "") +
        '<label class="field"><span class="sr-only">Tutor-Brief</span><textarea id="tutor-brief" class="tutor-brief" readonly rows="14" lang="de">' + KH.esc(brief) + "</textarea></label>" +
        '<div class="row-btns"><button class="btn post" type="button" id="tutor-copy">Brief kopieren</button>' +
        (c.url ? '<button class="btn" type="button" id="tutor-open">' + KH.esc(c.name) + " öffnen</button>" : "") +
        "</div><p id=\"tutor-status\" class=\"tutor-status\" aria-live=\"polite\"></p>";
    }
    function render() {
      wrap.innerHTML = '<div class="card gr-card gr-dialog" role="dialog" aria-modal="true" aria-labelledby="tutor-title" tabindex="-1">' +
        '<div class="gr-dialog-head"><div><p class="kicker">' + KH.esc(c.name) + '</p><h2 id="tutor-title">' + (opts.writing ? "Feedback zu deinem Entwurf" : "Tutor-Brief") + "</h2></div>" +
        '<button class="btn ghost" type="button" id="tutor-close">Schließen</button></div>' + body() + "</div>";
      bind();
    }
    function brief() {
      const ta = document.getElementById("tutor-brief");
      return ta ? ta.value : "";
    }
    function bind() {
      document.getElementById("tutor-close").addEventListener("click", close);
      const cb = document.getElementById("tutor-last");
      if (cb) cb.addEventListener("change", function () { lastText = cb.checked; render(); document.getElementById("tutor-last").focus(); });
      const copy = document.getElementById("tutor-copy");
      if (copy) copy.addEventListener("click", function () {
        KH.copyText(brief()).then(function (ok) {
          const s = document.getElementById("tutor-status");
          s.textContent = ok ? "Kopiert. Füg den Brief als erste Nachricht beim Tutor ein." : "Kopieren ging nicht — markier den Text und kopier ihn selbst.";
          if (!ok) document.getElementById("tutor-brief").select();
        });
      });
      const open = document.getElementById("tutor-open");
      if (open) open.addEventListener("click", function () {
        const text = brief();
        KH.copyText(text).then(function () {
          let url = c.url;
          if (c.prefill) url += (url.indexOf("?") >= 0 ? "&" : "?") + encodeURIComponent(c.prefill) + "=" + encodeURIComponent(text);
          window.open(url, "_blank", "noopener");
          document.getElementById("tutor-status").textContent = c.prefill
            ? "Tutor geöffnet — der Brief steht schon in der ersten Nachricht."
            : "Tutor geöffnet und Brief kopiert. Dort einfügen (Strg/Cmd + V).";
        });
      });
    }
    function close() {
      wrap.remove();
      if (opener && opener.focus) opener.focus();
    }
    wrap.addEventListener("click", function (e) { if (e.target === wrap) close(); });
    wrap.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (e.key === "Escape") close();
    });
    document.body.appendChild(wrap);
    render();
    wrap.querySelector(".gr-dialog").focus();
  };

  /* ---------- Teacher: standing instructions for the tutor ---------- */

  KH.tutorGuide = function () {
    const out = [];
    out.push("# Kleinhausen — Anleitung für den KI-Tutor");
    out.push("");
    out.push("You are the tutor for **Kleinhausen**, a story-based first-year German course (16 episodes, target ACTFL Novice High). " +
      "The student lives in the small German town of Kleinhausen as an exchange student with the Fröhlich family, in first person.");
    out.push("");
    out.push("## How to use the Tutor-Brief");
    out.push("Students start a conversation by pasting a block that begins with `KLEINHAUSEN · TUTOR-BRIEF`. It tells you:");
    out.push("- **Wo in der Geschichte**: the current episode (and scene, if they are stuck in one), its can-do goals, grammar and words.");
    out.push("- **KEINE SPOILER**: the highest episode they know. Never reveal events, characters' decisions or outcomes from later episodes.");
    out.push("- **Fertigkeiten / Schwachstellen**: estimates from auto-scores. Use them to choose what to practise; never present them as grades.");
    out.push("- **Wörter / Grammatik-Ecke**: shaky words and grammar cards not yet mastered. Weave them into practice.");
    out.push("- **Was die Stadt sich merkt**: choices the student made (e.g. how they treated Frau Haller). Characters can remember these.");
    out.push("- **Bitte**: what they want right now. If they are stuck in a scene, give hints and model sentences, not the answer.");
    out.push("- **Schreibaufgabe / Mein Entwurf**: a draft for feedback. Name one thing that works, then at most two patterns (quote the spot, give the rule, show a Kleinhausen example). Never rewrite the draft or hand over finished sentences; ask them to revise and send the new version. Drafts only come from ungraded practice; graded writing never reaches you.");
    out.push("If there is no brief, ask which episode they are on before going further.");
    out.push("");
    out.push("## Rules");
    out.push("- Speak German at Novice level: short sentences, high-frequency words, the course's vocabulary up to their episode. Use English only to explain or when asked.");
    out.push("- Stay in the world: use Kleinhausen places and people (below). You may role-play a character for practice, clearly as practice.");
    out.push("- Correct one or two patterns at a time, not every error. Gender/case errors are normal at Novice High.");
    out.push("- Never complete graded work for them: no finished IPA answers, no writing their e-mail or speech. Coach instead.");
    out.push("- Explain grammar with the Grammatik-Ecke cards below and reuse their story examples.");
    out.push("");
    out.push("## Course map (no plot — goals only)");
    (KH.MODULES || []).forEach(function (m) {
      out.push("### Episode " + m.n + ": " + m.title + " — " + m.titleLong);
      out.push("Can-do: " + m.canDo.map(function (c) { return c.en; }).join(" / "));
      out.push("Grammar: " + m.grammar);
      out.push("Words: " + m.vocab.join(", "));
      out.push("");
    });
    out.push("## People in Kleinhausen");
    Object.keys(KH.NPCS || {}).forEach(function (id) {
      const n = KH.NPCS[id];
      out.push("- **" + n.name + "**" + (n.role ? " (" + n.role + ")" : "") + ": " + (n.bio || ""));
    });
    out.push("");
    out.push("## The town's question");
    out.push(KH.STORY ? KH.STORY.throughline + " " + KH.STORY.conflict : "");
    out.push("");
    if (KH.grammarText) out.push(KH.grammarText().replace(/^# .*\n/, "## Grammatik-Ecke\n"));
    return out.join("\n");
  };
})(window);
