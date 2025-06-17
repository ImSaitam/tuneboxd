#!/bin/bash

# Script para verificar cuando el DNS esté configurado correctamente
# Uso: ./check-dns-propagation.sh

echo "🔍 Verificando propagación DNS para tuneboxd.xyz..."
echo "✅ IP objetivo: 76.76.21.21 (Vercel)"
echo "❌ IP actual: 84.32.84.32 (Hostinger)"
echo ""

while true; do
    # Obtener IP actual
    CURRENT_IP=$(python3 -c "import socket; print(socket.gethostbyname('tuneboxd.xyz'))" 2>/dev/null)
    
    echo "$(date '+%H:%M:%S') - IP actual: $CURRENT_IP"
    
    if [ "$CURRENT_IP" = "76.76.21.21" ]; then
        echo ""
        echo "🎉 ¡DNS PROPAGADO CORRECTAMENTE!"
        echo "✅ tuneboxd.xyz ahora apunta a Vercel"
        echo ""
        
        # Verificar que la aplicación responde
        echo "🌐 Verificando aplicación..."
        
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://tuneboxd.xyz)
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo "✅ Aplicación respondiendo correctamente (HTTP $HTTP_STATUS)"
            echo ""
            echo "🚀 ¡TU APLICACIÓN ESTÁ FUNCIONANDO!"
            echo "🌍 https://tuneboxd.xyz"
            echo "🌍 https://www.tuneboxd.xyz"
        else
            echo "⚠️  Aplicación aún no responde correctamente (HTTP $HTTP_STATUS)"
            echo "💡 Esto es normal, puede tomar unos minutos más"
        fi
        
        break
    elif [ "$CURRENT_IP" = "84.32.84.32" ]; then
        echo "   → Aún apunta a Hostinger, esperando..."
    else
        echo "   → IP desconocida: $CURRENT_IP"
    fi
    
    # Esperar 30 segundos antes de verificar de nuevo
    sleep 30
done

echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "1. Verificar https://tuneboxd.xyz en tu navegador"
echo "2. Probar todas las funcionalidades"
echo "3. ¡Disfrutar tu aplicación en producción!"
