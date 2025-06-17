#!/bin/bash

echo "🔄 MIGRANDO IMPORTACIONES DE DATABASE.JS A DATABASE-ADAPTER.JS"
echo "=============================================================="

# Crear backup
echo "📦 Creando backup..."
cp -r src/app/api src/app/api-backup-$(date +%Y%m%d-%H%M%S)

# Función para migrar un archivo
migrate_file() {
    local file="$1"
    echo "🔧 Migrando: $file"
    
    # Reemplazar importaciones
    sed -i 's|lib/database\.js|lib/database-adapter.js|g' "$file"
    sed -i 's|../../../lib/database\.js|../../../lib/database-adapter.js|g' "$file"
    sed -i 's|../../../../lib/database\.js|../../../../lib/database-adapter.js|g' "$file"
    sed -i 's|../../../../../lib/database\.js|../../../../../lib/database-adapter.js|g' "$file"
    sed -i 's|../../../../../../lib/database\.js|../../../../../../lib/database-adapter.js|g' "$file"
    
    # Actualizar importaciones específicas
    sed -i 's|import db,|import dbAdapter,|g' "$file"
    sed -i 's|import { \([^}]*\) } from.*database-adapter\.js|import { query, get, run } from "./database-adapter.js"|g' "$file"
    
    # Reemplazar llamadas a funciones
    sed -i 's|db\.get|get|g' "$file"
    sed -i 's|db\.all|query|g' "$file"
    sed -i 's|db\.run|run|g' "$file"
    sed -i 's|getAsync|get|g' "$file"
    sed -i 's|allAsync|query|g' "$file"
    sed -i 's|runAsync|run|g' "$file"
}

# Migrar todos los archivos de API
find src/app/api -name "*.js" -type f | while read file; do
    if grep -q "lib/database\.js" "$file"; then
        migrate_file "$file"
    fi
done

echo "✅ Migración completada"
echo "📁 Backup creado en: src/app/api-backup-$(date +%Y%m%d-%H%M%S)"
echo ""
echo "⚠️  IMPORTANTE: Algunos archivos pueden necesitar ajustes manuales"
echo "   Revisa los servicios que usan funciones específicas de SQLite"
