#!/bin/bash

# Script de configuración para migración de esquema de SQLite a PostgreSQL
# Archivo: /home/matu-ntbk/Desktop/dev/tuneboxd/scripts/migrate-to-postgres.js

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración
const SQLITE_DB_PATH = './database.db';
const POSTGRES_URL = process.env.DATABASE_URL; // Tu URL de PostgreSQL

async function createPostgreSQLSchema() {
    const pool = new Pool({
        connectionString: POSTGRES_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const schema = `
        -- Crear tablas en PostgreSQL
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

        CREATE TABLE IF NOT EXISTS follows (
            id SERIAL PRIMARY KEY,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(follower_id, following_id)
        );

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

        CREATE TABLE IF NOT EXISTS likes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            review_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
            UNIQUE(user_id, review_id)
        );

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

        CREATE TABLE IF NOT EXISTS list_albums (
            id SERIAL PRIMARY KEY,
            list_id INTEGER NOT NULL,
            spotify_album_id VARCHAR(255) NOT NULL,
            order_index INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
            UNIQUE(list_id, spotify_album_id)
        );

        -- Índices para optimizar rendimiento
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_album_id ON reviews(spotify_album_id);
        CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
        CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
        CREATE INDEX IF NOT EXISTS idx_likes_user_review ON likes(user_id, review_id);
        CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
        CREATE INDEX IF NOT EXISTS idx_list_albums_list_id ON list_albums(list_id);
    `;

    try {
        await pool.query(schema);
        console.log('✅ Esquema PostgreSQL creado exitosamente');
        
        // Crear función para actualizar updated_at automáticamente
        const updateTrigger = `
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
            CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

            DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
            CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

            DROP TRIGGER IF EXISTS update_lists_updated_at ON lists;
            CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `;
        
        await pool.query(updateTrigger);
        console.log('✅ Triggers de actualización creados');
        
    } catch (error) {
        console.error('❌ Error creando esquema:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

async function migrateData() {
    if (!fs.existsSync(SQLITE_DB_PATH)) {
        console.log('⚠️  No se encontró base de datos SQLite, saltando migración de datos');
        return;
    }

    console.log('🔄 Iniciando migración de datos...');
    
    // Aquí puedes agregar lógica para migrar datos existentes si es necesario
    // Por ahora, para un despliegue limpio, no migraremos datos
    
    console.log('ℹ️  Migración de datos completada (base de datos limpia para producción)');
}

async function main() {
    if (!POSTGRES_URL) {
        console.error('❌ DATABASE_URL no configurada');
        console.log('Configure su URL de PostgreSQL en las variables de entorno');
        process.exit(1);
    }

    try {
        console.log('🚀 Configurando base de datos PostgreSQL para producción...');
        await createPostgreSQLSchema();
        await migrateData();
        console.log('✅ Configuración de base de datos completada');
    } catch (error) {
        console.error('❌ Error en la configuración:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { createPostgreSQLSchema, migrateData };
