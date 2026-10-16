"""Synthesises the 51 s soundtrack: a light, playful pizzicato melody (low, to sit under a
voice-over) plus subtle SFX synced to scene.html. Writes out/music.wav (48 kHz stereo).
Pass --no-sfx for a music-only bed."""
import os, sys, wave
import numpy as np

SR, DUR = 48000, 51.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
mus = np.zeros((N, 2))
sfx = np.zeros((N, 2))
mus_sfx_cut = np.zeros((N, 2))  # SFX already in final (voice-over) time


# Scene cuts as designed vs. as re-timed to the voice-over pauses (see CUTS in scene.html).
DESIGN_CUTS = [0, 3, 10, 17, 23, 32, 39, 50]
VO_CUTS = [0, 3.8, 9.5, 16.15, 22.9, 31.75, 38.6, 51]   # in the voice-over's pauses


def warp(t):
    for k in range(len(DESIGN_CUTS) - 1):
        a, b = DESIGN_CUTS[k], DESIGN_CUTS[k + 1]
        if t < b or k == len(DESIGN_CUTS) - 2:
            return VO_CUTS[k] + (t - a) * (VO_CUTS[k + 1] - VO_CUTS[k]) / (b - a)


def add(buf, t0, sig, gain=1.0, pan=0.0):
    if buf is sfx:
        t0 = warp(t0)
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 0] += sig * l * 1.414
    buf[i:i + len(sig), 1] += sig * r * 1.414


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def pluck(f, dur=0.9, bright=0.5):
    """Karplus-Strong string pluck."""
    n = int(SR * dur)
    period = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, period)
    buf = np.convolve(buf, np.ones(3) / 3, mode="same") if bright < 0.6 else buf
    out = np.empty(n)
    decay = 0.996
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = decay * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    out *= np.minimum(1, np.arange(n) / (SR * 0.002))
    return out / (np.abs(out).max() + 1e-9)


def mallet(f, dur=0.7):
    t = np.arange(int(SR * dur)) / SR
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t * 30)
    return s * np.exp(-t * 6) * np.minimum(1, t / 0.003)


def noise(dur):
    return rng.uniform(-1, 1, int(SR * dur))


def lowpass(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc)
        y[i] = acc
    return y


def env(n, att, rel):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(att, 1e-4)) * np.exp(-t / rel)


# ---------------------------------------------------------------- music bed
BPM = 116
beat = 60 / BPM


def pizz(f, dur=0.35):
    """short, bright pizzicato pluck"""
    return pluck(f, dur, 0.8) * np.exp(-np.arange(int(SR * dur)) / SR * 9)


# F major, mischievous: F - Dm - Bb - C7, walking pizz bass
chords = [(41, [65, 69, 72]), (38, [62, 65, 69]), (46, [62, 65, 70]), (48, [64, 67, 70])]
cells = [
    [77, None, 76, 77, 72, None, 69, None],
    [74, None, 73, 74, 77, None, None, 74],
    [70, 72, 74, None, 77, 76, 74, None],
    [72, None, 71, 72, 79, None, 76, None],
]
bar = 4 * beat
nbars = int(np.ceil(DUR / bar))
for b in range(nbars):
    t0 = b * bar
    root, chord = chords[b % 4]
    for k, off in enumerate([0, 7, 12, 7]):        # walking bass, one per beat
        add(mus, t0 + k * beat, pizz(hz(root - 12 + off), 0.5), 0.3 if k == 0 else 0.2)
    for k in (1, 3):
        for j, n in enumerate(chord):
            add(mus, t0 + k * beat + j * 0.012, pizz(hz(n), 0.25), 0.05, pan=-0.3 + 0.3 * j)
    if b >= 1 and b < nbars - 1:
        cell = cells[b % 4] if b % 8 < 4 else cells[(b + 1) % 4]
        for k, n in enumerate(cell):
            if n is not None:
                add(mus, t0 + k * beat / 2, pizz(hz(n), 0.3), 0.18, pan=0.25)
# "ta-da" ending
for k, n in enumerate([72, 77, 81]):
    add(mus, DUR - 2.0 + k * 0.12, pizz(hz(n), 1.2), 0.16, pan=-0.2 + 0.2 * k)
# soft fades
fade = np.ones(N)
fade[: int(SR * 0.4)] = np.linspace(0, 1, int(SR * 0.4))
fade[-int(SR * 1.2):] = np.linspace(1, 0, int(SR * 1.2))
mus *= fade[:, None]


# ---------------------------------------------------------------- SFX
def whoosh(dur=0.45, up=True):
    n = int(SR * dur)
    x = noise(dur)
    a = np.linspace(0.02, 0.35, n) if up else np.linspace(0.35, 0.02, n)
    y = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y * np.sin(np.linspace(0, np.pi, n)) ** 2 * 2.2


def pop(f=520, dur=0.12):
    t = np.arange(int(SR * dur)) / SR
    fr = f * (1 + 1.2 * np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 28)


def thud(f=70, dur=0.5, click=0.4):
    t = np.arange(int(SR * dur)) / SR
    fr = f * (1 + 1.5 * np.exp(-t * 25))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 9)
    s[: int(SR * 0.01)] += noise(0.01) * click
    return s


def tick(dur=0.02):
    return lowpass(noise(dur), 0.6) * env(int(SR * dur), 0.0005, 0.004) * 3


def chime(fs=(1568, 2093, 2637), gap=0.06):
    out = np.zeros(int(SR * 1.2))
    for k, f in enumerate(fs):
        m = mallet(f, 0.9)
        i = int(k * gap * SR)
        out[i:i + len(m)] += m[: len(out) - i]
    return out


def creak(dur=1.0):
    t = np.arange(int(SR * dur)) / SR
    f = 90 + 40 * np.sin(t * 7) + 20 * t
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3
    return lowpass(s, 0.08) * np.sin(np.linspace(0, np.pi, len(t))) * 1.6


def rumble(dur=1.0):
    return lowpass(noise(dur), 0.01) * np.sin(np.linspace(0, np.pi, int(SR * dur))) * 6


def hiss(dur):
    n = int(SR * dur)
    return (noise(dur) - lowpass(noise(dur), 0.3)) * np.sin(np.linspace(0, np.pi, n)) * 0.25


def eio(x):
    return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2


def eo(x):
    return 1 - (1 - x) ** 3


def gurgle(dur):
    t = np.arange(int(SR * dur)) / SR
    return lowpass(noise(dur), 0.03) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.linspace(0, np.pi, len(t))) * 5


def printer(dur):
    t = np.arange(int(SR * dur)) / SR
    sq = np.sign(np.sin(2 * np.pi * 140 * t)) * (np.sin(2 * np.pi * 18 * t) > 0)
    return lowpass(sq, 0.12) * np.minimum(1, np.minimum(t, dur - t) / 0.05) * 0.8


def boing(dur=0.5, f0=180):
    t = np.arange(int(SR * dur)) / SR
    f = f0 * (1 + 1.2 * t / dur) * (1 + 0.25 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 6))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)


def riser(dur, f0=300, f1=1200):
    t = np.arange(int(SR * dur)) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi / 2, len(t))) * np.exp(-np.maximum(0, t - dur + 0.1) * 30) * 0.5


def plop(f=300):
    t = np.arange(int(SR * 0.15)) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (1 - 0.6 * t / 0.15)) / SR) * np.exp(-t * 25)


# transitions (wipe centred on each cut)
for tc in VO_CUTS[1:-1]:
    add(mus_sfx_cut, tc - 0.3, whoosh(0.5), 0.22, pan=-0.2)
# S1 tag swing, flip, arrow, boing
add(sfx, 0.05, whoosh(0.45), 0.14)
add(sfx, 1.0, tick(0.02), 0.3)
add(sfx, 1.15, pop(700), 0.15)
add(sfx, 1.3, pop(900), 0.14)
add(sfx, 1.75, boing(0.6), 0.22)
# S2 catalogue, tags, magnifier
add(sfx, 3.15, whoosh(0.5, up=False), 0.14)
for i in range(3):
    add(sfx, 3 + 0.55 + i * 0.2, pop(420 + i * 60, 0.08), 0.1)
    add(sfx, 3 + 1.1 + i * 0.3, pop(650 + i * 120), 0.15)
add(sfx, 3 + 2.1, whoosh(4.2), 0.08)
# S3 bars + ≈
add(sfx, 10.5, riser(1.9, 220, 520), 0.12)
add(sfx, 10 + 2.5, pop(560), 0.16)
# S4 the 49 $ bar keeps rising, trophy
add(sfx, 17.3, riser(1.9, 400, 1500), 0.16)
add(sfx, 17 + 2.3, chime((1568, 2093, 2637, 3136), 0.06), 0.13)
# S5 the 9 floats in, brain lights up, PROMO sticker
add(sfx, 23.6, whoosh(1.6), 0.12)
add(sfx, 23 + 2.3, chime((1175, 1568, 2349)), 0.1)
add(sfx, 23 + 2.8, pop(500), 0.18)
add(sfx, 23 + 3.3, boing(0.45, 260), 0.15)
# S6 catalogue pages, counters, +30 %
for i in range(3):
    st = 32 + 0.2 + i * 1.25
    add(sfx, st, whoosh(0.4), 0.14)
    for b in range(5):
        add(sfx, st + 0.45 + b * 0.15, tick(0.012), 0.15)
add(sfx, 32 + 4.0, pop(480), 0.2)
add(sfx, 32 + 4.1, chime((1568, 2093, 2637)), 0.13)
# S7 9,99 € melts into 10 €, then the end card (designed 9 s, played in 7.6 s from 3.4 s)
add(sfx, 39.1, pop(700), 0.14)
for k in range(3):
    add(sfx, 39 + 1.0 + k * 0.22, plop(320 - k * 40), 0.2)
for k in range(6):
    add(sfx, 39 + 1.1 + k * 0.1, tick(0.012), 0.15)
add(sfx, 39 + 2.3, pop(600), 0.15)
for off, fx in [(0.55, lambda: whoosh(1.9)), (3.0, lambda: pop(500)), (3.55, lambda: chime((1175, 1480, 1760, 2349), 0.05)),
                (5.1, lambda: pop(700)), (6.75, lambda: tick(0.02) * 2), (6.8, lambda: chime((1760, 2349)))]:
    add(sfx, 39 + 3.4 + off * 7.6 / 9, fx(), 0.16 if off != 6.75 else 0.4)

# ---------------------------------------------------------------- mix
mus *= 0.32 / (np.abs(mus).max() + 1e-9)     # music kept low for the voice-over
mix = mus if "--no-sfx" in sys.argv else mus + (sfx + mus_sfx_cut) * 0.9
peak = np.abs(mix).max()
if peak > 0.89:
    mix *= 0.89 / peak
os.makedirs(os.path.join(os.path.dirname(__file__), "out"), exist_ok=True)
path = os.path.join(os.path.dirname(__file__), "out", "music.wav")
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("wrote", path, "peak", round(float(np.abs(mix).max()), 3))
