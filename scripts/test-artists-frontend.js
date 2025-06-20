// Script para probar la funcionalidad de artistas seguidos en el frontend
import fetch from 'node-fetch';

async function testArtistsFrontend() {
  try {
    console.log('🧪 Probando la carga de artistas seguidos...\n');
    
    // Simular la solicitud que hace el frontend
    const userId = 14; // ImSaitam
    const url = `https://tuneboxd.xyz/api/artists/following/${userId}`;
    
    console.log(`📡 Haciendo solicitud a: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Respuesta:`, JSON.stringify(data, null, 2));
    
    if (data.success && data.artists && data.artists.length > 0) {
      console.log(`\n✅ ¡Perfecto! Se encontraron ${data.artists.length} artistas seguidos:`);
      data.artists.forEach((artist, index) => {
        console.log(`  ${index + 1}. ${artist.artist_name} (${artist.artist_id})`);
      });
      
      console.log('\n🎯 El endpoint funciona correctamente.');
      console.log('💡 Si no se muestra en el frontend, puede ser un problema de UI/rendering.');
    } else {
      console.log('\n❌ No se encontraron artistas o hay un problema con el endpoint');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testArtistsFrontend();
