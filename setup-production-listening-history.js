#!/usr/bin/env node

// Script para crear tabla listening_history en producción
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno de producción
dotenv.config({ path: '.env.production' });

async function createListeningHistoryInProduction() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
  });

  try {
    console.log('🔍 Conectando a base de datos de producción...\n');
    
    // Verificar si la tabla existe
    const tableExists = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'listening_history'
    `);
    
    if (tableExists.rows.length === 0) {
      console.log('❌ Tabla listening_history NO existe en producción. Creando...\n');
      
      // Crear la tabla
      await pool.query(`
        CREATE TABLE listening_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
          track_id TEXT,
          listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla listening_history creada');
      
      // Crear índices para optimizar consultas
      console.log('🔍 Creando índices...');
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON listening_history(user_id);
      `);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_listening_history_album_id ON listening_history(album_id);
      `);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_listening_history_listened_at ON listening_history(listened_at);
      `);
      
      console.log('✅ Índices creados exitosamente');
      
    } else {
      console.log('✅ Tabla listening_history YA existe en producción');
    }
    
    // Verificar estructura
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'listening_history' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estructura tabla listening_history en producción:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n🎉 Base de datos de producción lista para listening history');
    
  } catch (error) {
    console.error('\n💥 Error configurando base de datos de producción:', error);
  } finally {
    await pool.end();
  }
}

createListeningHistoryInProduction();
