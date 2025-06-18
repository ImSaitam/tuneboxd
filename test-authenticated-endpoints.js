#!/usr/bin/env node

// Test con autenticación para verificar los endpoints que requieren login
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

async function testWithAuth() {
  console.log('🔐 Testing with Authentication');
  console.log('==============================');

  // Primer paso: Crear/obtener usuario de prueba
  console.log('\n1. Creating test user...');
  const registerResult = await makeRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'testpass123'
    }
  });

  if (registerResult?.status !== 201) {
    console.log('❌ Failed to create user, trying to login with existing user...');
    
    // Intentar login con usuario existente
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

    if (loginResult?.status === 200 && loginResult?.data?.token) {
      const authToken = loginResult.data.token;
      console.log('✅ Logged in successfully');
      await testEndpointsWithToken(authToken);
    } else {
      console.log('❌ Failed to authenticate with existing user');
      console.log('Response:', loginResult);
    }
  } else {
    console.log('✅ User created successfully');
    // En una app real, necesitarías verificar el email primero
    // Por ahora, intentamos login directamente si el register dio error de user exists
  }
}

async function testEndpointsWithToken(token) {
  console.log('\n2. Testing endpoints with authentication...');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Test notifications
  console.log('\n🔔 Testing notifications...');
  const notificationsResult = await makeRequest('http://localhost:3000/api/notifications', {
    method: 'GET',
    headers
  });
  console.log(`Status: ${notificationsResult?.status}`);
  if (notificationsResult?.data) {
    console.log(`Data: ${JSON.stringify(notificationsResult.data).substring(0, 100)}...`);
  }

  // Test listen-list
  console.log('\n📋 Testing listen-list...');
  const listenListResult = await makeRequest('http://localhost:3000/api/listen-list', {
    method: 'GET',
    headers
  });
  console.log(`Status: ${listenListResult?.status}`);
  if (listenListResult?.data) {
    console.log(`Data: ${JSON.stringify(listenListResult.data).substring(0, 100)}...`);
  }

  // Test listening-history
  console.log('\n🎵 Testing listening-history...');
  const historyResult = await makeRequest('http://localhost:3000/api/listening-history', {
    method: 'GET',
    headers
  });
  console.log(`Status: ${historyResult?.status}`);
  if (historyResult?.data) {
    console.log(`Data: ${JSON.stringify(historyResult.data).substring(0, 100)}...`);
  }

  // Test watchlist
  console.log('\n⭐ Testing watchlist...');
  const watchlistResult = await makeRequest('http://localhost:3000/api/watchlist', {
    method: 'GET',
    headers
  });
  console.log(`Status: ${watchlistResult?.status}`);
  if (watchlistResult?.data) {
    console.log(`Data: ${JSON.stringify(watchlistResult.data).substring(0, 100)}...`);
  }
}

async function testAlbumsEndpoint() {
  console.log('\n📀 Testing albums endpoint without specific ID...');
  
  // Test general albums endpoint
  const albumsResult = await makeRequest('http://localhost:3000/api/albums', {
    method: 'GET'
  });
  console.log(`Status: ${albumsResult?.status}`);
  if (albumsResult?.data) {
    console.log(`Data: ${JSON.stringify(albumsResult.data).substring(0, 200)}...`);
    
    // Si hay álbumes, probar con el primer ID
    if (albumsResult.data.albums && albumsResult.data.albums.length > 0) {
      const firstAlbum = albumsResult.data.albums[0];
      console.log(`\n📀 Testing specific album (ID: ${firstAlbum.id})...`);
      
      const specificAlbumResult = await makeRequest(`http://localhost:3000/api/albums/${firstAlbum.id}`, {
        method: 'GET'
      });
      console.log(`Status: ${specificAlbumResult?.status}`);
      if (specificAlbumResult?.data) {
        console.log(`Data: ${JSON.stringify(specificAlbumResult.data).substring(0, 200)}...`);
      }
    }
  }
}

async function runAuthenticatedTests() {
  console.log('🚀 Starting Authenticated API Tests');
  console.log('===================================');

  // Probar endpoints de álbumes primero (no requieren auth)
  await testAlbumsEndpoint();
  
  // Luego probar endpoints que requieren autenticación
  await testWithAuth();

  console.log('\n🏁 Authenticated tests completed!');
  console.log('===================================');
}

runAuthenticatedTests().catch(console.error);
