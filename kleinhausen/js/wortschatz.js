/* Wortschatz: story-tied spaced review (Leitner boxes 0–5).
   Words come in when an episode is stamped and when you click things in rooms
   and places. Each card shows the line where you met the word. */
(function (global) {
  const KH = global.KH = global.KH || {};
  const DAY = 86400000;
  const INTERVAL = [0, 1, 2, 4, 8, 16];
  const KNOWN_BOX = 4;
  const SESSION_MAX = 15;

  function today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function dayKey(t) {
    const d = new Date(t);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function deck() {
    if (!KH.state.words || typeof KH.state.words !== "object") KH.state.words = {};
    return KH.state.words;
  }

  function article(de) {
    const m = /^(der|die|das) /.exec(de);
    return m ? m[1] : null;
  }

  function bare(de) {
    return de.replace(/^(der|die|das) /, "");
  }

  /* Card content: catalog words by id "e05|das Brot", collected words inline. */
  KH.wordInfo = function (id) {
    const rec = deck()[id];
    const bar = id.indexOf("|");
    const ep = id.slice(0, bar);
    const de = id.slice(bar + 1);
    const row = (KH.WORTSCHATZ[ep] || []).find(function (r) { return r[0] === de; });
    if (row) return { id: id, ep: ep, de: row[0], en: row[1], ctx: row[2], ctxEn: row[3], who: row[4] };
    if (rec && rec.de) return { id: id, ep: rec.ep || "", de: rec.de, en: rec.en, ctx: rec.ctx, ctxEn: rec.ctxEn, who: rec.who };
    return null;
  };

  function addCard(id, extra, src) {
    const d = deck();
    if (d[id]) return false;
    d[id] = Object.assign({ b: 0, due: today(), n: 0, r: 0, w: 0, at: Date.now(), src: src || "ep" }, extra || {});
    return true;
  }

  /* An episode stamp brings in that episode's words. */
  KH.addEpisodeWords = function (ep) {
    let added = 0;
    const have = {};
    Object.keys(deck()).forEach(function (id) { have[id.slice(id.indexOf("|") + 1)] = true; });
    (KH.WORTSCHATZ[ep] || []).forEach(function (r) {
      /* links, bitte, danke come back in later episodes: keep the first line. */
      if (have[r[0]]) return;
      if (addCard(ep + "|" + r[0])) added += 1;
    });
    if (added) KH.save();
    return added;
  };

  /* Older saves: stamped episodes before this tool existed. */
  KH.syncWords = function () {
    let added = 0;
    Object.keys(KH.state.episodes || {}).forEach(function (ep) {
      if (KH.state.episodes[ep].status === "done") added += KH.addEpisodeWords(ep);
    });
    return added;
  };

  function catalogId(de) {
    const eps = Object.keys(KH.WORTSCHATZ);
    for (let i = 0; i < eps.length; i++) {
      if ((KH.WORTSCHATZ[eps[i]] || []).some(function (r) { return r[0] === de; })) return eps[i] + "|" + de;
    }
    return null;
  }

  /* "Die Wörter gehören dir danach": a clicked thing becomes a card. */
  KH.collectWord = function (label, line, lineEn, who) {
    const known = catalogId(label);
    if (known) {
      if (addCard(known, null, "look")) { KH.save(); return true; }
      return false;
    }
    const en = KH.LOOK_GLOSS && KH.LOOK_GLOSS[label];
    if (!en) return false;
    const ok = addCard("look|" + label, {
      de: label,
      en: en,
      ctx: String(line || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      ctxEn: lineEn || "",
      who: who || "Kleinhausen"
    }, "look");
    if (ok) KH.save();
    return ok;
  };

  KH.wordsDue = function () {
    const now = Date.now();
    const d = deck();
    return Object.keys(d).filter(function (id) { return d[id].due <= now && KH.wordInfo(id); })
      .sort(function (a, b) { return (d[a].due - d[b].due) || (d[a].b - d[b].b); });
  };

  KH.wordStats = function (state) {
    const d = (state || KH.state).words || {};
    const ids = Object.keys(d);
    const now = Date.now();
    const days = ((state || KH.state).wordDays || []);
    return {
      total: ids.length,
      known: ids.filter(function (id) { return d[id].b >= KNOWN_BOX; }).length,
      due: ids.filter(function (id) { return d[id].due <= now; }).length,
      days: days.length
    };
  };

  /* result: "right" | "almost" | "wrong" */
  KH.gradeWord = function (id, result) {
    const c = deck()[id];
    if (!c) return;
    c.n += 1;
    if (result === "right") {
      c.r += 1;
      c.b = Math.min(5, c.b + 1);
      c.due = today() + INTERVAL[c.b] * DAY;
    } else if (result === "almost") {
      c.b = Math.max(1, c.b);
      c.due = today() + DAY;
    } else {
      c.w += 1;
      c.b = 1;
      c.due = today() + DAY;
    }
    c.last = Date.now();
    const days = KH.state.wordDays = KH.state.wordDays || [];
    const k = dayKey(Date.now());
    if (days.indexOf(k) < 0) days.push(k);
    KH.save();
  };

  /* Accept ä/ae, ß/ss, case and punctuation; flag a wrong or missing article. */
  function fold(s) {
    /* KH.norm strips umlauts, so spell them out first: Bäckerei = Baeckerei. */
    return KH.norm(String(s || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue"));
  }

  KH.checkWord = function (info, typed) {
    const want = fold(info.de);
    const got = fold(typed);
    if (!got) return "wrong";
    if (got === want) return "right";
    const art = article(info.de);
    if (art) {
      const noun = fold(bare(info.de));
      const m = /^(der|die|das|den|dem) (.+)$/.exec(got);
      const gotNoun = m ? m[2] : got;
      if (gotNoun === noun) return "almost";
    }
    return "wrong";
  };

  function clozeHtml(info, blank) {
    const target = bare(info.de);
    const ctx = KH.esc(info.ctx || "");
    if (!target) return ctx;
    /* Take the article in the line with the noun, so the gap does not give the gender away. */
    const lead = article(info.de) ? "(?:(?:der|die|das|den|dem|des) )?" : "";
    const re = new RegExp("(" + lead + target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "i");
    if (!re.test(info.ctx || "")) return ctx;
    return ctx.replace(re, blank ? '<span class="ws-blank" aria-label="Lücke">_____</span>' : '<mark class="ws-mark">$1</mark>');
  }

  function epLabel(ep) {
    const m = KH.mod && KH.mod(ep);
    return m ? "Episode " + m.n + " · " + m.title : "Unterwegs";
  }

  function boxDots(b) {
    let s = "";
    for (let i = 1; i <= 5; i++) s += '<i class="' + (i <= b ? "on" : "") + '"></i>';
    return '<span class="ws-box" aria-label="Fach ' + b + ' von 5">' + s + "</span>";
  }

  /* ---------- Overview ---------- */

  KH.view.words = function () {
    KH.syncWords();
    const st = KH.wordStats();
    const due = KH.wordsDue();
    const d = deck();
    const groups = {};
    Object.keys(d).forEach(function (id) {
      const info = KH.wordInfo(id);
      if (!info) return;
      const g = info.ep || "look";
      (groups[g] = groups[g] || []).push(info);
    });
    const order = Object.keys(KH.WORTSCHATZ).filter(function (ep) { return groups[ep]; });
    if (groups.look) order.push("look");
    const list = order.map(function (g) {
      const rows = groups[g].map(function (info) {
        const c = d[info.id];
        return '<li class="ws-row"><div><strong lang="de">' + KH.esc(info.de) + '</strong> <span class="ws-en">' + KH.esc(info.en) + "</span>" +
          '<p class="ws-ctx"><span class="ws-who">' + KH.esc(info.who) + ":</span> " + KH.esc(info.ctx) + "</p></div>" + boxDots(c.b) + "</li>";
      }).join("");
      const title = g === "look" ? "Gesehen in der Stadt" : epLabel(g);
      return '<details class="card ws-group"><summary>' + KH.esc(title) + " · " + groups[g].length + "</summary><ul>" + rows + "</ul></details>";
    }).join("");
    KH.shell(
      '<p class="kicker">Wortschatz</p><h1>Deine Wörter aus Kleinhausen</h1>' +
      '<p class="lede">Jedes Wort kommt mit dem Satz, in dem du es gehört hast. Ein Stempel bringt die Wörter der Episode. Was du in Zimmern und an Orten anklickst, kommt auch dazu.</p>' +
      '<p class="en">Five minutes a day. Words you know move up a box and come back less often; words you miss come back tomorrow.</p>' +
      '<div class="stats">' +
      stat("Fällig", st.due) + stat("Wörter", st.total) + stat("Sicher", st.known) + stat("Tage geübt", st.days) + "</div>" +
      '<div class="row-btns ws-start">' +
      (due.length
        ? '<button class="btn post" type="button" id="ws-start">Wiederholen · ' + Math.min(due.length, SESSION_MAX) + " Karten</button>"
        : '<p class="feedback ok">Heute nichts fällig. ' + (st.total ? "Komm morgen wieder." : "Hol dir in Episode 1 den ersten Stempel — dann kommen die Wörter.") + "</p>") +
      "</div>" +
      (list ? "<h2>Alle Wörter</h2>" + list : ""),
      { here: "words" }
    );
    const start = document.getElementById("ws-start");
    if (start) start.addEventListener("click", function () { KH.view.wordReview(); });
    function stat(l, v) { return '<div class="stat"><b>' + v + "</b><span>" + l + "</span></div>"; }
  };

  /* ---------- Review session ---------- */

  KH.view.wordReview = function () {
    const queue = KH.wordsDue().slice(0, SESSION_MAX);
    if (!queue.length) return KH.view.words();
    const tally = { right: 0, almost: 0, wrong: 0 };
    const missed = [];
    const retried = {};
    let i = 0;
    let unbind = null;

    function next() {
      if (unbind) { unbind(); unbind = null; }
      if (i >= queue.length) return summary();
      const id = queue[i];
      const info = KH.wordInfo(id);
      const c = deck()[id];
      if (!info || !c) { i += 1; return next(); }
      if (c.b < 2) recognize(id, info);
      else recall(id, info);
    }

    function head(info, mode) {
      return '<div class="ep-head"><div><p class="kicker">Wortschatz · Karte ' + (i + 1) + " von " + queue.length + " · " + mode + "</p></div>" +
        '<button class="btn ghost" type="button" id="ws-quit">Pause</button></div>' +
        '<div class="progress-track" aria-label="Fortschritt"><span style="width:' + Math.round(i / queue.length * 100) + '%"></span></div>';
    }

    function bindCommon() {
      document.getElementById("ws-quit").addEventListener("click", function () {
        if (unbind) { unbind(); unbind = null; }
        KH.view.words();
      });
      const say = document.getElementById("ws-say");
      if (say) say.addEventListener("click", function () { KH.speak(say.getAttribute("data-say")); });
    }

    function sayBtn(text) {
      return KH.state.player.tts ? '<button class="btn ghost" type="button" id="ws-say" data-say="' + KH.esc(text) + '">Vorlesen</button>' : "";
    }

    /* New / shaky words: see the word in its line, pick the meaning. */
    function recognize(id, info) {
      const pool = Object.keys(KH.WORTSCHATZ).reduce(function (all, ep) {
        return all.concat(KH.WORTSCHATZ[ep].map(function (r) { return r[1]; }));
      }, []).filter(function (en) { return en !== info.en; });
      const opts = KH.shuffle([info.en].concat(KH.shuffle(Array.from(new Set(pool))).slice(0, 3)));
      KH.shell(
        head(info, "Erkennen") +
        '<div class="card ws-card"><p class="ws-who">' + KH.esc(info.who) + " · " + KH.esc(epLabel(info.ep)) + "</p>" +
        '<p class="ws-line" lang="de">„' + clozeHtml(info, false) + "“</p>" +
        '<p class="ws-word" lang="de">' + KH.esc(info.de) + "</p>" + sayBtn(info.de) +
        "<h2>Was heißt das?</h2><div class=\"choice-row ws-opts\">" +
        opts.map(function (o, k) { return '<button type="button" class="choice" data-opt="' + k + '"><span class="kbd">' + (k + 1) + "</span> " + KH.esc(o) + "</button>"; }).join("") +
        '</div><div id="ws-out" aria-live="polite"></div></div>',
        { here: "words" }
      );
      bindCommon();
      let answered = false;
      function pick(k) {
        if (answered) return;
        answered = true;
        const ok = opts[k] === info.en;
        document.querySelectorAll("[data-opt]").forEach(function (b) {
          b.disabled = true;
          if (opts[+b.getAttribute("data-opt")] === info.en) b.setAttribute("aria-pressed", "true");
        });
        grade(id, info, ok ? "right" : "wrong");
      }
      document.querySelectorAll("[data-opt]").forEach(function (b) {
        b.addEventListener("click", function () { pick(+b.getAttribute("data-opt")); });
      });
      unbind = KH.bindKeys({ "1": function () { pick(0); }, "2": function () { pick(1); }, "3": function () { pick(2); }, "4": function () { pick(3); } });
    }

    /* Known-ish words: the line with a gap, type the German (with article). */
    function recall(id, info) {
      const art = article(info.de);
      KH.shell(
        head(info, "Abrufen") +
        '<div class="card ws-card"><p class="ws-who">' + KH.esc(info.who) + " · " + KH.esc(epLabel(info.ep)) + "</p>" +
        '<p class="ws-line" lang="de">„' + clozeHtml(info, true) + "“</p>" +
        (info.ctxEn ? '<p class="en">' + KH.esc(info.ctxEn) + "</p>" : "") +
        '<form id="ws-form" class="ws-form"><p class="ws-ask" id="ws-ask">Auf Deutsch: <strong>' + KH.esc(info.en) + "</strong>" +
        (art ? ' <span class="ws-hint">· mit Artikel (der/die/das)</span>' : "") + "</p>" +
        '<input id="ws-in" lang="de" aria-labelledby="ws-ask" autocomplete="off" autocapitalize="off" spellcheck="false">' +
        '<div class="row-btns"><button class="btn post" type="submit">Prüfen</button>' +
        '<button class="btn ghost" type="button" id="ws-idk">Weiß ich nicht</button></div></form>' +
        '<div id="ws-out" aria-live="polite"></div></div>',
        { here: "words" }
      );
      bindCommon();
      const input = document.getElementById("ws-in");
      input.focus();
      let answered = false;
      function submit(typed) {
        if (answered) return;
        answered = true;
        input.disabled = true;
        document.querySelectorAll("#ws-form button").forEach(function (b) { b.disabled = true; });
        grade(id, info, KH.checkWord(info, typed));
      }
      document.getElementById("ws-form").addEventListener("submit", function (e) {
        e.preventDefault();
        submit(input.value);
      });
      document.getElementById("ws-idk").addEventListener("click", function () { submit(""); });
    }

    function grade(id, info, result) {
      /* The in-session retry is practice only: the card already comes back tomorrow. */
      const retry = !!retried[id];
      if (!retry) {
        tally[result] += 1;
        KH.gradeWord(id, result);
      }
      const again = result === "wrong" && !retry;
      if (again) {
        retried[id] = true;
        missed.push(info.de);
        queue.push(id);
      }
      const art = article(info.de);
      const msg = result === "right"
        ? "Richtig. <strong lang=\"de\">" + KH.esc(info.de) + "</strong> geht ein Fach weiter."
        : result === "almost"
          ? "Fast — das Wort stimmt, der Artikel nicht: <strong lang=\"de\">" + KH.esc(info.de) + "</strong>. Morgen noch einmal."
          : "Das war <strong lang=\"de\">" + KH.esc(info.de) + "</strong> (" + KH.esc(info.en) + ")." +
            (art ? " Artikel merken: <strong>" + art + "</strong>." : "") + (again ? " Kommt gleich noch einmal." : " Morgen wieder.");
      const out = document.getElementById("ws-out");
      out.innerHTML = '<div class="feedback' + (result === "right" ? " ok" : result === "wrong" ? " no" : "") + '">' + msg +
        '<p class="ws-line" lang="de">„' + clozeHtml(info, false) + "“</p></div>" +
        '<div class="row-btns"><button class="btn post" type="button" id="ws-next">Weiter</button></div>';
      KH.live(result === "right" ? "Richtig" : (result === "almost" ? "Fast" : "Falsch") + ": " + info.de);
      KH.speak(info.de);
      if (result === "almost" && KH.grammarModal) {
        out.querySelector(".feedback").insertAdjacentHTML("beforeend",
          '<p><button type="button" class="chip" id="ws-gram">Grammatik-Ecke: der, die, das</button></p>');
        document.getElementById("ws-gram").addEventListener("click", function () { KH.grammarModal("artikel"); });
      }
      const nb = document.getElementById("ws-next");
      nb.focus();
      nb.addEventListener("click", function () { i += 1; next(); });
      if (unbind) { unbind(); unbind = null; }
    }

    function summary() {
      const st = KH.wordStats();
      const left = KH.wordsDue().length;
      KH.shell(
        '<p class="kicker">Wortschatz · fertig</p><h1>Für heute: ' + tally.right + " richtig</h1>" +
        "<p>" + tally.right + " richtig · " + tally.almost + " fast (Artikel) · " + tally.wrong + " noch nicht.</p>" +
        (missed.length ? '<p>Morgen wieder dabei: <strong lang="de">' + missed.map(KH.esc).join(", ") + "</strong></p>" : "") +
        '<div class="stats">' + '<div class="stat"><b>' + st.known + "</b><span>Sicher</span></div>" +
        '<div class="stat"><b>' + st.total + "</b><span>Wörter</span></div>" +
        '<div class="stat"><b>' + st.days + "</b><span>Tage geübt</span></div></div>" +
        '<div class="row-btns">' +
        (left ? '<button class="btn" type="button" id="ws-more">Noch ' + Math.min(left, SESSION_MAX) + " Karten</button>" : "") +
        '<button class="btn post" type="button" data-go="hub">Zurück in die Stadt</button>' +
        '<button class="btn ghost" type="button" data-go="words">Alle Wörter</button></div>',
        { here: "words" }
      );
      const more = document.getElementById("ws-more");
      if (more) more.addEventListener("click", function () { KH.view.wordReview(); });
    }

    next();
  };
})(window);
