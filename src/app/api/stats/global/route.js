import { albumService, reviewService, userService, watchlistService } from '../../../../lib/database.js';

export async function GET() {
  try {
    // Obtener estadísticas globales desde la base de datos
    const [
      totalUsers,
      totalReviews,
      totalAlbums,
      totalWatchlistItems
    ] = await Promise.all([
      getTotalUsers(),
      getTotalReviews(),
      getTotalAlbums(),
      getTotalWatchlistItems()
    ]);

    const responseData = {
      success: true,
      stats: {
        totalUsers,
        totalAlbums,
        totalReviews,
        totalWatchlistItems
      }
    };

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
          'Content-Encoding': 'identity'
        }
      }
    );

  } catch (error) {
    console.error('Error obteniendo estadísticas globales:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error interno del servidor' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Encoding': 'identity'
        }
      }
    );
  }
}

async function getTotalUsers() {
  try {
    const count = await userService.getTotalUsersCount();
    return count;
  } catch (error) {
    console.error('Error obteniendo total de usuarios:', error);
    return 0;
  }
}

async function getTotalReviews() {
  try {
    const count = await reviewService.getTotalReviewsCount();
    return count;
  } catch (error) {
    console.error('Error obteniendo total de reseñas:', error);
    return 0;
  }
}

async function getTotalAlbums() {
  try {
    const count = await albumService.getTotalAlbumsCount();
    return count;
  } catch (error) {
    console.error('Error obteniendo total de álbumes:', error);
    return 0;
  }
}

async function getTotalWatchlistItems() {
  try {
    const count = await watchlistService.getTotalWatchlistCount();
    return count;
  } catch (error) {
    console.error('Error obteniendo total de listas de escucha:', error);
    return 0;
  }
}
