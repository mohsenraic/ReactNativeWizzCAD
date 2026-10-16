"""Synthesises the 48 s soundtrack: a light, curious pluck melody (low, to sit under a
voice-over) plus subtle SFX synced to scene.html. Writes out/music.wav (48 kHz stereo).
Pass --no-sfx for a music-only bed."""
import os, sys, wave
import numpy as np

SR, DUR = 48000, 48.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
mus = np.zeros((N, 2))
sfx = np.zeros((N, 2))
mus_sfx_cut = np.zeros((N, 2))  # SFX already in final (voice-over) time


# Scene cuts as designed vs. as re-timed to the voice-over pauses (see CUTS in scene.html).
DESIGN_CUTS = [0, 3, 8, 15, 22, 30, 39, 48]
VO_CUTS = [0, 4.05, 8.9, 15.75, 23.0, 31.4, 39.05, 48]


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
BPM = 100
beat = 60 / BPM
# D minor-ish, curious: i - VI - III - VII  (Dm, Bb, F, C), one chord per bar
chords = [(50, [62, 65, 69]), (46, [62, 65, 70]), (53, [60, 65, 69]), (48, [60, 64, 67])]
# 8th-note melody cells (None = rest), D minor pentatonic + a sly 6th
cells = [
    [74, None, 77, 74, None, 72, 69, None],
    [70, None, 74, None, 77, 74, None, 72],
    [72, None, 69, 72, None, 77, 76, None],
    [74, 72, None, 69, None, 67, 69, None],
]
bar = 4 * beat
nbars = int(np.ceil(DUR / bar))
for b in range(nbars):
    t0 = b * bar
    root, chord = chords[b % 4]
    add(mus, t0, pluck(hz(root - 12), 2.0, 0.3), 0.32)
    add(mus, t0 + 2 * beat, pluck(hz(root - 12 + 7), 1.4, 0.3), 0.18)
    for k, n in enumerate(chord):  # soft broken chord on off-beats
        add(mus, t0 + (2 * k + 1) * beat / 2, mallet(hz(n), 0.6), 0.07, pan=-0.4 + 0.4 * k)
    if b >= 1 and b < nbars - 1:  # melody enters after the hook bar
        cell = cells[b % 4] if b % 8 < 4 else cells[(b + 1) % 4]
        for k, n in enumerate(cell):
            if n is not None:
                add(mus, t0 + k * beat / 2, pluck(hz(n), 0.8, 0.8), 0.16, pan=0.25)
# final chord ring-out
for k, n in enumerate([62, 65, 69, 74]):
    add(mus, 46.4 + k * 0.06, pluck(hz(n), 1.6, 0.7), 0.14, pan=-0.3 + 0.2 * k)
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


# transitions (wipe centred on each cut)
for tc in VO_CUTS[1:-1]:
    add(mus_sfx_cut, tc - 0.3, whoosh(0.5), 0.22, pan=-0.2)
# S1 vault
add(sfx, 0.25, creak(0.7), 0.25)
add(sfx, 0.85, rumble(1.1), 0.4)
add(sfx, 0.9, hiss(0.9), 0.5)
add(sfx, 1.25, chime((1175, 1568, 2349)), 0.13, pan=0.3)
add(sfx, 1.5, pop(900), 0.12)
# S2 drops (first contact of the bounce)
for st in [0.45, 1.25, 2.05]:
    land = 3 + st + 0.8 * 0.364
    add(sfx, land, thud(110, 0.3), 0.32)
    add(sfx, land + 0.17, thud(150, 0.15, 0.1), 0.1)
    add(sfx, land, hiss(0.4), 0.35)
# S3 calendar flips
prev = 0
for i in range(int(2.4 * 120)):
    lt = 0.45 + i / 120
    f = 10 * eio(min(1, max(0, (lt - 0.45) / 2.3)))
    n = int(f + 1e-6)
    if n > prev:
        add(sfx, 8 + lt, tick(0.03), 0.35, pan=(n % 3 - 1) * 0.3)
        prev = n
add(sfx, 8 + 2.75, pop(700), 0.15)
add(sfx, 8 + 4.62, thud(90, 0.35), 0.3)          # bank door shuts
add(sfx, 8 + 4.68, pop(1200, 0.08), 0.12)        # padlock
for i in range(6):
    add(sfx, 8 + 5.15 + i * 0.17, whoosh(0.35), 0.07, pan=-0.5 + i * 0.2)
add(sfx, 8 + 6.2, chime((1319, 1760)), 0.08)
# S4 counter
prev = -1
for i in range(int(2.5 * 120)):
    lt = 0.35 + i / 120
    v = int(eo(min(1, (lt - 0.35) / 2.5)) * 40)
    if v != prev:
        add(sfx, 15 + lt, tick(0.015), 0.22)
        prev = v
add(sfx, 15 + 2.85, chime((1568, 2093)), 0.12)
add(sfx, 15 + 3.2, whoosh(0.5, up=False), 0.18)
add(sfx, 15 + 3.65, pop(480), 0.18)
add(sfx, 15 + 4.25, whoosh(0.3), 0.08)
add(sfx, 15 + 4.75, pop(820), 0.12)
add(sfx, 15 + 5.1, chime((2093, 2637, 3136, 4186), 0.05), 0.12, pan=0.2)
# S5 hourglass, slide, slam, counter, strike
add(sfx, 22.3, hiss(2.7), 0.25)
add(sfx, 22 + 3.05, whoosh(0.8), 0.12)
add(sfx, 22 + 4.25, thud(55, 0.9, 0.8), 0.7)
add(sfx, 22 + 4.25, rumble(0.6), 0.5)
add(sfx, 22 + 4.65, pop(400), 0.15)
prev = -1
for i in range(int(1.2 * 120)):
    lt = 4.7 + i / 120
    v = int(eo(min(1, (lt - 4.7) / 1.2)) * 24)
    if v != prev:
        add(sfx, 22 + lt, tick(0.015), 0.2)
        prev = v
add(sfx, 22 + 5.5, pop(600), 0.12)
add(sfx, 22 + 6.25, whoosh(0.35), 0.2)
# S6 typing, search, check, pills, fake button
for i in range(7):
    add(sfx, 30 + 0.9 + i * 0.16, tick(0.02), 0.4, pan=0.1)
add(sfx, 30 + 2.25, pop(1000, 0.06), 0.15)
add(sfx, 30 + 2.75, pop(600), 0.12)
add(sfx, 30 + 3.05, chime((1568, 2093, 2637)), 0.14)
add(sfx, 30 + 3.5, pop(880), 0.12)
add(sfx, 30 + 3.78, pop(990), 0.12)
add(sfx, 30 + 4.95, whoosh(0.4, up=False), 0.12)
t_ = np.arange(int(SR * 0.32)) / SR
buzz = np.sign(np.sin(2 * np.pi * np.where(t_ < 0.16, 220, 175) * t_)) * np.exp(-((t_ % 0.16)) * 12)
add(sfx, 30 + 5.8, lowpass(buzz, 0.15) * 1.5, 0.18)
add(sfx, 30 + 6.15, whoosh(0.25), 0.15)
add(sfx, 30 + 6.4, whoosh(0.25), 0.15)
# S7 plane, logo, button, click
add(sfx, 39 + 0.55, whoosh(1.9), 0.22, pan=0.3)
add(sfx, 39 + 3.0, pop(500), 0.16)
add(sfx, 39 + 3.55, chime((1175, 1480, 1760, 2349), 0.05), 0.1)
add(sfx, 39 + 5.1, pop(700), 0.16)
add(sfx, 39 + 6.75, tick(0.02) * 2, 0.4)
add(sfx, 39 + 6.8, chime((1760, 2349)), 0.13)

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
