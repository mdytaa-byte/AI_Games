#!/usr/bin/env python3
"""Render Kleinhausen listening clips: distinct neural speakers + place noise.

Browser TTS is not the curriculum. These files are. Requires edge-tts + ffmpeg.
"""
from __future__ import annotations

import asyncio
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "kleinhausen" / "audio" / "clips"
FFMPEG = shutil.which("ffmpeg") or "ffmpeg"

# Lena ≠ Frau Vogel ≠ Otto: three different neural voices, never reused for each other.
VOICES = {
    "lena": ("de-DE-AmalaNeural", "+8%", "+6Hz"),
    "vogel": ("de-DE-KatjaNeural", "-10%", "-1Hz"),
    "otto": ("de-DE-ConradNeural", "-12%", "-4Hz"),
    "jonas": ("de-DE-KillianNeural", "+4%", "+2Hz"),
    "birgit": ("de-DE-SeraphinaMultilingualNeural", "-4%", "-1Hz"),
    "hanna": ("de-AT-IngridNeural", "+2%", "+1Hz"),
    "aydin": ("de-CH-LeniNeural", "-8%", "-2Hz"),
    "trainer": ("de-DE-FlorianMultilingualNeural", "+6%", "+3Hz"),
    "ansage": ("de-CH-JanNeural", "-6%", "-3Hz"),
    "kasse": ("de-AT-JonasNeural", "+0%", "+0Hz"),
}

CLIPS = [
    {
        "id": "e01-bahnhof",
        "speaker": "ansage",
        "room": "station",
        "text": (
            "Nächster Halt: Kleinhausen. Bitte aussteigen. "
            "Der Zug nach Kassel fährt heute von Gleis zwei. "
            "Achtung, der Aufzug ist defekt. Nutzen Sie bitte die Treppe. "
            "Willkommen in Kleinhausen."
        ),
    },
    {
        "id": "e02-lena",
        "speaker": "lena",
        "room": "phone",
        "text": (
            "Okay. Du stehst am Brunnen. Das Rathaus ist das große Gebäude mit der Uhr. "
            "Links von dir ist die Bäckerei, rechts die Gasse zur Kirche. "
            "Geradeaus siehst du das Kaufhaus — das ist uns. "
            "Komm zum Café Federkiel, neben dem Kaufhaus. Ich bestelle schon."
        ),
    },
    {
        "id": "e03-vogel",
        "speaker": "vogel",
        "room": "classroom",
        "text": (
            "Achtung, zehn b. Morgen fällt die zweite Stunde aus. Frau Klein ist krank. "
            "Bitte in der Bibliothek arbeiten. Die Umwelt-A-G trifft sich Mittwoch, "
            "zwölf Uhr zehn, Raum B drei. Gäste willkommen — auch Gastschülerinnen und Gastschüler. "
            "Mit freundlichen Grüßen. Vogel."
        ),
    },
    {
        "id": "e04-hanna",
        "speaker": "hanna",
        "room": "radio",
        "text": (
            "Guten Morgen, Kleinhausen. Heute früh neun Grad, später Regen von Westen. Windig. "
            "Morgen etwas milder, fünfzehn Grad, Wolken. Am Wochenende Sonne — ideal für den Markt, "
            "schlecht für Leute ohne Sonnenhut. Und jetzt die Nachrichten: "
            "Die Debatte um den Festplatz geht weiter."
        ),
    },
    {
        "id": "e05-kasse",
        "speaker": "kasse",
        "room": "market",
        "text": (
            "So, das macht zwölf Euro dreißig. Haben Sie eine Kundenkarte? Nein? "
            "Bar oder Karte? Die Tüte kostet zehn Cent, oder haben Sie eine eigene?"
        ),
    },
    {
        "id": "e08-lena",
        "speaker": "lena",
        "room": "phone",
        "text": (
            "Okay. Atme. Frau Vogel ist streng, aber nicht gemein. "
            "Schreib: Entschuldigung, die letzte Mail war unpassend. Dann die Frage klar. "
            "Keine Emojis. Keine L-G. Du schaffst das. Und komm trotzdem um fünf zum Festplatz."
        ),
    },
    {
        "id": "e10-trainer",
        "speaker": "trainer",
        "room": "field",
        "text": (
            "Okay, Leute, zuhört! Wir spielen auf rechts. Karl, pass den Ball — den Ball — "
            "auf Lena… gast, äh, auf unseren Gast. Nicht so aggressiv. "
            "Nach zwanzig Minuten Wechsel. Wasser trinken! "
            "Und nach dem Spiel den Platz aufräumen, bitte, die Dosen sind peinlich."
        ),
    },
    {
        "id": "e12-birgit",
        "speaker": "birgit",
        "room": "phone",
        "text": (
            "Ich bin gleich da. Danke, dass du gegangen bist. Ist Lena wach? Hat sie getrunken? "
            "Wenn das Fieber steigt, rufst du mich an, nicht Jonas, der hört Musik. "
            "Und kauf bitte Zitronen, wenn die Apotheke welche hat. Ich bringe Brötchen."
        ),
    },
    {
        "id": "e13-ansage",
        "speaker": "ansage",
        "room": "station",
        "text": (
            "Liebe Fahrgäste, der Regionalzug nach Frankfurt hat fünfundzwanzig Minuten Verspätung. "
            "Grund: Eis auf der Oberleitung. Bitte bleiben Sie auf Gleis zwei. "
            "Der Anschluss um neun Uhr zweiundfünfzig ist gefährdet. "
            "Ersatz: Bussteig B, Abfahrt acht Uhr vierzig, nur bei Bedarf. "
            "Wir bitten um Entschuldigung."
        ),
    },
    {
        "id": "e14-jonas",
        "speaker": "jonas",
        "room": "plaza",
        "text": (
            "Hey. Wir sind Die Linden. Danke, dass ihr hier steht und nicht im Wohnzimmer. "
            "Dieser Platz ist kalt und wichtig. Nächster Song ist leise, weil Oma in der ersten Reihe sitzt. "
            "Danach räumt ihr mit uns auf. Das ist der Refrain des Abends."
        ),
    },
    {
        "id": "e15-otto",
        "speaker": "otto",
        "room": "bakery",
        "text": (
            "Ich backe seit dreißig Jahren. Der Festplatz? Da standen Buden, da haben Leute geweint und getanzt. "
            "Ein Parkhaus kauft niemand Brötchen um sechs Uhr früh. Aber Frau Haller hat recht mit den Treppen. "
            "Baut einen Aufzug zu mir, nicht nur Beton für Autos."
        ),
    },
    {
        "id": "e16-aydin",
        "speaker": "aydin",
        "room": "plaza",
        "text": (
            "Liebe Gäste, liebe Kleinhausenerinnen und Kleinhausener. "
            "Wir sind siebenhundertfünfzig Jahre alt und immer noch nicht fertig. "
            "Danke an die, die gekehrt, geliefert, gemessen, widersprochen und Punsch gekocht haben. "
            "Unser Gast aus dem Austauschjahr spricht jetzt — kurz, klar, auf Deutsch. Bitte begrüßt …"
        ),
    },
    {
        "id": "sq-radio",
        "speaker": "hanna",
        "room": "radio",
        "text": (
            "Guten Morgen, Kleinhausen, hier ist Hanna am Mikrofon. Der Hahnfluss führt viel Wasser. "
            "Die Bäckerei Sonnenkorn hat heute keine Sonnenblumenkerne, sorry. "
            "Um zehn spricht die Bürgermeisterin im Rathaus. Und das Rätsel: "
            "Welches Gebäude hat eine goldene Brezel? Anrufen, oder einfach hingehen und hungrig sein."
        ),
    },
]


def room_filter(room: str) -> str:
    """Voice chain: make a station sound like a station, a phone like a phone."""
    if room == "station":
        return (
            "highpass=f=700,lowpass=f=4200,aecho=0.7:0.6:40:0.35,"
            "acompressor=threshold=-18dB:ratio=4:attack=5:release=80,volume=1.15"
        )
    if room == "phone":
        return (
            "highpass=f=320,lowpass=f=3200,acompressor=threshold=-16dB:ratio=5:attack=8:release=60,"
            "volume=1.2"
        )
    if room == "radio":
        return (
            "highpass=f=450,lowpass=f=4800,acompressor=threshold=-14dB:ratio=6:attack=3:release=50,"
            "treble=g=3,volume=1.1"
        )
    if room == "classroom":
        return "highpass=f=140,aecho=0.55:0.45:28:0.18,volume=1.05"
    if room == "bakery":
        return "highpass=f=120,aecho=0.6:0.5:32:0.22,acompressor=threshold=-20dB:ratio=3,volume=1.05"
    if room == "field":
        return "highpass=f=200,lowpass=f=6500,volume=1.15"
    if room == "market":
        return "highpass=f=180,aecho=0.5:0.4:22:0.15,volume=1.08"
    if room == "plaza":
        return "highpass=f=160,aecho=0.65:0.55:55:0.25,volume=1.08"
    return "volume=1"


def noise_graph(room: str, duration: float) -> str:
    d = max(duration + 0.4, 1.2)
    if room == "station":
        return (
            f"anoisesrc=color=brown:d={d}:a=0.18[n0];"
            f"sine=f=780:d={d}[beep];[beep]volume=0.04[beep2];"
            "[n0][beep2]amix=inputs=2:duration=first[n]"
        )
    if room == "phone":
        return f"anoisesrc=color=white:d={d}:a=0.035[n]"
    if room == "radio":
        return f"anoisesrc=color=white:d={d}:a=0.05[n]"
    if room == "classroom":
        return f"anoisesrc=color=brown:d={d}:a=0.04[n]"
    if room == "bakery":
        return (
            f"anoisesrc=color=brown:d={d}:a=0.09[n0];"
            f"anoisesrc=color=pink:d={d}:a=0.03[n1];"
            "[n0][n1]amix=inputs=2:duration=first[n]"
        )
    if room == "field":
        return f"anoisesrc=color=pink:d={d}:a=0.07[n]"
    if room == "market":
        return (
            f"anoisesrc=color=brown:d={d}:a=0.08[n0];"
            f"sine=f=2400:d={d}[bp];[bp]volume=0.03[bp2];"
            "[n0][bp2]amix=inputs=2:duration=first[n]"
        )
    if room == "plaza":
        return f"anoisesrc=color=brown:d={d}:a=0.1[n]"
    return f"anoisesrc=color=brown:d={d}:a=0.05[n]"


async def synth(clip: dict, wav_path: Path) -> None:
    voice, rate, pitch = VOICES[clip["speaker"]]
    comm = edge_tts.Communicate(
        clip["text"],
        voice,
        rate=rate,
        pitch=pitch,
    )
    await comm.save(str(wav_path))


def mix(wav_path: Path, room: str, mp3_path: Path) -> None:
    probe = subprocess.run(
        [FFMPEG, "-i", str(wav_path), "-hide_banner"],
        capture_output=True,
        text=True,
    )
    # duration from stderr: Duration: 00:00:xx.xx
    duration = 4.0
    for line in (probe.stderr or "").splitlines():
        if "Duration:" in line:
            stamp = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = stamp.split(":")
            duration = int(h) * 3600 + int(m) * 60 + float(s)
            break

    voice_f = room_filter(room)
    noise = noise_graph(room, duration)
    filter_complex = (
        f"[0:a]{voice_f}[v];{noise};"
        "[v][n]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[out]"
    )
    cmd = [
        FFMPEG, "-y",
        "-i", str(wav_path),
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-c:a", "libmp3lame", "-q:a", "6", "-ac", "1", "-ar", "22050",
        str(mp3_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        for clip in CLIPS:
            wav = tmp_path / f"{clip['id']}.wav"
            mp3 = OUT / f"{clip['id']}.mp3"
            print(f"synth {clip['id']} ({clip['speaker']}/{clip['room']})")
            await synth(clip, wav)
            mix(wav, clip["room"], mp3)
            size = mp3.stat().st_size
            print(f"  -> {mp3.relative_to(ROOT)} ({size} bytes)")
    print("done", len(CLIPS), "clips")


if __name__ == "__main__":
    asyncio.run(main())
