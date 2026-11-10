# Rehace frases puntuales con más variantes; acepta solo si AMBOS reconocedores la transcriben exacta
# y contienen todos los términos clave (RUC, póliza…). Uso: python3 regen.py e4b e7d e2a
import os, sys, json
import numpy as np, soundfile as sf
import locucion as L
from jueces import oir
CLAVE = ['ruc', 'sunat', 'glp', 'uit', 'osinergmin', 'tupa', 'hidrocarburos', 'ds', 'extracontractual', 'adendas', 'polisa', 'polisas']
TXT = {sid: t for _, sid, t in L.GUION if sid}
base_tts = L.para_tts
E = L.eng()
for sid in sys.argv[1:]:
    texto = TXT[sid]; R = L.norm(texto); hecho = False
    for ruc in ['rhuk', 'ruk', 'rúk', 'rhúk']:
        L.para_tts = lambda t, ruc=ruc: base_tts(t).replace('rhuk', ruc)
        if 'RUC' not in texto and ruc != 'rhuk': break
        for sp, pre in [(1.0, ''), (1.0, '… '), (0.97, ''), (1.03, ''), (0.97, '… '), (1.03, '… '), (0.94, ''), (1.06, '')]:
            a = E.generate(pre + L.para_tts(texto), sid=L.SID, speed=sp)
            x = L.limpia(L.rs(np.array(a.samples, np.float32), a.sample_rate, L.SR))
            hs, ht = oir(x, 'small'), oir(x, 'turbo')
            es, ds = L.errores(texto, hs); et, dt = L.errores(texto, ht)
            falt = [k for k in CLAVE if R.count(k) and min(L.norm(hs).count(k), L.norm(ht).count(k)) < R.count(k)]
            print(sid, ruc, sp, repr(pre), '| small', es, ds, '| turbo', et, dt, '| faltan', falt, flush=True)
            if es == 0 and et == 0 and not falt:
                sf.write(os.path.join(L.SEG, sid + '.wav'), x, L.SR)
                json.dump({'vel': sp, 'pre': pre, 'ruc': ruc, 'err_small': 0, 'err_turbo': 0, 'small': hs, 'turbo': ht, 'dif_small': [], 'dif_turbo': []},
                          open(os.path.join(L.SEG, sid + '.json'), 'w'), ensure_ascii=False, indent=1)
                print(sid, 'ACEPTADA', flush=True); hecho = True; break
        if hecho: break
    if not hecho: print(sid, 'SIN TOMA PERFECTA', flush=True)
