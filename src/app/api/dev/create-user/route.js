import { userService } from '../../../../lib/database.js';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return Response.json(
        { success: false, message: 'Esta función solo está disponible en desarrollo' },
        { status: 403 }
      );
    }

    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return Response.json(
        { success: false, message: 'Email, password y username son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return Response.json(
        { success: false, message: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const userId = await userService.createUser({
      username,
      email,
      password: hashedPassword
    });

    return Response.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: userId,
        username,
        email,
        password: password // Solo para desarrollo - mostrar la contraseña sin hashear
      }
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    return Response.json(
      { success: false, message: 'Error creando usuario: ' + error.message },
      { status: 500 }
    );
  }
}
