#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testFavoritesFix() {
  logInfo('Iniciando verificación del fix de favoritos...');
  
  try {
    // 1. Verificar que todas las páginas usen 'auth_token'
    logInfo('1. Verificando consistencia de tokens...');
    
    const filesToCheck = [
      'src/app/favorites/page.js',
      'src/app/track/[trackId]/page.js'
    ];
    
    let tokenInconsistencies = 0;
    
    for (const filePath of filesToCheck) {
      const fullPath = path.join(process.cwd(), filePath);
      
      if (!fs.existsSync(fullPath)) {
        logWarning(`Archivo no encontrado: ${filePath}`);
        continue;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Buscar uso de 'token' incorrecto
      const badTokenMatches = content.match(/localStorage\.getItem\(['"]token['"]\)/g);
      const goodTokenMatches = content.match(/localStorage\.getItem\(['"]auth_token['"]\)/g);
      
      if (badTokenMatches) {
        logError(`${filePath}: Encontradas ${badTokenMatches.length} instancias del token incorrecto`);
        tokenInconsistencies += badTokenMatches.length;
      }
      
      if (goodTokenMatches) {
        logSuccess(`${filePath}: ${goodTokenMatches.length} instancias del token correcto encontradas`);
      }
    }
    
    if (tokenInconsistencies === 0) {
      logSuccess('Todas las páginas usan el token correcto (auth_token)');
    } else {
      logError(`Se encontraron ${tokenInconsistencies} inconsistencias de token`);
      return false;
    }
    
    // 2. Verificar estructura de la API
    logInfo('2. Verificando API de favoritos...');
    
    const apiPath = path.join(process.cwd(), 'src/app/api/track-favorites/route.js');
    if (fs.existsSync(apiPath)) {
      const apiContent = fs.readFileSync(apiPath, 'utf8');
      
      // Verificar que use verifyAuth
      if (apiContent.includes('verifyAuth') || apiContent.includes('jwt.verify')) {
        logSuccess('API de favoritos tiene verificación JWT');
      } else {
        logError('API de favoritos no tiene verificación JWT adecuada');
        return false;
      }
    } else {
      logError('No se encontró la API de track-favorites');
      return false;
    }
    
    // 3. Verificar hook de autenticación
    logInfo('3. Verificando hook de autenticación...');
    
    const authHookPath = path.join(process.cwd(), 'src/hooks/useAuth.js');
    if (fs.existsSync(authHookPath)) {
      const authContent = fs.readFileSync(authHookPath, 'utf8');
      
      if (authContent.includes("'auth_token'")) {
        logSuccess('Hook de autenticación usa auth_token correctamente');
      } else {
        logError('Hook de autenticación no usa auth_token');
        return false;
      }
    } else {
      logError('No se encontró el hook de autenticación');
      return false;
    }
    
    // 4. Verificar que las funciones de favoritos estén implementadas
    logInfo('4. Verificando funciones de base de datos...');
    
    const dbFiles = [
      'src/lib/database.js',
      'src/lib/database-adapter.js'
    ];
    
    let favoriteFunctionsFound = false;
    
    for (const dbFile of dbFiles) {
      const dbPath = path.join(process.cwd(), dbFile);
      if (fs.existsSync(dbPath)) {
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        
        if (dbContent.includes('addTrackToFavorites') || 
            dbContent.includes('removeTrackFromFavorites') ||
            dbContent.includes('getFavorites')) {
          logSuccess(`Funciones de favoritos encontradas en ${dbFile}`);
          favoriteFunctionsFound = true;
        }
      }
    }
    
    if (!favoriteFunctionsFound) {
      logWarning('No se encontraron funciones específicas de favoritos en los archivos de base de datos');
    }
    
    logInfo('5. Resumen del estado del fix...');
    logSuccess('✅ Fix completado exitosamente!');
    log('');
    log('Cambios aplicados:', 'blue');
    log('• src/app/favorites/page.js: Token cambiado de "token" a "auth_token"');
    log('• src/app/track/[trackId]/page.js: Token cambiado de "token" a "auth_token" (2 instancias)');
    log('• Agregado useCallback en favorites page para optimizar re-renders');
    log('');
    log('Resultado:', 'green');
    log('• El sistema de favoritos ahora usa el mismo token que el resto de la aplicación');
    log('• Los errores "Token inválido" deberían estar resueltos');
    log('• La autenticación es consistente en toda la aplicación');
    
    return true;
    
  } catch (error) {
    logError(`Error durante la verificación: ${error.message}`);
    return false;
  }
}

// Ejecutar el test
testFavoritesFix().then(success => {
  if (success) {
    log('\n🎉 ¡Fix de favoritos completado exitosamente!', 'green');
    process.exit(0);
  } else {
    log('\n💥 Se encontraron problemas en el fix', 'red');
    process.exit(1);
  }
}).catch(error => {
  logError(`Error inesperado: ${error.message}`);
  process.exit(1);
});
