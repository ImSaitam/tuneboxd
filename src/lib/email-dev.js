// Servicio de email para desarrollo que simula el envío
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Crear directorio para emails de desarrollo si no existe
const emailsDir = path.join(process.cwd(), 'dev-emails');
if (!fs.existsSync(emailsDir)) {
  fs.mkdirSync(emailsDir);
}

// Simular el transportador de email
const devTransporter = {
  verify: async () => {
    console.log('✅ Configuración de email de desarrollo verificada');
    return true;
  },
  
  sendMail: async (mailOptions) => {
    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const messageId = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();
    
    // Guardar email en archivo para revisar
    const emailContent = {
      messageId,
      timestamp,
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text
    };
    
    const filename = `email-${timestamp.replace(/[:.]/g, '-')}-${messageId}.json`;
    const filepath = path.join(emailsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(emailContent, null, 2));
    
    // Extraer URL de verificación del HTML
    const verificationUrlMatch = mailOptions.html.match(/href="([^"]*verify-email[^"]*)"/);
    const verificationUrl = verificationUrlMatch ? verificationUrlMatch[1] : null;
    
    console.log('\n📧 EMAIL DE DESARROLLO ENVIADO:');
    console.log('────────────────────────────────────────');
    console.log(`📬 Para: ${mailOptions.to}`);
    console.log(`📝 Asunto: ${mailOptions.subject}`);
    console.log(`📁 Guardado en: ${filepath}`);
    
    if (verificationUrl) {
      console.log(`🔗 URL de verificación: ${verificationUrl}`);
      console.log('\n🚀 PARA VERIFICAR MANUALMENTE:');
      console.log(`curl "${verificationUrl}"`);
    }
    
    console.log('────────────────────────────────────────\n');
    
    return { messageId };
  }
};

// Generar token de verificación
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Verificar configuración (siempre exitosa en desarrollo)
export const verifyEmailConfig = async () => {
  return await devTransporter.verify();
};

// Enviar email de verificación (simulado)
export const sendVerificationEmail = async (email, username, token) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: 'Tuneboxd <dev@tuneboxd.local>',
    to: email,
    subject: '🎵 Verifica tu cuenta en Tuneboxd (DESARROLLO)',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Email - Tuneboxd</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%); border-radius: 16px; padding: 40px; border: 1px solid #333;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #3b82f6; font-size: 32px; margin: 0; font-weight: bold;">🎵 Tuneboxd</h1>
              <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 16px;">Tu comunidad musical (DESARROLLO)</p>
            </div>

            <!-- Content -->
            <div style="text-align: center;">
              <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">¡Bienvenido/a, ${username}!</h2>
              
              <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Gracias por unirte a Tuneboxd. Para completar tu registro y comenzar a descubrir música increíble, 
                necesitas verificar tu dirección de email.
              </p>

              <div style="background-color: #1f2937; border-radius: 12px; padding: 30px; margin: 30px 0; border: 1px solid #374151;">
                <p style="color: #9ca3af; font-size: 14px; margin-bottom: 20px;">
                  Haz clic en el botón de abajo para verificar tu cuenta:
                </p>
                
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                          color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; 
                          font-weight: bold; font-size: 16px; transition: all 0.3s ease;">
                  ✅ Verificar mi cuenta
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <span style="color: #3b82f6; word-break: break-all;">${verificationUrl}</span>
              </p>

              <div style="background-color: #fef3cd; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 30px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  ⚠️ <strong>Modo Desarrollo:</strong> Este es un email simulado. El enlace funciona normalmente.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #374151; padding-top: 30px; margin-top: 40px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Si no creaste esta cuenta, puedes ignorar este email de forma segura.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                © 2024 Tuneboxd. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
¡Hola ${username}!

Bienvenido/a a Tuneboxd (DESARROLLO). Para completar tu registro, necesitas verificar tu dirección de email.

Haz clic en el siguiente enlace para verificar tu cuenta:
${verificationUrl}

Este enlace expirará en 24 horas por seguridad.

Si no creaste esta cuenta, puedes ignorar este email de forma segura.

Saludos,
El equipo de Tuneboxd
    `
  };

  return await devTransporter.sendMail(mailOptions);
};

// Enviar email de bienvenida (simulado)
export const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: 'Tuneboxd <dev@tuneboxd.local>',
    to: email,
    subject: '🎉 ¡Tu cuenta ha sido verificada! - Tuneboxd (DESARROLLO)',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cuenta Verificada - Tuneboxd</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%); border-radius: 16px; padding: 40px; border: 1px solid #333;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #10b981; font-size: 32px; margin: 0; font-weight: bold;">🎉 ¡Verificado!</h1>
            </div>

            <!-- Content -->
            <div style="text-align: center;">
              <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">¡Hola ${username}!</h2>
              
              <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                ¡Excelente! Tu cuenta ha sido verificada exitosamente. Ya puedes disfrutar de todas las 
                características de Tuneboxd.
              </p>

              <div style="background-color: #1f2937; border-radius: 12px; padding: 30px; margin: 30px 0; border: 1px solid #374151;">
                <h3 style="color: #10b981; margin-bottom: 20px;">¿Qué puedes hacer ahora?</h3>
                <ul style="color: #d1d5db; text-align: left; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">🔍 Buscar y descubrir nueva música</li>
                  <li style="margin-bottom: 10px;">⭐ Escribir reseñas de tus álbumes favoritos</li>
                  <li style="margin-bottom: 10px;">👥 Participar en el foro de la comunidad</li>
                  <li style="margin-bottom: 10px;">📝 Crear y gestionar tu lista de escucha</li>
                  <li style="margin-bottom: 10px;">🤝 Seguir a otros usuarios con gustos similares</li>
                </ul>
                
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                          color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; 
                          font-weight: bold; font-size: 16px; margin-top: 20px;">
                  🎵 Explorar Tuneboxd
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #374151; padding-top: 30px; margin-top: 40px; text-center;">
              <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                © 2024 Tuneboxd. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return await devTransporter.sendMail(mailOptions);
};
