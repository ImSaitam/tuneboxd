import { getSpotifyAccessToken } from '../../../../../../lib/spotify';

export async function GET(request, { params }) {
  try {
    const { artistId } = await params;

    if (!artistId) {
      return Response.json(
        { success: false, error: 'Artist ID is required' },
        { status: 400 }
      );
    }

    // Obtener token de acceso
    const tokenData = await getSpotifyAccessToken();
    const accessToken = tokenData.access_token;

    // Obtener álbumes del artista
    const albumsResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!albumsResponse.ok) {
      const errorData = await albumsResponse.json();
      return Response.json(
        { success: false, error: 'Failed to fetch albums from Spotify', details: errorData },
        { status: albumsResponse.status }
      );
    }

    const albumsData = await albumsResponse.json();

    // Filtrar duplicados por nombre (Spotify a veces tiene duplicados)
    const uniqueAlbums = [];
    const seenNames = new Set();
    
    for (const album of albumsData.items) {
      const normalizedName = album.name.toLowerCase().trim();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueAlbums.push(album);
      }
    }

    return Response.json({
      success: true,
      albums: {
        items: uniqueAlbums,
        total: uniqueAlbums.length
      }
    });

  } catch (error) {
    console.error('Error fetching artist albums:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
