import jwt from 'jsonwebtoken';
import { customListService } from "../../../../../lib/database-adapter.js";

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

// PUT: Actualizar comentario
export async function PUT(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const { commentId } = await params;
    const { content } = await request.json();

    const updatedComment = await customListService.updateComment(
      parseInt(commentId),
      decoded.userId,
      content
    );

    return Response.json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      comment: updatedComment
    });

  } catch (error) {
    if (error.message === 'Comentario no encontrado o no tienes permisos') {
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

    console.error('Error actualizando comentario:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar comentario
export async function DELETE(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const { commentId } = await params;

    const deleted = await customListService.deleteComment(
      parseInt(commentId),
      decoded.userId
    );

    if (!deleted) {
      return Response.json(
        { success: false, message: 'Comentario no encontrado' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Comentario eliminado exitosamente'
    });

  } catch (error) {
    if (error.message === 'Comentario no encontrado' || 
        error.message === 'No tienes permisos para eliminar este comentario') {
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

    console.error('Error eliminando comentario:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
