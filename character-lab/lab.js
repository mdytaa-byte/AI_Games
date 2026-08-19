/* Character Lab v4 — authoring studio */
(function () {
  'use strict';

  const DEFAULTS = window.DEFAULTS || (window.CharacterEngine && CharacterEngine.DEFAULTS) || {};
  const PATTERNS = window.PATTERNS || ['plain', 'weave', 'stripes', 'check', 'plaid', 'dots', 'twill', 'scales'];
  const hash32 = (window.CharacterEngine && CharacterEngine.hash32) || (s => {
    let h = 2166136261; s = String(s || '');
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  });
  const mulberry32 = (window.CharacterEngine && CharacterEngine.mulberry32) || (a => function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  });

  function deep(v) { return JSON.parse(JSON.stringify(v)); }
  const cfg = deep(DEFAULTS);
  cfg.states = cfg.states || {};
  cfg.expressions = cfg.expressions || {};
  cfg.poses = cfg.poses || {};
  cfg.poseOffsets = cfg.poseOffsets || {};
  cfg.colorLinks = cfg.colorLinks || {};
  cfg.tags = cfg.tags || [];

  const LOCK_KEYS = {
    body: ['height', 'build', 'age', 'asymmetry', 'base', 'headShape', 'headSize', 'shoulder', 'legs', 'arms'],
    face: ['eyeSize', 'eyeSpacing', 'eyeY', 'eyeTilt', 'irisSize', 'irisColor', 'browThickness', 'browHeight', 'browTilt',
      'noseSize', 'noseWidth', 'noseProjection', 'mouthWidth', 'lipFullness', 'mouthRest', 'ears', 'freckles', 'mark', 'facialHair'],
    hair: ['hair', 'hairTexture', 'hairPart', 'hairFringe', 'hairBack', 'hairline', 'hairVolume', 'hairLength', 'hairColor'],
    clothing: ['baseTop', 'outerwear', 'bottom', 'neckwear', 'footwear', 'sleeves', 'legwear'],
    colors: ['skin', 'hairColor', 'beardColor', 'shirt', 'pants', 'shoes', 'soleColor', 'hatColor', 'frameColor',
      'propColor', 'jewelColor', 'outerColor', 'accentColor', 'topPattern', 'legPattern', 'patternScale', 'patternSpacing', 'patternAngle'],
    accessories: ['headwear', 'glasses', 'earrings', 'necklace', 'eyepatch'],
    props: ['prop', 'propLeft', 'propRight', 'propBack', 'propWaist', 'propShoulder']
  };

  const locks = { body: false, face: false, hair: false, clothing: false, colors: false, accessories: false, props: false };
  const LIB_KEY = 'character-lab-library-v4';
  const PAL_KEY = 'character-lab-palettes-v4';

  let anim = 'idle', character = null, xray = false, poseEdit = false, turntable = false;
  let helper = null, joints = [];
  let selectedBone = null;
  let activeVariant = 'A';
  const variants = { A: null, B: null, C: null };
  const history = [];
  let histIndex = -1, histLock = false, queued = false;

  const stage = document.getElementById('stage');
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const studioBg = new THREE.Color('#0E1D33').convertSRGBToLinear();
  scene.background = studioBg;
  scene.fog = new THREE.Fog(studioBg, 6, 15);

  const camera = new THREE.PerspectiveCamera(38, 1, .05, 60);

  function gridTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = '#14263f'; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = 'rgba(111,211,224,.16)'; x.lineWidth = 1;
    for (let i = 0; i <= 512; i += 64) {
      x.beginPath(); x.moveTo(i + .5, 0); x.lineTo(i + .5, 512); x.stroke();
      x.beginPath(); x.moveTo(0, i + .5); x.lineTo(512, i + .5); x.stroke();
    }
    x.strokeStyle = 'rgba(111,211,224,.42)'; x.lineWidth = 2;
    x.strokeRect(1, 1, 510, 510);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10);
    t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    return t;
  }
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.MeshStandardMaterial({ map: gridTexture(), roughness: .95, metalness: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);

  scene.add(new THREE.HemisphereLight(0x9ec9ff, 0x24406b, .58));
  const key = new THREE.DirectionalLight(0xfff3e2, 1.55);
  key.position.set(2.4, 4.6, 3.2); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.top = 1.6; key.shadow.camera.bottom = -.4;
  key.shadow.camera.left = -1.4; key.shadow.camera.right = 1.4;
  key.shadow.camera.near = .5; key.shadow.camera.far = 12;
  key.shadow.bias = -.0012;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6fd3e0, .95);
  rim.position.set(-3, 2.4, -3.4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xbcd4ff, .3);
  fill.position.set(-1.5, 1.2, 3); scene.add(fill);

  function rebuild() {
    if (character) { scene.remove(character.group); character.dispose(); }
    if (helper) { scene.remove(helper); helper = null; }
    joints = [];
    character = createCharacter(cfg);
    scene.add(character.group);

    helper = new THREE.SkeletonHelper(character.group);
    helper.material.color = new THREE.Color('#F2A93B');
    helper.material.linewidth = 2;
    helper.material.depthTest = false;
    helper.visible = xray || poseEdit; scene.add(helper);

    const jm = new THREE.MeshBasicMaterial({ color: 0xF2A93B, depthTest: false });
    const jg = new THREE.SphereGeometry(.016 * cfg.height, 10, 8);
    joints = character.bones.map(b => {
      const dot = new THREE.Mesh(jg, jm);
      dot.userData.rigDot = true;
      dot.userData.boneName = b.name;
      dot.renderOrder = 3;
      dot.visible = xray || poseEdit;
      b.add(dot); return dot;
    });
    applyXray();
    refreshWarnings();
    document.getElementById('readout').textContent =
      (character.mesh.geometry.index.count / 3 | 0) + ' TRIS · ' + character.bones.length +
      ' BONES · ' + character.size.toFixed(2) + ' U' + (cfg.seed ? ' · SEED ' + cfg.seed : '');
  }
  function applyXray() {
    if (!character) return;
    const showDots = xray || poseEdit;
    const ms = [].concat(character.mesh.material);
    ms.forEach(m => { m.transparent = xray; m.opacity = xray ? .17 : 1; m.depthWrite = !xray; });
    character.mesh.castShadow = !xray;
    character.group.traverse(o => {
      if (o.isMesh && o !== character.mesh && !o.userData.rigDot) o.visible = !xray;
    });
    if (helper) helper.visible = showDots;
    joints.forEach(d => {
      d.visible = showDots;
      d.material.color.set(d.userData.boneName === selectedBone ? '#6FD3E0' : '#F2A93B');
    });
    document.getElementById('btn-xray').textContent = xray ? 'Hide rig' : 'Show rig';
    document.getElementById('btn-pose-edit').setAttribute('aria-pressed', poseEdit);
  }

  let az = .55, pol = 1.30, dist = 2.55, target = new THREE.Vector3(0, .52, 0);
  let drag = null, pinch = 0, orbiting = false;
  const CAMERAS = {
    Front: { az: 0, pol: 1.32, dist: 2.55, k: .52 },
    '3/4': { az: .55, pol: 1.30, dist: 2.55, k: .52 },
    Profile: { az: Math.PI / 2, pol: 1.32, dist: 2.4, k: .52 },
    Back: { az: Math.PI, pol: 1.32, dist: 2.55, k: .52 },
    'Full body': { az: .42, pol: 1.18, dist: 3.55, k: .48 },
    Portrait: { az: .28, pol: 1.12, dist: 1.28, k: .82 }
  };
  function place() {
    const k = place.targetK == null ? .52 : place.targetK;
    target.y = k * (character ? character.size : 1);
    camera.position.set(
      target.x + dist * Math.sin(pol) * Math.sin(az),
      target.y + dist * Math.cos(pol),
      target.z + dist * Math.sin(pol) * Math.cos(az));
    camera.lookAt(target);
  }
  place.targetK = .52;
  function setCamera(name) {
    const c = CAMERAS[name]; if (!c) return;
    az = c.az; pol = c.pol; dist = c.dist; place.targetK = c.k;
    turntable = false;
    document.getElementById('btn-turn').setAttribute('aria-pressed', 'false');
  }

  const el = renderer.domElement;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  el.addEventListener('pointerdown', e => {
    if (poseEdit && character) {
      const rect = el.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(joints, false);
      if (hits.length) {
        selectedBone = hits[0].object.userData.boneName;
        syncBoneSliders();
        applyXray();
        e.preventDefault();
        return;
      }
    }
    drag = { x: e.clientX, y: e.clientY }; orbiting = false;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) orbiting = true;
    az -= dx * .008;
    pol = THREE.MathUtils.clamp(pol - dy * .006, .35, 2.0);
    drag = { x: e.clientX, y: e.clientY };
  });
  addEventListener('pointerup', () => drag = null);
  addEventListener('pointercancel', () => drag = null);
  el.addEventListener('wheel', e => {
    e.preventDefault();
    dist = THREE.MathUtils.clamp(dist + e.deltaY * .0022, .85, 6);
  }, { passive: false });
  el.addEventListener('touchstart', e => {
    if (e.touches.length === 2) pinch = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    if (e.touches.length === 2 && pinch) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY);
      dist = THREE.MathUtils.clamp(dist * (pinch / d), .85, 6); pinch = d; drag = null;
    }
  }, { passive: true });
  el.addEventListener('touchend', () => pinch = 0, { passive: true });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  function snapshot() {
    return { cfg: deep(cfg), anim, locks: Object.assign({}, locks), selectedBone };
  }
  function pushHistory() {
    if (histLock) return;
    history.splice(histIndex + 1);
    history.push(snapshot());
    if (history.length > 48) history.shift();
    histIndex = history.length - 1;
    variants[activeVariant] = deep(cfg);
  }
  function applySnapshot(s) {
    histLock = true;
    Object.keys(cfg).forEach(k => delete cfg[k]);
    Object.assign(cfg, deep(s.cfg));
    anim = s.anim || 'idle';
    Object.assign(locks, s.locks || {});
    selectedBone = s.selectedBone || null;
    syncAll(); rebuild();
    histLock = false;
  }
  function undo() {
    if (histIndex <= 0) return;
    histIndex--; applySnapshot(history[histIndex]);
  }
  function redo() {
    if (histIndex >= history.length - 1) return;
    histIndex++; applySnapshot(history[histIndex]);
  }

  function queueBuild() {
    if (queued) return; queued = true;
    requestAnimationFrame(() => { queued = false; rebuild(); });
  }
  function commit() { pushHistory(); queueBuild(); }

  function seg(host, items, get, set, live) {
    const box = document.getElementById(host);
    if (!box) return;
    box.innerHTML = '';
    items.forEach(([value, label]) => {
      const b = document.createElement('button');
      b.textContent = label; b.setAttribute('aria-pressed', String(get() === value));
      b.onclick = () => {
        set(value);
        if (live) {
          [...box.children].forEach(c => c.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
        } else {
          commit();
          refreshSegs();
        }
      };
      box.appendChild(b);
    });
  }

  const HAND_PROPS = [
    ['none', 'None'], ['phone', 'Phone'], ['laptop', 'Laptop'], ['tablet', 'Tablet'],
    ['pencil', 'Pencil'], ['notebook', 'Notebook'], ['folder', 'Folder'], ['map', 'Map'],
    ['book', 'Book'], ['clipboard', 'Clipboard'], ['coffee', 'Coffee'], ['bag', 'Bag'],
    ['ball', 'Ball'], ['microphone', 'Mic'], ['pointer', 'Pointer'], ['flag', 'Flag'],
    ['sign', 'Sign'], ['staff', 'Staff'], ['sword', 'Sword'], ['shield', 'Shield'],
    ['lantern', 'Lantern'], ['torch', 'Torch'], ['umbrella', 'Umbrella']
  ];
  const BACK_PROPS = [['none', 'None'], ['backpack', 'Backpack'], ['satchel', 'Satchel']];
  const WAIST_PROPS = [['none', 'None'], ['satchel', 'Satchel'], ['bag', 'Bag']];
  const SHOULDER_PROPS = [['none', 'None'], ['headphones', 'Headphones'], ['bag', 'Bag']];

  function refreshSegs() {
    seg('hairs', [['crop', 'Crop'], ['fringe', 'Fringe'], ['sidepart', 'Part'], ['long', 'Long'],
      ['ponytail', 'Tail'], ['pigtails', 'Pigtails'], ['braid', 'Braid'], ['bun', 'Bun'],
      ['curls', 'Curls'], ['spiky', 'Spiky'], ['mohawk', 'Mohawk'], ['bald', 'Bald']],
      () => cfg.hair, v => {
        cfg.hair = v;
        const hp = (window.CharacterEngine && CharacterEngine.hairPresets || {})[v];
        if (hp) {
          cfg.hairTexture = hp.texture; cfg.hairPart = hp.part;
          cfg.hairFringe = hp.fringe; cfg.hairBack = hp.back;
        }
      });
    seg('hairtex', [['straight', 'Straight'], ['wavy', 'Wavy'], ['curly', 'Curly'], ['coily', 'Coily'], ['spiky', 'Spiky']],
      () => cfg.hairTexture || 'straight', v => { cfg.hairTexture = v; cfg.hair = 'custom'; });
    seg('hairpart', [['none', 'None'], ['left', 'Left'], ['right', 'Right'], ['center', 'Center']],
      () => cfg.hairPart || 'none', v => { cfg.hairPart = v; cfg.hair = 'custom'; });
    seg('hairfringe', [['none', 'None'], ['straight', 'Straight'], ['side', 'Side'], ['curtain', 'Curtain']],
      () => cfg.hairFringe || 'none', v => { cfg.hairFringe = v; cfg.hair = 'custom'; });
    seg('hairback', [['bald', 'Bald'], ['loose', 'Loose'], ['long', 'Long'], ['ponytail', 'Tail'],
      ['pigtails', 'Pigtails'], ['braid', 'Braid'], ['bun', 'Bun'], ['mohawk', 'Mohawk']],
      () => cfg.hairBack || 'loose', v => { cfg.hairBack = v; cfg.hair = 'custom'; });
    seg('hairlines', [['high', 'High line'], ['even', 'Even'], ['low', 'Low line']],
      () => cfg.hairline, v => { cfg.hairline = v; });
    seg('basetop', [['tshirt', 'T-shirt'], ['blouse', 'Blouse'], ['sweater', 'Sweater'], ['hoodie', 'Hoodie'],
      ['polo', 'Polo'], ['buttonup', 'Button-up'], ['tunic', 'Tunic'], ['dress', 'Dress']],
      () => cfg.baseTop, v => { cfg.baseTop = v; });
    seg('outerwear', [['none', 'None'], ['jacket', 'Jacket'], ['coat', 'Coat'], ['robe', 'Robe'], ['vest', 'Vest']],
      () => cfg.outerwear, v => { cfg.outerwear = v; });
    seg('bottom', [['jeans', 'Jeans'], ['trousers', 'Trousers'], ['skirt', 'Skirt'],
      ['shorts', 'Shorts'], ['leggings', 'Leggings'], ['cargo', 'Cargo']],
      () => cfg.bottom, v => { cfg.bottom = v; });
    seg('neckwear', [['none', 'None'], ['scarf', 'Scarf'], ['tie', 'Tie'], ['bow', 'Bow']],
      () => cfg.neckwear, v => { cfg.neckwear = v; });
    seg('freckles', [['none', 'None'], ['light', 'Light'], ['heavy', 'Heavy']],
      () => cfg.freckles, v => { cfg.freckles = v; });
    seg('mark', [['none', 'None'], ['mole', 'Mole'], ['scar', 'Scar'], ['both', 'Both']],
      () => cfg.mark, v => { cfg.mark = v; });
    seg('eyepatch', [['none', 'None'], ['left', 'Left eye'], ['right', 'Right eye']],
      () => cfg.eyepatch, v => { cfg.eyepatch = v; });
    seg('beard', [['none', 'None'], ['stubble', 'Stubble'], ['moustache', 'Moustache'],
      ['goatee', 'Goatee'], ['beard', 'Full beard']],
      () => cfg.facialHair, v => { cfg.facialHair = v; });
    seg('basemodel', [['neutral', 'Neutral'], ['masculine', 'Masculine'], ['feminine', 'Feminine']],
      () => cfg.base, v => { cfg.base = v; });
    seg('headshape', [['oval', 'Oval'], ['round', 'Round'], ['square', 'Square'],
      ['heart', 'Heart'], ['long', 'Long'], ['wide', 'Wide']],
      () => cfg.headShape, v => { cfg.headShape = v; });
    seg('earrings', [['none', 'None'], ['studs', 'Studs'], ['hoops', 'Hoops'],
      ['drops', 'Drops'], ['gems', 'Gems']],
      () => cfg.earrings, v => { cfg.earrings = v; });
    seg('necklace', [['none', 'None'], ['chain', 'Chain'], ['pendant', 'Pendant'],
      ['beads', 'Beads'], ['choker', 'Choker'], ['torc', 'Torc']],
      () => cfg.necklace, v => { cfg.necklace = v; });
    seg('glasses', [['none', 'None'], ['round', 'Round'], ['rect', 'Rect'],
      ['sun', 'Shades'], ['halfmoon', 'Half-moon']],
      () => cfg.glasses, v => { cfg.glasses = v; });
    seg('propL', HAND_PROPS, () => cfg.propLeft || cfg.prop || 'none', v => { cfg.propLeft = v; cfg.prop = v; });
    seg('propR', HAND_PROPS, () => cfg.propRight || 'none', v => { cfg.propRight = v; });
    seg('propBack', BACK_PROPS, () => cfg.propBack || 'none', v => { cfg.propBack = v; });
    seg('propWaist', WAIST_PROPS, () => cfg.propWaist || 'none', v => { cfg.propWaist = v; });
    seg('propShoulder', SHOULDER_PROPS, () => cfg.propShoulder || 'none', v => { cfg.propShoulder = v; });
    seg('footwear', [['bare', 'Bare'], ['simple', 'Simple'], ['sneakers', 'Sneakers'],
      ['boots', 'Boots'], ['dress', 'Dress'], ['sandals', 'Sandals']],
      () => cfg.footwear, v => { cfg.footwear = v; });
    seg('headwear', [['none', 'None'], ['cap', 'Cap'], ['beanie', 'Beanie'], ['widebrim', 'Wide brim'],
      ['tophat', 'Top hat'], ['hood', 'Hood'], ['crown', 'Crown'], ['band', 'Band']],
      () => cfg.headwear, v => { cfg.headwear = v; });
    seg('ears', [['round', 'Ears'], ['pointed', 'Pointed'], ['large', 'Large'], ['none', 'None']],
      () => cfg.ears, v => { cfg.ears = v; });
    const PATLABEL = { plain: 'Plain', weave: 'Weave', stripes: 'Stripe', check: 'Check',
      plaid: 'Plaid', dots: 'Dots', twill: 'Twill', scales: 'Scale' };
    seg('toppat', PATTERNS.map(k => [k, PATLABEL[k] || k]),
      () => cfg.topPattern, v => { cfg.topPattern = v; });
    seg('legpat', PATTERNS.map(k => [k, PATLABEL[k] || k]),
      () => cfg.legPattern, v => { cfg.legPattern = v; });
    seg('anims', [['idle', 'Idle'], ['hold', 'Hold'], ['walk', 'Walk'], ['run', 'Run'],
      ['wave', 'Wave'], ['jump', 'Jump'], ['dance', 'Dance'], ['tpose', 'T-pose']],
      () => anim, v => { anim = v; }, true);
    const faceItems = [['happy', 'Happy'], ['neutral', 'Neutral'], ['surprised', 'Surprised'],
      ['determined', 'Set'], ['sad', 'Sad'], ['confused', 'Confused'], ['annoyed', 'Annoyed'],
      ['excited', 'Excited'], ['skeptical', 'Skeptical'], ['embarrassed', 'Embarrassed'], ['custom', 'Custom']];
    Object.keys(cfg.expressions || {}).forEach(k => {
      if (!faceItems.some(x => x[0] === k)) faceItems.push([k, k]);
    });
    seg('faces', faceItems, () => cfg.face, v => {
      cfg.face = v;
      if (character) character.setFace(v);
    }, true);
    seg('quality', [['preview', 'Preview'], ['standard', 'Standard'], ['high', 'High']],
      () => cfg.quality || 'standard', v => { cfg.quality = v; });
    seg('variants', [['A', 'A'], ['B', 'B'], ['C', 'C']],
      () => activeVariant, v => switchVariant(v));
    refreshPalettes();
    refreshLinks();
    refreshStates();
    refreshSavedPoses();
  }

  const SLIDERS = [
    ['height', 's-height', 'v-height'], ['build', 's-build', 'v-build'],
    ['age', 's-age', 'v-age'], ['asymmetry', 's-asymmetry', 'v-asymmetry'],
    ['headSize', 's-head', 'v-head'], ['shoulder', 's-shoulder', 'v-shoulder'],
    ['legs', 's-legs', 'v-legs'], ['arms', 's-arms', 'v-arms'],
    ['hairVolume', 's-hvol', 'v-hvol'], ['hairLength', 's-hlen', 'v-hlen'],
    ['patternScale', 's-pscale', 'v-pscale'],
    ['patternSpacing', 's-pspacing', 'v-pspacing'],
    ['patternAngle', 's-pangle', 'v-pangle'],
    ['eyeSize', 's-eye-size', 'v-eye-size'], ['eyeSpacing', 's-eye-spacing', 'v-eye-spacing'],
    ['eyeY', 's-eye-y', 'v-eye-y'], ['eyeTilt', 's-eye-tilt', 'v-eye-tilt'],
    ['irisSize', 's-iris-size', 'v-iris-size'],
    ['browThickness', 's-brow-thickness', 'v-brow-thickness'],
    ['browHeight', 's-brow-height', 'v-brow-height'], ['browTilt', 's-brow-tilt', 'v-brow-tilt'],
    ['noseSize', 's-nose-size', 'v-nose-size'], ['noseWidth', 's-nose-width', 'v-nose-width'],
    ['noseProjection', 's-nose-projection', 'v-nose-projection'],
    ['mouthWidth', 's-mouth-width', 'v-mouth-width'], ['lipFullness', 's-lip-fullness', 'v-lip-fullness'],
    ['mouthRest', 's-mouth-rest', 'v-mouth-rest']
  ];
  const EXPR_SLIDERS = [
    ['exprBrow', 's-expr-brow', 'v-expr-brow'],
    ['exprBrowY', 's-expr-browy', 'v-expr-browy'],
    ['exprLid', 's-expr-lid', 'v-expr-lid'],
    ['exprEyeScale', 's-expr-eye', 'v-expr-eye'],
    ['exprMouthCurve', 's-expr-curve', 'v-expr-curve'],
    ['exprMouthOpen', 's-expr-open', 'v-expr-open'],
    ['exprMouthY', 's-expr-my', 'v-expr-my']
  ];

  SLIDERS.forEach(([k, sid, vid]) => {
    const s = document.getElementById(sid), v = document.getElementById(vid);
    if (!s) return;
    s.addEventListener('input', () => {
      cfg[k] = +s.value; v.textContent = (+s.value).toFixed(k === 'patternAngle' ? 0 : 2); queueBuild();
    });
    s.addEventListener('change', pushHistory);
  });
  EXPR_SLIDERS.forEach(([k, sid, vid]) => {
    const s = document.getElementById(sid), v = document.getElementById(vid);
    s.addEventListener('input', () => {
      cfg[k] = +s.value; v.textContent = (+s.value).toFixed(2);
      cfg.face = 'custom';
      if (character) character.setExpression({
        brow: cfg.exprBrow, browY: cfg.exprBrowY, lid: -.58 + cfg.exprLid,
        lidLow: .80, eye: cfg.exprEyeScale,
        mouthW: 1, mouthOpen: .22 + cfg.exprMouthOpen,
        mouthRoll: THREE.MathUtils.lerp(0, Math.PI, .5 + cfg.exprMouthCurve * .5),
        mouthY: .40 + cfg.exprMouthY
      });
    });
    s.addEventListener('change', pushHistory);
  });

  function syncSliders() {
    SLIDERS.concat(EXPR_SLIDERS).forEach(([k, sid, vid]) => {
      const s = document.getElementById(sid), v = document.getElementById(vid);
      if (!s) return;
      const n = cfg[k] == null ? +s.value : cfg[k];
      s.value = n; v.textContent = (+n).toFixed(k === 'patternAngle' ? 0 : 2);
    });
  }

  function buildColorControls(box, entries) {
    box.innerHTML = '';
    entries.forEach(([k, label]) => {
      const wrap = document.createElement('div'); wrap.className = 'cwrap';
      const tag = document.createElement('span'); tag.className = 'ctag'; tag.textContent = label;
      const i = document.createElement('input'); i.type = 'color'; i.value = cfg[k] || '#888888'; i.dataset.key = k;
      i.setAttribute('aria-label', label + ' colour');
      i.addEventListener('input', () => { cfg[k] = i.value; queueBuild(); });
      i.addEventListener('change', pushHistory);
      wrap.appendChild(tag); wrap.appendChild(i); box.appendChild(wrap);
    });
  }
  const FACE_COLORS = [['irisColor', 'Iris']];
  const COLORS = [['skin', 'Skin'], ['hairColor', 'Hair'], ['beardColor', 'Beard'], ['shirt', 'Top'],
    ['outerColor', 'Outer'], ['accentColor', 'Accent'], ['pants', 'Legs'],
    ['shoes', 'Shoes'], ['soleColor', 'Sole'], ['hatColor', 'Hat'],
    ['frameColor', 'Frames'], ['propColor', 'Prop'], ['jewelColor', 'Jewelry']];
  buildColorControls(document.getElementById('face-colors'), FACE_COLORS);
  buildColorControls(document.getElementById('colors'), COLORS);
  function syncColors() {
    document.querySelectorAll('#face-colors input, #colors input').forEach(i => {
      if (cfg[i.dataset.key]) i.value = cfg[i.dataset.key];
    });
  }

  function syncMeta() {
    document.getElementById('meta-name').value = cfg.name || '';
    document.getElementById('meta-id').value = cfg.id || '';
    document.getElementById('meta-role').value = cfg.role || '';
    document.getElementById('meta-tags').value = (cfg.tags || []).join(', ');
    document.getElementById('meta-alt').value = cfg.altDescription || '';
    document.getElementById('seed').value = cfg.seed || '';
    document.getElementById('character-name').value = (cfg.id || cfg.name || 'my-character');
  }
  ['meta-name', 'meta-id', 'meta-role', 'meta-alt', 'seed'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      const map = { 'meta-name': 'name', 'meta-id': 'id', 'meta-role': 'role', 'meta-alt': 'altDescription', seed: 'seed' };
      cfg[map[id]] = document.getElementById(id).value;
      pushHistory();
    });
  });
  document.getElementById('meta-tags').addEventListener('change', () => {
    cfg.tags = document.getElementById('meta-tags').value.split(',').map(s => s.trim()).filter(Boolean);
    pushHistory();
  });

  function refreshWarnings() {
    const w = (window.CharacterEngine && CharacterEngine.compatibilityWarnings(cfg)) || [];
    document.getElementById('compat').textContent = w.join(' ');
  }
  function syncLocks() {
    document.querySelectorAll('.lock[data-lock]').forEach(b => {
      b.setAttribute('aria-pressed', !!locks[b.dataset.lock]);
      b.textContent = locks[b.dataset.lock] ? 'Locked' : 'Lock';
    });
  }
  function syncAll() {
    syncSliders(); syncColors(); syncMeta(); syncLocks(); refreshSegs(); syncBoneSliders();
  }

  const PRESETS = {
    Hero: { height: 1.03, build: .55, headSize: 1.02, shoulder: 1.12, legs: 1.02, arms: 1.02, age: .28,
      base: 'masculine', hair: 'sidepart', baseTop: 'buttonup', outerwear: 'none', bottom: 'trousers',
      footwear: 'boots', headwear: 'none', headShape: 'square', propLeft: 'sword', propRight: 'shield',
      mark: 'scar', facialHair: 'stubble', skin: '#e0a97e', hairColor: '#2b1c12', shirt: '#2f6fb5',
      pants: '#2b3554', shoes: '#3d2a1e', face: 'determined', role: 'hero' },
    Kid: { height: .78, build: .42, headSize: 1.42, shoulder: .86, legs: .9, arms: .95, age: .08,
      base: 'neutral', hair: 'spiky', baseTop: 'tshirt', bottom: 'shorts', footwear: 'sneakers',
      headwear: 'cap', headShape: 'round', propLeft: 'ball', freckles: 'heavy',
      skin: '#f0c39c', hairColor: '#8a5a2b', shirt: '#e2643c', pants: '#3f6d52', shoes: '#d8d3c6',
      hatColor: '#c8452f', face: 'happy', role: 'student' },
    Scholar: { height: .99, build: .48, headSize: 1.06, shoulder: .92, age: .42,
      base: 'feminine', hair: 'bun', baseTop: 'blouse', outerwear: 'none', bottom: 'trousers',
      footwear: 'dress', headwear: 'band', glasses: 'round', propLeft: 'book', necklace: 'pendant',
      skin: '#c98d63', hairColor: '#1e1a17', shirt: '#6b5ea8', pants: '#3b3550', face: 'neutral', role: 'teacher' },
    Shopkeeper: { height: 1.0, build: .58, age: .62, base: 'masculine', hair: 'bald', facialHair: 'beard',
      baseTop: 'sweater', outerwear: 'vest', bottom: 'trousers', footwear: 'simple', glasses: 'halfmoon',
      propLeft: 'clipboard', propRight: 'pencil', skin: '#d8b295', hairColor: '#d5d5d5', shirt: '#7a6a58',
      pants: '#4c4438', face: 'happy', role: 'shopkeeper', name: 'Herr Weber' },
    Guide: { height: 1.01, build: .5, age: .3, base: 'feminine', hair: 'ponytail', baseTop: 'polo',
      bottom: 'jeans', footwear: 'sneakers', propRight: 'pointer', propBack: 'backpack',
      skin: '#a97147', hairColor: '#4a2c17', shirt: '#4a6b3c', pants: '#5a4a33', face: 'excited', role: 'guide' }
  };
  seg('presets', Object.keys(PRESETS).map(k => [k, k]), () => null, k => {
    Object.assign(cfg, deep(DEFAULTS), PRESETS[k]);
    if (PRESETS[k].name) cfg.name = PRESETS[k].name;
    syncAll();
  });

  function rngOf(seed) {
    return seed ? mulberry32(hash32(seed)) : Math.random;
  }
  const rndN = (rng, a, b) => a + rng() * (b - a);
  const pickN = (rng, a) => a[Math.floor(rng() * a.length)];
  function hueHex(rng) {
    const h = 'hsl(' + (rng() * 360 | 0) + ',' + (35 + rng() * 40 | 0) + '%,' + (32 + rng() * 34 | 0) + '%)';
    const d = document.createElement('div'); d.style.color = h; document.body.appendChild(d);
    const rgb = getComputedStyle(d).color.match(/\d+/g); d.remove();
    return '#' + rgb.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
  }
  const SKINS = ['#f2d3b6', '#e8b18a', '#c98d63', '#a97147', '#7d5233', '#5c3a24', '#bfe3c9'];
  const HAIRS = ['#1e1a17', '#3a2418', '#6b4423', '#a8823c', '#d5d5d5', '#7a3b2e', '#4bc4a8'];

  function fillSection(section, rng) {
    if (section === 'body') Object.assign(cfg, {
      height: +rndN(rng, .76, 1.12).toFixed(2), build: +rndN(rng, .2, .85).toFixed(2),
      headSize: +rndN(rng, .9, 1.5).toFixed(2), shoulder: +rndN(rng, .84, 1.2).toFixed(2),
      legs: +rndN(rng, .88, 1.12).toFixed(2), arms: +rndN(rng, .9, 1.1).toFixed(2),
      age: +rndN(rng, .08, .82).toFixed(2), asymmetry: +rndN(rng, 0, .45).toFixed(2),
      base: pickN(rng, ['neutral', 'masculine', 'feminine']),
      headShape: pickN(rng, ['oval', 'oval', 'round', 'square', 'heart', 'long', 'wide'])
    });
    if (section === 'face') Object.assign(cfg, {
      ears: pickN(rng, ['round', 'round', 'round', 'pointed', 'large', 'none']),
      facialHair: pickN(rng, ['none', 'none', 'none', 'stubble', 'moustache', 'goatee', 'beard']),
      freckles: pickN(rng, ['none', 'none', 'none', 'light', 'heavy']),
      mark: pickN(rng, ['none', 'none', 'none', 'mole', 'scar', 'both']),
      eyeSize: +rndN(rng, .82, 1.18).toFixed(2), eyeSpacing: +rndN(rng, .82, 1.22).toFixed(2),
      eyeY: +rndN(rng, -.07, .07).toFixed(2), eyeTilt: +rndN(rng, -.18, .18).toFixed(2),
      irisSize: +rndN(rng, .78, 1.25).toFixed(2),
      irisColor: pickN(rng, ['#3b2a20', '#5c4938', '#6b7d55', '#4b6f83', '#7c6842', '#2f3338']),
      browThickness: +rndN(rng, .72, 1.30).toFixed(2), browHeight: +rndN(rng, .82, 1.18).toFixed(2),
      browTilt: +rndN(rng, -.18, .18).toFixed(2),
      noseSize: +rndN(rng, .82, 1.20).toFixed(2), noseWidth: +rndN(rng, .78, 1.25).toFixed(2),
      noseProjection: +rndN(rng, .80, 1.25).toFixed(2),
      mouthWidth: +rndN(rng, .82, 1.20).toFixed(2), lipFullness: +rndN(rng, .72, 1.30).toFixed(2),
      mouthRest: +rndN(rng, -.16, .16).toFixed(2)
    });
    if (section === 'hair') {
      const preset = pickN(rng, ['crop', 'crop', 'fringe', 'sidepart', 'long', 'ponytail', 'pigtails', 'braid', 'bun', 'curls', 'spiky', 'mohawk', 'bald']);
      cfg.hair = preset;
      const hp = (window.CharacterEngine && CharacterEngine.hairPresets || {})[preset] || {};
      cfg.hairTexture = hp.texture || pickN(rng, ['straight', 'wavy', 'curly']);
      cfg.hairPart = hp.part || 'none';
      cfg.hairFringe = hp.fringe || 'none';
      cfg.hairBack = hp.back || 'loose';
      cfg.hairline = pickN(rng, ['high', 'even', 'even', 'low']);
      cfg.hairVolume = +rndN(rng, .9, 1.35).toFixed(2);
      cfg.hairLength = +rndN(rng, .65, 1.6).toFixed(2);
      if (!locks.colors) cfg.hairColor = pickN(rng, HAIRS);
    }
    if (section === 'clothing') Object.assign(cfg, {
      baseTop: pickN(rng, ['tshirt', 'blouse', 'sweater', 'hoodie', 'polo', 'buttonup', 'tunic', 'dress']),
      outerwear: pickN(rng, ['none', 'none', 'none', 'jacket', 'coat', 'vest', 'robe']),
      bottom: pickN(rng, ['jeans', 'trousers', 'skirt', 'shorts', 'leggings', 'cargo']),
      neckwear: pickN(rng, ['none', 'none', 'none', 'scarf', 'tie', 'bow']),
      footwear: pickN(rng, ['simple', 'sneakers', 'boots', 'dress', 'sandals', 'bare'])
    });
    if (section === 'colors') Object.assign(cfg, {
      skin: pickN(rng, SKINS), hairColor: pickN(rng, HAIRS),
      shirt: hueHex(rng), pants: hueHex(rng), shoes: hueHex(rng),
      soleColor: pickN(rng, ['#d8d3c6', '#f2efe8', '#2b2b2b', '#8a7f6d']),
      hatColor: hueHex(rng), outerColor: hueHex(rng), accentColor: hueHex(rng),
      frameColor: pickN(rng, ['#2a2a30', '#6b4423', '#b9a05a', '#8f2f2f']),
      propColor: hueHex(rng),
      topPattern: pickN(rng, PATTERNS), legPattern: pickN(rng, ['plain', 'plain', 'weave', 'twill', 'check']),
      patternScale: +rndN(rng, .6, 1.7).toFixed(2),
      patternSpacing: +rndN(rng, .6, 1.6).toFixed(2),
      patternAngle: rng() * 180 | 0
    });
    if (section === 'accessories') Object.assign(cfg, {
      glasses: pickN(rng, ['none', 'none', 'none', 'round', 'rect', 'sun', 'halfmoon']),
      earrings: pickN(rng, ['none', 'none', 'none', 'studs', 'hoops', 'drops', 'gems']),
      necklace: pickN(rng, ['none', 'none', 'none', 'chain', 'pendant', 'beads', 'choker']),
      headwear: pickN(rng, ['none', 'none', 'none', 'cap', 'beanie', 'widebrim', 'tophat', 'hood', 'crown', 'band']),
      eyepatch: pickN(rng, ['none', 'none', 'none', 'none', 'none', 'left', 'right'])
    });
    if (section === 'props') {
      const hands = HAND_PROPS.map(x => x[0]);
      cfg.propLeft = pickN(rng, ['none', 'none', 'none'].concat(hands.filter(x => x !== 'none')));
      cfg.prop = cfg.propLeft;
      cfg.propRight = pickN(rng, ['none', 'none', 'phone', 'pencil', 'coffee', 'pointer', 'microphone']);
      cfg.propBack = pickN(rng, ['none', 'none', 'none', 'backpack']);
      cfg.propWaist = pickN(rng, ['none', 'none', 'satchel']);
      cfg.propShoulder = pickN(rng, ['none', 'none', 'headphones']);
    }
    if (section === 'colors' || section === 'hair') {
      cfg.beardColor = rng() < .6 ? cfg.hairColor : pickN(rng, ['#d5d5d5', '#9a9188', '#6b4423']);
    }
  }
  function randomizeSections(sections, seed) {
    if (seed) cfg.seed = String(seed);
    else if (!cfg.seed) cfg.seed = String(hash32(Date.now() + ':' + Math.random()).toString(36));
    const rng = rngOf(cfg.seed + '|' + sections.join(','));
    sections.forEach(s => { if (!locks[s]) fillSection(s, rng); });
    syncAll(); commit();
  }
  function randomizeUnlocked() {
    cfg.seed = document.getElementById('seed').value || String(hash32(Date.now() + ':' + Math.random()).toString(36));
    document.getElementById('seed').value = cfg.seed;
    const rng = rngOf(cfg.seed);
    Object.keys(LOCK_KEYS).forEach(s => { if (!locks[s]) fillSection(s, rng); });
    cfg.face = pickN(rng, ['happy', 'neutral', 'surprised', 'determined', 'confused']);
    syncAll(); commit();
  }

  document.querySelectorAll('.lock[data-lock]').forEach(b => {
    b.onclick = e => { e.preventDefault(); e.stopPropagation(); locks[b.dataset.lock] = !locks[b.dataset.lock]; syncLocks(); };
  });
  document.querySelectorAll('.mini[data-rand]').forEach(b => {
    b.onclick = e => { e.preventDefault(); e.stopPropagation(); randomizeSections([b.dataset.rand]); };
  });
  document.getElementById('btn-rand-face').onclick = () => randomizeSections(['face']);
  document.getElementById('btn-rand-outfit').onclick = () => randomizeSections(['clothing', 'colors']);
  document.getElementById('btn-random').onclick = randomizeUnlocked;
  document.getElementById('btn-undo').onclick = undo;
  document.getElementById('btn-redo').onclick = redo;
  document.getElementById('btn-xray').onclick = () => { xray = !xray; applyXray(); };

  document.getElementById('btn-describe').onclick = () => {
    cfg.altDescription = (window.CharacterEngine && CharacterEngine.describeCharacter(cfg)) || '';
    document.getElementById('meta-alt').value = cfg.altDescription;
    pushHistory();
  };

  function hslHex(h, s, l) {
    const d = document.createElement('div');
    d.style.color = 'hsl(' + h + ',' + s + '%,' + l + '%)'; document.body.appendChild(d);
    const rgb = getComputedStyle(d).color.match(/\d+/g); d.remove();
    return '#' + rgb.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
  }
  document.getElementById('btn-coord').onclick = () => {
    const h = Math.random() * 360;
    cfg.shirt = hslHex(h, 48, 42);
    cfg.pants = hslHex((h + 186) % 360, 28, 30);
    cfg.shoes = hslHex((h + 24) % 360, 22, 20);
    cfg.hatColor = hslHex((h + 150) % 360, 40, 36);
    cfg.outerColor = hslHex((h + 18) % 360, 32, 26);
    cfg.accentColor = hslHex((h + 180) % 360, 58, 48);
    syncColors(); commit();
  };

  function loadPalettes() { try { return JSON.parse(localStorage.getItem(PAL_KEY) || '[]'); } catch (e) { return []; } }
  function savePalettes(p) { localStorage.setItem(PAL_KEY, JSON.stringify(p)); }
  function currentPalette() {
    const o = {}; COLORS.concat(FACE_COLORS).forEach(([k]) => o[k] = cfg[k]);
    return o;
  }
  function refreshPalettes() {
    const box = document.getElementById('palettes'); box.innerHTML = '';
    loadPalettes().forEach((p, i) => {
      const b = document.createElement('button');
      b.textContent = p.name || ('P' + (i + 1));
      b.onclick = () => { Object.assign(cfg, p.colors); syncColors(); commit(); };
      box.appendChild(b);
    });
  }
  document.getElementById('btn-save-pal').onclick = () => {
    const name = prompt('Palette name', 'Outfit ' + (loadPalettes().length + 1));
    if (!name) return;
    const all = loadPalettes(); all.push({ name, colors: currentPalette() }); savePalettes(all); refreshPalettes();
  };
  function refreshLinks() {
    const box = document.getElementById('links'); box.innerHTML = '';
    [['beardColor', 'hairColor', 'Beard = hair'], ['hatColor', 'shirt', 'Hat = shirt'],
      ['accentColor', 'shirt', 'Accent = shirt'], ['outerColor', 'pants', 'Outer = legs']].forEach(([dst, src, label]) => {
      const on = cfg.colorLinks[dst] === src;
      const b = document.createElement('button');
      b.textContent = label; b.setAttribute('aria-pressed', on);
      b.onclick = () => {
        if (on) delete cfg.colorLinks[dst]; else cfg.colorLinks[dst] = src;
        if (cfg.colorLinks[dst]) cfg[dst] = cfg[src];
        syncColors(); commit();
      };
      box.appendChild(b);
    });
  }

  const camBar = document.getElementById('cam-bar');
  Object.keys(CAMERAS).forEach(name => {
    const b = document.createElement('button'); b.textContent = name;
    b.onclick = () => setCamera(name); camBar.appendChild(b);
  });
  const resetCam = document.createElement('button'); resetCam.textContent = 'Reset camera';
  resetCam.onclick = () => { setCamera('3/4'); dist = 2.55; };
  camBar.appendChild(resetCam);
  const turnBtn = document.createElement('button'); turnBtn.id = 'btn-turn'; turnBtn.textContent = 'Turntable';
  turnBtn.onclick = () => { turntable = !turntable; turnBtn.setAttribute('aria-pressed', turntable); };
  camBar.appendChild(turnBtn);

  function thumbDataURL() {
    const w = 160, h = 200;
    const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h;
    const holdAz = az, holdPol = pol, holdDist = dist, holdK = place.targetK;
    az = .45; pol = 1.28; dist = 2.4; place.targetK = .52; place();
    renderer.render(scene, camera);
    const ctx = tmp.getContext('2d');
    ctx.fillStyle = '#0E1D33'; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(renderer.domElement, 0, 0, w, h);
    az = holdAz; pol = holdPol; dist = holdDist; place.targetK = holdK; place();
    return tmp.toDataURL('image/jpeg', .7);
  }
  function loadLib() { try { return JSON.parse(localStorage.getItem(LIB_KEY) || '[]'); } catch (e) { return []; } }
  function saveLib(items) { localStorage.setItem(LIB_KEY, JSON.stringify(items)); }
  function renderLibrary() {
    const grid = document.getElementById('lib-grid'); grid.innerHTML = '';
    loadLib().sort((a, b) => b.date - a.date).forEach(item => {
      const b = document.createElement('button'); b.className = 'lib-card';
      b.innerHTML = (item.thumb ? '<img alt="" src="' + item.thumb + '">' : '') +
        '<strong>' + (item.name || 'Untitled') + '</strong><span>' +
        new Date(item.date).toLocaleString() + '</span>';
      b.onclick = () => { applyProject(item.config); hideLibrary(); };
      grid.appendChild(b);
    });
    if (!grid.children.length) {
      const p = document.createElement('p'); p.textContent = 'No saved projects yet.'; grid.appendChild(p);
    }
  }
  function applyProject(next) {
    Object.keys(cfg).forEach(k => delete cfg[k]);
    Object.assign(cfg, deep(DEFAULTS), deep(next || {}));
    syncAll(); commit();
  }
  function showLibrary() { renderLibrary(); document.getElementById('library').classList.add('on'); }
  function hideLibrary() { document.getElementById('library').classList.remove('on'); }
  document.getElementById('btn-library').onclick = showLibrary;
  document.getElementById('btn-new').onclick = () => {
    applyProject(deep(DEFAULTS)); hideLibrary();
  };
  document.getElementById('btn-lib-close').onclick = hideLibrary;
  document.getElementById('library').addEventListener('click', e => {
    if (e.target.id === 'library') hideLibrary();
  });

  document.getElementById('btn-save-proj').onclick = () => {
    const name = cfg.name || cfg.id || prompt('Project name', 'Untitled') || 'Untitled';
    cfg.name = name;
    const items = loadLib().filter(x => x.id !== (cfg.id || name));
    items.push({
      id: cfg.id || name, name, date: Date.now(), thumb: thumbDataURL(), config: deep(cfg)
    });
    saveLib(items);
    alert('Saved “' + name + '” to this browser’s character library.');
  };

  function importJSONText(text) {
    const data = JSON.parse(text);
    const wrapped = data && data.config && typeof data.config === 'object';
    const next = wrapped ? data.config : data;
    if (wrapped && data.name && !next.name) next.name = data.name;
    applyProject(next);
  }
  document.getElementById('file-json').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { importJSONText(r.result); hideLibrary(); } catch (err) { alert('Could not read that JSON.'); } };
    r.readAsText(f); e.target.value = '';
  });
  const pickJSON = () => document.getElementById('file-json').click();
  document.getElementById('btn-import').onclick = pickJSON;
  document.getElementById('btn-lib-import').onclick = pickJSON;

  function switchVariant(v) {
    variants[activeVariant] = deep(cfg);
    activeVariant = v;
    if (variants[v]) applyProject(variants[v]);
    else variants[v] = deep(cfg);
  }
  document.getElementById('btn-dup').onclick = () => {
    const order = ['A', 'B', 'C'];
    const next = order[(order.indexOf(activeVariant) + 1) % 3];
    variants[activeVariant] = deep(cfg);
    variants[next] = deep(cfg);
    activeVariant = next;
    refreshSegs();
  };

  function capturePNG(opts) {
    opts = opts || {};
    const bg = scene.background, fog = scene.fog, gv = ground.visible;
    if (opts.clear) {
      scene.background = null; scene.fog = null; ground.visible = false;
      renderer.setClearColor(0x000000, 0);
    }
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    scene.background = bg; scene.fog = fog; ground.visible = gv;
    renderer.setClearColor(studioBg, 1);
    const a = document.createElement('a');
    a.download = (opts.name || (cfg.name || 'character')) + '.png';
    a.href = url; a.click();
  }
  document.getElementById('btn-snap').onclick = () => capturePNG({ name: safeName(cfg.name) });
  document.getElementById('btn-snap-clear').onclick = () => capturePNG({ name: safeName(cfg.name) + '-clear', clear: true });

  document.getElementById('btn-sheet').onclick = async () => {
    const views = [
      { label: 'Front', az: 0 }, { label: '3/4', az: .55 },
      { label: 'Side', az: Math.PI / 2 }, { label: 'Back', az: Math.PI }
    ];
    const cellW = 360, cellH = 480, pad = 24;
    const sheet = document.createElement('canvas');
    sheet.width = pad * 5 + cellW * 4; sheet.height = pad * 3 + cellH + 48;
    const ctx = sheet.getContext('2d');
    ctx.fillStyle = '#0E1D33'; ctx.fillRect(0, 0, sheet.width, sheet.height);
    ctx.fillStyle = '#F2A93B'; ctx.font = '22px Futura, Century Gothic, sans-serif';
    ctx.fillText((cfg.name || 'Unnamed character') + (cfg.role ? '  ·  ' + cfg.role : ''), pad, 36);
    const hold = { az, pol, dist, k: place.targetK };
    pol = 1.28; dist = 2.6; place.targetK = .5;
    for (let i = 0; i < views.length; i++) {
      az = views[i].az; place(); renderer.render(scene, camera);
      const x = pad + i * (cellW + pad), y = 56;
      ctx.fillStyle = '#132743'; ctx.fillRect(x, y, cellW, cellH);
      ctx.drawImage(renderer.domElement, x, y, cellW, cellH);
      ctx.fillStyle = '#6FD3E0'; ctx.font = '12px IBM Plex Mono, monospace';
      ctx.fillText(views[i].label, x + 8, y + cellH - 10);
    }
    az = hold.az; pol = hold.pol; dist = hold.dist; place.targetK = hold.k; place();
    const a = document.createElement('a');
    a.download = safeName(cfg.name) + '-sheet.png';
    a.href = sheet.toDataURL('image/png'); a.click();
  };

  function syncBoneSliders() {
    const lab = document.getElementById('bone-label');
    const off = (cfg.poseOffsets || {})[selectedBone] || { x: 0, y: 0, z: 0 };
    lab.textContent = selectedBone ? ('Limb: ' + selectedBone) : 'Click a joint while the pose editor is on.';
    ['x', 'y', 'z'].forEach(k => {
      document.getElementById('s-b' + k).value = off[k] || 0;
      document.getElementById('v-b' + k).textContent = (off[k] || 0).toFixed(2);
    });
  }
  function writeBone(axis, value) {
    if (!selectedBone) return;
    cfg.poseOffsets = cfg.poseOffsets || {};
    cfg.poseOffsets[selectedBone] = Object.assign({ x: 0, y: 0, z: 0 }, cfg.poseOffsets[selectedBone]);
    cfg.poseOffsets[selectedBone][axis] = value;
    if (character) character.setPoseOffsets(cfg.poseOffsets);
  }
  ['x', 'y', 'z'].forEach(axis => {
    const s = document.getElementById('s-b' + axis);
    s.addEventListener('input', () => {
      writeBone(axis, +s.value);
      document.getElementById('v-b' + axis).textContent = (+s.value).toFixed(2);
    });
    s.addEventListener('change', pushHistory);
  });
  document.getElementById('btn-pose-edit').onclick = () => {
    poseEdit = !poseEdit;
    if (poseEdit) anim = 'hold';
    applyXray(); refreshSegs();
  };
  document.getElementById('btn-mirror').onclick = () => {
    const next = {};
    Object.keys(cfg.poseOffsets || {}).forEach(name => {
      const o = cfg.poseOffsets[name];
      let m = name;
      if (name.endsWith('L')) m = name.slice(0, -1) + 'R';
      else if (name.endsWith('R')) m = name.slice(0, -1) + 'L';
      next[m] = { x: o.x || 0, y: -(o.y || 0), z: -(o.z || 0) };
    });
    cfg.poseOffsets = Object.assign({}, cfg.poseOffsets, next);
    if (character) character.setPoseOffsets(cfg.poseOffsets);
    pushHistory();
  };
  document.getElementById('btn-reset-limb').onclick = () => {
    if (!selectedBone || !cfg.poseOffsets) return;
    delete cfg.poseOffsets[selectedBone];
    if (character) character.setPoseOffsets(cfg.poseOffsets);
    syncBoneSliders(); pushHistory();
  };
  document.getElementById('btn-save-pose').onclick = () => {
    const name = document.getElementById('pose-name').value.trim();
    if (!name) return;
    cfg.poses = cfg.poses || {};
    cfg.poses[name] = { offsets: deep(cfg.poseOffsets || {}), base: anim };
    refreshSavedPoses(); pushHistory();
  };
  function refreshSavedPoses() {
    const box = document.getElementById('saved-poses'); box.innerHTML = '';
    Object.keys(cfg.poses || {}).forEach(name => {
      const b = document.createElement('button'); b.textContent = name;
      b.onclick = () => {
        const p = cfg.poses[name];
        cfg.poseOffsets = deep(p.offsets || {});
        if (p.base) anim = p.base;
        if (character) character.setPoseOffsets(cfg.poseOffsets);
        refreshSegs(); syncBoneSliders();
      };
      box.appendChild(b);
    });
  }
  document.getElementById('btn-save-expr').onclick = () => {
    const name = document.getElementById('expr-name').value.trim();
    if (!name) return;
    cfg.expressions = cfg.expressions || {};
    cfg.expressions[name] = {
      brow: cfg.exprBrow, browY: cfg.exprBrowY, lid: -.58 + cfg.exprLid, lidLow: .80,
      eye: cfg.exprEyeScale, mouthW: 1, mouthOpen: .22 + cfg.exprMouthOpen,
      mouthRoll: THREE.MathUtils.lerp(0, Math.PI, .5 + cfg.exprMouthCurve * .5),
      mouthY: .40 + cfg.exprMouthY
    };
    cfg.face = name;
    refreshSegs(); pushHistory();
  };
  document.getElementById('btn-save-state').onclick = () => {
    const name = document.getElementById('state-name').value.trim();
    if (!name) return;
    cfg.states = cfg.states || {};
    cfg.states[name] = { pose: anim, face: cfg.face, offsets: deep(cfg.poseOffsets || {}) };
    refreshStates(); pushHistory();
  };
  function refreshStates() {
    const box = document.getElementById('states'); box.innerHTML = '';
    Object.keys(cfg.states || {}).forEach(name => {
      const b = document.createElement('button'); b.textContent = name;
      b.setAttribute('aria-pressed', cfg.activeState === name);
      b.onclick = () => {
        if (!character) return;
        const next = character.setState(name);
        if (next) anim = next;
        cfg.activeState = name;
        refreshSegs();
      };
      box.appendChild(b);
    });
  }

  const sheet = document.getElementById('sheet');
  const nameInput = document.getElementById('character-name');
  const dump = document.getElementById('dump');
  const exportStatus = document.getElementById('export-status');
  const THREE_SOURCE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  const safeName = value => (value || 'my-character').trim().toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'my-character';
  function exportConfig() {
    const out = deep(cfg);
    if (!out.altDescription) out.altDescription = (window.CharacterEngine && CharacterEngine.describeCharacter(out)) || '';
    return out;
  }
  function characterRegistration(name) {
    return 'CharacterKit.register(' + JSON.stringify(name) + ', ' + JSON.stringify(exportConfig(), null, 2) + ');\n';
  }
  function characterJSON(name) {
    return JSON.stringify({
      format: 'character-kit-character',
      version: 4,
      name,
      metadata: { id: cfg.id, role: cfg.role, tags: cfg.tags, altDescription: exportConfig().altDescription },
      config: exportConfig()
    }, null, 2) + '\n';
  }
  function jsEmbedHTML(name, localThree) {
    return [
      '<script src="' + (localThree ? 'three.min.js' : THREE_SOURCE_URL) + '"><\\/script>',
      '<script src="character-kit.bundle.js"><\\/script>',
      '<script src="' + name + '.character.js"><\\/script>',
      '',
      '<character-viewer character="' + name + '" pose="' + anim + '" state="greeting" interactive ground',
      '  style="display:block;width:320px;height:420px"></character-viewer>'
    ].join('\n');
  }
  function jsonEmbedHTML(name) {
    return [
      '<script src="' + THREE_SOURCE_URL + '"><\\/script>',
      '<script src="character-kit.bundle.js"><\\/script>',
      '',
      '<character-viewer src="' + name + '.character.json" pose="' + anim + '" interactive ground',
      '  style="display:block;width:320px;height:420px"></character-viewer>'
    ].join('\n');
  }
  function starterHTML(name) {
    const title = name.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>' + title + ' Activity</title>\n<style>\n  body{font-family:system-ui,sans-serif;max-width:900px;margin:0 auto;padding:24px;background:#f4f6f9;color:#172033}\n  .activity{display:grid;grid-template-columns:minmax(280px,420px) 1fr;gap:28px;align-items:center;background:white;padding:24px;border-radius:16px}\n  character-viewer{display:block;width:100%;height:430px;border-radius:12px;overflow:hidden;background:#e9eef5}\n  button{padding:10px 14px;margin:4px;cursor:pointer}\n  @media(max-width:700px){.activity{grid-template-columns:1fr}}\n</style>\n</head>\n<body>\n<main class="activity">\n  <character-viewer id="guide" character="' + name + '" pose="idle" interactive ground></character-viewer>\n  <section>\n    <h1>' + title + '</h1>\n    <p>Performance states travel with the character. Call <code>guide.setState(\'correct\')</code> from your activity.</p>\n    <p>\n      <button onclick="guide.setState(\'greeting\')">Greeting</button>\n      <button onclick="guide.setState(\'thinking\')">Thinking</button>\n      <button onclick="guide.setState(\'correct\')">Correct</button>\n      <button onclick="guide.setState(\'incorrect\')">Incorrect</button>\n      <button onclick="guide.setState(\'celebrate\')">Celebrate</button>\n    </p>\n  </section>\n</main>\n<script src="three.min.js"><\\/script>\n<script src="character-kit.bundle.js"><\\/script>\n<script src="' + name + '.character.js"><\\/script>\n</body>\n</html>\n';
  }
  function packageReadme(name) {
    return [
      'CHARACTER KIT ACTIVITY PACKAGE',
      '==============================',
      '',
      'Open index.html to use the included standalone activity.',
      '',
      'Files:',
      '- index.html                     Ready-to-edit starter activity',
      '- three.min.js                   Local Three.js r128 library',
      '- character-kit.bundle.js        Character engine + viewer component',
      '- ' + name + '.character.js      Standalone character registration',
      '- ' + name + '.character.json    JSON version for LMS/server use',
      '',
      'Performance states: greeting, thinking, correct, incorrect, celebrate',
      '  document.getElementById("guide").setState("correct");',
      '',
      'JSON shortcut:',
      '<character-viewer src="' + name + '.character.json" pose="idle"></character-viewer>',
      ''
    ].join('\n');
  }
  function refreshExport() {
    const name = safeName(nameInput.value);
    dump.textContent = 'JAVASCRIPT CHARACTER — works as a standalone file\n' +
      jsEmbedHTML(name, false) + '\n\nJSON CHARACTER — use from an LMS or web server\n' + jsonEmbedHTML(name);
  }
  function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1200);
  }
  function bytesFromBase64(text) {
    const bin = atob(text); const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function crc32(data) {
    let c = ~0; for (let i = 0; i < data.length; i++) {
      c ^= data[i];
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    } return ~c >>> 0;
  }
  function u16(n) { return new Uint8Array([n & 255, (n >>> 8) & 255]); }
  function u32(n) { return new Uint8Array([n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]); }
  function joinBytes(parts) {
    const n = parts.reduce((s, p) => s + (typeof p === 'string' ? p.length : p.length), 0);
    const out = new Uint8Array(n); let o = 0;
    parts.forEach(p => {
      if (typeof p === 'string') { for (let i = 0; i < p.length; i++) out[o++] = p.charCodeAt(i); }
      else { out.set(p, o); o += p.length; }
    });
    return out;
  }
  function encodeUTF8(str) {
    return new TextEncoder().encode(typeof str === 'string' ? str : str);
  }
  function makeZip(files) {
    const locals = [], central = [];
    let offset = 0;
    files.forEach(file => {
      const name = file.name;
      const data = file.data instanceof Uint8Array ? file.data :
        (typeof file.data === 'string' ? encodeUTF8(file.data) : file.data);
      const crc = crc32(data);
      const local = joinBytes([
        u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0),
        name, data
      ]);
      locals.push(local);
      central.push(joinBytes([
        u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0),
        u16(0), u16(0), u16(0), u32(0), u32(offset), name
      ]));
      offset += local.length;
    });
    const centralBlob = joinBytes(central);
    const end = joinBytes([
      u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
      u32(centralBlob.length), u32(offset), u16(0)
    ]);
    return new Blob([...locals, centralBlob, end], { type: 'application/zip' });
  }
  async function getBundleBytes() {
    if (typeof CHARACTER_KIT_BUNDLE_B64 === 'string' && CHARACTER_KIT_BUNDLE_B64.length) {
      return bytesFromBase64(CHARACTER_KIT_BUNDLE_B64);
    }
    const r = await fetch('character-kit.bundle-v4.js');
    if (!r.ok) throw new Error('Could not load engine source');
    return new Uint8Array(await r.arrayBuffer());
  }

  document.getElementById('btn-export').onclick = () => {
    exportStatus.textContent = '';
    nameInput.value = safeName(cfg.id || cfg.name || 'my-character');
    refreshExport();
    sheet.classList.add('on');
    nameInput.focus(); nameInput.select();
  };
  nameInput.addEventListener('input', refreshExport);
  document.getElementById('btn-download-js').onclick = () => {
    const name = safeName(nameInput.value);
    downloadBlob(new Blob([characterRegistration(name)], { type: 'text/javascript' }), name + '.character.js');
    exportStatus.textContent = 'JavaScript character downloaded.';
  };
  document.getElementById('btn-download-json').onclick = () => {
    const name = safeName(nameInput.value);
    downloadBlob(new Blob([characterJSON(name)], { type: 'application/json' }), name + '.character.json');
    exportStatus.textContent = 'JSON character downloaded.';
  };
  document.getElementById('btn-package').onclick = async () => {
    const b = document.getElementById('btn-package');
    const name = safeName(nameInput.value);
    b.disabled = true;
    exportStatus.textContent = 'Building activity package…';
    try {
      const response = await fetch(THREE_SOURCE_URL, { mode: 'cors' });
      if (!response.ok) throw new Error('Could not retrieve Three.js.');
      const threeSource = await response.text();
      const bundle = await getBundleBytes();
      const zip = makeZip([
        { name: 'index.html', data: starterHTML(name) },
        { name: 'three.min.js', data: threeSource },
        { name: 'character-kit.bundle.js', data: bundle },
        { name: name + '.character.js', data: characterRegistration(name) },
        { name: name + '.character.json', data: characterJSON(name) },
        { name: 'README.txt', data: packageReadme(name) }
      ]);
      downloadBlob(zip, name + '-activity.zip');
      exportStatus.textContent = 'Complete activity ZIP downloaded.';
    } catch (error) {
      console.error(error);
      exportStatus.textContent = 'ZIP export needs the engine file and an internet connection for Three.js.';
    } finally { b.disabled = false; }
  };
  document.getElementById('btn-close').onclick = () => sheet.classList.remove('on');
  sheet.addEventListener('click', e => { if (e.target === sheet) sheet.classList.remove('on'); });
  document.getElementById('btn-copy').onclick = async () => {
    const b = document.getElementById('btn-copy');
    refreshExport();
    try { await navigator.clipboard.writeText(dump.textContent); b.textContent = 'Copied'; }
    catch (e) { b.textContent = 'Select the text above'; }
    setTimeout(() => b.textContent = 'Copy embed examples', 1800);
  };

  const panel = document.getElementById('panel');
  document.getElementById('tab').onclick = () => panel.classList.toggle('open');
  addEventListener('keydown', e => {
    const typing = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
      return;
    }
    if (typing) return;
    if (e.key === 'r' || e.key === 'R') { xray = !xray; applyXray(); }
    if (e.code === 'Space') { e.preventDefault(); randomizeUnlocked(); }
    if (e.key === 'Escape') { sheet.classList.remove('on'); hideLibrary(); }
  });

  refreshSegs(); syncSliders(); rebuild(); pushHistory();
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    if (turntable) az += dt * 0.35;
    if (character) character.setPose(anim, t, dt);
    place();
    renderer.render(scene, camera);
  })();

  showLibrary();
})();
