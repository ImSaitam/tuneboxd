#!/usr/bin/env node

/**
 * Script para crear la tabla list_albums si no existe
 */

import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

async function setupListAlbumsTable() {
  console.log('📝 Configurando tabla list_albums...\n');

  try {
    // Importar el adaptador de base de datos
    const { run, query } = await import('../src/lib/database-adapter.js');

    // Verificar si la tabla existe
    console.log('📋 Verificando si la tabla list_albums existe...');
    
    try {
      await query('SELECT 1 FROM list_albums LIMIT 1');
      console.log('✅ La tabla list_albums ya existe');
    } catch (error) {
      // La tabla no existe, crearla
      console.log('⚠️  La tabla list_albums no existe. Creándola...');
      
      await run(`
        CREATE TABLE IF NOT EXISTS list_albums (
          id SERIAL PRIMARY KEY,
          list_id INTEGER NOT NULL,
          spotify_album_id VARCHAR(255) NOT NULL,
          notes TEXT,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(list_id, spotify_album_id),
          FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ Tabla list_albums creada exitosamente');
      
      // Crear índices para mejor rendimiento
      console.log('📊 Creando índices...');
      
      await run(`
        CREATE INDEX IF NOT EXISTS idx_list_albums_list_id ON list_albums(list_id)
      `);
      
      await run(`
        CREATE INDEX IF NOT EXISTS idx_list_albums_spotify_album_id ON list_albums(spotify_album_id)
      `);
      
      console.log('✅ Índices creados exitosamente');
    }

    // Verificar estructura de la tabla
    console.log('\n📊 Verificando estructura de la tabla...');
    
    const listAlbums = await query('SELECT * FROM list_albums LIMIT 1');
    console.log(`📈 Total de álbumes en listas existentes: ${listAlbums.length}`);

    console.log('\n✅ Configuración de tabla list_albums completada!');
    
  } catch (error) {
    console.error('❌ Error configurando tabla list_albums:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupListAlbumsTable();
}

export { setupListAlbumsTable };
