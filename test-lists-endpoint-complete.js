#!/usr/bin/env node

// Script para probar que el endpoint /api/lists funcione correctamente
import https from 'https';
import http from 'http';

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      ...options,
      ...(isHttps && { agent })
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testListsEndpoint() {
  console.log('🧪 Testing /api/lists endpoint...');
  console.log('================================');

  // Test 1: Sin autenticación (debería dar 401)
  console.log('\n1. Testing without authentication...');
  try {
    const result = await makeRequest('http://localhost:3000/api/lists');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data)}`);
    
    if (result.status === 401) {
      console.log('   ✅ Correctly returns 401 for unauthenticated request');
    } else {
      console.log('   ❌ Expected 401 but got', result.status);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 2: Con autenticación (usando admin credentials)
  console.log('\n2. Testing with authentication...');
  try {
    // Primero obtener token
    const loginResult = await makeRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: 'admin@tuneboxd.com',
        password: 'admin123'
      }
    });

    if (loginResult.status === 200 && loginResult.data.token) {
      console.log('   ✅ Login successful');
      
      // Ahora probar el endpoint de listas
      const listsResult = await makeRequest('http://localhost:3000/api/lists', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginResult.data.token}`
        }
      });

      console.log(`   Status: ${listsResult.status}`);
      console.log(`   Response: ${JSON.stringify(listsResult.data, null, 2)}`);
      
      if (listsResult.status === 200) {
        console.log('   ✅ Lists endpoint working correctly!');
        console.log(`   📊 Found ${listsResult.data.lists?.length || 0} lists`);
      } else {
        console.log('   ❌ Lists endpoint failed');
      }

      // Test 3: Crear una nueva lista
      console.log('\n3. Testing list creation...');
      const createResult = await makeRequest('http://localhost:3000/api/lists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginResult.data.token}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'Test List ' + Date.now(),
          description: 'This is a test list created by automated test',
          is_public: true
        }
      });

      console.log(`   Status: ${createResult.status}`);
      console.log(`   Response: ${JSON.stringify(createResult.data, null, 2)}`);
      
      if (createResult.status === 200) {
        console.log('   ✅ List creation working correctly!');
      } else {
        console.log('   ❌ List creation failed');
      }

    } else {
      console.log('   ❌ Login failed');
      console.log('   Response:', loginResult);
    }

  } catch (error) {
    console.log('   ❌ Error during authenticated test:', error.message);
  }

  console.log('\n🏁 Tests completed!');
}

testListsEndpoint().catch(console.error);
