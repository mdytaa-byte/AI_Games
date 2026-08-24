#!/usr/bin/env python3
"""Download public Suno songs and file them into a local library.

This tool is for songs you created or otherwise have the right to keep.
It uses public song/playlist pages and the public audio CDN — not private
Suno account APIs or session cookies.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

USER_AGENT = (
    "SunoLibrarian/1.0 (+https://github.com/mdytaa-byte/AI_Games; "
    "personal library organizer)"
)
REQUEST_GAP_SECONDS = 0.4
UUID_RE = re.compile(
    r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
    re.IGNORECASE,
)
UNSAFE_PATH = re.compile(r'[<>:"/\\|?*\x00-\x1f]+')
META_PROPERTY_RE = re.compile(
    r'<meta\s+(?:property|name)=["\']([^"\']+)["\']\s+content=["\']([^"\']*)["\']',
    re.IGNORECASE,
)
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
DESC_ARTIST_RE = re.compile(
    r"^(?P<title>.+?)\s+by\s+(?P<artist>.+?)\s+\(@(?P<handle>[^)]+)\)",
    re.IGNORECASE,
)
PAGE_TITLE_ARTIST_RE = re.compile(
    r"^(?P<title>.+?)\s+by\s+(?:@)?(?P<artist>.+?)\s*\|\s*Suno\s*$",
    re.IGNORECASE,
)


class SunoLibrarianError(RuntimeError):
    """User-facing download or catalog error."""


@dataclass
class ParsedUrl:
    kind: str  # song, playlist, short, uuid
    raw: str
    song_id: str | None = None
    playlist_id: str | None = None
    short_id: str | None = None


@dataclass
class SongMeta:
    id: str
    title: str
    artist: str = ""
    handle: str = ""
    tags: str = ""
    created_at: str = ""
    audio_url: str = ""
    cover_url: str = ""
    suno_url: str = ""
    lyrics: str = ""
    model: str = ""
    source_kind: str = "song"
    playlist_id: str = ""
    playlist_title: str = ""


@dataclass
class DownloadResult:
    song: SongMeta
    collection: str
    track_dir: str
    audio_path: str
    cover_path: str = ""
    skipped: bool = False
    error: str = ""


def sanitize_filename(name: str, fallback: str = "untitled") -> str:
    cleaned = UNSAFE_PATH.sub(" ", name or "")
    cleaned = cleaned.replace("\n", " ").replace("\r", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" .")
    cleaned = cleaned[:80] or fallback
    if cleaned in {".", ".."}:
        return fallback
    return cleaned


def parse_suno_url(value: str) -> ParsedUrl:
    raw = (value or "").strip()
    if not raw:
        raise SunoLibrarianError("Empty Suno URL.")
    if not re.match(r"^https?://", raw, re.IGNORECASE):
        if UUID_RE.fullmatch(raw):
            return ParsedUrl(kind="uuid", raw=raw, song_id=raw.lower())
        raw = "https://" + raw.lstrip("/")
    parsed = urllib.parse.urlparse(raw)
    host = (parsed.netloc or "").lower()
    if host.startswith("www."):
        host = host[4:]
    if host not in {"suno.com", "suno.ai"}:
        raise SunoLibrarianError(f"Not a Suno URL: {value}")
    path = parsed.path or "/"
    parts = [p for p in path.split("/") if p]
    if parts and parts[0] in {"song", "embed"} and len(parts) >= 2:
        match = UUID_RE.search(parts[1])
        if not match:
            raise SunoLibrarianError(f"Song URL is missing an id: {value}")
        return ParsedUrl(kind="song", raw=raw, song_id=match.group(0).lower())
    if parts and parts[0] == "playlist" and len(parts) >= 2:
        match = UUID_RE.search(parts[1])
        if not match:
            raise SunoLibrarianError(f"Playlist URL is missing an id: {value}")
        return ParsedUrl(
            kind="playlist", raw=raw, playlist_id=match.group(0).lower()
        )
    if parts and parts[0] == "s" and len(parts) >= 2:
        return ParsedUrl(kind="short", raw=raw, short_id=parts[1])
    match = UUID_RE.search(path)
    if match:
        return ParsedUrl(kind="uuid", raw=raw, song_id=match.group(0).lower())
    raise SunoLibrarianError(f"Unrecognized Suno URL: {value}")


def song_page_url(song_id: str) -> str:
    return f"https://suno.com/song/{song_id}"


def playlist_page_url(playlist_id: str) -> str:
    return f"https://suno.com/playlist/{playlist_id}"


def public_mp3_url(song_id: str) -> str:
    return f"https://cdn1.suno.ai/{song_id}.mp3"


def public_cover_url(song_id: str) -> str:
    return f"https://cdn2.suno.ai/image_large_{song_id}.jpeg"


def _request(url: str, *, method: str = "GET", timeout: int = 30):
    req = urllib.request.Request(
        url,
        method=method,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "*/*",
        },
    )
    return urllib.request.urlopen(req, timeout=timeout)


def fetch_bytes(url: str, *, timeout: int = 60) -> bytes:
    try:
        with _request(url, timeout=timeout) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        raise SunoLibrarianError(f"HTTP {exc.code} fetching {url}") from exc
    except urllib.error.URLError as exc:
        raise SunoLibrarianError(f"Could not fetch {url}: {exc.reason}") from exc


def fetch_text(url: str) -> tuple[str, str]:
    try:
        with _request(url, timeout=30) as response:
            final_url = response.geturl()
            charset = response.headers.get_content_charset() or "utf-8"
            body = response.read().decode(charset, "replace")
            return final_url, body
    except urllib.error.HTTPError as exc:
        raise SunoLibrarianError(f"HTTP {exc.code} fetching {url}") from exc
    except urllib.error.URLError as exc:
        raise SunoLibrarianError(f"Could not fetch {url}: {exc.reason}") from exc


def resolve_url(value: str) -> ParsedUrl:
    parsed = parse_suno_url(value)
    if parsed.kind != "short":
        return parsed
    final_url, _ = fetch_text(parsed.raw)
    resolved = parse_suno_url(final_url)
    resolved.short_id = parsed.short_id
    return resolved


def _meta_tags(html: str) -> dict[str, list[str]]:
    tags: dict[str, list[str]] = {}
    for key, content in META_PROPERTY_RE.findall(html):
        tags.setdefault(key.lower(), []).append(content)
    return tags


def _first_meta(tags: dict[str, list[str]], *keys: str) -> str:
    for key in keys:
        values = tags.get(key.lower()) or []
        if values:
            return values[0].strip()
    return ""


def _page_title(html: str) -> str:
    match = TITLE_RE.search(html)
    if not match:
        return ""
    return re.sub(r"\s+", " ", match.group(1)).strip()


def _extract_balanced_object(text: str, start: int) -> str | None:
    if start < 0 or start >= len(text) or text[start] != "{":
        return None
    depth = 0
    in_string = False
    escape = False
    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[start : index + 1]
    return None


def _extract_js_escaped_object(text: str, start: int) -> str | None:
    """Slice a `{...}` object whose quotes are JS-escaped as \\\"."""
    if start < 0 or start >= len(text) or text[start] != "{":
        return None
    depth = 0
    in_string = False
    index = start
    while index < len(text):
        if in_string:
            if text.startswith('\\"', index):
                in_string = False
                index += 2
                continue
            if text[index] == "\\":
                index += 2
                continue
            index += 1
            continue
        if text.startswith('\\"', index):
            in_string = True
            index += 2
            continue
        char = text[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[start : index + 1]
        index += 1
    return None


def _unescape_js_embedded_json(blob: str) -> str:
    # Order matters: turn \" into " before collapsing \\ into \.
    return blob.replace('\\"', '"').replace("\\\\", "\\")


def _clip_from_html(html: str) -> dict:
    escaped_at = html.find('\\"clip\\":{')
    if escaped_at >= 0:
        blob = _extract_js_escaped_object(html, escaped_at + len('\\"clip\\":'))
        if blob:
            try:
                data = json.loads(_unescape_js_embedded_json(blob))
            except json.JSONDecodeError:
                data = None
            if isinstance(data, dict):
                return data
    marker = '"clip":{'
    start = html.find(marker)
    if start < 0:
        marker = "clip:{"
        start = html.find(marker)
        if start < 0:
            return {}
        blob = _extract_balanced_object(html, start + len("clip:"))
    else:
        blob = _extract_balanced_object(html, start + len('"clip":'))
    if not blob:
        return {}
    try:
        data = json.loads(blob)
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def _artist_from_text(title: str, page_title: str, description: str) -> tuple[str, str, str]:
    for source in (description, page_title):
        match = DESC_ARTIST_RE.match(source or "")
        if match:
            return (
                match.group("title").strip() or title,
                match.group("artist").strip(),
                match.group("handle").strip(),
            )
        match = PAGE_TITLE_ARTIST_RE.match(source or "")
        if match:
            return (
                match.group("title").strip() or title,
                match.group("artist").strip().lstrip("@"),
                "",
            )
    return title, "", ""


def parse_song_html(html: str, *, song_id: str, page_url: str = "") -> SongMeta:
    tags = _meta_tags(html)
    clip = _clip_from_html(html)
    metadata = clip.get("metadata") if isinstance(clip.get("metadata"), dict) else {}
    page_title = _page_title(html)
    description = _first_meta(tags, "description", "og:description")
    title = (
        str(clip.get("title") or "").strip()
        or _first_meta(tags, "og:title", "twitter:title")
        or page_title.replace(" | Suno", "").strip()
        or f"Suno song {song_id[:8]}"
    )
    title, artist, handle = _artist_from_text(title, page_title, description)
    if not artist:
        artist = str(clip.get("display_name") or clip.get("handle") or "").strip()
    if not handle:
        handle = str(clip.get("handle") or "").strip()
    audio_url = (
        str(clip.get("audio_url") or "").strip()
        or _first_meta(tags, "og:audio")
        or public_mp3_url(song_id)
    )
    cover_url = (
        str(clip.get("image_large_url") or clip.get("image_url") or "").strip()
        or _first_meta(tags, "og:image", "twitter:image")
        or public_cover_url(song_id)
    )
    lyrics = str(metadata.get("prompt") or metadata.get("lyrics") or "").strip()
    return SongMeta(
        id=str(clip.get("id") or song_id).lower(),
        title=title,
        artist=artist,
        handle=handle,
        tags=str(metadata.get("tags") or "").strip(),
        created_at=str(clip.get("created_at") or "").strip(),
        audio_url=audio_url,
        cover_url=cover_url,
        suno_url=page_url or song_page_url(song_id),
        lyrics=lyrics,
        model=str(clip.get("major_model_version") or clip.get("model_name") or "").strip(),
        source_kind="song",
    )


def parse_playlist_html(html: str, *, playlist_id: str, page_url: str = "") -> tuple[str, list[str]]:
    tags = _meta_tags(html)
    title = (
        _first_meta(tags, "og:title", "twitter:title")
        or _page_title(html).replace(" | Suno", "").strip()
        or f"Playlist {playlist_id[:8]}"
    )
    title = re.sub(r"\s+by\s+@?.+$", "", title).strip() or title
    song_ids: list[str] = []
    seen: set[str] = set()
    for audio in tags.get("og:audio", []):
        match = UUID_RE.search(audio)
        if not match:
            continue
        song_id = match.group(0).lower()
        if song_id == playlist_id or song_id in seen:
            continue
        seen.add(song_id)
        song_ids.append(song_id)
    return title, song_ids


def synchsafe(size: int) -> bytes:
    return bytes(
        [
            (size >> 21) & 0x7F,
            (size >> 14) & 0x7F,
            (size >> 7) & 0x7F,
            size & 0x7F,
        ]
    )


def _id3_text_frame(frame_id: str, value: str) -> bytes:
    encoded = ("\ufeff" + value).encode("utf-16-le")
    body = b"\x01" + encoded
    return frame_id.encode("ascii") + len(body).to_bytes(4, "big") + b"\x00\x00" + body


def _id3_comm_frame(value: str) -> bytes:
    encoded = ("\ufeff" + value).encode("utf-16-le")
    body = b"\x01eng" + b"\xff\xfe\x00\x00" + encoded
    return b"COMM" + len(body).to_bytes(4, "big") + b"\x00\x00" + body


def _id3_apic_frame(image: bytes, mime: str = "image/jpeg") -> bytes:
    body = b"\x00" + mime.encode("ascii") + b"\x00\x03\x00" + image
    return b"APIC" + len(body).to_bytes(4, "big") + b"\x00\x00" + body


def build_id3_tag(song: SongMeta, cover: bytes | None = None) -> bytes:
    frames = [
        _id3_text_frame("TIT2", song.title),
        _id3_text_frame("TPE1", song.artist or song.handle or "Suno"),
        _id3_text_frame("TALB", song.playlist_title or song.tags or "Suno Library"),
        _id3_text_frame("TCON", song.tags or "Suno"),
        _id3_text_frame("WOAR", song.suno_url or song_page_url(song.id)),
        _id3_text_frame("TXXX", f"suno_id={song.id}"),
    ]
    if song.created_at[:4].isdigit():
        frames.append(_id3_text_frame("TYER", song.created_at[:4]))
    comment_bits = [song.suno_url]
    if song.model:
        comment_bits.append(f"model {song.model}")
    frames.append(_id3_comm_frame(" | ".join(part for part in comment_bits if part)))
    if cover:
        mime = "image/png" if cover[:8] == b"\x89PNG\r\n\x1a\n" else "image/jpeg"
        frames.append(_id3_apic_frame(cover, mime=mime))
    payload = b"".join(frames)
    return b"ID3\x03\x00\x00" + synchsafe(len(payload)) + payload


def write_id3(path: Path, song: SongMeta, cover: bytes | None = None) -> None:
    audio = path.read_bytes()
    if audio.startswith(b"ID3"):
        size = (
            ((audio[6] & 0x7F) << 21)
            | ((audio[7] & 0x7F) << 14)
            | ((audio[8] & 0x7F) << 7)
            | (audio[9] & 0x7F)
        )
        audio = audio[10 + size :]
    path.write_bytes(build_id3_tag(song, cover) + audio)


def month_folder(created_at: str) -> str:
    if re.match(r"^\d{4}-\d{2}", created_at or ""):
        return created_at[:7]
    return datetime.now(timezone.utc).strftime("%Y-%m")


def default_library_root() -> Path:
    return Path(__file__).resolve().parents[1] / "library"


def load_catalog(path: Path) -> dict:
    if not path.exists():
        return {
            "default_collection": "Inbox",
            "drive_parent_name": "Music for 2026",
            "drive_library_name": "Suno Library",
            "collections": [],
        }
    return json.loads(path.read_text(encoding="utf-8"))


def save_library_index(library_root: Path, songs: list[dict]) -> None:
    index_path = library_root / "catalog.json"
    index_path.write_text(
        json.dumps(
            {
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "count": len(songs),
                "songs": songs,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def read_library_index(library_root: Path) -> list[dict]:
    index_path = library_root / "catalog.json"
    if not index_path.exists():
        return []
    data = json.loads(index_path.read_text(encoding="utf-8"))
    return list(data.get("songs") or [])


def _link_or_copy(source: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() or dest.is_symlink():
        dest.unlink()
    try:
        os.link(source, dest)
    except OSError:
        shutil.copy2(source, dest)


def organize_song(
    library_root: Path,
    song: SongMeta,
    audio_path: Path,
    cover_path: Path | None,
    collection: str,
) -> dict[str, str]:
    collection_name = sanitize_filename(collection, "Inbox")
    artist_name = sanitize_filename(song.artist or song.handle or "Unknown artist")
    title_name = sanitize_filename(song.title)
    month = month_folder(song.created_at)
    collection_dir = library_root / "by-collection" / collection_name
    collection_dir.mkdir(parents=True, exist_ok=True)
    existing = sorted(collection_dir.glob("*.mp3"))
    number = len(existing) + 1
    collection_audio = collection_dir / f"{number:02d} - {title_name}.mp3"
    views = {
        "collection": str(collection_audio),
        "artist": str(
            library_root / "by-artist" / artist_name / f"{title_name}.mp3"
        ),
        "month": str(library_root / "by-month" / month / f"{title_name}.mp3"),
        "all": str(library_root / "all" / f"{title_name} [{song.id[:8]}].mp3"),
    }
    for dest in views.values():
        _link_or_copy(audio_path, Path(dest))
    if cover_path and cover_path.exists():
        cover_name = f"{title_name}.jpg"
        _link_or_copy(
            cover_path,
            library_root / "by-collection" / collection_name / cover_name,
        )
        _link_or_copy(
            cover_path, library_root / "by-artist" / artist_name / cover_name
        )
    return views


def fetch_song_meta(song_id: str) -> SongMeta:
    url = song_page_url(song_id)
    _, html = fetch_text(url)
    return parse_song_html(html, song_id=song_id, page_url=url)


def fetch_playlist(playlist_id: str) -> tuple[str, list[str]]:
    url = playlist_page_url(playlist_id)
    _, html = fetch_text(url)
    return parse_playlist_html(html, playlist_id=playlist_id, page_url=url)


def download_song(
    song: SongMeta,
    library_root: Path,
    collection: str,
    *,
    skip_existing: bool = True,
) -> DownloadResult:
    track_dir = library_root / "tracks" / song.id
    track_dir.mkdir(parents=True, exist_ok=True)
    audio_path = track_dir / "audio.mp3"
    cover_path = track_dir / "cover.jpg"
    meta_path = track_dir / "meta.json"
    lyrics_path = track_dir / "lyrics.txt"
    if skip_existing and audio_path.exists() and audio_path.stat().st_size > 1024:
        views = organize_song(
            library_root, song, audio_path, cover_path if cover_path.exists() else None, collection
        )
        return DownloadResult(
            song=song,
            collection=collection,
            track_dir=str(track_dir),
            audio_path=views["collection"],
            cover_path=str(cover_path) if cover_path.exists() else "",
            skipped=True,
        )
    audio = fetch_bytes(song.audio_url or public_mp3_url(song.id))
    if len(audio) < 1024 or audio[:3] in {b"<?x", b"<!D", b"<ht"}:
        raise SunoLibrarianError(
            f"Audio for {song.id} did not look like an MP3. "
            "The song may be private."
        )
    cover = b""
    if song.cover_url:
        try:
            cover = fetch_bytes(song.cover_url)
        except SunoLibrarianError:
            cover = b""
    audio_path.write_bytes(audio)
    if cover:
        cover_path.write_bytes(cover)
    write_id3(audio_path, song, cover or None)
    meta_path.write_text(
        json.dumps(asdict(song), indent=2) + "\n", encoding="utf-8"
    )
    if song.lyrics:
        lyrics_path.write_text(song.lyrics + "\n", encoding="utf-8")
    views = organize_song(
        library_root,
        song,
        audio_path,
        cover_path if cover_path.exists() else None,
        collection,
    )
    return DownloadResult(
        song=song,
        collection=collection,
        track_dir=str(track_dir),
        audio_path=views["collection"],
        cover_path=str(cover_path) if cover_path.exists() else "",
    )


def expand_targets(urls: Iterable[str]) -> list[tuple[SongMeta | None, str, dict]]:
    """Return work items: (song_or_none, collection_hint, extra)."""
    items: list[tuple[SongMeta | None, str, dict]] = []
    for url in urls:
        parsed = resolve_url(url)
        if parsed.kind == "playlist":
            title, song_ids = fetch_playlist(parsed.playlist_id or "")
            if not song_ids:
                raise SunoLibrarianError(
                    f"No public songs found on playlist {parsed.playlist_id}."
                )
            for song_id in song_ids:
                items.append(
                    (
                        None,
                        title,
                        {
                            "song_id": song_id,
                            "playlist_id": parsed.playlist_id,
                            "playlist_title": title,
                        },
                    )
                )
            time.sleep(REQUEST_GAP_SECONDS)
            continue
        song_id = parsed.song_id
        if not song_id:
            raise SunoLibrarianError(f"Could not find a song id in {url}")
        items.append((None, "", {"song_id": song_id}))
    return items


def run_download(
    urls: list[str],
    *,
    library_root: Path,
    collection: str,
    skip_existing: bool = True,
) -> list[DownloadResult]:
    library_root.mkdir(parents=True, exist_ok=True)
    (library_root / "tracks").mkdir(exist_ok=True)
    results: list[DownloadResult] = []
    index = {row["id"]: row for row in read_library_index(library_root) if "id" in row}
    work = expand_targets(urls)
    for _, playlist_title, extra in work:
        song_id = extra["song_id"]
        try:
            song = fetch_song_meta(song_id)
            if extra.get("playlist_id"):
                song.playlist_id = extra["playlist_id"]
                song.playlist_title = extra.get("playlist_title") or ""
                song.source_kind = "playlist"
            folder = collection or playlist_title or "Inbox"
            result = download_song(
                song, library_root, folder, skip_existing=skip_existing
            )
            results.append(result)
            index[song.id] = {
                **asdict(song),
                "collection": folder,
                "audio_path": result.audio_path,
                "track_dir": result.track_dir,
                "skipped": result.skipped,
            }
            status = "skipped" if result.skipped else "downloaded"
            print(f"{status:10} {song.title}  [{folder}]")
        except SunoLibrarianError as exc:
            results.append(
                DownloadResult(
                    song=SongMeta(id=song_id, title=song_id),
                    collection=collection or "Inbox",
                    track_dir="",
                    audio_path="",
                    error=str(exc),
                )
            )
            print(f"failed     {song_id}: {exc}", file=sys.stderr)
        time.sleep(REQUEST_GAP_SECONDS)
    save_library_index(library_root, list(index.values()))
    return results


def urls_from_catalog(catalog: dict, collection: str | None) -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []
    default_name = catalog.get("default_collection") or "Inbox"
    for entry in catalog.get("collections") or []:
        name = entry.get("name") or default_name
        if collection and name.lower() != collection.lower():
            continue
        for url in entry.get("urls") or []:
            if url and not str(url).strip().startswith("#"):
                pairs.append((str(url).strip(), name))
    return pairs


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Download public Suno songs and organize them into folders."
    )
    parser.add_argument(
        "--library",
        type=Path,
        default=default_library_root(),
        help="Library root (default: suno-library/library)",
    )
    parser.add_argument(
        "--catalog",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "catalog.json",
        help="Catalog of collections and URLs",
    )
    parser.add_argument(
        "--collection",
        default="",
        help="Folder name to file songs into (default: Inbox or playlist name)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-download songs even if they already exist",
    )
    sub = parser.add_subparsers(dest="command", required=True)
    download = sub.add_parser("download", help="Download one or more song/playlist URLs")
    download.add_argument("urls", nargs="+", help="Suno song or playlist URLs")
    sub.add_parser("from-catalog", help="Download every URL listed in catalog.json")
    sub.add_parser("list", help="Show what is already in the library")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    library_root: Path = args.library
    if args.command == "list":
        songs = read_library_index(library_root)
        if not songs:
            print("Library is empty.")
            return 0
        for song in songs:
            print(
                f"{song.get('collection', 'Inbox'):20} {song.get('title', '')}  "
                f"({song.get('id', '')[:8]})"
            )
        print(f"{len(songs)} song(s)")
        return 0
    if args.command == "from-catalog":
        catalog = load_catalog(args.catalog)
        pairs = urls_from_catalog(catalog, args.collection or None)
        if not pairs:
            print("No URLs in catalog.json yet. Add song links, then run from-catalog.")
            return 0
        failed = 0
        by_collection: dict[str, list[str]] = {}
        for url, name in pairs:
            by_collection.setdefault(name, []).append(url)
        for name, urls in by_collection.items():
            results = run_download(
                urls,
                library_root=library_root,
                collection=name,
                skip_existing=not args.force,
            )
            failed += sum(1 for item in results if item.error)
        return 1 if failed else 0
    results = run_download(
        args.urls,
        library_root=library_root,
        collection=args.collection,
        skip_existing=not args.force,
    )
    failed = sum(1 for item in results if item.error)
    downloaded = sum(1 for item in results if not item.error and not item.skipped)
    skipped = sum(1 for item in results if item.skipped)
    print(
        f"Done. downloaded={downloaded} skipped={skipped} failed={failed} "
        f"library={library_root}"
    )
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
