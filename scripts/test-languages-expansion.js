#!/usr/bin/env node

/**
 * Script para probar la expansión de idiomas en el foro
 * Verifica que los nuevos idiomas se están devolviendo correctamente
 */

import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

async function testLanguagesExpansion() {
  console.log('🌍 Probando la expansión de idiomas del foro...\n');

  try {
    // Importar el adaptador de base de datos
    const { forumService } = await import('../src/lib/database-adapter.js');

    // Obtener idiomas disponibles
    const languages = await forumService.getLanguages();
    
    console.log(`📊 Total de idiomas disponibles: ${languages.length}\n`);
    
    // Agrupar idiomas por región para mejor organización
    const regions = {
      'Principales': ['es', 'en', 'fr', 'de', 'it', 'pt'],
      'Europeos': ['ru', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'tr', 'el', 'hu', 'cs', 'sk', 'ro', 'bg', 'hr', 'sr', 'sl', 'et', 'lv', 'lt', 'uk', 'be'],
      'Asiáticos': ['zh', 'ja', 'ko', 'hi', 'th', 'vi', 'id', 'ms', 'tl', 'bn', 'ur', 'fa', 'ar', 'he', 'ka', 'hy', 'az', 'kk', 'ky', 'uz', 'mn'],
      'Africanos': ['sw', 'am', 'ha', 'yo', 'zu', 'xh', 'af'],
      'Americanos': ['pt-br', 'es-mx', 'es-ar', 'en-us', 'en-gb', 'fr-ca', 'qu', 'gn'],
      'Otros': []
    };

    // Mostrar idiomas por región
    Object.entries(regions).forEach(([region, codes]) => {
      const regionLanguages = languages.filter(lang => 
        codes.includes(lang.code) || (codes.length === 0 && !Object.values(regions).flat().includes(lang.code))
      );
      
      if (region === 'Otros') {
        // Para "Otros", incluir todos los que no están en otras categorías
        const allCategorizedCodes = Object.values(regions).slice(0, -1).flat();
        const uncategorizedLanguages = languages.filter(lang => !allCategorizedCodes.includes(lang.code));
        regionLanguages.splice(0, regionLanguages.length, ...uncategorizedLanguages);
      }
      
      if (regionLanguages.length > 0) {
        console.log(`🌍 ${region} (${regionLanguages.length} idiomas):`);
        regionLanguages.forEach(lang => {
          const threadInfo = lang.thread_count > 0 ? ` (${lang.thread_count} hilos)` : ' (0 hilos)';
          console.log(`  • ${lang.code}: ${lang.name}${threadInfo}`);
        });
        console.log();
      }
    });

    // Estadísticas
    const languagesWithThreads = languages.filter(lang => lang.thread_count > 0);
    const totalThreads = languages.reduce((sum, lang) => sum + lang.thread_count, 0);
    
    console.log('📈 Estadísticas:');
    console.log(`  • Idiomas con hilos activos: ${languagesWithThreads.length}`);
    console.log(`  • Total de hilos en todos los idiomas: ${totalThreads}`);
    console.log(`  • Idiomas sin hilos: ${languages.length - languagesWithThreads.length}`);
    
    // Verificar algunos idiomas específicos
    console.log('\n🔍 Verificación de idiomas específicos:');
    const testCodes = ['es', 'en', 'zh', 'ar', 'hi', 'sw', 'qu', 'eo'];
    testCodes.forEach(code => {
      const lang = languages.find(l => l.code === code);
      if (lang) {
        console.log(`  ✅ ${code}: ${lang.name}`);
      } else {
        console.log(`  ❌ ${code}: No encontrado`);
      }
    });

    console.log('\n✅ Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al probar la expansión de idiomas:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testLanguagesExpansion();
}

export { testLanguagesExpansion };
