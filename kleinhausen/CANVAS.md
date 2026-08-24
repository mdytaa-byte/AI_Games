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
| Capstone | Episode 16 speech / script | Human scored with the Novice High rubric below |

**Novice High (human overlay):** student uses practiced sentences, handles a simple unexpected follow-up, is understandable to a sympathetic listener/reader, still makes gender/case errors.

## Accessibility
Students open **Zugang** (header): contrast, type size, Verdana, reduced motion, TTS, captions/transcripts, English gloss, low-fi graphics. High-graphics mode walks the same first-person Kleinhausen as Foto-Schnitzeljagd and Lieferdienst (shared save + weather). Low-fi is a text list — no WebGL. Praxis games opened from an episode receive that weather and can write completion back to the course.

Prüfungsmodus hides extra transcripts for listening tests; leave it off unless you are proctoring.

## Suggested Canvas module (16 weeks)

Create a Canvas **Module** named *Kleinhausen* with:

1. One **Page**: link or embed `kleinhausen/index.html` (the town).
2. Sixteen **Assignments** (text entry): “Episode 01 Ankunft — Lehrer-Code”. Points 10 each, or 16 × 6.25 for a 100-point year.
3. One **Assignment**: Episode 16 Rede (file upload or media). Human IPA overlay.
4. Optional **SCORM** assignment for the overall course score.

Students live in the town (first-person streets). They paste the stamp-screen code into that week’s assignment. Heft → JSON is the portfolio backup.

## Existing Kleinhausen games
Wrapped as praxis missions inside episodes 2, 4, 5, 6, 7, 8, 9, 16 so the town is one umbrella, not a pile of links.
