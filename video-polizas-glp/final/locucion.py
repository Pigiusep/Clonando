# Locución final (voz A2: Alex + 25 % Santa) con doble verificación.
#  1) cada frase se genera en varias tomas y solo se acepta la que DOS reconocedores (whisper-small y
#     whisper-turbo) transcriben idéntica al guion, con normalización estricta (RUC ≠ "rock").
#  2) segunda verificación sobre la pista final ya masterizada (verificar.py).
# Uso: python3 locucion.py   (REGEN=e4b,e4g para rehacer frases)  -> audio/narracion.wav + timeline.json
import os, sys, re, json, difflib, unicodedata, subprocess
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'voces'))
import importlib.util as _u
_sp = _u.spec_from_file_location('guion_proj', os.path.join(HERE, '..', 'proj', 'narracion.py')); _g = _u.module_from_spec(_sp); _sp.loader.exec_module(_g)
GUION, LEAD, SCENE_LEAD, SCENE_TAIL = _g.GUION, _g.LEAD, _g.SCENE_LEAD, _g.SCENE_TAIL   # mismo guion (texto del Word con correcciones)
from natural import eng, banco, sala
from demos import rs, SR
from jueces import oir

SID = 30   # banco afinado: 0.75 · em_alex + 0.25 · em_santa
TOMAS = [(1.0, ''), (1.03, ''), (0.97, ''), (1.0, '… '), (1.06, ''), (1.03, '… '), (0.97, '… ')]
REGEN = set(filter(None, os.environ.get('REGEN', '').split(',')))
SEG = os.path.join(HERE, 'audio', 'seg'); os.makedirs(SEG, exist_ok=True)


def para_tts(t):
    t = t.replace('¶', '').replace('“', '').replace('”', '')
    t = t.replace('Decreto Supremo Nº 01-94-EM', 'Decreto Supremo número cero uno, noventa y cuatro, E eme')
    t = re.sub(r'\b100 UIT', 'cien U.I.T.', t); t = re.sub(r'\b300 UIT', 'trescientos U.I.T.', t)
    t = t.replace('UIT', 'U.I.T.').replace('GLP', 'G.L.P.')
    t = t.replace('RUC', 'rhuk').replace('SUNAT', 'Sunat').replace('TUPA', 'Tupa')
    t = t.replace('y/o', 'y o').replace('Osinergmin', 'Osinergmín').replace('adendas', 'addendas')
    t = t.replace('estos 3', 'estos tres').replace('31 y 32', 'treinta y uno y treinta y dos')
    return t


NUM = {'100': 'cien', '300': 'trescientos', '31': 'treinta y uno', '32': 'treinta y dos', '30': 'treinta', '1': 'uno', '2': 'dos', '3': 'tres'}


def norm(t):
    t = t.lower().replace('¶', '').replace('y/o', 'y o').replace('nº', ' ')
    t = unicodedata.normalize('NFD', t); t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = re.sub(r'[“”"«»]', ' ', t)
    t = re.sub(r'\b(g\.?\s?l\.?\s?p\.?)(?=\W|$)', ' glp ', t)
    t = re.sub(r'\b(u\.?\s?i\.?\s?t\.?)(?=\W|$)', ' uit ', t)
    t = re.sub(r'\b(r\.?\s?u\.?\s?[ck]\.?)(?=\W|$)', ' ruc ', t)       # RUC / R.U.C. / ruk  (NO acepta "rock" ni "rook")
    t = re.sub(r'(ruc|ruk)-?(sunat)', r'ruc sunat', t)
    t = t.replace('z', 's').replace('addendas', 'adendas')
    t = re.sub(r'c(?=[ei])', 's', t)   # seseo: ce/ci suenan como se/si
    t = re.sub(r'[^\w\s]', ' ', t); t = re.sub(r'\s+', ' ', t)
    t = re.sub(r'\bextra contractual', 'extracontractual', t)
    t = re.sub(r'\b(n|no|numero)?\s?(01|0 1|cero uno) (94|noventa y cuatro|90 y 4) (e ?m|e eme|em)\b', ' ds ', t)
    t = re.sub(r'\b01 94 em\b', ' ds ', t)
    out = []
    for w in t.split():
        if w in ('n', 'numero'): continue
        out += NUM.get(w, w).split()
    return out


def errores(ref, hyp):
    R, H = norm(ref), norm(hyp)
    sm = difflib.SequenceMatcher(a=R, b=H, autojunk=False)
    ops = [(op, ' '.join(R[i1:i2]), ' '.join(H[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
    # palabras pegadas o separadas por el reconocedor ("polisabigente") no son errores de pronunciación
    ops = [o for o in ops if o[1].replace(' ', '').replace('v', 'b') != o[2].replace(' ', '').replace('v', 'b')]
    return sum(max(len(a.split()), len(b.split())) for _, a, b in ops), ops


def limpia(x):
    i = np.where(np.abs(x) > 0.002)[0]
    x = x[max(0, i[0] - int(.05 * SR)): i[-1] + int(.14 * SR)].copy()
    fi, fo = int(.03 * SR), int(.02 * SR)
    x[:fi] *= np.linspace(0, 1, fi) ** 2; x[-fo:] *= np.linspace(1, 0, fo)
    return x


def mejor_toma(E, sid, texto):
    cands = []
    for sp, pre in TOMAS:
        a = E.generate(pre + para_tts(texto), sid=SID, speed=sp)
        x = limpia(rs(np.array(a.samples, np.float32), a.sample_rate, SR))
        hs, ht = oir(x, 'small'), oir(x, 'turbo')
        es, os_ = errores(texto, hs); et, ot = errores(texto, ht)
        cands.append({'x': x, 'vel': sp, 'pre': pre, 'err_small': es, 'err_turbo': et, 'small': hs, 'turbo': ht, 'dif_small': os_, 'dif_turbo': ot})
        print(f'   {sid} toma vel={sp} pre={pre!r}: small {es} · turbo {et}', flush=True)
        if es == 0 and et == 0: break
    return min(cands, key=lambda c: (c['err_turbo'] * 2 + c['err_small'], abs(c['vel'] - 1.0), c['pre'] != ''))


def main():
    banco(); E = eng()
    t, chunks, segs, scenes, cur = 0.0, [], [], [], None
    rng = np.random.default_rng(5)
    for scene, sid, text in GUION:
        if scene != cur:
            if cur is not None:
                t += SCENE_TAIL; scenes[-1]['end'] = round(t, 3)
            scenes.append({'id': scene, 'start': round(t, 3)}); t += LEAD.get(scene, SCENE_LEAD); cur = scene
        if sid is None: continue
        if text.startswith('¶') and segs and segs[-1]['scene'] == scene: t += 0.22
        wav, meta = os.path.join(SEG, sid + '.wav'), os.path.join(SEG, sid + '.json')
        if os.path.exists(wav) and os.path.exists(meta) and sid not in REGEN:
            x, _ = sf.read(wav, dtype='float32'); m = json.load(open(meta))
        else:
            print(sid, flush=True)
            c = mejor_toma(E, sid, text); x = c.pop('x')
            m = {k: v for k, v in c.items()}; sf.write(wav, x, SR); json.dump(m, open(meta, 'w'), ensure_ascii=False, indent=1)
        dur = len(x) / SR
        chunks.append((t, x))
        segs.append({'id': sid, 'scene': scene, 'start': round(t, 3), 'dur': round(dur, 3), 'text': text.replace('¶', ''),
                     'err_small': m['err_small'], 'err_turbo': m['err_turbo']})
        print(f'{sid} {t:7.2f}s {dur:5.2f}s  small {m["err_small"]} turbo {m["err_turbo"]}', flush=True)
        coma = text.rstrip().endswith(',')
        t += dur + ((0.22 if coma else 0.42) + rng.uniform(-0.04, 0.05))
    scenes[-1]['end'] = round(t, 3)
    out = np.zeros(int(t * SR) + SR, np.float32)
    for st, x in chunks: i = int(st * SR); out[i:i + len(x)] += x
    out = out / (np.max(np.abs(out)) + 1e-9) * 0.8
    out = sala(out)
    raw = os.path.join(HERE, 'audio', 'narracion_raw.wav'); sf.write(raw, out, SR)
    af = ('highpass=f=70,equalizer=f=160:t=q:w=1:g=1.2,equalizer=f=320:t=q:w=1.4:g=-1.5,equalizer=f=3000:t=q:w=1.6:g=1,'
          'equalizer=f=7500:t=q:w=1.5:g=-1.2,acompressor=threshold=-24dB:ratio=1.8:attack=15:release=200:makeup=1.5,loudnorm=I=-17:TP=-2:LRA=11')
    from normalizar import norm as _norm
    _norm(raw, os.path.join(HERE, 'audio', 'narracion.wav'), -17, pre=af.rsplit(',loudnorm', 1)[0])
    json.dump({'total': round(t, 3), 'scenes': scenes, 'segs': segs}, open(os.path.join(HERE, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    malos = [s['id'] for s in segs if s['err_turbo'] or s['err_small']]
    print('TOTAL', round(t, 2), 's · frases con diferencias:', malos)


if __name__ == '__main__':
    main()
