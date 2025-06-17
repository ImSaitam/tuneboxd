#!/usr/bin/env node

require('dotenv').config({ path: '.env.production' });
const { userService } = require('./src/lib/database-adapter.js');
const { generateVerificationToken, sendVerificationEmail } = require('./src/lib/email-resend.js');

async function testResendVerification() {
  console.log('🧪 Probando flujo completo de resend verification...\n');
  
  const testEmail = 'test_1750188304@example.com';
  
  try {
    // 1. Buscar usuario
    console.log('1️⃣ Buscando usuario...');
    const user = await userService.findByEmail(testEmail);
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      username: user.username,
      email_verified: user.email_verified
    });

    // 2. Verificar si está verificado
    if (user.email_verified) {
      console.log('⚠️ Usuario ya está verificado');
      return;
    }

    // 3. Limpiar tokens expirados
    console.log('\n2️⃣ Limpiando tokens expirados...');
    await userService.cleanExpiredVerificationTokens();
    console.log('✅ Tokens expirados limpiados');

    // 4. Generar nuevo token
    console.log('\n3️⃣ Generando nuevo token...');
    const verificationToken = generateVerificationToken();
    console.log('✅ Token generado:', verificationToken.substring(0, 10) + '...');

    // 5. Actualizar token en BD
    console.log('\n4️⃣ Actualizando token en base de datos...');
    const updateResult = await userService.updateVerificationToken(user.id, verificationToken);
    console.log('✅ Token actualizado en BD:', updateResult);

    // 6. Enviar email
    console.log('\n5️⃣ Enviando email de verificación...');
    const emailResult = await sendVerificationEmail(user.email, user.username, verificationToken);
    
    if (emailResult.success) {
      console.log('✅ Email enviado correctamente');
      console.log('📧 Email data:', emailResult.data);
    } else {
      console.log('❌ Error enviando email:', emailResult.error);
    }

    console.log('\n🎉 Proceso completado exitosamente!');

  } catch (error) {
    console.error('\n💥 Error en el proceso:', error);
    console.error('Stack trace:', error.stack);
  }
}

testResendVerification().then(() => {
  console.log('\n🔚 Test finalizado');
  process.exit(0);
}).catch(err => {
  console.error('💥 Error crítico:', err);
  process.exit(1);
});
