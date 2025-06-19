#!/usr/bin/env node

/**
 * Script para debuggear problemas con los datos de favoritos
 */

import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

async function debugFavoritesData() {
  console.log('🔍 Debuggeando datos de favoritos...\n');

  try {
    // Importar el adaptador de base de datos
    const { query, get, trackFavorites } = await import('../src/lib/database-adapter.js');

    // 1. Verificar estructura de la tabla
    console.log('📋 Verificando estructura de la tabla track_favorites...');
    
    try {
      // Verificar si la tabla existe y su estructura
      const tableInfo = await query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'track_favorites'
        ORDER BY ordinal_position
      `);
      
      if (tableInfo.length > 0) {
        console.log('✅ Estructura de la tabla track_favorites:');
        tableInfo.forEach(col => {
          console.log(`  • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
        });
      } else {
        console.log('❌ Tabla track_favorites no encontrada');
        return;
      }
    } catch (error) {
      console.log('⚠️  Error obteniendo estructura (probablemente SQLite):', error.message);
      
      // Intentar con SQLite PRAGMA
      try {
        const pragmaInfo = await query('PRAGMA table_info(track_favorites)');
        if (pragmaInfo.length > 0) {
          console.log('✅ Estructura de la tabla track_favorites (SQLite):');
          pragmaInfo.forEach(col => {
            console.log(`  • ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : '(NULLABLE)'}`);
          });
        }
      } catch (sqliteError) {
        console.log('❌ No se pudo obtener estructura de la tabla');
      }
    }

    console.log('\n📊 Verificando datos de ejemplo...');
    
    // 2. Obtener algunos registros de ejemplo
    const sampleFavorites = await query('SELECT * FROM track_favorites LIMIT 3');
    
    if (sampleFavorites.length > 0) {
      console.log(`✅ Encontrados ${sampleFavorites.length} registros de ejemplo:`);
      sampleFavorites.forEach((fav, index) => {
        console.log(`\n  Registro ${index + 1}:`);
        console.log(`    • ID: ${fav.id}`);
        console.log(`    • User ID: ${fav.user_id}`);
        console.log(`    • Track ID: ${fav.track_id}`);
        console.log(`    • Track Name: ${fav.track_name || 'N/A'}`);
        console.log(`    • Artist Name: ${fav.artist_name || 'N/A'}`);
        console.log(`    • Album Name: ${fav.album_name || 'N/A'}`);
        console.log(`    • Added At: ${fav.added_at}`);
        console.log(`    • Created At: ${fav.created_at || 'N/A'}`);
      });
    } else {
      console.log('❌ No hay registros en la tabla track_favorites');
    }

    // 3. Verificar el servicio trackFavorites
    console.log('\n🔧 Verificando servicio trackFavorites...');
    
    if (sampleFavorites.length > 0) {
      const firstUserId = sampleFavorites[0].user_id;
      console.log(`📋 Probando getUserFavorites para usuario ${firstUserId}...`);
      
      try {
        const userFavorites = await trackFavorites.getUserFavorites(firstUserId, 5, 0);
        console.log(`✅ getUserFavorites devolvió ${userFavorites.length} registros`);
        
        if (userFavorites.length > 0) {
          console.log('  Primer registro devuelto:');
          const first = userFavorites[0];
          Object.keys(first).forEach(key => {
            console.log(`    • ${key}: ${first[key]}`);
          });
        }
      } catch (error) {
        console.log(`❌ Error en getUserFavorites: ${error.message}`);
      }
    }

    // 4. Verificar conteo
    console.log('\n📈 Verificando conteos...');
    const totalCount = await query('SELECT COUNT(*) as count FROM track_favorites');
    console.log(`📊 Total de favoritos en la DB: ${totalCount[0]?.count || 0}`);
    
    console.log('\n✅ Debug completado!');
    
  } catch (error) {
    console.error('❌ Error durante el debug:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  debugFavoritesData();
}

export { debugFavoritesData };
