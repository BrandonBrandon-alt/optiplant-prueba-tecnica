#!/bin/bash

# ==============================================================================
# Zen Inventory - Docker Maintenance Script
# ==============================================================================
# Este script ayuda a mantener limpio el almacenamiento de Docker eliminando
# recursos que no se están utilizando sin comprometer el desarrollo activo.

echo "🔍 Verificando uso de disco de Docker..."
docker system df

echo ""
echo "🚀 Iniciando limpieza selectiva..."

# 1. Eliminar contenedores detenidos y redes no usadas
echo "📦 Eliminando contenedores detenidos y redes no usadas..."
docker system prune -f

# 2. Eliminar imágenes huérfanas (dangling)
# Son imágenes que se quedan sin nombre tras reconstruir (las que salen como <none>)
echo "🖼️  Eliminando imágenes huérfanas..."
docker image prune -f

# 3. Limpiar el Build Cache antiguo
# Esto libera mucho espacio si has hecho muchos builds
echo "⚡ Limpiando caché de construcción antiguo..."
docker builder prune -f --filter "until=24h"

# 4. OPCIONAL: Limpiar volúmenes huérfanos
# Descomenta la línea de abajo si quieres borrar bases de datos de contenedores que ya borraste
# docker volume prune -f

echo ""
echo "✨ ¡Limpieza completada!"
docker system df
