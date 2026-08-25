/* Scene renderer: narration, dialogue, reading, listening, writing, speaking, rooms, IPA. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.scoreWrite = function (text, rubric) {
    const hits = (rubric.needles || []).filter(function (n) {
      return KH.containsAny(text, Array.isArray(n) ? n : [n]);
    }).length;
    const min = rubric.minChars || 40;
    const longEnough = (text || "").trim().length >= min;
    const total = (rubric.needles || []).length + 1;
    const score = Math.round(((hits + (longEnough ? 1 : 0)) / total) * 100);
    return { score: score, hits: hits, longEnough: longEnough };
  };

  KH.mountScene = function (root, scene, done) {
    root.innerHTML = "";
    const box = document.createElement("div");
    box.className = "scene-stage";
    root.appendChild(box);
    const type = scene.type || "narrate";
    const fn = KH.scenes[type] || KH.scenes.narrate;
    fn(box, scene, done);
  };

  function continueBtn(label, fn) {
    const row = document.createElement("div");
    row.className = "row-btns";
    const b = document.createElement("button");
    b.className = "btn post";
    b.type = "button";
    b.textContent = label || "Weiter";
    b.addEventListener("click", fn);
    row.appendChild(b);
    return row;
  }

  function ttsBar(text) {
    const wrap = document.createElement("div");
    wrap.className = "row-btns";
    const play = document.createElement("button");
    play.className = "btn ghost";
    play.type = "button";
    play.textContent = "Vorlesen";
    play.addEventListener("click", function () { KH.speak(text); });
    const slow = document.createElement("button");
    slow.className = "btn ghost";
    slow.type = "button";
    slow.textContent = "Langsam";
    slow.addEventListener("click", function () {
      const old = KH.state.player.ttsRate;
      KH.state.player.ttsRate = 0.7;
      KH.speak(text);
      KH.state.player.ttsRate = old;
    });
    wrap.appendChild(play);
    wrap.appendChild(slow);
    return wrap;
  }

  function gloss(de, en) {
    const s = document.createElement("div");
    s.innerHTML = "<p>" + de + "</p>" + (en ? '<p class="en">' + en + "</p>" : "");
    return s;
  }

  function optionList(container, options, onPick) {
    const list = document.createElement("div");
    list.className = "options";
    list.setAttribute("role", "group");
    list.setAttribute("aria-label", "Antworten");
    const keys = ["1", "2", "3", "4", "5", "6"];
    const unbind = KH.bindKeys({
      "1": function () { click(0); },
      "2": function () { click(1); },
      "3": function () { click(2); },
      "4": function () { click(3); }
    });
    let used = false;
    function click(i) {
      if (used || !options[i]) return;
      const btn = list.children[i];
      if (btn) btn.click();
    }
    options.forEach(function (opt, i) {
      const b = document.createElement("button");
      b.className = "opt";
      b.type = "button";
      b.innerHTML = '<span class="key">' + keys[i] + "</span>" + KH.esc(opt.de) +
        (opt.en ? '<span class="en">' + KH.esc(opt.en) + "</span>" : "");
      b.addEventListener("click", function () {
        if (used && opt.oneShot !== false) return;
        used = true;
        unbind();
        Array.prototype.forEach.call(list.children, function (c) { c.disabled = true; });
        const ok = opt.ok !== false && opt.ok !== "wrong";
        const kind = opt.ok === true || opt.ok === "good" ? "right" : (opt.ok === "ok" ? "right" : "wrong");
        b.classList.add(kind === "right" ? "right" : "wrong");
        onPick(opt, ok || opt.ok === "ok");
      });
      list.appendChild(b);
    });
    container.appendChild(list);
    return unbind;
  }

  function feedbackEl(opt) {
    const f = document.createElement("div");
    const good = opt.ok === true || opt.ok === "good" || opt.ok === "ok";
    f.className = "feedback " + (good ? "ok" : "no");
    f.innerHTML = (opt.feedback || (good ? "Genau." : "Noch einmal denken.")) +
      (opt.feedbackEn ? '<span class="en">' + opt.feedbackEn + "</span>" : "");
    KH.live(opt.feedback || "");
    return f;
  }

  KH.scenes = {};

  KH.scenes.narrate = function (box, scene, done) {
    const art = document.createElement("article");
    art.className = "card narrate";
    if (scene.kicker) {
      const k = document.createElement("p");
      k.className = "kicker";
      k.textContent = scene.kicker;
      art.appendChild(k);
    }
    if (scene.title) {
      const h = document.createElement("h2");
      h.textContent = scene.title;
      art.appendChild(h);
    }
    (scene.paras || [scene.de]).forEach(function (p) {
      const el = document.createElement("p");
      el.innerHTML = p;
      art.appendChild(el);
    });
    if (scene.en) {
      const e = document.createElement("p");
      e.className = "en";
      e.textContent = scene.en;
      art.appendChild(e);
    }
    box.appendChild(art);
    box.appendChild(ttsBar((scene.paras || [scene.de]).join(" ")));
    box.appendChild(continueBtn(scene.nextLabel, function () { done({ kind: "narrate" }); }));
  };

  KH.scenes.dialogue = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "card";
    const npc = KH.NPCS[scene.npc] || { name: scene.who || "jemand", initials: "?", color: "#888" };
    const row = document.createElement("div");
    row.className = "npc-row";
    row.innerHTML = '<div class="portrait" style="background:' + npc.color + ';color:#fff" aria-hidden="true">' +
      KH.esc(npc.initials) + "</div>";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = '<div class="who">' + KH.esc(npc.name) + "</div><p>" + (scene.line || "") + "</p>" +
      (scene.lineEn ? '<p class="en">' + scene.lineEn + "</p>" : "");
    row.appendChild(bubble);
    card.appendChild(row);
    if (scene.prompt) {
      const p = document.createElement("p");
      p.style.marginTop = "14px";
      p.innerHTML = "<strong>Du sagst:</strong> " + scene.prompt +
        (scene.promptEn ? '<span class="en">' + scene.promptEn + "</span>" : "");
      card.appendChild(p);
    }
    box.appendChild(card);
    box.appendChild(ttsBar(scene.line || ""));
    optionList(box, scene.options, function (opt) {
      box.appendChild(feedbackEl(opt));
      if (opt.trust) KH.trust(scene.npc, opt.trust);
      const follow = KH.followUpFor(scene, opt);
      const ok = opt.ok === true || opt.ok === "good" || opt.ok === "ok";
      function finishOral(res) {
        done({
          kind: "dialogue",
          ok: ok,
          spoken: !!(res && (res.mode === "record" || res.mode === "text")),
          data: opt.id || opt.de
        });
      }
      if (!KH.voiceOnSpine || !KH.voiceOnSpine()) {
        box.appendChild(continueBtn("Weiter", function () { finishOral({ mode: "skip" }); }));
        return;
      }
      KH.mountOralGate(box, {
        npc: scene.npc,
        followUp: follow,
        line: opt.de,
        title: (npc.name || "Gespräch") + (scene.ipa ? " · IPA" : ""),
        kind: scene.ipa ? "ipa-inter" : "dialogue",
        ep: KH.currentEpisode,
        minChars: 40
      }, finishOral);
    });
  };

  KH.scenes.read = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "card";
    const k = document.createElement("p");
    k.className = "kicker";
    k.textContent = scene.kicker || "Lesen · Interpretive";
    card.appendChild(k);
    const h = document.createElement("h2");
    h.textContent = scene.title || "Lies den Text";
    card.appendChild(h);
    const doc = document.createElement("div");
    doc.className = "authentic " + (scene.style || "");
    doc.innerHTML = scene.html || ("<p>" + (scene.de || "") + "</p>");
    card.appendChild(doc);
    if (scene.en) {
      const e = document.createElement("p");
      e.className = "en";
      e.textContent = scene.en;
      card.appendChild(e);
    }
    box.appendChild(card);
    box.appendChild(ttsBar(scene.plain || scene.de || doc.textContent));
    askQuestions(box, scene.questions, done, "read");
  };

  KH.scenes.listen = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = '<p class="kicker">Hören · Interpretive</p><h2>' + KH.esc(scene.title || "Hör zu") + "</h2>" +
      "<p>" + (scene.intro || "Hör die Aufnahme. Du kannst sie mehrmals und langsamer hören — ohne Transkript.") + "</p>" +
      (scene.introEn ? '<p class="en">' + scene.introEn + "</p>" : "");
    box.appendChild(card);
    const audioText = scene.audio;
    const qHost = document.createElement("div");
    qHost.className = "listen-questions is-locked";
    const lockNote = document.createElement("p");
    lockNote.className = "listen-lock-note";
    lockNote.textContent = "Fragen nach dem ersten Hören. Tempo ½ ist erlaubt. Transkript ist kein Tempo.";
    qHost.appendChild(lockNote);
    let unlocked = false;
    function unlock() {
      if (unlocked) return;
      unlocked = true;
      qHost.classList.remove("is-locked");
      if (lockNote.parentNode) lockNote.remove();
      askQuestions(qHost, scene.questions, done, "listen");
    }
    if (KH.mountListenPlayer) {
      KH.mountListenPlayer(box, scene, unlock);
    } else {
      box.appendChild(ttsBar(audioText));
      unlock();
    }
    const cap = document.createElement("button");
    cap.className = "btn ghost";
    cap.type = "button";
    cap.textContent = "Transkript";
    const pre = document.createElement("pre");
    pre.className = "authentic signage hidden";
    pre.style.whiteSpace = "pre-wrap";
    pre.textContent = audioText;
    cap.addEventListener("click", function () {
      if (KH.state.player.exam && !KH.state.player.captions) {
        KH.live("Im Prüfungsmodus ist das Transkript aus.");
        return;
      }
      pre.classList.toggle("hidden");
      cap.setAttribute("aria-expanded", pre.classList.contains("hidden") ? "false" : "true");
    });
    if (KH.state.player.captions && !KH.state.player.exam) pre.classList.remove("hidden");
    box.appendChild(cap);
    box.appendChild(pre);
    box.appendChild(qHost);
    if (KH.state.player.captions && !KH.state.player.exam) unlock();
  };

  function askQuestions(box, questions, done, kind) {
    if (!questions || !questions.length) {
      box.appendChild(continueBtn("Weiter", function () { done({ kind: kind, ok: true }); }));
      return;
    }
    const wrap = document.createElement("div");
    wrap.className = "q-list";
    let remaining = questions.length;
    let correct = 0;
    questions.forEach(function (q, qi) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = "<p><strong>" + (qi + 1) + ".</strong> " + q.de + "</p>" +
        (q.en ? '<p class="en">' + q.en + "</p>" : "");
      if (q.options) {
        optionList(card, q.options, function (opt) {
          card.appendChild(feedbackEl(opt));
          if (opt.ok === true || opt.ok === "good") correct += 1;
          remaining -= 1;
          maybeDone();
        });
      } else {
        const input = document.createElement("input");
        input.type = "text";
        input.setAttribute("aria-label", q.de);
        const okb = document.createElement("button");
        okb.className = "btn";
        okb.type = "button";
        okb.textContent = "Prüfen";
        okb.addEventListener("click", function () {
          const hit = KH.containsAny(input.value, q.needles || []);
          const f = document.createElement("div");
          f.className = "feedback " + (hit ? "ok" : "no");
          f.textContent = hit ? (q.okText || "Genau.") : (q.hint || "Schau noch einmal in den Text.");
          card.appendChild(f);
          input.disabled = true;
          okb.disabled = true;
          if (hit) correct += 1;
          remaining -= 1;
          maybeDone();
        });
        card.appendChild(input);
        card.appendChild(okb);
      }
      wrap.appendChild(card);
    });
    box.appendChild(wrap);
    function maybeDone() {
      if (remaining > 0) return;
      box.appendChild(continueBtn("Weiter", function () {
        done({ kind: kind, ok: correct >= Math.ceil(questions.length * 0.6), score: Math.round((correct / questions.length) * 100), correct: correct, total: questions.length });
      }));
    }
  }

  KH.scenes.match = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = '<p class="kicker">Wortschatz</p><h2>' + KH.esc(scene.title || "Was passt?") + "</h2>";
    box.appendChild(card);
    const pairs = scene.pairs || [];
    const rights = KH.shuffle(pairs.map(function (p) { return p.right; }));
    const form = document.createElement("div");
    form.className = "match-grid";
    const selects = [];
    pairs.forEach(function (p, i) {
      const row = document.createElement("div");
      row.className = "match-pair";
      const left = document.createElement("div");
      left.innerHTML = "<strong>" + KH.esc(p.left) + "</strong>" + (p.leftEn ? '<span class="en">' + KH.esc(p.leftEn) + "</span>" : "");
      const sel = document.createElement("select");
      sel.setAttribute("aria-label", p.left);
      sel.innerHTML = '<option value="">—</option>' + rights.map(function (r) {
        return '<option value="' + KH.esc(r) + '">' + KH.esc(r) + "</option>";
      }).join("");
      selects.push({ sel: sel, answer: p.right });
      row.appendChild(left);
      row.appendChild(sel);
      form.appendChild(row);
    });
    box.appendChild(form);
    const chk = document.createElement("button");
    chk.className = "btn post";
    chk.type = "button";
    chk.textContent = "Prüfen";
    chk.addEventListener("click", function () {
      let n = 0;
      selects.forEach(function (s) {
        const ok = s.sel.value === s.answer;
        s.sel.style.borderColor = ok ? "var(--moss)" : "var(--warn)";
        if (ok) n += 1;
      });
      chk.disabled = true;
      box.appendChild(continueBtn("Weiter", function () {
        done({ kind: "match", ok: n === pairs.length, score: Math.round((n / pairs.length) * 100), correct: n, total: pairs.length });
      }));
    });
    box.appendChild(chk);
  };

  KH.scenes.cloze = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = '<p class="kicker">Grammatik / Wortschatz</p><h2>' + KH.esc(scene.title || "Lücken") + "</h2>";
    box.appendChild(card);
    const gaps = scene.gaps || [];
    const line = document.createElement("p");
    line.style.fontSize = "1.15rem";
    const inputs = [];
    (scene.parts || []).forEach(function (part) {
      if (part.gap != null) {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.size = 10;
        inp.setAttribute("aria-label", "Lücke " + (part.gap + 1));
        inputs.push({ inp: inp, answers: gaps[part.gap] });
        line.appendChild(inp);
      } else {
        line.appendChild(document.createTextNode(part.t));
      }
    });
    box.appendChild(line);
    const chk = document.createElement("button");
    chk.className = "btn post";
    chk.type = "button";
    chk.textContent = "Prüfen";
    chk.addEventListener("click", function () {
      let n = 0;
      inputs.forEach(function (g) {
        const ok = KH.containsAny(g.inp.value, g.answers);
        g.inp.style.borderColor = ok ? "var(--moss)" : "var(--warn)";
        if (ok) n += 1;
      });
      chk.disabled = true;
      box.appendChild(continueBtn("Weiter", function () {
        done({ kind: "cloze", ok: n >= inputs.length - 1, score: Math.round((n / inputs.length) * 100) });
      }));
    });
    box.appendChild(chk);
  };

  KH.scenes.write = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = '<p class="kicker">Schreiben · Presentational</p><h2>' + KH.esc(scene.title || "Schreib!") + "</h2>" +
      "<p>" + (scene.prompt || "") + "</p>" +
      (scene.promptEn ? '<p class="en">' + scene.promptEn + "</p>" : "");
    if (scene.checklist) {
      const ul = document.createElement("ul");
      scene.checklist.forEach(function (c) {
        const li = document.createElement("li");
        li.textContent = c;
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }
    const ta = document.createElement("textarea");
    ta.id = "write-area";
    ta.setAttribute("aria-label", scene.title || "Dein Text");
    card.appendChild(ta);
    box.appendChild(card);
    const go = document.createElement("button");
    go.className = "btn post";
    go.type = "button";
    go.textContent = "Feedback holen";
    go.addEventListener("click", function () {
      const r = KH.scoreWrite(ta.value, scene.rubric || {});
      const f = document.createElement("div");
      f.className = "feedback " + (r.score >= 60 ? "ok" : "no");
      f.innerHTML = "Automatisches Feedback: " + r.score +
        " / 100. " + (r.longEnough ? "Länge ist okay. " : "Schreib bitte etwas länger. ") +
        "Treffer: " + r.hits + "." +
        '<span class="en">This is a first-pass check. Your teacher can still score with the rubric.</span>';
      box.appendChild(f);
      KH.state.journal.push({ at: Date.now(), ep: scene.ep || "", title: scene.title, text: ta.value, score: r.score });
      KH.save();
      go.disabled = true;
      box.appendChild(continueBtn("Weiter", function () {
        done({ kind: "write", ok: r.score >= 60, score: r.score, text: ta.value });
      }));
    });
    box.appendChild(go);
  };

  KH.scenes.speak = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = '<p class="kicker">Sprechen · Presentational / Interpersonal</p><h2>' +
      KH.esc(scene.title || "Sag es laut") + "</h2><p>" + (scene.prompt || "") + "</p>" +
      (scene.promptEn ? '<p class="en">' + scene.promptEn + "</p>" : "");
    box.appendChild(card);
    if (scene.model) {
      const m = document.createElement("button");
      m.className = "btn ghost";
      m.type = "button";
      m.textContent = "Modell hören";
      m.addEventListener("click", function () { KH.speak(scene.model); });
      box.appendChild(m);
    }
    function finishSpeak(opt, res) {
      const ok = !opt || opt.ok === true || opt.ok === "good" || opt.ok === "ok";
      done({
        kind: "speak",
        ok: ok,
        spoken: !!(res && (res.mode === "record" || res.mode === "text")),
        text: res && res.text
      });
    }
    function gate(line, opt) {
      const follow = KH.followUpFor(scene, opt);
      KH.mountOralGate(box, {
        npc: scene.npc,
        followUp: follow,
        line: line || scene.model || scene.prompt || "",
        title: scene.title || "Sprechen",
        kind: scene.ipa ? "ipa-present" : "speak",
        ep: KH.currentEpisode,
        label: scene.options
          ? "Sag die gewählte Linie laut und antworte auf die Nachfrage."
          : "Sprich den Auftrag. Mindestens fünfzehn Sekunden — ein Klick reicht nicht.",
        minChars: 50
      }, function (res) { finishSpeak(opt, res); });
    }
    if (scene.options) {
      optionList(box, scene.options, function (opt) {
        box.appendChild(feedbackEl(opt));
        if (!KH.voiceOnSpine || !KH.voiceOnSpine()) {
          if (opt.ok === true || opt.ok === "good" || opt.ok === "ok") KH.addPoints("sprechen", 4);
          KH.addPoints("mut", 2);
          box.appendChild(continueBtn("Weiter", function () { finishSpeak(opt, { mode: "skip" }); }));
          return;
        }
        gate(opt.de, opt);
      });
      return;
    }
    if (!KH.voiceOnSpine || !KH.voiceOnSpine()) {
      box.appendChild(continueBtn("Weiter", function () { finishSpeak(null, { mode: "skip" }); }));
      return;
    }
    gate(scene.model || "", null);
  };

  KH.scenes.culture = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "culture";
    card.innerHTML = '<p class="kicker">Kultur · Kleinhausen &amp; Deutschland</p><h2>' +
      KH.esc(scene.title) + "</h2>" + (scene.html || ("<p>" + scene.de + "</p>")) +
      (scene.en ? '<p class="en">' + scene.en + "</p>" : "");
    box.appendChild(card);
    KH.addPoints("kultur", 3);
    box.appendChild(continueBtn("Verstanden", function () { done({ kind: "culture", ok: true }); }));
  };

  KH.scenes.room = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = '<p class="kicker">Erkunden</p><h2>' + KH.esc(scene.title || "Schau dich um") + "</h2>" +
      "<p>" + (scene.intro || "Klicke auf Gegenstände. Lerne die Wörter.") + "</p>" +
      '<p class="lowfi-note">Low-fi: die Gegenstände sind eine Liste, keine Illustration.</p>';
    box.appendChild(card);
    const room = document.createElement("div");
    room.className = "room hi-only";
    room.setAttribute("role", "application");
    room.setAttribute("aria-label", scene.title || "Zimmer");
    const found = {};
    const spots = scene.hotspots || [];
    spots.forEach(function (h, i) {
      const b = document.createElement("button");
      b.className = "hotspot";
      b.type = "button";
      b.style.left = h.x + "%";
      b.style.top = h.y + "%";
      b.textContent = String(i + 1);
      b.setAttribute("aria-label", h.label);
      b.addEventListener("click", function () { reveal(h, i); });
      room.appendChild(b);
    });
    box.appendChild(room);
    const list = document.createElement("div");
    list.className = "hotspot-list";
    spots.forEach(function (h, i) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = (i + 1) + " · " + h.label;
      b.addEventListener("click", function () { reveal(h, i); });
      list.appendChild(b);
    });
    box.appendChild(list);
    const info = document.createElement("div");
    info.className = "feedback";
    info.textContent = "Wähle einen Gegenstand.";
    box.appendChild(info);
    function reveal(h, i) {
      found[i] = true;
      info.innerHTML = "<strong>" + KH.esc(h.label) + "</strong> — " + h.de +
        (h.en ? '<span class="en">' + h.en + "</span>" : "");
      KH.speak(h.label + ". " + (h.de || ""));
      KH.live(h.label);
      if (Object.keys(found).length >= spots.length && !room.dataset.done) {
        room.dataset.done = "1";
        box.appendChild(continueBtn("Ich kenne mein Zimmer", function () {
          done({ kind: "room", ok: true });
        }));
      }
    }
  };

  KH.scenes.activity = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = '<p class="kicker">Praxis in der Stadt</p><h2>' + KH.esc(scene.title) + "</h2>" +
      "<p>" + (scene.de || "") + "</p>" +
      (scene.en ? '<p class="en">' + scene.en + "</p>" : "") +
      "<p>Das Minispiel öffnet sich hier. Wenn du fertig bist, komm zurück und markiere die Aufgabe.</p>";
    box.appendChild(card);
    const frame = document.createElement("iframe");
    frame.className = "activity-frame";
    frame.title = scene.title;
    const q = new URLSearchParams({
      kh: "1",
      weather: KH.weatherKey ? KH.weatherKey() : "overcast",
      name: KH.state.player.vorname || "",
      gfx: KH.state.player.gfx || "high"
    });
    const src = scene.src + (scene.src.indexOf("?") >= 0 ? "&" : "?") + q.toString();
    frame.src = src;
    box.appendChild(frame);
    const note = document.createElement("p");
    note.className = "praxis-weather";
    note.textContent = "Dasselbe Wetter und derselbe Name wie in der Stadt — wenn du fertig bist, zählt die Praxis für den Kurs.";
    box.appendChild(note);
    const row = document.createElement("div");
    row.className = "row-btns";
    const open = document.createElement("a");
    open.className = "btn ghost";
    open.href = src;
    open.target = "_blank";
    open.rel = "noopener";
    open.textContent = "In neuem Tab öffnen";
    const doneBtn = document.createElement("button");
    doneBtn.className = "btn post";
    doneBtn.type = "button";
    doneBtn.textContent = "Aufgabe erledigt — zurück in die Geschichte";
    let finished = false;
    function finishActivity() {
      if (finished) return;
      finished = true;
      window.removeEventListener("message", onMsg);
      KH.addPoints("verstehen", scene.points || 8);
      KH.state.praxis = KH.state.praxis || {};
      KH.state.praxis[scene.src] = { at: Date.now(), weather: q.get("weather") };
      KH.save();
      done({ kind: "activity", ok: true });
    }
    function onMsg(ev) {
      if (!ev.data || ev.data.type !== "kh-praxis") return;
      if (ev.data.event === "done" || ev.data.event === "exit") finishActivity();
    }
    window.addEventListener("message", onMsg);
    doneBtn.addEventListener("click", finishActivity);
    row.appendChild(open);
    row.appendChild(doneBtn);
    box.appendChild(row);
  };

  KH.scenes.ipa = function (box, scene, done) {
    const intro = document.createElement("div");
    intro.className = "card";
    intro.innerHTML = '<p class="kicker">Summative Aufgabe · IPA</p><h2>' +
      KH.esc(scene.title || "Drei Modi") + "</h2>" +
      "<p>Interpretive, Interpersonal, Presentational — wie im echten Leben. Das zählt für deinen Stempel.</p>" +
      '<div class="ipa-box">' +
      '<div class="ipa-card"><div class="mode">Interpretive</div>Lesen / Hören</div>' +
      '<div class="ipa-card"><div class="mode">Interpersonal</div>Dialog</div>' +
      '<div class="ipa-card"><div class="mode">Presentational</div>Schreiben / Sprechen</div></div>';
    box.appendChild(intro);
    const host = document.createElement("div");
    box.appendChild(host);
    const parts = [
      Object.assign({ type: scene.interpretive.type || "read" }, scene.interpretive),
      Object.assign({ type: "dialogue", ipa: true, ipaPart: "interpersonal" }, scene.interpersonal),
      Object.assign({ type: scene.presentational.type || "write", ipa: true, ipaPart: "presentational" }, scene.presentational)
    ];
    let i = 0;
    const scores = [];
    function nextPart() {
      if (i >= parts.length) {
        const avg = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length);
        const codeWrap = document.createElement("div");
        codeWrap.className = "card";
        codeWrap.innerHTML = "<h3>Ergebnis</h3><p>Dein vorläufiger IPA-Wert: <strong>" + avg +
          "%</strong>. Deine Lehrerin / dein Lehrer kann mündlich nachbewerten.</p>";
        box.appendChild(codeWrap);
        box.appendChild(continueBtn("Stempel holen", function () {
          done({ kind: "ipa", ok: avg >= 60, score: avg, parts: scores });
        }));
        return;
      }
      host.innerHTML = "";
      KH.mountScene(host, parts[i], function (res) {
        scores.push(typeof res.score === "number" ? res.score : (res.ok ? 100 : 50));
        i += 1;
        nextPart();
      });
    }
    nextPart();
  };

  KH.scenes.choice = KH.scenes.dialogue;

  KH.scenes.simulate = function (box, scene, done) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = '<p class="kicker">Simulation · Alltag</p><h2>' + KH.esc(scene.title || "Situation") + "</h2>" +
      "<p>" + (scene.intro || "Mach die Schritte der Reihe nach. Das ist die Stadt, nicht ein Quiz-Blatt.") + "</p>" +
      (scene.introEn ? '<p class="en">' + scene.introEn + "</p>" : "");
    box.appendChild(card);
    const host = document.createElement("div");
    box.appendChild(host);
    const steps = scene.steps || [];
    let i = 0;
    let good = 0;
    function step() {
      if (i >= steps.length) {
        box.appendChild(continueBtn("Fertig", function () {
          done({ kind: "simulate", ok: good >= Math.ceil(steps.length * 0.6), score: Math.round((good / Math.max(steps.length, 1)) * 100) });
        }));
        return;
      }
      host.innerHTML = "";
      const s = steps[i];
      const p = document.createElement("div");
      p.className = "card";
      p.innerHTML = "<p><strong>" + (s.who ? KH.esc(s.who) + ": " : "Schritt " + (i + 1) + ": ") + "</strong>" + (s.de || "") + "</p>" +
        (s.en ? '<p class="en">' + s.en + "</p>" : "");
      host.appendChild(p);
      optionList(host, s.options, function (opt) {
        host.appendChild(feedbackEl(opt));
        if (opt.ok === true || opt.ok === "good" || opt.ok === "ok") good += 1;
        const nxt = document.createElement("div");
        nxt.className = "row-btns";
        const b = document.createElement("button");
        b.className = "btn post";
        b.type = "button";
        b.textContent = "Weiter";
        b.addEventListener("click", function () { i += 1; step(); });
        nxt.appendChild(b);
        host.appendChild(nxt);
      });
    }
    step();
  };
})(window);
