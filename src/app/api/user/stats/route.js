import jwt from 'jsonwebtoken';
import { reviewService, userService, userFollowService, getAsync, allAsync } from "../../../../lib/database-adapter.js";
import db from "../../../../lib/database-adapter.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const albumId = searchParams.get('albumId');

    // Si se solicita información específica de un álbum, verificar autenticación
    if (albumId) {
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

      // Obtener la reseña del usuario para este álbum
      const userReview = await getUserReviewForAlbum(decoded.userId, parseInt(albumId));
      
      return Response.json({
        success: true,
        userReview
      });
    }

    if (!userId) {
      return Response.json(
        { success: false, message: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Obtener estadísticas básicas del usuario
    const [
      totalReviews,
      averageRating,
      recentActivity,
      topGenres,
      monthlyStats,
      followStats
    ] = await Promise.all([
      getTotalReviews(userId),
      getAverageRating(userId),
      getRecentActivity(userId),
      getTopGenres(userId),
      getMonthlyStats(userId),
      userFollowService.getFollowStats(userId)
    ]);    const stats = {
      totalReviews,
      averageRating: parseFloat(averageRating || 0).toFixed(1),
      recentActivity,
      topGenres,
      monthlyStats,
      memberSince: await getMemberSinceDate(userId),
      followers: followStats.followers,
      following: followStats.following
    };

    return Response.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del usuario:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Funciones auxiliares para obtener estadísticas
async function getTotalReviews(userId) {
  try {
    const result = await getAsync(
      'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
      [userId]
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Error obteniendo total de reseñas:', error);
    return 0;
  }
}

async function getAverageRating(userId) {
  try {
    const result = await getAsync(
      'SELECT COALESCE(AVG(CAST(rating AS FLOAT)), 0) as average FROM reviews WHERE user_id = ?',
      [userId]
    );
    return parseFloat(result?.average) || 0;
  } catch (error) {
    console.error('Error obteniendo promedio de calificaciones:', error);
    return 0;
  }
}

async function getRecentActivity(userId) {
  try {
    const result = await getAsync(
      "SELECT COUNT(*) as count FROM reviews WHERE user_id = ? AND created_at >= NOW() - INTERVAL '30 days'",
      [userId]
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Error obteniendo actividad reciente:', error);
    return 0;
  }
}

async function getTopGenres(userId) {
  try {
    // Esta es una implementación básica - en un proyecto real tendrías géneros en tu base de datos
    const reviews = await allAsync(
      `SELECT a.name as album_name, a.artist_name as artist 
       FROM reviews r 
       LEFT JOIN albums a ON r.spotify_album_id = a.spotify_id 
       WHERE r.user_id = ? 
       ORDER BY r.created_at DESC 
       LIMIT 20`,
      [userId]
    );
    
    // Por ahora solo devolvemos algunos géneros de ejemplo basados en el número de reseñas
    const reviewCount = reviews.length;
    return [
      { genre: 'Rock', count: Math.min(reviewCount, Math.floor(reviewCount * 0.3)) },
      { genre: 'Pop', count: Math.min(reviewCount, Math.floor(reviewCount * 0.25)) },
      { genre: 'Electronic', count: Math.min(reviewCount, Math.floor(reviewCount * 0.2)) },
      { genre: 'Hip-Hop', count: Math.min(reviewCount, Math.floor(reviewCount * 0.15)) },
      { genre: 'Indie', count: Math.min(reviewCount, Math.floor(reviewCount * 0.1)) }
    ].filter(genre => genre.count > 0).sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error obteniendo géneros favoritos:', error);
    return [];
  }
}

async function getMonthlyStats(userId) {
  try {
    const result = await allAsync(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as reviews,
        COALESCE(AVG(CAST(rating AS FLOAT)), 0) as avg_rating
      FROM reviews 
      WHERE user_id = ? 
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `, [userId]);
    
    // Asegurar que avg_rating sea siempre un número válido
    const processedResult = (result || []).map(stat => ({
      ...stat,
      reviews: parseInt(stat.reviews) || 0,
      avg_rating: parseFloat(stat.avg_rating) || 0
    }));
    
    return processedResult;
  } catch (error) {
    console.error('Error obteniendo estadísticas mensuales:', error);
    return [];
  }
}

async function getMemberSinceDate(userId) {
  try {
    const user = await userService.findById(userId);
    return user?.created_at || null;
  } catch (error) {
    console.error('Error obteniendo fecha de registro:', error);
    return null;
  }
}

async function getUserReviewForAlbum(userId, albumId) {
  try {
    const review = await getAsync(`
      SELECT 
        r.id,
        r.rating,
        r.review_text as content,
        r.created_at,
        a.id as album_id,
        a.name as album_name,
        a.artist_name as artist
      FROM reviews r
      LEFT JOIN albums a ON r.spotify_album_id = a.spotify_id
      WHERE r.user_id = ? AND a.id = ?
    `, [userId, albumId]);
    
    return review || null;
  } catch (error) {
    console.error('Error obteniendo reseña del usuario:', error);
    return null;
  }
}
