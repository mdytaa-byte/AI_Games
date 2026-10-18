from __future__ import annotations

from pathlib import Path

import pymupdf

import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import extract_print_pdf  # noqa: E402


def test_title_case_handles_apostrophes_and_small_words():
    assert extract_print_pdf.title_case("ESTHER’S CHOICE") == "Esther’s Choice"
    assert extract_print_pdf.title_case("THE MISSION OF ALMA AND AMULEK") == "The Mission of Alma and Amulek"
    assert extract_print_pdf.title_case("(3 NEPHI 3-4)") == "(3 Nephi 3-4)"


def test_sentence_boundary_starts_a_paragraph():
    line = extract_print_pdf.TextLine(1, 100, 50, 300, 12, "Times", "Helorum did not lower his bow.", "body")
    assert extract_print_pdf.is_paragraph_start(line, left_margin=50, current="from father.”")
    assert not extract_print_pdf.is_paragraph_start(line, left_margin=50, current="from father,")


def test_extract_chapters_from_simple_print_pdf(tmp_path):
    pdf_path = tmp_path / "sample.pdf"
    doc = pymupdf.open()
    page = doc.new_page(width=360, height=576)
    page.insert_text((120, 80), "A SHORT TALE", fontsize=14, fontname="helv")
    page.insert_text((72, 160), "Once upon a morning the river", fontsize=12, fontname="times-roman")
    page.insert_text((50, 184), "rose against the stones.", fontsize=12, fontname="times-roman")
    page.insert_text((72, 220), "Then the sun came out.", fontsize=12, fontname="times-roman")
    doc.save(pdf_path)
    doc.close()

    chapters = extract_print_pdf.extract_chapters(pdf_path)
    assert len(chapters) == 1
    title, paragraphs = chapters[0]
    assert title == "A Short Tale"
    assert any("Once upon a morning" in para for para in paragraphs)
    assert any("Then the sun came out." in para for para in paragraphs)
    doc = pymupdf.open()
    page = doc.new_page(width=360, height=576)
    page.insert_text((120, 80), "A SHORT TALE", fontsize=14, fontname="helv")
    page.insert_text((72, 160), "Once upon a morning the river", fontsize=12, fontname="times-roman")
    page.insert_text((50, 184), "rose against the stones.", fontsize=12, fontname="times-roman")
    page.insert_text((72, 220), "Then the sun came out.", fontsize=12, fontname="times-roman")
    doc.save(pdf_path)
    doc.close()

    chapters = extract_print_pdf.extract_chapters(pdf_path)
    assert len(chapters) == 1
    title, paragraphs = chapters[0]
    assert title == "A Short Tale"
    assert any("Once upon a morning" in para for para in paragraphs)
    assert any("Then the sun came out." in para for para in paragraphs)
