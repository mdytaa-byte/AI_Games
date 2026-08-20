#!/usr/bin/env python3
"""Assemble preview pages, WordPress paste files, plugin copies, and the plugin zip
from canonical markup + assets/landing.css."""

from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSS = (ROOT / "assets" / "landing.css").read_text(encoding="utf-8")
FONTS = (
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500"
    "&family=Source+Sans+3:wght@400;600;700"
    "&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400"
    "&display=swap"
)

PAGE = {
    "markup": "wordpress/splash-markup.html",
    "preview": "index.html",
    "title": "Brightbarrow Press",
    "description": "Stories that open a path. A new independent literary imprint.",
    "canonical": "https://authormichaelyoung.com/",
    "custom_html": "wordpress/custom-html-with-styles.html",
    "gutenberg": "wordpress/gutenberg-pattern.html",
    "plugin_template": "wordpress-plugin/templates/splash-markup.html",
}


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}")


def preview_html(markup: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#2b3344">
  <title>{PAGE["title"]}</title>
  <meta name="description" content="{PAGE["description"]}">
  <link rel="canonical" href="{PAGE["canonical"]}">
  <link rel="icon" href="assets/logo-mark.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{FONTS}" rel="stylesheet">
  <style>
    html, body {{ margin: 0; background: #f6f1e4; }}
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
        ROOT / "wordpress-plugin" / "assets" / "landing.css",
    ):
        dest.write_text(CSS, encoding="utf-8")
        print(f"wrote {dest.relative_to(ROOT)}")


def zip_plugin() -> None:
    plugin_dir = ROOT / "wordpress-plugin"
    zip_path = plugin_dir / "brightbarrow-press.zip"
    members = [plugin_dir / "brightbarrow-press.php"]
    members += sorted((plugin_dir / "assets").rglob("*"))
    members += sorted((plugin_dir / "templates").rglob("*"))
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in members:
            if path.is_file() and path.suffix != ".zip":
                zf.write(path, path.relative_to(plugin_dir).as_posix())
    print(f"wrote {zip_path.relative_to(ROOT)}")


def main() -> None:
    copy_css()
    markup = (ROOT / PAGE["markup"]).read_text(encoding="utf-8")
    if not markup.endswith("\n"):
        markup += "\n"
    write(ROOT / PAGE["preview"], preview_html(markup.rstrip("\n")))
    write(ROOT / PAGE["custom_html"], custom_html(markup))
    write(ROOT / PAGE["gutenberg"], gutenberg(markup))
    shutil.copyfile(ROOT / PAGE["markup"], ROOT / PAGE["plugin_template"])
    print(f"wrote {PAGE['plugin_template']}")
    zip_plugin()


if __name__ == "__main__":
    main()
