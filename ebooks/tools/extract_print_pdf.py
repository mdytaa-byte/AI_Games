#!/usr/bin/env python3
"""Extract a reflowable Markdown manuscript from a print-layout PDF.

Tuned for tagged InDesign paperbacks: story titles in a display font,
body text in a serif face, first-line indents, and discretionary hyphens.
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

import pymupdf

SMALL_WORDS = {"a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"}
SKIP_HEADERS = {"the boss level and other miracles"}
SOFT_HYPHEN = "\u00ad"
HYPHEN_CHARS = {"-", "\u2010", "\u2011", SOFT_HYPHEN}


@dataclass
class TextLine:
    page: int
    y0: float
    x0: float
    x1: float
    size: float
    font: str
    text: str
    kind: str  # title, body, skip


def title_case(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text).strip()
    words = cleaned.split(" ")
    out: list[str] = []
    last = len(words) - 1
    for index, raw in enumerate(words):
        prefix = ""
        suffix = ""
        core = raw
        while core and core[0] in "([\"'“‘":
            prefix += core[0]
            core = core[1:]
        while core and core[-1] in ")].,:;\"'”’":
            suffix = core[-1] + suffix
            core = core[:-1]
        if not core:
            out.append(raw)
            continue
        lower = core.lower()
        if index not in (0, last) and lower in SMALL_WORDS:
            converted = lower
        elif core[:1].isdigit():
            converted = core[0] + core[1:].lower()
        else:
            converted = core[:1].upper() + core[1:].lower()
        out.append(prefix + converted + suffix)
    return " ".join(out)


def keep_span(span: dict) -> bool:
    text = span.get("text", "")
    size = float(span.get("size") or 0)
    font = span.get("font") or ""
    stripped = text.strip()
    if size < 9:
        return False
    if stripped.isdigit() and size <= 10.5:
        return False
    if "Minion" in font and stripped.isdigit():
        return False
    if stripped.lower() in SKIP_HEADERS:
        return False
    return bool(stripped or text.isspace())


def page_lines(page: pymupdf.Page, page_number: int) -> list[TextLine]:
    gathered: list[TextLine] = []
    data = page.get_text("dict")
    for block in data.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            spans = [span for span in line.get("spans", []) if keep_span(span)]
            if not spans:
                continue
            text = "".join(span["text"] for span in spans)
            text = text.replace("\n", " ").strip()
            text = text.replace(SOFT_HYPHEN, SOFT_HYPHEN)
            if not text:
                continue
            if text.lower() in SKIP_HEADERS:
                continue
            size = float(spans[0]["size"])
            font = spans[0]["font"]
            x0, y0, x1, _y1 = line["bbox"]
            if 13.5 <= size <= 16:
                kind = "title"
            elif "Myriad" in font:
                kind = "skip"
            else:
                kind = "body"
            gathered.append(
                TextLine(
                    page=page_number,
                    y0=y0,
                    x0=x0,
                    x1=x1,
                    size=size,
                    font=font,
                    text=text,
                    kind=kind,
                )
            )
    gathered.sort(key=lambda item: (item.y0, item.x0))
    return merge_same_row(gathered)


def merge_same_row(lines: list[TextLine]) -> list[TextLine]:
    merged: list[TextLine] = []
    for line in lines:
        if merged and line.kind == merged[-1].kind and abs(line.y0 - merged[-1].y0) < 2.8:
            prev = merged[-1]
            gap = " " if not prev.text.endswith(tuple(HYPHEN_CHARS)) else ""
            prev.text = f"{prev.text.rstrip()}{gap}{line.text.lstrip()}"
            prev.x1 = max(prev.x1, line.x1)
            prev.x0 = min(prev.x0, line.x0)
            continue
        merged.append(line)
    return merged


def ends_with_break_hyphen(text: str) -> bool:
    stripped = text.rstrip()
    return bool(stripped) and stripped[-1] in HYPHEN_CHARS


def join_wrapped(previous: str, incoming: str) -> str:
    incoming = incoming.strip()
    if ends_with_break_hyphen(previous):
        return previous.rstrip().rstrip("".join(HYPHEN_CHARS)) + incoming
    if previous.endswith(" "):
        return previous + incoming
    return f"{previous} {incoming}"


def ended_sentence(text: str) -> bool:
    stripped = text.rstrip().rstrip('”"’\'')
    return bool(stripped) and stripped[-1] in ".?!"


def is_paragraph_start(line: TextLine, left_margin: float, current: str) -> bool:
    if not current:
        return False
    if ends_with_break_hyphen(current):
        return False
    if line.x0 >= left_margin + 14:
        return True
    incoming = line.text.lstrip()
    if not incoming:
        return False
    if ended_sentence(current) and (incoming.startswith(("“", '"')) or incoming[:1].isupper()):
        return True
    return False


def body_left_margin(lines: list[TextLine]) -> float:
    xs = [line.x0 for line in lines if line.kind == "body"]
    return min(xs) if xs else 0.0


def extract_chapters(pdf_path: Path) -> list[tuple[str, list[str]]]:
    document = pymupdf.open(pdf_path)
    chapters: list[tuple[str, list[str]]] = []
    current_title: str | None = None
    paragraphs: list[str] = []
    current = ""

    def flush_paragraph() -> None:
        nonlocal current
        text = re.sub(r"\s+", " ", current).replace(SOFT_HYPHEN, "").strip()
        if text:
            paragraphs.append(text)
        current = ""

    def flush_chapter() -> None:
        flush_paragraph()
        if current_title and paragraphs:
            chapters.append((current_title, paragraphs.copy()))
        paragraphs.clear()

    for index, page in enumerate(document, start=1):
        lines = [line for line in page_lines(page, index) if line.kind != "skip"]
        if not lines:
            continue
        left = body_left_margin(lines)
        for line in lines:
            if line.kind == "title":
                title = title_case(line.text)
                if current_title and title.startswith("("):
                    current_title = f"{current_title} {title}"
                    continue
                flush_chapter()
                current_title = title
                continue
            if current_title is None:
                continue
            if is_paragraph_start(line, left, current):
                flush_paragraph()
            current = join_wrapped(current, line.text) if current else line.text.strip()
    flush_chapter()
    return chapters


def to_markdown(title: str, author: str, subtitle: str | None, chapters: list[tuple[str, list[str]]]) -> str:
    front = ["---", f"title: {title}", f"author: {author}"]
    if subtitle:
        front.append(f"subtitle: {subtitle}")
    front.extend(["---", ""])
    parts = ["\n".join(front)]
    for heading, paragraphs in chapters:
        parts.append(f"# {heading}\n")
        for paragraph in paragraphs:
            parts.append(paragraph)
            parts.append("")
    return "\n".join(parts).rstrip() + "\n"


def extract_to_markdown(
    pdf_path: Path,
    title: str = "Tales of the Promised Land",
    author: str = "Michael D. Young",
    subtitle: str | None = "Book of Mormon Stories Your Teacher Didn’t Tell You",
) -> str:
    chapters = extract_chapters(pdf_path)
    if not chapters:
        raise SystemExit(f"No story titles found in {pdf_path}")
    return to_markdown(title, author, subtitle, chapters)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Extract Markdown from a print PDF.")
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--title", default="Tales of the Promised Land")
    parser.add_argument("--author", default="Michael D. Young")
    parser.add_argument("--subtitle", default="Book of Mormon Stories Your Teacher Didn’t Tell You")
    args = parser.parse_args(argv)
    markdown = extract_to_markdown(args.input, args.title, args.author, args.subtitle)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(markdown, encoding="utf-8")
        print(f"Wrote {args.output}")
    else:
        sys.stdout.write(markdown)
    chapters = extract_chapters(args.input)
    print(f"{len(chapters)} stories, {sum(len(p) for _, p in chapters)} paragraphs", file=sys.stderr)
    for heading, paragraphs in chapters:
        words = sum(len(p.split()) for p in paragraphs)
        print(f"  {heading}: {len(paragraphs)} paras, {words} words", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
