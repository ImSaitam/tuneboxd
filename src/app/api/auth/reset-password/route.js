import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userService } from "../../../../lib/database-adapter.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    // Validar datos de entrada
    if (!token || !password) {
      return Response.json(
        { success: false, message: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar fortaleza de la contraseña
    if (password.length < 8) {
      return Response.json(
        { success: false, message: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    const passwordValidations = {
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const validationsPassed = Object.values(passwordValidations).filter(Boolean).length;
    if (validationsPassed < 3) {
      return Response.json(
        { success: false, message: 'La contraseña debe contener al menos 3 de los siguientes: mayúscula, minúscula, número, carácter especial' },
        { status: 400 }
      );
    }

    // Verificar y decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return Response.json(
          { success: false, message: 'El enlace de recuperación ha expirado. Solicita uno nuevo.' },
          { status: 401 }
        );
      }
      return Response.json(
        { success: false, message: 'Token de recuperación inválido' },
        { status: 401 }
      );
    }

    // Verificar que sea un token de reset de contraseña
    if (decoded.type !== 'password_reset') {
      return Response.json(
        { success: false, message: 'Token de recuperación inválido' },
        { status: 401 }
      );
    }

    // Buscar el usuario
    const user = await userService.findById(decoded.userId);
    if (!user) {
      return Response.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña del usuario
    await userService.updatePassword(user.id, hashedPassword);

    return Response.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Error en reset password:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
