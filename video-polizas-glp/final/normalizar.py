# Normalización ESTÁTICA a un objetivo de sonoridad (dos pasadas, ganancia lineal): no amplifica los silencios.
import sys, json, subprocess, re
def norm(src, dst, I=-16.0, TP=-1.5, pre=''):
    f1 = (pre + ',' if pre else '') + f'loudnorm=I={I}:TP={TP}:LRA=20:print_format=json'
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', f1, '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}', r)[-1])
    f2 = (pre + ',' if pre else '') + (f"loudnorm=I={I}:TP={TP}:LRA=20:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
          f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', f2, '-ar', '48000', dst], check=True)
if __name__ == '__main__':
    norm(sys.argv[1], sys.argv[2], float(sys.argv[3]), pre=sys.argv[4] if len(sys.argv) > 4 else '')
