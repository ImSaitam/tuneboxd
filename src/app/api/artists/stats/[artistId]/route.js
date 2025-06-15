import { NextResponse } from 'next/server';
import { artistService } from '../../../../../lib/database.js';

export async function GET(request, { params }) {
  try {
    const { artistId } = await params;

    if (!artistId) {
      return NextResponse.json({
        success: false,
        message: 'Artist ID is required'
      }, { status: 400 });
    }

    // Obtener estadísticas del artista desde la base de datos
    const stats = await artistService.getArtistStats(artistId);

    return NextResponse.json({
      success: true,
      followers_count: stats.followers_count || 0,
      total_reviews: stats.total_reviews || 0,
      avg_rating: stats.avg_rating || 0,
      total_albums_reviewed: stats.total_albums_reviewed || 0
    });

  } catch (error) {
    console.error('Error getting artist stats:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
