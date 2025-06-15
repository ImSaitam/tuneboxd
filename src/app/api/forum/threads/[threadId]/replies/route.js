import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { forumService, notificationService } from '../../../../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST - Crear nueva respuesta en un hilo
export async function POST(request, { params }) {
  try {
    const { threadId } = await params;
    const body = await request.json();
    const { content } = body;

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
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'El contenido es requerido' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'El contenido no puede exceder 2000 caracteres' },
        { status: 400 }
      );
    }

    // Verificar que el hilo existe
    const thread = await forumService.getThread(parseInt(threadId));
    if (!thread) {
      return NextResponse.json(
        { success: false, message: 'Hilo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el hilo no esté bloqueado
    if (thread.is_locked) {
      return NextResponse.json(
        { success: false, message: 'Este hilo está bloqueado para nuevos comentarios' },
        { status: 403 }
      );
    }

    const replyId = await forumService.createReply(
      parseInt(threadId),
      decoded.userId,
      content.trim()
    );

    // Crear notificación para el autor del hilo
    try {
      await notificationService.notifyThreadComment(parseInt(threadId), decoded.userId);
    } catch (notifError) {
      console.error('Error creando notificación de comentario en hilo:', notifError);
      // No fallar la operación principal por un error de notificación
    }

    return NextResponse.json({
      success: true,
      message: 'Respuesta creada exitosamente',
      replyId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando respuesta:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
