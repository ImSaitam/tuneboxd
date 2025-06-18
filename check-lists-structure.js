#!/usr/bin/env node

// Script para verificar la estructura de la tabla lists
import { query } from './src/lib/database-adapter.js';

async function checkListsStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla lists...');

    // Obtener estructura de la tabla lists
    const structure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'lists' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura de la tabla lists:');
    structure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });

    // Verificar estructura de list_albums
    const listAlbumsStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'list_albums' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura de la tabla list_albums:');
    listAlbumsStructure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });

    // Intentar hacer una consulta de prueba
    console.log('\n🧪 Probando consulta getUserLists...');
    const testResult = await query(`
      SELECT 
        l.*,
        COUNT(la.album_id) as album_count
       FROM lists l
       LEFT JOIN list_albums la ON l.id = la.list_id
       WHERE l.user_id = ?
       GROUP BY l.id
       ORDER BY l.created_at DESC
       LIMIT 5
    `, [1]);
    
    console.log(`✅ Consulta exitosa, resultados: ${testResult.length} listas`);

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

checkListsStructure();
