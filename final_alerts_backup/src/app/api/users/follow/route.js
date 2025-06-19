import { NextResponse } from 'next/server';
import db, { getAsync, runAsync, notificationService } from "../../../../lib/database-adapter.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { user_id } = await request.json();
    
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

    if (!user_id) {
      return NextResponse.json({
        success: false,
        message: 'ID del usuario requerido'
      }, { status: 400 });
    }

    // No permitir seguirse a sí mismo
    if (decoded.userId === parseInt(user_id)) {
      return NextResponse.json({
        success: false,
        message: 'No puedes seguirte a ti mismo'
      }, { status: 400 });
    }

    // Verificar if ya sigue al usuario
    const existingFollow = await getAsync(
      `SELECT * FROM follows WHERE follower_id = ? AND following_id = ?`,
      [decoded.userId, user_id]
    );

    if (existingFollow) {
      return NextResponse.json({
        success: false,
        message: 'Ya sigues a este usuario'
      }, { status: 400 });
    }

    // La tabla follows ya existe en Neon, no necesitamos crearla

    // Insertar seguimiento
    await runAsync(
      `INSERT INTO follows (follower_id, following_id) VALUES (?, ?)`,
      [decoded.userId, user_id]
    );

    // Crear notificación para el usuario seguido
    try {
      await notificationService.notifyFollow(parseInt(user_id), decoded.userId);
    } catch (notifError) {
      console.error('Error creando notificación de seguimiento:', notifError);
      // No fallar la operación principal por un error de notificación
    }

    return NextResponse.json({
      success: true,
      message: 'Ahora sigues a este usuario'
    });

  } catch (error) {
    console.error('Error al seguir usuario:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const user_id = url.searchParams.get('user_id');
    
    if (!user_id) {
      return NextResponse.json({
        success: false,
        message: 'ID del usuario requerido'
      }, { status: 400 });
    }

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

    // Eliminar seguimiento
    try {
      const result = await runAsync(
        `DELETE FROM follows WHERE follower_id = ? AND following_id = ?`,
        [decoded.userId, user_id]
      );
      
      if (result.changes === 0) {
        return NextResponse.json({
          success: false,
          message: 'No sigues a este usuario'
        }, { status: 400 });
      }
    } catch (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Dejaste de seguir a este usuario'
    });

  } catch (error) {
    console.error('Error al dejar de seguir usuario:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const user_id = url.searchParams.get('user_id');
    
    if (!user_id) {
      return NextResponse.json({
        success: false,
        message: 'ID del usuario requerido'
      }, { status: 400 });
    }

    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        isFollowing: false
      });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({
        success: false,
        isFollowing: false
      });
    }

    // Verificar si sigue al usuario
    const follow = await getAsync(
      `SELECT * FROM follows WHERE follower_id = ? AND following_id = ?`,
      [decoded.userId, user_id]
    );

    return NextResponse.json({
      success: true,
      isFollowing: !!follow
    });

  } catch (error) {
    console.error('Error al verificar seguimiento:', error);
    return NextResponse.json({
      success: false,
      isFollowing: false
    });
  }
}
