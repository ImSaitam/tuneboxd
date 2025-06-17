const { default: fetch } = require('node-fetch');

async function testFavoritesWithUserIdFix() {
  console.log('🧪 Prueba: Fix de user_id en sistema de favoritos\n');

  try {
    // 1. Login para obtener token
    console.log('1. 🔐 Iniciando sesión...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
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
    console.log('   Estado login:', loginResponse.status);
    
    if (!loginData.success) {
      console.log('❌ Error en login:', loginData.message);
      return;
    }

    const token = loginData.token;
    console.log('✅ Login exitoso');

    // 2. Verificar token y extraer payload
    console.log('\n2. 🔍 Verificando estructura del token...');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('   Token contiene:', Object.keys(decoded));
    console.log('   userId presente:', !!decoded.userId);
    console.log('   userId valor:', decoded.userId);

    // 3. Intentar agregar track a favoritos
    console.log('\n3. ❤️ Agregando track a favoritos...');
    const addResponse = await fetch('http://localhost:3000/api/track-favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        trackId: 'test-track-123',
        trackName: 'Test Song',
        artistName: 'Test Artist',
        albumName: 'Test Album',
        imageUrl: 'https://example.com/image.jpg',
        durationMs: 210000
      })
    });

    const addData = await addResponse.json();
    console.log('   Estado:', addResponse.status);
    console.log('   Respuesta:', addData);

    if (addResponse.status === 200) {
      console.log('✅ Track agregado exitosamente');
    } else {
      console.log('❌ Error agregando track:', addData.error);
    }

    // 4. Verificar que el track está en favoritos
    console.log('\n4. 📋 Verificando favoritos...');
    const checkResponse = await fetch(`http://localhost:3000/api/track-favorites?trackId=test-track-123`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const checkData = await checkResponse.json();
    console.log('   Estado:', checkResponse.status);
    console.log('   En favoritos:', checkData.isInFavorites);

    // 5. Limpiar: remover track de favoritos
    console.log('\n5. 🧹 Limpiando: removiendo track...');
    const removeResponse = await fetch('http://localhost:3000/api/track-favorites', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        trackId: 'test-track-123'
      })
    });

    const removeData = await removeResponse.json();
    console.log('   Estado:', removeResponse.status);
    console.log('   Respuesta:', removeData);

    console.log('\n🎉 Prueba completada');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testFavoritesWithUserIdFix();
