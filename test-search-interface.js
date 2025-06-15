// Script para probar la interfaz de búsqueda
const testSearchInterface = async () => {
  try {
    console.log('🔍 Probando búsqueda de artistas...');
    const artistResponse = await fetch('http://localhost:3001/api/spotify/search?q=taylor%20swift&type=artist&limit=3');
    const artistData = await artistResponse.json();
    
    console.log('✅ Artistas encontrados:', artistData.data.items.length);
    console.log('Primer artista:', artistData.data.items[0]?.name);
    
    console.log('\n🎵 Probando búsqueda de álbumes...');
    const albumResponse = await fetch('http://localhost:3001/api/spotify/search?q=taylor%20swift&type=album&limit=3');
    const albumData = await albumResponse.json();
    
    console.log('✅ Álbumes encontrados:', albumData.data.items.length);
    console.log('Primer álbum:', albumData.data.items[0]?.name);
    
    console.log('\n🎧 Probando búsqueda de canciones...');
    const trackResponse = await fetch('http://localhost:3001/api/spotify/search?q=taylor%20swift&type=track&limit=3');
    const trackData = await trackResponse.json();
    
    console.log('✅ Canciones encontradas:', trackData.data.items.length);
    console.log('Primera canción:', trackData.data.items[0]?.name);
    
    console.log('\n👥 Probando búsqueda de usuarios...');
    const userResponse = await fetch('http://localhost:3001/api/users/search?q=test&limit=3');
    const userData = await userResponse.json();
    
    console.log('✅ Usuarios encontrados:', userData.users?.length || 0);
    
    console.log('\n🎉 ¡Todas las APIs funcionan correctamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
};

// Si estamos en Node.js, ejecutar la prueba
if (typeof require !== 'undefined') {
  // Para Node.js necesitamos fetch
  const fetch = require('node-fetch');
  testSearchInterface();
}
