import jwt from 'jsonwebtoken';
import { notificationService } from '../../../lib/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

// Función para verificar autenticación
async function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorización requerido');
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
}

// GET: Obtener notificaciones del usuario
export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    const url = new URL(request.url);
    
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unread_only') === 'true';

    const [notifications, unreadCount] = await Promise.all([
      notificationService.getUserNotifications(decoded.userId, limit, offset, unreadOnly),
      notificationService.getUnreadCount(decoded.userId)
    ]);

    return Response.json({
      success: true,
      notifications,
      pagination: {
        limit,
        offset,
        totalUnread: unreadCount
      }
    });

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error obteniendo notificaciones:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT: Marcar notificaciones como leídas
export async function PUT(request) {
  try {
    const decoded = await verifyAuth(request);
    const { action, notificationId } = await request.json();

    if (action === 'mark_read') {
      if (notificationId) {
        // Marcar una notificación específica como leída
        const success = await notificationService.markAsRead(notificationId, decoded.userId);
        
        if (!success) {
          return Response.json(
            { success: false, message: 'Notificación no encontrada' },
            { status: 404 }
          );
        }

        return Response.json({
          success: true,
          message: 'Notificación marcada como leída'
        });
      } else {
        // Marcar todas las notificaciones como leídas
        const markedCount = await notificationService.markAllAsRead(decoded.userId);
        
        return Response.json({
          success: true,
          message: `${markedCount} notificaciones marcadas como leídas`
        });
      }
    }

    return Response.json(
      { success: false, message: 'Acción no válida' },
      { status: 400 }
    );

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error actualizando notificaciones:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar notificación
export async function DELETE(request) {
  try {
    const decoded = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (notificationId) {
      // Eliminar una notificación específica
      const success = await notificationService.deleteNotification(
        parseInt(notificationId), 
        decoded.userId
      );

      if (!success) {
        return Response.json(
          { success: false, message: 'Notificación no encontrada' },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: 'Notificación eliminada'
      });
    } else {
      // Eliminar todas las notificaciones del usuario
      const deletedCount = await notificationService.deleteAllUserNotifications(decoded.userId);

      return Response.json({
        success: true,
        message: `${deletedCount} notificaciones eliminadas`
      });
    }

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error eliminando notificación:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
