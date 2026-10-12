/* Schreib-Check: formative feedback on a draft before it is handed in.
   Narrow, high-precision patterns for Novice High writers. The check shows at most
   two patterns, marks where they are and gives the rule, not the corrected text.
   Students revise and check again; the submitted text is scored as before. */
(function (global) {
  const KH = global.KH = global.KH || {};

  /* Teacher settings. checkInIpa: allow the Schreib-Check on IPA writing
     (checks and the first draft are kept in the Heft either way). */
  KH.WRITING = Object.assign({ checkInIpa: true, maxNotes: 2 }, KH.WRITING || {});

  const PRON = "ich|du|er|sie|es|wir|ihr|man";
  const FINITE = "bin|bist|ist|sind|seid|habe|hast|hat|haben|habt|mag|magst|kann|kannst|will|willst|muss|musst|möchte|möchtest|wohne|wohnst|wohnt|komme|kommst|kommt|gehe|gehst|geht|spiele|spielst|spielt|finde|findest|findet|lerne|lernst|lernt|trinke|trinkst|trinkt|kaufe|kaufst|kauft|mache|machst|macht|brauche|brauchst|braucht|heiße|heißt|esse|isst|fahre|fährst|fährt|sehe|siehst|sieht|liebe|liebst|liebt|warte|wartest|wartet";
  /* Openers that are never followed directly by the subject. Not: da, auch, also, immer
   ("Da ich krank bin …", "Auch ich …" are correct). */
  const OPENERS = "heute|morgen|gestern|dann|danach|jetzt|hier|dort|leider|zuerst|später|abends|morgens|nachmittags|sonntags|samstags|montags|vielleicht|natürlich|oft|manchmal|deshalb|zum glück";
  const STEMS = "komm|spiel|wohn|heiß|geh|lern|trink|mach|find|kauf|sag|brauch|schreib|lieb|hör|koch|tanz|wart|frag|bleib|zeig|such|bring";

  function sentences(text) {
    return String(text || "").split(/(?<=[.!?])\s+|\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function mark(sentence, re) {
    const m = re.exec(sentence);
    if (!m) return KH.esc(sentence);
    const i = m.index;
    return KH.esc(sentence.slice(0, i)) + "<mark>" + KH.esc(m[0]) + "</mark>" + KH.esc(sentence.slice(i + m[0].length));
  }

  /* Nouns the student has met, with gender, for article and capitalisation checks. */
  function nouns() {
    if (KH._nounCache) return KH._nounCache;
    const out = {};
    /* Also everyday lowercase words (logo = klar, ich rede, fest, arm …): skip them. */
    const SKIP = { Logo: 1, Rede: 1, Stimme: 1, Fest: 1, Arm: 1 };
    function add(de) {
      const m = /^(der|die|das) ([A-ZÄÖÜ][a-zäöüß]+)$/.exec(de);
      if (m && !SKIP[m[2]]) out[m[2]] = m[1];
    }
    Object.keys(KH.WORTSCHATZ || {}).forEach(function (ep) { KH.WORTSCHATZ[ep].forEach(function (r) { add(r[0]); }); });
    Object.keys(KH.LOOK_GLOSS || {}).forEach(add);
    KH._nounCache = out;
    return out;
  }

  function isFormal(scene) {
    return /formell/i.test(scene.prompt || "") && !/chat/i.test(scene.prompt || "");
  }
  function hasFormalPart(scene) {
    return /formell/i.test(scene.prompt || "");
  }

  /* Each rule returns null or { where: html, extra?: string }. Order = priority. */
  const RULES = [
    {
      id: "deutsch",
      title: "Schreib auf Deutsch",
      rule: "Ein paar Wörter sehen englisch aus. Sag es einfacher — auf Deutsch.",
      en: "Some of this looks like English. Simpler German beats perfect English here.",
      test: function (text) {
        const hits = (String(text).match(/\b(the|and|is|my|you|with|this|that|have|are|very)\b/gi) || []);
        if (hits.length < 3) return null;
        const s = sentences(text).find(function (x) { return /\b(the|and|is|my|you|with|this|that|have|are|very)\b/i.test(x); });
        return { where: mark(s, /\b(the|and|is|my|you|with|this|that|have|are|very)\b/i) };
      }
    },
    {
      id: "anrede",
      title: "Formelle Anrede",
      card: "register",
      rule: "Eine Mail an eine Lehrkraft beginnt mit „Sehr geehrte Frau …“ (oder „Sehr geehrter Herr …“) und endet mit „Mit freundlichen Grüßen“.",
      en: "A formal e-mail needs a formal opening and closing.",
      test: function (text, scene) {
        if (!hasFormalPart(scene)) return null;
        const geehrt = /sehr geehrte/i.test(text);
        const herrWrong = /sehr geehrte\s+herr/i.exec(text);
        if (herrWrong) {
          const s = sentences(text).find(function (x) { return /sehr geehrte\s+herr/i.test(x); }) || text;
          return { where: mark(s, /sehr geehrte\s+herr/i), extra: "Bei Herr: geehrter (mit -r)." };
        }
        if (!geehrt) return { where: "", extra: "Die Anrede fehlt noch." };
        if (isFormal(scene) && /(^|\s)(lg|hdl|hdgdl|hey|bda)(\s|$|[.,!])/i.test(text)) {
          const s = sentences(text).find(function (x) { return /(^|\s)(lg|hdl|hdgdl|hey|bda)(\s|$|[.,!])/i.test(x); });
          return { where: mark(s, /\b(lg|hdl|hdgdl|hey|bda)\b/i), extra: "Chat-Wörter passen nicht in eine Mail an Frau Vogel." };
        }
        return null;
      }
    },
    {
      id: "verb2",
      title: "Verb auf Platz 2",
      card: "verb2",
      rule: "Wenn der Satz mit einer Zeit oder einem Ort beginnt, kommt danach sofort das Verb — dann erst ich/du/wir.",
      en: "Start with a time or place → the verb comes next, then the subject.",
      test: function (text) {
        const re1 = new RegExp("^(" + OPENERS + ")\\s+(" + PRON + ")\\s+\\S", "i");
        const re2 = new RegExp("^((am|im|um|nach|vor|seit|in der|in den)(\\s+[\\wäöüßÄÖÜ:]+){1,2})\\s+(" + PRON + ")\\s+(" + FINITE + ")\\b", "i");
        const s = sentences(text).find(function (x) { return re1.test(x) || re2.test(x); });
        if (!s) return null;
        const re = re1.test(s) ? new RegExp("^(" + OPENERS + ")\\s+(" + PRON + ")\\b", "i") : new RegExp("^((am|im|um|nach|vor|seit|in der|in den)(\\s+[\\wäöüßÄÖÜ:]+){1,2})\\s+(" + PRON + ")(?=\\s+(" + FINITE + ")\\b)", "i");
        return { where: mark(s, re) };
      }
    },
    {
      id: "weil",
      title: "weil / dass: Verb ans Ende",
      card: "weil",
      rule: "Nach weil und dass steht das Verb ganz am Ende des Satzteils.",
      en: "After weil / dass the conjugated verb goes to the end.",
      test: function (text) {
        const re = new RegExp("\\b(weil|dass)\\s+(" + PRON + "|der \\w+|die \\w+|das \\w+|[A-ZÄÖÜ][a-zäöü]+)\\s+(" + FINITE + ")\\s+[\\wäöüß]", "i");
        const s = sentences(text).find(function (x) { return re.test(x); });
        return s ? { where: mark(s, re) } : null;
      }
    },
    {
      id: "konjugation",
      title: "Verb passt nicht zu ich",
      card: "sein",
      rule: "Mit ich endet das Verb fast immer auf -e: ich komme, ich wohne. Ausnahmen: ich bin, ich habe, ich mag, ich kann.",
      en: "With ich the verb usually ends in -e (ich komme). sein/haben: ich bin, ich habe.",
      test: function (text) {
        /* No -en: "dass ich kommen kann", "Kann ich gehen?" are correct. */
        const re = new RegExp("\\bich\\s+(bist|ist|sind|seid|hat|hast|habt|(" + STEMS + ")(t|st))\\b", "i");
        const s = sentences(text).find(function (x) { return re.test(x); });
        return s ? { where: mark(s, re) } : null;
      }
    },
    {
      id: "alter",
      title: "Alter mit sein",
      card: "sein",
      rule: "Das Alter sagt man mit sein: ich bin fünfzehn (Jahre alt).",
      en: "Age uses sein, not haben.",
      test: function (text) {
        /* Only with "Jahre" or nothing after the number: "ich habe fünfzehn Bücher" is fine. */
        const re = /\bich\s+habe\s+(\d+|zehn|elf|zwölf|dreizehn|vierzehn|fünfzehn|sechzehn|siebzehn|achtzehn|neunzehn|zwanzig)(\s+jahre(\s+alt)?\b|(?=\s*([.,!?]|$)))/i;
        const s = sentences(text).find(function (x) { return re.test(x); });
        return s ? { where: mark(s, re) } : null;
      }
    },
    {
      id: "artikel",
      title: "der, die oder das?",
      card: "artikel",
      rule: "Am Satzanfang, vor ist/sind/hat …, steht der Artikel aus dem Wortschatz. Schau das Nomen im Wortschatz nach.",
      en: "Check the noun’s article — the Wortschatz cards have it.",
      test: function (text) {
        const N = nouns();
        const re = /^(Der|Die|Das|Mein|Meine|Dein|Deine|Unser|Unsere)\s+([A-ZÄÖÜ][a-zäöüß]+)\s+(ist|war|hat|heißt|kommt|steht|liegt|kostet|wohnt|gefällt|sieht|riecht)\b/;
        for (const s of sentences(text)) {
          const m = re.exec(s);
          if (!m || !N[m[2]]) continue;
          const g = N[m[2]];
          const w = m[1].toLowerCase();
          const fem = g === "die";
          const wrong = (w === "der" || w === "die" || w === "das") ? w !== g
            : /e$/.test(w) ? !fem : fem;
          if (wrong) return { where: mark(s, new RegExp("^" + m[1] + "\\s+" + m[2])) };
        }
        return null;
      }
    },
    {
      id: "nomen",
      title: "Nomen groß",
      card: "artikel",
      rule: "Alle Nomen schreibt man groß — auch mitten im Satz.",
      en: "German capitalises every noun.",
      test: function (text, scene) {
        if (/chat/i.test(scene.prompt || "")) return null;
        const N = nouns();
        const low = Object.keys(N).map(function (n) { return n.toLowerCase(); });
        for (const s of sentences(text)) {
          const words = s.split(/[^A-Za-zÄÖÜäöüß]+/).filter(Boolean);
          for (const w of words) {
            if (w === w.toLowerCase() && low.indexOf(w) >= 0) {
              return { where: mark(s, new RegExp("\\b" + w + "\\b")), extra: "Hier: " + w.charAt(0).toUpperCase() + w.slice(1) + "." };
            }
          }
        }
        return null;
      }
    },
    {
      id: "sie-gross",
      title: "Sie (höflich) groß?",
      card: "sie-du",
      rule: "Meinst du die höfliche Form? Dann schreibst du Sie und Ihnen groß.",
      en: "Polite Sie / Ihnen are always capitalised.",
      test: function (text, scene) {
        if (!hasFormalPart(scene)) return null;
        /* Verb may start the question (Haben), but sie itself must be lowercase. */
        const re = /\b(ihnen|([Hh]aben|[Kk]önnen|[Ss]ind|[Kk]ommen|[Ww]issen)\s+sie)\b/;
        const s = sentences(text).find(function (x) { return re.test(x); });
        return s ? { where: mark(s, re) } : null;
      }
    }
  ];

  KH.WRITING_RULES = RULES;
  KH.writingPatternTitle = function (id) {
    const r = RULES.find(function (x) { return x.id === id; });
    return r ? r.title : id;
  };

  function goodThings(text, scene, r) {
    const out = [];
    if (r.longEnough) out.push("Die Länge passt.");
    const weil = RULES.find(function (x) { return x.id === "weil"; });
    if (/\b(weil|dass)\b/i.test(text) && !weil.test(text, scene)) out.push("Du benutzt weil/dass — mit dem Verb am Ende.");
    if (hasFormalPart(scene) && /sehr geehrte/i.test(text) && /freundlichen gr/i.test(text)) out.push("Anrede und Gruß sind formell.");
    if (/\b(und|aber|dann|denn)\b/i.test(text) && sentences(text).length >= 3) out.push("Du verbindest Sätze (und, aber, dann).");
    const hit = r.hits, total = (scene.rubric && scene.rubric.needles || []).length;
    if (total && hit === total) out.push("Alle Inhaltspunkte der Aufgabe sind drin.");
    return out.slice(0, 2);
  }

  /* Returns { notes: [...], good: [...], coverage }. */
  /* opts.all: every pattern, for the teacher's record of the submitted text. */
  KH.checkWriting = function (text, scene, opts) {
    scene = scene || {};
    const max = opts && opts.all ? RULES.length : KH.WRITING.maxNotes;
    const r = KH.scoreWrite(text, scene.rubric || {});
    const notes = [];
    for (const rule of RULES) {
      if (notes.length >= max) break;
      const hit = rule.test(text, scene);
      if (hit) notes.push({ id: rule.id, title: rule.title, rule: rule.rule, en: rule.en, card: rule.card, where: hit.where, extra: hit.extra });
    }
    return {
      notes: notes,
      good: goodThings(text, scene, r),
      coverage: { hits: r.hits, total: (scene.rubric && scene.rubric.needles || []).length, longEnough: r.longEnough, min: (scene.rubric && scene.rubric.minChars) || 40 }
    };
  };

  KH.writingCheckAllowed = function (scene) {
    if (KH.state.player.exam) return false;
    if (scene && scene.ipa && !KH.WRITING.checkInIpa) return false;
    return true;
  };

  KH.writingCheckHtml = function (res, round) {
    const cov = res.coverage;
    let html = '<p class="kicker">Schreib-Check ' + round + " · keine Note</p>";
    if (res.good.length) html += '<p class="wc-good"><strong>Schon gut:</strong> ' + res.good.map(KH.esc).join(" ") + "</p>";
    if (cov.total) html += '<p class="wc-cov">Inhalt: ' + cov.hits + " von " + cov.total + " Punkten der Aufgabe erkannt" +
      (cov.longEnough ? "." : " · noch zu kurz (mindestens " + cov.min + " Zeichen).") + "</p>";
    if (res.notes.length) {
      html += "<p><strong>Schau dir " + (res.notes.length === 1 ? "das" : "diese zwei Stellen") + " an:</strong></p><ol class=\"wc-notes\">" +
        res.notes.map(function (n) {
          return '<li class="wc-note"><p class="wc-note-title">' + KH.esc(n.title) + "</p>" +
            (n.where ? '<p class="wc-where" lang="de">„' + n.where + "“</p>" : "") +
            "<p>" + KH.esc(n.rule) + (n.extra ? " " + KH.esc(n.extra) : "") + '</p><p class="en">' + KH.esc(n.en) + "</p>" +
            (n.card && KH.grammarCard && KH.grammarCard(n.card) ? '<button type="button" class="chip" data-gram="' + n.card + '">Grammatik-Ecke: ' + KH.esc(KH.grammarCard(n.card).title.split(" — ")[0]) + "</button>" : "") +
            "</li>";
        }).join("") + "</ol><p>Verbessere es selbst — dann noch einmal prüfen oder abgeben.</p>";
    } else {
      html += "<p>Keine typischen Muster gefunden. Lies deinen Text noch einmal laut — dann abgeben.</p>";
    }
    html += '<p class="en">The check looks for a few common patterns only. It doesn’t catch everything, and it never grades.</p>';
    return html;
  };
})(window);
