import { getSpotifyAccessToken, searchAlbums, searchArtists, searchTracks } from '@/lib/spotify';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'album';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return Response.json(
        { success: false, error: 'Query de búsqueda requerida' },
        { status: 400 }
      );
    }

    // Obtener access token
    const tokenData = await getSpotifyAccessToken();
    const accessToken = tokenData.access_token;

    let results;
    
    switch (type) {
      case 'album':
        results = await searchAlbums(query, accessToken, limit);
        break;
      case 'artist':
        results = await searchArtists(query, accessToken, limit);
        break;
      case 'track':
        results = await searchTracks(query, accessToken, limit);
        break;
      default:
        return Response.json(
          { success: false, error: 'Tipo de búsqueda no válido' },
          { status: 400 }
        );
    }

    return Response.json({
      success: true,
      data: results,
      query,
      type
    });
  } catch (error) {
    console.error('Error en búsqueda de Spotify:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Error al buscar en Spotify' 
      },
      { status: 500 }
    );
  }
}
