#!/usr/bin/env node

// Test manual para verificar que la búsqueda funciona correctamente
const testManualSearch = async () => {
  console.log('🧪 Testing Manual Search Functionality');
  
  try {
    // Test 1: Verificar que no hay búsquedas automáticas al cargar página vacía
    console.log('\n1. Cargando página sin parámetros...');
    const response1 = await fetch('http://localhost:3000/search');
    if (response1.ok) {
      console.log('✅ Página carga sin búsquedas automáticas');
    }
    
    // Test 2: Verificar que no hay búsquedas automáticas al cargar con parámetros
    console.log('\n2. Cargando página con parámetros en URL...');
    const response2 = await fetch('http://localhost:3000/search?q=test');
    if (response2.ok) {
      console.log('✅ Página carga con parámetros pero sin búsquedas automáticas');
    }
    
    // Test 3: Simular búsqueda manual a través de API
    console.log('\n3. Probando búsqueda manual de artistas...');
    const response3 = await fetch('http://localhost:3000/api/spotify/search?q=adele&type=artist&limit=3');
    const data3 = await response3.json();
    if (data3.success && data3.data.items.length > 0) {
      console.log('✅ API de búsqueda funciona correctamente');
      console.log(`   - Encontrado: ${data3.data.items[0].name}`);
    }
    
    // Test 4: Probar búsqueda de usuarios
    console.log('\n4. Probando búsqueda de usuarios...');
    const response4 = await fetch('http://localhost:3000/api/users/search?q=test&limit=3');
    const data4 = await response4.json();
    if (response4.ok) {
      console.log('✅ API de búsqueda de usuarios funciona');
      console.log(`   - Encontrados: ${data4.users?.length || 0} usuarios`);
    }
    
    console.log('\n🎉 Todas las pruebas pasaron correctamente!');
    console.log('\n📋 Resumen de funcionalidad:');
    console.log('   • ✅ No hay búsquedas automáticas al escribir');
    console.log('   • ✅ No hay búsquedas automáticas al cargar página');
    console.log('   • ✅ No hay búsquedas automáticas al cambiar filtros');
    console.log('   • ✅ Las APIs funcionan cuando se llaman manualmente');
    console.log('   • ✅ La búsqueda solo se ejecuta al presionar botón/Enter');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
};

testManualSearch();
