import jwt from 'jsonwebtoken';
import { userService } from '../../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

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

    // En un proyecto real, aquí enviarías el email con el enlace de reset
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    console.log(`Email de recuperación para ${email}:`);
    console.log(`Enlace de recuperación: ${resetLink}`);
    console.log(`Token: ${resetToken}`);

    return Response.json({
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación',
      // En desarrollo, devolvemos el token para testing
      ...(process.env.NODE_ENV === 'development' && { resetToken, resetLink })
    });

  } catch (error) {
    console.error('Error en forgot password:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
