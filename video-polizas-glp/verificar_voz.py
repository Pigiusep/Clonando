# Verifica la locución frase por frase: transcribe con Whisper y compara con el guion.
# Detecta palabras mal dichas/omitidas, repeticiones (trabas), silencios anómalos y velocidad irregular.
import json, os, re, sys, unicodedata, difflib
import numpy as np, soundfile as sf
import sherpa_onnx as so

HERE = os.path.dirname(os.path.abspath(__file__))
M = os.environ.get('MODELS_DIR', os.path.join(HERE, 'models')) + '/sherpa-onnx-whisper-small/'
rec = so.OfflineRecognizer.from_whisper(encoder=M + 'small-encoder.int8.onnx', decoder=M + 'small-decoder.int8.onnx',
                                        tokens=M + 'small-tokens.txt', language='es', task='transcribe', num_threads=4)
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
only = set(sys.argv[1:])

NUM = {'30': 'treinta', '01': 'ds', '94': '', 'em': '', 'numero': '', '100': 'cien', '300': 'trescientos', '31': 'treinta y uno', '32': 'treinta y dos', '3': 'tres', '1': 'uno'}


def norm(t):
    t = t.lower().replace('y/o', 'y o').replace('nº', '')
    t = unicodedata.normalize('NFD', t)
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = re.sub(r'\b(g\.?\s?l\.?\s?p\.?|ge ele pe)\b', 'glp', t)
    t = re.sub(r'\b(u\.?\s?i\.?\s?t\.?)\b', 'uit', t)
    t = re.sub(r'01-94-em|0194em|01 94 em|cero uno,? noventa y cuatro,? e ?eme', 'ds', t)
    t = t.replace('z', 's').replace('rook', 'ruc').replace('rock', 'ruc')
    t = re.sub(r'[^\w\s]', ' ', t)
    w = t.split()
    out = []
    for x in w:
        out += NUM.get(x, x).split()
    return out


tot_err = tot_w = 0
report = []
for s in TL['segs']:
    if only and s['id'] not in only: continue
    x, sr = sf.read(os.path.join(HERE, 'audio', 'seg', s['id'] + '.wav'), dtype='float32')
    x16 = np.interp(np.linspace(0, len(x) - 1, int(len(x) * 16000 / sr)), np.arange(len(x)), x).astype(np.float32)
    st = rec.create_stream(); st.accept_waveform(16000, x16); rec.decode_stream(st)
    hyp = st.result.text.strip()
    R, H = norm(s['text']), norm(hyp)
    sm = difflib.SequenceMatcher(a=R, b=H, autojunk=False)
    errs = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op != 'equal':
            errs.append(f"{op}: «{' '.join(R[i1:i2])}» → «{' '.join(H[j1:j2])}»")
    nerr = sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal')
    # repeticiones consecutivas en la transcripción que no están en el guion
    reps = [H[i] for i in range(1, len(H)) if H[i] == H[i - 1] and not (i < len(R) and R.count(H[i] + ' ' + H[i]))]
    # silencios internos (ventanas de 20 ms bajo umbral)
    fr = int(0.02 * sr); e = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, len(x) - fr, fr)])
    sil = e < 0.008
    runs, cur = [], 0
    for v in sil:
        if v: cur += 1
        else:
            if cur: runs.append(cur)
            cur = 0
    long_sil = [round(r * 0.02, 2) for r in runs if r * 0.02 > 0.75]
    rate = len(R) / s['dur']
    clip = float(np.mean(np.abs(x) > 0.98))
    tot_err += nerr; tot_w += len(R)
    flag = nerr > 0 or reps or long_sil or rate < 2.0 or rate > 3.6 or clip > 0.001
    report.append({'id': s['id'], 'wer': round(nerr / max(1, len(R)), 3), 'rate': round(rate, 2), 'long_sil': long_sil,
                   'reps': reps, 'errs': errs, 'hyp': hyp, 'flag': bool(flag)})
    if flag:
        print(f"[{s['id']}] WER={nerr}/{len(R)} vel={rate:.2f} p/s silencios={long_sil} reps={reps}")
        for er in errs: print('    ', er)
json.dump(report, open(os.path.join(HERE, 'audio', 'verificacion.json'), 'w'), ensure_ascii=False, indent=1)
print(f'TOTAL WER {tot_err}/{tot_w} = {tot_err / max(1, tot_w):.3%}  (frases marcadas: {sum(r["flag"] for r in report)}/{len(report)})')
