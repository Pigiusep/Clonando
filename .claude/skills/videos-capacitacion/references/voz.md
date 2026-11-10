# Locución: generación y verificación

Código: `video-polizas-glp/final/locucion.py` (genera), `final/verificar.py` (segunda pasada),
`final/regen.py` (rehace frases puntuales), `voces/natural.py` (banco de voces, sala), `voces/jueces.py` (reconocedores).

## Entorno (todo local y gratis)
- `pip install "sherpa-onnx<2" soundfile numpy scipy` (la 2.x no trae el frontend espeak; se usó 1.13.8).
- Modelos desde GitHub releases de k2-fsa/sherpa-onnx (huggingface y servicios de voz online están bloqueados en este entorno; edge-tts da 403):
  - TTS: `tts-models/kokoro-multi-lang-v1_0.tar.bz2`
  - Reconocedores: `asr-models/sherpa-onnx-whisper-small.tar.bz2` y `asr-models/sherpa-onnx-whisper-turbo.tar.bz2`
  - Descomprimir en `<scratchpad>/models/` (o `MODELS_DIR`).

## Voz elegida: A2
- Kokoro, voces en español: **em_alex = 29, ef_dora = 28, em_santa = 53** (¡no 30! el 30 es ff_siwis, francesa; ya nos equivocamos). Comprobar ids con los metadatos del modelo (`speaker_names`).
- A2 = `0.75·em_alex + 0.25·em_santa`, mezcla de los vectores de estilo de `voices.bin` (54×510×256 float32) guardada en un banco propio (`banco()` en `natural.py`, hueco 30).
- Voces Piper probadas y descartadas por mala pronunciación ("amasenamiento", "festringen", "rug").

## Texto para la voz (`para_tts`)
| En el guion | Se envía a la voz | Motivo |
|---|---|---|
| RUC | `rhuk` | "RUC" se deletrea "erre-u-ce"; "ruc" suena "roc". En Perú se dice como palabra. |
| GLP | `G.L.P.` | se lee "ge-ele-pe" |
| 100 UIT / 300 UIT | `cien U.I.T.` / `trescientos U.I.T.` | |
| Decreto Supremo Nº 01-94-EM | `Decreto Supremo número cero uno, noventa y cuatro, E eme` | |
| 31 y 32 | `treinta y uno y treinta y dos` | |
| SUNAT, TUPA | `Sunat`, `Tupa` | evitar deletreo |
| Osinergmin | `Osinergmín` | acento final |
| adendas | `addendas` | |
| y/o | `y o` | |
| estos 3 | `estos tres` | |

## Naturalidad
- Frases completas (no partir en comas: la voz baja la entonación como si terminara).
- Velocidad ~1.0 (0.92–0.98 suena arrastrado).
- Pausas variables: ~0,22 s tras coma, ~0,42–0,47 s tras punto, +0,22 s en cambio de párrafo.
- Recorte suave: umbral 0,002 y cola de 0,14 s (con 0,004/0,06 se comía la "s" final), fundidos de 30/20 ms.
- Tono de sala muy bajo (rosa, -64 dBFS) y reverberación de cuarto pequeño al 11 %.
- EQ suave + compresor 1,8:1 y **normalización estática** (`normalizar.py`). Nunca loudnorm dinámico: sube el tono de sala de -64 a -18 dB y se oye ruido en todas las pausas.

## Mejor toma con doble juez
Por cada frase se prueban tomas (velocidad 1.0/1.03/0.97/1.06, con y sin prefijo "… ") y se acepta la primera que **whisper-small y whisper-turbo** transcriben sin diferencias.

Normalización estricta del comparador (`norm()` en `locucion.py`):
- Equivalencias aceptadas: z=s, ce/ci=se/si (seseo), v=b, "extra contractual" = "extracontractual", palabras pegadas o separadas ("polisabigente" = "póliza vigente"), números en cifras o letras.
- RUC solo cuenta si se oye `ruc` o `ruk` (o R.U.C.). **"rock", "rook", "roc" son error.**

Segunda verificación (`verificar.py`) sobre la pista **final masterizada**, frase por frase, con ambos jueces y control de términos clave (RUC, SUNAT, GLP, UIT, Osinergmin, TUPA, Hidrocarburos, D.S., extracontractual, adendas, solidariamente, póliza). Genera `reporte_voz.md`.

## Problemas conocidos
- Inicio de frase con artefacto: "La póliza" → "Tapóliza"/"Apóliza". Cambiar velocidad o prefijo "… " suele resolverlo.
- RUC dentro de "consulta RUC SUNAT" (frase e4b del proyecto de pólizas): ninguna de 32 variantes salió perfecta para ambos jueces; turbo la oye bien. Si vuelve a pasar, la salida es grabar esa frase con voz humana o con la voz de Lorenzo.
- Whisper-small pega palabras y confunde vocales; el juez decisivo es turbo, pero una diferencia que ven **ambos** es real (p. ej. "contemplado" sin s).

## Voz de Lorenzo (preferida por el usuario)
La herramienta está en la PC del usuario (`C:\Users\MAX\Desktop\CLAUDE\herramientas\voz\voz_ovcorp.py` con su `.venv`). Paquete listo en `voz_lorenzo/` (guion por frase + script). Los WAV que devuelva van en una carpeta y se integran con la misma verificación.
