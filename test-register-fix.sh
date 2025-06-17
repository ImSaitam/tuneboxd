#!/bin/bash

# Test de registro de usuario en producción
echo "🧪 Testeando registro de usuario en producción..."

# Datos de prueba
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_USERNAME="testuser_$(date +%s)"
TEST_PASSWORD="testpassword123"

echo "📧 Email de prueba: $TEST_EMAIL"
echo "👤 Username de prueba: $TEST_USERNAME"
echo ""

# Realizar petición de registro
echo "🚀 Enviando petición de registro..."

RESPONSE=$(curl -s -X POST https://tuneboxd.xyz/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "📥 Respuesta del servidor:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# Verificar si fue exitoso
if echo "$RESPONSE" | grep -q '"success": *true'; then
    echo ""
    echo "✅ ¡REGISTRO EXITOSO!"
    echo "🎉 El problema del userService.findByEmailOrUsername fue resuelto"
else
    echo ""
    echo "❌ Error en el registro:"
    echo "$RESPONSE"
fi

echo ""
echo "🔍 Para más detalles, puedes revisar:"
echo "  - Panel de Vercel: https://vercel.com/imsaitams-projects/tuneboxd"
echo "  - Logs en tiempo real: npx vercel logs https://tuneboxd.xyz"
