import jwt from 'jsonwebtoken';
import { reviewService } from '../../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

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

export async function PUT(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const resolvedParams = await params;
    const reviewId = parseInt(resolvedParams.reviewId);
    
    if (!reviewId || isNaN(reviewId)) {
      return Response.json(
        { success: false, message: 'ID de reseña inválido' },
        { status: 400 }
      );
    }

    const { rating, title, content } = await request.json();

    // Validar rating
    if (rating && (rating < 1 || rating > 5)) {
      return Response.json(
        { success: false, message: 'El rating debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    // Actualizar la reseña
    const changes = await reviewService.updateReview(reviewId, decoded.userId, {
      rating: rating || undefined,
      title: title || null,
      content: content || null
    });

    if (changes === 0) {
      return Response.json(
        { success: false, message: 'Reseña no encontrada o no tienes permisos para editarla' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Reseña actualizada exitosamente'
    });

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error actualizando reseña:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const resolvedParams = await params;
    const reviewId = parseInt(resolvedParams.reviewId);
    
    if (!reviewId || isNaN(reviewId)) {
      return Response.json(
        { success: false, message: 'ID de reseña inválido' },
        { status: 400 }
      );
    }

    // Eliminar la reseña
    const changes = await reviewService.deleteReview(reviewId, decoded.userId);

    if (changes === 0) {
      return Response.json(
        { success: false, message: 'Reseña no encontrada o no tienes permisos para eliminarla' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error eliminando reseña:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
