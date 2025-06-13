import jwt from 'jsonwebtoken';
import { userService } from '../../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { success: false, message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar el usuario
    const user = await userService.findById(decoded.userId);
    
    if (!user) {
      return Response.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Remover contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      success: true,
      user: userWithoutPassword,
      valid: true
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return Response.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return Response.json(
        { success: false, message: 'Token expirado' },
        { status: 401 }
      );
    }

    console.error('Error validando token:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
