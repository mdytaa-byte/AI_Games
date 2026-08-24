/* Kleinhausen course shell: routing, hub, episode player, extras. */
(function (global) {
  const KH = global.KH = global.KH || {};
  let unbindKeys = null;
  let sceneHook = null;

  KH.mod = function (id) {
    return (KH.MODULES || []).find(function (m) { return m.id === id; });
  };

  KH.boot = function () {
    KH.SCORM.init();
    KH.load();
    KH.applyPrefs();
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (KH.state.player.motion !== "full-forced") KH.state.player.motion = "reduce";
    }
    KH.applyPrefs();
    if (!KH.state.onboarding) KH.view.splash();
    else KH.view.hub();
  };

  KH.shell = function (inner, opts) {
    opts = opts || {};
    if (!opts.town && KH.Town) KH.Town.hide();
    document.body.classList.toggle("town-live", !!opts.town);
    const rank = KH.residentRank();
    const pts = KH.state.player.vorname ? KH.state.player.vorname : "Gast";
    document.getElementById("app").innerHTML =
      '<div class="app-shell' + (opts.town ? " app-shell--town" : "") + '">' +
      '<header class="topbar">' +
      '<button class="brand" type="button" data-go="hub"><span class="brand-mark" aria-hidden="true">K</span><span class="brand-text"><strong>Kleinhausen</strong><small>750 Jahre · ' + KH.esc(rank.de) + "</small></span></button>" +
      '<div class="points" aria-label="Punkte">' + pts + " · " +
      (KH.state.points.verstehen + KH.state.points.sprechen + KH.state.points.kultur + KH.state.points.mut) + " P</div>" +
      '<nav class="top-tools" aria-label="Kursnavigation">' +
      btn("hub", "Stadt") +
      btn("pass", "Pass") +
      btn("journal", "Heft") +
      btn("discover", "Entdecken") +
      btn("settings", "Zugang") +
      "</nav></header>" +
      '<main class="main" id="hauptinhalt" tabindex="-1">' + inner + "</main>" +
      '<footer class="foot">ACTFL Novice High · Lesen, Schreiben, Hören, Sprechen · <button type="button" class="chip" data-go="teacher" style="border:0;background:none;color:inherit;text-decoration:underline">Lehrerzimmer</button></footer></div>';
    document.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () {
        const go = b.getAttribute("data-go");
        if (KH.view[go]) KH.view[go]();
      });
    });
    function btn(id, label) {
      return '<button class="chip" type="button" data-go="' + id + '"' + (opts.here === id ? ' aria-current="page"' : "") + ">" + label + "</button>";
    }
  };

  KH.view = {};

  KH.view.splash = function () {
    document.getElementById("app").innerHTML =
      '<div class="splash"><div class="splash-card">' +
      '<div class="train hi-only" aria-hidden="true"></div>' +
      '<div class="sign">Nächster Halt</div>' +
      "<h1>Willkommen in Kleinhausen</h1>" +
      '<p class="lede">Ein Jahr. Eine Stadt. Deine Geschichte — in der Ich-Perspektive. Sechzehn Episoden, echte Aufgaben, ein Streit um einen Platz, und Bewohner, die dich brauchen.</p>' +
      '<p class="en">A first-year German course to ACTFL Novice High. Story-first. Canvas-ready. High graphics or low-fi.</p>' +
      '<div class="row-btns"><button class="btn post" id="begin" type="button">Ich steige aus</button>' +
      '<button class="btn ghost" id="a11yfirst" type="button">Zugang &amp; Grafik zuerst</button></div>' +
      '<p style="margin-top:16px;color:var(--ink-soft);font-size:.85rem">Tastatur: danach oft <span class="kbd">1</span> <span class="kbd">2</span> <span class="kbd">3</span> für Antworten. Skip-Link oben.</p>' +
      "</div></div>";
    document.getElementById("begin").addEventListener("click", KH.view.setup);
    document.getElementById("a11yfirst").addEventListener("click", KH.view.setup);
  };

  KH.view.setup = function () {
    KH.shell(
      '<p class="kicker">Ankommen</p><h1>Wer bist du in dieser Stadt?</h1>' +
      '<p class="lede">Wir brauchen keinen Avatar von hinten. Die Kamera bist du. Nur ein Name, damit Lena dich rufen kann.</p>' +
      '<form class="form-grid" id="setup">' +
      '<label class="field">Vorname <span class="en">first name</span><input name="vorname" required maxlength="24" value="' + KH.esc(KH.state.player.vorname) + '"></label>' +
      '<label class="field">Ich komme aus … <span class="en">used after „aus“</span><input name="herkunft" value="' + KH.esc(KH.state.player.herkunft) + '" placeholder="den USA"></label>' +
      '<div><span class="field">Wie sollen Lehrer dich einordnen?</span><div class="choice-row" id="rolle">' +
      choice("neutral", "Schüler/in") + choice("schueler", "Schüler") + choice("schuelerin", "Schülerin") +
      "</div></div>" +
      '<div><span class="field">Grafik</span><div class="choice-row" id="gfx">' +
      choice("high", "High — 3D-Stadt, erste Person") + choice("low", "Low-fi — Text, Liste, kein WebGL") +
      "</div></div>" +
      '<label class="field"><input type="checkbox" name="gloss" ' + (KH.state.player.gloss ? "checked" : "") + "> English gloss anzeigen</label>" +
      '<button class="btn post" type="submit">Wohnsitz anmelden</button></form>',
      { here: "settings" }
    );
    function choice(val, label) { return '<button type="button" class="choice" data-v="' + val + '">' + label + "</button>"; }
    pick("rolle", KH.state.player.rolle || "neutral", function (v) { KH.state.player.rolle = v; });
    pick("gfx", KH.state.player.gfx || "high", function (v) { KH.state.player.gfx = v; });
    document.getElementById("setup").addEventListener("submit", function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      KH.state.player.vorname = String(fd.get("vorname") || "Gast").trim();
      KH.state.player.herkunft = String(fd.get("herkunft") || "den USA").trim();
      KH.state.player.gloss = !!fd.get("gloss");
      KH.state.onboarding = true;
      KH.state.episodes.e01.status = "open";
      KH.applyPrefs();
      KH.save();
      KH.view.hub();
    });
    function pick(id, current, fn) {
      const root = document.getElementById(id);
      root.querySelectorAll(".choice").forEach(function (b) {
        if (b.getAttribute("data-v") === current) b.setAttribute("aria-pressed", "true");
        b.addEventListener("click", function () {
          root.querySelectorAll(".choice").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
          fn(b.getAttribute("data-v"));
        });
      });
    }
  };

  function episodeListHtml() {
    return KH.MODULES.map(function (m) {
      const st = KH.state.episodes[m.id] || { status: "locked" };
      return '<button class="ep-btn" data-ep="' + m.id + '" data-status="' + st.status + '" ' +
        (st.status === "locked" ? "disabled" : "") + ">" +
        '<span class="num">' + m.n + '</span><span><span class="ttl">' + KH.esc(m.title) + '</span>' +
        '<span class="sub">' + KH.esc(m.titleLong) + '</span></span>' +
        '<span class="status-pill">' + (st.status === "done" ? "Stempel" : st.status === "open" ? "offen" : "zu") + "</span></button>";
    }).join("");
  }

  function weatherLabel() {
    return (KH.mod("e01") && KH.state.episodes.e16.status === "done") ? "April · Jubiläum" : currentSeason();
  }

  KH.view.hub = function () {
    if ((KH.state.player.gfx || "high") !== "low" && KH.Town) {
      KH.view.townHub();
      return;
    }
    KH.view.hubList();
  };

  KH.view.hubList = function () {
    const list = episodeListHtml();
    KH.shell(
      '<div class="weather-bar">' + weatherLabel() + " · " + KH.esc(KH.rolleNoun()) + " " + KH.esc(KH.state.player.vorname) + "</div>" +
      '<div class="map-layout"><div><h1>Die Stadt</h1>' +
      '<p class="lede">Low-fi: Orte als Liste. High-Modus ist dieselbe Stadt in der Ich-Perspektive — Pflaster, Fachwerk, Wetter.</p>' +
      '<div class="lo-only card"><p class="lowfi-note">Low-fi Stadtplan: Liste statt 3D. Ehrlich, schnell, tastaturfreundlich.</p><ul id="lolist"></ul></div>' +
      '<div class="hi-only map-board" id="mapboard" data-weather=""></div>' +
      '<p class="hi-only" id="map-status" aria-live="polite"></p>' +
      '</div><aside class="side-stack"><div class="card"><p class="kicker">16 Episoden</p><div class="episode-list">' + list + '</div></div>' +
      '<div class="card"><p class="kicker">Durchgehende Geschichte</p><p>' + KH.STORY.throughline + "</p>" +
      '<p class="en">' + KH.STORY.player + "</p></div></aside></div>",
      { here: "hub" }
    );
    bindHubChrome();
  };

  KH.view.townHub = function () {
    const list = episodeListHtml();
    KH.shell(
      '<div class="town-hud">' +
      '<div class="weather-bar">' + weatherLabel() + " · " + KH.esc(KH.rolleNoun()) + " " + KH.esc(KH.state.player.vorname) + "</div>" +
      '<p class="town-help">Du stehst in Kleinhausen — dieselben Straßen wie Foto-Schnitzeljagd und Lieferdienst. <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> gehen · Ziehen oder <kbd>A</kbd>/<kbd>D</kbd> Blick · <kbd>E</kbd> eintreten.</p>' +
      '<div class="town-tools">' +
      '<button class="btn post" type="button" id="open-eps">Episoden</button>' +
      '<button class="btn ghost" type="button" id="open-plan">Plan</button>' +
      '<button class="btn ghost" type="button" id="open-orte">Orte</button>' +
      "</div></div>" +
      '<aside class="town-drawer" id="ep-drawer" hidden><p class="kicker">16 Episoden</p><div class="episode-list">' + list + "</div>" +
      '<button class="btn ghost" type="button" id="close-eps">Straße weitergehen</button></aside>' +
      '<div class="town-modal" id="plan-modal" hidden><div class="card"><h2>Stadtplan</h2><div class="map-board" id="mapboard"></div><button class="btn ghost" type="button" data-close="plan-modal">Schließen</button></div></div>' +
      '<div class="town-modal" id="orte-modal" hidden><div class="card"><h2>Orte</h2><ul id="lolist"></ul><button class="btn ghost" type="button" data-close="orte-modal">Schließen</button></div></div>' +
      '<section class="place-sheet" id="place-sheet" hidden></section>',
      { here: "hub", town: true }
    );
    KH.Town.show({
      weather: KH.weatherKey ? KH.weatherKey() : "overcast",
      onEnter: function (id) { KH.view.place(id, { fromTown: true }); },
      onFail: function () { KH.view.hubList(); }
    });
    bindHubChrome();
    const openEps = document.getElementById("open-eps");
    const drawer = document.getElementById("ep-drawer");
    if (openEps && drawer) {
      openEps.addEventListener("click", function () {
        drawer.hidden = !drawer.hidden;
        if (KH.Town) {
          if (drawer.hidden) KH.Town.resume();
          else KH.Town.pause();
        }
      });
    }
    const closeEps = document.getElementById("close-eps");
    if (closeEps) closeEps.addEventListener("click", function () {
      if (drawer) drawer.hidden = true;
      if (KH.Town) KH.Town.resume();
    });
    document.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        const m = document.getElementById(b.getAttribute("data-close"));
        if (m) m.hidden = true;
        if (KH.Town) KH.Town.resume();
      });
    });
    const openPlan = document.getElementById("open-plan");
    if (openPlan) openPlan.addEventListener("click", function () {
      const m = document.getElementById("plan-modal");
      if (m) m.hidden = false;
      if (KH.Town) KH.Town.pause();
    });
    const openOrte = document.getElementById("open-orte");
    if (openOrte) openOrte.addEventListener("click", function () {
      const m = document.getElementById("orte-modal");
      if (m) m.hidden = false;
      if (KH.Town) KH.Town.pause();
    });
  };

  function bindHubChrome() {
    const board = document.getElementById("mapboard");
    if (board) {
      board.setAttribute("data-weather", KH.weatherKey ? KH.weatherKey() : "overcast");
      board.innerHTML = KH.mapSVG();
      KH.bindMap(board, function (place) {
        const modal = document.getElementById("plan-modal");
        if (modal) modal.hidden = true;
        KH.view.place(place, { fromTown: !!(KH.Town && KH.Town.isLive()) });
      });
      board.querySelectorAll("[data-place]").forEach(function (g) {
        function hint() {
          const p = KH.PLACES[g.getAttribute("data-place")];
          const locked = p && KH.state.episodes[p.ep] && KH.state.episodes[p.ep].status === "locked";
          setMapStatus(p, locked);
        }
        g.addEventListener("mouseenter", hint);
        g.addEventListener("focus", hint);
      });
    }
    const ul = document.getElementById("lolist");
    if (ul) {
      ul.innerHTML = "";
      Object.keys(KH.PLACES).forEach(function (id) {
        const p = KH.PLACES[id];
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.className = "btn ghost";
        b.type = "button";
        b.textContent = p.name + " · " + p.district;
        b.addEventListener("click", function () {
          const modal = document.getElementById("orte-modal");
          if (modal) modal.hidden = true;
          KH.view.place(id, { fromTown: !!(KH.Town && KH.Town.isLive()) });
        });
        li.appendChild(b);
        ul.appendChild(li);
      });
    }
    document.querySelectorAll("[data-ep]").forEach(function (b) {
      b.addEventListener("click", function () { KH.view.episode(b.getAttribute("data-ep")); });
    });
  }

  function currentSeason() {
    const done = Object.values(KH.state.episodes).filter(function (e) { return e.status === "done"; }).length;
    const m = KH.MODULES[Math.min(done, 15)];
    return m ? m.season : "Kleinhausen";
  }

  function setMapStatus(p, locked) {
    const status = document.getElementById("map-status");
    if (!status || !p) return;
    status.textContent = p.name + " · " + p.district + (locked ? " — Episode später, Ort trotzdem offen" : "");
  }

  function placeBodyHtml(id) {
    const meta = KH.PLACES[id];
    const loc = (KH.LOCATIONS && KH.LOCATIONS[id]) || {};
    const ep = loc.episode;
    const st = ep && KH.state.episodes[ep];
    const canEp = st && st.status !== "locked";
    const looks = loc.looks || [];
    const npc = loc.npc && KH.NPCS[loc.npc];
    const lookBtns = looks.map(function (h, i) {
      return '<button type="button" data-look="' + i + '">' + (i + 1) + " · " + KH.esc(h.label) + "</button>";
    }).join("");
    return {
      meta: meta, loc: loc, ep: ep, canEp: canEp, looks: looks,
      html:
        '<p class="kicker">Ich-Perspektive · ' + KH.esc(meta.district) + "</p>" +
        "<h1>" + KH.esc(meta.name) + "</h1>" +
        '<p class="you-line">' + KH.esc(loc.you || ("Du stehst vor " + meta.name + ".")) + "</p>" +
        (loc.youEn ? '<p class="en">' + KH.esc(loc.youEn) + "</p>" : "") +
        "<h2>Schau dich um</h2>" +
        '<div class="look-grid" id="looks">' + lookBtns + "</div>" +
        '<div id="look-out" class="feedback">Wähle etwas, das du siehst. Die Wörter gehören dir danach.</div>' +
        (npc ? '<div class="card npc-row" style="margin-top:12px"><div class="portrait" style="background:' + npc.color + ';color:#fff">' + KH.esc(npc.initials) + '</div><div class="bubble"><div class="who">' + KH.esc(npc.name) + '</div><p>' + KH.esc(loc.npcLine || npc.bio) + '</p>' + (loc.npcLineEn ? '<p class="en">' + KH.esc(loc.npcLineEn) + '</p>' : "") + "</div></div>" : "") +
        '<div class="row-btns">' +
        (canEp ? '<button class="btn post" type="button" id="goep">Episode ' + ep.slice(1) + " hier spielen</button>" : "<p>Die Episode zu diesem Ort ist noch zu — du darfst trotzdem stehen und gucken.</p>") +
        (loc.side ? '<button class="btn ghost" type="button" id="goside">Entdeckung</button>' : "") +
        '<button class="btn ghost" type="button" id="leave-place">Weitergehen</button>' +
        "</div>"
    };
  }

  function bindPlaceLooks(looks) {
    document.querySelectorAll("[data-look]").forEach(function (b) {
      b.addEventListener("click", function () {
        const h = looks[parseInt(b.getAttribute("data-look"), 10)];
        b.setAttribute("data-found", "1");
        const out = document.getElementById("look-out");
        if (out) {
          out.className = "feedback ok";
          out.innerHTML = "<strong>" + KH.esc(h.label) + "</strong> — " + h.de + (h.en ? '<span class="en">' + KH.esc(h.en) + "</span>" : "");
        }
        KH.speak(h.label + ". " + (h.de || ""));
        KH.live(h.label);
        if (h.discover) KH.discover(h.discover);
      });
    });
  }

  KH.view.place = function (id, opts) {
    opts = opts || {};
    const meta = KH.PLACES[id];
    if (!meta) return KH.view.hub();
    KH.currentPlace = id;
    if ((KH.state.visited || []).indexOf(id) < 0) {
      KH.state.visited = KH.state.visited || [];
      KH.state.visited.push(id);
      KH.addPoints("kultur", 1);
    }
    KH.save();
    const pack = placeBodyHtml(id);
    const loc = pack.loc;
    const fromTown = opts.fromTown || (KH.Town && KH.Town.isLive && KH.Town.isLive());
    if (fromTown && (KH.state.player.gfx || "high") !== "low") {
      if (KH.Town) {
        KH.Town.goTo(id);
        KH.Town.pause();
      }
      const sheet = document.getElementById("place-sheet");
      if (sheet) {
        sheet.hidden = false;
        sheet.innerHTML = pack.html;
        bindPlaceLooks(pack.looks);
        const goep = document.getElementById("goep");
        if (goep) goep.addEventListener("click", function () { KH.view.episode(pack.ep); });
        const goside = document.getElementById("goside");
        if (goside) goside.addEventListener("click", function () { KH.view.side(loc.side); });
        const leave = document.getElementById("leave-place");
        if (leave) leave.addEventListener("click", function () {
          sheet.hidden = true;
          sheet.innerHTML = "";
          if (KH.Town) KH.Town.resume();
        });
        KH.live(loc.you || meta.name);
        return;
      }
    }
    KH.shell(
      '<p class="kicker">Ich-Perspektive · ' + KH.esc(meta.district) + "</p>" +
      "<h1>" + KH.esc(meta.name) + "</h1>" +
      '<p class="lo-only lowfi-note">Low-fi: Text statt 3D — derselbe Ort, dasselbe Wetter, derselbe Stand.</p>' +
      pack.html.replace('id="leave-place"', 'data-go="hub"'),
      { here: "hub" }
    );
    bindPlaceLooks(pack.looks);
    const goep = document.getElementById("goep");
    if (goep) goep.addEventListener("click", function () { KH.view.episode(pack.ep); });
    const goside = document.getElementById("goside");
    if (goside) goside.addEventListener("click", function () { KH.view.side(loc.side); });
    KH.live(loc.you || meta.name);
  };

  KH.view.episode = function (id) {
    const mod = KH.mod(id);
    if (!mod) return KH.view.hub();
    const st = KH.state.episodes[id];
    if (st.status === "locked") return KH.view.hub();
    if (!st.startedAt) st.startedAt = Date.now();
    KH.currentPlace = (mod.places && mod.places[0]) || "markt";
    KH.save();
    playScene(mod, st.scene || 0);
  };

  function playScene(mod, index) {
    if (unbindKeys) { unbindKeys(); unbindKeys = null; }
    KH.stopSpeak();
    const scenes = mod.scenes;
    if (index >= scenes.length) return finish(mod);
    KH.state.episodes[mod.id].scene = index;
    KH.save();
    const pct = Math.round((index / scenes.length) * 100);
    KH.shell(
      '<div class="ep-head"><div><p class="kicker">Episode ' + mod.n + " von 16 · " + KH.esc(mod.season) + "</p>" +
      "<h1>" + KH.esc(mod.titleLong) + "</h1>" +
      "<p>Can-Do: " + mod.canDo.map(function (c) { return c.de; }).join(" · ") + "</p></div>" +
      '<button class="btn ghost" type="button" id="tohub">Zur Stadt</button></div>' +
      '<div class="progress-track" aria-label="Fortschritt"><span style="width:' + pct + '%"></span></div>' +
      '<div id="scene-root"></div>',
      { here: "hub" }
    );
    document.getElementById("tohub").addEventListener("click", KH.view.hub);
    const root = document.getElementById("scene-root");
    KH.mountScene(root, scenes[index], function (res) {
      if (res && res.ok) KH.addPoints("verstehen", 2);
      if (res && res.kind === "ipa") {
        KH.state.episodes[mod.id].summative = {
          score: res.score,
          at: Date.now(),
          code: null
        };
      }
      playScene(mod, index + 1);
    });
  }

  function finish(mod) {
    const ep = KH.state.episodes[mod.id];
    const score = (ep.summative && ep.summative.score) || 80;
    if (!ep.summative) ep.summative = { score: score, at: Date.now() };
    ep.summative.code = KH.makeCode(mod.id);
    KH.completeEpisode(mod.id, ep.summative);
    KH.shell(
      '<p class="kicker">Stempel</p><h1>' + KH.esc(KH.STAMPS[mod.id] || mod.title) + "</h1>" +
      "<p>Episode " + mod.n + " ist im Pass. Einwohnerstatus: <strong>" + KH.esc(KH.residentRank().de) + "</strong>.</p>" +
      '<p>Lehrer-Code:</p><div class="code-box">' + KH.esc(ep.summative.code) + "</div>" +
      '<p class="en">Share this code in Canvas if your teacher asked for it. Score estimate: ' + score + "%</p>" +
      '<div class="row-btns"><button class="btn post" data-go="hub" type="button">Zurück in die Stadt</button>' +
      (mod.n < 16 ? '<button class="btn" id="next" type="button">Nächste Episode</button>' : '<button class="btn" data-go="pass" type="button">Pass ansehen</button>') +
      "</div>"
    );
    document.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () { KH.view[b.getAttribute("data-go")](); });
    });
    const n = document.getElementById("next");
    if (n) n.addEventListener("click", function () {
      KH.view.episode("e" + String(mod.n + 1).padStart(2, "0"));
    });
  }

  KH.view.pass = function () {
    const stamps = Object.keys(KH.STAMPS).map(function (id) {
      const got = KH.state.stamps.indexOf(id) >= 0;
      return '<div class="stamp' + (got ? " got" : "") + '">' + (got ? KH.esc(KH.STAMPS[id]) : "·") + "</div>";
    }).join("");
    const npcHtml = Object.keys(KH.NPCS).map(function (id) {
      const n = KH.NPCS[id];
      const t = (KH.state.npcs[id] && KH.state.npcs[id].trust) || 0;
      return '<div><strong>' + KH.esc(n.short) + '</strong><div class="npc-trust"><i style="width:' + (t / 5 * 100) + '%"></i></div></div>';
    }).join("");
    KH.shell(
      "<h1>Einwohnerpass</h1><p>Du bist " + KH.esc(KH.state.player.vorname) + ", " + KH.esc(KH.rolleNoun()) + " aus " + KH.esc(KH.state.player.herkunft) + ". Rang: <strong>" + KH.esc(KH.residentRank().de) + "</strong>. Orte gesehen: " + ((KH.state.visited && KH.state.visited.length) || 0) + " / " + Object.keys(KH.PLACES).length + ".</p>" +
      '<div class="stats">' +
      stat("Verstehen", KH.state.points.verstehen) +
      stat("Sprechen", KH.state.points.sprechen) +
      stat("Kultur", KH.state.points.kultur) +
      stat("Mut", KH.state.points.mut) + "</div>" +
      '<h2 style="margin-top:22px">Stempel</h2><div class="stamp-sheet">' + stamps + "</div>" +
      '<h2 style="margin-top:22px">Beziehungen</h2><div class="card">' + npcHtml + "</div>",
      { here: "pass" }
    );
    function stat(l, v) { return '<div class="stat"><b>' + v + "</b><span>" + l + "</span></div>"; }
  };

  KH.view.journal = function () {
    const entries = (KH.state.journal || []).slice().reverse().map(function (j) {
      return '<article class="journal-entry"><h3>' + KH.esc(j.title || "Text") + "</h3><p>" + KH.esc(j.text || "") + "</p>" +
        (j.score != null ? "<p>Auto-Score: " + j.score + "</p>" : "") + "</article>";
    }).join("") || "<p>Noch leer. Schreibaufgaben landen hier.</p>";
    KH.shell("<h1>Heft</h1><p>Deine Texte. Export für Canvas: kopieren oder als Datei.</p>" +
      '<div class="row-btns"><button class="btn ghost" type="button" id="exp">JSON exportieren</button></div>' + entries, { here: "journal" });
    document.getElementById("exp").addEventListener("click", function () {
      const blob = new Blob([JSON.stringify(KH.state, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "kleinhausen-fortschritt.json";
      a.click();
    });
  };

  KH.view.discover = function () {
    const doneEps = Object.values(KH.state.episodes).filter(function (e) { return e.status === "done"; }).length;
    const preview = KH.state.flags.demo ? 16 : doneEps;
    const cards = KH.SIDEQUESTS.map(function (q) {
      const open = preview >= q.need;
      const got = KH.state.sidequests[q.id];
      return '<div class="card' + (open ? "" : " locked-card") + '"><p class="kicker">' + (got ? "gefunden" : open ? "offen" : "ab Episode " + q.need) + "</p>" +
        "<h3>" + KH.esc(q.title) + "</h3><p>" + KH.esc(q.teaser) + "</p>" +
        (open ? '<button class="btn post" data-sq="' + q.id + '" type="button">Spielen</button>' : "") + "</div>";
    }).join("");
    KH.shell("<h1>Nicht in der Klausur — trotzdem die Stadt</h1>" +
      "<p>Seitengassen. Hunde. Denkmäler. Radio. Wer nur die 16 Episoden macht, besteht. Wer das hier macht, wohnt.</p>" +
      '<div class="discover-grid">' + cards + "</div>", { here: "discover" });
    document.querySelectorAll("[data-sq]").forEach(function (b) {
      b.addEventListener("click", function () { KH.view.side(b.getAttribute("data-sq")); });
    });
  };

  KH.view.side = function (id) {
    const q = KH.SIDEQUESTS.find(function (x) { return x.id === id; });
    if (!q) return KH.view.discover();
    let i = 0;
    function go() {
      if (i >= q.scenes.length) {
        KH.state.sidequests[id] = true;
        KH.discover(id);
        KH.save();
        KH.shell("<h1>Gefunden.</h1><p>" + KH.esc(q.title) + " liegt jetzt in deinem Pass als Entdeckung.</p>" +
          '<button class="btn post" data-go="discover" type="button">Weiterstöbern</button>');
        document.querySelector("[data-go]").addEventListener("click", KH.view.discover);
        return;
      }
      KH.shell('<p class="kicker">Entdeckung</p><h1>' + KH.esc(q.title) + '</h1><div id="scene-root"></div>', { here: "discover" });
      KH.mountScene(document.getElementById("scene-root"), q.scenes[i], function () { i += 1; go(); });
    }
    go();
  };

  KH.view.settings = function () {
    const p = KH.state.player;
    KH.shell(
      "<h1>Zugang &amp; Darstellung</h1>" +
      '<p>WCAG-orientiert: Tastatur, Skip-Link, Vorlesen, Kontrast, Schrift, Bewegung, Transkripte. Prüfungsmodus blendet Hilfen.</p>' +
      '<div class="a11y-panel card">' +
      tog("gloss", "English gloss", p.gloss) +
      tog("contrast", "Hoher Kontrast", p.contrast) +
      tog("tts", "Vorlesen (TTS)", p.tts) +
      tog("captions", "Transkripte sichtbar", p.captions) +
      tog("exam", "Prüfungsmodus", p.exam) +
      "</div>" +
      '<div class="row-btns" style="margin-top:12px">' +
      '<label>Schrift <select id="size"><option value="m">Standard</option><option value="l">Groß</option><option value="xl">Sehr groß</option></select></label>' +
      '<label>Schriftart <select id="font"><option value="default">Kurs</option><option value="lesbar">Lesbar (Verdana)</option></select></label>' +
      '<label>Bewegung <select id="motion"><option value="full">an</option><option value="reduce">reduziert</option></select></label>' +
      '<label>Grafik <select id="gfx"><option value="high">High — 3D-Stadt</option><option value="low">Low-fi — Text</option></select></label>' +
      "</div>" +
      '<p style="margin-top:18px"><button class="btn warn" type="button" id="reset">Fortschritt löschen</button></p>',
      { here: "settings" }
    );
    document.getElementById("size").value = p.size || "m";
    document.getElementById("font").value = p.font || "default";
    document.getElementById("motion").value = p.motion || "full";
    document.getElementById("gfx").value = p.gfx || "high";
    ["size", "font", "motion", "gfx"].forEach(function (id) {
      document.getElementById(id).addEventListener("change", function (e) {
        KH.state.player[id] = e.target.value;
        KH.applyPrefs(); KH.save();
      });
    });
    document.querySelectorAll("[data-tog]").forEach(function (b) {
      b.addEventListener("click", function () {
        const k = b.getAttribute("data-tog");
        KH.state.player[k] = !KH.state.player[k];
        KH.applyPrefs(); KH.save();
        KH.view.settings();
      });
    });
    document.getElementById("reset").addEventListener("click", function () {
      if (confirm("Wirklich alles löschen?")) { KH.reset(); KH.applyPrefs(); KH.view.splash(); }
    });
    function tog(k, label, on) {
      return '<button type="button" class="choice" data-tog="' + k + '" aria-pressed="' + on + '">' + label + (on ? " · an" : " · aus") + "</button>";
    }
  };

  KH.view.teacher = function () {
    const rows = KH.MODULES.map(function (m) {
      const e = KH.state.episodes[m.id];
      return "<tr><td>" + m.n + "</td><td>" + KH.esc(m.title) + "</td><td>" + e.status + "</td><td>" +
        ((e.summative && e.summative.score) || "—") + "</td><td>" + ((e.summative && e.summative.code) || "—") + "</td></tr>";
    }).join("");
    KH.shell(
      "<h1>Lehrerzimmer</h1>" +
      "<p>Zielniveau: ACTFL <strong>Novice High</strong> in Interpretive (Lesen/Hören), Interpersonal und Presentational (Sprechen/Schreiben). Jede Episode endet mit einer Mini-IPA. Formative Szenen geben Feedback; der Stempel ist summativ.</p>" +
      "<p>Canvas: SCORM-Paket im Ordner <code>kleinhausen/canvas</code> zippen, oder diese Seite als External URL einbetten. Codes unten in eine Aufgabe „Textfeld“ kleben lassen.</p>" +
      '<p><button class="btn" type="button" id="unlock">Alle Episoden öffnen (Demo)</button> ' +
      '<button class="btn ghost" type="button" id="exp2">Klassenstand JSON</button></p>' +
      '<div class="card" style="overflow:auto"><table><thead><tr><th>#</th><th>Episode</th><th>Status</th><th>IPA</th><th>Code</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      "<h2>Annahmen dieses Builds</h2><ul>" +
      "<li>US-Schuljahr / College German 1, ca. 16 Sitzungen plus Hauspraxis.</li>" +
      "<li>Spieler*in = Gastschüler/in bei Familie Fröhlich (Lena/Jonas = Gastgeschwister, nicht die Geschenk-Geschwister-Kollision: eine Familie).</li>" +
      "<li>Café Federkiel, Bäckerei Sonnenkorn, Kaufhaus Fröhlich am Markt; Frau + Herr Vogel verwandt.</li>" +
      "<li>Konflikt: Nordpark GmbH vs. Festplatz — schulgeeignet, ernst, ohne Bösewicht-Karikatur.</li>" +
      "<li>Bestehende HTML-Spiele sind Praxis-Missionen in den Episoden. High-Modus: die Stadt <em>ist</em> das 3D-Kleinhausen (Lieferdienst-Raster, gleiches Wetter und derselbe Spielstand).</li></ul>",
      { here: "teacher" }
    );
    document.getElementById("unlock").addEventListener("click", function () {
      KH.state.flags.demo = true;
      Object.keys(KH.state.episodes).forEach(function (id) {
        if (KH.state.episodes[id].status === "locked") KH.state.episodes[id].status = "open";
      });
      KH.save(); KH.view.hub();
    });
    document.getElementById("exp2").addEventListener("click", function () {
      const blob = new Blob([JSON.stringify(KH.state, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "kleinhausen-lehrer.json";
      a.click();
    });
  };
})(window);

document.addEventListener("DOMContentLoaded", function () { KH.boot(); });
