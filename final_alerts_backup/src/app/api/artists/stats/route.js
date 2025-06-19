import { NextResponse } from 'next/server';
import { get } from "../../../../lib/database-adapter.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const artist_id = searchParams.get('artist_id');

    if (!artist_id) {
      return NextResponse.json({
        success: false,
        message: 'ID del artista requerido'
      }, { status: 400 });
    }

    // Contar seguidores del artista en la aplicación
    const followersCount = await get(
      `SELECT COUNT(*) as count FROM artist_follows WHERE artist_id = ?`,
      [artist_id]
    );

    return NextResponse.json({
      success: true,
      followers: followersCount?.count || 0
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del artista:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      followers: 0
    }, { status: 500 });
  }
}
