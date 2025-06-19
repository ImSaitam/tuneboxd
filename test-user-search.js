// Script de prueba para verificar la funcionalidad de búsqueda de usuarios
const testUserSearch = async () => {
  try {
    console.log('Probando búsqueda de usuarios...');
    
    // Probar la API de búsqueda de usuarios
    const response = await fetch('http://localhost:3000/api/users/search?q=test&limit=5');
    const data = await response.json();
    
    console.log('Respuesta de búsqueda de usuarios:', {
      status: response.status,
      success: data.success,
      userCount: data.users?.length || 0,
      message: data.message
    });
    
    // Probar la API de actividad social
    const activityResponse = await fetch('http://localhost:3000/api/social/activity', {
      headers: {
        'Authorization': 'Bearer fake-token-for-testing'
      }
    });
    
    console.log('Respuesta de actividad social:', {
      status: activityResponse.status,
      statusText: activityResponse.statusText
    });
    
  } catch (error) {
    console.error('Error en prueba:', error);
  }
};

// Ejecutar la prueba en Node.js
testUserSearch();
