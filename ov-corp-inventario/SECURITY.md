# Política de seguridad

## Reportar una vulnerabilidad

No abras un issue público. Escribe al responsable del sistema en OV Corp con:

- qué encontraste y en qué pantalla o ruta;
- los pasos para reproducirlo;
- el impacto que crees que tiene.

Responderemos en un plazo de 5 días hábiles.

## Buenas prácticas de operación

- Define un `SESSION_SECRET` aleatorio (`openssl rand -hex 32`) y no lo compartas ni lo subas al repositorio.
- Usa siempre HTTPS en producción. Además, la cámara no funciona sin HTTPS.
- Crea un usuario por persona; no compartan cuentas. Desactiva de inmediato las cuentas de quien deje la empresa.
- Revisa la *Bitácora de seguridad* (Usuarios) cada cierto tiempo, buscando intentos fallidos repetidos.
- Respalda la base de datos todos los días y guarda copias fuera del servidor.
- Aplica las actualizaciones de dependencias que propone Dependabot después de que pase la CI.
