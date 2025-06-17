/**
 * Script de prueba para verificar la configuración de Resend
 * Ejecutar con: node test-resend-config.js
 */

import { verifyEmailConfig, sendVerificationEmail } from './src/lib/email-resend.js';

async function testResendConfig() {
  console.log('🧪 Iniciando prueba de configuración de Resend...\n');

  // 1. Verificar configuración básica
  console.log('1️⃣ Verificando configuración básica...');
  const configValid = await verifyEmailConfig();
  
  if (!configValid) {
    console.log('❌ Configuración inválida. Revisa tu archivo .env.local\n');
    console.log('📋 Variables requeridas:');
    console.log('   - RESEND_API_KEY=tu_api_key_aqui');
    console.log('   - NEXT_PUBLIC_APP_URL=http://localhost:3000');
    console.log('   - FROM_EMAIL=noreply@tudominio.com');
    return;
  }

  console.log('✅ Configuración básica válida\n');

  // 2. Verificar variables de entorno
  console.log('2️⃣ Verificando variables de entorno...');
  
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
      console.log(`✅ ${key}: Configurada`);
    }
  }

  if (!allVarsPresent) {
    console.log('\n📋 Próximos pasos para completar la configuración:');
    console.log('1. Ve a https://resend.com y crea una cuenta gratuita');
    console.log('2. Crea una API key en el dashboard');
    console.log('3. Actualiza tu archivo .env.local con la API key real');
    console.log('4. Configura un dominio o usa el dominio de prueba de Resend');
    return;
  }

  console.log('\n✅ Todas las variables están configuradas correctamente');
  console.log('\n🎉 ¡Tu configuración de Resend está lista!');
  console.log('\n📧 Ahora puedes:');
  console.log('   - Enviar emails de verificación');
  console.log('   - Enviar emails de recuperación de contraseña');
  console.log('   - Enviar emails de bienvenida');
}

// Ejecutar la prueba
testResendConfig().catch(error => {
  console.error('❌ Error durante la prueba:', error);
});
