#!/bin/sh
# Build a SCORM 1.2 zip with index.html + imsmanifest.xml at the zip root.
set -e
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
SRC="$ROOT/kleinhausen"
OUT="$ROOT/kleinhausen/canvas/kleinhausen-scorm.zip"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cp -R "$SRC/css" "$SRC/js" "$SRC/praxis" "$SRC/audio" "$SRC/index.html" "$TMP/"
cp "$SRC/canvas/imsmanifest.xml" "$TMP/imsmanifest.xml"
# Johann, the AI tutor behind the "Frag Johann" buttons (loaded from johann/ inside the package)
mkdir -p "$TMP/johann"
cp "$ROOT/johann/index.html" "$ROOT/johann/ask-johann.js" "$ROOT/johann/config.js" "$TMP/johann/"
# optional teacher docs
cp "$SRC/CANVAS.md" "$TMP/CANVAS.md" 2>/dev/null || true
cd "$TMP"
rm -f "$OUT"
zip -r "$OUT" . -x "*.DS_Store"
echo "Wrote $OUT"
