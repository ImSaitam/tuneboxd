#!/bin/bash

# Script para probar y debuggear el Service Worker
# TuneBoxd - Service Worker Debug

echo "🔧 TuneBoxd Service Worker Debug"
echo "================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar archivos del Service Worker
echo "🔍 Verificando archivos del Service Worker..."

if [ -f "public/sw.js" ]; then
    success "✅ Service Worker encontrado: public/sw.js"
    
    # Verificar versión
    version=$(grep -o "tuneboxd-v[0-9]*" public/sw.js | head -1)
    if [ ! -z "$version" ]; then
        success "✅ Versión detectada: $version"
    else
        warning "⚠️  No se pudo detectar la versión"
    fi
    
    # Verificar sintaxis básica
    if node -c public/sw.js 2>/dev/null; then
        success "✅ Sintaxis JavaScript válida"
    else
        error "❌ Error de sintaxis en sw.js"
        node -c public/sw.js
    fi
else
    error "❌ Service Worker no encontrado en public/sw.js"
    exit 1
fi

# Verificar componente de registro
if [ -f "src/components/ServiceWorkerRegistration.js" ]; then
    success "✅ Componente de registro encontrado"
else
    warning "⚠️  Componente de registro no encontrado"
fi

# Verificar que esté registrado en layout
if grep -q "ServiceWorkerRegistration" "src/app/layout.js"; then
    success "✅ Service Worker registrado en layout.js"
else
    warning "⚠️  Service Worker no registrado en layout.js"
fi

echo -e "\n📋 URLs configuradas para caché:"
grep -A 10 "urlsToCache = \[" public/sw.js | grep -E "^\s*['\"]" | while read line; do
    url=$(echo "$line" | sed -E "s/.*['\"]([^'\"]*)['\"].*/\1/")
    echo "  • $url"
done

echo -e "\n🔧 Pasos para debugging:"
echo "1. Abrir DevTools → Application → Service Workers"
echo "2. Verificar que el SW esté 'activated and running'"
echo "3. En Console, buscar mensajes que empiecen con 'SW:'"
echo "4. En Network, verificar si las requests muestran 'ServiceWorker'"
echo "5. Para forzar actualización: Unregister + Hard Reload"

echo -e "\n📝 Comandos útiles para debugging:"
echo "• Limpiar cache: localStorage.clear()"
echo "• Ver caches: caches.keys().then(console.log)"
echo "• Forzar actualización: location.reload(true)"

echo -e "\n🚀 Para probar en desarrollo:"
echo "• npm run dev"
echo "• Abrir http://localhost:3000"
echo "• F12 → Application → Service Workers"

echo -e "\n${GREEN}✅ Debug del Service Worker completado${NC}"
