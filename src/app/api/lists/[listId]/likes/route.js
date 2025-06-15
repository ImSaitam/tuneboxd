import jwt from 'jsonwebtoken';
import { customListService, notificationService } from '../../../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

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

// POST: Dar like a una lista
export async function POST(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const { listId } = await params;

    await customListService.likeList(parseInt(listId), decoded.userId);

    // Crear notificación para el dueño de la lista
    try {
      await notificationService.notifyListLike(parseInt(listId), decoded.userId);
    } catch (notifError) {
      console.error('Error creando notificación de like:', notifError);
      // No fallar la operación principal por un error de notificación
    }

    return Response.json({
      success: true,
      message: 'Like agregado exitosamente'
    });

  } catch (error) {
    if (error.message === 'Ya le diste like a esta lista') {
      return Response.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    if (error.message === 'Lista no encontrada o no es accesible') {
      return Response.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error agregando like:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Quitar like de una lista
export async function DELETE(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const { listId } = await params;

    await customListService.unlikeList(parseInt(listId), decoded.userId);

    return Response.json({
      success: true,
      message: 'Like removido exitosamente'
    });

  } catch (error) {
    if (error.message === 'No habías dado like a esta lista') {
      return Response.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error removiendo like:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET: Obtener likes de una lista
export async function GET(request, { params }) {
  try {
    const { listId } = await params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const likes = await customListService.getListLikes(parseInt(listId), limit, offset);
    const totalCount = await customListService.getListLikesCount(parseInt(listId));

    return Response.json({
      success: true,
      likes,
      pagination: {
        limit,
        offset,
        totalCount,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error obteniendo likes:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
