#!/usr/bin/env node

// Script para verificar la estructura de las tablas de listas
import { getDatabaseInfo } from './src/lib/database-adapter.js';

async function checkCustomListsTables() {
  console.log('🔍 Verificando estructura de tablas de listas...');
  
  try {
    const dbInfo = await getDatabaseInfo();
    console.log('✅ Conexión a base de datos exitosa');
    console.log(`📍 Entorno: ${dbInfo.environment}`);
    
    // Verificar si existe la tabla custom_lists
    const customListsCheck = await dbInfo.client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'custom_lists'
    `);
    
    console.log(`\n📋 Tabla custom_lists: ${customListsCheck.rows.length > 0 ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    
    if (customListsCheck.rows.length > 0) {
      // Obtener estructura de custom_lists
      const customListsStructure = await dbInfo.client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'custom_lists' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📄 Estructura de custom_lists:');
      customListsStructure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });
    }
    
    // Verificar si existe la tabla custom_list_albums
    const customListAlbumsCheck = await dbInfo.client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'custom_list_albums'
    `);
    
    console.log(`\n📋 Tabla custom_list_albums: ${customListAlbumsCheck.rows.length > 0 ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    
    if (customListAlbumsCheck.rows.length > 0) {
      // Obtener estructura de custom_list_albums
      const customListAlbumsStructure = await dbInfo.client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'custom_list_albums' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📄 Estructura de custom_list_albums:');
      customListAlbumsStructure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });
    }
    
    // Verificar si existe una tabla alternativa como 'lists'
    const listsCheck = await dbInfo.client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'lists'
    `);
    
    console.log(`\n📋 Tabla lists (alternativa): ${listsCheck.rows.length > 0 ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    
    if (listsCheck.rows.length > 0) {
      const listsStructure = await dbInfo.client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'lists' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📄 Estructura de lists:');
      listsStructure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });
    }
    
    // Listar todas las tablas que contengan 'list' en el nombre
    const allListTables = await dbInfo.client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%list%'
      ORDER BY table_name
    `);
    
    console.log(`\n🔍 Todas las tablas relacionadas con 'list':`);
    if (allListTables.rows.length > 0) {
      allListTables.rows.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      console.log('  ❌ No se encontraron tablas relacionadas con listas');
    }
    
    await dbInfo.client.end();
    
  } catch (error) {
    console.error('💥 Error verificando tablas de listas:', error);
  }
}

checkCustomListsTables();
