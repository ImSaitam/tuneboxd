import { NextResponse } from 'next/server';
import { forumService } from "../../../../lib/database-adapter.js";

// GET - Obtener categorías disponibles
export async function GET() {
  try {
    const categories = await forumService.getCategories();

    // Agregar categorías predefinidas si no existen
    const defaultCategories = [
      { category: 'general', thread_count: 0 },
      { category: 'música', thread_count: 0 },
      { category: 'recomendaciones', thread_count: 0 },
      { category: 'discusión', thread_count: 0 },
      { category: 'ayuda', thread_count: 0 }
    ];

    // Merge con categorías existentes
    const existingCategories = categories.map(c => c.category);
    const allCategories = [
      ...categories,
      ...defaultCategories.filter(dc => !existingCategories.includes(dc.category))
    ];

    return NextResponse.json({
      success: true,
      categories: allCategories
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
