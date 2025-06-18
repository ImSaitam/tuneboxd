#!/usr/bin/env node

require('dotenv').config({ path: '.env.production' });
const { Pool } = require('pg');

async function createAlbumsTable() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
  });

  try {
    console.log('🎯 Creando tabla albums...\n');

    // Primero crear tabla artists si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        spotify_id VARCHAR(255) UNIQUE,
        image_url TEXT,
        genres TEXT,
        popularity INTEGER DEFAULT 0,
        followers_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabla artists verificada/creada');

    // Crear tabla albums
    await pool.query(`
      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
        spotify_id VARCHAR(255) UNIQUE,
        image_url TEXT,
        release_date DATE,
        total_tracks INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabla albums creada exitosamente');

    // Crear índices para optimizar consultas
    console.log('\n🔍 Creando índices...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_albums_spotify_id ON albums(spotify_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON albums(artist_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_artists_spotify_id ON artists(spotify_id);
    `);

    console.log('✅ Índices creados exitosamente');

    // Verificar que las tablas fueron creadas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('albums', 'artists');
    `);

    console.log('\n🎉 Verificación exitosa. Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Mostrar estructura de la tabla albums
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'albums'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 Estructura de la tabla albums:');
    structure.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });

  } catch (error) {
    console.error('\n💥 Error creando tablas:', error);
  } finally {
    await pool.end();
  }
}

createAlbumsTable();
