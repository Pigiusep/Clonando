# Render, audio y entrega

Código: `video-polizas-glp/final/` (`index.html` + `extra.js` + `scenes.js` + `timeline.js`, `render.js`, `audio.py`, `normalizar.py`).

## Preparación
- `npm install` en `video-polizas-glp/` (gsap local; la CDN cdnjs está bloqueada desde el contenedor). `index.html` carga `../node_modules/gsap/dist/gsap.min.js`. Epilogue sí carga desde Google Fonts.
- Chromium y Playwright ya vienen instalados en el entorno (no reinstalar).
- Fotos en `video-polizas-glp/fotos/` (referenciadas como `../fotos/...`).

## Página animada
- Timeline GSAP **pausado**; `window.renderAt(t)` posiciona el tiempo y `window.READY` avisa cuando cargaron las fuentes.
- GSAP en pausa no dispara `onUpdate`: contadores con tween de `innerText` + `snap`; la ruta del trámite se actualiza en `applyRoute()` llamado desde `renderAt`.
- `timeline.js` = `window.TL = <timeline.json de la locución>`.

## Vistas antes del render (obligatorio)
```bash
node final_still.js <carpeta> segs          # un cuadro al final de cada frase
node final_still.js <carpeta> 12.5 80 300   # cuadros en segundos concretos
python3 hoja.py <carpeta> <salida.jpg> e1a e1b e1c ...   # hoja 3×N con el id de cada cuadro
```
Revisar: textos cortados o superpuestos, tarjetas vacías por segundos, filas desalineadas (nombres largos que pasan a 2 líneas), contraste.

## Render
```bash
cd final && node render.js 30 4      # fps, workers -> out/chunk_00..03.mp4 + out/sfx.json
```
- Capturas JPEG por cuadro hacia ffmpeg libx264 crf 17. ~15 min para 9 min de video con 4 workers.
- Si solo cambian frases sin alterar sus tiempos (el audio nuevo cabe en el hueco hasta la siguiente frase), no hace falta volver a renderizar: se reemplaza el audio en su misma posición.

## Audio
```bash
python3 normalizar.py audio/narracion_raw.wav audio/narracion.wav -17 "<cadena EQ+compresor>"
python3 audio.py                                   # voz + efectos (de out/sfx.json) + música con ducking -> audio/mezcla.wav
python3 normalizar.py audio/mezcla.wav audio/final.wav -16
```
- Efectos sintetizados: whoosh, swish, pop, tick, ok, no, thud (cada elemento animado agrega su cue a `SFX`).
- Música sintetizada suave con ducking bajo la voz y fundidos de 3 s.
- Comprobar el piso de ruido: silencio < -50 dB, intro solo con música.

## Montaje
```bash
ffmpeg -f concat -safe 0 -i list.txt -i audio/final.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart Video_v3.mp4
ffmpeg -i Video_v3.mp4 -vf scale=1280:720 -c:v libx264 -crf 27 -c:a aac -b:a 128k -movflags +faststart Video_v3_movil.mp4
```
Extraer 6–8 cuadros del MP4 final y revisarlos antes de enviar.

## Entrega
- `SendUserFile`: la versión móvil con `display: render` para verla y la 1080p con `display: attach` para descargarla.
- El conector de Google Drive solo sube archivos ≤ 10 MB desde aquí: el usuario descarga el adjunto y lo sube él (o se divide en partes, con pérdida de calidad).
- `.gitignore` excluye `*.mp4`; se suben el código, `timeline.json`, `reporte_voz.md`, las vistas y `PENDIENTES.md`.
