# Johann: dein Deutschlehrer

Johann is an AI German tutor that works alongside any German course: a textbook class, Kleinhausen, AP or IB German, a Goethe/telc exam course, an adult evening class, or an app like Duolingo. He's supportive and encouraging, but he **coaches rather than does the work**. Students do the thinking; Johann gives the next small hint.

The whole app is a single file, [`index.html`](index.html). Open it in a browser or host it anywhere (it's already served by this repo's GitHub Pages site at `/johann/`). It runs on Claude through the Anthropic API.

## What students can do

| Activity | What Johann does |
|---|---|
| 💬 **Gespräch** (Conversation) | Chats in German at the student's level, corrects by recasting, and points out at most one pattern per turn. |
| ❓ **Frag Johann** (Ask a question) | Explains grammar, vocabulary, and culture with his *own* examples, then gives a short exercise card to try it. |
| ✍️ **Schreibcheck** (Writing feedback) | Shows the student's own text with errors highlighted and coded (**[G] [K] [V] [WS] [R] [WW] [?]**), without fixing them. The student revises in place, and the app shows how many marks they fixed. |
| 🗂️ **Wortschatz** (Vocabulary) | Drills the course vocabulary and the student's notebook with exercise cards, and brings missed words back later. |
| 🎭 **Rollenspiel** (Role-play) | Plays a café server, ticket agent, doctor, and so on, then gives feedback when the student types "Feedback". |
| 🎯 **Prüfungstraining** (Test prep) | Writes fresh practice cards in the test's format and steers practice toward weak spots. |
| 🎙️ **Sprechen** (Speaking, hands-free) | A spoken conversation. Johann talks through the browser voice, the student answers out loud, and the app sends what it heard automatically. Johann ignores spelling and punctuation and asks again when the recognizer mishears. |
| 🗣️ **Nachsprechen** (Say it after me) | Johann gives 4–6 sentences at the student's level. The student listens (normal or slow), says each one, and sees which words came through. Johann then gives tips on the sounds they missed. |
| 📏 **Einstufung** (Level check) | A relaxed chat of about 10 exchanges that adapts up or down, then estimates the student's CEFR level and saves it to their profile. |

### More than a chat window

**Exercise cards.** When Johann sets practice, it appears as an interactive card instead of a chat message. There are five kinds:
- 🎨 **der/die/das**, with colour-coded buttons
- ✏️ **fill in the gap**
- ☑️ **multiple choice**
- 🧩 **word order**: tap the words to build the sentence
- 🔗 **matching** pairs

The app checks answers instantly and gives a gentle nudge for near misses ("Check the capital letters", "Check ä, ö, ü and ß"). Students can ask for a hint, and after two wrong tries they can choose to see the answer. When they're done, the results go to Johann, who responds to what they actually got wrong. Cards only ever contain practice items Johann wrote, never the student's own homework.

**Writing marked up on the student's own text.** In Schreibcheck, the student's text appears with errors highlighted and coded. Clicking a highlight shows a hint, and the student can open a stronger hint. Neither one gives the answer. They revise right in the card, and when they send the new version the app shows "Fixed since your last version: 3 of 5". Johann then marks the new version.

**Word help.** In Johann's messages, nouns are coloured by gender (**der** blue, **die** red, **das** green), so genders sink in without effort. Dotted words can be tapped to see the dictionary form, the plural or key verb forms, and the meaning, with buttons to hear the word and save it to the Merkheft. This uses one small extra request per message and can be switched off in **Einstellungen → Wort-Hilfe**.

### Reasons to come back tomorrow

**Daily review.** Words in the Merkheft come back on a spaced-repetition schedule (1, 3, 7, 14, 30, then 60 days). The home screen shows "🔁 Heute fällig: 7 Wörter" with a review that takes a couple of minutes. Each card is either a flashcard (German, then reveal the meaning) or, for words the student already knows a bit, "write it in German", where the app checks the answer and the article. The student grades each card Nochmal, Schwer, or Gewusst (keys 1–3), and missed words come back at the end of the session.

**Progress page (Fortschritt):**
- a practice streak 🔥 and a 14-day activity strip
- words saved and words learned for good
- exercise-card results this week
- **can-do goals:** the 16 Kleinhausen episodes have them built in, and any course can add its own in **Mein Kurs** (they travel in the course code). Students tick goals themselves, and Johann adds "✓ seen by Johann" when he sees them do it in a session.
- **mistake patterns** that fade over time: each pattern shows "active", "getting better" (Johann saw it used correctly, or it hasn't come up for two weeks), or "mastered". Johann keeps checking patterns that are getting better.

### Session report for teachers

**📄 Bericht** in a session, or the button after **Sitzung beenden**, builds a one-page *Lernbericht* to hand in. It includes:
- the student's name, date, length, course, and activity
- Johann's wrap-up summary
- card results (right first try or after retrying, hints opened, answers shown)
- writing versions and how many marks the student fixed themselves
- speaking match scores
- every kind of help they asked for
- words, goals, and can-dos saved

It can include the full conversation. Students can print it, save it as a PDF, or download it as a self-contained HTML file to upload to the LMS. The report is built from the session's own record, not written by Johann, so using Johann becomes visible work.

### Über mich: Johann adapts to each student

In **Über mich**, students can describe themselves (every field is optional):
- **Level:** their own CEFR level, if it's different from the course's (for example, a heritage speaker in German 1), how long they've studied German, their strongest skill, and what they most want to improve. Not sure of their level? The level check works it out.
- **Background:** the languages they speak, so Johann can point out cognates and false friends, and their connection to German: family, time abroad, or growing up with it as a heritage speaker.
- **Goals and interests:** grades, exams, travel, family, media, and so on. Johann uses their interests for conversation topics and example sentences.
- **How they learn best:** a challenge level (gentle, balanced, or "push me"), examples first or rules first, a "short messages, one step at a time" option, and free-text notes.

The profile stays in the student's browser and is never included in course codes. Teacher notes and the course still set the boundaries.

### Appearance

In **Einstellungen → Darstellung**: seven colour schemes, light, dark or automatic, high contrast, four text sizes, easy-to-read fonts (Atkinson Hyperlegible, Lexend), extra line and letter spacing, compact or comfortable spacing, a wide layout, and reduced motion. Changes apply right away and are remembered.

### Other features
- **Merkheft (notebook).** Johann saves useful words, recurring mistake patterns, and goals. He remembers them in later sessions, and students can practise their notebook words.
- **Tipp button** for a small hint, plus quick buttons like "Einfacher, bitte" and "Auf Englisch?".
- **Umlaut keys**, **read-aloud** (browser voice), and **speech input**.
- **Speaking works best in Chrome or Edge.** Browser voices and speech recognition vary a lot between devices. In Safari and Firefox, Johann can still speak, but checking what the student said may not be available. Speech recognition in Chrome sends audio to the browser maker's speech service.
- **Transcript download**, so students can show their teacher how they used Johann. It includes card scores and how many writing marks they fixed.
- **English support levels**: Mostly English, Mixed, or Mostly German.

## How Johann protects learning

These rules are built into Johann's instructions:

- He never writes, rewrites, or translates work a student will hand in, and he never answers homework, worksheet, quiz, or test items. He holds to this even if the student insists or says the teacher allowed it. Only the teacher notes can relax it.
- Instead, he explains the concept with a *different* example, walks the student through their own item with questions, or makes a similar practice item.
- Before each Ask, Writing, or Test-prep session, students say whether the work is graded. For graded work Johann coaches only, and he says no kindly, in one sentence, without lecturing.
- In writing feedback he marks errors but never gives the corrected text. After two failed tries on the same spot, he explains the correct form.
- If a text looks machine-translated, he doesn't accuse the student. He asks to work with their own words.

No AI tutor is cheat-proof, and a determined student can still copy from somewhere else. Johann is designed so that the help he gives builds skill instead of replacing it.

## For teachers: set Johann up for your class

1. Open Johann and click **Mein Kurs**.
2. Fill in the course type, level, textbook or course name, current unit, grammar focus, and vocabulary list. For Kleinhausen, choose **Kleinhausen · Deutsch 1** and pick the episode. Grammar and vocabulary fill in automatically.
3. Use **Teacher notes** for class rules, for example:
   - *"This week's essay on Familie is graded. Help students brainstorm and plan, but don't mark errors in their drafts."*
   - *"Emphasize verb-second word order. Don't introduce the Präteritum yet."*
   - *"Students may get model sentences for the speaking practice. It's ungraded."*
4. Optionally add **can-do goals** for the unit, one per line. Students see them on their progress page, and Johann watches for them.
5. Open **Teacher tools: share this course with students**, optionally tick **Lock**, and click **Create course code**. Share the code or link in your LMS. Students paste it on the setup screen, or just open the link.

Update the code whenever you move to a new unit. Students can also change the current unit themselves, even when the course is locked.

The lock is a convenience, not a security feature. A student who clears their browser storage can edit anything.

## "Ask Johann" buttons in your course

Students can open Johann from inside their course activities. He opens in a side panel, already set to the course, and knows which task the student came from. He uses that to help with the language without doing the task.

### Kleinhausen (built in)
Every Kleinhausen screen now has a floating **🎓 Frag Johann** button, and each episode has one in its header. Johann opens on that episode's grammar, vocabulary, and can-do goals, with the current scene as context. The practice games have a button in their course bar too.

- **Exam mode (Prüfungsmodus) and the IPA:** the buttons disappear.
- **Proof tasks (scenes titled "Nachweis"):** Johann opens in coach-only mode, as for graded work.
- **SCORM:** the package (`tools/pack-scorm.sh`) now includes Johann, so the buttons also work in Canvas.

### Any other course (for example Glockenspiel)
In Johann, open **Mein Kurs → Teacher tools**, set the course, then use **"Ask Johann" button for your course pages**. Pick which activity it opens (questions, writing check, vocabulary, …), whether the task is graded, and a short description Johann will see (e.g. "Lektion 3, Übung 4b"). You get four versions:
- **Link:** works anywhere, including Canvas announcements and assignments. Opens in a new tab.
- **Button:** an HTML button for Canvas pages and websites.
- **Embedded panel:** an iframe, which Canvas allows.
- **Script tag:** the floating panel, for websites you control. Canvas removes scripts.

On your own website, the script also turns any element into a task-specific button:

```html
<script src="https://YOUR-SITE/johann/ask-johann.js"
        data-course="Glockenspiel" data-level="A1" data-unit="Lektion 3: Familie"></script>

<button data-ask-johann data-mode="write" data-context="Lektion 3, Übung 4b" data-graded="1">Frag Johann</button>
```

All the options are listed at the top of [`ask-johann.js`](ask-johann.js).

### School settings for every button: `config.js`
Fill in [`config.js`](config.js) once and every student is connected through your school link automatically:
- `proxyUrl`: your school link
- `classCode`: optional, and visible to anyone who opens the file
- `buttons: false`: switches off all Ask Johann buttons, for example during an exam week

## Connecting Johann to Claude

Johann needs access to the Anthropic API. There are two options.

### Option A: Students use their own API key
On the setup screen, students choose **My own API key** and paste a key from [console.anthropic.com](https://console.anthropic.com). The key stays in that browser's local storage and is sent only to `api.anthropic.com`. This works for adult learners and self-study. It's usually **not** suitable for school students.

### Option B: A school link (recommended for classes)
You host a small proxy that holds **your** API key, and students only get the link and a class code. [`proxy-worker.js`](proxy-worker.js) is a ready-made Cloudflare Worker:

1. Create a free Cloudflare account, then go to **Workers & Pages → Create → Worker**. Replace the starter code with `proxy-worker.js` and deploy.
2. In the Worker's **Settings → Variables and Secrets**, add:
   - `ANTHROPIC_API_KEY` (secret): your API key
   - `CLASS_CODE` (secret, recommended): any word students will type, e.g. `Brezel42`
   - `ALLOWED_ORIGIN` (optional): where Johann is hosted, e.g. `https://yourname.github.io`
3. Give students the Worker URL (e.g. `https://johann.yourname.workers.dev`) and the class code. They choose **School link** on the setup screen.

The proxy only allows the three Claude models Johann uses, caps response length, and only passes through Johann's own two app tools (exercise cards and writing marks), with no web search or other server tools. Anyone with the link and class code can still send it chat requests, so change the class code each term and set a monthly spend limit in the Anthropic Console.

### Model and cost
Johann uses **Claude Opus 5.5** by default because it gives the best teaching quality. You can switch to Sonnet 5.5 or Haiku 5.5 in **Einstellungen** for lower cost and faster replies. Johann keeps his instructions identical within a session so prompt caching can lower the cost of long sessions.

## Privacy
- Everything (course, profile, notebook, review schedule, progress, last session) is stored only in the student's browser. Reports are made on the device, and the student decides whether to share them. **Einstellungen → Alles löschen** removes it.
- Messages go to Anthropic (directly, or through your proxy) to generate Johann's replies.
- Johann is told not to ask for personal details and to tell students they can invent facts for exercises. If a student shares something worrying, he responds with care and points them to a trusted adult.
- Course codes never contain API keys or student names.
