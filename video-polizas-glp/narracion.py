# Genera la locución por frases y el timeline de sincronización.
# Uso: python3 narracion.py  -> audio/narracion.wav + timeline.json
import json, re, glob, os
import numpy as np, soundfile as sf
import sherpa_onnx as so

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.environ.get('MODELS_DIR', os.path.join(HERE, 'models'))
VOICE = os.environ.get('VOICE', 'kokoro-multi-lang-v1_0')
SID = int(os.environ.get('SID', '29'))   # 29 = em_alex (voz 3 elegida)
SPEED = float(os.environ.get('SPEED', '1.0'))
SR_OUT = 48000

# (escena, id, texto) — '¶' marca cambio de párrafo (pausa más larga)
GUION = [
 ('intro', None, None),
 ('e1', 'e1a', 'Para la autorización y operación de un consumidor directo de GLP, la gestión de la póliza de responsabilidad civil extracontractual no debe limitarse a disponer de un documento vigente,'),
 ('e1', 'e1b', 'sino comprender que dicha póliza representa un elemento importante para la protección de Solgas frente a las consecuencias económicas de determinados accidentes que puedan afectar a las instalaciones, terceros y al medio ambiente.'),
 ('e1', 'e1c', '¶En esta ocasión, revisaremos los principales aspectos que deben tenerse en cuenta para revisar la póliza y detectar posibles inconsistencias que puedan generar observaciones durante el trámite de autorización y/o supervisión.'),

 ('e2', 'e2a', 'Las pólizas de responsabilidad civil extracontractual son exigidas en virtud de los artículos 31 y 32 del Reglamento para la comercialización de GLP, aprobado mediante Decreto Supremo Nº 01-94-EM, y sus modificatorias.'),
 ('e2', 'e2b', '¶Este artículo contempla la obligación de los operadores de instalaciones de GLP de contar con una póliza de seguros de responsabilidad civil extracontractual, que dé cobertura a los daños a terceros, a sus bienes y al medio ambiente.'),
 ('e2', 'e2c', '¶Como Solgas, estamos prohibidos de abastecer a una instalación que no cuente con póliza vigente,'),
 ('e2', 'e2d', 'y en caso de hacerlo, nos exponemos a ser solidariamente responsables por daños a terceros debido a siniestros que puedan ocasionarse en dicha instalación.'),

 ('e3', 'e3a', 'El monto mínimo asegurado de las pólizas de responsabilidad civil extracontractual para un consumidor directo de GLP depende de la capacidad de almacenamiento del tanque,'),
 ('e3', 'e3b', 'siendo desde 100 UIT como mínimo hasta 300 UIT como máximo.'),
 ('e3', 'e3c', '¶Para el caso de Consumidores Directos de GLP con sistemas de despacho para uso automotor, el monto es de 300 UIT, independientemente de la capacidad de almacenamiento del tanque.'),

 ('e4', 'e4a', 'Uno de los primeros aspectos que debe verificarse es la identificación del asegurado y de la actividad a desarrollar.'),
 ('e4', 'e4b', '¶La póliza debe consignar la Razón Social y el RUC, descritos tal cual se muestran en su consulta RUC SUNAT, y ser similar a los datos registrados como titular en la solicitud del Registro de Hidrocarburos,'),
 ('e4', 'e4c', 'de manera que exista correspondencia entre la información del seguro y la información registral.'),
 ('e4', 'e4d', 'En consecuencia, el responsable de la revisión debe comprobar que la razón social y los datos de identificación de la empresa coincidan con los consignados en los documentos correspondientes.'),
 ('e4', 'e4e', '¶También debe verificar que el riesgo asegurado corresponda a la actividad de hidrocarburos que desarrolla la empresa.'),
 ('e4', 'e4f', 'Para nuestro caso la actividad se denomina “Consumidor directo de GLP”. La actividad asegurada debe ser la misma del formulario de solicitud de registro de hidrocarburos.'),
 ('e4', 'e4g', '¶Una póliza con datos de Razón Social, RUC y/o actividad escritos de forma inexacta puede generar observaciones para la autorización, y/o limitaciones en su activación ante una emergencia.'),

 ('e5', 'e5a', 'Además, resulta sustancial verificar la ubicación del riesgo y el alcance de la cobertura.'),
 ('e5', 'e5b', '¶En primer lugar, la ubicación de riesgo consignada en la póliza debe coincidir con la dirección de la instalación de GLP descrita en la solicitud de registro de hidrocarburos.'),
 ('e5', 'e5c', 'Este aspecto es mucho más relevante, cuando la póliza asegura más de una instalación y/o actividad operativa.'),
 ('e5', 'e5d', '¶En segundo lugar, debe verificarse que la cobertura comprenda los riesgos exigidos por la normativa aplicable. Esto es, la cobertura a daños a terceros, a sus bienes y al medio ambiente.'),
 ('e5', 'e5e', '¶Es importante aquí verificar que estos 3 aspectos no se encuentren restringidos en la sección de exclusiones y/o limitaciones de la póliza.'),
 ('e5', 'e5f', '¶Así pues, debemos comprender que la existencia de la póliza no garantiza, por sí sola, que todos los riesgos asociados a la instalación estén cubiertos en los términos exigidos.'),

 ('e6', 'e6a', 'Otro aspecto fundamental es el monto asegurado.'),
 ('e6', 'e6b', '¶Para los consumidores directos de GLP, los montos mínimos de la póliza van desde los 100 UIT hasta los 300 UIT, dependiendo de la capacidad de almacenamiento del tanque.'),
 ('e6', 'e6c', 'En ese sentido, lo primero que debemos verificar es que el monto asegurado corresponda al monto requerido según la capacidad de almacenamiento del tanque de GLP.'),
 ('e6', 'e6d', '¶Cuando una póliza comprende múltiples instalaciones, debe evaluarse si el límite asegurado resulta suficiente conforme a las exigencias aplicables y a las condiciones contractuales.'),
 ('e6', 'e6e', 'En este caso, la póliza debe contemplar un monto asegurado que cubra todas las instalaciones y/o actividades aseguradas, o también debe incorporar una cláusula de restitución automática de la suma asegurada, cuando corresponda.'),
 ('e6', 'e6f', '¶La presentación describe casos en los que una cobertura correspondiente al mínimo requerido para una instalación resulta observada cuando la póliza comprende múltiples instalaciones y/o actividades.'),
 ('e6', 'e6g', '¶En consecuencia, la revisión no debe limitarse a identificar una cifra en el documento, sino que debe comprobar su suficiencia y las condiciones que regulan su disponibilidad.'),

 ('e7', 'e7a', 'La lectura de las condiciones contractuales constituye una etapa indispensable de la evaluación del seguro.'),
 ('e7', 'e7b', '¶La presentación de Osinergmin identifica casos en los que determinadas cláusulas especiales restringen la cobertura o condicionan su efectividad al cumplimiento de ciertas obligaciones.'),
 ('e7', 'e7c', '¶En una instalación consumidora directa de GLP, corresponde revisar cuidadosamente las condiciones que puedan afectar la cobertura durante el desarrollo de las operaciones.'),
 ('e7', 'e7d', '¶La evaluación debe prestar atención a las exclusiones, las condiciones de mantenimiento de la cobertura, los límites por evento y agregado, así como los mecanismos de restitución de la suma asegurada, cuando se encuentren contemplados.'),
 ('e7', 'e7e', '¶También debe verificarse que las condiciones contractuales no resulten incompatibles con las exigencias normativas aplicables a la actividad.'),
 ('e7', 'e7f', '¶El objetivo consiste en determinar si la protección contratada satisface los requisitos correspondientes y si existen restricciones que puedan comprometer su efectividad.'),
 ('e7', 'e7g', '¶Esta revisión debe efectuarse sobre el texto contractual completo y no únicamente sobre el certificado o la carátula de la póliza.'),

 ('e8', 'e8a', 'La correcta gestión documental permite reducir inconsistencias y facilitar la evaluación de la póliza durante los trámites y las actividades de supervisión.'),
 ('e8', 'e8b', '¶La presentación señala que la copia de la póliza de seguro forma parte de los requisitos documentales contemplados en el TUPA para los trámites de Registro de Hidrocarburos correspondientes.'),
 ('e8', 'e8c', '¶También indica que, cuando la póliza ya obra en un expediente anterior, puede hacerse referencia al número de dicho expediente conforme al criterio descrito en el material.'),
 ('e8', 'e8d', '¶Los certificados o constancias de seguro no sustituyen automáticamente la póliza como requisito documental. Sin embargo, pueden presentarse de manera adicional en las condiciones descritas por la presentación.'),
 ('e8', 'e8e', '¶Para una gestión ordenada, el consumidor directo debe mantener identificados la póliza, sus adendas y los documentos complementarios que sustentan la cobertura.'),
 ('e8', 'e8f', '¶Antes de presentar un expediente o atender una supervisión, resulta conveniente contrastar la documentación con la información del Registro de Hidrocarburos'),
 ('e8', 'e8g', 'y verificar que no existan diferencias en la identidad del titular, la actividad, la ubicación o el monto asegurado.'),

 ('e9', 'e9a', 'La gestión de la póliza de Responsabilidad Civil Extracontractual constituye un aspecto relevante del cumplimiento normativo para los agentes que desarrollan actividades de hidrocarburos.'),
 ('e9', 'e9b', '¶En el caso del consumidor directo de GLP, la revisión debe centrarse en la correcta identificación del titular asegurado, la vigencia de la póliza, la correspondencia de la actividad y la ubicación del riesgo, el alcance de las coberturas y la suficiencia del monto asegurado.'),
 ('e9', 'e9c', '¶Asimismo, deben examinarse las condiciones especiales, las exclusiones y las cláusulas que puedan limitar o condicionar la efectividad del seguro.'),
 ('e9', 'e9d', '¶La documentación debe mantenerse ordenada y ser coherente con la información consignada en el Registro de Hidrocarburos.'),
 ('e9', 'e9e', '¶Una revisión preventiva permite identificar inconsistencias, gestionar oportunamente las correcciones necesarias y fortalecer el cumplimiento de las obligaciones aplicables.'),
 ('e9', 'e9f', '¶En definitiva, una adecuada gestión del seguro contribuye a una operación responsable, a la protección de terceros y a una mejor administración de los riesgos asociados al uso industrial o productivo del GLP.'),
 ('e9', 'e9g', '¶La prevención comienza con el conocimiento de las obligaciones y se fortalece mediante una gestión rigurosa de los riesgos y de las coberturas contratadas.'),
 ('outro', None, None),
]

# Tiempo de cabecera de cada escena (título animado antes de la voz) y colas
LEAD = {'intro': 5.0, 'e1': 0.6, 'outro': 5.0}
# REGEN=e6d,e9g regenera esas frases; ALL=1 regenera todo (por defecto usa la caché audio/seg)
REGEN = set(filter(None, os.environ.get('REGEN', '').split(',')))
ALL = os.environ.get('ALL') == '1'
EXT = os.environ.get('EXT', '')   # carpeta con <id>.wav externos (uno por frase)
SCENE_LEAD = 2.4      # título de escena
SCENE_TAIL = 1.0
PAUSE_SENT = 0.28
PAUSE_PAR = 0.55


def para_tts(t):
    t = t.replace('¶', '').replace('“', '').replace('”', '')
    t = t.replace('Decreto Supremo Nº 01-94-EM', 'Decreto Supremo número cero uno, noventa y cuatro, E eme')
    t = re.sub(r'\b100 UIT', 'cien U I T', t)
    t = re.sub(r'\b300 UIT', 'trescientos U I T', t)
    t = t.replace('U I T', 'UIT').replace('UIT', 'U.I.T.')
    t = t.replace('GLP', 'G.L.P.')
    t = t.replace('RUC', 'ruc').replace('SUNAT', 'Sunat').replace('TUPA', 'Tupa')
    t = t.replace('y/o', 'y, o').replace('Osinergmin', 'Osinergmín').replace('adendas', 'addendas')
    t = t.replace('estos 3', 'estos tres').replace('31 y 32', 'treinta y uno, y treinta y dos')
    return t


def tts_engine():
    d = os.path.join(MODELS, VOICE) + '/'
    if 'kokoro' in VOICE:
        return so.OfflineTts(so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(
            kokoro=so.OfflineTtsKokoroModelConfig(model=d + 'model.onnx', voices=d + 'voices.bin', tokens=d + 'tokens.txt',
                                                  data_dir=d + 'espeak-ng-data', dict_dir=d + 'dict',
                                                  lexicon=d + 'lexicon-us-en.txt', lang='es'),
            num_threads=4)))
    onnx = glob.glob(d + '*.onnx')[0]
    cfg = so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(
        vits=so.OfflineTtsVitsModelConfig(model=onnx, tokens=d + 'tokens.txt', data_dir=d + 'espeak-ng-data',
                                          noise_scale=0.6, noise_scale_w=0.7),
        num_threads=4))
    return so.OfflineTts(cfg)


def resample(x, sr_in, sr_out):
    n = int(round(len(x) * sr_out / sr_in))
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


def trim(x, thr=0.006):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.09 * SR_OUT)); b = min(len(x), idx[-1] + int(0.06 * SR_OUT))
    return x[a:b]


def main():
    os.makedirs(os.path.join(HERE, 'audio', 'seg'), exist_ok=True)
    eng = tts_engine()
    t = 0.0
    chunks = []
    segs, scenes = [], []
    cur = None
    for scene, sid, text in GUION:
        if scene != cur:
            if cur is not None:
                t += SCENE_TAIL
                scenes[-1]['end'] = t
            scenes.append({'id': scene, 'start': t})
            t += LEAD.get(scene, SCENE_LEAD)
            cur = scene
        if sid is None:
            continue
        if text.startswith('¶') and segs and segs[-1]['scene'] == scene:
            t += PAUSE_PAR - PAUSE_SENT
        cache = os.path.join(HERE, 'audio', 'seg', sid + '.wav')
        ext = os.path.join(EXT, sid + '.wav') if EXT else ''
        if ext and os.path.exists(ext):   # audio externo (p. ej., voz Lorenzo generada en otra PC)
            xe, sre = sf.read(ext, dtype='float32')
            if xe.ndim > 1: xe = xe.mean(axis=1)
            x = trim(resample(xe, sre, SR_OUT))
        elif os.path.exists(cache) and sid not in REGEN and not ALL:
            x, _ = sf.read(cache, dtype='float32')
        else:
            if sid in REGEN:
                eng = tts_engine()   # motor nuevo: evita artefactos al inicio de algunas frases
            a = eng.generate(para_tts(text), sid=SID if 'kokoro' in VOICE else 0, speed=SPEED)
            x = trim(resample(np.array(a.samples, dtype=np.float32), a.sample_rate, SR_OUT))
        dur = len(x) / SR_OUT
        sf.write(cache, x, SR_OUT)
        chunks.append((t, x))
        segs.append({'id': sid, 'scene': scene, 'start': round(t, 3), 'dur': round(dur, 3),
                     'text': text.replace('¶', '')})
        print(f'{sid}  {t:7.2f}s  {dur:5.2f}s')
        t += dur + PAUSE_SENT
    scenes[-1]['end'] = t
    total = t
    out = np.zeros(int(total * SR_OUT) + SR_OUT, dtype=np.float32)
    for st, x in chunks:
        i = int(st * SR_OUT); out[i:i + len(x)] += x
    peak = np.max(np.abs(out)) or 1
    out = out / peak * 0.89
    sf.write(os.path.join(HERE, 'audio', 'narracion.wav'), out, SR_OUT)
    json.dump({'total': round(total, 3), 'scenes': scenes, 'segs': segs},
              open(os.path.join(HERE, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    print('TOTAL', round(total, 2))


if __name__ == '__main__':
    main()
