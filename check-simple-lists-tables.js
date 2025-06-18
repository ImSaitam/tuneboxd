#!/usr/bin/env node

// Script simple para verificar tablas de listas
import { query } from './src/lib/database-adapter.js';

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas de listas...');

    // Intentar consultar custom_lists
    try {
      const customLists = await query('SELECT COUNT(*) as count FROM custom_lists LIMIT 1');
      console.log('✅ Tabla custom_lists existe');
      console.log(`📊 Registros en custom_lists: ${customLists[0]?.count || 0}`);
    } catch (error) {
      console.log('❌ Tabla custom_lists no existe:', error.message);
    }

    // Intentar consultar lists
    try {
      const lists = await query('SELECT COUNT(*) as count FROM lists LIMIT 1');
      console.log('✅ Tabla lists existe');
      console.log(`📊 Registros en lists: ${lists[0]?.count || 0}`);
    } catch (error) {
      console.log('❌ Tabla lists no existe:', error.message);
    }

    // Intentar consultar custom_list_albums
    try {
      const customListAlbums = await query('SELECT COUNT(*) as count FROM custom_list_albums LIMIT 1');
      console.log('✅ Tabla custom_list_albums existe');
      console.log(`📊 Registros en custom_list_albums: ${customListAlbums[0]?.count || 0}`);
    } catch (error) {
      console.log('❌ Tabla custom_list_albums no existe:', error.message);
    }

    // Intentar listar todas las tablas (si es PostgreSQL)
    try {
      const allTables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      console.log('\n📋 Todas las tablas disponibles:');
      allTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } catch (error) {
      console.log('❌ No se pudieron listar las tablas:', error.message);
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

checkTables();
