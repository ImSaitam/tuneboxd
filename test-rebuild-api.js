// Test específico para el endpoint listening-history después del rebuild
async function testListeningHistoryAPI() {
  try {
    const testData = {
      album: {
        spotify_id: "4aawyAB9vmqN3uQ7FjRGTy",
        name: "Red (Taylor's Version)",
        artist: "Taylor Swift",
        release_date: "2021-11-19",
        image_url: "https://i.scdn.co/image/ab67616d0000b273318443aab3531a0558e79a4d",
        spotify_url: "https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy"
      }
    };

    console.log('🧪 Testing POST /api/listening-history después del rebuild...');
    console.log('📤 Test data:', JSON.stringify(testData, null, 2));

    const response = await fetch('https://tuneboxd.vercel.app/api/listening-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(testData)
    });

    console.log('\n📥 Response Status:', response.status, response.statusText);
    
    // Leer la respuesta como texto primero
    const responseText = await response.text();
    console.log('📋 Response (first 500 chars):', responseText.substring(0, 500));
    
    // Intentar parsear como JSON
    try {
      const responseData = JSON.parse(responseText);
      console.log('📋 Parsed JSON Response:', JSON.stringify(responseData, null, 2));
      
      if (responseData.success) {
        console.log('✅ Endpoint funcionando correctamente!');
      } else {
        console.log('❌ Endpoint respondió con error:', responseData.message);
      }
    } catch (parseError) {
      console.log('❌ Response is not valid JSON, likely HTML error page or API not working');
    }

  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
  }
}

testListeningHistoryAPI();
