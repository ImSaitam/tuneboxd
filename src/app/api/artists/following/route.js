import { NextResponse } from 'next/server';
import { allAsync } from "../../../../lib/database-adapter.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Token de autorización requerido'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido'
      }, { status: 401 });
    }

    // Obtener artistas seguidos
    const followedArtists = await allAsync(
      `SELECT artist_id, artist_name, artist_image, followed_at 
       FROM artist_follows 
       WHERE user_id = ? 
       ORDER BY followed_at DESC`,
      [decoded.userId]
    );

    return NextResponse.json({
      success: true,
      artists: followedArtists
    });

  } catch (error) {
    console.error('Error al obtener artistas seguidos:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
