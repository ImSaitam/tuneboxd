#!/usr/bin/env node

/**
 * Script para crear la tabla de favoritos de tracks si no existe
 */

import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

async function setupTrackFavoritesTable() {
  console.log('🎵 Configurando tabla de favoritos de tracks...\n');

  try {
    // Importar el adaptador de base de datos
    const { run, query } = await import('../src/lib/database-adapter.js');

    // Verificar si la tabla existe
    console.log('📋 Verificando si la tabla track_favorites existe...');
    
    try {
      await query('SELECT 1 FROM track_favorites LIMIT 1');
      console.log('✅ La tabla track_favorites ya existe');
    } catch (error) {
      // La tabla no existe, crearla
      console.log('⚠️  La tabla track_favorites no existe. Creándola...');
      
      await run(`
        CREATE TABLE IF NOT EXISTS track_favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          track_id VARCHAR(255) NOT NULL,
          track_name VARCHAR(255),
          artist_name VARCHAR(255),
          album_name VARCHAR(255),
          image_url TEXT,
          duration_ms INTEGER,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, track_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ Tabla track_favorites creada exitosamente');
    }

    // Verificar estructura de la tabla
    console.log('\n📊 Verificando estructura de la tabla...');
    
    const trackFavorites = await query('SELECT * FROM track_favorites LIMIT 1');
    console.log(`📈 Total de favoritos existentes: ${trackFavorites.length}`);

    console.log('\n✅ Configuración de tabla track_favorites completada!');
    
  } catch (error) {
    console.error('❌ Error configurando tabla track_favorites:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTrackFavoritesTable();
}

export { setupTrackFavoritesTable };
