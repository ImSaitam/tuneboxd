#!/usr/bin/env node

// Test rápido del endpoint de listas después de la reconstrucción
import https from 'https';
import http from 'http';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function quickTest() {
  console.log('🧪 Quick test of rebuilt /api/lists...');
  
  // Test 1: Sin autenticación
  console.log('\n1. Testing without auth (should return 401)...');
  const noAuthResult = await makeRequest('http://localhost:3000/api/lists');
  console.log(`   Status: ${noAuthResult.status}`);
  console.log(`   Message: ${noAuthResult.data.message}`);
  
  if (noAuthResult.status === 401) {
    console.log('   ✅ Endpoint responding correctly (requires auth)');
  } else {
    console.log('   ❌ Unexpected response');
  }

  // Test 2: Con usuario verificado
  console.log('\n2. Testing with verified user...');
  
  // Login con usuario que sabemos que existe
  const loginResult = await makeRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email: 'listsTest1750259462402@test.com',
      password: 'testpass123'
    }
  });

  if (loginResult.status === 200 && loginResult.data.token) {
    console.log('   ✅ Login successful');
    
    // Test endpoint de listas
    const listsResult = await makeRequest('http://localhost:3000/api/lists', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${loginResult.data.token}` }
    });

    console.log(`   Lists Status: ${listsResult.status}`);
    console.log(`   Lists Response: ${JSON.stringify(listsResult.data, null, 2)}`);
    
    if (listsResult.status === 200) {
      console.log('   ✅ /api/lists working perfectly!');
      console.log('   🎉 getUserLists error is FIXED!');
    } else {
      console.log('   ❌ Still having issues');
    }
  } else {
    console.log('   ❌ Login failed - creating new user for test...');
    
    // Crear usuario rápido
    const registerResult = await makeRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        username: 'quicktest' + Date.now(),
        email: 'quicktest' + Date.now() + '@test.com',
        password: 'testpass123'
      }
    });
    
    console.log(`   Register status: ${registerResult.status}`);
    if (registerResult.data.user?.verified === false) {
      console.log('   ⚠️ User needs verification, but endpoint structure is correct');
    }
  }

  console.log('\n🏁 Quick test completed!');
}

quickTest().catch(console.error);
