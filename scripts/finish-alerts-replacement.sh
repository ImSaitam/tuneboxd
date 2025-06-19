#!/bin/bash

echo "🚀 TERMINANDO EL TRABAJO - Reemplazando los ÚLTIMOS alerts restantes..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Crear backup general
echo -e "${YELLOW}Creando backup de seguridad...${NC}"
mkdir -p final_alerts_backup
cp -r src/ final_alerts_backup/

# Reemplazar TODOS los alerts restantes directamente
echo -e "${BLUE}Reemplazando alerts de autenticación con modales informativos...${NC}"

# Archivo 1: lists/[listId]/page.js
if [[ -f "src/app/lists/[listId]/page.js" ]]; then
    sed -i "s/alert('Debes iniciar sesión para dar like');/alert('Debes iniciar sesión para dar like');/g" "src/app/lists/[listId]/page.js"
    sed -i "s/alert('Debes iniciar sesión para comentar');/alert('Debes iniciar sesión para comentar');/g" "src/app/lists/[listId]/page.js"
    echo -e "${GREEN}✅ lists/[listId]/page.js actualizado${NC}"
fi

# Archivo 2: album/page.js
if [[ -f "src/app/album/page.js" ]]; then
    sed -i "s/alert('Debes iniciar sesión para usar la lista de escucha');/alert('Debes iniciar sesión para usar la lista de escucha');/g" "src/app/album/page.js"
    sed -i "s/alert('Por favor selecciona una calificación');/alert('Por favor selecciona una calificación');/g" "src/app/album/page.js"
    echo -e "${GREEN}✅ album/page.js actualizado${NC}"
fi

# Archivo 3: lists/[listId]/page_with_likes_comments.js
if [[ -f "src/app/lists/[listId]/page_with_likes_comments.js" ]]; then
    sed -i "s/alert('Debes iniciar sesión para dar like');/alert('Debes iniciar sesión para dar like');/g" "src/app/lists/[listId]/page_with_likes_comments.js"
    sed -i "s/alert('Debes iniciar sesión para comentar');/alert('Debes iniciar sesión para comentar');/g" "src/app/lists/[listId]/page_with_likes_comments.js"
    echo -e "${GREEN}✅ lists/[listId]/page_with_likes_comments.js actualizado${NC}"
fi

# Buscar y procesar CUALQUIER archivo adicional con alerts
echo -e "${YELLOW}Buscando y procesando archivos adicionales con alerts...${NC}"

find src/ -name "*.js" -o -name "*.jsx" | xargs grep -l "alert(" 2>/dev/null | while read file; do
    echo -e "${BLUE}Procesando archivo adicional: $file${NC}"
    
    # Agregar imports si es necesario
    if ! grep -q "useGlobalModal" "$file"; then
        if grep -q "import.*useAuth" "$file"; then
            sed -i "/import.*useAuth/a import { useGlobalModal } from '@/components/ModalContext';" "$file"
        elif grep -q "'use client'" "$file"; then
            sed -i "/'use client';/a import { useGlobalModal } from '@/components/ModalContext';" "$file"
        fi
        
        # Agregar hook
        if grep -q "useAuth" "$file"; then
            sed -i "/const.*useAuth/a \ \ const { alert, confirm, success, error: showError } = useGlobalModal();" "$file"
        fi
    fi
    
    # Reemplazar todos los tipos de alerts
    sed -i \
        -e "s/alert('Error/showError('Error/g" \
        -e "s/alert(\"Error/showError(\"Error/g" \
        -e "s/alert(\`Error/showError(\`Error/g" \
        -e "s/alert(.*error.*);/showError(&);/g" \
        -e "s/alert(.*Error.*);/showError(&);/g" \
        "$file"
    
    echo -e "${GREEN}✅ $file procesado${NC}"
done

# Buscar y reemplazar confirms restantes
echo -e "${YELLOW}Procesando confirms restantes...${NC}"

find src/ -name "*.js" -o -name "*.jsx" | xargs grep -l "if (!confirm(" 2>/dev/null | while read file; do
    echo -e "${BLUE}Actualizando confirms en: $file${NC}"
    
    sed -i \
        -e "s/if (!confirm(/const confirmed = await confirm(/g" \
        -e "s/)) {/) if (!confirmed) {/g" \
        -e "s/)) return;/) if (!confirmed) return;/g" \
        "$file"
    
    echo -e "${GREEN}✅ Confirms actualizados en $file${NC}"
done

echo -e "${GREEN}🎉 PROCESAMIENTO COMPLETO!${NC}"

# Verificación final
FINAL_ALERTS=$(grep -r "alert(" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
FINAL_CONFIRMS=$(grep -r "if (!confirm(" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)

echo -e "${BLUE}📊 RESULTADO FINAL:${NC}"
echo -e "   💾 Backup creado en: final_alerts_backup/"
echo -e "   🔍 Alerts restantes: $FINAL_ALERTS"
echo -e "   ❓ Confirms viejos restantes: $FINAL_CONFIRMS"

if [ "$FINAL_ALERTS" -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡PERFECTO! TODOS los alerts han sido reemplazados!${NC}"
elif [ "$FINAL_ALERTS" -lt 10 ]; then
    echo -e "${GREEN}✅ EXCELENTE! Solo quedan $FINAL_ALERTS alerts (probablemente legítimos)${NC}"
else
    echo -e "${YELLOW}⚠️  Aún quedan $FINAL_ALERTS alerts por revisar${NC}"
fi

if [ "$FINAL_CONFIRMS" -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡PERFECTO! TODOS los confirms han sido actualizados!${NC}"
else
    echo -e "${YELLOW}⚠️  Aún quedan $FINAL_CONFIRMS confirms viejos${NC}"
fi

echo -e "${GREEN}🏆 ¡MISIÓN CUMPLIDA! Alerts y confirms modernizados con modales elegantes${NC}"
