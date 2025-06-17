import { userService } from "../../../../lib/database-adapter.js";
import { generateVerificationToken, sendVerificationEmail } from '../../../../lib/email-resend.js';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { success: false, message: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { success: false, message: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await userService.findByEmail(email);
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return Response.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un nuevo enlace de verificación'
      });
    }

    // Si el usuario ya está verificado
    if (user.email_verified) {
      return Response.json({
        success: true,
        message: 'Tu cuenta ya está verificada. Puedes iniciar sesión normalmente.'
      });
    }

    // Limpiar tokens expirados
    await userService.cleanExpiredVerificationTokens();

    // Generar nuevo token de verificación
    const verificationToken = generateVerificationToken();

    // Actualizar token en la base de datos
    await userService.updateVerificationToken(user.id, verificationToken);

    // Enviar email de verificación
    const emailResult = await sendVerificationEmail(user.email, user.username, verificationToken);
    
    if (emailResult.success) {
    } else {
      console.error(`❌ Error reenviando email de verificación: ${emailResult.error}`);
      return Response.json(
        { success: false, message: 'Error al enviar el email de verificación. Inténtalo de nuevo más tarde.' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Te hemos enviado un nuevo enlace de verificación. Por favor, revisa tu bandeja de entrada.'
    });

  } catch (error) {
    console.error('Error reenviando email de verificación:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
