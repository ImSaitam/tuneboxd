import jwt from 'jsonwebtoken';
import { albumService, reviewService } from '../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

export async function POST(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { success: false, message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return Response.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    const { album, rating, title, content } = await request.json();

    // Validar datos de entrada
    if (!album || !rating) {
      return Response.json(
        { success: false, message: 'Álbum y rating son requeridos' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return Response.json(
        { success: false, message: 'El rating debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    // Validar datos del álbum
    if (!album.spotify_id || !album.name || !album.artist) {
      return Response.json(
        { success: false, message: 'Datos del álbum incompletos' },
        { status: 400 }
      );
    }

    // Crear o encontrar el álbum
    const albumRecord = await albumService.findOrCreateAlbum({
      spotify_id: album.spotify_id,
      name: album.name,
      artist: album.artist,
      release_date: album.release_date || null,
      image_url: album.image_url || null,
      spotify_url: album.spotify_url || null
    });

    // Verificar si el usuario ya reseñó este álbum
    const existingReview = await reviewService.findByUserAndAlbum(decoded.userId, albumRecord.id);
    if (existingReview) {
      return Response.json(
        { success: false, message: 'Ya has reseñado este álbum. Puedes editarla desde tu perfil.' },
        { status: 409 }
      );
    }

    // Crear la reseña
    const review = await reviewService.createReview({
      user_id: decoded.userId,
      album_id: albumRecord.id,
      rating: parseInt(rating),
      title: title || null,
      content: content || null
    });

    return Response.json({
      success: true,
      message: 'Reseña creada exitosamente',
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        created_at: review.created_at,
        album: {
          id: albumRecord.id,
          name: albumRecord.name,
          artist: albumRecord.artist,
          image_url: albumRecord.image_url
        }
      }
    });

  } catch (error) {
    console.error('Error creando reseña:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'recent';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const userId = url.searchParams.get('userId');
    const albumId = url.searchParams.get('albumId');

    let reviews = [];

    if (type === 'user' && userId) {
      reviews = await reviewService.getUserReviews(parseInt(userId), limit, offset);
    } else if (type === 'album' && albumId) {
      reviews = await reviewService.getAlbumReviews(parseInt(albumId), limit, offset);
    } else {
      reviews = await reviewService.getRecentReviews(limit);
    }

    return Response.json({
      success: true,
      reviews,
      pagination: {
        limit,
        offset,
        hasMore: reviews.length === limit
      }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
