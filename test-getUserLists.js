#!/usr/bin/env node

// Script para probar la consulta getUserLists corregida
import { query } from './src/lib/database-adapter.js';

async function testGetUserLists() {
  try {
    console.log('🧪 Probando consulta getUserLists corregida...');

    const testResult = await query(`
      SELECT 
        l.*,
        COUNT(la.spotify_album_id) as album_count
       FROM lists l
       LEFT JOIN list_albums la ON l.id = la.list_id
       WHERE l.user_id = ?
       GROUP BY l.id, l.user_id, l.name, l.description, l.is_private, l.created_at, l.updated_at
       ORDER BY l.created_at DESC
       LIMIT 5
    `, [1]);
    
    console.log(`✅ Consulta exitosa, resultados: ${testResult.length} listas`);
    
    if (testResult.length > 0) {
      console.log('\n📋 Ejemplo de resultado:');
      console.log(JSON.stringify(testResult[0], null, 2));
    }

    // Probar también el método directamente
    console.log('\n🔧 Probando customListService.getUserLists...');
    const { customListService } = await import('./src/lib/database-adapter.js');
    
    const lists = await customListService.getUserLists(1, true);
    console.log(`✅ customListService.getUserLists exitoso, resultados: ${lists.length} listas`);

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testGetUserLists();
