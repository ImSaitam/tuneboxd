#!/usr/bin/env node

/**
 * Script para migrar la tabla list_albums y agregar columnas faltantes
 */

import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

async function migrateListAlbumsTable() {
  console.log('🔧 Migrando tabla list_albums...\n');

  try {
    // Importar el adaptador de base de datos
    const { run, query } = await import('../src/lib/database-adapter.js');

    // Verificar estructura actual de la tabla
    console.log('📋 Verificando estructura actual de la tabla...');
    
    try {
      // Intentar describir la tabla para ver sus columnas
      const tableInfo = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'list_albums' 
        ORDER BY ordinal_position
      `);
      
      console.log('📊 Columnas actuales:');
      tableInfo.forEach(col => {
        console.log(`  • ${col.column_name} (${col.data_type})`);
      });
      
      // Verificar si falta la columna 'notes'
      const hasNotes = tableInfo.some(col => col.column_name === 'notes');
      const hasOrderIndex = tableInfo.some(col => col.column_name === 'order_index');
      const hasUpdatedAt = tableInfo.some(col => col.column_name === 'updated_at');
      
      console.log('\n🔍 Verificando columnas requeridas:');
      console.log(`  notes: ${hasNotes ? '✅ Existe' : '❌ Falta'}`);
      console.log(`  order_index: ${hasOrderIndex ? '✅ Existe' : '❌ Falta'}`);
      console.log(`  updated_at: ${hasUpdatedAt ? '✅ Existe' : '❌ Falta'}`);
      
      // Agregar columnas faltantes
      if (!hasNotes) {
        console.log('\n➕ Agregando columna notes...');
        await run('ALTER TABLE list_albums ADD COLUMN notes TEXT');
        console.log('✅ Columna notes agregada');
      }
      
      if (!hasOrderIndex) {
        console.log('\n➕ Agregando columna order_index...');
        await run('ALTER TABLE list_albums ADD COLUMN order_index INTEGER DEFAULT 0');
        console.log('✅ Columna order_index agregada');
      }
      
      if (!hasUpdatedAt) {
        console.log('\n➕ Agregando columna updated_at...');
        await run('ALTER TABLE list_albums ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ Columna updated_at agregada');
      }
      
      // Verificar y crear índices
      console.log('\n📊 Verificando índices...');
      
      try {
        await run('CREATE INDEX IF NOT EXISTS idx_list_albums_list_id ON list_albums(list_id)');
        await run('CREATE INDEX IF NOT EXISTS idx_list_albums_spotify_album_id ON list_albums(spotify_album_id)');
        console.log('✅ Índices verificados/creados');
      } catch (indexError) {
        console.log('⚠️  Error creando índices (pueden ya existir):', indexError.message);
      }
      
      // Verificación final
      console.log('\n🔍 Verificación final de la estructura...');
      const finalTableInfo = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'list_albums' 
        ORDER BY ordinal_position
      `);
      
      console.log('📊 Estructura final de la tabla:');
      finalTableInfo.forEach(col => {
        console.log(`  • ${col.column_name} (${col.data_type})`);
      });
      
      console.log('\n✅ Migración de tabla list_albums completada!');
      
    } catch (error) {
      console.error('❌ Error verificando estructura de tabla:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error migrando tabla list_albums:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateListAlbumsTable();
}

export { migrateListAlbumsTable };
