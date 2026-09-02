/* First-person Kleinhausen — same street grid and enamel craft as
   Lieferdienst / Foto-Schnitzeljagd. High-gfx hub walks this town.
   Weather and last footsteps live on KH.state (shared with the course). */
(function (global) {
  const KH = global.KH = global.KH || {};

  const COL_X = [-90, -30, 30, 90];
  const ROW_Z = [-90, -30, 30, 90];
  const STRASSE_V = ["Mühlgasse", "Bäckergasse", "Kirchweg", "Schulstraße"];
  const STRASSE_H = ["Lindenallee", "Marktstraße", "Rosenweg", "Bahnhofstraße"];
  const HIMMEL = {
    N: { x: 0, z: -1 },
    S: { x: 0, z: 1 },
    O: { x: 1, z: 0 },
    W: { x: -1, z: 0 }
  };
  const WAND = ["#E8DCC4", "#D9C4A2", "#E4D0B8", "#C9B79C", "#D4C8B0", "#E6D8C2"];
  const DACH = ["#7C3E2E", "#5E5B56", "#6A3D32", "#4A4A48", "#6B3A2E"];
  const STILE = ["putz", "fachwerk", "ziegel"];
  const TUER_HEX = {
    rot: "#8C3D3A", blau: "#1E5A8A", gruen: "#2F6A52",
    gelb: "#F2C230", weiss: "#EFEAE0", braun: "#5A3D26", schwarz: "#1A1F2B"
  };

  /* Landmark coordinates match Lieferdienst where the games already agree. */
  const LANDMARKS = [
    { id: "baeckerei", name: "Bäckerei Sonnenkorn", x: -15, z: -43, facing: "S", typ: "laden", w: 22, d: 16, h: 13, door: "braun", awning: "#C4922A", place: "baeckerei" },
    { id: "rathaus", name: "Rathaus", x: 12, z: -43, facing: "S", typ: "rathaus", w: 26, d: 24, h: 19, door: "schwarz", place: "rathaus" },
    { id: "metzgerei", name: "Metzgerei Kern", x: 48, z: -43, facing: "S", typ: "laden", w: 16, d: 15, h: 12, door: "rot", awning: "#7A4A46" },
    { id: "kiosk", name: "Kiosk am Markt", x: 78, z: -43, facing: "S", typ: "kiosk", w: 12, d: 10, h: 8, door: "gruen", awning: "#2F5D46" },
    { id: "kirche", name: "St. Nikolai", x: 60, z: -77, facing: "N", typ: "kirche", w: 34, d: 16, h: 20, door: "braun", place: "kirche" },
    { id: "museum", name: "Stadtmuseum", x: 88, z: -77, facing: "N", typ: "museum", w: 20, d: 16, h: 14, door: "blau", place: "museum" },
    { id: "buchhandlung", name: "Buchhandlung Morgenstern", x: 103, z: -56, facing: "W", typ: "laden", w: 15, d: 14, h: 13, door: "blau", awning: "#2A4A6E" },
    { id: "apotheke", name: "Löwen-Apotheke", x: -8, z: 17, facing: "S", typ: "apotheke", w: 22, d: 15, h: 12, door: "rot", awning: "#B3352C", place: "apotheke" },
    { id: "blumen", name: "Blumen Wiesner", x: 24, z: 17, facing: "S", typ: "laden", w: 18, d: 14, h: 11, door: "gruen", awning: "#2F6A52" },
    { id: "sparkasse", name: "Sparkasse", x: 48, z: -17, facing: "N", typ: "sparkasse", w: 22, d: 16, h: 14, door: "blau", place: "sparkasse" },
    { id: "kaufhaus", name: "Kaufhaus Fröhlich", x: 78, z: -17, facing: "N", typ: "kaufhaus", w: 24, d: 18, h: 16, door: "gelb", awning: "#F2C230", place: "kaufhaus" },
    { id: "cafe", name: "Café Federkiel", x: 9, z: 43, facing: "N", typ: "cafe", w: 20, d: 15, h: 12, door: "weiss", awning: "#7A4A46", place: "cafe" },
    { id: "haus", name: "Haus Fröhlich · Rosenweg 4", x: -42, z: 43, facing: "N", typ: "fachwerk", w: 18, d: 16, h: 13, door: "braun", place: "haus" },
    { id: "schule", name: "Gymnasium Kleinhausen", x: 55, z: 43, facing: "N", typ: "schule", w: 28, d: 20, h: 15, door: "blau", place: "schule" },
    { id: "post", name: "Postamt", x: 45, z: 77, facing: "S", typ: "post", w: 24, d: 18, h: 14, door: "gelb", place: "post" },
    { id: "werkstatt", name: "Werkstatt Vogel", x: 90, z: 77, facing: "S", typ: "werkstatt", w: 18, d: 16, h: 11, door: "schwarz", place: "werkstatt" },
    { id: "bahnhof", name: "Bahnhof Kleinhausen", x: 125, z: 77, facing: "S", typ: "bahnhof", w: 40, d: 20, h: 16, door: "schwarz", place: "bahnhof" },
    { id: "haltestelle", name: "Bushaltestelle Linie 3", x: -15, z: 77, facing: "S", typ: "haltestelle", w: 10, d: 4, h: 5 },
    { id: "markt", name: "Marktplatz", x: 30, z: -30, facing: "S", typ: "brunnen", w: 12, d: 12, h: 5, place: "markt" },
    { id: "park", name: "Stadtpark", x: -60, z: 60, facing: "N", typ: "park", w: 48, d: 48, h: 0, place: "park" },
    { id: "gaertnerei", name: "Gärtnerei Tadesse", x: -75, z: 36, facing: "O", typ: "garten", w: 16, d: 14, h: 9, door: "gruen", place: "gaertnerei" },
    { id: "fest", name: "Festplatz", x: -100, z: 100, facing: "O", typ: "fest", w: 36, d: 28, h: 0, place: "fest" },
    { id: "jugend", name: "Jugendzentrum", x: -78, z: 108, facing: "S", typ: "jugend", w: 20, d: 16, h: 11, door: "blau", place: "jugend" },
    { id: "sport", name: "SV Kleinhausen", x: 132, z: -40, facing: "W", typ: "sport", w: 28, d: 22, h: 0, place: "sport" },
    { id: "supermarkt", name: "MarktPunkt", x: 150, z: 8, facing: "W", typ: "kette", w: 28, d: 22, h: 12, door: "rot", place: "supermarkt" },
    { id: "schloss", name: "Schloss", x: -118, z: -18, facing: "O", typ: "schloss", w: 30, d: 22, h: 20, door: "schwarz", place: "schloss" },
    { id: "turm", name: "Aussichtsturm", x: -126, z: -72, facing: "O", typ: "turm", w: 10, d: 10, h: 28, door: "braun", place: "turm" }
  ];

  const TEX = {};
  const BLOCK = [];
  const DOORS = [];
  let ANISO = 4;
  let threeScript = null;
  let host = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let sun = null;
  let fill = null;
  let hemi = null;
  let sky = null;
  let clouds = [];
  let waterMats = [];
  let rainGroup = null;
  let snowGroup = null;
  /* Vendor THREE (Lieferdienst subset) has no Points/PointsMaterial. Weather spray is CSS. */
  let raf = 0;
  let built = false;
  let visible = false;
  let paused = false;
  let last = 0;
  let weather = "overcast";
  let onEnter = null;
  let quality = "high";
  const keys = {};
  const look = { yaw: Math.PI * 0.5, dragging: false, lx: 0, ly: 0, pointer: false };
  const player = { x: 125, z: 90, h: 1.68, speed: 16 };
  const touch = { vor: false, links: false, rechts: false };
  let unbindInput = null;
  let resizeFn = null;
  let saveTick = 0;

  function seedRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function leinwand(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h || w;
    return { c: c, x: c.getContext("2d") };
  }

  function rausch(ctx, w, h, amt) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * amt;
      d[i] = Math.max(0, Math.min(255, d[i] + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
    ctx.putImageData(img, 0, 0);
  }

  function flecken(ctx, w, h, n, color, r) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * r, Math.random() * r * 0.6, Math.random(), 0, 7);
      ctx.fill();
    }
  }

  function textur(canvas, repeat, color) {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = ANISO;
    if (color !== false) t.encoding = THREE.sRGBEncoding;
    if (repeat) t.repeat.set(repeat[0], repeat[1]);
    return t;
  }

  function normalKarte(canvas, str) {
    const w = canvas.width;
    const h = canvas.height;
    const src = canvas.getContext("2d").getImageData(0, 0, w, h).data;
    const out = leinwand(w, h);
    const img = out.x.createImageData(w, h);
    const d = img.data;
    function hgt(x, y) {
      const i = 4 * (((y + h) % h) * w + ((x + w) % w));
      return (0.3 * src[i] + 0.59 * src[i + 1] + 0.11 * src[i + 2]) / 255;
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (hgt(x - 1, y) - hgt(x + 1, y)) * str;
        const dy = (hgt(x, y - 1) - hgt(x, y + 1)) * str;
        const len = Math.hypot(dx, dy, 1);
        const i = 4 * (y * w + x);
        d[i] = 255 * (dx / len * 0.5 + 0.5);
        d[i + 1] = 255 * (dy / len * 0.5 + 0.5);
        d[i + 2] = 255 * (1 / len * 0.5 + 0.5);
        d[i + 3] = 255;
      }
    }
    out.x.putImageData(img, 0, 0);
    return out.c;
  }

  function boden(c, u, v, color) {
    return textur(c, [u || 1, v || 1], color);
  }

  function texPflaster() {
    if (TEX.pflaster) return TEX.pflaster;
    const s = 256;
    const { c, x } = leinwand(s);
    x.fillStyle = "#4B4A46";
    x.fillRect(0, 0, s, s);
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 16; col++) {
        const px = 16 * col + (row % 2 ? 8 : 0);
        const py = 16 * row;
        const g = 92 + 42 * Math.random();
        x.fillStyle = "rgb(" + (g | 0) + "," + ((g - 4) | 0) + "," + ((g - 12) | 0) + ")";
        x.beginPath();
        const r = 6.4 + 1.2 * Math.random();
        x.ellipse(px + 8, py + 8, r, r * 0.82, Math.random(), 0, 7);
        x.fill();
      }
    }
    flecken(x, s, s, 24, "rgba(30,30,28,.35)", 26);
    rausch(x, s, s, 22);
    TEX.pflaster = c;
    TEX.pflasterN = normalKarte(c, 3.2);
    return c;
  }

  function texGehweg() {
    if (TEX.gehweg) return TEX.gehweg;
    const s = 256;
    const { c, x } = leinwand(s);
    x.fillStyle = "#9A968C";
    x.fillRect(0, 0, s, s);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const g = 148 + 26 * Math.random();
        x.fillStyle = "rgb(" + (g | 0) + "," + ((g - 3) | 0) + "," + ((g - 10) | 0) + ")";
        x.fillRect(64 * i + 1.5, 64 * j + 1.5, 61, 61);
      }
    }
    flecken(x, s, s, 16, "rgba(60,58,52,.22)", 30);
    rausch(x, s, s, 14);
    TEX.gehweg = c;
    TEX.gehwegN = normalKarte(c, 1.6);
    return c;
  }

  function texGras() {
    if (TEX.gras) return TEX.gras;
    const s = 256;
    const { c, x } = leinwand(s);
    x.fillStyle = "#4E6B37";
    x.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) {
      const g = 60 + 60 * Math.random();
      x.strokeStyle = "rgba(" + ((0.6 * g) | 0) + "," + ((g + 40) | 0) + "," + ((0.5 * g) | 0) + ",.55)";
      x.lineWidth = 1 + Math.random();
      const px = Math.random() * s;
      const py = Math.random() * s;
      x.beginPath();
      x.moveTo(px, py);
      x.lineTo(px + 4 * (Math.random() - 0.5), py - 3 - 4 * Math.random());
      x.stroke();
    }
    flecken(x, s, s, 14, "rgba(30,50,20,.25)", 40);
    TEX.gras = c;
    return c;
  }

  function texWasser() {
    if (TEX.wasser) return TEX.wasser;
    const s = 256;
    const { c, x } = leinwand(s);
    x.fillStyle = "#33505A";
    x.fillRect(0, 0, s, s);
    for (let t = 0; t < 60; t++) {
      x.strokeStyle = "rgba(180,210,220," + (0.03 + 0.07 * Math.random()) + ")";
      x.lineWidth = 1 + 3 * Math.random();
      x.beginPath();
      const y = Math.random() * s;
      x.moveTo(0, y);
      for (let i = 0; i <= s; i += 16) x.lineTo(i, y + 3 * Math.sin(0.06 * i + t));
      x.stroke();
    }
    TEX.wasser = c;
    TEX.wasserN = normalKarte(c, 2.2);
    return c;
  }

  function texFassade(stil, farbe, laden) {
    const key = "f_" + stil + farbe + (laden || "");
    if (TEX[key]) return TEX[key];
    const w = 200;
    const h = 160;
    const { c, x } = leinwand(w, h);
    x.fillStyle = farbe;
    x.fillRect(0, 0, w, h);
    if (stil === "ziegel") {
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 14; col++) {
          const px = 15 * col + (row % 2 ? 7 : 0);
          const py = 8 * row;
          const n = 12 + 26 * Math.random();
          x.fillStyle = "rgba(" + ((150 + n) | 0) + "," + ((78 + 0.6 * n) | 0) + "," + ((62 + 0.5 * n) | 0) + ",.85)";
          x.fillRect(px + 1, py + 1, 13, 6);
        }
      }
    } else if (stil === "fachwerk") {
      x.fillStyle = "#5A4634";
      x.fillRect(0, 0, w, 9);
      x.fillRect(0, 151, w, 9);
      x.fillRect(0, 0, 9, h);
      x.fillRect(191, 0, 9, h);
      x.save();
      x.strokeStyle = "#5A4634";
      x.lineWidth = 9;
      x.beginPath();
      x.moveTo(9, 151);
      x.lineTo(100, 80);
      x.lineTo(191, 151);
      x.stroke();
      x.restore();
    } else {
      flecken(x, w, h, 10, "rgba(255,255,255,.10)", 40);
      flecken(x, w, h, 8, "rgba(0,0,0,.07)", 34);
    }
    x.fillStyle = "#D7D2C6";
    x.fillRect(44, 20, 112, 9);
    x.fillStyle = "rgba(0,0,0,.28)";
    x.fillRect(47, 29, 106, 5);
    const gx = 54;
    const gy = 32;
    const grad = x.createLinearGradient(gx, gy, 146, 112);
    grad.addColorStop(0, "#93ACC0");
    grad.addColorStop(0.45, "#4E6274");
    grad.addColorStop(1, "#2A3844");
    x.fillStyle = grad;
    x.fillRect(gx, gy, 92, 80);
    x.save();
    x.globalAlpha = 0.18;
    x.fillStyle = "#DCE8F0";
    x.beginPath();
    x.moveTo(gx, 76);
    x.lineTo(gx + 36.8, gy);
    x.lineTo(gx + 57, gy);
    x.lineTo(63.2, 112);
    x.lineTo(gx, 112);
    x.fill();
    x.restore();
    x.strokeStyle = "#EDEBE4";
    x.lineWidth = 5;
    x.strokeRect(gx, gy, 92, 80);
    x.beginPath();
    x.moveTo(100, gy);
    x.lineTo(100, 112);
    x.moveTo(gx, 68);
    x.lineTo(146, 68);
    x.stroke();
    if (laden) {
      x.fillStyle = laden;
      x.fillRect(34, 28, 16, 88);
      x.fillRect(150, 28, 16, 88);
    }
    rausch(x, w, h, 12);
    TEX[key] = textur(c);
    TEX[key + "_n"] = textur(normalKarte(c, 1.8), null, false);
    return TEX[key];
  }

  function texDach(farbe) {
    const key = "dach_" + farbe;
    if (TEX[key]) return TEX[key];
    const s = 128;
    const { c, x } = leinwand(s);
    x.fillStyle = farbe;
    x.fillRect(0, 0, s, s);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const px = 16 * col + (row % 2 ? 8 : 0);
        const py = 16 * row;
        x.fillStyle = "rgba(0,0,0," + (0.05 + 0.12 * Math.random()) + ")";
        x.beginPath();
        x.moveTo(px, py + 16);
        x.lineTo(px, py + 4);
        x.quadraticCurveTo(px + 8, py - 4, px + 16, py + 4);
        x.lineTo(px + 16, py + 16);
        x.fill();
        x.fillStyle = "rgba(255,255,255," + (0.02 + 0.06 * Math.random()) + ")";
        x.fillRect(px + 2, py + 6, 12, 3);
      }
    }
    rausch(x, s, s, 16);
    TEX[key] = textur(c);
    TEX[key + "_n"] = textur(normalKarte(c, 2.4), null, false);
    return TEX[key];
  }

  function texTuer(name) {
    const key = "tuer_" + name;
    if (TEX[key]) return TEX[key];
    const hex = TUER_HEX[name] || "#5A3D26";
    const { c, x } = leinwand(128, 220);
    x.fillStyle = "#3A342C";
    x.fillRect(0, 0, 128, 220);
    x.fillStyle = hex;
    x.fillRect(6, 6, 116, 208);
    x.strokeStyle = "rgba(0,0,0,.3)";
    x.lineWidth = 4;
    [[18, 24, 92, 74], [18, 112, 92, 74]].forEach(function (p) {
      x.strokeRect(p[0], p[1], p[2], p[3]);
      x.fillStyle = "rgba(255,255,255,.10)";
      x.fillRect(p[0] + 4, p[1] + 4, p[2] - 8, p[3] - 8);
    });
    x.fillStyle = "#E4C558";
    x.beginPath();
    x.arc(102, 116, 6, 0, 7);
    x.fill();
    rausch(x, 128, 220, 10);
    TEX[key] = textur(c);
    return TEX[key];
  }

  function texHimmel(kind) {
    const { c, x } = leinwand(16, 256);
    const g = x.createLinearGradient(0, 0, 0, 256);
    if (kind === "rain") {
      g.addColorStop(0, "#2A3540");
      g.addColorStop(0.5, "#5A6A78");
      g.addColorStop(1, "#8A96A0");
    } else if (kind === "cold") {
      g.addColorStop(0, "#8AA0B4");
      g.addColorStop(0.5, "#C5D2DC");
      g.addColorStop(1, "#E8EEF2");
    } else if (kind === "sun") {
      g.addColorStop(0, "#2C5C93");
      g.addColorStop(0.42, "#6FA3CB");
      g.addColorStop(0.72, "#B9CFDD");
      g.addColorStop(1, "#E4D9C4");
    } else {
      g.addColorStop(0, "#4A5A68");
      g.addColorStop(0.5, "#7A8A96");
      g.addColorStop(1, "#C4B8A4");
    }
    x.fillStyle = g;
    x.fillRect(0, 0, 16, 256);
    const t = textur(c);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  }

  function texSchrift(text, bg, fg, w, h) {
    w = w || 512;
    h = h || 128;
    const { c, x } = leinwand(w, h);
    x.fillStyle = bg;
    x.fillRect(0, 0, w, h);
    x.strokeStyle = fg;
    x.lineWidth = 8;
    x.strokeRect(5, 5, w - 10, h - 10);
    x.fillStyle = fg;
    x.textAlign = "center";
    x.textBaseline = "middle";
    let size = 0.42 * h;
    do {
      x.font = "700 " + size + 'px "Bahnschrift","DIN Alternate","Arial Narrow",Arial,sans-serif';
      size -= 2;
    } while (x.measureText(text).width > 0.86 * w && size > 10);
    x.fillText(text, w / 2, h / 2 + 2);
    return textur(c);
  }

  function texMarkise(farbe) {
    const key = "mark_" + farbe;
    if (TEX[key]) return TEX[key];
    const { c, x } = leinwand(128, 64);
    x.fillStyle = "#EFEAE0";
    x.fillRect(0, 0, 128, 64);
    x.fillStyle = farbe;
    for (let i = 0; i < 128; i += 24) x.fillRect(i, 0, 12, 64);
    flecken(x, 128, 64, 4, "rgba(0,0,0,.08)", 20);
    rausch(x, 128, 64, 8);
    TEX[key] = textur(c, [2, 1]);
    return TEX[key];
  }

  function texWolke() {
    if (TEX.wolke) return TEX.wolke;
    const { c, x } = leinwand(256, 128);
    x.clearRect(0, 0, 256, 128);
    x.fillStyle = "rgba(255,255,255,.55)";
    for (let i = 0; i < 12; i++) {
      x.beginPath();
      x.ellipse(40 + Math.random() * 180, 50 + Math.random() * 30, 28 + Math.random() * 36, 14 + Math.random() * 16, 0, 0, 7);
      x.fill();
    }
    TEX.wolke = textur(c);
    return TEX.wolke;
  }

  function texLaub() {
    if (TEX.laub) return TEX.laub;
    const s = 128;
    const { c, x } = leinwand(s);
    x.fillStyle = "#2F5A28";
    x.fillRect(0, 0, s, s);
    for (let i = 0; i < 400; i++) {
      x.fillStyle = "rgba(" + ((40 + 50 * Math.random()) | 0) + "," + ((90 + 80 * Math.random()) | 0) + "," + ((30 + 30 * Math.random()) | 0) + ",.7)";
      x.beginPath();
      x.arc(Math.random() * s, Math.random() * s, 2 + 5 * Math.random(), 0, 7);
      x.fill();
    }
    TEX.laub = textur(c);
    return TEX.laub;
  }

  function texSockel(farbe) {
    const key = "sock_" + farbe;
    if (TEX[key]) return TEX[key];
    const { c, x } = leinwand(128);
    x.fillStyle = farbe;
    x.fillRect(0, 0, 128, 128);
    flecken(x, 128, 128, 18, "rgba(0,0,0,.08)", 18);
    rausch(x, 128, 128, 10);
    TEX[key] = textur(c);
    return TEX[key];
  }

  function matStandard(map, extra) {
    extra = extra || {};
    const m = new THREE.MeshStandardMaterial(Object.assign({
      map: map || null,
      roughness: extra.roughness != null ? extra.roughness : 0.86,
      metalness: extra.metalness || 0
    }, extra.more || {}));
    if (extra.normal) m.normalMap = extra.normal;
    return m;
  }

  function mFassade(stil, farbe, laden) {
    const map = texFassade(stil, farbe, laden);
    return new THREE.MeshStandardMaterial({
      map: map,
      normalMap: TEX["f_" + stil + farbe + (laden || "") + "_n"] || null,
      roughness: 0.88
    });
  }

  function mDach(farbe) {
    return new THREE.MeshStandardMaterial({
      map: texDach(farbe),
      normalMap: TEX["dach_" + farbe + "_n"] || null,
      roughness: 0.92
    });
  }

  function mPutz(farbe) {
    return new THREE.MeshStandardMaterial({
      map: texSockel(farbe),
      color: farbe,
      roughness: 0.92
    });
  }

  function mTuer(name) {
    return new THREE.MeshStandardMaterial({ map: texTuer(name), roughness: 0.7 });
  }

  function boxMitUV(w, h, d, tileW, tileH) {
    const g = new THREE.BoxGeometry(w, h, d);
    const uv = g.attributes.uv;
    const faces = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) {
      const tw = faces[f][0];
      const th = faces[f][1];
      for (let a = 0; a < 4; a++) {
        const i = 4 * f + a;
        uv.setXY(i, uv.getX(i) * (tw / tileW), uv.getY(i) * (th / tileH));
      }
    }
    uv.needsUpdate = true;
    return g;
  }

  function dachGeometrie(len, depth, height, tile) {
    const hx = len / 2;
    const hz = depth / 2;
    const verts = [];
    function push(x, y, z, u, v) { verts.push({ x: x, y: y, z: z, u: u, v: v }); }
    const hv = Math.hypot(hz, height) / tile;
    const du = len / tile;
    push(-hx, 0, hz, 0, 0); push(hx, 0, hz, du, 0); push(hx, height, 0, du, hv);
    push(-hx, 0, hz, 0, 0); push(hx, height, 0, du, hv); push(-hx, height, 0, 0, hv);
    push(hx, 0, -hz, 0, 0); push(-hx, 0, -hz, du, 0); push(-hx, height, 0, du, hv);
    push(hx, 0, -hz, 0, 0); push(-hx, height, 0, du, hv); push(hx, height, 0, 0, hv);
    const split = verts.length;
    push(hx, 0, hz, 0, 0); push(hx, 0, -hz, depth / tile, 0); push(hx, height, 0, depth / tile / 2, height / tile);
    push(-hx, 0, -hz, 0, 0); push(-hx, 0, hz, depth / tile, 0); push(-hx, height, 0, depth / tile / 2, height / tile);
    const pos = new Float32Array(verts.length * 3);
    const uvs = new Float32Array(verts.length * 2);
    verts.forEach(function (v, i) {
      pos[3 * i] = v.x; pos[3 * i + 1] = v.y; pos[3 * i + 2] = v.z;
      uvs[2 * i] = v.u; uvs[2 * i + 1] = v.v;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    g.computeVertexNormals();
    g.addGroup(0, split, 0);
    g.addGroup(split, verts.length - split, 1);
    return g;
  }

  function blockAt(x, z, hx, hz, pad) {
    pad = pad || 0.4;
    BLOCK.push({ x1: x - hx - pad, x2: x + hx + pad, z1: z - hz - pad, z2: z + hz + pad });
  }

  function addDoor(place, x, z, facing, name) {
    DOORS.push({ place: place, x: x, z: z, facing: facing, name: name });
  }

  function weltYaw(facing) {
    const k = HIMMEL[facing] || HIMMEL.S;
    return Math.atan2(k.x, k.z);
  }

  function buildingAnchor(lm) {
    const k = HIMMEL[lm.facing] || HIMMEL.S;
    return { x: lm.x - k.x * lm.d / 2, z: lm.z - k.z * lm.d / 2, yaw: weltYaw(lm.facing), k: k };
  }

  function schildAn(group, text, depth, y, width) {
    if (!text) return;
    const w = Math.min(width || 12, 16);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, 1.35),
      new THREE.MeshStandardMaterial({ map: texSchrift(text, "#1E5A8A", "#F2C230", 512, 96), roughness: 0.55 })
    );
    mesh.position.set(0, y || 6.2, depth / 2 + 0.14);
    group.add(mesh);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 1.55, 0.08), mPutz("#F2C230"));
    rim.position.set(0, y || 6.2, depth / 2 + 0.08);
    group.add(rim);
  }

  function addAwning(group, color, width, depth) {
    const mat = new THREE.MeshStandardMaterial({ map: texMarkise(color), roughness: 0.85 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(width, 0.22, 3.2), mat);
    top.position.set(0, 7.1, depth / 2 + 1.5);
    top.rotation.x = -0.14;
    top.castShadow = true;
    group.add(top);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(width, 0.55, 0.1), mat);
    lip.position.set(0, 6.65, depth / 2 + 3.05);
    group.add(lip);
  }

  function baum(x, z, scale) {
    scale = scale || 1;
    const g = new THREE.Group();
    const stamm = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * scale, 0.4 * scale, 3.2 * scale, 6), mPutz("#5A4634"));
    stamm.position.y = 1.6 * scale;
    stamm.castShadow = true;
    const krone = new THREE.Mesh(
      new THREE.SphereGeometry(2.1 * scale, 8, 6),
      new THREE.MeshStandardMaterial({ map: texLaub(), roughness: 1 })
    );
    krone.position.y = 4.1 * scale;
    krone.castShadow = true;
    g.add(stamm, krone);
    g.position.set(x, 0, z);
    scene.add(g);
    blockAt(x, z, 0.7 * scale, 0.7 * scale, 0.2);
  }

  function laterne(x, z) {
    const g = new THREE.Group();
    const pfahl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.2, 6), mPutz("#2A3038"));
    pfahl.position.y = 2.6;
    const kopf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.7), new THREE.MeshStandardMaterial({
      color: 0xf2c230, emissive: 0x6a5010, roughness: 0.4
    }));
    kopf.position.y = 5.3;
    g.add(pfahl, kopf);
    g.position.set(x, 0, z);
    scene.add(g);
  }

  function hausBauen(spec, rnd) {
    rnd = rnd || Math.random;
    const stil = spec.stil || STILE[(rnd() * STILE.length) | 0];
    const wand = spec.wand || WAND[(rnd() * WAND.length) | 0];
    const dach = spec.dach || DACH[(rnd() * DACH.length) | 0];
    const stock = spec.stock || 2 + (rnd() < 0.4 ? 1 : 0);
    const sockelH = 4.2;
    const wandH = 4 * stock;
    const tiefe = spec.d || 14;
    const breite = spec.w || 15;
    const g = new THREE.Group();
    const sockel = new THREE.Mesh(boxMitUV(breite, sockelH, tiefe, 10, 6), mPutz(spec.sockel || "#A9A294"));
    sockel.position.y = sockelH / 2;
    const fass = new THREE.Mesh(boxMitUV(breite, wandH, tiefe, 5, 4), mFassade(stil, wand, spec.laden || null));
    fass.position.y = sockelH + wandH / 2;
    const giebel = spec.giebel != null ? spec.giebel : rnd() < 0.4;
    const dachH = 5 + 2 * rnd();
    const dachMesh = new THREE.Mesh(
      dachGeometrie(giebel ? tiefe + 1.4 : breite + 1.4, giebel ? breite + 1.2 : tiefe + 1.2, dachH, 3),
      [mDach(dach), mPutz(wand)]
    );
    dachMesh.position.y = sockelH + wandH;
    if (giebel) dachMesh.rotation.y = Math.PI / 2;
    [sockel, fass, dachMesh].forEach(function (m) { m.castShadow = m.receiveShadow = true; });
    g.add(sockel, fass, dachMesh);
    if (spec.door) {
      const tuer = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 4.6), mTuer(spec.door));
      tuer.position.set(0, 2.35, tiefe / 2 + 0.12);
      g.add(tuer);
    }
    if (spec.awning) addAwning(g, spec.awning, Math.min(breite * 0.8, 12), tiefe);
    if (spec.schild) schildAn(g, spec.schild, tiefe, 6.4, Math.min(breite * 0.8, 14));
    const anc = { yaw: weltYaw(spec.facing), k: HIMMEL[spec.facing] || HIMMEL.S };
    g.rotation.y = anc.yaw;
    const cx = spec.x - anc.k.x * tiefe / 2;
    const cz = spec.z - anc.k.z * tiefe / 2;
    g.position.set(cx, 0, cz);
    scene.add(g);
    const hx = Math.abs(anc.k.z) > 0.5 ? breite / 2 : tiefe / 2;
    const hz = Math.abs(anc.k.z) > 0.5 ? tiefe / 2 : breite / 2;
    blockAt(cx, cz, hx, hz);
    return g;
  }

  function landmarkBauen(lm) {
    if (lm.typ === "brunnen") {
      const g = new THREE.Group();
      const becken = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 1.6, 8), mPutz("#B7B0A2"));
      becken.position.y = 0.8;
      becken.castShadow = becken.receiveShadow = true;
      const wasser = new THREE.Mesh(
        new THREE.CylinderGeometry(6.9, 6.9, 1.4, 8),
        new THREE.MeshStandardMaterial({
          map: boden(texWasser(), 2, 2),
          normalMap: boden(TEX.wasserN, 2, 2, false),
          roughness: 0.18,
          metalness: 0.1,
          color: 0x9fc4ce
        })
      );
      wasser.position.y = 1.1;
      waterMats.push(wasser.material);
      const stele = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 4.4, 8), mPutz("#C6BFB0"));
      stele.position.y = 3;
      stele.castShadow = true;
      const kugel = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 10), mPutz("#8E877A"));
      kugel.position.y = 5.6;
      g.add(becken, wasser, stele, kugel);
      g.position.set(lm.x, 0, lm.z);
      scene.add(g);
      addDoor(lm.place, lm.x, lm.z + 10, "N", lm.name);
      return;
    }
    if (lm.typ === "park") {
      const n = new THREE.Mesh(
        new THREE.PlaneGeometry(48, 48),
        new THREE.MeshStandardMaterial({ map: boden(texGras(), 8, 8), roughness: 1 })
      );
      n.rotation.x = -Math.PI / 2;
      n.position.set(lm.x, 0.06, lm.z);
      n.receiveShadow = true;
      scene.add(n);
      for (let i = 0; i < 10; i++) {
        baum(lm.x + (i % 5) * 8 - 16, lm.z + Math.floor(i / 5) * 14 - 8, 0.85 + (i % 3) * 0.15);
      }
      addDoor(lm.place, lm.x + 10, lm.z + 8, "W", lm.name);
      return;
    }
    if (lm.typ === "haltestelle") {
      const g = new THREE.Group();
      const dach = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 3.4), mPutz("#2F3742"));
      dach.position.y = 5;
      g.add(dach);
      for (const x of [-4, 4]) {
        for (const z of [-1.4, 1.4]) {
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 5, 6), mPutz("#39424E"));
          p.position.set(x, 2.5, z);
          g.add(p);
        }
      }
      const glas = new THREE.Mesh(new THREE.BoxGeometry(9, 3.2, 0.2), new THREE.MeshStandardMaterial({
        color: 0xbfc8dc, transparent: true, opacity: 0.45, roughness: 0.1
      }));
      glas.position.set(0, 3, -1.95);
      const h = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 2.4),
        new THREE.MeshStandardMaterial({ map: texSchrift("H", "#F2C230", "#16181D", 128, 128), roughness: 0.6, side: THREE.DoubleSide })
      );
      h.position.set(-5.4, 4.2, 0);
      g.add(glas, h);
      g.rotation.y = weltYaw(lm.facing);
      g.position.set(lm.x, 0, lm.z);
      scene.add(g);
      return;
    }
    if (lm.typ === "fest") {
      const rasen = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 32),
        new THREE.MeshStandardMaterial({ map: boden(texGras(), 6, 6), roughness: 1 })
      );
      rasen.rotation.x = -Math.PI / 2;
      rasen.position.set(lm.x, 0.05, lm.z);
      scene.add(rasen);
      for (let i = 0; i < 6; i++) {
        const stange = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 6), new THREE.MeshStandardMaterial({ color: 0xe67a20 }));
        stange.position.set(lm.x - 12 + i * 5, 1.7, lm.z - 8);
        scene.add(stange);
      }
      const buehne = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 6), mPutz("#C4B79A"));
      buehne.position.set(lm.x, 0.6, lm.z + 6);
      scene.add(buehne);
      addDoor(lm.place, lm.x + 16, lm.z, "W", lm.name);
      return;
    }
    if (lm.typ === "sport") {
      const feld = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 20),
        new THREE.MeshStandardMaterial({ map: boden(texGras(), 4, 3), color: 0x6a9a4a, roughness: 1 })
      );
      feld.rotation.x = -Math.PI / 2;
      feld.position.set(lm.x, 0.05, lm.z);
      scene.add(feld);
      const tor = new THREE.Mesh(new THREE.BoxGeometry(6, 3.2, 0.2), new THREE.MeshStandardMaterial({ color: 0xf2f2f2 }));
      tor.position.set(lm.x, 1.6, lm.z - 9);
      scene.add(tor);
      addDoor(lm.place, lm.x - 16, lm.z, "O", lm.name);
      return;
    }
    if (lm.typ === "turm") {
      const g = new THREE.Group();
      const schaft = new THREE.Mesh(boxMitUV(7, 22, 7, 6, 8), mPutz("#8A8A82"));
      schaft.position.y = 11;
      const zinne = new THREE.Mesh(new THREE.BoxGeometry(8.4, 2.2, 8.4), mPutz("#6E6E66"));
      zinne.position.y = 23;
      const dach = new THREE.Mesh(new THREE.ConeGeometry(5.2, 5, 4), mDach("#5E5B56"));
      dach.position.y = 26.4;
      dach.rotation.y = Math.PI / 4;
      [schaft, zinne, dach].forEach(function (m) { m.castShadow = true; });
      g.add(schaft, zinne, dach);
      const tuer = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.6), mTuer("braun"));
      tuer.position.set(0, 1.8, 3.6);
      g.add(tuer);
      const anc = buildingAnchor({ facing: lm.facing, x: lm.x, z: lm.z, d: lm.d });
      g.rotation.y = anc.yaw;
      g.position.set(lm.x, 0, lm.z);
      scene.add(g);
      blockAt(lm.x, lm.z, 5, 5);
      addDoor(lm.place, lm.x + 8, lm.z, "W", lm.name);
      return;
    }

    if (lm.typ === "kirche") {
      const g = new THREE.Group();
      const s = 15;
      const korp = new THREE.Mesh(boxMitUV(lm.w, s, lm.d, 6, 5), mPutz("#C4BCA9"));
      korp.position.y = s / 2;
      const kdach = new THREE.Mesh(dachGeometrie(lm.w + 1.2, lm.d + 1, 7, 3), [mDach("#5E5B56"), mPutz("#C4BCA9")]);
      kdach.position.y = s;
      const turm = new THREE.Mesh(boxMitUV(9, 30, 9, 6, 5), mPutz("#C4BCA9"));
      turm.position.set(-lm.w / 2 + 5.5, 15, lm.d / 2 - 4.5);
      const spitz = new THREE.Mesh(new THREE.ConeGeometry(7.2, 13, 4), mDach("#5E5B56"));
      spitz.position.set(turm.position.x, 36.5, turm.position.z);
      spitz.rotation.y = Math.PI / 4;
      const kreuzV = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 0.3), mPutz("#D9C87A"));
      kreuzV.position.set(turm.position.x, 44.5, turm.position.z);
      const uhr = new THREE.Mesh(
        new THREE.CircleGeometry(2.6, 20),
        new THREE.MeshStandardMaterial({ map: texSchrift("XII", "#22252B", "#EFEAE0", 128, 128), roughness: 0.6 })
      );
      uhr.position.set(turm.position.x, 25, turm.position.z + 4.6);
      const rose = new THREE.Mesh(new THREE.CircleGeometry(3.2, 18), new THREE.MeshStandardMaterial({
        color: 0x3b4e86, roughness: 0.3, emissive: 0x16221a
      }));
      rose.position.set(2, 11, lm.d / 2 + 0.1);
      [korp, kdach, turm, spitz].forEach(function (m) { m.castShadow = m.receiveShadow = true; });
      g.add(korp, kdach, turm, spitz, kreuzV, uhr, rose);
      const tuer = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 4.8), mTuer(lm.door || "braun"));
      tuer.position.set(0, 2.45, lm.d / 2 + 0.12);
      g.add(tuer);
      schildAn(g, lm.name, lm.d, 8.2, 12);
      const anc = buildingAnchor(lm);
      g.rotation.y = anc.yaw;
      g.position.set(anc.x, 0, anc.z);
      scene.add(g);
      blockAt(anc.x, anc.z, lm.w / 2 + 1, lm.d / 2 + 1);
      if (lm.place) addDoor(lm.place, lm.x, lm.z, lm.facing, lm.name);
      return;
    }

    const g = new THREE.Group();
    const sockelH = 4.4;
    const wandH = Math.max(8, (lm.h || 12) - sockelH);
    const putz = {
      rathaus: "#DCD2BC", apotheke: "#E6DCC6", post: "#EFE3C4", schule: "#D6C4A8",
      bahnhof: "#C9B79C", cafe: "#E4D9C4", kiosk: "#DED2BC", laden: "#E0D5C0",
      kaufhaus: "#F2C230", sparkasse: "#D9E4EE", werkstatt: "#8A8E92",
      jugend: "#3D5C8C", schloss: "#6A7B8C", museum: "#E8E0D0",
      kette: "#C9B8A4", garten: "#C4C8A8", fachwerk: "#D9C4A2"
    }[lm.typ] || "#E0D5C0";
    const stil = lm.typ === "fachwerk" ? "fachwerk" : lm.typ === "schule" ? "ziegel" : lm.typ === "schloss" ? "putz" : "putz";
    const sockel = new THREE.Mesh(boxMitUV(lm.w, sockelH, lm.d, 10, 6), mPutz("#ABA496"));
    sockel.position.y = sockelH / 2;
    const fass = new THREE.Mesh(boxMitUV(lm.w, wandH, lm.d, 5, 4), mFassade(stil, putz, lm.awning || "#4A5B6E"));
    fass.position.y = sockelH + wandH / 2;
    const giebel = lm.typ === "rathaus" || lm.typ === "laden" || lm.typ === "cafe" || lm.typ === "kaufhaus";
    const dachFar = lm.typ === "rathaus" || lm.typ === "kirche" || lm.typ === "schloss" ? "#5E5B56" : "#7C3E2E";
    const dachH = lm.typ === "kiosk" ? 1.6 : 6;
    const dach = new THREE.Mesh(
      dachGeometrie(giebel ? lm.d + 1.4 : lm.w + 1.4, giebel ? lm.w + 1.2 : lm.d + 1.2, dachH, 3),
      [mDach(dachFar), mPutz(putz)]
    );
    dach.position.y = sockelH + wandH;
    if (giebel) dach.rotation.y = Math.PI / 2;
    [sockel, fass, dach].forEach(function (m) { m.castShadow = m.receiveShadow = true; });
    g.add(sockel, fass, dach);

    if (lm.typ === "rathaus") {
      const turmH = sockelH + wandH + 12;
      const turm = new THREE.Mesh(boxMitUV(7, turmH, 7, 6, 5), mPutz("#DCD2BC"));
      turm.position.set(0, turmH / 2, -1);
      turm.castShadow = true;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(5.6, 7, 8), mDach("#4E6B6B"));
      cone.position.set(0, turmH + 3.4, -1);
      const uhr = new THREE.Mesh(
        new THREE.CircleGeometry(2.2, 20),
        new THREE.MeshStandardMaterial({ map: texSchrift("XII", "#22252B", "#EFEAE0", 128, 128), roughness: 0.6 })
      );
      uhr.position.set(0, turmH - 4, 2.6);
      const fahne = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.9), new THREE.MeshStandardMaterial({
        color: 0xf2c230, roughness: 0.8, side: THREE.DoubleSide
      }));
      fahne.position.set(lm.w / 2 - 0.3, sockelH + wandH + 4, lm.d / 2 - 1);
      g.add(turm, cone, uhr, fahne);
    }

    if (lm.typ === "apotheke") {
      const a = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 3.4),
        new THREE.MeshStandardMaterial({ map: texSchrift("A", "#F4EFE4", "#B3352C", 128, 128), roughness: 0.6, side: THREE.DoubleSide })
      );
      a.position.set(lm.w / 2 - 1.4, sockelH + wandH - 3, lm.d / 2 + 1.6);
      a.rotation.y = -0.5;
      g.add(a);
    }
    if (lm.typ === "post") {
      const p = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 3.2),
        new THREE.MeshStandardMaterial({ map: texSchrift("✉", "#16181D", "#F2C230", 128, 128), roughness: 0.6 })
      );
      p.position.set(-lm.w / 2 + 3, sockelH + wandH - 3, lm.d / 2 + 0.12);
      g.add(p);
    }
    if (lm.typ === "bahnhof") {
      const dach = new THREE.Mesh(new THREE.BoxGeometry(lm.w + 14, 0.5, 10), mPutz("#4A4F58"));
      dach.position.set(0, 7.5, lm.d / 2 + 5);
      dach.castShadow = true;
      g.add(dach);
      const tafel = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 1.6),
        new THREE.MeshStandardMaterial({ map: texSchrift("KLEINHAUSEN", "#16181D", "#F2C230", 512, 96), roughness: 0.5 })
      );
      tafel.position.set(0, 9.2, lm.d / 2 + 0.2);
      g.add(tafel);
    }
    if (lm.typ === "kette") {
      const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 2.2),
        new THREE.MeshStandardMaterial({ map: texSchrift("MarktPunkt", "#DA3633", "#FFFFFF", 512, 128), roughness: 0.5 })
      );
      logo.position.set(0, sockelH + wandH - 2, lm.d / 2 + 0.14);
      g.add(logo);
    }

    if (lm.awning) addAwning(g, lm.awning, Math.min(lm.w * 0.85, 14), lm.d);
    if (lm.door) {
      const tuer = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 4.8), mTuer(lm.door));
      tuer.position.set(0, 2.45, lm.d / 2 + 0.12);
      g.add(tuer);
    }
    schildAn(g, lm.name, lm.d, lm.typ === "kiosk" ? 5.2 : 6.6, Math.min(lm.w * 0.85, 14));

    const anc = buildingAnchor(lm);
    g.rotation.y = anc.yaw;
    g.position.set(anc.x, 0, anc.z);
    scene.add(g);
    const hx = Math.abs(anc.k.z) > 0.5 ? lm.w / 2 : lm.d / 2;
    const hz = Math.abs(anc.k.z) > 0.5 ? lm.d / 2 : lm.w / 2;
    blockAt(anc.x, anc.z, hx + 0.8, hz + 0.8);
    if (lm.place) addDoor(lm.place, lm.x, lm.z, lm.facing, lm.name);
  }

  function strassenBauen() {
    const band = new THREE.MeshStandardMaterial({
      map: boden(texPflaster(), 2, 8),
      normalMap: boden(TEX.pflasterN, 2, 8, false),
      roughness: 0.96
    });
    function segment(ax, az, bx, bz, skip) {
      const dx = bx - ax;
      const dz = bz - az;
      const len = Math.hypot(dx, dz);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(22, Math.max(4, len - skip * 2)), band);
      mesh.rotation.x = -Math.PI / 2;
      const t = skip / len;
      mesh.position.set(ax + dx * 0.5, 0.04, az + dz * 0.5);
      if (Math.abs(dx) > 1) mesh.rotation.z = Math.PI / 2;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const a = { x: COL_X[c], z: ROW_Z[r] };
        const b = { x: COL_X[c + 1], z: ROW_Z[r] };
        segment(a.x, a.z, b.x, b.z, r === 1 && c === 1 ? 20 : 13);
      }
    }
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 3; r++) {
        segment(COL_X[c], ROW_Z[r], COL_X[c], ROW_Z[r + 1], 13);
      }
    }
    const kreuz = new THREE.MeshStandardMaterial({
      map: boden(texPflaster(), 3, 3),
      normalMap: boden(TEX.pflasterN, 3, 3, false),
      roughness: 0.95
    });
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        if (c === 2 && r === 1) continue;
        const p = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), kreuz);
        p.rotation.x = -Math.PI / 2;
        p.position.set(COL_X[c], 0.04, ROW_Z[r]);
        p.receiveShadow = true;
        scene.add(p);
        laterne(COL_X[c] + 8, ROW_Z[r] + 8);
      }
    }
    const kreisel = new THREE.Mesh(
      new THREE.CircleGeometry(21.5, 44),
      new THREE.MeshStandardMaterial({
        map: boden(texPflaster(), 6, 6),
        normalMap: boden(TEX.pflasterN, 6, 6, false),
        roughness: 0.95
      })
    );
    kreisel.rotation.x = -Math.PI / 2;
    kreisel.position.set(30, 0.06, -30);
    kreisel.receiveShadow = true;
    scene.add(kreisel);
    const rasen = new THREE.Mesh(new THREE.CylinderGeometry(10.4, 10.4, 0.5, 24), mPutz("#8C9A6E"));
    rasen.position.set(30, 0.25, -30);
    scene.add(rasen);

    const geh = new THREE.MeshStandardMaterial({
      map: boden(texGehweg(), 2, 8),
      normalMap: boden(TEX.gehwegN, 2, 8, false),
      roughness: 0.98
    });
    const parkweg = new THREE.Mesh(new THREE.PlaneGeometry(13, 70), geh);
    parkweg.rotation.x = -Math.PI / 2;
    parkweg.position.set(-60, 0.16, 0);
    parkweg.receiveShadow = true;
    scene.add(parkweg);
  }

  function kanalBauen() {
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(300, 14),
      new THREE.MeshStandardMaterial({
        map: boden(texWasser(), 20, 1),
        normalMap: boden(TEX.wasserN, 20, 1, false),
        roughness: 0.12,
        metalness: 0.35,
        color: 0x89a6b4
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -1.4, 0);
    scene.add(water);
    waterMats.push(water.material);
    COL_X.forEach(function (x) {
      for (const side of [-1, 1]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 22), mPutz("#3B4048"));
        rail.position.set(x + 10.4 * side, 3.1, 0);
        scene.add(rail);
      }
    });
    [-1, 1].forEach(function (side) {
      let cursor = -150;
      const gaps = COL_X.map(function (x) { return [x - 14, x + 14]; });
      const spans = [];
      gaps.forEach(function (g) {
        spans.push([cursor, g[0]]);
        cursor = g[1];
      });
      spans.push([cursor, 150]);
      spans.forEach(function (sp) {
        if (sp[1] - sp[0] < 2) return;
        const wall = new THREE.Mesh(new THREE.BoxGeometry(sp[1] - sp[0], 3, 1.6), mPutz("#8E8778"));
        wall.position.set((sp[0] + sp[1]) / 2, -0.4, 7.8 * side);
        wall.castShadow = true;
        scene.add(wall);
        BLOCK.push({ x1: sp[0], x2: sp[1], z1: 7 * side - 0.8, z2: 7 * side + 2.4 });
      });
    });
  }

  function bodenBauen() {
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(420, 420),
      new THREE.MeshStandardMaterial({ map: boden(texGras(), 28, 28), roughness: 1 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.02;
    grass.receiveShadow = true;
    scene.add(grass);
  }

  function haeuserFuellen() {
    const occupied = LANDMARKS.filter(function (l) { return l.typ !== "brunnen" && l.typ !== "park" && l.typ !== "fest" && l.typ !== "sport"; });
    function taken(x, z, w) {
      if (Math.abs(z) < 12) return true;
      if (x > -90 && x < -20 && z > 26 && z < 94) return true;
      for (let i = 0; i < occupied.length; i++) {
        if (Math.hypot(occupied[i].x - x, occupied[i].z - z) < (occupied[i].w || 16) * 0.7 + w * 0.5) return true;
      }
      for (let i = 0; i < BLOCK.length; i++) {
        const b = BLOCK[i];
        if (x > b.x1 - 2 && x < b.x2 + 2 && z > b.z1 - 2 && z < b.z2 + 2) return true;
      }
      return false;
    }
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const z = ROW_Z[r];
        const x0 = COL_X[c] + 18;
        const x1 = COL_X[c + 1] - 18;
        ["N", "S"].forEach(function (facing) {
          const rnd = seedRng(r * 17 + c * 31 + facing.charCodeAt(0) * 13);
          let x = x0;
          let n = 0;
          while (x < x1 - 8 && n++ < 8) {
            const w = 10 + ((rnd() * 8) | 0);
            const lotZ = z - 13 * HIMMEL[facing].z;
            if (!taken(x, lotZ, w)) {
              hausBauen({
                x: x, z: lotZ, facing: facing, w: w, d: 13,
                door: rnd() < 0.35 ? ["rot", "blau", "braun", "gruen"][(rnd() * 4) | 0] : null,
                awning: rnd() < 0.15 ? ["#7A4A46", "#2F5D46", "#2A4A6E"][(rnd() * 3) | 0] : null
              }, rnd);
            }
            x += w + 3 + rnd() * 3;
          }
        });
      }
    }
  }

  function streetAt(x, z) {
    let best = { name: "Kleinhausen", d: 1e9 };
    for (let i = 0; i < 4; i++) {
      const dH = Math.abs(z - ROW_Z[i]);
      if (dH < best.d && dH < 16) best = { name: STRASSE_H[i], d: dH };
      const dV = Math.abs(x - COL_X[i]);
      if (dV < best.d && dV < 16) best = { name: STRASSE_V[i], d: dV };
    }
    if (Math.hypot(x - 30, z + 30) < 24) return "Marktplatz";
    if (Math.hypot(x + 60, z - 60) < 30) return "Stadtpark";
    if (x < -85 && z > 80) return "Festplatz";
    if (x > 140) return "Umgehung";
    return best.name;
  }

  function nearestDoor() {
    let best = null;
    let d = 9;
    for (let i = 0; i < DOORS.length; i++) {
      const door = DOORS[i];
      const dist = Math.hypot(player.x - door.x, player.z - door.z);
      if (dist < d) {
        d = dist;
        best = door;
      }
    }
    return best;
  }

  function constrain(x, z) {
    let nx = x;
    let nz = z;
    if (Math.hypot(nx - 30, nz + 30) < 8.2) {
      const n = Math.hypot(nx - 30, nz + 30) || 0.001;
      nx = 30 + (nx - 30) / n * 8.2;
      nz = -30 + (nz + 30) / n * 8.2;
    }
    for (let i = 0; i < BLOCK.length; i++) {
      const b = BLOCK[i];
      if (nx > b.x1 && nx < b.x2 && nz > b.z1 && nz < b.z2) {
        const left = nx - b.x1;
        const right = b.x2 - nx;
        const top = nz - b.z1;
        const bot = b.z2 - nz;
        const m = Math.min(left, right, top, bot);
        if (m === left) nx = b.x1 - 0.05;
        else if (m === right) nx = b.x2 + 0.05;
        else if (m === top) nz = b.z1 - 0.05;
        else nz = b.z2 + 0.05;
      }
    }
    nx = Math.max(-160, Math.min(175, nx));
    nz = Math.max(-140, Math.min(140, nz));
    return { x: nx, z: nz };
  }

  function weatherTheme(key) {
    if (key === "rain") {
      return { fog: 0x5a6a78, near: 40, far: 210, sun: 0.28, fill: 0.35, hemi: 0.4, exp: 0.82, sunColor: 0xb0c0cc };
    }
    if (key === "cold") {
      return { fog: 0xc5d2dc, near: 60, far: 260, sun: 0.7, fill: 0.55, hemi: 0.7, exp: 0.95, sunColor: 0xe8eef6 };
    }
    if (key === "sun") {
      return { fog: 0xbcd0c4, near: 140, far: 460, sun: 1.85, fill: 0.9, hemi: 0.75, exp: 1.08, sunColor: 0xffe898 };
    }
    return { fog: 0x8a8e86, near: 80, far: 300, sun: 0.7, fill: 0.55, hemi: 0.55, exp: 0.92, sunColor: 0xe0d8c8 };
  }

  function applyWeather(key) {
    weather = key || "overcast";
    if (!scene) return;
    if (sky) sky.material.map = texHimmel(weather);
    sky.material.needsUpdate = true;
    const th = weatherTheme(weather);
    scene.fog.color.setHex(th.fog);
    scene.fog.near = th.near;
    scene.fog.far = th.far;
    scene.background = new THREE.Color(th.fog);
    if (sun) {
      sun.intensity = th.sun;
      sun.color.setHex(th.sunColor);
    }
    if (fill) fill.intensity = th.fill;
    if (hemi) hemi.intensity = th.hemi;
    if (renderer) renderer.toneMappingExposure = th.exp;
    if (host) {
      host.setAttribute("data-weather", weather);
      const rain = host.querySelector("#kh-town-wx");
      if (rain) rain.setAttribute("data-weather", weather);
    }
  }

  function makeWeatherParticles() {
    rainGroup = null;
    snowGroup = null;
  }

  function initRenderer() {
    const stage = host.querySelector("#kh-town-stage");
    renderer = new THREE.WebGLRenderer({ antialias: quality !== "low", powerPreference: "high-performance", alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.5 : 1));
    renderer.setSize(stage.clientWidth || window.innerWidth, stage.clientHeight || window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = quality === "high";
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);
    ANISO = quality === "high" ? 8 : 2;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x8a8e86, 80, 300);
    camera = new THREE.PerspectiveCamera(58, (stage.clientWidth || 1) / (stage.clientHeight || 1), 0.35, 900);
    camera.rotation.order = "YXZ";

    sky = new THREE.Mesh(
      new THREE.SphereGeometry(520, 24, 16),
      new THREE.MeshBasicMaterial({ map: texHimmel("overcast"), side: THREE.BackSide, fog: false })
    );
    scene.add(sky);

    sun = new THREE.DirectionalLight(0xffe898, 1.6);
    sun.position.set(-130, 150, -80);
    if (renderer.shadowMap.enabled) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      const cam = sun.shadow.camera;
      cam.left = -170; cam.right = 170; cam.top = 170; cam.bottom = -170;
      cam.near = 1; cam.far = 420;
      sun.shadow.bias = -0.0007;
      sun.shadow.normalBias = 0.5;
    }
    scene.add(sun);
    fill = new THREE.DirectionalLight(0xcfd8e8, 0.7);
    fill.position.set(120, 90, 100);
    scene.add(fill);
    hemi = new THREE.HemisphereLight(0xa8c4e0, 0x6e6a51, 0.7);
    scene.add(hemi);
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));

    if (quality !== "low") {
      const cloudMat = new THREE.MeshBasicMaterial({
        map: texWolke(),
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        fog: false
      });
      for (let i = 0; i < 8; i++) {
        const cloud = new THREE.Mesh(new THREE.PlaneGeometry(150 + 130 * Math.random(), 60 + 40 * Math.random()), cloudMat);
        cloud.position.set(700 * (Math.random() - 0.5), 150 + 70 * Math.random(), 700 * (Math.random() - 0.5));
        cloud.rotation.x = -Math.PI / 2.1;
        cloud.renderOrder = -1;
        scene.add(cloud);
        clouds.push(cloud);
      }
    }

    resizeFn = function () {
      if (!renderer || !host) return;
      const stage = host.querySelector("#kh-town-stage");
      const w = stage.clientWidth || window.innerWidth;
      const h = stage.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", resizeFn);
  }

  function buildCity() {
    BLOCK.length = 0;
    DOORS.length = 0;
    waterMats = [];
    clouds = [];
    bodenBauen();
    strassenBauen();
    kanalBauen();
    LANDMARKS.forEach(function (lm) {
      try { landmarkBauen(lm); } catch (err) { console.warn("Ort nicht gebaut:", lm.id, err); }
    });
    if (quality !== "low") haeuserFuellen();
    makeWeatherParticles();
    built = true;
  }

  function persistWalk() {
    KH.state.walk = {
      x: player.x,
      z: player.z,
      yaw: look.yaw,
      place: (nearestDoor() && nearestDoor().place) || KH.currentPlace || "markt"
    };
  }

  function restoreWalk() {
    const w = KH.state && KH.state.walk;
    if (w && typeof w.x === "number") {
      player.x = w.x;
      player.z = w.z;
      look.yaw = w.yaw || look.yaw;
      return;
    }
    const start = LANDMARKS.find(function (l) { return l.id === "bahnhof"; });
    if (start) {
      player.x = 90;
      player.z = 90;
      look.yaw = -Math.PI / 2;
    }
  }

  function compassLetter(yaw) {
    const deg = ((yaw * 180 / Math.PI) % 360 + 360) % 360;
    if (deg >= 315 || deg < 45) return "N";
    if (deg < 135) return "W";
    if (deg < 225) return "S";
    return "O";
  }

  function updateHud() {
    if (!host) return;
    const sign = host.querySelector("#town-sign");
    const kompass = host.querySelector("#town-compass-letter");
    const prompt = host.querySelector("#town-prompt");
    const name = streetAt(player.x, player.z);
    if (sign && sign.textContent !== name) {
      sign.textContent = name;
      if (KH.live) KH.live(name);
    }
    if (kompass) kompass.textContent = compassLetter(look.yaw);
    const door = nearestDoor();
    const enterBtn = host.querySelector("#town-enter");
    if (prompt) {
      if (door && !paused) {
        prompt.hidden = false;
        prompt.innerHTML = "<kbd>E</kbd> · " + KH.esc(door.name);
      } else {
        prompt.hidden = true;
      }
    }
    if (enterBtn) enterBtn.hidden = !(door && !paused);
  }

  function tryEnter() {
    if (paused) return;
    const door = nearestDoor();
    if (!door || !door.place) return;
    persistWalk();
    if (KH.save) KH.save();
    if (typeof onEnter === "function") onEnter(door.place);
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (!visible || !renderer) return;
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    if (!paused) {
      const turn = ((keys.KeyA || keys.ArrowLeft || touch.links) ? 1 : 0) - ((keys.KeyD || keys.ArrowRight || touch.rechts) ? 1 : 0);
      const reduce = KH.state && KH.state.player && KH.state.player.motion === "reduce";
      look.yaw += turn * (reduce ? 0.9 : 1.7) * dt;
      const fwd = (keys.KeyW || keys.ArrowUp || touch.vor) ? 1 : 0;
      const back = (keys.KeyS || keys.ArrowDown) ? 1 : 0;
      const speed = player.speed * (fwd || back ? 1 : 0) * (back ? -0.55 : 1);
      const dx = -Math.sin(look.yaw) * speed * dt;
      const dz = -Math.cos(look.yaw) * speed * dt;
      const next = constrain(player.x + dx, player.z + dz);
      player.x = next.x;
      player.z = next.z;
    }
    camera.position.set(player.x, player.h, player.z);
    camera.rotation.y = look.yaw;
    camera.rotation.x = 0;
    if (sky) sky.position.copy(camera.position);
    waterMats.forEach(function (m) {
      if (m.map) m.map.offset.x = (ts * 0.00003) % 1;
    });
    clouds.forEach(function (c, i) {
      c.position.x += Math.sin(ts * 0.00005 + i) * 0.01;
    });
    renderer.render(scene, camera);
    updateHud();
    saveTick += dt;
    if (saveTick > 8) {
      saveTick = 0;
      persistWalk();
    }
  }

  function bindInput() {
    function down(e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      keys[e.code] = true;
      if ((e.code === "KeyE" || e.key === "e") && visible) {
        e.preventDefault();
        tryEnter();
      }
    }
    function up(e) { keys[e.code] = false; }
    const canvas = renderer && renderer.domElement;
    function md(e) {
      if (paused) return;
      look.dragging = true;
      look.lx = e.clientX;
      look.ly = e.clientY;
    }
    function mm(e) {
      if (!look.dragging || paused) return;
      const dx = e.clientX - look.lx;
      look.lx = e.clientX;
      look.yaw -= dx * 0.005;
    }
    function mu() { look.dragging = false; }
    document.addEventListener("keydown", down);
    document.addEventListener("keyup", up);
    if (canvas) {
      canvas.addEventListener("mousedown", md);
      window.addEventListener("mousemove", mm);
      window.addEventListener("mouseup", mu);
      canvas.addEventListener("touchstart", function (e) {
        if (paused) return;
        look.dragging = true;
        look.lx = e.touches[0].clientX;
      }, { passive: true });
      canvas.addEventListener("touchmove", function (e) {
        if (!look.dragging || paused) return;
        const dx = e.touches[0].clientX - look.lx;
        look.lx = e.touches[0].clientX;
        look.yaw -= dx * 0.006;
      }, { passive: true });
      canvas.addEventListener("touchend", mu);
    }
    host.querySelectorAll("[data-touch]").forEach(function (b) {
      const kind = b.getAttribute("data-touch");
      const set = function (on) {
        return function (ev) { ev.preventDefault(); touch[kind] = on; };
      };
      b.addEventListener("pointerdown", set(true));
      b.addEventListener("pointerup", set(false));
      b.addEventListener("pointerleave", set(false));
    });
    const enterBtn = host.querySelector("#town-enter");
    if (enterBtn) enterBtn.addEventListener("click", tryEnter);
    unbindInput = function () {
      document.removeEventListener("keydown", down);
      document.removeEventListener("keyup", up);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  }

  function ensureHost() {
    host = document.getElementById("kh-town");
    if (host) return host;
    host = document.createElement("div");
    host.id = "kh-town";
    host.hidden = true;
    host.innerHTML =
      '<div id="kh-town-stage"></div>' +
      '<div id="kh-town-wx" aria-hidden="true"></div>' +
      '<div id="kh-town-hud">' +
      '<div class="town-plate" id="town-sign">Kleinhausen</div>' +
      '<div class="town-plate town-compass" title="Blickrichtung"><span id="town-compass-letter">N</span><small>Blick</small></div>' +
      '<div class="town-prompt" id="town-prompt" hidden></div>' +
      '<button type="button" class="btn post" id="town-enter">Eintreten</button>' +
      '<div class="town-touch" aria-label="Gehen">' +
      '<button type="button" class="tbtn" data-touch="links" aria-label="Links drehen">◀</button>' +
      '<button type="button" class="tbtn" data-touch="vor" aria-label="Vorwärts">▲</button>' +
      '<button type="button" class="tbtn" data-touch="rechts" aria-label="Rechts drehen">▶</button>' +
      "</div></div>" +
      '<div id="kh-town-load" hidden><p>Stadt wird gebaut …</p><i></i></div>';
    document.body.appendChild(host);
    return host;
  }

  function pickQuality() {
    const reduce = KH.state && KH.state.player && KH.state.player.motion === "reduce";
    const mem = navigator.deviceMemory || 8;
    if (reduce || mem <= 2) return "low";
    if (mem <= 4) return "medium";
    return "high";
  }

  function loadThree(done) {
    if (global.THREE) return done();
    if (threeScript) {
      threeScript.addEventListener("load", function () { done(); });
      threeScript.addEventListener("error", function () { done(new Error("THREE")); });
      return;
    }
    threeScript = document.createElement("script");
    threeScript.src = "js/vendor/three.r128.js";
    threeScript.onload = function () { done(); };
    threeScript.onerror = function () { done(new Error("THREE")); };
    document.head.appendChild(threeScript);
  }

  function showLoad(on) {
    const el = host && host.querySelector("#kh-town-load");
    if (el) el.hidden = !on;
  }

  KH.Town = {
    landmarks: LANDMARKS,
    isLive: function () { return visible && built; },
    where: function () {
      return {
        x: player.x,
        z: player.z,
        yaw: look.yaw,
        street: streetAt(player.x, player.z),
        door: nearestDoor()
      };
    },
    supported: function () {
      try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"));
      } catch (e) { return false; }
    },
    show: function (opts) {
      opts = opts || {};
      onEnter = opts.onEnter || onEnter;
      ensureHost();
      host.hidden = false;
      visible = true;
      paused = false;
      document.body.classList.add("town-live");
      if (built) {
        applyWeather(opts.weather || (KH.weatherKey && KH.weatherKey()) || "overcast");
        restoreWalk();
        if (resizeFn) resizeFn();
        if (!raf) raf = requestAnimationFrame(loop);
        return;
      }
      if (!KH.Town.supported()) {
        host.hidden = true;
        visible = false;
        document.body.classList.remove("town-live");
        if (typeof opts.onFail === "function") opts.onFail();
        return;
      }
      showLoad(true);
      quality = pickQuality();
      if (!KH.Town.supported()) {
        console.warn("Kleinhausen 3D: WebGL-Probe negativ — versuche Renderer trotzdem.");
      }
      loadThree(function (err) {
        if (err || !global.THREE) {
          showLoad(false);
          host.hidden = true;
          visible = false;
          document.body.classList.remove("town-live");
          if (typeof opts.onFail === "function") opts.onFail();
          return;
        }
        try {
          if (renderer && !built) KH.Town.dispose();
          ensureHost();
          host.hidden = false;
          visible = true;
          initRenderer();
          buildCity();
          restoreWalk();
          applyWeather(opts.weather || (KH.weatherKey && KH.weatherKey()) || "overcast");
          bindInput();
          showLoad(false);
          if (resizeFn) resizeFn();
          last = performance.now();
          if (!raf) raf = requestAnimationFrame(loop);
        } catch (e) {
          console.error("Kleinhausen 3D:", e);
          showLoad(false);
          try { KH.Town.dispose(); } catch (e2) { /* ignore */ }
          if (typeof opts.onFail === "function") opts.onFail();
        }
      });
    },
    hide: function () {
      if (!visible) return;
      persistWalk();
      if (KH.save) KH.save();
      visible = false;
      paused = true;
      if (host) host.hidden = true;
      document.body.classList.remove("town-live");
    },
    pause: function () { paused = true; updateHud(); },
    resume: function () {
      paused = false;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    },
    setWeather: function (key) { applyWeather(key); },
    goTo: function (placeId) {
      const lm = LANDMARKS.find(function (l) { return l.place === placeId || l.id === placeId; });
      if (!lm) return;
      const k = HIMMEL[lm.facing] || HIMMEL.S;
      player.x = lm.x + k.x * 8;
      player.z = lm.z + k.z * 8;
      look.yaw = Math.atan2(k.x, k.z);
      KH.currentPlace = lm.place || placeId;
      persistWalk();
      updateHud();
    },
    dispose: function () {
      KH.Town.hide();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (unbindInput) unbindInput();
      unbindInput = null;
      if (resizeFn) window.removeEventListener("resize", resizeFn);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      renderer = scene = camera = sun = fill = hemi = sky = null;
      rainGroup = snowGroup = null;
      clouds = [];
      waterMats = [];
      built = false;
      Object.keys(TEX).forEach(function (k) { delete TEX[k]; });
    }
  };
})(window);
