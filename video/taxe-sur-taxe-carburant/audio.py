"""Synthesises the 48 s soundtrack: a light, playful and slightly ironic pluck melody (low, to sit under a
voice-over) plus subtle SFX synced to scene.html. Writes out/music.wav (48 kHz stereo).
Pass --no-sfx for a music-only bed."""
import os, sys, wave
import numpy as np

SR, DUR = 48000, 44.5
N = int(SR * DUR)
rng = np.random.default_rng(7)
mus = np.zeros((N, 2))
sfx = np.zeros((N, 2))
mus_sfx_cut = np.zeros((N, 2))  # SFX already in final (voice-over) time


# Scene cuts as designed vs. as re-timed to the voice-over pauses (see CUTS in scene.html).
DESIGN_CUTS = [0, 3, 9, 16, 23, 31, 38, 48]
VO_CUTS = [0, 4.8, 10.65, 17.3, 22.45, 30.7, 35.65, 44.5]   # in the voice-over's pauses


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
BPM = 108
beat = 60 / BPM
# C major with a cheeky flat-six: C - Ab - F - G, oom-pah bass
chords = [(48, [60, 64, 67]), (44, [60, 63, 68]), (41, [60, 65, 69]), (43, [59, 62, 67])]
# staccato 8th-note cells with chromatic "wink" notes (None = rest)
cells = [
    [72, None, 71, 72, None, 67, None, None],
    [68, None, 67, 68, None, 63, None, 60],
    [69, 70, 71, 72, None, 65, None, None],
    [67, None, 66, 67, None, 74, 71, None],
]
bar = 4 * beat
nbars = int(np.ceil(DUR / bar))
for b in range(nbars):
    t0 = b * bar
    root, chord = chords[b % 4]
    add(mus, t0, pluck(hz(root - 12), 1.2, 0.3), 0.32)
    add(mus, t0 + 2 * beat, pluck(hz(root - 12 + 7), 1.0, 0.3), 0.22)
    for k in (1, 3):  # off-beat chord "pah"
        for j, n in enumerate(chord):
            add(mus, t0 + k * beat, mallet(hz(n), 0.25), 0.045, pan=-0.3 + 0.3 * j)
    if b >= 1 and b < nbars - 1:
        cell = cells[b % 4] if b % 8 < 4 else cells[(b + 2) % 4]
        for k, n in enumerate(cell):
            if n is not None:
                add(mus, t0 + k * beat / 2, pluck(hz(n), 0.5, 0.8), 0.16, pan=0.25)
# ironic "wah-wah" descent to close
for k, n in enumerate([67, 66, 65, 64]):
    add(mus, DUR - 2.4 + k * 0.42, pluck(hz(n), 0.9 if k < 3 else 1.8, 0.6), 0.15)
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


# transitions (wipe centred on each cut)
for tc in VO_CUTS[1:-1]:
    add(mus_sfx_cut, tc - 0.3, whoosh(0.5), 0.22, pan=-0.2)
# S1 tags (Russian dolls)
add(sfx, 0.3, whoosh(0.4), 0.15)
add(sfx, 0.75, thud(140, 0.2, 0.2), 0.25)
add(sfx, 1.15, pop(380), 0.2)
add(sfx, 1.55, pop(620, 0.18), 0.14)
add(sfx, 1.9, pop(700), 0.18)
add(sfx, 2.25, pop(1100, 0.14), 0.12)
# S2 litre, accise, coins to the State
add(sfx, 3.1, pop(500), 0.14)
add(sfx, 3.5, gurgle(1.1), 0.35)
add(sfx, 4.7, pop(800), 0.15)
add(sfx, 5.2, pop(450), 0.14)
for i in range(6):
    add(sfx, 6.0 + i * 0.28, mallet(2637, 0.3), 0.06, pan=-0.3)
    add(sfx, 6.9 + i * 0.28, mallet(3136, 0.35), 0.08, pan=0.4)
# S3 stamps
add(sfx, 9.6, whoosh(0.4), 0.15)
add(sfx, 10.0, thud(95, 0.4, 0.6), 0.45)
add(sfx, 11.6, whoosh(0.4), 0.17)
add(sfx, 12.0, thud(65, 0.8, 0.9), 0.65)
add(sfx, 12.0, rumble(0.5), 0.45)
# S4 fifty little litres, 6 €
add(sfx, 16.35, whoosh(1.6), 0.12)
for i in range(50):
    if i % 2 == 0:
        add(sfx, 16 + 0.9 + i * 0.028, tick(0.012), 0.12, pan=(i % 10 - 4.5) / 6)
add(sfx, 18.1, chime((1319, 1568)), 0.08)
prev = -1
for i in range(int(1.2 * 120)):
    lt = 2.5 + i / 120
    v = int(eo(min(1, (lt - 2.5) / 1.2)) * 20)
    if v != prev:
        add(sfx, 16 + lt, tick(0.015), 0.2)
        prev = v
add(sfx, 19.7, chime((1568, 2093)), 0.12)
# S5 receipt
add(sfx, 23.3, printer(1.5), 0.12)
add(sfx, 24.9, whoosh(0.3), 0.1)
add(sfx, 25.7, whoosh(0.5), 0.12)
add(sfx, 26.5, pop(520), 0.16)
add(sfx, 27.3, chime((2093, 2637, 3136), 0.05), 0.1)
# S6 a coin a week
for i in range(52):
    x = (i + 1) / 52
    wt = 0.5 + 4.3 * (np.sqrt(x / 2) if x < 0.5 else 1 - np.sqrt((1 - x) / 2))
    add(sfx, 31 + wt, mallet(2349 + (i % 3) * 300, 0.25), 0.07, pan=0.35)
    add(sfx, 31 + wt - 0.3, tick(0.01), 0.08, pan=-0.3)
add(sfx, 31 + 4.85, chime((1568, 2093, 2637)), 0.13)
# S7 plane, logo, button, click (scene time-scaled 9 s -> 10 s)
add(sfx, 38 + 0.61, whoosh(1.9), 0.22, pan=0.3)
add(sfx, 38 + 3.33, pop(500), 0.16)
add(sfx, 38 + 3.94, chime((1175, 1480, 1760, 2349), 0.05), 0.1)
add(sfx, 38 + 5.67, pop(700), 0.16)
add(sfx, 38 + 7.5, tick(0.02) * 2, 0.4)
add(sfx, 38 + 7.56, chime((1760, 2349)), 0.13)

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
