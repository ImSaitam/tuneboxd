import jwt from 'jsonwebtoken';
import { watchlistService } from "../../../../lib/database-adapter.js";

const JWT_SECRET = process.env.JWT_SECRET;

// GET: Verificar si un álbum está en la lista de escucha del usuario
export async function GET(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { success: false, message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return Response.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const albumId = url.searchParams.get('albumId');

    if (!albumId) {
      return Response.json(
        { success: false, message: 'ID del álbum requerido' },
        { status: 400 }
      );
    }

    // Verificar si el álbum está en la lista de escucha
    const inListenList = await watchlistService.isInWatchlist(decoded.userId, parseInt(albumId));

    return Response.json({
      success: true,
      inListenList: inListenList
    });

  } catch (error) {
    console.error('Error verificando lista de escucha:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
