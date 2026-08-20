# Reflowable ebooks for Michael D. Young

This folder turns a manuscript into a **reflowable EPUB** and, when Calibre is available, **MOBI** and **AZW3** files for Kindle.

The files reflow with the reader’s font, size, and screen. They are not fixed-layout PDFs.

## Conversion queue

The next manuscript needed is **Wally the Web Wizard**.

| # | Title | Series | Status |
|---|---|---|---|
| 1 | Tales of the Promised Land | — | converted |
| 2 | Wally the Web Wizard | — | awaiting manuscript |
| 3 | The Song of the Saints | — |
| 4 | In the Quiet Heart | — |
| 5 | Before Sunset | — |
| 6 | The Lost Barge | Lost Tribes Trilogy |
| 7 | The Adventures of Mr. E | — |
| 8 | Songs for All Seasons | — |
| 9 | Age of Archangels | The Last Archangel |
| 10 | New Frontiers | — |
| 11 | The Canticle Prelude | The Canticle Chronicles |
| 12 | The Song of the Righteous | — |
| 13 | The Boss Level, Vol I | The Boss Level |
| 14 | The Boss Level, Vol II | The Boss Level |
| 15 | The Boss Level, Vol III | The Boss Level |
| 16 | The Songs of the Saints | — |
| 17 | First Things First | — |
| 18 | Christmas With Henry | — |
| 19 | The Frozen Globe | The Canticle Chronicles |
| 20 | The Last Kingdom | The Last Archangel |
| 21 | The Last Dawn | The Last Archangel |
| 22 | The Skyward Isle | The Canticle Chronicles |

`Age of Archangels` was listed twice and is queued once. `The Song of the Saints` and `The Songs of the Saints` are both listed until a manuscript shows whether they are the same book.

## What to send for each book

For every title, send:

1. **The manuscript** — Word (`.docx`), Markdown, HTML, or plain text. One file is fine. A folder of chapter files also works.
2. **A cover image** if you have one (`cover.jpg` or `cover.png`). If you do not, a simple placeholder cover is generated so Kindle has an image. You can replace it later.
3. **Any corrections** to title, subtitle, or series name.

Helpful, but optional:

- Front matter (copyright page, dedication, about the author)
- A chapter list if headings are not already in the file
- Notes about poems, lyrics, or unusual formatting that should stay intact

Print PDFs can be used when a Word file is not available. The extractor reconstructs paragraphs from InDesign first-line indents and sentence breaks, then the same EPUB/MOBI build runs as usual.

## How to drop a manuscript in

```text
ebooks/manuscripts/<slug>/manuscript.docx
ebooks/manuscripts/<slug>/cover.jpg
```

Example for the first book:

```text
ebooks/manuscripts/tales-from-the-promised-land/manuscript.docx
ebooks/manuscripts/tales-from-the-promised-land/cover.jpg
```

Or pass a file directly:

```bash
python3 ebooks/tools/build_ebook.py --slug tales-from-the-promised-land --input /path/to/Tales.docx
```

Other commands:

```bash
python3 ebooks/tools/build_ebook.py --list
python3 ebooks/tools/build_ebook.py --next
python3 ebooks/tools/build_ebook.py --sample
```

Output lands in `ebooks/output/<slug>/` as `.epub`, `.mobi`, and `.azw3`. Manuscripts and built files are gitignored so unpublished drafts are not published with the GitHub Pages site.

## Formatting the manuscript

These patterns become chapter breaks:

- Markdown headings (`# Chapter Title`)
- Word Heading 1 / Heading 2 styles
- Lines such as `Chapter 1`, `Prologue`, `Epilogue`

Scene breaks written as `***` or `---` become a centered `* * *`.

Keep body text as ordinary paragraphs. Avoid text boxes, multiple columns, and images with captions locked to a page. Inline italics and bold come through.

## Kindle note

Amazon KDP now prefers **EPUB**. MOBI is kept for older devices and for anyone who still asks for that filename. AZW3 is the richer Kindle format when Calibre is installed.

## Local setup

```bash
python3 -m pip install -r ebooks/requirements.txt
sudo apt-get install pandoc calibre   # pandoc for Word; Calibre for MOBI/AZW3
python3 -m pytest ebooks/tests
```
