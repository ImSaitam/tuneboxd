// Script para inicializar las tablas de artistas en la base de datos
import db from '../lib/database.js';

async function initArtistTables() {
  try {
    console.log('Iniciando creación de tablas de artistas...');
    
    // Crear tabla artist_follows
    await db.exec(`
      CREATE TABLE IF NOT EXISTS artist_follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        artist_id TEXT NOT NULL,
        artist_name TEXT NOT NULL,
        artist_image TEXT,
        followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, artist_id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    console.log('✅ Tabla artist_follows creada');

    // Crear tabla artist_tags
    await db.exec(`
      CREATE TABLE IF NOT EXISTS artist_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        artist_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, artist_id, tag),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    console.log('✅ Tabla artist_tags creada');

    // Verificar que las tablas fueron creadas
    const tables = await db.allAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('artist_follows', 'artist_tags')
    `);
    
    console.log('📋 Tablas encontradas:', tables.map(t => t.name));
    
    if (tables.length === 2) {
      console.log('🎉 Todas las tablas de artistas han sido creadas exitosamente!');
    } else {
      console.log('⚠️ Algunas tablas no se pudieron crear');
    }
    
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
  }
}

// Ejecutar el script
initArtistTables();
