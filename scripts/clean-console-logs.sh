#!/bin/bash

#!/bin/bash

echo "🧹 Limpiando console.log de archivos de producción críticos..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para limpiar console.log de un archivo
clean_console_logs() {
    local file="$1"
    local backup_file="${file}.backup"
    
    if [[ -f "$file" ]]; then
        echo -e "${BLUE}Limpiando: $file${NC}"
        
        # Crear backup
        cp "$file" "$backup_file"
        
        # Remover console.log que no sean de error crítico
        # Mantener solo console.error para errores importantes
        sed -i.tmp \
            -e '/console\.log(/d' \
            -e '/console\.warn(/d' \
            -e '/console\.info(/d' \
            -e '/console\.debug(/d' \
            "$file"
        
        # Limpiar archivos temporales
        rm -f "${file}.tmp"
        
        echo -e "${GREEN}✅ Limpiado: $file${NC}"
    fi
}

# Función para limpiar console.log específicos que exponen información sensible
clean_sensitive_logs() {
    echo -e "${YELLOW}Limpiando logs que exponen información sensible...${NC}"
    
    # Buscar y remover logs que contengan emails, tokens, passwords
    find src/ -name "*.js" -type f -exec grep -l "console\.log.*@\|console\.log.*email\|console\.log.*token\|console\.log.*password" {} \; 2>/dev/null | while read file; do
        echo -e "${RED}⚠️  Archivo con logs sensibles: $file${NC}"
        
        # Crear backup
        cp "$file" "${file}.sensitive_backup" 2>/dev/null || true
        
        # Remover logs sensibles específicos
        sed -i.tmp \
            -e '/console\.log.*@/d' \
            -e '/console\.log.*email/d' \
            -e '/console\.log.*Email/d' \
            -e '/console\.log.*token/d' \
            -e '/console\.log.*Token/d' \
            -e '/console\.log.*password/d' \
            -e '/console\.log.*Password/d' \
            "$file" 2>/dev/null || true
        
        rm -f "${file}.tmp" 2>/dev/null || true
        echo -e "${GREEN}✅ Limpiados logs sensibles en: $file${NC}"
    done
}

# Ejecutar limpieza de logs sensibles
clean_sensitive_logs

echo -e "${GREEN}🎉 Limpieza de seguridad completada!${NC}"
