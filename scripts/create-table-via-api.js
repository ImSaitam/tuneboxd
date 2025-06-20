// Script para crear tabla review_likes via API endpoint
const SETUP_SECRET = 'setup_review_likes_2024';

async function createReviewLikesTable() {
  try {
    console.log('🚀 Creando tabla review_likes via API...');
    
    const response = await fetch('https://tuneboxd.xyz/api/setup/review-likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: SETUP_SECRET
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Tabla creada exitosamente:', result);
    } else {
      console.error('❌ Error en la respuesta:', result);
    }
  } catch (error) {
    console.error('❌ Error conectando con API:', error);
  }
}

createReviewLikesTable();
