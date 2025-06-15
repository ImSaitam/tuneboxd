import { customListService } from '../../../../lib/database.js';

// GET: Obtener listas públicas
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const lists = await customListService.getPublicLists(limit, offset);

    return Response.json({
      success: true,
      lists,
      pagination: {
        limit,
        offset,
        hasMore: lists.length === limit
      }
    });

  } catch (error) {
    console.error('Error obteniendo listas públicas:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
