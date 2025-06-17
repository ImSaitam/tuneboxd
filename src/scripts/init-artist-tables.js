// Script para inicializar las tablas de artistas en la base de datos
import db from '../lib/database.js';

async function initArtistTables() {
  try {
    
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

    // Verificar que las tablas fueron creadas
    const tables = await db.allAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('artist_follows', 'artist_tags')
    `);
    
    
    if (tables.length === 2) {
    } else {
    }
    
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
  }
}

// Ejecutar el script
initArtistTables();
