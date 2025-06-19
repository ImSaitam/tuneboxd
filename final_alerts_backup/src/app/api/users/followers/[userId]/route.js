import { NextResponse } from 'next/server';
import { userFollowService } from "../../../../../lib/database-adapter.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'ID del usuario requerido'
      }, { status: 400 });
    }

    // Verificar autenticación (opcional para ver seguidores)
    let currentUserId = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (error) {
        // Token inválido, continuar sin autenticación
      }
    }

    // Obtener seguidores
    const followers = await userFollowService.getFollowers(userId, limit, offset);
    const totalCount = await userFollowService.getFollowersCount(userId);

    // Si hay un usuario autenticado, verificar si sigue a cada seguidor
    const followersWithFollowStatus = await Promise.all(
      followers.map(async (follower) => {
        let isFollowing = false;
        if (currentUserId && currentUserId !== follower.id) {
          isFollowing = await userFollowService.isFollowing(currentUserId, follower.id);
        }
        
        return {
          ...follower,
          profile_picture: follower.profile_image, // Mapear profile_image (DB) a profile_picture (frontend)
          isFollowing
        };
      })
    );

    return NextResponse.json({
      success: true,
      followers: followersWithFollowStatus,
      pagination: {
        limit,
        offset,
        totalCount,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error obteniendo seguidores:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
