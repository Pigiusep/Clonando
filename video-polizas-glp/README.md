# Video de capacitación: Pólizas de Responsabilidad Civil Extracontractual (GLP)

Video de motion graphics hecho 100 % con código (HTML/SVG + GSAP), renderizado cuadro a cuadro con Playwright y montado con ffmpeg.
Todas las animaciones están sincronizadas con la locución: si se cambia la voz (por ejemplo, por la de Lorenzo en ElevenLabs), basta con regenerar `timeline.json` y volver a renderizar. Los tiempos se ajustan solos.

## Archivos

| Archivo | Qué hace |
|---|---|
| `narracion.py` | Guion de locución dividido por frases. Genera `audio/narracion.wav` y `timeline.json` (inicio y duración de cada frase). |
| `scenes.js` | Coreografía de las 9 escenas + intro y cierre. Usa `S(id)`, `E(id)` y `W(id, 'palabra')` para sincronizar con la voz. |
| `world.js` | Ilustración animada de la instalación de GLP (tanque, vaporizador, regulación, caldero, inspector, terceros) con cámara virtual. |
| `lib.js` | Utilidades de animación (texto cinético, documentos, checks, sellos, cortinillas, efectos de sonido). |
| `audio.py` | Efectos de sonido y base musical sintetizados, con ducking bajo la voz → `audio/mezcla.wav`. |
| `render.js` | Render en paralelo → `out/chunk_XX.mp4` + `out/sfx.json`. |
| `still.js`, `sheet.sh` | Fotogramas sueltos y hojas de contacto para revisar el diseño. |

## Cómo regenerar

```bash
npm install                     # gsap + fuentes Montserrat/Inter
pip install "sherpa-onnx<2" soundfile scipy numpy
# voz local (provisional): modelos en ./models (o MODELS_DIR=...)
#   https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-es_MX-claude-high.tar.bz2
python3 narracion.py            # audio/narracion.wav + timeline.json
python3 -c "import json;d=json.load(open('timeline.json'));open('timeline.js','w').write('window.TL='+json.dumps(d,ensure_ascii=False)+';')"
node render.js 30 4             # fps, workers
python3 audio.py                # mezcla
ls out/chunk_*.mp4 | sed "s/^/file '/;s/$/'/" > out/list.txt
ffmpeg -f concat -safe 0 -i out/list.txt -i audio/mezcla.wav -c:v copy -af loudnorm=I=-16:TP=-1.5 -c:a aac -b:a 192k -shortest final.mp4
```

### Cambiar a la voz de Lorenzo (ElevenLabs)
Genera un archivo de audio por cada frase de `GUION` en `narracion.py` (mismos `id`), reemplaza la llamada a `eng.generate(...)` por la carga de esos archivos y vuelve a ejecutar los pasos anteriores. Las animaciones se re-sincronizan solas.
