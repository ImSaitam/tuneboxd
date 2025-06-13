import { getSpotifyAccessToken } from '../../../../../lib/spotify';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const albumId = resolvedParams.albumId;
    
    if (!albumId) {
      return Response.json(
        { success: false, error: 'ID de álbum requerido' },
        { status: 400 }
      );
    }

    // Obtener access token de Spotify
    const tokenData = await getSpotifyAccessToken();
    const accessToken = tokenData.access_token;

    // Obtener álbum de Spotify
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json(
          { success: false, error: 'Álbum no encontrado' },
          { status: 404 }
        );
      }
      throw new Error(`Error de Spotify: ${response.status}`);
    }

    const albumData = await response.json();

    return Response.json({
      success: true,
      album: albumData
    });

  } catch (error) {
    console.error('Error obteniendo álbum de Spotify:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
