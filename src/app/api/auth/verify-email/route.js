import { userService } from "../../../../lib/database-adapter.js";
import { sendWelcomeEmail } from '../../../../lib/email-resend.js';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return Response.json(
        { success: false, message: 'Token de verificación requerido' },
        { status: 400 }
      );
    }

    // Buscar el token de verificación
    const verification = await userService.findVerificationToken(token);
    
    if (!verification) {
      return Response.json(
        { success: false, message: 'Token de verificación inválido o expirado' },
        { status: 400 }
      );
    }

    // Obtener el usuario
    const user = await userService.findById(verification.user_id);
    
    if (!user) {
      return Response.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario ya está verificado
    if (user.verified) {
      return Response.json(
        { success: true, message: 'Tu cuenta ya estaba verificada' }
      );
    }

    // Verificar el usuario
    await userService.verifyUser(user.id);
    
    // Eliminar el token usado
    await userService.deleteVerificationToken(token);

    // Enviar email de bienvenida
    const welcomeResult = await sendWelcomeEmail(user.email, user.username);
    
    if (welcomeResult.success) {
    } else {
      console.error(`❌ Error enviando email de bienvenida: ${welcomeResult.error}`);
    }

    return Response.json({
      success: true,
      message: 'Cuenta verificada exitosamente. ¡Bienvenido a Tuneboxd!'
    });

  } catch (error) {
    console.error('Error verificando email:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
