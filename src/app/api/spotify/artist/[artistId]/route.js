
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

    // Obtener álbumes del artista
    const albumsResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,compilation,appears_on&market=US&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let albumsData = { items: [] };
    if (albumsResponse.ok) {
      albumsData = await albumsResponse.json();
    }

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
      albums: albumsData.items,
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
