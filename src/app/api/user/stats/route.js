import jwt from 'jsonwebtoken';
import { reviewService, userService, userFollowService } from '../../../../lib/database.js';
import db from '../../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

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
    ]);

    const stats = {
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
    const result = await db.getAsync(
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
    const result = await db.getAsync(
      'SELECT AVG(rating) as average FROM reviews WHERE user_id = ?',
      [userId]
    );
    return result?.average || 0;
  } catch (error) {
    console.error('Error obteniendo promedio de calificaciones:', error);
    return 0;
  }
}

async function getRecentActivity(userId) {
  try {
    const result = await db.getAsync(
      'SELECT COUNT(*) as count FROM reviews WHERE user_id = ? AND created_at >= datetime("now", "-30 days")',
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
    const reviews = await db.allAsync(
      `SELECT a.name as album_name, a.artist 
       FROM reviews r 
       JOIN albums a ON r.album_id = a.id 
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
    const result = await db.allAsync(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as reviews,
        AVG(rating) as avg_rating
      FROM reviews 
      WHERE user_id = ? 
        AND created_at >= datetime('now', '-12 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 12
    `, [userId]);
    
    return result || [];
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
    const review = await db.getAsync(`
      SELECT 
        r.id,
        r.rating,
        r.title,
        r.content,
        r.created_at,
        a.id as album_id,
        a.name as album_name,
        a.artist
      FROM reviews r
      JOIN albums a ON r.album_id = a.id
      WHERE r.user_id = ? AND r.album_id = ?
    `, [userId, albumId]);
    
    return review || null;
  } catch (error) {
    console.error('Error obteniendo reseña del usuario:', error);
    return null;
  }
}
