import { promisify } from 'util';
import { forumCache } from './cache.js';
import { dbPool } from './database-pool.js';

// Promisificar los métodos de la base de datos para usar async/await
const runAsync = promisify(dbPool.run.bind(dbPool));
const getAsync = promisify(dbPool.get.bind(dbPool));
const allAsync = promisify(dbPool.all.bind(dbPool));

// Usar una variable global para controlar la inicialización en modo desarrollo
const GLOBAL_KEY = Symbol.for('tuneboxd.database.initialized');
const GLOBAL_LOG_KEY = Symbol.for('tuneboxd.database.logged');

// Variable para manejar la inicialización de forma más elegante en desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

// Función para inicializar la base de datos (solo se ejecuta una vez por proceso)
const initializeDatabase = () => {
  // Verificar si ya se inicializó en este proceso
  if (global[GLOBAL_KEY]) {
    return;
  }

  try {
    dbPool.exec(`
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

      CREATE TABLE IF NOT EXISTS email_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS custom_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS custom_list_albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER NOT NULL,
        album_id INTEGER NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        UNIQUE(list_id, album_id),
        FOREIGN KEY (list_id) REFERENCES custom_lists (id) ON DELETE CASCADE,
        FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS list_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        list_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, list_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (list_id) REFERENCES custom_lists (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS list_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        list_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (list_id) REFERENCES custom_lists (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('follow', 'list_like', 'list_comment', 'thread_comment')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Referencias opcionales según el tipo
        from_user_id INTEGER,
        list_id INTEGER,
        thread_id INTEGER,
        comment_id INTEGER,
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (list_id) REFERENCES custom_lists (id) ON DELETE CASCADE,
        FOREIGN KEY (thread_id) REFERENCES forum_threads (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
    `);
    
    // Marcar como inicializado globalmente
    global[GLOBAL_KEY] = true;
    
    // Solo mostrar log una vez por sesión completa de desarrollo
    if (!global[GLOBAL_LOG_KEY]) {
      global[GLOBAL_LOG_KEY] = true;
      if (isDevelopment) {
        console.log('🗃️  Base de datos SQLite inicializada - Tuneboxd');
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
      'SELECT * FROM users WHERE LOWER(username) = LOWER(?)',
      [username]
    );
  },

  // Buscar usuario por email o username
  async findByEmailOrUsername(email, username) {
    return await db.getAsync(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)',
      [email, username]
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
  },

  // Crear token de verificación de email
  async createEmailVerification(userId, token, expiresAt) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt],
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

  // Buscar token de verificación
  async findVerificationToken(token) {
    return await db.getAsync(
      'SELECT * FROM email_verifications WHERE token = ? AND expires_at > datetime("now")',
      [token]
    );
  },

  // Eliminar token de verificación usado
  async deleteVerificationToken(token) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM email_verifications WHERE token = ?',
        [token],
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

  // Limpiar tokens expirados de verificación
  async cleanExpiredVerificationTokens() {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM email_verifications WHERE expires_at <= datetime("now")',
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

  // Actualizar perfil de usuario
  async updateProfile(userId, profileData) {
    const { bio, profilePicture } = profileData;
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET bio = ?, profile_picture = ? WHERE id = ?',
        [bio, profilePicture, userId],
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

  // Actualizar username (solo si han pasado 14 días desde el último cambio)
  async updateUsername(userId, newUsername) {
    return new Promise((resolve, reject) => {
      // Primero verificar si el username ya existe
      db.get(
        'SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?',
        [newUsername, userId],
        (err, existingUser) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (existingUser) {
            reject(new Error('El nombre de usuario ya está en uso'));
            return;
          }

          // Verificar el tiempo desde el último cambio
          db.get(
            'SELECT last_username_change FROM users WHERE id = ?',
            [userId],
            (err, user) => {
              if (err) {
                reject(err);
                return;
              }

              if (user && user.last_username_change) {
                const lastChange = new Date(user.last_username_change);
                const now = new Date();
                const daysSinceLastChange = (now - lastChange) / (1000 * 60 * 60 * 24);
                
                if (daysSinceLastChange < 14) {
                  const daysRemaining = Math.ceil(14 - daysSinceLastChange);
                  reject(new Error(`Debes esperar ${daysRemaining} días más para cambiar tu nombre de usuario`));
                  return;
                }
              }

              // Actualizar el username y la fecha
              db.run(
                'UPDATE users SET username = ?, last_username_change = datetime("now") WHERE id = ?',
                [newUsername, userId],
                function(err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(this.changes);
                  }
                }
              );
            }
          );
        }
      );
    });
  },

  // Verificar si puede cambiar el username
  async canChangeUsername(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT last_username_change FROM users WHERE id = ?',
        [userId],
        (err, user) => {
          if (err) {
            reject(err);
            return;
          }

          if (!user || !user.last_username_change) {
            resolve({ canChange: true, daysRemaining: 0 });
            return;
          }

          const lastChange = new Date(user.last_username_change);
          const now = new Date();
          const daysSinceLastChange = (now - lastChange) / (1000 * 60 * 60 * 24);
          
          if (daysSinceLastChange >= 14) {
            resolve({ canChange: true, daysRemaining: 0 });
          } else {
            const daysRemaining = Math.ceil(14 - daysSinceLastChange);
            resolve({ canChange: false, daysRemaining });
          }
        }
      );
    });
  },

  // Buscar usuarios por nombre de usuario
  async searchUsersByUsername(query, limit = 10, currentUserId = null, offset = 0) {
    try {
      // Buscar usuarios que coincidan con el patrón
      const users = await db.allAsync(`
        SELECT 
          u.id,
          u.username,
          u.email,
          u.bio,
          u.profile_picture,
          u.created_at,
          (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id) as total_reviews,
          (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.user_id = u.id) as avg_rating,
          (SELECT COUNT(*) FROM user_follows uf WHERE uf.followed_id = u.id) as followers_count,
          (SELECT COUNT(*) FROM user_follows uf WHERE uf.follower_id = u.id) as following_count,
          CASE 
            WHEN ? IS NOT NULL THEN (
              SELECT COUNT(*) > 0 
              FROM user_follows uf 
              WHERE uf.follower_id = ? AND uf.followed_id = u.id
            )
            ELSE 0
          END as is_following
        FROM users u
        WHERE LOWER(u.username) LIKE LOWER(?)
        ORDER BY 
          CASE WHEN LOWER(u.username) = LOWER(?) THEN 0 ELSE 1 END,
          u.username ASC
        LIMIT ? OFFSET ?
      `, [
        currentUserId, 
        currentUserId, 
        `%${query}%`, 
        query, 
        limit,
        offset
      ]);

      return users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profile_picture: user.profile_picture,
        created_at: user.created_at,
        total_reviews: user.total_reviews || 0,
        avg_rating: user.avg_rating || 0,
        followers_count: user.followers_count || 0,
        following_count: user.following_count || 0,
        is_following: Boolean(user.is_following)
      }));
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      throw error;
    }
  },

  // Obtener conteo total de usuarios para una búsqueda
  async getUserSearchCount(query) {
    try {
      const result = await db.getAsync(`
        SELECT COUNT(*) as count
        FROM users u
        WHERE LOWER(u.username) LIKE LOWER(?)
      `, [`%${query}%`]);
      
      return result?.count || 0;
    } catch (error) {
      console.error('Error obteniendo conteo de búsqueda de usuarios:', error);
      throw error;
    }
  },

  // Obtener total de usuarios registrados
  async getTotalUsersCount() {
    try {
      const result = await db.getAsync('SELECT COUNT(*) as count FROM users');
      return result?.count || 0;
    } catch (error) {
      console.error('Error obteniendo total de usuarios:', error);
      throw error;
    }
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
  },

  // Obtener total de álbumes en la base de datos
  async getTotalAlbumsCount() {
    try {
      const result = await db.getAsync('SELECT COUNT(*) as count FROM albums');
      return result?.count || 0;
    } catch (error) {
      console.error('Error obteniendo total de álbumes:', error);
      throw error;
    }
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
      [UserId, albumId]
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
  },

  // Obtener total de reseñas en la base de datos
  async getTotalReviewsCount() {
    try {
      const result = await db.getAsync('SELECT COUNT(*) as count FROM reviews');
      return result?.count || 0;
    } catch (error) {
      console.error('Error obteniendo total de reseñas:', error);
      throw error;
    }
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
  },

  // Obtener total de elementos en todas las watchlists
  async getTotalWatchlistCount() {
    try {
      const result = await db.getAsync('SELECT COUNT(*) as count FROM watchlist');
      return result?.count || 0;
    } catch (error) {
      console.error('Error obteniendo total de elementos en watchlist:', error);
      throw error;
    }
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
        u.bio,
        u.profile_picture,
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
        u.bio,
        u.profile_picture,
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
  async createThread(userId, title, content, category = 'general', language = 'es') {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO forum_threads (user_id, title, content, category, language) VALUES (?, ?, ?, ?, ?)',
        [userId, title, content, category, language],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Invalidar cache del foro cuando se crea un nuevo hilo
            forumCache.invalidate('forum-data');
            resolve(this.lastID);
          }
        }
      );
    });
  },

  // Obtener lista de hilos con paginación
  async getThreads(limit = 20, offset = 0, category = null, language = null) {
    let query = `
      SELECT 
        ft.id,
        ft.title,
        ft.content,
        ft.category,
        ft.language,
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
    const conditions = [];
    
    if (category) {
      conditions.push('ft.category = ?');
      params.push(category);
    }
    
    if (language) {
      conditions.push('ft.language = ?');
      params.push(language);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY ft.is_pinned DESC, ft.last_activity DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    return await db.allAsync(query, params);
  },

  // Versión optimizada de getThreads usando pool de conexiones
  async getThreadsOptimized(limit = 20, offset = 0, category = null, language = null) {
    const cacheKey = `threads-${category || 'all'}-${language || 'all'}-${limit}-${offset}`;
    
    // Intentar obtener del cache primero
    const cached = forumCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let query = `
      SELECT 
        ft.id,
        ft.title,
        ft.content,
        ft.category,
        ft.language,
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
    const conditions = [];
    
    if (category) {
      conditions.push('ft.category = ?');
      params.push(category);
    }
    
    if (language) {
      conditions.push('ft.language = ?');
      params.push(language);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY ft.is_pinned DESC, ft.last_activity DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // Usar pool de conexiones para la consulta
    const result = await dbPool.executeQuery(query, params);
    
    // Guardar en cache por 5 minutos
    forumCache.set(cacheKey, result, 300000);
    
    return result;
  },

  // Obtener un hilo específico con sus datos
  async getThread(threadId) {
    return await db.getAsync(`
      SELECT 
        ft.id,
        ft.title,
        ft.content,
        ft.category,
        ft.language,
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

  // Obtener idiomas disponibles
  async getLanguages() {
    return await db.allAsync(`
      SELECT 
        language,
        COUNT(*) as thread_count
      FROM forum_threads 
      GROUP BY language
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
        ft.language,
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

// Servicios para artistas
export const artistService = {
  // Obtener estadísticas de un artista específico
  async getArtistStats(artistId) {
    try {
      // Obtener número de seguidores desde artist_follows
      const followersResult = await db.getAsync(`
        SELECT COUNT(*) as followers_count
        FROM artist_follows 
        WHERE artist_id = ?
      `, [artistId]);

      // Obtener estadísticas de reseñas basadas en el nombre del artista
      // (ya que las reseñas están vinculadas a álbumes, no directamente a artistas)
      const reviewsResult = await db.getAsync(`
        SELECT 
          COUNT(DISTINCT r.id) as total_reviews,
          AVG(r.rating) as avg_rating,
          COUNT(DISTINCT r.album_id) as total_albums_reviewed
        FROM reviews r
        INNER JOIN albums a ON r.album_id = a.spotify_id
        WHERE EXISTS (
          SELECT 1 FROM artist_follows af 
          WHERE af.artist_id = ? AND a.artist LIKE '%' || af.artist_name || '%'
          LIMIT 1
        )
      `, [artistId]);

      return {
        followers_count: followersResult?.followers_count || 0,
        total_reviews: reviewsResult?.total_reviews || 0,
        avg_rating: reviewsResult?.avg_rating || 0,
        total_albums_reviewed: reviewsResult?.total_albums_reviewed || 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del artista:', error);
      return {
        followers_count: 0,
        total_reviews: 0,
        avg_rating: 0,
        total_albums_reviewed: 0
      };
    }
  }
};

// Funciones de utilidad para listas personalizadas
export const customListService = {
  // Crear una nueva lista
  async createList(userId, listData) {
    const { name, description = null, is_public = true } = listData;
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO custom_lists (user_id, name, description, is_public, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [userId, name, description, is_public],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Obtener la lista recién creada
            db.get(
              'SELECT * FROM custom_lists WHERE id = ?',
              [this.lastID],
              (err, row) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(row);
                }
              }
            );
          }
        }
      );
    });
  },

  // Obtener listas de un usuario
  async getUserLists(userId, includePrivate = true) {
    const query = includePrivate 
      ? `SELECT 
          cl.*,
          COUNT(cla.album_id) as album_count
         FROM custom_lists cl
         LEFT JOIN custom_list_albums cla ON cl.id = cla.list_id
         WHERE cl.user_id = ?
         GROUP BY cl.id
         ORDER BY cl.updated_at DESC`
      : `SELECT 
          cl.*,
          COUNT(cla.album_id) as album_count
         FROM custom_lists cl
         LEFT JOIN custom_list_albums cla ON cl.id = cla.list_id
         WHERE cl.user_id = ? AND cl.is_public = 1
         GROUP BY cl.id
         ORDER BY cl.updated_at DESC`;
    
    return await db.allAsync(query, [userId]);
  },

  // Obtener una lista específica con sus álbumes
  async getListWithAlbums(listId, userId = null) {
    // Primero obtener la lista con información del usuario
    const list = await db.getAsync(`
      SELECT cl.*, u.username
      FROM custom_lists cl
      JOIN users u ON cl.user_id = u.id
      WHERE cl.id = ?
    `, [listId]);

    if (!list) {
      return null;
    }

    // Verificar permisos (si es privada, solo el propietario puede verla)
    if (!list.is_public && (!userId || list.user_id !== userId)) {
      return null;
    }

    // Obtener los álbumes de la lista
    const albums = await db.allAsync(`
      SELECT 
        cla.*,
        a.spotify_id,
        a.name,
        a.artist,
        a.release_date,
        a.image_url,
        a.spotify_url
      FROM custom_list_albums cla
      JOIN albums a ON cla.album_id = a.id
      WHERE cla.list_id = ?
      ORDER BY cla.added_at DESC
    `, [listId]);

    return {
      ...list,
      albums
    };
  },

  // Agregar álbum a una lista
  async addAlbumToList(listId, albumId, userId, notes = null) {
    // Verificar que el usuario es propietario de la lista
    const list = await db.getAsync(
      'SELECT * FROM custom_lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos');
    }

    // Verificar si el álbum ya está en la lista
    const existing = await db.getAsync(
      'SELECT * FROM custom_list_albums WHERE list_id = ? AND album_id = ?',
      [listId, albumId]
    );

    if (existing) {
      throw new Error('El álbum ya está en esta lista');
    }

    // Agregar el álbum
    await db.runAsync(
      'INSERT INTO custom_list_albums (list_id, album_id, notes) VALUES (?, ?, ?)',
      [listId, albumId, notes]
    );

    // Actualizar timestamp de la lista
    await db.runAsync(
      'UPDATE custom_lists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [listId]
    );

    return true;
  },

  // Remover álbum de una lista
  async removeAlbumFromList(listId, albumId, userId) {
    // Verificar que el usuario es propietario de la lista
    const list = await db.getAsync(
      'SELECT * FROM custom_lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos');
    }

    const result = await db.runAsync(
      'DELETE FROM custom_list_albums WHERE list_id = ? AND album_id = ?',
      [listId, albumId]
    );

    if (result.changes === 0) {
      throw new Error('Álbum no encontrado en la lista');
    }

    // Actualizar timestamp de la lista
    await db.runAsync(
      'UPDATE custom_lists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [listId]
    );

    return true;
  },

  // Actualizar lista
  async updateList(listId, userId, updates) {
    const { name, description, is_public } = updates;
    
    // Verificar permisos
    const list = await db.getAsync(
      'SELECT * FROM custom_lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos');
    }

    await db.runAsync(
      'UPDATE custom_lists SET name = ?, description = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, is_public, listId]
    );

    return await db.getAsync('SELECT * FROM custom_lists WHERE id = ?', [listId]);
  },

  // Eliminar lista
  async deleteList(listId, userId) {
    // Verificar permisos
    const list = await db.getAsync(
      'SELECT * FROM custom_lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos');
    }

    // Eliminar la lista (los álbumes se eliminan automáticamente por CASCADE)
    const result = await db.runAsync(
      'DELETE FROM custom_lists WHERE id = ?',
      [listId]
    );

    return result.changes > 0;
  },

  // Obtener listas públicas recientes
  async getPublicLists(limit = 20, offset = 0) {
    return await db.allAsync(`
      SELECT 
        cl.*,
        u.username,
        COUNT(cla.album_id) as album_count
      FROM custom_lists cl
      JOIN users u ON cl.user_id = u.id
      LEFT JOIN custom_list_albums cla ON cl.id = cla.list_id
      WHERE cl.is_public = 1
      GROUP BY cl.id
      ORDER BY cl.updated_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
  },

  // ================ LIKES ================
  
  // Dar like a una lista
  async likeList(listId, userId) {
    // Verificar que la lista existe y es pública o es del usuario
    const list = await db.getAsync(
      'SELECT * FROM custom_lists WHERE id = ? AND (is_public = 1 OR user_id = ?)',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no es accesible');
    }

    // Verificar si ya le dio like
    const existing = await db.getAsync(
      'SELECT * FROM list_likes WHERE user_id = ? AND list_id = ?',
      [userId, listId]
    );

    if (existing) {
      throw new Error('Ya le diste like a esta lista');
    }

    // Agregar like
    await db.runAsync(
      'INSERT INTO list_likes (user_id, list_id) VALUES (?, ?)',
      [userId, listId]
    );

    return true;
  },

  // Quitar like de una lista
  async unlikeList(listId, userId) {
    const result = await db.runAsync(
      'DELETE FROM list_likes WHERE user_id = ? AND list_id = ?',
      [userId, listId]
    );

    if (result.changes === 0) {
      throw new Error('No habías dado like a esta lista');
    }

    return true;
  },

  // Verificar si el usuario le dio like a una lista
  async hasUserLikedList(listId, userId) {
    const result = await db.getAsync(
      'SELECT id FROM list_likes WHERE user_id = ? AND list_id = ?',
      [userId, listId]
    );
    return !!result;
  },

  // Obtener cantidad de likes de una lista
  async getListLikesCount(listId) {
    const result = await db.getAsync(
      'SELECT COUNT(*) as count FROM list_likes WHERE list_id = ?',
      [listId]
    );
    return result.count;
  },

  // Obtener usuarios que le dieron like a una lista
  async getListLikes(listId, limit = 10, offset = 0) {
    return await db.allAsync(`
      SELECT 
        ll.created_at,
        u.id,
        u.username
      FROM list_likes ll
      JOIN users u ON ll.user_id = u.id
      WHERE ll.list_id = ?
      ORDER BY ll.created_at DESC
      LIMIT ? OFFSET ?
    `, [listId, limit, offset]);
  },

  // ================ COMENTARIOS ================

  // Agregar comentario a una lista
  async addCommentToList(listId, userId, content) {
    // Verificar que la lista existe y es pública o es del usuario
    const list = await db.getAsync(
      'SELECT * FROM custom_lists WHERE id = ? AND (is_public = 1 OR user_id = ?)',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no es accesible');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('El comentario no puede estar vacío');
    }

    if (content.trim().length > 500) {
      throw new Error('El comentario no puede exceder 500 caracteres');
    }

    // Agregar comentario
    const result = await db.runAsync(
      'INSERT INTO list_comments (user_id, list_id, content) VALUES (?, ?, ?)',
      [userId, listId, content.trim()]
    );

    // Obtener el comentario completo
    return await db.getAsync(`
      SELECT 
        lc.*,
        u.username
      FROM list_comments lc
      JOIN users u ON lc.user_id = u.id
      WHERE lc.id = ?
    `, [result.lastID]);
  },

  // Obtener comentarios de una lista
  async getListComments(listId, limit = 20, offset = 0) {
    return await db.allAsync(`
      SELECT 
        lc.*,
        u.username
      FROM list_comments lc
      JOIN users u ON lc.user_id = u.id
      WHERE lc.list_id = ?
      ORDER BY lc.created_at DESC
      LIMIT ? OFFSET ?
    `, [listId, limit, offset]);
  },

  // Obtener cantidad de comentarios de una lista
  async getListCommentsCount(listId) {
    const result = await db.getAsync(
      'SELECT COUNT(*) as count FROM list_comments WHERE list_id = ?',
      [listId]
    );
    return result.count;
  },

  // Actualizar comentario (solo el autor puede)
  async updateComment(commentId, userId, newContent) {
    if (!newContent || newContent.trim().length === 0) {
      throw new Error('El comentario no puede estar vacío');
    }

    if (newContent.trim().length > 500) {
      throw new Error('El comentario no puede exceder 500 caracteres');
    }

    const result = await db.runAsync(
      'UPDATE list_comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [newContent.trim(), commentId, userId]
    );

    if (result.changes === 0) {
      throw new Error('Comentario no encontrado o no tienes permisos');
    }

    return await db.getAsync(`
      SELECT 
        lc.*,
        u.username
      FROM list_comments lc
      JOIN users u ON lc.user_id = u.id
      WHERE lc.id = ?
    `, [commentId]);
  },

  // Eliminar comentario (solo el autor o propietario de la lista pueden)
  async deleteComment(commentId, userId) {
    // Verificar permisos: autor del comentario o propietario de la lista
    const comment = await db.getAsync(`
      SELECT 
        lc.*,
        cl.user_id as list_owner_id
      FROM list_comments lc
      JOIN custom_lists cl ON lc.list_id = cl.id
      WHERE lc.id = ?
    `, [commentId]);

    if (!comment) {
      throw new Error('Comentario no encontrado');
    }

    if (comment.user_id !== userId && comment.list_owner_id !== userId) {
      throw new Error('No tienes permisos para eliminar este comentario');
    }

    const result = await db.runAsync(
      'DELETE FROM list_comments WHERE id = ?',
      [commentId]
    );

    return result.changes > 0;
  },

  // ================ ESTADÍSTICAS COMBINADAS ================

  // Obtener estadísticas completas de una lista (likes + comentarios)
  async getListStats(listId) {
    const [likesCount, commentsCount] = await Promise.all([
      this.getListLikesCount(listId),
      this.getListCommentsCount(listId)
    ]);

    return {
      likes: likesCount,
      comments: commentsCount
    };
  },

  // Obtener lista con estadísticas incluidas
  async getListWithStats(listId, userId = null) {
    const list = await this.getListWithAlbums(listId, userId);
    
    if (!list) {
      return null;
    }

    const [stats, userHasLiked] = await Promise.all([
      this.getListStats(listId),
      userId ? this.hasUserLikedList(listId, userId) : false
    ]);

    return {
      ...list,
      stats,
      userHasLiked
    };
  }
};

// Servicio de notificaciones
export const notificationService = {
  // Crear una nueva notificación
  async createNotification(notificationData) {
    const { 
      user_id, 
      type, 
      title, 
      message, 
      from_user_id = null, 
      list_id = null, 
      thread_id = null, 
      comment_id = null 
    } = notificationData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO notifications 
         (user_id, type, title, message, from_user_id, list_id, thread_id, comment_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, type, title, message, from_user_id, list_id, thread_id, comment_id],
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

  // Obtener notificaciones de un usuario
  async getUserNotifications(userId, limit = 20, offset = 0, unreadOnly = false) {
    const whereClause = unreadOnly ? 
      'WHERE n.user_id = ? AND n.is_read = FALSE' : 
      'WHERE n.user_id = ?';

    return await db.allAsync(`
      SELECT 
        n.*,
        u.username as from_username,
        cl.name as list_name,
        ft.title as thread_title
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      LEFT JOIN custom_lists cl ON n.list_id = cl.id
      LEFT JOIN forum_threads ft ON n.thread_id = ft.id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `, unreadOnly ? [userId, limit, offset] : [userId, limit, offset]);
  },

  // Marcar notificación como leída
  async markAsRead(notificationId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [notificationId, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
        [userId],
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

  // Obtener cantidad de notificaciones no leídas
  async getUnreadCount(userId) {
    const result = await db.getAsync(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return result?.count || 0;
  },

  // Eliminar notificación
  async deleteNotification(notificationId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM notifications WHERE id = ? AND user_id = ?',
        [notificationId, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  },

  // Eliminar todas las notificaciones de un usuario
  async deleteAllUserNotifications(userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM notifications WHERE user_id = ?',
        [userId],
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

  // Eliminar notificaciones antiguas (más de 30 días)
  async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM notifications WHERE created_at < ?',
        [thirtyDaysAgo.toISOString()],
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

  // Funciones específicas para crear notificaciones por tipo
  async notifyFollow(followedUserId, followerUserId) {
    const follower = await db.getAsync(
      'SELECT username FROM users WHERE id = ?',
      [followerUserId]
    );

    if (follower) {
      return await this.createNotification({
        user_id: followedUserId,
        type: 'follow',
        title: 'Nuevo seguidor',
        message: `${follower.username} ahora te sigue`,
        from_user_id: followerUserId
      });
    }
  },

  async notifyListLike(listId, likerUserId) {
    // Obtener información de la lista y el usuario que dio like
    const [list, liker] = await Promise.all([
      db.getAsync('SELECT * FROM custom_lists WHERE id = ?', [listId]),
      db.getAsync('SELECT username FROM users WHERE id = ?', [likerUserId])
    ]);

    if (list && liker && list.user_id !== likerUserId) {
      return await this.createNotification({
        user_id: list.user_id,
        type: 'list_like',
        title: 'Like en tu lista',
        message: `A ${liker.username} le gustó tu lista "${list.name}"`,
        from_user_id: likerUserId,
        list_id: listId
      });
    }
  },

  async notifyListComment(listId, commenterUserId) {
    // Obtener información de la lista y el usuario que comentó
    const [list, commenter] = await Promise.all([
      db.getAsync('SELECT * FROM custom_lists WHERE id = ?', [listId]),
      db.getAsync('SELECT username FROM users WHERE id = ?', [commenterUserId])
    ]);

    if (list && commenter && list.user_id !== commenterUserId) {
      return await this.createNotification({
        user_id: list.user_id,
        type: 'list_comment',
        title: 'Nuevo comentario',
        message: `${commenter.username} comentó en tu lista "${list.name}"`,
        from_user_id: commenterUserId,
        list_id: listId
      });
    }
  },

  async notifyThreadComment(threadId, commenterUserId) {
    // Obtener información del thread y el usuario que comentó
    const [thread, commenter] = await Promise.all([
      db.getAsync('SELECT * FROM forum_threads WHERE id = ?', [threadId]),
      db.getAsync('SELECT username FROM users WHERE id = ?', [commenterUserId])
    ]);

    if (thread && commenter && thread.user_id !== commenterUserId) {
      return await this.createNotification({
        user_id: thread.user_id,
        type: 'thread_comment',
        title: 'Nuevo comentario en tu hilo',
        message: `${commenter.username} comentó en tu hilo "${thread.title}"`,
        from_user_id: commenterUserId,
        thread_id: threadId
      });
    }
  }
};

export default db;
