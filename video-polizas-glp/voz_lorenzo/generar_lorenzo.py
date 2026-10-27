# Genera la locución del video con la voz de Lorenzo (voz_ovcorp.py), una frase por archivo.
# Uso (Windows, desde esta carpeta):
#   C:\Users\MAX\Desktop\CLAUDE\herramientas\voz\.venv\Scripts\python.exe generar_lorenzo.py
# Resultado: carpeta .\lorenzo\ con e1a.wav, e1b.wav, ... (51 archivos). Comprímela y súbela al chat.
import json, os, subprocess, sys

HERRAMIENTA = r"C:\Users\MAX\Desktop\CLAUDE\herramientas\voz\voz_ovcorp.py"
PYTHON = r"C:\Users\MAX\Desktop\CLAUDE\herramientas\voz\.venv\Scripts\python.exe"
# Ajusta esta línea a los argumentos reales de voz_ovcorp.py ({texto} y {salida} se reemplazan):
COMANDO = [PYTHON, HERRAMIENTA, "--texto", "{texto}", "--salida", "{salida}"]

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "lorenzo")
os.makedirs(SALIDA, exist_ok=True)
frases = json.load(open(os.path.join(AQUI, "guion_locucion.json"), encoding="utf-8"))
solo = set(sys.argv[1:])          # opcional: regenerar solo algunas, p. ej.  generar_lorenzo.py e4b e7b
for f in frases:
    if solo and f["id"] not in solo:
        continue
    destino = os.path.join(SALIDA, f["id"] + ".wav")
    cmd = [c.replace("{texto}", f["texto"]).replace("{salida}", destino) for c in COMANDO]
    print(f"[{f['id']}] {f['texto'][:70]}...")
    subprocess.run(cmd, check=True)
print("Listo:", SALIDA)
