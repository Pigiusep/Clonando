# Demos de voz: mismo fragmento del guion con cada voz, masterizado y verificado con Whisper.
# Uso: python3 demos.py [ids...]  -> out/<id>.wav/.mp3 + out/reporte.json
import os, re, sys, json, glob, subprocess, unicodedata, difflib
import numpy as np, soundfile as sf
import sherpa_onnx as so

HERE = os.path.dirname(os.path.abspath(__file__))
MOD = os.environ.get('MODELS_DIR', os.path.join(HERE, '..', 'models')) + '/'
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
SR = 48000

FRASES = [
 'Las pólizas de responsabilidad civil extracontractual son exigidas en virtud de los artículos 31 y 32 del Reglamento para la comercialización de GLP, aprobado mediante Decreto Supremo Nº 01-94-EM, y sus modificatorias.',
 'El monto mínimo asegurado de las pólizas de responsabilidad civil extracontractual para un consumidor directo de GLP depende de la capacidad de almacenamiento del tanque,',
 'siendo desde 100 UIT como mínimo hasta 300 UIT como máximo.',
 'La póliza debe consignar la Razón Social y el RUC, descritos tal cual se muestran en su consulta RUC SUNAT, y ser similar a los datos registrados como titular en la solicitud del Registro de Hidrocarburos,',
 'de manera que exista correspondencia entre la información del seguro y la información registral.',
 'La presentación de Osinergmin identifica casos en los que determinadas cláusulas especiales restringen la cobertura o condicionan su efectividad al cumplimiento de ciertas obligaciones.',
]

# id: (nombre, motor, modelo, sid, velocidad, dividir_por_comas)
VOCES = {
 'v1': ('Masculina · Alex (actual)', 'kokoro', 'kokoro-multi-lang-v1_0', 29, 1.0, False),
 'v2': ('Masculina · Alex pausada', 'kokoro', 'kokoro-multi-lang-v1_0', 29, 0.92, True),
 'v3': ('Masculina · Santa (grave)', 'kokoro', 'kokoro-multi-lang-v1_0', 30, 0.95, True),
 'v4': ('Femenina · Dora', 'kokoro', 'kokoro-multi-lang-v1_0', 28, 0.95, True),
 'v5': ('Masculina · Claude (México)', 'vits', 'vits-piper-es_MX-claude-high', 0, 0.95, True),
 'v6': ('Masculina · Ald (México)', 'vits', 'vits-piper-es_MX-ald-medium', 0, 0.95, True),
 'v7': ('Femenina · Daniela (Argentina)', 'vits', 'vits-piper-es_AR-daniela-high', 0, 0.95, True),
}


def para_tts(t):
    t = t.replace('Decreto Supremo Nº 01-94-EM', 'Decreto Supremo número cero uno, noventa y cuatro, E eme')
    t = re.sub(r'\b100 UIT', 'cien U.I.T.', t)
    t = re.sub(r'\b300 UIT', 'trescientos U.I.T.', t)
    t = t.replace('UIT', 'U.I.T.').replace('GLP', 'G.L.P.')
    t = t.replace('RUC', 'ruc').replace('SUNAT', 'Sunat')
    t = t.replace('y/o', 'y, o').replace('Osinergmin', 'Osinergmín')
    t = t.replace('31 y 32', 'treinta y uno y treinta y dos')
    return t


def engine(kind, model):
    d = MOD + model + '/'
    if kind == 'kokoro':
        m = so.OfflineTtsModelConfig(kokoro=so.OfflineTtsKokoroModelConfig(model=d + 'model.onnx', voices=d + 'voices.bin', tokens=d + 'tokens.txt',
                                     data_dir=d + 'espeak-ng-data', dict_dir=d + 'dict', lexicon=d + 'lexicon-us-en.txt', lang='es'), num_threads=4)
    else:
        m = so.OfflineTtsModelConfig(vits=so.OfflineTtsVitsModelConfig(model=glob.glob(d + '*.onnx')[0], tokens=d + 'tokens.txt',
                                     data_dir=d + 'espeak-ng-data', noise_scale=0.55, noise_scale_w=0.6), num_threads=4)
    return so.OfflineTts(so.OfflineTtsConfig(model=m))


def rs(x, a, b):
    n = int(round(len(x) * b / a)); return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


def trim(x, thr=0.006):
    i = np.where(np.abs(x) > thr)[0]
    return x if not len(i) else x[max(0, i[0] - int(.06 * SR)): i[-1] + int(.05 * SR)]


def partes(f, dividir):
    # divide frases largas en cláusulas por coma, manteniendo la coma (entonación suspendida)
    if not dividir or len(f) < 110: return [f]
    out, cur = [], ''
    for p in re.split(r'(?<=,)\s+', f):
        cur = (cur + ' ' + p).strip()
        if len(cur) > 45: out.append(cur); cur = ''
    if cur:
        if out and len(cur) < 30: out[-1] += ' ' + cur
        else: out.append(cur)
    return out


def generar(vid):
    nombre, kind, model, sid, speed, dividir = VOCES[vid]
    piezas = []
    for k, f in enumerate(FRASES):
        for j, p in enumerate(partes(f, dividir)):
            eng = engine(kind, model)   # motor nuevo por pieza: evita arrastre de artefactos
            a = eng.generate(para_tts(p), sid=sid, speed=speed)
            x = trim(rs(np.array(a.samples, np.float32), a.sample_rate, SR))
            pausa = 0.24 if p.rstrip().endswith(',') else 0.5
            if j == len(partes(f, dividir)) - 1 and k + 1 < len(FRASES) and not FRASES[k + 1][0].islower(): pausa = 0.62
            piezas.append((f if j == 0 else None, x, pausa))
    y = np.concatenate([np.concatenate([x, np.zeros(int(p * SR), np.float32)]) for _, x, p in piezas])
    y = np.concatenate([np.zeros(int(.4 * SR), np.float32), y])
    raw = os.path.join(OUT, vid + '_raw.wav'); sf.write(raw, y / (np.max(np.abs(y)) + 1e-9) * 0.9, SR)
    # masterización: limpieza de graves, menos "caja", presencia suave, de-esser, compresión y -16 LUFS
    fin = os.path.join(OUT, vid + '.wav')
    af = ('highpass=f=75,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.4:g=1.5,'
          'deesser=i=0.35,acompressor=threshold=-21dB:ratio=2.5:attack=8:release=140:makeup=2,'
          'loudnorm=I=-16:TP=-1.5:LRA=9')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ar', str(SR), fin], check=True)
    return fin


# ---------- verificación ----------
W = MOD + 'sherpa-onnx-whisper-small/'
_rec = None


def rec():
    global _rec
    if _rec is None:
        _rec = so.OfflineRecognizer.from_whisper(encoder=W + 'small-encoder.int8.onnx', decoder=W + 'small-decoder.int8.onnx',
                                                 tokens=W + 'small-tokens.txt', language='es', task='transcribe', num_threads=4)
    return _rec


NUM = {'100': 'cien', '300': 'trescientos', '31': 'treinta y uno', '32': 'treinta y dos', '30': 'treinta', '1': 'uno', '2': 'dos', 'nº': '', 'numero': '', 'n': ''}


def norm(t):
    t = t.lower()
    t = unicodedata.normalize('NFD', t); t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = re.sub(r'01-94-em|cero uno,? noventa y cuatro,? e ?eme|01-94|0194', ' ds ', t)
    t = re.sub(r'\b(g\.?\s?l\.?\s?p\.?|ge,? ele,? pe)\b', 'glp', t)
    t = re.sub(r'\b(u\.?\s?i\.?\s?t\.?)\b', 'uit', t)
    t = t.replace('z', 's').replace('rook', 'ruc').replace('rock', 'ruc').replace('osinergmin', 'osinergmin')
    t = re.sub(r'[^\w\s]', ' ', t); t = re.sub(r'\s+', ' ', t)
    t = re.sub(r'\bextra contractual', 'extracontractual', t)
    t = re.sub(r'\b(numero )?(01|0 1|cero uno) (94|noventa y cuatro|90 y 4|noventa y 4) (e ?g?m|e eme|em|am|lm)\b', ' ds ', t)
    o = []
    for w in t.split(): o += NUM.get(w, w).split()
    return o


def verificar(fin):
    x, sr = sf.read(fin, dtype='float32')
    x16 = rs(x, sr, 16000)
    # transcribir por tramos separados por silencios (Whisper rinde mejor en frases)
    fr = 320; e = np.array([np.sqrt(np.mean(x16[i:i + fr] ** 2)) for i in range(0, len(x16) - fr, fr)])
    voz = e > 0.01; cuts, s0, sil = [], None, 0
    for i, v in enumerate(voz):
        if v and s0 is None: s0 = i
        sil = 0 if v else sil + 1
        if s0 is not None and sil > 22: cuts.append((s0, i - sil)); s0 = None
    if s0 is not None: cuts.append((s0, len(voz)))
    hyp = []
    for a, b in cuts:
        seg = x16[max(0, a * fr - 3200): b * fr + 3200]
        st = rec().create_stream(); st.accept_waveform(16000, seg); rec().decode_stream(st); hyp.append(st.result.text.strip())
    H = ' '.join(hyp); Rw, Hw = norm(' '.join(FRASES)), norm(H)
    sm = difflib.SequenceMatcher(a=Rw, b=Hw, autojunk=False)
    errs = [f"«{' '.join(Rw[i1:i2])}» → «{' '.join(Hw[j1:j2])}»" for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
    nerr = sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal')
    # anomalías acústicas: saltos bruscos de energía (clics/trabas) y silencios largos dentro del habla
    f2 = int(.02 * sr); en = np.array([np.sqrt(np.mean(x[i:i + f2] ** 2)) + 1e-6 for i in range(0, len(x) - f2, f2)])
    db = 20 * np.log10(en); jumps = int(np.sum((np.diff(db) > 15) & (db[:-1] > -38)))
    dur = len(x) / sr
    return {'wer': round(100 * nerr / len(Rw), 1), 'errores': errs, 'saltos': jumps, 'dur': round(dur, 1),
            'palabras_min': round(len(Rw) / dur * 60), 'transcripcion': H}


if __name__ == '__main__':
    ids = sys.argv[1:] or list(VOCES)
    rep = json.load(open(os.path.join(OUT, 'reporte.json'))) if os.path.exists(os.path.join(OUT, 'reporte.json')) else {}
    for v in ids:
        fin = os.path.join(OUT, v + '.wav') if os.environ.get('VERIFY') else generar(v)
        r = verificar(fin); r['nombre'] = VOCES[v][0]; rep[v] = r
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', fin, '-c:a', 'libmp3lame', '-b:a', '160k', os.path.join(OUT, v + '.mp3')], check=True)
        print(v, r['nombre'], 'WER', r['wer'], '% | saltos', r['saltos'], '| ppm', r['palabras_min'], '|', r['dur'], 's')
        for e in r['errores']: print('   ', e)
    json.dump(rep, open(os.path.join(OUT, 'reporte.json'), 'w'), ensure_ascii=False, indent=1)
