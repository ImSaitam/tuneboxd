import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Crear la base de datos
const db = new sqlite3.Database('./users.db');

// Promisificar los métodos de la base de datos para usar async/await
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

// Usar una variable global para controlar la inicialización en modo desarrollo
const GLOBAL_KEY = Symbol.for('musicboxd.database.initialized');
const GLOBAL_LOG_KEY = Symbol.for('musicboxd.database.logged');

// Variable para manejar la inicialización de forma más elegante en desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

// Función para inicializar la base de datos (solo se ejecuta una vez por proceso)
const initializeDatabase = () => {
  // Verificar si ya se inicializó en este proceso
  if (global[GLOBAL_KEY]) {
    return;
  }

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified BOOLEAN DEFAULT FALSE,
        reset_token TEXT,
        reset_token_expires DATETIME
      );

      CREATE TABLE IF NOT EXISTS albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spotify_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        artist TEXT NOT NULL,
        release_date TEXT,
        image_url TEXT,
        spotify_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        album_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE,
        UNIQUE(user_id, album_id)
      );

      CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        album_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE,
        UNIQUE(user_id, album_id)
      );

      CREATE TABLE IF NOT EXISTS artist_follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        artist_id TEXT NOT NULL,
        artist_name TEXT NOT NULL,
        artist_image TEXT,
        followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, artist_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS artist_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        artist_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, artist_id, tag),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        followed_id INTEGER NOT NULL,
        followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, followed_id),
        FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (followed_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS listening_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        album_id INTEGER NOT NULL,
        listened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS forum_threads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        category TEXT DEFAULT 'general',
        is_pinned BOOLEAN DEFAULT FALSE,
        is_locked BOOLEAN DEFAULT FALSE,
        views_count INTEGER DEFAULT 0,
        replies_count INTEGER DEFAULT 0,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS forum_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (thread_id) REFERENCES forum_threads (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS forum_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        thread_id INTEGER,
        reply_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, thread_id),
        UNIQUE(user_id, reply_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (thread_id) REFERENCES forum_threads (id) ON DELETE CASCADE,
        FOREIGN KEY (reply_id) REFERENCES forum_replies (id) ON DELETE CASCADE
      );
    `);
    
    // Marcar como inicializado globalmente
    global[GLOBAL_KEY] = true;
    
    // Solo mostrar log una vez por sesión completa de desarrollo
    if (!global[GLOBAL_LOG_KEY]) {
      global[GLOBAL_LOG_KEY] = true;
      if (isDevelopment) {
        console.log('🗃️  Base de datos SQLite inicializada - Musicboxd');
      } else {
        console.log('Base de datos inicializada correctamente');
      }
    }
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
  }
};

// Inicializar la base de datos al cargar el módulo
initializeDatabase();

// Funciones de utilidad para usuarios
export const userService = {
  // Crear un nuevo usuario
  async createUser(userData) {
    const { username, email, password } = userData;
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, password],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // Buscar usuario por email
  async findByEmail(email) {
    return await db.getAsync(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
  },

  // Buscar usuario por username
  async findByUsername(username) {
    return await db.getAsync(
      'SELECT * FROM users WHERE username = ?',
      [username.toLowerCase()]
    );
  },

  // Buscar usuario por email o username
  async findByEmailOrUsername(email, username) {
    return await db.getAsync(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email.toLowerCase(), username.toLowerCase()]
    );
  },

  // Buscar usuario por ID
  async findById(id) {
    return await db.getAsync(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
  },

  // Obtener todos los usuarios (para debugging)
  async getAllUsers() {
    return await db.allAsync('SELECT id, username, email, created_at, verified FROM users');
  },

  // Actualizar token de reset de contraseña
  async updateResetToken(email, token, expires) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
        [token, expires, email],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  },

  // Buscar usuario por token de reset
  async findByResetToken(token) {
    return await db.getAsync(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > datetime("now")',
      [token]
    );
  },

  // Actualizar contraseña y limpiar token de reset
  async updatePassword(id, newPassword) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [newPassword, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  },

  // Verificar usuario
  async verifyUser(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET verified = TRUE WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }
};

// Funciones de utilidad para álbumes
export const albumService = {
  // Crear o encontrar un álbum
  async findOrCreateAlbum(albumData) {
    const { spotify_id, name, artist, release_date, image_url, spotify_url } = albumData;
    
    // Primero intentar encontrar el álbum
    const existingAlbum = await db.getAsync(
      'SELECT * FROM albums WHERE spotify_id = ?',
      [spotify_id]
    );
    
    if (existingAlbum) {
      return existingAlbum;
    }
    
    // Si no existe, crearlo
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO albums (spotify_id, name, artist, release_date, image_url, spotify_url) VALUES (?, ?, ?, ?, ?, ?)',
        [spotify_id, name, artist, release_date, image_url, spotify_url],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Obtener el álbum recién creado
            db.get('SELECT * FROM albums WHERE id = ?', [this.lastID], (err, row) => {
              if (err) {
                reject(err);
              } else {
                resolve(row);
              }
            });
          }
        }
      );
    });
  },

  // Buscar álbum por ID
  async findById(id) {
    return await db.getAsync('SELECT * FROM albums WHERE id = ?', [id]);
  },

  // Buscar álbum por Spotify ID
  async findBySpotifyId(spotify_id) {
    return await db.getAsync('SELECT * FROM albums WHERE spotify_id = ?', [spotify_id]);
  },

  // Obtener álbumes más reseñados
  async getMostReviewed(limit = 10) {
    return await db.allAsync(`
      SELECT a.*, COUNT(r.id) as review_count, AVG(r.rating) as avg_rating
      FROM albums a
      LEFT JOIN reviews r ON a.id = r.album_id
      GROUP BY a.id
      ORDER BY review_count DESC, avg_rating DESC
      LIMIT ?
    `, [limit]);
  }
};

// Funciones de utilidad para reseñas
export const reviewService = {
  // Crear una nueva reseña
  async createReview(reviewData) {
    const { user_id, album_id, rating, title, content } = reviewData;
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO reviews (user_id, album_id, rating, title, content) VALUES (?, ?, ?, ?, ?)',
        [user_id, album_id, rating, title, content],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Obtener la reseña recién creada con datos del usuario y álbum
            db.get(`
              SELECT r.*, u.username, a.name as album_name, a.artist, a.image_url
              FROM reviews r
              JOIN users u ON r.user_id = u.id
              JOIN albums a ON r.album_id = a.id
              WHERE r.id = ?
            `, [this.lastID], (err, row) => {
              if (err) {
                reject(err);
              } else {
                resolve(row);
              }
            });
          }
        }
      );
    });
  },

  // Actualizar una reseña
  async updateReview(reviewId, userId, reviewData) {
    const { rating, title, content } = reviewData;
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE reviews SET rating = ?, title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [rating, title, content, reviewId, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  },

  // Eliminar una reseña
  async deleteReview(reviewId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM reviews WHERE id = ? AND user_id = ?',
        [reviewId, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  },

  // Buscar reseña por usuario y álbum
  async findByUserAndAlbum(userId, albumId) {
    return await db.getAsync(
      'SELECT * FROM reviews WHERE user_id = ? AND album_id = ?',
      [userId, albumId]
    );
  },

  // Obtener reseñas de un álbum
  async getAlbumReviews(albumId, limit = 20, offset = 0) {
    return await db.allAsync(`
      SELECT r.*, u.username
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.album_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [albumId, limit, offset]);
  },

  // Obtener reseñas de un usuario
  async getUserReviews(userId, limit = 20, offset = 0) {
    return await db.allAsync(`
      SELECT r.*, a.name as album_name, a.artist, a.image_url, a.spotify_id
      FROM reviews r
      JOIN albums a ON r.album_id = a.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
  },

  // Obtener reseñas recientes
  async getRecentReviews(limit = 10) {
    return await db.allAsync(`
      SELECT r.*, u.username, a.name as album_name, a.artist, a.image_url, a.spotify_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN albums a ON r.album_id = a.id
      ORDER BY r.created_at DESC
      LIMIT ?
    `, [limit]);
  },

  // Obtener estadísticas de un álbum
  async getAlbumStats(albumId) {
    return await db.getAsync(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews 
      WHERE album_id = ?
    `, [albumId]);
  }
};

// Funciones de utilidad para watchlist
export const watchlistService = {
  // Añadir álbum a la watchlist
  async addToWatchlist(userId, albumId) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO watchlist (user_id, album_id) VALUES (?, ?)',
        [userId, albumId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // Remover álbum de la watchlist
  async removeFromWatchlist(userId, albumId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM watchlist WHERE user_id = ? AND album_id = ?',
        [userId, albumId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  },

  // Verificar si un álbum está en la watchlist del usuario
  async isInWatchlist(userId, albumId) {
    const result = await db.getAsync(
      'SELECT id FROM watchlist WHERE user_id = ? AND album_id = ?',
      [userId, albumId]
    );
    return !!result;
  },

  // Obtener la watchlist completa de un usuario
  async getUserWatchlist(userId, limit = 20, offset = 0) {
    return await db.allAsync(`
      SELECT w.*, a.name as album_name, a.artist, a.image_url, a.spotify_id, a.release_date, a.spotify_url
      FROM watchlist w
      JOIN albums a ON w.album_id = a.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
  },

  // Obtener cantidad de álbumes en watchlist
  async getWatchlistCount(userId) {
    const result = await db.getAsync(
      'SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?',
      [userId]
    );
    return result?.count || 0;
  }
};

// Funciones de utilidad para historial de escucha
export const listeningHistoryService = {
  // Verificar si un álbum ya está en el historial del usuario (último día)
  async isRecentlyInHistory(userId, albumId) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const result = await db.getAsync(
      'SELECT id FROM listening_history WHERE user_id = ? AND album_id = ? AND listened_at > ?',
      [userId, albumId, oneDayAgo.toISOString()]
    );
    return !!result;
  },

  // Agregar álbum al historial de escucha (con verificación de duplicados)
  async addToHistory(userId, albumId) {
    // Verificar si ya se agregó recientemente (último día)
    const recentlyAdded = await this.isRecentlyInHistory(userId, albumId);
    if (recentlyAdded) {
      throw new Error('Album already in recent listening history');
    }

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO listening_history (user_id, album_id) VALUES (?, ?)',
        [userId, albumId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // Obtener historial de escucha del usuario agrupado por fecha
  async getUserListeningHistory(userId, limit = 50, offset = 0) {
    return await db.allAsync(`
      SELECT 
        DATE(lh.listened_at) as listen_date,
        lh.listened_at,
        a.id as album_id,
        a.name as album_name, 
        a.artist, 
        a.image_url, 
        a.spotify_id,
        a.release_date,
        a.spotify_url
      FROM listening_history lh
      JOIN albums a ON lh.album_id = a.id
      WHERE lh.user_id = ?
      ORDER BY lh.listened_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
  },

  // Obtener historial agrupado por fecha para mostrar en formato lista
  async getUserListeningHistoryGrouped(userId, limit = 30) {
    // Cambiar el enfoque - obtener datos sin agrupar y agrupar en JavaScript
    const history = await db.allAsync(`
      SELECT 
        DATE(lh.listened_at) as listen_date,
        lh.listened_at,
        a.id as album_id,
        a.name as album_name,
        a.artist,
        a.image_url,
        a.spotify_id,
        a.release_date,
        a.spotify_url
      FROM listening_history lh
      JOIN albums a ON lh.album_id = a.id
      WHERE lh.user_id = ?
      ORDER BY lh.listened_at DESC
      LIMIT ?
    `, [userId, limit * 5]); // Aumentar el límite para asegurar que tenemos suficientes datos

    // Agrupar los datos en JavaScript
    const groupedData = {};
    
    history.forEach(entry => {
      const date = entry.listen_date;
      if (!groupedData[date]) {
        groupedData[date] = {
          date: date,
          albumCount: 0,
          albums: []
        };
      }
      
      groupedData[date].albumCount++;
      groupedData[date].albums.push({
        album_id: entry.album_id,
        album_name: entry.album_name,
        artist: entry.artist,
        image_url: entry.image_url,
        spotify_id: entry.spotify_id,
        listened_at: entry.listened_at
      });
    });

    // Convertir a array y ordenar por fecha descendente
    return Object.values(groupedData)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  },

  // Obtener cantidad total de entradas en el historial
  async getHistoryCount(userId) {
    const result = await db.getAsync(
      'SELECT COUNT(*) as count FROM listening_history WHERE user_id = ?',
      [userId]
    );
    return result?.count || 0;
  }
};

// Funciones de utilidad para seguimiento de usuarios
export const userFollowService = {
  // Seguir a un usuario
  async followUser(followerId, followedId) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO user_follows (follower_id, followed_id) VALUES (?, ?)',
        [followerId, followedId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // Dejar de seguir a un usuario
  async unfollowUser(followerId, followedId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM user_follows WHERE follower_id = ? AND followed_id = ?',
        [followerId, followedId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  },

  // Verificar si un usuario sigue a otro
  async isFollowing(followerId, followedId) {
    const result = await db.getAsync(
      'SELECT id FROM user_follows WHERE follower_id = ? AND followed_id = ?',
      [followerId, followedId]
    );
    return !!result;
  },

  // Obtener la lista de seguidores de un usuario
  async getFollowers(userId, limit = 20, offset = 0) {
    return await db.allAsync(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.created_at,
        uf.followed_at
      FROM user_follows uf
      JOIN users u ON uf.follower_id = u.id
      WHERE uf.followed_id = ?
      ORDER BY uf.followed_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
  },

  // Obtener la lista de usuarios seguidos por un usuario
  async getFollowing(userId, limit = 20, offset = 0) {
    return await db.allAsync(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.created_at,
        uf.followed_at
      FROM user_follows uf
      JOIN users u ON uf.followed_id = u.id
      WHERE uf.follower_id = ?
      ORDER BY uf.followed_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
  },

  // Obtener el número de seguidores de un usuario
  async getFollowersCount(userId) {
    const result = await db.getAsync(
      'SELECT COUNT(*) as count FROM user_follows WHERE followed_id = ?',
      [userId]
    );
    return result?.count || 0;
  },

  // Obtener el número de usuarios seguidos por un usuario
  async getFollowingCount(userId) {
    const result = await db.getAsync(
      'SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ?',
      [userId]
    );
    return result?.count || 0;
  },

  // Obtener estadísticas de seguimiento (seguidores y seguidos)
  async getFollowStats(userId) {
    const followersCount = await this.getFollowersCount(userId);
    const followingCount = await this.getFollowingCount(userId);
    
    return {
      followers: followersCount,
      following: followingCount
    };
  }
};

// Servicios para el sistema de foro/comunidad
export const forumService = {
  // Crear un nuevo hilo
  async createThread(userId, title, content, category = 'general') {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO forum_threads (user_id, title, content, category) VALUES (?, ?, ?, ?)',
        [userId, title, content, category],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // Obtener lista de hilos con paginación
  async getThreads(limit = 20, offset = 0, category = null) {
    let query = `
      SELECT 
        ft.id,
        ft.title,
        ft.content,
        ft.category,
        ft.is_pinned,
        ft.is_locked,
        ft.views_count,
        ft.replies_count,
        ft.last_activity,
        ft.created_at,
        u.username as author_username,
        u.id as author_id,
        (SELECT COUNT(*) FROM forum_likes fl WHERE fl.thread_id = ft.id) as likes_count
      FROM forum_threads ft
      JOIN users u ON ft.user_id = u.id
    `;
    
    const params = [];
    
    if (category) {
      query += ' WHERE ft.category = ?';
      params.push(category);
    }
    
    query += ` ORDER BY ft.is_pinned DESC, ft.last_activity DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    return await db.allAsync(query, params);
  },

  // Obtener un hilo específico con sus datos
  async getThread(threadId) {
    return await db.getAsync(`
      SELECT 
        ft.id,
        ft.title,
        ft.content,
        ft.category,
        ft.is_pinned,
        ft.is_locked,
        ft.views_count,
        ft.replies_count,
        ft.last_activity,
        ft.created_at,
        u.username as author_username,
        u.id as author_id,
        (SELECT COUNT(*) FROM forum_likes fl WHERE fl.thread_id = ft.id) as likes_count
      FROM forum_threads ft
      JOIN users u ON ft.user_id = u.id
      WHERE ft.id = ?
    `, [threadId]);
  },

  // Incrementar las vistas de un hilo
  async incrementViews(threadId) {
    return await db.runAsync(
      'UPDATE forum_threads SET views_count = views_count + 1 WHERE id = ?',
      [threadId]
    );
  },

  // Crear una respuesta en un hilo
  async createReply(threadId, userId, content) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Insertar la respuesta
        db.run(
          'INSERT INTO forum_replies (thread_id, user_id, content) VALUES (?, ?, ?)',
          [threadId, userId, content],
          function(err) {
            if (err) {
              reject(err);
              return;
            }
            
            const replyId = this.lastID;
            
            // Actualizar el contador de respuestas y última actividad del hilo
            db.run(
              'UPDATE forum_threads SET replies_count = replies_count + 1, last_activity = CURRENT_TIMESTAMP WHERE id = ?',
              [threadId],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve(replyId);
                }
              }
            );
          }
        );
      });
    });
  },

  // Obtener respuestas de un hilo
  async getReplies(threadId, limit = 20, offset = 0) {
    return await db.allAsync(`
      SELECT 
        fr.id,
        fr.content,
        fr.created_at,
        fr.updated_at,
        u.username as author_username,
        u.id as author_id,
        (SELECT COUNT(*) FROM forum_likes fl WHERE fl.reply_id = fr.id) as likes_count
      FROM forum_replies fr
      JOIN users u ON fr.user_id = u.id
      WHERE fr.thread_id = ? AND fr.is_deleted = FALSE
      ORDER BY fr.created_at ASC
      LIMIT ? OFFSET ?
    `, [threadId, limit, offset]);
  },

  // Dar like a un hilo
  async likeThread(userId, threadId) {
    return await db.runAsync(
      'INSERT OR IGNORE INTO forum_likes (user_id, thread_id) VALUES (?, ?)',
      [userId, threadId]
    );
  },

  // Quitar like de un hilo
  async unlikeThread(userId, threadId) {
    return await db.runAsync(
      'DELETE FROM forum_likes WHERE user_id = ? AND thread_id = ?',
      [userId, threadId]
    );
  },

  // Dar like a una respuesta
  async likeReply(userId, replyId) {
    return await db.runAsync(
      'INSERT OR IGNORE INTO forum_likes (user_id, reply_id) VALUES (?, ?)',
      [userId, replyId]
    );
  },

  // Quitar like de una respuesta
  async unlikeReply(userId, replyId) {
    return await db.runAsync(
      'DELETE FROM forum_likes WHERE user_id = ? AND reply_id = ?',
      [userId, replyId]
    );
  },

  // Verificar si un usuario ha dado like a un hilo
  async hasLikedThread(userId, threadId) {
    const result = await db.getAsync(
      'SELECT id FROM forum_likes WHERE user_id = ? AND thread_id = ?',
      [userId, threadId]
    );
    return !!result;
  },

  // Verificar si un usuario ha dado like a una respuesta
  async hasLikedReply(userId, replyId) {
    const result = await db.getAsync(
      'SELECT id FROM forum_likes WHERE user_id = ? AND reply_id = ?',
      [userId, replyId]
    );
    return !!result;
  },

  // Obtener categorías disponibles
  async getCategories() {
    return await db.allAsync(`
      SELECT 
        category,
        COUNT(*) as thread_count
      FROM forum_threads 
      GROUP BY category
      ORDER BY thread_count DESC
    `);
  },

  // Buscar hilos
  async searchThreads(query, limit = 20, offset = 0) {
    return await db.allAsync(`
      SELECT 
        ft.id,
        ft.title,
        ft.content,
        ft.category,
        ft.is_pinned,
        ft.is_locked,
        ft.views_count,
        ft.replies_count,
        ft.last_activity,
        ft.created_at,
        u.username as author_username,
        u.id as author_id,
        (SELECT COUNT(*) FROM forum_likes fl WHERE fl.thread_id = ft.id) as likes_count
      FROM forum_threads ft
      JOIN users u ON ft.user_id = u.id
      WHERE ft.title LIKE ? OR ft.content LIKE ?
      ORDER BY ft.is_pinned DESC, ft.last_activity DESC
      LIMIT ? OFFSET ?
    `, [`%${query}%`, `%${query}%`, limit, offset]);
  },

  // Eliminar un hilo (solo el autor o admin)
  async deleteThread(threadId, userId) {
    return await db.runAsync(
      'DELETE FROM forum_threads WHERE id = ? AND user_id = ?',
      [threadId, userId]
    );
  },

  // Eliminar una respuesta (marcar como eliminada)
  async deleteReply(replyId, userId) {
    return await db.runAsync(
      'UPDATE forum_replies SET is_deleted = TRUE WHERE id = ? AND user_id = ?',
      [replyId, userId]
    );
  }
};

export default db;
