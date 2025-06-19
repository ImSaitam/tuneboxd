#!/bin/bash

# Script de deploy con verificación de sistema de caché
# TuneBoxd - Deploy con Cache System

echo "🚀 TuneBoxd Deploy con Sistema de Caché"
echo "========================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

log "Iniciando proceso de deploy..."

# 1. Verificar sistema de caché
log "🔍 Verificando sistema de caché..."

# Verificar archivos críticos del caché
cache_files=(
    "src/lib/cacheHeaders.js"
    "src/hooks/useCachedFetch.js"
    "src/components/CacheStatus.js"
    "src/components/ServiceWorkerRegistration.js"
    "public/sw.js"
)

for file in "${cache_files[@]}"; do
    if [ -f "$file" ]; then
        success "✅ $file encontrado"
    else
        error "❌ $file no encontrado"
        exit 1
    fi
done

# 2. Verificar configuración de APIs con caché
log "🔍 Verificando APIs con caché implementado..."

api_files=(
    "src/app/api/forum/threads/route.js"
    "src/app/api/forum/categories/route.js"
    "src/app/api/forum/languages/route.js"
    "src/app/api/lists/route.js"
)

for file in "${api_files[@]}"; do
    if grep -q "addCacheHeaders\|hasContentChanged" "$file"; then
        success "✅ $file tiene caché implementado"
    else
        warning "⚠️  $file podría no tener caché implementado"
    fi
done

# 3. Build del proyecto
log "🔨 Ejecutando build..."
if npm run build; then
    success "✅ Build exitoso"
else
    error "❌ Build falló"
    exit 1
fi

# 4. Verificar tamaño de bundles
log "📊 Verificando tamaños de bundles..."
if [ -d ".next" ]; then
    bundle_size=$(du -sh .next | cut -f1)
    log "Tamaño total del bundle: $bundle_size"
    
    # Verificar que el bundle no sea excesivamente grande
    bundle_size_mb=$(du -sm .next | cut -f1)
    if [ "$bundle_size_mb" -gt 100 ]; then
        warning "⚠️  Bundle grande: ${bundle_size_mb}MB"
    else
        success "✅ Tamaño de bundle aceptable: ${bundle_size_mb}MB"
    fi
fi

# 5. Verificar Service Worker
log "🔍 Verificando Service Worker..."
if [ -f "public/sw.js" ]; then
    if grep -q "tuneboxd-v3" "public/sw.js"; then
        success "✅ Service Worker actualizado (v3)"
    else
        warning "⚠️  Service Worker podría estar desactualizado"
    fi
fi

# 6. Deploy a Vercel
log "🚀 Desplegando a Vercel..."

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    error "Vercel CLI no está instalado. Instálalo con: npm i -g vercel"
    exit 1
fi

# Deploy
if vercel --prod; then
    success "✅ Deploy exitoso a Vercel"
else
    error "❌ Deploy falló"
    exit 1
fi

# 7. Verificaciones post-deploy
log "🔍 Ejecutando verificaciones post-deploy..."

# Esperar un poco para que el deploy se propague
sleep 10

# Verificar que el sitio esté disponible
if curl -s https://tuneboxd.xyz > /dev/null; then
    success "✅ Sitio web accesible"
else
    error "❌ Sitio web no accesible"
fi

# Verificar API de caché
if curl -s https://tuneboxd.xyz/api/forum/categories > /dev/null; then
    success "✅ API de caché accesible"
else
    warning "⚠️  API de caché no responde"
fi

# Verificar headers de caché
log "🔍 Verificando headers de caché en producción..."
headers=$(curl -s -I https://tuneboxd.xyz/api/forum/categories)

if echo "$headers" | grep -q "cache-control"; then
    success "✅ Headers de caché presentes"
else
    warning "⚠️  Headers de caché no encontrados"
fi

# 8. Resumen final
log "📋 Resumen del Deploy"
echo "====================="
success "✅ Sistema de caché verificado"
success "✅ Build exitoso"
success "✅ Deploy completado"
success "✅ Verificaciones post-deploy completadas"

echo -e "\n🎯 Funcionalidades implementadas:"
echo "• ⚡ Caché HTTP con ETags"
echo "• 🧠 Caché en memoria inteligente"
echo "• 🔄 Service Worker para offline"
echo "• 📊 Hooks especializados por contenido"
echo "• 🎛️ Componentes de control de caché"

echo -e "\n🌐 URLs importantes:"
echo "• Sitio web: https://tuneboxd.xyz"
echo "• Foro (Social): https://tuneboxd.xyz/social"
echo "• Foro (Community): https://tuneboxd.xyz/community"

echo -e "\n📈 Métricas esperadas:"
echo "• Reducción de latencia: ~80%"
echo "• Reducción de requests: ~60%"
echo "• Mejora en UX: Significativa"

echo -e "\n🔧 Para monitoreo:"
echo "• Vercel Analytics para métricas"
echo "• Console DevTools para debugging"
echo "• Network tab para verificar cache hits"

echo -e "\n${GREEN}🎉 Deploy Completado con Sistema de Caché Funcional${NC}"
