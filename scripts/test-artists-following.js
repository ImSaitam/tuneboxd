// Script para probar el endpoint de artistas seguidos
import fetch from 'node-fetch';

async function testArtistsFollowingEndpoint() {
  try {
    console.log('🧪 Probando endpoint /api/artists/following...\n');
    
    // Token de ejemplo (necesitarás un token válido)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIzLCJ1c2VybmFtZSI6IkltU2FpdGFtIiwiZW1haWwiOiJtYXR1QGVtYWlsLmNvbSIsImlhdCI6MTczNjk0OTY2OSwiZXhwIjoxNzM3MDM2MDY5fQ.t6i-5q5bXDbW6k5vMXbUUFo-OoOGPPfKr_fUXUJMTxs'; // Reemplaza con un token válido
    
    const response = await fetch('http://localhost:3000/api/artists/following', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    const data = await response.json();
    console.log('\n📋 Respuesta:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.artists) {
      console.log(`\n✅ Funciona! Encontrados ${data.artists.length} artistas seguidos`);
      if (data.artists.length > 0) {
        console.log('\n🎵 Artistas:');
        data.artists.forEach((artist, index) => {
          console.log(`  ${index + 1}. ${artist.artist_name} (ID: ${artist.artist_id})`);
        });
      }
    } else {
      console.log('\n❌ El endpoint no está funcionando correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error probando endpoint:', error);
  }
}

testArtistsFollowingEndpoint();
