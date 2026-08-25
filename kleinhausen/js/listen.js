/* Interpretive listening: pre-rendered speakers + place noise.
   Browser TTS is backup / accessibility — not the Hören task. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.SPEAKERS = {
    lena: { name: "Lena Fröhlich", short: "Lena", npc: "lena", note: "Sprachnachricht" },
    vogel: { name: "Frau Vogel", short: "Frau Vogel", npc: "vogel", note: "Klasse, Raum 12" },
    otto: { name: "Herr Otto", short: "Herr Otto", npc: "otto", note: "Aufnahme, Bäckerei" },
    jonas: { name: "Jonas Fröhlich", short: "Jonas", npc: "jonas", note: "Die Linden" },
    birgit: { name: "Birgit Fröhlich", short: "Birgit", npc: "birgit", note: "Telefon" },
    hanna: { name: "Hanna", short: "Hanna", npc: null, note: "Radio Kleinhausen" },
    aydin: { name: "Frau Aydin", short: "Frau Aydin", npc: "aydin", note: "Bühne, Festplatz" },
    trainer: { name: "Trainer", short: "Trainer", npc: null, note: "Sportplatz" },
    ansage: { name: "Durchsage", short: "Durchsage", npc: null, note: "Lautsprecher" },
    kasse: { name: "Kassierer", short: "Kasse", npc: null, note: "MarktPunkt" }
  };

  KH.LISTEN_CLIPS = {
    "e01-bahnhof": { speaker: "ansage", src: "audio/clips/e01-bahnhof.mp3", place: "Bahnhof Kleinhausen" },
    "e02-lena": { speaker: "lena", src: "audio/clips/e02-lena.mp3", place: "Marktplatz · Handy" },
    "e03-vogel": { speaker: "vogel", src: "audio/clips/e03-vogel.mp3", place: "Raum 12" },
    "e04-hanna": { speaker: "hanna", src: "audio/clips/e04-hanna.mp3", place: "Radio Kleinhausen" },
    "e05-kasse": { speaker: "kasse", src: "audio/clips/e05-kasse.mp3", place: "MarktPunkt · Kasse" },
    "e08-lena": { speaker: "lena", src: "audio/clips/e08-lena.mp3", place: "Handy" },
    "e10-trainer": { speaker: "trainer", src: "audio/clips/e10-trainer.mp3", place: "Sportplatz" },
    "e12-birgit": { speaker: "birgit", src: "audio/clips/e12-birgit.mp3", place: "Telefon" },
    "e13-ansage": { speaker: "ansage", src: "audio/clips/e13-ansage.mp3", place: "Gleis 2" },
    "e14-jonas": { speaker: "jonas", src: "audio/clips/e14-jonas.mp3", place: "Festplatz · Bühne" },
    "e15-otto": { speaker: "otto", src: "audio/clips/e15-otto.mp3", place: "Sonnenkorn" },
    "e16-aydin": { speaker: "aydin", src: "audio/clips/e16-aydin.mp3", place: "Festplatz" },
    "sq-radio": { speaker: "hanna", src: "audio/clips/sq-radio.mp3", place: "UKW" }
  };

  KH.listenClip = function (scene) {
    if (!scene) return null;
    if (scene.listenId && KH.LISTEN_CLIPS[scene.listenId]) {
      return Object.assign({ id: scene.listenId }, KH.LISTEN_CLIPS[scene.listenId]);
    }
    if (scene.src) {
      return {
        id: scene.listenId || "custom",
        speaker: scene.speaker || "ansage",
        src: scene.src,
        place: scene.place || ""
      };
    }
    return null;
  };

  KH.mountListenPlayer = function (host, scene, onHeard) {
    const clip = KH.listenClip(scene);
    const text = scene.audio || scene.plain || "";
    const who = clip ? (KH.SPEAKERS[clip.speaker] || { name: clip.speaker, note: "" }) : null;
    const card = document.createElement("div");
    card.className = "listen-deck";

    const meta = document.createElement("p");
    meta.className = "listen-who";
    if (who) {
      meta.innerHTML = "<strong>" + KH.esc(who.name) + "</strong>" +
        (who.note ? " · " + KH.esc(who.note) : "") +
        (clip.place ? '<span class="en">' + KH.esc(clip.place) + "</span>" : "");
    } else {
      meta.textContent = "Aufnahme nicht gefunden — Vorlesen als Ersatz.";
    }
    card.appendChild(meta);

    const hint = document.createElement("p");
    hint.className = "listen-hint";
    hint.textContent = "Hör zu. Langsamer macht die Stimme langsamer — das Transkript bleibt zu.";
    card.appendChild(hint);

    const audio = document.createElement("audio");
    audio.preload = "auto";
    audio.setAttribute("aria-label", (who && who.name) || "Hörtext");
    if (clip) audio.src = clip.src;

    const transport = document.createElement("div");
    transport.className = "listen-transport";

    const play = document.createElement("button");
    play.className = "btn post";
    play.type = "button";
    play.textContent = "Abspielen";

    const speeds = [1, 0.75, 0.5];
    const speedGroup = document.createElement("div");
    speedGroup.className = "listen-speeds";
    speedGroup.setAttribute("role", "group");
    speedGroup.setAttribute("aria-label", "Tempo");
    let rate = 1;
    const speedBtns = [];
    speeds.forEach(function (r) {
      const b = document.createElement("button");
      b.className = "btn ghost" + (r === 1 ? " is-on" : "");
      b.type = "button";
      b.textContent = r === 1 ? "1×" : (r === 0.75 ? "¾" : "½");
      b.setAttribute("aria-pressed", r === 1 ? "true" : "false");
      b.addEventListener("click", function () {
        rate = r;
        audio.playbackRate = r;
        if (audio.preservesPitch !== undefined) audio.preservesPitch = true;
        speedBtns.forEach(function (x) {
          x.classList.toggle("is-on", x === b);
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        KH.live(r === 1 ? "Normales Tempo" : ("Tempo " + r + " — Transkript bleibt zu"));
      });
      speedBtns.push(b);
      speedGroup.appendChild(b);
    });

    const status = document.createElement("p");
    status.className = "listen-status";
    status.textContent = clip ? "Noch nicht gehört." : "Keine Datei — nutze Vorlesen.";

    let heard = false;
    function markHeard(how) {
      if (heard) return;
      heard = true;
      status.textContent = how === "tts"
        ? "TTS-Ersatz gehört. Das ist die Barrierefreiheit — die Aufgabe ist die Aufnahme."
        : "Gehört. Du kannst noch einmal oder langsamer hören.";
      if (onHeard) onHeard();
    }

    play.addEventListener("click", function () {
      KH.stopSpeak();
      if (!clip || audio.error || !audio.src) {
        status.textContent = "Aufnahme fehlt. Vorlesen (TTS) ist der Ersatz.";
        return;
      }
      audio.playbackRate = rate;
      if (audio.preservesPitch !== undefined) audio.preservesPitch = true;
      if (audio.paused) {
        audio.play().then(function () {
          play.textContent = "Pause";
          KH.live((who && who.short) || "Aufnahme");
        }).catch(function () {
          status.textContent = "Abspielen blockiert. Nutze Vorlesen (TTS) als Ersatz.";
        });
      } else {
        audio.pause();
        play.textContent = "Weiter";
      }
    });
    audio.addEventListener("ended", function () {
      play.textContent = "Nochmal";
      markHeard("file");
    });
    audio.addEventListener("timeupdate", function () {
      if (audio.duration && audio.currentTime >= Math.min(audio.duration * 0.8, audio.duration - 0.2)) {
        markHeard("file");
      }
    });
    audio.addEventListener("error", function () {
      status.textContent = "Datei nicht geladen. Vorlesen (TTS) ist der Ersatz.";
      fallback.classList.add("is-needed");
    });

    transport.appendChild(play);
    transport.appendChild(speedGroup);
    card.appendChild(transport);
    card.appendChild(audio);
    card.appendChild(status);

    const fallback = document.createElement("div");
    fallback.className = "listen-fallback";
    const fbBtn = document.createElement("button");
    fbBtn.className = "btn ghost";
    fbBtn.type = "button";
    fbBtn.textContent = "Vorlesen (TTS · Ersatz)";
    fbBtn.addEventListener("click", function () {
      KH.speak(text);
      markHeard("tts");
    });
    const fbNote = document.createElement("p");
    fbNote.className = "en";
    fbNote.textContent = "Browser voice is the accessibility layer, not the station announcement.";
    fallback.appendChild(fbBtn);
    fallback.appendChild(fbNote);
    card.appendChild(fallback);

    host.appendChild(card);
    if (!clip) {
      fallback.classList.add("is-needed");
    }
    return { audio: audio, markHeard: markHeard };
  };
})(window);
