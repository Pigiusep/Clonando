# Genera style-guide.html (guía de estilo del video, método Reblis style-guide) y tokens.css para el video.
import os, re, json

HERE = os.path.dirname(os.path.abspath(__file__))
LUC = os.path.join(HERE, 'node_modules', 'lucide-static', 'icons')

# ---- tokens de marca (Solgas, supuesto a confirmar con manual de marca) ----
PRIM = [
    ('Azul Solgas', 'azul', '#0047BB', 'Color principal. Fondos, encabezados, documentos oficiales.'),
    ('Azul Noche', 'noche', '#0A1F4F', 'Ancla oscura. Fondos profundos y contraste de texto blanco.'),
    ('Naranja Sol', 'sol', '#FF7A00', 'Acento de marca. Palabras clave, cifras, alertas de atención.'),
    ('Amarillo Sol', 'oro', '#FFB81C', 'Acento cálido. Resaltados, degradado solar, marcadores.'),
    ('Celeste Gas', 'gas', '#00A9E0', 'Acento técnico. Flujo de GLP, datos, conectores.'),
]
FUNC = [('Correcto', 'ok', '#12B76A'), ('Incorrecto', 'stop', '#E5484D'), ('Atención', 'warn', '#F79009')]
NEUTRAL = [('Tinta', 'ink', '#0B1530'), ('Pizarra', 'slate', '#475467'), ('Medio', 'mid', '#667085'),
           ('Regla', 'rule', '#E4E7EC'), ('Página', 'page', '#F5F7FB'), ('Papel', 'paper', '#FFFFFF')]
GRADS = [
    ('Light Gradient', 'Cielo claro', 'linear-gradient(135deg,#3D7BE0 0%,#0047BB 100%)'),
    ('Full Gradient', 'Cielo profundo', 'linear-gradient(135deg,#0047BB 0%,#0A1F4F 62%,#06132F 100%)'),
    ('Dark Gradient', 'Noche', 'linear-gradient(160deg,#0A1F4F 0%,#06132F 100%)'),
    ('Accent Gradient', 'Amanecer solar', 'linear-gradient(90deg,#FF7A00 0%,#FFB81C 100%)'),
    ('Horizon Gradient', 'Horizonte (ilustración)', 'linear-gradient(180deg,#06132F 0%,#0A1F4F 38%,#0047BB 72%,#FF9A3C 100%)'),
    ('Tech Gradient', 'Flujo de gas', 'linear-gradient(90deg,#00A9E0 0%,#0047BB 100%)'),
]
RADIUS = '16px'
DISPLAY, BODY, MONO = 'Plus Jakarta Sans', 'Inter', 'JetBrains Mono'


def hex2rgb(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def rgb2hex(c): return '#%02X%02X%02X' % tuple(max(0, min(255, round(v))) for v in c)
def mix(h, t, w='#FFFFFF'):
    a, b = hex2rgb(h), hex2rgb(w); return rgb2hex([a[i] * t + b[i] * (1 - t) for i in range(3)])
def lum(h):
    def ch(c):
        c /= 255; return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = hex2rgb(h); return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
def txt(h): return '#0B1530' if lum(h) > 0.38 else '#FFFFFF'
STEPS = [(600, .81), (500, .62), (400, .43), (300, .24), (50, .05)]


def icon(name, cls='ic'):
    s = open(os.path.join(LUC, name + '.svg')).read()
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'class="[^"]*"', f'class="{cls}"', s, count=1)
    s = re.sub(r' width="24" height="24"', '', s)
    return s


# tokens.css (consumido por el video)
tok = [':root{']
for n, k, h, _ in PRIM:
    tok.append(f'  --{k}:{h};')
    for st, t in STEPS: tok.append(f'  --{k}-{st}:{mix(h, t)};')
for n, k, h in FUNC + NEUTRAL: tok.append(f'  --{k}:{h};')
tok.append(f'  --radius:{RADIUS};')
for i, (lbl, n, g) in enumerate(GRADS): tok.append(f'  --g{i}:{g};')
tok.append('}')
open(os.path.join(HERE, 'tokens.css'), 'w').write('\n'.join(tok) + '\n')

# ---------------- página ----------------
NAV = [('fundamentos', 'Fundamentos'), ('voz', 'Voz y tono'), ('color', 'Color'), ('tipografia', 'Tipografía'),
       ('layout', 'Layout'), ('iconos', 'Iconografía'), ('motion', 'Movimiento')]

swatches = ''.join(f'''<div class="sw"><div class="chip-c" style="background:{h};color:{txt(h)}"><span>{n}</span></div>
  <div class="spec"><b>{h}</b><span>RGB {', '.join(map(str, hex2rgb(h)))}</span><p>{d}</p></div></div>''' for n, k, h, d in PRIM)
ramps = ''.join('<div class="ramp">' + ''.join(
    f'<div style="background:{mix(h, t)};color:{txt(mix(h, t))}"><b>{st}</b><span>{mix(h, t)}</span></div>' for st, t in STEPS) + '</div>' for n, k, h, d in PRIM)
funcs = ''.join(f'<div class="fn"><i style="background:{h}"></i><b>{n}</b><span>{h}</span></div>' for n, k, h in FUNC + NEUTRAL)
grads = ''.join(f'<figure class="gr"><div style="background:{g}"></div><figcaption><b>{lbl}</b> · {n}</figcaption></figure>' for lbl, n, g in GRADS)

pillars = [('shield-check', 'Rigor normativo', 'Cada dato en pantalla proviene del D.S. 01-94-EM o del guion aprobado.'),
           ('scan-search', 'Verificación', 'El video enseña a revisar: comparar, resaltar, validar.'),
           ('users', 'Protección de terceros', 'El propósito final: personas, bienes y medio ambiente.'),
           ('zap', 'Dinamismo', 'Movimiento constante para sostener la atención del profesional.')]
pill_html = ''.join(f'<div class="card pc"><span class="dk">{icon(i)}</span><h4>{t}</h4><p>{d}</p></div>' for i, t, d in pillars)

traits = [('Profesional', 'Habla a especialistas con precisión técnica.', 'La póliza debe consignar la razón social tal cual figura en SUNAT.', '¡Ojo con tu póliza, que te pueden multar!'),
          ('Claro', 'Una idea por frase; términos normativos explicados con gráficos.', 'Monto mínimo: de 100 a 300 UIT según la capacidad.', 'Los montos varían según diversos factores aplicables.'),
          ('Preventivo', 'Enfoca la revisión antes del trámite, no el castigo.', 'Una revisión preventiva evita observaciones.', 'Si fallas, te sancionan.')]
trait_html = ''.join(f'''<div class="card tr"><h4>{t}</h4><p>{d}</p><div class="do">{icon('check')}<span>{a}</span></div><div class="dont">{icon('x')}<span>{b}</span></div></div>''' for t, d, a, b in traits)
spectrum = [('Formal', 'Cercano', 78), ('Técnico', 'Divulgativo', 62), ('Serio', 'Lúdico', 22), ('Sobrio', 'Enérgico', 64)]
spec_html = ''.join(f'<div class="spc"><span>{a}</span><div class="bar"><i style="left:{v}%"></i></div><span>{b}</span></div>' for a, b, v in spectrum)

types = [('Display XL', DISPLAY, 800, 96, 'Pólizas RCE'), ('Título', DISPLAY, 800, 64, 'Marco normativo'),
         ('Subtítulo', DISPLAY, 700, 40, 'Monto asegurado y suficiencia'), ('Etiqueta', DISPLAY, 700, 26, 'CORRECTO · INCORRECTO'),
         ('Cuerpo', BODY, 500, 30, 'La póliza debe coincidir con el Registro de Hidrocarburos.'), ('Dato', BODY, 600, 22, 'RUC 20601234567 · 200 UIT')]
type_html = ''.join(f'<div class="ty"><div class="tl"><b>{n}</b><span>{f} · {w} · {s}px</span></div><div class="tsx" style="font-family:\'{f}\';font-weight:{w};font-size:{min(s, 72)}px">{t}</div></div>' for n, f, w, s, t in types)

icons = ['shield-check', 'users', 'house', 'leaf', 'factory', 'file-text', 'scan-search', 'triangle-alert', 'coins', 'calendar-days', 'map-pin', 'folder-open',
         'badge-check', 'circle-alert', 'refresh-cw', 'cog', 'truck', 'link', 'fuel', 'list-checks', 'scale', 'landmark', 'file-stack', 'clipboard-check']
icon_html = ''.join(f'<div class="icn">{icon(i)}<span>{i}</span></div>' for i in icons)

motion = [('Entrada', 'expo.out · 0.7 s', 'Elementos que llegan: deslizamiento + máscara.'), ('Énfasis', 'back.out(2) · 0.55 s', 'Checks, sellos, chips: escala con rebote.'),
          ('Salida', 'power2.in · 0.4 s', 'Siempre más rápida que la entrada.'), ('Cámara', 'power3.inOut · 1.4 s', 'Paneos y zooms sobre la planta ilustrada.'),
          ('Transición', 'barras diagonales · 1.1 s', 'Azul → celeste → naranja sobre fondo Noche.'), ('Sincronía', 'palabra clave ±0.3 s', 'Cada gráfico entra cuando la voz lo nombra.')]
mo_html = ''.join(f'<div class="card mo"><b>{a}</b><code>{b}</code><p>{c}</p></div>' for a, b, c in motion)

nav_html = ''.join(f'<a href="#{i}">{t}</a>' for i, t in NAV)
gf = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap'

html = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Solgas · Guía de estilo del video</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{gf}" rel="stylesheet">
<style>
{open(os.path.join(HERE, 'tokens.css')).read()}
:root{{--display:'{DISPLAY}',system-ui,sans-serif;--sans:'{BODY}',system-ui,sans-serif;--mono:'{MONO}',ui-monospace,monospace}}
*{{box-sizing:border-box}} html,body{{margin:0;padding:0}} html{{scroll-behavior:smooth}}
body{{background:var(--page);color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:hidden}}
.page{{max-width:1180px;margin:0 auto;padding:0 22px 120px}} @media(min-width:760px){{.page{{padding:0 40px 120px}}}}
.header-bar{{position:relative;width:100vw;margin-left:calc(50% - 50vw);padding:54px 22px 64px;background:var(--g1);color:#fff;overflow:hidden}}
.header-bar::after{{content:"";position:absolute;left:0;right:0;bottom:0;height:6px;background:var(--g3)}}
.header-inner{{max-width:1180px;margin:0 auto;padding:0 22px}} @media(min-width:760px){{.header-inner{{padding:0 40px}}}}
.kicker{{font-family:var(--mono);font-weight:700;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--oro);margin-bottom:18px}}
.wordmark{{font-family:var(--display);font-weight:800;font-size:clamp(2.6rem,1.6rem + 4vw,4.6rem);letter-spacing:-.03em;line-height:1;margin:0 0 20px;color:#fff}}
.wordmark em{{font-style:normal;background:var(--g3);-webkit-background-clip:text;background-clip:text;color:transparent}}
.lede{{font-weight:400;font-size:17px;color:rgba(255,255,255,.9);max-width:770px;margin:0 0 24px}}
.meta{{font-family:var(--mono);font-size:11.5px;letter-spacing:.06em;color:rgba(255,255,255,.62);text-transform:uppercase}} .meta b{{color:#fff;font-weight:500}}
.section-nav{{position:sticky;top:0;z-index:20;width:100vw;margin-left:calc(50% - 50vw);background:rgba(245,247,251,.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--rule)}}
.nav-inner{{max-width:1180px;margin:0 auto;padding:12px 40px;display:flex;align-items:center;gap:22px;overflow-x:auto}}
.brand-chip{{font-family:var(--display);font-weight:800;font-size:14px;color:#fff;background:var(--azul);padding:6px 12px;border-radius:999px;white-space:nowrap}}
.section-nav a{{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--slate);text-decoration:none;white-space:nowrap}}
.section-nav a:hover{{color:var(--sol)}}
section{{padding-top:72px}} .sh{{display:flex;align-items:baseline;gap:16px;margin-bottom:26px;border-bottom:2px solid var(--ink);padding-bottom:12px}}
.sh .n{{font-family:var(--mono);font-weight:700;color:var(--sol);font-size:14px}} .sh h2{{font-family:var(--display);font-weight:800;font-size:34px;margin:0;letter-spacing:-.02em}}
h3{{font-family:var(--display);font-weight:700;font-size:20px;margin:36px 0 14px}}
.card{{background:var(--paper);border:1px solid var(--rule);border-radius:var(--radius);padding:24px}}
.grid{{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}}
.mission{{background:var(--g1);color:#fff;border:0}} .mission p{{font-family:var(--display);font-weight:700;font-size:24px;line-height:1.35;margin:0}}
.banner{{margin:18px 0;padding:22px 28px;border-radius:var(--radius);background:var(--g3);color:var(--ink);font-family:var(--display);font-weight:800;font-size:22px}}
.ic{{width:24px;height:24px}} .dk{{display:inline-grid;place-items:center;width:46px;height:46px;border-radius:12px;background:var(--noche);color:var(--oro)}}
.pc h4,.tr h4{{font-family:var(--display);font-weight:800;font-size:18px;margin:14px 0 6px}} .pc p,.tr p{{margin:0;color:var(--slate)}}
.do,.dont{{display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding:10px 12px;border-radius:10px;font-size:14px}}
.do{{background:var(--ok)10;background:#E7F8EF}} .do .ic{{color:var(--ok);flex:none}} .dont{{background:#FDECEC}} .dont .ic{{color:var(--stop);flex:none}}
.spc{{display:grid;grid-template-columns:110px 1fr 110px;align-items:center;gap:14px;margin:12px 0;font-family:var(--mono);font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--slate)}}
.spc span:last-child{{text-align:right}} .bar{{position:relative;height:8px;border-radius:99px;background:var(--rule)}}
.bar i{{position:absolute;top:50%;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;background:var(--sol);box-shadow:0 0 0 4px #fff}}
.sw{{background:var(--paper);border:1px solid var(--rule);border-radius:var(--radius);overflow:hidden}}
.chip-c{{height:150px;display:flex;align-items:flex-end;padding:16px;font-family:var(--display);font-weight:800;font-size:18px}}
.spec{{padding:14px 16px}} .spec b{{font-family:var(--mono);font-size:14px}} .spec span{{display:block;font-family:var(--mono);font-size:12px;color:var(--mid)}} .spec p{{margin:8px 0 0;font-size:13px;color:var(--slate)}}
.ramps{{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:18px}}
.ramp{{border-radius:var(--radius);overflow:hidden;border:1px solid var(--rule)}} .ramp div{{display:flex;justify-content:space-between;padding:10px 14px;font-family:var(--mono);font-size:12px}}
.fns{{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}}
.fn{{display:flex;align-items:center;gap:10px;background:var(--paper);border:1px solid var(--rule);border-radius:12px;padding:10px 12px;font-size:13px}}
.fn i{{width:28px;height:28px;border-radius:8px;border:1px solid var(--rule)}} .fn span{{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--mid)}}
.grs{{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}} .gr{{margin:0}} .gr div{{height:130px;border-radius:var(--radius)}}
.gr figcaption{{margin-top:8px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--slate)}}
.ty{{display:grid;grid-template-columns:220px 1fr;align-items:center;gap:20px;padding:18px 0;border-bottom:1px solid var(--rule)}}
.tl b{{display:block;font-family:var(--display);font-weight:800}} .tl span{{font-family:var(--mono);font-size:11px;color:var(--mid)}} .tsx{{line-height:1.1;letter-spacing:-.01em;overflow-wrap:anywhere}}
.rules{{margin-top:18px;border-left:4px solid var(--sol);background:var(--paper);padding:16px 20px;border-radius:0 var(--radius) var(--radius) 0;color:var(--slate)}}
.icons{{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}}
.icn{{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 8px;background:var(--paper);border:1px solid var(--rule);border-radius:var(--radius);color:var(--azul)}}
.icn .ic{{width:32px;height:32px}} .icn span{{font-family:var(--mono);font-size:10px;color:var(--mid)}}
.mos{{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}} .mo b{{font-family:var(--display);font-size:18px}} .mo code{{display:block;font-family:var(--mono);font-size:12px;color:var(--sol);margin:6px 0}} .mo p{{margin:0;color:var(--slate);font-size:14px}}
/* layout: modelo de caja del lienzo */
.toggle{{display:inline-flex;gap:6px;margin-bottom:18px}} .toggle button{{border:2px solid var(--azul);background:#fff;color:var(--azul);font-family:var(--display);font-weight:700;padding:8px 18px;border-radius:999px;cursor:pointer}}
.toggle button.on{{background:var(--sol);border-color:var(--sol);color:#fff}}
.bm{{position:relative;padding:34px;background:repeating-linear-gradient(45deg,rgba(11,21,48,.06) 0 6px,transparent 6px 12px);border:1px dashed var(--silver,#98A2B3);border-radius:var(--radius)}}
.bm .pad{{position:relative;background:rgba(255,122,0,.09);border:2px solid var(--sol);padding:var(--pv,72px) var(--ph,96px);transition:padding .35s}}
.bm .content{{background:var(--paper);border:2px solid var(--azul);min-height:180px;display:grid;place-items:center;text-align:center;color:var(--slate);font-family:var(--mono);font-size:12px}}
.bm .lbl{{position:absolute;font-family:var(--mono);font-size:12px;font-weight:700;color:var(--sol)}}
.bm .t{{top:calc(var(--pv,72px)/2 - 8px);left:50%;transform:translateX(-50%)}} .bm .b{{bottom:calc(var(--pv,72px)/2 - 8px);left:50%;transform:translateX(-50%)}}
.bm .l{{left:6px;top:50%}} .bm .r{{right:6px;top:50%}} .bm .m{{position:absolute;top:8px;left:12px;font-family:var(--mono);font-size:11px;color:var(--mid)}}
footer{{margin-top:90px;padding-top:22px;border-top:2px solid var(--ink);display:flex;justify-content:space-between;font-size:13px;color:var(--slate)}} footer code{{font-family:var(--mono)}}
</style></head><body>
<div class="page">
<header class="header-bar"><div class="header-inner">
  <div class="kicker">Guía de estilo del video · Edición 2026</div>
  <div class="wordmark" role="img" aria-label="Solgas">sol<em>gas</em></div>
  <p class="lede">Sistema visual del video de capacitación <b>"Pólizas de Responsabilidad Civil Extracontractual"</b> para consumidores directos de GLP: color, tipografía, iconografía y movimiento aplicados a cada fotograma.</p>
  <div class="meta"><b>Capacitación técnica</b> · {DISPLAY} + {BODY} · 1920×1080</div>
</div></header>
<nav class="section-nav"><div class="nav-inner"><span class="brand-chip">solgas</span>{nav_html}</div></nav>

<section id="fundamentos"><div class="sh"><span class="n">01</span><h2>Fundamentos</h2></div>
  <div class="card mission"><p>Que cada profesional sepa revisar una póliza RCE y detectar inconsistencias antes de que se conviertan en observaciones.</p></div>
  <div class="banner">La prevención comienza con el conocimiento.</div>
  <div class="grid">{pill_html}</div>
</section>

<section id="voz"><div class="sh"><span class="n">02</span><h2>Voz y tono</h2></div>
  <div class="grid">{trait_html}</div>
  <h3>Espectro de voz</h3><div class="card">{spec_html}</div>
  <div class="rules"><b>Locución:</b> voz masculina neutra latina, ritmo corrido y pausado en cifras. Siglas: G-L-P, U-I-T; "RUC" y "SUNAT" como palabra; "Osinergmín".</div>
</section>

<section id="color"><div class="sh"><span class="n">03</span><h2>Color</h2></div>
  <div class="grid">{swatches}</div>
  <div class="ramps">{ramps}</div>
  <h3>Funcionales y neutros</h3><div class="fns">{funcs}</div>
  <h3>Degradados</h3><div class="grs">{grads}</div>
  <div class="rules">Proporción por fotograma: <b>60 %</b> azules (fondo), <b>30 %</b> blanco/papel (documentos y tarjetas), <b>10 %</b> acento solar. El verde y el rojo se reservan exclusivamente para correcto/incorrecto.</div>
</section>

<section id="tipografia"><div class="sh"><span class="n">04</span><h2>Tipografía</h2></div>
  {type_html}
  <div class="rules">Títulos en {DISPLAY} ExtraBold con tracking −2 %; una sola palabra clave por título con el degradado solar. Cuerpo mínimo en video: 22 px. Nunca más de 2 líneas de título.</div>
</section>

<section id="layout"><div class="sh"><span class="n">05</span><h2>Layout del lienzo</h2></div>
  <div class="toggle"><button data-pv="72" data-ph="96" data-l="Horizontal 16:9 · 1920×1080" class="on">16:9</button><button data-pv="120" data-ph="60" data-l="Vertical 9:16 · 1080×1920">9:16</button><button data-pv="80" data-ph="80" data-l="Cuadrado 1:1 · 1080×1080">1:1</button></div>
  <div class="bm" id="bm"><span class="m">margen de sangrado · auto</span><div class="pad"><span class="lbl t" id="lt">72</span><span class="lbl b" id="lb">72</span><span class="lbl l" id="ll">96</span><span class="lbl r" id="lr">96</span>
    <div class="content" id="lc">Área segura de contenido<br>Horizontal 16:9 · 1920×1080</div></div></div>
  <div class="rules">Margen de seguridad lateral 96 px (gráficos sobre la planta ocupan un solo lado, máx. 50 % del ancho). Superior 72 px reservado para el capítulo; inferior 72 px libre para futuros subtítulos.</div>
</section>

<section id="iconos"><div class="sh"><span class="n">06</span><h2>Iconografía</h2></div>
  <div class="icons">{icon_html}</div>
  <div class="rules">Solo íconos Lucide, trazo 2 px, color heredado. En el video se presentan dentro de chips circulares de color sólido.</div>
</section>

<section id="motion"><div class="sh"><span class="n">07</span><h2>Movimiento</h2></div>
  <div class="mos">{mo_html}</div>
</section>

<footer><span><b>Solgas</b> · Guía de estilo del video de capacitación</span><code>RCE-GLP · v2 · 2026</code></footer>
</div>
<script>
document.querySelectorAll('.toggle button').forEach(b=>b.onclick=()=>{{
  document.querySelectorAll('.toggle button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  const bm=document.getElementById('bm');bm.style.setProperty('--pv',b.dataset.pv+'px');bm.style.setProperty('--ph',b.dataset.ph+'px');
  ['lt','lb'].forEach(i=>document.getElementById(i).textContent=b.dataset.pv);['ll','lr'].forEach(i=>document.getElementById(i).textContent=b.dataset.ph);
  document.getElementById('lc').innerHTML='Área segura de contenido<br>'+b.dataset.l;}});
</script>
</body></html>'''
open(os.path.join(HERE, 'style-guide.html'), 'w').write(html)

# íconos para el video
ICONS = {n: icon(n) for n in icons + ['check', 'x', 'arrow-right-left', 'flame', 'gavel', 'zap', 'search']}
open(os.path.join(HERE, 'icons.js'), 'w').write('window.LUCIDE=' + json.dumps(ICONS) + ';')
print('ok')
