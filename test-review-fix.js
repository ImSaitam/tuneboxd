// Test script para verificar que el fix de crear reseñas funciona
const API_BASE = 'http://localhost:3000/api';

async function testCreateReview() {
  console.log('🧪 Iniciando test de crear reseña...');
  
  // Esperar un poco para asegurar que el servidor esté listo
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Primero hacer login para obtener token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@musicboxd.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');

    // Ahora intentar crear una reseña
    const reviewResponse = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        album: {
          spotify_id: '4qfOLuKP9F1EJJGfhjSVpn', // ID de Spotify válido
          name: 'Test Album',
          artist: 'Test Artist',
          release_date: '2023-01-01',
          image_url: 'https://example.com/test-album.jpg',
          spotify_url: 'https://open.spotify.com/album/4qfOLuKP9F1EJJGfhjSVpn'
        },
        rating: 4,
        title: 'Excelente álbum de prueba',
        content: 'Esta es una reseña de prueba para verificar que la funcionalidad funciona correctamente después del fix.'
      })
    });

    const reviewData = await reviewResponse.json();
    
    if (reviewResponse.ok) {
      console.log('✅ Crear reseña exitoso:', reviewData.message);
      console.log('📝 ID de reseña:', reviewData.review?.id);
    } else {
      console.log('❌ Error al crear reseña:', reviewData.message);
      console.log('🔍 Detalles:', reviewData);
    }

    console.log('🎉 Test completado');

  } catch (error) {
    console.error('💥 Error durante el test:', error.message);
  }
}

testCreateReview();
