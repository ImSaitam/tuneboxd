// Test para verificar los logs de depuración en la recarga
const API_BASE = 'http://localhost:3000/api';

async function setupForBrowserTest() {
  console.log('🔧 Configurando datos para prueba en navegador...');
  
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

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Usuario logueado');

    // Obtener usuario objetivo
    const userResponse = await fetch(`${API_BASE}/user/profile/TestTest`);
    const userData = await userResponse.json();
    const targetUserId = userData.user.id;

    // Asegurar que el usuario esté siendo seguido
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
      console.log('✅ Usuario TestTest está siendo seguido');
    }

    // Verificar estado final
    const checkResponse = await fetch(`${API_BASE}/users/follow?user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const checkData = await checkResponse.json();
    console.log(`📊 Estado confirmado: ${checkData.isFollowing ? 'Siguiendo ✅' : 'No siguiendo ❌'}`);

    console.log('\n🧪 INSTRUCCIONES PARA PROBAR:');
    console.log('════════════════════════════════════════════════════════');
    console.log('1. 🌐 Abre http://localhost:3000/profile/TestTest en el navegador');
    console.log('2. 🔑 Inicia sesión con: test@musicboxd.com / password123');
    console.log('3. 🔍 Abre las herramientas de desarrollador (F12)');
    console.log('4. 📋 Ve a la pestaña "Console"');
    console.log('5. 🔄 Recarga la página (F5 o Ctrl+R)');
    console.log('6. 👀 Observa los logs en la consola:');
    console.log('   • Deberías ver logs como:');
    console.log('     - "Cargando perfil de usuario: TestTest"');
    console.log('     - "Usuario autenticado: true"');
    console.log('     - "Verificando estado de seguimiento para TestTest..."');
    console.log('     - "🔄 Ejecutando verificación de seguimiento post-carga..."');
    console.log('     - "Estado de seguimiento obtenido: true"');
    console.log('');
    console.log('7. 🎯 El botón debería:');
    console.log('   • Mostrar inicialmente "Verificando..." (estado de carga)');
    console.log('   • Cambiar a "Siguiendo" después de la verificación');
    console.log('   • NO mostrar "Seguir" en ningún momento');
    console.log('');
    console.log('❌ Si el botón muestra "Seguir" después de recargar:');
    console.log('   • Verifica los logs de la consola');
    console.log('   • Busca errores en la verificación');
    console.log('   • Reporta qué logs exactos ves');
    console.log('════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('💥 Error configurando test:', error.message);
  }
}

setupForBrowserTest();
