#!/bin/bash

# Configurar tablas de likes para el foro
echo "🔄 Configurando tablas de likes para el foro..."

# Cargar variables de entorno
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '#' | xargs)
fi

# Verificar que DATABASE_URL esté configurado
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL no está configurado"
  exit 1
fi

echo "📊 Base de datos: PostgreSQL (Neon)"
echo "🔗 URL: ${DATABASE_URL:0:30}..."
echo ""

# Usar psql para ejecutar los comandos SQL
psql "$DATABASE_URL" << 'EOF'
-- Crear tabla forum_thread_likes
CREATE TABLE IF NOT EXISTS forum_thread_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    thread_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
    UNIQUE(user_id, thread_id)
);

-- Crear tabla forum_reply_likes
CREATE TABLE IF NOT EXISTS forum_reply_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    reply_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
    UNIQUE(user_id, reply_id)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_forum_thread_likes_user_id ON forum_thread_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_thread_likes_thread_id ON forum_thread_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_user_id ON forum_reply_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_reply_id ON forum_reply_likes(reply_id);

-- Verificar que las tablas fueron creadas
\dt forum_*_likes

-- Mostrar estructura de las tablas
\d forum_thread_likes
\d forum_reply_likes

EOF

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Tablas de likes para el foro configuradas exitosamente"
  echo ""
  echo "📋 Tablas creadas:"
  echo "  - forum_thread_likes (likes en hilos)"
  echo "  - forum_reply_likes (likes en respuestas)"
  echo ""
  echo "🔍 Índices creados para optimización"
  echo ""
  echo "🎉 El sistema de likes del foro está listo!"
else
  echo "❌ Error configurando tablas de likes"
  exit 1
fi
