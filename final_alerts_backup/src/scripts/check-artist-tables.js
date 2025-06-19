// Script para verificar las tablas de artistas
import db from '../lib/database.js';

async function checkArtistTables() {
  try {
    
    // Listar todas las tablas
    const tables = await db.allAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    tables.forEach(table => {
    });
    
    // Verificar estructura de artist_follows
    const followsSchema = await db.allAsync(`
      PRAGMA table_info(artist_follows)
    `);
    
    followsSchema.forEach(col => {
    });
    
    // Verificar estructura de artist_tags
    const tagsSchema = await db.allAsync(`
      PRAGMA table_info(artist_tags)
    `);
    
    tagsSchema.forEach(col => {
    });
    
    
  } catch (error) {
    console.error('❌ Error al verificar tablas:', error);
  }
}

// Ejecutar el script
checkArtistTables();
