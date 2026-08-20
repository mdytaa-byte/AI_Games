#!/usr/bin/env python3
"""Build GitHub Pages wrappers and single-file Canvas bundles."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MISSIONS = [
    ("cafe-sonnenkorn", "Café Sonnenkorn — Bestellen auf Deutsch"),
    ("wohnung-muehlgasse", "Wohnung in der Mühlgasse — Möbel und Präpositionen"),
    ("bahnhof-kleinhausen", "Bahnhof Kleinhausen — Reisen"),
    ("arztpraxis-weber", "Arztpraxis Dr. Weber — Gesundheit"),
    ("gymnasium-kleinhausen", "Gymnasium Kleinhausen — Schule"),
    ("stadtfest-kleinhausen", "Stadtfest Kleinhausen — Kultur"),
    ("heimatmuseum-kleinhausen", "Heimatmuseum Kleinhausen — Beschreiben"),
    ("see-umwelt", "Kleinhausener See — Umwelt"),
]

CSS = (ROOT / "css/kleinhausen-ui.css").read_text(encoding="utf-8")
THREE = (ROOT / "vendor/three.r128.min.js").read_text(encoding="utf-8")
KIT = (ROOT / "js/kleinhausen-kit.js").read_text(encoding="utf-8")

SHELL = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="3D-Deutschlernspiel aus Kleinhausen. Läuft offline im Browser, geeignet für Canvas LMS.">
<link rel="stylesheet" href="../css/kleinhausen-ui.css">
</head>
<body>
<div id="kh-app"></div>
<script src="../vendor/three.r128.min.js"></script>
<script src="../js/kleinhausen-kit.js"></script>
<script src="../js/missions/{id}.js"></script>
</body>
</html>
"""

BUNDLE = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="Einzeldatei für Canvas LMS: 3D-Deutschlernspiel aus Kleinhausen. Kein CDN, keine Speicherung.">
<style>
{css}
</style>
</head>
<body>
<div id="kh-app"></div>
<script>
{three}
</script>
<script>
{kit}
</script>
<script>
{mission}
</script>
</body>
</html>
"""


def main():
    spiele = ROOT / "spiele"
    canvas = ROOT / "canvas"
    spiele.mkdir(exist_ok=True)
    canvas.mkdir(exist_ok=True)
    for mid, title in MISSIONS:
        mission = (ROOT / "js/missions" / f"{mid}.js").read_text(encoding="utf-8")
        (spiele / f"{mid}.html").write_text(
            SHELL.format(title=title, id=mid), encoding="utf-8"
        )
        (canvas / f"{mid}-3d.html").write_text(
            BUNDLE.format(title=title, css=CSS, three=THREE, kit=KIT, mission=mission),
            encoding="utf-8",
        )
        print("built", mid)


if __name__ == "__main__":
    main()
