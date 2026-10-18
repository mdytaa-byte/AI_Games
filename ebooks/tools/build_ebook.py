#!/usr/bin/env python3
"""Build reflowable EPUB and Kindle (MOBI/AZW3) files from a manuscript.

Accepted manuscript formats: Markdown, HTML, plain text, Word (.docx).
Pandoc is used when available for .docx/.odt/.rtf. Calibre's ebook-convert
writes MOBI and AZW3 from the EPUB.
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
import uuid
import zipfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape as xml_escape

import markdown
import yaml
from ebooklib import epub
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "catalog.yaml"
STYLE_PATH = ROOT / "styles" / "epub.css"
MANUSCRIPTS_DIR = ROOT / "manuscripts"
OUTPUT_DIR = ROOT / "output"
ARTIFACTS_DIR = Path("/opt/cursor/artifacts")

MANUSCRIPT_NAMES = (
    "manuscript.md",
    "manuscript.markdown",
    "manuscript.html",
    "manuscript.htm",
    "manuscript.txt",
    "manuscript.docx",
    "manuscript.odt",
    "manuscript.rtf",
)
MANUSCRIPT_SUFFIXES = {".md", ".markdown", ".html", ".htm", ".txt", ".docx", ".odt", ".rtf"}
COVER_NAMES = ("cover.jpg", "cover.jpeg", "cover.png", "cover.webp")

CHAPTER_LINE = re.compile(
    r"^(?:chapter|part|book|prologue|epilogue|preface|introduction|afterword|acknowledg(?:e)?ments)\b",
    re.IGNORECASE,
)
NUMBERED_CHAPTER = re.compile(r"^(?:chapter|part|book)\s+[\divx]+(?:\s*[:.\-].*)?$", re.IGNORECASE)
SCENE_BREAK = re.compile(r"^(?:\*(?:\s*\*){2,}|(?:-|\u2014|\u2013){3,}|#{3,})$")
FRONT_MATTER = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)


@dataclass
class Chapter:
    title: str
    html: str
    file_name: str


@dataclass
class BookSpec:
    slug: str
    title: str
    author: str
    language: str
    publisher: str
    rights: str
    subtitle: str | None = None
    genre: str | None = None
    series: str | None = None
    series_index: float | int | None = None
    description: str | None = None
    status: str = "awaiting_manuscript"
    chapters: list[Chapter] = field(default_factory=list)
    cover_path: Path | None = None
    identifier: str = ""


def load_catalog(path: Path = CATALOG_PATH) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    if not data or "books" not in data:
        raise SystemExit(f"Catalog is missing books: {path}")
    return data


def books_by_slug(catalog: dict[str, Any] | None = None) -> dict[str, dict[str, Any]]:
    catalog = catalog or load_catalog()
    return {book["slug"]: book for book in catalog["books"]}


def next_awaiting(catalog: dict[str, Any] | None = None) -> dict[str, Any] | None:
    catalog = catalog or load_catalog()
    waiting = [book for book in catalog["books"] if book.get("status") == "awaiting_manuscript"]
    waiting.sort(key=lambda book: book.get("queue", 999))
    return waiting[0] if waiting else None


def parse_front_matter(text: str) -> tuple[dict[str, Any], str]:
    match = FRONT_MATTER.match(text)
    if not match:
        return {}, text
    meta = yaml.safe_load(match.group(1)) or {}
    return meta, text[match.end() :]


def markdown_to_html(text: str) -> str:
    markup = markdown.markdown(
        text,
        extensions=["extra", "sane_lists", "smarty"],
        output_format="xhtml",
    )
    markup = re.sub(r"<hr\s*/?>", '<p class="scene-break">* * *</p>', markup, flags=re.IGNORECASE)
    markup = re.sub(r"<p>\s*\*\s+\*\s+\*\s*</p>", '<p class="scene-break">* * *</p>', markup)
    return markup


def wrap_paragraphs(text: str) -> str:
    blocks = re.split(r"\n\s*\n", text.strip())
    parts: list[str] = []
    first = True
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        if SCENE_BREAK.match(block.replace(" ", "")) or SCENE_BREAK.match(block):
            parts.append('<p class="scene-break">* * *</p>')
            first = True
            continue
        escaped = xml_escape(re.sub(r"\s+", " ", block))
        css = ' class="first"' if first else ""
        parts.append(f"<p{css}>{escaped}</p>")
        first = False
    return "\n".join(parts)


def heading_to_filename(index: int, title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or f"chapter-{index:02d}"
    return f"chap_{index:02d}_{slug[:40]}.xhtml"


def split_markdown_chapters(text: str) -> list[Chapter]:
    lines = text.replace("\r\n", "\n").split("\n")
    heading_pattern = re.compile(r"^(#{1,2})\s+(.+?)\s*$")
    sections: list[tuple[str, list[str]]] = []
    current_title = "Chapter"
    current_lines: list[str] = []
    found_heading = False

    for line in lines:
        match = heading_pattern.match(line)
        if match:
            found_heading = True
            if current_lines or sections:
                sections.append((current_title, current_lines))
            current_title = match.group(2).strip()
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines or not sections:
        sections.append((current_title, current_lines))

    if not found_heading:
        return split_plain_chapters(text)

    chapters: list[Chapter] = []
    for index, (title, body_lines) in enumerate(sections, start=1):
        body = "\n".join(body_lines).strip()
        if not body and title == "Chapter":
            continue
        inner = markdown_to_html(body) if body else ""
        inner = mark_first_paragraphs(inner)
        html_body = f"<h1 class='chapter-title'>{xml_escape(title)}</h1>\n{inner}"
        chapters.append(Chapter(title=title, html=html_body, file_name=heading_to_filename(index, title)))
    return chapters or [Chapter("Chapter", wrap_paragraphs(text), "chap_01.xhtml")]


def split_plain_chapters(text: str) -> list[Chapter]:
    lines = text.replace("\r\n", "\n").split("\n")
    sections: list[tuple[str, list[str]]] = []
    current_title = "Chapter"
    current_lines: list[str] = []
    found = False

    for line in lines:
        stripped = line.strip()
        if stripped and (NUMBERED_CHAPTER.match(stripped) or CHAPTER_LINE.match(stripped) and len(stripped) < 80):
            found = True
            if current_lines or sections:
                sections.append((current_title, current_lines))
            current_title = re.sub(r"\s+", " ", stripped)
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines or not sections:
        sections.append((current_title, current_lines))

    if not found:
        return [
            Chapter(
                title="Chapter",
                html=f"<h1 class='chapter-title'>Chapter</h1>\n{wrap_paragraphs(text)}",
                file_name="chap_01.xhtml",
            )
        ]

    chapters: list[Chapter] = []
    for index, (title, body_lines) in enumerate(sections, start=1):
        body = "\n".join(body_lines).strip()
        if not body and title == "Chapter":
            continue
        html_body = f"<h1 class='chapter-title'>{xml_escape(title)}</h1>\n{wrap_paragraphs(body)}"
        chapters.append(Chapter(title=title, html=html_body, file_name=heading_to_filename(index, title)))
    return chapters


def split_html_chapters(markup: str) -> list[Chapter]:
    from lxml import html as lhtml

    root = lhtml.fromstring(markup)
    headings = root.xpath("//h1|//h2")
    if not headings:
        body = root.body if root.tag == "html" and root.body is not None else root
        inner = "".join(lhtml.tostring(child, encoding="unicode") for child in body)
        return [Chapter("Chapter", f"<h1 class='chapter-title'>Chapter</h1>\n{inner}", "chap_01.xhtml")]

    chapters: list[Chapter] = []
    for index, heading in enumerate(headings, start=1):
        title = " ".join(heading.text_content().split()) or f"Chapter {index}"
        parts: list[str] = []
        sibling = heading.getnext()
        while sibling is not None and sibling.tag not in ("h1", "h2"):
            parts.append(lhtml.tostring(sibling, encoding="unicode"))
            sibling = sibling.getnext()
        inner = mark_first_paragraphs("".join(parts))
        html_body = f"<h1 class='chapter-title'>{xml_escape(title)}</h1>\n{inner}"
        chapters.append(Chapter(title=title, html=html_body, file_name=heading_to_filename(index, title)))
    return chapters


def mark_first_paragraphs(markup: str) -> str:
    if not markup:
        return ""
    return re.sub(r"<p>", '<p class="first">', markup, count=1)


def docx_to_markdown(path: Path) -> str:
    pandoc = shutil.which("pandoc")
    if pandoc:
        result = subprocess.run(
            [pandoc, str(path), "-t", "markdown", "--wrap=none"],
            check=True,
            capture_output=True,
            text=True,
        )
        return result.stdout

    from docx import Document

    document = Document(str(path))
    lines: list[str] = []
    for paragraph in document.paragraphs:
        style = (paragraph.style.name or "").lower() if paragraph.style else ""
        text = paragraph.text.strip()
        if not text:
            lines.append("")
            continue
        if "heading 1" in style:
            lines.append(f"# {text}")
        elif "heading 2" in style:
            lines.append(f"## {text}")
        else:
            lines.append(text)
    return "\n".join(lines)


def load_manuscript_text(path: Path) -> tuple[str, str]:
    suffix = path.suffix.lower()
    if suffix in {".md", ".markdown", ".txt"}:
        return path.read_text(encoding="utf-8"), suffix
    if suffix in {".html", ".htm"}:
        return path.read_text(encoding="utf-8"), suffix
    if suffix in {".docx", ".odt", ".rtf"}:
        if suffix != ".docx" and not shutil.which("pandoc"):
            raise SystemExit(f"{suffix} conversion requires pandoc.")
        return docx_to_markdown(path), ".md"
    raise SystemExit(f"Unsupported manuscript type: {path}")


def chapters_from_text(text: str, suffix: str) -> list[Chapter]:
    if suffix in {".html", ".htm"}:
        return split_html_chapters(text)
    if suffix in {".md", ".markdown"}:
        return split_markdown_chapters(text)
    return split_plain_chapters(text)


def chapters_from_folder(folder: Path) -> list[Chapter]:
    files = sorted(
        child
        for child in folder.iterdir()
        if child.is_file() and child.suffix.lower() in MANUSCRIPT_SUFFIXES
    )
    if not files:
        raise SystemExit(f"No chapter files found in {folder}")
    chapters: list[Chapter] = []
    for index, path in enumerate(files, start=1):
        text, suffix = load_manuscript_text(path)
        _, body = parse_front_matter(text)
        title = path.stem.replace("_", " ").replace("-", " ").strip()
        heading_match = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
        if heading_match:
            title = heading_match.group(1).strip()
            body = body.replace(heading_match.group(0), "", 1)
        if suffix in {".html", ".htm"}:
            inner = body
        elif suffix in {".md", ".markdown"}:
            inner = mark_first_paragraphs(markdown_to_html(body))
        else:
            inner = wrap_paragraphs(body)
        html_body = f"<h1 class='chapter-title'>{xml_escape(title)}</h1>\n{inner}"
        chapters.append(Chapter(title=title, html=html_body, file_name=heading_to_filename(index, title)))
    return chapters


def find_manuscript(slug: str, explicit: Path | None = None) -> Path | None:
    if explicit:
        if not explicit.exists():
            raise SystemExit(f"Manuscript not found: {explicit}")
        return explicit

    folder = MANUSCRIPTS_DIR / slug
    if folder.is_dir():
        chapters = folder / "chapters"
        if chapters.is_dir() and any(chapters.iterdir()):
            return chapters
        for name in MANUSCRIPT_NAMES:
            candidate = folder / name
            if candidate.exists():
                return candidate
        extras = [
            child
            for child in folder.iterdir()
            if child.is_file() and child.suffix.lower() in MANUSCRIPT_SUFFIXES
        ]
        if extras:
            return extras[0]

    incoming = MANUSCRIPTS_DIR / "_incoming"
    if incoming.is_dir():
        matches = [
            child
            for child in incoming.iterdir()
            if child.is_file() and slug in child.stem.lower().replace("_", "-").replace(" ", "-")
        ]
        if matches:
            return matches[0]
    return None


def find_cover(slug: str, explicit: Path | None = None) -> Path | None:
    if explicit:
        return explicit if explicit.exists() else None
    folder = MANUSCRIPTS_DIR / slug
    if folder.is_dir():
        for name in COVER_NAMES:
            candidate = folder / name
            if candidate.exists():
                return candidate
    return None


def generate_placeholder_cover(spec: BookSpec, destination: Path) -> Path:
    width, height = 1600, 2560
    image = Image.new("RGB", (width, height), "#1f2a24")
    draw = ImageDraw.Draw(image)
    draw.rectangle((80, 80, width - 80, height - 80), outline="#d4c4a8", width=6)
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
    title_font = ImageFont.truetype(font_path, 92) if Path(font_path).exists() else ImageFont.load_default()
    author_font = ImageFont.truetype(font_path, 48) if Path(font_path).exists() else ImageFont.load_default()

    def wrapped(text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
        words = text.split()
        lines: list[str] = []
        current = ""
        for word in words:
            trial = f"{current} {word}".strip()
            if draw.textlength(trial, font=font) <= max_width:
                current = trial
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines or [text]

    title_lines = wrapped(spec.title, title_font, width - 280)
    y = height // 3
    for line in title_lines:
        line_width = draw.textlength(line, font=title_font)
        draw.text(((width - line_width) / 2, y), line, font=title_font, fill="#f4efe4")
        y += 120
    if spec.subtitle:
        y += 20
        sub_font = ImageFont.truetype(font_path, 40) if Path(font_path).exists() else author_font
        for line in wrapped(spec.subtitle, sub_font, width - 320):
            line_width = draw.textlength(line, font=sub_font)
            draw.text(((width - line_width) / 2, y), line, font=sub_font, fill="#d4c4a8")
            y += 56
    author = spec.author
    author_width = draw.textlength(author, font=author_font)
    draw.text(((width - author_width) / 2, height - 360), author, font=author_font, fill="#d4c4a8")
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "JPEG", quality=90)
    return destination


def spec_from_catalog(book: dict[str, Any], defaults: dict[str, Any], overrides: dict[str, Any] | None = None) -> BookSpec:
    overrides = overrides or {}
    slug = book["slug"]
    title = overrides.get("title") or book["title"]
    identifier = str(uuid.uuid5(uuid.NAMESPACE_URL, f"https://authormichaelyoung.com/ebook/{slug}"))
    return BookSpec(
        slug=slug,
        title=title,
        author=overrides.get("author") or defaults.get("author", "Michael D. Young"),
        language=overrides.get("language") or defaults.get("language", "en"),
        publisher=overrides.get("publisher") or defaults.get("publisher", "Independently published"),
        rights=overrides.get("rights") or defaults.get("rights", "All rights reserved."),
        subtitle=overrides.get("subtitle") or book.get("subtitle"),
        genre=overrides.get("genre") or book.get("genre"),
        series=overrides.get("series") or book.get("series"),
        series_index=overrides.get("series_index") or book.get("series_index"),
        description=overrides.get("description") or book.get("description"),
        status=book.get("status", "awaiting_manuscript"),
        identifier=identifier,
    )


def title_page_html(spec: BookSpec) -> str:
    subtitle = f'<p class="subtitle">{xml_escape(spec.subtitle)}</p>' if spec.subtitle else ""
    series = ""
    if spec.series:
        label = spec.series
        if spec.series_index is not None:
            label = f"{spec.series} · Book {spec.series_index}"
        series = f'<p class="subtitle">{xml_escape(str(label))}</p>'
    return f"""
<div class="titlepage">
  <p class="title">{xml_escape(spec.title)}</p>
  {subtitle}
  {series}
  <p class="author">{xml_escape(spec.author)}</p>
</div>
"""


def copyright_html(spec: BookSpec) -> str:
    description = f"<p>{xml_escape(spec.description.strip())}</p>" if spec.description else ""
    return f"""
<div class="copyright">
  <p>{xml_escape(spec.title)}</p>
  <p>{xml_escape(spec.rights)}</p>
  <p>This ebook is a reflowable edition. Text size, font, and layout follow the reader’s settings.</p>
  {description}
</div>
"""


def build_epub(spec: BookSpec, destination: Path, stylesheet: str) -> Path:
    book = epub.EpubBook()
    book.set_identifier(spec.identifier)
    book.set_title(spec.title)
    book.set_language(spec.language)
    book.add_author(spec.author)
    book.add_metadata("DC", "publisher", spec.publisher)
    book.add_metadata("DC", "rights", spec.rights)
    if spec.description:
        book.add_metadata("DC", "description", spec.description.strip())
    if spec.genre:
        book.add_metadata("DC", "subject", spec.genre)
    if spec.subtitle:
        book.add_metadata("DC", "alternative", spec.subtitle)
    if spec.series:
        book.add_metadata(
            "OPF",
            "meta",
            spec.series,
            {"name": "calibre:series", "content": spec.series},
        )
        if spec.series_index is not None:
            book.add_metadata(
                "OPF",
                "meta",
                str(spec.series_index),
                {"name": "calibre:series_index", "content": str(spec.series_index)},
            )

    css = epub.EpubItem(uid="style", file_name="styles/epub.css", media_type="text/css", content=stylesheet.encode("utf-8"))
    book.add_item(css)

    if spec.cover_path and spec.cover_path.exists():
        book.set_cover("cover.jpg", spec.cover_path.read_bytes())

    title_item = epub.EpubHtml(title="Title Page", file_name="title.xhtml", lang=spec.language)
    title_item.content = title_page_html(spec)
    title_item.add_item(css)
    book.add_item(title_item)

    copyright_item = epub.EpubHtml(title="Copyright", file_name="copyright.xhtml", lang=spec.language)
    copyright_item.content = copyright_html(spec)
    copyright_item.add_item(css)
    book.add_item(copyright_item)

    chapter_items: list[epub.EpubHtml] = []
    toc_nodes = []
    for chapter in spec.chapters:
        item = epub.EpubHtml(title=chapter.title, file_name=chapter.file_name, lang=spec.language)
        item.content = chapter.html
        item.add_item(css)
        book.add_item(item)
        chapter_items.append(item)
        toc_nodes.append(item)

    book.toc = tuple(toc_nodes)
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    book.spine = ["cover", "nav", title_item, copyright_item, *chapter_items]

    destination.parent.mkdir(parents=True, exist_ok=True)
    epub.write_epub(str(destination), book, {"epub3_landmark": True})
    return destination


def convert_kindle(epub_path: Path) -> dict[str, Path]:
    converter = shutil.which("ebook-convert")
    if not converter:
        return {}
    # Calibre ships its own lxml/html5-parser. A pip-installed lxml in the
    # user site can make ebook-convert abort with a libxml2 version mismatch.
    env = os.environ.copy()
    env["PYTHONNOUSERSITE"] = "1"
    env.pop("PYTHONPATH", None)
    outputs: dict[str, Path] = {}
    for fmt in ("mobi", "azw3"):
        target = epub_path.with_suffix(f".{fmt}")
        command = [converter, str(epub_path), str(target)]
        if fmt == "mobi":
            command.extend(["--mobi-file-type=both"])
        result = subprocess.run(command, env=env, capture_output=True, text=True)
        if result.returncode != 0:
            raise SystemExit(
                f"Calibre failed to write {fmt.upper()}:\n{result.stderr or result.stdout}"
            )
        outputs[fmt] = target
    return outputs


def copy_artifacts(files: list[Path]) -> None:
    if not ARTIFACTS_DIR.exists():
        return
    for path in files:
        if path.exists():
            shutil.copy2(path, ARTIFACTS_DIR / path.name)


def safe_filename(title: str) -> str:
    cleaned = re.sub(r"[^\w\s\-']+", "", title, flags=re.UNICODE).strip()
    cleaned = re.sub(r"\s+", "_", cleaned)
    return cleaned or "book"


def validate_epub(path: Path) -> list[str]:
    problems: list[str] = []
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        if not names or names[0] != "mimetype":
            problems.append("EPUB mimetype file is not the first zip entry.")
        else:
            info = archive.getinfo("mimetype")
            if info.compress_type != zipfile.ZIP_STORED:
                problems.append("EPUB mimetype must be uncompressed.")
            if archive.read("mimetype") != b"application/epub+zip":
                problems.append("EPUB mimetype value is incorrect.")
        if "META-INF/container.xml" not in names:
            problems.append("Missing META-INF/container.xml.")
        has_html = any(name.endswith((".xhtml", ".html")) for name in names)
        if not has_html:
            problems.append("EPUB has no XHTML documents.")
        has_css = any(name.endswith(".css") for name in names)
        if not has_css:
            problems.append("EPUB is missing a stylesheet.")
    return problems


def build_from_manuscript(
    slug: str,
    manuscript: Path | None = None,
    cover: Path | None = None,
    catalog: dict[str, Any] | None = None,
) -> dict[str, Path]:
    catalog = catalog or load_catalog()
    lookup = books_by_slug(catalog)
    if slug not in lookup:
        raise SystemExit(f"Unknown slug '{slug}'. Use --list to see titles.")
    source = find_manuscript(slug, manuscript)
    if source is None:
        nxt = next_awaiting(catalog)
        hint = f" Next up: {nxt['title']}." if nxt else ""
        raise SystemExit(
            f"No manuscript found for {lookup[slug]['title']}.{hint}\n"
            f"Place a file at ebooks/manuscripts/{slug}/manuscript.md (or .docx/.html/.txt),\n"
            "or pass --input /path/to/manuscript."
        )

    text = ""
    suffix = source.suffix.lower() if source.is_file() else ".md"
    overrides: dict[str, Any] = {}
    if source.is_dir():
        chapters = chapters_from_folder(source)
    else:
        text, suffix = load_manuscript_text(source)
        overrides, body = parse_front_matter(text)
        chapters = chapters_from_text(body, suffix)

    spec = spec_from_catalog(lookup[slug], catalog.get("defaults", {}), overrides)
    spec.chapters = chapters
    spec.cover_path = find_cover(slug, cover)
    out_dir = OUTPUT_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    if spec.cover_path is None:
        spec.cover_path = generate_placeholder_cover(spec, out_dir / "cover.jpg")

    stylesheet = STYLE_PATH.read_text(encoding="utf-8")
    epub_path = out_dir / f"{safe_filename(spec.title)}.epub"
    build_epub(spec, epub_path, stylesheet)
    problems = validate_epub(epub_path)
    if problems:
        raise SystemExit("EPUB validation failed:\n- " + "\n- ".join(problems))

    outputs = {"epub": epub_path, "cover": spec.cover_path}
    outputs.update(convert_kindle(epub_path))
    copy_artifacts([path for path in outputs.values() if path])
    return outputs


def build_sample() -> dict[str, Path]:
    sample = ROOT / "tests" / "fixtures" / "sample_book.md"
    catalog = {
        "defaults": {
            "author": "Michael D. Young",
            "language": "en",
            "publisher": "Independently published",
            "rights": "Sample file for pipeline testing. Not a published book.",
        },
        "books": [
            {
                "slug": "_sample",
                "title": "Sample Reflowable Book",
                "subtitle": "Pipeline fixture",
                "genre": "Sample",
                "description": "A tiny fixture used to verify EPUB and MOBI output.",
                "status": "ready",
            }
        ],
    }
    text, suffix = load_manuscript_text(sample)
    overrides, body = parse_front_matter(text)
    spec = spec_from_catalog(catalog["books"][0], catalog["defaults"], overrides)
    spec.chapters = chapters_from_text(body, suffix)
    out_dir = OUTPUT_DIR / "_sample"
    out_dir.mkdir(parents=True, exist_ok=True)
    spec.cover_path = generate_placeholder_cover(spec, out_dir / "cover.jpg")
    epub_path = out_dir / f"{safe_filename(spec.title)}.epub"
    build_epub(spec, epub_path, STYLE_PATH.read_text(encoding="utf-8"))
    problems = validate_epub(epub_path)
    if problems:
        raise SystemExit("Sample EPUB validation failed:\n- " + "\n- ".join(problems))
    outputs = {"epub": epub_path, "cover": spec.cover_path}
    outputs.update(convert_kindle(epub_path))
    copy_artifacts([path for path in outputs.values() if path])
    return outputs


def print_queue(catalog: dict[str, Any]) -> None:
    print(f"{'Q':<4}{'Status':<22}{'Title'}")
    for book in sorted(catalog["books"], key=lambda item: item.get("queue", 999)):
        print(f"{book.get('queue', '-'):<4}{book.get('status', ''):<22}{book['title']}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build reflowable EPUB and MOBI files.")
    parser.add_argument("--list", action="store_true", help="Show the conversion queue.")
    parser.add_argument("--next", action="store_true", help="Show the next title awaiting a manuscript.")
    parser.add_argument("--slug", help="Catalog slug to build.")
    parser.add_argument("--input", type=Path, help="Path to a manuscript file or chapters folder.")
    parser.add_argument("--cover", type=Path, help="Optional cover image.")
    parser.add_argument("--sample", action="store_true", help="Build the pipeline fixture book.")
    args = parser.parse_args(argv)

    if args.sample:
        outputs = build_sample()
        print("Built sample ebook:")
        for kind, path in outputs.items():
            print(f"  {kind}: {path}")
        return 0

    catalog = load_catalog()
    if args.list:
        print_queue(catalog)
        return 0

    if args.next or not args.slug:
        nxt = next_awaiting(catalog)
        if not nxt:
            print("Every listed title has a manuscript status other than awaiting_manuscript.")
            return 0
        print(f"Next manuscript needed: {nxt['title']}")
        print(f"Slug: {nxt['slug']}")
        if nxt.get("subtitle"):
            print(f"Subtitle: {nxt['subtitle']}")
        if nxt.get("description"):
            print(nxt["description"].strip())
        print()
        print("Send the manuscript as Markdown, Word, HTML, or plain text.")
        print("Optional: cover.jpg, plus title/author confirmation if they differ from the catalog.")
        if not args.slug:
            return 0

    outputs = build_from_manuscript(args.slug, args.input, args.cover, catalog)
    print(f"Built {args.slug}:")
    for kind, path in outputs.items():
        print(f"  {kind}: {path}")
    if "mobi" not in outputs:
        print("Calibre was not found, so MOBI/AZW3 were skipped. EPUB is ready for Kindle Direct Publishing.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
