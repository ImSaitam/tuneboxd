import jwt from 'jsonwebtoken';
import { trackFavorites } from "../../../lib/database-adapter.js";

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

export async function POST(request) {
  try {
    // Verificar autenticación
    const decoded = await verifyAuth(request);
    
    const body = await request.json();
    const { trackId, trackName, artistName, albumName, imageUrl, durationMs } = body;

    if (!trackId || !trackName || !artistName) {
      return Response.json(
        { success: false, error: 'Datos del track requeridos (trackId, trackName, artistName)' },
        { status: 400 }
      );
    }

    // Crear objeto de datos del track
    const trackData = {
      id: trackId,
      name: trackName,
      artists: [{ name: artistName }],
      album: { name: albumName || 'Unknown Album' },
      duration_ms: durationMs || 0,
      images: imageUrl ? [{ url: imageUrl }] : []
    };

    // Agregar track a favoritos
    const result = await trackFavorites.addTrackToFavorites(decoded.userId, trackData);

    return Response.json({
      success: true,
      message: 'Track agregado a favoritos',
      data: result
    });

  } catch (error) {
    console.error('Error agregando track a favoritos:', error);
    
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    if (error.message === 'El track ya está en tus favoritos') {
      return Response.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Verificar autenticación
    const decoded = await verifyAuth(request);
    
    const body = await request.json();
    const { trackId } = body;

    if (!trackId) {
      return Response.json(
        { success: false, error: 'ID del track requerido' },
        { status: 400 }
      );
    }

    // Remover track de favoritos
    await trackFavorites.removeTrackFromFavorites(decoded.userId, trackId);

    return Response.json({
      success: true,
      message: 'Track removido de favoritos'
    });

  } catch (error) {
    console.error('Error removiendo track de favoritos:', error);
    
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    if (error.message === 'Track no encontrado en favoritos') {
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId');
    const statsOnly = searchParams.get('stats') === 'true';
    
    // Si solo se solicitan estadísticas, no se requiere autenticación
    if (statsOnly && trackId) {
      const stats = await trackFavorites.getTrackStats(trackId);
      return Response.json({
        success: true,
        stats
      });
    }

    // Para otras operaciones, verificar autenticación
    const decoded = await verifyAuth(request);
    
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    if (trackId) {
      // Verificar si un track específico está en favoritos y obtener estadísticas
      const [isInFavorites, stats] = await Promise.all([
        trackFavorites.isTrackInFavorites(decoded.userId, trackId),
        trackFavorites.getTrackStats(trackId)
      ]);
      
      return Response.json({
        success: true,
        isInFavorites,
        stats
      });
    } else {
      // Obtener la lista de favoritos del usuario
      const [favorites, count] = await Promise.all([
        trackFavorites.getUserFavorites(decoded.userId, limit, offset),
        trackFavorites.getUserFavoritesCount(decoded.userId)
      ]);

      return Response.json({
        success: true,
        favorites,
        count,
        hasMore: offset + favorites.length < count
      });
    }

  } catch (error) {
    console.error('Error obteniendo favoritos de tracks:', error);
    
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
