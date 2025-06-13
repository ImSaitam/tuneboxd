import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userService } from '../../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    // Validar datos de entrada
    if (!username || !email || !password) {
      return Response.json(
        { success: false, message: 'Todos los campos son requeridos' },
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

    // Validar contraseña
    if (password.length < 8) {
      return Response.json(
        { success: false, message: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await userService.findByEmailOrUsername(email, username);

    if (existingUser) {
      const field = existingUser.email.toLowerCase() === email.toLowerCase() ? 'email' : 'username';
      return Response.json(
        { success: false, message: `Este ${field} ya está en uso` },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario en la base de datos
    const userId = await userService.createUser({
      username,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Obtener el usuario creado
    const newUser = await userService.findById(userId);

    // En un proyecto real, aquí enviarías un email de verificación
    console.log(`Email de verificación enviado a ${email}`);

    return Response.json({
      success: true,
      message: 'Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
