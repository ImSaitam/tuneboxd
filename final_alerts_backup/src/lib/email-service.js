import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendVerificationEmail(email, verificationToken, username) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}`;
    
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@tuneboxd.com',
        to: [email],
        subject: 'Verifica tu cuenta en TuneBoxd',
        html: this.getVerificationEmailTemplate(username, verificationUrl),
      });

      if (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
      }

      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('Error in sendVerificationEmail:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email, resetToken, username) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@tuneboxd.com',
        to: [email],
        subject: 'Restablece tu contraseña en TuneBoxd',
        html: this.getPasswordResetEmailTemplate(username, resetUrl),
      });

      if (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
      }

      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('Error in sendPasswordResetEmail:', error);
      throw error;
    }
  }

  static getVerificationEmailTemplate(username, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifica tu cuenta</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TuneBoxd</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${username}!</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Bienvenido a TuneBoxd. Para completar tu registro y comenzar a descubrir nueva música, 
            necesitas verificar tu dirección de email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      transition: transform 0.2s;">
              Verificar mi cuenta
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
          </p>
          <p style="font-size: 12px; color: #888; word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
            ${verificationUrl}
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            Este enlace expira en 24 horas. Si no solicitaste esta verificación, puedes ignorar este email.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  static getPasswordResetEmailTemplate(username, resetUrl) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablece tu contraseña</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TuneBoxd</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${username}!</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en TuneBoxd.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      transition: transform 0.2s;">
              Restablecer contraseña
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
          </p>
          <p style="font-size: 12px; color: #888; word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            Este enlace expira en 1 hora. Si no solicitaste este restablecimiento, puedes ignorar este email.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
