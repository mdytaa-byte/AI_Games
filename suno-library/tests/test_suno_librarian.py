import json
import sys
import tempfile
import unittest
from pathlib import Path

TOOLS = Path(__file__).resolve().parents[1] / "tools"
sys.path.insert(0, str(TOOLS))

import suno_librarian as sl  # noqa: E402


SONG_HTML = """<!doctype html><html><head>
<title>Static to Dynamic by darthur | Suno</title>
<meta name="description" content="Static to Dynamic by darthur (@darthurtime). Listen and make your own on Suno."/>
<meta property="og:title" content="Static to Dynamic"/>
<meta property="og:image" content="https://cdn2.suno.ai/image_large_3447b429-afc7-41c0-8123-3a08f0b04f5b.jpeg"/>
<meta property="og:type" content="music.song"/>
</head><body>
<script>40:["$","$L50",null,{"clip":{"status":"complete","title":"Static to Dynamic","id":"3447b429-afc7-41c0-8123-3a08f0b04f5b","audio_url":"https://cdn1.suno.ai/3447b429-afc7-41c0-8123-3a08f0b04f5b.mp3","image_large_url":"https://cdn2.suno.ai/image_large_3447b429-afc7-41c0-8123-3a08f0b04f5b.jpeg","major_model_version":"v3.5","created_at":"2024-11-09T22:46:44.619Z","handle":"darthurtime","display_name":"darthur","metadata":{"tags":"poppy Ambient","prompt":"I see choices laid before us"}}}]</script>
</body></html>
"""

PLAYLIST_HTML = """<!doctype html><html><head>
<title>Pop by @groovebot | Suno</title>
<meta property="og:title" content="Sunday Hymns by @mdytaa | Suno"/>
<meta property="og:type" content="music.playlist"/>
<meta property="og:audio" content="https://cdn1.suno.ai/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.mp3"/>
<meta property="og:audio" content="https://cdn1.suno.ai/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb.mp3"/>
</head></html>
"""

ESCAPED_SONG_HTML = r"""
<script>self.__next_f.push([1,"\"clip\":{\"status\":\"complete\",\"title\":\"Static to Dynamic\",\"id\":\"3447b429-afc7-41c0-8123-3a08f0b04f5b\",\"audio_url\":\"https://cdn1.suno.ai/3447b429-afc7-41c0-8123-3a08f0b04f5b.mp3\",\"image_large_url\":\"https://cdn2.suno.ai/image_large_x.jpeg\",\"major_model_version\":\"v3.5\",\"created_at\":\"2024-11-09T22:46:44.619Z\",\"handle\":\"darthurtime\",\"display_name\":\"darthur\",\"metadata\":{\"tags\":\"poppy Ambient\",\"prompt\":\"I see choices laid before us\\nLike a map\"}}"])</script>
"""


class ParseUrlTests(unittest.TestCase):
    def test_song_url(self):
        parsed = sl.parse_suno_url(
            "https://suno.com/song/3447b429-afc7-41c0-8123-3a08f0b04f5b"
        )
        self.assertEqual(parsed.kind, "song")
        self.assertEqual(parsed.song_id, "3447b429-afc7-41c0-8123-3a08f0b04f5b")

    def test_embed_and_short_and_playlist(self):
        embed = sl.parse_suno_url(
            "https://suno.com/embed/3447b429-afc7-41c0-8123-3a08f0b04f5b"
        )
        self.assertEqual(embed.kind, "song")
        short = sl.parse_suno_url("https://suno.com/s/KOsjD3sC38V5UA23")
        self.assertEqual(short.kind, "short")
        self.assertEqual(short.short_id, "KOsjD3sC38V5UA23")
        playlist = sl.parse_suno_url(
            "https://suno.com/playlist/5e4ccae6-8918-4e6b-9847-d9caa8245ab9/"
        )
        self.assertEqual(playlist.kind, "playlist")
        bare = sl.parse_suno_url("3447b429-afc7-41c0-8123-3a08f0b04f5b")
        self.assertEqual(bare.kind, "uuid")

    def test_rejects_other_hosts(self):
        with self.assertRaises(sl.SunoLibrarianError):
            sl.parse_suno_url("https://example.com/song/abc")


class ParsePageTests(unittest.TestCase):
    def test_song_html(self):
        song = sl.parse_song_html(
            SONG_HTML,
            song_id="3447b429-afc7-41c0-8123-3a08f0b04f5b",
            page_url="https://suno.com/song/3447b429-afc7-41c0-8123-3a08f0b04f5b",
        )
        self.assertEqual(song.title, "Static to Dynamic")
        self.assertEqual(song.artist, "darthur")
        self.assertEqual(song.handle, "darthurtime")
        self.assertEqual(song.tags, "poppy Ambient")
        self.assertIn("choices", song.lyrics)
        self.assertTrue(song.audio_url.endswith(".mp3"))
        self.assertEqual(song.created_at[:7], "2024-11")

    def test_escaped_clip_json(self):
        song = sl.parse_song_html(
            ESCAPED_SONG_HTML,
            song_id="3447b429-afc7-41c0-8123-3a08f0b04f5b",
        )
        self.assertEqual(song.title, "Static to Dynamic")
        self.assertEqual(song.tags, "poppy Ambient")
        self.assertEqual(song.created_at[:7], "2024-11")
        self.assertIn("choices", song.lyrics)
        self.assertEqual(song.model, "v3.5")

    def test_playlist_html(self):
        title, ids = sl.parse_playlist_html(
            PLAYLIST_HTML,
            playlist_id="5e4ccae6-8918-4e6b-9847-d9caa8245ab9",
        )
        self.assertEqual(title, "Sunday Hymns")
        self.assertEqual(
            ids,
            [
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            ],
        )


class LibraryTests(unittest.TestCase):
    def test_sanitize_and_month(self):
        self.assertEqual(sl.sanitize_filename('Hymn: "Hope"/One'), "Hymn Hope One")
        self.assertEqual(sl.month_folder("2026-02-03T01:39:00Z"), "2026-02")

    def test_id3_and_folders(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            track = root / "tracks" / "3447b429-afc7-41c0-8123-3a08f0b04f5b"
            track.mkdir(parents=True)
            audio = track / "audio.mp3"
            # Minimal MPEG frame so the file is a plausible MP3 body.
            audio.write_bytes(b"\xff\xfb\x90\x00" + b"\x00" * 64)
            cover = track / "cover.jpg"
            cover.write_bytes(b"\xff\xd8\xff" + b"\x00" * 32)
            song = sl.SongMeta(
                id="3447b429-afc7-41c0-8123-3a08f0b04f5b",
                title="Come to the Temple",
                artist="Michael Young",
                tags="sacred choir",
                created_at="2026-02-03T00:00:00Z",
                suno_url="https://suno.com/song/3447b429-afc7-41c0-8123-3a08f0b04f5b",
            )
            sl.write_id3(audio, song, cover.read_bytes())
            tagged = audio.read_bytes()
            self.assertTrue(tagged.startswith(b"ID3"))
            self.assertIn(b"TIT2", tagged)
            self.assertIn("Come to the Temple".encode("utf-16-le"), tagged)
            views = sl.organize_song(root, song, audio, cover, "Church")
            self.assertTrue(Path(views["collection"]).exists())
            self.assertTrue((root / "by-artist" / "Michael Young").exists())
            self.assertTrue((root / "by-month" / "2026-02").exists())
            self.assertTrue((root / "all").exists())

    def test_catalog_urls(self):
        catalog = {
            "default_collection": "Inbox",
            "collections": [
                {"name": "Church", "urls": ["https://suno.com/song/aaa"]},
                {"name": "Games", "urls": ["https://suno.com/song/bbb"]},
            ],
        }
        pairs = sl.urls_from_catalog(catalog, "Church")
        self.assertEqual(pairs, [("https://suno.com/song/aaa", "Church")])

    def test_catalog_file_loads(self):
        catalog_path = Path(__file__).resolve().parents[1] / "catalog.json"
        catalog = sl.load_catalog(catalog_path)
        names = [entry["name"] for entry in catalog["collections"]]
        self.assertEqual(names, ["Inbox", "Church", "Games", "Books"])


if __name__ == "__main__":
    unittest.main()
