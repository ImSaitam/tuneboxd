// Test script para verificar que el fix de seguir usuarios funciona
const API_BASE = 'http://localhost:3000/api';

async function testFollowUser() {
  console.log('🧪 Iniciando test de seguir usuario...');
  
  try {
    // Primero hacer login para obtener token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@musicboxd.com',  // Usuario existente
        password: 'password123' // Password típico para usuario de prueba
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');

    // Ahora intentar seguir al usuario con ID 7 (forumtester)
    const followResponse = await fetch(`${API_BASE}/users/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: 7
      })
    });

    const followData = await followResponse.json();
    
    if (followResponse.ok) {
      console.log('✅ Seguir usuario exitoso:', followData.message);
    } else {
      console.log('❌ Error al seguir usuario:', followData.message);
    }

    // Verificar el estado del seguimiento
    const checkResponse = await fetch(`${API_BASE}/users/follow?user_id=7`, {
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

testFollowUser();
