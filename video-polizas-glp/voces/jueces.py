# Dos jueces independientes: whisper-small y whisper-turbo (large-v3-turbo)
import sherpa_onnx as so
from demos import rs, SR, MOD
_r = {}
def juez(nombre):
    if nombre not in _r:
        d = MOD + ('sherpa-onnx-whisper-small/small-' if nombre == 'small' else 'sherpa-onnx-whisper-turbo/turbo-')
        _r[nombre] = so.OfflineRecognizer.from_whisper(encoder=d + 'encoder.int8.onnx', decoder=d + 'decoder.int8.onnx',
                    tokens=d + 'tokens.txt', language='es', task='transcribe', num_threads=4)
    return _r[nombre]
def oir(x, nombre):
    r = juez(nombre); st = r.create_stream(); st.accept_waveform(16000, rs(x, SR, 16000)); r.decode_stream(st)
    return st.result.text.strip()
