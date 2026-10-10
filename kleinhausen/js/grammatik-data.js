/* Grammatik-Ecke: one short card per grammar point. Every example is a line
   from the course ([de, en, who, episode]); tools/lint-content.js checks that
   each one still appears in the story. Explanations stay at Novice High. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.GRAMMATIK = [
    {
      id: "sein",
      title: "sein — ich bin, du bist",
      kurz: "Wer bist du? Wie geht’s? Wo bist du? Fast immer: sein.",
      en: "Sein (to be) is irregular. Learn the forms as a set — you use them in your first sentence in Kleinhausen.",
      eps: ["e01", "e16"],
      tags: "bin bist ist sind seid verb to be",
      table: { head: ["", "sein"], rows: [["ich", "bin"], ["du", "bist"], ["er / sie / es", "ist"], ["wir", "sind"], ["ihr", "seid"], ["sie / Sie", "sind"]] },
      beispiele: [
        ["Ich bin Stefan Fröhlich.", "I’m Stefan Fröhlich.", "Stefan Fröhlich", "e01"],
        ["Du bist nicht im Urlaub.", "You’re not on vacation.", "Der Zug hält", "e01"],
        ["Der Aufzug ist defekt.", "The elevator is broken.", "Durchsage", "e01"],
        ["Wir sind 750 Jahre alt und immer noch nicht fertig.", "We’re 750 years old and still not finished.", "Bürgermeisterin Aydin", "e16"]
      ],
      achtung: { de: "Alter mit sein, nicht mit haben: Ich bin fünfzehn.", en: "Age uses sein: “I am fifteen”, never “I have fifteen”." },
      check: [
        { q: "Lena ___ in deinem Alter.", opts: ["bin", "ist", "sind"], ok: 1, why: "Lena = sie → ist." },
        { q: "Wir ___ nervös.", opts: ["sind", "seid", "ist"], ok: 0, why: "wir → sind. Lena sagt es vor der Rede." }
      ]
    },
    {
      id: "wfragen",
      title: "W-Fragen — wer, wo, wie, was …",
      kurz: "W-Wort zuerst, dann das Verb, dann der Rest.",
      en: "Question words start with W. The verb comes right after the question word.",
      eps: ["e01", "e02"],
      tags: "fragen question wer wo woher wohin wie was wann warum",
      table: { head: ["W-Wort", "fragt nach"], rows: [["wer?", "Person"], ["was?", "Sache"], ["wo?", "Ort"], ["woher?", "Herkunft"], ["wann?", "Zeit"], ["wie?", "Art, Befinden"], ["warum?", "Grund"]] },
      beispiele: [
        ["Wie war die Reise?", "How was the trip?", "Birgit Fröhlich", "e01"],
        ["Wo ist Café Federkiel?", "Where is Café Federkiel?", "Lena", "e02"],
        ["Wann isst die Familie?", "When does the family eat?", "Zettel an der Tür", "e01"],
        ["Was ist kaputt?", "What is broken?", "Durchsage", "e01"]
      ],
      achtung: { de: "wo = an welchem Ort. Wer = welche Person. Nicht verwechseln!", en: "German wo means where; wer means who — the opposite of what English speakers expect." },
      check: [
        { q: "___ kommst du? — Aus den USA.", opts: ["Wo", "Woher", "Wer"], ok: 1, why: "Herkunft → woher." },
        { q: "___ ist Lena? — Lenas Gastschwester … und deine.", opts: ["Wer", "Wo", "Wann"], ok: 0, why: "Person → wer." }
      ]
    },
    {
      id: "sie-du",
      title: "Sie oder du?",
      kurz: "Sie für Erwachsene, die du nicht kennst. Du für Familie, Freunde, Jugendliche.",
      en: "Sie (always capital S) is the polite “you”. Start with Sie for adults; switch to du when they invite you.",
      eps: ["e01", "e03", "e16"],
      tags: "siezen duzen formal informal höflich polite you",
      table: { head: ["", "du", "Sie"], rows: [["sein", "du bist", "Sie sind"], ["haben", "du hast", "Sie haben"], ["kommen", "du kommst", "Sie kommen"]] },
      beispiele: [
        ["Guten Tag! Sind Sie … unser Gast?", "Hello! Are you our guest?", "Stefan Fröhlich", "e01"],
        ["Du kannst du sagen.", "You can say du.", "Lena", "e01"],
        ["Haben Sie eine Kundenkarte?", "Do you have a loyalty card?", "Kasse", "e05"],
        ["Wir duzen uns untereinander.", "We use du with each other.", "Frau Vogel", "e03"]
      ],
      achtung: { de: "Lehrkräfte: immer Sie. Frau Vogel ist nicht deine Freundin im Chat.", en: "Teachers always get Sie — in person and in e-mails." },
      check: [
        { q: "Du triffst Frau Haller auf dem Markt. Was passt?", opts: ["Wie geht es Ihnen?", "Wie geht’s dir?", "Was geht?"], ok: 0, why: "Erwachsene, fremd → Sie / Ihnen." },
        { q: "Aylin ist in deiner Klasse. Was passt?", opts: ["Kommen Sie mit?", "Kommst du mit?"], ok: 1, why: "Schüler duzen sich sofort." }
      ]
    },
    {
      id: "artikel",
      title: "der, die, das",
      kurz: "Jedes Nomen hat einen Artikel. Lern das Wort immer mit Artikel.",
      en: "Every German noun is der, die or das. There is no reliable rule at this level — learn each noun with its article (the Wortschatz cards ask for it).",
      eps: ["e02", "e03"],
      tags: "artikel genus gender nominativ nomen noun the",
      table: { head: ["der", "die", "das", "Plural"], rows: [["der Brunnen", "die Kirche", "das Rathaus", "die Brötchen"], ["der Bahnhof", "die Bäckerei", "das Zimmer", "die Äpfel"]] },
      beispiele: [
        ["Das Rathaus ist das große Gebäude mit der Uhr.", "The town hall is the big building with the clock.", "Lena", "e02"],
        ["Der Rucksack ist neu.", "The backpack is new.", "Erzählung", "e03"],
        ["Die Schule ist okay, die Stadt ist klein.", "School is okay, the town is small.", "Aylin", "e03"],
        ["Die Roggen sind noch warm.", "The rye rolls are still warm.", "Herr Otto", "e05"]
      ],
      achtung: { de: "Im Plural ist der Artikel immer die.", en: "In the plural every noun takes die — even der and das nouns." },
      check: [
        { q: "___ Bäckerei ist links.", opts: ["Der", "Die", "Das"], ok: 1, why: "die Bäckerei." },
        { q: "___ Zimmer ist unter dem Dach.", opts: ["Der", "Die", "Das"], ok: 2, why: "das Zimmer." }
      ]
    },
    {
      id: "verb2",
      title: "Das Verb steht auf Platz 2",
      kurz: "Im Aussagesatz ist das Verb immer das zweite Element. Was zuerst kommt, ist frei.",
      en: "In a statement the conjugated verb is always in position 2. If you start with a time or place, the subject moves behind the verb.",
      eps: ["e03", "e04"],
      tags: "wortstellung word order verb zweite position satzbau",
      table: { head: ["Platz 1", "Platz 2 (Verb)", "Rest"], rows: [["Ich", "habe", "am Montag Deutsch."], ["Am Montag", "habe", "ich Deutsch."], ["Nachmittags", "habe", "ich Sport."]] },
      beispiele: [
        ["Am Montag habe ich Deutsch, Mathe und Englisch.", "On Monday I have German, math and English.", "In der Pause", "e03"],
        ["Nachmittags habe ich Sport, dann ziehe ich Turnschuhe an.", "In the afternoon I have PE, then I put on sneakers.", "Anziehen unter Druck", "e04"]
      ],
      achtung: { de: "Nicht: Am Montag ich habe Deutsch.", en: "English puts the subject first (“On Monday I have”). German doesn’t: Am Montag habe ich." },
      check: [
        { q: "Welcher Satz ist richtig?", opts: ["Heute ich bin müde.", "Heute bin ich müde.", "Heute müde ich bin."], ok: 1, why: "Heute = Platz 1, bin = Platz 2." }
      ]
    },
    {
      id: "wege",
      title: "Wo? Wohin? — links, rechts, neben",
      kurz: "Wegbeschreibung = feste Bausteine: links, rechts, geradeaus, neben, gegenüber.",
      en: "Learn directions as chunks. After neben/gegenüber the article changes (dem, der) — copy the whole chunk for now.",
      eps: ["e02", "e06"],
      tags: "weg richtung directions links rechts geradeaus neben gegenüber präposition",
      table: { head: ["Baustein", "English"], rows: [["links / rechts", "left / right"], ["geradeaus", "straight ahead"], ["neben dem Kaufhaus", "next to the department store"], ["gegenüber der Sparkasse", "across from the bank"]] },
      beispiele: [
        ["Links von dir ist die Bäckerei, rechts die Gasse zur Kirche.", "To your left is the bakery, to the right the lane to the church.", "Lena", "e02"],
        ["Geradeaus siehst du das Kaufhaus — das ist uns.", "Straight ahead you see the department store — that’s ours.", "Lena", "e02"],
        ["Komm zum Café Federkiel, neben dem Kaufhaus.", "Come to Café Federkiel, next to the department store.", "Lena", "e02"],
        ["Geh die Bahnhofstraße entlang, dann links in die Marktstraße.", "Go along Bahnhofstraße, then left onto Marktstraße.", "Funkspruch", "e06"]
      ],
      achtung: { de: "Nach neben / gegenüber: dem oder der, nicht der/die/das aus dem Wörterbuch.", en: "After neben and gegenüber the article changes (das Kaufhaus → neben dem Kaufhaus). Use the chunk as you heard it." },
      check: [
        { q: "Das Rathaus ist ___ der Sparkasse.", opts: ["gegenüber", "geradeaus", "links von dir ist"], ok: 0, why: "gegenüber der Sparkasse = across from the bank." }
      ]
    },
    {
      id: "zeit",
      title: "Wann? — Tage und Uhrzeit",
      kurz: "am + Tag, um + Uhrzeit. Offiziell: 18:30. Im Alltag: halb sieben.",
      en: "Use am with days (am Montag) and um with clock times (um 8:12). Germans read official times as 24-hour numbers.",
      eps: ["e03", "e09", "e13", "e14"],
      tags: "uhrzeit uhr time halb tag wochentag am um wann datum",
      table: { head: ["schreiben", "sagen (offiziell)", "sagen (Alltag)"], rows: [["8:12", "acht Uhr zwölf", "zwölf nach acht"], ["18:30", "achtzehn Uhr dreißig", "halb sieben"], ["17:30", "siebzehn Uhr dreißig", "halb sechs"]] },
      beispiele: [
        ["Deutsch ist Montag und Donnerstag um 8:00.", "German is Monday and Thursday at 8:00.", "Stundenplan", "e03"],
        ["Um halb sieben.", "At half past six.", "Zettel an der Tür", "e01"],
        ["Der Anschluss um neun Uhr zweiundfünfzig ist gefährdet.", "The 9:52 connection is at risk.", "Durchsage", "e13"],
        ["Möchtest du um siebzehn Uhr dreißig auf den Festplatz kommen?", "Would you like to come to the Festplatz at 5:30 p.m.?", "Einladen", "e14"]
      ],
      achtung: { de: "halb sieben = 6:30, nicht 7:30.", en: "halb sieben means “half to seven” = 6:30. The most common time mistake." },
      check: [
        { q: "Abendessen: 18:30. Wann isst die Familie?", opts: ["um halb sieben", "um halb acht", "um sechs"], ok: 0, why: "18:30 = halb sieben." },
        { q: "___ Montag habe ich Deutsch.", opts: ["Um", "Am", "Im"], ok: 1, why: "Tage: am." }
      ]
    },
    {
      id: "gern",
      title: "gern, nicht gern, mögen",
      kurz: "Verb + gern = etwas gern tun. Ich mag + Nomen.",
      en: "To say you like doing something, put gern after the verb. With a thing or person, use mögen (ich mag).",
      eps: ["e03", "e05", "e16"],
      tags: "gern mögen mag like vorlieben hobby nicht gern",
      table: { head: ["Tun", "Sache / Person"], rows: [["Ich spiele gern Fußball.", "Ich mag Sport."], ["Ich spiele nicht gern.", "Ich mag Otto."]] },
      beispiele: [
        ["Ich mag Sport, aber ich bin neu.", "I like sports, but I’m new.", "Karl", "e03"],
        ["Ich mag Otto.", "I like Otto.", "Frau Haller", "e05"],
        ["Ja, gern.", "Yes, gladly.", "Aylin", "e03"],
        ["Er stinkt ein bisschen, aber er mag dich schon.", "He stinks a bit, but he already likes you.", "Lena", "e01"]
      ],
      achtung: { de: "Nicht: Ich gern spiele. gern kommt nach dem Verb.", en: "gern is not a verb. It goes after the verb: Ich lese gern." },
      check: [
        { q: "Welcher Satz ist richtig?", opts: ["Ich gern esse Brötchen.", "Ich esse gern Brötchen.", "Ich mag essen Brötchen."], ok: 1, why: "Verb (esse) + gern." }
      ]
    },
    {
      id: "wetter",
      title: "Wetter — es regnet, es ist kalt",
      kurz: "Beim Wetter ist das Subjekt immer es.",
      en: "Weather sentences use es as the subject, like English “it”.",
      eps: ["e04", "e11", "e13"],
      tags: "wetter weather es regnet kalt warm wind grad",
      table: { head: ["es + Verb", "es ist + Adjektiv"], rows: [["es regnet", "es ist kalt"], ["es windet", "es ist warm"], ["es schneit", "es ist 9 Grad"]] },
      beispiele: [
        ["Es regnet später.", "It’s going to rain later.", "Lena", "e04"],
        ["Dann die Regenjacke, es windet.", "Then the rain jacket — it’s windy.", "Packen", "e04"],
        ["Es ist kalt.", "It’s cold.", "Frau Vogel", "e13"],
        ["Es regnet oft.", "It rains often.", "Herr Tadesse", "e11"]
      ],
      achtung: { de: "Mir ist kalt = ich friere. Ich bin kalt klingt komisch.", en: "To say you feel cold: mir ist kalt. “Ich bin kalt” means you are a cold person." },
      check: [
        { q: "Draußen: Regen. Was sagst du?", opts: ["Es regnet.", "Ich regne.", "Das Regen."], ok: 0, why: "Wetter: es + Verb." }
      ]
    },
    {
      id: "plural",
      title: "Plural und Preise",
      kurz: "Pluralformen sind verschieden — lern sie mit. Preise: zwölf Euro dreißig.",
      en: "German plurals have several patterns (–e, –n, umlaut, no change). Prices: say Euro, then the cents — no “and”.",
      eps: ["e05"],
      tags: "plural mehrzahl preis euro cent geld einkaufen kosten",
      table: { head: ["Singular", "Plural"], rows: [["das Brötchen", "die Brötchen"], ["der Apfel", "die Äpfel"], ["die Tüte", "die Tüten"], ["12,30 €", "zwölf Euro dreißig"]] },
      beispiele: [
        ["Sechs Brötchen, bitte.", "Six rolls, please.", "Bei Herrn Otto", "e05"],
        ["So, das macht zwölf Euro dreißig.", "So, that comes to twelve euros thirty.", "Kasse", "e05"],
        ["Die Tüte kostet zehn Cent, oder haben Sie eine eigene?", "The bag costs ten cents, or do you have your own?", "Kasse", "e05"]
      ],
      achtung: { de: "Euro bleibt Euro: zwanzig Euro, nicht zwanzig Euros.", en: "Euro doesn’t take a plural ending: zwanzig Euro." },
      check: [
        { q: "Birgit gibt dir 20 €. Wie sagst du das?", opts: ["zwanzig Euros", "zwanzig Euro", "Euro zwanzig"], ok: 1, why: "Euro hat keinen Plural." }
      ]
    },
    {
      id: "imperativ",
      title: "Imperativ — Geh! Gehen Sie!",
      kurz: "Bitten und Anweisungen: Verb nach vorn. du: Geh! / Sie: Gehen Sie!",
      en: "Commands put the verb first. For du, drop -st and du (du gehst → Geh!). For Sie, keep Sie after the verb.",
      eps: ["e06", "e02", "e01"],
      tags: "imperativ befehl command anweisung bitte weg",
      table: { head: ["", "du", "Sie"], rows: [["gehen", "Geh!", "Gehen Sie!"], ["kommen", "Komm!", "Kommen Sie!"], ["hören", "Hör zu!", "Hören Sie zu!"]] },
      beispiele: [
        ["Komm zum Café Federkiel, neben dem Kaufhaus.", "Come to Café Federkiel, next to the department store.", "Lena", "e02"],
        ["Nutzen Sie bitte die Treppe.", "Please use the stairs.", "Durchsage", "e01"],
        ["Geh die Bahnhofstraße entlang, dann links in die Marktstraße.", "Go along Bahnhofstraße, then left onto Marktstraße.", "Funkspruch", "e06"],
        ["Hör zu.", "Listen.", "Der Trainer", "e10"]
      ],
      achtung: { de: "Mit bitte klingt jeder Imperativ freundlicher.", en: "Add bitte to soften any command — Germans do it constantly." },
      check: [
        { q: "Du sagst zu Herrn Vogel (Sie): ___ bitte links!", opts: ["Geh", "Gehen Sie", "Gehst du"], ok: 1, why: "Sie-Form: Gehen Sie." }
      ]
    },
    {
      id: "hoeflich",
      title: "Ich hätte gern … / Möchtest du …?",
      kurz: "Bestellen: Ich hätte gern … Einladen und anbieten: Möchtest du …?",
      en: "Ich hätte gern and ich möchte are the polite ways to order. Möchtest du …? offers or invites.",
      eps: ["e07", "e05", "e14", "e01"],
      tags: "bestellen order café möchte hätte gern höflich polite einladen",
      table: { head: ["Situation", "Satz"], rows: [["bestellen", "Ich hätte gern einen Kakao."], ["anbieten", "Möchtest du Wasser oder Tee?"], ["einladen", "Möchtest du … kommen?"]] },
      beispiele: [
        ["Ich hätte gern ein Brot und …", "I’d like a loaf of bread and …", "Bei Herrn Otto", "e05"],
        ["Möchtest du Wasser oder Tee?", "Would you like water or tea?", "Birgit Fröhlich", "e01"],
        ["Möchtest du um 17:30 auf den Festplatz kommen?", "Would you like to come to the Festplatz at 5:30?", "Einladen", "e14"]
      ],
      achtung: { de: "Nicht: Ich will einen Kaffee. Das klingt wie ein Befehl.", en: "“Ich will …” at a counter sounds demanding. Use ich hätte gern or ich möchte." },
      check: [
        { q: "Bei Amira im Café:", opts: ["Gib mir einen Tee.", "Ich hätte gern einen Tee.", "Ich will Tee."], ok: 1, why: "Höflich bestellen: Ich hätte gern …" }
      ]
    },
    {
      id: "register",
      title: "Chat oder Mail? — Register",
      kurz: "lg und hey im Gruppenchat. Sehr geehrte … und Mit freundlichen Grüßen an Lehrkräfte.",
      en: "Register means matching your tone to the reader. A teacher e-mail needs a formal greeting, Sie, and a formal closing.",
      eps: ["e08", "e03"],
      tags: "mail email brief chat formell informell anrede gruß register",
      table: { head: ["", "Chat / Freunde", "Mail / Lehrkraft"], rows: [["Anfang", "hey / Hallo Lena", "Sehr geehrte Frau Vogel,"], ["Du/Sie", "du", "Sie"], ["Ende", "lg / bis morgen", "Mit freundlichen Grüßen"]] },
      beispiele: [
        ["hey fällt deutsch aus oderso lg", "hey is German canceled or whatever, love", "Gruppenchat", "e08"],
        ["Sehr geehrte Frau Vogel", "Dear Ms. Vogel", "E-Mail", "e03"],
        ["Mit freundlichen Grüßen", "Kind regards", "Die Korrektur", "e08"]
      ],
      achtung: { de: "Sehr geehrte Frau …, aber Sehr geehrter Herr …", en: "The greeting changes: Sehr geehrte Frau Vogel, but Sehr geehrter Herr Vogel." },
      check: [
        { q: "Du schreibst Frau Vogel. Welches Ende passt?", opts: ["lg", "Mit freundlichen Grüßen", "bda"], ok: 1, why: "Lehrkraft = formell." }
      ]
    },
    {
      id: "possessiv",
      title: "mein, dein, unser",
      kurz: "mein / dein vor der- und das-Wörtern, meine / deine vor die-Wörtern und im Plural.",
      en: "Possessives take an -e before die nouns and plurals: mein Koffer, meine Familie, meine Knie.",
      eps: ["e09", "e01", "e10"],
      tags: "possessiv mein meine dein deine unser my your our familie",
      table: { head: ["", "der / das", "die / Plural"], rows: [["ich", "mein Bein", "meine Oma"], ["du", "dein Koffer", "deine Familie"], ["wir", "unser Gast", "unsere Stadt"]] },
      beispiele: [
        ["Dein Koffer ist zu schwer.", "Your suitcase is too heavy.", "Der Zug hält", "e01"],
        ["Meine Knie mögen den Aufzug.", "My knees like the elevator.", "Frau Haller", "e05"],
        ["Das ist nicht meine Aufgabe.", "That’s not my job.", "Opa Werner", "e09"],
        ["Du bist unser Gastschüler — Gastschülerin.", "You’re our exchange student.", "Frau Vogel", "e03"]
      ],
      achtung: { de: "die Oma → meine Oma. der Opa → mein Opa.", en: "Check the article first: die → meine, der/das → mein." },
      check: [
        { q: "Das ist ___ Familie in Kleinhausen.", opts: ["mein", "meine"], ok: 1, why: "die Familie → meine." },
        { q: "___ Zimmer ist unter dem Dach.", opts: ["Mein", "Meine"], ok: 0, why: "das Zimmer → mein." }
      ]
    },
    {
      id: "modal",
      title: "Modalverben — will, kann, muss, soll, darf",
      kurz: "Modalverb auf Platz 2, das zweite Verb ganz am Ende.",
      en: "Modal verbs (want, can, must, should, may) sit in position 2 and push the main verb to the end of the sentence.",
      eps: ["e10", "e11", "e12"],
      tags: "modalverb wollen können müssen sollen dürfen möchten satzklammer want can must",
      table: { head: ["", "ich / er / sie", "du"], rows: [["wollen", "will", "willst"], ["können", "kann", "kannst"], ["müssen", "muss", "musst"], ["sollen", "soll", "sollst"], ["dürfen", "darf", "darfst"]] },
      beispiele: [
        ["Willst du nur Kakao, oder willst du auch zuhören?", "Do you only want cocoa, or do you also want to listen?", "Amira", "e07"],
        ["Ich will eure Band hören.", "I want to hear your band.", "Jonas", "e07"],
        ["Du kannst eine Freundin gebrauchen.", "You could use a friend.", "Aylin", "e03"],
        ["Wen sollst du anrufen, wenn es schlimmer wird?", "Who should you call if it gets worse?", "Birgit Fröhlich", "e12"],
        ["Darf ich zuschauen?", "May I watch?", "Karl", "e03"]
      ],
      achtung: { de: "ich will / er will — ohne -t. Nicht: er willt.", en: "ich and er/sie forms are the same and have no ending: ich kann, sie kann." },
      check: [
        { q: "Ich will eure Band ___.", opts: ["hören", "höre", "hört"], ok: 0, why: "Zweites Verb am Ende, im Infinitiv." }
      ]
    },
    {
      id: "koerper",
      title: "Was tut weh?",
      kurz: "Mein Bein tut weh. Bei mehreren: Meine Beine tun weh.",
      en: "To say something hurts: [body part] + tut weh. Plural body parts: tun weh.",
      eps: ["e10", "e12"],
      tags: "körper body schmerzen weh krank arzt apotheke bein kopf hals",
      table: { head: ["eins", "mehrere"], rows: [["Mein Bein tut weh.", "Meine Beine tun weh."], ["Mein Kopf tut weh.", "—"], ["Ich habe Fieber.", "—"]] },
      beispiele: [
        ["Was tut weh?", "What hurts?", "Zettel an den Trainer", "e10"],
        ["Mein Bein tut weh.", "My leg hurts.", "Karl", "e10"],
        ["Heute sind meine Beine müde.", "My legs are tired today.", "Nach dem Spiel", "e10"],
        ["Hals und Fieber seit gestern.", "Sore throat and fever since yesterday.", "Frau Sowinski", "e12"]
      ],
      achtung: { de: "Fieber mit haben: Ich habe Fieber.", en: "Fever uses haben, like English “have”: Ich habe Fieber." },
      check: [
        { q: "Du hast Kopfschmerzen. Was sagst du in der Apotheke?", opts: ["Mein Kopf tut weh.", "Ich bin Kopf.", "Mein Kopf tun weh."], ok: 0, why: "ein Kopf → tut weh." }
      ]
    },
    {
      id: "man",
      title: "man — so macht man das",
      kurz: "man = Leute allgemein. Verb wie bei er / sie: man siezt, man darf.",
      en: "man means “people in general / one / you”. It takes the same verb form as er: man bleibt, man kann.",
      eps: ["e11", "e01", "e09"],
      tags: "man regel rule people one allgemein kultur",
      beispiele: [
        ["In Deutschland siezt man Erwachsene zuerst.", "In Germany you use Sie with adults first.", "Siezen, Duzen", "e01"],
        ["Nach dem Preis eines Geschenks fragt man nicht.", "You don’t ask what a present cost.", "Kehrwoche, Kaffee", "e09"],
        ["Im Café bleibt man.", "In a café, people stay.", "Federkiel", "e07"],
        ["In meiner Klasse darf man Fehler machen.", "In my class you’re allowed to make mistakes.", "Frau Vogel", "e08"]
      ],
      achtung: { de: "man ≠ der Mann. Ein n, kleiner Buchstabe.", en: "man (one n, lowercase) is not der Mann (the man)." },
      check: [
        { q: "Hier ___ man nicht parken.", opts: ["kann", "können", "kannst"], ok: 0, why: "man → wie er: kann." }
      ]
    },
    {
      id: "trennbar",
      title: "Trennbare Verben — ziehe … an",
      kurz: "anziehen, einladen, anrufen: der kleine Teil springt ans Ende.",
      en: "Separable verbs split in a sentence: the prefix (an, ein, aus, um, zu …) goes to the very end.",
      eps: ["e04", "e12", "e13", "e14"],
      tags: "trennbar separable anziehen einladen anrufen umsteigen aussteigen zuhören aufräumen",
      table: { head: ["Infinitiv", "im Satz"], rows: [["anziehen", "Ich ziehe die Jacke an."], ["einladen", "Ich lade Karl ein."], ["zuhören", "Hör zu!"], ["aufräumen", "Ihr räumt auf."]] },
      beispiele: [
        ["Ich ziehe die Regenjacke an.", "I’m putting on the rain jacket.", "Lena", "e04"],
        ["Was ziehst du an?", "What are you wearing?", "Lena", "e04"],
        ["Danach räumt ihr mit uns auf.", "Afterwards you clean up with us.", "Jonas", "e14"],
        ["Wenn das Fieber steigt, rufst du mich an, nicht Jonas, der hört Musik.", "If the fever rises, call me, not Jonas — he’s listening to music.", "Birgit Fröhlich", "e12"]
      ],
      achtung: { de: "Mit Modalverb bleibt das Verb zusammen: Ich will die Jacke anziehen.", en: "With a modal verb the verb stays whole at the end: … anziehen." },
      check: [
        { q: "einladen: Ich ___ Oma Ursula ___.", opts: ["lade … ein", "einlade … —", "lade … an"], ok: 0, why: "ein springt ans Ende." }
      ]
    },
    {
      id: "weil",
      title: "weil — das Verb geht ans Ende",
      kurz: "Gründe mit weil: das Verb steht ganz am Ende des weil-Teils.",
      en: "weil (because) sends the conjugated verb to the end of its clause. That’s how you give reasons at Novice High.",
      eps: ["e15", "e14", "e09"],
      tags: "weil denn grund because nebensatz reason warum",
      beispiele: [
        ["Nächster Song ist leise, weil Oma in der ersten Reihe sitzt.", "Next song is quiet because Grandma is sitting in the front row.", "Jonas", "e14"],
        ["Weil Tradition immer gewinnt.", "Because tradition always wins.", "Bürgermeisterin Aydin", "e14"],
        ["Weil du hier wohnst.", "Because you live here.", "Opa Werner", "e09"],
        ["Frau Haller sitzt, weil Amira eine Bank in den Weg gestellt hat.", "Mrs. Haller is sitting because Amira put a bench on the path.", "Lichter", "e14"]
      ],
      achtung: { de: "Komma vor weil. Nicht: weil Oma sitzt in der ersten Reihe.", en: "Always a comma before weil, and the verb goes last." },
      check: [
        { q: "Ich komme, weil ___.", opts: ["ich habe Zeit", "ich Zeit habe", "habe ich Zeit"], ok: 1, why: "Verb ans Ende: … Zeit habe." }
      ]
    },
    {
      id: "meinung",
      title: "Meinung sagen — Ich finde …",
      kurz: "Ich finde, … / Ich denke, … / Ich finde, dass … (Verb am Ende).",
      en: "Give opinions with ich finde or ich denke. After dass the verb goes to the end, like after weil.",
      eps: ["e15", "e16", "e09"],
      tags: "meinung opinion finden denken glauben dass argument",
      table: { head: ["Start", "Satz"], rows: [["Ich finde,", "der Platz ist wichtig."], ["Ich finde, dass", "der Platz wichtig ist."], ["Ich denke,", "ein Platz kann beides sein."]] },
      beispiele: [
        ["Ich finde, der Festplatz ist wichtig, weil wir uns dort treffen.", "I think the Festplatz is important because we meet there.", "Deine Rede", "e16"],
        ["Ich denke, ein Platz kann beides sein.", "I think a square can be both.", "Opa Werner", "e09"],
        ["Wie findest du uns?", "What do you think of us?", "Oma Ursula", "e09"],
        ["Ich finde euch gut.", "I think you’re great.", "Oma Ursula", "e09"]
      ],
      achtung: { de: "Meinung ohne Beleidigung: Ich finde … — nicht: Du bist dumm.", en: "In Kleinhausen an opinion that insults loses the room. Say what you think, not what they are." },
      check: [
        { q: "Ich finde, dass der Platz für alle ___.", opts: ["ist", "sein", "ist der Platz"], ok: 0, why: "Nach dass: Verb am Ende — … für alle ist." }
      ]
    }
  ];
})(window);
