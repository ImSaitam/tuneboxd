import { albumService } from "../../../lib/database-adapter.js";

export async function POST(request) {
  try {
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

    return Response.json({
      success: true,
      album: albumRecord
    });

  } catch (error) {
    console.error('Error procesando álbum:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const spotifyId = url.searchParams.get('spotify_id');
    
    if (!spotifyId) {
      return Response.json(
        { success: false, message: 'spotify_id es requerido' },
        { status: 400 }
      );
    }

    const album = await albumService.findBySpotifyId(spotifyId);
    
    if (!album) {
      return Response.json(
        { success: false, message: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      album
    });

  } catch (error) {
    console.error('Error obteniendo álbum:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
