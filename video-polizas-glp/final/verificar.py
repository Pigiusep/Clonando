# Segunda verificación: sobre la pista FINAL masterizada (audio/narracion.wav), frase por frase,
# con dos reconocedores (whisper-small y whisper-turbo) + control de términos clave.
# Uso: python3 verificar.py -> reporte_voz.md (y código de salida 1 si hay algún error)
import os, sys, json
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'voces'))
from locucion import errores, norm
from jueces import oir
from demos import rs, SR

CLAVE = {'ruc': 'RUC', 'sunat': 'SUNAT', 'glp': 'GLP', 'uit': 'UIT', 'osinergmin': 'Osinergmin', 'tupa': 'TUPA', 'hidrocarburos': 'Hidrocarburos',
         'ds': 'D.S. 01-94-EM', 'extracontractual': 'extracontractual', 'adendas': 'adendas', 'solidariamente': 'solidariamente', 'polisa': 'póliza'}
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
x, sr = sf.read(os.path.join(HERE, 'audio', 'narracion.wav'), dtype='float32')
if x.ndim > 1: x = x.mean(1)
assert sr == SR
filas, fallos = [], 0
for s in TL['segs']:
    a = max(0, int((s['start'] - 0.12) * SR)); b = int((s['start'] + s['dur'] + 0.12) * SR)
    seg = x[a:b]
    res = {}
    for j in ('small', 'turbo'):
        h = oir(seg, j); e, ops = errores(s['text'], h); res[j] = (e, ops, h)
    R = norm(s['text'])
    faltan = [CLAVE[k] for k in CLAVE if k in R and not all(norm(res[j][2]).count(k) >= R.count(k) for j in ('small', 'turbo'))]
    ok = res['small'][0] == 0 and res['turbo'][0] == 0 and not faltan
    fallos += 0 if ok else 1
    filas.append((s['id'], ok, res, faltan))
    print(s['id'], 'OK' if ok else 'REVISAR', res['small'][0], res['turbo'][0], faltan, flush=True)
with open(os.path.join(HERE, 'reporte_voz.md'), 'w') as f:
    f.write('# Verificación de la locución (segunda pasada, pista final)\n\n')
    f.write(f'Frases: {len(filas)} · sin diferencias: {len(filas) - fallos} · por revisar: {fallos}\n\n')
    f.write('Reconocedores: whisper-small y whisper-turbo (large-v3-turbo). Normalización estricta: "rock"/"rook" NO cuentan como RUC.\n\n')
    f.write('| Frase | Resultado | Diferencias (small) | Diferencias (turbo) | Términos clave faltantes |\n|---|---|---|---|---|\n')
    for sid, ok, res, faltan in filas:
        d = lambda j: '; '.join(f'«{a}» → «{b}»' for _, a, b in res[j][1]) or '—'
        f.write(f"| {sid} | {'✅' if ok else '⚠️'} | {d('small')} | {d('turbo')} | {', '.join(faltan) or '—'} |\n")
    f.write('\n## Transcripciones (turbo)\n\n' + '\n'.join(f'- **{sid}**: {res["turbo"][2]}' for sid, ok, res, _ in filas) + '\n')
print('POR REVISAR:', fallos)
sys.exit(1 if fallos else 0)
