import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userService } from '../../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validar datos de entrada
    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await userService.findByEmail(email);
    
    if (!user) {
      return Response.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return Response.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar si el usuario está verificado
    if (!user.verified) {
      return Response.json(
        { 
          success: false, 
          message: 'Por favor verifica tu cuenta antes de iniciar sesión. Revisa tu email o solicita un nuevo enlace de verificación.',
          needsVerification: true,
          email: user.email
        },
        { status: 401 }
      );
    }

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remover contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      success: true,
      token,
      user: userWithoutPassword,
      message: 'Inicio de sesión exitoso'
    });

  } catch (error) {
    console.error('Error en login:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
