import jwt from 'jsonwebtoken';
import { customListService, notificationService } from "../../../../../lib/database-adapter.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Función para verificar autenticación
async function verifyAuth(request, optional = false) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (optional) return null;
    throw new Error('Token de autorización requerido');
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
}

// POST: Agregar comentario a una lista
export async function POST(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const { listId } = await params;
    const { content } = await request.json();

    const comment = await customListService.addCommentToList(
      parseInt(listId),
      decoded.userId,
      content
    );

    // Crear notificación para el dueño de la lista
    try {
      await notificationService.notifyListComment(parseInt(listId), decoded.userId);
    } catch (notifError) {
      console.error('Error creando notificación de comentario:', notifError);
      // No fallar la operación principal por un error de notificación
    }

    return Response.json({
      success: true,
      message: 'Comentario agregado exitosamente',
      comment
    });

  } catch (error) {
    if (error.message === 'Lista no encontrada o no es accesible') {
      return Response.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    if (error.message === 'El comentario no puede estar vacío' || 
        error.message === 'El comentario no puede exceder 500 caracteres') {
      return Response.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error agregando comentario:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET: Obtener comentarios de una lista
export async function GET(request, { params }) {
  try {
    const { listId } = await params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const comments = await customListService.getListComments(parseInt(listId), limit, offset);
    const totalCount = await customListService.getListCommentsCount(parseInt(listId));

    return Response.json({
      success: true,
      comments,
      pagination: {
        limit,
        offset,
        totalCount,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
