# Sistema visual aprobado: "Tarjetas ilustradas"

Aprobado en el video de pólizas RCE para Solgas. Código: `video-polizas-glp/final/index.html` (CSS y núcleo)
y `final/extra.js` (componentes e iconos).

## Lienzo
- 1920×1080, 30 fps. Márgenes: contenido entre x=150 y x=1770; títulos en y≈150; área de contenido y≈300–950.
- HUD arriba a la izquierda (número de sección + nombre) y barra de progreso naranja abajo.
- Transición entre escenas: `wipe()` (cuatro franjas inclinadas naranja/celeste/azul/blanco) + `chapter()` con número grande contorneado en naranja, título y subtítulo (dura lo que `SCENE_LEAD`, 2,4 s).

## Paleta (tonos suaves de Solgas)
```
--nv  #0A1F4F  azul noche: texto, contornos y sombras
--bl  #0047BB  azul Solgas
--bl2 #8FB0EA  azul medio
--blT #D6E3F8  azul suave (cabeceras)
--cyT #D3F0FA  celeste suave
--orT #FFE2C7  durazno suave
--yeT #FFEDB8  amarillo suave (resaltados)
--or  #FF7A00  naranja Solgas (acento, una sola cosa por elemento)
--ok  #12B76A  correcto    --no #E5484D  incorrecto
--mut #2A3A63  texto secundario (más claro no pasa contraste sobre fotos)
```
- Texto siempre azul noche; el color va en fondos de tarjeta, resaltados y acentos, **no en todo el texto**.

## Tipografía
- **Epilogue** (Google Fonts) 800–900 en títulos, 600–800 en cuerpo. Elegida entre 5 opciones; el usuario pidió explícitamente no repetir la fuente "de siempre".
- Títulos 56–108 px con palabras animadas (`words()` + `wordsIn()`), resaltado amarillo con `*palabra*` o `*varias palabras*`; `/` fuerza salto de línea.

## Componentes
- **Tarjeta** `.k`: blanco, borde 5 px azul noche, radio 30 px, sombra sólida desplazada 12×14 px azul noche.
- **Tarjeta documento** `dcard()`: cabecera de color suave con icono + título + subtítulo; filas `rows()` con etiqueta en versalitas y valor con marcador animable (`hl()`; `.mk.r` = rojo para datos incorrectos).
- **Texto legal "como imagen"** (artículos): tarjeta con párrafo `.art` 29–31 px y `MARK('<m>…</m>')` para subrayar frases que la voz menciona (`hl2()`).
- **Píldora** `pillAt()`, **sello** `stamp()` (CORRECTO / INCORRECTO / OBSERVADA / PROHIBIDO…), **check** `checkItem()` (casilla que se marca en verde o rojo), **marca** `mark()` (círculo con ✓/✗), **flecha** `arrow()`, **contador** `counterTo()`.
- **Comparativos correcto/incorrecto**: el guion los pide a menudo; misma tarjeta, datos erróneos resaltados en rojo + sello.

## Iconos: estilo 9 "línea con acento"
- Trazo azul noche 3 px redondeado y **un solo detalle naranja** con relleno durazno. Elegido entre 10 estilos (`video-polizas-glp/prototipos_iconos/`).
- Definidos como geometría 64×64 con roles (`b` cuerpo, `a` acento, `d` detalle, `l` línea, `t` texto) en `ICON9`; `ic9('nombre')` los dibuja.
- Disponibles: poliza, solicitud, autorizacion, ruc, registro, supervision, terceros, ambiente, instalaciones, automotor, alerta, ubicacion, monto, tanque, bienes, escudo, carpeta, certificado, balanza, clausula, calendario, prohibido, normativa, flecha.
- Los iconos deben **entenderse solos**: si hace falta, llevan una etiqueta corta dentro ("RUC", "GLP", "S/", "D.S.").
- Sobre insignias (`badge()`): círculo blanco con borde y sombra; nunca acento naranja sobre fondo durazno.

## Fondos
- Fotos con **velo celeste suave** (`VELOS.celeste`: rgb 218,241,250, opacidad .88 → .66 → .26) + zoom lento (scale 1 → 1,09). Formas del velo: `side` (texto a la izquierda), `soft` (más uniforme), `full` (contenido centrado), `top` (cierre).
- Blanco aclaraba demasiado; se probaron 7 tonos y el usuario eligió el celeste.
- Texturas (`texture()`): patrón tenue de documentos, escudos y checks para escenas documentales.
- Repartir fotos para no repetir la misma en escenas seguidas.

## Contraste (obligatorio)
- Medir con `contraste.js` (oculta la capa de texto, toma el 5 % más oscuro del fondo detrás de cada texto y calcula la relación WCAG). Objetivo ≥ 4,5:1 en todo texto sobre foto; títulos ≥ 7:1.

## Cosas descartadas (no volver a proponer salvo que las pidan)
- Personajes humanos (SVG detallado, 3D, cartoon), planta industrial ilustrada, fondo azul oscuro, paleta genérica sin colores de Solgas, emojis en pantalla.
