import jwt from 'jsonwebtoken';
import { albumService, listeningHistoryService } from "../../../lib/database-adapter.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Función para verificar autenticación (opcional)
async function verifyAuth(request, required = true) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (required) {
      throw new Error('Token de autorización requerido');
    }
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (required) {
      throw new Error('Token inválido');
    }
    return null;
  }
}

// POST: Agregar álbum al historial de escucha
export async function POST(request) {
  try {
    const decoded = await verifyAuth(request, true);
    const { album, listenedAt } = await request.json();

    // DEBUG: Log de datos recibidos
    console.log('POST /api/listening-history - Datos recibidos:');
    console.log('album:', JSON.stringify(album, null, 2));
    console.log('listenedAt:', listenedAt);

    // Validar datos del álbum
    if (!album || !album.spotify_id || !album.name || !album.artist) {
      console.log('Validación fallida - album:', !!album, 'spotify_id:', !!album?.spotify_id, 'name:', !!album?.name, 'artist:', !!album?.artist);
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

    // Usar la fecha del cliente si se proporciona, sino usar la fecha actual del servidor
    // La fecha del cliente ya viene en la zona horaria correcta
    const timestamp = listenedAt || new Date().toISOString();

    // Agregar al historial con la fecha correcta
    await listeningHistoryService.addToHistory(decoded.userId, albumRecord.id, timestamp);

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
    const url = new URL(request.url);
    const requestedUserId = url.searchParams.get('userId');
    let userId;
    
    if (requestedUserId) {
      // Si se especifica un userId, usar ese (para ver el historial de otros usuarios)
      userId = parseInt(requestedUserId);
      // Autenticación opcional para ver perfiles públicos
      await verifyAuth(request, false);
    } else {
      // Si no se especifica userId, usar el del token (para ver tu propio historial)
      const decoded = await verifyAuth(request, true);
      userId = decoded.userId;
    }

    const limit = parseInt(url.searchParams.get('limit') || '30');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const grouped = url.searchParams.get('grouped') === 'true';

    let listeningHistory;
    
    if (grouped) {
      // Obtener historial agrupado por fecha
      listeningHistory = await listeningHistoryService.getUserListeningHistoryGrouped(userId, limit);
    } else {
      // Obtener historial completo sin agrupar
      listeningHistory = await listeningHistoryService.getUserListeningHistory(userId, limit, offset);
    }
    
    const totalCount = await listeningHistoryService.getHistoryCount(userId);

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

// DELETE: Eliminar álbum del historial de escucha
export async function DELETE(request) {
  try {
    const decoded = await verifyAuth(request, true);
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');
    const historyId = searchParams.get('historyId');

    // Se puede eliminar por albumId (elimina todas las entradas de ese álbum)
    // o por historyId (elimina una entrada específica)
    if (!albumId && !historyId) {
      return Response.json(
        { success: false, message: 'Se requiere albumId o historyId' },
        { status: 400 }
      );
    }

    let changes;
    
    if (historyId) {
      // Eliminar entrada específica del historial
      changes = await listeningHistoryService.removeFromHistory(decoded.userId, null, parseInt(historyId));
    } else {
      // Eliminar todas las entradas de un álbum específico
      changes = await listeningHistoryService.removeFromHistory(decoded.userId, parseInt(albumId));
    }

    if (changes === 0) {
      return Response.json(
        { success: false, message: 'Álbum no encontrado en tu historial de escucha' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Álbum eliminado del historial de escucha'
    });

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error eliminando álbum del historial:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
