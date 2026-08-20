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

  /* ---------- canvas textures ---------- */
  function tex(draw, size) {
    size = size || 256;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    draw(c.getContext('2d'), size);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipMapLinearFilter;
    t.anisotropy = 4;
    return t;
  }
  function grain(g, s, amt) {
    var d = g.getImageData(0, 0, s, s), a = d.data;
    for (var i = 0; i < a.length; i += 4) {
      var n = (Math.random() - 0.5) * amt;
      a[i] = Math.max(0, Math.min(255, a[i] + n));
      a[i + 1] = Math.max(0, Math.min(255, a[i + 1] + n));
      a[i + 2] = Math.max(0, Math.min(255, a[i + 2] + n));
    }
    g.putImageData(d, 0, 0);
  }
  KH.tex = {
    holz: function () {
      return tex(function (g, s) {
        g.fillStyle = '#7a4e2c'; g.fillRect(0, 0, s, s);
        for (var i = 0; i < 14; i++) {
          g.strokeStyle = i % 2 ? 'rgba(50,24,8,.35)' : 'rgba(180,120,70,.25)';
          g.lineWidth = 3 + (i % 3);
          g.beginPath(); g.moveTo(0, i * 9 + 4); g.bezierCurveTo(s * 0.3, i * 9, s * 0.7, i * 9 + 8, s, i * 9 + 2); g.stroke();
        }
        grain(g, s, 18);
      });
    },
    parkett: function () {
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
      });
    },
    putz: function (col) {
      col = col || '#e6d7c2';
      return tex(function (g, s) {
        g.fillStyle = col; g.fillRect(0, 0, s, s);
        grain(g, s, 22);
        g.fillStyle = 'rgba(255,255,255,.07)';
        for (var i = 0; i < 80; i++) g.fillRect((i * 17) % s, (i * 29) % s, 3, 2);
      });
    },
    tapete: function (a, b) {
      return tex(function (g, s) {
        g.fillStyle = a || '#e8dcc8'; g.fillRect(0, 0, s, s);
        g.strokeStyle = b || 'rgba(140,70,70,.18)'; g.lineWidth = 2;
        for (var y = 8; y < s; y += 16) for (var x = 8; x < s; x += 16) {
          g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.stroke();
        }
        grain(g, s, 10);
      });
    },
    fliesen: function (a, b) {
      return tex(function (g, s) {
        var n = 4, h = s / n;
        for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
          g.fillStyle = (x + y) % 2 ? (b || '#d9e2e6') : (a || '#f4f7f8');
          g.fillRect(x * h + 1, y * h + 1, h - 2, h - 2);
        }
        grain(g, s, 8);
      });
    },
    kariert: function () {
      return tex(function (g, s) {
        var n = 8, h = s / n;
        for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
          g.fillStyle = (x + y) % 2 ? '#f2ece3' : '#c45c4a';
          g.fillRect(x * h, y * h, h, h);
        }
      }, 128);
    },
    markise: function (a, b) {
      return tex(function (g, s) {
        for (var x = 0; x < 8; x++) {
          g.fillStyle = x % 2 ? (a || '#C25B4A') : (b || '#F2C230');
          g.fillRect(x * (s / 8), 0, s / 8, s);
        }
      }, 128);
    },
    gras: function () {
      return tex(function (g, s) {
        g.fillStyle = '#3a6b38'; g.fillRect(0, 0, s, s);
        for (var i = 0; i < 220; i++) {
          g.strokeStyle = i % 3 ? '#4e8b5c' : '#2d542c';
          g.lineWidth = 1;
          var x = (i * 19) % s, y = (i * 47) % s;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1, y - 5 - (i % 4)); g.stroke();
        }
        grain(g, s, 14);
      });
    },
    pflaster: function () {
      return tex(function (g, s) {
        g.fillStyle = '#8a8478'; g.fillRect(0, 0, s, s);
        for (var y = 0; y < 6; y++) for (var x = 0; x < 6; x++) {
          var ox = (y % 2) * 10;
          g.fillStyle = 'rgb(' + (130 + (x * 7 + y * 5) % 40) + ',' + (124 + (x * 3) % 20) + ',' + (110 + y % 12) + ')';
          g.fillRect(x * 22 + ox + 1, y * 22 + 1, 19, 18);
        }
        grain(g, s, 16);
      });
    },
    wasser: function () {
      return tex(function (g, s) {
        g.fillStyle = '#1f5f92'; g.fillRect(0, 0, s, s);
        g.strokeStyle = 'rgba(210,235,255,.45)'; g.lineWidth = 3;
        for (var i = 0; i < 7; i++) {
          g.beginPath(); g.moveTo(0, 14 + i * 18);
          g.bezierCurveTo(40, 4 + i * 18, 90, 24 + i * 18, s, 12 + i * 18); g.stroke();
        }
        g.fillStyle = 'rgba(180,220,255,.12)';
        g.fillRect(0, 0, s, s * 0.35);
        grain(g, s, 12);
      });
    },
    ziegel: function () {
      return tex(function (g, s) {
        g.fillStyle = '#6a3a32'; g.fillRect(0, 0, s, s);
        var bh = 10, bw = 20;
        for (var y = 0, row = 0; y < s; y += bh, row++) {
          var off = (row % 2) * (bw / 2);
          for (var x = -bw; x < s; x += bw) {
            g.fillStyle = 'rgb(' + (140 + (x + y) % 30) + ',' + (70 + y % 20) + ',' + (55 + x % 15) + ')';
            g.fillRect(x + off + 1, y + 1, bw - 2, bh - 2);
          }
        }
      });
    },
    himmel: function () {
      return tex(function (g, s) {
        var gr = g.createLinearGradient(0, 0, 0, s);
        gr.addColorStop(0, '#6eb0dc'); gr.addColorStop(0.45, '#b7d7ee'); gr.addColorStop(1, '#f0e2c4');
        g.fillStyle = gr; g.fillRect(0, 0, s, s);
        g.fillStyle = 'rgba(255,255,255,.62)';
        [[40, 30, 22], [70, 34, 18], [28, 36, 14], [96, 48, 16], [18, 52, 12]].forEach(function (c) {
          g.beginPath(); g.arc(c[0], c[1], c[2], 0, Math.PI * 2); g.fill();
        });
        g.fillStyle = '#ffe7a0';
        g.beginPath(); g.arc(s * 0.78, s * 0.18, 10, 0, Math.PI * 2); g.fill();
      }, 256);
    }
  };
  KH.tile = function (maker, rx, ry) {
    var t = typeof maker === 'function' ? maker() : maker;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.needsUpdate = true;
    return t;
  };

  function lamb(color, map, opts) {
    opts = opts || {};
    return new THREE.MeshLambertMaterial({
      color: color == null ? 0xffffff : color,
      map: map || null,
      transparent: !!opts.transparent,
      opacity: opts.opacity == null ? 1 : opts.opacity,
      side: opts.side || THREE.FrontSide,
      emissive: opts.emissive || 0x000000
    });
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
    if (map && o.repeat) {
      map = map.clone();
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(o.repeat[0], o.repeat[1]);
      map.needsUpdate = true;
    }
    var col = o.color == null ? (map ? 0xffffff : 0xcccccc) : o.color;
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), o.mat || lamb(col, map, o));
    m.position.set(o.x || 0, o.y == null ? h / 2 : o.y, o.z || 0);
    if (o.rx) m.rotation.x = o.rx;
    if (o.ry) m.rotation.y = o.ry;
    if (o.rz) m.rotation.z = o.rz;
    m.castShadow = false; m.receiveShadow = false;
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
    var w = o.w || 1.15, h = o.h || 1.45;
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lamb(0xffffff, t, { side: THREE.DoubleSide }));
    m.position.set(o.x || 0, o.y || 1.7, o.z || 0);
    m.rotation.y = o.ry || 0;
    this.scene.add(m);
    this.box(w + 0.08, h + 0.08, 0.04, { x: o.x, y: o.y, z: o.z + (o.ry ? 0 : -0.03), color: 0x5a3a22, collide: false, ry: o.ry });
    return m;
  };
  World.prototype.pendant = function (x, z, y) {
    y = y == null ? 2.85 : y;
    this.cyl(0.015, 0.55, { x: x, y: y - 0.2, z: z, color: 0x3a2a18, collide: false, seg: 6 });
    this.cyl(0.18, 0.16, { x: x, y: y - 0.52, z: z, color: 0xf2c230, r2: 0.28, collide: false, seg: 10, emissive: 0x442200 });
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
    var skin = spec.skin || 0xe6c3a5;
    var cloth = spec.color || 0x2A63A8;
    var legs = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.7, 8), lamb(spec.legs || 0x3a322c));
    legs.position.y = 0.38;
    var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.72, 10), lamb(cloth));
    torso.position.y = 1.05;
    var shoulders = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.16, 0.28), lamb(cloth));
    shoulders.position.y = 1.36;
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), lamb(skin));
    head.position.y = 1.62;
    var hair = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 10, 0, Math.PI * 2, 0, Math.PI / 1.7), lamb(spec.hair || 0x2a1a10));
    hair.position.y = 1.7;
    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), lamb(skin));
    nose.position.set(0, 1.6, 0.18);
    g.add(legs, torso, shoulders, head, hair, nose);
    if (spec.apron) {
      var ap = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.06), lamb(0xf4ead4));
      ap.position.set(0, 1.0, 0.16);
      g.add(ap);
    }
    g.position.set(spec.x, 0, spec.z);
    if (spec.facing != null) g.rotation.y = spec.facing;
    this.scene.add(g);
    this.label(spec.name, { x: spec.x, y: 2.02, z: spec.z, scale: 0.95 });
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
    this.box(w, 0.06, d, { x: x, y: 0.03, z: z, map: floorMap, repeat: [w / 1.6, d / 1.6], collide: false });
    if (spec.ceiling !== false) this.box(w, 0.06, d, { x: x, y: h, z: z, color: spec.ceil || 0xf7efe4, collide: false, emissive: 0x4a4034 });
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
          color: 0xd4e8f6, emissive: 0x88aacc, transparent: true, opacity: 0.78
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
      w.box(2.05, 0.42, 0.82, { x: x, y: 0.32, z: z, color: 0x4a6a58, collideR: 0.95, ry: ry || 0 });
      w.box(2.05, 0.48, 0.16, { x: x, y: 0.68, z: z + 0.32, color: 0x3a5548, collide: false });
      w.box(0.16, 0.42, 0.82, { x: x - 0.94, y: 0.55, z: z, color: 0x3a5548, collide: false });
      w.box(0.16, 0.42, 0.82, { x: x + 0.94, y: 0.55, z: z, color: 0x3a5548, collide: false });
      w.box(0.42, 0.12, 0.32, { x: x - 0.45, y: 0.58, z: z - 0.05, color: 0xc45c4a, collide: false });
      w.box(0.42, 0.12, 0.32, { x: x + 0.45, y: 0.58, z: z - 0.05, color: 0xf2c230, collide: false });
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
    tree: function (w, x, z) {
      w.cyl(0.18, 1.35, { x: x, z: z, color: 0x5a3a22, collideR: 0.42, map: KH.tex.holz(), seg: 8 });
      w.cyl(1.05, 1.2, { x: x, y: 2.15, z: z, color: 0x2f6b3a, r2: 0.35, collide: false, seg: 9 });
      w.cyl(0.7, 0.9, { x: x + 0.45, y: 2.35, z: z + 0.15, color: 0x3d7a45, r2: 0.2, collide: false, seg: 8 });
      w.cyl(0.55, 0.7, { x: x - 0.4, y: 2.5, z: z - 0.1, color: 0x4E8B5C, r2: 0.15, collide: false, seg: 8 });
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
      w.box(rw || 2.4, 0.03, rd || 1.6, { x: x, y: 0.05, z: z, color: color || 0x8B1E1E, collide: false });
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
      w.cyl(0.06, 0.14, { x: x, y: y, z: z, color: color || 0xc45c4a, collide: false, seg: 8 });
      w.cyl(0.05, 0.04, { x: x, y: y + 0.08, z: z, color: 0x5a3a22, collide: false, seg: 8 });
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
    var camera = new THREE.PerspectiveCamera(OPT.sicht, 1, 0.08, 140);
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
      stage.appendChild(renderer.domElement);
    }
    scene.add(new THREE.HemisphereLight(
      cfg.hemiTop || 0xfff3dc,
      cfg.hemiBot || (cfg.outdoor ? 0x6a7a52 : 0xcbb79a),
      cfg.hemi || (cfg.outdoor ? 0.78 : 0.9)
    ));
    var sun = new THREE.DirectionalLight(cfg.sun || 0xffe6c4, cfg.sunInt || (cfg.outdoor ? 0.58 : 0.42));
    sun.position.set(6, 12, 5);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xfff5ea, cfg.ambient || (cfg.outdoor ? 0.22 : 0.38)));

    var world = new World(scene);
    state.world = world;
    if (cfg.outdoor) {
      var skyMat = new THREE.MeshBasicMaterial({ map: KH.tex.himmel(), side: THREE.BackSide, fog: false, depthWrite: false });
      var sky = new THREE.Mesh(new THREE.SphereGeometry(90, 20, 12), skyMat);
      scene.add(sky);
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
