import { NextResponse } from 'next/server';
import { userService } from '../../../../lib/database.js';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Validar que hay una query de búsqueda
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Query de búsqueda requerida' },
        { status: 400 }
      );
    }

    // Limpiar la query (remover @ si está presente)
    const cleanQuery = query.replace(/^@/, '').trim();
    
    if (cleanQuery.length < 2) {
      return NextResponse.json(
        { success: false, message: 'La búsqueda debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    // Obtener el usuario actual si está autenticado (opcional para búsquedas)
    let currentUserId = null;
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (error) {
        // Token inválido, pero permitimos búsquedas sin autenticación
        console.log('Token inválido en búsqueda, continuando sin autenticación');
      }
    }

    // Buscar usuarios por nombre de usuario con paginación
    const users = await userService.searchUsersByUsername(cleanQuery, limit, currentUserId, offset);
    
    // Obtener el conteo total para paginación
    const totalCount = await userService.getUserSearchCount(cleanQuery);

    return NextResponse.json({
      success: true,
      users: users,
      query: cleanQuery,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error en búsqueda de usuarios:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
