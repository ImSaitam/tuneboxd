import { NextResponse } from 'next/server';
import { query } from "../../../../lib/database-adapter.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    console.log('🔍 Artists following endpoint called');
    
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 No auth header or invalid format');
      return NextResponse.json({
        success: false,
        message: 'Token de autorización requerido'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('🔍 Token decoded successfully, userId:', decoded.userId);
    } catch (error) {
      console.log('🔍 Token verification failed:', error.message);
      return NextResponse.json({
        success: false,
        message: 'Token inválido'
      }, { status: 401 });
    }

    // Obtener artistas seguidos
    console.log('🔍 Querying database for userId:', decoded.userId);
    const followedArtists = await query(
      `SELECT artist_id, artist_name, artist_image, created_at 
       FROM artist_follows 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [decoded.userId]
    );
    
    console.log('🔍 Query result:', followedArtists);

    return NextResponse.json({
      success: true,
      artists: followedArtists
    });

  } catch (error) {
    console.error('🔍 Error al obtener artistas seguidos:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
