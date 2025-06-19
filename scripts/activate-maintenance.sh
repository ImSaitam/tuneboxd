#!/bin/bash

# Script para activar el modo mantenimiento en TuneBoxd

echo "🛠️ Activando modo mantenimiento..."

# Crear archivo .env.maintenance con la variable
echo "MAINTENANCE_MODE=true" > .env.maintenance

# Actualizar .env.local para incluir el modo mantenimiento
if grep -q "MAINTENANCE_MODE" .env.local; then
    # Si ya existe, actualizarla
    sed -i 's/MAINTENANCE_MODE=.*/MAINTENANCE_MODE=true/' .env.local
else
    # Si no existe, agregarla
    echo "" >> .env.local
    echo "# Modo mantenimiento" >> .env.local
    echo "MAINTENANCE_MODE=true" >> .env.local
fi

echo "✅ Modo mantenimiento activado!"
echo ""
echo "📝 Para aplicar los cambios:"
echo "   1. Ejecuta: npm run build"
echo "   2. Ejecuta: npx vercel --prod"
echo ""
echo "🔄 Para desactivar el mantenimiento:"
echo "   ./restore-site.sh"
