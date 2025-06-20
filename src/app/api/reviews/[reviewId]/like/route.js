import jwt from 'jsonwebtoken';
import { reviewService } from '../../../../../lib/database-adapter.js';

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

export async function POST(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const resolvedParams = await params;
    const reviewId = parseInt(resolvedParams.reviewId);
    
    if (!reviewId || isNaN(reviewId)) {
      return Response.json(
        { success: false, error: 'ID de reseña inválido' },
        { status: 400 }
      );
    }

    // Toggle like
    const result = await reviewService.toggleReviewLike(reviewId, decoded.userId);

    return Response.json({
      success: true,
      liked: result.liked,
      message: result.liked ? 'Like agregado' : 'Like eliminado'
    });

  } catch (error) {
    console.error('Error procesando like de reseña:', error);
    
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error.message === 'Reseña no encontrada') {
      return Response.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const reviewId = parseInt(resolvedParams.reviewId);
    
    if (!reviewId || isNaN(reviewId)) {
      return Response.json(
        { success: false, error: 'ID de reseña inválido' },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    // Obtener likes de la reseña
    const likes = await reviewService.getReviewLikes(reviewId, limit, offset);
    const likeCount = await reviewService.getReviewLikeCount(reviewId);

    // Si hay token, verificar si el usuario le dio like
    let userLiked = false;
    try {
      const decoded = await verifyAuth(request);
      userLiked = await reviewService.hasUserLikedReview(reviewId, decoded.userId);
    } catch (error) {
      // No hay token o es inválido, userLiked permanece false
    }

    return Response.json({
      success: true,
      likes,
      likeCount,
      userLiked
    });

  } catch (error) {
    console.error('Error obteniendo likes de reseña:', error);
    
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
