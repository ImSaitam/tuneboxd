// Test específico para los endpoints que están fallando
async function testFailingEndpoints() {
  const baseUrl = 'https://tuneboxd.vercel.app';
  
  // Test 1: Notifications endpoint
  console.log('🧪 Testeando /api/notifications...');
  try {
    const response = await fetch(`${baseUrl}/api/notifications`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data.substring(0, 200));
  } catch (error) {
    console.error('Error en notifications:', error.message);
  }

  // Test 2: Albums endpoint
  console.log('\n🧪 Testeando /api/albums/4...');
  try {
    const response = await fetch(`${baseUrl}/api/albums/4`);
    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data.substring(0, 200));
  } catch (error) {
    console.error('Error en albums:', error.message);
  }

  // Test 3: Listen-list endpoint
  console.log('\n🧪 Testeando /api/listen-list...');
  try {
    const response = await fetch(`${baseUrl}/api/listen-list`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data.substring(0, 200));
  } catch (error) {
    console.error('Error en listen-list:', error.message);
  }
}

testFailingEndpoints();
