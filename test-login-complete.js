#!/usr/bin/env node

/**
 * Test completo de funcionalidad de login - TuneBoxd
 * Verifica que todo el flujo de autenticación funcione correctamente
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';
const TEST_CREDENTIALS = {
  email: 'test@musicboxd.com',
  password: 'password123'
};

// ANSI colors for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function testLogin() {
  console.log(`${colors.blue}${colors.bold}🔐 Test de Login Completo - TuneBoxd${colors.reset}\n`);

  try {
    console.log(`${colors.yellow}📤 Enviando credenciales de login...${colors.reset}`);
    
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`${colors.blue}📊 Tiempo de respuesta: ${responseTime}ms${colors.reset}`);
    console.log(`${colors.blue}📊 Status Code: ${response.status}${colors.reset}`);
    console.log(`${colors.blue}📊 Content-Type: ${response.headers.get('content-type')}${colors.reset}`);
    console.log(`${colors.blue}📊 Content-Encoding: ${response.headers.get('content-encoding')}${colors.reset}`);

    if (!response.ok) {
      console.log(`${colors.red}❌ Error en la respuesta HTTP: ${response.status}${colors.reset}`);
      const errorText = await response.text();
      console.log(`${colors.red}Error: ${errorText}${colors.reset}`);
      return false;
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.log(`${colors.red}❌ Error al parsear JSON:${colors.reset}`, jsonError.message);
      const text = await response.text();
      console.log(`${colors.red}Contenido de respuesta:${colors.reset}`, text);
      return false;
    }

    if (data.success) {
      console.log(`${colors.green}✅ Login exitoso!${colors.reset}`);
      console.log(`${colors.green}👤 Usuario: ${data.user.username} (${data.user.email})${colors.reset}`);
      console.log(`${colors.green}🔑 Token generado: ${data.token.substring(0, 20)}...${colors.reset}`);
      console.log(`${colors.green}✅ Usuario verificado: ${data.user.verified ? 'Sí' : 'No'}${colors.reset}`);
      
      // Test de validación de token
      await testTokenValidation(data.token);
      
      return true;
    } else {
      console.log(`${colors.red}❌ Login fallido:${colors.reset}`, data.message);
      return false;
    }

  } catch (error) {
    console.log(`${colors.red}❌ Error de conexión:${colors.reset}`, error.message);
    return false;
  }
}

async function testTokenValidation(token) {
  console.log(`\n${colors.yellow}🔍 Validando token de autenticación...${colors.reset}`);
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`${colors.green}✅ Token válido - Usuario: ${data.user.username}${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Token inválido - Status: ${response.status}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error validando token:${colors.reset}`, error.message);
  }
}

async function testAPIsPerformance() {
  console.log(`\n${colors.blue}${colors.bold}📊 Test de Rendimiento de APIs${colors.reset}\n`);

  const apis = [
    { endpoint: '/api/stats/global', name: 'Estadísticas Globales' },
    { endpoint: '/api/forum/data', name: 'Datos del Foro' },
    { endpoint: '/api/forum/stats', name: 'Estadísticas del Foro' }
  ];

  for (const api of apis) {
    console.log(`${colors.yellow}🚀 Probando ${api.name}...${colors.reset}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_BASE}${api.endpoint}`, {
        headers: { 'Accept': 'application/json' }
      });
      const endTime = Date.now();
      
      if (response.ok) {
        const data = await response.json();
        const fromCache = data.fromCache ? ' (desde cache)' : '';
        console.log(`${colors.green}✅ ${api.name}: ${endTime - startTime}ms${fromCache}${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ ${api.name}: Error ${response.status}${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${api.name}: ${error.message}${colors.reset}`);
    }
  }
}

async function main() {
  const loginSuccess = await testLogin();
  
  if (loginSuccess) {
    await testAPIsPerformance();
    console.log(`\n${colors.green}${colors.bold}🎉 Todos los tests completados exitosamente!${colors.reset}`);
    console.log(`${colors.green}🔗 Puedes probar el login en: http://localhost:3000/login${colors.reset}`);
    console.log(`${colors.green}📊 Dashboard de rendimiento: http://localhost:3000/admin/performance${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ Los tests fallaron. Revisar configuración.${colors.reset}`);
    process.exit(1);
  }
}

main().catch(console.error);
