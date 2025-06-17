import { NextResponse } from 'next/server';
import db, { runAsync, getAsync, allAsync } from "../../../../lib/database-adapter.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { artist_id, tags } = await request.json();
    
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

    if (!artist_id || !Array.isArray(tags)) {
      return NextResponse.json({
        success: false,
        message: 'ID del artista y tags requeridos'
      }, { status: 400 });
    }

    const db_instance = db;
    
    // Crear tabla si no existe
    await new Promise((resolve, reject) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS artist_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          artist_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, artist_id, tag),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Eliminar tags existentes para este usuario y artista
    await runAsync(
      `DELETE FROM artist_tags WHERE user_id = ? AND artist_id = ?`,
      [decoded.userId, artist_id]
    );

    // Insertar nuevas tags
    for (const tag of tags) {
      await runAsync(
        `INSERT INTO artist_tags (user_id, artist_id, tag) VALUES (?, ?, ?)`,
        [decoded.userId, artist_id, tag]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tags guardadas correctamente'
    });

  } catch (error) {
    console.error('Error al guardar tags:', error);
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
        success: true,
        tags: []
      });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({
        success: true,
        tags: []
      });
    }

    const db_instance = db;
    
    // Obtener tags del usuario para este artista
    const userTags = await allAsync(
      `SELECT tag FROM artist_tags WHERE user_id = ? AND artist_id = ?`,
      [decoded.userId, artist_id]
    );

    return NextResponse.json({
      success: true,
      tags: userTags.map(row => row.tag)
    });

  } catch (error) {
    console.error('Error al obtener tags:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
