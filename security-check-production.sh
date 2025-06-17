#!/bin/bash
# Script de verificación de seguridad para producción

echo "🔒 === VERIFICACIÓN DE SEGURIDAD PARA PRODUCCIÓN === 🔒"
echo ""

# Verificar variables de entorno críticas
echo "1️⃣ Verificando variables de entorno..."

# Lista de variables críticas
CRITICAL_VARS=(
    "JWT_SECRET"
    "RESEND_API_KEY" 
    "SPOTIFY_CLIENT_SECRET"
    "DATABASE_URL"
)

missing_vars=()

for var in "${CRITICAL_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        missing_vars+=("$var")
        echo "❌ $var: NO CONFIGURADA"
    else
        # Verificar longitud mínima para JWT_SECRET
        if [[ "$var" == "JWT_SECRET" && ${#!var} -lt 32 ]]; then
            echo "⚠️  $var: DEMASIADO CORTA (mínimo 32 caracteres)"
        else
            echo "✅ $var: Configurada"
        fi
    fi
done

echo ""

# Verificar archivos sensibles
echo "2️⃣ Verificando archivos sensibles..."

if [[ -f ".env.local" ]]; then
    echo "⚠️  .env.local existe - NO subir a producción"
fi

if [[ -f ".env.production" ]]; then
    echo "✅ .env.production existe"
else
    echo "❌ .env.production NO existe"
fi

# Verificar .gitignore
echo ""
echo "3️⃣ Verificando .gitignore..."

if grep -q ".env.local" .gitignore 2>/dev/null; then
    echo "✅ .env.local en .gitignore"
else
    echo "❌ .env.local NO está en .gitignore"
fi

if grep -q "users.db" .gitignore 2>/dev/null; then
    echo "✅ users.db en .gitignore"
else
    echo "❌ users.db NO está en .gitignore"
fi

# Verificar dependencias
echo ""
echo "4️⃣ Verificando dependencias de seguridad..."

if npm list bcryptjs >/dev/null 2>&1; then
    echo "✅ bcryptjs instalado"
else
    echo "❌ bcryptjs NO instalado"
fi

if npm list jsonwebtoken >/dev/null 2>&1; then
    echo "✅ jsonwebtoken instalado"
else
    echo "❌ jsonwebtoken NO instalado"
fi

# Verificar configuración Next.js
echo ""
echo "5️⃣ Verificando configuración Next.js..."

if [[ -f "next.config.mjs" ]]; then
    echo "✅ next.config.mjs existe"
    
    if grep -q "headers" next.config.mjs; then
        echo "✅ Headers de seguridad configurados"
    else
        echo "⚠️  Headers de seguridad no configurados en next.config.mjs"
    fi
else
    echo "⚠️  next.config.mjs no encontrado"
fi

# Verificar middleware
if [[ -f "middleware.js" ]]; then
    echo "✅ middleware.js existe"
else
    echo "❌ middleware.js NO existe"
fi

echo ""
echo "6️⃣ Recomendaciones de seguridad..."

echo "🔐 Base de datos:"
echo "   - Usar PostgreSQL en producción (no SQLite)"
echo "   - Configurar SSL/TLS"
echo "   - Backups automáticos"

echo ""
echo "🌐 Hosting:"
echo "   - Usar HTTPS (certificado SSL)"
echo "   - Configurar CDN"
echo "   - Rate limiting en el servidor"

echo ""
echo "🔑 Secretos:"
echo "   - Generar nuevos JWT_SECRET para producción"
echo "   - Usar variables de entorno del hosting"
echo "   - No hardcodear secretos en el código"

echo ""
echo "📊 Monitoreo:"
echo "   - Configurar logs de errores"
echo "   - Monitoreo de rendimiento"
echo "   - Alertas de seguridad"

# Resumen
echo ""
echo "📋 === RESUMEN ==="

if [[ ${#missing_vars[@]} -eq 0 ]]; then
    echo "✅ Todas las variables críticas están configuradas"
else
    echo "❌ Variables faltantes: ${missing_vars[*]}"
fi

echo ""
echo "🚀 Para desplegar:"
echo "1. Configurar base de datos PostgreSQL"
echo "2. Configurar variables de entorno en tu hosting"
echo "3. Generar nuevos secrets para producción"
echo "4. Configurar dominio y SSL"
echo "5. Hacer deploy 🎉"
