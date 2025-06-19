import { NextResponse } from 'next/server';
import { forumService } from "../../../../lib/database-adapter.js";

// GET - Obtener categorías disponibles
export async function GET() {
  try {
    const categories = await forumService.getCategories();

    return NextResponse.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    
    // Fallback en caso de error
    const fallbackCategories = [
      { category: 'General', thread_count: 0 },
      { category: 'Recomendaciones', thread_count: 0 },
      { category: 'Reseñas', thread_count: 0 },
      { category: 'Discusión', thread_count: 0 },
      { category: 'Noticias', thread_count: 0 }
    ];
    
    return NextResponse.json({
      success: true,
      categories: fallbackCategories
    });
  }
}
