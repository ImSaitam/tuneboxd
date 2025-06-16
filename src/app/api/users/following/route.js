import { NextResponse } from 'next/server';
import { allAsync } from '../../../../lib/database.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

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

    // Obtener usuarios seguidos
    const followedUsers = await allAsync(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.bio,
        u.profile_picture,
        uf.followed_at,
        COUNT(r.id) as total_reviews,
        COALESCE(AVG(CAST(r.rating AS FLOAT)), 0) as avg_rating
      FROM user_follows uf
      JOIN users u ON uf.followed_id = u.id
      LEFT JOIN reviews r ON u.id = r.user_id
      WHERE uf.follower_id = ?
      GROUP BY u.id, u.username, u.email, u.bio, u.profile_picture, uf.followed_at
      ORDER BY uf.followed_at DESC
    `, [decoded.userId]);

    return NextResponse.json({
      success: true,
      users: followedUsers || []
    });

  } catch (error) {
    console.error('Error obteniendo usuarios seguidos:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
