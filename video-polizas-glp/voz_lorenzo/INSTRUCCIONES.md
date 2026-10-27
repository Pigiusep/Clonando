# Voz de Lorenzo para el video de pólizas RCE

El video está sincronizado frase por frase. Para usar la voz de Lorenzo (`voz_ovcorp.py`) hace falta un audio por frase.

## Opción rápida (con Claude Code en tu PC)
Abre Claude Code en `C:\Users\MAX\Desktop\CLAUDE` y pégale:

> Lee `herramientas\voz\voz_ovcorp.py` para ver cómo se usa. Luego, con su `.venv`, genera un WAV por cada frase de
> `guion_locucion.json` (usa el campo `texto`), nombrado `<id>.wav`, en una carpeta `lorenzo`. No cambies el texto.
> Al final comprime la carpeta en `lorenzo.zip`.

## Opción manual
1. Copia esta carpeta (`voz_lorenzo`) a tu PC.
2. Abre `generar_lorenzo.py` y ajusta la línea `COMANDO` a los argumentos reales de `voz_ovcorp.py`.
3. Ejecuta: `C:\Users\MAX\Desktop\CLAUDE\herramientas\voz\.venv\Scripts\python.exe generar_lorenzo.py`
4. Comprime la carpeta `lorenzo` (51 archivos `.wav`) y súbela al chat.

## Qué hago yo con esos audios
Los integro (`EXT=lorenzo python3 narracion.py`): las animaciones se re-sincronizan solas a la nueva voz,
verifico cada frase con Whisper (palabras, pausas, trabas) y renderizo el video final.

## Notas sobre el texto
- Siglas: el campo `texto` lleva "GLP", "UIT", "RUC". Si Lorenzo las lee mal, usa `texto_tts` (ya viene escrito para pronunciarse bien).
- "y/o" se debe leer "y o".
