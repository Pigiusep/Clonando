# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS dependencias
# Herramientas para compilar better-sqlite3 si no hay binario precompilado; no pasan a la imagen final.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-bookworm-slim
ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/app/data/inventario.db
WORKDIR /app
COPY --from=dependencias /app/node_modules ./node_modules
COPY package.json server.js ./
COPY src ./src
COPY views ./views
COPY public ./public
# La app corre sin privilegios de root; solo puede escribir en /app/data.
RUN mkdir -p /app/data && chown node:node /app/data
USER node
VOLUME ["/app/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/salud').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
