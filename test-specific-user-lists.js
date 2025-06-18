#!/usr/bin/env node

// Test simple con usuario específico
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

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testWithSpecificUser() {
  console.log('🧪 Testing with specific verified user...');
  
  const testUser = {
    email: 'listsTest1750259462402@test.com',
    password: 'testpass123'
  };

  // Login
  console.log('\n1. Login...');
  const loginResult = await makeRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: testUser
  });

  console.log(`Status: ${loginResult.status}`);
  if (loginResult.status === 200) {
    console.log('✅ Login successful');
    
    const token = loginResult.data.token;
    
    // Test lists endpoint
    console.log('\n2. Test GET /api/lists...');
    const listsResult = await makeRequest('http://localhost:3000/api/lists', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`Status: ${listsResult.status}`);
    console.log('Response:', JSON.stringify(listsResult.data, null, 2));
    
    if (listsResult.status === 200) {
      console.log('✅ Lists endpoint working!');
    }

    // Test create list
    console.log('\n3. Test POST /api/lists...');
    const createResult = await makeRequest('http://localhost:3000/api/lists', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        name: 'Test List ' + Date.now(),
        description: 'A test list',
        is_public: true
      }
    });

    console.log(`Status: ${createResult.status}`);
    console.log('Response:', JSON.stringify(createResult.data, null, 2));
    
  } else {
    console.log('❌ Login failed:', loginResult.data);
  }
}

testWithSpecificUser().catch(console.error);
