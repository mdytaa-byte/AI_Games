# Johann: dein Deutschlehrer

Johann is an AI German tutor that works alongside any German course: a textbook class, Kleinhausen, AP or IB German, a Goethe/telc exam course, an adult evening class, or an app like Duolingo. He's supportive and encouraging, but he **coaches rather than does the work**. Students do the thinking; Johann gives the next small hint.

The whole app is a single file, [`index.html`](index.html). Open it in a browser or host it anywhere (it's already served by this repo's GitHub Pages site at `/johann/`). It runs on Claude through the Anthropic API.

## What students can do

| Activity | What Johann does |
|---|---|
| 💬 **Gespräch** (Conversation) | Chats in German at the student's level, corrects by recasting, and points out at most one pattern per turn. |
| ❓ **Frag Johann** (Ask a question) | Explains grammar, vocabulary, and culture with his *own* examples, then has the student try. |
| ✍️ **Schreibcheck** (Writing feedback) | Marks errors with codes like **[G] [K] [V] [WS] [R] [WW] [?]** without fixing them. The student revises, and Johann compares the versions. |
| 🗂️ **Wortschatz** (Vocabulary) | Quizzes the course vocabulary list and the student's notebook, one item at a time, and brings missed words back later. |
| 🎭 **Rollenspiel** (Role-play) | Plays a café server, ticket agent, doctor, and so on, then gives feedback when the student types "Feedback". |
| 🎯 **Prüfungstraining** (Test prep) | Writes fresh practice items in the test's format and steers practice toward weak spots. |
| 📏 **Einstufung** (Level check) | A relaxed chat of about 10 exchanges that adapts up or down, then estimates the student's CEFR level and saves it to their profile. |

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
- **Umlaut keys**, **read-aloud** (browser voice), and **speech input** (in browsers that support it, such as Chrome and Edge).
- **Transcript download**, so students can show their teacher how they used Johann.
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
4. Open **Teacher tools: share this course with students**, optionally tick **Lock**, and click **Create course code**. Share the code or link in your LMS. Students paste it on the setup screen, or just open the link.

Update the code whenever you move to a new unit. Students can also change the current unit themselves, even when the course is locked.

The lock is a convenience, not a security feature. A student who clears their browser storage can edit anything.

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

The proxy only allows the three Claude models Johann uses, caps response length, and strips tool use. Anyone with the link and class code can still send it chat requests, so change the class code each term and set a monthly spend limit in the Anthropic Console.

### Model and cost
Johann uses **Claude Opus 5.5** by default because it gives the best teaching quality. You can switch to Sonnet 5.5 or Haiku 5.5 in **Einstellungen** for lower cost and faster replies. Johann keeps his instructions identical within a session so prompt caching can lower the cost of long sessions.

## Privacy
- Everything (course, notebook, last session) is stored only in the student's browser. **Einstellungen → Alles löschen** removes it.
- Messages go to Anthropic (directly, or through your proxy) to generate Johann's replies.
- Johann is told not to ask for personal details and to tell students they can invent facts for exercises. If a student shares something worrying, he responds with care and points them to a trusted adult.
- Course codes never contain API keys or student names.
