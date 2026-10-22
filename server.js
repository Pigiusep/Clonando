const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const { abrirDb } = require('./src/db');
const { crearApp } = require('./src/app');

const app = crearApp(abrirDb());
const puerto = Number(process.env.PORT) || 3000;

// La cámara del navegador solo funciona en HTTPS (o en localhost).
// Para usarla desde celulares en la red local, define SSL_KEY y SSL_CERT.
if (process.env.SSL_KEY && process.env.SSL_CERT) {
  const opciones = { key: fs.readFileSync(process.env.SSL_KEY), cert: fs.readFileSync(process.env.SSL_CERT) };
  https.createServer(opciones, app).listen(puerto, () => console.log(`Inventario OV Corp en https://localhost:${puerto}`));
} else {
  http.createServer(app).listen(puerto, () => console.log(`Inventario OV Corp en http://localhost:${puerto}`));
}
