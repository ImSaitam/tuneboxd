import { getSpotifyAccessToken } from '../../../../../../lib/spotify';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const artistId = resolvedParams.artistId;
    
    if (!artistId) {
      return Response.json(
        { success: false, error: 'ID de artista requerido' },
        { status: 400 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market') || 'US';

    // Obtener access token de Spotify
    const tokenData = await getSpotifyAccessToken();
    const accessToken = tokenData.access_token;

    // Obtener top tracks del artista de Spotify
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json(
          { success: false, error: 'Artista no encontrado' },
          { status: 404 }
        );
      }
      
      const errorData = await response.json();
      return Response.json(
        { success: false, error: errorData.error?.message || 'Error de Spotify' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      success: true,
      tracks: data.tracks
    });

  } catch (error) {
    console.error('Error obteniendo top tracks del artista de Spotify:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
