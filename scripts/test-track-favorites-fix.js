#!/usr/bin/env node

/**
 * Script para probar el endpoint de favoritos de tracks
 */

import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

async function testTrackFavoritesEndpoint() {
  console.log('🎵 Probando el endpoint de favoritos de tracks...\n');

  try {
    // Importar el servicio directamente
    const { trackFavorites } = await import('../src/lib/database-adapter.js');

    console.log('✅ Servicio trackFavorites importado exitosamente');
    
    // Verificar métodos disponibles
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(trackFavorites))
      .concat(Object.getOwnPropertyNames(trackFavorites))
      .filter(name => typeof trackFavorites[name] === 'function');
    
    console.log('\n📋 Métodos disponibles en trackFavorites:');
    methods.forEach(method => {
      console.log(`  • ${method}`);
    });
    
    // Verificar específicamente los métodos que necesita el endpoint
    const requiredMethods = [
      'addTrackToFavorites',
      'removeTrackFromFavorites', 
      'getUserFavorites',
      'getUserFavoritesCount',
      'isTrackInFavorites',
      'getTrackStats'
    ];
    
    console.log('\n🔍 Verificando métodos requeridos:');
    let allMethodsExist = true;
    
    requiredMethods.forEach(method => {
      if (typeof trackFavorites[method] === 'function') {
        console.log(`  ✅ ${method}: Existe`);
      } else {
        console.log(`  ❌ ${method}: NO EXISTE`);
        allMethodsExist = false;
      }
    });
    
    if (allMethodsExist) {
      console.log('\n✅ Todos los métodos requeridos están disponibles!');
      console.log('🎯 El error "addTrackToFavorites is not a function" debería estar resuelto');
    } else {
      console.log('\n❌ Faltan algunos métodos requeridos');
    }

    // Probar una consulta básica para verificar conectividad
    console.log('\n🔗 Probando conectividad con la base de datos...');
    try {
      const count = await trackFavorites.getUserFavoritesCount(1); // Usuario ficticio
      console.log(`✅ Conectividad exitosa. Conteo ejemplo: ${count}`);
    } catch (error) {
      console.log(`⚠️  Error de conectividad (esto es normal en desarrollo): ${error.message}`);
    }

    console.log('\n✅ Prueba completada!');
    
  } catch (error) {
    console.error('❌ Error al probar el servicio trackFavorites:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testTrackFavoritesEndpoint();
}

export { testTrackFavoritesEndpoint };
