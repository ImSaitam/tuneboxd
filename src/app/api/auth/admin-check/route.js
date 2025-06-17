import jwt from 'jsonwebtoken';
import { userService } from "../../../../lib/database-adapter.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { 
          success: false, 
          message: 'Token de autorización requerido',
          isAdmin: false 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar el usuario para obtener información actualizada
    const user = await userService.findById(decoded.userId);
    
    if (!user) {
      return Response.json(
        { 
          success: false, 
          message: 'Usuario no encontrado',
          isAdmin: false 
        },
        { status: 404 }
      );
    }

    const isAdmin = user.role === 'admin';

    return Response.json({
      success: true,
      isAdmin: isAdmin,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: isAdmin ? 'Usuario tiene permisos de administrador' : 'Usuario sin permisos de administrador'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return Response.json(
        { 
          success: false, 
          message: 'Token inválido',
          isAdmin: false 
        },
        { status: 401 }
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return Response.json(
        { 
          success: false, 
          message: 'Token expirado',
          isAdmin: false 
        },
        { status: 401 }
      );
    }

    console.error('Error verificando permisos de admin:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        isAdmin: false 
      },
      { status: 500 }
    );
  }
}
