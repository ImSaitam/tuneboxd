import { reviewService, userService } from "../../../../../lib/database-adapter.js";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    if (!userId) {
      return Response.json(
        { success: false, message: 'User ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await userService.findById(userId);
    if (!user) {
      return Response.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener reseñas del usuario
    const reviews = await reviewService.getUserReviews(userId, limit, offset);

    return Response.json({
      success: true,
      reviews: reviews,
      pagination: {
        limit,
        offset,
        hasMore: reviews.length === limit
      }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas del usuario:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
