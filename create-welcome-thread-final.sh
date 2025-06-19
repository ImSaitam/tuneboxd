#!/bin/bash

echo "🎵 Creando hilo de bienvenida en TuneBoxd..."
echo "==============================================="

# URL base de la API (usando el dominio principal)
BASE_URL="https://tuneboxd.xyz/api"

echo ""
echo "📡 Llamando al endpoint para crear el hilo de bienvenida..."

# Llamar al endpoint para crear el hilo de bienvenida
response=$(curl -s -X POST "$BASE_URL/admin/create-welcome-thread" \
  -H "Content-Type: application/json" \
  -w "HTTP_STATUS:%{http_code}")

# Extraer el código de estado HTTP
http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')

echo ""
echo "📊 Respuesta del servidor:"
echo "   Status: $http_status"

if [ "$http_status" = "200" ]; then
    echo "✅ ¡Hilo de bienvenida creado exitosamente!"
    echo ""
    echo "📋 Detalles:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    
    # Extraer el ID del hilo si está disponible
    thread_id=$(echo "$body" | jq -r '.thread.id' 2>/dev/null)
    if [ "$thread_id" != "null" ] && [ "$thread_id" != "" ]; then
        echo ""
        echo "🔗 URL del hilo: https://tuneboxd.xyz/community/thread/$thread_id"
    fi
elif [ "$http_status" = "409" ]; then
    echo "⚠️  Ya existe un hilo de bienvenida"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
elif [ "$http_status" = "401" ] || [ "$http_status" = "403" ]; then
    echo "🔐 Este endpoint requiere autenticación de administrador"
    echo "   Necesitas estar logueado como administrador para crear el hilo"
else
    echo "❌ Error al crear el hilo:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
fi

echo ""
echo "🌐 Puedes verificar el foro en: https://tuneboxd.xyz/community"
echo ""
echo "✨ ¡Proceso completado!"
