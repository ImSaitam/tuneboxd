#!/bin/bash

# Script para desactivar el modo mantenimiento en TuneBoxd

echo "🔄 Desactivando modo mantenimiento..."

# Actualizar .env.local para deshabilitar el modo mantenimiento
if grep -q "MAINTENANCE_MODE" .env.local; then
    # Cambiar a false
    sed -i 's/MAINTENANCE_MODE=.*/MAINTENANCE_MODE=false/' .env.local
else
    # Si no existe, agregarla como false
    echo "" >> .env.local
    echo "# Modo mantenimiento" >> .env.local
    echo "MAINTENANCE_MODE=false" >> .env.local
fi

# Eliminar archivo temporal si existe
rm -f .env.maintenance

echo "✅ Modo mantenimiento desactivado!"
echo ""
echo "📝 Para aplicar los cambios:"
echo "   1. Ejecuta: npm run build"
echo "   2. Ejecuta: npx vercel --prod"
echo ""
echo "🌐 El sitio volverá a estar disponible normalmente."
