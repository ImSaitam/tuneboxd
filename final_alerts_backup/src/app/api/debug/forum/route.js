import { NextResponse } from 'next/server';
import { forumService } from "../../../../lib/database-adapter.js";

export async function GET() {
  try {
    const languages = await forumService.getLanguages();
    
    // Mapear códigos de idioma a nombres legibles
    const languageNames = {
      'es': 'Español',
      'en': 'English',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português',
      'ru': 'Русский',
      'ja': '日本語',
      'ko': '한국어',
      'zh': '中文',
      'ar': 'العربية',
      'hi': 'हिन्दी',
      'other': 'Otro'
    };

    const languagesWithNames = languages.map(lang => ({
      code: lang.language,
      name: languageNames[lang.language] || lang.language,
      thread_count: lang.thread_count
    }));
    

    return NextResponse.json({
      success: true,
      debug: {
        raw_languages: languages,
        processed_languages: languagesWithNames,
        total_count: languages.length
      }
    });
  } catch (error) {
    console.error('Error in debug:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
