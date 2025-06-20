// Script para debuggear el token JWT
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret_super_seguro_cambialo_en_produccion';

// Token de ejemplo (obtenido del localStorage del navegador)
const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0LCJ1c2VybmFtZSI6IkltU2FpdGFtIiwiZW1haWwiOiJtYXR1dGVkZXNhbnRvQGdtYWlsLmNvbSIsImlhdCI6MTczNDczMzQ3NSwiZXhwIjoxNzM0ODE5ODc1fQ.mhqG4i3iYfGP-mJ3CZJPkIj5mj0eB9DNFQ-kv-HFN_o';

try {
  console.log('🔍 Decodificando token JWT...\n');
  
  const decoded = jwt.verify(sampleToken, JWT_SECRET);
  console.log('✅ Token decodificado exitosamente:');
  console.log(JSON.stringify(decoded, null, 2));
  
  console.log(`\n🔍 userId extraído: ${decoded.userId}`);
  console.log(`🔍 username extraído: ${decoded.username}`);
  console.log(`🔍 email extraído: ${decoded.email}`);
  
} catch (error) {
  console.error('❌ Error decodificando token:', error.message);
}

// También verificar si el token está expirado
try {
  const decoded = jwt.decode(sampleToken);
  console.log('\n📅 Información de expiración:');
  console.log(`iat (issued at): ${new Date(decoded.iat * 1000).toLocaleString()}`);
  console.log(`exp (expires): ${new Date(decoded.exp * 1000).toLocaleString()}`);
  console.log(`Tiempo actual: ${new Date().toLocaleString()}`);
  console.log(`¿Expirado?: ${Date.now() > decoded.exp * 1000 ? 'SÍ' : 'NO'}`);
} catch (error) {
  console.error('❌ Error decodificando fechas:', error.message);
}
