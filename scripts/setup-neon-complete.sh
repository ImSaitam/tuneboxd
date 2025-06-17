#!/bin/bash

# Script para configurar base de datos Neon con TuneBoxd
# Asegurate de haber configurado DATABASE_URL antes de ejecutar

echo "🗄️  Configurando base de datos Neon para TuneBoxd..."

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL no está configurada"
    echo ""
    echo "Por favor configúrala:"
    echo "1. Edita .env.local:"
    echo "   DATABASE_URL='tu-url-de-neon'"
    echo ""
    echo "2. O exporta temporalmente:"
    echo "   export DATABASE_URL='tu-url-de-neon'"
    echo ""
    echo "Tu URL de Neon debe verse así:"
    echo "postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
    exit 1
fi

echo "✅ DATABASE_URL encontrada"
echo "🔗 Probando conexión a Neon..."

# Probar conexión
node -e "
const { Pool } = require('pg');

console.log('🔌 Conectando a Neon...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW() as current_time, version() as pg_version')
    .then(result => {
        console.log('✅ Conexión exitosa a Neon!');
        console.log('⏰ Hora del servidor:', result.rows[0].current_time);
        console.log('🗄️  PostgreSQL:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
        return pool.end();
    })
    .catch(err => {
        console.error('❌ Error de conexión:', err.message);
        console.log('');
        console.log('🔧 Verifica que:');
        console.log('1. La URL sea correcta');
        console.log('2. Incluya ?sslmode=require al final');
        console.log('3. El usuario y password sean correctos');
        process.exit(1);
    });
" || exit 1

echo "🏗️  Creando esquema de base de datos..."

# Crear esquema
node -e "
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const schema = \`
-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    profile_image VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    privacy VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla follows (seguimientos)
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(follower_id, following_id)
);

-- Tabla reviews (reseñas)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    spotify_album_id VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla likes (me gusta en reseñas)
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    review_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    UNIQUE(user_id, review_id)
);

-- Tabla lists (listas de álbumes)
CREATE TABLE IF NOT EXISTS lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla list_albums (álbumes en listas)
CREATE TABLE IF NOT EXISTS list_albums (
    id SERIAL PRIMARY KEY,
    list_id INTEGER NOT NULL,
    spotify_album_id VARCHAR(255) NOT NULL,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    UNIQUE(list_id, spotify_album_id)
);

-- Tabla notifications (notificaciones)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para optimizar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_album_id ON reviews(spotify_album_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_likes_user_review ON likes(user_id, review_id);
CREATE INDEX IF NOT EXISTS idx_likes_review_id ON likes(review_id);

CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_created_at ON lists(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_list_albums_list_id ON list_albums(list_id);
CREATE INDEX IF NOT EXISTS idx_list_albums_order ON list_albums(list_id, order_index);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
\$\$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lists_updated_at ON lists;
CREATE TRIGGER update_lists_updated_at 
    BEFORE UPDATE ON lists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`;

pool.query(schema)
    .then(() => {
        console.log('✅ Esquema creado exitosamente en Neon');
        console.log('📊 Tablas creadas:');
        console.log('   - users (usuarios)');
        console.log('   - follows (seguimientos)');
        console.log('   - reviews (reseñas)');
        console.log('   - likes (me gusta)');
        console.log('   - lists (listas)');
        console.log('   - list_albums (álbumes en listas)');
        console.log('   - notifications (notificaciones)');
        console.log('');
        console.log('🚀 Base de datos lista para TuneBoxd!');
        return pool.end();
    })
    .catch(err => {
        console.error('❌ Error creando esquema:', err.message);
        process.exit(1);
    });
"

echo ""
echo "🎉 ¡Base de datos Neon configurada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar la misma DATABASE_URL en Vercel"
echo "2. Ejecutar: ./deploy-production.sh"
echo ""
echo "🔗 Verificar en Neon Dashboard:"
echo "   - Ve a https://console.neon.tech"
echo "   - Abre tu proyecto tuneboxd"
echo "   - Ve a 'Tables' para confirmar que se crearon"
echo ""
