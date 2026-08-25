/* Required oral evidence: 15s recordings, follow-ups, Canvas listen slips.
   Blobs live in IndexedDB — never localStorage / SCORM suspend_data. */
(function (global) {
  const KH = global.KH = global.KH || {};
  const DB_NAME = "kleinhausen.voice.v1";
  const STORE = "clips";
  const MIN_SEC = 15;
  const MAX_SEC = 90;

  KH.voiceSpine = false;
  KH.currentEpisode = null;
  KH.oralSeq = 0;

  KH.GENERIC_FOLLOWUP = {
    de: "Einen Satz mehr, bitte — warum?",
    en: "One more sentence, please — why?"
  };

  KH.NPC_FOLLOWUPS = {
    stefan: { de: "Wie war die Reise — Flugzeug oder Zug? Ein Satz.", en: "Plane or train? One sentence." },
    birgit: { de: "Mit Zucker oder ohne? Und warum bist du müde?", en: "Sugar or no sugar — and why tired?" },
    lena: { de: "Einen Satz mehr: warum so, und nicht anders?", en: "One more sentence: why this way?" },
    jonas: { de: "Ernst oder Witz? Sag, was du wirklich meinst.", en: "Serious or joking? Say what you mean." },
    ursula: { de: "Welches Buch — und warum das?", en: "Which book, and why?" },
    werner: { de: "Dreck oder Versprechen? Ein Satz, bitte.", en: "Dirt or a promise? One sentence." },
    otto: { de: "Zum Mitnehmen oder hier? Und wie heißt du?", en: "To go or here? And your name?" },
    karl: { de: "Mitspielen oder zuschauen — warum?", en: "Play or watch — why?" },
    haller: { de: "Was genau brauchst du — und wer hilft?", en: "What do you need, and who helps?" },
    hvogel: { de: "Wohin danach — und was ist im Paket?", en: "Where next, and what’s in the parcel?" },
    vogel: { de: "Wann schreibst du formell — und wann lg?", en: "When is formal, when is lg?" },
    amira: { de: "Wann kommst du — und wen bringst du mit?", en: "When are you coming, and with whom?" },
    aylin: { de: "Warten, Karten oder Wortschatz? Ein Satz.", en: "Wait, cards, or vocab? One sentence." }
  };

  /* Used when an IPA interpersonal scene has no scene.followUp of its own. */
  KH.IPA_FOLLOWUPS = {
    e01: { de: "Mit Zucker oder ohne? Und warum bist du müde — Flugzeug oder Zug?", en: "Sugar? And why tired — plane or train?" },
    e02: { de: "Zum Mitnehmen oder hier essen? Und wie heißt du?", en: "To go or here? What’s your name?" },
    e03: { de: "Spielst du mit, oder schaust du nur zu? Warum?", en: "Play along or only watch? Why?" },
    e04: { de: "Und die Schuhe — Turnschuhe oder Stiefel? Warum?", en: "Sneakers or boots — why?" },
    e05: { de: "Was kaufst du bei Otto, und was hier?", en: "What from Otto, and what here?" },
    e06: { de: "Ist das ein Brief oder Werkzeug? Wohin gehst du danach?", en: "Letter or tools? Where next?" },
    e07: { de: "Kommst du Samstag wirklich? Band oder nur Tee — was ist wichtiger?", en: "Are you really coming Saturday? Band or just tea?" },
    e08: { de: "Eine Frage noch: wann schreibst du formell, und wann lg?", en: "When is a mail formal, and when is lg okay?" },
    e09: { de: "Welches Buch willst du zuerst — und warum?", en: "Which book first, and why?" },
    e10: { de: "Mittwoch: um wie viel Uhr, und wen bringst du mit?", en: "Wednesday: what time, and who comes with you?" },
    e11: { de: "Wer hält den Weg frei, wenn wir pflanzen — du oder wir alle?", en: "Who keeps the path free — you, or all of us?" },
    e12: { de: "Was soll ich trinken, und kommt Birgit bald?", en: "What should I drink, and is Birgit coming soon?" },
    e13: { de: "Was machen wir jetzt — warten, Karten oder Wortschatz?", en: "What now — wait, cards, or vocab?" },
    e14: { de: "Ein Satz mehr: warum ist der Platz wichtig für dich?", en: "One more sentence: why does the square matter to you?" },
    e15: { de: "Schreibst du auch, was die Jugend will — oder nur mich?", en: "Will you also write what the youth want — or only me?" },
    e16: { de: "Wen dankst du zuerst auf der Bühne — und warum?", en: "Who do you thank first on stage, and why?" }
  };

  KH.isExam = function () {
    return !!(KH.state.player && KH.state.player.exam);
  };

  KH.isAccommodation = function () {
    return !!(KH.state.player && KH.state.player.accommodation);
  };

  KH.voiceOnSpine = function () {
    return KH.voiceSpine !== false && !!KH.currentEpisode;
  };

  /* Required unless Prüfungsmodus, Nachteilsausgleich, or a sidequest. */
  KH.voiceRequired = function () {
    if (!KH.voiceOnSpine()) return false;
    if (KH.isExam() || KH.isAccommodation()) return false;
    return true;
  };

  KH.oralMode = function () {
    if (!KH.voiceOnSpine()) return "skip";
    if (KH.isExam()) return "exam";
    if (KH.isAccommodation()) return "text";
    return "record";
  };

  KH.followUpFor = function (scene, opt) {
    scene = scene || {};
    const raw = (opt && opt.followUp) || scene.followUp ||
      (scene.ipa && scene.ipaPart === "interpersonal" ? KH.IPA_FOLLOWUPS[KH.currentEpisode] : null) ||
      KH.NPC_FOLLOWUPS[scene.npc] ||
      KH.GENERIC_FOLLOWUP;
    if (typeof raw === "string") return { de: raw, en: "" };
    return { de: (raw && raw.de) || KH.GENERIC_FOLLOWUP.de, en: (raw && raw.en) || "" };
  };

  KH.makeSpeakCode = function (ep) {
    const name = ((KH.state.player && KH.state.player.vorname) || "Gast")
      .slice(0, 8).toUpperCase().replace(/[^A-ZÄÖÜ]/g, "") || "GAST";
    const id = (ep || KH.currentEpisode || "ex").toUpperCase();
    const salt = (id + name + "SPRECHEN").split("").reduce(function (a, c) {
      return (a + c.charCodeAt(0) * 17) % 9973;
    }, 23);
    return "SPR-" + id + "-" + name + "-" + String(1000 + (salt % 9000));
  };

  KH.hasSpoken = function (ep) {
    return (KH.state.recordings || []).some(function (r) {
      if (r.ep !== ep || r.mode === "exam") return false;
      return r.mode === "text" || (r.seconds || 0) >= MIN_SEC || r.ready;
    });
  };

  KH.spokenEpisodes = function () {
    const seen = {};
    (KH.state.recordings || []).forEach(function (r) {
      if (!r.ep || r.mode === "exam") return;
      if (r.mode === "text" || (r.seconds || 0) >= MIN_SEC || r.ready) seen[r.ep] = true;
    });
    return Object.keys(seen).sort();
  };

  KH.spokenCount = function () {
    return KH.spokenEpisodes().length;
  };

  KH.recordingsFor = function (ep) {
    return (KH.state.recordings || []).filter(function (r) { return r.ep === ep; });
  };

  KH.saveRecordingMeta = function (meta) {
    KH.state.recordings = KH.state.recordings || [];
    const i = KH.state.recordings.findIndex(function (r) { return r.id === meta.id; });
    const row = Object.assign({ at: Date.now() }, meta);
    if (i >= 0) KH.state.recordings[i] = Object.assign({}, KH.state.recordings[i], row);
    else KH.state.recordings.push(row);
    KH.save();
    return row;
  };

  function openDb() {
    return new Promise(function (resolve) {
      if (typeof indexedDB === "undefined") return resolve(null);
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function () {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
      } catch (e) {
        resolve(null);
      }
    });
  }

  KH.putClip = function (id, blob, extra) {
    return openDb().then(function (db) {
      if (!db || !blob) return false;
      return new Promise(function (resolve) {
        try {
          const tx = db.transaction(STORE, "readwrite");
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
          tx.objectStore(STORE).put(Object.assign({ id: id, blob: blob, at: Date.now() }, extra || {}));
        } catch (e) {
          resolve(false);
        }
      });
    });
  };

  KH.getClip = function (id) {
    return openDb().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          const tx = db.transaction(STORE, "readonly");
          const req = tx.objectStore(STORE).get(id);
          req.onsuccess = function () { resolve(req.result || null); };
          req.onerror = function () { resolve(null); };
        } catch (e) {
          resolve(null);
        }
      });
    });
  };

  KH.clearVoiceDb = function () {
    return openDb().then(function (db) {
      if (!db) return;
      try {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).clear();
      } catch (e) { /* ignore */ }
    });
  };

  KH.downloadBlob = function (blob, filename) {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || "aufnahme.webm";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  };

  KH.downloadClip = function (id) {
    return KH.getClip(id).then(function (row) {
      if (!row || !row.blob) return false;
      const ext = (row.mime || row.blob.type || "audio/webm").indexOf("mp4") >= 0 ? "m4a" : "webm";
      KH.downloadBlob(row.blob, "aufnahme-" + id + "." + ext);
      return true;
    });
  };

  KH.formatListenSlip = function (rec) {
    rec = rec || {};
    const ep = rec.ep || KH.currentEpisode || "—";
    const mod = KH.mod ? KH.mod(ep) : null;
    const name = (KH.state.player && KH.state.player.vorname) || "Gast";
    const code = rec.code || KH.makeSpeakCode(ep);
    const lines = [
      "KLEINHAUSEN · Sprechen-Zettel (Partner / Lehrer)",
      "Name: " + name,
      "Episode: " + ep + (mod ? " · " + mod.title : ""),
      "Aufgabe: " + (rec.title || "Gespräch"),
      "Code: " + code,
      "Länge: " + (rec.mode === "text" ? "Text statt Stimme (Nachteilsausgleich)" : ((rec.seconds || 0) + " s")),
      "Linie: " + (rec.line || "—"),
      "Nachfrage: " + (rec.followUp || "—"),
      "",
      "Bitte ankreuzen nach dem Hören:",
      "[ ] Verständlich für eine geduldige Zuhörer*in",
      "[ ] Antwortet auf die Nachfrage (nicht nur ja / nein)",
      "[ ] Novice High: geübte Sätze; Artikel- und Fallfehler okay",
      "",
      "Datei ins Canvas-Assignment „Sprechen — Partner hört zu“ legen.",
      "Der Zettel allein reicht nicht — die Stimme muss zu hören sein."
    ];
    return lines.join("\n");
  };

  KH.copyText = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return false; });
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  };

  function pickMime() {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    if (!global.MediaRecorder) return "";
    if (!MediaRecorder.isTypeSupported) return "";
    for (let i = 0; i < types.length; i++) {
      if (MediaRecorder.isTypeSupported(types[i])) return types[i];
    }
    return "";
  }

  function nextOralId(kind) {
    KH.oralSeq += 1;
    return (KH.currentEpisode || "side") + "-" + (kind || "oral") + "-" + KH.oralSeq;
  }

  KH.renderFollowUp = function (npcId, follow) {
    const npc = (KH.NPCS && KH.NPCS[npcId]) || { name: "Nachfrage", initials: "?", color: "#5a6272" };
    const wrap = document.createElement("div");
    wrap.className = "npc-row followup-row";
    wrap.innerHTML = '<div class="portrait" style="background:' + npc.color + ';color:#fff" aria-hidden="true">' +
      KH.esc(npc.initials) + "</div>" +
      '<div class="bubble followup-bubble"><div class="who">' + KH.esc(npc.name) +
      ' · Nachfrage</div><p>' + KH.esc(follow.de) + "</p>" +
      (follow.en ? '<p class="en">' + KH.esc(follow.en) + "</p>" : "") +
      '<p class="oral-hint">Novice High: sag deine Linie <em>und</em> antworte. Ein Wort reicht nicht.</p></div>';
    return wrap;
  };

  /* Unified gate after a multiple-choice line (or a speak prompt). */
  KH.mountOralGate = function (host, opts, onDone) {
    opts = opts || {};
    const mode = opts.forceMode || KH.oralMode();
    const follow = opts.followUp || KH.GENERIC_FOLLOWUP;
    const npc = opts.npc;
    const title = opts.title || "Sprechen";
    const line = opts.line || "";
    const ep = opts.ep || KH.currentEpisode || "";
    const id = opts.id || nextOralId(opts.kind || "dlg");
    const minChars = opts.minChars || 40;

    if (npc && follow && follow.de) host.appendChild(KH.renderFollowUp(npc, follow));

    if (mode === "skip") {
      host.appendChild(continueRow("Weiter", function () { onDone({ mode: "skip" }); }));
      return;
    }

    if (mode === "exam") {
      const note = document.createElement("p");
      note.className = "oral-exam-note";
      note.textContent = "Prüfungsmodus: keine Aufnahme. Die Nachfrage bleibt sichtbar — klickbares Sprechen nur hier.";
      host.appendChild(note);
      host.appendChild(continueRow("Weiter", function () { onDone({ mode: "exam" }); }));
      return;
    }

    if (mode === "text") {
      mountTyped(host, {
        id: id,
        ep: ep,
        kind: opts.kind || "dialogue",
        title: title,
        line: line,
        followUp: follow,
        minChars: minChars
      }, onDone);
      return;
    }

    KH.mountRecorder(host, {
      id: id,
      ep: ep,
      kind: opts.kind || "dialogue",
      title: title,
      label: opts.label,
      line: line,
      followUp: follow,
      minSeconds: opts.minSeconds || MIN_SEC
    }, onDone);
  };

  function continueRow(label, fn) {
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

  function mountTyped(host, opts, onDone) {
    const card = document.createElement("div");
    card.className = "recorder recorder--text";
    card.innerHTML = "<p class=\"kicker\">Nachteilsausgleich · Text statt Stimme</p>" +
      "<p>Schreib, was du <em>sagen</em> würdest: deine Linie und die Antwort auf die Nachfrage. Mindestens " +
      opts.minChars + " Zeichen.</p>" +
      (opts.line ? "<p><strong>Linie:</strong> " + KH.esc(opts.line) + "</p>" : "");
    const ta = document.createElement("textarea");
    ta.setAttribute("aria-label", "Was du sagen würdest");
    ta.rows = 5;
    card.appendChild(ta);
    const go = document.createElement("button");
    go.className = "btn post";
    go.type = "button";
    go.textContent = "Text abgeben";
    go.addEventListener("click", function () {
      const text = (ta.value || "").trim();
      if (text.length < opts.minChars) {
        KH.live("Bitte noch etwas länger schreiben.");
        ta.focus();
        return;
      }
      const rec = KH.saveRecordingMeta({
        id: opts.id,
        ep: opts.ep,
        kind: opts.kind,
        title: opts.title,
        line: opts.line,
        followUp: opts.followUp.de,
        seconds: 0,
        mode: "text",
        text: text,
        code: KH.makeSpeakCode(opts.ep),
        ready: true
      });
      KH.addPoints("sprechen", 3);
      KH.addPoints("mut", 1);
      go.disabled = true;
      ta.disabled = true;
      card.appendChild(slipBox(rec));
      host.appendChild(continueRow("Weiter", function () { onDone({ mode: "text", text: text }); }));
    });
    card.appendChild(go);
    host.appendChild(card);
  }

  function slipBox(rec) {
    const wrap = document.createElement("div");
    wrap.className = "listen-slip-wrap";
    const pre = document.createElement("pre");
    pre.className = "listen-slip";
    pre.textContent = KH.formatListenSlip(rec);
    const copy = document.createElement("button");
    copy.className = "btn ghost";
    copy.type = "button";
    copy.textContent = "Zettel kopieren (Canvas)";
    copy.addEventListener("click", function () {
      KH.copyText(pre.textContent).then(function (ok) {
        copy.textContent = ok ? "Kopiert" : "Markieren und kopieren";
        KH.live(ok ? "Zettel kopiert" : "Bitte markieren");
      });
    });
    wrap.appendChild(pre);
    wrap.appendChild(copy);
    return wrap;
  }

  KH.mountRecorder = function (host, opts, onDone) {
    opts = opts || {};
    const min = opts.minSeconds || MIN_SEC;
    const card = document.createElement("div");
    card.className = "recorder";
    card.setAttribute("data-state", "idle");

    const kicker = document.createElement("p");
    kicker.className = "kicker";
    kicker.textContent = "Sprechen · mindestens " + min + " Sekunden";
    card.appendChild(kicker);

    const instr = document.createElement("p");
    instr.innerHTML = (opts.label || "Sag deine Linie laut und antworte auf die Nachfrage.") +
      (opts.line ? "<br><strong>Sag zuerst:</strong> " + KH.esc(opts.line) : "");
    card.appendChild(instr);

    if (!global.isSecureContext) {
      const bad = document.createElement("div");
      bad.className = "feedback no";
      bad.textContent = "Aufnahmen brauchen HTTPS oder localhost. Ohne Mikrofon geht diese Szene nicht weiter — außer Nachteilsausgleich oder Prüfungsmodus unter Zugang.";
      card.appendChild(bad);
      host.appendChild(card);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !global.MediaRecorder) {
      const bad = document.createElement("div");
      bad.className = "feedback no";
      bad.textContent = "Dieser Browser kann nicht aufnehmen. Nutze Chrome oder Firefox — oder schalte unter Zugang den Nachteilsausgleich ein.";
      card.appendChild(bad);
      host.appendChild(card);
      return;
    }

    const meter = document.createElement("div");
    meter.className = "recorder-meter";
    meter.setAttribute("aria-live", "polite");
    meter.textContent = "0 / " + min + " s";
    card.appendChild(meter);

    const status = document.createElement("p");
    status.className = "recorder-status";
    status.textContent = "Drücke Start. Unter " + min + " Sekunden zählt die Aufnahme nicht.";
    card.appendChild(status);

    const row = document.createElement("div");
    row.className = "row-btns";
    const start = document.createElement("button");
    start.className = "btn post";
    start.type = "button";
    start.textContent = "Aufnahme starten";
    const stop = document.createElement("button");
    stop.className = "btn warn";
    stop.type = "button";
    stop.textContent = "Stopp";
    stop.disabled = true;
    const retry = document.createElement("button");
    retry.className = "btn ghost";
    retry.type = "button";
    retry.textContent = "Noch einmal";
    retry.hidden = true;
    const dl = document.createElement("button");
    dl.className = "btn ghost";
    dl.type = "button";
    dl.textContent = "Datei laden (.webm)";
    dl.hidden = true;
    row.appendChild(start);
    row.appendChild(stop);
    row.appendChild(retry);
    row.appendChild(dl);
    card.appendChild(row);

    const playerHost = document.createElement("div");
    playerHost.className = "recorder-player";
    card.appendChild(playerHost);

    const err = document.createElement("div");
    err.className = "feedback no hidden";
    card.appendChild(err);

    host.appendChild(card);

    let media = null;
    let recorder = null;
    let chunks = [];
    let tick = null;
    let startedAt = 0;
    let blob = null;
    let mime = pickMime();
    let played = false;
    let doneCalled = false;
    const weiterHost = document.createElement("div");
    host.appendChild(weiterHost);

    function setState(s) {
      card.setAttribute("data-state", s);
    }

    function secondsNow() {
      return Math.floor((Date.now() - startedAt) / 1000);
    }

    function showError(msg) {
      err.classList.remove("hidden");
      err.textContent = msg;
      KH.live(msg);
    }

    function clearError() {
      err.classList.add("hidden");
      err.textContent = "";
    }

    function stopTracks() {
      if (media) media.getTracks().forEach(function (t) { t.stop(); });
      media = null;
    }

    function resetPlayer() {
      playerHost.innerHTML = "";
      blob = null;
      played = false;
      weiterHost.innerHTML = "";
      dl.hidden = true;
    }

    start.addEventListener("click", function () {
      clearError();
      resetPlayer();
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        media = stream;
        chunks = [];
        const recOpts = mime ? { mimeType: mime } : {};
        try {
          recorder = recOpts.mimeType ? new MediaRecorder(stream, recOpts) : new MediaRecorder(stream);
        } catch (e) {
          recorder = new MediaRecorder(stream);
        }
        mime = recorder.mimeType || mime || "audio/webm";
        recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        recorder.onstop = onStop;
        recorder.start(250);
        startedAt = Date.now();
        setState("recording");
        start.disabled = true;
        stop.disabled = false;
        retry.hidden = true;
        status.textContent = "Aufnahme läuft. Sprich weiter — die Nachfrage gehört dazu.";
        KH.live("Aufnahme läuft");
        tick = setInterval(function () {
          const s = secondsNow();
          meter.textContent = s + " / " + min + " s";
          meter.classList.toggle("hot", s < min);
          meter.classList.toggle("ok", s >= min);
          if (s >= MAX_SEC && recorder && recorder.state === "recording") recorder.stop();
        }, 200);
      }).catch(function () {
        showError("Mikrofon ist aus oder blockiert. Ohne Aufnahme geht es nicht weiter — außer Nachteilsausgleich oder Prüfungsmodus unter Zugang.");
        setState("blocked");
      });
    });

    stop.addEventListener("click", function () {
      if (recorder && recorder.state === "recording") recorder.stop();
    });

    retry.addEventListener("click", function () {
      resetPlayer();
      setState("idle");
      start.disabled = false;
      stop.disabled = true;
      retry.hidden = true;
      meter.textContent = "0 / " + min + " s";
      meter.classList.remove("ok", "hot");
      status.textContent = "Noch einmal — mindestens " + min + " Sekunden.";
    });

    function onStop() {
      if (tick) { clearInterval(tick); tick = null; }
      stopTracks();
      const s = Math.max(0, secondsNow());
      meter.textContent = s + " / " + min + " s";
      recorder = null;
      start.disabled = false;
      stop.disabled = true;
      if (s < min) {
        setState("short");
        retry.hidden = false;
        start.disabled = false;
        status.textContent = "Zu kurz (" + s + " s). Novice High braucht die Linie und die Nachfrage — noch einmal, mindestens " + min + " Sekunden.";
        KH.live("Aufnahme zu kurz");
        chunks = [];
        return;
      }
      blob = new Blob(chunks, { type: mime || "audio/webm" });
      chunks = [];
      setState("ready");
      retry.hidden = false;
      dl.hidden = false;
      status.textContent = "Gut. Hör dich an — Weiter geht erst nach dem Abspielen.";
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = URL.createObjectURL(blob);
      audio.setAttribute("aria-label", "Deine Aufnahme");
      playerHost.appendChild(audio);
      function markPlayed() {
        if (played) return;
        played = true;
        unlockWeiter(s);
      }
      audio.addEventListener("ended", markPlayed);
      audio.addEventListener("timeupdate", function () {
        if (audio.duration && audio.currentTime >= Math.min(audio.duration * 0.8, audio.duration - 0.25)) markPlayed();
      });
      dl.onclick = function () {
        const ext = (mime || "").indexOf("mp4") >= 0 ? "m4a" : "webm";
        KH.downloadBlob(blob, "aufnahme-" + opts.id + "." + ext);
      };
    }

    function unlockWeiter(seconds) {
      const rec = KH.saveRecordingMeta({
        id: opts.id,
        ep: opts.ep,
        kind: opts.kind,
        title: opts.title,
        line: opts.line,
        followUp: (opts.followUp && opts.followUp.de) || "",
        seconds: seconds,
        mime: mime,
        mode: "record",
        code: KH.makeSpeakCode(opts.ep),
        ready: true
      });
      KH.putClip(opts.id, blob, { mime: mime, seconds: seconds, ep: opts.ep });
      KH.addPoints("sprechen", 6);
      KH.addPoints("mut", 3);
      KH.live("Aufnahme gespeichert. Weiter ist frei.");
      playerHost.appendChild(slipBox(rec));
      if (doneCalled) return;
      weiterHost.innerHTML = "";
      const row2 = continueRow("Weiter", function () {
        if (doneCalled) return;
        doneCalled = true;
        onDone({ mode: "record", seconds: seconds, id: opts.id });
      });
      weiterHost.appendChild(row2);
    }
  };
})(window);
