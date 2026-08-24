---
name: suno-librarian
description: Download Suno songs the user created (or has rights to) and organize them into local and Google Drive folders. Use when the user asks to download Suno tracks, file Suno playlists, or build a Suno music library.
---

# Suno Librarian

Michael generates songs on Suno and wants them downloaded and filed. Use this skill instead of ad-hoc `curl` commands.

## When to use

Use when the user:

- Pastes `suno.com/song/…`, `suno.com/s/…`, or `suno.com/playlist/…` links
- Asks to download Suno songs, keep a Suno library, or sort tracks into folders
- Mentions collections such as Church, Games, Books, or Inbox

Do not use this to scrape other people's catalogs, bypass Suno login, or call undocumented private APIs / session cookies.

## What you need from the user

1. One or more public Suno URLs
2. A collection name if they have one (`Church`, `Games`, `Books`, otherwise `Inbox`)

If they only say "download my Suno songs" with no links, ask them to paste song or playlist URLs from Suno (Share → Copy link). Do not invent IDs.

## Local download

From the repo root:

```bash
python3 suno-library/tools/suno_librarian.py \
  --collection Church \
  download \
  URL [URL ...]
```

For every URL listed in `suno-library/catalog.json`:

```bash
python3 suno-library/tools/suno_librarian.py from-catalog
```

Then `python3 suno-library/tools/suno_librarian.py list`.

After a successful run, add any new URLs the user wants to keep to the matching collection in `suno-library/catalog.json`.

## Folder layout

File songs here (audio is gitignored):

```
suno-library/library/
  tracks/<uuid>/audio.mp3
  tracks/<uuid>/cover.jpg
  tracks/<uuid>/lyrics.txt
  tracks/<uuid>/meta.json
  by-collection/<Collection>/01 - Title.mp3
  by-artist/<Artist>/Title.mp3
  by-month/<YYYY-MM>/Title.mp3
  all/Title [id].mp3
  catalog.json
```

## Google Drive mirror

If Google Drive tools are available, mirror new files after the local download:

1. Find or create folder `Suno Library` inside `Music for 2026`. IDs are in `suno-library/catalog.json` (`drive_library_id`, `drive_parent_id`).
2. Find or create a child folder named after the collection (`Church`, `Games`, `Books`, `Inbox`). Folder IDs already created for Michael are in `suno-library/catalog.json` under `drive_collection_ids`.
3. Upload each new `audio.mp3` as `{Title}.mp3` with `content_mime_type` `audio/mpeg` and `disable_conversion_to_google_type` true.
4. Upload `cover.jpg` next to it when present.
5. Skip files that already exist with the same title in that folder.

Do not upload other people's demo tracks. Only upload songs the user asked for.

## Guardrails

- Only public pages and the public CDN (`cdn1.suno.ai/{id}.mp3`). No cookie/session capture.
- If a download returns HTTP 403/404 or a tiny HTML body, tell the user the song is probably private and they should copy the share link after making it public, or download from Suno and drop the MP3 into `suno-library/library/_incoming/` for filing later.
- Do not commit MP3/JPG binaries. Keep `suno-library/library/` gitignored.
- Be polite: the librarian already pauses between requests.

## Afterward

Tell the user:

- How many songs downloaded, skipped, or failed
- The collection folder path
- The Drive folder URL if you uploaded
