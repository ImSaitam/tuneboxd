#!/bin/bash

# Test completo de APIs después del fix de PostgreSQL
echo "🧪 Test completo de APIs - Fix PostgreSQL"
echo "=========================================="

BASE_URL="https://tuneboxd.xyz"

# Función para hacer requests con mejor formato
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo ""
    echo "🔍 Testing: $description"
    echo "📡 $method $endpoint"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s "$BASE_URL$endpoint")
    fi
    
    echo "📥 Response:"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    
    # Verificar si fue exitoso
    if echo "$response" | grep -q '"success": *true'; then
        echo "✅ SUCCESS"
        return 0
    elif echo "$response" | grep -q '"success": *false'; then
        echo "❌ FAILED"
        return 1
    else
        echo "⚠️  UNKNOWN RESPONSE"
        return 2
    fi
}

# Test 1: Verificar que la aplicación esté funcionando
echo "🌐 Verificando que la aplicación esté activa..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Aplicación respondiendo correctamente (HTTP $HTTP_STATUS)"
else
    echo "❌ Aplicación no responde correctamente (HTTP $HTTP_STATUS)"
    exit 1
fi

# Test 2: Registro de usuario
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_USERNAME="testuser_$(date +%s)"
TEST_PASSWORD="testpassword123"

REGISTER_DATA="{
  \"email\": \"$TEST_EMAIL\",
  \"username\": \"$TEST_USERNAME\",
  \"password\": \"$TEST_PASSWORD\"
}"

test_endpoint "POST" "/api/auth/register" "$REGISTER_DATA" "Registro de usuario"
REGISTER_SUCCESS=$?

# Test 3: Login (solo si el registro fue exitoso)
if [ $REGISTER_SUCCESS -eq 0 ]; then
    echo ""
    echo "⏳ Esperando 2 segundos antes del login..."
    sleep 2
    
    LOGIN_DATA="{
      \"email\": \"$TEST_EMAIL\",
      \"password\": \"$TEST_PASSWORD\"
    }"
    
    test_endpoint "POST" "/api/auth/login" "$LOGIN_DATA" "Login de usuario"
fi

# Test 4: Verificar endpoint público (no requiere autenticación)
test_endpoint "GET" "/api/spotify/token" "" "Token de Spotify (público)"

# Test 5: Verificar endpoint de stats globales
test_endpoint "GET" "/api/stats/global" "" "Estadísticas globales"

echo ""
echo "📊 RESUMEN DE TESTS"
echo "==================="
echo "🌐 Aplicación: ✅ Activa"
echo "👤 Registro: $([ $REGISTER_SUCCESS -eq 0 ] && echo "✅ Exitoso" || echo "❌ Falló")"
echo ""

if [ $REGISTER_SUCCESS -eq 0 ]; then
    echo "🎉 ¡EL FIX DE POSTGRESQL FUNCIONÓ!"
    echo "✅ userService.findByEmailOrUsername ahora funciona correctamente"
    echo "✅ Los parámetros PostgreSQL se están convirtiendo bien ($1, $2, etc.)"
    echo ""
    echo "🎯 Detalles del usuario de prueba:"
    echo "   📧 Email: $TEST_EMAIL"
    echo "   👤 Username: $TEST_USERNAME"
else
    echo "❌ Aún hay problemas con el registro"
    echo "🔍 Revisar logs: npx vercel logs https://tuneboxd.xyz"
fi

echo ""
echo "🔗 Enlaces útiles:"
echo "   🌍 Aplicación: $BASE_URL"
echo "   📊 Panel Vercel: https://vercel.com/imsaitams-projects/tuneboxd"
echo "   📧 Resend Dashboard: https://resend.com/dashboard"
