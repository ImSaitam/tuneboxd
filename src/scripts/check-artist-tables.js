// Script para verificar las tablas de artistas
import db from '../lib/database.js';

async function checkArtistTables() {
  try {
    console.log('🔍 Verificando tablas de artistas...');
    
    // Listar todas las tablas
    const tables = await db.allAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    console.log('📋 Tablas en la base de datos:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // Verificar estructura de artist_follows
    const followsSchema = await db.allAsync(`
      PRAGMA table_info(artist_follows)
    `);
    
    console.log('\n🎯 Estructura de artist_follows:');
    followsSchema.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Verificar estructura de artist_tags
    const tagsSchema = await db.allAsync(`
      PRAGMA table_info(artist_tags)
    `);
    
    console.log('\n🏷️ Estructura de artist_tags:');
    tagsSchema.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error al verificar tablas:', error);
  }
}

// Ejecutar el script
checkArtistTables();
