// Registra el service worker para que la app se pueda instalar en el celular.
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* sin soporte o bloqueado */ });
  });
}
