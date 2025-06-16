// Script para agregar índices a la base de datos para mejorar el rendimiento
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./users.db');

// Función para verificar si una tabla existe
const tableExists = (tableName) => {
  return new Promise((resolve) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName],
      (err, row) => {
        if (err) {
          resolve(false);
        } else {
          resolve(!!row);
        }
      }
    );
  });
};

// Función para ejecutar consultas de forma asíncrona
const runQuery = (query) => {
  return new Promise((resolve, reject) => {
    db.run(query, function(err) {
      if (err) {
        console.error(`Error ejecutando: ${query}`, err.message);
        reject(err);
      } else {
        console.log(`✅ Ejecutado: ${query}`);
        resolve(this);
      }
    });
  });
};

async function addDatabaseIndexes() {
  console.log('🚀 Agregando índices para optimización de rendimiento...\n');

  try {
    // Verificar qué tablas existen
    const tables = [
      'forum_threads', 'reviews', 'albums', 'watchlist', 
      'artist_follows', 'user_follows', 'custom_lists', 
      'list_items', 'notifications'
    ];
    
    const existingTables = {};
    for (const table of tables) {
      existingTables[table] = await tableExists(table);
      console.log(`📋 Tabla ${table}: ${existingTables[table] ? '✅ Existe' : '❌ No existe'}`);
    }
    
    console.log('\n🔧 Agregando índices...\n');

    // Índices para forum_threads (mejora filtros por categoría, idioma y búsqueda)
    if (existingTables.forum_threads) {
      await runQuery('CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_forum_threads_language ON forum_threads(language)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_forum_threads_user_id ON forum_threads(user_id)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_forum_threads_category_language ON forum_threads(category, language)');
    }

    // Índices para reviews (mejora consultas de reseñas por usuario y álbum)
    if (existingTables.reviews) {
      await runQuery('CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_reviews_album_id ON reviews(album_id)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC)');
    }

    // Índices para albums (mejora búsquedas de álbumes)
    if (existingTables.albums) {
      await runQuery('CREATE INDEX IF NOT EXISTS idx_albums_spotify_id ON albums(spotify_id)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_albums_name ON albums(name)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums(artist)');
    }

    // Índices para watchlist (mejora consultas de lista de seguimiento)
    if (existingTables.watchlist) {
      await runQuery('CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_watchlist_album_id ON watchlist(album_id)');
    }

    // Índices para artist_follows (mejora consultas de artistas seguidos)
    if (existingTables.artist_follows) {
      await runQuery('CREATE INDEX IF NOT EXISTS idx_artist_follows_user_id ON artist_follows(user_id)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_artist_follows_artist_id ON artist_follows(artist_id)');
    }

    // Índices para user_follows (mejora consultas de seguidores)
    if (existingTables.user_follows) {
      await runQuery('CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_user_follows_followed_id ON user_follows(followed_id)');
    }

    // Índices para custom_lists (mejora consultas de listas personalizadas)
    if (existingTables.custom_lists) {
      await runQuery('CREATE INDEX IF NOT EXISTS idx_custom_lists_user_id ON custom_lists(user_id)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_custom_lists_is_public ON custom_lists(is_public)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_custom_lists_created_at ON custom_lists(created_at DESC)');
    }

    // Índices para list_items (mejora consultas de elementos de listas)
    if (existingTables.list_items) {
      await runQuery('CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_list_items_album_id ON list_items(album_id)');
    }

    // Índices para notifications (mejora consultas de notificaciones)
    if (existingTables.notifications) {
      await runQuery('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)');
    }

    console.log('\n🎉 ¡Todos los índices se agregaron correctamente!');
    console.log('📈 Esto debería mejorar significativamente el rendimiento de las consultas.');

  } catch (error) {
    console.error('❌ Error agregando índices:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error cerrando la base de datos:', err.message);
      } else {
        console.log('🔒 Conexión a la base de datos cerrada.');
        process.exit(0);
      }
    });
  }
}

// Ejecutar el script
addDatabaseIndexes().catch(console.error);
