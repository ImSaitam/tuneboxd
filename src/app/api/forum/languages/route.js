import { NextResponse } from 'next/server';
import { forumService } from "../../../../lib/database-adapter.js";

// GET - Obtener lista de idiomas disponibles
export async function GET() {
  try {
    const languages = await forumService.getLanguages();
    
    return NextResponse.json({
      success: true,
      languages: languages
    });
  } catch (error) {
    console.error('Error obteniendo idiomas:', error);
    
    // Fallback en caso de error
    const fallbackLanguages = [
      { code: 'es', name: 'Español', language: 'es', thread_count: 0 },
      { code: 'en', name: 'English', language: 'en', thread_count: 0 },
      { code: 'fr', name: 'Français', language: 'fr', thread_count: 0 },
      { code: 'de', name: 'Deutsch', language: 'de', thread_count: 0 },
      { code: 'it', name: 'Italiano', language: 'it', thread_count: 0 },
      { code: 'pt', name: 'Português', language: 'pt', thread_count: 0 }
    ];
    
    return NextResponse.json({
      success: true,
      languages: fallbackLanguages
    });
  }
}
