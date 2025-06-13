import jwt from 'jsonwebtoken';
import { albumService, watchlistService } from '../../../lib/database.js';

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

// POST: Añadir álbum a la watchlist
export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    const { album } = await request.json();

    // Validar datos del álbum
    if (!album || !album.spotify_id || !album.name || !album.artist) {
      return Response.json(
        { success: false, message: 'Datos del álbum incompletos' },
        { status: 400 }
      );
    }

    // Crear o encontrar el álbum
    const albumRecord = await albumService.findOrCreateAlbum({
      spotify_id: album.spotify_id,
      name: album.name,
      artist: album.artist,
      release_date: album.release_date || null,
      image_url: album.image_url || null,
      spotify_url: album.spotify_url || null
    });

    // Verificar si ya está en la watchlist
    const isAlreadyInWatchlist = await watchlistService.isInWatchlist(decoded.userId, albumRecord.id);
    if (isAlreadyInWatchlist) {
      return Response.json(
        { success: false, message: 'Este álbum ya está en tu lista de escucha' },
        { status: 409 }
      );
    }

    // Añadir a la watchlist
    await watchlistService.addToWatchlist(decoded.userId, albumRecord.id);

    return Response.json({
      success: true,
      message: 'Álbum añadido a tu lista de escucha',
      album: {
        id: albumRecord.id,
        name: albumRecord.name,
        artist: albumRecord.artist,
        image_url: albumRecord.image_url
      }
    });

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error añadiendo álbum a la watchlist:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET: Obtener la watchlist del usuario
export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Obtener watchlist
    const watchlist = await watchlistService.getUserWatchlist(decoded.userId, limit, offset);
    const totalCount = await watchlistService.getWatchlistCount(decoded.userId);

    return Response.json({
      success: true,
      watchlist,
      pagination: {
        limit,
        offset,
        totalCount,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error obteniendo watchlist:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Remover álbum de la watchlist
export async function DELETE(request) {
  try {
    const decoded = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    if (!albumId) {
      return Response.json(
        { success: false, message: 'ID del álbum requerido' },
        { status: 400 }
      );
    }

    const changes = await watchlistService.removeFromWatchlist(decoded.userId, parseInt(albumId));

    if (changes === 0) {
      return Response.json(
        { success: false, message: 'Álbum no encontrado en tu lista de escucha' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Álbum removido de tu lista de escucha'
    });

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error removiendo álbum de la watchlist:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
