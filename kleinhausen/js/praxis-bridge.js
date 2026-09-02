/* Course hook for praxis HTML: enamel tokens, weather/name, write-back on real finish. */
(function () {
  const params = new URLSearchParams(location.search);
  if (params.get("kh") !== "1") return;

  const weather = params.get("weather") || "overcast";
  const name = params.get("name") || "";
  const gfx = params.get("gfx") || "high";
  const contrast = params.get("contrast") || "normal";
  const size = params.get("size") || "m";
  const font = params.get("font") || "default";
  const motion = params.get("motion") || "full";
  const id = (location.pathname.split("/").pop() || "praxis").replace(/\.html$/, "");
  const OUTBOX = "kleinhausen.praxis.outbox";

  const root = document.documentElement;
  root.setAttribute("data-kh", "1");
  root.setAttribute("data-kh-weather", weather);
  root.setAttribute("data-gfx", gfx);
  root.setAttribute("data-contrast", contrast === "hoch" ? "hoch" : "normal");
  root.setAttribute("data-size", size);
  root.setAttribute("data-font", font);
  root.setAttribute("data-motion", motion);
  if (contrast === "hoch") {
    root.setAttribute("data-kontrast", "an");
    root.setAttribute("data-kontrast", "1");
  }
  if (font === "lesbar") root.setAttribute("data-lesbar", "1");
  if (motion === "reduce") root.setAttribute("data-bewegung", "aus");
  if (size === "l") root.setAttribute("data-schrift", "gross");
  if (size === "xl") root.setAttribute("data-schrift", "sehr-gross");

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../css/enamel.css";
  document.head.appendChild(link);

  const wx = document.createElement("div");
  wx.id = "kh-course-wx";
  wx.setAttribute("aria-hidden", "true");
  document.body.appendChild(wx);

  const bar = document.createElement("div");
  bar.id = "kh-course-bar";
  const label = { rain: "Regen", sun: "Sonne", cold: "Kalt", overcast: "Bewölkt" }[weather] || weather;
  bar.innerHTML = "<span>Kleinhausen · " + label + (name ? " · " + name : "") + "</span>" +
    '<span id="kh-course-note">Mission zu Ende spielen — dann zählt sie im Heft.</span>' +
    '<button type="button" id="kh-course-back" disabled>Noch nicht fertig</button>';
  document.body.appendChild(bar);

  function send(event, extra) {
    const payload = Object.assign({ type: "kh-praxis", event: event, id: id, weather: weather }, extra || {});
    try {
      if (window.parent && window.parent !== window) window.parent.postMessage(payload, "*");
    } catch (e) { /* ignore */ }
    try { window.postMessage(payload, "*"); } catch (e2) { /* ignore */ }
    if (event === "done" && payload.complete) {
      try { localStorage.setItem(OUTBOX, JSON.stringify(payload)); } catch (e3) { /* ignore */ }
    }
  }

  const KHPraxis = window.KHPraxis = {
    id: id,
    weather: weather,
    gfx: gfx,
    _done: false,
    send: send,
    isComplete: function () { return KHPraxis._done; },
    complete: function (extra) {
      if (KHPraxis._done) {
        send("done", Object.assign({ complete: true }, extra || {}));
        return;
      }
      KHPraxis._done = true;
      extra = extra || {};
      const note = document.getElementById("kh-course-note");
      const back = document.getElementById("kh-course-back");
      if (note) note.textContent = extra.title || extra.artifact || "Im Heft: Praxis zählt.";
      if (back) {
        back.disabled = false;
        back.textContent = "Fertig — zurück zum Kurs";
      }
      send("done", Object.assign({ complete: true }, extra));
    }
  };

  send("ready");
  document.getElementById("kh-course-back").addEventListener("click", function () {
    if (!KHPraxis._done) return;
    send("exit", { complete: true });
  });

  function watchErgebnis() {
    const box = document.getElementById("ergebnis");
    if (!box) return;
    const poke = function () {
      if (!box.hidden && !KHPraxis._done) {
        const codeEl = box.querySelector(".code");
        KHPraxis.complete({
          title: "Schicht beendet",
          artifact: "Lieferdienst: Schicht im Heft. Zentrale kennt deinen Weg.",
          code: codeEl ? codeEl.textContent : ""
        });
      }
    };
    poke();
    if (window.MutationObserver) {
      new MutationObserver(poke).observe(box, { attributes: true, attributeFilter: ["hidden", "class"] });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchErgebnis);
  } else {
    watchErgebnis();
  }
})();
