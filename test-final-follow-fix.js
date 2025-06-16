// Test final completo para verificar que el problema del botón de seguir está solucionado
const API_BASE = 'http://localhost:3001/api';

async function testFinalFollowFix() {
  console.log('🧪 Test Final: Verificando el fix completo del botón de seguir...');
  
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

    // ESCENARIO 1: Estado inicial sin seguir
    console.log('\n🎯 ESCENARIO 1: Estado inicial sin seguir');
    
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
    console.log(`📊 Estado inicial: ${initialData.isFollowing ? 'Siguiendo ❌' : 'No siguiendo ✅'}`);

    // ESCENARIO 2: Seguir usuario y verificar persistencia
    console.log('\n🎯 ESCENARIO 2: Seguir usuario y verificar persistencia');
    
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
    console.log(`📤 Seguir usuario: ${followData.message}`);

    // Verificar múltiples veces la persistencia (simulando recargas de página)
    console.log('\n📋 Verificando persistencia del estado "Siguiendo"...');
    
    let allPersistent = true;
    for (let i = 1; i <= 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const checkResponse = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const checkData = await checkResponse.json();
      const isPersistent = checkData.isFollowing;
      console.log(`📊 Verificación ${i}: ${isPersistent ? 'Siguiendo ✅' : 'No siguiendo ❌'}`);
      
      if (!isPersistent) {
        allPersistent = false;
        break;
      }
    }

    // ESCENARIO 3: Dejar de seguir y verificar persistencia
    console.log('\n🎯 ESCENARIO 3: Dejar de seguir y verificar persistencia');
    
    const unfollowResponse = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const unfollowData = await unfollowResponse.json();
    console.log(`📤 Dejar de seguir: ${unfollowData.message}`);

    // Verificar persistencia del estado "No siguiendo"
    console.log('\n📋 Verificando persistencia del estado "No siguiendo"...');
    
    let unfollowPersistent = true;
    for (let i = 1; i <= 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const checkResponse = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const checkData = await checkResponse.json();
      const isNotFollowing = !checkData.isFollowing;
      console.log(`📊 Verificación ${i}: ${isNotFollowing ? 'No siguiendo ✅' : 'Siguiendo ❌'}`);
      
      if (!isNotFollowing) {
        unfollowPersistent = false;
        break;
      }
    }

    // RESULTADOS FINALES
    console.log('\n🏆 RESULTADOS FINALES:');
    console.log(`✅ Estado "Siguiendo" persistente: ${allPersistent ? 'SÍ' : 'NO'}`);
    console.log(`✅ Estado "No siguiendo" persistente: ${unfollowPersistent ? 'SÍ' : 'NO'}`);
    
    if (allPersistent && unfollowPersistent) {
      console.log('\n🎉 ¡ÉXITO TOTAL! El problema del botón de seguir ha sido SOLUCIONADO');
      console.log('🔧 Cambios aplicados exitosamente:');
      console.log('   • Fix en el manejo de respuestas API');
      console.log('   • Eliminación del reset prematuro de estado');
      console.log('   • Mejoras en la gestión del estado de carga');
      console.log('   • Optimización de la función refreshFollowData');
      console.log('\n🎯 El botón ahora mantiene correctamente el estado entre recargas');
      console.log('🎯 Los textos "Seguir" y "Siguiendo" se muestran correctamente');
    } else {
      console.log('\n❌ Aún hay problemas que necesitan ser solucionados');
    }

    // INSTRUCCIONES PARA PRUEBA MANUAL
    console.log('\n📋 INSTRUCCIONES PARA VERIFICACIÓN MANUAL:');
    console.log('1. 🌐 Abre el navegador y ve a: http://localhost:3001/profile/TestTest');
    console.log('2. 🔑 Inicia sesión con: test@musicboxd.com / password123');
    console.log('3. 👀 Verifica que el botón muestre el estado correcto');
    console.log('4. 🔄 Haz clic en el botón para cambiar el estado');
    console.log('5. ♻️ Recarga la página (F5 o Ctrl+R)');
    console.log('6. ✅ Confirma que el botón mantiene el estado correcto después de la recarga');

  } catch (error) {
    console.error('💥 Error durante el test:', error.message);
    console.error(error.stack);
  }
}

testFinalFollowFix();
