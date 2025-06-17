#!/bin/bash
# Script para corregir useSearchParams con Suspense

echo "🔧 Buscando archivos que usan useSearchParams..."

# Encontrar archivos que usan useSearchParams
files=$(grep -r "useSearchParams" src/app --include="*.js" -l)

echo "📁 Archivos encontrados:"
echo "$files"

# Función para corregir cada archivo
fix_search_params() {
    local file="$1"
    
    echo "🔧 Corrigiendo $file..."
    
    # Verificar si ya tiene Suspense
    if grep -q "Suspense" "$file"; then
        echo "  ✅ Ya tiene Suspense configurado"
        return
    fi
    
    # Backup del archivo
    cp "$file" "$file.bak"
    
    # Crear archivo temporal con las correcciones
    cat > "$file.tmp" << 'EOF'
'use client';

import { Suspense } from 'react';
EOF
    
    # Agregar las importaciones existentes (omitiendo la primera línea 'use client')
    tail -n +2 "$file" | head -n 20 | grep "^import" >> "$file.tmp"
    
    # Agregar el resto del archivo hasta export default
    echo "" >> "$file.tmp"
    echo "function PageContent() {" >> "$file.tmp"
    
    # Extraer el contenido de la función original
    sed -n '/export default function/,/^}$/p' "$file" | \
    sed '1d;$d' | \
    sed 's/^/  /' >> "$file.tmp"
    
    echo "}" >> "$file.tmp"
    echo "" >> "$file.tmp"
    echo "export default function Page() {" >> "$file.tmp"
    echo "  return (" >> "$file.tmp"
    echo "    <Suspense fallback={" >> "$file.tmp"
    echo "      <div className=\"min-h-screen flex items-center justify-center\">" >> "$file.tmp"
    echo "        <div className=\"text-white\">Cargando...</div>" >> "$file.tmp"
    echo "      </div>" >> "$file.tmp"
    echo "    }>" >> "$file.tmp"
    echo "      <PageContent />" >> "$file.tmp"
    echo "    </Suspense>" >> "$file.tmp"
    echo "  );" >> "$file.tmp"
    echo "}" >> "$file.tmp"
    
    # Reemplazar archivo original
    mv "$file.tmp" "$file"
    
    echo "  ✅ Corregido"
}

# Aplicar correcciones manualmente para archivos conocidos
echo "🔧 Aplicando correcciones manuales..."

# reset-password
if [ -f "src/app/reset-password/page.js" ]; then
    echo "🔧 Corrigiendo reset-password/page.js..."
    fix_search_params "src/app/reset-password/page.js"
fi

echo "✅ Correcciones completadas"
echo "🚀 Probando build..."
npm run build
