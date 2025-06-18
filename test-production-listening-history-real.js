// Test completo del endpoint listening-history en producción con login real
async function testProductionWithRealLogin() {
  try {
    console.log('🔐 Obteniendo token de producción...');
    
    // Hacer login en producción
    const loginResponse = await fetch('https://tuneboxd.xyz/api/auth/login', {
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
      console.log('❌ No se pudo obtener token de producción:', loginResult);
      return;
    }

    const authToken = loginResult.token;
    console.log('✅ Token de producción obtenido exitosamente');

    const testPayload = {
      album: {
        spotify_id: '4aawyAB9vmqN3uQ7FjRGTyProd',
        name: 'Test Production Album',
        artist: 'Test Artist',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273c4d0ee0f34f2e8c2b5f31d1a',
        release_date: '2012-11-19',
        spotify_url: 'https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy'
      }
    };

    console.log('\n🔍 Probando POST /api/listening-history en producción...');
    
    const response = await fetch('https://tuneboxd.xyz/api/listening-history', {
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
      console.log('✅ Endpoint POST en producción funcionando correctamente');
      
      // Probar GET también
      console.log('\n🔍 Probando GET /api/listening-history en producción...');
      const getResponse = await fetch('https://tuneboxd.xyz/api/listening-history', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('GET Status:', getResponse.status);
      const getResponseData = await getResponse.json();
      console.log('📋 GET Respuesta:', JSON.stringify(getResponseData, null, 2));
      
    } else {
      console.log('❌ Error en el endpoint de producción');
    }

  } catch (error) {
    console.error('❌ Error probando endpoint de producción:', error);
  }
}

testProductionWithRealLogin();
