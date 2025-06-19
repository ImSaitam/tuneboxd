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

    // Obtener usuarios seguidos
    const followedUsers = await allAsync(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.bio,
        u.profile_image,
        f.created_at as followed_at,
        COUNT(r.id) as total_reviews,
        COALESCE(AVG(CAST(r.rating AS FLOAT)), 0) as avg_rating
      FROM follows f
      JOIN users u ON f.following_id = u.id
      LEFT JOIN reviews r ON u.id = r.user_id
      WHERE f.follower_id = ?
      GROUP BY u.id, u.username, u.email, u.bio, u.profile_image, f.created_at
      ORDER BY f.created_at DESC
    `, [decoded.userId]);

    // Mapear profile_image a profile_picture para consistencia con el frontend
    const mappedUsers = followedUsers?.map(user => ({
      ...user,
      profile_picture: user.profile_image
    })) || [];

    return NextResponse.json({
      success: true,
      users: mappedUsers
    });

  } catch (error) {
    console.error('Error obteniendo usuarios seguidos:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
