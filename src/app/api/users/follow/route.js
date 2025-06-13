import { NextResponse } from 'next/server';
import db from '../../../../lib/database.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

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

    const db_instance = db;
    
    // Verificar if ya sigue al usuario
    const existingFollow = await db_instance.getAsync(
      `SELECT * FROM user_follows WHERE follower_id = ? AND followed_id = ?`,
      [decoded.userId, user_id]
    );

    if (existingFollow) {
      return NextResponse.json({
        success: false,
        message: 'Ya sigues a este usuario'
      }, { status: 400 });
    }

    // Crear tabla si no existe
    await db_instance.exec(`
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

    // Insertar seguimiento
    await db_instance.runAsync(
      `INSERT INTO user_follows (follower_id, followed_id) VALUES (?, ?)`,
      [decoded.userId, user_id]
    );

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

    const db_instance = db;
    
    // Eliminar seguimiento
    try {
      await new Promise((resolve, reject) => {
        db_instance.run(
          `DELETE FROM user_follows WHERE follower_id = ? AND followed_id = ?`,
          [decoded.userId, user_id],
          function(error) {
            if (error) {
              reject(error);
            } else if (this.changes === 0) {
              reject(new Error('NOT_FOLLOWING'));
            } else {
              resolve();
            }
          }
        );
      });
    } catch (error) {
      if (error.message === 'NOT_FOLLOWING') {
        return NextResponse.json({
          success: false,
          message: 'No sigues a este usuario'
        }, { status: 400 });
      }
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

    const db_instance = db;
    
    // Verificar si sigue al usuario
    const follow = await db_instance.getAsync(
      `SELECT * FROM user_follows WHERE follower_id = ? AND followed_id = ?`,
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
