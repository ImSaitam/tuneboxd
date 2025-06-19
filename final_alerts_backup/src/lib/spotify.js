// Utilidades para manejar la API de Spotify

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// URL base de la API de Spotify
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

/**
 * Obtiene un access token usando Client Credentials Flow
 * Este método es útil para acceder a datos públicos sin autenticación de usuario
 */
export async function getSpotifyAccessToken() {
  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  
  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener token: ${response.status}`);
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    };
  } catch (error) {
    console.error('Error obteniendo access token:', error);
    throw error;
  }
}

/**
 * Busca álbumes en Spotify
 */
export async function searchAlbums(query, accessToken, limit = 20) {
  try {
    const searchParams = new URLSearchParams({
      q: query,
      type: 'album',
      limit: limit.toString(),
    });

    const response = await fetch(`${SPOTIFY_API_BASE}/search?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error en búsqueda: ${response.status}`);
    }

    const data = await response.json();
    return data.albums;
  } catch (error) {
    console.error('Error buscando álbumes:', error);
    throw error;
  }
}

/**
 * Obtiene información de un álbum específico
 */
export async function getAlbum(albumId, accessToken) {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/albums/${albumId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo álbum: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo álbum:', error);
    throw error;
  }
}

/**
 * Busca artistas en Spotify
 */
export async function searchArtists(query, accessToken, limit = 20) {
  try {
    const searchParams = new URLSearchParams({
      q: query,
      type: 'artist',
      limit: limit.toString(),
    });

    const response = await fetch(`${SPOTIFY_API_BASE}/search?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error en búsqueda: ${response.status}`);
    }

    const data = await response.json();
    return data.artists;
  } catch (error) {
    console.error('Error buscando artistas:', error);
    throw error;
  }
}

/**
 * Busca canciones en Spotify
 */
export async function searchTracks(query, accessToken, limit = 20) {
  try {
    const searchParams = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
    });

    const response = await fetch(`${SPOTIFY_API_BASE}/search?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error en búsqueda: ${response.status}`);
    }

    const data = await response.json();
    return data.tracks;
  } catch (error) {
    console.error('Error buscando canciones:', error);
    throw error;
  }
}
