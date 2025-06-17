const { default: fetch } = require('node-fetch');
const jwt = require('jsonwebtoken');

async function testLikeStateAfterReload() {
  console.log('🔍 Diagnóstico: Estado de Like después de recargar página\n');

  try {
    // 1. Login para obtener token
    console.log('1. 🔐 Iniciando sesión...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@musicboxd.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Error en login:', loginData.message);
      return;
    }

    const token = loginData.token;
    const decoded = jwt.decode(token);
    console.log('✅ Login exitoso - Usuario ID:', decoded.userId);

    // 2. Agregar un track a favoritos
    const testTrackId = 'test-track-like-state-123';
    console.log('\n2. ❤️ Agregando track a favoritos...');
    
    const addResponse = await fetch('http://localhost:3000/api/track-favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        trackId: testTrackId,
        trackName: 'Test Like State Song',
        artistName: 'Test Artist',
        albumName: 'Test Album',
        imageUrl: 'https://example.com/image.jpg',
        durationMs: 210000
      })
    });

    const addData = await addResponse.json();
    if (addResponse.status !== 200) {
      console.log('❌ Error agregando track:', addData.error);
      return;
    }
    console.log('✅ Track agregado exitosamente');

    // 3. Simular la llamada que hace checkIfLiked al cargar la página
    console.log('\n3. 🔄 Simulando checkIfLiked después de "reload"...');
    
    const checkResponse = await fetch(`http://localhost:3000/api/track-favorites?trackId=${testTrackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const checkData = await checkResponse.json();
    console.log('   Estado respuesta:', checkResponse.status);
    console.log('   Respuesta completa:', JSON.stringify(checkData, null, 2));
    
    if (checkData.success) {
      console.log('   ✅ isInFavorites:', checkData.isInFavorites);
      console.log('   📊 Stats:', checkData.stats);
      
      if (checkData.isInFavorites) {
        console.log('✅ CORRECTO: El track se detecta como favorito después del reload');
      } else {
        console.log('❌ PROBLEMA: El track NO se detecta como favorito después del reload');
        console.log('   Esto explica por qué el botón se "destilda"');
      }
    } else {
      console.log('❌ Error en checkIfLiked:', checkData.error);
    }

    // 4. Verificar directamente en la base de datos
    console.log('\n4. 🗄️ Verificación directa en base de datos...');
    
    const allFavoritesResponse = await fetch('http://localhost:3000/api/track-favorites', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const allFavoritesData = await allFavoritesResponse.json();
    if (allFavoritesData.success) {
      const trackExists = allFavoritesData.favorites.some(fav => fav.spotify_track_id === testTrackId);
      console.log('   Track existe en favoritos DB:', trackExists);
      console.log('   Total favoritos del usuario:', allFavoritesData.count);
    }

    // 5. Intentar hacer unlike para ver si funciona
    console.log('\n5. 💔 Intentando hacer unlike...');
    
    const unlikeResponse = await fetch('http://localhost:3000/api/track-favorites', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        trackId: testTrackId
      })
    });

    const unlikeData = await unlikeResponse.json();
    console.log('   Estado unlike:', unlikeResponse.status);
    console.log('   Respuesta unlike:', unlikeData);

    if (unlikeData.success) {
      console.log('✅ Unlike funcionó correctamente');
    } else {
      console.log('❌ Error en unlike:', unlikeData.error);
    }

    // 6. Verificar que ya no está en favoritos
    console.log('\n6. 🔍 Verificación final...');
    
    const finalCheckResponse = await fetch(`http://localhost:3000/api/track-favorites?trackId=${testTrackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const finalCheckData = await finalCheckResponse.json();
    if (finalCheckData.success) {
      console.log('   isInFavorites después de unlike:', finalCheckData.isInFavorites);
      
      if (!finalCheckData.isInFavorites) {
        console.log('✅ Sistema funcionando correctamente');
      } else {
        console.log('❌ El track sigue apareciendo como favorito después del unlike');
      }
    }

    console.log('\n📋 ANÁLISIS:');
    console.log('Si el problema persiste en el frontend pero la API funciona,');
    console.log('el issue está en el manejo del estado React o en el timing de las llamadas.');

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error.message);
  }
}

// Ejecutar diagnóstico
testLikeStateAfterReload();
