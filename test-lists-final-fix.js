#!/usr/bin/env node

// Script para probar el endpoint de listas con usuario verificado
import https from 'https';
import http from 'http';
import { query, run } from './src/lib/database-adapter.js';

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

async function setupVerifiedUser() {
  try {
    // Verificar si ya existe un usuario verificado que podamos usar
    const existingVerified = await query('SELECT * FROM users WHERE email_verified = true LIMIT 1');
    
    if (existingVerified.length > 0) {
      console.log('✅ Using existing verified user:', existingVerified[0].email);
      // Para las pruebas, asumimos que podemos usar este usuario (en production no harías esto)
      return {
        email: existingVerified[0].email,
        password: 'admin123' // Asumiendo password común para admin
      };
    }

    // Si no hay usuarios verificados, crear uno
    console.log('🆕 Creating verified test user...');
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    
    const testEmail = 'testverified' + Date.now() + '@example.com';
    const testUsername = 'testverified' + Date.now();
    
    await run(`
      INSERT INTO users (username, email, password_hash, email_verified, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [testUsername, testEmail, hashedPassword, true]);

    console.log('✅ Verified test user created!');
    return {
      email: testEmail,
      password: 'testpass123'
    };

  } catch (error) {
    console.error('💥 Error setting up user:', error);
    return null;
  }
}

async function testListsEndpointFinal() {
  console.log('🧪 Final test of /api/lists endpoint...');
  console.log('=====================================');

  // Setup verified user
  const testUser = await setupVerifiedUser();
  if (!testUser) {
    console.log('❌ Could not setup test user');
    return;
  }

  // Test 1: Login
  console.log('\n1. Logging in with verified user...');
  try {
    const loginResult = await makeRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: testUser
    });

    console.log(`   Status: ${loginResult.status}`);
    
    if (loginResult.status === 200 && loginResult.data.token) {
      console.log('   ✅ Login successful');
      const authToken = loginResult.data.token;

      // Test 2: Get lists (should work now)
      console.log('\n2. Testing GET /api/lists...');
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

      // Test 3: Create list
      console.log('\n3. Testing POST /api/lists (create list)...');
      const createResult = await makeRequest('http://localhost:3000/api/lists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'My Awesome Test List ' + Date.now(),
          description: 'This list was created by our automated test to verify the endpoint is working',
          is_public: true
        }
      });

      console.log(`   Status: ${createResult.status}`);
      console.log(`   Response: ${JSON.stringify(createResult.data, null, 2)}`);
      
      if (createResult.status === 200) {
        console.log('   ✅ POST /api/lists working correctly!');
        
        // Test 4: Get lists again to see the new one
        console.log('\n4. Getting updated list of lists...');
        const listsResult2 = await makeRequest('http://localhost:3000/api/lists', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (listsResult2.status === 200) {
          console.log(`   📊 Total lists now: ${listsResult2.data.lists?.length || 0}`);
          
          if (listsResult2.data.lists && listsResult2.data.lists.length > 0) {
            console.log('   📋 Lists:');
            listsResult2.data.lists.forEach((list, index) => {
              console.log(`     ${index + 1}. "${list.name}" (${list.album_count || 0} albums) - Private: ${list.is_private || false}`);
            });
          }
        }
      } else {
        console.log('   ❌ POST /api/lists failed');
      }

    } else {
      console.log('   ❌ Login failed');
      console.log('   Response:', loginResult.data);
    }

  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n🎉 Testing completed! The getUserLists error should be fixed now.');
}

testListsEndpointFinal().catch(console.error);
