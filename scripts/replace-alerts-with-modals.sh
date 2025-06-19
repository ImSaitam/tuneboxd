#!/bin/bash

echo "🔄 Reemplazando alerts con modales elegantes..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para agregar import del modal si no existe
add_modal_import() {
    local file="$1"
    
    if ! grep -q "useGlobalModal" "$file"; then
        echo -e "${BLUE}Agregando import del modal a: $file${NC}"
        
        # Buscar la línea que contiene los imports de hooks
        if grep -q "import.*useAuth" "$file"; then
            # Agregar después del import de useAuth
            sed -i "/import.*useAuth/a import { useGlobalModal } from '@/components/ModalContext';" "$file"
        elif grep -q "import.*useState" "$file"; then
            # Agregar después de React imports
            sed -i "/import.*useState/a import { useGlobalModal } from '@/components/ModalContext';" "$file"
        else
            # Agregar al principio después de 'use client'
            sed -i "/'use client';/a import { useGlobalModal } from '@/components/ModalContext';" "$file"
        fi
    fi
}

# Función para agregar el hook en el componente
add_modal_hook() {
    local file="$1"
    local component_line=$(grep -n "export default function\|const.*=" "$file" | head -1 | cut -d: -f1)
    
    if [ -n "$component_line" ]; then
        # Buscar donde está useAuth para agregar useGlobalModal cerca
        if grep -q "useAuth" "$file" && ! grep -q "useGlobalModal" "$file"; then
            echo -e "${BLUE}Agregando hook del modal a: $file${NC}"
            sed -i "/const.*useAuth/a \ \ const { alert, confirm, success, error: showError } = useGlobalModal();" "$file"
        fi
    fi
}

# Lista de archivos con alerts
ALERT_FILES=(
    "src/app/lists/[listId]/page.js"
    "src/app/lists/[listId]/page_with_likes_comments.js"
    "src/app/album/page.js"
    "src/app/lists/page.js"
    "src/app/profile/[username]/page.js"
)

echo -e "${YELLOW}Procesando archivos con alerts...${NC}"

for file in "${ALERT_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${BLUE}Procesando: $file${NC}"
        
        # Crear backup
        cp "$file" "${file}.alert_backup"
        
        # Agregar imports necesarios
        add_modal_import "$file"
        add_modal_hook "$file"
        
        # Reemplazar alerts específicos
        sed -i \
            -e "s/alert('Debes iniciar sesión para dar like');/alert('Debes iniciar sesión para dar like');/g" \
            -e "s/alert('Debes iniciar sesión para comentar');/alert('Debes iniciar sesión para comentar');/g" \
            -e "s/alert('Error al procesar like');/showError('Error al procesar like');/g" \
            -e "s/alert('Error al enviar comentario');/showError('Error al enviar comentario');/g" \
            -e "s/alert('Error al eliminar comentario');/showError('Error al eliminar comentario');/g" \
            -e "s/alert(data\.message);/if (data.message.includes('Error')) { showError(data.message); } else { alert(data.message); }/g" \
            -e "s/alert('Error: álbum no encontrado');/showError('Error: álbum no encontrado');/g" \
            -e "s/alert('Error al crear la reseña');/showError('Error al crear la reseña');/g" \
            -e "s/alert('Debes iniciar sesión para usar la lista de escucha');/alert('Debes iniciar sesión para usar la lista de escucha');/g" \
            "$file"
        
        echo -e "${GREEN}✅ $file procesado${NC}"
    else
        echo -e "${RED}❌ Archivo no encontrado: $file${NC}"
    fi
done

echo -e "${GREEN}🎉 Reemplazo de alerts completado!${NC}"
echo -e "${YELLOW}📄 Se crearon archivos .alert_backup como respaldo${NC}"

# Mostrar resumen
REMAINING_ALERTS=$(grep -r "alert(" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo -e "${BLUE}📊 Alerts restantes: $REMAINING_ALERTS${NC}"
