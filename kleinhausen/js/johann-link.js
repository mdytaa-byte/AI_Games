/* "Frag Johann": the AI tutor from ../johann, opened in a side panel with the
   current episode and scene. Hidden in Prüfungsmodus and during the IPA. */
(function (global) {
  const KH = global.KH;
  const TYPE_LABEL = {
    narrate: "story", dialogue: "dialogue", speak: "speaking task", write: "writing task", cloze: "gap text",
    match: "matching task", form: "form", activity: "practice game", culture: "culture note", simulate: "simulation",
    room: "room task", counter: "shop counter", funk: "radio message"
  };
  let scene = null;
  let ready = false;

  // ../johann on the website; johann/ inside the SCORM package.
  function load(srcs) {
    if (!srcs.length) return;
    const s = document.createElement("script");
    s.src = srcs[0];
    s.dataset.preset = "kleinhausen";
    s.dataset.label = "Frag Johann";
    s.onload = function () { ready = true; KH.johannSync(); };
    s.onerror = function () { s.remove(); load(srcs.slice(1)); };
    document.body.appendChild(s);
  }

  function currentModule() {
    if (KH.currentEpisode) return KH.mod(KH.currentEpisode);
    // In the town: the first episode that is open but not done.
    return (KH.MODULES || []).find(function (m) {
      const e = KH.state.episodes[m.id];
      return e && e.status !== "locked" && e.status !== "done";
    }) || (KH.MODULES || [])[0];
  }

  /* Is Johann allowed right now? Never during exams or the summative IPA. */
  KH.johannAllowed = function () {
    if (!ready || !global.AskJohann || !global.AskJohann.enabled) return false;
    if (KH.isExam && KH.isExam()) return false;
    if (scene && scene.type === "ipa") return false;
    return true;
  };

  function context() {
    const m = currentModule();
    if (!m) return { ep: null, context: "the Kleinhausen course", graded: false };
    const where = 'Kleinhausen Episode ' + m.n + ' "' + m.title + '"';
    if (!scene) return { ep: m.n, context: where + " (the student is in the town, between scenes)", graded: false };
    const title = scene.title || (scene.de || "").slice(0, 60);
    return {
      ep: m.n,
      context: where + ', scene "' + title + '" (' + (TYPE_LABEL[scene.type] || "task") + ")",
      // "Nachweis" scenes are proof tasks: Johann coaches only.
      graded: /nachweis/i.test(title)
    };
  }

  /* Called after every screen change. */
  KH.johannSync = function (opts) {
    if (opts) scene = opts.scene || null;
    const headBtn = document.getElementById("askj");
    if (headBtn) headBtn.hidden = !KH.johannAllowed();
    if (!global.AskJohann) return;
    if (!KH.johannAllowed()) { global.AskJohann.hide(); return; }
    const c = context();
    global.AskJohann.setContext({ ep: c.ep, context: c.context, graded: c.graded ? "1" : "0", mode: "ask" });
    global.AskJohann.show();
  };

  KH.askJohann = function (extra) {
    if (!KH.johannAllowed()) return;
    const c = context();
    global.AskJohann.open(Object.assign({ ep: c.ep, context: c.context, graded: c.graded ? "1" : "0", mode: "ask" }, extra || {}));
  };

  // Practice games run in an iframe and ask the course page to open Johann.
  global.addEventListener("message", function (e) {
    const d = e.data;
    if (!d || d.type !== "kh-johann") return;
    if (e.origin !== location.origin && e.origin !== "null") return;
    KH.askJohann({ context: d.context || undefined });
  });

  function start() { load(["../johann/ask-johann.js", "johann/ask-johann.js"]); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(window);
