#!/usr/bin/env node

// Test completo de la funcionalidad de artistas
console.log('🎨 Testing Artist Follow Functionality...\n');

const BASE_URL = 'https://tuneboxd.xyz';

async function testArtistFollowFlow() {
  try {
    // 1. Primero necesitamos un token JWT válido
    console.log('1️⃣ Intentando login para obtener token...');
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'matutedesanto@gmail.com',
        password: 'Matu123'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Error en login:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    
    if (!loginData.success || !loginData.token) {
      console.log('❌ Login falló:', loginData);
      return;
    }

    console.log('✅ Login exitoso');
    const token = loginData.token;

    // 2. Test seguir artista
    console.log('\n2️⃣ Probando seguir artista...');
    
    const followResponse = await fetch(`${BASE_URL}/api/artists/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        artist_id: 'test_artist_123',
        artist_name: 'Test Artist',
        artist_image: 'https://example.com/artist.jpg'
      }),
    });

    const followData = await followResponse.json();
    console.log('Resultado seguir artista:', followData);

    // 3. Test verificar si sigue artista
    console.log('\n3️⃣ Verificando estado de seguimiento...');
    
    const checkResponse = await fetch(`${BASE_URL}/api/artists/follow?artist_id=test_artist_123`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const checkData = await checkResponse.json();
    console.log('Estado de seguimiento:', checkData);

    // 4. Test obtener artistas seguidos
    console.log('\n4️⃣ Obteniendo lista de artistas seguidos...');
    
    const followingResponse = await fetch(`${BASE_URL}/api/artists/following`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const followingData = await followingResponse.json();
    console.log('Artistas seguidos:', followingData);

    // 5. Test estadísticas de artista
    console.log('\n5️⃣ Obteniendo estadísticas del artista...');
    
    const statsResponse = await fetch(`${BASE_URL}/api/artists/stats?artist_id=test_artist_123`);
    const statsData = await statsResponse.json();
    console.log('Estadísticas del artista:', statsData);

    // 6. Test dejar de seguir artista
    console.log('\n6️⃣ Dejando de seguir artista...');
    
    const unfollowResponse = await fetch(`${BASE_URL}/api/artists/follow?artist_id=test_artist_123`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const unfollowData = await unfollowResponse.json();
    console.log('Resultado dejar de seguir:', unfollowData);

    console.log('\n🎉 Test de funcionalidad de artistas completado!');

  } catch (error) {
    console.error('\n💥 Error en el test:', error);
  }
}

testArtistFollowFlow();
