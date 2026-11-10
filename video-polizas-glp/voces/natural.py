# Afinado de la voz A (em_alex) para que suene natural:
#  - frases completas (sin cortar en comas), velocidad natural (~1.0), mejor toma verificada con Whisper
#  - pausas variables como en una lectura humana, tono de sala en vez de silencio digital
#  - reverberación de sala muy corta y procesado suave (sin sobrecomprimir)
#  - opcional: mezcla del timbre de Alex con em_santa (otra voz masculina en español) para más calidez
# Uso: python3 natural.py  -> out/A1.wav, A2.wav, A3.wav (+ mp3) y out/natural.json
import os, json, shutil, subprocess
import numpy as np, soundfile as sf
from scipy.signal import fftconvolve, lfilter
import sherpa_onnx as so
from demos import FRASES, para_tts, rs, trim, verificar, OUT, SR, MOD
from tomas import errores

BASE = MOD + 'kokoro-multi-lang-v1_0/'
BLEND = MOD + 'kokoro-alex-afinada/'
ALEX, SANTA = 29, 53
# variantes: (nombre, sid en el banco de voces, velocidades a probar)
VAR = {
    'A1': ('Alex natural', ALEX, [1.0, 1.03, 0.97]),
    'A2': ('Alex + 25 % Santa (más cálida)', 30, [1.0, 1.03, 0.97]),
    'A3': ('Alex + 40 % Santa (más grave)', 31, [1.0, 1.03, 0.97]),
}


def banco():
    # copia del modelo con dos voces mezcladas en los huecos 30 y 31
    os.makedirs(BLEND, exist_ok=True)
    for f in os.listdir(BASE):
        if f != 'voices.bin' and not os.path.exists(BLEND + f): os.symlink(BASE + f, BLEND + f)
    v = np.fromfile(BASE + 'voices.bin', dtype=np.float32).reshape(54, 510, 256).copy()
    v[30] = 0.75 * v[ALEX] + 0.25 * v[SANTA]
    v[31] = 0.60 * v[ALEX] + 0.40 * v[SANTA]
    v.tofile(BLEND + 'voices.bin')


def eng():
    d = BLEND
    return so.OfflineTts(so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(kokoro=so.OfflineTtsKokoroModelConfig(
        model=d + 'model.onnx', voices=d + 'voices.bin', tokens=d + 'tokens.txt', data_dir=d + 'espeak-ng-data',
        dict_dir=d + 'dict', lexicon=d + 'lexicon-us-en.txt', lang='es'), num_threads=4)))


def f0_semitonos(x):
    # variación de entonación: desviación estándar del tono (semitonos) en tramos sonoros
    x16 = rs(x, SR, 16000); fr, hop = 640, 160; f0 = []
    for i in range(0, len(x16) - fr, hop):
        w = x16[i:i + fr] * np.hanning(fr)
        if np.sqrt(np.mean(w ** 2)) < 0.02: continue
        ac = np.correlate(w, w, 'full')[fr - 1:]; lo, hi = 16000 // 300, 16000 // 70
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] / (ac[0] + 1e-9) > 0.45: f0.append(16000 / k)
    f0 = np.array(f0); st = 12 * np.log2(f0 / np.median(f0))
    return round(float(np.std(st[np.abs(st) < 12])), 2), round(float(np.median(f0)))


def sala(y):
    rng = np.random.default_rng(3)
    # respuesta de sala pequeña (RT60 ~0.25 s), suavizada
    n = int(0.35 * SR); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t / 0.045); a = np.exp(-2 * np.pi * 4500 / SR)
    ir = lfilter([1 - a], [1, -a], ir); ir /= np.sqrt(np.sum(ir ** 2))
    wet = fftconvolve(y, ir)[:len(y)]
    y = y + 0.11 * wet / (np.max(np.abs(wet)) + 1e-9) * np.max(np.abs(y))
    # tono de sala: ruido rosado muy bajo (-64 dBFS) en lugar de silencio digital
    w = rng.standard_normal(len(y)); b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]; ac = [1, -2.494956002, 2.017265875, -0.522189400]
    pink = lfilter(b, ac, w); pink /= np.sqrt(np.mean(pink ** 2))
    return (y + pink * 10 ** (-64 / 20)).astype(np.float32)


def main():
    banco()
    rep = {}
    rng = np.random.default_rng(11)
    for vid, (nombre, sid, speeds) in VAR.items():
        piezas, info = [np.zeros(int(.45 * SR), np.float32)], []
        for k, f in enumerate(FRASES):
            cands = []
            for sp in speeds:
                a = eng().generate(para_tts(f), sid=sid, speed=sp)
                x = trim(rs(np.array(a.samples, np.float32), a.sample_rate, SR), thr=0.004)
                e, hyp = errores(x, f)
                cands.append((e, abs(sp - 1.0), sp, x))
                if e == 0 and sp == 1.0: break
            e, _, sp, x = min(cands, key=lambda c: (c[0], c[1]))
            # fundido muy corto en los bordes para que no haya cortes secos
            fi = int(0.012 * SR); x = x.copy(); x[:fi] *= np.linspace(0, 1, fi); x[-fi:] *= np.linspace(1, 0, fi)
            coma = f.rstrip().endswith(',')
            pausa = (0.2 if coma else 0.58) + rng.uniform(-0.05, 0.06)
            piezas += [x, np.zeros(int(pausa * SR), np.float32)]
            info.append({'frase': k, 'errores': e, 'velocidad': sp, 'tomas': len(cands)})
            print(vid, k, 'err', e, 'vel', sp)
        y = np.concatenate(piezas); y = y / (np.max(np.abs(y)) + 1e-9) * 0.8
        y = sala(y)
        raw = os.path.join(OUT, vid + '_raw.wav'); sf.write(raw, y, SR)
        fin = os.path.join(OUT, vid + '.wav')
        af = ('highpass=f=70,equalizer=f=160:t=q:w=1:g=1.2,equalizer=f=320:t=q:w=1.4:g=-1.5,equalizer=f=3000:t=q:w=1.6:g=1,'
              'equalizer=f=7500:t=q:w=1.5:g=-1.2,acompressor=threshold=-24dB:ratio=1.8:attack=15:release=200:makeup=1.5,'
              'loudnorm=I=-16:TP=-1.5:LRA=11')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ar', str(SR), fin], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', fin, '-c:a', 'libmp3lame', '-b:a', '192k', fin[:-4] + '.mp3'], check=True)
        r = verificar(fin); r['nombre'] = nombre; r['frases'] = info
        r['entonacion_st'], r['tono_hz'] = f0_semitonos(sf.read(fin, dtype='float32')[0])
        rep[vid] = r
        print(vid, nombre, '| WER', r['wer'], r['errores'], '| entonación', r['entonacion_st'], 'st | tono', r['tono_hz'], 'Hz |', r['palabras_min'], 'ppm')
    ref = os.path.join(OUT, 'v2_tomas.wav')
    print('referencia demo A | entonación', f0_semitonos(sf.read(ref, dtype='float32')[0]), '| ppm', verificar(ref)['palabras_min'])
    json.dump(rep, open(os.path.join(OUT, 'natural.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
