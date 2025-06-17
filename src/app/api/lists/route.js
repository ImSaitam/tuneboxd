import jwt from 'jsonwebtoken';
import { customListService } from "../../../lib/database-adapter.js";

const JWT_SECRET = process.env.JWT_SECRET;

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

// POST: Crear nueva lista
export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    const { name, description, is_public = true } = await request.json();

    // Validaciones
    if (!name || name.trim().length === 0) {
      return Response.json(
        { success: false, message: 'El nombre de la lista es requerido' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return Response.json(
        { success: false, message: 'El nombre no puede exceder 100 caracteres' },
        { status: 400 }
      );
    }

    const list = await customListService.createList(decoded.userId, {
      name: name.trim(),
      description: description?.trim() || null,
      is_public: Boolean(is_public)
    });

    return Response.json({
      success: true,
      message: 'Lista creada exitosamente',
      list
    });

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error creando lista:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET: Obtener listas del usuario
export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    const url = new URL(request.url);
    const includePrivate = url.searchParams.get('includePrivate') !== 'false';

    const lists = await customListService.getUserLists(decoded.userId, includePrivate);

    return Response.json({
      success: true,
      lists
    });

  } catch (error) {
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return Response.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error obteniendo listas:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
