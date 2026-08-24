/* Illustrated (and low-fi) town map. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.mapSVG = function () {
    const places = KH.PLACES;
    const you = KH.currentPlace || "haus";
    let pins = "";
    Object.keys(places).forEach(function (id) {
      const p = places[id];
      const x = p.x * 10;
      const y = p.y * 6.4;
      pins += '<g class="map-hotspot" tabindex="0" role="button" data-place="' + id + '" aria-label="' + KH.esc(p.name) + '">' +
        '<circle class="hs-ring" cx="' + x + '" cy="' + y + '" r="22" fill="none" stroke="#f5c400" stroke-width="3"></circle>' +
        '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#14385c" stroke="#fff" stroke-width="2"></circle>' +
        '<text x="' + x + '" y="' + (y + 22) + '" text-anchor="middle" font-size="11" font-family="Georgia,serif" fill="#14385c">' + KH.esc(p.name) + "</text></g>";
    });
    const yp = places[you] || places.haus;
    const yx = yp.x * 10, yy = yp.y * 6.4;
    return '<svg viewBox="0 0 1000 640" role="img" aria-label="Stadtplan von Kleinhausen">' +
      '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec4e8"/><stop offset="1" stop-color="#d7e6c8"/></linearGradient></defs>' +
      '<rect width="1000" height="640" fill="url(#sky)"/>' +
      '<path d="M0 430 C 180 400, 260 520, 400 500 C 560 478, 620 560, 1000 520 L 1000 640 L 0 640 Z" fill="#7dae6a"/>' +
      '<path d="M0 360 C 200 300, 280 390, 420 370 C 600 348, 640 430, 1000 390 L 1000 470 C 700 500, 520 420, 360 450 C 200 478, 80 410, 0 430 Z" fill="#4a8fb8"/>' +
      '<rect x="120" y="250" width="760" height="18" rx="4" fill="#e8dcc8"/>' +
      '<rect x="470" y="140" width="18" height="360" rx="4" fill="#e8dcc8"/>' +
      '<rect x="250" y="200" width="14" height="280" fill="#e8dcc8"/>' +
      '<rect x="700" y="180" width="14" height="300" fill="#e8dcc8"/>' +
      '<circle cx="480" cy="295" r="42" fill="#d9cbb3" stroke="#14385c" stroke-width="2"/>' +
      '<rect x="400" y="210" width="70" height="58" fill="#8c3d3a" stroke="#14385c"/>' +
      '<rect x="430" y="190" width="18" height="22" fill="#f5c400"/>' +
      '<rect x="250" y="230" width="50" height="70" fill="#cfc3a8" stroke="#14385c"/>' +
      '<polygon points="250,230 275,205 300,230" fill="#5c3d2e"/>' +
      '<rect x="790" y="430" width="90" height="40" fill="#5a6570"/>' +
      '<rect x="70" y="280" width="80" height="50" fill="#6a7b8c"/>' +
      '<text x="500" y="36" text-anchor="middle" font-size="22" font-family="Georgia,serif" fill="#14385c">Kleinhausen · 750 Jahre</text>' +
      pins +
      '<g class="you-pin" aria-hidden="true"><polygon points="' + yx + ',' + (yy - 28) + ' ' + (yx - 10) + ',' + (yy - 8) + ' ' + (yx + 10) + ',' + (yy - 8) + '" fill="#b54732"/><circle cx="' + yx + '" cy="' + (yy - 34) + '" r="8" fill="#f5c400" stroke="#14385c"/></g>' +
      "</svg>";
  };

  KH.bindMap = function (root, onPlace) {
    root.querySelectorAll("[data-place]").forEach(function (g) {
      function go() { onPlace(g.getAttribute("data-place")); }
      g.addEventListener("click", go);
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
    });
  };
})(window);
