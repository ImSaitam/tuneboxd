// Script para crear tabla watchlist en producción
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno de producción
dotenv.config({ path: '.env.production' });

async function createWatchlistTable() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
  });

  try {
    console.log('🔍 Conectando a base de datos de producción...\n');
    
    // Verificar si la tabla watchlist existe
    const tableExists = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'watchlist'
    `);
    
    if (tableExists.rows.length === 0) {
      console.log('❌ Tabla watchlist NO existe en producción. Creando...\n');
      
      // Crear la tabla watchlist
      await pool.query(`
        CREATE TABLE watchlist (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, album_id)
        )
      `);
      
      console.log('✅ Tabla watchlist creada');
      
      // Crear índices para optimizar consultas
      console.log('🔍 Creando índices...');
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
      `);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_watchlist_album_id ON watchlist(album_id);
      `);
      
      console.log('✅ Índices creados exitosamente');
      
    } else {
      console.log('✅ Tabla watchlist YA existe en producción');
    }
    
    // Verificar estructura
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'watchlist' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estructura tabla watchlist en producción:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar que las tablas referenciadas existen
    const usersExists = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    const albumsExists = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'albums'
    `);
    
    console.log('\n🔍 Verificación de tablas relacionadas:');
    console.log(`  - users: ${usersExists.rows.length > 0 ? '✅ existe' : '❌ NO existe'}`);
    console.log(`  - albums: ${albumsExists.rows.length > 0 ? '✅ existe' : '❌ NO existe'}`);
    
    console.log('\n🎉 Base de datos de producción lista para watchlist/listen-list');
    
  } catch (error) {
    console.error('\n💥 Error configurando base de datos de producción:', error);
  } finally {
    await pool.end();
  }
}

createWatchlistTable();
