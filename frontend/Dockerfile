# ==========================================
# Etapa 1: Dependencias (Dependencies)
# ==========================================
FROM node:24-alpine AS deps
RUN sed -i 's/https/http/' /etc/apk/repositories && \
    apk add --no-cache ca-certificates libc6-compat && \
    update-ca-certificates
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./
RUN npm ci

# ==========================================
# Etapa 2: Construcción (Builder)
# ==========================================
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED=1

# Construir la aplicación
RUN npm run build

# ==========================================
# Etapa 3: Ejecución (Runner)
# ==========================================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear un usuario no root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar el directorio public (estáticos)
COPY --from=builder /app/public ./public

# Configurar permisos para .next
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar la salida del build standalone y los estáticos de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario no root
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Ejecutar el servidor
CMD ["node", "server.js"]
