import jwt from 'jsonwebtoken';
import { customListService, albumService } from '../../../../lib/database.js';

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

// GET: Obtener una lista específica con sus álbumes
export async function GET(request, { params }) {
  try {
    const { listId } = await params;
    const decoded = await verifyAuth(request, true); // Optional auth para listas públicas

    const list = await customListService.getListWithAlbums(
      parseInt(listId), 
      decoded?.userId
    );

    if (!list) {
      return Response.json(
        { success: false, message: 'Lista no encontrada o no tienes permisos para verla' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      list
    });

  } catch (error) {
    console.error('Error obteniendo lista:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT: Actualizar datos de una lista
export async function PUT(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const { listId } = await params;
    const { name, description, is_public } = await request.json();

    // Validaciones
    if (!name || name.trim().length === 0) {
      return Response.json(
        { success: false, message: 'El nombre de la lista es requerido' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return Response.json(
        { success: false, message: 'El nombre no puede exceder 100 caracteres' },
        { status: 400 }
      );
    }

    const updatedList = await customListService.updateList(
      parseInt(listId),
      decoded.userId,
      {
        name: name.trim(),
        description: description?.trim() || null,
        is_public: Boolean(is_public)
      }
    );

    return Response.json({
      success: true,
      message: 'Lista actualizada exitosamente',
      list: updatedList
    });

  } catch (error) {
    if (error.message === 'Lista no encontrada o no tienes permisos') {
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

    console.error('Error actualizando lista:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una lista
export async function DELETE(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const { listId } = await params;

    const deleted = await customListService.deleteList(
      parseInt(listId),
      decoded.userId
    );

    if (!deleted) {
      return Response.json(
        { success: false, message: 'Lista no encontrada o no tienes permisos' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Lista eliminada exitosamente'
    });

  } catch (error) {
    if (error.message === 'Lista no encontrada o no tienes permisos') {
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

    console.error('Error eliminando lista:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
