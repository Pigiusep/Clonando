/* global Html5Qrcode, Html5QrcodeSupportedFormats */
// Pantalla de escaneo. Acepta tres fuentes de lectura que terminan en la misma función `procesarCodigo`:
//   1. Cámara del celular o laptop (QR y códigos de barras) con html5-qrcode.
//   2. Pistola lectora USB/Bluetooth: escribe el código en el campo y envía "Enter".
//   3. Escritura manual del código.
(function () {
  const $ = (id) => document.getElementById(id);
  const campo = $('codigo');
  const rapido = $('rapido');
  const formMov = $('form-movimiento');
  const csrf = document.querySelector('meta[name="csrf-token"]').content;
  const CLAVE_AUTO = 'inventario.autoCamara';
  const NOMBRES = { consulta: 'Consulta', entrada: 'Entrada', salida: 'Salida', ajuste: 'Conteo' };

  let productoActual = null;
  let camara = null;
  let ultimaLectura = { codigo: null, en: 0 };
  let ocupado = false;
  let audio = null;

  const modo = () => document.querySelector('input[name="modo"]:checked').value;
  const num = (n) => Number(n).toLocaleString('es-PE', { maximumFractionDigits: 3 });

  function preferencia(clave, valor) {
    try {
      if (valor === undefined) return localStorage.getItem(clave) === '1';
      localStorage.setItem(clave, valor ? '1' : '0');
    } catch { /* almacenamiento no disponible */ }
    return false;
  }

  // Sonido corto + vibración para confirmar la lectura sin mirar la pantalla.
  function senal(ok) {
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audio.createOscillator();
      osc.frequency.value = ok ? 880 : 220;
      osc.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + (ok ? 0.08 : 0.3));
    } catch { /* sin audio */ }
    if (navigator.vibrate) navigator.vibrate(ok ? 60 : [80, 60, 80]);
  }

  async function api(url, opciones = {}) {
    const r = await fetch(url, {
      ...opciones,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    });
    if (r.status === 401) {
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }
    const datos = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, datos };
  }

  // --- Cámara --------------------------------------------------------------------------

  function pausarCamara() {
    try { if (camara?.getState() === 2) camara.pause(true); } catch { /* ya pausada */ }
  }

  function reanudarCamara() {
    try { if (camara?.getState() === 3) camara.resume(); } catch { /* no estaba pausada */ }
  }

  async function abrirCamara() {
    const aviso = $('aviso-camara');
    aviso.hidden = true;
    if (!window.isSecureContext) {
      aviso.textContent = 'La cámara solo funciona si el sistema se abre con https://. '
        + 'Mientras tanto puedes escribir el código o usar una pistola lectora.';
      aviso.hidden = false;
      return;
    }
    try {
      const F = Html5QrcodeSupportedFormats;
      camara = new Html5Qrcode('lector', {
        formatsToSupport: [F.QR_CODE, F.CODE_128, F.CODE_39, F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.ITF],
        useBarCodeDetectorIfSupported: true,
        verbose: false,
      });
      await camara.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: (w, h) => { const l = Math.floor(Math.min(w, h) * 0.7); return { width: l, height: l }; } },
        (texto) => {
          // La cámara lee el mismo código varias veces por segundo: se ignora la repetición por 2,5 s.
          const ahora = Date.now();
          if (texto === ultimaLectura.codigo && ahora - ultimaLectura.en < 2500) return;
          ultimaLectura = { codigo: texto, en: ahora };
          procesarCodigo(texto);
        },
        () => {},
      );
      $('btn-camara').hidden = true;
      $('btn-detener').hidden = false;
    } catch (err) {
      camara = null;
      aviso.textContent = `No se pudo abrir la cámara (${err?.message || err}). Revisa que el navegador tenga permiso para usarla.`;
      aviso.hidden = false;
    }
  }

  async function cerrarCamara() {
    if (camara) {
      await camara.stop().catch(() => {});
      camara.clear();
      camara = null;
    }
    $('btn-camara').hidden = false;
    $('btn-detener').hidden = true;
  }

  // --- Paneles -------------------------------------------------------------------------

  function agregarHistorial(codigo, producto, operacion) {
    const cuerpo = $('historial');
    cuerpo.querySelector('.vacio-fila')?.remove();
    const fila = document.createElement('tr');
    const celdas = [
      new Date().toLocaleTimeString('es-PE'), codigo, producto ? producto.nombre : '—',
      operacion, producto ? `${num(producto.stock)} ${producto.unidad}` : '—',
    ];
    celdas.forEach((texto, i) => {
      const td = document.createElement('td');
      td.textContent = texto;
      if (i === 4) td.className = 'num';
      fila.appendChild(td);
    });
    cuerpo.prepend(fila);
  }

  // Vuelve a dejar todo listo para la siguiente lectura.
  function siguiente() {
    productoActual = null;
    $('panel-producto').hidden = true;
    $('panel-no-existe').hidden = true;
    reanudarCamara();
    if (!camara) campo.focus();
  }

  function mostrarProducto(p, { pedirCantidad }) {
    productoActual = p;
    $('panel-no-existe').hidden = true;
    $('panel-producto').hidden = false;
    $('p-nombre').textContent = p.nombre;
    $('p-codigo').textContent = p.codigo;
    $('p-ubicacion').textContent = p.ubicacion || '—';
    $('p-stock').textContent = `${num(p.stock)} ${p.unidad}`;
    $('p-stock').className = p.stock <= p.stock_minimo ? 'alerta' : '';
    $('p-enlace').href = `/productos/${p.id}`;

    const m = modo();
    formMov.hidden = !pedirCantidad || m === 'consulta' || !p.activo;
    $('btn-siguiente').hidden = !formMov.hidden;
    $('etiqueta-cantidad').textContent = m === 'ajuste' ? 'Cantidad contada' : 'Cantidad';
    $('btn-registrar').textContent = `Registrar ${NOMBRES[m].toLowerCase()}`;
    $('cantidad').value = m === 'ajuste' ? '' : '1';
    if (!formMov.hidden) {
      // Mientras se escribe la cantidad, la cámara no debe leer otro código.
      pausarCamara();
      $('cantidad').focus();
      $('cantidad').select();
    }
    $('panel-producto').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function mostrarNoExiste(codigo) {
    productoActual = null;
    pausarCamara();
    $('panel-producto').hidden = true;
    $('panel-no-existe').hidden = false;
    $('ne-codigo').textContent = codigo;
    $('ne-crear').href = `/productos/nuevo?codigo=${encodeURIComponent(codigo)}`;
    $('panel-no-existe').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function registrar(codigo, cantidad, nota) {
    const m = modo();
    const { ok, datos } = await api('/api/movimientos', {
      method: 'POST', body: JSON.stringify({ codigo, tipo: m, cantidad, nota }),
    });
    if (!ok) {
      senal(false);
      alert(datos.error || 'No se pudo registrar el movimiento.');
      return false;
    }
    senal(true);
    const signo = m === 'ajuste' ? '=' : (m === 'salida' ? '−' : '+');
    agregarHistorial(codigo, datos, `${NOMBRES[m]} ${signo}${num(cantidad)}`);
    mostrarProducto(datos, { pedirCantidad: false });
    return true;
  }

  async function procesarCodigo(codigoCrudo) {
    const codigo = String(codigoCrudo).trim();
    if (!codigo || ocupado) return;
    // Con un formulario abierto, una lectura nueva se ignora hasta registrar o cancelar.
    if (!formMov.hidden && !$('panel-producto').hidden) return;
    ocupado = true;
    try {
      const m = modo();
      if (rapido.checked && (m === 'entrada' || m === 'salida')) {
        await registrar(codigo, 1, 'Registro rápido');
        return;
      }
      const { ok, status, datos } = await api(`/api/productos/codigo/${encodeURIComponent(codigo)}`);
      if (ok) {
        senal(true);
        mostrarProducto(datos, { pedirCantidad: true });
        if (m === 'consulta') agregarHistorial(codigo, datos, 'Consulta');
      } else if (status === 404) {
        senal(false);
        mostrarNoExiste(codigo);
        agregarHistorial(codigo, null, 'No registrado');
      } else {
        senal(false);
        alert(datos.error || 'Error al buscar el producto.');
      }
    } finally {
      ocupado = false;
    }
  }

  // --- Eventos -------------------------------------------------------------------------

  $('form-codigo').addEventListener('submit', (e) => {
    e.preventDefault();
    const valor = campo.value;
    campo.value = '';
    procesarCodigo(valor);
  });

  formMov.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!productoActual) return;
    const boton = $('btn-registrar');
    boton.disabled = true; // evita registrar dos veces con doble toque
    try {
      if (await registrar(productoActual.codigo, $('cantidad').value, $('nota').value)) {
        $('nota').value = '';
        reanudarCamara();
        if (!camara) campo.focus();
      }
    } finally {
      boton.disabled = false;
    }
  });

  $('btn-cancelar').addEventListener('click', siguiente);
  $('btn-siguiente').addEventListener('click', siguiente);
  $('ne-siguiente').addEventListener('click', siguiente);
  $('btn-camara').addEventListener('click', abrirCamara);
  $('btn-detener').addEventListener('click', async () => {
    await cerrarCamara();
    campo.focus();
  });

  document.querySelectorAll('input[name="modo"]').forEach((r) => r.addEventListener('change', () => {
    if (productoActual) mostrarProducto(productoActual, { pedirCantidad: true });
  }));

  const auto = $('auto-camara');
  auto.checked = preferencia(CLAVE_AUTO);
  auto.addEventListener('change', () => preferencia(CLAVE_AUTO, auto.checked));
  if (auto.checked) abrirCamara();
  else campo.focus();

  window.addEventListener('pagehide', () => { if (camara) camara.stop().catch(() => {}); });
}());
