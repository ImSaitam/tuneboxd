// Test simple del endpoint POST /api/listening-history sin autenticación
const testListeningHistorySimple = async () => {
  try {
    console.log('🔍 Probando POST /api/listening-history (debería fallar por falta de auth)...');

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

    const response = await fetch('http://localhost:3000/api/listening-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAlbum)
    });

    console.log('📥 Status:', response.status, response.statusText);
    
    const responseData = await response.json();
    console.log('📋 Respuesta:', JSON.stringify(responseData, null, 2));

    // Debe devolver 401 por falta de autorización
    if (response.status === 401) {
      console.log('✅ Endpoint requiere autenticación correctamente');
    } else {
      console.log('❌ Endpoint no está validando la autenticación');
    }

  } catch (error) {
    console.error('❌ Error probando endpoint:', error);
  }
};

testListeningHistorySimple();
