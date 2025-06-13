import { NextResponse } from 'next/server';
import db from '../../../../lib/database.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

export async function POST(request) {
  try {
    const { artist_id, artist_name, artist_image } = await request.json();
    
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
    
    // Verificar if ya sigue al artista
    const existingFollow = await db_instance.getAsync(
      `SELECT * FROM artist_follows WHERE user_id = ? AND artist_id = ?`,
      [decoded.userId, artist_id]
    );

    if (existingFollow) {
      return NextResponse.json({
        success: false,
        message: 'Ya sigues a este artista'
      }, { status: 400 });
    }

    // Crear tabla si no existe
    await db_instance.exec(`
      CREATE TABLE IF NOT EXISTS artist_follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        artist_id TEXT NOT NULL,
        artist_name TEXT NOT NULL,
        artist_image TEXT,
        followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, artist_id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Insertar seguimiento
    await db_instance.runAsync(
      `INSERT INTO artist_follows (user_id, artist_id, artist_name, artist_image) 
       VALUES (?, ?, ?, ?)`,
      [decoded.userId, artist_id, artist_name, artist_image]
    );

    return NextResponse.json({
      success: true,
      message: 'Ahora sigues a este artista'
    });

  } catch (error) {
    console.error('Error al seguir artista:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const artist_id = url.searchParams.get('artist_id');
    
    if (!artist_id) {
      return NextResponse.json({
        success: false,
        message: 'ID del artista requerido'
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
    const result = await db_instance.runAsync(
      `DELETE FROM artist_follows WHERE user_id = ? AND artist_id = ?`,
      [decoded.userId, artist_id]
    );

    if (result.changes === 0) {
      return NextResponse.json({
        success: false,
        message: 'No sigues a este artista'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Dejaste de seguir a este artista'
    });

  } catch (error) {
    console.error('Error al dejar de seguir artista:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const artist_id = url.searchParams.get('artist_id');
    
    if (!artist_id) {
      return NextResponse.json({
        success: false,
        message: 'ID del artista requerido'
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
    
    // Verificar si sigue al artista
    const follow = await db_instance.getAsync(
      `SELECT * FROM artist_follows WHERE user_id = ? AND artist_id = ?`,
      [decoded.userId, artist_id]
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
