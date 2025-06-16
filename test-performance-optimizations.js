// Script para probar el rendimiento de las APIs optimizadas
const API_BASE = 'http://localhost:3001';

// Función para medir tiempo de respuesta
async function measureAPIPerformance(endpoint, description) {
  const startTime = performance.now();
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const endTime = performance.now();
    const data = await response.json();
    
    const responseTime = endTime - startTime;
    const fromCache = data.fromCache ? ' (desde cache)' : '';
    
    console.log(`✅ ${description}: ${responseTime.toFixed(2)}ms${fromCache}`);
    console.log(`   - Datos: ${JSON.stringify(data).length} bytes`);
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Threads: ${data.threads?.length || 0}`);
    
    return { responseTime, dataSize: JSON.stringify(data).length, fromCache: data.fromCache };
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    return null;
  }
}

async function testPerformance() {
  console.log('🚀 Probando rendimiento de APIs optimizadas...\n');

  // Test 1: API unificada (nueva)
  console.log('📊 Test 1: API Unificada /api/forum/data');
  const unifiedAPI = await measureAPIPerformance('/api/forum/data', 'API Unificada');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: API unificada segunda vez (debería venir del cache)
  console.log('\n📋 Test 2: API Unificada (segunda llamada - debería ser cache)');
  const unifiedAPICache = await measureAPIPerformance('/api/forum/data', 'API Unificada (cache)');
  
  console.log('\n' + '='.repeat(50));
  
  // Test 3: APIs separadas (método anterior)
  console.log('📊 Test 3: APIs Separadas (método anterior)');
  
  const separateStart = performance.now();
  
  const [threadsRes, categoriesRes, languagesRes] = await Promise.all([
    measureAPIPerformance('/api/forum/threads', 'Threads API'),
    measureAPIPerformance('/api/forum/categories', 'Categories API'),
    measureAPIPerformance('/api/forum/languages', 'Languages API')
  ]);
  
  const separateEnd = performance.now();
  const totalSeparateTime = separateEnd - separateStart;
  
  console.log('\n📈 RESULTADOS DE RENDIMIENTO:');
  console.log('=' * 50);
  
  if (unifiedAPI && unifiedAPICache) {
    console.log(`🔥 API Unificada (primera vez): ${unifiedAPI.responseTime.toFixed(2)}ms`);
    console.log(`⚡ API Unificada (cache): ${unifiedAPICache.responseTime.toFixed(2)}ms`);
    console.log(`🐌 APIs Separadas (3 requests): ${totalSeparateTime.toFixed(2)}ms`);
    
    const improvement = ((totalSeparateTime - unifiedAPI.responseTime) / totalSeparateTime * 100);
    const cacheImprovement = ((unifiedAPI.responseTime - unifiedAPICache.responseTime) / unifiedAPI.responseTime * 100);
    
    console.log(`\n🎯 MEJORAS DE RENDIMIENTO:`);
    console.log(`   - Reducción con API unificada: ${improvement.toFixed(1)}%`);
    console.log(`   - Mejora adicional con cache: ${cacheImprovement.toFixed(1)}%`);
    console.log(`   - Reducción de requests: 3 → 1 (66.7% menos)`);
  }
  
  console.log('\n🔍 Test de filtros con cache:');
  
  // Test filtros
  await measureAPIPerformance('/api/forum/data?category=general', 'Filtro por categoría');
  await measureAPIPerformance('/api/forum/data?language=es', 'Filtro por idioma');
  await measureAPIPerformance('/api/forum/data?category=general&language=es', 'Filtros combinados');
  
  // Test cache de filtros (segunda llamada)
  console.log('\n📋 Segunda llamada con filtros (cache):');
  await measureAPIPerformance('/api/forum/data?category=general&language=es', 'Filtros combinados (cache)');
}

// Ejecutar tests
testPerformance().catch(console.error);
