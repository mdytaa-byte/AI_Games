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
# optional teacher docs
cp "$SRC/CANVAS.md" "$TMP/CANVAS.md" 2>/dev/null || true
cd "$TMP"
rm -f "$OUT"
zip -r "$OUT" . -x "*.DS_Store"
echo "Wrote $OUT"
