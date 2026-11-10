---
name: videos-capacitacion
description: Producción de videos de capacitación corporativa en motion graphics (HTML + GSAP renderizado a MP4 con Playwright y ffmpeg), con locución sintética verificada. Úsala cuando el usuario pida hacer, rehacer, ajustar o continuar un video de capacitación o explicativo a partir de un guion (Word o texto), por ejemplo para Solgas o Futuro Azul: diseño de escenas, animaciones, iconos, fondos, voz en off, verificación de pronunciación, render y entrega.
---

# Videos de capacitación en motion graphics

Skill viva: recoge el método y las preferencias aprobadas por el usuario en el video
"Pólizas de Responsabilidad Civil Extracontractual – GLP" (Solgas). **Se ampliará con cada video**:
al cerrar un proyecto, agrega lo aprendido en `references/lecciones.md` (con fecha) y, si cambia
una regla, actualízala aquí.

Proyecto de referencia (código que funciona, úsalo como plantilla):
`video-polizas-glp/final/` (escenas, sincronía, render, audio) y `video-polizas-glp/voces/` (voz).

## Referencias (leer según la fase)

| Archivo | Cuándo leerlo |
|---|---|
| `references/estilo.md` | Antes de diseñar o tocar escenas: paleta, tipografía, tarjetas, iconos, fondos, contraste. |
| `references/voz.md` | Antes de generar o verificar la locución: modelos, normalización de siglas, mejor toma, doble verificación. |
| `references/render.md` | Antes de renderizar o armar el audio: comandos, tiempos, normalización, entrega. |
| `references/lecciones.md` | Siempre al empezar: errores que ya cometimos y lo que el usuario pidió explícitamente. |

## Reglas que el usuario exige (no negociables)

1. **Seguir el guion al pie de la letra.** Escenas, locución y textos "en pantalla" (artículos, tablas) tal cual el documento. Correcciones de erratas obvias se aplican y se listan en `PENDIENTES.md`; lo que no se pueda colocar, se reporta.
2. **Las animaciones deben ilustrar lo que dice la voz en ese momento.** Nada de relleno genérico: si la locución no habla de algo (p. ej. una planta industrial), no se muestra.
3. **Mostrar antes de producir.** Antes de cualquier render largo, enviar vistas (hojas de cuadros) y esperar aprobación. Para decisiones de estilo, dar opciones numeradas (5–10) y dejar elegir.
4. **La voz debe sonar profesional y leer bien todo.** Siglas, números y nombres propios verificados con dos reconocedores antes de montar el video. Nunca aceptar "rock" como "RUC".
5. **Sin personajes humanos dibujados** (se probaron SVG, 3D y cartoon y se descartaron), **sin logo** salvo que lo pidan, **sin subtítulos**.
6. **Contraste alto**: texto azul noche sobre fondos claros; no colorear todo el texto; medir el contraste real sobre fotos (mínimo 4,5:1).
7. **Sin costos ni claves**: no pedir API keys ni usar servicios de pago. Todo local y gratuito salvo que el usuario diga lo contrario.
8. **Cuando el usuario diga "ya no verifiques / termínalo"**, se termina con lo que hay y se informa con honestidad qué quedó pendiente.

## Flujo de trabajo

### 1. Arranque
- Leer `references/lecciones.md`.
- Extraer el guion: `python3 -c "import docx; ..."` (python-docx) → listar escenas, locución, textos en pantalla y tablas.
- Hacer **todas** las preguntas al inicio (voz, logo, música, subtítulos, datos de ejemplo, duración). Luego no volver a preguntar lo ya decidido.
- Dividir la locución en frases con ids `e<escena><letra>` (e1a, e1b…). El texto exacto de cada frase es la fuente de verdad para voz y animación.

### 2. Diseño (con aprobación)
- Partir del sistema de `references/estilo.md`. Si el cliente es nuevo, proponer 5 prototipos de estilo, 5 tipografías y 10 estilos de iconos, siempre con los mismos contenidos para comparar.
- Fondos: fotos (Gemini/Nano Banana las genera el usuario con prompts largos y estructurados; ver `video-polizas-glp/prompts_fondos_gemini.md`) con velo de color suave + zoom lento. Alternar fotos y texturas para no repetir.
- Enviar hojas de cuadros: un cuadro por frase (`final_still.js <dir> segs`) montados en hojas de 3×N con el id de frase.

### 3. Voz
- Ver `references/voz.md`. Resumen: Kokoro local (sherpa-onnx) con voz A2 (75 % em_alex + 25 % em_santa), siglas reescritas fonéticamente, varias tomas por frase y se acepta la primera que **whisper-small y whisper-turbo** transcriben idéntica al guion.
- Si el usuario trae audios de otra voz (p. ej. Lorenzo), integrarlos frase por frase y pasarlos por la misma verificación.

### 4. Escenas sincronizadas
- `timeline.js` (generado por la locución) da `start`/`dur` de cada frase. En escena usar `S(id)`, `E(id)` y `W(id, 'palabra')` para que cada elemento aparezca cuando se pronuncia la palabra.
- Cada "momento" visual va en un `beat(c, a, z)` que entra y sale con la frase; títulos con `head()`, tarjetas con `dcard()`, checks con `checkItem()`, sellos con `stamp()`.
- Revisar **todas** las frases con hojas de cuadros (al final de cada frase) antes de renderizar.

### 5. Render, audio y entrega
- Ver `references/render.md`. Render 1080p30 con 4 workers (~1,6 min de render por minuto de video), mezcla voz + efectos + música con ducking, **normalización estática** (nunca loudnorm dinámico), MP4 1080p + versión móvil 720p.
- Entregar con `SendUserFile` (1080p como adjunto, móvil para ver). Drive desde aquí solo acepta ≤10 MB: el usuario sube el archivo grande.
- Commit y push del código (los .mp4 están en `.gitignore`). Actualizar `PENDIENTES.md` y `final/reporte_voz.md`.

## Checklist antes de decir "terminado"
- [ ] Todas las frases del guion están en la locución y en pantalla en el orden correcto.
- [ ] Textos "en pantalla" del guion presentes literalmente (artículos, tablas).
- [ ] Verificación de voz: 0 diferencias reales en ambos reconocedores; términos clave presentes (RUC, SUNAT, GLP, UIT, Osinergmin, TUPA, D.S. …).
- [ ] Audio: silencios limpios (piso < -50 dB), voz ~-16 LUFS, sin picos > -1,5 dBTP.
- [ ] Hojas de cuadros revisadas: nada cortado, nada vacío durante segundos, contraste OK.
- [ ] Reporte honesto de lo pendiente (datos ficticios, discrepancias del guion, frases dudosas).
