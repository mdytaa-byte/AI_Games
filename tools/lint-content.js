/* Validate 16 modules, IPA presence, activity files. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..", "kleinhausen");
const sandbox = { window: {}, console };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);

function load(rel) {
  const code = fs.readFileSync(path.join(root, rel), "utf8");
  vm.runInContext(code, sandbox, { filename: rel });
}

load("js/world.js");
load("js/locations.js");
load("js/memory.js");
load("js/class.js");
load("js/speak.js");
load("js/listen.js");
load("js/modules-a.js");
load("js/modules-b.js");
load("js/sidequests.js");
load("js/town3d.js");

const KH = sandbox.KH;
const mods = KH.MODULES || [];
const errors = [];

if (mods.length !== 16) errors.push("Expected 16 modules, got " + mods.length);

const ids = mods.map(function (m) { return m.id; });
for (let i = 1; i <= 16; i++) {
  const id = "e" + String(i).padStart(2, "0");
  if (ids.indexOf(id) < 0) errors.push("Missing " + id);
}

mods.forEach(function (m) {
  if (!m.scenes || m.scenes.length < 4) errors.push(m.id + " has too few scenes");
  const types = m.scenes.map(function (s) { return s.type; });
  if (types.indexOf("ipa") < 0) errors.push(m.id + " missing IPA");
  if (types.indexOf("culture") < 0) errors.push(m.id + " missing culture beat");
  m.scenes.forEach(function (s, i) {
    if (s.type === "activity") {
      const file = path.join(root, s.src);
      if (!fs.existsSync(file)) errors.push(m.id + " activity missing: " + s.src);
    }
    if (s.type === "simulate" && (!s.steps || s.steps.length < 2)) {
      errors.push(m.id + " simulation too short");
    }
    if (s.type === "counter" && (!s.items || s.items.length < 3)) {
      errors.push(m.id + " counter too thin");
    }
    if (s.type === "form" && (!s.fields || s.fields.length < 2)) {
      errors.push(m.id + " form too thin");
    }
    if (s.type === "funk" && (!s.calls || s.calls.length < 2)) {
      errors.push(m.id + " funk too short");
    }
    if (s.type === "ipa") {
      if (!s.interpretive || !s.interpersonal || !s.presentational) {
        errors.push(m.id + " IPA incomplete");
      }
      if (s.interpersonal && (!s.interpersonal.followUp || !s.interpersonal.followUp.de)) {
        errors.push(m.id + " IPA interpersonal missing followUp");
      }
    }
    checkListen(m.id, s);
    if (s.type === "ipa") {
      checkListen(m.id + " IPA", s.interpretive);
    }
  });
  if (!m.canDo || !m.canDo.length) errors.push(m.id + " missing can-do");
});

if ((KH.SIDEQUESTS || []).length < 6) errors.push("Need at least 6 sidequests");
(KH.SIDEQUESTS || []).forEach(function (q) {
  (q.scenes || []).forEach(function (s) { checkListen("side:" + q.id, s); });
});

function checkListen(where, s) {
  if (!s || s.type !== "listen") return;
  if (!s.listenId) errors.push(where + " listen missing listenId");
  const clip = KH.LISTEN_CLIPS && KH.LISTEN_CLIPS[s.listenId];
  if (s.listenId && !clip) errors.push(where + " unknown listenId " + s.listenId);
  if (clip) {
    const file = path.join(root, clip.src);
    if (!fs.existsSync(file)) errors.push(where + " missing audio " + clip.src);
    if (clip.speaker === "lena" && s.speaker && s.speaker !== "lena") {
      errors.push(where + " Lena clip assigned to someone else");
    }
  }
}

if (typeof KH.voiceRequired !== "function") errors.push("speak.js did not export voiceRequired");
if (!KH.LISTEN_CLIPS || !KH.LISTEN_CLIPS["e01-bahnhof"]) errors.push("listen.js missing clip catalog");
if (KH.SPEAKERS.lena && KH.SPEAKERS.vogel && KH.SPEAKERS.otto) {
  if (KH.SPEAKERS.lena.name === KH.SPEAKERS.vogel.name) errors.push("Lena and Frau Vogel must be distinct");
}
const fus = KH.IPA_FOLLOWUPS || {};
for (let i = 1; i <= 16; i++) {
  const id = "e" + String(i).padStart(2, "0");
  if (!fus[id] || !fus[id].de) errors.push("IPA follow-up missing for " + id);
}
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
if (indexHtml.indexOf("js/speak.js") < 0) errors.push("index.html must load speak.js");
if (indexHtml.indexOf("js/listen.js") < 0) errors.push("index.html must load listen.js");
if (indexHtml.indexOf("js/memory.js") < 0) errors.push("index.html must load memory.js");
if (indexHtml.indexOf("js/class.js") < 0) errors.push("index.html must load class.js");
const manifest = fs.readFileSync(path.join(root, "canvas/imsmanifest.xml"), "utf8");
if (manifest.indexOf("js/speak.js") < 0) errors.push("SCORM manifest missing speak.js");
if (manifest.indexOf("js/memory.js") < 0) errors.push("SCORM manifest missing memory.js");
if (manifest.indexOf("css/enamel.css") < 0) errors.push("SCORM manifest missing enamel.css");
if (!fs.existsSync(path.join(root, "js/speak.js"))) errors.push("missing js/speak.js");
if (!fs.existsSync(path.join(root, "js/memory.js"))) errors.push("missing js/memory.js");
if (!fs.existsSync(path.join(root, "css/enamel.css"))) errors.push("missing css/enamel.css");

Object.keys(KH.PLACES || {}).forEach(function (id) {
  if (!KH.LOCATIONS || !KH.LOCATIONS[id]) errors.push("Missing first-person location: " + id);
});

const marks = (KH.Town && KH.Town.landmarks) || [];
Object.keys(KH.PLACES || {}).forEach(function (id) {
  const hit = marks.some(function (l) { return l.place === id; });
  if (!hit) errors.push("3D landmark missing for place: " + id);
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("OK: " + mods.length + " episodes, " + KH.SIDEQUESTS.length + " sidequests, praxis files present.");
mods.forEach(function (m) {
  console.log(m.id + "\t" + m.scenes.length + " scenes\t" + m.title);
});
