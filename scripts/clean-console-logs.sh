#!/bin/bash

# Script para limpiar console.log antes del despliegue
# Solo elimina console.log simples, mantiene console.error y console.warn

echo "🧹 Limpiando console.log para producción..."

# Backup de archivos originales
mkdir -p backup_console_logs

# Buscar y limpiar console.log
find src/ -name "*.js" -o -name "*.jsx" | while read file; do
    if grep -q "console\.log" "$file"; then
        echo "Limpiando: $file"
        
        # Hacer backup
        cp "$file" "backup_console_logs/$(basename "$file").backup"
        
        # Eliminar console.log pero mantener console.error y console.warn
        sed -i '/console\.log/d' "$file"
    fi
done

echo "✅ Limpieza completada"
echo "📁 Backups guardados en: backup_console_logs/"
echo ""
echo "⚠️  NOTA: Solo se eliminaron console.log"
echo "   console.error y console.warn se mantuvieron para debugging en producción"
