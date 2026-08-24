/* Speech, live regions, keyboard helpers. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.live = function (msg) {
    const el = document.getElementById("live");
    if (!el) return;
    el.textContent = "";
    window.setTimeout(function () { el.textContent = msg; }, 40);
  };

  KH.speak = function (text, lang) {
    if (!KH.state.player.tts || !text) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || "de-DE";
    u.rate = KH.state.player.ttsRate || 0.9;
    const voices = window.speechSynthesis.getVoices() || [];
    const de = voices.find(function (v) { return /de[-_]?DE|German/i.test(v.lang + v.name); });
    if (de) u.voice = de;
    window.speechSynthesis.speak(u);
  };

  KH.stopSpeak = function () {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  KH.en = function (de, en) {
    if (!en) return de;
    return de + '<span class="en">' + en + "</span>";
  };

  KH.du = function () {
    return KH.state.player.vorname || "du";
  };

  KH.rolleNoun = function () {
    const r = KH.state.player.rolle;
    if (r === "schuelerin") return "Gastschülerin";
    if (r === "schueler") return "Gastschüler";
    return "Gastschüler/in";
  };

  KH.bindKeys = function (map) {
    function onKey(ev) {
      if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
      const fn = map[ev.key];
      if (fn) {
        ev.preventDefault();
        fn();
      }
    }
    document.addEventListener("keydown", onKey);
    return function () { document.removeEventListener("keydown", onKey); };
  };

  KH.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  KH.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  KH.norm = function (s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9äöü\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  KH.containsAny = function (text, needles) {
    const n = KH.norm(text);
    return needles.some(function (x) { return n.indexOf(KH.norm(x)) >= 0; });
  };
})(window);
