import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { forumService } from '../../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST - Dar like a un hilo o respuesta
export async function POST(request) {
  try {
    const body = await request.json();
    const { thread_id, reply_id } = body;

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

    // Validar que se proporcione thread_id o reply_id, pero no ambos
    if (!thread_id && !reply_id) {
      return NextResponse.json(
        { success: false, message: 'Se requiere thread_id o reply_id' },
        { status: 400 }
      );
    }

    if (thread_id && reply_id) {
      return NextResponse.json(
        { success: false, message: 'Solo se puede proporcionar thread_id o reply_id, no ambos' },
        { status: 400 }
      );
    }

    if (thread_id) {
      await forumService.likeThread(decoded.userId, parseInt(thread_id));
    } else {
      await forumService.likeReply(decoded.userId, parseInt(reply_id));
    }

    return NextResponse.json({
      success: true,
      message: 'Like agregado exitosamente'
    });

  } catch (error) {
    console.error('Error agregando like:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Quitar like de un hilo o respuesta
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const thread_id = searchParams.get('thread_id');
    const reply_id = searchParams.get('reply_id');

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

    // Validar que se proporcione thread_id o reply_id, pero no ambos
    if (!thread_id && !reply_id) {
      return NextResponse.json(
        { success: false, message: 'Se requiere thread_id o reply_id' },
        { status: 400 }
      );
    }

    if (thread_id && reply_id) {
      return NextResponse.json(
        { success: false, message: 'Solo se puede proporcionar thread_id o reply_id, no ambos' },
        { status: 400 }
      );
    }

    if (thread_id) {
      await forumService.unlikeThread(decoded.userId, parseInt(thread_id));
    } else {
      await forumService.unlikeReply(decoded.userId, parseInt(reply_id));
    }

    return NextResponse.json({
      success: true,
      message: 'Like removido exitosamente'
    });

  } catch (error) {
    console.error('Error removiendo like:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
