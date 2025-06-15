import jwt from 'jsonwebtoken';
import { customListService, albumService } from '../../../../../lib/database.js';

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

// POST: Agregar álbum a una lista
export async function POST(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const { listId } = await params;
    const { album, notes } = await request.json();

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

    // Agregar álbum a la lista
    await customListService.addAlbumToList(
      parseInt(listId),
      albumRecord.id,
      decoded.userId,
      notes || null
    );

    return Response.json({
      success: true,
      message: 'Álbum agregado a la lista exitosamente',
      album: {
        id: albumRecord.id,
        name: albumRecord.name,
        artist: albumRecord.artist,
        image_url: albumRecord.image_url
      }
    });

  } catch (error) {
    if (error.message === 'Lista no encontrada o no tienes permisos') {
      return Response.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    if (error.message === 'El álbum ya está en esta lista') {
      return Response.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error agregando álbum a la lista:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Remover álbum de una lista
export async function DELETE(request, { params }) {
  try {
    const decoded = await verifyAuth(request);
    const { listId } = await params;
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    if (!albumId) {
      return Response.json(
        { success: false, message: 'ID del álbum requerido' },
        { status: 400 }
      );
    }

    await customListService.removeAlbumFromList(
      parseInt(listId),
      parseInt(albumId),
      decoded.userId
    );

    return Response.json({
      success: true,
      message: 'Álbum removido de la lista exitosamente'
    });

  } catch (error) {
    if (error.message === 'Lista no encontrada o no tienes permisos') {
      return Response.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    if (error.message === 'Álbum no encontrado en la lista') {
      return Response.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error removiendo álbum de la lista:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
