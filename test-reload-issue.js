// Test simple para verificar el problema de recarga
const API_BASE = 'http://localhost:3000/api';

async function testReloadIssue() {
  console.log('🧪 Test de Problema de Recarga...');
  
  try {
    // Login
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
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');

    // Obtener usuario objetivo
    const userResponse = await fetch(`${API_BASE}/user/profile/TestTest`);
    const userData = await userResponse.json();
    const targetUserId = userData.user.id;
    
    console.log(`📋 Usuario objetivo: ${userData.user.username} (ID: ${targetUserId})`);

    // Seguir al usuario
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

    if (followResponse.ok) {
      console.log('✅ Usuario seguido exitosamente');
    }

    // Verificar estado
    const checkResponse = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const checkData = await checkResponse.json();
    console.log(`📊 Estado actual: ${checkData.isFollowing ? 'Siguiendo ✅' : 'No siguiendo ❌'}`);

    console.log('\n📋 INSTRUCCIONES PARA VERIFICAR EL PROBLEMA:');
    console.log('1. 🌐 Abre el navegador en: http://localhost:3000/profile/TestTest');
    console.log('2. 🔑 Inicia sesión con: test@musicboxd.com / password123');
    console.log('3. ✅ El botón debería mostrar "Siguiendo"');
    console.log('4. 🔄 RECARGA LA PÁGINA (F5 o Ctrl+R)');
    console.log('5. 👀 Observa si el botón:');
    console.log('   - ❌ Muestra "Seguir" (PROBLEMA)');
    console.log('   - ✅ Muestra "Siguiendo" (CORRECTO)');
    console.log('   - 🔄 Muestra "Verificando..." y luego "Siguiendo" (ACEPTABLE)');
    
    console.log('\n📝 Con los cambios implementados, el botón debería:');
    console.log('• Mostrar "Verificando..." brevemente al recargar');
    console.log('• Luego cambiar a "Siguiendo" correctamente');
    console.log('• Mantener el estado correcto permanentemente');

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testReloadIssue();
