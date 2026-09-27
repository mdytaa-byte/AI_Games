# ai_games

A collection of self-contained, single-file HTML educational games for practicing
foreign languages (Spanish AP units and German A1–B1). Each `*.html` file at the
repository root is an independent game with all CSS and JavaScript inlined — there
is no build step, no package manager, no bundler, and no server-side code.

The site is published to GitHub Pages by `.github/workflows/static.yml`, which
uploads the entire repository as static content on every push to `main`.

## Cursor Cloud specific instructions

### What "running the app" means here
There is nothing to compile or bundle. Development just means serving the static
HTML files over HTTP (opening them via `file://` also works, but a local HTTP
server best mirrors the GitHub Pages deployment and avoids browser restrictions).

Serve the repo root with any static file server, e.g.:

```
python3 -m http.server 8000
```

Then open a game, e.g. `http://localhost:8000/geschenke-online-kaufen%20(1).html`.
Note: several filenames contain spaces and parentheses, so URL-encode them
(space → `%20`, `(` → `%28`, `)` → `%29`) when linking directly.

### No dependencies / lint / tests / build
- There is no dependency manifest, so there is nothing to install. `python3`
  (used for the dev server) is preinstalled in the base image.
- There are no automated tests, no linter, and no build command. "Testing" a
  change means opening the affected game in a browser and interacting with it.

### Runtime notes / gotchas
- Games are fully self-contained. A few reference external CDNs at runtime that
  require network access in the browser: Google Fonts (degrades gracefully to
  system fonts) and, in `preview (5).html`, three.js from cdnjs (required for its
  3D scene).
- `python3 -m http.server` has no hot reload; refresh the browser after editing a
  file. Each file is standalone, so editing one game never affects another.
