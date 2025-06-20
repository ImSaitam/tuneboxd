import jwt from 'jsonwebtoken';
import { reviewService } from "../../../../lib/database-adapter.js";

const JWT_SECRET = process.env.JWT_SECRET;

// GET: Verificar si el usuario tiene una reseña para un álbum específico
export async function GET(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { success: false, message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return Response.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const albumId = url.searchParams.get('albumId');

    if (!albumId) {
      return Response.json(
        { success: false, message: 'ID del álbum requerido' },
        { status: 400 }
      );
    }

    // Verificar si el usuario tiene una reseña para este álbum
    const existingReview = await reviewService.findByUserAndAlbum(decoded.userId, parseInt(albumId));

    return Response.json({
      success: true,
      hasReview: !!existingReview,
      review: existingReview || null
    });

  } catch (error) {
    console.error('Error verificando reseña del usuario:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
