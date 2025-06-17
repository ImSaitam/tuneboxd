#!/bin/bash

# 🚀 Script de Despliegue Final - TuneBoxd
# Despliegue automatizado a Vercel con todas las verificaciones

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}🚀 TUNEBOXD - DESPLIEGUE A PRODUCCIÓN 🚀${NC}"
echo "=============================================="
echo ""

# Función para mostrar paso
show_step() {
    echo -e "${CYAN}📋 PASO $1: $2${NC}"
    echo ""
}

# Función para éxito
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para advertencia
show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Función para error
show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para información
show_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    show_error "No se encontró package.json. Ejecutar desde el directorio del proyecto."
    exit 1
fi

show_step "1" "VERIFICACIONES PRE-DESPLIEGUE"

# Verificar dependencias
if ! command -v npm &> /dev/null; then
    show_error "npm no está instalado"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    show_error "npx no está instalado"
    exit 1
fi

show_success "Dependencias verificadas"

# Verificar archivos de configuración
if [ ! -f "vercel.json" ]; then
    show_error "vercel.json no encontrado"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    show_warning ".env.production no encontrado"
else
    show_success "Configuración de producción encontrada"
fi

show_step "2" "BUILD Y TESTING"

# Instalar dependencias
show_info "Instalando dependencias..."
npm ci

# Build del proyecto
show_info "Compilando proyecto..."
npm run build

if [ $? -ne 0 ]; then
    show_error "Build falló. Revisar errores y reintentar."
    exit 1
fi

show_success "Build completado exitosamente"

show_step "3" "CONFIGURACIÓN DE VARIABLES DE ENTORNO"

echo "Las siguientes variables deben estar configuradas en Vercel:"
echo ""
echo "🔐 AUTENTICACIÓN:"
echo "- JWT_SECRET"
echo "- SESSION_SECRET"
echo "- ENCRYPTION_KEY"
echo ""
echo "📧 EMAIL (RESEND):"
echo "- RESEND_API_KEY"
echo "- FROM_EMAIL=TuneBoxd <noreply@tuneboxd.xyz>"
echo "- VERIFIED_DOMAIN=tuneboxd.xyz"
echo ""
echo "🗄️  BASE DE DATOS:"
echo "- DATABASE_URL (PostgreSQL)"
echo ""
echo "🎵 SPOTIFY:"
echo "- SPOTIFY_CLIENT_ID"
echo "- SPOTIFY_CLIENT_SECRET"
echo ""
echo "🌐 APLICACIÓN:"
echo "- NEXT_PUBLIC_APP_URL=https://tuneboxd.xyz"
echo "- NODE_ENV=production"
echo ""

read -p "¿Has configurado todas las variables de entorno en Vercel? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    show_warning "Configura las variables de entorno antes de continuar"
    show_info "Ir a: https://vercel.com/dashboard -> Tu proyecto -> Settings -> Environment Variables"
    exit 1
fi

show_step "4" "CONFIGURACIÓN DE BASE DE DATOS"

echo "Opciones de base de datos:"
echo "1. Neon (Recomendado) - https://neon.tech"
echo "2. Supabase - https://supabase.com"  
echo "3. Vercel Postgres - npx vercel postgres create"
echo ""

read -p "¿Has configurado la base de datos PostgreSQL? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    show_warning "Configura la base de datos PostgreSQL antes de continuar"
    exit 1
fi

show_step "5" "VERIFICACIÓN DE DOMINIO"

show_info "Verificando dominio tuneboxd.xyz..."
if ping -c 1 tuneboxd.xyz &> /dev/null; then
    show_success "Dominio tuneboxd.xyz responde"
else
    show_info "Dominio aún no configurado (normal si es el primer despliegue)"
fi

show_step "6" "DESPLIEGUE A VERCEL"

show_info "Iniciando despliegue a Vercel..."
echo ""

# Verificar si ya está logueado
if npx vercel whoami &> /dev/null; then
    show_success "Ya estás logueado en Vercel"
else
    show_info "Necesitas hacer login en Vercel"
    npx vercel login
    
    if [ $? -ne 0 ]; then
        show_error "Login falló"
        exit 1
    fi
fi

# Desplegar
show_info "Desplegando a producción..."
npx vercel --prod

if [ $? -ne 0 ]; then
    show_error "Despliegue falló"
    exit 1
fi

show_step "7" "CONFIGURACIÓN POST-DESPLIEGUE"

echo "Configuraciones adicionales requeridas:"
echo ""
echo "🌐 DOMINIO PERSONALIZADO:"
echo "1. Ir a Vercel Dashboard -> Settings -> Domains"
echo "2. Añadir tuneboxd.xyz"
echo "3. Configurar DNS según las instrucciones"
echo ""
echo "🔄 MIGRACIÓN DE BASE DE DATOS:"
echo "Ejecutar: node scripts/migrate-to-postgres.js"
echo ""

show_step "8" "VERIFICACIONES POST-DESPLIEGUE"

echo "Verificar los siguientes endpoints:"
echo ""
echo "✅ Endpoints a verificar:"
echo "- https://tuneboxd.xyz"
echo "- https://tuneboxd.xyz/api/auth/register"
echo "- https://tuneboxd.xyz/api/auth/login"
echo "- https://tuneboxd.xyz/api/spotify/search"
echo ""

show_success "¡DESPLIEGUE COMPLETADO!"
echo ""
echo -e "${PURPLE}🎉 TuneBoxd está ahora en producción! 🎉${NC}"
echo ""
echo "📊 Próximos pasos:"
echo "1. Configurar dominio personalizado"
echo "2. Migrar base de datos"
echo "3. Verificar funcionalidades"
echo "4. Configurar monitoreo"
echo ""
echo "🔗 Enlaces útiles:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Tu aplicación: https://tuneboxd.xyz"
echo "- Logs: npx vercel logs --follow"
echo ""
echo -e "${GREEN}¡Felicitaciones! 🚀${NC}"
