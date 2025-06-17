#!/usr/bin/env node

require('dotenv').config({ path: '.env.production' });
const { Pool } = require('pg');

async function createArtistFollowsTable() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
  });

  try {
    console.log('🎯 Creando tabla artist_follows...\n');

    // Crear tabla artist_follows
    await pool.query(`
      CREATE TABLE IF NOT EXISTS artist_follows (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        artist_id TEXT NOT NULL,
        artist_name TEXT NOT NULL,
        artist_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, artist_id)
      );
    `);

    console.log('✅ Tabla artist_follows creada exitosamente');

    // Crear índices para optimizar consultas
    console.log('\n🔍 Creando índices...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_artist_follows_user_id ON artist_follows(user_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_artist_follows_artist_id ON artist_follows(artist_id);
    `);

    console.log('✅ Índices creados exitosamente');

    // Verificar que la tabla fue creada
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'artist_follows';
    `);

    if (result.rows.length > 0) {
      console.log('\n🎉 Verificación exitosa: tabla artist_follows existe');
      
      // Mostrar estructura de la tabla
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'artist_follows'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 Estructura de la tabla:');
      structure.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
    } else {
      console.log('\n❌ Error: tabla no fue creada');
    }

  } catch (error) {
    console.error('\n💥 Error creando tabla:', error);
  } finally {
    await pool.end();
  }
}

createArtistFollowsTable();
