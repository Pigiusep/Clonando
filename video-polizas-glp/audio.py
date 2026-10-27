# Mezcla final: voz + efectos sintetizados + base musical sintetizada.
# Uso: python3 audio.py -> audio/mezcla.wav
import json, os
import numpy as np, soundfile as sf
from scipy.signal import lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
rng = np.random.default_rng(7)

voz, sr = sf.read(os.path.join(HERE, 'audio', 'narracion.wav'), dtype='float32')
assert sr == SR
N = len(voz)
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
sfx = json.load(open(os.path.join(HERE, 'out', 'sfx.json')))


def env(n, a, r):
    e = np.ones(n, np.float32)
    ai, ri = int(a * SR), int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e


def lowpass(x, fc):
    # filtro de un polo (suficiente para suavizar ruido)
    a = np.exp(-2 * np.pi * fc / SR)
    return lfilter([1 - a], [1, -a], x).astype(np.float32)


def sweep_noise(d, f0, f1):
    n = int(d * SR)
    x = rng.standard_normal(n).astype(np.float32)
    # filtro pasa banda variable aproximado: diferencia de dos pasabajos con corte móvil
    fc = np.geomspace(f0, f1, n)
    y = np.empty(n, np.float32); l1 = l2 = 0.0
    for i in range(n):
        a = np.exp(-2 * np.pi * fc[i] / SR); b = np.exp(-2 * np.pi * fc[i] * 0.4 / SR)
        l1 = (1 - a) * x[i] + a * l1; l2 = (1 - b) * x[i] + b * l2
        y[i] = l1 - l2
    return y / (np.max(np.abs(y)) + 1e-9)


def tone(f, d, a=0.005, r=0.2, kind='sine'):
    n = int(d * SR); t = np.arange(n) / SR
    if kind == 'sine': x = np.sin(2 * np.pi * f * t)
    else: x = 2 * ((f * t) % 1) - 1
    return (x * env(n, a, r)).astype(np.float32)


# biblioteca de efectos
W = sweep_noise(0.9, 300, 6000) * np.hanning(int(0.9 * SR)).astype(np.float32)
SW = sweep_noise(0.35, 1500, 7000) * np.hanning(int(0.35 * SR)).astype(np.float32)
POP = tone(880, 0.12, 0.002, 0.1) * 0.6
POP[:int(0.08 * SR)] += tone(1320, 0.08, 0.002, 0.07) * 0.3
POP *= np.exp(-np.arange(len(POP)) / (0.03 * SR)).astype(np.float32)
TICK = (rng.standard_normal(int(0.03 * SR)) * np.exp(-np.arange(int(0.03 * SR)) / (0.004 * SR))).astype(np.float32)
OK = np.concatenate([tone(988, 0.09, 0.002, 0.05), tone(1319, 0.28, 0.002, 0.25)]) * 0.55
NO = (tone(160, 0.35, 0.005, 0.1, 'saw') * 0.35 + tone(155, 0.35, 0.005, 0.1, 'saw') * 0.35)
NO = lowpass(NO, 900)
th_n = int(0.5 * SR); th_t = np.arange(th_n) / SR
THUD = (np.sin(2 * np.pi * (90 * th_t - 60 * th_t ** 2)) * np.exp(-th_t / 0.12)).astype(np.float32)
THUD += lowpass(rng.standard_normal(th_n).astype(np.float32), 1200) * np.exp(-th_t / 0.03).astype(np.float32) * 2

LIB = {'whoosh': (W, 0.32), 'swish': (SW, 0.10), 'pop': (POP, 0.16), 'tick': (TICK, 0.10), 'ok': (OK, 0.30), 'no': (NO, 0.35), 'thud': (THUD, 0.6)}
fx = np.zeros(N, np.float32)
last = {}
for e in sorted(sfx, key=lambda e: e['t']):
    k = e['k']; t = e['t']
    if t < 0 or t >= N / SR: continue
    if t - last.get(k, -9) < 0.12: continue   # evita amontonar el mismo efecto
    last[k] = t
    x, g = LIB[k]
    i = int(t * SR); j = min(N, i + len(x))
    fx[i:j] += x[:j - i] * g

# base musical: progresión suave en La menor, 100 bpm
bpm = 100; beat = 60 / bpm
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
mus = np.zeros(N, np.float32)
bar = beat * 4
nb = int(N / SR / bar) + 1
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
pad_len = int(bar * SR)
tt = np.arange(pad_len) / SR
for b in range(nb):
    ch = chords[b % 4]; i0 = int(b * bar * SR)
    pad = np.zeros(pad_len, np.float32)
    for m in ch:
        for det in (-0.12, 0.12):
            f = mf(m) * 2 ** (det / 12)
            pad += np.sin(2 * np.pi * f * tt) * 0.5 + np.sin(2 * np.pi * 2 * f * tt) * 0.12
    pad *= env(pad_len, 0.4, 0.5)
    bass = np.sin(2 * np.pi * mf(ch[0] - 12) * tt) * 0.9 * env(pad_len, 0.02, 0.3)
    seg = pad * 0.18 + bass * 0.35
    # arpegio
    for s in range(8):
        m = ch[s % 3] + 12 * (1 + (s // 3) % 2)
        n0 = int(s * beat / 2 * SR)
        nt = tone(mf(m), beat / 2, 0.003, beat / 2 * 0.9) * np.exp(-np.arange(int(beat / 2 * SR)) / (0.12 * SR))
        seg[n0:n0 + len(nt)] += nt * 0.18
    # pulso suave (bombo + hihat)
    for s in range(4):
        n0 = int(s * beat * SR); kl = int(0.25 * SR); kt_ = np.arange(kl) / SR
        kick = np.sin(2 * np.pi * (55 * kt_ + 40 * (1 - np.exp(-kt_ / 0.03)) * 0.03 * 10)) * np.exp(-kt_ / 0.09)
        seg[n0:n0 + kl] += kick[:len(seg[n0:n0 + kl])] * 0.45
        h0 = int((s + 0.5) * beat * SR); hl = int(0.05 * SR)
        hat = rng.standard_normal(hl) * np.exp(-np.arange(hl) / (0.008 * SR))
        hat = hat - lowpass(hat.astype(np.float32), 6000)
        seg[h0:h0 + hl] += hat[:len(seg[h0:h0 + hl])] * 0.12
    j = min(N, i0 + pad_len); mus[i0:j] += seg[:j - i0]
mus = lowpass(mus, 5000)
mus /= np.max(np.abs(mus)) + 1e-9

# ducking bajo la voz
venv = np.abs(voz)
win = int(0.25 * SR)
cs = np.concatenate([[0], np.cumsum(venv, dtype=np.float64)])
idx = np.clip(np.arange(N) + win // 2, 0, N); idx0 = np.clip(np.arange(N) - win // 2, 0, N)
venv = ((cs[idx] - cs[idx0]) / win).astype(np.float32)
duck = 1 - 0.55 * np.clip(venv / 0.04, 0, 1)
fade = np.ones(N, np.float32); fl = int(3 * SR)
fade[:fl] = np.linspace(0, 1, fl); fade[-fl:] = np.linspace(1, 0, fl)
music_gain = 0.16
mix = voz * 1.0 + fx * 0.8 + mus * music_gain * duck * fade
mix /= max(1.0, np.max(np.abs(mix)) / 0.97)
sf.write(os.path.join(HERE, 'audio', 'mezcla.wav'), mix.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'audio', 'musica_sfx.wav'), (fx * 0.8 + mus * music_gain * fade).astype(np.float32), SR)
print('ok', N / SR)
