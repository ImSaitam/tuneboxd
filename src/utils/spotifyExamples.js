// Ejemplos de uso de la API de Spotify en Musicboxd
// Este archivo contiene ejemplos de cómo usar las funciones de la API

import { useSpotify } from '@/hooks/useSpotify';

// Ejemplo de componente que usa la búsqueda de Spotify
export const SpotifySearchExample = () => {
  const { searchMusic, loading, error } = useSpotify();

  const handleSearch = async () => {
    try {
      // Buscar álbumes
      const albums = await searchMusic('Pink Floyd', 'album', 5);
      console.log('Álbumes encontrados:', albums);

      // Buscar artistas
      const artists = await searchMusic('The Beatles', 'artist', 5);
      console.log('Artistas encontrados:', artists);

      // Buscar canciones
      const tracks = await searchMusic('Bohemian Rhapsody', 'track', 5);
      console.log('Canciones encontradas:', tracks);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar en Spotify'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
};

// Ejemplo de uso directo de la API
export const directApiExample = async () => {
  try {
    // Obtener token directamente
    const tokenResponse = await fetch('/api/spotify/token');
    const tokenData = await tokenResponse.json();
    console.log('Token obtenido:', tokenData.data.access_token);

    // Buscar música directamente
    const searchResponse = await fetch('/api/spotify/search?q=coldplay&type=album&limit=10');
    const searchData = await searchResponse.json();
    console.log('Resultados de búsqueda:', searchData.data.items);

  } catch (error) {
    console.error('Error en API directa:', error);
  }
};

// Función para formatear los datos de Spotify para mostrar
export const formatSpotifyData = (item, type) => {
  const baseData = {
    id: item.id,
    name: item.name,
    image: item.images?.[0]?.url || null,
    spotifyUrl: item.external_urls?.spotify || null,
  };

  switch (type) {
    case 'album':
      return {
        ...baseData,
        artist: item.artists?.[0]?.name || 'Artista desconocido',
        releaseDate: item.release_date || null,
        totalTracks: item.total_tracks || 0,
        type: 'album'
      };

    case 'artist':
      return {
        ...baseData,
        followers: item.followers?.total || 0,
        genres: item.genres || [],
        popularity: item.popularity || 0,
        type: 'artist'
      };

    case 'track':
      return {
        ...baseData,
        artist: item.artists?.[0]?.name || 'Artista desconocido',
        album: item.album?.name || 'Álbum desconocido',
        duration: item.duration_ms || 0,
        popularity: item.popularity || 0,
        type: 'track'
      };

    default:
      return baseData;
  }
};

// Función para convertir duración de milisegundos a formato mm:ss
export const formatDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Función para formatear el número de seguidores
export const formatFollowers = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};
