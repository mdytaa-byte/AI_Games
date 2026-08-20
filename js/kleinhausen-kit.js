/* Kleinhausen 3D kit — Canvas-safe German learning worlds (no CDN, no storage). */
(function (global) {
  'use strict';

  var KH = global.KH || (global.KH = {});
  var THREE = global.THREE;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function djb2(s) {
    var h = 5381;
    s = String(s);
    for (var i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function enBlock(en) {
    return en ? '<span class="en">' + esc(en) + '</span>' : '';
  }
  function prefersTouch() {
    return window.matchMedia && (window.matchMedia('(pointer:coarse)').matches || window.matchMedia('(hover:none)').matches);
  }
  function prefersReduce() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  KH.esc = esc;
  KH.norm = norm;
  KH.hash = djb2;

  KH.codeBauen = function (prefix, name, tag, prozent, extra) {
    var p = djb2(norm(name) + '|' + tag + '|' + prozent + '|' + extra + '|KLEINHAUSEN3D').toString(36).toUpperCase();
    return prefix + '-' + tag + '-' + prozent + '-' + extra + '-' + (p + 'XXXX').slice(0, 4);
  };
  KH.codePruefen = function (prefix, name, code) {
    var c = String(code || '').trim().toUpperCase().replace(/\s+/g, '');
    var t = c.split('-');
    if (t.length !== 5 || t[0] !== prefix) return false;
    return KH.codeBauen(prefix, name, t[1], t[2], t[3]) === c;
  };

  var OPT = {
    en: true, vorlesen: true, toene: true, kontrast: false, lesbar: false,
    schrift: 'normal', maus: true, tempo: 0.9, gehen: 1, sicht: 70
  };
  KH.opt = OPT;

  function applyOpt() {
    var r = document.documentElement;
    r.dataset.en = OPT.en ? '1' : '0';
    r.dataset.kontrast = OPT.kontrast ? '1' : '0';
    r.dataset.lesbar = OPT.lesbar ? '1' : '0';
    r.dataset.schrift = OPT.schrift === 'normal' ? '' : OPT.schrift;
    if (KH._camera) KH._camera.fov = OPT.sicht, KH._camera.updateProjectionMatrix();
  }

  var audioCtx = null;
  function beep(kind) {
    if (!OPT.toene) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = kind === 'gut' ? 'sine' : kind === 'ok' ? 'triangle' : 'square';
      o.frequency.value = kind === 'gut' ? 660 : kind === 'ok' ? 440 : 196;
      g.gain.value = 0.04;
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.12);
    } catch (e) {}
  }

  function sprich(text) {
    if (!OPT.vorlesen || !text || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE';
      u.rate = OPT.tempo;
      var voices = window.speechSynthesis.getVoices();
      for (var i = 0; i < voices.length; i++) {
        if (/de(-|_)DE/i.test(voices[i].lang) || voices[i].lang === 'de') { u.voice = voices[i]; break; }
      }
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  KH.sprich = sprich;

  function ansage(text, laut) {
    var n = $('kh-ansage');
    if (n) { n.textContent = ''; n.textContent = text; }
    if (laut) sprich(text);
  }
  KH.ansage = ansage;

  /* ---------- canvas textures (Lieferdienst-style: cache, grain, normals) ---------- */
  var TEXC = {};
  function once(key, fn) {
    if (TEXC[key]) return TEXC[key];
    return (TEXC[key] = fn());
  }
  function lein(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h || w;
    return { c: c, x: c.getContext('2d') };
  }
  function flecken(g, w, h, n, col, rad) {
    g.save();
    for (var i = 0; i < n; i++) {
      var x = Math.random() * w, y = Math.random() * h, r = 4 + Math.random() * rad;
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    g.restore();
  }
  function grain(g, s, amt, h) {
    h = h || s;
    var d = g.getImageData(0, 0, s, h), a = d.data;
    for (var i = 0; i < a.length; i += 4) {
      var n = (Math.random() - 0.5) * amt;
      a[i] = Math.max(0, Math.min(255, a[i] + n));
      a[i + 1] = Math.max(0, Math.min(255, a[i + 1] + n));
      a[i + 2] = Math.max(0, Math.min(255, a[i + 2] + n));
    }
    g.putImageData(d, 0, 0);
  }
  function normalKarte(c, str) {
    var w = c.width, h = c.height, src = c.getContext('2d').getImageData(0, 0, w, h).data;
    var out = lein(w, h), img = out.x.createImageData(w, h), d = img.data;
    function lum(x, y) {
      x = (x + w) % w; y = (y + h) % h;
      var i = 4 * (y * w + x);
      return (0.3 * src[i] + 0.59 * src[i + 1] + 0.11 * src[i + 2]) / 255;
    }
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var dx = (lum(x - 1, y) - lum(x + 1, y)) * str;
      var dy = (lum(x, y - 1) - lum(x, y + 1)) * str;
      var len = Math.sqrt(dx * dx + dy * dy + 1), i = 4 * (y * w + x);
      d[i] = 255 * (dx / len * 0.5 + 0.5);
      d[i + 1] = 255 * (dy / len * 0.5 + 0.5);
      d[i + 2] = 255 * (1 / len * 0.5 + 0.5);
      d[i + 3] = 255;
    }
    out.x.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(out.c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  }
  function canvasTex(c, opts) {
    opts = opts || {};
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipMapLinearFilter;
    t.anisotropy = 4;
    if (THREE.sRGBEncoding && !opts.linear) t.encoding = THREE.sRGBEncoding;
    if (opts.normal !== false && !opts.clamp) t.userData.normal = normalKarte(c, opts.nstr == null ? 1.7 : opts.nstr);
    return t;
  }
  function tex(draw, size, opts) {
    size = size || 256;
    opts = opts || {};
    var L = lein(size, opts.h || size);
    draw(L.x, L.c.width, L.c.height);
    return canvasTex(L.c, opts);
  }
  function cloneMapped(map, repeat) {
    var m = map.clone();
    m.wrapS = m.wrapT = THREE.RepeatWrapping;
    m.repeat.set(repeat[0], repeat[1]);
    m.needsUpdate = true;
    if (map.userData && map.userData.normal) {
      var n = map.userData.normal.clone();
      n.wrapS = n.wrapT = THREE.RepeatWrapping;
      n.repeat.set(repeat[0], repeat[1]);
      n.needsUpdate = true;
      m.userData = { normal: n };
    }
    return m;
  }
  KH.tex = {
    holz: function () {
      return once('holz', function () {
        return tex(function (g, s) {
          g.fillStyle = '#7a4e2c'; g.fillRect(0, 0, s, s);
          for (var i = 0; i < 18; i++) {
            g.strokeStyle = i % 2 ? 'rgba(50,24,8,.38)' : 'rgba(190,128,74,.28)';
            g.lineWidth = 2 + (i % 3);
            g.beginPath(); g.moveTo(0, i * 14 + 4); g.bezierCurveTo(s * 0.3, i * 14, s * 0.7, i * 14 + 8, s, i * 14 + 2); g.stroke();
          }
          flecken(g, s, s, 10, 'rgba(40,20,8,.2)', 28);
          grain(g, s, 16);
        }, 256, { nstr: 2.1 });
      });
    },
    parkett: function () {
      return once('parkett', function () {
        return tex(function (g, s) {
          var rows = 10, ph = s / rows, bw = s / 3.2;
          for (var y = 0; y < rows; y++) {
            var off = (y % 2) * (bw * 0.5);
            for (var x = -bw; x < s + bw; x += bw) {
              var v = 128 + Math.abs((x * 3 + y * 17) % 34);
              g.fillStyle = 'rgb(' + (v + 32) + ',' + (v - 6) + ',' + (v - 52) + ')';
              g.fillRect(x + off + 1, y * ph + 1, bw - 2, ph - 2);
              g.strokeStyle = 'rgba(48,22,8,.32)';
              g.strokeRect(x + off + 0.5, y * ph + 0.5, bw - 1, ph - 1);
            }
          }
          grain(g, s, 14);
        }, 256, { nstr: 1.8 });
      });
    },
    putz: function (col) {
      col = col || '#e6d7c2';
      return once('putz_' + col, function () {
        return tex(function (g, s) {
          g.fillStyle = col; g.fillRect(0, 0, s, s);
          flecken(g, s, s, 14, 'rgba(255,255,255,.10)', 40);
          flecken(g, s, s, 10, 'rgba(0,0,0,.07)', 34);
          grain(g, s, 22);
        }, 256, { nstr: 1.3 });
      });
    },
    tapete: function (a, b) {
      a = a || '#e8dcc8'; b = b || 'rgba(140,70,70,.18)';
      return once('tap_' + a + b, function () {
        return tex(function (g, s) {
          g.fillStyle = a; g.fillRect(0, 0, s, s);
          g.strokeStyle = b; g.lineWidth = 2;
          for (var y = 8; y < s; y += 16) for (var x = 8; x < s; x += 16) {
            g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.stroke();
          }
          grain(g, s, 10);
        }, 256, { nstr: 1.1 });
      });
    },
    fliesen: function (a, b) {
      a = a || '#f4f7f8'; b = b || '#d9e2e6';
      return once('fl_' + a + b, function () {
        return tex(function (g, s) {
          var n = 4, h = s / n;
          for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
            g.fillStyle = (x + y) % 2 ? b : a;
            g.fillRect(x * h + 1, y * h + 1, h - 2, h - 2);
          }
          grain(g, s, 8);
        }, 256, { nstr: 1.4 });
      });
    },
    kariert: function () {
      return once('kariert', function () {
        return tex(function (g, s) {
          var n = 8, h = s / n;
          for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
            g.fillStyle = (x + y) % 2 ? '#f2ece3' : '#c45c4a';
            g.fillRect(x * h, y * h, h, h);
          }
        }, 128, { nstr: 0.8 });
      });
    },
    markise: function (a, b) {
      a = a || '#C25B4A'; b = b || '#F2C230';
      return once('mark_' + a + b, function () {
        return tex(function (g, s) {
          g.fillStyle = '#EFEAE0'; g.fillRect(0, 0, s, s);
          for (var x = 0; x < 8; x++) {
            g.fillStyle = x % 2 ? a : b;
            g.fillRect(x * (s / 8), 0, s / 8, s);
          }
          flecken(g, s, s, 6, 'rgba(0,0,0,.08)', 20);
          grain(g, s, 8);
        }, 128, { nstr: 1.2 });
      });
    },
    gras: function () {
      return once('gras', function () {
        return tex(function (g, s) {
          g.fillStyle = '#4E6B37'; g.fillRect(0, 0, s, s);
          for (var i = 0; i < 1400; i++) {
            var t = 60 + 60 * Math.random();
            g.strokeStyle = 'rgba(' + (0.6 * t | 0) + ',' + (t + 40 | 0) + ',' + (0.5 * t | 0) + ',.55)';
            g.lineWidth = 1 + Math.random();
            var x = Math.random() * s, y = Math.random() * s;
            g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4 * (Math.random() - 0.5), y - 3 - 4 * Math.random()); g.stroke();
          }
          flecken(g, s, s, 14, 'rgba(30,50,20,.25)', 40);
        }, 256, { nstr: 2.2 });
      });
    },
    pflaster: function () {
      return once('pflaster', function () {
        return tex(function (g, s) {
          g.fillStyle = '#4B4A46'; g.fillRect(0, 0, s, s);
          for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
            var ox = 16 * x + (y % 2 ? 8 : 0), oy = 16 * y, a = 92 + 42 * Math.random();
            g.fillStyle = 'rgb(' + (a | 0) + ',' + (a - 4 | 0) + ',' + (a - 12 | 0) + ')';
            g.beginPath();
            var rad = 6.4 + 1.2 * Math.random();
            g.ellipse(ox + 8, oy + 8, rad, 0.82 * rad, Math.random(), 0, 7); g.fill();
          }
          flecken(g, s, s, 24, 'rgba(30,30,28,.35)', 26);
          grain(g, s, 18);
        }, 256, { nstr: 3.0 });
      });
    },
    gehweg: function () {
      return once('gehweg', function () {
        return tex(function (g, s) {
          g.fillStyle = '#9A968C'; g.fillRect(0, 0, s, s);
          for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) {
            var r = 148 + 26 * Math.random();
            g.fillStyle = 'rgb(' + (r | 0) + ',' + (r - 3 | 0) + ',' + (r - 10 | 0) + ')';
            g.fillRect(x * 64 + 1.5, y * 64 + 1.5, 61, 61);
          }
          flecken(g, s, s, 16, 'rgba(60,58,52,.22)', 30);
          grain(g, s, 14);
        }, 256, { nstr: 1.6 });
      });
    },
    wasser: function () {
      return once('wasser', function () {
        return tex(function (g, s) {
          g.fillStyle = '#1f5f92'; g.fillRect(0, 0, s, s);
          g.strokeStyle = 'rgba(210,235,255,.45)'; g.lineWidth = 3;
          for (var i = 0; i < 7; i++) {
            g.beginPath(); g.moveTo(0, 14 + i * 18);
            g.bezierCurveTo(40, 4 + i * 18, 90, 24 + i * 18, s, 12 + i * 18); g.stroke();
          }
          g.fillStyle = 'rgba(180,220,255,.12)'; g.fillRect(0, 0, s, s * 0.35);
          grain(g, s, 12);
        }, 256, { nstr: 2.4 });
      });
    },
    ziegel: function () {
      return once('ziegel', function () {
        return tex(function (g, s) {
          g.fillStyle = '#6a3a32'; g.fillRect(0, 0, s, s);
          var bh = 10, bw = 20;
          for (var y = 0, row = 0; y < s; y += bh, row++) {
            var off = (row % 2) * (bw / 2);
            for (var x = -bw; x < s; x += bw) {
              var i = 12 + 26 * Math.random();
              g.fillStyle = 'rgb(' + (150 + i | 0) + ',' + (78 + 0.6 * i | 0) + ',' + (62 + 0.5 * i | 0) + ')';
              g.fillRect(x + off + 1, y + 1, bw - 2, bh - 2);
            }
          }
          grain(g, s, 12);
        }, 256, { nstr: 2.2 });
      });
    },
    dach: function (col) {
      col = col || '#7A3E32';
      return once('dach_' + col, function () {
        return tex(function (g, s) {
          g.fillStyle = col; g.fillRect(0, 0, s, s);
          for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
            var ox = 16 * x + (y % 2 ? 8 : 0), oy = 16 * y;
            g.fillStyle = 'rgba(0,0,0,' + (0.05 + 0.12 * Math.random()) + ')';
            g.beginPath(); g.moveTo(ox, oy + 16); g.lineTo(ox, oy + 4);
            g.quadraticCurveTo(ox + 8, oy - 4, ox + 16, oy + 4); g.lineTo(ox + 16, oy + 16); g.fill();
            g.fillStyle = 'rgba(255,255,255,' + (0.02 + 0.06 * Math.random()) + ')';
            g.fillRect(ox + 2, oy + 6, 12, 3);
          }
          grain(g, s, 16);
        }, 128, { nstr: 2.4 });
      });
    },
    sockel: function (col) {
      col = col || '#A9A294';
      return once('sock_' + col, function () {
        return tex(function (g, s, h) {
          g.fillStyle = col; g.fillRect(0, 0, s, h);
          for (var y = 0; y < 6; y++) for (var x = 0; x < 5; x++) {
            var ox = 40 * x + (y % 2 ? 20 : 0), oy = 20 * y, i = 26 * Math.random();
            g.fillStyle = 'rgba(' + (168 + i | 0) + ',' + (160 + i | 0) + ',' + (146 + i | 0) + ',.5)';
            g.fillRect(ox + 1.5, oy + 1.5, 37, 17);
          }
          flecken(g, s, h, 10, 'rgba(40,40,36,.25)', 26);
          grain(g, s, 14, h);
        }, 200, { h: 120, nstr: 1.6 });
      });
    },
    fassade: function (stil, wand, laden) {
      stil = stil || 'putz'; wand = wand || '#C9B79A'; laden = laden || '';
      return once('fas_' + stil + wand + laden, function () {
        return tex(function (g, i, a) {
          g.fillStyle = wand; g.fillRect(0, 0, i, a);
          if (stil === 'ziegel') {
            for (var ey = 0; ey < 20; ey++) for (var ex = 0; ex < 14; ex++) {
              var n = 15 * ex + (ey % 2 ? 7 : 0), r = 8 * ey, ii = 12 + 26 * Math.random();
              g.fillStyle = 'rgba(' + (150 + ii | 0) + ',' + (78 + 0.6 * ii | 0) + ',' + (62 + 0.5 * ii | 0) + ',.85)';
              g.fillRect(n + 1, r + 1, 13, 6);
            }
          } else if (stil === 'fachwerk') {
            g.fillStyle = '#5A4634';
            g.fillRect(0, 0, i, 9); g.fillRect(0, 151, i, 9); g.fillRect(0, 0, 9, a); g.fillRect(191, 0, 9, a);
            g.strokeStyle = '#5A4634'; g.lineWidth = 9;
            g.beginPath(); g.moveTo(9, 151); g.lineTo(100, 80); g.lineTo(191, 151); g.stroke();
          } else {
            flecken(g, i, a, 10, 'rgba(255,255,255,.10)', 40);
            flecken(g, i, a, 8, 'rgba(0,0,0,.07)', 34);
          }
          var hh = 54, d = 32;
          g.fillStyle = '#D7D2C6'; g.fillRect(44, 20, 112, 9);
          g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(47, 29, 106, 5);
          g.fillStyle = '#20242B'; g.fillRect(49, 27, 102, 90);
          var u = g.createLinearGradient(hh, d, 146, 112);
          u.addColorStop(0, '#93ACC0'); u.addColorStop(0.45, '#4E6274'); u.addColorStop(1, '#2A3844');
          g.fillStyle = u; g.fillRect(hh, d, 92, 80);
          g.globalAlpha = 0.18; g.fillStyle = '#DCE8F0';
          g.beginPath(); g.moveTo(hh, 76); g.lineTo(hh + 36.8, d); g.lineTo(hh + 57, d); g.lineTo(63, 112); g.lineTo(hh, 112); g.fill();
          g.globalAlpha = 1;
          g.strokeStyle = '#EDEBE4'; g.lineWidth = 5; g.strokeRect(hh, d, 92, 80);
          g.beginPath(); g.moveTo(100, d); g.lineTo(100, 112); g.moveTo(hh, 68); g.lineTo(146, 68); g.stroke();
          g.fillStyle = '#D7D2C6'; g.fillRect(44, 114, 112, 7);
          if (laden) {
            g.fillStyle = laden; g.fillRect(34, 28, 16, 88); g.fillRect(150, 28, 16, 88);
            g.fillStyle = 'rgba(0,0,0,.22)';
            for (var k = 0; k < 7; k++) {
              g.fillRect(34, d + k * (80 / 7) + 3, 16, 3);
              g.fillRect(150, d + k * (80 / 7) + 3, 16, 3);
            }
          }
          grain(g, i, 12, a);
        }, 200, { h: 160, nstr: 1.8 });
      });
    },
    rinde: function () {
      return once('rinde', function () {
        return tex(function (g, s) {
          g.fillStyle = '#5B4634'; g.fillRect(0, 0, s, s);
          for (var i = 0; i < 40; i++) {
            g.strokeStyle = 'rgba(' + (40 + 50 * Math.random() | 0) + ',' + (30 + 30 * Math.random() | 0) + ',20,.6)';
            g.lineWidth = 1 + 2 * Math.random();
            var x = Math.random() * s;
            g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 8 * (Math.random() - 0.5), s); g.stroke();
          }
        }, 64, { nstr: 2.6 });
      });
    },
    laub: function () {
      return once('laub', function () {
        return tex(function (g, s) {
          g.fillStyle = '#3E6B33'; g.fillRect(0, 0, s, s);
          for (var i = 0; i < 700; i++) {
            var t = 70 + 70 * Math.random();
            g.fillStyle = 'rgba(' + (0.55 * t | 0) + ',' + (t + 30 | 0) + ',' + (0.45 * t | 0) + ',.7)';
            g.beginPath(); g.ellipse(Math.random() * s, Math.random() * s, 3 + 5 * Math.random(), 2 + 3 * Math.random(), 3 * Math.random(), 0, 7); g.fill();
          }
        }, 128, { nstr: 1.8 });
      });
    },
    stoff: function (col) {
      col = col || '#2A63A8';
      return once('stoff_' + col, function () {
        return tex(function (g, s) {
          g.fillStyle = col; g.fillRect(0, 0, s, s);
          for (var x = -s; x < 256; x += 3) {
            g.strokeStyle = 'rgba(0,0,0,' + (0.05 + 0.05 * Math.random()) + ')';
            g.beginPath(); g.moveTo(x, 0); g.lineTo(x + s, s); g.stroke();
            g.strokeStyle = 'rgba(255,255,255,' + (0.03 + 0.04 * Math.random()) + ')';
            g.beginPath(); g.moveTo(x + 1.5, 0); g.lineTo(x + s + 1.5, s); g.stroke();
          }
          grain(g, s, 10);
        }, 128, { nstr: 1.1 });
      });
    },
    haut: function () {
      return once('haut', function () {
        return tex(function (g, s) {
          g.fillStyle = '#C9926B'; g.fillRect(0, 0, s, s);
          flecken(g, s, s, 8, 'rgba(255,220,190,.12)', 16);
          flecken(g, s, s, 6, 'rgba(140,80,50,.08)', 14);
          grain(g, s, 6);
        }, 64, { nstr: 0.9 });
      });
    },
    himmel: function () {
      return once('himmel', function () {
        var L = lein(16, 256), g = L.x;
        var gr = g.createLinearGradient(0, 0, 0, 256);
        gr.addColorStop(0, '#2C5C93'); gr.addColorStop(0.42, '#6FA3CB');
        gr.addColorStop(0.72, '#B9CFDD'); gr.addColorStop(1, '#E4D9C4');
        g.fillStyle = gr; g.fillRect(0, 0, 16, 256);
        return canvasTex(L.c, { clamp: true, normal: false });
      });
    },
    wolke: function () {
      return once('wolke', function () {
        var L = lein(256), g = L.x;
        for (var i = 0; i < 26; i++) {
          var x = 128 + 179 * (Math.random() - 0.5), y = 128 + 90 * (Math.random() - 0.5), r = 20 + 46 * Math.random();
          var gr = g.createRadialGradient(x, y, 0, x, y, r);
          gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
        }
        return canvasTex(L.c, { normal: false });
      });
    }
  };
  KH.tile = function (maker, rx, ry) {
    var t = typeof maker === 'function' ? maker() : maker;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.needsUpdate = true;
    return t;
  };

  function std(color, map, opts) {
    opts = opts || {};
    var p = {
      color: color == null ? 0xffffff : color,
      map: map || null,
      roughness: opts.roughness != null ? opts.roughness : 0.9,
      metalness: opts.metalness || 0,
      transparent: !!opts.transparent,
      opacity: opts.opacity == null ? 1 : opts.opacity,
      side: opts.side || THREE.FrontSide,
      emissive: opts.emissive || 0x000000
    };
    if (opts.emissiveIntensity != null) p.emissiveIntensity = opts.emissiveIntensity;
    else if (opts.emissive) p.emissiveIntensity = 0.4;
    var m = new THREE.MeshStandardMaterial(p);
    if (map && map.userData && map.userData.normal && !opts.transparent && opts.normal !== false) {
      m.normalMap = map.userData.normal;
      var ns = opts.nscale != null ? opts.nscale : 0.55;
      m.normalScale = new THREE.Vector2(ns, ns);
    }
    return m;
  }
  function lamb(color, map, opts) { return std(color, map, opts); }
  KH.mat = { std: std, lamb: lamb };

  function dachGeo(len, depth, height) {
    var i = len / 2, a = depth / 2, s = [], tile = 2;
    function o(x, y, z, u, v) { s.push({ x: x, y: y, z: z, u: u, v: v }); }
    var h = Math.hypot(a, height) / tile, d = len / tile;
    o(-i, 0, a, 0, 0); o(i, 0, a, d, 0); o(i, height, 0, d, h);
    o(-i, 0, a, 0, 0); o(i, height, 0, d, h); o(-i, height, 0, 0, h);
    o(i, 0, -a, 0, 0); o(-i, 0, -a, d, 0); o(-i, height, 0, d, h);
    o(i, 0, -a, 0, 0); o(-i, height, 0, d, h); o(i, height, 0, 0, h);
    var u = s.length;
    o(i, 0, a, 0, 0); o(i, 0, -a, depth / tile, 0); o(i, height, 0, depth / tile / 2, height / tile);
    o(-i, 0, -a, 0, 0); o(-i, 0, a, depth / tile, 0); o(-i, height, 0, depth / tile / 2, height / tile);
    var pos = new Float32Array(3 * s.length), uv = new Float32Array(2 * s.length);
    s.forEach(function (e, t) {
      pos[3 * t] = e.x; pos[3 * t + 1] = e.y; pos[3 * t + 2] = e.z;
      uv[2 * t] = e.u; uv[2 * t + 1] = e.v;
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.computeVertexNormals();
    g.addGroup(0, u, 0); g.addGroup(u, s.length - u, 1);
    return g;
  }

  /* ---------- world builder ---------- */
  function World(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.hotspots = [];
    this.npcs = [];
    this.rooms = [];
    this.pickables = [];
    this.held = null;
    this.lamps = [];
    this.tickers = [];
  }
  World.prototype.add = function (mesh) { this.scene.add(mesh); return mesh; };
  World.prototype.box = function (w, h, d, o) {
    o = o || {};
    var map = o.map || null;
    if (map && o.repeat) map = cloneMapped(map, o.repeat);
    var col = o.color == null ? (map ? 0xffffff : 0xcccccc) : o.color;
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), o.mat || lamb(col, map, o));
    m.position.set(o.x || 0, o.y == null ? h / 2 : o.y, o.z || 0);
    if (o.rx) m.rotation.x = o.rx;
    if (o.ry) m.rotation.y = o.ry;
    if (o.rz) m.rotation.z = o.rz;
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.recv !== false;
    if (o.name) m.name = o.name;
    this.scene.add(m);
    if (o.collide !== false && o.collide !== 0) {
      if (o.collideR != null) {
        if (o.collideR > 0.12) this.obstacles.push({ kind: 'circ', x: m.position.x, z: m.position.z, r: o.collideR });
      } else {
        this.obstacles.push({
          kind: 'box',
          minX: m.position.x - w / 2,
          maxX: m.position.x + w / 2,
          minZ: m.position.z - d / 2,
          maxZ: m.position.z + d / 2
        });
      }
    }
    return m;
  };
  World.prototype.cyl = function (r, h, o) {
    o = o || {};
    var m = new THREE.Mesh(new THREE.CylinderGeometry(r, o.r2 != null ? o.r2 : r, h, o.seg || 12), o.mat || lamb(o.color || 0xcccccc, o.map, o));
    m.position.set(o.x || 0, o.y == null ? h / 2 : o.y, o.z || 0);
    if (o.ry) m.rotation.y = o.ry;
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.recv !== false;
    this.scene.add(m);
    if (o.collide !== false) this.obstacles.push({ kind: 'circ', x: m.position.x, z: m.position.z, r: r + 0.1 });
    return m;
  };
  World.prototype.plane = function (w, h, o) {
    o = o || {};
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.mat || lamb(o.color || 0xffffff, o.map, o));
    m.position.set(o.x || 0, o.y || 0, o.z || 0);
    m.rotation.x = o.rx != null ? o.rx : 0;
    m.rotation.y = o.ry || 0;
    m.rotation.z = o.rz || 0;
    this.scene.add(m);
    return m;
  };
  World.prototype.label = function (text, o) {
    o = o || {};
    var c = document.createElement('canvas');
    c.width = 512; c.height = 128;
    var g = c.getContext('2d');
    g.fillStyle = o.bg || '#f4ead4';
    g.fillRect(0, 0, 512, 128);
    g.strokeStyle = o.bd || '#6B4423'; g.lineWidth = 10; g.strokeRect(8, 8, 496, 112);
    g.fillStyle = o.fg || '#3a2414';
    g.font = '600 42px Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 256, 64);
    var t = new THREE.CanvasTexture(c);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    var sc = o.scale || 1.15;
    sp.scale.set(sc, sc * 0.25, 1);
    sp.position.set(o.x || 0, o.y || 2.2, o.z || 0);
    this.scene.add(sp);
    return sp;
  };
  World.prototype.poster = function (draw, o) {
    o = o || {};
    var c = document.createElement('canvas');
    c.width = o.cw || 512; c.height = o.ch || 640;
    draw(c.getContext('2d'), c.width, c.height);
    var t = new THREE.CanvasTexture(c);
    if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    var w = o.w || 1.15, h = o.h || 1.45;
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lamb(0xffffff, t, { side: THREE.DoubleSide, roughness: 0.65, normal: false }));
    m.position.set(o.x || 0, o.y || 1.7, o.z || 0);
    m.rotation.y = o.ry || 0;
    this.scene.add(m);
    this.box(w + 0.08, h + 0.08, 0.04, { x: o.x, y: o.y, z: o.z + (o.ry ? 0 : -0.03), color: 0x5a3a22, collide: false, ry: o.ry });
    return m;
  };
  World.prototype.pendant = function (x, z, y) {
    y = y == null ? 2.85 : y;
    this.cyl(0.015, 0.55, { x: x, y: y - 0.2, z: z, color: 0x3a2a18, collide: false, seg: 6 });
    this.cyl(0.18, 0.16, { x: x, y: y - 0.52, z: z, color: 0xf2c230, r2: 0.28, collide: false, seg: 10, emissive: 0x442200, roughness: 0.35, metalness: 0.25 });
    this.lamps.push({ x: x, y: y - 0.55, z: z, color: 0xffd9a0, int: 0.85, dist: 8 });
  };
  World.prototype.hotspot = function (spec) {
    spec.r = spec.r || 1.15;
    spec.y = spec.y || 0;
    this.hotspots.push(spec);
    if (spec.marker !== false) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.025, 8, 24),
        lamb(0xc9a227, null, { emissive: 0x221800 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(spec.x, 0.05, spec.z);
      ring.userData.hot = spec.id;
      this.scene.add(ring);
      spec._ring = ring;
    }
    return spec;
  };
  World.prototype.npc = function (spec) {
    spec.r = spec.r || 0.7;
    var g = new THREE.Group();
    var segs = 12;
    var skinM = lamb(0xffffff, KH.tex.haut(), { roughness: 0.75 });
    var clothHex = '#' + (spec.color || 0x2A63A8).toString(16).padStart(6, '0');
    var clothM = lamb(0xffffff, KH.tex.stoff(clothHex), { roughness: 0.82 });
    var legsM = lamb(0xffffff, KH.tex.stoff(spec.legsHex || '#3A322C'), { roughness: 0.9 });
    var hairM = lamb(spec.hair || 0x2a1a10, null, { roughness: 0.95 });
    function limb(rt, rb, hh, mat) {
      var gg = new THREE.Group();
      var c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, hh, segs), mat);
      c.position.y = -hh / 2;
      var a = new THREE.Mesh(new THREE.SphereGeometry(rt, segs, segs / 2), mat);
      var b = new THREE.Mesh(new THREE.SphereGeometry(rb, segs, segs / 2), mat);
      b.position.y = -hh;
      gg.add(c, a, b);
      gg.traverse(function (m) { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      return gg;
    }
    var legs = limb(0.16, 0.18, 0.72, legsM);
    legs.position.y = 0.78;
    var hips = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16, segs), legsM);
    hips.position.y = 0.82;
    var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.2, 0.7, segs), clothM);
    torso.position.y = 1.22;
    var cap = new THREE.Mesh(new THREE.SphereGeometry(0.23, segs, 8, 0, Math.PI * 2, 0, Math.PI / 2), clothM);
    cap.position.y = 1.56;
    var belt = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.08, segs), lamb(0x1a1a1a, null, { roughness: 0.5, metalness: 0.2 }));
    belt.position.y = 0.9;
    var collar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, segs), clothM);
    collar.rotation.x = Math.PI / 2; collar.position.y = 1.55;
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), skinM);
    head.position.y = 1.78;
    var hair = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 10, 0, Math.PI * 2, 0, Math.PI / 1.7), hairM);
    hair.position.y = 1.86;
    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), skinM);
    nose.position.set(0, 1.76, 0.18);
    [hips, torso, cap, belt, collar, head, hair, nose].forEach(function (m) { m.castShadow = true; m.receiveShadow = true; });
    g.add(legs, hips, torso, cap, belt, collar, head, hair, nose);
    if (spec.apron) {
      var ap = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.06), lamb(0xffffff, KH.tex.stoff('#F4EAD4'), { roughness: 0.85 }));
      ap.position.set(0, 1.05, 0.16); ap.castShadow = true;
      g.add(ap);
    }
    g.position.set(spec.x, 0, spec.z);
    if (spec.facing != null) g.rotation.y = spec.facing;
    this.scene.add(g);
    this.label(spec.name, { x: spec.x, y: 2.18, z: spec.z, scale: 0.95 });
    this.obstacles.push({ kind: 'circ', x: spec.x, z: spec.z, r: 0.45 });
    spec._mesh = g;
    this.npcs.push(spec);
    this.hotspot({ id: spec.id, x: spec.x, z: spec.z, r: spec.r + 0.4, label: spec.name, kind: 'npc', marker: false });
    return spec;
  };
  World.prototype.room = function (spec) {
    var x = spec.x || 0, z = spec.z || 0, w = spec.w || 10, d = spec.d || 8, h = spec.h || 3.1;
    var wallHex = spec.wallHex || '#e4d5c0';
    var wallTex = spec.wallMap || KH.tex.putz(wallHex);
    var floorMap = spec.floorMap || KH.tex.parkett();
    this.box(w, 0.06, d, { x: x, y: 0.03, z: z, map: floorMap, repeat: [w / 1.6, d / 1.6], collide: false, cast: false, roughness: 0.88 });
    if (spec.ceiling !== false) this.box(w, 0.06, d, { x: x, y: h, z: z, color: spec.ceil || 0xf7efe4, collide: false, cast: false, emissive: 0x2a241c, emissiveIntensity: 0.12, roughness: 0.95 });
    var t = 0.18;
    var wall = spec.wall || 0xe4d5c0;
    var doors = spec.doors || [];
    function hasDoor(wallId) {
      for (var i = 0; i < doors.length; i++) if (doors[i].wall === wallId) return doors[i];
      return null;
    }
    var self = this;
    function wallSeg(ww, hh, dd, ox, oy, oz) {
      self.box(ww, hh, dd, { x: ox, y: oy, z: oz, map: wallTex, repeat: [Math.max(1, ww / 2), Math.max(1, hh / 2)] });
    }
    function buildWall(axis, sign) {
      var door = hasDoor(axis === 'z' ? (sign < 0 ? 's' : 'n') : (sign < 0 ? 'w' : 'e'));
      var along = axis === 'z' ? w : d;
      var thick = t;
      var cx = axis === 'x' ? x + sign * (w / 2) : x;
      var cz = axis === 'z' ? z + sign * (d / 2) : z;
      if (!door) {
        if (axis === 'z') wallSeg(along + t, h, thick, cx, h / 2, cz);
        else wallSeg(thick, h, along + t, cx, h / 2, cz);
        return;
      }
      var dw = door.width || 1.5, off = door.offset || 0, dh = door.height || 2.15;
      var left = along / 2 + off - dw / 2;
      var right = along / 2 - off - dw / 2;
      /* left and right measured from center: pieces on both sides of door */
      var a = (along / 2 + off) - dw / 2; /* length of negative-side piece */
      var b = (along / 2 - off) - dw / 2;
      a = Math.max(0.2, along / 2 + off - dw / 2);
      b = Math.max(0.2, along / 2 - off - dw / 2);
      if (axis === 'z') {
        wallSeg(a, h, thick, x - along / 2 + a / 2, h / 2, cz);
        wallSeg(b, h, thick, x + along / 2 - b / 2, h / 2, cz);
        wallSeg(dw + 0.1, Math.max(0.2, h - dh), thick, x + off, dh + (h - dh) / 2, cz);
      } else {
        wallSeg(thick, h, a, cx, h / 2, z - along / 2 + a / 2);
        wallSeg(thick, h, b, cx, h / 2, z + along / 2 - b / 2);
        wallSeg(thick, Math.max(0.2, h - dh), dw + 0.1, cx, dh + (h - dh) / 2, z + off);
      }
    }
    buildWall('z', -1); buildWall('z', 1); buildWall('x', -1); buildWall('x', 1);
    /* skirting + beams */
    if (spec.trim !== false) {
      var wood = KH.tex.holz();
      self.box(w - 0.2, 0.1, 0.06, { x: x, y: 0.08, z: z - d / 2 + 0.12, map: wood, collide: false });
      self.box(w - 0.2, 0.1, 0.06, { x: x, y: 0.08, z: z + d / 2 - 0.12, map: wood, collide: false });
      self.box(0.06, 0.1, d - 0.2, { x: x - w / 2 + 0.12, y: 0.08, z: z, map: wood, collide: false });
      self.box(0.06, 0.1, d - 0.2, { x: x + w / 2 - 0.12, y: 0.08, z: z, map: wood, collide: false });
      if (spec.ceiling !== false && spec.beams !== false) {
        for (var bi = -Math.floor(w / 3); bi <= Math.floor(w / 3); bi++) {
          self.box(0.1, 0.08, d * 0.9, { x: x + bi * 1.55, y: h - 0.08, z: z, map: wood, collide: false });
        }
      }
    }
    if (spec.windows) {
      spec.windows.forEach(function (win) {
        var wx = x, wz = z, ry = 0, inward = 0.11;
        if (win.wall === 'n') { wz = z + d / 2 - inward; wx = x + (win.offset || 0); }
        if (win.wall === 's') { wz = z - d / 2 + inward; wx = x + (win.offset || 0); }
        if (win.wall === 'e') { wx = x + w / 2 - inward; wz = z + (win.offset || 0); ry = Math.PI / 2; }
        if (win.wall === 'w') { wx = x - w / 2 + inward; wz = z + (win.offset || 0); ry = Math.PI / 2; }
        var ww = win.w || 1.35, hh = win.h || 1.15, wy = win.y || 1.65;
        self.box(ww + 0.12, hh + 0.12, 0.07, { x: wx, y: wy, z: wz, color: 0x5a3a22, collide: false, ry: ry, map: KH.tex.holz() });
        self.plane(ww, hh, {
          x: wx, y: wy, z: wz, ry: ry,
          color: 0xd4e8f6, emissive: 0x445566, emissiveIntensity: 0.25,
          transparent: true, opacity: 0.55, roughness: 0.12, metalness: 0.15, normal: false
        });
        self.box(0.04, hh, 0.05, { x: wx, y: wy, z: wz, color: 0x5a3a22, collide: false, ry: ry });
        self.box(ww, 0.04, 0.05, { x: wx, y: wy, z: wz, color: 0x5a3a22, collide: false, ry: ry });
        if (win.flowers !== false) {
          var fx = wx, fz = wz;
          if (win.wall === 'n') fz -= 0.18; if (win.wall === 's') fz += 0.18;
          if (win.wall === 'e') fx -= 0.18; if (win.wall === 'w') fx += 0.18;
          self.box(ww * 0.7, 0.12, 0.18, { x: fx, y: wy - hh / 2 - 0.05, z: fz, color: 0x8B1E1E, collide: false });
          self.cyl(0.08, 0.16, { x: fx - 0.2, y: wy - hh / 2 + 0.12, z: fz, color: 0xc45c7a, collide: false, seg: 6 });
          self.cyl(0.08, 0.16, { x: fx + 0.2, y: wy - hh / 2 + 0.12, z: fz, color: 0xf2c230, collide: false, seg: 6 });
          if (win.wall === 'n' || win.wall === 's') {
            self.box(ww + 0.28, 0.07, 0.05, { x: wx, y: wy + hh / 2 + 0.1, z: fz, color: 0x5a3a22, collide: false });
            self.box(0.18, hh + 0.18, 0.04, { x: wx - ww / 2 + 0.04, y: wy - 0.04, z: fz, color: 0x8B1E1E, collide: false });
            self.box(0.18, hh + 0.18, 0.04, { x: wx + ww / 2 - 0.04, y: wy - 0.04, z: fz, color: 0xf4ead4, collide: false });
          } else {
            self.box(0.05, 0.07, ww + 0.28, { x: fx, y: wy + hh / 2 + 0.1, z: wz, color: 0x5a3a22, collide: false });
            self.box(0.04, hh + 0.18, 0.18, { x: fx, y: wy - 0.04, z: wz - ww / 2 + 0.04, color: 0x8B1E1E, collide: false });
            self.box(0.04, hh + 0.18, 0.18, { x: fx, y: wy - 0.04, z: wz + ww / 2 - 0.04, color: 0xf4ead4, collide: false });
          }
        }
      });
    }
    this.rooms.push(spec);
    return spec;
  };

  KH.furn = {
    table: function (w, x, z, o) {
      o = o || {};
      var wood = KH.tex.holz();
      w.box(1.15, 0.07, 0.78, { x: x, y: 0.74, z: z, map: wood, collideR: 0.68 });
      [[-0.48, -0.28], [0.48, -0.28], [-0.48, 0.28], [0.48, 0.28]].forEach(function (p) {
        w.box(0.07, 0.7, 0.07, { x: x + p[0], y: 0.35, z: z + p[1], map: wood, collide: false });
      });
      if (o.cloth !== false) {
        w.box(1.05, 0.02, 0.7, { x: x, y: 0.79, z: z, map: o.check ? KH.tex.kariert() : null, color: o.check ? 0xffffff : 0xf7f1e3, collide: false });
      }
      if (o.set !== false) {
        w.cyl(0.055, 0.08, { x: x - 0.18, y: 0.86, z: z, color: 0xf4ead4, collide: false, seg: 8 });
        w.cyl(0.07, 0.02, { x: x + 0.2, y: 0.82, z: z + 0.08, color: 0xeff1ec, collide: false, seg: 10 });
        w.cyl(0.04, 0.03, { x: x + 0.2, y: 0.84, z: z + 0.08, color: 0xc45c4a, collide: false, seg: 8 });
      }
    },
    chair: function (w, x, z, ry) {
      var wood = KH.tex.holz();
      w.box(0.4, 0.07, 0.4, { x: x, y: 0.46, z: z, map: wood, collideR: 0.3, ry: ry || 0 });
      w.box(0.4, 0.48, 0.06, { x: x, y: 0.74, z: z + 0.17, map: wood, collide: false, ry: ry || 0 });
      w.box(0.36, 0.04, 0.36, { x: x, y: 0.5, z: z, color: 0x6a3a32, collide: false });
    },
    counter: function (w, x, z, len, depth) {
      len = len || 4; depth = depth || 0.7;
      var wood = KH.tex.holz();
      w.box(len, 1.0, depth, { x: x, y: 0.5, z: z, map: wood, repeat: [len / 1.2, 1], collideR: Math.max(len, depth) * 0.38 });
      w.box(len + 0.08, 0.05, depth + 0.1, { x: x, y: 1.04, z: z, color: 0x2a1810, collide: false });
      w.box(len * 0.92, 0.04, 0.04, { x: x, y: 0.55, z: z + depth * 0.42, color: 0xc9a227, collide: false });
    },
    plant: function (w, x, z) {
      w.cyl(0.13, 0.2, { x: x, z: z, color: 0x8a4030, collide: false, seg: 8 });
      w.cyl(0.2, 0.45, { x: x, y: 0.52, z: z, color: 0x2f6b3a, r2: 0.04, collideR: 0.22, seg: 8 });
      w.cyl(0.16, 0.35, { x: x + 0.08, y: 0.58, z: z + 0.05, color: 0x3d7a45, r2: 0.02, collide: false, seg: 7 });
    },
    sofa: function (w, x, z, ry) {
      var cloth = KH.tex.stoff('#4a6a58');
      w.box(2.05, 0.42, 0.82, { x: x, y: 0.32, z: z, map: cloth, color: 0xffffff, collideR: 0.95, ry: ry || 0 });
      w.box(2.05, 0.48, 0.16, { x: x, y: 0.68, z: z + 0.32, map: KH.tex.stoff('#3a5548'), color: 0xffffff, collide: false });
      w.box(0.16, 0.42, 0.82, { x: x - 0.94, y: 0.55, z: z, map: cloth, collide: false });
      w.box(0.16, 0.42, 0.82, { x: x + 0.94, y: 0.55, z: z, map: cloth, collide: false });
      w.box(0.42, 0.12, 0.32, { x: x - 0.45, y: 0.58, z: z - 0.05, map: KH.tex.stoff('#c45c4a'), collide: false });
      w.box(0.42, 0.12, 0.32, { x: x + 0.45, y: 0.58, z: z - 0.05, map: KH.tex.stoff('#f2c230'), collide: false });
    },
    bed: function (w, x, z) {
      var wood = KH.tex.holz();
      w.box(2.15, 0.28, 1.45, { x: x, y: 0.22, z: z, map: wood, collideR: 1.1 });
      w.box(2.05, 0.16, 1.35, { x: x, y: 0.42, z: z, color: 0xf4ead4, collide: false });
      w.box(0.18, 0.72, 1.45, { x: x - 1.08, y: 0.5, z: z, map: wood, collide: false });
      w.box(0.55, 0.16, 0.7, { x: x - 0.65, y: 0.58, z: z, color: 0xe8dcc8, collide: false });
      w.box(0.9, 0.08, 1.2, { x: x + 0.35, y: 0.52, z: z, color: 0x6a8cae, collide: false });
    },
    desk: function (w, x, z) {
      var wood = KH.tex.holz();
      w.box(1.35, 0.07, 0.68, { x: x, y: 0.76, z: z, map: wood, collideR: 0.72 });
      w.box(1.3, 0.68, 0.64, { x: x, y: 0.34, z: z, map: wood, collide: false });
      w.box(0.28, 0.02, 0.22, { x: x - 0.3, y: 0.82, z: z, color: 0xf7f1e3, collide: false });
      w.box(0.16, 0.04, 0.12, { x: x + 0.35, y: 0.82, z: z, color: 0x123E77, collide: false });
    },
    board: function (w, x, y, z, ry, color) {
      w.box(2.5, 1.4, 0.05, { x: x, y: y || 1.7, z: z, color: 0x5a3a22, collide: false, ry: ry || 0 });
      w.box(2.32, 1.22, 0.04, { x: x, y: y || 1.7, z: z + 0.01, color: color || 0x1a4a28, collide: false, ry: ry || 0 });
    },
    tree: function (w, x, z, scale) {
      scale = scale || 1;
      var n = 0.85 + 0.25 * Math.random();
      n *= scale;
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * n, 0.22 * n, 2.2 * n, 8), lamb(0xffffff, KH.tex.rinde(), { roughness: 1 }));
      trunk.position.set(x, 1.1 * n, z);
      trunk.castShadow = true; trunk.receiveShadow = true;
      w.scene.add(trunk);
      var leafM = lamb(0xffffff, KH.tex.laub(), { roughness: 0.95 });
      leafM.flatShading = true;
      var c1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15 * n, 0), leafM);
      c1.position.set(x, 2.55 * n, z);
      var c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85 * n, 0), leafM);
      c2.position.set(x + 0.35 * n, 3.15 * n, z + 0.2 * n);
      c1.castShadow = c2.castShadow = true;
      c1.receiveShadow = c2.receiveShadow = true;
      w.scene.add(c1, c2);
      w.obstacles.push({ kind: 'circ', x: x, z: z, r: 0.45 * n });
    },
    bench: function (w, x, z, ry) {
      var wood = KH.tex.holz();
      w.box(1.65, 0.08, 0.42, { x: x, y: 0.42, z: z, map: wood, collideR: 0.7, ry: ry || 0 });
      w.box(1.65, 0.38, 0.07, { x: x, y: 0.62, z: z + 0.16, map: wood, collide: false });
      w.box(0.08, 0.4, 0.4, { x: x - 0.72, y: 0.2, z: z, map: wood, collide: false });
      w.box(0.08, 0.4, 0.4, { x: x + 0.72, y: 0.2, z: z, map: wood, collide: false });
    },
    bin: function (w, x, z, color, label) {
      w.cyl(0.28, 0.82, { x: x, z: z, color: color || 0x3E8E4E, collideR: 0.4, seg: 10 });
      w.cyl(0.3, 0.06, { x: x, y: 0.86, z: z, color: 0x1a1a1a, collide: false, seg: 10 });
      if (label) w.label(label, { x: x, y: 1.28, z: z, scale: 0.75 });
    },
    lamp: function (w, x, z) {
      w.cyl(0.04, 1.45, { x: x, z: z, color: 0x3a322c, collideR: 0.14, seg: 6 });
      w.cyl(0.24, 0.18, { x: x, y: 1.52, z: z, color: 0xf7f1e3, collide: false, emissive: 0x332200, seg: 10 });
      w.lamps.push({ x: x, y: 1.5, z: z, color: 0xffe2b0, int: 0.45, dist: 5 });
    },
    exhibit: function (w, x, z, color) {
      w.box(1.05, 0.08, 0.55, { x: x, y: 0.95, z: z, color: 0xeff1ec, collideR: 0.6 });
      w.cyl(0.16, 0.9, { x: x, z: z, color: 0x4a4038, collide: false, seg: 8 });
      w.box(0.55, 0.42, 0.08, { x: x, y: 1.22, z: z + 0.12, color: color || 0xC25B4A, collide: false });
      w.lamps.push({ x: x, y: 2.4, z: z, color: 0xfff2d0, int: 0.5, dist: 4 });
    },
    rug: function (w, x, z, rw, rd, color) {
      var hex = typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : (color || '#8B1E1E');
      w.box(rw || 2.4, 0.03, rd || 1.6, { x: x, y: 0.05, z: z, map: KH.tex.stoff(hex), color: 0xffffff, collide: false, cast: false, roughness: 0.92 });
    },
    stall: function (w, x, z, col, title, stripeA, stripeB) {
      var wood = KH.tex.holz();
      w.box(2.6, 1.05, 1.5, { x: x, y: 0.55, z: z, map: wood, collideR: 1.35 });
      w.box(2.8, 0.06, 2.1, { x: x, y: 2.15, z: z, map: KH.tex.markise(stripeA, stripeB), repeat: [4, 1], collide: false });
      w.box(0.08, 1.1, 0.08, { x: x - 1.25, y: 1.55, z: z - 0.7, color: 0x5a3a22, collide: false });
      w.box(0.08, 1.1, 0.08, { x: x + 1.25, y: 1.55, z: z - 0.7, color: 0x5a3a22, collide: false });
      w.box(0.08, 1.1, 0.08, { x: x - 1.25, y: 1.55, z: z + 0.7, color: 0x5a3a22, collide: false });
      w.box(0.08, 1.1, 0.08, { x: x + 1.25, y: 1.55, z: z + 0.7, color: 0x5a3a22, collide: false });
      w.label(title, { x: x, y: 2.38, z: z, scale: 1.05 });
      w.box(0.08, 0.55, 1.4, { x: x - 1.2, y: 1.35, z: z, color: col, collide: false });
    },
    pastry: function (w, x, y, z, color) {
      w.cyl(0.09, 0.07, { x: x, y: y, z: z, color: color || 0xc9a227, collide: false, r2: 0.07, seg: 8 });
    },
    cup: function (w, x, z) {
      w.cyl(0.05, 0.08, { x: x, y: 0.86, z: z, color: 0xf4ead4, collide: false, seg: 8 });
    },
    shelf: function (w, x, z) {
      var wood = KH.tex.holz();
      w.box(1.18, 1.42, 0.3, { x: x, y: 0.85, z: z, map: wood, collideR: 0.55 });
      var cols = [0x8B1E1E, 0x123E77, 0xc9a227, 0x3E8E4E, 0x6B2D5B, 0x4a4038];
      for (var row = 0; row < 3; row++) {
        for (var i = 0; i < 6; i++) {
          w.box(0.09, 0.22, 0.16, {
            x: x - 0.42 + i * 0.15, y: 0.42 + row * 0.4, z: z + 0.02,
            color: cols[(i + row) % cols.length], collide: false
          });
        }
      }
    },
    clock: function (w, x, y, z, ry) {
      w.poster(function (g, W, H) {
        g.fillStyle = '#f4ead4'; g.fillRect(0, 0, W, H);
        g.strokeStyle = '#5a3a22'; g.lineWidth = 16;
        g.beginPath(); g.arc(W / 2, H / 2, W * 0.38, 0, Math.PI * 2); g.stroke();
        g.fillStyle = '#3a2414';
        g.fillRect(W / 2 - 5, H / 2, 10, -W * 0.26);
        g.fillRect(W / 2, H / 2 - 5, W * 0.2, 10);
        g.beginPath(); g.arc(W / 2, H / 2, 7, 0, Math.PI * 2); g.fill();
      }, { x: x, y: y, z: z, ry: ry || 0, w: 0.4, h: 0.4, cw: 256, ch: 256 });
    },
    paper: function (w, x, y, z) {
      w.box(0.28, 0.012, 0.2, { x: x, y: y, z: z, color: 0xf7f1e3, collide: false, rz: 0.18 });
    },
    coat: function (w, x, y, z) {
      w.box(0.28, 0.55, 0.08, { x: x, y: y, z: z, color: 0x123E77, collide: false });
      w.box(0.34, 0.12, 0.1, { x: x, y: y + 0.24, z: z, color: 0x0d2a55, collide: false });
    },
    jar: function (w, x, y, z, color) {
      w.cyl(0.06, 0.14, { x: x, y: y, z: z, color: color || 0xc45c4a, collide: false, seg: 8, roughness: 0.35, metalness: 0.05 });
      w.cyl(0.05, 0.04, { x: x, y: y + 0.08, z: z, color: 0x5a3a22, collide: false, seg: 8 });
    },
    laterne: function (w, x, z) {
      w.cyl(0.07, 2.45, { x: x, z: z, color: 0x2E343C, collideR: 0.22, seg: 6, roughness: 0.85 });
      w.box(0.34, 0.34, 0.34, { x: x, y: 2.55, z: z, color: 0xf2c230, collide: false, emissive: 0x553300, emissiveIntensity: 0.6, roughness: 0.35 });
      w.lamps.push({ x: x, y: 2.55, z: z, color: 0xffd9a0, int: 0.5, dist: 8 });
    },
    haus: function (w, x, z, o) {
      o = o || {};
      var g = new THREE.Group();
      var bw = o.w || 5.2, bd = o.d || 4.0, stockH = 2.25, sockH = 0.65, stories = o.stock || 2;
      var stil = o.stil || 'putz', wand = o.wand || '#C9B79A', dachCol = o.dach || '#7A3E32', laden = o.laden || '';
      var sock = new THREE.Mesh(new THREE.BoxGeometry(bw, sockH, bd), lamb(0xffffff, KH.tex.sockel(), { roughness: 0.95 }));
      sock.position.y = sockH / 2;
      var fas = new THREE.Mesh(new THREE.BoxGeometry(bw, stockH * stories, bd), lamb(0xffffff, KH.tex.fassade(stil, wand, laden), { roughness: 0.93 }));
      fas.position.y = sockH + stockH * stories / 2;
      var corn = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.18, 0.12, bd + 0.18), lamb(0xd7d2c6, null, { roughness: 0.95 }));
      corn.position.y = sockH + 0.06;
      var roof = new THREE.Mesh(dachGeo(bw + 0.45, bd + 0.4, 1.45), [
        lamb(0xffffff, KH.tex.dach(dachCol), { roughness: 0.88 }),
        lamb(0xffffff, KH.tex.putz(wand), { roughness: 0.95 })
      ]);
      roof.position.y = sockH + stockH * stories;
      var door = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.65, 0.08), lamb(o.tuer || 0x6B4423, null, { roughness: 0.55 }));
      door.position.set(0, 0.92, bd / 2 + 0.04);
      [sock, fas, corn, roof, door].forEach(function (m) { m.castShadow = true; m.receiveShadow = true; g.add(m); });
      if (o.markise) {
        var aw = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.72, 0.1, 1.15), lamb(0xffffff, KH.tex.markise(o.markise, '#F2C230'), { roughness: 0.85 }));
        aw.position.set(0, 2.2, bd / 2 + 0.55);
        aw.rotation.x = -0.14; aw.castShadow = true;
        g.add(aw);
      }
      g.position.set(x, 0, z);
      g.rotation.y = o.ry || 0;
      w.scene.add(g);
      w.obstacles.push({ kind: 'circ', x: x, z: z, r: Math.max(bw, bd) * 0.45 });
      return g;
    }
  };

  /* ---------- shell DOM ---------- */
  function injectShell(cfg) {
    var app = $('kh-app');
    if (!app) {
      app = document.createElement('div');
      app.id = 'kh-app';
      document.body.appendChild(app);
    }
    app.innerHTML =
      '<a class="sr-only" href="#kh-werkzeuge">Zur Steuerung springen</a>' +
      '<p id="kh-ansage" class="sr-only" lang="de" role="status" aria-live="polite"></p>' +
      '<div id="kh-buehne"></div>' +
      '<div id="kh-hud">' +
        '<div id="kh-ort"><div class="platte" id="kh-ort-name">Kleinhausen</div>' +
        '<div class="platte" id="kh-kompass" title="Blickrichtung">N</div></div>' +
        '<div id="kh-werkzeuge" role="toolbar" aria-label="Spielsteuerung">' +
          '<button class="btn btn--klein" type="button" id="b-vorlesen" aria-pressed="true">Vorlesen</button>' +
          '<button class="btn btn--klein" type="button" id="b-en" aria-pressed="true">EN</button>' +
          '<button class="btn btn--klein" type="button" id="b-hilfe">Hilfe</button>' +
          '<button class="btn btn--klein" type="button" id="b-opt">Optionen</button>' +
          '<button class="btn btn--klein" type="button" id="b-pause">Pause</button>' +
        '</div>' +
        '<div id="kh-aktion" hidden></div>' +
        '<section id="kh-aufgabe" class="karte" lang="de">' +
          '<header><span id="kh-auf-titel">Aufgabe</span><span class="nr" id="kh-auf-nr">1 / 1</span></header>' +
          '<div class="leib"><div class="balken" id="kh-balken" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
          '<p id="kh-auf-text" style="margin-top:.6em"></p>' +
          '<p class="en" id="kh-auf-en"></p></div>' +
        '</section>' +
        '<div id="kh-touch">' +
          '<div style="display:flex;gap:10px">' +
            '<button class="tbtn" type="button" id="t-links" aria-label="Links">◀</button>' +
            '<button class="tbtn" type="button" id="t-rechts" aria-label="Rechts">▶</button>' +
          '</div>' +
          '<div style="display:flex;gap:10px;align-items:flex-end">' +
            '<button class="tbtn" type="button" id="t-e" aria-label="Aktion">E</button>' +
            '<button class="tbtn" type="button" id="t-vor" aria-label="Vorwärts">▲</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<main id="kh-funk" lang="de"></main>' +
      '<div class="overlay" id="kh-overlay"></div>';
  }

  function showOverlay(html) {
    var o = $('kh-overlay');
    o.hidden = false;
    o.innerHTML = html;
    var f = o.querySelector('button, input, textarea, select');
    if (f) setTimeout(function () { f.focus(); }, 40);
  }
  function hideOverlay() {
    $('kh-overlay').hidden = true;
    $('kh-overlay').innerHTML = '';
  }

  /* ---------- start ---------- */
  KH.start = function (cfg) {
    if (!THREE) {
      document.body.innerHTML = '<p style="padding:2em;font-family:sans-serif">Three.js fehlt. Diese Datei braucht die eingebettete Bibliothek.</p>';
      return;
    }
    injectShell(cfg);
    if (prefersTouch()) document.documentElement.dataset.touch = '1';
    applyOpt();

    var state = {
      cfg: cfg,
      name: '',
      funk: false,
      running: false,
      task: 0,
      tries: {},
      scores: [],
      near: null,
      yaw: cfg.spawn && cfg.spawn.yaw != null ? cfg.spawn.yaw : 0,
      pitch: 0,
      x: cfg.spawn ? cfg.spawn.x : 0,
      z: cfg.spawn ? cfg.spawn.z : 4,
      keys: {},
      lookHold: false,
      last: 0,
      writeText: '',
      world: null
    };
    KH._state = state;

    function maxPts() { return cfg.tasks.length * 2; }
    function ptsNow() {
      var s = 0; for (var i = 0; i < state.scores.length; i++) s += state.scores[i] || 0; return s;
    }
    function tagDone() {
      var t = '';
      for (var i = 0; i < cfg.tasks.length; i++) t += (state.scores[i] > 0 ? String(i + 1) : '0');
      return t || '0';
    }

    function currentTask() { return cfg.tasks[state.task]; }

    function setTaskHud() {
      var n = cfg.tasks.length, i = Math.min(state.task, n - 1), t = cfg.tasks[i];
      $('kh-auf-nr').textContent = Math.min(state.task + 1, n) + ' / ' + n;
      var pct = Math.round((state.task / n) * 100);
      $('kh-balken').querySelector('i').style.width = pct + '%';
      $('kh-balken').setAttribute('aria-valuenow', String(pct));
      if (!t || state.task >= n) {
        $('kh-auf-titel').textContent = 'Fertig';
        $('kh-auf-text').textContent = 'Alle Aufgaben sind erledigt.';
        $('kh-auf-en').textContent = 'All tasks are done.';
        return;
      }
      $('kh-auf-titel').textContent = t.title || 'Aufgabe';
      $('kh-auf-text').innerHTML = esc(t.de);
      $('kh-auf-en').textContent = t.en || '';
      var room = t.room || (cfg.title.split('—')[0]);
      $('kh-ort-name').textContent = t.where || cfg.place || 'Kleinhausen';
    }

    function award(okFirst) {
      var tries = state.tries[state.task] || 1;
      var got = okFirst && tries <= 1 ? 2 : (okFirst ? 1 : 0);
      if (okFirst && tries === 2) got = 1;
      if (okFirst && tries > 2) got = 1;
      if (!okFirst) return;
      state.scores[state.task] = got;
    }

    function completeTask(ok) {
      if (ok) {
        state.scores[state.task] = (state.tries[state.task] || 0) === 0 ? 2 : 1;
        beep('gut');
        state.task++;
        setTaskHud();
        ansage('Aufgabe erledigt.', true);
        if (state.task >= cfg.tasks.length) { finishFlow(); return; }
        if (state.funk) renderFunk();
      } else {
        state.tries[state.task] = (state.tries[state.task] || 0) + 1;
        beep('nein');
      }
    }

    function bumpTry() {
      state.tries[state.task] = (state.tries[state.task] || 0) + 1;
    }

    /* scene */
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(cfg.sky || 0xb9d4e4);
    if (cfg.fog !== false) scene.fog = new THREE.Fog(cfg.fogColor || cfg.sky || 0xc8b89a, cfg.fogNear || 14, cfg.fogFar || 38);
    var camera = new THREE.PerspectiveCamera(OPT.sicht, 1, 0.08, cfg.outdoor ? 200 : 90);
    camera.rotation.order = 'YXZ';
    KH._camera = camera;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (e) {
      renderer = null;
    }
    var stage = $('kh-buehne');
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.setClearColor(cfg.sky || 0xb9d4e4, 1);
      if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
      if (THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = cfg.exposure || (cfg.outdoor ? 1.02 : 0.96);
      }
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      stage.appendChild(renderer.domElement);
    }
    scene.add(new THREE.HemisphereLight(
      cfg.hemiTop || 0xa8c6e0,
      cfg.hemiBot || (cfg.outdoor ? 0x6e7a52 : 0x8a7060),
      cfg.hemi || 0.72
    ));
    var sun = new THREE.DirectionalLight(cfg.sun || 0xffe8c8, cfg.sunInt || (cfg.outdoor ? 1.55 : 0.95));
    sun.position.set(cfg.sunX || -8, cfg.sunY || 14, cfg.sunZ || -6);
    sun.castShadow = true;
    var span = cfg.outdoor ? 28 : 14;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -span; sun.shadow.camera.right = span;
    sun.shadow.camera.top = span; sun.shadow.camera.bottom = -span;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
    sun.shadow.bias = -0.0007; sun.shadow.normalBias = 0.35;
    scene.add(sun); scene.add(sun.target);
    var fill = new THREE.DirectionalLight(0xcfd8e8, cfg.fillInt || (cfg.outdoor ? 0.7 : 0.38));
    fill.position.set(10, 9, 8);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xfff5ea, cfg.ambient || 0.1));

    var world = new World(scene);
    state.world = world;
    if (cfg.outdoor) {
      var skyMat = new THREE.MeshBasicMaterial({ map: KH.tex.himmel(), side: THREE.BackSide, fog: false, depthWrite: false });
      var sky = new THREE.Mesh(new THREE.SphereGeometry(90, 24, 16), skyMat);
      scene.add(sky);
      var cloudM = new THREE.MeshBasicMaterial({ map: KH.tex.wolke(), transparent: true, opacity: 0.82, depthWrite: false, fog: false });
      for (var ci = 0; ci < 7; ci++) {
        var cl = new THREE.Mesh(new THREE.PlaneGeometry(14 + 10 * Math.random(), 6 + 4 * Math.random()), cloudM);
        cl.position.set(36 * (Math.random() - 0.5), 16 + 8 * Math.random(), 36 * (Math.random() - 0.5));
        cl.rotation.x = -Math.PI / 2.1;
        cl.renderOrder = -1;
        scene.add(cl);
      }
    }
    if (typeof cfg.build === 'function') cfg.build(world, KH);
    world.lamps.forEach(function (L) {
      var pl = new THREE.PointLight(L.color || 0xffd9a0, L.int == null ? 0.55 : L.int, L.dist == null ? 7 : L.dist);
      pl.position.set(L.x, L.y, L.z);
      scene.add(pl);
    });

    function resize() {
      var w = stage.clientWidth || window.innerWidth, h = stage.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      if (renderer) renderer.setSize(w, h, false);
    }
    window.addEventListener('resize', resize);
    resize();

    function collide(nx, nz) {
      var list = world.obstacles, pad = 0.32;
      for (var i = 0; i < list.length; i++) {
        var o = list[i];
        if (o.kind === 'box') {
          var minX = o.minX - pad, maxX = o.maxX + pad, minZ = o.minZ - pad, maxZ = o.maxZ + pad;
          if (nx > minX && nx < maxX && nz > minZ && nz < maxZ) {
            var dl = nx - minX, dr = maxX - nx, db = nz - minZ, df = maxZ - nz;
            var m = Math.min(dl, dr, db, df);
            if (m === dl) nx = minX;
            else if (m === dr) nx = maxX;
            else if (m === db) nz = minZ;
            else nz = maxZ;
          }
        } else {
          var dx = nx - o.x, dz = nz - o.z, lim = o.r + pad, d2 = dx * dx + dz * dz;
          if (d2 < lim * lim && d2 > 0) {
            var d = Math.sqrt(d2), p = lim / d;
            nx = o.x + dx * p; nz = o.z + dz * p;
          }
        }
      }
      var b = cfg.bounds || { minX: -20, maxX: 20, minZ: -20, maxZ: 20 };
      nx = Math.max(b.minX, Math.min(b.maxX, nx));
      nz = Math.max(b.minZ, Math.min(b.maxZ, nz));
      return { x: nx, z: nz };
    }

    function nearestHotspot() {
      var best = null, bestD = 99;
      for (var i = 0; i < world.hotspots.length; i++) {
        var h = world.hotspots[i];
        var dx = state.x - h.x, dz = state.z - h.z, d = Math.sqrt(dx * dx + dz * dz);
        if (d < h.r && d < bestD) { best = h; bestD = d; }
      }
      return best;
    }

    function compass() {
      var a = ((state.yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      var dirs = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
      var i = Math.round(a / (Math.PI / 4)) % 8;
      $('kh-kompass').textContent = dirs[i];
    }

    function openTaskFor(hot) {
      var t = currentTask();
      if (!t || state.task >= cfg.tasks.length) return;
      if (t.hotspot && hot.id !== t.hotspot) {
        showOverlay(dialogWrap('Noch nicht',
          '<p>' + esc(t.waitDe || 'Das brauchst du später. Schau auf die aktuelle Aufgabe.') + '</p>' +
          enBlock(t.waitEn || 'You need this later. Check the current task.') +
          '<div class="dialog__fuss"><button class="btn btn--haupt" type="button" id="d-ok">OK</button></div>'));
        $('d-ok').onclick = hideOverlay;
        return;
      }
      if (t.hotspot && hot.id === t.hotspot) runTask(t, hot);
      else if (!t.hotspot && t.kind === 'goto') completeTask(true);
    }

    function dialogWrap(title, inner) {
      return '<div class="dialog" role="dialog" aria-modal="true"><div class="dialog__kopf"><h2>' + esc(title) + '</h2></div><div class="dialog__leib">' + inner + '</div></div>';
    }

    function runTask(t, hot) {
      if (t.kind === 'goto' || t.kind === 'inspect' && !t.choices && !t.question) {
        var body = '<p>' + esc(t.inspectDe || t.de) + '</p>' + enBlock(t.inspectEn || t.en);
        if (t.flavor) body += '<p class="zitat">' + esc(t.flavor.de) + enBlock(t.flavor.en) + '</p>';
        body += '<div class="dialog__fuss"><button class="btn btn--haupt" type="button" id="d-ok">Weiter</button></div>';
        showOverlay(dialogWrap(t.title || hot.label || 'Ort', body));
        $('d-ok').onclick = function () { hideOverlay(); completeTask(true); };
        sprich(t.inspectDe || t.de);
        return;
      }
      if (t.kind === 'dialogue' || t.choices) {
        var html = '';
        if (t.npc) html += '<p><strong>' + esc(t.npc) + '</strong></p>';
        if (t.line) html += '<p class="zitat">' + esc(t.line.de) + enBlock(t.line.en) + '</p>';
        html += '<p>' + esc(t.prompt || 'Was sagst du?') + '</p>' + enBlock(t.promptEn || '');
        html += '<div class="wahl">';
        (t.choices || []).forEach(function (c, i) {
          html += '<button class="btn" type="button" data-i="' + i + '">' + esc(c.de) + enBlock(c.en) + '</button>';
        });
        html += '</div>';
        showOverlay(dialogWrap(t.title || (hot && hot.label) || 'Gespräch', html));
        sprich((t.line && t.line.de) || t.de);
        $('kh-overlay').querySelectorAll('[data-i]').forEach(function (b) {
          b.onclick = function () {
            var c = t.choices[+b.getAttribute('data-i')];
            if (c.ok) {
              hideOverlay();
              if (c.reply) {
                showOverlay(dialogWrap(t.npc || 'Antwort',
                  '<p class="zitat">' + esc(c.reply.de) + enBlock(c.reply.en) + '</p>' +
                  '<div class="dialog__fuss"><button class="btn btn--haupt" type="button" id="d-ok">Weiter</button></div>'));
                $('d-ok').onclick = function () { hideOverlay(); completeTask(true); };
                sprich(c.reply.de);
              } else completeTask(true);
            } else {
              bumpTry();
              beep('nein');
              var tip = c.tip ? '<p>' + esc(c.tip.de) + enBlock(c.tip.en) + '</p>' : '<p>Versuch es noch einmal — höflicher oder genauer.</p>';
              var box = $('kh-overlay').querySelector('.wahl');
              if (!$('kh-tip')) {
                var p = document.createElement('div');
                p.id = 'kh-tip'; p.className = 'feld'; p.innerHTML = tip;
                box.parentNode.insertBefore(p, box);
              } else $('kh-tip').innerHTML = tip;
              ansage(c.tip && c.tip.de ? c.tip.de : 'Leider nicht.', true);
            }
          };
        });
        return;
      }
      if (t.kind === 'quiz' || t.question) {
        quizDialog(t);
        return;
      }
      if (t.kind === 'sort') {
        sortDialog(t);
        return;
      }
      if (t.kind === 'write') {
        writeDialog(t);
        return;
      }
      if (t.kind === 'collect') {
        if (t.give) world.held = t.give;
        showOverlay(dialogWrap(t.title || 'Gefunden',
          '<p>' + esc(t.de) + '</p>' + enBlock(t.en) +
          '<div class="dialog__fuss"><button class="btn btn--haupt" type="button" id="d-ok">Nehmen</button></div>'));
        $('d-ok').onclick = function () { hideOverlay(); completeTask(true); };
        return;
      }
      completeTask(true);
    }

    function quizDialog(t) {
      var q = t.question || t;
      var html = '<p>' + esc(q.de) + '</p>' + enBlock(q.en);
      if (t.options) {
        html += '<div class="wahl">';
        t.options.forEach(function (c, i) {
          html += '<button class="btn" type="button" data-i="' + i + '">' + esc(c.de) + enBlock(c.en) + '</button>';
        });
        html += '</div>';
        showOverlay(dialogWrap(t.title || 'Quiz', html));
        sprich(q.de);
        $('kh-overlay').querySelectorAll('[data-i]').forEach(function (b) {
          b.onclick = function () {
            var c = t.options[+b.getAttribute('data-i')];
            if (c.ok) { hideOverlay(); completeTask(true); }
            else {
              bumpTry(); beep('nein');
              ansage((c.tip && c.tip.de) || 'Leider nein.', true);
            }
          };
        });
      } else {
        html += '<p><label for="q-in">' + esc(t.label || 'Antwort') + '</label><br>' +
          '<input class="zeile" id="q-in" autocomplete="off" placeholder="' + esc(t.placeholder || '') + '"></p>' +
          '<div class="dialog__fuss"><button class="btn btn--haupt" type="button" id="d-ok">Prüfen</button></div>';
        showOverlay(dialogWrap(t.title || 'Quiz', html));
        sprich(q.de);
        $('d-ok').onclick = function () {
          var val = norm($('q-in').value);
          var ok = (t.accept || []).some(function (a) { return val === norm(a) || val.indexOf(norm(a)) !== -1; });
          if (ok) { hideOverlay(); completeTask(true); }
          else { bumpTry(); beep('nein'); ansage(t.wrongDe || 'Noch nicht. Schau auf den Artikel oder die Schreibweise.', true); }
        };
      }
    }

    function sortDialog(t) {
      var html = '<p>' + esc(t.de) + '</p>' + enBlock(t.en) + '<div class="raster">';
      t.items.forEach(function (it) {
        html += '<div class="feld"><h3>' + esc(it.de) + '</h3>' + enBlock(it.en) + '<select class="zeile" data-item="' + esc(it.id) + '">';
        html += '<option value="">— wählen —</option>';
        t.bins.forEach(function (b) { html += '<option value="' + esc(b.id) + '">' + esc(b.de) + '</option>'; });
        html += '</select></div>';
      });
      html += '</div><div class="dialog__fuss"><button class="btn btn--haupt" type="button" id="d-ok">Prüfen</button></div>';
      showOverlay(dialogWrap(t.title || 'Sortieren', html));
      $('d-ok').onclick = function () {
        var good = true;
        t.items.forEach(function (it) {
          var sel = $('kh-overlay').querySelector('[data-item="' + it.id + '"]');
          if (!sel || sel.value !== it.bin) good = false;
        });
        if (good) { hideOverlay(); completeTask(true); }
        else { bumpTry(); beep('nein'); ansage(t.wrongDe || 'Mindestens eines ist im falschen Behälter.', true); }
      };
    }

    function writeDialog(t) {
      var html = '<p>' + esc(t.de) + '</p>' + enBlock(t.en) +
        (t.chunks ? '<p>' + t.chunks.map(function (c) { return '<button class="btn btn--klein" type="button" data-ch="' + esc(c) + '">' + esc(c) + '</button>'; }).join(' ') + '</p>' : '') +
        '<textarea class="zeile" id="w-in" rows="5" placeholder="' + esc(t.placeholder || '') + '"></textarea>' +
        '<div class="dialog__fuss"><button class="btn btn--haupt" type="button" id="d-ok">Abgeben</button></div>';
      showOverlay(dialogWrap(t.title || 'Schreiben', html));
      if (t.chunks) {
        $('kh-overlay').querySelectorAll('[data-ch]').forEach(function (b) {
          b.onclick = function () {
            var ta = $('w-in'); ta.value = (ta.value + ' ' + b.getAttribute('data-ch')).replace(/^\s+/, '');
          };
        });
      }
      $('d-ok').onclick = function () {
        var val = $('w-in').value.trim();
        var words = val.split(/\s+/).filter(Boolean);
        var need = t.minWords || 6;
        var miss = (t.mustInclude || []).filter(function (w) { return norm(val).indexOf(norm(w)) < 0; });
        if (words.length < need || miss.length) {
          bumpTry();
          ansage('Schreibe mindestens ' + need + ' Wörter' + (miss.length ? ' und benutze: ' + miss.join(', ') : '') + '.', true);
          return;
        }
        state.writeText = val;
        hideOverlay();
        completeTask(true);
      };
    }

    function interact() {
      if ($('kh-overlay') && !$('kh-overlay').hidden) return;
      var t = currentTask();
      var hot = nearestHotspot();
      if (t && t.kind === 'goto' && t.hotspot) {
        if (hot && hot.id === t.hotspot) { completeTask(true); return; }
      }
      if (hot) openTaskFor(hot);
    }

    function loop(now) {
      if (!state.running || state.funk) { requestAnimationFrame(loop); return; }
      var dt = Math.min(0.05, (now - (state.last || now)) / 1000);
      state.last = now;
      if ($('kh-overlay') && !$('kh-overlay').hidden) {
        if (renderer) renderer.render(scene, camera);
        requestAnimationFrame(loop);
        return;
      }
      var spd = 4.1 * OPT.gehen;
      var turn = 1.5;
      var fwd = 0, strafe = 0;
      if (state.keys.KeyW || state.keys.ArrowUp || state.keys.tvor) fwd += 1;
      if (state.keys.KeyS || state.keys.ArrowDown) fwd -= 1;
      if (state.keys.KeyA) strafe -= 1;
      if (state.keys.KeyD) strafe += 1;
      if (state.keys.KeyQ || state.keys.ArrowLeft || state.keys.tlinks) state.yaw -= turn * dt;
      if (state.keys.KeyE && !state.keys._eLatch) { /* E interact is keydown */ }
      if (state.keys.KeyE && false) {}
      if (state.keys.ArrowRight || state.keys.trechts) state.yaw += turn * dt;
      var sin = Math.sin(state.yaw), cos = Math.cos(state.yaw);
      var nx = state.x + (fwd * sin + strafe * cos) * spd * dt;
      var nz = state.z + (fwd * -cos + strafe * sin) * spd * dt;
      var p = collide(nx, nz);
      state.x = p.x; state.z = p.z;
      var eye = 1.62;
      camera.position.set(state.x, eye, state.z);
      camera.rotation.y = state.yaw;
      camera.rotation.x = state.pitch;
      for (var ti = 0; ti < world.tickers.length; ti++) world.tickers[ti](now, dt);
      compass();
      var hot = nearestHotspot();
      state.near = hot;
      var akt = $('kh-aktion');
      if (hot) {
        akt.hidden = false;
        akt.innerHTML = '<kbd>E</kbd> ' + esc(hot.label || hot.id);
      } else akt.hidden = true;
      world.hotspots.forEach(function (h) {
        if (h._ring) h._ring.material.emissive.setHex(hot && hot.id === h.id ? 0x664400 : 0x221800);
      });
      if (renderer) renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }

    function bindInput() {
      document.addEventListener('keydown', function (e) {
        if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) return;
        state.keys[e.code] = true;
        if (e.code === 'KeyE' && !e.repeat) { e.preventDefault(); interact(); }
        if (e.code === 'Escape') { if (!$('kh-overlay').hidden) hideOverlay(); else pauseDlg(); }
        if (e.code === 'KeyV') sprich(($('kh-auf-text') || {}).textContent || '');
        if (e.code === 'KeyH') helpDlg();
      });
      document.addEventListener('keyup', function (e) { state.keys[e.code] = false; });
      var canvas = renderer ? renderer.domElement : stage;
      var dragging = false, lx = 0, ly = 0;
      canvas.addEventListener('click', function () {
        if (OPT.maus && canvas.requestPointerLock) canvas.requestPointerLock();
      });
      document.addEventListener('mousemove', function (e) {
        if (document.pointerLockElement === canvas) {
          state.yaw -= e.movementX * 0.0022;
          state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch - e.movementY * 0.0022));
        } else if (dragging) {
          state.yaw -= (e.clientX - lx) * 0.01;
          state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch - (e.clientY - ly) * 0.01));
          lx = e.clientX; ly = e.clientY;
        }
      });
      canvas.addEventListener('mousedown', function (e) {
        if (document.pointerLockElement === canvas) return;
        dragging = true; lx = e.clientX; ly = e.clientY;
      });
      window.addEventListener('mouseup', function () { dragging = false; });
      function hold(id, code) {
        var el = $(id); if (!el) return;
        var on = function (ev) { ev.preventDefault(); state.keys[code] = true; el.setAttribute('data-an', '1'); };
        var off = function (ev) { ev.preventDefault(); state.keys[code] = false; el.setAttribute('data-an', '0'); };
        el.addEventListener('touchstart', on, { passive: false });
        el.addEventListener('touchend', off);
        el.addEventListener('mousedown', on);
        el.addEventListener('mouseup', off);
        el.addEventListener('mouseleave', off);
      }
      hold('t-vor', 'tvor'); hold('t-links', 'tlinks'); hold('t-rechts', 'trechts');
      if ($('t-e')) $('t-e').addEventListener('click', function (e) { e.preventDefault(); interact(); });
      $('b-en').onclick = function () {
        OPT.en = !OPT.en; applyOpt();
        $('b-en').setAttribute('aria-pressed', OPT.en ? 'true' : 'false');
      };
      $('b-vorlesen').onclick = function () {
        OPT.vorlesen = !OPT.vorlesen;
        $('b-vorlesen').setAttribute('aria-pressed', OPT.vorlesen ? 'true' : 'false');
        if (OPT.vorlesen) sprich(($('kh-auf-text') || {}).textContent || '');
        else if ('speechSynthesis' in window) speechSynthesis.cancel();
      };
      $('b-hilfe').onclick = helpDlg;
      $('b-opt').onclick = optDlg;
      $('b-pause').onclick = pauseDlg;
    }

    function helpDlg() {
      showOverlay(dialogWrap('Hilfe',
        '<p>' + esc(cfg.blurb && cfg.blurb.de || '') + '</p>' + enBlock(cfg.blurb && cfg.blurb.en) +
        '<h3 class="feld" style="border:0;padding:0">Steuerung</h3>' +
        '<div class="tasten-liste"><kbd>W A S D</kbd><span>gehen</span><kbd>Maus / Q E</kbd><span>umsehen</span><kbd>E</kbd><span>sprechen / benutzen</span><kbd>V</kbd><span>Vorlesen</span><kbd>Esc</kbd><span>Pause</span></div>' +
        '<p>Kein WebGL? Nutze den <strong>Funkmodus</strong> — dieselben Deutsch-Aufgaben ohne 3D.</p>' +
        '<div class="dialog__fuss"><button class="btn btn--haupt" type="button" id="d-ok">Schließen</button></div>'));
      $('d-ok').onclick = hideOverlay;
    }
    function optDlg() {
      showOverlay(dialogWrap('Optionen',
        '<div class="feld"><h3>Darstellung</h3>' +
        '<button class="btn btn--klein" type="button" id="o-k">Hoher Kontrast</button> ' +
        '<button class="btn btn--klein" type="button" id="o-l">Leseschrift</button> ' +
        '<button class="btn btn--klein" type="button" id="o-s">Große Schrift</button></div>' +
        '<div class="feld"><h3>Ton</h3>' +
        '<button class="btn btn--klein" type="button" id="o-t">Töne</button></div>' +
        '<div class="dialog__fuss"><button class="btn btn--haupt" type="button" id="d-ok">OK</button></div>'));
      $('o-k').onclick = function () { OPT.kontrast = !OPT.kontrast; applyOpt(); };
      $('o-l').onclick = function () { OPT.lesbar = !OPT.lesbar; applyOpt(); };
      $('o-s').onclick = function () { OPT.schrift = OPT.schrift === 'gross' ? 'sehr-gross' : OPT.schrift === 'sehr-gross' ? 'normal' : 'gross'; applyOpt(); };
      $('o-t').onclick = function () { OPT.toene = !OPT.toene; };
      $('d-ok').onclick = hideOverlay;
    }
    function pauseDlg() {
      showOverlay(dialogWrap('Pause',
        '<p>Nichts geht verloren. Du kannst weiterspielen oder zum Menü.</p>' +
        '<div class="dialog__fuss">' +
        '<button class="btn btn--haupt" type="button" id="p-go">Weiterspielen</button>' +
        '<button class="btn" type="button" id="p-menu">Zum Start</button></div>'));
      $('p-go').onclick = hideOverlay;
      $('p-menu').onclick = function () { hideOverlay(); startScreen(); };
    }

    function renderFunk() {
      document.documentElement.dataset.funk = '1';
      var t = currentTask();
      var box = $('kh-funk');
      if (!t || state.task >= cfg.tasks.length) { finishFlow(); return; }
      var html = '<div class="karte"><p class="untertitel">Funkmodus · ohne 3D</p>' +
        '<h1 style="font-family:var(--font-display);letter-spacing:.05em;text-transform:uppercase">' + esc(cfg.title) + '</h1>' +
        '<p>' + (state.task + 1) + ' / ' + cfg.tasks.length + '</p>' +
        '<p class="zitat">' + esc(t.de) + enBlock(t.en) + '</p>';
      if (t.funkNote) html += '<p>' + esc(t.funkNote.de) + enBlock(t.funkNote.en) + '</p>';
      html += '<p><button class="btn btn--haupt" type="button" id="f-do">Aufgabe öffnen</button> ' +
        '<button class="btn btn--geist" type="button" id="f-v">Vorlesen</button></p></div>';
      box.innerHTML = html;
      $('f-v').onclick = function () { sprich(t.de); };
      $('f-do').onclick = function () { runTask(t, { id: t.hotspot || t.id, label: t.title }); };
    }

    function vocabHtml() {
      if (!cfg.vocab) return '';
      return '<h3>Vokabeln</h3><div class="vokabeln">' + cfg.vocab.map(function (v) {
        return '<div><b>' + esc(v.de) + '</b>' + enBlock(v.en) + '</div>';
      }).join('') + '</div>';
    }

    function startScreen() {
      state.running = false;
      document.documentElement.dataset.funk = '0';
      var how = (cfg.how || []).map(function (h) {
        return '<li>' + esc(h.de) + enBlock(h.en) + '</li>';
      }).join('');
      showOverlay(dialogWrap(cfg.title,
        '<p class="untertitel">' + esc(cfg.level || '') + ' · Kleinhausen</p>' +
        '<p>' + esc(cfg.blurb.de) + '</p>' + enBlock(cfg.blurb.en) +
        (how ? '<ul>' + how + '</ul>' : '') +
        '<p><label for="kh-name"><strong>Dein Name</strong> (für den Canvas-Code)</label><br>' +
        '<input class="zeile" id="kh-name" autocomplete="name" value="' + esc(state.name) + '"></p>' +
        vocabHtml() +
        '<div class="dialog__fuss">' +
        '<button class="btn btn--haupt" type="button" id="s-3d">3D starten</button>' +
        '<button class="btn" type="button" id="s-funk">Funkmodus (ohne 3D)</button>' +
        '<button class="btn btn--geist" type="button" id="s-lehr">Code prüfen</button>' +
        '</div>' +
        '<p style="opacity:.75;font-size:.88rem">Alles läuft im Browser. Es werden keine Daten gespeichert oder gesendet. WebGL kann in manchen Canvas-iframes blockiert sein — dann Funkmodus oder Link in neuem Tab.</p>'));
      $('s-3d').onclick = function () { begin(false); };
      $('s-funk').onclick = function () { begin(true); };
      $('s-lehr').onclick = teacherDlg;
    }

    function teacherDlg() {
      showOverlay(dialogWrap('Code prüfen (Lehrkräfte)',
        '<p>Name genau wie von der Schülerin / dem Schüler, plus Abschlusscode.</p>' +
        '<p><label>Name</label><br><input class="zeile" id="lp-name"></p>' +
        '<p><label>Code</label><br><input class="zeile" id="lp-code" placeholder="' + cfg.prefix + '-…" style="font-family:var(--font-mono)"></p>' +
        '<button class="btn btn--haupt" type="button" id="lp-ok">Prüfen</button>' +
        '<p id="lp-erg" role="status"></p>' +
        '<div class="dialog__fuss"><button class="btn" type="button" id="d-ok">Zurück</button></div>'));
      $('lp-ok').onclick = function () {
        var ok = KH.codePruefen(cfg.prefix, $('lp-name').value, $('lp-code').value);
        $('lp-erg').textContent = ok ? '✓ Code und Name passen zusammen.' : '✗ Passt nicht. Name und Code genau prüfen.';
      };
      $('d-ok').onclick = startScreen;
    }

    function begin(funk) {
      state.name = ($('kh-name') && $('kh-name').value.trim()) || 'Anonym';
      state.funk = funk;
      state.running = true;
      state.task = 0;
      state.scores = [];
      state.tries = {};
      state.writeText = '';
      state.x = cfg.spawn ? cfg.spawn.x : 0;
      state.z = cfg.spawn ? cfg.spawn.z : 4;
      state.yaw = cfg.spawn && cfg.spawn.yaw != null ? cfg.spawn.yaw : 0;
      hideOverlay();
      setTaskHud();
      ansage(cfg.tasks[0] ? cfg.tasks[0].de : 'Los geht’s.', true);
      if (funk || !renderer) {
        if (!renderer && !funk) ansage('WebGL ist nicht verfügbar. Funkmodus wird gestartet.', true);
        renderFunk();
      } else {
        document.documentElement.dataset.funk = '0';
      }
    }

    function finishFlow() {
      state.running = false;
      var prozent = maxPts() ? Math.round(ptsNow() / maxPts() * 100) : 0;
      var extra = String(cfg.tasks.length);
      var code = KH.codeBauen(cfg.prefix, state.name, tagDone(), String(prozent), extra);
      var rows = cfg.tasks.map(function (t, i) {
        return '<tr><td>' + (i + 1) + ' · ' + esc(t.title || t.id) + '</td><td>' + (state.scores[i] || 0) + ' / 2</td></tr>';
      }).join('');
      showOverlay(dialogWrap('Abschlusscode',
        '<p>Gut gemacht, <strong>' + esc(state.name) + '</strong>. ' + ptsNow() + ' von ' + maxPts() + ' Punkten (' + prozent + '&nbsp;%).</p>' +
        (state.writeText ? '<p class="zitat">' + esc(state.writeText) + '</p>' : '') +
        '<table class="feld" style="width:100%;border-collapse:collapse">' + rows + '</table>' +
        '<h3>Abschlusscode</h3>' +
        '<p>Kopiere diesen Code in die Aufgabe in Canvas. Er gehört zum Namen <strong>' + esc(state.name) + '</strong>.</p>' +
        '<p><span class="code">' + esc(code) + '</span></p>' +
        vocabHtml() +
        '<div class="dialog__fuss"><button class="btn btn--haupt" type="button" id="d-ok">Zum Start</button></div>'));
      ansage('Dein Abschlusscode lautet ' + code.split('').join(' '), true);
      $('d-ok').onclick = startScreen;
    }

    bindInput();
    if (!renderer) {
      /* still show start; 3D button will fall back */
    }
    requestAnimationFrame(loop);
    startScreen();
    return state;
  };
})(window);
