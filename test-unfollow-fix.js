// Test script para verificar que el fix de dejar de seguir usuarios funciona
const API_BASE = 'http://localhost:3000/api';

async function testUnfollowUser() {
  console.log('🧪 Iniciando test de dejar de seguir usuario...');
  
  // Esperar un poco para asegurar que el servidor esté listo
  await new Promise(resolve => setTimeout(resolve, 1000));
  
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

    // Primero seguir al usuario (para asegurarnos de que podemos dejarlo de seguir)
    const followResponse = await fetch(`${API_BASE}/users/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: 11 // Usuario TestTest
      })
    });

    const followData = await followResponse.json();
    console.log('📝 Resultado seguir:', followData.message);

    // Ahora intentar dejar de seguir al usuario
    const unfollowResponse = await fetch(`${API_BASE}/users/follow?user_id=11`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const unfollowData = await unfollowResponse.json();
    
    if (unfollowResponse.ok) {
      console.log('✅ Dejar de seguir exitoso:', unfollowData.message);
    } else {
      console.log('❌ Error al dejar de seguir:', unfollowData.message);
      console.log('🔍 Detalles:', unfollowData);
    }

    // Verificar el estado del seguimiento
    const checkResponse = await fetch(`${API_BASE}/users/follow?user_id=11`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const checkData = await checkResponse.json();
    console.log('📊 Estado del seguimiento:', checkData.isFollowing ? 'Siguiendo' : 'No siguiendo');

    console.log('🎉 Test completado');

  } catch (error) {
    console.error('💥 Error durante el test:', error.message);
  }
}

testUnfollowUser();
