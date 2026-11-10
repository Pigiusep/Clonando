# "Mejor toma": varias tomas por frase (velocidad y división), se elige la que Whisper transcribe sin errores.
# Uso: python3 tomas.py v2 v3 v4 -> out/<id>_tomas.wav/.mp3 + out/tomas.json
import os, sys, json, difflib, subprocess
import numpy as np, soundfile as sf
from demos import FRASES, VOCES, para_tts, engine, rs, trim, partes, norm, rec, verificar, OUT, SR

SPEEDS = [0.92, 0.95, 0.98]


def errores(x, ref):
    st = rec().create_stream(); st.accept_waveform(16000, rs(x, SR, 16000)); rec().decode_stream(st)
    hyp = st.result.text.strip(); R, H = norm(ref), norm(hyp)
    sm = difflib.SequenceMatcher(a=R, b=H, autojunk=False)
    return sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal'), hyp


def toma(kind, model, sid, frase, speed, dividir):
    ps = partes(frase, dividir); out = []
    for j, p in enumerate(ps):
        a = engine(kind, model).generate(para_tts(p), sid=sid, speed=speed)
        out.append(trim(rs(np.array(a.samples, np.float32), a.sample_rate, SR)))
        if j < len(ps) - 1: out.append(np.zeros(int(0.15 * SR), np.float32))
    return np.concatenate(out)


def main():
    rep = {}
    for vid in sys.argv[1:]:
        nombre, kind, model, sid, _, _ = VOCES[vid]
        piezas, info = [], []
        for k, f in enumerate(FRASES):
            cands = []
            for dividir in (False, True):
                if dividir and len(partes(f, True)) == 1: continue
                for sp in SPEEDS:
                    x = toma(kind, model, sid, f, sp, dividir)
                    e, hyp = errores(x, f)
                    cands.append((e, dividir, abs(sp - 0.95), sp, x, hyp))
                    if e == 0 and not dividir and sp == 0.95: break
                if cands and min(c[0] for c in cands) == 0 and not dividir: break
            e, dv, _, sp, x, hyp = min(cands, key=lambda c: (c[0], c[1], c[2]))
            info.append({'frase': k, 'errores': e, 'dividida': dv, 'velocidad': sp, 'tomas': len(cands), 'oido': hyp})
            print(vid, k, 'err', e, 'div', dv, 'vel', sp, 'tomas', len(cands))
            pausa = 0.26 if f.rstrip().endswith(',') else 0.62
            piezas += [x, np.zeros(int(pausa * SR), np.float32)]
        y = np.concatenate([np.zeros(int(.4 * SR), np.float32)] + piezas)
        raw = os.path.join(OUT, vid + '_tomas_raw.wav'); sf.write(raw, y / (np.max(np.abs(y)) + 1e-9) * 0.9, SR)
        fin = os.path.join(OUT, vid + '_tomas.wav')
        af = ('highpass=f=75,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.4:g=1.5,'
              'deesser=i=0.35,acompressor=threshold=-21dB:ratio=2.5:attack=8:release=140:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=9')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ar', str(SR), fin], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', fin, '-c:a', 'libmp3lame', '-b:a', '160k', fin[:-4] + '.mp3'], check=True)
        r = verificar(fin); r['nombre'] = nombre; r['frases'] = info; rep[vid] = r
        print(vid, nombre, 'VERIFICACIÓN FINAL  WER', r['wer'], '%', r['errores'])
    json.dump(rep, open(os.path.join(OUT, 'tomas.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
