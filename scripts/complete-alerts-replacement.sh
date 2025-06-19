#!/bin/bash

echo "🔄 Completando el reemplazo de TODOS los alerts y confirms restantes..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para agregar imports y hooks si no existen
setup_modal_in_file() {
    local file="$1"
    
    # Crear backup
    cp "$file" "${file}.final_backup"
    
    # Agregar import si no existe
    if ! grep -q "useGlobalModal" "$file"; then
        echo -e "${BLUE}Agregando imports y hook del modal a: $file${NC}"
        
        # Buscar línea apropiada para agregar import
        if grep -q "import.*useAuth" "$file"; then
            sed -i "/import.*useAuth/a import { useGlobalModal } from '@/components/ModalContext';" "$file"
        elif grep -q "import.*useState" "$file"; then
            sed -i "/import.*useState/a import { useGlobalModal } from '@/components/ModalContext';" "$file"
        else
            sed -i "/'use client';/a import { useGlobalModal } from '@/components/ModalContext';" "$file"
        fi
        
        # Agregar hook después de useAuth si existe
        if grep -q "useAuth" "$file"; then
            sed -i "/const.*useAuth/a \ \ const { alert, confirm, success, error: showError } = useGlobalModal();" "$file"
        else
            # Buscar primera línea con useState y agregar antes
            sed -i "/const.*useState/i \ \ const { alert, confirm, success, error: showError } = useGlobalModal();" "$file"
        fi
    fi
}

# Función para reemplazar alerts y confirms
replace_alerts_confirms() {
    local file="$1"
    
    echo -e "${YELLOW}Reemplazando alerts y confirms en: $file${NC}"
    
    # Reemplazar alerts de autenticación (mantener como alert informativo)
    sed -i \
        -e "s/alert('Debes iniciar sesión para dar like');/alert('Debes iniciar sesión para dar like');/g" \
        -e "s/alert('Debes iniciar sesión para comentar');/alert('Debes iniciar sesión para comentar');/g" \
        -e "s/alert('Debes iniciar sesión para usar la lista de escucha');/alert('Debes iniciar sesión para usar la lista de escucha');/g" \
        "$file"
    
    # Reemplazar alerts de error con showError
    sed -i \
        -e "s/alert('Error al procesar like');/showError('Error al procesar like');/g" \
        -e "s/alert('Error al enviar comentario');/showError('Error al enviar comentario');/g" \
        -e "s/alert('Error al eliminar comentario');/showError('Error al eliminar comentario');/g" \
        -e "s/alert('Por favor selecciona una calificación');/alert('Por favor selecciona una calificación');/g" \
        "$file"
    
    # Reemplazar confirms con async confirm
    sed -i \
        -e "s/if (!confirm('¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.')) {/const confirmed = await confirm('¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.'); if (!confirmed) {/g" \
        -e "s/if (!confirm('¿Estás seguro de que quieres eliminar esta lista? Esta acción no se puede deshacer.')) {/const confirmed = await confirm('¿Estás seguro de que quieres eliminar esta lista? Esta acción no se puede deshacer.'); if (!confirmed) {/g" \
        -e "s/if (!confirm('¿Eliminar este comentario?')) return;/const confirmed = await confirm('¿Eliminar este comentario?'); if (!confirmed) return;/g" \
        -e "s/if (!confirm('¿Quieres remover este álbum de la lista?')) {/const confirmed = await confirm('¿Quieres remover este álbum de la lista?'); if (!confirmed) {/g" \
        "$file"
    
    # Reemplazar alerts condicionales complejos
    sed -i \
        -e "s/if (data\.message\.includes('Error')) { showError(data\.message); } else { alert(data\.message); }/showError(data.message);/g" \
        "$file"
}

# Lista de archivos que necesitan ser procesados
FILES_TO_PROCESS=(
    "src/app/lists/[listId]/page.js"
    "src/app/lists/[listId]/page_with_likes_comments.js"
    "src/app/album/page.js"
    "src/app/profile/[username]/page.js"
    "src/app/lists/page.js"
)

echo -e "${YELLOW}Procesando archivos principales...${NC}"

for file in "${FILES_TO_PROCESS[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${BLUE}Procesando: $file${NC}"
        setup_modal_in_file "$file"
        replace_alerts_confirms "$file"
        echo -e "${GREEN}✅ $file completado${NC}"
    else
        echo -e "${RED}❌ Archivo no encontrado: $file${NC}"
    fi
done

# Buscar otros archivos con alerts
echo -e "${YELLOW}Buscando otros archivos con alerts...${NC}"

# Procesar todos los archivos con alerts automáticamente
find src/ -name "*.js" -o -name "*.jsx" | xargs grep -l "alert(" | while read file; do
    if [[ ! " ${FILES_TO_PROCESS[@]} " =~ " ${file} " ]]; then
        echo -e "${BLUE}Archivo adicional con alerts: $file${NC}"
        setup_modal_in_file "$file"
        replace_alerts_confirms "$file"
        echo -e "${GREEN}✅ $file completado${NC}"
    fi
done

echo -e "${GREEN}🎉 Reemplazo completo de alerts y confirms terminado!${NC}"

# Verificar cuántos alerts quedan
REMAINING_ALERTS=$(grep -r "alert(" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
REMAINING_CONFIRMS=$(grep -r "confirm(" src/ --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "useGlobalModal\|Modal.js" | wc -l)

echo -e "${BLUE}📊 Resumen final:${NC}"
echo -e "   Alerts restantes: $REMAINING_ALERTS"
echo -e "   Confirms restantes: $REMAINING_CONFIRMS"

if [ "$REMAINING_ALERTS" -eq 0 ] && [ "$REMAINING_CONFIRMS" -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODOS los alerts y confirms han sido reemplazados!${NC}"
elif [ "$REMAINING_ALERTS" -lt 5 ] && [ "$REMAINING_CONFIRMS" -lt 3 ]; then
    echo -e "${GREEN}✅ Casi completo - solo quedan algunos casos específicos${NC}"
else
    echo -e "${YELLOW}⚠️  Aún hay algunos alerts/confirms por revisar manualmente${NC}"
fi

echo -e "${YELLOW}📄 Se crearon archivos .final_backup como respaldo${NC}"
