#!/bin/bash

# Script completo para configurar el foro y crear el hilo de bienvenida en TuneBoxd

BASE_URL="https://www.tuneboxd.xyz"
SETUP_ENDPOINT="/api/admin/setup-forum-tables"
WELCOME_ENDPOINT="/api/admin/create-welcome-thread"

echo "🎵 Configurando foro completo en TuneBoxd..."
echo ""

# Paso 1: Verificar estado actual de las tablas
echo "🔍 Paso 1: Verificando tablas del foro..."
TABLES_RESPONSE=$(curl -s -X GET "${BASE_URL}${SETUP_ENDPOINT}")
echo "📋 Estado actual:"
echo "$TABLES_RESPONSE" | jq '.' 2>/dev/null || echo "$TABLES_RESPONSE"
echo ""

# Verificar si las tablas ya están configuradas
TABLES_CONFIGURED=$(echo "$TABLES_RESPONSE" | jq -r '.tablesConfigured' 2>/dev/null)

if [ "$TABLES_CONFIGURED" = "false" ]; then
  echo "🏗️  Paso 2: Creando tablas del foro..."
  SETUP_RESPONSE=$(curl -s -X POST "${BASE_URL}${SETUP_ENDPOINT}")
  echo "✅ Respuesta de configuración:"
  echo "$SETUP_RESPONSE" | jq '.' 2>/dev/null || echo "$SETUP_RESPONSE"
  echo ""
  
  # Verificar si la configuración fue exitosa
  SETUP_SUCCESS=$(echo "$SETUP_RESPONSE" | jq -r '.success' 2>/dev/null)
  if [ "$SETUP_SUCCESS" != "true" ]; then
    echo "❌ Error configurando tablas del foro. Abortando."
    exit 1
  fi
else
  echo "✅ Las tablas del foro ya están configuradas."
  echo ""
fi

# Paso 3: Verificar si ya existe un hilo de bienvenida
echo "🔍 Paso 3: Verificando hilos de bienvenida existentes..."
WELCOME_CHECK=$(curl -s -X GET "${BASE_URL}${WELCOME_ENDPOINT}")
echo "📋 Verificación:"
echo "$WELCOME_CHECK" | jq '.' 2>/dev/null || echo "$WELCOME_CHECK"
echo ""

# Verificar si ya hay un hilo de bienvenida
HAS_WELCOME=$(echo "$WELCOME_CHECK" | jq -r '.hasWelcomeThread' 2>/dev/null)

if [ "$HAS_WELCOME" = "true" ]; then
  echo "ℹ️  Ya existe un hilo de bienvenida:"
  echo "$WELCOME_CHECK" | jq -r '.threads[0].title' 2>/dev/null
  EXISTING_URL=$(echo "$WELCOME_CHECK" | jq -r '.threads[0].url' 2>/dev/null)
  echo "🔗 URL: ${BASE_URL}${EXISTING_URL}"
  echo ""
  echo "✨ El foro ya está completamente configurado."
else
  # Paso 4: Crear el hilo de bienvenida
  echo "📝 Paso 4: Creando hilo de bienvenida..."
  WELCOME_RESPONSE=$(curl -s -X POST "${BASE_URL}${WELCOME_ENDPOINT}")
  echo "✅ Respuesta:"
  echo "$WELCOME_RESPONSE" | jq '.' 2>/dev/null || echo "$WELCOME_RESPONSE"
  echo ""
  
  # Extraer URL del hilo si fue exitoso
  THREAD_URL=$(echo "$WELCOME_RESPONSE" | jq -r '.fullUrl' 2>/dev/null)
  WELCOME_SUCCESS=$(echo "$WELCOME_RESPONSE" | jq -r '.success' 2>/dev/null)
  
  if [ "$WELCOME_SUCCESS" = "true" ] && [ "$THREAD_URL" != "null" ] && [ "$THREAD_URL" != "" ]; then
    echo "🎉 ¡Hilo de bienvenida creado exitosamente!"
    echo "🔗 URL del hilo: $THREAD_URL"
  else
    echo "⚠️  Respuesta inesperada del servidor al crear el hilo."
  fi
fi

echo ""
echo "🏁 Proceso completado. El foro de TuneBoxd está listo para recibir a la comunidad."
echo "📋 Resumen:"
echo "   ✅ Tablas del foro configuradas"
echo "   ✅ Hilo de bienvenida disponible"
echo "   🌐 Puedes visitar el foro en: ${BASE_URL}/community"
