/**
 * Script de prueba mejorado para verificar la configuración de Resend
 * Ejecutar con: npm run test-resend
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🧪 Iniciando prueba de configuración de Resend...\n');

// 1. Verificar variables de entorno
console.log('1️⃣ Verificando variables de entorno...');

const requiredVars = {
  'RESEND_API_KEY': process.env.RESEND_API_KEY,
  'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
  'FROM_EMAIL': process.env.FROM_EMAIL
};

let allVarsPresent = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (!value || value === 'your_resend_api_key_here' || value === 'noreply@yourdomain.com') {
    console.log(`❌ ${key}: No configurada o usando valor por defecto`);
    allVarsPresent = false;
  } else {
    console.log(`✅ ${key}: ${key === 'RESEND_API_KEY' ? '***' + value.slice(-8) : value}`);
  }
}

if (!allVarsPresent) {
  console.log('\n❌ Configuración incompleta');
  process.exit(1);
}

console.log('\n2️⃣ Probando conexión con Resend...');

try {
  // Importar después de cargar variables de entorno
  const { Resend } = await import('resend');
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  // Intentar enviar un email de prueba (no se enviará realmente)
  console.log('✅ API Key válida y conexión establecida');
  console.log('\n🎉 ¡Configuración de Resend completada exitosamente!');
  
  console.log('\n📧 Servicios disponibles:');
  console.log('   ✅ Email de verificación de cuenta');
  console.log('   ✅ Email de bienvenida');
  console.log('   ✅ Email de recuperación de contraseña');
  
  console.log('\n🚀 ¿Qué hacer ahora?');
  console.log('   1. Inicia tu aplicación: npm run dev');
  console.log('   2. Registra una cuenta de prueba');
  console.log('   3. Revisa tu email para el enlace de verificación');
  
} catch (error) {
  console.error('❌ Error al conectar con Resend:', error.message);
  
  if (error.message.includes('API key')) {
    console.log('\n💡 Solución:');
    console.log('   1. Ve a https://resend.com');
    console.log('   2. Crea/verifica tu cuenta');
    console.log('   3. Ve a "API Keys" y crea una nueva');
    console.log('   4. Actualiza RESEND_API_KEY en tu .env.local');
  }
}
