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
Students open **Zugang** (header): contrast, type size, Verdana, reduced motion, TTS, captions/transcripts, English gloss, low-fi graphics. 3D praxis games keep their own internal accessibility panels (text mode, etc.).

Prüfungsmodus hides extra transcripts for listening tests; leave it off unless you are proctoring.

## Existing Kleinhausen games
Wrapped as praxis missions inside episodes 2, 4, 5, 6, 7, 8, 9, 16 so the town is one umbrella, not a pile of links.
