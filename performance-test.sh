#!/bin/bash

echo "🚀 Test de Rendimiento TuneBoxd"
echo "=============================="

API_BASE='http://localhost:3000'

# Función para test individual
test_api() {
    local endpoint=$1
    local description=$2
    
    echo "📊 Testing: $description"
    echo "   Endpoint: $endpoint"
    
    # Realizar la llamada y capturar métricas
    result=$(curl -s -w "HTTPCODE:%{http_code};TIME:%{time_total};SIZE:%{size_download}" \
             -o /tmp/response.json "$API_BASE$endpoint")
    
    # Extraer métricas
    http_code=$(echo $result | grep -o 'HTTPCODE:[0-9]*' | cut -d: -f2)
    time_total=$(echo $result | grep -o 'TIME:[0-9.]*' | cut -d: -f2)
    size_download=$(echo $result | grep -o 'SIZE:[0-9]*' | cut -d: -f2)
    
    # Mostrar resultados
    echo "   ✅ HTTP $http_code"
    echo "   ⏱️  Tiempo: ${time_total}s ($(echo "$time_total * 1000" | bc -l | cut -d. -f1)ms)"
    echo "   📦 Tamaño: $size_download bytes"
    
    # Verificar si hay datos de cache
    if grep -q '"fromCache":true' /tmp/response.json 2>/dev/null; then
        echo "   🚀 Respuesta desde CACHE"
    elif grep -q '"fromCache":false' /tmp/response.json 2>/dev/null; then
        echo "   💾 Respuesta desde BASE DE DATOS"
    fi
    
    # Contar threads si existen
    if command -v jq &> /dev/null; then
        thread_count=$(jq '.threads | length' /tmp/response.json 2>/dev/null)
        if [ "$thread_count" != "null" ] && [ "$thread_count" != "" ]; then
            echo "   📝 Threads encontrados: $thread_count"
        fi
    fi
    
    echo ""
    return $(echo "$time_total" | cut -d. -f1)
}

echo "🎯 Iniciando tests de APIs optimizadas..."
echo ""

# Test 1: API Unificada (primera llamada)
test_api "/api/forum/data" "API Unificada - Primera llamada"
time1=$?

# Test 2: API Unificada (segunda llamada - debería usar cache)
test_api "/api/forum/data" "API Unificada - Segunda llamada (cache)"
time2=$?

# Test 3: API de Estadísticas
test_api "/api/forum/stats" "API de Estadísticas"
time3=$?

# Test 4: API con filtros
test_api "/api/forum/data?category=música" "API Filtrada por categoría"
time4=$?

# Test 5: API con múltiples filtros
test_api "/api/forum/data?category=música&language=es" "API con filtros múltiples"
time5=$?

echo "📊 RESUMEN DE OPTIMIZACIONES:"
echo "=========================================="
echo "🌟 Dashboard disponible en: $API_BASE/admin/performance"
echo ""
echo "🚀 Las optimizaciones incluyen:"
echo "   ✅ Cache en memoria para respuestas frecuentes"
echo "   ✅ API unificada que reduce número de requests"
echo "   ✅ Middlewares de cache HTTP"
echo "   ✅ Componentes React optimizados con memo"
echo "   ✅ Pool de conexiones a base de datos"
echo ""
echo "🎯 URLs importantes:"
echo "   • Foro: $API_BASE/social"
echo "   • Dashboard Admin: $API_BASE/admin/performance"
echo "   • API Unificada: $API_BASE/api/forum/data"
echo "   • API Estadísticas: $API_BASE/api/forum/stats"

# Limpiar archivo temporal
rm -f /tmp/response.json

echo ""
echo "✅ Test completado!"
