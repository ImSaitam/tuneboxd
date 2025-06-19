#!/bin/bash

# Script completo para restaurar sitio y desplegar

echo "🔄 RESTAURANDO SITIO Y DESPLEGANDO..."
echo "====================================="

# 1. Desactivar modo mantenimiento
echo "1️⃣ Desactivando modo mantenimiento..."
./deactivate-maintenance.sh

# 2. Limpiar caché
echo ""
echo "2️⃣ Limpiando caché..."
rm -rf .next

# 3. Compilar aplicación
echo ""
echo "3️⃣ Compilando aplicación..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en la compilación. Abortando..."
    exit 1
fi

# 4. Desplegar a producción
echo ""
echo "4️⃣ Desplegando a producción..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SITIO RESTAURADO Y DESPLEGADO!"
    echo "================================"
    echo ""
    echo "🌐 Tu sitio está de nuevo disponible normalmente"
    echo "🎵 Los usuarios pueden acceder a TuneBoxd"
    echo ""
else
    echo ""
    echo "❌ Error en el despliegue"
fi
