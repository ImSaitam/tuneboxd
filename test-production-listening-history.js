// Test del endpoint listening-history en producción
const jwt = require('jsonwebtoken');

async function testProductionListeningHistory() {
  try {
    // Crear token JWT válido para usuario de producción
    const payload = {
      userId: 2,
      username: 'ImSaitam'
    };
    
    // Usar la misma clave JWT que en producción
    const token = jwt.sign(payload, '721adbe32d24a0e7045eb0d66bc392c4b6da82336056b0ae3ed0b850fce9b004fdaf86f6b80fe9439264c9fec0ac2a9c1b1b7a6d0300f71ae333e16f1636946d4b6d60f132d6ab249cdb61672a7a2e73c319ade77e7c6ca88079c2e5cfc93abf485c24b809d74e94026d2db4838bf9c3a4758b8a4924e712686ef43094603647', { expiresIn: '24h' });
    
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

    console.log('🔍 Probando POST /api/listening-history en producción...');
    console.log('🌐 URL: https://tuneboxd.xyz/api/listening-history');
    
    const response = await fetch('https://tuneboxd.xyz/api/listening-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
          'Authorization': `Bearer ${token}`
        }
      });
      
      const getResponseData = await getResponse.json();
      console.log('📋 GET Respuesta:', JSON.stringify(getResponseData, null, 2));
      
    } else {
      console.log('❌ Error en el endpoint de producción');
    }

  } catch (error) {
    console.error('❌ Error probando endpoint de producción:', error);
  }
}

testProductionListeningHistory();
