#!/bin/bash

# Auditoría Completa de Seguridad - TuneBoxd
# Verificación exhaustiva antes del despliegue en producción

# No usar set -e para que el script complete toda la auditoría

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Contadores
CRITICAL_ISSUES=0
WARNING_ISSUES=0
INFO_ISSUES=0

log_critical() {
    echo -e "${RED}🚨 CRÍTICO: $1${NC}"
    ((CRITICAL_ISSUES++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  ADVERTENCIA: $1${NC}"
    ((WARNING_ISSUES++))
}

log_info() {
    echo -e "${BLUE}ℹ️  INFO: $1${NC}"
    ((INFO_ISSUES++))
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_header() {
    echo -e "\n${PURPLE}=== $1 ===${NC}"
}

echo -e "${PURPLE}🔒 AUDITORÍA COMPLETA DE SEGURIDAD - TUNEBOXD 🔒${NC}"
echo "Fecha: $(date)"
echo "======================================================="

# 1. VERIFICACIÓN DE ARCHIVOS SENSIBLES
log_header "1. ARCHIVOS SENSIBLES Y CONFIGURACIÓN"

# Verificar que archivos sensibles no estén en el repositorio
if [ -f ".env" ]; then
    log_critical "Archivo .env encontrado en el repositorio"
fi

if [ -f ".env.local" ]; then
    if grep -q "\.env\.local" .gitignore; then
        log_success ".env.local excluido correctamente en .gitignore"
    else
        log_critical ".env.local NO está en .gitignore - RIESGO DE EXPOSICIÓN"
    fi
fi

# Verificar archivos de base de datos
if ls *.db 1> /dev/null 2>&1; then
    if grep -q "\.db" .gitignore; then
        log_success "Archivos de base de datos excluidos en .gitignore"
    else
        log_warning "Archivos .db encontrados pero no excluidos en .gitignore"
    fi
fi

# 2. ANÁLISIS DE CÓDIGO - VULNERABILIDADES COMUNES
log_header "2. ANÁLISIS DE VULNERABILIDADES EN CÓDIGO"

# Buscar secrets hardcodeados (mejorado para evitar falsos positivos)
echo "Buscando secretos hardcodeados..."

# Buscar patrones específicos de secrets hardcodeados
HARDCODED_SECRETS=$(grep -r "password\s*=\s*['\"][^'\"]*['\"]" src/ --include="*.js" --include="*.jsx" | grep -v "password_hash" | grep -v "reset_password" | grep -v "formData.password" | grep -v "req.body.password" | grep -v "user.password" | head -5)
if [ -n "$HARDCODED_SECRETS" ]; then
    log_critical "Posibles contraseñas hardcodeadas encontradas"
fi

API_KEYS=$(grep -r "api_key\s*=\s*['\"][^'\"]*['\"]" src/ --include="*.js" --include="*.jsx" | grep -v "process.env" | head -5)
if [ -n "$API_KEYS" ]; then
    log_critical "Posibles API keys hardcodeadas encontradas"
fi

SECRETS=$(grep -r "secret\s*=\s*['\"][^'\"]*['\"]" src/ --include="*.js" --include="*.jsx" | grep -v "process.env" | head -5)
if [ -n "$SECRETS" ]; then
    log_critical "Posibles secretos hardcodeados encontrados"
fi

# Buscar console.log en producción
echo "Verificando console.log en producción..."
CONSOLE_COUNT=$(grep -r "console\.log" src/ --include="*.js" --include="*.jsx" | wc -l)
if [ "$CONSOLE_COUNT" -gt 0 ]; then
    log_warning "$CONSOLE_COUNT console.log encontrados - pueden exponer información sensible"
fi

# Buscar eval() - muy peligroso
if grep -r "eval(" src/ --include="*.js" --include="*.jsx"; then
    log_critical "Uso de eval() encontrado - VULNERABILIDAD CRÍTICA"
fi

# 3. VERIFICACIÓN DE AUTENTICACIÓN Y AUTORIZACIÓN
log_header "3. AUTENTICACIÓN Y AUTORIZACIÓN"

# Verificar middleware de autenticación
if [ -f "middleware.js" ]; then
    log_success "Middleware de autenticación existe"
    
    # Verificar rate limiting
    if grep -q "ratelimit\|rate-limit" middleware.js; then
        log_success "Rate limiting configurado"
    else
        log_warning "Rate limiting no encontrado en middleware"
    fi
    
    # Verificar headers de seguridad
    if grep -q "X-Frame-Options\|Content-Security-Policy" middleware.js; then
        log_success "Headers de seguridad configurados"
    else
        log_warning "Headers de seguridad no encontrados"
    fi
else
    log_critical "middleware.js no encontrado"
fi

# 4. VERIFICACIÓN DE DEPENDENCIAS
log_header "4. ANÁLISIS DE DEPENDENCIAS"

if [ -f "package.json" ]; then
    # Verificar dependencias de seguridad críticas
    if grep -q "bcryptjs\|bcrypt" package.json; then
        log_success "Biblioteca de hashing seguro (bcrypt) instalada"
    else
        log_critical "No se encontró biblioteca de hashing seguro"
    fi
    
    if grep -q "jsonwebtoken" package.json; then
        log_success "JWT library instalada"
    else
        log_critical "JWT library no encontrada"
    fi
    
    # Verificar dependencias obsoletas o vulnerables conocidas
    if command -v npm &> /dev/null; then
        echo "Ejecutando npm audit..."
        npm audit --audit-level=high 2>/dev/null || log_warning "npm audit reportó vulnerabilidades"
    fi
fi

# 5. VERIFICACIÓN DE APIs
log_header "5. SEGURIDAD DE APIs"

# Verificar protección CSRF
if grep -r "csrf" src/ --include="*.js" --include="*.jsx"; then
    log_success "Protección CSRF implementada"
else
    log_warning "Protección CSRF no encontrada"
fi

# Verificar validación de entrada
if grep -r "sanitize\|validate" src/ --include="*.js" --include="*.jsx"; then
    log_success "Validación/sanitización de entrada encontrada"
else
    log_warning "Validación de entrada no evidente"
fi

# Verificar manejo de errores seguro
api_files=$(find src/app/api -name "*.js" 2>/dev/null || echo "")
if [ -n "$api_files" ]; then
    for file in $api_files; do
        if ! grep -q "try.*catch\|\.catch(" "$file"; then
            log_warning "Archivo API sin manejo de errores: $file"
        fi
    done
fi

# 6. CONFIGURACIÓN DE PRODUCCIÓN
log_header "6. CONFIGURACIÓN DE PRODUCCIÓN"

# Verificar configuración de Next.js
if [ -f "next.config.mjs" ]; then
    log_success "next.config.mjs existe"
    
    if grep -q "experimental" next.config.mjs; then
        log_warning "Configuraciones experimentales en producción"
    fi
else
    log_info "next.config.mjs no encontrado (opcional)"
fi

# Verificar configuración de Vercel
if [ -f "vercel.json" ]; then
    log_success "vercel.json configurado"
    
    if grep -q "maxDuration" vercel.json; then
        log_success "Timeouts configurados"
    fi
    
    if grep -q "headers" vercel.json; then
        log_success "Headers de seguridad en vercel.json"
    fi
fi

# 7. VERIFICACIÓN DE BASE DE DATOS
log_header "7. SEGURIDAD DE BASE DE DATOS"

# Verificar que no se use SQLite en producción
if [ -f ".env.production" ]; then
    if grep -q "sqlite\|\.db" .env.production; then
        log_critical "SQLite configurado para producción - usar PostgreSQL"
    else
        log_success "Base de datos de producción correcta"
    fi
fi

# Verificar preparación de queries (buscar concatenación de SQL)
if grep -r "SELECT.*+\|INSERT.*+" src/ --include="*.js" --include="*.jsx"; then
    log_critical "Posible inyección SQL - usar prepared statements"
fi

# 8. VERIFICACIÓN DE ARCHIVOS ESTÁTICOS
log_header "8. ARCHIVOS ESTÁTICOS Y PÚBLICO"

if [ -d "public" ]; then
    # Verificar que no hay archivos sensibles en público
    if find public -name "*.env*" -o -name "*.key*" -o -name "*.pem*" | grep -q .; then
        log_critical "Archivos sensibles en directorio público"
    fi
    
    # Verificar tamaño de archivos públicos
    large_files=$(find public -size +5M 2>/dev/null || echo "")
    if [ -n "$large_files" ]; then
        log_warning "Archivos grandes en public/: $large_files"
    fi
fi

# 9. VERIFICACIÓN DE HEADERS DE SEGURIDAD
log_header "9. HEADERS DE SEGURIDAD"

security_headers=(
    "X-Frame-Options"
    "X-Content-Type-Options"
    "Referrer-Policy"
    "X-XSS-Protection"
    "Content-Security-Policy"
)

if [ -f "vercel.json" ]; then
    for header in "${security_headers[@]}"; do
        if grep -q "$header" vercel.json; then
            log_success "$header configurado"
        else
            log_warning "$header no configurado"
        fi
    done
fi

# 10. RESUMEN Y RECOMENDACIONES
log_header "10. RESUMEN DE AUDITORÍA"

echo ""
echo "📊 RESULTADOS:"
echo "🚨 Problemas críticos: $CRITICAL_ISSUES"
echo "⚠️  Advertencias: $WARNING_ISSUES"
echo "ℹ️  Información: $INFO_ISSUES"
echo ""

if [ $CRITICAL_ISSUES -gt 0 ]; then
    echo -e "${RED}❌ NO PROCEDER CON EL DESPLIEGUE${NC}"
    echo "Resolver problemas críticos antes de continuar."
    echo ""
    echo "🚨 PROBLEMAS CRÍTICOS ENCONTRADOS: $CRITICAL_ISSUES"
    exit 1
elif [ $WARNING_ISSUES -gt 10 ]; then
    echo -e "${YELLOW}⚠️  DESPLIEGUE CON PRECAUCIÓN${NC}"
    echo "Muchas advertencias encontradas. Revisar antes del despliegue."
    echo "Ejecute: ./scripts/clean-console-logs.sh para limpiar console.log"
else
    echo -e "${GREEN}✅ LISTO PARA DESPLIEGUE${NC}"
    echo "La aplicación cumple con los estándares básicos de seguridad."
fi

echo ""
echo "🔐 RECOMENDACIONES PARA PRODUCCIÓN:"
echo "1. Configurar PostgreSQL con SSL"
echo "2. Implementar Content Security Policy estricta"
echo "3. Configurar monitoreo de logs de seguridad"
echo "4. Implementar rate limiting agresivo"
echo "5. Configurar backups automáticos"
echo "6. Implementar alertas de seguridad"
echo "7. Revisar dependencias regularmente"
echo "8. Configurar HTTPS/TLS estricto"
echo ""

echo "🚀 Próximo paso: Configurar variables de entorno en Vercel"
