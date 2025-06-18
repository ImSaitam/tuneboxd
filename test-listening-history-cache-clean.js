// Test simple del endpoint listening-history después de limpiar cache
const testListeningHistoryAfterCacheClean = async () => {
  // Probar usando un token JWT válido de un usuario existente
  const testPayload = {
    album: {
      spotify_id: '4aawyAB9vmqN3uQ7FjRGTy',
      name: 'Global Warming',
      artist: 'Pitbull',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273c4d0ee0f34f2e8c2b5f31d1a',
      release_date: '2012-11-19',
      spotify_url: 'https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy'
    }
  };

  try {
    console.log('🔍 Probando POST /api/listening-history en puerto 3001...');
    console.log('📤 Datos de prueba:', JSON.stringify(testPayload, null, 2));

    // Primero necesitamos obtener un token válido
    console.log('🔐 Obteniendo token de autenticación...');
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'matutedesanto@gmail.com',
        password: 'password123'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Login status:', loginResponse.status);
    
    if (!loginResult.success) {
      console.log('❌ No se pudo obtener token:', loginResult);
      return;
    }

    const authToken = loginResult.token;
    console.log('✅ Token obtenido exitosamente');

    // Ahora probar el endpoint de listening-history
    const response = await fetch('http://localhost:3001/api/listening-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📥 Status:', response.status, response.statusText);
    
    const responseData = await response.json();
    console.log('📋 Respuesta:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ Endpoint funcionando correctamente después de limpiar cache');
    } else {
      console.log('❌ Error en el endpoint:', responseData);
    }

  } catch (error) {
    console.error('❌ Error probando endpoint:', error);
  }
};

testListeningHistoryAfterCacheClean();
