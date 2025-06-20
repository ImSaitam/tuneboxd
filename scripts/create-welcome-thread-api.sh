#!/bin/bash

# Script para crear el hilo de bienvenida en TuneBoxd
# Llama al endpoint /api/admin/create-welcome-thread

BASE_URL="https://www.tuneboxd.xyz"
ENDPOINT="/api/admin/create-welcome-thread"

echo "🎵 Creando hilo de bienvenida en TuneBoxd..."
echo "📍 URL: ${BASE_URL}${ENDPOINT}"
echo ""

# Verificar si ya existe un hilo de bienvenida
echo "🔍 Verificando si ya existe un hilo de bienvenida..."
RESPONSE=$(curl -s -X GET "${BASE_URL}${ENDPOINT}")
echo "📋 Respuesta: $RESPONSE"
echo ""

# Crear el hilo de bienvenida
echo "📝 Creando hilo de bienvenida..."
RESPONSE=$(curl -s -X POST "${BASE_URL}${ENDPOINT}" \
  -H "Content-Type: application/json")

echo "✅ Respuesta del servidor:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Extraer URL del hilo si fue exitoso
THREAD_URL=$(echo "$RESPONSE" | jq -r '.fullUrl' 2>/dev/null)
if [ "$THREAD_URL" != "null" ] && [ "$THREAD_URL" != "" ]; then
  echo "🎉 ¡Hilo de bienvenida creado exitosamente!"
  echo "🔗 URL del hilo: $THREAD_URL"
else
  echo "⚠️  Respuesta inesperada del servidor. Revisa los detalles arriba."
fi

echo ""
echo "✨ Proceso completado."
