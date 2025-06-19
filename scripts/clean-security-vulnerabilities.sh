#!/bin/bash

echo "🔒 Limpiando vulnerabilidades de seguridad en TuneBoxd..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Buscando console.log que exponen información sensible...${NC}"

# Buscar console.log que imprimen emails
if grep -r "console\.log.*email" src/; then
    echo -e "${RED}❌ Encontrado console.log que expone emails${NC}"
else
    echo -e "${GREEN}✅ No se encontraron console.log que expongan emails${NC}"
fi

# Buscar console.log que imprimen tokens o passwords
if grep -r "console\.log.*\(token\|password\|secret\)" src/; then
    echo -e "${RED}❌ Encontrado console.log que expone información sensible${NC}"
else
    echo -e "${GREEN}✅ No se encontraron console.log que expongan tokens/passwords${NC}"
fi

echo -e "${BLUE}2. Verificando variables de entorno expuestas...${NC}"

# Buscar si process.env se está loggeando
if grep -r "console\.log.*process\.env" src/; then
    echo -e "${RED}❌ Encontrado console.log que expone variables de entorno${NC}"
else
    echo -e "${GREEN}✅ No se encontraron variables de entorno expuestas en logs${NC}"
fi

echo -e "${BLUE}3. Buscando debugger statements...${NC}"

# Buscar debugger statements
if grep -r "debugger" src/; then
    echo -e "${RED}❌ Encontrado debugger statements${NC}"
else
    echo -e "${GREEN}✅ No se encontraron debugger statements${NC}"
fi

echo -e "${BLUE}4. Verificando uso de alert() en producción...${NC}"

# Contar alerts (algunos son legítimos para confirmaciones)
ALERT_COUNT=$(grep -r "alert(" src/ | wc -l)
echo -e "${YELLOW}⚠️  Encontrados ${ALERT_COUNT} usos de alert()${NC}"

echo -e "${BLUE}5. Verificando archivos de configuración...${NC}"

# Verificar que no hay secrets hardcodeados
if grep -r "sk_\|pk_\|secret_\|key_" src/ --exclude-dir=node_modules; then
    echo -e "${RED}❌ Posibles secrets hardcodeados encontrados${NC}"
else
    echo -e "${GREEN}✅ No se encontraron secrets hardcodeados${NC}"
fi

echo -e "${BLUE}6. Resumen de archivos con console.log en producción:${NC}"

# Contar console.log por archivo
echo "Archivos con console.log:"
grep -r "console\." src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" | cut -d: -f1 | sort | uniq -c | sort -nr

echo -e "\n${GREEN}🔒 Análisis de seguridad completado${NC}"
echo -e "${YELLOW}💡 Recomendaciones:${NC}"
echo "   1. Remover console.log que expongan información sensible"
echo "   2. Usar un logger apropiado para producción"
echo "   3. Considerar remover alerts y usar notificaciones más elegantes"
echo "   4. Revisar Service Worker logs para no exponer información sensible"
