// Script de prueba para la API de idiomas del foro
const BASE_URL = 'http://localhost:3000';

async function testLanguageAPI() {
  console.log('🧪 Probando API de idiomas del foro...\n');

  try {
    // Test 1: Obtener idiomas disponibles
    console.log('1. Probando GET /api/forum/languages');
    const languagesResponse = await fetch(`${BASE_URL}/api/forum/languages`);
    const languagesData = await languagesResponse.json();
    
    if (languagesResponse.ok) {
      console.log('✅ Idiomas obtenidos exitosamente:');
      console.log(JSON.stringify(languagesData, null, 2));
    } else {
      console.log('❌ Error obteniendo idiomas:', languagesData.message);
    }

    // Test 2: Obtener hilos filtrados por idioma español
    console.log('\n2. Probando GET /api/forum/threads?language=es');
    const threadsEsResponse = await fetch(`${BASE_URL}/api/forum/threads?language=es`);
    const threadsEsData = await threadsEsResponse.json();
    
    if (threadsEsResponse.ok) {
      console.log('✅ Hilos en español obtenidos exitosamente:');
      console.log(`Total: ${threadsEsData.threads.length} hilos`);
      threadsEsData.threads.forEach(thread => {
        console.log(`- ${thread.title} (${thread.language})`);
      });
    } else {
      console.log('❌ Error obteniendo hilos en español:', threadsEsData.message);
    }

    // Test 3: Obtener hilos filtrados por idioma inglés
    console.log('\n3. Probando GET /api/forum/threads?language=en');
    const threadsEnResponse = await fetch(`${BASE_URL}/api/forum/threads?language=en`);
    const threadsEnData = await threadsEnResponse.json();
    
    if (threadsEnResponse.ok) {
      console.log('✅ Hilos en inglés obtenidos exitosamente:');
      console.log(`Total: ${threadsEnData.threads.length} hilos`);
      threadsEnData.threads.forEach(thread => {
        console.log(`- ${thread.title} (${thread.language})`);
      });
    } else {
      console.log('❌ Error obteniendo hilos en inglés:', threadsEnData.message);
    }

    // Test 4: Obtener todos los hilos (sin filtro de idioma)
    console.log('\n4. Probando GET /api/forum/threads (todos los idiomas)');
    const allThreadsResponse = await fetch(`${BASE_URL}/api/forum/threads`);
    const allThreadsData = await allThreadsResponse.json();
    
    if (allThreadsResponse.ok) {
      console.log('✅ Todos los hilos obtenidos exitosamente:');
      console.log(`Total: ${allThreadsData.threads.length} hilos`);
      
      const languageCount = {};
      allThreadsData.threads.forEach(thread => {
        const lang = thread.language || 'sin idioma';
        languageCount[lang] = (languageCount[lang] || 0) + 1;
      });
      
      console.log('Distribución por idiomas:');
      Object.entries(languageCount).forEach(([lang, count]) => {
        console.log(`- ${lang}: ${count} hilos`);
      });
    } else {
      console.log('❌ Error obteniendo todos los hilos:', allThreadsData.message);
    }

  } catch (error) {
    console.log('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testLanguageAPI().then(() => {
  console.log('\n🏁 Pruebas completadas');
});
