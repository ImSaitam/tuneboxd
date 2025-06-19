import { NextResponse } from 'next/server';
import { query, get, run } from "../../../../lib/database-adapter.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

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

    // Verificar si ya sigue al artista
    const existingFollow = await get(
      `SELECT * FROM artist_follows WHERE user_id = ? AND artist_id = ?`,
      [decoded.userId, artist_id]
    );

    if (existingFollow) {
      return NextResponse.json({
        success: false,
        message: 'Ya sigues a este artista'
      }, { status: 400 });
    }

    // Insertar seguimiento (la tabla ya existe)
    await run(
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

    // Eliminar seguimiento
    const result = await run(
      `DELETE FROM artist_follows WHERE user_id = ? AND artist_id = ?`,
      [decoded.userId, artist_id]
    );

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

    // Verificar si sigue al artista
    const follow = await get(
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
