/* Schreib-Check rules: sentences that must and must not be flagged. Run: node tools/test-writing.js */
global.window = global; global.document = { addEventListener() {} };
const r = require("path").join(__dirname, "..", "kleinhausen", "js") + "/";
["store","a11y","world","locations","memory","class","speak","listen","tasks","modules-a","modules-b","wortschatz-data","grammatik-data","schreiben"].forEach(f => require(r + f + ".js"));
const plain = { prompt: "Schreib 5–7 Sätze.", rubric: { minChars: 40, needles: [] } };
const formal = { prompt: "Schreib eine kurze, formelle E-Mail: Anrede (Sie)", rubric: { minChars: 40, needles: [] } };
const chat = { prompt: "Schreib (1) eine Chat-Antwort an Lena (2) eine formelle Mail", rubric: { needles: [] } };
const ids = (t, sc) => KH.WRITING_RULES.filter(x => x.test(t, sc || plain)).map(x => x.id);
const cases = [
  // [text, scene, expected ids (all rules that should fire)]
  ["Heute ich bin müde.", plain, ["verb2"]],
  ["Heute bin ich müde.", plain, []],
  ["Am Montag ich habe Deutsch.", plain, ["verb2"]],
  ["Am Montag habe ich Deutsch.", plain, []],
  ["Um 8 Uhr ich habe Mathe.", plain, ["verb2"]],
  ["Da ich krank bin, bleibe ich zu Hause.", plain, []],
  ["Auch ich bin nervös.", plain, []],
  ["Nach der Schule ich gehe zum Markt.", plain, ["verb2"]],
  ["Ich komme, weil ich bin müde.", plain, ["weil"]],
  ["Ich komme, weil ich müde bin.", plain, []],
  ["Ich finde, dass der Platz ist wichtig.", plain, ["weil"]],
  ["Ich finde, dass der Platz wichtig ist.", plain, []],
  ["Weil Oma in der ersten Reihe sitzt.", plain, []],
  ["Ich glaube, dass ich kommen kann.", plain, []],
  ["Ich kommt aus den USA.", plain, ["konjugation"]],
  ["Ich bist in Kleinhausen.", plain, ["konjugation"]],
  ["Kann ich gehen?", plain, []],
  ["Ich habe 15 Jahre.", plain, ["alter"]],
  ["Ich habe fünfzehn Bücher.", plain, []],
  ["Ich habe fünfzehn.", plain, ["alter"]],
  ["Ich habe 16 Jahre alt.", plain, ["alter"]],
  ["Der Familie ist nett.", plain, ["artikel"]],
  ["Die Familie ist nett.", plain, []],
  ["Mein Familie ist nett.", plain, ["artikel"]],
  ["Meine Familie ist nett. Mein Zimmer ist klein.", plain, []],
  ["Meine Zimmer ist klein.", plain, ["artikel"]],
  ["Ich wohne bei der Familie Fröhlich. Mit der Familie esse ich.", plain, []],
  ["Die familie ist nett.", plain, ["nomen"]],
  ["Logo, ich komme! Das ist fest. Ich rede gern.", plain, []],
  ["hey fällt deutsch aus lg, die familie wartet", chat, ["anrede"]],
  ["hey komme um 5 lg. Sehr geehrte Frau Vogel, es tut mir leid. Mit freundlichen Grüßen", chat, []],
  ["Hallo Frau Vogel, ich bin da.", formal, ["anrede"]],
  ["Sehr geehrte Herr Vogel, ich bin da.", formal, ["anrede"]],
  ["Sehr geehrte Frau Vogel, ich bin da. lg Sam", formal, ["anrede"]],
  ["Sehr geehrte Frau Vogel, haben sie Zeit? Mit freundlichen Grüßen", formal, ["sie-gross"]],
  ["Sehr geehrte Frau Vogel, haben Sie Zeit? Mit freundlichen Grüßen", formal, []],
  ["Sehr geehrte Frau Vogel, ich bin da. Haben sie Zeit? Mit freundlichen Grüßen", formal, ["sie-gross"]],
  ["Lena und Jonas kommen. Haben sie Hunger? Ja.", plain, []],
  ["Hi mom, this is my room and the family is nice.", plain, ["deutsch"]],
  ["Hallo Mama! Ich bin in Kleinhausen. Die Familie ist nett und Lena ist toll. Heute bin ich müde, aber froh. Bis bald!", plain, []],
];
let bad = 0;
for (const [t, sc, exp] of cases) {
  const got = ids(t, sc);
  const ok = JSON.stringify(got.sort()) === JSON.stringify(exp.slice().sort());
  if (!ok) bad++;
  console.log((ok ? "ok  " : "FAIL") + " " + JSON.stringify(got) + "  " + t);
}
const res = KH.checkWriting("Heute ich bin müde. Ich kommt aus den USA. Der Familie ist nett. Ich habe 15 Jahre.", plain);
console.log("max notes:", res.notes.map(n => n.id), "| where:", res.notes[0].where);
console.log(bad ? bad + " FAILED" : "all passed");
if (bad) process.exit(1);
