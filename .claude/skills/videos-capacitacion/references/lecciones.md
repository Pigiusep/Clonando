# Lecciones aprendidas (bitácora)

Agregar una entrada por proyecto o por corrección importante, con fecha. Lo más reciente arriba.
Formato: **qué pasó → qué hacer ahora**.

## 2026-11 · Video "Pólizas RCE – Consumidor directo de GLP" (Solgas)

### Diseño
- El usuario rechazó personajes humanos (SVG, 3D y cartoon salían deformes o poco profesionales) → no usar personajes; usar tarjetas, iconos y fotos.
- La planta industrial animada era repetitiva y "en el video no se habla de eso" → **solo mostrar lo que dice la locución**.
- Documentos "muy simples" y fuente repetida → tarjetas ilustradas con contorno y sombra sólida, Epilogue, colores de Solgas en tonos suaves.
- Pidió opciones antes de decidir: 5 prototipos de animación, 5 tipografías, 7 velos de color, 10 estilos de iconos → **dar siempre opciones numeradas y comparables con el mismo contenido**.
- El velo blanco sobre fotos "aclara mucho" → velo celeste suave; medir contraste y oscurecer el texto secundario (#2A3A63).
- Las fotos generadas en Gemini "no se veían tan bien" solas → funcionan con velo + zoom lento + tarjetas encima.

### Voz
- "RUC" se oía "ROC" y yo lo había dejado pasar porque el comparador aceptaba "rock" como RUC → comparador estricto y escritura fonética `rhuk`.
- "verifica eso dos veces antes de hacer el video" → mejor toma con dos jueces + segunda pasada sobre la pista final.
- Confundí el id de em_santa (30 en lugar de 53) y entregué una voz francesa como "Santa" → comprobar ids con los metadatos del modelo antes de etiquetar una demo.
- Voz "robótica y trabada" → frases completas, velocidad 1.0, pausas variables, tono de sala, mezcla A2.

### Audio
- "¿Por qué se escucha ruido al inicio?" → el loudnorm dinámico subía el tono de sala a -18 dB en todas las pausas → **normalización estática siempre**, y medir el piso de ruido del archivo final.
- El recorte de silencios se comía la "s" final ("contemplado") → umbral más bajo y cola más larga.

### Proceso
- El usuario necesitaba presentar un avance formal → un avance de ~2 min con voz, en el estilo final, fue mejor que rehacer los 9 min de golpe.
- "Ya no verifiques nada, termina el video" → cuando el usuario corta, terminar con lo que hay sin rehacer render y reportar con honestidad qué quedó dudoso.
- Drive desde aquí: límite de 10 MB → avisar desde el principio y entregar el archivo para que lo suba el usuario.
- Comunicación: el usuario sigue la sesión desde el celular → mensajes cortos de avance, vistas en imágenes y videos livianos (720p) para revisar.
