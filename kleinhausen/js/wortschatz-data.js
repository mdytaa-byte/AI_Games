/* Wortschatz: every episode word with the line where the student met it.
   [de, en, ctx (contains the word), ctxEn, who]. Keys match KH.MODULES[].vocab. */
(function (global) {
  const KH = global.KH = global.KH || {};

  KH.WORTSCHATZ = {
    e01: [
      ["Hallo", "hello", "Hallo Lena! Ich freue mich. Hallo Bello!", "Hi Lena! Nice to meet you. Hi Bello!", "Du, am Bahnhof"],
      ["Guten Tag", "good day / hello (polite)", "Guten Tag! Sind Sie … unser Gast?", "Hello! Are you our guest?", "Stefan Fröhlich"],
      ["Ich heiße", "my name is", "Hallo, ich heiße Alex. Ich komme aus den USA.", "Hi, my name is Alex. I’m from the USA.", "Wer bin ich?"],
      ["Ich komme aus", "I come from", "Ich komme aus den USA. Ich bin fünfzehn.", "I’m from the USA. I’m fifteen.", "Wer bin ich?"],
      ["der Bahnhof", "the train station", "Am Bahnhof: Sie zu Erwachsenen, die du nicht kennst.", "At the station: Sie to adults you don’t know.", "Siezen, Duzen"],
      ["die Familie", "the family", "Ein Jahr. Familie Fröhlich holt dich ab — hoffentlich.", "One year. The Fröhlich family is picking you up — hopefully.", "Der Zug hält"],
      ["das Zimmer", "the room", "Dein Zimmer unter dem Dach: die Schräge, ein Fenster zum Rosenweg.", "Your room under the roof: the slope, a window onto Rosenweg.", "Zuhause"],
      ["Willkommen", "welcome", "Ich bin Stefan Fröhlich. Willkommen!", "I’m Stefan Fröhlich. Welcome!", "Stefan Fröhlich"],
      ["danke", "thank you", "Danke, Frau Fröhlich. Die Reise war lang.", "Thank you, Mrs. Fröhlich. The trip was long.", "Birgit Fröhlich"],
      ["bitte", "please", "Achtung, der Aufzug ist defekt. Nutzen Sie bitte die Treppe.", "Attention, the elevator is broken. Please use the stairs.", "Durchsage"]
    ],
    e02: [
      ["das Rathaus", "the town hall", "Das Rathaus ist das große Gebäude mit der Uhr.", "The town hall is the big building with the clock.", "Lena"],
      ["der Brunnen", "the fountain", "Du stehst am Brunnen. Am Brunnen stehen zwei Leute.", "You’re standing at the fountain. Two people stand there.", "Marktplatz"],
      ["die Kirche", "the church", "Links von dir ist die Bäckerei, rechts die Gasse zur Kirche.", "To your left is the bakery, to the right the lane to the church.", "Lena"],
      ["die Bäckerei", "the bakery", "Links von dir ist die Bäckerei.", "To your left is the bakery.", "Lena"],
      ["links", "left", "Links von dir ist die Bäckerei.", "To your left is the bakery.", "Lena"],
      ["rechts", "right", "Rechts ist die Gasse zur Kirche.", "To the right is the lane to the church.", "Lena"],
      ["geradeaus", "straight ahead", "Geradeaus siehst du das Kaufhaus — das ist uns.", "Straight ahead you see the department store — that’s ours.", "Lena"],
      ["der Marktplatz", "the market square", "Bus Linie 3 fährt zum Marktplatz.", "Bus line 3 goes to the market square.", "Schild am Bahnhof"]
    ],
    e03: [
      ["der Stundenplan", "the class schedule", "Frau Vogel, ich habe eine Frage zum Stundenplan.", "Ms. Vogel, I have a question about the schedule.", "E-Mail an Frau Vogel"],
      ["das Fach", "the school subject", "Ein Fach gefällt mir: Deutsch.", "One subject I like: German.", "E-Mail an Frau Vogel"],
      ["die Pause", "the break", "Nach der zweiten Stunde: große Pause, oft mit Brötchen.", "After second period: long break, often with rolls.", "Gymnasium"],
      ["die Klassenlehrerin", "the homeroom teacher (f.)", "Die Klassenlehrerin bleibt oft Jahre. Klassenlehrerin: Frau Vogel.", "The homeroom teacher often stays for years. Ours: Ms. Vogel.", "Klasse 10b"],
      ["Mathe", "math", "Am Montag habe ich Deutsch, Mathe und Englisch.", "On Monday I have German, math and English.", "In der Pause"],
      ["Deutsch", "German (subject)", "Montag, erste Stunde: Deutsch.", "Monday, first period: German.", "Stundenplan"],
      ["die erste Stunde", "first period", "Montag, die erste Stunde: Deutsch bei Frau Vogel.", "Monday, first period: German with Ms. Vogel.", "Stundenplan"]
    ],
    e04: [
      ["die Jacke", "the jacket", "In Deutschland zieht man oft Schichten: T-Shirt, Pullover, Jacke.", "In Germany people layer: T-shirt, sweater, jacket.", "Schichtziehen"],
      ["die Jeans", "the jeans", "Ich ziehe Jeans, einen Pullover und eine Jacke an.", "I’m putting on jeans, a sweater and a jacket.", "Anziehen unter Druck"],
      ["der Schal", "the scarf", "Und den Schal. Es sind neun Grad und Wind.", "And the scarf. It’s nine degrees and windy.", "Lena"],
      ["es regnet", "it’s raining", "Nimm die Regenjacke. Es regnet später.", "Take the rain jacket. It’s going to rain later.", "Lena"],
      ["es ist kalt", "it’s cold", "Neun Grad, Wind vom Fluss — es ist kalt, auch wenn die Sonne scheint.", "Nine degrees, wind off the river — it’s cold, even in the sun.", "Radio Kleinhausen"],
      ["anziehen", "to put on (clothes)", "Was soll ich heute anziehen? Der Himmel ändert seine Meinung.", "What should I put on today? The sky keeps changing its mind.", "Du, vor dem Schrank"],
      ["die Farbe", "the color", "Welche Farbe hat deine Jacke? Gelb, wie das Ortsschild.", "What color is your jacket? Yellow, like the town sign.", "Lena"]
    ],
    e05: [
      ["das Brot", "the bread", "Ich hätte gern ein Brot und sechs Brötchen, bitte.", "I’d like a loaf of bread and six rolls, please.", "Bei Herrn Otto"],
      ["die Milch", "the milk", "Brötchen von Otto — Milch und Äpfel kannst du entscheiden.", "Rolls from Otto — milk and apples are your call.", "Birgits Zettel"],
      ["der Käse", "the cheese", "Auf dem Zettel: Brötchen, Milch, Käse, Äpfel. Zwanzig Euro.", "On the note: rolls, milk, cheese, apples. Twenty euros.", "Birgits Zettel"],
      ["der Apfel", "the apple", "Ein Apfel vom Markt, nicht aus Plastik. Das findet Birgit wichtig.", "An apple from the market, not in plastic. Birgit cares about that.", "Einkauf"],
      ["teuer", "expensive", "Sonnenkorn ist ein bisschen teuer. Aber Otto kennt dich.", "Sonnenkorn is a bit expensive. But Otto knows you.", "Herr Otto"],
      ["billig", "cheap", "Der große MarktPunkt am Ortsrand ist billiger.", "The big MarktPunkt on the edge of town is cheaper.", "Einkauf"],
      ["bitte", "please", "Sechs Brötchen, bitte.", "Six rolls, please.", "Bei Herrn Otto"],
      ["das macht", "that comes to (price)", "So, das macht zwölf Euro dreißig.", "So, that comes to twelve euros thirty.", "Kasse"]
    ],
    e06: [
      ["links", "left", "Geh die Bahnhofstraße entlang, dann links in die Marktstraße.", "Go along Bahnhofstraße, then left onto Marktstraße.", "Funkspruch"],
      ["rechts", "right", "Am Brunnen rechts, dann siehst du die Apotheke.", "Right at the fountain, then you’ll see the pharmacy.", "Funkspruch"],
      ["die Straße", "the street", "Geh die Bahnhofstraße entlang. Die Straße ist lang.", "Go along Bahnhofstraße. The street is long.", "Funkspruch"],
      ["die Kreuzung", "the intersection", "An der Kreuzung: gegenüber der Sparkasse ist das Rathaus.", "At the intersection: across from the savings bank is the town hall.", "Lieferdienst"],
      ["gegenüber", "across from", "Das Rathaus ist gegenüber der Sparkasse.", "The town hall is across from the savings bank.", "Funkspruch"],
      ["die Lieferung", "the delivery", "Die Lieferung für Herrn Tadesse: nicht klingeln, das Baby schläft.", "The delivery for Mr. Tadesse: don’t ring, the baby is asleep.", "Herr Vogel"],
      ["klingeln", "to ring (the doorbell)", "Wann darfst du nicht bei Herrn Tadesse klingeln?", "When are you not allowed to ring at Mr. Tadesse’s?", "Schichtende"]
    ],
    e07: [
      ["der Kaffee", "the coffee", "Einen Kaffee für Jonas, einen Kakao für dich.", "A coffee for Jonas, a hot chocolate for you.", "Café Federkiel"],
      ["der Tee", "the tea", "Was kostet ein Tee und ein Apfelkuchen?", "How much are a tea and an apple cake?", "Bestellzettel"],
      ["die Limonade", "the lemonade", "Amira empfiehlt die Limonade — hausgemacht, mit Minze.", "Amira recommends the lemonade — homemade, with mint.", "Amira"],
      ["die Rechnung", "the bill", "Die Rechnung, bitte. Zusammen oder getrennt?", "The bill, please. Together or separate?", "Amira"],
      ["zusammen", "together (one bill)", "Zahlt ihr zusammen oder getrennt?", "Are you paying together or separately?", "Amira"],
      ["getrennt", "separately", "Getrennt, bitte. Ich zahle meinen Kakao.", "Separately, please. I’ll pay for my hot chocolate.", "Du, bei Amira"],
      ["ich hätte gern", "I would like", "Ich hätte gern einen Kakao und ein Stück Apfelkuchen.", "I’d like a hot chocolate and a piece of apple cake.", "Bestellzettel"]
    ],
    e08: [
      ["lg", "liebe Grüße – love/best (chat)", "bis morgen, lg", "see you tomorrow, love", "Gruppenchat"],
      ["hdgdl", "hab dich ganz doll lieb – love you lots (chat)", "Lena an Oma: Danke für den Kuchen, hdgdl!", "Lena to Grandma: thanks for the cake, love you lots!", "Lena"],
      ["bda", "bis dann – see you (chat)", "Treffen um vier am Brunnen, bda wenn nicht.", "Meet at four at the fountain, see you then if not.", "Gruppenchat"],
      ["die Mail", "the e-mail", "Reparieren: kurze Entschuldigung, dann die Mail noch einmal, richtig.", "Fix it: a short apology, then the e-mail again, properly.", "Die Korrektur"],
      ["mit freundlichen Grüßen", "kind regards (formal)", "Mit freundlichen Grüßen — nicht lg, wenn du Frau Vogel schreibst.", "Kind regards — not lg when you write to Ms. Vogel.", "Frau Vogel"],
      ["die Gruppe", "the group (chat)", "Du bist in der Gruppe. Das ist gefährlicher als Mathe.", "You’re in the group chat. That’s more dangerous than math.", "Gruppenchat"]
    ],
    e09: [
      ["die Mutter", "the mother", "Birgit ist deine Gastmutter. Die Mutter von Lena und Jonas.", "Birgit is your host mother. Lena and Jonas’s mother.", "Sonntagstisch"],
      ["der Vater", "the father", "Stefan ist dein Gastvater. Der Vater schneidet den Kuchen.", "Stefan is your host father. The father cuts the cake.", "Sonntagstisch"],
      ["die Oma", "the grandma", "Oma Ursula wird 75 — ein Jahr für jedes Jahrzehnt der Stadt plus Kleingeld.", "Grandma Ursula turns 75 — a year for every decade of the town plus change.", "Sonntag"],
      ["der Opa", "the grandpa", "Das sagt Opa, und niemand versteht den Witz außer ihm.", "Grandpa says so, and nobody gets the joke but him.", "Opa Werner"],
      ["das Geschenk", "the present", "Nach dem Preis eines Geschenks fragt man nicht. Das Geschenk ist für Oma.", "You don’t ask what a present cost. The present is for Grandma.", "Kaufhaus Fröhlich"],
      ["der Geburtstag", "the birthday", "Zum Geburtstag: Kaffee und Kuchen am Nachmittag.", "For a birthday: coffee and cake in the afternoon.", "Familientisch"],
      ["die Kehrwoche", "the stair-sweeping week (house chore rota)", "Kehrwoche ist Moral, nicht Hobby. Wer dran ist, kehrt den Hausflur.", "Kehrwoche is morals, not a hobby. Whoever’s turn it is sweeps the hall.", "Opa Werner"]
    ],
    e10: [
      ["spielen", "to play", "Wir spielen zusammen. Wir spielen auf rechts.", "We play together. We’re playing on the right.", "Der Trainer"],
      ["trainieren", "to train / practice", "Wir trainieren dienstags und donnerstags, bei jedem Wetter.", "We train Tuesdays and Thursdays, in any weather.", "Der Trainer"],
      ["das Bein", "the leg", "Das Bein ist müde, aber okay.", "The leg is tired, but okay.", "Karl"],
      ["der Arm", "the arm", "Mein Arm ist okay. Nur das Knie nicht.", "My arm is okay. Just not the knee.", "Zettel an den Trainer"],
      ["müde", "tired", "Heute sind meine Beine müde.", "My legs are tired today.", "Nach dem Spiel"],
      ["das Team", "the team", "Was soll das Team tun?", "What should the team do?", "Der Trainer"],
      ["das Wochenende", "the weekend", "Am Wochenende spielt der SV Kleinhausen auf dem Festplatz.", "On the weekend SV Kleinhausen plays on the Festplatz.", "Vereinsheim"]
    ],
    e11: [
      ["der Müll", "the trash", "Wir wiegen den Müll. Müll mitnehmen, Pfand zurück.", "We weigh the trash. Take trash with you, return the deposit.", "Amira"],
      ["die Tonne", "the bin", "Gelbe Tonne für Plastik. Altpapier in die blaue Tonne.", "Yellow bin for plastic. Paper in the blue bin.", "In der Hand, in die Tonne"],
      ["das Pfand", "the bottle deposit", "Eine Wasserflasche mit Pfandlogo. Pfand ist ein System, kein Slogan.", "A water bottle with a deposit logo. Pfand is a system, not a slogan.", "Am Fluss"],
      ["sauber", "clean", "Nach zwei Stunden ist das Ufer sauber. Herr Tadesse nickt.", "After two hours the riverbank is clean. Mr. Tadesse nods.", "Herr Tadesse"],
      ["schmutzig", "dirty", "Deine Hände sind schmutzig, aber die Wiese ist frei.", "Your hands are dirty, but the meadow is clear.", "Am Fluss"],
      ["der Fluss", "the river", "Der Hahnfluss ist klein und ehrlich. Der Fluss zeigt, was die Stadt wegwirft.", "The Hahn river is small and honest. The river shows what the town throws away.", "Am Fluss"],
      ["die Umwelt", "the environment", "Für Frau Haller ist die Umwelt der Weg, die Bank, die Bäume.", "For Mrs. Haller the environment is the path, the bench, the trees.", "Frau Haller"]
    ],
    e12: [
      ["der Kopf", "the head", "Mein Kopf tut weh, und ich habe Fieber.", "My head hurts, and I have a fever.", "Zettel für Frau Sowinski"],
      ["der Hals", "the throat / neck", "Hals und Fieber seit gestern.", "Sore throat and fever since yesterday.", "Frau Sowinski"],
      ["Fieber", "fever", "Zettel: Fieberthermometer im Bad. Hast du Fieber?", "Note: thermometer in the bathroom. Do you have a fever?", "Birgit Fröhlich"],
      ["die Apotheke", "the pharmacy", "Die Apotheke berät. Apotheke ist nicht Drogerie.", "The pharmacy gives advice. A pharmacy isn’t a drugstore.", "Löwen-Apotheke"],
      ["das Rezept", "the prescription", "Was können wir tun — ohne Rezept?", "What can we do — without a prescription?", "Frau Sowinski"],
      ["ich bin krank", "I am sick", "Frau Vogel, ich bin krank. Ich komme heute nicht.", "Ms. Vogel, I’m sick. I’m not coming today.", "Bello wartet"],
      ["Gute Besserung", "get well soon", "Gute Besserung. Bello bleibt bei dir.", "Get well soon. Bello is staying with you.", "Lena"]
    ],
    e13: [
      ["die Fahrkarte", "the ticket", "Die Fahrkarte: Kleinhausen → Frankfurt, hin und zurück, Klasse 2.", "The ticket: Kleinhausen → Frankfurt, return, 2nd class.", "Fahrkarte"],
      ["das Gleis", "the platform / track", "Um 8:12 von Gleis 2.", "At 8:12 from platform 2.", "Fahrkarte"],
      ["die Verspätung", "the delay", "Der Regionalzug nach Frankfurt hat fünfundzwanzig Minuten Verspätung.", "The regional train to Frankfurt is twenty-five minutes late.", "Durchsage"],
      ["umsteigen", "to change trains", "In Frankfurt müssen wir umsteigen — in die U-Bahn.", "In Frankfurt we have to change — to the subway.", "Frau Vogel"],
      ["der Anschluss", "the connection", "Der Anschluss um neun Uhr zweiundfünfzig ist gefährdet.", "The 9:52 connection is at risk.", "Durchsage"],
      ["hin und zurück", "round trip", "Kleinhausen Hbf → Frankfurt Hbf, hin und zurück.", "Kleinhausen main station → Frankfurt main station, round trip.", "Fahrkarte"]
    ],
    e14: [
      ["das Fest", "the festival / party", "Das Fest auf dem Festplatz: Laternen, Musik, Punsch.", "The festival on the Festplatz: lanterns, music, punch.", "Programmzettel"],
      ["die Laterne", "the lantern", "Sankt Martin: Teilen, Laternen. Eine Laterne für Frau Haller.", "St. Martin: sharing, lanterns. A lantern for Mrs. Haller.", "Lichter"],
      ["der Markt", "the market", "Kleinhausen hat Markt, Verein, Kirche als Uhr, Schule als Kalender.", "Kleinhausen has a market, a club, the church as a clock, school as a calendar.", "Jahreskreis"],
      ["die Musik", "the music", "Es gibt Musik und Punsch.", "There’s music and punch.", "Programmzettel"],
      ["einladen", "to invite", "Möchtest du um siebzehn Uhr dreißig kommen? Ich möchte dich einladen.", "Would you like to come at 5:30 p.m.? I’d like to invite you.", "Einladen"],
      ["die Tradition", "the tradition", "Weil Tradition immer gewinnt.", "Because tradition always wins.", "Bürgermeisterin Aydin"]
    ],
    e15: [
      ["die Stimme", "the voice", "Das Museum will ein Buch: 750 Stimmen. Eine Stimme, fair.", "The museum wants a book: 750 voices. One voice, fair.", "Stimmen"],
      ["die Meinung", "the opinion", "Wer nur Kuchen ohne Meinung ist, bleibt Deko.", "Whoever is just cake without an opinion stays decoration.", "Herr Otto"],
      ["finden, dass", "to think that", "Wir finden, dass der Platz für alle ist — auch für Frau Haller.", "We think that the square is for everyone — Mrs. Haller too.", "Für das Buch"],
      ["das Gerücht", "the rumor", "Das Gerücht im Chat: der Festplatz ist schon verkauft.", "The rumor in the chat: the Festplatz is already sold.", "Chat-Export"],
      ["entschuldigen", "to apologize / excuse", "Entschuldigen Sie, Frau Haller — haben Sie zwei Minuten?", "Excuse me, Mrs. Haller — do you have two minutes?", "Interview am Brunnen"],
      ["das Interview", "the interview", "Interview am Brunnen — zwei Minuten.", "Interview at the fountain — two minutes.", "Aylin"]
    ],
    e16: [
      ["das Jubiläum", "the anniversary / jubilee", "Das Jubiläum: 750 Jahre, 14 Uhr, Markt und Platz.", "The jubilee: 750 years, 2 p.m., market and square.", "Beschluss"],
      ["der Kompromiss", "the compromise", "Ein Kompromiss, der nach Arbeit riecht.", "A compromise that smells of work.", "Der Stadtrat"],
      ["die Rede", "the speech", "Lies deine Rede oder sag sie frei.", "Read your speech or give it freely.", "Jubiläum"],
      ["wir", "we", "Wir sind 750 Jahre alt und immer noch nicht fertig.", "We are 750 years old and still not finished.", "Bürgermeisterin Aydin"],
      ["bleiben", "to stay", "Es fühlt sich wie Bleiben an. Ich möchte bleiben.", "It feels like staying. I want to stay.", "Danach"],
      ["danke", "thank you", "Danke an die, die gekehrt, geliefert und Punsch gekocht haben.", "Thanks to those who swept, delivered and made punch.", "Bürgermeisterin Aydin"],
      ["zuhause", "at home", "Ein Jahr später: Kleinhausen ist auch zuhause.", "A year later: Kleinhausen is home too.", "Letzte Postkarte"]
    ]
  };
})(window);

/* Things students click in rooms and places ("Schau dich um"). Only clean
   article + noun labels become cards; the place line is the context. */
(function (global) {
  const KH = global.KH = global.KH || {};
  KH.LOOK_GLOSS = {
    "das Bett": "the bed", "das Fenster": "the window", "der Schreibtisch": "the desk",
    "der Koffer": "the suitcase", "der Zettel": "the note", "das Museum": "the museum",
    "die Anzeigetafel": "the departures board", "das Plakat": "the poster", "der Kiosk": "the kiosk",
    "die Fußmatte": "the doormat", "die Rose": "the rose", "die Bank": "the bench",
    "der Uhrturm": "the clock tower", "die Fahne": "the flag", "der Eingang": "the entrance",
    "das Denkmal": "the monument", "die Glocken": "the bells", "das Portal": "the doorway (church)",
    "das Schlossmodell": "the castle model", "die Kasse": "the checkout / ticket desk",
    "die Pinnwand": "the bulletin board", "die Schulglocke": "the school bell",
    "die Speisekarte": "the menu", "die Zeitungsstange": "the newspaper rod",
    "der Fensterplatz": "the window seat", "die Theke": "the counter", "die Nummer": "the number (ticket)",
    "das Logo": "the logo", "die Rolltreppe": "the escalator", "das Posthorn": "the post horn",
    "das Funkgerät": "the radio set (walkie)", "die Ente": "the duck", "die Tonne": "the bin",
    "die Vermessungsstange": "the surveyor’s pole", "die Bühne": "the stage",
    "das Jugendzentrum": "the youth center", "der Löwe": "the lion", "das Regal": "the shelf",
    "der Automat": "the machine (ATM)", "der Terminzettel": "the appointment slip", "das Tor": "the goal",
    "die Wäscheleine": "the clothesline", "die Vereinstheke": "the clubhouse bar",
    "die Fahrradkette": "the bike chain", "das Radio": "the radio", "der Aufzug": "the elevator",
    "das Preisschild": "the price tag", "der Probenplan": "the rehearsal schedule", "das Sofa": "the sofa",
    "der Schlossturm": "the castle tower", "der Graben": "the moat", "das Schild": "the sign",
    "der Ausblick": "the view", "die Setzlinge": "the seedlings"
  };
})(window);
