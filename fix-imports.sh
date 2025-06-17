#!/bin/bash
# Script para corregir todas las rutas de importación de database.js

echo "🔧 Corrigiendo rutas de importación..."

# Función para corregir rutas basada en la profundidad del directorio
fix_imports() {
    local file="$1"
    local dir_path=$(dirname "$file")
    local depth=$(echo "$dir_path" | grep -o "/" | wc -l)
    
    # Calcular niveles desde src/app/api hasta src/lib
    # src/app/api = 3 niveles desde src
    # Necesitamos salir de api y llegar a lib
    local levels_up=$((depth - 2))  # -2 porque contamos desde src/app
    local relative_path=""
    
    for ((i=0; i<levels_up; i++)); do
        relative_path="../${relative_path}"
    done
    
    relative_path="${relative_path}../../lib/database.js"
    
    echo "📁 Corrigiendo $file (profundidad: $depth, ruta: $relative_path)"
    
    # Usar sed para reemplazar todas las variantes de importación
    sed -i.bak \
        -e "s|from '[^']*lib/database\.js'|from '$relative_path'|g" \
        -e "s|from \"[^\"]*lib/database\.js\"|from \"$relative_path\"|g" \
        "$file"
    
    # Remover archivo backup si la corrección fue exitosa
    if [ -f "$file.bak" ]; then
        rm "$file.bak"
    fi
}

# Encontrar y corregir todos los archivos
while IFS= read -r -d '' file; do
    if grep -q "lib/database.js" "$file"; then
        fix_imports "$file"
    fi
done < <(find src/app/api -name "*.js" -print0)

echo "✅ Corrección de importaciones completada"

# Verificar que no queden importaciones problemáticas
echo "🔍 Verificando resultados..."
problematic_files=$(find src/app/api -name "*.js" -exec grep -l "\.\./\.\./\.\./\.\./\.\./\.\./lib/database\.js\|lib/database\.js" {} \; 2>/dev/null | head -5)

if [ -n "$problematic_files" ]; then
    echo "⚠️  Archivos que aún necesitan corrección:"
    echo "$problematic_files"
else
    echo "✅ Todas las rutas de importación corregidas"
fi

echo "🚀 Probando build..."
npm run build
