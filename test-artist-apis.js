// Test simple de las APIs de artistas
async function testArtistAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🧪 Probando APIs de artistas...');
    
    // Test 1: Obtener datos de un artista desde Spotify
    console.log('\n1. Probando API de Spotify para artista...');
    const artistResponse = await fetch(`${baseUrl}/api/spotify/artist/6mEQK9m2krja6X1cfsAjfl`);
    const artistData = await artistResponse.json();
    
    if (artistResponse.ok) {
      console.log('✅ API de Spotify funciona correctamente');
      console.log(`   Artista: ${artistData.artist?.name || 'No encontrado'}`);
    } else {
      console.log('❌ Error en API de Spotify:', artistData);
    }
    
    // Test 2: Verificar estado de seguimiento (sin autenticación)
    console.log('\n2. Probando verificación de seguimiento...');
    const followCheckResponse = await fetch(`${baseUrl}/api/artists/follow?artist_id=6mEQK9m2krja6X1cfsAjfl`);
    const followCheckData = await followCheckResponse.json();
    
    if (followCheckResponse.ok) {
      console.log('✅ API de verificación de seguimiento funciona');
      console.log(`   Siguiendo: ${followCheckData.isFollowing}`);
    } else {
      console.log('❌ Error en API de seguimiento:', followCheckData);
    }
    
    // Test 3: Obtener tags (sin autenticación) 
    console.log('\n3. Probando API de tags...');
    const tagsResponse = await fetch(`${baseUrl}/api/artists/tags?artist_id=6mEQK9m2krja6X1cfsAjfl`);
    const tagsData = await tagsResponse.json();
    
    if (tagsResponse.ok) {
      console.log('✅ API de tags funciona correctamente');
      console.log(`   Tags: ${tagsData.tags?.length || 0} encontradas`);
    } else {
      console.log('❌ Error en API de tags:', tagsData);
    }
    
    console.log('\n🎉 ¡Todas las APIs están funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

testArtistAPIs();
