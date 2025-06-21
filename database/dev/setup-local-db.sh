#!/bin/bash
# Script para configurar base de datos local para desarrollo

echo "🚀 Configurando base de datos local para desarrollo..."

# Crear base de datos SQLite desde el backup de PostgreSQL
echo "📦 Creando base de datos SQLite..."
sqlite3 tuneboxd_dev.db < tuneboxd_complete.sql 2>/dev/null || echo "⚠️ Algunos comandos de PostgreSQL no son compatibles con SQLite, pero la estructura básica se creó"

# Verificar tablas creadas
echo "📋 Tablas creadas en la base de datos:"
sqlite3 tuneboxd_dev.db ".tables"

echo "✅ Base de datos local configurada!"
echo "📁 Archivo: database/dev/tuneboxd_dev.db"
echo ""
echo "🔧 Para usar en desarrollo, actualiza tu .env.local:"
echo "DATABASE_URL=sqlite:./database/dev/tuneboxd_dev.db"
echo ""
echo "📖 Comandos útiles:"
echo "  sqlite3 database/dev/tuneboxd_dev.db    # Conectar a la DB"
echo "  .schema table_name                      # Ver estructura de tabla"
echo "  .tables                                 # Ver todas las tablas"
echo "  .quit                                   # Salir"
