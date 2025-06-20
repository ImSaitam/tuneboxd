import { NextResponse } from 'next/server';
import { query } from "../../../../../lib/database-adapter.js";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'ID del usuario requerido'
      }, { status: 400 });
    }

    // Obtener artistas seguidos del usuario específico
    const followedArtists = await query(
      `SELECT artist_id, artist_name, artist_image, created_at as followed_at 
       FROM artist_follows 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      artists: followedArtists
    });

  } catch (error) {
    console.error('Error al obtener artistas seguidos del usuario:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
