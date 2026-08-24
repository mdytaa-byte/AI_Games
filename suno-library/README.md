# Suno Librarian

Download **your** Suno songs and file them into folders — locally and, when a Cursor agent is running with Google Drive, in Drive too.

This is the agent Michael can reuse: paste Suno links, name a collection, and the librarian fetches the public MP3, cover, and metadata, then sorts everything.

## What to send the agent

Paste one or more of:

- Song links: `https://suno.com/song/<id>`
- Short share links: `https://suno.com/s/<id>`
- Playlist links: `https://suno.com/playlist/<id>`
- A collection name: `Church`, `Games`, `Books`, or `Inbox`

Example:

> Download these Suno songs into Church:
> https://suno.com/song/...
> https://suno.com/s/...

Use this only for songs you created or have permission to keep. Private library dumps that need a logged-in Suno session are out of scope.

## Run it yourself

```bash
python3 suno-library/tools/suno_librarian.py \
  --collection Church \
  download \
  https://suno.com/song/3447b429-afc7-41c0-8123-3a08f0b04f5b
```

From the saved catalog:

```bash
python3 suno-library/tools/suno_librarian.py from-catalog
python3 suno-library/tools/suno_librarian.py list
```

Add links to `suno-library/catalog.json` under the right collection, then run `from-catalog`.

## Folder layout

```
suno-library/library/
  tracks/<song-id>/     canonical MP3, cover, lyrics, metadata
  by-collection/Church/
  by-artist/…
  by-month/2026-08/
  all/
  catalog.json          searchable index
```

Audio stays gitignored so GitHub Pages does not publish the files.

## Google Drive

When Drive is connected, the agent mirrors the same folders under:

`Music for 2026 / Suno Library / {Church|Games|Books|Inbox}`

## Tests

```bash
python3 -m unittest suno-library/tests/test_suno_librarian.py
```
