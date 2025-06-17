#!/bin/bash

echo "🔍 VERIFICADOR DE PREPARACIÓN PARA PRODUCCIÓN - TuneBoxd"
echo "========================================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json. Ejecuta este script desde la carpeta del proyecto."
    exit 1
fi

echo "📁 Verificando estructura del proyecto..."

# Verificar archivos críticos
files_to_check=(
    "package.json"
    "vercel.json" 
    "database-schema.sql"
    ".env.example"
    "src/lib/database-adapter.js"
    "src/lib/database-postgres.js"
)

missing_files=()
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTANTE"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo ""
    echo "❌ Faltan archivos críticos. El proyecto no está listo para producción."
    exit 1
fi

echo ""
echo "📦 Verificando dependencias..."

# Verificar que pg esté instalado
if npm list pg > /dev/null 2>&1; then
    echo "✅ PostgreSQL driver (pg) instalado"
else
    echo "❌ PostgreSQL driver (pg) NO instalado"
    echo "   Ejecuta: npm install pg"
    exit 1
fi

# Verificar que vercel esté instalado
if npm list vercel > /dev/null 2>&1; then
    echo "✅ Vercel CLI instalado"
else
    echo "❌ Vercel CLI NO instalado"
    echo "   Ejecuta: npm install vercel --save-dev"
    exit 1
fi

echo ""
echo "🔧 Verificando configuración..."

# Verificar que vercel.json tenga la configuración correcta
if grep -q "nextjs" vercel.json; then
    echo "✅ vercel.json configurado para Next.js"
else
    echo "❌ vercel.json mal configurado"
    exit 1
fi

# Verificar que package.json tenga los scripts necesarios
if grep -q '"vercel"' package.json; then
    echo "✅ Scripts de Vercel en package.json"
else
    echo "❌ Scripts de Vercel faltantes en package.json"
    exit 1
fi

echo ""
echo "🗄️ Verificando base de datos..."

# Verificar que database-schema.sql tenga las tablas principales
required_tables=("users" "reviews" "artists" "albums" "user_follows")
for table in "${required_tables[@]}"; do
    if grep -q "CREATE TABLE.*$table" database-schema.sql; then
        echo "✅ Tabla $table definida"
    else
        echo "❌ Tabla $table NO definida en schema"
        exit 1
    fi
done

echo ""
echo "🔒 Verificando seguridad..."

# Verificar que .env no esté en el repo
if [ -f ".env" ]; then
    echo "⚠️  ADVERTENCIA: Archivo .env encontrado. Asegúrate de que NO esté en Git."
    echo "   Ejecuta: git rm --cached .env"
else
    echo "✅ No hay archivo .env en el repositorio"
fi

# Verificar que .env.example exista
if [ -f ".env.example" ]; then
    echo "✅ .env.example presente para referencia"
else
    echo "❌ .env.example faltante"
    exit 1
fi

echo ""
echo "🚀 Verificando preparación para build..."

# Intentar hacer build localmente
echo "🔨 Intentando build local..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build local exitoso"
else
    echo "❌ Build local falló"
    echo "   Ejecuta: npm run build"
    echo "   Y revisa los errores antes de desplegar"
    exit 1
fi

echo ""
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "========================="
echo "✅ Estructura del proyecto: CORRECTA"
echo "✅ Dependencias: INSTALADAS"
echo "✅ Configuración: LISTA"
echo "✅ Base de datos: SCHEMA PREPARADO"
echo "✅ Seguridad: VERIFICADA"
echo "✅ Build: FUNCIONAL"
echo ""
echo "🎉 ¡EL PROYECTO ESTÁ LISTO PARA PRODUCCIÓN!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Crear base de datos en Supabase (https://supabase.com)"
echo "2. Ejecutar database-schema.sql en Supabase"
echo "3. Obtener credenciales de Spotify API"
echo "4. Subir código a GitHub"
echo "5. Importar proyecto en Vercel"
echo "6. Configurar variables de entorno en Vercel"
echo "7. Configurar dominio personalizado"
echo ""
echo "📖 Consulta GUIA-DESPLIEGUE-VERCEL.md para instrucciones detalladas"
