#!/usr/bin/env node

/**
 * Script para diagnosticar el problema con la lista ID 4
 */

import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

async function diagnoseLista4() {
  console.log('🔍 Diagnosticando problema con lista ID 4...\n');

  try {
    // Importar el adaptador de base de datos
    const { customListService, query, get } = await import('../src/lib/database-adapter.js');

    console.log('✅ Servicios importados exitosamente');
    
    // Verificar si existe la lista con ID 4
    console.log('\n📋 Verificando si existe la lista con ID 4...');
    
    try {
      const listById = await get('SELECT * FROM lists WHERE id = ?', [4]);
      if (listById) {
        console.log('✅ Lista encontrada en base de datos:', {
          id: listById.id,
          name: listById.name,
          user_id: listById.user_id,
          is_private: listById.is_private
        });
      } else {
        console.log('❌ Lista con ID 4 NO ENCONTRADA en la base de datos');
      }
    } catch (error) {
      console.log('❌ Error consultando lista:', error.message);
    }

    // Verificar usando el servicio customListService
    console.log('\n🔧 Verificando usando customListService...');
    try {
      const listByService = await customListService.getListWithAlbums(4);
      if (listByService) {
        console.log('✅ Lista encontrada via servicio:', {
          id: listByService.id,
          name: listByService.name,
          albums_count: listByService.albums?.length || 0
        });
      } else {
        console.log('❌ Lista NO encontrada via servicio');
      }
    } catch (error) {
      console.log('❌ Error en servicio:', error.message);
    }

    // Listar todas las listas disponibles
    console.log('\n📊 Listando todas las listas disponibles...');
    try {
      const allLists = await query('SELECT id, name, user_id, is_private FROM lists ORDER BY id');
      console.log('📈 Total de listas:', allLists.length);
      
      allLists.forEach(list => {
        console.log(`  • ID ${list.id}: "${list.name}" (Usuario: ${list.user_id}, Privada: ${list.is_private})`);
      });
    } catch (error) {
      console.log('❌ Error listando listas:', error.message);
    }

    // Verificar conectividad básica
    console.log('\n🔗 Verificando conectividad básica...');
    try {
      const testQuery = await query('SELECT NOW() as current_time');
      console.log('✅ Conectividad OK, timestamp:', testQuery[0]?.current_time);
    } catch (error) {
      console.log('❌ Error de conectividad:', error.message);
    }

    console.log('\n✅ Diagnóstico completado!');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  diagnoseLista4();
}

export { diagnoseLista4 };
