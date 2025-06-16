// Test específico para verificar el estado del botón de seguir en la UI
const API_BASE = 'http://localhost:3001/api';

async function testUIFollowState() {
  console.log('🧪 Iniciando test del estado del botón de seguir en UI...');
  
  try {
    // Login como usuario de prueba
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@musicboxd.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');

    // Obtener información del usuario TestTest
    const userResponse = await fetch(`${API_BASE}/user/profile/TestTest`);
    const userData = await userResponse.json();
    const targetUserId = userData.user.id;
    
    console.log(`📋 Usuario objetivo: ${userData.user.username} (ID: ${targetUserId})`);

    // PASO 1: Asegurar que NO está siguiendo inicialmente
    console.log('\n📋 PASO 1: Limpiar estado inicial');
    
    await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Verificar estado inicial
    const initialCheck = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const initialData = await initialCheck.json();
    console.log(`📊 Estado inicial: ${initialData.isFollowing ? 'Siguiendo' : 'No siguiendo'}`);

    // PASO 2: Seguir al usuario
    console.log('\n📋 PASO 2: Seguir usuario');
    
    const followResponse = await fetch(`${API_BASE}/users/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: targetUserId
      })
    });

    const followData = await followResponse.json();
    console.log(`📝 Resultado seguir: ${followData.message}`);

    // PASO 3: Verificar múltiples veces para simular recargas
    console.log('\n📋 PASO 3: Verificar estado múltiples veces (simulando recargas)');
    
    for (let i = 1; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const checkResponse = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const checkData = await checkResponse.json();
      const status = checkData.isFollowing ? '✅ Siguiendo' : '❌ No siguiendo';
      console.log(`📊 Verificación ${i}: ${status}`);
      
      // Mostrar detalles de la respuesta
      console.log(`   Respuesta completa: ${JSON.stringify(checkData)}`);
      
      if (!checkData.isFollowing) {
        console.log('❌ ERROR: El estado se perdió en la verificación', i);
        break;
      }
    }

    // PASO 4: Verificar si hay algún problema con los headers
    console.log('\n📋 PASO 4: Verificar headers y autenticación');
    
    const authTest = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Status de respuesta: ${authTest.status}`);
    console.log(`📡 Headers enviados: Authorization: Bearer ${token.substring(0, 20)}...`);
    
    const authTestData = await authTest.json();
    console.log(`📡 Respuesta de auth test: ${JSON.stringify(authTestData)}`);

    // PASO 5: Probar la página del perfil específicamente
    console.log('\n📋 PASO 5: Instrucciones para probar en el navegador');
    console.log('🌐 Abre el navegador y ve a: http://localhost:3001/profile/TestTest');
    console.log('👀 Verifica que el botón muestre "Siguiendo"');
    console.log('🔄 Recarga la página (F5 o Ctrl+R)');
    console.log('🔍 Observa si el botón cambia a "Seguir"');

    // Limpiar al final
    console.log('\n🧹 Limpiando estado...');
    await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🎉 Test completado. Por favor verifica manualmente en el navegador.');

  } catch (error) {
    console.error('💥 Error durante el test:', error.message);
    console.error(error.stack);
  }
}

testUIFollowState();
