// Script para crear hilos de prueba en diferentes idiomas
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');

async function createTestThreads() {
  console.log('🧪 Creando hilos de prueba en diferentes idiomas...\n');

  const db = new sqlite3.Database(dbPath);

  const testThreads = [
    {
      title: 'Best Albums of 2024 - English Discussion',
      content: 'What are your favorite albums released in 2024? Let\'s discuss the best music of this year!',
      category: 'música',
      language: 'en',
      user_id: 1 // Asumiendo que hay un usuario con ID 1
    },
    {
      title: 'Meilleurs albums de 2024 - Discussion en français',
      content: 'Quels sont vos albums préférés sortis en 2024? Discutons de la meilleure musique de cette année!',
      category: 'música',
      language: 'fr',
      user_id: 1
    },
    {
      title: 'Die besten Alben von 2024 - Deutsche Diskussion',
      content: 'Was sind eure Lieblings-Alben, die 2024 veröffentlicht wurden? Lasst uns über die beste Musik dieses Jahres sprechen!',
      category: 'música',
      language: 'de',
      user_id: 1
    },
    {
      title: 'Migliori album del 2024 - Discussione italiana',
      content: 'Quali sono i vostri album preferiti usciti nel 2024? Discutiamo della migliore musica di quest\'anno!',
      category: 'música',
      language: 'it',
      user_id: 1
    },
    {
      title: 'Melhores álbuns de 2024 - Discussão em português',
      content: 'Quais são os seus álbuns favoritos lançados em 2024? Vamos discutir a melhor música deste ano!',
      category: 'música',
      language: 'pt',
      user_id: 1
    },
    {
      title: 'Music Recommendations for Beginners',
      content: 'I\'m new to exploring different music genres. What would you recommend for someone just starting their musical journey?',
      category: 'recomendaciones',
      language: 'en',
      user_id: 1
    }
  ];

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Verificar si ya existen hilos en otros idiomas
      db.get('SELECT COUNT(*) as count FROM forum_threads WHERE language != "es"', (err, row) => {
        if (err) {
          console.error('❌ Error verificando hilos existentes:', err);
          reject(err);
          return;
        }

        if (row.count > 0) {
          console.log('✅ Ya existen hilos en otros idiomas, saltando creación');
          resolve();
          return;
        }

        console.log('📝 Creando hilos de prueba...');

        const stmt = db.prepare(`
          INSERT INTO forum_threads (user_id, title, content, category, language, created_at, updated_at, last_activity)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
        `);

        let completed = 0;
        const total = testThreads.length;

        testThreads.forEach((thread) => {
          stmt.run([
            thread.user_id,
            thread.title,
            thread.content,
            thread.category,
            thread.language
          ], function(err) {
            if (err) {
              console.error('❌ Error creando hilo:', err);
            } else {
              console.log(`✅ Hilo creado: "${thread.title}" (${thread.language})`);
            }
            
            completed++;
            if (completed === total) {
              stmt.finalize();
              resolve();
            }
          });
        });
      });
    });
  });
}

createTestThreads().then(() => {
  console.log('\n🏁 Hilos de prueba creados exitosamente');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
