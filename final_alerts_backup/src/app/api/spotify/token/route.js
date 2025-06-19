import { getSpotifyAccessToken } from '@/lib/spotify';

export async function GET() {
  try {
    const tokenData = await getSpotifyAccessToken();
    
    return Response.json({
      success: true,
      data: tokenData
    });
  } catch (error) {
    console.error('Error en API de token:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Error al obtener access token de Spotify' 
      },
      { status: 500 }
    );
  }
}
