#!/usr/bin/env python3
"""Generate SATB + piano MusicXML medley: Still, Still, Still / Were You There."""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from xml.dom import minidom
from pathlib import Path

DIV = 24  # quarter = 24
Q = 24
E = 12
S = 6
H = 48
W = 96
DQ = 36  # dotted quarter
DH = 72  # dotted half / full 6/8 bar
BAR_68 = 72
BAR_44 = 96
PICKUP = 48

STEP_ALTER = {
    "C": (0, 0),
    "D": (1, 0),
    "E": (2, 0),
    "F": (3, 0),
    "G": (4, 0),
    "A": (5, 0),
    "B": (6, 0),
}


def parse_pitch(p: str) -> tuple[str, int, int]:
    m = re.match(r"^([A-G])([b#]?)(-?\d)$", p)
    if not m:
        raise ValueError(p)
    step, acc, octv = m.group(1), m.group(2), int(m.group(3))
    alter = -1 if acc == "b" else 1 if acc == "#" else 0
    return step, alter, octv


def type_for(dur: int) -> tuple[str, int]:
    mapping = {
        6: ("16th", 0),
        8: ("eighth", 0),  # unused
        12: ("eighth", 0),
        18: ("eighth", 1),
        24: ("quarter", 0),
        36: ("quarter", 1),
        48: ("half", 0),
        72: ("half", 1),
        96: ("whole", 0),
    }
    if dur in mapping:
        return mapping[dur]
    # fallback
    if dur >= 96:
        return "whole", 0
    if dur >= 48:
        return "half", 0
    if dur >= 24:
        return "quarter", 0
    return "eighth", 0


class Builder:
    def __init__(self):
        self.parts: dict[str, list] = {k: [] for k in ("S", "A", "T", "B", "P")}
        self.measure_no = 0
        self.time = "6/8"
        self.divisions_set = False

    def new_measure(self, number: int | None = None, implicit=False):
        self.measure_no = number if number is not None else self.measure_no + 1
        m = {"number": self.measure_no, "implicit": implicit, "voices": {}}
        for k in self.parts:
            self.parts[k].append({"number": self.measure_no, "implicit": implicit, "events": [], "dirs": []})
        return m

    def add_dir(self, part: str, **kwargs):
        self.parts[part][-1]["dirs"].append(kwargs)

    def add(self, part: str, events: list):
        self.parts[part][-1]["events"].extend(events)


def N(pitch, dur, lyric=None, **kw):
    d = {"kind": "note", "pitch": pitch, "dur": dur, "lyric": lyric}
    d.update(kw)
    return d


def R(dur, measure=False, **kw):
    d = {"kind": "rest", "dur": dur, "measure": measure}
    d.update(kw)
    return d


def CH(pitches, dur, **kw):
    """Chord: list of pitches, first is primary."""
    d = {"kind": "chord", "pitches": pitches, "dur": dur}
    d.update(kw)
    return d


# ---------------------------------------------------------------------------
# Melody (sounding) — Still, Still, Still in Eb, 6/8
# Incipit 5-1-3-5-1 1-3-2-2-4 7-7-2-1-3
# ---------------------------------------------------------------------------

STILL_S = [
    # 1 Still, still, still
    [
        N("Bb4", Q, "Still"),
        N("Eb4", E, "still", slur="start"),
        N("G4", E, None, extend=True, slur="stop"),
        N("Bb4", E, "still", slur="start"),
        N("Eb5", E, None, extend=True, slur="stop"),
    ],
    # 2 He sleeps this night so
    [
        N("Eb5", E, "He"),
        N("G4", E, "sleeps"),
        N("F4", E, "this"),
        N("F4", E, "night"),
        N("Ab4", Q, "so"),
    ],
    # 3 chill
    [
        N("D4", E, "chill", slur="start"),
        N("D4", E, None, extend=True),
        N("F4", E, None, extend=True),
        N("Eb4", E, None, extend=True),
        N("G4", Q, None, extend=True, slur="stop"),
    ],
    # 4 The Virgin's tender
    [
        N("G4", E, "The"),
        N("G4", E, "Vir", syl="begin"),
        N("Bb4", E, "gin's", syl="end"),
        N("Ab4", E, "ten", syl="begin"),
        N("C5", Q, "der", syl="end"),
    ],
    # 5 arms enfolding
    [
        N("Bb4", E, "arms"),
        N("Bb4", E, "en", syl="begin"),
        N("D5", E, "fold", syl="end"),
        N("C5", E, "ing", slur="start"),
        N("Eb5", Q, None, extend=True, slur="stop"),
    ],
    # 6 Warm and safe the Child
    [
        N("Ab4", E, "Warm"),
        N("Ab4", E, "and"),
        N("C5", E, "safe"),
        N("Bb4", E, "the"),
        N("D5", Q, "Child"),
    ],
    # 7 are holding
    [
        N("C5", E, "are"),
        N("C5", E, "hold", slur="start"),
        N("Eb5", E, None, extend=True, slur="stop"),
        N("D5", E, "ing", slur="start"),
        N("Bb4", Q, None, extend=True, slur="stop"),
    ],
    # 8 Still, still, still
    [
        N("Bb4", Q, "Still"),
        N("Eb4", E, "still", slur="start"),
        N("G4", E, None, extend=True, slur="stop"),
        N("Bb4", E, "still", slur="start"),
        N("Eb5", E, None, extend=True, slur="stop"),
    ],
    # 9 He sleeps this night so
    [
        N("Eb5", E, "He"),
        N("G4", E, "sleeps"),
        N("F4", E, "this"),
        N("F4", E, "night"),
        N("Ab4", Q, "so"),
    ],
    # 10 chill
    [
        N("D4", E, "chill", slur="start"),
        N("D4", E, None, extend=True),
        N("F4", E, None, extend=True),
        N("Eb4", E, None, extend=True),
        N("G4", Q, None, extend=True, slur="stop"),
    ],
    # 11 cadence
    [N("F4", DQ, None, extend=True, slur="start"), N("Eb4", DQ, None, extend=True, slur="stop")],
    # 12 hold
    [N("Eb4", DH, None, extend=True)],
]

STILL_A = [
    [N("G4", Q), N("Bb3", E), N("Eb4", E), N("G4", E), N("Bb4", E)],
    [N("Bb4", E), N("Eb4", E), N("D4", E), N("D4", E), N("F4", Q)],
    [N("Bb3", E), N("Bb3", E), N("D4", E), N("C4", E), N("Eb4", Q)],
    [N("Eb4", E), N("Eb4", E), N("G4", E), N("F4", E), N("Ab4", Q)],
    [N("G4", E), N("G4", E), N("Bb4", E), N("Ab4", E), N("C5", Q)],
    [N("F4", E), N("F4", E), N("Ab4", E), N("G4", E), N("Bb4", Q)],
    [N("Ab4", E), N("Ab4", E), N("C5", E), N("Bb4", E), N("G4", Q)],
    [N("G4", Q), N("Bb3", E), N("Eb4", E), N("G4", E), N("Bb4", E)],
    [N("Bb4", E), N("Eb4", E), N("D4", E), N("D4", E), N("F4", Q)],
    [N("Bb3", E), N("Bb3", E), N("D4", E), N("C4", E), N("Eb4", Q)],
    [N("C4", DQ), N("Bb3", DQ)],
    [N("Bb3", DH)],
]

# Tenor written (treble_8, sounding 8vb)
STILL_T = [
    [N("Eb4", Q), N("G3", E), N("Bb3", E), N("Eb4", E), N("G4", E)],
    [N("Ab4", E), N("Eb4", E), N("Bb3", E), N("Bb3", E), N("C4", Q)],
    [N("Ab3", E), N("Ab3", E), N("Bb3", E), N("Bb3", E), N("Bb3", Q)],
    [N("C4", E), N("C4", E), N("Eb4", E), N("Eb4", E), N("Eb4", Q)],
    [N("Eb4", E), N("Eb4", E), N("G4", E), N("F4", E), N("G4", Q)],
    [N("C4", E), N("C4", E), N("Eb4", E), N("Eb4", E), N("F4", Q)],
    [N("Eb4", E), N("Eb4", E), N("Ab4", E), N("F4", E), N("F4", Q)],
    [N("Eb4", Q), N("G3", E), N("Bb3", E), N("Eb4", E), N("G4", E)],
    [N("Ab4", E), N("Eb4", E), N("Bb3", E), N("Bb3", E), N("C4", Q)],
    [N("Ab3", E), N("Ab3", E), N("Bb3", E), N("Bb3", E), N("Bb3", Q)],
    [N("Ab3", DQ), N("G3", DQ)],
    [N("G3", DH)],
]

STILL_B = [
    [N("Eb3", DQ), N("Eb3", DQ)],
    [N("Ab2", DQ), N("Ab2", DQ)],
    [N("Bb2", DQ), N("Bb2", DQ)],
    [N("C3", DQ), N("C3", DQ)],
    [N("Eb3", DQ), N("Eb3", DQ)],
    [N("F2", DQ), N("F2", DQ)],
    [N("Bb2", DQ), N("Bb2", DQ)],
    [N("Eb3", DQ), N("Eb3", DQ)],
    [N("Ab2", DQ), N("Ab2", DQ)],
    [N("Bb2", DQ), N("Bb2", DQ)],
    [N("Bb2", DQ), N("Eb3", DQ)],
    [N("Eb3", DH)],
]

# Verse 2 lyrics for Still (Sleep, sleep, sleep...)
STILL_V2_LYRICS = [
    [("Sleep", "single"), ("sleep", "single"), (None, None), ("sleep", "single"), (None, None)],
    [("He", "single"), ("lies", "single"), ("in", "single"), ("slum", "begin"), ("ber", "end")],
    [("deep", "single"), (None, None), (None, None), (None, None), (None, None)],
    [("While", "single"), ("an", "begin"), ("gel", "end"), ("hosts", "single"), ("from", "single")],
    [("heav'n", "single"), ("come", "single"), ("wing", "begin"), ("ing", "end"), (None, None)],
    [("Sweet", "begin"), ("est", "end"), ("songs", "single"), ("of", "single"), ("joy", "single")],
    [("are", "single"), ("sing", "begin"), (None, None), ("ing", "single"), (None, None)],
    [("Sleep", "single"), ("sleep", "single"), (None, None), ("sleep", "single"), (None, None)],
    [("He", "single"), ("lies", "single"), ("in", "single"), ("slum", "begin"), ("ber", "end")],
    [("deep", "single"), (None, None), (None, None), (None, None), (None, None)],
    [(None, None), (None, None)],
    [(None, None)],
]


def apply_lyrics(notes_bars, lyric_bars):
    out = []
    for nb, lb in zip(notes_bars, lyric_bars):
        bar = []
        li = 0
        for n in nb:
            nn = dict(n)
            if n.get("kind") == "note" and li < len(lb):
                text, syl = lb[li]
                if text is not None:
                    nn["lyric"] = text
                    if syl:
                        nn["syl"] = syl
                    if text in ("deep",) or (syl is None and text is None):
                        pass
                else:
                    nn["lyric"] = None
                    nn["extend"] = True
                li += 1
            bar.append(nn)
        out.append(bar)
    return out


STILL_S_V2 = apply_lyrics(STILL_S, STILL_V2_LYRICS)

# ---------------------------------------------------------------------------
# Were You There — 4/4, Eb, traditional spiritual
# ---------------------------------------------------------------------------

def wyt_melody(verse: int):
    """Soprano-range melody (sounding). verse 1 crucified, 2 tomb, 3 rose/glory."""
    if verse == 1:
        a, b = "cru", "ci"
        c = "fied"
        obj = [("my", "single"), ("Lord", "single")]
        q_words = [
            ("they", "single"),
        ]
        line_end = "Lord"
        oh = True
        mid = "tremble"
        feel = False
    elif verse == 2:
        a, b = "laid", "Him"
        c = None
        # "laid Him in the tomb"
        oh = True
        mid = "tremble"
        feel = False
    else:
        a, b = "rose", "up"
        oh = True
        mid = "glory"
        feel = True

    # We'll attach lyrics in a second pass per verse for accuracy.
    return None


# Complete WYT soprano notes + lyrics per verse

def wyt_s_notes():
    """Pitch/duration skeleton shared by all verses (soprano sounding)."""
    pickup = [N("Bb3", Q), N("Eb4", Q)]
    bars = [
        [N("G4", H), N("G4", Q), N("G4", Q)],
        [N("F4", Q), N("Eb4", Q), N("G4", DQ), N("F4", E)],
        [N("Eb4", H), N("Eb4", Q), N("G4", Q)],
        [N("Bb4", H), N("Bb4", Q), N("Bb4", Q)],
        [N("C5", Q), N("Bb4", Q), N("Bb4", DQ), N("G4", E)],
        [N("F4", W)],
        [N("Bb4", H, slur="start"), N("Eb5", DQ), N("C5", E)],
        [N("Bb4", W, slur="stop")],
        [N("C5", Q), N("Bb4", H), N("G4", Q)],
        [N("G4", DQ), N("F4", E), N("Eb4", Q), N("Eb4", Q)],
        [N("F4", Q), N("Eb4", H + Q)],  # tremble 1
        [N("Eb4", Q), N("Eb4", H + Q)],  # tremble 2
        [N("Bb3", Q), N("Bb3", H + Q)],  # tremble 3
        [N("Eb4", Q), N("Ab4", Q), N("G4", H)],
        [N("G4", Q), N("G4", Q), N("F4", Q), N("Eb4", Q)],
        [N("G4", DQ), N("F4", E), N("Eb4", H)],
    ]
    return pickup, bars


WYT_LYRICS = {
    1: {
        "pickup": [("Were", "single"), ("you", "single")],
        "bars": [
            [("there", "single"), ("when", "single"), ("they", "single")],
            [("cru", "begin"), ("ci", "middle"), ("fied", "end"), ("my", "single")],
            [("Lord", "single"), ("Were", "single"), ("you", "single")],
            [("there", "single"), ("when", "single"), ("they", "single")],
            [("cru", "begin"), ("ci", "middle"), ("fied", "end"), ("my", "single")],
            [("Lord", "single")],
            [("Oh", "single"), (None, None), (None, None)],
            [(None, None)],
            [("Some", "begin"), ("times", "end"), ("it", "single")],
            [("caus", "begin"), ("es", "end"), ("me", "single"), ("to", "single")],
            [("trem", "begin"), ("ble", "end")],
            [("trem", "begin"), ("ble", "end")],
            [("trem", "begin"), ("ble", "end")],
            [("Were", "single"), ("you", "single"), ("there", "single")],
            [("when", "single"), ("they", "single"), ("cru", "begin"), ("ci", "middle")],
            [("fied", "end"), ("my", "single"), ("Lord", "single")],
        ],
    },
    2: {
        "pickup": [("Were", "single"), ("you", "single")],
        "bars": [
            [("there", "single"), ("when", "single"), ("they", "single")],
            [("laid", "single"), ("Him", "single"), ("in", "single"), ("the", "single")],
            [("tomb", "single"), ("Were", "single"), ("you", "single")],
            [("there", "single"), ("when", "single"), ("they", "single")],
            [("laid", "single"), ("Him", "single"), ("in", "single"), ("the", "single")],
            [("tomb", "single")],
            [("Oh", "single"), (None, None), (None, None)],
            [(None, None)],
            [("Some", "begin"), ("times", "end"), ("it", "single")],
            [("caus", "begin"), ("es", "end"), ("me", "single"), ("to", "single")],
            [("trem", "begin"), ("ble", "end")],
            [("trem", "begin"), ("ble", "end")],
            [("trem", "begin"), ("ble", "end")],
            [("Were", "single"), ("you", "single"), ("there", "single")],
            [("when", "single"), ("they", "single"), ("laid", "single"), ("Him", "single")],
            [("in", "single"), ("the", "single"), ("tomb", "single")],
        ],
    },
    3: {
        "pickup": [("Were", "single"), ("you", "single")],
        "bars": [
            [("there", "single"), ("when", "single"), ("He", "single")],
            [("rose", "single"), ("up", "single"), ("from", "single"), ("the", "single")],
            [("dead", "single"), ("Were", "single"), ("you", "single")],
            [("there", "single"), ("when", "single"), ("He", "single")],
            [("rose", "single"), ("up", "single"), ("from", "single"), ("the", "single")],
            [("dead", "single")],
            [("Oh", "single"), (None, None), (None, None)],
            [(None, None)],
            [("Some", "begin"), ("times", "end"), ("I", "single")],
            [("feel", "single"), ("like", "single"), ("shout", "begin"), ("ing", "end")],
            [("Glo", "begin"), ("ry", "end")],
            [("Glo", "begin"), ("ry", "end")],
            [("Glo", "begin"), ("ry", "end")],
            [("Were", "single"), ("you", "single"), ("there", "single")],
            [("when", "single"), ("He", "single"), ("rose", "single"), ("up", "single")],
            [("from", "single"), ("the", "single"), ("dead", "single")],
        ],
    },
}


def with_wyt_lyrics(pickup, bars, verse):
    ly = WYT_LYRICS[verse]
    pu = []
    for n, (t, s) in zip(pickup, ly["pickup"]):
        nn = dict(n)
        nn["lyric"] = t
        nn["syl"] = s
        pu.append(nn)
    out = []
    for bar, lb in zip(bars, ly["bars"]):
        nb = []
        i = 0
        for n in bar:
            nn = dict(n)
            if i < len(lb):
                t, s = lb[i]
                if t is None:
                    nn["lyric"] = None
                    nn["extend"] = True
                else:
                    nn["lyric"] = t
                    nn["syl"] = s
                i += 1
            nb.append(nn)
        out.append(nb)
    return pu, out


# Alto harmony for WYT (below melody, humming or words)
WYT_A_BARS = [
    [N("Eb4", H), N("Eb4", Q), N("Eb4", Q)],
    [N("D4", Q), N("C4", Q), N("Eb4", DQ), N("D4", E)],
    [N("Bb3", H), N("Bb3", Q), N("Eb4", Q)],
    [N("G4", H), N("G4", Q), N("G4", Q)],
    [N("Ab4", Q), N("G4", Q), N("G4", DQ), N("Eb4", E)],
    [N("D4", W)],
    [N("G4", H), N("Bb4", DQ), N("Ab4", E)],
    [N("G4", W)],
    [N("Ab4", Q), N("G4", H), N("Eb4", Q)],
    [N("Eb4", DQ), N("D4", E), N("C4", Q), N("C4", Q)],
    [N("C4", Q), N("Bb3", H + Q)],
    [N("C4", Q), N("Bb3", H + Q)],
    [N("F3", Q), N("F3", H + Q)],
    [N("G3", Q), N("C4", Q), N("Bb3", H)],
    [N("Eb4", Q), N("Eb4", Q), N("D4", Q), N("C4", Q)],
    [N("Eb4", DQ), N("D4", E), N("Bb3", H)],
]
WYT_A_PICKUP = [N("G3", Q), N("Bb3", Q)]

# Tenor written (treble_8). Melody mostly.
WYT_T_PICKUP = [N("Bb3", Q), N("Eb4", Q)]  # sounding Bb2, Eb3
WYT_T_BARS = [
    [N("G4", H), N("G4", Q), N("G4", Q)],
    [N("F4", Q), N("Eb4", Q), N("G4", DQ), N("F4", E)],
    [N("Eb4", H), N("Eb4", Q), N("G4", Q)],
    [N("Bb4", H), N("Bb4", Q), N("Bb4", Q)],
    [N("C5", Q), N("Bb4", Q), N("Bb4", DQ), N("G4", E)],
    [N("F4", W)],
    [N("Bb4", H, slur="start"), N("C5", DQ), N("Ab4", E)],  # written; sounding Bb3–C4, approachable
    [N("Bb4", W, slur="stop")],
    [N("C5", Q), N("Bb4", H), N("G4", Q)],
    [N("G4", DQ), N("F4", E), N("Eb4", Q), N("Eb4", Q)],
    [N("F4", Q), N("Eb4", H + Q)],
    [N("Eb4", Q), N("Eb4", H + Q)],
    [N("Bb3", Q), N("Bb3", H + Q)],
    [N("Eb4", Q), N("Ab4", Q), N("G4", H)],
    [N("G4", Q), N("G4", Q), N("F4", Q), N("Eb4", Q)],
    [N("G4", DQ), N("F4", E), N("Eb4", H)],
]

# Bass sounding
WYT_B_PICKUP = [N("Bb2", Q), N("Eb3", Q)]
WYT_B_BARS = [
    [N("Eb3", H), N("Eb3", Q), N("Eb3", Q)],
    [N("Bb2", Q), N("Ab2", Q), N("Bb2", DQ), N("Bb2", E)],
    [N("Eb3", H), N("Eb3", Q), N("Eb3", Q)],
    [N("Eb3", H), N("G3", Q), N("G3", Q)],
    [N("Ab3", Q), N("Eb3", Q), N("Eb3", DQ), N("Eb3", E)],
    [N("Bb2", W)],
    [N("Eb3", H), N("G3", DQ), N("Ab3", E)],
    [N("Eb3", W)],
    [N("Ab3", Q), N("Eb3", H), N("Eb3", Q)],
    [N("Bb2", DQ), N("Bb2", E), N("C3", Q), N("Ab2", Q)],
    [N("Ab2", Q), N("Eb3", H + Q)],
    [N("Ab2", Q), N("Eb3", H + Q)],
    [N("Bb2", Q), N("Bb2", H + Q)],
    [N("C3", Q), N("Ab2", Q), N("Eb3", H)],
    [N("Eb3", Q), N("Eb3", Q), N("Bb2", Q), N("Ab2", Q)],
    [N("Bb2", DQ), N("Bb2", E), N("Eb3", H)],
]


# ---------------------------------------------------------------------------
# Piano patterns
# ---------------------------------------------------------------------------

def piano_68(chord_rh, chord_lh, *, open_rh=False):
    """6 flowing eighths. chord_* are lists of 3 pitches (low to high-ish)."""
    rh, lh = [], []
    # LH: bass - fifth - third  twice
    l0, l1, l2 = chord_lh
    lh = [N(l0, E, staff=2), N(l1, E, staff=2), N(l2, E, staff=2),
          N(l0, E, staff=2, oct_up=False), N(l1, E, staff=2), N(l2, E, staff=2)]
    r0, r1, r2 = chord_rh
    rh = [N(r0, E, staff=1), N(r1, E, staff=1), N(r2, E, staff=1),
          N(r1, E, staff=1), N(r2, E, staff=1), N(r0, E, staff=1)]
    return rh, lh


I_68 = (["Bb3", "Eb4", "G4"], ["Eb2", "Bb2", "G3"])
IV_68 = (["Ab3", "C4", "Eb4"], ["Ab2", "Eb3", "C4"])
V_68 = (["Bb3", "D4", "F4"], ["Bb2", "F3", "D4"])
VI_68 = (["C4", "Eb4", "G4"], ["C3", "G3", "Eb4"])
I6_68 = (["G3", "Bb3", "Eb4"], ["Eb3", "Bb3", "G3"])
II_68 = (["Ab3", "C4", "F4"], ["F2", "C3", "Ab3"])

STILL_PIANO_HARMONY = [I_68, IV_68, V_68, VI_68, I_68, II_68, V_68, I_68, IV_68, V_68, V_68, I_68]


def piano_44(bass, rh_pitches):
    """Flowing 8 eighths: LH bass + arpeggio, RH gentle broken chord."""
    b1, b2 = bass[0], bass[1] if len(bass) > 1 else bass[0]
    r = rh_pitches  # 4 pitches cycling
    lh = [N(b1, E, staff=2), N(r[0], E, staff=2), N(r[1], E, staff=2), N(r[2], E, staff=2),
          N(b2, E, staff=2), N(r[0], E, staff=2), N(r[1], E, staff=2), N(r[2], E, staff=2)]
    rh = [N(r[1], E, staff=1), N(r[2], E, staff=1), N(r[3] if len(r) > 3 else r[0], E, staff=1),
          N(r[2], E, staff=1), N(r[1], E, staff=1), N(r[2], E, staff=1),
          N(r[3] if len(r) > 3 else r[0], E, staff=1), N(r[2], E, staff=1)]
    return rh, lh


# Harmony map for WYT 16 bars + we'll do pickup separately
WYT_PIANO = [
    (["Eb2", "Eb3"], ["G3", "Bb3", "Eb4", "G4"]),  # 1
    (["Bb2", "Bb2"], ["F3", "Ab3", "D4", "F4"]),
    (["Eb2", "Eb3"], ["G3", "Bb3", "Eb4", "G4"]),
    (["Eb2", "G2"], ["Bb3", "Eb4", "G4", "Bb4"]),
    (["Ab2", "Eb3"], ["C4", "Eb4", "Ab4", "C5"]),
    (["Bb2", "Bb2"], ["F3", "Bb3", "D4", "F4"]),
    (["Eb2", "G2"], ["G3", "Bb3", "Eb4", "G4"]),  # Oh
    (["Eb2", "Eb3"], ["G3", "Bb3", "Eb4", "Bb4"]),
    (["Ab2", "Eb3"], ["C4", "Eb4", "Ab4", "C5"]),
    (["Bb2", "Ab2"], ["D4", "F4", "Bb3", "D4"]),
    (["Ab2", "Eb3"], ["C4", "Eb4", "Ab4", "C4"]),  # tremble
    (["Ab2", "Eb3"], ["C4", "Eb4", "G4", "C4"]),
    (["Bb2", "Bb2"], ["D4", "F4", "Bb3", "D4"]),
    (["C3", "Ab2"], ["Eb4", "Ab4", "C4", "Eb4"]),
    (["Eb2", "Bb2"], ["G3", "Bb3", "Eb4", "G4"]),
    (["Bb2", "Eb2"], ["F3", "Bb3", "D4", "G4"]),
]

WYT_PIANO_GLORY = [
    (["Eb2", "Eb3"], ["G3", "Bb3", "Eb4", "G4"]),
    (["Bb2", "Bb2"], ["F3", "Ab3", "D4", "F4"]),
    (["Eb2", "Eb3"], ["G3", "Bb3", "Eb4", "G4"]),
    (["Eb2", "G2"], ["Bb3", "Eb4", "G4", "Bb4"]),
    (["Ab2", "Eb3"], ["C4", "Eb4", "Ab4", "C5"]),
    (["Bb2", "Bb2"], ["F3", "Bb3", "D4", "F4"]),
    (["Eb2", "G2"], ["G3", "Bb3", "Eb4", "Bb4"]),
    (["Eb2", "Eb3"], ["Bb3", "Eb4", "G4", "Bb4"]),
    (["Ab2", "Eb3"], ["C4", "Eb4", "Ab4", "C5"]),
    (["Bb2", "C3"], ["D4", "F4", "G4", "Bb4"]),
    (["Ab2", "Eb3"], ["C4", "Eb4", "Ab4", "C5"]),  # Glory
    (["Ab2", "Eb3"], ["C4", "Eb4", "G4", "Bb4"]),
    (["Bb2", "Bb2"], ["D4", "F4", "Bb4", "D5"]),
    (["C3", "Ab2"], ["Eb4", "Ab4", "C5", "Eb5"]),
    (["Eb2", "Bb2"], ["G3", "Bb3", "Eb4", "G4"]),
    (["Bb2", "Eb2"], ["F3", "Bb3", "Eb4", "G4"]),
]


def humify(bars, syllable="mm"):
    out = []
    for bar in bars:
        nb = []
        first = True
        for n in bar:
            nn = dict(n)
            if nn.get("kind") == "note":
                if first:
                    nn["lyric"] = syllable
                    nn["syl"] = "single"
                    first = False
                else:
                    nn["lyric"] = None
                    nn["extend"] = True
            nb.append(nn)
        out.append(nb)
    return out


def strip_lyrics(bars):
    out = []
    for bar in bars:
        nb = []
        for n in bar:
            nn = dict(n)
            nn.pop("lyric", None)
            nn.pop("syl", None)
            nn.pop("extend", None)
            nb.append(nn)
        out.append(nb)
    return out


def rests_68(n=1):
    return [[R(DH, measure=True)] for _ in range(n)]


def rests_44(n=1):
    return [[R(W, measure=True)] for _ in range(n)]


def transpose_oct(bars, d_oct):
    out = []
    for bar in bars:
        nb = []
        for n in bar:
            nn = dict(n)
            if nn.get("kind") == "note" and nn.get("pitch"):
                step, alter, octv = parse_pitch(nn["pitch"])
                acc = "b" if alter == -1 else "#" if alter == 1 else ""
                nn["pitch"] = f"{step}{acc}{octv + d_oct}"
            nb.append(nn)
        out.append(nb)
    return out


# ---------------------------------------------------------------------------
# XML emission
# ---------------------------------------------------------------------------

def el(tag, text=None, **attrs):
    attrs = {k.replace("_", "-"): str(v) for k, v in attrs.items() if v is not None}
    e = ET.Element(tag, attrs)
    if text is not None:
        e.text = str(text)
    return e


def add(parent, tag, text=None, **attrs):
    e = el(tag, text, **attrs)
    parent.append(e)
    return e


def emit_pitch(note_el, pitch):
    step, alter, octv = parse_pitch(pitch)
    p = add(note_el, "pitch")
    add(p, "step", step)
    if alter:
        add(p, "alter", str(alter))
    add(p, "octave", str(octv))


def emit_note(parent, event, *, voice=1, staff=None, chord=False, beam_state=None):
    n = add(parent, "note")
    if event.get("grace"):
        add(n, "grace", slash="yes")
    if chord:
        add(n, "chord")
    if event["kind"] == "rest":
        r = add(n, "rest")
        if event.get("measure"):
            r.set("measure", "yes")
    else:
        emit_pitch(n, event["pitch"])
    add(n, "duration", str(event["dur"]))
    add(n, "voice", str(event.get("voice", voice)))
    typ, dots = type_for(event["dur"])
    if not event.get("measure"):
        add(n, "type", typ)
        for _ in range(dots):
            add(n, "dot")
    st = event.get("staff", staff)
    if st:
        add(n, "staff", str(st))
    if event.get("tie_start") or event.get("tie_stop"):
        if event.get("tie_stop"):
            add(n, "tie", type="stop")
        if event.get("tie_start"):
            add(n, "tie", type="start")
    if event.get("beam"):
        add(n, "beam", event["beam"], number="1")
    notations_needed = any([
        event.get("fermata"),
        event.get("tie_start"),
        event.get("tie_stop"),
        event.get("slur"),
    ])
    if notations_needed:
        nnot = add(n, "notations")
        if event.get("fermata"):
            add(nnot, "fermata")
        if event.get("tie_stop"):
            add(nnot, "tied", type="stop")
        if event.get("tie_start"):
            add(nnot, "tied", type="start")
        if event.get("slur"):
            add(nnot, "slur", type=event["slur"], number=str(event.get("slur_n", 1)))
    if event.get("lyric"):
        ly = add(n, "lyric", number="1")
        add(ly, "syllabic", event.get("syl", "single"))
        add(ly, "text", event["lyric"])
        if event.get("extend"):
            add(ly, "extend", type="start")
    elif event.get("extend"):
        ly = add(n, "lyric", number="1")
        add(ly, "extend", type="continue")
    return n


def beam_eighths(events, staff=None):
    """Annotate beam begin/continue/end on consecutive eighths in groups of 3 (6/8) or 2 (4/4)."""
    return events  # keep simple; MuseScore will auto-beam reasonably


def emit_measure(part_el, meas: dict, *, part_id, is_first, time_sig, set_clef, piano=False, pickup=False):
    m = add(part_el, "measure", number=str(meas["number"]))
    if meas.get("implicit"):
        m.set("implicit", "yes")
    if meas.get("width"):
        m.set("width", str(meas["width"]))

    need_attrs = is_first or meas.get("time_change") or meas.get("clef_change")
    if need_attrs:
        attrs = add(m, "attributes")
        add(attrs, "divisions", str(DIV))
        if is_first:
            k = add(attrs, "key")
            add(k, "fifths", "-3")
            add(k, "mode", "major")
        if is_first or meas.get("time_change"):
            t = add(attrs, "time")
            beats, beat_type = time_sig.split("/")
            add(t, "beats", beats)
            add(t, "beat-type", beat_type)
        if piano and is_first:
            add(attrs, "staves", "2")
            cl = add(attrs, "clef", number="1")
            add(cl, "sign", "G")
            add(cl, "line", "2")
            cl2 = add(attrs, "clef", number="2")
            add(cl2, "sign", "F")
            add(cl2, "line", "4")
        elif is_first and not piano:
            cl = add(attrs, "clef")
            if part_id == "P4":  # bass
                add(cl, "sign", "F")
                add(cl, "line", "4")
            elif part_id == "P3":  # tenor
                add(cl, "sign", "G")
                add(cl, "line", "2")
                add(cl, "clef-octave-change", "-1")
            else:
                add(cl, "sign", "G")
                add(cl, "line", "2")

    for d in meas.get("dirs", []):
        emit_direction(m, d)

    # Piano: RH staff 1 then backup then LH staff 2
    events = meas["events"]
    if piano:
        rh = [e for e in events if e.get("staff", 1) == 1]
        lh = [e for e in events if e.get("staff") == 2]
        if not rh and not lh:
            rh = events
            lh = []
        rh_dur = 0
        for e in rh:
            if e["kind"] == "chord":
                for i, p in enumerate(e["pitches"]):
                    emit_note(m, {"kind": "note", "pitch": p, "dur": e["dur"], "staff": 1},
                              voice=1, staff=1, chord=(i > 0))
                rh_dur += e["dur"]
            else:
                emit_note(m, e, voice=1, staff=1)
                rh_dur += e["dur"]
        if lh:
            add(m, "backup")
            add(m[-1] if False else list(m)[-1] if False else None)
            # fix backup
            m.remove(list(m)[-1]) if False else None
            bu = add(m, "backup")
            add(bu, "duration", str(rh_dur if rh_dur else (PICKUP if pickup else (BAR_68 if time_sig == "6/8" else BAR_44))))
            for e in lh:
                if e["kind"] == "chord":
                    for i, p in enumerate(e["pitches"]):
                        emit_note(m, {"kind": "note", "pitch": p, "dur": e["dur"], "staff": 2},
                                  voice=2, staff=2, chord=(i > 0))
                else:
                    emit_note(m, e, voice=2, staff=2)
    else:
        for e in events:
            if e["kind"] == "chord":
                for i, p in enumerate(e["pitches"]):
                    emit_note(m, {"kind": "note", "pitch": p, "dur": e["dur"]}, chord=(i > 0))
            else:
                emit_note(m, e)

    if meas.get("barline") == "light-light":
        bl = add(m, "barline", location="right")
        add(bl, "bar-style", "light-light")
    elif meas.get("barline") == "light-heavy":
        bl = add(m, "barline", location="right")
        add(bl, "bar-style", "light-heavy")
    return m


def emit_direction(measure_el, d):
    place = d.get("place", "above")
    direction = add(measure_el, "direction", placement=place)
    dt = add(direction, "direction-type")
    if d.get("rehearsal"):
        reh = add(dt, "rehearsal", d["rehearsal"])
        reh.set("enclosure", "square")
    if d.get("words"):
        w = add(dt, "words", d["words"])
        if d.get("words_font"):
            w.set("font-style", "italic")
        else:
            w.set("font-size", "11")
    if d.get("dynamics"):
        dyn = add(dt, "dynamics")
        add(dyn, d["dynamics"])
    if d.get("metronome"):
        # metronome: ("quarter", 56) or ("quarter-dot", 48)
        unit, pm = d["metronome"]
        metro = add(dt, "metronome")
        if unit == "quarter-dot":
            add(metro, "beat-unit", "quarter")
            add(metro, "beat-unit-dot")
        else:
            add(metro, "beat-unit", unit)
        add(metro, "per-minute", str(pm))
        if unit == "quarter-dot":
            add(direction, "sound", tempo=str(int(pm * 1.5)))
        else:
            add(direction, "sound", tempo=str(pm))
    if d.get("wedge"):
        add(dt, "wedge", type=d["wedge"])
    if d.get("pedal"):
        add(dt, "pedal", type=d["pedal"], line="yes")
    if d.get("dacapo"):
        add(dt, "words", d["dacapo"])
    if d.get("staff"):
        add(direction, "staff", str(d["staff"]))
    offset = d.get("offset")
    if offset:
        add(direction, "offset", str(offset))


# The emit_measure piano backup code is messy. I'll rewrite emit more cleanly.

def clean_emit_measure(part_el, meas, *, part_id, is_first, time_sig, piano=False):
    m = add(part_el, "measure", number=str(meas["number"]))
    if meas.get("implicit"):
        m.set("implicit", "yes")

    if meas.get("new_system"):
        add(m, "print", new_system="yes")

    if is_first or meas.get("time_change"):
        attrs = add(m, "attributes")
        add(attrs, "divisions", str(DIV))
        if is_first:
            k = add(attrs, "key")
            add(k, "fifths", "-3")
            add(k, "mode", "major")
        t = add(attrs, "time")
        beats, beat_type = time_sig.split("/")
        add(t, "beats", beats)
        add(t, "beat-type", beat_type)
        if piano:
            add(attrs, "staves", "2")
            cl = add(attrs, "clef", number="1")
            add(cl, "sign", "G")
            add(cl, "line", "2")
            cl2 = add(attrs, "clef", number="2")
            add(cl2, "sign", "F")
            add(cl2, "line", "4")
        else:
            cl = add(attrs, "clef")
            if part_id == "P4":
                add(cl, "sign", "F")
                add(cl, "line", "4")
            elif part_id == "P3":
                add(cl, "sign", "G")
                add(cl, "line", "2")
                add(cl, "clef-octave-change", "-1")
            else:
                add(cl, "sign", "G")
                add(cl, "line", "2")

    for d in meas.get("dirs", []):
        emit_direction(m, d)

    events = meas["events"]
    if piano:
        rh = [e for e in events if e.get("staff", 1) != 2]
        lh = [e for e in events if e.get("staff") == 2]
        rh_dur = sum(e["dur"] for e in rh) if rh else 0
        for e in rh:
            write_event(m, e, voice=1, staff=1)
        expected = PICKUP if meas.get("implicit") and time_sig in ("4/4", "2/4") else (
            BAR_68 if time_sig == "6/8" else BAR_44 if time_sig == "4/4" else PICKUP
        )
        if time_sig == "2/4":
            expected = PICKUP
        bu = add(m, "backup")
        add(bu, "duration", str(rh_dur if rh_dur else expected))
        for e in lh:
            write_event(m, e, voice=2, staff=2)
    else:
        for e in events:
            write_event(m, e, voice=1)

    if meas.get("barline"):
        bl = add(m, "barline", location="right")
        add(bl, "bar-style", meas["barline"])
    return m


def write_event(m, e, voice=1, staff=None):
    if e["kind"] == "chord":
        for i, p in enumerate(e["pitches"]):
            emit_note(
                m,
                {"kind": "note", "pitch": p, "dur": e["dur"], "fermata": e.get("fermata") if i == 0 else False},
                voice=voice,
                staff=e.get("staff", staff),
                chord=(i > 0),
            )
    else:
        emit_note(m, e, voice=voice, staff=e.get("staff", staff))


def duration_of(events):
    return sum(e["dur"] for e in events)


def copy_notes(bars):
    return [[dict(n) for n in bar] for bar in bars]


# ---------------------------------------------------------------------------
# Build the full score as parallel measure lists
# ---------------------------------------------------------------------------

def measure_template(number, time_sig, **kw):
    return {
        "S": {"number": number, "events": [], "dirs": [], "time_sig": time_sig, **kw},
        "A": {"number": number, "events": [], "dirs": [], "time_sig": time_sig, **kw},
        "T": {"number": number, "events": [], "dirs": [], "time_sig": time_sig, **kw},
        "B": {"number": number, "events": [], "dirs": [], "time_sig": time_sig, **kw},
        "P": {"number": number, "events": [], "dirs": [], "time_sig": time_sig, **kw},
    }


class Score:
    def __init__(self):
        self.measures = []  # list of dicts per part
        self.n = 0

    def add_bar(self, time_sig, S, A, T, B, P, dirs_s=None, dirs_p=None, **kw):
        self.n += 1
        group = 3 if time_sig == "6/8" else 2
        rec = {
            "S": {"number": self.n, "events": beam_events(S, group), "dirs": dirs_s or [], "time_sig": time_sig, **kw},
            "A": {"number": self.n, "events": beam_events(A, group), "dirs": [], "time_sig": time_sig, **kw},
            "T": {"number": self.n, "events": beam_events(T, group), "dirs": [], "time_sig": time_sig, **kw},
            "B": {"number": self.n, "events": beam_events(B, group), "dirs": [], "time_sig": time_sig, **kw},
            "P": {"number": self.n, "events": beam_piano(P, group), "dirs": dirs_p or [], "time_sig": time_sig, **kw},
        }
        self.measures.append(rec)
        return rec


def beam_events(events, group):
    events = [dict(e) for e in events]
    run = []

    def flush():
        if len(run) >= 2:
            run[0]["beam"] = "begin"
            for x in run[1:-1]:
                x["beam"] = "continue"
            run[-1]["beam"] = "end"
        run.clear()

    for e in events:
        if e.get("kind") == "note" and e.get("dur") == E:
            run.append(e)
            if len(run) == group:
                flush()
        else:
            flush()
    flush()
    return events


def beam_piano(events, group):
    rh = [e for e in events if e.get("staff", 1) != 2]
    lh = [e for e in events if e.get("staff") == 2]
    return beam_events(rh, group) + beam_events(lh, group)


def combine_piano(rh, lh):
    out = []
    for e in rh:
        ee = dict(e)
        ee["staff"] = 1
        out.append(ee)
    for e in lh:
        ee = dict(e)
        ee["staff"] = 2
        out.append(ee)
    return out


def still_piano_bar(i):
    rh_ch, lh_ch = STILL_PIANO_HARMONY[i % len(STILL_PIANO_HARMONY)]
    rh, lh = piano_68(rh_ch, lh_ch)
    return combine_piano(rh, lh)


def wyt_piano_bar(i, glory=False):
    src = WYT_PIANO_GLORY if glory else WYT_PIANO
    bass, rhp = src[i]
    rh, lh = piano_44(bass, rhp)
    return combine_piano(rh, lh)


def rest_choir_68():
    return [R(DH, measure=True)]


def rest_choir_44():
    return [R(W, measure=True)]


def rest_choir_pickup():
    return [R(PICKUP)]


def build_score() -> Score:
    sc = Score()

    # ===== INTRO 4 bars 6/8 =====
    for i in range(4):
        dirs_s = []
        dirs_p = []
        if i == 0:
            dirs_s = [
                {"words": "Gently flowing, like a lullaby", "words_font": True, "place": "above"},
                {"metronome": ("quarter-dot", 48)},
                {"rehearsal": "A"},
            ]
            dirs_p = [{"dynamics": "p", "place": "below", "staff": 1}, {"pedal": "start", "place": "below", "staff": 2}]
        kw = {"time_change": True} if i == 0 else {}
        sc.add_bar("6/8", rest_choir_68(), rest_choir_68(), rest_choir_68(), rest_choir_68(), still_piano_bar(i),
                   dirs_s=dirs_s, dirs_p=dirs_p, **kw)

    # ===== STILL V1 — SA two-part, TB tacet =====
    for i in range(12):
        dirs_s = []
        dirs_p = []
        if i == 0:
            dirs_s = [
                {"rehearsal": "B"},
                {"words": "Soprano & Alto  (Verse 1)", "place": "above"},
                {"dynamics": "p"},
            ]
            kw = {"new_system": True}
        elif i == 11:
            kw = {"barline": "light-light"}
        else:
            kw = {}
        tb = rest_choir_68()
        sc.add_bar("6/8", STILL_S[i], STILL_A[i], tb, tb, still_piano_bar(i), dirs_s=dirs_s, dirs_p=dirs_p, **kw)

    # ===== INTERLUDE 2 bars =====
    for i in range(2):
        sc.add_bar("6/8", rest_choir_68(), rest_choir_68(), rest_choir_68(), rest_choir_68(), still_piano_bar(i))

    # ===== STILL V2 — SATB =====
    for i in range(12):
        dirs_s = []
        if i == 0:
            dirs_s = [
                {"rehearsal": "C"},
                {"words": "SATB  (Verse 2)", "place": "above"},
                {"dynamics": "mp"},
            ]
            kw = {"new_system": True}
        else:
            kw = {"barline": "light-light"} if i == 11 else {}
        sc.add_bar("6/8", STILL_S_V2[i], STILL_A[i], STILL_T[i], STILL_B[i], still_piano_bar(i),
                   dirs_s=dirs_s, **kw)

    # ===== TRANSITION — hum Still, 4 bars, then rit. =====
    hum_s = humify(STILL_S[:4])
    hum_a = humify(STILL_A[:4])
    hum_t = humify(STILL_T[:4])
    hum_b = humify(STILL_B[:4])
    for i in range(4):
        dirs_s = []
        if i == 0:
            dirs_s = [
                {"rehearsal": "D"},
                {"words": "All hum  (transition)", "place": "above"},
                {"dynamics": "pp"},
            ]
            kw_extra = {"new_system": True}
        else:
            kw_extra = {}
        if i == 3:
            dirs_s.append({"words": "rit.", "words_font": True})
        sc.add_bar("6/8", hum_s[i], hum_a[i], hum_t[i], hum_b[i], still_piano_bar(i), dirs_s=dirs_s, **kw_extra)

    # ===== WYT V1 pickup + 16 bars — TB melody, SA hum =====
    pu, s_bars = with_wyt_lyrics(*wyt_s_notes(), 1)
    # Men sing melody an octave down: tenor written = soprano written of wyt_s which is already mid
    # For TB: use WYT_T (written) with lyrics, bass with lyrics
    t_pu, t_bars = with_wyt_lyrics(WYT_T_PICKUP, WYT_T_BARS, 1)
    b_pu, b_bars = with_wyt_lyrics(WYT_B_PICKUP, WYT_B_BARS, 1)
    a_hum_pu = [dict(n) for n in WYT_A_PICKUP]
    for n, (txt, syl) in zip(a_hum_pu, [("mm", "single"), (None, None)]):
        if txt:
            n["lyric"] = txt
            n["syl"] = syl
        else:
            n["extend"] = True
    a_hum_bars = humify(WYT_A_BARS)
    s_hum_pu = [dict(n) for n in pu]
    for n in s_hum_pu:
        n["lyric"] = "mm" if n is s_hum_pu[0] else None
        if n["lyric"]:
            n["syl"] = "single"
        else:
            n["extend"] = True
            n.pop("syl", None)
    s_hum_bars = humify(s_bars)

    # Pickup 2/4
    dirs_s = [
        {"rehearsal": "E"},
        {"words": "Tenor & Bass  (Were You There, v.1)  ·  SA hum", "place": "above"},
        {"metronome": ("quarter", 56)},
        {"dynamics": "mp"},
    ]
    dirs_p = [{"dynamics": "p", "place": "below", "staff": 1}]
    # piano pickup: two bass notes + light RH
    p_pu = combine_piano(
        [N("G3", Q, staff=1), N("Bb3", Q, staff=1)],
        [N("Bb2", Q, staff=2), N("Eb3", Q, staff=2)],
    )
    sc.add_bar("2/4", s_hum_pu, a_hum_pu, t_pu, b_pu, p_pu,
               dirs_s=dirs_s, dirs_p=dirs_p, implicit=True, time_change=True, new_system=True)

    for i in range(16):
        kw = {"time_change": True} if i == 0 else {}
        if i == 0:
            kw["time_change"] = True
        dirs_s = [{"words": "a tempo", "words_font": True}] if i == 0 else []
        if i == 6:
            dirs_s.append({"dynamics": "mf"})
            dirs_s.append({"words": "Oh — unhurried", "words_font": True})
        if i == 10:
            dirs_s.append({"wedge": "crescendo"})
        if i == 12:
            dirs_s.append({"wedge": "stop"})
        if i == 15:
            kw["barline"] = "light-light"
        pbar = wyt_piano_bar(i, glory=False)
        sc.add_bar("4/4", s_hum_bars[i], a_hum_bars[i], t_bars[i], b_bars[i], pbar, dirs_s=dirs_s, **kw)

    # ===== INTERLUDE 2 bars 4/4 =====
    for i in range(2):
        sc.add_bar("4/4", rest_choir_44(), rest_choir_44(), rest_choir_44(), rest_choir_44(),
                   wyt_piano_bar(i))

    # ===== WYT V2 tomb — SA words, TB hum =====
    pu2, s2 = with_wyt_lyrics(*wyt_s_notes(), 2)
    a2_pu, a2 = with_wyt_lyrics(WYT_A_PICKUP, WYT_A_BARS, 2)
    t_hum_pu = [dict(n) for n in WYT_T_PICKUP]
    t_hum_pu[0]["lyric"] = "mm"
    t_hum_pu[0]["syl"] = "single"
    t_hum_pu[1]["extend"] = True
    t_hum = humify(WYT_T_BARS)
    b_hum_pu = [dict(n) for n in WYT_B_PICKUP]
    b_hum_pu[0]["lyric"] = "mm"
    b_hum_pu[0]["syl"] = "single"
    b_hum_pu[1]["extend"] = True
    b_hum = humify(WYT_B_BARS)

    dirs_s = [
        {"rehearsal": "F"},
        {"words": "Soprano & Alto  (v.2 — the tomb)  ·  TB hum", "place": "above"},
        {"dynamics": "p"},
    ]
    p_pu = combine_piano(
        [N("G3", Q, staff=1), N("Bb3", Q, staff=1)],
        [N("Bb2", Q, staff=2), N("Eb3", Q, staff=2)],
    )
    sc.add_bar("2/4", pu2, a2_pu, t_hum_pu, b_hum_pu, p_pu, dirs_s=dirs_s, implicit=True, time_change=True, new_system=True)

    for i in range(16):
        kw = {"time_change": True} if i == 0 else {}
        dirs_s = []
        if i == 6:
            dirs_s.append({"dynamics": "mp"})
        if i == 15:
            kw["barline"] = "light-light"
        sc.add_bar("4/4", s2[i], a2[i], t_hum[i], b_hum[i], wyt_piano_bar(i), dirs_s=dirs_s, **kw)

    # ===== WYT V3 resurrection — SATB full =====
    pu3, s3 = with_wyt_lyrics(*wyt_s_notes(), 3)
    a3_pu, a3 = with_wyt_lyrics(WYT_A_PICKUP, WYT_A_BARS, 3)
    t3_pu, t3 = with_wyt_lyrics(WYT_T_PICKUP, WYT_T_BARS, 3)
    b3_pu, b3 = with_wyt_lyrics(WYT_B_PICKUP, WYT_B_BARS, 3)

    dirs_s = [
        {"rehearsal": "G"},
        {"words": "SATB  (v.3 — the Resurrection)", "place": "above"},
        {"dynamics": "mf"},
        {"words": "broader, still flowing", "words_font": True, "place": "above"},
    ]
    sc.add_bar("2/4", pu3, a3_pu, t3_pu, b3_pu, p_pu, dirs_s=dirs_s, implicit=True, time_change=True, new_system=True)

    for i in range(16):
        kw = {"time_change": True} if i == 0 else {}
        dirs_s = []
        if i == 6:
            dirs_s.append({"dynamics": "f"})
        if i == 10:
            dirs_s.append({"words": "Glory!", "words_font": True})
            dirs_s.append({"wedge": "crescendo"})
        if i == 13:
            dirs_s.append({"wedge": "stop"})
        if i == 15:
            kw["barline"] = "light-light"
            # fermata on last choir notes
            if s3[i]:
                s3[i][-1]["fermata"] = True
                a3[i][-1]["fermata"] = True
                t3[i][-1]["fermata"] = True
                b3[i][-1]["fermata"] = True
        sc.add_bar("4/4", s3[i], a3[i], t3[i], b3[i], wyt_piano_bar(i, glory=True), dirs_s=dirs_s, **kw)

    # ===== CODA — back to 6/8 Still =====
    coda_s = [
        [N("Bb4", Q, "Still"), N("Eb4", E, "still", syl="begin"), N("G4", E, None, syl="end"),
         N("Bb4", E, "still", syl="begin"), N("Eb5", E, None, syl="end")],
        [N("Eb5", E, "He"), N("G4", E, "rose"), N("F4", E, "up"), N("F4", E, "from"), N("Ab4", Q, "the")],
        [N("D4", E, "dead", extend=True), N("D4", E, None, extend=True), N("F4", E, None, extend=True),
         N("Eb4", E, None, extend=True), N("G4", Q, None, extend=True)],
        [N("F4", DQ, None, extend=True), N("Eb4", DQ, "Still")],
        [N("Eb4", DQ, "still"), N("G4", DQ, "still")],
        [CH(["Eb4", "G4", "Bb4", "Eb5"], DH, fermata=True)],
    ]
    # For SATB last bar, use separate pitches not one chord on S only
    coda_s[-1] = [N("Eb5", DH, None, fermata=True)]
    coda_a = [
        [N("G4", Q), N("Bb3", E), N("Eb4", E), N("G4", E), N("Bb4", E)],
        [N("Bb4", E), N("Eb4", E), N("D4", E), N("D4", E), N("F4", Q)],
        [N("Bb3", E), N("Bb3", E), N("D4", E), N("C4", E), N("Eb4", Q)],
        [N("C4", DQ), N("Bb3", DQ)],
        [N("Bb3", DQ), N("Eb4", DQ)],
        [N("Bb3", DH, fermata=True)],
    ]
    coda_t = [
        [N("Eb4", Q), N("G3", E), N("Bb3", E), N("Eb4", E), N("G4", E)],
        [N("Ab4", E), N("Eb4", E), N("Bb3", E), N("Bb3", E), N("C4", Q)],
        [N("Ab3", E), N("Ab3", E), N("Bb3", E), N("Bb3", E), N("Bb3", Q)],
        [N("Ab3", DQ), N("G3", DQ)],
        [N("G3", DQ), N("Bb3", DQ)],
        [N("G3", DH, fermata=True)],
    ]
    coda_b = [
        [N("Eb3", DQ), N("Eb3", DQ)],
        [N("Ab2", DQ), N("Ab2", DQ)],
        [N("Bb2", DQ), N("Bb2", DQ)],
        [N("Bb2", DQ), N("Eb3", DQ)],
        [N("Eb3", DQ), N("Eb3", DQ)],
        [N("Eb2", DH, fermata=True)],
    ]
    coda_words_a = [
        [("Still", "single"), ("still", "begin"), (None, "end"), ("still", "begin"), (None, "end")],
        [("He", "single"), ("rose", "single"), ("up", "single"), ("from", "single"), ("the", "single")],
        [("dead", "single"), (None, None), (None, None), (None, None), (None, None)],
        [(None, None), ("Still", "single")],
        [("still", "single"), ("still", "single")],
        [(None, None)],
    ]
    coda_a = apply_lyrics(coda_a, coda_words_a)
    coda_t = apply_lyrics(coda_t, coda_words_a)
    coda_b_ly = [
        [("Still", "single"), ("still", "single")],
        [("He", "single"), ("rose", "single")],
        [("dead", "single"), (None, None)],
        [(None, None), ("Still", "single")],
        [("still", "single"), ("still", "single")],
        [(None, None)],
    ]
    coda_b = apply_lyrics(coda_b, coda_b_ly)

    for i in range(6):
        dirs_s = []
        dirs_p = []
        kw = {"time_change": True} if i == 0 else {}
        if i == 0:
            dirs_s = [
                {"rehearsal": "H"},
                {"words": "Coda — SATB, very peaceful", "place": "above"},
                {"metronome": ("quarter-dot", 44)},
                {"dynamics": "pp"},
            ]
            kw["new_system"] = True
        if i == 5:
            kw["barline"] = "light-heavy"
            dirs_p = [{"pedal": "stop", "place": "below", "staff": 2}]
        sc.add_bar("6/8", coda_s[i], coda_a[i], coda_t[i], coda_b[i], still_piano_bar(i if i < 5 else 11),
                   dirs_s=dirs_s, dirs_p=dirs_p, **kw)

    return sc


def check_durations(sc: Score):
    errors = []
    for rec in sc.measures:
        ts = rec["S"]["time_sig"]
        expected = BAR_68 if ts == "6/8" else BAR_44 if ts == "4/4" else PICKUP
        for part in ("S", "A", "T", "B"):
            d = duration_of(rec[part]["events"])
            if d != expected:
                errors.append(f"m{rec[part]['number']} {part} {ts} dur={d} expected={expected}")
        rh = [e for e in rec["P"]["events"] if e.get("staff", 1) != 2]
        lh = [e for e in rec["P"]["events"] if e.get("staff") == 2]
        rd, ld = duration_of(rh), duration_of(lh)
        if rd != expected:
            errors.append(f"m{rec['P']['number']} P-RH {ts} dur={rd} expected={expected}")
        if ld != expected:
            errors.append(f"m{rec['P']['number']} P-LH {ts} dur={ld} expected={expected}")
    return errors


def to_xml(sc: Score) -> ET.Element:
    root = el("score-partwise", version="4.0")
    work = add(root, "work")
    add(work, "work-title", "Still, Still, Still / Were You There")
    add(root, "movement-title", "A Medley for SATB Choir and Piano")
    ident = add(root, "identification")
    c = add(ident, "creator", "Traditional Austrian carol and African American spiritual", type="composer")
    add(ident, "creator", "Original SATB and piano medley arrangement", type="arranger")
    rights = (
        "Tunes and traditional English texts are in the public domain. "
        "Still, Still, Still: Austrian carol, Salzburgische Volkslieder, 1865; "
        "public-domain English translation. "
        "Were You There: African American spiritual, 19th century "
        "(text as commonly sung, including the Resurrection stanza). "
        "This choral-piano arrangement is original and is not the 2025 Hymns for Home and Church setting. "
        "Intended for church and home use."
    )
    add(ident, "rights", rights)
    enc = add(ident, "encoding")
    add(enc, "software", "Custom MusicXML generator")
    add(enc, "encoding-date", "2026-08-22")
    add(enc, "supports", element="accidental", type="yes")
    add(enc, "supports", element="beam", type="yes")
    add(enc, "supports", attribute="new-system", element="print", type="yes", value="yes")

    # Credits
    for i, (typ, text) in enumerate([
        ("title", "Still, Still, Still / Were You There"),
        ("subtitle", "A medley for SATB choir and piano"),
        ("composer", "Traditional  ·  arr. for church choir"),
    ], start=1):
        cr = add(root, "credit", page="1")
        add(cr, "credit-type", typ)
        cw = add(cr, "credit-words", text)
        if typ == "title":
            cw.set("font-size", "22")
            cw.set("justify", "center")
            cw.set("valign", "top")
            cw.set("default-y", "1450")
        elif typ == "subtitle":
            cw.set("font-size", "12")
            cw.set("font-style", "italic")
            cw.set("justify", "center")
            cw.set("default-y", "1380")
        else:
            cw.set("font-size", "10")
            cw.set("justify", "right")
            cw.set("default-y", "1320")
            cw.set("default-x", "1100")

    notes = add(root, "credit", page="1")
    add(notes, "credit-type", "rights")
    nw = add(
        notes,
        "credit-words",
        "Voicings: A piano intro · B Still v.1 SA · C Still v.2 SATB · D hum transition · "
        "E Were You There (crucified) TB + SA hum · F (tomb) SA + TB hum · G (rose) SATB · H coda. "
        "Keep the piano flowing; do not play block chords. The “sun refused to shine” stanza may replace letter F.",
    )
    nw.set("default-y", "50")
    nw.set("font-size", "8")
    nw.set("justify", "center")

    pl = add(root, "part-list")
    pg = add(pl, "part-group", number="1", type="start")
    add(pg, "group-symbol", "bracket")
    add(pg, "group-barline", "yes")

    parts_meta = [
        ("P1", "Soprano", "S"),
        ("P2", "Alto", "A"),
        ("P3", "Tenor", "T"),
        ("P4", "Bass", "B"),
    ]
    for pid, name, abbr in parts_meta:
        sp = add(pl, "score-part", id=pid)
        add(sp, "part-name", name)
        add(sp, "part-abbreviation", abbr)
        midi = add(sp, "midi-instrument", id=pid + "-I")
        add(midi, "midi-channel", "1")
        add(midi, "midi-program", "53")  # Choir Aahs
        add(midi, "volume", "78")
        add(midi, "pan", "0")

    add(pl, "part-group", number="1", type="stop")

    sp = add(pl, "score-part", id="P5")
    add(sp, "part-name", "Piano")
    add(sp, "part-abbreviation", "Pno.")
    midi = add(sp, "midi-instrument", id="P5-I")
    add(midi, "midi-channel", "2")
    add(midi, "midi-program", "1")
    add(midi, "volume", "70")
    add(midi, "pan", "0")

    part_map = {"P1": "S", "P2": "A", "P3": "T", "P4": "B", "P5": "P"}
    for pid, key in part_map.items():
        part_el = add(root, "part", id=pid)
        prev_ts = None
        for i, rec in enumerate(sc.measures):
            meas = rec[key]
            ts = meas["time_sig"]
            first = i == 0
            meas_copy = dict(meas)
            if first or ts != prev_ts:
                meas_copy["time_change"] = True
            clean_emit_measure(
                part_el,
                meas_copy,
                part_id=pid,
                is_first=first,
                time_sig=ts,
                piano=(pid == "P5"),
            )
            prev_ts = ts
    return root


def pretty(root: ET.Element) -> str:
    xml = ET.tostring(root, encoding="utf-8")
    # prepend doctype
    parsed = minidom.parseString(xml)
    body = parsed.documentElement.toprettyxml(indent="  ")
    # toprettyxml on element doesn't include declaration the way we want
    decl = '<?xml version="1.0" encoding="UTF-8"?>\n'
    doctype = '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n'
    # minidom already added xml declaration in toprettyxml of document; we used element
    # strip the xml declaration minidom puts on the element serialization if present
    if body.startswith("<?xml"):
        body = body.split("?>", 1)[1].lstrip()
    return decl + doctype + body


def main():
    sc = build_score()
    errs = check_durations(sc)
    if errs:
        print("DURATION ERRORS:")
        for e in errs:
            print(" ", e)
        raise SystemExit(1)
    root = to_xml(sc)
    out = Path(__file__).resolve().parent / "still-still-still-were-you-there-medley.musicxml"
    text = pretty(root)
    out.write_text(text, encoding="utf-8")
    print(f"Wrote {out} ({out.stat().st_size} bytes, {sc.n} measures)")


if __name__ == "__main__":
    main()
