import jwt from 'jsonwebtoken';
import { forumService } from '../../../../../lib/database-adapter.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Función para verificar autenticación
async function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorización requerido');
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const resolvedParams = await params;
    const replyId = parseInt(resolvedParams.replyId);
    
    if (!replyId || isNaN(replyId)) {
      return Response.json(
        { success: false, error: 'ID de respuesta inválido' },
        { status: 400 }
      );
    }

    // Eliminar la respuesta
    const deleted = await forumService.deleteReply(replyId, decoded.userId);

    if (!deleted) {
      return Response.json(
        { success: false, error: 'No se pudo eliminar la respuesta' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Respuesta eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando respuesta:', error);
    
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error.message === 'Respuesta no encontrada') {
      return Response.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error.message === 'No tienes permisos para eliminar esta respuesta') {
      return Response.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
