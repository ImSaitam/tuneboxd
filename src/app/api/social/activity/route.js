import { NextResponse } from 'next/server';
import db, { allAsync } from "../../../../lib/database-adapter.js";
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

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    // Crear tabla de user_follows si no existe
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        followed_id INTEGER NOT NULL,
        followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, followed_id),
        FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (followed_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Obtener actividad de usuarios seguidos
    const activities = await allAsync(`
      SELECT 
        'review' as activity_type,
        r.id as activity_id,
        u.username,
        u.id as user_id,
        r.rating,
        r.title as review_title,
        r.content as review_content,
        r.created_at,
        a.name as album_name,
        a.artist,
        a.image_url,
        a.spotify_id as album_spotify_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN albums a ON r.album_id = a.id
      WHERE r.user_id IN (
        SELECT followed_id FROM user_follows WHERE follower_id = ?
      )
      
      UNION ALL
      
      SELECT 
        'follow_artist' as activity_type,
        af.id as activity_id,
        u.username,
        u.id as user_id,
        NULL as rating,
        NULL as review_title,
        NULL as review_content,
        af.followed_at as created_at,
        af.artist_name as album_name,
        NULL as artist,
        af.artist_image as image_url,
        af.artist_id as album_spotify_id
      FROM artist_follows af
      JOIN users u ON af.user_id = u.id
      WHERE af.user_id IN (
        SELECT followed_id FROM user_follows WHERE follower_id = ?
      )
      
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [decoded.userId, decoded.userId, limit, offset]);

    return NextResponse.json({
      success: true,
      activities: activities || []
    });

  } catch (error) {
    console.error('Error obteniendo actividad social:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
