/* ============================================================
   CHARACTER ENGINE START
   Procedural skinned character generator for three.js r128.
   No external assets. Produces one SkinnedMesh (vertex-coloured,
   lofted body) + a bone hierarchy + head accessories.
   createCharacter(cfg) -> { group, mesh, bones, setPose, setFace, setExpression, setState, setPoseOffsets }
   ============================================================ */

const DEFAULTS = {
  height: 1, build: .5, headSize: 1, shoulder: 1, legs: 1, arms: 1,
  base: 'neutral', headShape: 'oval', glasses: 'none', prop: 'none',
  earrings: 'none', necklace: 'none',
  freckles: 'none', mark: 'none', eyepatch: 'none', facialHair: 'none',
  hair: 'crop', hairline: 'even', hairVolume: 1, hairLength: 1, ears: 'round',
  hairTexture: '', hairPart: '', hairFringe: '', hairBack: '',
  sleeves: 'long', legwear: 'long', footwear: 'simple', headwear: 'none',
  baseTop: 'sweater', outerwear: 'none', bottom: 'trousers', neckwear: 'none',
  topPattern: 'plain', legPattern: 'plain', patternScale: 1,
  patternFg: '#2a3344', patternAlt: '#d8dde8', patternSpacing: 1, patternAngle: 0,
  skin: '#e8b18a', hairColor: '#3a2418', beardColor: '#3a2418', shirt: '#4d7ec8',
  pants: '#37436b', shoes: '#4a3428', soleColor: '#d8d3c6', hatColor: '#2f3d5c',
  frameColor: '#2a2a30', propColor: '#8a5a2b', jewelColor: '#d4af37',
  outerColor: '#3a4a6b', accentColor: '#c8452f', irisColor: '#3b2a20',
  face: 'happy',
  eyeSize: 1, eyeSpacing: 1, eyeY: 0, eyeTilt: 0, irisSize: 1,
  browThickness: 1, browHeight: 1, browTilt: 0,
  noseSize: 1, noseWidth: 1, noseProjection: 1,
  mouthWidth: 1, lipFullness: 1, mouthRest: 0,
  age: 0.32, asymmetry: 0, quality: 'standard',
  propLeft: '', propRight: 'none', propBack: 'none', propWaist: 'none', propShoulder: 'none',
  expression: null, expressions: {}, poseOffsets: {}, poses: {},
  states: {
    greeting: { pose: 'wave', face: 'happy' },
    thinking: { pose: 'idle', face: 'neutral' },
    correct: { pose: 'wave', face: 'happy' },
    incorrect: { pose: 'idle', face: 'sad' },
    celebrate: { pose: 'dance', face: 'surprised' }
  },
  name: 'Unnamed', id: '', role: '', tags: [], altDescription: '',
  seed: '', colorLinks: {},
  exprBrow: 0, exprBrowY: 0, exprLid: 0, exprEyeScale: 1,
  exprMouthCurve: 0, exprMouthOpen: 0, exprMouthY: 0
};

// ---- unit-height rest skeleton (character is 1.0 tall, feet at y=0) ----
function restPoints(c){
  const B = BASES[c.base] || BASES.neutral;
  const L = c.legs, A = c.arms, S = c.shoulder * B.shoulder;
  const hipY = .53 * L;
  const p = {
    hips:      [0, hipY, 0],
    spine:     [0, hipY + .075, 0],
    chest:     [0, hipY + .175, 0],
    neck:      [0, hipY + .285, 0],
    head:      [0, hipY + .39, 0],
    shoulderL: [.049 * S, hipY + .248, 0],
    upperArmL: [.098 * S, hipY + .248, 0],
    forearmL:  [.098 * S + .098 * A, hipY + .248 - .135 * A, 0],
    handL:     [.098 * S + .186 * A, hipY + .248 - .258 * A, 0],
    handTipL:  [.098 * S + .224 * A, hipY + .248 - .305 * A, 0],
    thighL:    [.072 * B.hip, hipY - .02, 0],
    shinL:     [.082 * B.hip, .275 * L, 0],
    footL:     [.086 * B.hip, .048 * L, 0],
    toeL:      [.086 * B.hip, .016 * L, .095]
  };
  // mirror the left side to the right
  for (const k of Object.keys(p)) {
    if (k.endsWith('L')) p[k.slice(0, -1) + 'R'] = [-p[k][0], p[k][1], p[k][2]];
  }
  return p;
}

// rx/ry/rz reshape the whole skull (hair, hats, ears and glasses follow);
// jaw/cheek/crown/sq reshape only the head mesh
// Base body models. These are coordinated sets: the torso profile, hip and
// shoulder placement, limb thickness, neck and stature all move together, because
// changing any one of them alone reads as a deformed body rather than a different one.
// torso = seven half-widths sampled hips -> neck. depth = front-to-back ratio.
const BASES = {
  neutral:   { torso: [.088, .080, .072, .076, .094, .100, .064], depth: .64,
               bust: 0,   hip: 1,    shoulder: 1,    limb: 1,    neck: 1,    stature: 1 },
  masculine: { torso: [.084, .077, .074, .082, .101, .110, .065], depth: .66,
               bust: 0,   hip: .94,  shoulder: 1.07, limb: 1.05, neck: 1.10, stature: 1.03 },
  feminine:  { torso: [.097, .088, .069, .079, .092, .092, .060], depth: .625,
               bust: .34, hip: 1.10, shoulder: .93,  limb: .95,  neck: .90,  stature: .96 }
};

const HEAD_SHAPES = {
  oval:   { rx:1,    ry:1,    rz:1,    jaw:.30, sq:0,   cheek:0,   crown:0 },
  round:  { rx:1.07, ry:.94,  rz:1.05, jaw:.12, sq:0,   cheek:.05, crown:0 },
  square: { rx:1.04, ry:1,    rz:1.02, jaw:.06, sq:.58, cheek:0,   crown:.12 },
  heart:  { rx:1.02, ry:1.01, rz:1,    jaw:.52, sq:.14, cheek:.08, crown:0 },
  long:   { rx:.92,  ry:1.15, rz:.97,  jaw:.34, sq:.06, cheek:0,   crown:0 },
  wide:   { rx:1.13, ry:.89,  rz:1.03, jaw:.20, sq:.22, cheek:.06, crown:.06 }
};

// The one place skull shaping is defined. blob() builds the head from it, and
// face marks sample it so freckles and scars sit on the actual skin, not on a
// plain ellipsoid that a square or heart-shaped skull has already moved away from.
function headSurface(sh, ph, th, radii, flatBack){
  const st = Math.sin(th), cp = Math.cos(ph), sp = Math.sin(ph);
  let nx = st * cp, ny = Math.cos(th), nz = st * sp, py = ny;
  if (sh && sh.sq){
    const e = 1 - sh.sq * .45;
    nx = st * Math.sign(cp) * Math.pow(Math.abs(cp), e);
    nz = st * Math.sign(sp) * Math.pow(Math.abs(sp), e);
  }
  let sx = 1, sz = 1;
  if (sh){
    const k = Math.max(0, -ny);
    sx = 1 - sh.jaw * k * k;
    sz = 1 - sh.jaw * .70 * k * k;
    if (sh.cheek){
      const c2 = Math.exp(-Math.pow((ny - .25) / .28, 2));
      sx *= 1 + sh.cheek * c2; sz *= 1 + sh.cheek * .5 * c2;
    }
    if (sh.crown) py = ny * (1 - sh.crown * Math.max(0, (ny - .45) / .55));
  }
  if (flatBack && nz < 0) sz *= .9;
  return [nx * radii[0] * sx, py * radii[1], nz * radii[2] * sz];
}

const CHAIN = [
  ['hips', null], ['spine', 'hips'], ['chest', 'spine'], ['neck', 'chest'], ['head', 'neck'],
  ['shoulderL', 'chest'], ['upperArmL', 'shoulderL'], ['forearmL', 'upperArmL'], ['handL', 'forearmL'],
  ['shoulderR', 'chest'], ['upperArmR', 'shoulderR'], ['forearmR', 'upperArmR'], ['handR', 'forearmR'],
  ['thighL', 'hips'], ['shinL', 'thighL'], ['footL', 'shinL'],
  ['thighR', 'hips'], ['shinR', 'thighR'], ['footR', 'shinR']
];

// ---------------- fabric patterns (canvas, greyscale, multiplied by garment colour) ----------------
const PATTERNS = ['plain','weave','stripes','check','plaid','dots','twill','scales'];
const PATTERN_CACHE = {};
function patternTexture(name, opt){
  opt = opt || {};
  if (name === 'plain' || typeof document === 'undefined') return null;
  const sp = Math.max(.35, Number(opt.spacing) || 1);
  const ang = Number(opt.angle) || 0;
  const fg = opt.fg || '';
  const alt = opt.alt || '';
  const key = name + '|' + sp.toFixed(2) + '|' + (ang | 0) + '|' + fg + '|' + alt;
  if (PATTERN_CACHE[key]) return PATTERN_CACHE[key];
  const S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const x = cv.getContext('2d');
  const mix = (hex, v) => {
    const c = new THREE.Color(hex || '#000000');
    const r = (255 * (c.r * (1 - v) + v)) | 0;
    const g0 = (255 * (c.g * (1 - v) + v)) | 0;
    const b = (255 * (c.b * (1 - v) + v)) | 0;
    return 'rgb(' + r + ',' + g0 + ',' + b + ')';
  };
  const g = v => fg ? mix(fg, v) : 'rgb(' + [v * 255 | 0, v * 255 | 0, v * 255 | 0] + ')';
  x.fillStyle = alt ? mix(alt, .92) : '#fff'; x.fillRect(0, 0, S, S);
  if (ang){
    x.translate(S / 2, S / 2); x.rotate(ang * Math.PI / 180); x.translate(-S / 2, -S / 2);
  }
  const wrapped = fn => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) fn(dx * S, dy * S); };

  if (name === 'weave'){
    for (let i = 0; i < S; i += Math.max(3, 5 * sp | 0)){
      x.fillStyle = g(.90); x.fillRect(0, i, S, 2);
      x.fillStyle = g(.95); x.fillRect(i, 0, 2, S);
    }
  }
  if (name === 'stripes'){
    x.fillStyle = g(.66); x.fillRect(0, 0, S, S / 2);
    x.fillStyle = g(.86); x.fillRect(0, S / 2, S, S / 12);
  }
  if (name === 'check'){
    x.fillStyle = g(.68);
    x.fillRect(0, 0, S / 2, S / 2); x.fillRect(S / 2, S / 2, S / 2, S / 2);
  }
  if (name === 'plaid'){
    x.fillStyle = g(.78); x.fillRect(0, 0, S, S);
    x.fillStyle = g(.62); x.fillRect(0, 0, S, S * .34); x.fillRect(0, 0, S * .34, S);
    x.fillStyle = g(.92); x.fillRect(0, S * .52, S, S * .07); x.fillRect(S * .52, 0, S * .07, S);
    x.fillStyle = g(.50); x.fillRect(0, S * .74, S, S * .04); x.fillRect(S * .74, 0, S * .04, S);
  }
  if (name === 'dots'){
    x.fillStyle = g(.70);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
      wrapped((ox, oy) => {
        x.beginPath();
        x.arc(ox + c * S / 4 + (r % 2 ? S / 8 : 0) + S / 8, oy + r * S / 4 + S / 8, S / 22, 0, 7);
        x.fill();
      });
  }
  if (name === 'twill'){
    x.lineWidth = 3; x.strokeStyle = g(.80);
    for (let i = -S; i < S * 2; i += Math.max(5, 9 * sp | 0)){
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i + S, S); x.stroke();
    }
  }
  if (name === 'scales'){
    x.lineWidth = 2.5; x.strokeStyle = g(.62);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
      wrapped((ox, oy) => {
        x.beginPath();
        x.arc(ox + c * S / 8 + (r % 2 ? S / 16 : 0), oy + r * S / 8, S / 15, .15, Math.PI - .15);
        x.stroke();
      });
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  PATTERN_CACHE[key] = t; return t;
}

// ---------------- geometry accumulator ----------------
// channel 0 = skin, 1 = top, 2 = legs & shoes. Each becomes a material group.
function Builder(){
  this.pos = []; this.col = []; this.uv = []; this.si = []; this.sw = [];
  this.tri = [[], [], []]; this.n = 0;
}
Builder.prototype.vert = function(x, y, z, c, w, u, v){
  this.pos.push(x, y, z);
  this.col.push(c.r, c.g, c.b);
  this.uv.push(u || 0, v || 0);
  const bi = [0, 0, 0, 0], bw = [0, 0, 0, 0];
  let i = 0, sum = 0;
  for (const k in w){ if (i > 3) break; bi[i] = k | 0; bw[i] = w[k]; sum += w[k]; i++; }
  for (let j = 0; j < 4; j++) bw[j] = sum > 0 ? bw[j] / sum : (j === 0 ? 1 : 0);
  this.si.push(bi[0], bi[1], bi[2], bi[3]);
  this.sw.push(bw[0], bw[1], bw[2], bw[3]);
  return this.n++;
};
Builder.prototype.quad = function(a, b, c, d, ch){
  const t = this.tri[ch || 0]; t.push(a, b, d, b, c, d);
};
// UV seams and region splits duplicate vertices; re-average their normals so the
// duplication never shows up as a shading crease.
function weldNormals(g){
  const p = g.attributes.position, n = g.attributes.normal, map = new Map();
  for (let i = 0; i < p.count; i++){
    const k = (p.getX(i) * 1e5 | 0) + '|' + (p.getY(i) * 1e5 | 0) + '|' + (p.getZ(i) * 1e5 | 0);
    let a = map.get(k); if (!a){ a = [0, 0, 0, []]; map.set(k, a); }
    a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); a[3].push(i);
  }
  map.forEach(a => {
    const l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1;
    a[3].forEach(i => n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l));
  });
  n.needsUpdate = true;
}
Builder.prototype.geometry = function(){
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(this.si, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(this.sw, 4));
  const idx = []; let start = 0;
  this.tri.forEach((t, ch) => {
    for (let i = 0; i < t.length; i++) idx.push(t[i]);
    if (t.length) g.addGroup(start, t.length, ch);
    start += t.length;
  });
  g.setIndex(idx);
  g.computeVertexNormals();
  weldNormals(g);
  return g;
};

// blend skin weights across a joint so elbows and knees don't collapse
function weights(t, a, b, prev){
  const w = {};
  if (t > .74 && b != null){ const k = .5 * (t - .74) / .26; w[a] = 1 - k; w[b] = k; }
  else if (t < .26 && prev != null){ const k = .5 * (.26 - t) / .26; w[a] = 1 - k; w[prev] = k; }
  else w[a] = 1;
  return w;
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// loft a tapered tube between two joints
function tube(B, a, b, opt){
  const A = V(a[0], a[1], a[2]), Bv = V(b[0], b[1], b[2]);
  const axis = Bv.clone().sub(A), len = axis.length(); axis.normalize();
  const ref = Math.abs(axis.y) < .9 ? V(0, 1, 0) : V(0, 0, 1);
  const side = new THREE.Vector3().crossVectors(ref, axis).normalize();
  const fwd = new THREE.Vector3().crossVectors(axis, side).normalize();
  const R = opt.radial || 10, steps = opt.steps || 6;
  const capA = opt.capA ? 3 : 0, capB = opt.capB ? 3 : 0;
  const ps = opt.pscale || .1;
  // whole number of pattern repeats around the limb keeps the seam continuous
  const rAvg = (opt.profile(0).rx + opt.profile(1).rx) * .5;
  const around = Math.max(1, Math.round(2 * Math.PI * rAvg / ps));
  const rings = [], chans = [];

  const ringAt = (t, push, bulge) => {
    const p = opt.profile(t);
    const reg = opt.region(t);
    const c = opt.palette[reg.key], scale = reg.pad * (bulge === undefined ? 1 : bulge);
    const w = weights(THREE.MathUtils.clamp(t, 0, 1), opt.a, opt.b, opt.prev);
    const along = len * t + (push || 0);
    const centre = A.clone().addScaledVector(axis, along);
    const vv = (opt.v0 || 0) + along / ps;
    const row = [];
    for (let i = 0; i <= R; i++){                 // R+1: last vertex duplicates the seam
      const ph = i / R * Math.PI * 2;
      const x = centre.x + side.x * p.rx * scale * Math.cos(ph) + fwd.x * p.rz * scale * Math.sin(ph);
      const y = centre.y + side.y * p.rx * scale * Math.cos(ph) + fwd.y * p.rz * scale * Math.sin(ph);
      const z = centre.z + side.z * p.rx * scale * Math.cos(ph) + fwd.z * p.rz * scale * Math.sin(ph);
      row.push(B.vert(x, y, z, c, w, i / R * around, vv));
    }
    rings.push(row); chans.push(reg.ch || 0);
  };

  for (let i = capA; i > 0; i--){
    const ang = i / (capA + 1) * Math.PI / 2;
    ringAt(0, -Math.sin(ang) * opt.profile(0).rx, Math.max(.06, Math.cos(ang)));
  }
  for (let s = 0; s <= steps; s++) ringAt(s / steps);
  for (let i = 1; i <= capB; i++){
    const ang = i / (capB + 1) * Math.PI / 2;
    ringAt(1, Math.sin(ang) * opt.profile(1).rx, Math.max(.06, Math.cos(ang)));
  }
  for (let r = 0; r < rings.length - 1; r++)
    for (let i = 0; i < R; i++)
      B.quad(rings[r][i], rings[r][i + 1], rings[r + 1][i + 1], rings[r + 1][i], chans[r]);
}

// squashable UV sphere welded to a single bone
function blob(B, centre, radii, opt){
  const seg = opt.seg || 18, rows = opt.rows || 12;
  const c = opt.color, w = {}; w[opt.bone] = 1;
  const grid = [];
  for (let r = 0; r <= rows; r++){
    const v = r / rows, th = v * Math.PI, row = [];
    for (let i = 0; i <= seg; i++){
      const u = i / seg, ph = u * Math.PI * 2;
      const q = headSurface(opt.shape, ph, th, radii, opt.flatBack);
      row.push(B.vert(centre[0] + q[0], centre[1] + q[1], centre[2] + q[2],
        c, w, u * (opt.around || 2), v * (opt.down || 2)));
    }
    grid.push(row);
  }
  for (let r = 0; r < rows; r++)
    for (let i = 0; i < seg; i++)
      B.quad(grid[r][i], grid[r][i + 1], grid[r + 1][i + 1], grid[r + 1][i], opt.ch || 0);
}


// ---------------- plugin-style content registries ----------------
const CharacterFeatures = {
  props: Object.create(null),
  garments: Object.create(null),
  hair: Object.create(null),
  expressions: Object.create(null)
};
function registerProp(def){
  if (!def || !def.id) throw new Error('registerProp needs { id, label, slot, build }');
  CharacterFeatures.props[def.id] = def;
  return def;
}
function registerGarment(def){
  if (!def || !def.id) throw new Error('registerGarment needs { id, label, slot }');
  CharacterFeatures.garments[def.id] = def;
  return def;
}
function registerHair(def){
  if (!def || !def.id) throw new Error('registerHair needs { id }');
  CharacterFeatures.hair[def.id] = def;
  return def;
}
function registerExpression(def){
  if (!def || !def.id) throw new Error('registerExpression needs { id }');
  CharacterFeatures.expressions[def.id] = def;
  return def;
}

const QUALITY = {
  preview:  { rad: 8,  torso: 10, steps: 3, headSeg: 12, headRows: 8,  hairSeg: 16 },
  standard: { rad: 10, torso: 16, steps: 5, headSeg: 22, headRows: 15, hairSeg: 28 },
  high:     { rad: 14, torso: 22, steps: 7, headSeg: 28, headRows: 18, hairSeg: 36 }
};

const HAIR_PRESETS = {
  crop:     { texture:'straight', part:'none',   fringe:'none',     back:'loose' },
  fringe:   { texture:'straight', part:'none',   fringe:'straight', back:'loose' },
  sidepart: { texture:'straight', part:'left',   fringe:'side',     back:'loose' },
  long:     { texture:'straight', part:'none',   fringe:'none',     back:'long' },
  ponytail: { texture:'straight', part:'none',   fringe:'none',     back:'ponytail' },
  pigtails: { texture:'straight', part:'none',   fringe:'straight', back:'pigtails' },
  braid:    { texture:'wavy',     part:'none',   fringe:'none',     back:'braid' },
  bun:      { texture:'straight', part:'none',   fringe:'none',     back:'bun' },
  curls:    { texture:'curly',    part:'none',   fringe:'none',     back:'loose' },
  spiky:    { texture:'spiky',    part:'none',   fringe:'none',     back:'loose' },
  mohawk:   { texture:'spiky',    part:'none',   fringe:'none',     back:'mohawk' },
  bald:     { texture:'straight', part:'none',   fringe:'none',     back:'bald' }
};

const TOP_SLEEVES = {
  tshirt:'short', blouse:'long', sweater:'long', hoodie:'long', polo:'short',
  buttonup:'long', tunic:'long', jacket:'long', robe:'long', dress:'short', vest:'none'
};
const BOTTOM_LEGS = {
  jeans:'long', trousers:'long', skirt:'none', shorts:'short',
  leggings:'long', cargo:'long', dress:'none'
};

// Per-garment silhouettes. The skinned loft reads pad / hem / sleeve / puff /
// taper; overlays add the bits a loft cannot (open fronts, collars, pockets).
// hem is the torso u where pants give way to shirt (u=0 hips, u=1 neck);
// a smaller hem is a longer top.
const TOP_SPEC = {
  tshirt:   { pad: 1.05, hem: .14, sleeve: 1.00, puff: 0,    crew: true },
  blouse:   { pad: 1.16, hem: .055, sleeve: 1.12, puff: .14,  collar: 'v', peplum: true, cuff: true },
  sweater:  { pad: 1.18, hem: .035, sleeve: 1.22, puff: 0,    rib: true, cuff: true },
  hoodie:   { pad: 1.20, hem: .04,  sleeve: 1.24, puff: 0,    rib: true, cuff: true, kangaroo: true, hood: true },
  polo:     { pad: 1.06, hem: .12,  sleeve: 1.04, puff: 0,    collar: 'polo', placket: 3 },
  buttonup: { pad: 1.08, hem: .048, sleeve: 1.08, puff: 0,    collar: 'shirt', placket: 6, tail: true, cuff: true },
  tunic:    { pad: 1.10, hem: .0,   sleeve: 1.08, puff: 0,    drop: true },
  dress:    { pad: 1.08, hem: .0,   sleeve: 1.00, puff: 0,    dress: true }
};
const OUTER_SPEC = {
  jacket: { pad: 1.04, open: .95, length: .26, y: .02,  flare: 1.08, lapels: true, sleevePad: 1.18, sleeves: 'long' },
  coat:   { pad: 1.06, open: .82, length: .42, y: -.08, flare: 1.22, lapels: true, sleevePad: 1.20, sleeves: 'long' },
  robe:   { pad: 1.04, open: .72, length: .54, y: -.12, flare: 1.48, sash: true,   sleevePad: 1.10, sleeves: 'long' },
  vest:   { pad: 1.14, open: 1.15, length: .17, y: .02, flare: 1.04, lapels: true, sleeveless: true }
};
const BOTTOM_SPEC = {
  jeans:    { pad: 1.14, taper: .90, waistband: true, pockets: true, belt: true },
  trousers: { pad: 1.06, taper: .80, waistband: true },
  skirt:    { pad: 1.00, taper: 1,   overlay: 'aline' },
  shorts:   { pad: 1.10, taper: 1,   cuff: true },
  leggings: { pad: .93,  taper: .96 },
  cargo:    { pad: 1.16, taper: .92, waistband: true, pockets: true, thighPockets: true }
};
function resolveGarment(cfg){
  return {
    top: TOP_SPEC[cfg.baseTop] || TOP_SPEC.sweater,
    outer: (cfg.outerwear && cfg.outerwear !== 'none') ? (OUTER_SPEC[cfg.outerwear] || null) : null,
    bottom: BOTTOM_SPEC[cfg.bottom] || BOTTOM_SPEC.trousers
  };
}

function resolveHair(cfg){
  const named = cfg.hair && cfg.hair !== 'custom' && HAIR_PRESETS[cfg.hair];
  const base = Object.assign({}, named ? HAIR_PRESETS[cfg.hair] : HAIR_PRESETS.crop);
  if (cfg.hairTexture) base.texture = cfg.hairTexture;
  if (cfg.hairPart) base.part = cfg.hairPart;
  if (cfg.hairFringe) base.fringe = cfg.hairFringe;
  if (cfg.hairBack) base.back = cfg.hairBack;
  return base;
}
function resolveSleeves(cfg){
  if (cfg.sleeves && cfg._lockSleeves) return cfg.sleeves;
  const g = resolveGarment(cfg);
  if (g.outer){
    if (g.outer.sleeveless) return TOP_SLEEVES[cfg.baseTop] || cfg.sleeves || 'long';
    if (g.outer.sleeves) return g.outer.sleeves;
  }
  if (cfg.baseTop && TOP_SLEEVES[cfg.baseTop]) return TOP_SLEEVES[cfg.baseTop];
  return cfg.sleeves || 'long';
}
function resolveLegwear(cfg){
  if (cfg.legwear && cfg._lockLegwear) return cfg.legwear;
  if (cfg.baseTop === 'dress' && cfg.bottom !== 'leggings') return 'none';
  const b = cfg.bottom || '';
  if (b && BOTTOM_LEGS[b]) return BOTTOM_LEGS[b] === 'short' ? 'short' : (BOTTOM_LEGS[b] === 'none' ? 'none' : 'long');
  return cfg.legwear || 'long';
}
function hash32(str){
  let h = 2166136261;
  str = String(str || '');
  for (let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function applyColorLinks(cfg){
  const links = cfg.colorLinks || {};
  Object.keys(links).forEach(dst => {
    const src = links[dst];
    if (src && cfg[src]) cfg[dst] = cfg[src];
  });
  return cfg;
}
function mixHex(a, b, t){
  const pa = new THREE.Color(a), pb = new THREE.Color(b);
  pa.lerp(pb, t);
  return '#' + pa.getHexString();
}
function colorWord(hex){
  const c = new THREE.Color(hex || '#888888');
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  if (hsl.s < .12) return hsl.l > .7 ? 'light grey' : hsl.l < .25 ? 'black' : 'grey';
  const names = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink'];
  const i = Math.round(hsl.h * 8) % 8;
  return (hsl.l < .32 ? 'dark ' : hsl.l > .72 ? 'light ' : '') + names[i];
}
function describeCharacter(cfg){
  cfg = Object.assign({}, DEFAULTS, cfg || {});
  const hp = resolveHair(cfg);
  const bits = [];
  const ageWord = cfg.age < .22 ? 'young' : cfg.age > .72 ? 'older' : 'adult';
  bits.push(ageWord + (cfg.base === 'masculine' ? ' man' : cfg.base === 'feminine' ? ' woman' : ' person'));
  if (cfg.role) bits[0] = cfg.role + ', ' + bits[0];
  if (cfg.name && cfg.name !== 'Unnamed') bits.unshift(cfg.name);
  let hairBit;
  if (hp.back === 'bald' && hp.fringe === 'none') {
    hairBit = 'bald';
  } else {
    const hbits = [];
    if (hp.texture && hp.texture !== 'straight') hbits.push(hp.texture);
    if (hp.part && hp.part !== 'none') hbits.push(hp.part + ' part');
    if (hp.fringe && hp.fringe !== 'none') hbits.push(hp.fringe + ' fringe');
    hbits.push(hp.back === 'bald' ? 'bald crown' : (hp.back === 'loose' ? 'short' : hp.back) + ' hair');
    hairBit = hbits.join(', ') + ' in a ' + colorWord(cfg.hairColor) + ' colour';
  }
  bits.push(hairBit);
  const clothes = [];
  if (cfg.baseTop && cfg.baseTop !== 'none') clothes.push(cfg.baseTop.replace('buttonup', 'button-up'));
  if (cfg.outerwear && cfg.outerwear !== 'none') clothes.push(cfg.outerwear);
  if (cfg.bottom && cfg.bottom !== 'none') clothes.push(cfg.bottom);
  if (cfg.footwear && cfg.footwear !== 'none' && cfg.footwear !== 'bare') clothes.push(cfg.footwear);
  if (cfg.neckwear && cfg.neckwear !== 'none') clothes.push(cfg.neckwear);
  if (clothes.length) bits.push('wearing a ' + clothes.join(' over '));
  if (cfg.headwear && cfg.headwear !== 'none') bits.push(cfg.headwear.replace('widebrim', 'wide-brim hat').replace('tophat', 'top hat'));
  if (cfg.glasses && cfg.glasses !== 'none') bits.push(cfg.glasses === 'sun' ? 'sunglasses' : cfg.glasses + ' glasses');
  const props = [cfg.propLeft || cfg.prop, cfg.propRight, cfg.propBack, cfg.propWaist, cfg.propShoulder]
    .filter(p => p && p !== 'none');
  if (props.length) bits.push('holding or wearing ' + props.join(', '));
  let text = bits.join(', ') + '.';
  if (cfg.altDescription) return cfg.altDescription;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
function compatibilityWarnings(cfg){
  cfg = Object.assign({}, DEFAULTS, cfg || {});
  const hp = resolveHair(cfg);
  const w = [];
  const bulky = hp.back === 'mohawk' || hp.texture === 'spiky' || cfg.hairVolume > 1.28;
  if (cfg.headwear && cfg.headwear !== 'none' && cfg.headwear !== 'band' && bulky)
    w.push('This hat may collide with bulky or spiky hair.');
  if ((cfg.headwear === 'hood' || cfg.baseTop === 'hoodie') &&
      (hp.back === 'bun' || hp.back === 'ponytail' || hp.back === 'pigtails'))
    w.push('A hood covers most of a ponytail, bun, or pigtails.');
  if (cfg.glasses !== 'none' && cfg.eyepatch !== 'none')
    w.push('Glasses overlap the eyepatch.');
  if (cfg.headwear === 'tophat' && hp.back === 'bun')
    w.push('A top hat sits over a bun and may look stacked.');
  if (cfg.baseTop === 'dress' && cfg.bottom && cfg.bottom !== 'none' && cfg.bottom !== 'dress')
    w.push('A dress already includes a skirt — the bottom layer may peek through.');
  if (cfg.outerwear === 'robe' && cfg.bottom === 'skirt')
    w.push('The robe silhouette covers most of a skirt.');
  if ((cfg.propLeft === cfg.propRight) && cfg.propLeft && cfg.propLeft !== 'none' &&
      ['sword','staff','umbrella','laptop'].indexOf(cfg.propLeft) >= 0)
    w.push('Both hands hold the same large prop.');
  return w;
}

const SLOT_BONE = {
  leftHand: 'handL', rightHand: 'handR',
  back: 'chest', waist: 'hips', shoulder: 'chest',
  forearmL: 'forearmL', forearmR: 'forearmR'
};

function propHelpers(H, cfg){
  const solid = (c, rough) => new THREE.MeshStandardMaterial({
    color: new THREE.Color(c).convertSRGBToLinear(), roughness: rough === undefined ? .6 : rough });
  const wood = solid(cfg.propColor, .82);
  const metal = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#b9c2cc').convertSRGBToLinear(), roughness: .34, metalness: .75 });
  const glow = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffd79a').convertSRGBToLinear(), roughness: .5,
    emissive: new THREE.Color('#ffb347').convertSRGBToLinear(), emissiveIntensity: 1.5 });
  const dark = new THREE.MeshStandardMaterial({
    color: new THREE.Color(cfg.propColor).convertSRGBToLinear().multiplyScalar(.55), roughness: .85 });
  const paper = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#efe7d4').convertSRGBToLinear(), roughness: .95 });
  const black = solid('#1c1c20', .45);
  const put = (m, x, y, z, parent) => {
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = true; m.userData.prop = true;
    parent.add(m); return m;
  };
  const cyl = (r1, r2, h, seg, mat) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 10), mat);
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const ball = (r, mat) => new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat);
  return { solid, wood, metal, glow, dark, paper, black, put, cyl, box, ball, H };
}

function attachPropSlot(bones, map, slot, id, H, cfg, P){
  if (!id || id === 'none') return;
  const def = CharacterFeatures.props[id];
  if (!def || typeof def.build !== 'function') return;
  const boneName = (def.bone === 'head' || def.slot === 'head') ? 'head'
    : (def.bone && (slot === def.slot || (slot === 'leftHand' && /L$/.test(def.bone)) || (slot === 'rightHand' && /R$/.test(def.bone))))
      ? def.bone
      : (SLOT_BONE[slot] || def.bone || SLOT_BONE[def.slot] || 'handL');
  const bone = bones[map[boneName]];
  if (!bone) return;
  const rig = new THREE.Group();
  rig.userData.propSlot = slot;
  bone.add(rig);
  const place = boneName === 'head' ? 'head' : slot;
  if (place === 'leftHand' || place === 'rightHand'){
    const side = (place === 'rightHand' || boneName.indexOf('R') >= 0) ? 'R' : 'L';
    if (P && P['handTip' + side] && P['hand' + side]){
      rig.position.set(
        (P['handTip' + side][0] - P['hand' + side][0]) * .6,
        (P['handTip' + side][1] - P['hand' + side][1]) * .6, 0);
    }
  }
  if (place === 'back'){
    rig.position.set(0, -.02 * H, -.09 * H);
  }
  if (place === 'waist'){
    rig.position.set(.08 * H, -.02 * H, .02 * H);
  }
  if (place === 'shoulder'){
    rig.position.set(.11 * H, .06 * H, -.02 * H);
  }
  def.build(rig, propHelpers(H, cfg), cfg);
}

(function registerDefaultProps(){
  const Hprop = (id, label, slot, fn, extra) => registerProp(Object.assign({ id, label, slot, build: fn }, extra || {}));

  Hprop('staff', 'Staff', 'leftHand', (rig, h) => {
    h.put(h.cyl(.011 * h.H, .013 * h.H, 1.05 * h.H, 8, h.wood), 0, .02 * h.H, 0, rig);
    h.put(h.ball(.030 * h.H, h.wood), 0, .545 * h.H, 0, rig);
    h.put(h.ball(.019 * h.H, h.glow), 0, .580 * h.H, 0, rig);
  });
  Hprop('sword', 'Sword', 'rightHand', (rig, h) => {
    h.put(h.cyl(.013 * h.H, .014 * h.H, .105 * h.H, 8, h.dark), 0, 0, 0, rig);
    h.put(h.ball(.020 * h.H, h.metal), 0, -.062 * h.H, 0, rig);
    h.put(h.box(.115 * h.H, .017 * h.H, .026 * h.H, h.metal), 0, .058 * h.H, 0, rig);
    const blade = h.cyl(.007 * h.H, .021 * h.H, .420 * h.H, 4, h.metal);
    blade.scale.z = .34; h.put(blade, 0, .277 * h.H, 0, rig);
  });
  Hprop('shield', 'Shield', 'leftHand', (rig, h) => {
    rig.position.set(.055 * h.H, -.030 * h.H, .012 * h.H);
    rig.rotation.z = -Math.PI / 2;
    h.put(h.cyl(.135 * h.H, .120 * h.H, .022 * h.H, 22, h.wood), 0, 0, 0, rig);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.132 * h.H, .014 * h.H, 8, 26), h.metal);
    rim.rotation.x = Math.PI / 2; h.put(rim, 0, .002 * h.H, 0, rig);
    h.put(h.ball(.034 * h.H, h.metal), 0, .018 * h.H, 0, rig);
  }, { bone: 'forearmL' });
  Hprop('lantern', 'Lantern', 'leftHand', (rig, h) => {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(.026 * h.H, .005 * h.H, 6, 16), h.metal);
    h.put(hoop, 0, -.004 * h.H, 0, rig);
    h.put(h.cyl(.031 * h.H, .034 * h.H, .070 * h.H, 10, h.glow), 0, -.078 * h.H, 0, rig);
    h.put(h.cyl(.038 * h.H, .012 * h.H, .028 * h.H, 10, h.metal), 0, -.030 * h.H, 0, rig);
    h.put(h.cyl(.012 * h.H, .040 * h.H, .026 * h.H, 10, h.metal), 0, -.126 * h.H, 0, rig);
  });
  Hprop('torch', 'Torch', 'leftHand', (rig, h) => {
    h.put(h.cyl(.010 * h.H, .012 * h.H, .270 * h.H, 8, h.wood), 0, .02 * h.H, 0, rig);
    h.put(h.cyl(.030 * h.H, .014 * h.H, .048 * h.H, 10, h.dark), 0, .150 * h.H, 0, rig);
    h.put(h.cyl(.001 * h.H, .036 * h.H, .105 * h.H, 9, h.glow), 0, .215 * h.H, 0, rig);
  });
  Hprop('book', 'Book', 'leftHand', (rig, h) => {
    const b = h.box(.115 * h.H, .026 * h.H, .092 * h.H, h.wood);
    b.rotation.set(.16, 0, .10); h.put(b, .012 * h.H, -.020 * h.H, .010 * h.H, rig);
    const pages = h.box(.104 * h.H, .019 * h.H, .084 * h.H, h.paper);
    pages.rotation.set(.16, 0, .10); h.put(pages, .015 * h.H, -.019 * h.H, .010 * h.H, rig);
  });
  Hprop('satchel', 'Satchel', 'waist', (rig, h) => {
    const belt = new THREE.Mesh(new THREE.TorusGeometry(.115 * h.H, .011 * h.H, 6, 26), h.dark);
    belt.rotation.set(Math.PI / 2, 0, .58); belt.scale.z = .68;
    h.put(belt, 0, -.010 * h.H, 0, rig);
    h.put(h.box(.105 * h.H, .095 * h.H, .050 * h.H, h.wood), .105 * h.H, -.145 * h.H, -.008 * h.H, rig);
    h.put(h.box(.107 * h.H, .028 * h.H, .053 * h.H, h.dark), .105 * h.H, -.104 * h.H, -.008 * h.H, rig);
  }, { bone: 'chest' });
  Hprop('umbrella', 'Umbrella', 'leftHand', (rig, h) => {
    h.put(h.cyl(.008 * h.H, .008 * h.H, .620 * h.H, 8, h.dark), 0, .250 * h.H, 0, rig);
    h.put(h.cyl(.012 * h.H, .245 * h.H, .150 * h.H, 14, h.wood), 0, .625 * h.H, 0, rig);
    h.put(h.ball(.016 * h.H, h.dark), 0, .706 * h.H, 0, rig);
    const crook = new THREE.Mesh(new THREE.TorusGeometry(.026 * h.H, .008 * h.H, 6, 14, Math.PI), h.dark);
    crook.rotation.y = Math.PI / 2; h.put(crook, 0, -.060 * h.H, .026 * h.H, rig);
  });
  Hprop('phone', 'Phone', 'rightHand', (rig, h) => {
    const ph = h.box(.042 * h.H, .086 * h.H, .008 * h.H, h.black);
    ph.rotation.x = .35; h.put(ph, .01 * h.H, .02 * h.H, .02 * h.H, rig);
    const sc = h.box(.034 * h.H, .070 * h.H, .002 * h.H, h.solid('#6fd3e0', .2));
    sc.rotation.x = .35; h.put(sc, .01 * h.H, .022 * h.H, .025 * h.H, rig);
  });
  Hprop('laptop', 'Laptop', 'leftHand', (rig, h) => {
    h.put(h.box(.22 * h.H, .012 * h.H, .15 * h.H, h.black), 0, -.02 * h.H, .04 * h.H, rig);
    const lid = h.box(.22 * h.H, .14 * h.H, .008 * h.H, h.black);
    lid.position.set(0, .05 * h.H, -.03 * h.H); lid.rotation.x = -.7;
    lid.castShadow = true; rig.add(lid);
    const scr = h.box(.20 * h.H, .12 * h.H, .002 * h.H, h.solid('#9ad7e0', .18));
    scr.position.set(0, .05 * h.H, -.025 * h.H); scr.rotation.x = -.7; rig.add(scr);
  });
  Hprop('tablet', 'Tablet', 'leftHand', (rig, h) => {
    const t = h.box(.14 * h.H, .01 * h.H, .20 * h.H, h.black);
    t.rotation.set(.4, 0, .15); h.put(t, .02 * h.H, .01 * h.H, .03 * h.H, rig);
    const sc = h.box(.12 * h.H, .002 * h.H, .17 * h.H, h.solid('#d9eef2', .2));
    sc.rotation.set(.4, 0, .15); h.put(sc, .02 * h.H, .016 * h.H, .03 * h.H, rig);
  });
  Hprop('pencil', 'Pencil', 'rightHand', (rig, h) => {
    const yel = h.solid('#e2b04a', .7);
    h.put(h.cyl(.006 * h.H, .006 * h.H, .16 * h.H, 8, yel), 0, .05 * h.H, 0, rig);
    h.put(h.cyl(.001 * h.H, .006 * h.H, .028 * h.H, 8, h.solid('#e8d3b0', .8)), 0, .14 * h.H, 0, rig);
    h.put(h.cyl(.007 * h.H, .007 * h.H, .018 * h.H, 8, h.solid('#d47a9a', .5)), 0, -.03 * h.H, 0, rig);
  });
  Hprop('notebook', 'Notebook', 'leftHand', (rig, h) => {
    const b = h.box(.12 * h.H, .018 * h.H, .16 * h.H, h.solid('#3d6aa8', .7));
    b.rotation.set(.2, 0, .12); h.put(b, .01 * h.H, -.01 * h.H, .02 * h.H, rig);
    const pg = h.box(.11 * h.H, .012 * h.H, .15 * h.H, h.paper);
    pg.rotation.set(.2, 0, .12); h.put(pg, .012 * h.H, -.006 * h.H, .02 * h.H, rig);
  });
  Hprop('backpack', 'Backpack', 'back', (rig, h) => {
    h.put(h.box(.16 * h.H, .22 * h.H, .10 * h.H, h.wood), 0, -.04 * h.H, -.02 * h.H, rig);
    h.put(h.box(.14 * h.H, .08 * h.H, .04 * h.H, h.dark), 0, .04 * h.H, .04 * h.H, rig);
    const strapL = h.box(.02 * h.H, .22 * h.H, .012 * h.H, h.dark);
    h.put(strapL, -.07 * h.H, .02 * h.H, .06 * h.H, rig);
    const strapR = h.box(.02 * h.H, .22 * h.H, .012 * h.H, h.dark);
    h.put(strapR, .07 * h.H, .02 * h.H, .06 * h.H, rig);
  });
  Hprop('folder', 'Folder', 'leftHand', (rig, h) => {
    const f = h.box(.16 * h.H, .008 * h.H, .22 * h.H, h.solid('#e2a93b', .7));
    f.rotation.set(.35, 0, .1); h.put(f, .02 * h.H, 0, .03 * h.H, rig);
  });
  Hprop('map', 'Map', 'leftHand', (rig, h) => {
    const m = h.box(.18 * h.H, .004 * h.H, .14 * h.H, h.solid('#e7d7a8', .9));
    m.rotation.set(.2, .3, .2); h.put(m, .02 * h.H, .03 * h.H, .02 * h.H, rig);
  });
  Hprop('coffee', 'Coffee cup', 'rightHand', (rig, h) => {
    h.put(h.cyl(.028 * h.H, .024 * h.H, .07 * h.H, 14, h.solid('#f2efe8', .55)), 0, .04 * h.H, .02 * h.H, rig);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.016 * h.H, .005 * h.H, 6, 12, Math.PI), h.solid('#f2efe8', .55));
    handle.rotation.y = Math.PI / 2; h.put(handle, .028 * h.H, .04 * h.H, .02 * h.H, rig);
    h.put(h.cyl(.022 * h.H, .022 * h.H, .008 * h.H, 12, h.solid('#5c3a24', .8)), 0, .078 * h.H, .02 * h.H, rig);
  });
  Hprop('bag', 'Shopping bag', 'leftHand', (rig, h) => {
    h.put(h.box(.12 * h.H, .14 * h.H, .06 * h.H, h.wood), 0, -.08 * h.H, 0, rig);
    const handles = new THREE.Mesh(new THREE.TorusGeometry(.04 * h.H, .005 * h.H, 6, 16, Math.PI), h.dark);
    handles.rotation.z = Math.PI / 2; h.put(handles, 0, .01 * h.H, 0, rig);
  });
  Hprop('ball', 'Sports ball', 'rightHand', (rig, h) => {
    h.put(h.ball(.055 * h.H, h.wood), .02 * h.H, .02 * h.H, .04 * h.H, rig);
  });
  Hprop('headphones', 'Headphones', 'head', (rig, h) => {
    const band = new THREE.Mesh(new THREE.TorusGeometry(.09 * h.H, .008 * h.H, 8, 18, Math.PI), h.black);
    band.rotation.z = Math.PI; h.put(band, 0, .02 * h.H, 0, rig);
    h.put(h.cyl(.028 * h.H, .028 * h.H, .018 * h.H, 12, h.black), -.09 * h.H, -.02 * h.H, 0, rig);
    h.put(h.cyl(.028 * h.H, .028 * h.H, .018 * h.H, 12, h.black), .09 * h.H, -.02 * h.H, 0, rig);
  }, { bone: 'head', slot: 'head' });
  Hprop('microphone', 'Microphone', 'rightHand', (rig, h) => {
    h.put(h.cyl(.008 * h.H, .008 * h.H, .14 * h.H, 8, h.metal), 0, .05 * h.H, 0, rig);
    h.put(h.ball(.028 * h.H, h.black), 0, .13 * h.H, 0, rig);
  });
  Hprop('flag', 'Flag', 'rightHand', (rig, h) => {
    h.put(h.cyl(.007 * h.H, .007 * h.H, .42 * h.H, 8, h.dark), 0, .18 * h.H, 0, rig);
    const cloth = h.box(.16 * h.H, .10 * h.H, .006 * h.H, h.wood);
    h.put(cloth, .08 * h.H, .32 * h.H, 0, rig);
  });
  Hprop('sign', 'Sign', 'leftHand', (rig, h) => {
    h.put(h.cyl(.008 * h.H, .008 * h.H, .36 * h.H, 8, h.dark), 0, .14 * h.H, 0, rig);
    h.put(h.box(.18 * h.H, .12 * h.H, .012 * h.H, h.solid('#f2efe8', .7)), 0, .36 * h.H, 0, rig);
  });
  Hprop('pointer', 'Pointer', 'rightHand', (rig, h) => {
    h.put(h.cyl(.006 * h.H, .004 * h.H, .34 * h.H, 8, h.dark), 0, .14 * h.H, 0, rig);
    h.put(h.cyl(.001 * h.H, .008 * h.H, .03 * h.H, 8, h.solid('#c8452f', .5)), 0, .32 * h.H, 0, rig);
  });
  Hprop('clipboard', 'Clipboard', 'leftHand', (rig, h) => {
    const board = h.box(.12 * h.H, .008 * h.H, .18 * h.H, h.solid('#c9b48a', .7));
    board.rotation.set(.45, 0, .12); h.put(board, .02 * h.H, .01 * h.H, .03 * h.H, rig);
    const clip = h.box(.04 * h.H, .012 * h.H, .02 * h.H, h.metal);
    clip.rotation.set(.45, 0, .12); h.put(clip, .02 * h.H, .05 * h.H, -.04 * h.H, rig);
    const sheet = h.box(.10 * h.H, .002 * h.H, .15 * h.H, h.paper);
    sheet.rotation.set(.45, 0, .12); h.put(sheet, .02 * h.H, .016 * h.H, .03 * h.H, rig);
  });
})();

(function registerDefaultGarments(){
  [['tshirt','T-shirt','baseTop'],['blouse','Blouse','baseTop'],['sweater','Sweater','baseTop'],
   ['hoodie','Hoodie','baseTop'],['polo','Polo','baseTop'],['buttonup','Button-up','baseTop'],
   ['tunic','Tunic','baseTop'],['dress','Dress','baseTop'],
   ['jacket','Jacket','outerwear'],['coat','Coat','outerwear'],['robe','Robe','outerwear'],['vest','Vest','outerwear'],
   ['jeans','Jeans','bottom'],['trousers','Trousers','bottom'],['skirt','Skirt','bottom'],
   ['shorts','Shorts','bottom'],['leggings','Leggings','bottom'],['cargo','Cargo pants','bottom'],
   ['scarf','Scarf','neckwear'],['tie','Tie','neckwear'],['bow','Bow','neckwear']
  ].forEach(([id, label, slot]) => {
    const spec = slot === 'baseTop' ? TOP_SPEC[id]
      : slot === 'outerwear' ? OUTER_SPEC[id]
      : slot === 'bottom' ? BOTTOM_SPEC[id]
      : null;
    registerGarment({ id, label, slot, spec });
  });
})();

function buildWardrobeOverlays(cfg, bones, map, H, fat, hr, ctx){
  const chest = bones[map.chest], hips = bones[map.hips], neck = bones[map.neck];
  if (!chest || !hips) return;
  const g = ctx && ctx.garment ? ctx.garment : resolveGarment(cfg);
  const torsoAt = ctx && ctx.torsoAt;
  const SH = (ctx && ctx.SH) || { pad: 1.08 };
  const Q = (ctx && ctx.Q) || { torso: 16 };
  const segs = Q.torso >= 20 ? 28 : Q.torso >= 14 ? 22 : 16;
  const topMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(cfg.shirt).convertSRGBToLinear(), roughness: .86, side: THREE.DoubleSide });
  const outerMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(cfg.outerColor || cfg.shirt).convertSRGBToLinear(), roughness: .82, side: THREE.DoubleSide });
  const accent = new THREE.MeshStandardMaterial({
    color: new THREE.Color(cfg.accentColor || '#c8452f').convertSRGBToLinear(), roughness: .7 });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(cfg.pants).convertSRGBToLinear(), roughness: .88, side: THREE.DoubleSide });
  const add = (mesh, parent, x, y, z) => {
    mesh.position.set(x || 0, y || 0, z || 0);
    mesh.castShadow = true; mesh.userData.wardrobe = true;
    parent.add(mesh); return mesh;
  };
  const hipProf = torsoAt ? torsoAt(0) : { rx: .09 * fat * H, rz: .06 * fat * H };
  const chestProf = torsoAt ? torsoAt(.72) : { rx: .10 * fat * H, rz: .07 * fat * H };
  const ellipse = (mesh, rx, rz) => { mesh.scale.z = rz / Math.max(rx, 1e-6); return mesh; };
  const flared = (mat, waistRx, waistRz, hemMul, length, parent, y0) => {
    const pts = [
      new THREE.Vector2(waistRx * .98, 0),
      new THREE.Vector2(waistRx * 1.04, -length * .22),
      new THREE.Vector2(waistRx * (1 + (hemMul - 1) * .55), -length * .62),
      new THREE.Vector2(waistRx * hemMul, -length)
    ];
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, segs), mat);
    ellipse(mesh, waistRx, waistRz);
    return add(mesh, parent, 0, y0, 0);
  };
  const openShell = (mat, rx, rz, rBot, height, gap, parent, y) => {
    const geo = new THREE.CylinderGeometry(rx, rBot, height, segs, 1, true, gap / 2, Math.PI * 2 - gap);
    const mesh = new THREE.Mesh(geo, mat);
    ellipse(mesh, rx, rz);
    return add(mesh, parent, 0, y, 0);
  };
  const alongLimb = (fromName, toName, t, rTop, rBot, h, mat) => {
    const from = bones[map[fromName]], to = bones[map[toName]];
    if (!from || !to) return null;
    const dir = to.position.clone();
    if (dir.lengthSq() < 1e-8) return null;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 12), mat);
    mesh.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
    mesh.position.copy(dir).multiplyScalar(t);
    mesh.castShadow = true; mesh.userData.wardrobe = true;
    from.add(mesh); return mesh;
  };
  const top = cfg.baseTop || 'sweater';
  const spec = g.top;
  const dressCovers = top === 'dress';
  const rxH = hipProf.rx * SH.pad;
  const rzH = hipProf.rz * SH.pad;
  const rxC = chestProf.rx * SH.pad;
  const rzC = chestProf.rz * SH.pad;

  if (spec.crew){
    const crew = new THREE.Mesh(new THREE.TorusGeometry(.036 * H, .007 * H, 6, 16), topMat);
    crew.rotation.x = Math.PI / 2;
    add(crew, neck, 0, -.008 * H, .008 * H);
  }
  if (spec.collar === 'polo' || spec.collar === 'shirt'){
    [-1, 1].forEach(sx => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(.052 * H, .011 * H, .036 * H), topMat);
      wing.rotation.set(.55, sx * .32, sx * .22);
      add(wing, chest, sx * .026 * H, .096 * H, .042 * H);
    });
  }
  if (spec.collar === 'v'){
    [-1, 1].forEach(sx => {
      const v = new THREE.Mesh(new THREE.BoxGeometry(.012 * H, .078 * H, .007 * H), topMat);
      v.rotation.z = sx * .42;
      add(v, chest, sx * .02 * H, .072 * H, .056 * H);
    });
  }
  if (spec.placket){
    const n = spec.placket;
    const hPl = n > 4 ? .16 * H : .09 * H;
    const placket = new THREE.Mesh(new THREE.BoxGeometry(.016 * H, hPl, .01 * H), accent);
    add(placket, chest, 0, .04 * H, .058 * H);
    for (let i = 0; i < n; i++){
      const btn = new THREE.Mesh(new THREE.SphereGeometry(.0055 * H, 8, 6), accent);
      add(btn, chest, 0, .04 * H + hPl / 2 - (i + .6) * (hPl / (n + .2)), .066 * H);
    }
  }
  if (spec.rib){
    const hem = new THREE.Mesh(new THREE.CylinderGeometry(rxH * 1.02, rxH * 1.08, .038 * H, segs, 1, true), topMat);
    ellipse(hem, rxH, rzH);
    add(hem, hips, 0, .03 * H, 0);
  }
  if (spec.kangaroo){
    const pouch = new THREE.Mesh(new THREE.SphereGeometry(.055 * H, 14, 10), topMat);
    pouch.scale.set(1.55, .58, .48);
    add(pouch, chest, 0, -.03 * H, .062 * H);
  }
  if (spec.hood && cfg.headwear !== 'hood'){
    const drape = new THREE.Mesh(new THREE.CylinderGeometry(
      hr * 1.22, hr * 1.38, .16 * H, segs, 1, true, Math.PI * .5, Math.PI), topMat);
    drape.scale.z = 1.12;
    add(drape, neck, 0, .055 * H, -hr * .18);
    const bump = new THREE.Mesh(new THREE.SphereGeometry(hr * .82, 14, 10), topMat);
    bump.scale.set(1.12, .82, 1.05);
    add(bump, neck, 0, .13 * H, -hr * .52);
  }
  if (spec.peplum) flared(topMat, rxH * 1.02, rzH * 1.02, 1.38, .09 * H, hips, .02 * H);
  if (spec.drop) flared(topMat, rxH * 1.0, rzH * 1.0, 1.22, .16 * H, hips, .01 * H);
  if (spec.dress) flared(topMat, rxH * 1.02, rzH * 1.02, 1.72, .30 * H, hips, .02 * H);
  if (spec.tail){
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(
      rxH, rxH * 1.08, .09 * H, segs, 1, true, Math.PI * .5, Math.PI), topMat);
    ellipse(tail, rxH, rzH);
    add(tail, hips, 0, -.02 * H, 0);
  }
  if (spec.cuff){
    ['L', 'R'].forEach(s => {
      const r = .028 * fat * H * (spec.sleeve || 1);
      alongLimb('forearm' + s, 'hand' + s, .88, r * 1.12, r * 1.18, .028 * H, topMat);
    });
  }

  const outer = g.outer;
  if (outer){
    const shellRx = rxC * 1.10;
    const shellRz = rzC * 1.14;
    openShell(outerMat, shellRx, shellRz, shellRx * (outer.flare || 1.08),
      outer.length * H, outer.open, chest, (outer.y || 0) * H);
    if (outer.lapels){
      [-1, 1].forEach(sx => {
        const lapel = new THREE.Mesh(new THREE.BoxGeometry(.038 * H, .11 * H, .016 * H), outerMat);
        lapel.rotation.set(.35, sx * .55, sx * .18);
        add(lapel, chest, sx * .042 * H, .055 * H, .062 * H);
      });
    }
    if (outer.sash){
      const sash = new THREE.Mesh(new THREE.TorusGeometry(rxH * 1.12, .013 * H, 6, 18), accent);
      sash.rotation.x = Math.PI / 2;
      add(sash, hips, 0, .05 * H, 0);
    }
    if (!outer.sleeveless && cfg.sleeves === 'long'){
      ['L', 'R'].forEach(s => {
        const r = .030 * fat * H * (outer.sleevePad || 1.1);
        alongLimb('forearm' + s, 'hand' + s, .92, r * 1.14, r * 1.22, .032 * H, outerMat);
      });
    }
  }

  const bottom = cfg.bottom || 'trousers';
  const bspec = g.bottom;
  if (!dressCovers){
    if (bspec.overlay === 'aline' || bottom === 'skirt'){
      flared(pantsMat, rxH * 1.02, rzH * 1.02, 1.65, .22 * H, hips, .01 * H);
    }
    if (bspec.waistband){
      const band = new THREE.Mesh(new THREE.CylinderGeometry(rxH * 1.04, rxH * 1.06, .028 * H, segs, 1, true), pantsMat);
      ellipse(band, rxH, rzH);
      add(band, hips, 0, .025 * H, 0);
    }
    if (bspec.belt){
      [-1.15, -.45, .45, 1.15, Math.PI].forEach(th => {
        const loop = new THREE.Mesh(new THREE.BoxGeometry(.008 * H, .026 * H, .006 * H), pantsMat);
        add(loop, hips, Math.sin(th) * rxH * 1.05, .03 * H, Math.cos(th) * rzH * 1.05);
      });
    }
    if (bspec.pockets){
      [-1, 1].forEach(sx => {
        const pk = new THREE.Mesh(new THREE.BoxGeometry(.05 * H, .055 * H, .016 * H), pantsMat);
        add(pk, hips, sx * .068 * H, -.018 * H, rzH * .95);
      });
      [-1, 1].forEach(sx => {
        const back = new THREE.Mesh(new THREE.BoxGeometry(.048 * H, .05 * H, .014 * H), pantsMat);
        add(back, hips, sx * .06 * H, -.01 * H, -rzH * .95);
      });
    }
    if (bspec.thighPockets){
      ['L', 'R'].forEach(s => {
        const thigh = bones[map['thigh' + s]], shin = bones[map['shin' + s]];
        if (!thigh || !shin) return;
        const pk = new THREE.Mesh(new THREE.BoxGeometry(.048 * H, .07 * H, .028 * H), pantsMat);
        pk.quaternion.setFromUnitVectors(V(0, 1, 0), shin.position.clone().normalize());
        const side = s === 'L' ? 1 : -1;
        pk.position.copy(shin.position).multiplyScalar(.42);
        pk.position.x += side * .02 * H;
        pk.position.z += .012 * H;
        pk.castShadow = true; pk.userData.wardrobe = true;
        thigh.add(pk);
      });
    }
    if (bspec.cuff && cfg.legwear === 'short'){
      ['L', 'R'].forEach(s => {
        const r = .048 * fat * H * (bspec.pad || 1);
        alongLimb('thigh' + s, 'shin' + s, .92, r, r * 1.06, .024 * H, pantsMat);
      });
    }
  }

  const nw = cfg.neckwear || 'none';
  if (nw === 'scarf'){
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(.05 * H, .018 * H, 8, 16), accent);
    scarf.rotation.set(.4, 0, .15);
    add(scarf, neck, 0, .01 * H, .02 * H);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(.05 * H, .16 * H, .02 * H), accent);
    add(tail, chest, .04 * H, .02 * H, .06 * H);
  }
  if (nw === 'tie'){
    const knot = new THREE.Mesh(new THREE.BoxGeometry(.03 * H, .03 * H, .02 * H), accent);
    add(knot, neck, 0, -.02 * H, .04 * H);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(.028 * H, .14 * H, .012 * H), accent);
    add(blade, chest, 0, .02 * H, .055 * H);
  }
  if (nw === 'bow'){
    const bow = new THREE.Mesh(new THREE.BoxGeometry(.08 * H, .03 * H, .02 * H), accent);
    add(bow, neck, 0, -.01 * H, .045 * H);
  }
}

function createCharacter(input){
  const clone = v => JSON.parse(JSON.stringify(v || {}));
  const cfg = applyColorLinks(Object.assign(clone(DEFAULTS), clone(input || {})));
  if (!cfg.propLeft) cfg.propLeft = cfg.prop || 'none';
  const Q = QUALITY[cfg.quality] || QUALITY.standard;
  const age = THREE.MathUtils.clamp(Number(cfg.age) || 0, 0, 1);
  if (age > .45){
    const g = (age - .45) / .55;
    cfg.hairColor = mixHex(cfg.hairColor, '#d5d5d5', g * .75);
    cfg.beardColor = mixHex(cfg.beardColor || cfg.hairColor, '#e6e3dd', g * .7);
  }
  cfg.sleeves = resolveSleeves(cfg);
  cfg.legwear = resolveLegwear(cfg);
  const garment = resolveGarment(cfg);
  const BASE = BASES[cfg.base] || BASES.neutral;
  const H = cfg.height * BASE.stature * (1 - age * .04);
  const fat = .82 + cfg.build * .58;          // overall thickness from the Build slider
  const limb = fat * BASE.limb;
  const hs = cfg.headSize;
  const P = restPoints(cfg);
  for (const k in P) P[k] = P[k].map(v => v * H);
  // arms sit proportionally to the ribcage, so the socket stays tucked inside it
  // whatever the build; the cap's jaw clearance is solved separately below
  const spread = fat / 1.11;
  ['shoulder', 'upperArm', 'forearm', 'hand', 'handTip'].forEach(k =>
    ['L', 'R'].forEach(sd => { P[k + sd][0] *= spread; }));

  // ---- bones ----
  const bones = [], map = {};
  CHAIN.forEach(([name, parent]) => {
    const b = new THREE.Bone(); b.name = name;
    const p = P[name], q = parent ? P[parent] : [0, 0, 0];
    b.position.set(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
    map[name] = bones.length; bones.push(b);
    if (parent) map[parent] !== undefined && bones[map[parent]].add(b);
  });
  const root = bones[0];

  // ---- palette (sRGB -> linear so vertex colours read true) ----
  const lin = h => new THREE.Color(h).convertSRGBToLinear();
  const palette = {
    skin: lin(cfg.skin), shirt: lin(cfg.shirt), pants: lin(cfg.pants),
    shoe: lin(cfg.shoes), sole: lin(cfg.soleColor), hair: lin(cfg.hairColor)
  };
  const SK = { key: 'skin', pad: 1, ch: 0 }, SH = { key: 'shirt', pad: 1.07, ch: 1 };
  const PA = { key: 'pants', pad: 1.06, ch: 2 }, SO = { key: 'shoe', pad: 1.2, ch: 2 };
  palette.outer = lin(cfg.outerColor || cfg.shirt);
  SH.pad = garment.top.pad;
  if (garment.outer && garment.outer.sleeveless) SH.pad = Math.max(SH.pad, garment.outer.pad);
  PA.pad = garment.bottom.pad;
  const hemU = garment.top.hem;
  const sleevePad = cfg.sleeves === 'none' ? 1 :
    Math.max(garment.top.sleeve || 1, (garment.outer && garment.outer.sleevePad) || 1);
  const jacketSleeves = !!(garment.outer && garment.outer.sleevePad && !garment.outer.sleeveless);
  const SH_SLEEVE = {
    key: jacketSleeves ? 'outer' : 'shirt',
    pad: sleevePad,
    ch: jacketSleeves ? 0 : 1
  };
  const SH2 = { key: 'shirt', pad: 1, ch: 1 };   // explicit radii, no padding
  const SK2 = { key: 'skin', pad: 1, ch: 0 };
  const SL = { key: 'sole', pad: 1, ch: 2 };      // sole slab, radius set explicitly
  const SX = { key: 'shoe', pad: 1, ch: 2 };      // straps, cuffs, heels
  const PS = .105 * H * cfg.patternScale;        // world size of one fabric tile

  const B = new Builder();
  const smooth = (arr, t) => {                  // sample a radius profile
    const n = arr.length - 1, x = THREE.MathUtils.clamp(t, 0, 1) * n;
    const i = Math.min(n - 1, Math.floor(x)), f = x - i;
    return THREE.MathUtils.lerp(arr[i], arr[i + 1], f * f * (3 - 2 * f));
  };

  // torso — three lofts sharing one continuous profile, so spine and chest
  // each own a slice of the mesh and the upper body actually bends
  const torsoR = BASE.torso.map(v => v * fat * H);
  const torsoAt = u => {
    const wide = THREE.MathUtils.lerp(1, cfg.shoulder, THREE.MathUtils.smoothstep(u, .52, .82));
    const r = smooth(torsoR, u);
    // front-to-back depth, with an optional swell across the chest
    const depth = BASE.depth * (1 + BASE.bust * Math.exp(-Math.pow((u - .66) / .13, 2)));
    return { rx: r * wide, rz: r * depth };
  };
  const TORSO = [
    ['hips', 'spine', 'chest', null, 0, .263, 4, true],
    ['spine', 'chest', 'neck', 'hips', .263, .614, 5, false],
    ['chest', 'neck', null, 'spine', .614, 1, 6, false]
  ];
  TORSO.forEach(([a, b, , prev, u0, u1, steps, cap]) => {
    tube(B, P[a], P[b], {
      a: map[a], b: map[b], prev: prev == null ? null : map[prev],
      radial: Q.torso, steps, capA: cap, palette, pscale: PS,
      profile: t => torsoAt(u0 + (u1 - u0) * t),
      region: t => ((u0 + (u1 - u0) * t) < hemU ? PA : SH)
    });
  });
  // neck
  tube(B, P.neck, P.head, {
    a: map.neck, b: map.head, prev: map.chest, radial: Q.rad, steps: Math.max(2, Q.steps - 2), pscale: PS,
    profile: () => ({ rx: .034 * fat * BASE.neck * H, rz: .034 * fat * BASE.neck * H }),
    region: () => SK, palette
  });
  // head
  const HS = HEAD_SHAPES[cfg.headShape] || HEAD_SHAPES.oval;
  const hr = .077 * hs * H * HS.rx, hry = .088 * hs * H * HS.ry, hrz = .082 * hs * H * HS.rz;
  // Top of the eye in hry units. Moves with head shape — a wide skull has a
  // smaller hry and so relatively taller eyes — so it must be derived.
  const EYE_TOP = (.10 * hry + .30 * hr) / hry;
  const SAFE = EYE_TOP + .06;
  blob(B, P.head, [hr, hry, hrz],
    { bone: map.head, color: palette.skin, shape: HS, flatBack: true, seg: Q.headSeg, rows: Q.headRows });

  const sleeveUp = cfg.sleeves === 'none' ? 0 : 1.01;
  const sleeveFore = cfg.sleeves === 'long' ? .55 : 0;
  const pantThigh = cfg.legwear === 'none' ? 0 : 1.01;
  const pantShin = cfg.legwear === 'long' ? .92 : 0;

  const FW = cfg.footwear;
  const SHOE = {
    bare:     { rx: .030, rz: .026, sole: 0,    reg: SK },
    simple:   { rx: .034, rz: .030, sole: .013, reg: SO },
    sneakers: { rx: .039, rz: .034, sole: .020, reg: SO },
    boots:    { rx: .038, rz: .033, sole: .017, reg: SO },
    dress:    { rx: .031, rz: .028, sole: .009, reg: SO },
    sandals:  { rx: .030, rz: .026, sole: .014, reg: SK }
  }[FW] || { rx: .034, rz: .030, sole: .013, reg: SO };
  const bootFrom = FW === 'boots' ? .48 : 2;      // fraction down the shin
  const mix3 = (a, b, t) => [a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t, a[2] + (b[2]-a[2])*t];

  ['L', 'R'].forEach(s => {
    // Deltoid. A sphere centred exactly on the shoulder pivot and weighted to the
    // upper arm: because it is centred on the axis of rotation, rotating the arm
    // cannot change its silhouette, so it seals the socket in every pose. The arm
    // loft's open end sits inside it and is never visible.
    const armR0 = (sleeveUp ? SH_SLEEVE.pad : 1) * .042 * limb * H;
    const clothed = sleeveUp ? palette[SH_SLEEVE.key] : palette.skin;
    const chArm = sleeveUp ? SH_SLEEVE.ch : 0;

    // The socket now sits inside the ribcage, so the torso itself forms the
    // shoulder and the arm emerges from under it. All the cap has to do is seal
    // the opening where the arm exits — so it is barely wider than the arm and
    // mostly buried. Every semi-axis still exceeds the opening radius, so the
    // opening (which never leaves a sphere of that radius about the pivot) stays
    // swallowed however the arm is rotated.
    const ax = V(P['forearm' + s][0] - P['upperArm' + s][0],
                 P['forearm' + s][1] - P['upperArm' + s][1], 0).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), ax);
    const ringR = (sleeveUp ? SH_SLEEVE.pad : 1) * .040 * limb * H;   // the true opening radius
    const across = ringR * 1.05;
    // The cap runs up over the shoulder, which at extreme proportions can crowd the
    // jaw. Shorten it just enough to clear; the seal is unaffected because that only
    // depends on the smallest semi-axis, which never changes.
    const pv = V(P['upperArm' + s][0], P['upperArm' + s][1], 0);
    const headC = V(0, P.head[1], 0);
    const hR = [.077 * hs * H, .088 * hs * H, .082 * hs * H];
    const clearsJaw = L => {
      for (let i = 0; i <= 6; i++){
        const th = Math.PI - i / 6 * (Math.PI / 2);       // inboard half only
        for (let j = 0; j < 8; j++){
          const ph = j / 8 * Math.PI * 2;
          const e = V(Math.sin(th) * Math.cos(ph) * across, Math.cos(th) * L,
                      Math.sin(th) * Math.sin(ph) * across).applyQuaternion(q).add(pv).sub(headC);
          if (Math.pow(e.x / hR[0], 2) + Math.pow(e.y / hR[1], 2) + Math.pow(e.z / hR[2], 2) < 1.10) return false;
        }
      }
      return true;
    };
    let along = ringR * 1.32;
    if (!clearsJaw(along)){
      let lo = across, hi = along;
      for (let i = 0; i < 16; i++){ const m = (lo + hi) / 2; if (clearsJaw(m)) lo = m; else hi = m; }
      along = lo;
    }
    blob(B, P['upperArm' + s], [across, along, across],
      { bone: map['upperArm' + s], color: clothed, quat: q,
        seg: 14, rows: 12, ch: chArm });

    tube(B, P['upperArm' + s], P['forearm' + s], {
      a: map['upperArm' + s], b: map['forearm' + s], prev: map['shoulder' + s], radial: Q.rad, steps: Q.steps, pscale: PS,
      profile: t => {
        const puff = (sleeveUp && garment.top.puff) ? garment.top.puff * Math.sin(t * Math.PI) : 0;
        const r = (.040 - .010 * t) * limb * H * (1 + puff);
        return { rx: r, rz: r };
      },
      region: t => (t < sleeveUp ? SH_SLEEVE : SK), palette
    });
    tube(B, P['forearm' + s], P['hand' + s], {
      a: map['forearm' + s], b: map['hand' + s], prev: map['upperArm' + s], radial: Q.rad, steps: Q.steps, pscale: PS,
      profile: t => {
        const puff = (sleeveFore && garment.top.puff) ? garment.top.puff * .45 * Math.sin(t * Math.PI) : 0;
        const r = (.032 - .009 * t) * limb * H * (1 + puff);
        return { rx: r, rz: r };
      },
      region: t => (t < sleeveFore ? SH_SLEEVE : SK), palette
    });
    tube(B, P['hand' + s], P['handTip' + s], {
      a: map['hand' + s], b: null, prev: map['forearm' + s], radial: Q.rad, steps: Math.max(2, Q.steps - 2), pscale: PS,
      profile: t => ({ rx: (.026 + .006 * Math.sin(t * Math.PI)) * limb * H, rz: .017 * limb * H }),
      region: () => SK, palette, capB: true
    });
    tube(B, P['thigh' + s], P['shin' + s], {
      a: map['thigh' + s], b: map['shin' + s], prev: map.hips, radial: Q.rad + 2, steps: Q.steps + 1, pscale: PS,
      profile: t => {
        const r = (.062 - .016 * t) * limb * H;
        const clothed = t < pantThigh;
        const k = clothed ? THREE.MathUtils.lerp(1, garment.bottom.taper == null ? 1 : garment.bottom.taper, t) : 1;
        return { rx: r * k, rz: r * k };
      },
      region: t => (t < pantThigh ? PA : SK), palette, capA: true
    });
    tube(B, P['shin' + s], P['foot' + s], {
      a: map['shin' + s], b: map['foot' + s], prev: map['thigh' + s], radial: Q.rad + 2, steps: Q.steps + 1, pscale: PS,
      profile: t => {
        const r = (.048 - .016 * t) * limb * H;
        const clothed = t < pantShin;
        const tap = garment.bottom.taper == null ? 1 : garment.bottom.taper;
        const k = clothed ? THREE.MathUtils.lerp(tap, .88, t) : 1;
        return { rx: r * k, rz: r * k };
      },
      region: t => (t >= bootFrom ? SO : (t < pantShin ? PA : SK)), palette
    });
    tube(B, P['foot' + s], P['toe' + s], {
      a: map['foot' + s], b: null, prev: map['shin' + s], radial: Q.rad, steps: Math.max(3, Q.steps - 1), pscale: PS,
      profile: t => ({ rx: (SHOE.rx + .004 * t) * limb * H, rz: (SHOE.rz + .006 * t) * limb * H }),
      region: () => SHOE.reg, palette, capA: true, capB: true
    });

    const fp = P['foot' + s], tp = P['toe' + s], soleY = fp[1] * .34;
    const rigid = { a: map['foot' + s], b: null, prev: null, palette, pscale: PS };
    if (SHOE.sole > 0){
      tube(B, [fp[0], soleY, fp[2] - .036 * H], [fp[0], soleY * .92, tp[2] + .020 * H],
        Object.assign({ radial: 10, steps: 4, capA: true, capB: true,
          profile: () => ({ rx: (SHOE.rx + .006) * limb * H, rz: SHOE.sole * H }),
          region: () => SL }, rigid));
    }
    if (FW === 'dress'){
      tube(B, [fp[0], soleY, fp[2] - .024 * H], [fp[0], soleY - .022 * H, fp[2] - .024 * H],
        Object.assign({ radial: 8, steps: 2, capB: true,
          profile: () => ({ rx: .022 * limb * H, rz: .020 * limb * H }),
          region: () => SX }, rigid));
    }
    if (FW === 'sandals'){
      [.22, .60].forEach(k => {
        const zc = fp[2] + (tp[2] - fp[2]) * k, yc = fp[1] + (tp[1] - fp[1]) * k;
        const top = yc + SHOE.rz * limb * H * .55, w = .036 * limb * H;
        tube(B, [fp[0] - w, top, zc], [fp[0] + w, top, zc],
          Object.assign({ radial: 8, steps: 2, capA: true, capB: true,
            profile: () => ({ rx: .0085 * H, rz: .0085 * H }),
            region: () => SX }, rigid));
      });
    }
    if (FW === 'boots'){
      const sh = P['shin' + s];
      const r = (.048 - .016 * bootFrom) * limb * H;
      tube(B, mix3(sh, fp, bootFrom - .05), mix3(sh, fp, bootFrom + .12), {
        a: map['shin' + s], b: null, prev: null, radial: 12, steps: 3, pscale: PS,
        profile: t => { const q = r * (1.32 - .10 * t); return { rx: q, rz: q }; },
        region: () => SX, palette, capA: true
      });
    }
  });

  const geo = B.geometry();
  const cloth = map0 => new THREE.MeshStandardMaterial({
    vertexColors: true, skinning: true, roughness: map0 ? .93 : .78,
    metalness: 0, map: map0 || null
  });
  const mats = [cloth(null), cloth(patternTexture(cfg.topPattern, { spacing: cfg.patternSpacing, angle: cfg.patternAngle, fg: cfg.patternFg, alt: cfg.patternAlt })), cloth(patternTexture(cfg.legPattern, { spacing: cfg.patternSpacing, angle: cfg.patternAngle, fg: cfg.patternFg, alt: cfg.patternAlt }))];
  mats[0].roughness = .74;
  const mesh = new THREE.SkinnedMesh(geo, mats);
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;

  const group = new THREE.Group();
  group.add(root); group.add(mesh);
  group.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  mesh.bind(skeleton);

  // sit the feet exactly on the floor whatever the proportions are
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  group.position.y = -bb.min.y;
  const size = bb.max.y - bb.min.y;

  // ---------- face + hair, parented to the head bone ----------
  const headBone = bones[map.head];
  const face = new THREE.Group(); headBone.add(face);
  const solid = (c, rough) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c).convertSRGBToLinear(), roughness: rough === undefined ? .6 : rough });

  const eyes = [], eyeRigs = [], upperLids = [], lowerLids = [], brows = [];
  // A lid is a hemispherical shell: it hides whatever half of the eye its axis
  // points into. Aiming that axis is how the lid rests, blinks and emotes. The
  // resting upper lid covers the top ~22% of the eye, which is what stops the
  // face from staring; a shallow lower lid closes the socket from beneath.
  const LID_SHUT = 1.15, LOW_SHUT = .36;
  const lidAxis = (th, low) => low ? V(0, -Math.cos(th), -Math.sin(th))
                                   : V(0, Math.cos(th), Math.sin(th));
  const aimLid = (m, th, low) => m.quaternion.setFromUnitVectors(V(0, 1, 0), lidAxis(th, low));

  [-1, 1].forEach(sx => {
    // the eyeball's flattening lives on the rig, so lids rotate in true spherical
    // space and only get squashed afterwards
    const asy = Number(cfg.asymmetry) || 0;
    const asySign = sx;
    const eyeSz = (Number(cfg.eyeSize) || 1) * (1.14 - age * .24) * (1 + asy * .08 * asySign);
    const eyeSp = Number(cfg.eyeSpacing) || 1;
    const eyeLift = Number(cfg.eyeY) || 0;
    const eyeRoll = Number(cfg.eyeTilt) || 0;
    const rig = new THREE.Group();
    rig.position.set(sx * hr * .40 * eyeSp, hry * (.10 + eyeLift + asy * .04 * asySign), hrz * .82);
    rig.scale.set(eyeSz, eyeSz, .62 * eyeSz);
    rig.rotation.z = sx * eyeRoll + asy * .08 * asySign;
    face.add(rig); eyeRigs.push(rig);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(hr * .30, 14, 12), solid('#fbfdff', .28));
    rig.add(eye); eyes.push(eye);

    const irisR = hr * .148 * (Number(cfg.irisSize) || 1);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(irisR, 12, 10), solid(cfg.irisColor || '#241b16', .35));
    iris.position.set(0, 0, hr * .21); iris.scale.set(1, 1, .8);
    iris.userData.iris = true; eye.add(iris);
    const spark = new THREE.Mesh(new THREE.SphereGeometry(hr * .045, 8, 6), solid('#ffffff', .1));
    spark.position.set(hr * .05, hr * .05, hr * .12); iris.add(spark);

    const lidMat = solid(cfg.skin, .8); lidMat.side = THREE.DoubleSide;
    const up = new THREE.Mesh(
      new THREE.SphereGeometry(hr * .322, 16, 9, 0, Math.PI * 2, 0, Math.PI * .54), lidMat);
    aimLid(up, -.58, false); up.userData.lid = 'upper'; rig.add(up); upperLids.push(up);

    const low = new THREE.Mesh(
      new THREE.SphereGeometry(hr * .322, 16, 7, 0, Math.PI * 2, 0, Math.PI * .42), lidMat);
    aimLid(low, .80, true); low.userData.lid = 'lower'; rig.add(low); lowerLids.push(low);

    const bt = Number(cfg.browThickness) || 1;
    const bh = Number(cfg.browHeight) || 1;
    const brow = new THREE.Mesh(new THREE.BoxGeometry(hr * .40, hr * .075 * bt, hr * .10), solid(cfg.hairColor, .8));
    brow.position.set(sx * hr * .42 * (Number(cfg.eyeSpacing) || 1), hry * .38 * bh + asy * hry * .03 * asySign, hrz * .80);
    brow.rotation.z = sx * (Number(cfg.browTilt) || 0);
    brow.userData.browBaseY = brow.position.y;
    brow.userData.browBaseZ = brow.position.z;
    brow.userData.browBaseRoll = brow.rotation.z;
    face.add(brow); brows.push(brow);
  });

  const ns = (Number(cfg.noseSize) || 1) * (.92 + age * .18), nw = Number(cfg.noseWidth) || 1, np = Number(cfg.noseProjection) || 1;
  const nose = new THREE.Mesh(new THREE.SphereGeometry(hr * .13 * ns, 10, 8), solid(cfg.skin, .75));
  nose.position.set(0, -hry * .06, hrz * (.88 + .05 * np)); nose.scale.set(.8 * nw, .9 * ns, 1.1 * np); face.add(nose);

  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(hr * .30 * (Number(cfg.mouthWidth) || 1), hr * .055 * (Number(cfg.lipFullness) || 1), 8, 20, Math.PI),
    solid('#8a4a44', .55));
  mouth.position.set((Number(cfg.asymmetry) || 0) * hr * .04, -hry * .40, hrz * .76);
  mouth.scale.set(1, .75, .6); face.add(mouth);
  mouth.userData.restCurve = Number(cfg.mouthRest) || 0;

  if (age > .35){
    const wr = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.skin).convertSRGBToLinear().multiplyScalar(.78), roughness: .85 });
    const bags = age * .55;
    [-1, 1].forEach(sx => {
      const bag = new THREE.Mesh(new THREE.SphereGeometry(hr * .10, 8, 6), wr);
      bag.position.set(sx * hr * .40 * (Number(cfg.eyeSpacing) || 1), hry * (.02 - bags * .08), hrz * .78);
      bag.scale.set(1.1, .35, .5); face.add(bag);
    });
    if (age > .55){
      for (let i = 0; i < 3; i++){
        const line = new THREE.Mesh(new THREE.BoxGeometry(hr * .22, hr * .012, hr * .01), wr);
        line.position.set(0, -hry * (.28 + i * .05), hrz * .82);
        face.add(line);
      }
    }
  }

  // ---- ears ----
  // set slightly proud of the skull so they stay readable against the hair shell
  const earRigs = [];                       // index 0 = character's right, 1 = left
  if (cfg.ears !== 'none'){
    const big = cfg.ears === 'large' ? 1.34 : 1;
    const pointy = cfg.ears === 'pointed';
    const inner = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.skin).convertSRGBToLinear().multiplyScalar(.72), roughness: .75
    });
    [-1, 1].forEach(sx => {
      const ear = new THREE.Group();
      ear.position.set(sx * hr * (1.03 + (Number(cfg.asymmetry)||0) * .04 * sx), -hry * .04, -hrz * .12);
      ear.rotation.set(.06, sx * .26, sx * -.10);
      face.add(ear); earRigs.push(ear);

      const shell = new THREE.Mesh(new THREE.SphereGeometry(hr * .30 * big, 12, 10), solid(cfg.skin, .72));
      shell.scale.set(.44, pointy ? 1.16 : 1.02, .80);
      shell.castShadow = true; ear.add(shell);

      const bowl = new THREE.Mesh(new THREE.SphereGeometry(hr * .17 * big, 10, 8), inner);
      bowl.position.set(sx * hr * .05, hry * .01, -hrz * .015);
      bowl.scale.set(.34, .95, .72); ear.add(bowl);

      const lobe = new THREE.Mesh(new THREE.SphereGeometry(hr * .12 * big, 8, 7), solid(cfg.skin, .72));
      lobe.position.set(0, -hry * .22 * big, -hrz * .02);
      lobe.scale.set(.42, .85, .8); ear.add(lobe);

      if (pointy){
        const tip = new THREE.Mesh(new THREE.ConeGeometry(hr * .14 * big, hry * .50 * big, 8), solid(cfg.skin, .72));
        tip.position.set(sx * hr * .07, hry * .26 * big, -hrz * .06);
        tip.rotation.set(-.20, 0, sx * -.46);
        tip.scale.set(.46, 1, .86);
        tip.castShadow = true; ear.add(tip);
      }
    });
  }

  // ---- glasses ----
  const strut = (a, b, r, mat) => {
    const A = V(a[0], a[1], a[2]), Bv = V(b[0], b[1], b[2]);
    const d = Bv.clone().sub(A), L = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 6), mat);
    m.position.copy(A).addScaledVector(d, .5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
    m.castShadow = true; return m;
  };
  if (cfg.glasses !== 'none'){
    const G = cfg.glasses;
    const frame = solid(cfg.frameColor, .34); frame.metalness = .35;
    const dark = G === 'sun';
    const lensMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(dark ? '#1b2430' : '#cfe6f2').convertSRGBToLinear(),
      transparent: true, opacity: dark ? .86 : .20, roughness: .08, metalness: .1,
      side: THREE.DoubleSide
    });
    const rig = new THREE.Group(); rig.userData.glasses = true; face.add(rig);
    const ex = hr * .40, ey = hry * .10, ez = hrz * .94;
    const lr = hr * (dark ? .38 : .34);
    const wide = dark ? 1.18 : 1, tall = G === 'halfmoon' ? .58 : (dark ? .82 : .78);

    [-1, 1].forEach(sx => {
      if (G === 'rect'){
        const w = lr * 1.12, h = lr * tall;
        [[0, h, w * 2, .022], [0, -h, w * 2, .022], [-w, 0, .022, h * 2], [w, 0, .022, h * 2]]
          .forEach(([bx, by, bw, bh]) => {
            const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, hr * .045), frame);
            b.position.set(sx * ex + bx, ey + by, ez); b.castShadow = true; rig.add(b);
          });
      } else {
        const arc = G === 'halfmoon' ? Math.PI : Math.PI * 2;
        const rim = new THREE.Mesh(new THREE.TorusGeometry(lr, hr * .030, 7, 22, arc), frame);
        rim.position.set(sx * ex, ey, ez);
        rim.scale.set(wide, tall / .78, 1);
        if (G === 'halfmoon') rim.rotation.z = Math.PI;
        rim.castShadow = true; rig.add(rim);
      }
      const lens = new THREE.Mesh(new THREE.CircleGeometry(lr * .97, 20), lensMat);
      lens.position.set(sx * ex, ey - (G === 'halfmoon' ? lr * .18 : 0), ez - hr * .012);
      lens.scale.set(wide, tall / .78 * (G === 'halfmoon' ? .62 : 1), 1);
      rig.add(lens);
      // temple arm back to the ear
      rig.add(strut([sx * (ex + lr * wide), ey + hry * .02, ez - hr * .02],
                    [sx * hr * 1.00, ey + hry * .06, -hrz * .28], hr * .022, frame));
    });
    const bw = (ex - lr * wide) * 2;
    if (bw > 0) rig.add(strut([-ex + lr * wide, ey + lr * .30, ez], [ex - lr * wide, ey + lr * .30, ez], hr * .026, frame));
  }

  // ---- face marks ----
  // Everything here is placed by sampling headSurface, so freckles, moles and
  // scars follow the chosen skull instead of floating off a square jaw.
  const onSkin = (ph, th, lift) => {
    const R = [hr, hry, hrz];
    const p0 = headSurface(HS, ph, th, R, true);
    const p1 = headSurface(HS, ph + .02, th, R, true);
    const p2 = headSurface(HS, ph, th + .02, R, true);
    const P0 = V(p0[0], p0[1], p0[2]);
    const n = new THREE.Vector3().crossVectors(
      V(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]),
      V(p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2])).normalize();
    if (n.dot(P0) < 0) n.negate();
    return { pos: P0.addScaledVector(n, lift || 0), normal: n };
  };
  const facePatch = (ph, th, r, mat, sy) => {
    const sp = onSkin(ph, th, hr * .008);
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 8), mat);
    m.position.copy(sp.pos);
    m.quaternion.setFromUnitVectors(V(0, 0, 1), sp.normal);
    if (sy) m.scale.y = sy;
    m.userData.mark = true; face.add(m); return m;
  };
  const eyeAt = sx => ({ x: sx * hr * .40, y: hry * .10, r: hr * .30 });
  const tint = k => new THREE.Color(cfg.skin).convertSRGBToLinear().multiplyScalar(k);

  if (cfg.freckles !== 'none'){
    const N = cfg.freckles === 'heavy' ? 30 : 16;
    const fm = new THREE.MeshStandardMaterial({ color: tint(.62), roughness: .82 });
    const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    for (let i = 0; i < N; i++){
      const side = i % 2 ? 1 : -1;
      const bridge = i < (cfg.freckles === 'heavy' ? 6 : 3);
      const u = hash(i), v = hash(i + 91);
      const ph = Math.PI / 2 - side * (bridge ? .015 + u * .075 : .18 + u * .52);
      const ny = bridge ? .02 + v * .11 : -.44 + v * .25;
      const th = Math.acos(THREE.MathUtils.clamp(ny, -1, 1));
      const sp = onSkin(ph, th, 0);
      // never sit a freckle on an eye
      const e = eyeAt(Math.sign(sp.pos.x) || 1);
      if (Math.hypot(sp.pos.x - e.x, sp.pos.y - e.y) < e.r + hr * .035) continue;
      facePatch(ph, th, hr * (.020 + u * .012), fm);
    }
  }

  if (cfg.mark === 'mole' || cfg.mark === 'both'){
    const mm = new THREE.MeshStandardMaterial({ color: tint(.40), roughness: .7 });
    const ph = Math.PI / 2 - .40, th = Math.acos(-.16);
    const sp = onSkin(ph, th, 0);
    const m = new THREE.Mesh(new THREE.SphereGeometry(hr * .042, 10, 8), mm);
    m.position.copy(sp.pos).addScaledVector(sp.normal, hr * .012);
    m.scale.set(1, 1, .55);
    m.quaternion.setFromUnitVectors(V(0, 0, 1), sp.normal);
    m.castShadow = true; m.userData.mark = true; face.add(m);
  }

  if (cfg.mark === 'scar' || cfg.mark === 'both'){
    const scarMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.skin).convertSRGBToLinear()
        .lerp(new THREE.Color('#f7ded4').convertSRGBToLinear(), .55),
      roughness: .55, side: THREE.DoubleSide });
    // the lateral bulge swings the scar around the outside of the eye socket
    const nyAt = t => THREE.MathUtils.lerp(.58, -.34, t);
    const phAt = t => {
      const ny = nyAt(t);
      const avoid = .74 * Math.exp(-Math.pow((ny - .10) / .30, 2));
      return Math.PI / 2 + .34 + .16 * t + avoid;
    };
    const N = 14, pos = [], idx = [];
    for (let i = 0; i <= N; i++){
      const t = i / N, t2 = Math.min(1, t + .04);
      const a = onSkin(phAt(t), Math.acos(nyAt(t)), hr * .008);
      const b = onSkin(phAt(t2), Math.acos(nyAt(t2)), hr * .008);
      const tan = b.pos.clone().sub(a.pos).normalize();
      const bin = new THREE.Vector3().crossVectors(tan, a.normal).normalize();
      const w = hr * .026 * (.28 + .72 * Math.sin(Math.PI * t));
      pos.push(...a.pos.clone().addScaledVector(bin, w).toArray());
      pos.push(...a.pos.clone().addScaledVector(bin, -w).toArray());
    }
    for (let i = 0; i < N; i++){
      const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const scarMesh = new THREE.Mesh(g, scarMat);
    scarMesh.userData.mark = true; face.add(scarMesh);
  }

  if (cfg.eyepatch !== 'none'){
    const sx = cfg.eyepatch === 'left' ? 1 : -1;
    const leather = solid('#1d1b22', .68);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(hr * .44, 14, 12), leather);
    dome.position.set(sx * hr * .43, hry * .10, hrz * .78);
    dome.scale.set(1, 1.08, .44);
    dome.castShadow = true; dome.userData.mark = true; face.add(dome);
    // strap: a ring tipped so it drops to the patched eye on one side and rides
    // above the open eye on the other
    const strapY = (EYE_TOP + .10) * hry, Rx = hr * 1.05, Rz = hrz * 1.05;
    const alpha = sx * Math.asin(THREE.MathUtils.clamp((hry * .10 - strapY) / Rx, -1, 1));
    const rig = new THREE.Group();
    rig.position.y = strapY; rig.rotation.z = alpha; face.add(rig);
    const band = new THREE.Mesh(new THREE.TorusGeometry(1, hr * .030 / Rx, 6, 30), leather);
    band.rotation.x = Math.PI / 2; band.scale.set(Rx, Rz, 1);
    band.castShadow = true; band.userData.mark = true; rig.add(band);
  }

  // ---- facial hair ----
  // Same surface sampling as the other marks: flat decals for stubble, small
  // tufts lifted along the normal where the growth needs volume.
  if (cfg.facialHair !== 'none'){
    const FH = cfg.facialHair;
    const bm = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.beardColor || cfg.hairColor).convertSRGBToLinear(), roughness: .9 });
    const hh = i => { const x = Math.sin(i * 217.3 + 71.9) * 24634.6345; return x - Math.floor(x); };
    const tuft = (ph, th, r, lift) => {
      const sp = onSkin(ph, th, 0);
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), bm);
      m.position.copy(sp.pos).addScaledVector(sp.normal, lift);
      m.quaternion.setFromUnitVectors(V(0, 0, 1), sp.normal);
      m.scale.set(1, 1, .60);
      m.castShadow = true; m.userData.mark = true; face.add(m);
    };
    // a row of tufts sweeping between two points, mirrored on both sides
    const row = (nyA, nyB, uA, uB, n, r, lift) => {
      for (let i = 0; i < n; i++){
        const t = n === 1 ? 0 : i / (n - 1);
        const th = Math.acos(THREE.MathUtils.clamp(THREE.MathUtils.lerp(nyA, nyB, t), -1, 1));
        [-1, 1].forEach(sx => tuft(Math.PI / 2 - sx * THREE.MathUtils.lerp(uA, uB, t), th, r, lift));
      }
    };
    if (FH === 'stubble'){
      for (let i = 0; i < 56; i++){
        const sx = i % 2 ? 1 : -1, u = hh(i), v = hh(i + 57);
        const th = Math.acos(THREE.MathUtils.clamp(-.28 - v * .64, -1, 1));
        facePatch(Math.PI / 2 - sx * (.03 + u * .70), th, hr * .021, bm);
      }
    }
    if (FH !== 'stubble') row(-.19, -.27, .05, .29, 4, hr * .068, hr * .012);   // moustache
    if (FH === 'goatee' || FH === 'beard') row(-.60, -.86, .04, .20, 4, hr * .084, hr * .014);
    if (FH === 'beard'){
      row(-.38, -.94, .70, .15, 7, hr * .094, hr * .016);
      row(-.50, -.99, .60, .11, 6, hr * .078, hr * .013);
    }
  }

  // ---- hair ----
  // The hairline is defined as a HEIGHT, not an angle: hair may never fall below
  // a given y in front, so no volume or style setting can put it over the eyes.
  // The line eases from the forehead down past the ears to the nape.
  const hair = new THREE.Group(); headBone.add(hair);
  const hairMat = solid(cfg.hairColor, .88); hairMat.side = THREE.DoubleSide;
  const vol = cfg.hairVolume, len = cfg.hairLength;

  const FRONT = Math.max(SAFE, { high: .62, even: .52, low: .45 }[cfg.hairline] || .52);
  const SIDE = cfg.ears === 'none' ? -.12 : -.02;   // clear the ear when there is one
  const ease = x => { const a = x * x * (3 - 2 * x); return a * a * (3 - 2 * a); };

  // Hairline height for a given azimuth (a = PI/2 faces forward, -PI/2 back).
  // Flat at FRONT across the whole forehead, then eases past the ear to the nape,
  // so no azimuth can ever bring the edge down in front of an eye.
  // o may override front / side / back, which is how hat brims and hoods
  // get their own edge heights while reusing the same solver
  function lineAt(a, o){
    o = o || {};
    const F = o.front === undefined ? FRONT : o.front;
    const D = o.side === undefined ? SIDE : o.side;
    const K = o.back === undefined ? -.42 : o.back;
    const f = Math.sin(a);
    if (f >= 0) return THREE.MathUtils.lerp(D, F, ease(Math.min(1, f / .30)));
    return THREE.MathUtils.lerp(D, K, ease(Math.min(1, -f / .85)));
  }
  // polar angle that lands exactly on that edge, for a shell of the given scale
  const thetaAt = (a, scale, o) =>
    Math.acos(THREE.MathUtils.clamp(lineAt(a, o) / scale, -1, 1));
  const azimuthOf = m => Math.atan2(m.position.z / hrz, m.position.x / hr);
  // never let a clump hang below the line it sits on
  const clampToLine = (m, halfY, o) => {
    m.position.y = Math.max(m.position.y, lineAt(azimuthOf(m), o) * hry + halfY);
    return m;
  };

  function hairShell(o){
    const seg = o.seg || Q.hairSeg || 28, rows = o.rows || 12, v0 = o.v0 || 0;
    const out = o.out, inn = o.inn || 1.004;
    const a0 = o.a0 !== undefined ? o.a0 : 0;
    const aSpan = o.aSpan !== undefined ? o.aSpan : Math.PI * 2;
    const pos = [], idx = [], grid = [];
    const ring = (v, scale) => {
      const row = [];
      for (let i = 0; i <= seg; i++){
        const a = a0 + i / seg * aSpan, th = v * thetaAt(a, scale, o);
        let sc = scale;
        if (o.wave) sc *= 1 + o.wave * .5 * (1 + Math.sin(a * 7) * Math.sin(th * 5.5));
        if (o.partA !== undefined){
          let d = Math.abs(Math.atan2(Math.sin(a - o.partA), Math.cos(a - o.partA)));
          const w = o.partW || .16;
          if (d < w) sc *= 1 - (o.partD || .08) * (1 - d / w) * v;
        }
        const st = Math.sin(th), ct = Math.cos(th);
        const e = 1 - (HS.sq || 0) * .45, ca = Math.cos(a), sa = Math.sin(a);
        const qx = Math.sign(ca) * Math.pow(Math.abs(ca), e);
        const qz = Math.sign(sa) * Math.pow(Math.abs(sa), e);
        pos.push(st * qx * hr * sc, ct * hry * sc, st * qz * hrz * sc);
        row.push(pos.length / 3 - 1);
      }
      return row;
    };
    const vAt = r => v0 + (1 - v0) * (r / rows);
    for (let r = 0; r <= rows; r++) grid.push(ring(vAt(r), out));
    for (let r = rows - 1; r >= 0; r--) grid.push(ring(vAt(r), inn));
    for (let r = 0; r < grid.length - 1; r++)
      for (let i = 0; i < seg; i++)
        idx.push(grid[r][i], grid[r][i + 1], grid[r + 1][i],
                 grid[r][i + 1], grid[r + 1][i + 1], grid[r + 1][i]);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }

  const cap = (out, wave, back, extra) => {
    const m = new THREE.Mesh(hairShell(Object.assign({ out: out * vol, wave, back }, extra || {})), hairMat);
    m.castShadow = true; hair.add(m); return m;
  };
  const lump = (rad, x, y, z, sx, sy, sz) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(rad, 10, 8), hairMat);
    m.position.set(x, y, z); m.scale.set(sx || 1, sy || 1, sz || 1);
    m.castShadow = true; hair.add(m); return m;
  };

  const hp = resolveHair(cfg);
  const tex = hp.texture || 'straight';
  const OUT = (tex === 'curly' || tex === 'coily') ? 1.12 : 1.055;
  const waveAmt = ({ straight:0, wavy:.06, curly:.04, coily:.03, spiky:0 }[tex] || 0);
  const bald = hp.back === 'bald';
  const mohawk = hp.back === 'mohawk';
  const partA = hp.part === 'center' ? Math.PI / 2
    : hp.part === 'left' ? Math.PI / 2 - .40
    : hp.part === 'right' ? Math.PI / 2 + .40
    : undefined;
  const napeK = hp.back === 'long' || hp.back === 'braid' ? (-.50 - .10 * len)
    : hp.back === 'loose' ? (-.42 - .06 * Math.max(0, len - 1))
    : -.42;
  const partOpts = partA === undefined ? {} : { partA, partW: .18, partD: .09 };
  const nLock = Math.max(4, Math.round((Q.hairSeg || 28) / 5));
  const tubeOk = typeof THREE.CatmullRomCurve3 === 'function' && typeof THREE.TubeGeometry === 'function';

  const onScalp = (a, t, scale, o) => {
    const th = Math.max(.02, t) * thetaAt(a, scale, o);
    const st = Math.sin(th), ct = Math.cos(th);
    const e = 1 - (HS.sq || 0) * .45, ca = Math.cos(a), sa = Math.sin(a);
    const qx = Math.sign(ca) * Math.pow(Math.abs(ca), e);
    const qz = Math.sign(sa) * Math.pow(Math.abs(sa), e);
    return V(st * qx * hr * scale, ct * hry * scale, st * qz * hrz * scale);
  };
  const scalpN = (a, t, scale, o) => {
    const p = onScalp(a, t, scale, o);
    const n = new THREE.Vector3().crossVectors(
      onScalp(a + .03, t, scale, o).sub(p.clone()),
      onScalp(a, Math.min(1, t + .04), scale, o).sub(p.clone())).normalize();
    if (n.dot(p) < 0) n.negate();
    return { pos: p, normal: n };
  };
  const pathPoints = (p0, p2, kind, phase) => {
    const dir = p2.clone().sub(p0);
    const ln = dir.length();
    if (ln < 1e-4) return [p0.clone(), p2.clone()];
    const axis = dir.clone().normalize();
    const ref = Math.abs(axis.y) < .9 ? V(0, 1, 0) : V(1, 0, 0);
    const s = new THREE.Vector3().crossVectors(ref, axis).normalize();
    const f = new THREE.Vector3().crossVectors(axis, s).normalize();
    const curly = kind === 'curly' || kind === 'coily';
    const turns = kind === 'coily' ? 3.4 : kind === 'curly' ? 2.1 : kind === 'wavy' ? 1.2 : 0;
    const amp = curly ? ln * (kind === 'coily' ? .16 : .12) : kind === 'wavy' ? ln * .11 : 0;
    const n = Math.max(6, Math.round((Q.hairSeg || 28) / 3) + (curly ? 5 : 0));
    const pts = [];
    for (let i = 0; i <= n; i++){
      const t = i / n;
      const p = p0.clone().addScaledVector(axis, t * ln);
      p.y -= t * t * ln * .07;
      if (turns){
        const ang = t * turns * Math.PI * 2 + (phase || 0);
        const fade = Math.sin(Math.max(.02, t) * Math.PI);
        p.addScaledVector(s, Math.cos(ang) * amp * fade);
        p.addScaledVector(f, Math.sin(ang) * amp * fade);
      }
      if (p.z > hrz * .42) p.y = Math.max(p.y, SAFE * hry + hr * .012);
      pts.push(p);
    }
    return pts;
  };
  const addStrand = (p0, p2, radius, kind, phase) => {
    const pts = pathPoints(p0, p2, kind || tex, phase);
    let mesh;
    if (tubeOk && pts.length > 2){
      mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length, radius, 5, false), hairMat);
    } else {
      const dir = p2.clone().sub(p0);
      const h = Math.max(dir.length(), 1e-4);
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * .62, h, 6), hairMat);
      mesh.position.copy(p0).addScaledVector(dir, .5);
      mesh.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
    }
    mesh.castShadow = true; hair.add(mesh); return mesh;
  };
  const addCoil = (a, t, scale, o) => {
    const sn = scalpN(a, t, scale, o);
    const r = hr * (tex === 'coily' ? .055 : .078) * vol;
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, r * .42, 6, 10), hairMat);
    m.position.copy(sn.pos).addScaledVector(sn.normal, r * .55);
    m.quaternion.setFromUnitVectors(V(0, 0, 1), sn.normal);
    m.castShadow = true; hair.add(m); return m;
  };
  const addSpike = (a, t, scale, o, hMul) => {
    const sn = scalpN(a, t, scale, o);
    const h = hry * (.38 + .22 * (hMul || 1)) * vol;
    const sp = new THREE.Mesh(new THREE.ConeGeometry(hr * .11 * vol, h, 6), hairMat);
    sp.position.copy(sn.pos).addScaledVector(sn.normal, h * .45);
    sp.quaternion.setFromUnitVectors(V(0, 1, 0), sn.normal);
    sp.castShadow = true; hair.add(sp); return sp;
  };
  const addBraid = (p0, p2, rad) => {
    const dir = p2.clone().sub(p0);
    const ln = dir.length();
    const axis = dir.clone().normalize();
    const ref = Math.abs(axis.y) < .9 ? V(0, 1, 0) : V(1, 0, 0);
    const s = new THREE.Vector3().crossVectors(ref, axis).normalize();
    const f = new THREE.Vector3().crossVectors(axis, s).normalize();
    const turns = 4.2 * Math.max(.75, ln / (hry * 1.15));
    const n = Math.max(10, Math.round(turns * 6));
    for (let k = 0; k < 3; k++){
      const pts = [];
      for (let i = 0; i <= n; i++){
        const t = i / n;
        const ang = t * turns * Math.PI * 2 + k * Math.PI * 2 / 3;
        const spread = rad * 1.12 * (1 - t * .42);
        const p = p0.clone().addScaledVector(axis, t * ln);
        p.addScaledVector(s, Math.cos(ang) * spread);
        p.addScaledVector(f, Math.sin(ang) * spread);
        pts.push(p);
      }
      if (!tubeOk) continue;
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, rad * .52, 5, false), hairMat);
      m.castShadow = true; hair.add(m);
    }
    if (!tubeOk){
      const h = Math.max(ln, 1e-4);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * .45, h, 8), hairMat);
      m.position.copy(p0).addScaledVector(dir, .5);
      m.quaternion.setFromUnitVectors(V(0, 1, 0), axis);
      m.castShadow = true; hair.add(m);
    }
  };
  const fringeShell = (a0, aSpan) => {
    const m = new THREE.Mesh(hairShell({
      out: OUT * vol * 1.03, inn: Math.max(1.01, OUT * vol * .985),
      a0, aSpan, seg: 12, rows: 5, v0: .52, wave: waveAmt * 1.15,
      front: Math.max(SAFE + .03, FRONT - .10),
      side: FRONT - .02, back: FRONT
    }), hairMat);
    m.castShadow = true; hair.add(m); return m;
  };

  // Layers compose independently: cap (with part groove) + texture overlay +
  // fringe + back. A curly ponytail with curtain bangs is three layers, not a
  // preset lump. Bald still allows a fringe. Hair never drops below SAFE in front.
  if (!bald && !mohawk){
    cap(OUT, waveAmt, napeK, partOpts);
  }
  if (mohawk){
    cap(1.012);
    const ridgeOut = 1.012 * vol;
    const nSpike = Math.max(6, nLock + 2);
    for (let i = 0; i < nSpike; i++){
      const t = i / (nSpike - 1);
      const th = THREE.MathUtils.lerp(thetaAt(Math.PI / 2, ridgeOut) * .70, -1.45, t);
      const h = hry * (.5 + .38 * Math.sin(t * Math.PI)) * vol;
      const sp = new THREE.Mesh(new THREE.ConeGeometry(hr * .13 * vol, h, 6), hairMat);
      const ny = Math.cos(th), nz = Math.sin(th);
      sp.position.set(0, ny * hry * ridgeOut + ny * h * .45, nz * hrz * ridgeOut + nz * h * .45);
      sp.rotation.x = th; sp.castShadow = true; hair.add(sp);
    }
  }
  if (!bald && (tex === 'curly' || tex === 'coily')){
    const nCurl = tex === 'coily' ? Math.round((Q.hairSeg || 28) * .85) : Math.round((Q.hairSeg || 28) * .55);
    const o = { back: napeK };
    for (let i = 0; i < nCurl; i++){
      const a = i / nCurl * Math.PI * 2 + .17;
      if (partA !== undefined){
        let d = Math.abs(Math.atan2(Math.sin(a - partA), Math.cos(a - partA)));
        if (d < .12) continue;
      }
      addCoil(a, .22 + ((i * 11) % 7) / 7 * .62, OUT * vol, o);
    }
  }
  if (!bald && tex === 'spiky' && !mohawk){
    const nSp = Math.max(8, nLock + 3);
    for (let i = 0; i < nSp; i++){
      const a = i / nSp * Math.PI * 2 + .1;
      addSpike(a, .18 + (i % 3) * .22, OUT * vol, { back: napeK }, .8 + (i % 3) * .18);
    }
  }

  if (hp.fringe === 'straight') fringeShell(Math.PI / 2 - .95, 1.90);
  if (hp.fringe === 'curtain'){
    fringeShell(Math.PI / 2 - .98, .62);
    fringeShell(Math.PI / 2 + .36, .62);
  }
  if (hp.fringe === 'straight' || hp.fringe === 'curtain'){
    const n = hp.fringe === 'curtain' ? Math.max(4, nLock - 1) : nLock;
    for (let i = 0; i < n; i++){
      if (hp.fringe === 'curtain' && i === Math.floor((n - 1) / 2)) continue;
      const a = Math.PI / 2 + (i - (n - 1) / 2) * (hp.fringe === 'curtain' ? .30 : .26);
      const p0 = onScalp(a, .82, OUT * vol);
      const p2 = p0.clone();
      p2.y = Math.max(SAFE * hry + hr * .02, p0.y - hry * .16);
      p2.z += hrz * .06;
      addStrand(p0, p2, hr * .028 * vol, tex, i * .7);
    }
  }
  const sweepDir = hp.part === 'right' ? 1 : hp.part === 'left' ? -1
    : hp.fringe === 'side' ? -1 : 0;
  if (sweepDir){
    const n = Math.max(3, nLock - 1);
    for (let i = 0; i < n; i++){
      const a0 = Math.PI / 2 - sweepDir * (.18 + i * .10);
      const p0 = onScalp(a0, .78, OUT * vol);
      const p2 = onScalp(a0 + sweepDir * (.55 + i * .08), .92, OUT * vol);
      p2.y = Math.max(SAFE * hry + hr * .02, p2.y - hry * .04);
      addStrand(p0, p2, hr * .032 * vol, tex, i);
    }
  }
  if (hp.part === 'center'){
    [-1, 1].forEach((sx, k) => {
      const p0 = onScalp(Math.PI / 2, .70, OUT * vol);
      const p2 = onScalp(Math.PI / 2 + sx * .55, .90, OUT * vol);
      p2.y = Math.max(SAFE * hry + hr * .02, p2.y);
      addStrand(p0, p2, hr * .030 * vol, tex, k);
    });
  }

  if (hp.back === 'long'){
    const fall = new THREE.Mesh(hairShell({
      out: OUT * vol * 1.03, inn: 1.004, a0: Math.PI * .62, aSpan: Math.PI * .76,
      front: 1, side: SIDE - .04, back: -.08 - .68 * len,
      rows: 8, seg: Math.max(12, Math.round((Q.hairSeg || 28) * .55)),
      wave: waveAmt, v0: .32
    }), hairMat);
    fall.castShadow = true; hair.add(fall);
    for (let i = 0; i < nLock; i++){
      const a = Math.PI + (i - (nLock - 1) / 2) * .20;
      const p0 = onScalp(a, .88, OUT * vol, { back: -.55 });
      const p2 = p0.clone();
      p2.y -= hry * (.55 + .95 * len);
      p2.z -= hrz * .10;
      addStrand(p0, p2, hr * .036 * vol, tex, i * 1.1);
    }
  }
  if (hp.back === 'braid'){
    const p0 = onScalp(-Math.PI / 2, .62, OUT * vol, { back: -.48 });
    const p2 = p0.clone();
    p2.y -= hry * (1.05 * len + .25);
    p2.z -= hrz * .12;
    addBraid(p0, p2, hr * .07 * vol);
  }
  if (hp.back === 'ponytail'){
    const g = scalpN(-Math.PI / 2, .58, OUT * vol, { back: -.45 });
    lump(hr * .16 * vol, g.pos.x, g.pos.y, g.pos.z, 1.15, .85, 1.05);
    const n = Math.max(3, nLock - 1);
    for (let i = 0; i < n; i++){
      const p0 = g.pos.clone().addScaledVector(g.normal, hr * .04);
      p0.x += (i - (n - 1) / 2) * hr * .04;
      const p2 = p0.clone();
      p2.y -= hry * (1.05 * len + .15);
      p2.z -= hrz * (.18 + .08 * len);
      addStrand(p0, p2, hr * .032 * vol, tex, i * 1.3);
    }
  }
  if (hp.back === 'pigtails'){
    [-1, 1].forEach((sx, k) => {
        const g = scalpN(sx * (Math.PI - .85), .55, OUT * vol, { back: -.35 });
      lump(hr * .14 * vol, g.pos.x, g.pos.y, g.pos.z, 1.1, .9, 1);
      const n = Math.max(3, nLock - 2);
      for (let i = 0; i < n; i++){
        const p0 = g.pos.clone().addScaledVector(g.normal, hr * .03);
        const p2 = p0.clone();
        p2.y -= hry * (.85 * len + .12);
        p2.x += sx * hr * (.22 + .18 * len);
        p2.z -= hrz * .06;
        addStrand(p0, p2, hr * .028 * vol, tex, i + k * 2);
      }
    });
  }
  if (hp.back === 'bun'){
    const g = scalpN(-Math.PI / 2, .28, OUT * vol, { back: -.32 });
    const bunR = hr * .28 * vol;
    const torus = new THREE.Mesh(new THREE.TorusGeometry(bunR, bunR * .46, 8, 16), hairMat);
    torus.position.copy(g.pos).addScaledVector(g.normal, bunR * .35);
    torus.quaternion.setFromUnitVectors(V(0, 0, 1), g.normal);
    torus.castShadow = true; hair.add(torus);
    if (tex === 'curly' || tex === 'coily'){
      for (let i = 0; i < 6; i++) addCoil(-Math.PI / 2 + (i - 2.5) * .12, .22 + (i % 3) * .08, OUT * vol, { back: -.32 });
    }
  }

  // ---- headwear ----
  // Rigid geometry on the head bone, sized to clear whatever hair is underneath.
  // Every brim is horizontal and every edge sits above the brow line, so no hat
  // can occlude the eyes.
  if (cfg.headwear !== 'none'){
    const hat = new THREE.Group(); headBone.add(hat);
    const hatMat = solid(cfg.hatColor, .84); hatMat.side = THREE.DoubleSide;
    const trimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.hatColor).convertSRGBToLinear().multiplyScalar(.60),
      roughness: .88, side: THREE.DoubleSide
    });
    // clear the hair shell, whatever volume it is set to
    const over = Math.max(1.14, OUT * vol + .07);
    const BRIM = Math.max(SAFE, .44);        // horizontal, safely above the eyes

    const crown = (o, mat) => {
      const m = new THREE.Mesh(hairShell(Object.assign({ seg: 26, rows: 10 }, o)), mat || hatMat);
      m.castShadow = true; hat.add(m); return m;
    };
    const disc = (rx, rz, thick, y, half, mat) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, thick, 30, 1, false,
        half ? -Math.PI / 2 : 0, half ? Math.PI : Math.PI * 2), mat || hatMat);
      m.scale.set(rx, 1, rz); m.position.y = y;
      m.castShadow = true; hat.add(m); return m;
    };
    const ring = (rx, rz, tube, y, mat) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(1, tube, 8, 26), mat || trimMat);
      m.rotation.x = Math.PI / 2; m.scale.set(rx, rz, 1); m.position.y = y;
      m.castShadow = true; hat.add(m); return m;
    };

    const HW = cfg.headwear;
    if (HW === 'cap'){
      crown({ out: over * 1.03, front: .46, side: .02, back: -.26 });
      disc(hr * over * 1.10, hrz * over * 1.60, hry * .045, hry * BRIM, true);
      const btn = new THREE.Mesh(new THREE.SphereGeometry(hr * .10, 10, 8), trimMat);
      btn.position.y = hry * over * 1.05; hat.add(btn);
    }
    if (HW === 'beanie'){
      crown({ out: over * 1.06, front: .46, side: -.26, back: -.40 });
      crown({ out: over * 1.11, inn: over * 1.02, v0: .80, front: .46, side: -.26, back: -.40 }, trimMat);
      const pom = new THREE.Mesh(new THREE.SphereGeometry(hr * .26, 12, 10), trimMat);
      pom.position.y = hry * over * 1.14; hat.add(pom);
    }
    if (HW === 'widebrim'){
      crown({ out: over * 1.02, front: .50, side: .16, back: .02 });
      disc(hr * over * 2.05, hrz * over * 2.05, hry * .05, hry * BRIM);
      ring(hr * over * 1.06, hrz * over * 1.06, hry * .055, hry * (BRIM + .12));
    }
    if (HW === 'tophat'){
      const h = hry * 1.5;
      const tube0 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.04, h, 28, 1, true), hatMat);
      tube0.scale.set(hr * over * 1.02, 1, hrz * over * 1.02);
      tube0.position.y = hry * BRIM + h / 2; tube0.castShadow = true; hat.add(tube0);
      disc(hr * over * 1.02, hrz * over * 1.02, hry * .05, hry * BRIM + h);
      disc(hr * over * 1.62, hrz * over * 1.62, hry * .05, hry * BRIM);
      ring(hr * over * 1.05, hrz * over * 1.05, hry * .07, hry * (BRIM + .20));
    }
    if (HW === 'hood'){
      crown({ out: over * 1.15, inn: over * 1.02, front: .50, side: -.78, back: -1.15, rows: 14 });
      const drape = new THREE.Mesh(new THREE.CylinderGeometry(
        hr * over * 1.14, hr * over * 1.24, hry * .55, 20, 1, true, Math.PI / 2, Math.PI), hatMat);
      drape.position.set(0, -hry * .95, -hrz * .10); drape.scale.z = .95;
      drape.castShadow = true; hat.add(drape);
    }
    if (HW === 'crown'){
      crown({ out: over * 1.05, inn: over * .99, v0: .88, front: .54, side: .54, back: .54 });
      for (let i = 0; i < 8; i++){
        const a = i / 8 * Math.PI * 2;
        const pt = new THREE.Mesh(new THREE.ConeGeometry(hr * .11, hry * .34, 5), hatMat);
        pt.position.set(Math.cos(a) * hr * over * 1.0, hry * .72, Math.sin(a) * hrz * over * 1.0);
        pt.castShadow = true; hat.add(pt);
      }
    }
    if (HW === 'band'){
      crown({ out: over * 1.04, inn: over * .99, v0: .93, front: .50, side: .50, back: .50 });
    }
  }

  // ---- jewelry ----
  // Earrings hang off the ear group when there is one, so they inherit its splay;
  // otherwise they pin to the equivalent spot on the skull. The necklace rides the
  // chest bone and is sized from torsoAt(), the same profile the torso is lofted
  // from, so it stays snug on any build or shoulder width.
  if (cfg.earrings !== 'none' || cfg.necklace !== 'none'){
    const gold = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.jewelColor).convertSRGBToLinear(),
      roughness: .22, metalness: .85 });
    const gem = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.jewelColor).convertSRGBToLinear().lerp(new THREE.Color('#6fd3e0').convertSRGBToLinear(), .62),
      roughness: .12, metalness: .35 });
    const add = (m, parent) => { m.castShadow = true; m.userData.jewel = true; parent.add(m); return m; };

    if (cfg.earrings !== 'none'){
      [-1, 1].forEach((sx, i) => {
        const rig = earRigs.length ? earRigs[i] : face;
        const base = earRigs.length ? V(sx * hr * .03, -hry * .20, hrz * .02)
                                    : V(sx * hr * 1.00, -hry * .26, -hrz * .08);
        const at = (dy, dz) => V(base.x, base.y + (dy || 0), base.z + (dz || 0));
        if (cfg.earrings === 'studs'){
          const st = new THREE.Mesh(new THREE.SphereGeometry(hr * .058, 10, 8), gold);
          st.position.copy(at(0)); add(st, rig);
        }
        if (cfg.earrings === 'hoops'){
          const R = hr * .17;
          const h = new THREE.Mesh(new THREE.TorusGeometry(R, hr * .026, 7, 22), gold);
          h.position.copy(at(-R * .92)); h.rotation.y = Math.PI / 2;
          add(h, rig);
        }
        if (cfg.earrings === 'drops'){
          const link = new THREE.Mesh(new THREE.SphereGeometry(hr * .042, 8, 6), gold);
          link.position.copy(at(0)); add(link, rig);
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(hr * .012, hr * .012, hry * .16, 6), gold);
          bar.position.copy(at(-hry * .10)); add(bar, rig);
          const drop = new THREE.Mesh(new THREE.SphereGeometry(hr * .075, 10, 8), gold);
          drop.position.copy(at(-hry * .22)); drop.scale.set(.85, 1.25, .85); add(drop, rig);
        }
        if (cfg.earrings === 'gems'){
          const st = new THREE.Mesh(new THREE.SphereGeometry(hr * .045, 8, 6), gold);
          st.position.copy(at(0)); add(st, rig);
          const g = new THREE.Mesh(new THREE.OctahedronGeometry(hr * .085), gem);
          g.position.copy(at(-hry * .17)); g.scale.set(.8, 1.2, .8); add(g, rig);
        }
      });
    }

    if (cfg.necklace !== 'none'){
      const chest = bones[map.chest];
      const NK = cfg.necklace;
      const uN = NK === 'choker' ? .985 : .90;
      const yOf = u => P.hips[1] + (P.neck[1] - P.hips[1]) * u - P.chest[1];
      const prof = torsoAt(uN);
      const Rx = prof.rx * SH.pad * 1.05, Rz = prof.rz * SH.pad * 1.05;
      const rig = new THREE.Group(); rig.position.y = yOf(uN); chest.add(rig);

      const band = (tube, arc, mat) => {
        const t = new THREE.Mesh(new THREE.TorusGeometry(1, tube / Rx, 7, arc ? 26 : 34,
          arc || Math.PI * 2), mat || gold);
        t.rotation.x = Math.PI / 2; t.scale.set(Rx, Rz, 1);
        return add(t, rig);
      };
      if (NK === 'chain') band(hr * .022);
      if (NK === 'choker') band(hr * .045);
      if (NK === 'beads'){
        const n = 22;
        for (let i = 0; i < n; i++){
          const a = i / n * Math.PI * 2;
          const b = new THREE.Mesh(new THREE.SphereGeometry(hr * .048, 8, 6), i % 3 ? gold : gem);
          b.position.set(Math.cos(a) * Rx, 0, Math.sin(a) * Rz);
          add(b, rig);
        }
      }
      if (NK === 'torc'){
        const arc = Math.PI * 1.62;
        const t = band(hr * .045, arc);
        rig.rotation.y = arc / 2 + Math.PI / 2;      // swing the opening to the front
        [0, arc].forEach(a => {
          const knob = new THREE.Mesh(new THREE.SphereGeometry(hr * .072, 10, 8), gold);
          knob.position.set(Math.cos(a) * Rx, 0, Math.sin(a) * Rz);
          add(knob, rig);
        });
      }
      if (NK === 'pendant'){
        band(hr * .020);
        const uP = .78, pf = torsoAt(uP);
        const yP = yOf(uP), zP = pf.rz * SH.pad;
        const strand = new THREE.Mesh(new THREE.CylinderGeometry(hr * .010, hr * .010, Math.abs(yOf(uN) - yP), 6), gold);
        strand.position.set(0, (yP - yOf(uN)) / 2, zP * .96);
        add(strand, rig);
        const stone = new THREE.Mesh(new THREE.OctahedronGeometry(hr * .105), gem);
        stone.position.set(0, yP - yOf(uN), zP * 1.02);
        stone.scale.set(.85, 1.15, .6); add(stone, rig);
      }
    }
  }

  // ---- layered clothing silhouettes ----
  buildWardrobeOverlays(cfg, bones, map, H, fat, hr, { garment, torsoAt, SH, PA, Q });

  // ---- props (multi-slot registry) ----
  // Legacy `prop` maps onto the left hand. Dedicated slots let a character hold
  // a book, wear a backpack, and keep a pointer in the other hand at once.
  const leftId = cfg.propLeft || cfg.prop || 'none';
  attachPropSlot(bones, map, 'leftHand', leftId, H, cfg, P);
  attachPropSlot(bones, map, 'rightHand', cfg.propRight, H, cfg, P);
  attachPropSlot(bones, map, 'back', cfg.propBack, H, cfg, P);
  attachPropSlot(bones, map, 'waist', cfg.propWaist, H, cfg, P);
  attachPropSlot(bones, map, 'shoulder', cfg.propShoulder, H, cfg, P);

  // ---------- expressions ----------
  // Identity (eye size, brow thickness, mouth width) lives on the meshes.
  // Expression parameters layer on top so a face can look confused without
  // changing who the character is.
  let lidRest = [-.58, .80];
  const FACES = Object.assign({
    happy:      { brow: 0, browY: .06, lid: -.42, lidLow: .64, eye: 1, mouthW: 1, mouthOpen: .80, mouthRoll: Math.PI, mouthY: .42 },
    neutral:    { brow: 0, browY: 0, lid: -.58, lidLow: .80, eye: 1, mouthW: .72, mouthOpen: .22, mouthRoll: Math.PI, mouthY: .38 },
    surprised:  { brow: 0, browY: .16, lid: -1.02, lidLow: .88, eye: 1.22, mouthW: .60, mouthOpen: 1.05, mouthRoll: Math.PI, mouthY: .40 },
    determined: { brow: -.30, browY: -.05, lid: -.30, lidLow: .74, eye: .88, mouthW: .92, mouthOpen: .18, mouthRoll: 0, mouthY: .34 },
    sad:        { brow: .28, browY: .05, lid: -.40, lidLow: .78, eye: 1, mouthW: .95, mouthOpen: .70, mouthRoll: 0, mouthY: .32 },
    confused:   { brow: .22, browY: .10, lid: -.50, lidLow: .78, eye: 1.05, mouthW: .7, mouthOpen: .28, mouthRoll: 2.4, mouthY: .38 },
    annoyed:    { brow: -.38, browY: -.04, lid: -.22, lidLow: .70, eye: .92, mouthW: .85, mouthOpen: .16, mouthRoll: 0.2, mouthY: .36 },
    excited:    { brow: -.08, browY: .12, lid: -.95, lidLow: .86, eye: 1.18, mouthW: 1.05, mouthOpen: 1.0, mouthRoll: Math.PI, mouthY: .44 },
    skeptical:  { brow: .18, browY: .02, lid: -.28, lidLow: .72, eye: .95, mouthW: .78, mouthOpen: .12, mouthRoll: 0.4, mouthY: .37 },
    embarrassed:{ brow: .12, browY: .08, lid: -.35, lidLow: .82, eye: 1.02, mouthW: .62, mouthOpen: .35, mouthRoll: Math.PI, mouthY: .34 }
  }, CharacterFeatures.expressions);
  Object.keys(cfg.expressions || {}).forEach(k => { FACES[k] = cfg.expressions[k]; });

  function paramsFromFace(name){
    if (name === 'custom' && cfg.expression) return cfg.expression;
    return FACES[name] || FACES.happy;
  }
  function applyExpression(raw){
    const rest = mouth.userData.restCurve || 0;
    const f = Object.assign({
      brow: 0, browY: 0, lid: -.58, lidLow: .80, eye: 1,
      mouthW: 1, mouthOpen: .22, mouthRoll: Math.PI, mouthY: .40
    }, raw || {});
    const asy = Number(cfg.asymmetry) || 0;
    mouth.scale.set(f.mouthW * (Number(cfg.mouthWidth) || 1), f.mouthOpen * (Number(cfg.lipFullness) || 1), .6);
    mouth.rotation.z = f.mouthRoll + rest * Math.PI * .35;
    mouth.position.y = -hry * f.mouthY;
    brows.forEach((b, i) => {
      const sx = i === 0 ? -1 : 1;
      b.rotation.z = (b.userData.browBaseRoll || 0) + f.brow * sx;
      b.position.y = (b.userData.browBaseY || hry * .38) + hry * f.browY + asy * hry * .02 * sx;
      b.position.z = (b.userData.browBaseZ || hrz * .80);
    });
    lidRest = [f.lid, f.lidLow];
    const eSz = (Number(cfg.eyeSize) || 1) * f.eye;
    eyeRigs.forEach((g, i) => {
      const sx = i === 0 ? -1 : 1;
      const k = eSz * (1 + asy * .05 * sx);
      g.scale.set(k, k, .62 * k);
    });
  }
  function setFace(name){
    cfg.face = name || cfg.face;
    applyExpression(paramsFromFace(cfg.face));
  }
  function setExpression(params){
    cfg.expression = params;
    cfg.face = 'custom';
    applyExpression(params);
  }
  setFace(cfg.face);

  // ---------- posing ----------
  const rest = bones.map(b => b.position.clone());
  const b_ = n => bones[map[n]];
  let blinkT = 0, nextBlink = 1.6;

  let poseOffsets = Object.assign({}, cfg.poseOffsets || {});
  function reset(){
    bones.forEach((b, i) => { b.rotation.set(0, 0, 0); b.position.copy(rest[i]); });
  }
  function applyPoseOffsets(){
    Object.keys(poseOffsets).forEach(name => {
      const b = map[name] !== undefined ? bones[map[name]] : null;
      const o = poseOffsets[name];
      if (!b || !o) return;
      b.rotation.x += o.x || 0;
      b.rotation.y += o.y || 0;
      b.rotation.z += o.z || 0;
    });
  }
  function setPoseOffsets(next){
    poseOffsets = Object.assign({}, next || {});
    cfg.poseOffsets = poseOffsets;
  }
  // bring the A-pose arms in against the body
  function armsDown(amt){
    b_('upperArmL').rotation.z = -0.34 * amt;
    b_('upperArmR').rotation.z = 0.34 * amt;
  }

  function setPose(name, t, dt){
    reset();
    const hips = b_('hips'), spine = b_('spine'), chest = b_('chest'), head = b_('head'), neck = b_('neck');

    if (name === 'tpose'){
      b_('upperArmL').rotation.z = 0.72; b_('upperArmR').rotation.z = -0.72;
    }
    else if (name === 'hold'){
      armsDown(1);
      b_('forearmL').rotation.x = .16; b_('forearmR').rotation.x = .16;
      b_('shinL').rotation.x = .04; b_('shinR').rotation.x = .04;
    }
    else if (name === 'idle'){
      const br = Math.sin(t * 1.7);
      armsDown(1);
      spine.rotation.x = -.015 + br * .018;
      chest.rotation.x = -.02 + br * .022;
      hips.position.y += br * .004 * H;
      hips.rotation.y = Math.sin(t * .55) * .05;
      chest.rotation.y = -Math.sin(t * .55) * .06;
      b_('upperArmL').rotation.x = Math.sin(t * .8) * .05;
      b_('upperArmR').rotation.x = Math.sin(t * .8 + 1.1) * .05;
      b_('forearmL').rotation.x = .16; b_('forearmR').rotation.x = .16;
      head.rotation.y = Math.sin(t * .34) * .26;
      head.rotation.x = Math.sin(t * .47) * .07;
      b_('shinL').rotation.x = .04; b_('shinR').rotation.x = .04;
    }
    else if (name === 'walk' || name === 'run'){
      const run = name === 'run';
      const w = t * (run ? 8.2 : 4.6);
      const amp = run ? .95 : .52, knee = run ? 1.5 : 1.0;
      const lean = run ? -.26 : -.05;
      armsDown(run ? .55 : .9);
      spine.rotation.x = lean;
      hips.position.y += (run ? .03 : .014) * Math.cos(2 * w) * H;
      hips.rotation.y = -.14 * Math.sin(w);
      chest.rotation.y = .18 * Math.sin(w);
      ['L', 'R'].forEach((s, i) => {
        const ph = w + i * Math.PI;
        b_('thigh' + s).rotation.x = -amp * Math.sin(ph);
        b_('shin' + s).rotation.x = .06 + knee * Math.max(0, Math.cos(ph)) + .18 * Math.max(0, -Math.cos(ph));
        b_('foot' + s).rotation.x = .22 * Math.cos(ph) + (run ? .2 : .05);
        const arm = b_('upperArm' + s);
        arm.rotation.x = (run ? .85 : .48) * Math.sin(ph + Math.PI);
        b_('forearm' + s).rotation.x = (run ? .95 : .30) + (run ? .35 : .22) * Math.max(0, Math.sin(ph + Math.PI));
      });
      head.rotation.x = run ? -.12 : 0;
    }
    else if (name === 'wave'){
      armsDown(1);
      const br = Math.sin(t * 1.7);
      spine.rotation.x = -.02 + br * .015;
      hips.rotation.y = .07;
      chest.rotation.y = -.10;
      b_('upperArmR').rotation.z = -2.05;
      b_('upperArmR').rotation.x = -.18;
      b_('forearmR').rotation.z = -.35 + Math.sin(t * 5.4) * .48;
      b_('forearmR').rotation.x = -.25;
      b_('upperArmL').rotation.x = Math.sin(t * .9) * .06;
      b_('forearmL').rotation.x = .2;
      head.rotation.z = .10; head.rotation.y = -.12;
    }
    else if (name === 'jump'){
      const p = (t * .85) % 1;
      let crouch = 0, lift = 0, tuck = 0;
      if (p < .28){ crouch = Math.sin(p / .28 * Math.PI) * .9; }
      else if (p < .78){
        const q = (p - .28) / .5;
        lift = Math.sin(q * Math.PI) * .32;
        tuck = Math.sin(q * Math.PI) * .7;
      } else { crouch = Math.sin((p - .78) / .22 * Math.PI) * .6; }
      armsDown(1 - Math.min(1, lift * 2.4));
      hips.position.y += lift * H;
      spine.rotation.x = -.12 - crouch * .22 + tuck * .10;
      ['L', 'R'].forEach(s => {
        b_('thigh' + s).rotation.x = -crouch * .62 - tuck * .95;
        b_('shin' + s).rotation.x = crouch * 1.15 + tuck * 1.3 + .05;
        b_('foot' + s).rotation.x = -crouch * .35 + tuck * .5;
        b_('upperArm' + s).rotation.x = crouch * .8 - lift * 4.2;
        b_('forearm' + s).rotation.x = .2 + crouch * .3;
      });
    }
    else if (name === 'dance'){
      const w = t * 3.4;
      armsDown(.15);
      hips.rotation.y = Math.sin(w) * .34;
      hips.rotation.z = Math.sin(w * .5) * .07;
      hips.position.y += Math.abs(Math.sin(w)) * .022 * H;
      spine.rotation.z = -Math.sin(w * .5) * .10;
      chest.rotation.y = -Math.sin(w) * .30;
      ['L', 'R'].forEach((s, i) => {
        const ph = w + i * Math.PI, sg = i === 0 ? 1 : -1;
        b_('upperArm' + s).rotation.z = sg * (-1.55 + Math.sin(ph) * .55);
        b_('upperArm' + s).rotation.x = Math.sin(ph * 2) * .3;
        b_('forearm' + s).rotation.x = -.55 + Math.sin(ph) * .4;
        b_('thigh' + s).rotation.x = Math.sin(ph) * .18;
        b_('shin' + s).rotation.x = .12 + Math.max(0, Math.sin(ph)) * .32;
      });
      head.rotation.y = Math.sin(w) * .24;
      head.rotation.z = Math.sin(w * .5) * .12;
    }

    // age posture — a gradual thoracic stoop, independent of the clip
    if (age > .2){
      const stoop = (age - .2) * .22;
      b_('spine').rotation.x += stoop;
      b_('chest').rotation.x += stoop * .6;
      b_('neck').rotation.x -= stoop * .35;
    }
    applyPoseOffsets();

    // blinking + a little eye life, on every pose
    blinkT += dt || 0;
    let close = 0;
    if (blinkT > nextBlink){
      const k = (blinkT - nextBlink) / .13;
      if (k >= 1){ blinkT = 0; nextBlink = 1.4 + Math.random() * 3.6; }
      else close = Math.sin(k * Math.PI);
    }
    const uT = THREE.MathUtils.lerp(lidRest[0], LID_SHUT, close);
    const lT = THREE.MathUtils.lerp(lidRest[1], LOW_SHUT, close);
    upperLids.forEach(l => aimLid(l, uT, false));
    lowerLids.forEach(l => aimLid(l, lT, true));
    const gaze = Math.sin(t * .41) * .16;
    eyes.forEach(e => { e.rotation.y = gaze; e.rotation.x = Math.sin(t * .3) * .06; });
  }

  function setState(name){
    const s = (cfg.states || {})[name];
    if (!s) return false;
    if (s.offsets) setPoseOffsets(s.offsets);
    if (s.expression) setExpression(s.expression);
    else if (s.face) setFace(s.face);
    cfg.activeState = name;
    if (s.pose) cfg.pose = s.pose;
    return s.pose || cfg.pose || 'idle';
  }
  function getBone(name){ return map[name] !== undefined ? bones[map[name]] : null; }

  return { group, mesh, bones, map, skeleton, setPose, setFace, setExpression,
           setPoseOffsets, setState, getBone, cfg, size, warnings: compatibilityWarnings(cfg),
           description: describeCharacter(cfg),
           dispose(){
             group.traverse(o => {
               if (!o.isMesh) return;
               o.geometry && o.geometry.dispose();
               [].concat(o.material).forEach(m => m && m.dispose && m.dispose());
             });
           } };
}
/* ============================================================
   CHARACTER ENGINE END
   ============================================================ */

if (typeof window !== 'undefined') {
  window.createCharacter = createCharacter;
  window.DEFAULTS = DEFAULTS;
  window.PATTERNS = PATTERNS;
  window.CharacterEngine = Object.freeze({
    createCharacter, DEFAULTS, PATTERNS, HAIR_PRESETS, hairPresets: HAIR_PRESETS, QUALITY,
    describeCharacter, compatibilityWarnings, resolveHair, resolveSleeves, resolveLegwear,
    resolveGarment, TOP_SPEC, OUTER_SPEC, BOTTOM_SPEC,
    registerProp, registerGarment, registerHair, registerExpression,
    features: CharacterFeatures, hash32, mulberry32
  });
}
/* Character Kit: lightweight reusable viewer for Character Lab exports. */
(function (global) {
  'use strict';

  const registry = new Map();

  function requireDependencies() {
    if (!global.THREE) throw new Error('Character Kit requires three.js r128 or compatible.');
    if (typeof global.createCharacter !== 'function') {
      throw new Error('Load character-kit.bundle.js, or load character-engine.js before character-kit.js.');
    }
  }

  function resolveElement(target) {
    if (typeof target === 'string') return document.querySelector(target);
    return target;
  }

  function createViewer(target, config, options) {
    requireDependencies();
    const host = resolveElement(target);
    if (!host) throw new Error('Character viewer target was not found.');

    const opts = Object.assign({
      pose: 'idle',
      face: null,
      background: null,
      ground: false,
      interactive: false,
      autoRotate: 0,
      rotationY: 0,
      cameraDistance: null,
      shadows: true
    }, options || {});

    host.innerHTML = '';
    if (!host.style.position) host.style.position = 'relative';
    if (!host.style.minHeight) host.style.minHeight = '240px';

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !!opts.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = opts.interactive ? 'none' : 'auto';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    if (opts.background && opts.background !== 'transparent') {
      scene.background = new THREE.Color(opts.background).convertSRGBToLinear();
    }

    const camera = new THREE.PerspectiveCamera(36, 1, 0.03, 80);
    const character = createCharacter(config || {});
    character.group.rotation.y = Number(opts.rotationY) || 0;
    if (opts.face) character.setFace(opts.face);
    if (opts.state) {
      const next = character.setState(opts.state);
      if (next) opts.pose = next;
    }
    scene.add(character.group);

    scene.add(new THREE.HemisphereLight(0xb9d8ff, 0x263754, 0.82));
    const key = new THREE.DirectionalLight(0xfff2df, 1.5);
    key.position.set(2.5, 4.5, 3.5);
    key.castShadow = !!opts.shadows;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x7ed9e5, 0.72);
    rim.position.set(-3, 2.5, -3.2);
    scene.add(rim);

    let ground = null;
    if (opts.ground) {
      ground = new THREE.Mesh(
        new THREE.CircleGeometry(character.size * 0.65, 48),
        new THREE.MeshStandardMaterial({ color: 0xd8e0ea, roughness: 0.96, transparent: true, opacity: 0.28 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = !!opts.shadows;
      scene.add(ground);
    }

    const targetY = character.size * 0.52;
    let azimuth = 0;
    let distance = Number(opts.cameraDistance) || character.size * 2.45;
    let pointer = null;
    let disposed = false;
    let pose = opts.pose || 'idle';
    const clock = new THREE.Clock();

    function placeCamera() {
      camera.position.set(
        Math.sin(azimuth) * distance,
        targetY + character.size * 0.02,
        Math.cos(azimuth) * distance
      );
      camera.lookAt(0, targetY, 0);
    }

    function resize() {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width || host.clientWidth || 320));
      const height = Math.max(1, Math.round(rect.height || host.clientHeight || 420));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    const resizeObserver = global.ResizeObserver ? new ResizeObserver(resize) : null;
    if (resizeObserver) resizeObserver.observe(host);
    else global.addEventListener('resize', resize);

    function onPointerDown(event) {
      pointer = { x: event.clientX, azimuth };
      renderer.domElement.setPointerCapture(event.pointerId);
    }
    function onPointerMove(event) {
      if (!pointer) return;
      azimuth = pointer.azimuth - (event.clientX - pointer.x) * 0.008;
    }
    function onPointerUp() { pointer = null; }
    function onWheel(event) {
      event.preventDefault();
      distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.0018 * character.size,
        character.size * 1.35, character.size * 5.5);
    }

    if (opts.interactive) {
      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointercancel', onPointerUp);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    }

    function loop() {
      if (disposed) return;
      requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (opts.autoRotate) azimuth += Number(opts.autoRotate) * dt;
      character.setPose(pose, t, dt);
      placeCamera();
      renderer.render(scene, camera);
    }

    resize();
    placeCamera();
    loop();

    return {
      scene,
      camera,
      renderer,
      character,
      setPose(name) { pose = name || 'idle'; },
      setFace(name) { character.setFace(name); },
      setState(name) {
        const next = character.setState(name);
        if (next) pose = next;
      },
      setExpression(params) { character.setExpression(params); },
      setRotation(radians) { azimuth = Number(radians) || 0; },
      destroy() {
        if (disposed) return;
        disposed = true;
        if (resizeObserver) resizeObserver.disconnect();
        else global.removeEventListener('resize', resize);
        character.dispose();
        if (ground) {
          ground.geometry.dispose();
          ground.material.dispose();
        }
        renderer.dispose();
        host.innerHTML = '';
      }
    };
  }

  function register(name, config) {
    const key = String(name || '').trim();
    if (!key) throw new Error('CharacterKit.register needs a character name.');
    registry.set(key, Object.freeze(Object.assign({}, config || {})));
    document.querySelectorAll('character-viewer').forEach(function (el) {
      if (el.getAttribute('character') === key && typeof el.reload === 'function') el.reload();
    });
    return registry.get(key);
  }

  function get(name) {
    const config = registry.get(String(name));
    return config ? Object.assign({}, config) : null;
  }

  function nameFromURL(url) {
    const clean = String(url || '').split('#')[0].split('?')[0];
    const file = clean.split('/').pop() || 'character';
    return file.replace(/\.character\.json$/i, '').replace(/\.json$/i, '') || 'character';
  }

  async function loadJSON(url, name) {
    if (!url) throw new Error('CharacterKit.loadJSON needs a JSON URL.');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Could not load character JSON (' + response.status + ').');
    const data = await response.json();
    const wrapped = data && typeof data === 'object' && data.config && typeof data.config === 'object';
    const key = String(name || (wrapped && data.name) || nameFromURL(url)).trim();
    const config = wrapped ? data.config : data;
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      throw new Error('Character JSON does not contain a valid character config.');
    }
    register(key, config);
    return { name: key, config: get(key), data };
  }

  class CharacterViewerElement extends HTMLElement {
    static get observedAttributes() {
      return ['character', 'src', 'pose', 'face', 'state', 'background', 'ground', 'interactive',
        'auto-rotate', 'rotation-y', 'camera-distance'];
    }

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = ':host{display:block;min-width:160px;min-height:220px;contain:content}' +
        '.host{position:absolute;inset:0;overflow:hidden}' +
        '.message{position:absolute;inset:0;display:grid;place-items:center;padding:1rem;' +
        'font:12px/1.45 system-ui,sans-serif;color:#536275;text-align:center}';
      this._host = document.createElement('div');
      this._host.className = 'host';
      root.append(style, this._host);
      this._viewer = null;
      this._loadingSrc = null;
    }

    connectedCallback() { this.reload(); }
    disconnectedCallback() { this._destroyViewer(); }
    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;
      if (name === 'pose' && this._viewer) { this._viewer.setPose(newValue || 'idle'); return; }
      if (name === 'face' && this._viewer && newValue) { this._viewer.setFace(newValue); return; }
      if (name === 'state' && this._viewer && newValue) { this._viewer.setState(newValue); return; }
      this.reload();
    }

    _destroyViewer() {
      if (this._viewer) this._viewer.destroy();
      this._viewer = null;
    }

    reload() {
      this._destroyViewer();
      const name = this.getAttribute('character');
      const src = this.getAttribute('src');
      const config = name ? registry.get(name) : null;
      if (!config && src) {
        const token = src + '|' + (name || '');
        if (this._loadingSrc !== token) {
          this._loadingSrc = token;
          this._host.innerHTML = '<div class="message">Loading character…</div>';
          loadJSON(src, name || undefined).then(result => {
            if (!this.isConnected || this._loadingSrc !== token) return;
            this._loadingSrc = null;
            if (!this.getAttribute('character')) {
              this.setAttribute('character', result.name);
            } else {
              this.reload();
            }
          }).catch(error => {
            if (!this.isConnected || this._loadingSrc !== token) return;
            this._loadingSrc = null;
            this._host.innerHTML = '<div class="message">' + error.message + '</div>';
            console.error(error);
          });
        }
        return;
      }
      if (!config) {
        this._host.innerHTML = '<div class="message">Character “' + (name || 'unnamed') + '” is not registered.</div>';
        return;
      }
      try {
        this._viewer = createViewer(this._host, config, {
          pose: this.getAttribute('pose') || 'idle',
          face: this.getAttribute('face') || null,
          state: this.getAttribute('state') || null,
          background: this.getAttribute('background') || null,
          ground: this.hasAttribute('ground'),
          interactive: this.hasAttribute('interactive'),
          autoRotate: Number(this.getAttribute('auto-rotate')) || 0,
          rotationY: Number(this.getAttribute('rotation-y')) || 0,
          cameraDistance: Number(this.getAttribute('camera-distance')) || null
        });
      } catch (error) {
        this._host.innerHTML = '<div class="message">' + error.message + '</div>';
        console.error(error);
      }
    }

    setPose(name) { this.setAttribute('pose', name || 'idle'); }

    setFace(name) { this.setAttribute('face', name || 'happy'); }

    setState(name) { this.setAttribute('state', name || ''); }

    get characterObject() {
      return this._viewer ? this._viewer.character : null;
    }
  }

  const features = global.CharacterEngine || {};
  global.CharacterKit = Object.freeze({
    register, get, loadJSON, createViewer, registry,
    registerProp: features.registerProp,
    registerGarment: features.registerGarment,
    registerHair: features.registerHair,
    registerExpression: features.registerExpression,
    describe: features.describeCharacter,
    compatibility: features.compatibilityWarnings,
    features: features.features,
    defaults: features.DEFAULTS,
    hairPresets: features.hairPresets || features.HAIR_PRESETS
  });
  if (!customElements.get('character-viewer')) {
    customElements.define('character-viewer', CharacterViewerElement);
  }
})(window);
