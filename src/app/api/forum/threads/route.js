import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { forumService } from '../../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Obtener lista de hilos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const search = searchParams.get('search');

    let threads;
    
    if (search) {
      threads = await forumService.searchThreads(search, limit, offset);
    } else {
      threads = await forumService.getThreads(limit, offset, category, language);
    }

    return NextResponse.json({
      success: true,
      threads
    });
  } catch (error) {
    console.error('Error obteniendo hilos:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo hilo
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, category = 'general', language = 'es' } = body;

    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Validar datos
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'El título es requerido' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { success: false, message: 'El título no puede exceder 200 caracteres' },
        { status: 400 }
      );
    }

    if (content && content.length > 5000) {
      return NextResponse.json(
        { success: false, message: 'El contenido no puede exceder 5000 caracteres' },
        { status: 400 }
      );
    }

    const threadId = await forumService.createThread(
      decoded.userId,
      title.trim(),
      content ? content.trim() : '',
      category,
      language
    );

    return NextResponse.json({
      success: true,
      message: 'Hilo creado exitosamente',
      threadId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando hilo:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
