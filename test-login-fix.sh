#!/bin/bash

# Test específico para login después de corregir los campos de la BD
echo "🔐 Test de Login - Post Field Fixes"
echo "=================================="

BASE_URL="https://tuneboxd.xyz"

# Función para probar login
test_login() {
    local email=$1
    local password=$2
    local description=$3
    
    echo ""
    echo "🔍 Testing Login: $description"
    echo "📧 Email: $email"
    
    LOGIN_DATA="{
      \"email\": \"$email\",
      \"password\": \"$password\"
    }"
    
    response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA")
    
    echo "📥 Response:"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    
    if echo "$response" | grep -q '"success": *true'; then
        echo "✅ LOGIN SUCCESS"
        return 0
    elif echo "$response" | grep -q '"needsVerification": *true'; then
        echo "⚠️  NEEDS VERIFICATION (Expected for new users)"
        return 2
    else
        echo "❌ LOGIN FAILED"
        return 1
    fi
}

# Test 1: Registrar un nuevo usuario (para tener datos conocidos)
echo "👤 Creando usuario de prueba..."
TEST_EMAIL="logintest_$(date +%s)@example.com"
TEST_USERNAME="logintest_$(date +%s)"
TEST_PASSWORD="testpassword123"

REGISTER_DATA="{
  \"email\": \"$TEST_EMAIL\",
  \"username\": \"$TEST_USERNAME\",
  \"password\": \"$TEST_PASSWORD\"
}"

echo "📧 Email de prueba: $TEST_EMAIL"
echo "🔑 Password: $TEST_PASSWORD"

register_response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA")

echo ""
echo "📋 Registro response:"
echo "$register_response" | python3 -m json.tool 2>/dev/null || echo "$register_response"

if echo "$register_response" | grep -q '"success": *true'; then
    echo "✅ Usuario registrado exitosamente"
    
    # Test 2: Intentar login sin verificación
    test_login "$TEST_EMAIL" "$TEST_PASSWORD" "Usuario recién registrado (sin verificar)"
    LOGIN_RESULT=$?
    
    # Test 3: Intentar login con contraseña incorrecta
    test_login "$TEST_EMAIL" "wrongpassword" "Contraseña incorrecta"
    
    # Test 4: Intentar login con email inexistente
    test_login "noexiste@example.com" "$TEST_PASSWORD" "Email inexistente"
    
else
    echo "❌ Error en registro, no se puede probar login"
    exit 1
fi

echo ""
echo "📊 ANÁLISIS DE RESULTADOS"
echo "========================"

case $LOGIN_RESULT in
    0)
        echo "✅ Login funcionando perfectamente"
        echo "🎉 El fix de campos BD fue exitoso!"
        ;;
    2)
        echo "⚠️  Login requiere verificación (normal)"
        echo "✅ El fix de campos BD funcionó"
        echo "📧 Usuario necesita verificar email para hacer login"
        ;;
    1)
        echo "❌ Login aún tiene problemas"
        echo "🔍 Revisar logs para más detalles"
        ;;
esac

echo ""
echo "🔗 URLs útiles:"
echo "   🌍 App: $BASE_URL"
echo "   📊 Vercel: https://vercel.com/imsaitams-projects/tuneboxd"
echo "   📧 Resend: https://resend.com/dashboard"

echo ""
echo "🎯 Próximo paso:"
if [ $LOGIN_RESULT -eq 2 ]; then
    echo "   Verificar funcionamiento del sistema de verificación de email"
else
    echo "   Revisar logs de error en Vercel para diagnosticar problema"
fi
