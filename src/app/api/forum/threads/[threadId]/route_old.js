import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { forumService } from '../../../../../lib/database.js';
import { shouldTrackView } from '../../../../../lib/viewTracker.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Obtener hilo específico con sus respuestas
export async function GET(request, { params }) {
  try {
    const { threadId } = await params;
    const { searchParams } = new URL(request.url);
    const repliesLimit = parseInt(searchParams.get('replies_limit')) || 50;
    const repliesOffset = parseInt(searchParams.get('replies_offset')) || 0;

    // Obtener el hilo
    const thread = await forumService.getThread(parseInt(threadId));
    
    if (!thread) {
      return NextResponse.json(
        { success: false, message: 'Hilo no encontrado' },
        { status: 404 }
      );
    }

    // Obtener información del usuario si está autenticado
    let userId = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Token inválido, continuar sin autenticación
      }
    }

    // Obtener IP del usuario
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Incrementar vistas solo si debe contarse
    if (shouldTrackView(userId, threadId, clientIp)) {
      await forumService.incrementViews(parseInt(threadId));
    }

    // Obtener respuestas
    const replies = await forumService.getReplies(
      parseInt(threadId),
      repliesLimit,
      repliesOffset
    );

    // Si hay un usuario autenticado, verificar likes
    let userLikes = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        // Verificar si el usuario ha dado like al hilo
        const hasLikedThread = await forumService.hasLikedThread(userId, parseInt(threadId));
        
        // Verificar likes en las respuestas
        const replyLikes = {};
        for (const reply of replies) {
          replyLikes[reply.id] = await forumService.hasLikedReply(userId, reply.id);
        }

        userLikes = {
          thread: hasLikedThread,
          replies: replyLikes
        };
      } catch (error) {
        // Token inválido, continuar sin datos de likes
      }
    }

    return NextResponse.json({
      success: true,
      thread: {
        ...thread,
        views_count: thread.views_count + 1 // Mostrar el número actualizado
      },
      replies,
      userLikes
    });

  } catch (error) {
    console.error('Error obteniendo hilo:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar hilo (solo el autor)
export async function DELETE(request, { params }) {
  try {
    const { threadId } = await params;

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

    // Intentar eliminar el hilo (solo si es el autor)
    const result = await forumService.deleteThread(parseInt(threadId), decoded.userId);
    
    if (result.changes === 0) {
      return NextResponse.json(
        { success: false, message: 'Hilo no encontrado o no tienes permisos para eliminarlo' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hilo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando hilo:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
