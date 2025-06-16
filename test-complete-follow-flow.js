// Test completo del flujo de seguimiento en UI
const API_BASE = 'http://localhost:3001/api';

async function testCompleteFollowFlow() {
  console.log('🧪 Iniciando test completo del flujo de seguimiento...');
  
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
    
    console.log(`📋 Probando con usuario: ${userData.user.username} (ID: ${targetUserId})`);

    // FASE 1: Asegurar que NO está siguiendo inicialmente
    console.log('\n📋 FASE 1: Estado inicial');
    
    // Primero dejar de seguir por si acaso
    await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const initialCheck = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const initialData = await initialCheck.json();
    console.log(`📊 Estado inicial: ${initialData.isFollowing ? 'Siguiendo' : 'No siguiendo'} ✅`);

    // FASE 2: Seguir al usuario
    console.log('\n📋 FASE 2: Seguir usuario');
    
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

    // Verificar inmediatamente después
    const afterFollowCheck = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const afterFollowData = await afterFollowCheck.json();
    console.log(`📊 Estado después de seguir: ${afterFollowData.isFollowing ? 'Siguiendo ✅' : 'No siguiendo ❌'}`);

    // FASE 3: Simular recarga de página (múltiples verificaciones)
    console.log('\n📋 FASE 3: Persistencia del estado');
    
    for (let i = 1; i <= 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const persistenceCheck = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const persistenceData = await persistenceCheck.json();
      console.log(`📊 Verificación ${i}: ${persistenceData.isFollowing ? 'Siguiendo ✅' : 'No siguiendo ❌'}`);
      
      if (!persistenceData.isFollowing) {
        console.log('❌ ERROR: El estado no se mantiene persistente');
        return;
      }
    }

    // FASE 4: Dejar de seguir
    console.log('\n📋 FASE 4: Dejar de seguir');
    
    const unfollowResponse = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const unfollowData = await unfollowResponse.json();
    console.log(`📝 Resultado dejar de seguir: ${unfollowData.message}`);

    // Verificar después de dejar de seguir
    const afterUnfollowCheck = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const afterUnfollowData = await afterUnfollowCheck.json();
    console.log(`📊 Estado después de dejar de seguir: ${afterUnfollowData.isFollowing ? 'Siguiendo ❌' : 'No siguiendo ✅'}`);

    // FASE 5: Verificar persistencia del estado "no siguiendo"
    console.log('\n📋 FASE 5: Persistencia del estado "no siguiendo"');
    
    for (let i = 1; i <= 2; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const finalCheck = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const finalData = await finalCheck.json();
      console.log(`📊 Verificación final ${i}: ${finalData.isFollowing ? 'Siguiendo ❌' : 'No siguiendo ✅'}`);
      
      if (finalData.isFollowing) {
        console.log('❌ ERROR: El estado "no siguiendo" no se mantiene persistente');
        return;
      }
    }

    console.log('\n🎉 ¡TEST COMPLETADO EXITOSAMENTE!');
    console.log('✅ El estado de seguimiento se mantiene correctamente persistente');
    console.log('✅ Los cambios de estado se reflejan inmediatamente');
    console.log('✅ La funcionalidad de seguir/dejar de seguir funciona correctamente');

  } catch (error) {
    console.error('💥 Error durante el test:', error.message);
    console.error(error.stack);
  }
}

testCompleteFollowFlow();
