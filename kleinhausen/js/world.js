/* Kleinhausen world bible — canon for the 16-episode year. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.COURSE = {
    title: "Willkommen in Kleinhausen",
    subtitle: "Ein Jahr, eine Stadt, deine Geschichte",
    year: "750 Jahre Kleinhausen",
    actfl: "Novice High",
    weeks: 16
  };

  KH.STAMPS = {
    e01: "Bahnhof",
    e02: "Marktplatz",
    e03: "Gymnasium",
    e04: "Kleiderschrank",
    e05: "Sonnenkorn",
    e06: "Posthorn",
    e07: "Café Federkiel",
    e08: "Chat",
    e09: "Familie",
    e10: "SV-Trikot",
    e11: "Gelbe Tonne",
    e12: "Löwe",
    e13: "Fahrkarte",
    e14: "Laterne",
    e15: "Stimme",
    e16: "Jubiläum"
  };

  KH.NPCS = {
    lena: {
      name: "Lena Fröhlich",
      short: "Lena",
      age: 15,
      role: "Gastschwester · fotografiert alles",
      initials: "LF",
      color: "#c45c6a",
      bio: "Deine Gastschwester. Sie kennt jeden Winkel der Stadt und will, dass du dazugehörst."
    },
    jonas: {
      name: "Jonas Fröhlich",
      short: "Jonas",
      age: 17,
      role: "Gastbruder · Band „Die Linden“",
      initials: "JF",
      color: "#3d5c8c",
      bio: "Etwas kühl am Anfang. Spielt Gitarre. Sagt oft „ist mir egal“, meint es nicht so."
    },
    birgit: {
      name: "Birgit Fröhlich",
      short: "Birgit",
      age: 46,
      role: "Gastmutter · Sparkasse Kleinhausen",
      initials: "BF",
      color: "#6a4c8c",
      bio: "Organisiert das Haus, siezt dich die ersten Tage, dann wird es du."
    },
    stefan: {
      name: "Stefan Fröhlich",
      short: "Stefan",
      age: 48,
      role: "Gastvater · Kaufhaus Fröhlich",
      initials: "SF",
      color: "#8c5a2a",
      bio: "Führt das Familienkaufhaus am Markt. Kennt alle Kundinnen und Kunden mit Namen."
    },
    ursula: {
      name: "Oma Ursula",
      short: "Ursula",
      age: 74,
      role: "Oma · liest Krimis",
      initials: "OU",
      color: "#7a3d4a",
      bio: "Wohnt in der Rosenweg-Wohnung über dem Hof. Mag „Mord im Schwarzwald“ und starken Kaffee."
    },
    werner: {
      name: "Opa Werner",
      short: "Werner",
      age: 76,
      role: "Opa · Rosen und Kehrwoche",
      initials: "OW",
      color: "#4a6a3d",
      bio: "Gärtner im Ruhestand. Spricht manchmal Hessisch. Sagt: Ordnung ist höflich."
    },
    aylin: {
      name: "Aylin Yılmaz",
      short: "Aylin",
      age: 15,
      role: "Klassenkameradin · neu aus Frankfurt",
      initials: "AY",
      color: "#2a6a6a",
      bio: "Auch neu. Versteht, wie es ist, anzukommen. Organisiert die Umwelt-AG mit Amira."
    },
    amira: {
      name: "Amira Haddad",
      short: "Amira",
      age: 16,
      role: "Umwelt-AG · Jugendzentrum",
      initials: "AH",
      color: "#2f6a52",
      bio: "Kämpft für den Festplatz. Ruhig, präzise, unbequem für Erwachsene, die „praktisch“ sagen."
    },
    karl: {
      name: "Karl Becker",
      short: "Karl",
      age: 15,
      role: "SV Kleinhausen · Mittelfeld",
      initials: "KB",
      color: "#8c6a1e",
      bio: "Spricht langsam und ehrlich. Verwechselt manchmal Artikel. Nimmt dich mit zum Training."
    },
    vogel: {
      name: "Frau Vogel",
      short: "Frau Vogel",
      age: 41,
      role: "Deutsch · Klassenlehrerin",
      initials: "FV",
      color: "#14385c",
      bio: "Streng, fair, liebt genaue Sprache. Siezen! Ihr Bruder hat die Werkstatt an der Bahnhofstraße."
    },
    hvogel: {
      name: "Herr Vogel",
      short: "Herr Vogel",
      age: 38,
      role: "Werkstatt Vogel",
      initials: "HV",
      color: "#4a5564",
      bio: "Repariert Fahrräder und Roller. Weniger Worte als seine Schwester, mehr Hände."
    },
    aydin: {
      name: "Bürgermeisterin Leyla Aydin",
      short: "Frau Aydin",
      age: 52,
      role: "Rathaus",
      initials: "LA",
      color: "#1e5a8a",
      bio: "Will das Jubiläum retten und den Haushalt auch. Hört zu — entscheidet später."
    },
    tadesse: {
      name: "Herr Tadesse",
      short: "Herr Tadesse",
      age: 44,
      role: "Gärtnerei am Park",
      initials: "HT",
      color: "#2f6a3d",
      bio: "Zieht die Blumen für den Markt. Sagt, eine Stadt ohne Bäume ist nur Parkplatz."
    },
    haller: {
      name: "Frau Haller",
      short: "Frau Haller",
      age: 67,
      role: "Nachbarin · will mehr Parkplätze",
      initials: "HH",
      color: "#6a3d3d",
      bio: "Nicht die Bösewichtin. Hat schlechte Knie. Der Festplatz ist für sie weit und der Supermarkt näher."
    },
    otto: {
      name: "Herr Otto",
      short: "Herr Otto",
      age: 61,
      role: "Bäckerei Sonnenkorn",
      initials: "HO",
      color: "#a07030",
      bio: "Backt um 3 Uhr. Kennt dein Brötchen, bevor du es bestellst — irgendwann."
    },
    sowinski: {
      name: "Frau Sowinski",
      short: "Frau Sowinski",
      age: 39,
      role: "Löwen-Apotheke",
      initials: "AS",
      color: "#3d6a4a",
      bio: "Apothekerin. Erklärt Packungen langsam. Duzen nur nach Feierabend, und auch dann nicht."
    }
  };

  KH.PLACES = {
    bahnhof: { name: "Bahnhof Kleinhausen", district: "Bahnhofsviertel", ep: "e01", x: 82, y: 70 },
    haus: { name: "Haus Fröhlich", district: "Rosenweg", ep: "e01", x: 70, y: 42 },
    markt: { name: "Marktplatz", district: "Markt", ep: "e02", x: 48, y: 46 },
    rathaus: { name: "Rathaus", district: "Markt", ep: "e02", x: 44, y: 38 },
    kirche: { name: "St. Nikolai", district: "Kirchplatz", ep: "e02", x: 28, y: 40 },
    museum: { name: "Stadtmuseum", district: "Kirchplatz", ep: "e02", x: 32, y: 52 },
    schule: { name: "Gymnasium Kleinhausen", district: "Schulstraße", ep: "e03", x: 58, y: 22 },
    cafe: { name: "Café Federkiel", district: "Marktstraße", ep: "e07", x: 54, y: 50 },
    baeckerei: { name: "Bäckerei Sonnenkorn", district: "Bäckergasse", ep: "e05", x: 40, y: 48 },
    kaufhaus: { name: "Kaufhaus Fröhlich", district: "Marktstraße", ep: "e09", x: 52, y: 40 },
    post: { name: "Postamt", district: "Bahnhofstraße", ep: "e06", x: 64, y: 62 },
    park: { name: "Stadtpark", district: "Am Fluss", ep: "e11", x: 22, y: 62 },
    fest: { name: "Festplatz", district: "Festplatz", ep: "e14", x: 18, y: 78 },
    apotheke: { name: "Löwen-Apotheke", district: "Lindenallee", ep: "e12", x: 60, y: 36 },
    sparkasse: { name: "Sparkasse", district: "Marktstraße", ep: "e03", x: 50, y: 32 },
    sport: { name: "SV Kleinhausen", district: "Sportplatz", ep: "e10", x: 78, y: 28 },
    werkstatt: { name: "Werkstatt Vogel", district: "Bahnhofstraße", ep: "e06", x: 74, y: 58 },
    supermarkt: { name: "MarktPunkt (Kette)", district: "Umgehung", ep: "e05", x: 88, y: 48 },
    jugend: { name: "Jugendzentrum", district: "Festplatz", ep: "e15", x: 24, y: 82 },
    schloss: { name: "Schloss", district: "Am Fluss", ep: "e02", x: 14, y: 48 },
    turm: { name: "Aussichtsturm", district: "Am Fluss", ep: "e02", x: 10, y: 36 },
    gaertnerei: { name: "Gärtnerei Tadesse", district: "Parkweg", ep: "e11", x: 30, y: 70 }
  };

  KH.STORY = {
    throughline: "Kleinhausen feiert 750 Jahre. Eine Firma, Nordpark GmbH, will den Festplatz in ein Parkhaus verwandeln. Das Jugendzentrum wäre weg. Die Stadt ist uneinig. Du sammelst Stimmen — und findest deine eigene.",
    conflict: "Nicht Gut gegen Böse, sondern Nachbar gegen Nachbar: Parkplatz oder Fest, praktisches Leben oder gemeinsamer Platz.",
    player: "Du bist Gastschüler/in bei Familie Fröhlich und gehst aufs Gymnasium Kleinhausen. Die Geschichte ist in der Ich-Perspektive: du siehst, hörst, sprichst."
  };

  KH.CULTURE_THREADS = [
    "Siezen und Duzen",
    "Pfand und Mülltrennung",
    "Bäckereikultur und Brotzeit",
    "Gymnasium und Stundenplan",
    "Öffentlicher Nahverkehr",
    "Vereine (Sportverein)",
    "Feste im Jahreskreis",
    "Fachwerk, Rathaus, Markt",
    "Register: Chat vs. E-Mail",
    "Kehrwoche und Nachbarschaft"
  ];
})(window);
