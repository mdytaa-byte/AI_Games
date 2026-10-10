/*
  "Ask Johann": opens Johann, the AI German tutor, in a side panel on any page.

  1. Add the script. Its data-* attributes are the defaults for every button:
       <script src="https://YOUR-SITE/johann/ask-johann.js"
               data-course="Glockenspiel" data-level="A1"
               data-unit="Lektion 3: Familie" data-mode="ask"></script>
     Course fields: data-kurs (a course code from Johann's teacher tools), or
     data-course, data-level, data-program, data-unit, data-grammar, data-vocab,
     data-cando. Also: data-preset="kleinhausen" with data-ep="5".
     Button: data-label, data-position="left|right", data-floating="off".
     Optional school link: data-proxy, data-code.

  2. Buttons for a specific task, no JavaScript needed:
       <button data-ask-johann data-mode="write" data-context="Übung 4b" data-graded="1">Frag Johann</button>

  3. Or from code:
       AskJohann.open({ mode: "vocab", context: "Lektion 3 Wortschatz" });
       AskJohann.setContext({ ep: 5, context: "…" });   // updates the floating button
       AskJohann.hide(); AskJohann.show();
*/
(function () {
  if (window.AskJohann) return;
  const script = document.currentScript;
  const base = new URL(".", script ? script.src : location.href).href;
  const KEYS = ["kurs", "preset", "ep", "mode", "context", "graded", "focus", "program", "level", "course", "unit", "grammar", "vocab", "cando", "proxy", "code"];
  const defaults = {};
  const ui = { label: "Frag Johann", position: "right", floating: "on" };
  if (script) {
    for (const k of KEYS) if (script.dataset[k] != null) defaults[k] = script.dataset[k];
    for (const k of Object.keys(ui)) if (script.dataset[k]) ui[k] = script.dataset[k];
  }
  let enabled = true, hidden = false;

  // School settings (johann/config.js) can switch every button off.
  const cfg = document.createElement("script");
  cfg.src = base + "config.js";
  cfg.onload = () => {
    if (window.JOHANN_CONFIG && window.JOHANN_CONFIG.buttons === false) { enabled = false; render(); }
  };
  document.head.appendChild(cfg);

  function url(opts, embed) {
    const o = Object.assign({}, defaults, opts || {});
    const q = new URLSearchParams();
    for (const k of KEYS) if (o[k] != null && o[k] !== "") q.set(k, String(o[k]));
    if (!q.has("mode")) q.set("mode", "ask");
    if (embed) q.set("embed", "1");
    return base + "index.html?" + q.toString();
  }

  // Everything lives in a shadow root so page styles and ours never mix.
  const host = document.createElement("div");
  host.setAttribute("data-ask-johann-host", "");
  const root = host.attachShadow({ mode: "open" });
  const side = ui.position === "left" ? "left" : "right";
  root.innerHTML = `<style>
    :host{all:initial}
    .fab{position:fixed;${side}:18px;bottom:18px;z-index:2147483000;display:flex;align-items:center;gap:8px;background:#C8553D;color:#fff;border:0;border-radius:999px;padding:8px 16px 8px 8px;font:700 15px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.3);cursor:pointer}
    .fab:hover{background:#A7412C} .fab:focus-visible,.x:focus-visible,.tab:focus-visible{outline:3px solid #E0A841;outline-offset:2px}
    .fab i{width:30px;height:30px;border-radius:50%;background:#FAF6EC;display:grid;place-items:center;font-style:normal;font-size:17px}
    .panel{position:fixed;top:0;${side}:0;height:100%;width:min(460px,100vw);z-index:2147483001;background:#1F2C3A;box-shadow:0 0 30px rgba(0,0,0,.4);display:flex;flex-direction:column;transform:translateX(${side === "right" ? "" : "-"}100%);transition:transform .25s ease;visibility:hidden}
    .panel.open{transform:none;visibility:visible}
    @media (prefers-reduced-motion:reduce){.panel{transition:none}}
    .bar{display:flex;align-items:center;gap:8px;padding:8px 10px;color:#F4EFE3;font:700 14px system-ui,sans-serif}
    .bar span{flex:1}
    .x,.tab{background:transparent;border:1.5px solid rgba(244,239,227,.45);color:#F4EFE3;border-radius:999px;padding:4px 10px;font:700 13px system-ui,sans-serif;cursor:pointer;text-decoration:none}
    iframe{flex:1;border:0;width:100%;background:#1F2C3A}
    [hidden]{display:none !important}
  </style>
  <button class="fab" type="button" part="button" aria-haspopup="dialog"><i aria-hidden="true">🎓</i><span></span></button>
  <div class="panel" role="dialog" aria-label="Johann, German tutor">
    <div class="bar"><span>Johann · dein Deutschlehrer</span><a class="tab" target="_blank" rel="noopener" title="Open in a new tab">↗</a><button class="x" type="button" aria-label="Close Johann">✕</button></div>
  </div>`;
  const fab = root.querySelector(".fab"), panel = root.querySelector(".panel"), tab = root.querySelector(".tab");
  fab.querySelector("span").textContent = ui.label;
  let frame = null, lastFocus = null;

  function render() {
    fab.hidden = !enabled || hidden || ui.floating === "off" || panel.classList.contains("open");
  }
  function open(opts) {
    if (!enabled) return;
    const src = url(opts, true);
    if (!frame || frame.dataset.src !== src) {
      if (frame) frame.remove();
      frame = document.createElement("iframe");
      frame.title = "Johann, German tutor";
      frame.allow = "microphone; autoplay; clipboard-write";
      frame.dataset.src = src;
      frame.src = src;
      panel.appendChild(frame);
    }
    tab.href = url(opts, false);
    lastFocus = document.activeElement;
    panel.classList.add("open");
    render();
    setTimeout(() => frame.focus(), 50);
  }
  function close() {
    panel.classList.remove("open");
    render();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  fab.addEventListener("click", () => open());
  root.querySelector(".x").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("open")) close(); });

  // Declarative buttons: <button data-ask-johann data-mode="…" data-context="…">
  document.addEventListener("click", (e) => {
    const el = e.target.closest && e.target.closest("[data-ask-johann]");
    if (!el) return;
    e.preventDefault();
    const o = {};
    for (const k of KEYS) if (el.dataset[k] != null) o[k] = el.dataset[k];
    open(o);
  });

  // Pages in iframes (e.g. Kleinhausen practice games) can ask the top page to open Johann.
  window.addEventListener("message", (e) => {
    const d = e.data;
    if (!d || d.type !== "ask-johann") return;
    if (e.origin !== location.origin && e.origin !== "null") return;
    open(d.opts || {});
  });

  function mount() { document.body.appendChild(host); render(); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  window.AskJohann = {
    open, close,
    url: (opts) => url(opts, false),
    setContext(opts) {
      for (const k of KEYS) if (opts && k in opts) { if (opts[k] == null) delete defaults[k]; else defaults[k] = opts[k]; }
    },
    hide() { hidden = true; if (panel.classList.contains("open")) close(); render(); },
    show() { hidden = false; render(); },
    get enabled() { return enabled; }
  };
  document.dispatchEvent(new CustomEvent("askjohann:ready"));
})();
