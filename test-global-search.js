#!/usr/bin/env node

/**
 * Script de prueba para la funcionalidad de búsqueda global
 * Verifica que todos los endpoints estén funcionando correctamente
 */

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(url, expectedStatus = 200) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
    
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🔍 Iniciando pruebas de búsqueda global...\n');
  
  const tests = [
    {
      name: 'Búsqueda de artistas en Spotify',
      url: `${BASE_URL}/api/spotify/search?q=beatles&type=artist&limit=5`,
      validate: (data) => data.success && data.data && data.data.items && data.data.items.length > 0
    },
    {
      name: 'Búsqueda de álbumes en Spotify',
      url: `${BASE_URL}/api/spotify/search?q=abbey%20road&type=album&limit=5`,
      validate: (data) => data.success && data.data && data.data.items && data.data.items.length > 0
    },
    {
      name: 'Búsqueda de canciones en Spotify',
      url: `${BASE_URL}/api/spotify/search?q=let%20it%20be&type=track&limit=5`,
      validate: (data) => data.success && data.data && data.data.items && data.data.items.length > 0
    },
    {
      name: 'Búsqueda de usuarios',
      url: `${BASE_URL}/api/users/search?q=test&limit=5`,
      validate: (data) => data.success && Array.isArray(data.users) && data.pagination
    },
    {
      name: 'Búsqueda de usuarios con paginación',
      url: `${BASE_URL}/api/users/search?q=test&limit=2&offset=0`,
      validate: (data) => data.success && Array.isArray(data.users) && data.pagination && 
                        data.pagination.hasOwnProperty('hasMore')
    },
    {
      name: 'Búsqueda vacía (debe fallar)',
      url: `${BASE_URL}/api/spotify/search?q=&type=artist`,
      expectedStatus: 400,
      validate: (data) => !data.success && data.error
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`🧪 ${test.name}... `);
    
    const result = await testEndpoint(test.url, test.expectedStatus);
    
    if (result.success) {
      if (test.validate && !test.validate(result.data)) {
        console.log('❌ FALLO - Datos no válidos');
        failed++;
      } else {
        console.log('✅ ÉXITO');
        passed++;
      }
    } else {
      console.log(`❌ FALLO - ${result.error}`);
      failed++;
    }
  }

  console.log(`\n📊 Resultados:`);
  console.log(`✅ Pruebas exitosas: ${passed}`);
  console.log(`❌ Pruebas fallidas: ${failed}`);
  console.log(`📈 Tasa de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! La búsqueda global está funcionando correctamente.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración.');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint };
