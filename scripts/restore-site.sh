#!/bin/bash

# Script para restaurar el sitio web

echo "🔄 Restaurando TuneBoxd..."

# Verificar si existe el backup
if [ -f "src/app/layout.js.backup" ]; then
    # Restaurar el layout original
    mv src/app/layout.js.backup src/app/layout.js
    echo "✅ Layout original restaurado"
    
    echo ""
    echo "Para desplegar el sitio restaurado, ejecuta:"
    echo "  npm run build && npx vercel --prod"
else
    echo "❌ No se encontró el archivo de backup: src/app/layout.js.backup"
    echo "El sitio podría no haberse pausado con pause-site.sh"
fi
