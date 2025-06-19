import { getSpotifyAccessToken } from '../../../../../lib/spotify';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const trackId = resolvedParams.trackId;
    
    if (!trackId) {
      return Response.json(
        { success: false, error: 'ID de track requerido' },
        { status: 400 }
      );
    }

    // Obtener access token de Spotify
    const tokenData = await getSpotifyAccessToken();
    const accessToken = tokenData.access_token;

    // Obtener track de Spotify
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json(
          { success: false, error: 'Track no encontrado' },
          { status: 404 }
        );
      }
      
      const errorData = await response.json();
      return Response.json(
        { success: false, error: errorData.error?.message || 'Error de Spotify' },
        { status: response.status }
      );
    }

    const trackData = await response.json();

    return Response.json({
      success: true,
      track: trackData
    });

  } catch (error) {
    console.error('Error obteniendo track de Spotify:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
