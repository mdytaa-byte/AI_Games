/* Grammatik-Ecke: searchable grammar cards built from Kleinhausen lines.
   Opens as a page (nav) or as a pop-up over a scene, so the scene keeps its state. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.grammarCard = function (id) {
    return (KH.GRAMMATIK || []).find(function (c) { return c.id === id; });
  };

  KH.grammarFor = function (ep) {
    return (KH.GRAMMATIK || []).filter(function (c) { return c.eps.indexOf(ep) >= 0; });
  };

  function gstate() {
    if (!KH.state.grammar || typeof KH.state.grammar !== "object") KH.state.grammar = {};
    if (!KH.state.grammar.seen) KH.state.grammar.seen = {};
    if (!KH.state.grammar.check) KH.state.grammar.check = {};
    return KH.state.grammar;
  }

  function epName(ep) {
    const m = KH.mod && KH.mod(ep);
    return m ? "E" + m.n + " · " + m.title : ep;
  }

  /* eps[0] is the episode that teaches the point; the rest bring it back. */
  function homeEp(c) {
    return c.eps[0];
  }

  function epList(c) {
    return [c.eps[0]].concat(c.eps.slice(1).sort());
  }

  function cardBodyHtml(c, headingTag) {
    const h = headingTag || "h2";
    const table = c.table
      ? '<div class="gr-table-wrap"><table class="gr-table"><thead><tr>' + c.table.head.map(function (x) { return "<th>" + KH.esc(x) + "</th>"; }).join("") +
        "</tr></thead><tbody>" + c.table.rows.map(function (r) {
          return "<tr>" + r.map(function (x) { return '<td lang="de">' + KH.esc(x) + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>"
      : "";
    const ex = c.beispiele.map(function (b, i) {
      return '<li class="gr-ex"><p class="gr-ex-who">' + KH.esc(b[2]) + " · " + KH.esc(epName(b[3])) + "</p>" +
        '<p class="gr-ex-de" lang="de">„' + KH.esc(b[0]) + "“" +
        (KH.state.player.tts ? ' <button type="button" class="chip gr-say" data-say="' + i + '" aria-label="Vorlesen: ' + KH.esc(b[0]) + '">Vorlesen</button>' : "") +
        '</p><p class="en">' + KH.esc(b[1]) + "</p></li>";
    }).join("");
    const result = gstate().check[c.id];
    const check = (c.check || []).map(function (q, qi) {
      return '<div class="gr-q" data-q="' + qi + '"><p lang="de"><strong>' + (qi + 1) + ".</strong> " + KH.esc(q.q) + "</p>" +
        '<div class="choice-row">' + q.opts.map(function (o, oi) {
          return '<button type="button" class="choice" data-opt="' + oi + '" lang="de">' + KH.esc(o) + "</button>";
        }).join("") + '</div><div class="gr-q-out" aria-live="polite"></div></div>';
    }).join("");
    return '<p class="gr-kurz" lang="de">' + KH.esc(c.kurz) + "</p>" +
      '<p class="gr-en">' + KH.esc(c.en) + "</p>" +
      table +
      "<" + h + ">So klingt es in Kleinhausen</" + h + '><ul class="gr-exs">' + ex + "</ul>" +
      '<div class="gr-achtung"><p class="kicker">Achtung</p><p lang="de">' + KH.esc(c.achtung.de) + '</p><p class="gr-en">' + KH.esc(c.achtung.en) + "</p></div>" +
      (check ? "<" + h + ">Kurz-Check" + (result === "ok" ? ' <span class="gr-done">✓ geschafft</span>' : "") + "</" + h + ">" + check : "");
  }

  function bindCardBody(root, c) {
    gstate().seen[c.id] = true;
    KH.save();
    root.querySelectorAll("[data-say]").forEach(function (b) {
      b.addEventListener("click", function () { KH.speak(c.beispiele[+b.getAttribute("data-say")][0]); });
    });
    const right = {};
    root.querySelectorAll(".gr-q").forEach(function (box) {
      const qi = +box.getAttribute("data-q");
      const q = c.check[qi];
      const out = box.querySelector(".gr-q-out");
      box.querySelectorAll("[data-opt]").forEach(function (b) {
        b.addEventListener("click", function () {
          const oi = +b.getAttribute("data-opt");
          const ok = oi === q.ok;
          box.querySelectorAll("[data-opt]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
          out.className = "gr-q-out feedback " + (ok ? "ok" : "no");
          out.textContent = (ok ? "Richtig. " : "Noch nicht. ") + q.why;
          KH.live((ok ? "Richtig. " : "Noch nicht. ") + q.why);
          right[qi] = ok;
          const all = c.check.every(function (_, k) { return right[k]; });
          const st = gstate();
          if (all) st.check[c.id] = "ok";
          else if (st.check[c.id] !== "ok") st.check[c.id] = "tried";
          KH.save();
        });
      });
    });
  }

  /* ---------- Page: list + search ---------- */

  KH.view.grammar = function (query) {
    const st = gstate();
    const cards = (KH.GRAMMATIK || []).slice().sort(function (a, b) { return homeEp(a) < homeEp(b) ? -1 : homeEp(a) > homeEp(b) ? 1 : 0; });
    const items = cards.map(function (c) {
      const mark = st.check[c.id] === "ok" ? '<span class="gr-done" aria-label="Kurz-Check geschafft">✓</span>' : (st.seen[c.id] ? '<span class="gr-seen">gelesen</span>' : "");
      return '<li class="gr-item" data-gid="' + c.id + '"><button type="button" class="gr-open" data-open="' + c.id + '">' +
        '<span class="gr-item-ep">' + KH.esc(epName(homeEp(c))) + "</span>" +
        '<strong lang="de">' + KH.esc(c.title) + "</strong>" +
        '<span class="gr-item-kurz" lang="de">' + KH.esc(c.kurz) + "</span>" + mark + "</button></li>";
    }).join("");
    KH.shell(
      '<p class="kicker">Grammatik-Ecke</p><h1>Wie Kleinhausen spricht</h1>' +
      '<p class="lede">Kurze Karten, echte Sätze aus der Stadt. Kein Lehrbuch — eine Ecke zum Nachschauen, wenn Lena „dem“ sagt und du „der“ erwartest.</p>' +
      '<label class="field gr-search">Suchen <span class="en">search: a word, a topic, or an English term</span>' +
      '<input id="gr-q" type="search" lang="de" autocomplete="off" placeholder="z. B. weil, Uhrzeit, Sie, plural"></label>' +
      '<p id="gr-count" class="gr-count" aria-live="polite"></p>' +
      '<ul class="gr-list" id="gr-list">' + items + "</ul>",
      { here: "grammar" }
    );
    const input = document.getElementById("gr-q");
    const count = document.getElementById("gr-count");
    function filter() {
      const q = KH.norm(input.value);
      let n = 0;
      document.querySelectorAll(".gr-item").forEach(function (li) {
        const c = KH.grammarCard(li.getAttribute("data-gid"));
        const hay = KH.norm([c.title, c.kurz, c.en, c.tags, c.achtung.de, c.achtung.en].concat(c.beispiele.map(function (b) { return b[0] + " " + b[1]; })).join(" "));
        const hit = !q || q.split(" ").every(function (w) { return hay.indexOf(w) >= 0; });
        li.hidden = !hit;
        if (hit) n += 1;
      });
      count.textContent = q ? n + " von " + cards.length + " Karten" : cards.length + " Karten · sortiert nach Episode";
    }
    input.addEventListener("input", filter);
    if (query) input.value = query;
    filter();
    document.querySelectorAll("[data-open]").forEach(function (b) {
      b.addEventListener("click", function () { KH.view.grammarPage(b.getAttribute("data-open"), input.value); });
    });
  };

  KH.view.grammarPage = function (id, backQuery) {
    const c = KH.grammarCard(id);
    if (!c) return KH.view.grammar();
    KH.shell(
      '<div class="ep-head"><div><p class="kicker">Grammatik-Ecke · ' + KH.esc(epList(c).map(epName).join(" · ")) + "</p>" +
      '<h1 lang="de">' + KH.esc(c.title) + "</h1></div>" +
      '<button class="btn ghost" type="button" id="gr-back">Alle Karten</button></div>' +
      '<article class="card gr-card">' + cardBodyHtml(c, "h2") + "</article>",
      { here: "grammar" }
    );
    bindCardBody(document.querySelector(".gr-card"), c);
    document.getElementById("gr-back").addEventListener("click", function () { KH.view.grammar(backQuery || ""); });
  };

  /* ---------- Pop-up over a scene ---------- */

  KH.grammarModal = function (id) {
    const c = KH.grammarCard(id);
    if (!c) return;
    const opener = document.activeElement;
    const old = document.getElementById("gr-modal");
    if (old) old.remove();
    const wrap = document.createElement("div");
    wrap.id = "gr-modal";
    wrap.className = "gr-modal";
    wrap.innerHTML = '<div class="card gr-card gr-dialog" role="dialog" aria-modal="true" aria-labelledby="gr-modal-title" tabindex="-1">' +
      '<div class="gr-dialog-head"><div><p class="kicker">Grammatik-Ecke</p><h2 id="gr-modal-title" lang="de">' + KH.esc(c.title) + "</h2></div>" +
      '<button class="btn ghost" type="button" id="gr-close">Zurück zur Szene</button></div>' +
      cardBodyHtml(c, "h3") + "</div>";
    document.body.appendChild(wrap);
    const dialog = wrap.querySelector(".gr-dialog");
    bindCardBody(dialog, c);
    function close() {
      wrap.remove();
      if (opener && opener.focus) opener.focus();
    }
    document.getElementById("gr-close").addEventListener("click", close);
    wrap.addEventListener("click", function (e) { if (e.target === wrap) close(); });
    /* Keep scene shortcuts (1, 2, 3) from answering the scene behind the card. */
    wrap.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        const f = Array.prototype.slice.call(dialog.querySelectorAll("button, input, [href]")).filter(function (x) { return !x.disabled; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    dialog.focus();
  };

  /* Chips for an episode header. */
  KH.grammarChips = function (ep) {
    const cards = KH.grammarFor(ep);
    if (!cards.length) return "";
    return '<p class="gr-links"><span>Grammatik-Ecke:</span> ' + cards.map(function (c) {
      return '<button type="button" class="chip gr-chip" data-gram="' + c.id + '" lang="de">' + KH.esc(c.title.split(" — ")[0]) + "</button>";
    }).join(" ") + "</p>";
  };

  KH.bindGrammarChips = function (root) {
    (root || document).querySelectorAll("[data-gram]").forEach(function (b) {
      b.addEventListener("click", function () { KH.grammarModal(b.getAttribute("data-gram")); });
    });
  };

  /* Plain text for a teacher or an AI tutor: same cards, same examples. */
  KH.grammarText = function () {
    return "# Kleinhausen — Grammatik-Ecke\n\n" +
      "Grammar reference for a first-year German course (target: ACTFL Novice High). " +
      "Every example is a line from the course story. Explain at this level and reuse these examples.\n\n" +
      (KH.GRAMMATIK || []).map(function (c) {
        return "## " + c.title + "\n" +
          "Episodes: " + epList(c).map(epName).join(", ") + "\n\n" +
          c.kurz + "\n" + c.en + "\n\n" +
          (c.table ? "| " + c.table.head.join(" | ") + " |\n|" + c.table.head.map(function () { return " --- |"; }).join("") + "\n" +
            c.table.rows.map(function (r) { return "| " + r.join(" | ") + " |"; }).join("\n") + "\n\n" : "") +
          "Examples:\n" + c.beispiele.map(function (b) { return "- „" + b[0] + "“ — " + b[1] + " (" + b[2] + ", " + epName(b[3]) + ")"; }).join("\n") + "\n\n" +
          "Common mistake: " + c.achtung.de + " / " + c.achtung.en + "\n\n" +
          (c.check || []).map(function (q) { return "Check: " + q.q + " → " + q.opts[q.ok] + " (" + q.why + ")"; }).join("\n") + "\n";
      }).join("\n");
  };
})(window);
