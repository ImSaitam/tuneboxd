// Test simple del endpoint POST listening-history
const jwt = require('jsonwebtoken');

async function testListeningHistoryEndpoint() {
  try {
    // Crear un token JWT válido para el usuario con ID 2
    const payload = {
      userId: 2,
      username: 'ImSaitam'
    };
    
    const token = jwt.sign(payload, '721adbe32d24a0e7045eb0d66bc392c4b6da82336056b0ae3ed0b850fce9b004fdaf86f6b80fe9439264c9fec0ac2a9c1b1b7a6d0300f71ae333e16f1636946d4b6d60f132d6ab249cdb61672a7a2e73c319ade77e7c6ca88079c2e5cfc93abf485c24b809d74e94026d2db4838bf9c3a4758b8a4924e712686ef43094603647', { expiresIn: '24h' });
    
    console.log('🔑 Token generado:', token.substring(0, 50) + '...');
    
    const testPayload = {
      album: {
        spotify_id: '4aawyAB9vmqN3uQ7FjRGTy',
        name: 'Global Warming Test',
        artist: 'Pitbull',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273c4d0ee0f34f2e8c2b5f31d1a',
        release_date: '2012-11-19',
        spotify_url: 'https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy'
      }
    };

    console.log('🔍 Probando POST /api/listening-history...');
    
    const response = await fetch('http://localhost:3001/api/listening-history', {
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
      console.log('✅ Endpoint POST funcionando correctamente');
      
      // Probar GET también
      console.log('\n🔍 Probando GET /api/listening-history...');
      const getResponse = await fetch(`http://localhost:3001/api/listening-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const getResponseData = await getResponse.json();
      console.log('📋 GET Respuesta:', JSON.stringify(getResponseData, null, 2));
      
    } else {
      console.log('❌ Error en el endpoint');
    }

  } catch (error) {
    console.error('❌ Error probando endpoint:', error);
  }
}

testListeningHistoryEndpoint();
