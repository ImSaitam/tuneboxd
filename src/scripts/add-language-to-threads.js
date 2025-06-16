const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, '../../users.db');

function addLanguageToThreads() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error conectando a la base de datos:', err);
      return;
    }
    console.log('Conectado a la base de datos SQLite.');
  });

  // Verificar si la columna ya existe
  db.all('PRAGMA table_info(forum_threads)', (err, columns) => {
    if (err) {
      console.error('Error obteniendo información de la tabla:', err);
      db.close();
      return;
    }

    const hasLanguageColumn = columns.some(col => col.name === 'language');
    
    if (hasLanguageColumn) {
      console.log('⚠️ La columna language ya existe');
      db.close();
      return;
    }

    console.log('Añadiendo campo de idioma a la tabla forum_threads...');
    
    // Añadir la columna language
    db.run(`ALTER TABLE forum_threads ADD COLUMN language TEXT DEFAULT 'es'`, (err) => {
      if (err) {
        console.error('Error añadiendo campo language:', err);
      } else {
        console.log('✅ Campo language añadido exitosamente');
        
        // Verificar que la columna fue añadida
        db.all('PRAGMA table_info(forum_threads)', (err, updatedColumns) => {
          if (err) {
            console.error('Error verificando columnas:', err);
          } else {
            console.log('Columnas de forum_threads:');
            updatedColumns.forEach(col => {
              console.log(`  - ${col.name}: ${col.type} (default: ${col.dflt_value})`);
            });
          }
          
          db.close((err) => {
            if (err) {
              console.error('Error cerrando la base de datos:', err);
            } else {
              console.log('Base de datos cerrada.');
            }
            process.exit(0);
          });
        });
      }
    });
  });
}

addLanguageToThreads();
