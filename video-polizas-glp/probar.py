# Prueba variantes de texto: sintetiza y transcribe. Uso: python3 probar.py "texto1" "texto2" ...
import sys, numpy as np
import narracion as N
import sherpa_onnx as so
M = N.MODELS + '/sherpa-onnx-whisper-small/'
rec = so.OfflineRecognizer.from_whisper(encoder=M + 'small-encoder.int8.onnx', decoder=M + 'small-decoder.int8.onnx', tokens=M + 'small-tokens.txt', language='es', task='transcribe', num_threads=4)
eng = N.tts_engine()
for t in sys.argv[1:]:
    tx = N.para_tts(t)
    a = eng.generate(tx, sid=N.SID, speed=N.SPEED)
    x = N.trim(N.resample(np.array(a.samples, dtype=np.float32), a.sample_rate, N.SR_OUT))
    x16 = np.interp(np.linspace(0, len(x) - 1, int(len(x) / 3)), np.arange(len(x)), x).astype(np.float32)
    st = rec.create_stream(); st.accept_waveform(16000, x16); rec.decode_stream(st)
    print(f'[{tx}]\n   -> {st.result.text.strip()}  ({len(x)/N.SR_OUT:.2f}s)')
