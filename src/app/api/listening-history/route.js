import jwt from 'jsonwebtoken';
import { albumService, listeningHistoryService } from '../../../lib/database.js';

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

// POST: Agregar álbum al historial de escucha
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

    // Agregar al historial (se permite duplicados para registrar múltiples escuchas)
    await listeningHistoryService.addToHistory(decoded.userId, albumRecord.id);

    return Response.json({
      success: true,
      message: 'Álbum agregado al historial de escucha',
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

    if (error.message === 'Album already in recent listening history') {
      return Response.json(
        { success: false, message: 'Este álbum ya fue marcado como escuchado recientemente' },
        { status: 409 }
      );
    }

    console.error('Error agregando álbum al historial:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET: Obtener historial de escucha del usuario
export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '30');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const grouped = url.searchParams.get('grouped') === 'true';

    let listeningHistory;
    
    if (grouped) {
      // Obtener historial agrupado por fecha
      listeningHistory = await listeningHistoryService.getUserListeningHistoryGrouped(decoded.userId, limit);
    } else {
      // Obtener historial completo sin agrupar
      listeningHistory = await listeningHistoryService.getUserListeningHistory(decoded.userId, limit, offset);
    }
    
    const totalCount = await listeningHistoryService.getHistoryCount(decoded.userId);

    return Response.json({
      success: true,
      listeningHistory,
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

    console.error('Error obteniendo historial de escucha:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
