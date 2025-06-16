// Test script para verificar el fix del estado de seguimiento
const API_BASE = 'http://localhost:3001/api';

async function testFollowStatePersistence() {
  console.log('🧪 Iniciando test de persistencia del estado de seguimiento...');
  
  try {
    // Primero hacer login para obtener token
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

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');

    // Obtener el ID del usuario TestTest
    const userResponse = await fetch(`${API_BASE}/user/profile/TestTest`);
    const userData = await userResponse.json();
    const targetUserId = userData.user.id;
    console.log(`📋 Usuario objetivo: ${userData.user.username} (ID: ${targetUserId})`);

    // Primero seguir al usuario
    console.log('📤 Siguiendo al usuario...');
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
    console.log('📝 Resultado seguir:', followData.message);

    // Verificar el estado inmediatamente después de seguir
    const checkResponse1 = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const checkData1 = await checkResponse1.json();
    console.log('📊 Estado después de seguir:', checkData1.isFollowing ? 'Siguiendo ✅' : 'No siguiendo ❌');

    // Simular pasar tiempo (como cuando se recarga la página)
    console.log('⏳ Simulando espera...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar el estado nuevamente (esto simula lo que pasa al recargar la página)
    const checkResponse2 = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const checkData2 = await checkResponse2.json();
    console.log('📊 Estado después de esperar:', checkData2.isFollowing ? 'Siguiendo ✅' : 'No siguiendo ❌');

    // Verificar que el estado se mantiene persistente
    if (checkData1.isFollowing === checkData2.isFollowing && checkData2.isFollowing === true) {
      console.log('🎉 ¡Test EXITOSO! El estado de seguimiento se mantiene persistente');
    } else {
      console.log('❌ Test FALLIDO: El estado no se mantiene persistente');
      console.log(`   Estado inicial: ${checkData1.isFollowing}`);
      console.log(`   Estado después: ${checkData2.isFollowing}`);
    }

    // Limpiar: dejar de seguir al usuario
    console.log('🧹 Limpiando: dejando de seguir al usuario...');
    const unfollowResponse = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const unfollowData = await unfollowResponse.json();
    console.log('📝 Resultado dejar de seguir:', unfollowData.message);

    console.log('🎉 Test completado');

  } catch (error) {
    console.error('💥 Error durante el test:', error.message);
  }
}

testFollowStatePersistence();
