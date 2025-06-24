import { getSpotifyAccessToken } from '../../../../../lib/spotify';

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

    // Obtener datos del artista
    const artistResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!artistResponse.ok) {
      const errorData = await artistResponse.json();
      return Response.json(
        { success: false, error: 'Failed to fetch artist from Spotify', details: errorData },
        { status: artistResponse.status }
      );
    }

    const artistData = await artistResponse.json();

    // Obtener todos los álbumes del artista (paginación)
    let allAlbums = [];
    let limit = 50;
    let offset = 0;
    let total = 0;
    do {
      const albumsResponse = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,compilation&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!albumsResponse.ok) break;
      const albumsData = await albumsResponse.json();
      if (albumsData.items && albumsData.items.length > 0) {
        allAlbums = allAlbums.concat(albumsData.items);
      }
      total = albumsData.total || 0;
      offset += limit;
    } while (offset < total);

    // Obtener top tracks del artista
    const topTracksResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let topTracksData = { tracks: [] };
    if (topTracksResponse.ok) {
      topTracksData = await topTracksResponse.json();
    }

    return Response.json({
      success: true,
      artist: artistData,
      albums: allAlbums,
      topTracks: topTracksData.tracks
    });

  } catch (error) {
    console.error('Error fetching artist:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
