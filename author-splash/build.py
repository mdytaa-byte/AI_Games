#!/usr/bin/env python3
"""Assemble preview pages, WordPress paste files, plugin copies, and the plugin zip
from canonical markup + assets/splash.css."""

from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSS = (ROOT / "assets" / "splash.css").read_text(encoding="utf-8")
FONTS = (
    "https://fonts.googleapis.com/css2?family=Grenze:ital,wght@0,400;0,600;0,700;1,400"
    "&family=Source+Sans+3:wght@400;600;700"
    "&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400"
    "&display=swap"
)

PAGES = [
    {
        "markup": "wordpress/splash-markup.html",
        "preview": "index.html",
        "title": "Michael D. Young — Start the Quest",
        "description": "Family-friendly comedic fantasy by Michael D. Young. Start with A Wonderful Day for a Quest.",
        "canonical": "https://authormichaelyoung.com/",
        "custom_html": "wordpress/custom-html-with-styles.html",
        "gutenberg": "wordpress/gutenberg-pattern.html",
        "plugin_template": "wordpress-plugin/templates/splash-markup.html",
    },
    {
        "markup": "wordpress/chess-splash-markup.html",
        "preview": "chess-quest.html",
        "title": "The Chess Quest Series — Michael D. Young",
        "description": "Seven days. Four trials. The pawn has your initials. Start Paladin: Pawn or read the free Chess Quest prequel.",
        "canonical": "https://authormichaelyoung.com/the-chess-quest-series/",
        "custom_html": "wordpress/chess-custom-html-with-styles.html",
        "gutenberg": "wordpress/chess-gutenberg-pattern.html",
        "plugin_template": "wordpress-plugin/templates/chess-splash-markup.html",
    },
    {
        "markup": "wordpress/picture-splash-markup.html",
        "preview": "picture-books.html",
        "title": "Picture Books by David Michaels — Michael D. Young",
        "description": "Every legend has a résumé. Square, rhyming picture books in the New Jobs for Mythical Characters series by David Michaels.",
        "canonical": "https://authormichaelyoung.com/picture-books/",
        "custom_html": "wordpress/picture-custom-html-with-styles.html",
        "gutenberg": "wordpress/picture-gutenberg-pattern.html",
        "plugin_template": "wordpress-plugin/templates/picture-splash-markup.html",
    },
]


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}")


def preview_html(page: dict, markup: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#163a45">
  <title>{page["title"]}</title>
  <meta name="description" content="{page["description"]}">
  <link rel="canonical" href="{page["canonical"]}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{FONTS}" rel="stylesheet">
  <style>
    html, body {{ margin: 0; background: #f7f3ee; }}
{CSS}
  </style>
</head>
<body>
{markup}
</body>
</html>
"""


def custom_html(markup: str) -> str:
    return (
        "<!-- Paste this entire block into a WordPress Custom HTML block. -->\n"
        "<style>\n"
        f'@import url("{FONTS}");\n'
        f"{CSS}\n"
        "</style>\n"
        f"{markup}"
    )


def gutenberg(markup: str) -> str:
    body = markup.rstrip() + "\n"
    return f"<!-- wp:html -->\n{body}<!-- /wp:html -->\n"


def copy_css() -> None:
    for dest in (
        ROOT / "wordpress" / "additional.css",
        ROOT / "wordpress-plugin" / "assets" / "splash.css",
    ):
        dest.write_text(CSS, encoding="utf-8")
        print(f"wrote {dest.relative_to(ROOT)}")


def zip_plugin() -> None:
    plugin_dir = ROOT / "wordpress-plugin"
    zip_path = plugin_dir / "amy-author-splash.zip"
    members = [plugin_dir / "amy-author-splash.php"]
    members += sorted((plugin_dir / "assets").rglob("*"))
    members += sorted((plugin_dir / "templates").rglob("*"))
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in members:
            if path.is_file() and path.suffix != ".zip":
                zf.write(path, path.relative_to(plugin_dir).as_posix())
    print(f"wrote {zip_path.relative_to(ROOT)}")


def main() -> None:
    copy_css()
    for page in PAGES:
        markup = (ROOT / page["markup"]).read_text(encoding="utf-8")
        if not markup.endswith("\n"):
            markup += "\n"
        write(ROOT / page["preview"], preview_html(page, markup.rstrip("\n")))
        write(ROOT / page["custom_html"], custom_html(markup))
        write(ROOT / page["gutenberg"], gutenberg(markup))
        shutil.copyfile(ROOT / page["markup"], ROOT / page["plugin_template"])
        print(f"wrote {page['plugin_template']}")
    zip_plugin()


if __name__ == "__main__":
    main()
