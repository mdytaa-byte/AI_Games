/* Persistent student progress. localStorage + optional SCORM suspend_data. */
(function (global) {
  const KH = global.KH = global.KH || {};
  const KEY = "kleinhausen.course.v1";

  KH.defaultState = function () {
    const episodes = {};
    for (let i = 1; i <= 16; i++) {
      const id = "e" + String(i).padStart(2, "0");
      episodes[id] = {
        status: i === 1 ? "open" : "locked",
        scene: 0,
        answers: {},
        formative: 0,
        formativeMax: 0,
        summative: null,
        startedAt: null,
        completedAt: null
      };
    }
    return {
      version: 1,
      player: {
        vorname: "",
        herkunft: "den USA",
        rolle: "neutral",
        gfx: "high",
        gloss: true,
        contrast: false,
        size: "m",
        font: "default",
        motion: "full",
        tts: true,
        ttsRate: 0.9,
        captions: true,
        exam: false
      },
      points: { verstehen: 0, sprechen: 0, kultur: 0, mut: 0 },
      npcs: {},
      inventory: [],
      discoveries: [],
      stamps: [],
      flags: {},
      journal: [],
      sidequests: {},
      episodes,
      onboarding: false
    };
  };

  KH.state = KH.defaultState();

  KH.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        KH.state = KH.merge(KH.defaultState(), parsed);
      }
    } catch (e) { /* private mode */ }
    if (KH.SCORM && KH.SCORM.active) {
      const sus = KH.SCORM.get("cmi.suspend_data", "cmi.suspend_data");
      if (sus) {
        try {
          const parsed = JSON.parse(sus);
          KH.state = KH.merge(KH.defaultState(), parsed);
        } catch (e) { /* ignore */ }
      }
    }
    return KH.state;
  };

  KH.merge = function (base, extra) {
    if (!extra || typeof extra !== "object") return base;
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(extra).forEach(function (k) {
      if (extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k]) && typeof base[k] === "object") {
        out[k] = KH.merge(base[k] || {}, extra[k]);
      } else {
        out[k] = extra[k];
      }
    });
    return out;
  };

  KH.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(KH.state)); } catch (e) { /* quota */ }
    if (KH.SCORM && KH.SCORM.active) {
      const slim = {
        player: KH.state.player,
        points: KH.state.points,
        episodes: {},
        stamps: KH.state.stamps,
        flags: KH.state.flags,
        discoveries: KH.state.discoveries,
        onboarding: KH.state.onboarding
      };
      Object.keys(KH.state.episodes).forEach(function (id) {
        const e = KH.state.episodes[id];
        slim.episodes[id] = {
          status: e.status,
          scene: e.scene,
          formative: e.formative,
          summative: e.summative,
          completedAt: e.completedAt
        };
      });
      const done = Object.values(KH.state.episodes).filter(function (e) { return e.status === "done"; }).length;
      KH.SCORM.setProgress("ep:" + done, JSON.stringify(slim), KH.overallScore());
    }
  };

  KH.reset = function () {
    KH.state = KH.defaultState();
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    KH.save();
  };

  KH.overallScore = function () {
    const eps = Object.values(KH.state.episodes);
    const scored = eps.filter(function (e) { return e.summative && typeof e.summative.score === "number"; });
    if (!scored.length) return Math.round((eps.filter(function (e) { return e.status === "done"; }).length / 16) * 100);
    const avg = scored.reduce(function (s, e) { return s + e.summative.score; }, 0) / scored.length;
    return Math.round(avg);
  };

  KH.addPoints = function (kind, n) {
    if (!KH.state.points[kind]) KH.state.points[kind] = 0;
    KH.state.points[kind] += n;
    KH.save();
  };

  KH.trust = function (npc, delta) {
    if (!KH.state.npcs[npc]) KH.state.npcs[npc] = { trust: 0 };
    KH.state.npcs[npc].trust = Math.max(0, Math.min(5, (KH.state.npcs[npc].trust || 0) + delta));
    KH.save();
    return KH.state.npcs[npc].trust;
  };

  KH.unlockEpisode = function (id) {
    if (KH.state.episodes[id] && KH.state.episodes[id].status === "locked") {
      KH.state.episodes[id].status = "open";
      KH.save();
    }
  };

  KH.completeEpisode = function (id, summative) {
    const e = KH.state.episodes[id];
    if (!e) return;
    e.status = "done";
    e.completedAt = Date.now();
    if (summative) e.summative = summative;
    const n = parseInt(id.slice(1), 10);
    if (n < 16) KH.unlockEpisode("e" + String(n + 1).padStart(2, "0"));
    if (KH.STAMPS && KH.STAMPS[id] && KH.state.stamps.indexOf(id) < 0) KH.state.stamps.push(id);
    KH.save();
    const done = Object.values(KH.state.episodes).filter(function (x) { return x.status === "done"; }).length;
    if (done >= 16 && KH.SCORM) KH.SCORM.complete(KH.overallScore());
  };

  KH.discover = function (id) {
    if (KH.state.discoveries.indexOf(id) < 0) {
      KH.state.discoveries.push(id);
      KH.addPoints("kultur", 5);
      KH.save();
      return true;
    }
    return false;
  };

  KH.residentRank = function () {
    const done = Object.values(KH.state.episodes).filter(function (e) { return e.status === "done"; }).length;
    if (done >= 16) return { de: "Kleinhausener/in", en: "a true Kleinhausen local", n: 5 };
    if (done >= 12) return { de: "Einwohner/in", en: "resident", n: 4 };
    if (done >= 8) return { de: "Nachbar/in", en: "neighbor", n: 3 };
    if (done >= 4) return { de: "Gast", en: "guest", n: 2 };
    return { de: "Neuankömmling", en: "newcomer", n: 1 };
  };

  KH.makeCode = function (id) {
    const name = (KH.state.player.vorname || "Gast").slice(0, 8).toUpperCase().replace(/[^A-ZÄÖÜ]/g, "");
    const score = (KH.state.episodes[id] && KH.state.episodes[id].summative && KH.state.episodes[id].summative.score) || 0;
    const salt = (id + name + score + "KLEINHAUSEN").split("").reduce(function (a, c) { return (a + c.charCodeAt(0) * 13) % 9973; }, 17);
    return (id.toUpperCase() + "-" + name + "-" + String(1000 + (salt % 9000)));
  };

  KH.applyPrefs = function () {
    const p = KH.state.player;
    const root = document.documentElement;
    root.lang = "de";
    root.setAttribute("data-gfx", p.gfx || "high");
    root.setAttribute("data-gloss", p.gloss ? "on" : "off");
    root.setAttribute("data-contrast", p.contrast ? "hoch" : "normal");
    root.setAttribute("data-size", p.size || "m");
    root.setAttribute("data-font", p.font || "default");
    root.setAttribute("data-motion", p.motion || "full");
  };
})(window);
