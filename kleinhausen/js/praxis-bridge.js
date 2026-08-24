/* Course hook for praxis HTML: same weather/name as the hub, write-back on exit. */
(function () {
  const params = new URLSearchParams(location.search);
  if (params.get("kh") !== "1") return;

  const weather = params.get("weather") || "overcast";
  const name = params.get("name") || "";
  const id = (location.pathname.split("/").pop() || "praxis").replace(/\.html$/, "");

  document.documentElement.setAttribute("data-kh-weather", weather);

  const style = document.createElement("style");
  style.textContent =
    "#kh-course-bar{position:fixed;left:10px;right:10px;bottom:10px;z-index:80;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:.45em .7em;background:#14385c;color:#fffaf0;border:3px solid #f5c400;font:700 .88rem/1.3 system-ui,sans-serif}" +
    "#kh-course-bar button{min-height:40px;padding:.35em .8em;border:2px solid #f5c400;background:#f5c400;color:#0c243c;font:700 .85rem system-ui,sans-serif;cursor:pointer}" +
    "#kh-course-wx{pointer-events:none;position:fixed;inset:0;z-index:7}" +
    'html[data-kh-weather="rain"] #kh-course-wx{background:repeating-linear-gradient(-18deg,transparent 0 13px,rgba(255,255,255,.1) 13px 14px);box-shadow:inset 0 0 120px rgba(10,16,24,.35)}' +
    'html[data-kh-weather="cold"] #kh-course-wx{box-shadow:inset 0 0 140px rgba(200,220,235,.28)}' +
    'html[data-kh-weather="sun"] #kh-course-wx{box-shadow:inset 0 0 80px rgba(242,194,48,.08)}';
  document.head.appendChild(style);

  const wx = document.createElement("div");
  wx.id = "kh-course-wx";
  wx.setAttribute("aria-hidden", "true");
  document.body.appendChild(wx);

  const bar = document.createElement("div");
  bar.id = "kh-course-bar";
  const label = { rain: "Regen", sun: "Sonne", cold: "Kalt", overcast: "Bewölkt" }[weather] || weather;
  bar.innerHTML = "<span>Kleinhausen · " + label + (name ? " · " + name : "") + "</span>" +
    '<button type="button" id="kh-course-back">Fertig — zurück zum Kurs</button>';
  document.body.appendChild(bar);

  function send(event, extra) {
    const payload = Object.assign({ type: "kh-praxis", event: event, id: id }, extra || {});
    try {
      if (window.parent && window.parent !== window) window.parent.postMessage(payload, "*");
    } catch (e) { /* ignore */ }
    try { window.postMessage(payload, "*"); } catch (e2) { /* ignore */ }
  }

  send("ready");
  document.getElementById("kh-course-back").addEventListener("click", function () {
    send("done");
    send("exit");
  });
})();
