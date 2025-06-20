import { reviewService } from "../../../../../lib/database-adapter.js";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const albumId = parseInt(resolvedParams.albumId);
    
    if (!albumId || isNaN(albumId)) {
      return Response.json(
        { success: false, message: 'ID de álbum inválido' },
        { status: 400 }
      );
    }

    // Obtener estadísticas del álbum
    const stats = await reviewService.getAlbumStats(albumId);

    return Response.json({
      success: true,
      stats: {
        total_reviews: stats.total_reviews || 0,
        avg_rating: stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : 0,
        rating_distribution: {
          5: stats.five_stars || 0,
          4: stats.four_stars || 0,
          3: stats.three_stars || 0,
          2: stats.two_stars || 0,
          1: stats.one_star || 0
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del álbum:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
