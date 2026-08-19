#!/usr/bin/env python3
"""Build a single-file portable Character Lab from the split studio files."""
import base64
from pathlib import Path

root = Path(__file__).resolve().parent
engine = (root / "character-kit.bundle-v4.js").read_text()
lab = (root / "lab.js").read_text()
html = (root / "index.html").read_text()

b64 = base64.b64encode(engine.encode("utf-8")).decode("ascii")

def wrap(js: str) -> str:
    return js.replace("</script>", "<\\/script>")

inline = (
    "<script>\n"
    "const CHARACTER_KIT_BUNDLE_B64 = '" + b64 + "';\n"
    "</script>\n"
    "<script>\n" + wrap(engine) + "\n</script>\n"
    "<script>\n" + wrap(lab) + "\n</script>"
)

portable = html.replace(
    '<script src="character-kit.bundle-v4.js"></script>\n<script src="lab.js"></script>',
    inline,
).replace(
    "<title>Character Lab — authoring studio</title>",
    "<title>Character Lab — portable v4</title>",
)

out_root = root.parent / "character-lab-portable-v4.html"
out_root.write_text(portable)
print("portable chars", len(portable))
print("wrote", out_root)
