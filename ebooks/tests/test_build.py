from __future__ import annotations

import sys
import zipfile
from pathlib import Path

import pytest
import yaml

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))

import build_ebook  # noqa: E402


def test_catalog_has_unique_queue_and_starts_with_promised_land():
    catalog = build_ebook.load_catalog()
    books = catalog["books"]
    slugs = [book["slug"] for book in books]
    titles = [book["title"] for book in books]
    assert len(books) == 22
    assert len(set(slugs)) == 22
    assert titles[0] == "Tales from the Promised Land"
    assert titles.count("Age of Archangels") == 1
    assert "Wally the Web Wizard" in titles
    assert "The Song of the Saints" in titles
    assert "The Songs of the Saints" in titles
    queues = [book["queue"] for book in books]
    assert queues == list(range(1, 23))


def test_next_awaiting_is_first_in_queue():
    nxt = build_ebook.next_awaiting()
    assert nxt is not None
    assert nxt["slug"] == "tales-from-the-promised-land"


def test_split_markdown_chapters_uses_headings():
    text = "# One\n\nHello.\n\n# Two\n\nGoodbye.\n"
    chapters = build_ebook.split_markdown_chapters(text)
    assert [chapter.title for chapter in chapters] == ["One", "Two"]
    assert "Hello" in chapters[0].html
    assert "chapter-title" in chapters[0].html


def test_split_plain_chapters_detects_chapter_labels():
    text = "Chapter 1: Arrival\n\nOnce upon a morning.\n\nChapter 2: Departure\n\nThe road bent west.\n"
    chapters = build_ebook.split_plain_chapters(text)
    assert len(chapters) == 2
    assert chapters[0].title.startswith("Chapter 1")
    assert "Once upon a morning" in chapters[0].html


def test_stylesheet_is_reflowable():
    css = (ROOT / "styles" / "epub.css").read_text(encoding="utf-8")
    assert "max-width: 100%" in css
    assert "@page" not in css
    assert "position: absolute" not in css
    assert "width: 100vw" not in css


def test_sample_epub_and_kindle_build(tmp_path, monkeypatch):
    monkeypatch.setattr(build_ebook, "OUTPUT_DIR", tmp_path)
    outputs = build_ebook.build_sample()
    epub_path = outputs["epub"]
    assert epub_path.exists()
    problems = build_ebook.validate_epub(epub_path)
    assert problems == []

    with zipfile.ZipFile(epub_path) as archive:
        names = archive.namelist()
        assert names[0] == "mimetype"
        assert any(name.endswith(".css") for name in names)
        html_files = [name for name in names if name.endswith(".xhtml")]
        assert html_files
        joined = "\n".join(archive.read(name).decode("utf-8") for name in html_files)
        assert "The First Chapter" in joined
        assert "A Second Beginning" in joined
        assert "scene-break" in joined

    if "mobi" in outputs:
        assert outputs["mobi"].exists()
        assert outputs["mobi"].stat().st_size > 1000
    if "azw3" in outputs:
        assert outputs["azw3"].exists()


def test_missing_manuscript_explains_next_title():
    with pytest.raises(SystemExit) as raised:
        build_ebook.build_from_manuscript("tales-from-the-promised-land")
    message = str(raised.value)
    assert "Tales from the Promised Land" in message
    assert "manuscript.md" in message
