// Test del endpoint POST /api/listening-history
const testListeningHistoryEndpoint = async () => {
  // Primero necesitamos un token de autenticación válido
  const loginData = {
    email: 'test@example.com',
    password: 'password123'
  };

  try {
    console.log('🔐 Iniciando sesión para obtener token...');
    
    // Iniciar sesión para obtener el token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    console.log('Login status:', loginResponse.status);
    
    if (!loginResult.success) {
      console.log('❌ No se pudo obtener token. Resultado:', loginResult);
      return;
    }

    const authToken = loginResult.token;
    console.log('✅ Token obtenido exitosamente');

    // Datos del álbum para agregar al historial
    const testAlbum = {
      album: {
        spotify_id: '4aawyAB9vmqN3uQ7FjRGTy',
        name: 'Global Warming',
        artist: 'Pitbull',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273c4d0ee0f34f2e8c2b5f31d1a',
        release_date: '2012-11-19',
        spotify_url: 'https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy'
      }
    };

    console.log('\n🔍 Probando POST /api/listening-history...');
    console.log('📤 Datos de prueba:', JSON.stringify(testAlbum, null, 2));

    const response = await fetch('http://localhost:3000/api/listening-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testAlbum)
    });

    console.log('📥 Status:', response.status, response.statusText);
    
    const responseData = await response.json();
    console.log('📋 Respuesta:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ Endpoint funcionando correctamente');
    } else {
      console.log('❌ Error en el endpoint');
    }

  } catch (error) {
    console.error('❌ Error probando endpoint:', error);
  }
};

testListeningHistoryEndpoint();
