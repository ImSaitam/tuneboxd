import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Crear la base de datos
const db = new sqlite3.Database('./users.db');

// Promisificar los métodos de la base de datos para usar async/await
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

// Inicializar la base de datos de forma síncrona
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
  `);
  console.log('Base de datos inicializada correctamente');
} catch (error) {
  console.error('Error inicializando la base de datos:', error);
}

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

export default db;
