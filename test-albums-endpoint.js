// Test del endpoint POST /api/albums
const testAlbumEndpoint = async () => {
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

  try {
    console.log('🔍 Probando POST /api/albums...');
    console.log('📤 Datos de prueba:', JSON.stringify(testAlbum, null, 2));

    const response = await fetch('http://localhost:3000/api/albums', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAlbum)
    });

    console.log('📥 Status:', response.status, response.statusText);
    
    const responseData = await response.json();
    console.log('📋 Respuesta:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ Endpoint funcionando correctamente');
      
      // Probar GET también
      console.log('\n🔍 Probando GET /api/albums...');
      const getResponse = await fetch(`http://localhost:3000/api/albums?spotify_id=${testAlbum.album.spotify_id}`);
      const getResponseData = await getResponse.json();
      console.log('📋 GET Respuesta:', JSON.stringify(getResponseData, null, 2));
      
    } else {
      console.log('❌ Error en el endpoint');
    }

  } catch (error) {
    console.error('❌ Error probando endpoint:', error);
  }
};

testAlbumEndpoint();
