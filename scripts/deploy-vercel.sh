#!/bin/bash

# Script de despliegue automático para Vercel
# TuneBoxd - Producción

set -e  # Salir si hay errores

echo "🚀 Iniciando despliegue de TuneBoxd en Vercel..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# 1. Verificar dependencias
log_info "Verificando dependencias..."
if ! command -v npx &> /dev/null; then
    log_error "npm/npx no está instalado"
    exit 1
fi

# 2. Instalar dependencias
log_info "Instalando dependencias..."
npm ci

# 3. Verificar build local
log_info "Verificando que el proyecto compile correctamente..."
npm run build

if [ $? -ne 0 ]; then
    log_error "El build falló. Corrije los errores antes de continuar."
    exit 1
fi

log_success "Build local exitoso"

# 4. Verificar configuración de Vercel
log_info "Verificando configuración de Vercel..."

if [ ! -f "vercel.json" ]; then
    log_error "No se encontró vercel.json"
    exit 1
fi

# 5. Verificar archivos de configuración
log_info "Verificando archivos de configuración..."

# Verificar que .env.production existe
if [ ! -f ".env.production" ]; then
    log_warning ".env.production no encontrado"
else
    log_success ".env.production encontrado"
fi

# Verificar que .gitignore está correctamente configurado
if grep -q "\.env\.local" .gitignore; then
    log_success ".gitignore configurado correctamente"
else
    log_warning "Actualiza .gitignore para excluir archivos sensibles"
fi

# 6. Pre-deploy checks
log_info "Ejecutando verificaciones pre-despliegue..."

# Ejecutar tests si existen
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    log_info "Ejecutando tests..."
    npm test
fi

# 7. Información sobre variables de entorno
log_warning "IMPORTANTE: Configurar variables de entorno en Vercel Dashboard"
echo ""
echo "Variables requeridas en Vercel:"
echo "- DATABASE_URL (PostgreSQL)"
echo "- JWT_SECRET"
echo "- RESEND_API_KEY"
echo "- SPOTIFY_CLIENT_ID"
echo "- SPOTIFY_CLIENT_SECRET"
echo "- SESSION_SECRET"
echo "- ENCRYPTION_KEY"
echo "- NEXT_PUBLIC_APP_URL=https://tuneboxd.xyz"
echo ""

# 8. Guía de despliegue manual
log_info "Pasos para completar el despliegue:"
echo ""
echo "1. Ir a https://vercel.com y crear cuenta/login"
echo "2. Conectar tu repositorio de GitHub"
echo "3. Configurar variables de entorno en Settings > Environment Variables"
echo "4. Configurar dominio personalizado en Settings > Domains"
echo "5. Configurar base de datos PostgreSQL (Neon recomendado)"
echo ""

# 9. Comando de despliegue
log_info "Comando para desplegar (después de login en Vercel):"
echo "npx vercel --prod"
echo ""

# 10. Verificaciones finales
log_info "Verificaciones finales..."

# Verificar que no hay archivos sensibles que podrían subirse
if [ -f ".env.local" ]; then
    if ! grep -q "\.env\.local" .gitignore; then
        log_error ".env.local no está en .gitignore. Esto podría exponer secretos."
        exit 1
    fi
fi

log_success "Verificaciones completadas"

echo ""
log_success "🎉 Proyecto listo para despliegue en Vercel!"
echo ""
log_info "Próximos pasos:"
echo "1. Configurar base de datos PostgreSQL"
echo "2. Login en Vercel: npx vercel login"
echo "3. Desplegar: npx vercel --prod"
echo "4. Configurar dominio tuneboxd.xyz en Vercel"
echo "5. Verificar que todos los endpoints funcionen"
echo ""

# Mostrar información del proyecto
log_info "Información del proyecto:"
echo "- Nombre: TuneBoxd"
echo "- Framework: Next.js"
echo "- Dominio: tuneboxd.xyz"
echo "- Email: Resend (configurado)"
echo "- Base de datos: PostgreSQL (por configurar)"
echo ""
