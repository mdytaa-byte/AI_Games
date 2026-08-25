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
load("js/speak.js");
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
    if (s.type === "ipa") {
      if (!s.interpretive || !s.interpersonal || !s.presentational) {
        errors.push(m.id + " IPA incomplete");
      }
      if (s.interpersonal && (!s.interpersonal.followUp || !s.interpersonal.followUp.de)) {
        errors.push(m.id + " IPA interpersonal missing followUp");
      }
    }
  });
  if (!m.canDo || !m.canDo.length) errors.push(m.id + " missing can-do");
});

if ((KH.SIDEQUESTS || []).length < 6) errors.push("Need at least 6 sidequests");

if (typeof KH.voiceRequired !== "function") errors.push("speak.js did not export voiceRequired");
const fus = KH.IPA_FOLLOWUPS || {};
for (let i = 1; i <= 16; i++) {
  const id = "e" + String(i).padStart(2, "0");
  if (!fus[id] || !fus[id].de) errors.push("IPA follow-up missing for " + id);
}
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
if (indexHtml.indexOf("js/speak.js") < 0) errors.push("index.html must load speak.js");
const manifest = fs.readFileSync(path.join(root, "canvas/imsmanifest.xml"), "utf8");
if (manifest.indexOf("js/speak.js") < 0) errors.push("SCORM manifest missing speak.js");
if (!fs.existsSync(path.join(root, "js/speak.js"))) errors.push("missing js/speak.js");

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
