#!/usr/bin/env node

// Test script para verificar que todos los endpoints problemáticos estén funcionando
import https from 'https';
import http from 'http';

// Crear agente que ignore certificados SSL para pruebas locales
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

async function testEndpoint(name, url, options = {}) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   URL: ${url}`);
  
  try {
    const result = await makeRequest(url, options);
    
    if (result.status >= 200 && result.status < 300) {
      console.log(`   ✅ SUCCESS (${result.status})`);
      if (result.data && typeof result.data === 'object') {
        console.log(`   📄 Response preview: ${JSON.stringify(result.data).substring(0, 100)}...`);
      }
    } else {
      console.log(`   ❌ FAILED (${result.status})`);
      console.log(`   📄 Response: ${typeof result.data === 'string' ? result.data.substring(0, 200) : JSON.stringify(result.data)}`);
    }
    
    return result;
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting API Endpoint Tests');
  console.log('================================');

  // Test básico de servidor
  await testEndpoint('Health Check', 'http://localhost:3000/api/test');

  // Test de los endpoints que estaban fallando
  await testEndpoint('Notifications API', 'http://localhost:3000/api/notifications');
  
  await testEndpoint('Album Details (ID: 4)', 'http://localhost:3000/api/albums/4');
  
  await testEndpoint('Listen List API', 'http://localhost:3000/api/listen-list');
  
  await testEndpoint('Listening History API', 'http://localhost:3000/api/listening-history');

  // Test con POST para listening history (simular addToHistory)
  await testEndpoint('Add to Listening History', 'http://localhost:3000/api/listening-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      albumId: 1,
      userId: 1
    }
  });

  // Test watchlist endpoint
  await testEndpoint('Watchlist API', 'http://localhost:3000/api/watchlist');

  console.log('\n🏁 Tests completed!');
  console.log('================================');
}

runTests().catch(console.error);
