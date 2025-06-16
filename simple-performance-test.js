// Script simple para probar las APIs optimizadas
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

async function testAPI(endpoint, name) {
  const start = Date.now();
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    const end = Date.now();
    
    console.log(`✅ ${name}: ${end - start}ms`);
    console.log(`   Threads: ${data.threads?.length || 'N/A'}`);
    console.log(`   From cache: ${data.fromCache ? 'Sí' : 'No'}`);
    console.log(`   Size: ${JSON.stringify(data).length} bytes\n`);
    
    return { time: end - start, fromCache: data.fromCache };
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Probando APIs optimizadas...\n');
  
  // Primera llamada a API unificada
  console.log('📊 Primera llamada a API unificada:');
  await testAPI('/api/forum/data', 'API Unificada');
  
  // Segunda llamada (debería venir del cache)
  console.log('📋 Segunda llamada (cache):');
  await testAPI('/api/forum/data', 'API Unificada (cache)');
  
  // Prueba con filtros
  console.log('🔍 Con filtros:');
  await testAPI('/api/forum/data?category=general&language=es', 'Filtros combinados');
  
  console.log('✅ Pruebas completadas!');
}

main().catch(console.error);
