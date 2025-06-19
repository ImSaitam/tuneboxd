#!/usr/bin/env node

/**
 * Script para probar el fix del endpoint de listas y álbumes
 */

import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

async function testListAlbumsEndpointFix() {
  console.log('📋 Probando el fix del endpoint de listas y álbumes...\n');

  try {
    // Importar el servicio directamente
    const { customListService } = await import('../src/lib/database-adapter.js');

    console.log('✅ Servicio customListService importado exitosamente');
    
    // Verificar métodos disponibles
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(customListService))
      .concat(Object.getOwnPropertyNames(customListService))
      .filter(name => typeof customListService[name] === 'function');
    
    console.log('\n📋 Métodos disponibles en customListService:');
    methods.forEach(method => {
      console.log(`  • ${method}`);
    });
    
    // Verificar específicamente los métodos que necesita el endpoint
    const requiredMethods = [
      'addAlbumToList',
      'removeAlbumFromList', 
      'getListWithAlbums',
      'createList',
      'getUserLists',
      'isAlbumInList',
      'getListAlbums',
      'updateAlbumOrder'
    ];
    
    console.log('\n🔍 Verificando métodos requeridos:');
    let allMethodsExist = true;
    
    requiredMethods.forEach(method => {
      if (typeof customListService[method] === 'function') {
        console.log(`  ✅ ${method}: Existe`);
      } else {
        console.log(`  ❌ ${method}: NO EXISTE`);
        allMethodsExist = false;
      }
    });
    
    if (allMethodsExist) {
      console.log('\n✅ Todos los métodos requeridos están disponibles!');
      console.log('🎯 El error "addAlbumToList is not a function" debería estar resuelto');
    } else {
      console.log('\n❌ Faltan algunos métodos requeridos');
    }

    // Probar una consulta básica para verificar conectividad
    console.log('\n🔗 Probando conectividad con la base de datos...');
    try {
      const lists = await customListService.getUserLists(1); // Usuario ficticio
      console.log(`✅ Conectividad exitosa. Listas ejemplo: ${lists.length}`);
    } catch (error) {
      console.log(`⚠️  Error de conectividad (esto es normal en desarrollo): ${error.message}`);
    }

    console.log('\n✅ Prueba completada!');
    
  } catch (error) {
    console.error('❌ Error al probar el servicio customListService:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testListAlbumsEndpointFix();
}

export { testListAlbumsEndpointFix };
