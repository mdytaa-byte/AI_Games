# Kleinhausen in Canvas

## What this is
A 16-episode first-year German course set in the town of Kleinhausen. Students play in first person, reach **ACTFL Novice High** in interpretive reading/listening and presentational/interpersonal writing/speaking, and live inside one story (750-year jubilee + the Festplatz conflict).

The playable hub is `kleinhausen/index.html`.

## Three ways to run it in Canvas

### A. External URL (simplest, best for graphics)
1. Publish the repo on GitHub Pages (this repo already has a Pages workflow).
2. In Canvas: **Assignments → + Assignment**.
3. Submission type: **External Tool** or **Website URL**.
4. URL: `…/kleinhausen/` (the folder with `index.html`).
5. Ask students to paste their episode **Lehrer-Code** into a Canvas text box, or download **Heft → JSON**.

### B. SCORM 1.2 (grade passback)
1. From the `kleinhausen/` folder, run `../tools/pack-scorm.sh` (or zip *the contents* of `kleinhausen/` so that `imsmanifest.xml` and `index.html` sit at the **zip root**).
2. Copy `canvas/imsmanifest.xml` to the zip root if it is not already there. The pack script does this.
3. In Canvas: **Settings → Apps** (SCORM must be enabled for the account) **or** upload as a SCORM assignment, depending on your institution.
4. Launch. Completion and a 0–100 score (average of IPA scores) are sent via SCORM. Full journal text stays in the browser unless students export JSON.

### C. Pages / Files (no SCORM)
Upload the `kleinhausen` folder to **Files**, then embed `index.html` in a Page. Some campus CDNs strip JS — if the map is blank, use A or B.

## Scoring
| Layer | What | Canvas use |
|---|---|---|
| Formative | In-scene feedback, points (Verstehen / Sprechen / Kultur / Mut) | Practice; do not grade raw points |
| Summative | End-of-episode **IPA** (interpretive + interpersonal + presentational) | 16 mini-IPAs; auto-score is a first pass |
| Codes | `E01-NAME-####` on the stamp screen | Paste into a Canvas assignment |
| Oral | 15-second recording + follow-up in every spine dialogue / IPA interpersonal | File + listen slip; partner or teacher hears it |
| Speak codes | `SPR-E01-NAME-####` in Heft / stamp screen | Paste next to the audio file |
| Capstone | Episode 16 speech / script | Human scored with the Novice High rubric below |
| Minutes | Time-on-task in the hub (Lehrerzimmer + JSON) | Attendance / effort note — not a grade |
| Wortschatz | Daily story-tied word review (**Wörter** tab) | Practice; roster shows words secure / total and days practiced — not a grade |
| Roster | Import student `Heft → JSON` in **Lehrerzimmer** | Static class list: episodes, IPA, oral, minutes, town flags |
| Town flags | Haller / Otto / Amira / Aylin remembered | Not graded; they change later lines and the compromise’s texture |

**Novice High (human overlay):** student uses practiced sentences, handles a simple unexpected follow-up, is understandable to a sympathetic listener/reader, still makes gender/case errors.

Students **cannot** finish the year on clicks alone. Dialogue and speak scenes will not advance until a recording (or typed accommodation) is in. Prüfungsmodus is only for silent proctoring.

## Wortschatz (vocabulary review)
The **Wörter** tab is a short daily review, built for about five minutes. The badge shows how many cards are due.

- **Where words come from:** an episode stamp adds that episode’s `vocab` list. Clicking things in rooms and at places (“Schau dich um”) adds those nouns too.
- **Every card is a line from the story:** who said it, which episode, and the German sentence with its English.
- **Two modes:** new or shaky words (box 0–1) show the word in its line and ask for the meaning (four choices, keys 1–4). Words from box 2 on show the line with a gap; the student types the German **with the article**. ae/oe/ue/ss count as ä/ö/ü/ß. A right noun with the wrong article is marked “fast” and comes back tomorrow without dropping back.
- **Scheduling (Leitner):** right → up one box (back in 1, 2, 4, 8, 16 days). Wrong → box 1, one retry in the same session, back tomorrow. Box 4+ counts as *sicher*.
- **Where it’s stored:** the deck lives in the browser save and in **Heft → JSON**. It is not sent through SCORM `suspend_data`, which is too small. Lehrerzimmer shows *Wörter sicher* per student after JSON import.
- **Editing words:** `js/wortschatz-data.js`. Each episode word is `[de, en, line, line in English, who]`. `tools/lint-content.js` fails if an episode `vocab` word has no entry, or if its line does not contain the word.

## Grammatik-Ecke (grammar reference)
The **Grammatik** tab has 20 short cards, one for each grammar point in the 16 episodes (sein, Sie/du, der/die/das, Verb auf Platz 2, Uhrzeit, Modalverben, weil, and the rest). Students can search by German word, topic or English term.

- **Examples come only from the story.** Each one names who said it and in which episode. `tools/lint-content.js` fails if an example is not a line in the course.
- **Each card has:** a one-line rule in German, an English explanation, a small table, an “Achtung” box with the common mistake, and a 1–2 question Kurz-Check.
- **Inside an episode:** the header lists that episode’s cards. Each one opens as a pop-up over the scene, so the scene keeps its place. Escape closes it, and the scene’s 1/2/3 keys stay inactive while it’s open.
- **From the Wortschatz:** a right noun with the wrong article links to the *der, die, das* card.
- **For an AI tutor:** Lehrerzimmer → **Grammatik-Ecke als Text (KI-Tutor)** downloads all cards as Markdown. Paste it into the tutor’s instructions so its explanations and examples match the course.
- Which cards a student has read and passed is saved in **Heft → JSON**. It is not graded.
- **Editing cards:** `js/grammatik-data.js`. In each card, `eps[0]` is the episode that teaches the point.

## Wo stehe ich? (student progress view)
The **Wo stehe ich?** tab (also linked from the Pass) shows students where they are. It is an estimate for the student, not a grade.

- **Four skill meters:** Hören, Lesen, Sprechen and Schreiben, each on a Novice Low → Mid → High track. Position = share of the course done × how solid the last six results in that skill are (80 % counts as solid). So a student who stays solid reaches Novice High at the end of Episode 16. A trend arrow appears when the last three results differ by 10 points or more from the three before them.
- **What counts:** listening, radio and reading scenes, dialogues and speaking scenes, and writing, form and gap-fill scenes. Each part of the IPA counts for its own skill. Rooms, culture notes and praxis games don’t count. Dialogues and speaking scenes give 100 if the answer was appropriate and 50 if not, the same as the IPA.
- **Weak spots:** for up to three skills, the episodes averaging under 70 %. Each offers the weakest scene to practise again, plus that episode’s grammar cards.
- **Practice is ungraded.** It never changes stamps, codes, IPA scores, points, NPC trust or town memory, and practice writing is not added to the Heft. Only the student’s current level in that skill updates.
- **Kann-Sätze map:** all 16 episodes with their can-do statements. Each shows what the course measured (✓ sicher ≥ 80 %, ~ geht ≥ 60 %, ! üben) and the student’s own rating (*noch nicht / mit Hilfe / kann ich*). When a student says *kann ich* but the tasks say *üben*, a short note says so.
- **For you:** Lehrerzimmer → roster shows each student’s recent Hö / Le / Sp / Sc percentages after JSON import.
- **Older saves:** results are recorded from this version on. Episodes finished earlier still show their IPA score in the can-do map.

## KI-Tutor: where each student is
Your AI tutor lives outside this course, so the course gives it context in two parts.

1. **Once, for you: the Tutor-Anleitung.** Lehrerzimmer → **Tutor-Anleitung herunterladen** gives you one Markdown file. Paste it into your tutor’s standing instructions (a Claude project, custom GPT, school chatbot, …). It has:
   - how to read a student’s brief
   - the rules: Novice-level German, no spoilers, coach graded work instead of doing it, correct one or two patterns at a time
   - the course map: each episode’s goals, grammar and words, with no plot
   - the people of Kleinhausen and all Grammatik-Ecke cards
2. **Every conversation, from the student: the Tutor-Brief.** The **Tutor fragen** button in each episode header, and **Tutor-Brief öffnen** / **Mit dem Tutor üben** in *Wo stehe ich?*, build a short text with:
   - the current episode, and the scene if they are stuck in one, with its can-dos, grammar and words
   - a spoiler line naming the highest episode they know
   - skill estimates and weak spots
   - can-dos the student isn’t sure of
   - shaky words, unpassed grammar checks
   - what the town remembers about their choices
   - what they want to practise

   Students see the full text before copying it. The brief shares only their first name and course progress: no recordings, no e-mail, no grades. Their latest written text is included only if they tick the box.
- **No help during graded work:** the tutor button is turned off during an IPA and in Prüfungsmodus.
- **Tutor link:** set `url` in `js/tutor-config.js` to open the tutor from the course. If your tutor can pre-fill the first message from a URL parameter, set `prefill` to that parameter’s name (for example `"q"`) and the brief arrives already typed. With no `url`, the button only copies the brief for students to paste.

## Accessibility
Students open **Zugang** (header): contrast, type size, Verdana, reduced motion, TTS, captions/transcripts, English gloss, low-fi graphics. High-graphics mode walks the same first-person Kleinhausen as Foto-Schnitzeljagd and Lieferdienst (shared save + weather). Low-fi is a text list — no WebGL. Praxis games opened from an episode receive that weather and can write completion back to the course.

**Listening is not browser TTS.** Hören scenes play a pre-rendered clip (Lena, Frau Vogel, Otto, and a small cast) with place noise. Students can slow to ¾ or ½ without opening the transcript. TTS remains the accessibility / backup control (“Vorlesen”). Prüfungsmodus still hides transcripts.

Prüfungsmodus hides extra transcripts for listening tests **and** turns oral scenes back into click-through — leave it off unless you are proctoring a silent exam.

**Nachteilsausgleich** (Zugang → “Sprechen als Text”) is the documented accommodation: students type the line plus the follow-up instead of recording. Do not treat it as the default path.

## Suggested Canvas module (16 weeks)

Create a Canvas **Module** named *Kleinhausen* with:

1. One **Page**: link or embed `kleinhausen/index.html` (the town).
2. Sixteen **Assignments** (text entry): “Episode 01 Ankunft — Lehrer-Code”. Points 10 each, or 16 × 6.25 for a 100-point year.
3. Sixteen **Assignments** (or one repeating weekly assignment) **Sprechen — Partner hört zu**:
   - Submission type: **File upload** or **Media recording** (Canvas).
   - Students download the `.webm` from the in-course recorder or **Heft**, paste the listen slip (copy button) into the comment box, and upload the file.
   - Assign a **classmate** as peer reviewer (Canvas Peer Review) *or* collect for the teacher. The slip’s three checks are the rubric:
     1. Understandable to a sympathetic listener
     2. Answers the follow-up (not only ja/nein)
     3. Novice High: practiced sentences; gender/case errors allowed
   - Suggested points: 5 per week (completion + partner check), separate from the Lehrer-Code assignment.
   - Alternative: one **portfolio** assignment (16 files) due at midterm and finals.
4. One **Assignment**: Episode 16 Rede (file upload or media). Human IPA overlay.
5. Optional **SCORM** assignment for the overall course score.
6. One **Page** (or file) with the printable IPA rubric from **Lehrerzimmer → IPA-Rubrik drucken**. Same three modes as the in-course mini-IPA. Auto-score is a first pass; this sheet is the grade.
7. Optional: collect Heft-JSON once at midterm and once at finals. Import in Lehrerzimmer for a roster without an LTI server.

Students live in the town (first-person streets). They paste the stamp-screen code into that week’s assignment. Heft → JSON is the portfolio backup (minutes, flags, praxis slips, texts). Audio blobs are **not** stored in SCORM `suspend_data` — the Canvas file *is* the oral evidence the LMS can keep.

There is **no LTI per-episode server** in this build. Codes + JSON roster + printable rubric + minutes-on-task are the class layer that survives a gradebook.

## Existing Kleinhausen games
Wrapped as praxis missions inside episodes 2, 4, 5, 6, 7, 8, 9, 16. A finished photo hunt, shift, checkout, or chat **writes a slip into the Heft** and can open a street. “Aufgabe erledigt” is not the task — the in-game ending is. Praxis iframes inherit the hub’s enamel, weather, type, and contrast (`?kh=1`).
