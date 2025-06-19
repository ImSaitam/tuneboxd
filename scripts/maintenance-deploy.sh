#!/bin/bash

# Script completo para activar mantenimiento y desplegar

echo "🛠️ ACTIVANDO MODO MANTENIMIENTO Y DESPLEGANDO..."
echo "==============================================="

# 1. Activar modo mantenimiento
echo "1️⃣ Activando modo mantenimiento..."
./activate-maintenance.sh

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
    echo "✅ SITIO EN MODO MANTENIMIENTO DESPLEGADO!"
    echo "=========================================="
    echo ""
    echo "🌐 Tu sitio ahora muestra la página de mantenimiento"
    echo "🔄 Para restaurar: ./restore-and-deploy.sh"
    echo ""
else
    echo ""
    echo "❌ Error en el despliegue"
fi
