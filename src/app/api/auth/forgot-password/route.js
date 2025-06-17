import jwt from 'jsonwebtoken';
import { userService } from "../../../../lib/database-adapter.js";
import { sendPasswordResetEmail } from '../../../../lib/email-resend.js';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validar datos de entrada
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
    
    // Por seguridad, siempre devolvemos el mismo mensaje aunque el usuario no exista
    if (!user) {
      return Response.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
      });
    }

    // Generar token de recuperación (válido por 1 hora)
    const resetToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        type: 'password_reset'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Enviar email de recuperación con Resend
    try {
      const emailResult = await sendPasswordResetEmail(user.email, user.username, resetToken);
      
      if (emailResult.success) {
      } else {
        console.error(`❌ Error enviando email de recuperación: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.error('❌ Error en servicio de email:', emailError);
      // Continuar con la respuesta aunque falle el email
    }

    return Response.json({
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
    });

  } catch (error) {
    console.error('Error en forgot password:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
