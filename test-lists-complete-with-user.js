#!/usr/bin/env node

// Script para crear un usuario de prueba y luego probar el endpoint de listas
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

async function testListsWithNewUser() {
  console.log('🧪 Testing /api/lists with new user...');
  console.log('====================================');

  const testUser = {
    username: 'testuser' + Date.now(),
    email: 'test' + Date.now() + '@example.com',
    password: 'testpass123'
  };

  // Step 1: Create user
  console.log('\n1. Creating test user...');
  try {
    const registerResult = await makeRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: testUser
    });

    console.log(`   Status: ${registerResult.status}`);
    console.log(`   Response: ${JSON.stringify(registerResult.data)}`);

    if (registerResult.status === 200 || registerResult.status === 201) {
      console.log('   ✅ User created successfully');
      
      // Check if user needs verification
      if (registerResult.data.user?.verified === false) {
        console.log('   ⚠️  User needs email verification, trying login anyway...');
      }
      
      // Step 2: Login
      console.log('\n2. Logging in...');
      const loginResult = await makeRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          email: testUser.email,
          password: testUser.password
        }
      });

      console.log(`   Status: ${loginResult.status}`);
      
      if (loginResult.status === 200 && loginResult.data.token) {
        console.log('   ✅ Login successful');
        const authToken = loginResult.data.token;

        // Step 3: Test lists endpoint
        console.log('\n3. Testing GET /api/lists...');
        const listsResult = await makeRequest('http://localhost:3000/api/lists', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        console.log(`   Status: ${listsResult.status}`);
        console.log(`   Response: ${JSON.stringify(listsResult.data, null, 2)}`);
        
        if (listsResult.status === 200) {
          console.log('   ✅ GET /api/lists working correctly!');
          console.log(`   📊 Found ${listsResult.data.lists?.length || 0} lists`);
        } else {
          console.log('   ❌ GET /api/lists failed');
        }

        // Step 4: Test list creation
        console.log('\n4. Testing POST /api/lists (create list)...');
        const createResult = await makeRequest('http://localhost:3000/api/lists', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: {
            name: 'My Test List ' + Date.now(),
            description: 'This is a test list created by automated test',
            is_public: true
          }
        });

        console.log(`   Status: ${createResult.status}`);
        console.log(`   Response: ${JSON.stringify(createResult.data, null, 2)}`);
        
        if (createResult.status === 200) {
          console.log('   ✅ POST /api/lists working correctly!');
          
          // Step 5: Get lists again to see the new one
          console.log('\n5. Getting lists again to verify...');
          const listsResult2 = await makeRequest('http://localhost:3000/api/lists', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });

          console.log(`   Status: ${listsResult2.status}`);
          console.log(`   Found ${listsResult2.data.lists?.length || 0} lists`);
          
          if (listsResult2.data.lists && listsResult2.data.lists.length > 0) {
            console.log('   📋 Lists:');
            listsResult2.data.lists.forEach((list, index) => {
              console.log(`     ${index + 1}. ${list.name} (albums: ${list.album_count || 0})`);
            });
          }
        } else {
          console.log('   ❌ POST /api/lists failed');
        }

      } else {
        console.log('   ❌ Login failed');
        console.log('   Response:', loginResult.data);
      }

    } else {
      console.log('   ❌ User creation failed');
    }

  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n🏁 All tests completed!');
}

testListsWithNewUser().catch(console.error);
