#!/bin/bash

# 🚀 Script de Despliegue Automático para TuneBoxd
# Ejecutar con: ./deploy-now.sh

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Iniciando despliegue de TuneBoxd...${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo "Asegúrate de estar en el directorio del proyecto"
    exit 1
fi

# Paso 1: Verificar build
echo -e "${YELLOW}📦 Verificando build...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el build. Corrige los errores primero.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build exitoso${NC}"

# Paso 2: Verificar Vercel CLI
echo -e "${YELLOW}🔧 Verificando Vercel CLI...${NC}"
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx no está disponible${NC}"
    exit 1
fi

# Paso 3: Intentar login en Vercel
echo -e "${YELLOW}🔐 Intentando login en Vercel...${NC}"
echo "Si no tienes cuenta en Vercel, ve a https://vercel.com y crea una"
echo "Presiona ENTER para continuar..."
read

# Paso 4: Despliegue
echo -e "${YELLOW}🚀 Iniciando despliegue...${NC}"
echo "Este es el primer despliegue. Responde las preguntas:"
echo "- Project name: tuneboxd"
echo "- Link to existing project: No"
echo "- In which directory...: ./ (default)"
echo "- Want to override settings: No (default)"
echo ""
echo "Presiona ENTER para continuar con el despliegue..."
read

npx vercel

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Despliegue preview exitoso${NC}"
    echo -e "${YELLOW}🔥 Ahora desplegando a producción...${NC}"
    npx vercel --prod
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}🎉 ¡DESPLIEGUE EXITOSO!${NC}"
        echo ""
        echo -e "${BLUE}📋 Próximos pasos:${NC}"
        echo "1. Configurar base de datos PostgreSQL (Neon recomendado)"
        echo "2. Agregar variables de entorno en Vercel Dashboard"
        echo "3. Configurar dominio personalizado"
        echo "4. Ejecutar migración de base de datos"
        echo ""
        echo -e "${BLUE}🔗 Enlaces útiles:${NC}"
        echo "- Vercel Dashboard: https://vercel.com/dashboard"
        echo "- Neon Database: https://neon.tech"
        echo "- Tu proyecto desplegado: (verifica la URL en el output anterior)"
    else
        echo -e "${RED}❌ Error en despliegue de producción${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Error en despliegue preview${NC}"
    echo "Posibles causas:"
    echo "- No tienes cuenta en Vercel"
    echo "- No estás autenticado"
    echo "- Problema de conexión"
    exit 1
fi
