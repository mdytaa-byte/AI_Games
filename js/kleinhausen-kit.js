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
    size = size || 64;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    draw(c.getContext('2d'), size);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.LinearMipMapLinearFilter;
    return t;
  }
  KH.tex = {
    holz: function () {
      return tex(function (g, s) {
        g.fillStyle = '#6B4423'; g.fillRect(0, 0, s, s);
        for (var i = 0; i < 8; i++) {
          g.strokeStyle = i % 2 ? '#5a381c' : '#7a5230';
          g.lineWidth = 4; g.beginPath(); g.moveTo(0, i * 8 + 3); g.lineTo(s, i * 8 + 1); g.stroke();
        }
      });
    },
    putz: function (col) {
      col = col || '#d8cbb8';
      return tex(function (g, s) {
        g.fillStyle = col; g.fillRect(0, 0, s, s);
        g.fillStyle = 'rgba(0,0,0,.05)';
        for (var i = 0; i < 40; i++) g.fillRect((i * 17) % s, (i * 29) % s, 2, 2);
      }, 32);
    },
    fliesen: function (a, b) {
      return tex(function (g, s) {
        var h = s / 4;
        for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) {
          g.fillStyle = (x + y) % 2 ? (b || '#e8e4d8') : (a || '#f4f1ea');
          g.fillRect(x * h, y * h, h - 1, h - 1);
        }
      });
    },
    gras: function () {
      return tex(function (g, s) {
        g.fillStyle = '#3d6b3a'; g.fillRect(0, 0, s, s);
        g.fillStyle = '#4e8b5c';
        for (var i = 0; i < 30; i++) g.fillRect((i * 13) % s, (i * 21) % s, 3, 5);
      }, 32);
    },
    wasser: function () {
      return tex(function (g, s) {
        g.fillStyle = '#2a63a8'; g.fillRect(0, 0, s, s);
        g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(0, 20); g.quadraticCurveTo(32, 8, 64, 22); g.stroke();
        g.beginPath(); g.moveTo(0, 40); g.quadraticCurveTo(32, 52, 64, 38); g.stroke();
      });
    },
    ziegel: function () {
      return tex(function (g, s) {
        g.fillStyle = '#6a3a32'; g.fillRect(0, 0, s, s);
        g.fillStyle = '#8b4b40';
        var bh = 8, bw = 16;
        for (var y = 0, row = 0; y < s; y += bh, row++) {
          var off = (row % 2) * (bw / 2);
          for (var x = -bw; x < s; x += bw) g.fillRect(x + off + 1, y + 1, bw - 2, bh - 2);
        }
      });
    }
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
  }
  World.prototype.add = function (mesh) { this.scene.add(mesh); return mesh; };
  World.prototype.box = function (w, h, d, o) {
    o = o || {};
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), o.mat || lamb(o.color || 0xcccccc, o.map));
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
    var m = new THREE.Mesh(new THREE.CylinderGeometry(r, o.r2 != null ? o.r2 : r, h, o.seg || 12), o.mat || lamb(o.color || 0xcccccc));
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
    g.fillStyle = o.bg || 'rgba(18,20,26,.88)';
    g.fillRect(0, 0, 512, 128);
    g.strokeStyle = o.bd || '#F2C230'; g.lineWidth = 8; g.strokeRect(4, 4, 504, 120);
    g.fillStyle = o.fg || '#EFF1EC';
    g.font = 'bold 48px sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 256, 64);
    var t = new THREE.CanvasTexture(c);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    var sc = o.scale || 1.4;
    sp.scale.set(sc, sc * 0.25, 1);
    sp.position.set(o.x || 0, o.y || 2.2, o.z || 0);
    this.scene.add(sp);
    return sp;
  };
  World.prototype.hotspot = function (spec) {
    spec.r = spec.r || 1.15;
    spec.y = spec.y || 0;
    this.hotspots.push(spec);
    if (spec.marker !== false) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.38, 0.04, 8, 20),
        lamb(0xF2C230, null, { emissive: 0x443300 })
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
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 1.15, 10), lamb(spec.color || 0x2A63A8));
    body.position.y = 0.85;
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), lamb(spec.skin || 0xe6c3a5));
    head.position.y = 1.58;
    var hair = new THREE.Mesh(new THREE.SphereGeometry(0.23, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), lamb(spec.hair || 0x2a1a10));
    hair.position.y = 1.66;
    g.add(body, head, hair);
    g.position.set(spec.x, 0, spec.z);
    if (spec.facing != null) g.rotation.y = spec.facing;
    this.scene.add(g);
    this.label(spec.name, { x: spec.x, y: 2.05, z: spec.z, scale: 1.1 });
    this.obstacles.push({ kind: 'circ', x: spec.x, z: spec.z, r: 0.45 });
    spec._mesh = g;
    this.npcs.push(spec);
    this.hotspot({ id: spec.id, x: spec.x, z: spec.z, r: spec.r + 0.4, label: spec.name, kind: 'npc', marker: false });
    return spec;
  };
  World.prototype.room = function (spec) {
    var x = spec.x || 0, z = spec.z || 0, w = spec.w || 10, d = spec.d || 8, h = spec.h || 3.1;
    var wall = spec.wall || 0xd9cbb6, floor = spec.floor || 0xb08968, ceil = spec.ceil || 0xf0ebe3;
    var t = 0.18;
    this.box(w, 0.06, d, { x: x, y: 0.03, z: z, color: floor, map: spec.floorMap, collide: false });
    if (spec.ceiling !== false) this.box(w, 0.06, d, { x: x, y: h, z: z, color: ceil, collide: false });
    var doors = spec.doors || [];
    function hasDoor(wallId) {
      for (var i = 0; i < doors.length; i++) if (doors[i].wall === wallId) return doors[i];
      return null;
    }
    var self = this;
    function wallSeg(ww, hh, dd, ox, oy, oz) {
        self.box(ww, hh, dd, { x: ox, y: oy, z: oz, color: wall, map: spec.wallMap });
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
    if (spec.windows) {
      spec.windows.forEach(function (win) {
        var wx = x, wz = z, ry = 0;
        if (win.wall === 'n') { wz = z + d / 2 - 0.08; wx = x + (win.offset || 0); }
        if (win.wall === 's') { wz = z - d / 2 + 0.08; wx = x + (win.offset || 0); }
        if (win.wall === 'e') { wx = x + w / 2 - 0.08; wz = z + (win.offset || 0); ry = Math.PI / 2; }
        if (win.wall === 'w') { wx = x - w / 2 + 0.08; wz = z + (win.offset || 0); ry = Math.PI / 2; }
        self.plane(win.w || 1.4, win.h || 1.1, {
          x: wx, y: win.y || 1.6, z: wz, ry: ry,
          color: 0xb8d4e8, emissive: 0x223344
        });
      });
    }
    this.rooms.push(spec);
    return spec;
  };

  KH.furn = {
    table: function (w, x, z, o) {
      o = o || {};
      w.box(1.2, 0.08, 0.8, { x: x, y: 0.74, z: z, color: 0x6B4423, collideR: 0.7 });
      w.box(0.08, 0.7, 0.08, { x: x - 0.5, y: 0.35, z: z - 0.3, color: 0x4a3018, collide: false });
      w.box(0.08, 0.7, 0.08, { x: x + 0.5, y: 0.35, z: z - 0.3, color: 0x4a3018, collide: false });
      w.box(0.08, 0.7, 0.08, { x: x - 0.5, y: 0.35, z: z + 0.3, color: 0x4a3018, collide: false });
      w.box(0.08, 0.7, 0.08, { x: x + 0.5, y: 0.35, z: z + 0.3, color: 0x4a3018, collide: false });
    },
    chair: function (w, x, z, ry) {
      w.box(0.42, 0.08, 0.42, { x: x, y: 0.46, z: z, color: 0x5a3a22, collideR: 0.32, ry: ry || 0 });
      w.box(0.42, 0.5, 0.07, { x: x, y: 0.75, z: z + (ry ? 0 : 0.18), color: 0x5a3a22, collide: false });
    },
    counter: function (w, x, z, len, depth) {
      len = len || 4; depth = depth || 0.7;
      w.box(len, 1.05, depth, { x: x, y: 0.52, z: z, color: 0x5c4030, collideR: Math.max(len, depth) * 0.42 });
      w.box(len + 0.04, 0.06, depth + 0.08, { x: x, y: 1.08, z: z, color: 0x2a1810, collide: false });
    },
    plant: function (w, x, z) {
      w.cyl(0.12, 0.22, { x: x, z: z, color: 0x8a4030, collide: false });
      w.cyl(0.18, 0.5, { x: x, y: 0.5, z: z, color: 0x2f6b3a, r2: 0.02, collideR: 0.25 });
    },
    sofa: function (w, x, z, ry) {
      w.box(2.0, 0.45, 0.8, { x: x, y: 0.32, z: z, color: 0x3E5A4C, collideR: 0.95, ry: ry || 0 });
      w.box(2.0, 0.5, 0.18, { x: x, y: 0.7, z: z + 0.3, color: 0x2f453b, collide: false });
    },
    bed: function (w, x, z) {
      w.box(2.1, 0.4, 1.4, { x: x, y: 0.28, z: z, color: 0xeff1ec, collideR: 1.1 });
      w.box(0.2, 0.7, 1.4, { x: x - 1.05, y: 0.5, z: z, color: 0x6B4423, collide: false });
      w.box(0.5, 0.18, 0.7, { x: x - 0.7, y: 0.58, z: z, color: 0xF2C230, collide: false });
    },
    desk: function (w, x, z) {
      w.box(1.4, 0.08, 0.7, { x: x, y: 0.76, z: z, color: 0x6B4423, collideR: 0.75 });
      w.box(1.4, 0.7, 0.7, { x: x, y: 0.35, z: z, color: 0x4a3018, collide: false });
    },
    board: function (w, x, y, z, ry, color) {
      w.box(2.4, 1.3, 0.06, { x: x, y: y || 1.7, z: z, color: color || 0x1a4a28, collide: false, ry: ry || 0 });
    },
    tree: function (w, x, z) {
      w.cyl(0.16, 1.2, { x: x, z: z, color: 0x5a3a22, collideR: 0.4 });
      w.cyl(1.1, 1.6, { x: x, y: 2.0, z: z, color: 0x2f6b3a, r2: 0.2, collide: false });
    },
    bench: function (w, x, z, ry) {
      w.box(1.6, 0.08, 0.4, { x: x, y: 0.42, z: z, color: 0x6B4423, collideR: 0.7, ry: ry || 0 });
      w.box(1.6, 0.4, 0.08, { x: x, y: 0.62, z: z + 0.16, color: 0x6B4423, collide: false });
    },
    bin: function (w, x, z, color, label) {
      w.cyl(0.28, 0.85, { x: x, z: z, color: color || 0x3E8E4E, collideR: 0.4 });
      if (label) w.label(label, { x: x, y: 1.35, z: z, scale: 0.9 });
    },
    lamp: function (w, x, z) {
      w.cyl(0.05, 1.4, { x: x, z: z, color: 0x333333, collideR: 0.15 });
      w.cyl(0.22, 0.2, { x: x, y: 1.5, z: z, color: 0xf7f1e3, collide: false });
    },
    exhibit: function (w, x, z, color) {
      w.box(1.1, 1.2, 0.4, { x: x, y: 0.7, z: z, color: 0xeff1ec, collideR: 0.6 });
      w.box(0.7, 0.5, 0.08, { x: x, y: 1.15, z: z + 0.18, color: color || 0xC25B4A, collide: false });
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
    scene.background = new THREE.Color(cfg.sky || 0x9ec5d8);
    if (cfg.fog !== false) scene.fog = new THREE.Fog(cfg.sky || 0x9ec5d8, 18, cfg.fogFar || 42);
    var camera = new THREE.PerspectiveCamera(OPT.sicht, 1, 0.08, 120);
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
      stage.appendChild(renderer.domElement);
    }
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x3a4a38, 0.85));
    var sun = new THREE.DirectionalLight(0xfff2cc, 0.55);
    sun.position.set(8, 14, 6);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));

    var world = new World(scene);
    state.world = world;
    if (typeof cfg.build === 'function') cfg.build(world, KH);

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
      compass();
      var hot = nearestHotspot();
      state.near = hot;
      var akt = $('kh-aktion');
      if (hot) {
        akt.hidden = false;
        akt.innerHTML = '<kbd>E</kbd> ' + esc(hot.label || hot.id);
      } else akt.hidden = true;
      world.hotspots.forEach(function (h) {
        if (h._ring) h._ring.material.emissive.setHex(hot && hot.id === h.id ? 0x886600 : 0x443300);
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
