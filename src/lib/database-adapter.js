// Adaptador universal de base de datos para PostgreSQL
import { query as pgQuery, getPool } from './database-postgres.js';

// Función universal para queries
export async function query(sql, params = []) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Please configure a PostgreSQL database.');
  }
  
  // PostgreSQL usa $1, $2, etc. - Conversión correcta
  let paramIndex = 0;
  const pgSql = sql.replace(/\?/g, () => {
    paramIndex++;
    return `$${paramIndex}`;
  });
  
  const result = await pgQuery(pgSql, params);
  return result.rows;
}

// Función para obtener un solo registro
export async function get(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

// Función para ejecutar sin devolver datos
export async function run(sql, params = []) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Please configure a PostgreSQL database.');
  }
  
  // PostgreSQL usa $1, $2, etc. - Conversión correcta
  let paramIndex = 0;
  const pgSql = sql.replace(/\?/g, () => {
    paramIndex++;
    return `$${paramIndex}`;
  });
  
  const result = await pgQuery(pgSql, params);
  return {
    changes: result.rowCount || 0,
    lastID: result.insertId || null
  };
}

// Alias para compatibilidad
export const allAsync = query;
export const getAsync = get;
export const runAsync = run;

// Información de la base de datos
export function getDatabaseInfo() {
  return {
    type: 'postgresql',
    isProduction: process.env.NODE_ENV === 'production',
    hasPostgresUrl: !!process.env.DATABASE_URL
  };
}

// Servicios básicos usando las funciones de query

// Servicio de usuarios
export const userService = {
  async findByEmail(email) {
    return await get('SELECT * FROM users WHERE email = ?', [email]);
  },
  
  async findByUsername(username) {
    return await get('SELECT * FROM users WHERE username = ?', [username]);
  },
  
  async findById(id) {
    return await get('SELECT * FROM users WHERE id = ?', [id]);
  },
  
  async findByEmailOrUsername(email, username) {
    return await get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
  },
  
  async create(userData) {
    const { username, email, password_hash, verification_token } = userData;
    return await run(
      'INSERT INTO users (username, email, password_hash, verification_token, created_at) VALUES (?, ?, ?, ?, NOW())',
      [username, email, password_hash, verification_token]
    );
  },
  
  async updateVerificationStatus(email) {
    return await run(
      'UPDATE users SET email_verified = true, verification_token = NULL WHERE email = ?',
      [email]
    );
  },
  
  async findVerificationToken(token) {
    return await get('SELECT * FROM users WHERE verification_token = ?', [token]);
  },
  
  async verifyUser(userId) {
    return await run(
      'UPDATE users SET email_verified = true, verification_token = NULL WHERE id = ?',
      [userId]
    );
  },
  
  async deleteVerificationToken(token) {
    return await run(
      'UPDATE users SET verification_token = NULL WHERE verification_token = ?',
      [token]
    );
  },
  
  async updatePassword(userId, newPasswordHash) {
    return await run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );
  },
  
  async createPasswordResetToken(email, token) {
    return await run(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
      [token, Date.now() + 3600000, email] // Token válido por 1 hora
    );
  },
  
  async findByResetToken(token) {
    return await get(
      'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?',
      [token, Date.now()]
    );
  },
  
  async clearResetToken(userId) {
    return await run(
      'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
      [userId]
    );
  },
  
  async cleanExpiredVerificationTokens() {
    // En PostgreSQL, no necesitamos limpiar tokens expirados manualmente
    // ya que manejamos la expiración en la lógica de verificación
    return { success: true };
  },
  
  async createEmailVerification(userId, token, expiresAt) {
    return await run(
      'UPDATE users SET verification_token = ? WHERE id = ?',
      [token, userId]
    );
  },
  
  async updateVerificationToken(userId, token) {
    return await run(
      'UPDATE users SET verification_token = ? WHERE id = ?',
      [token, userId]
    );
  }
};

// Servicio de álbumes
export const albumService = {
  async findById(id) {
    return await get('SELECT * FROM albums WHERE spotify_id = ?', [id]);
  },
  
  async create(albumData) {
    const { spotify_id, name, artist, image_url, release_date } = albumData;
    return await run(
      'INSERT INTO albums (spotify_id, name, artist, image_url, release_date) VALUES (?, ?, ?, ?, ?)',
      [spotify_id, name, artist, image_url, release_date]
    );
  }
};

// Servicio de reseñas
export const reviewService = {
  async findByAlbumId(albumId) {
    return await query('SELECT * FROM reviews WHERE album_id = ? ORDER BY created_at DESC', [albumId]);
  },
  
  async create(reviewData) {
    const { user_id, album_id, rating, content } = reviewData;
    return await run(
      'INSERT INTO reviews (user_id, album_id, rating, content, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user_id, album_id, rating, content]
    );
  }
};

// Servicio de notificaciones
export const notificationService = {
  async findByUserId(userId) {
    return await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  },
  
  async create(notificationData) {
    const { user_id, type, message, related_id } = notificationData;
    return await run(
      'INSERT INTO notifications (user_id, type, message, related_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user_id, type, message, related_id]
    );
  },
  
  async markAsRead(id) {
    return await run('UPDATE notifications SET is_read = true WHERE id = ?', [id]);
  }
};

// Servicio de listas personalizadas
export const customListService = {
  async findByUserId(userId) {
    return await query('SELECT * FROM lists WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  },
  
  async findById(id) {
    return await get('SELECT * FROM lists WHERE id = ?', [id]);
  },
  
  async create(listData) {
    const { user_id, name, description, is_public } = listData;
    return await run(
      'INSERT INTO lists (user_id, name, description, is_public, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user_id, name, description, is_public]
    );
  }
};

// Servicio de seguimiento de usuarios
export const userFollowService = {
  async findFollowers(userId) {
    return await query(
      'SELECT u.* FROM users u JOIN follows f ON u.id = f.follower_id WHERE f.following_id = ?',
      [userId]
    );
  },
  
  async findFollowing(userId) {
    return await query(
      'SELECT u.* FROM users u JOIN follows f ON u.id = f.following_id WHERE f.follower_id = ?',
      [userId]
    );
  }
};

// Servicio de historial de escucha
export const listeningHistoryService = {
  async findByUserId(userId) {
    return await query('SELECT * FROM listening_history WHERE user_id = ? ORDER BY listened_at DESC', [userId]);
  },
  
  async create(historyData) {
    const { user_id, album_id, track_id } = historyData;
    return await run(
      'INSERT INTO listening_history (user_id, album_id, track_id, listened_at) VALUES (?, ?, ?, NOW())',
      [user_id, album_id, track_id]
    );
  }
};

// Servicio de watchlist
export const watchlistService = {
  async findByUserId(userId) {
    return await query('SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC', [userId]);
  },
  
  async add(userId, albumId) {
    return await run(
      'INSERT INTO watchlist (user_id, album_id, added_at) VALUES (?, ?, NOW())',
      [userId, albumId]
    );
  },
  
  async remove(userId, albumId) {
    return await run('DELETE FROM watchlist WHERE user_id = ? AND album_id = ?', [userId, albumId]);
  }
};

// Servicio de artistas
export const artistService = {
  async findById(id) {
    return await get('SELECT * FROM artists WHERE spotify_id = ?', [id]);
  },
  
  async getStats(artistId) {
    const stats = await get(
      'SELECT COUNT(*) as review_count, AVG(rating) as avg_rating FROM reviews WHERE album_id IN (SELECT id FROM albums WHERE artist = ?)',
      [artistId]
    );
    return stats;
  }
};

// Servicio de foro
export const forumService = {
  async findAllThreads() {
    return await query('SELECT * FROM forum_threads ORDER BY created_at DESC');
  },
  
  async findThreadById(id) {
    return await get('SELECT * FROM forum_threads WHERE id = ?', [id]);
  },
  
  async createThread(threadData) {
    const { user_id, title, content, category, language } = threadData;
    return await run(
      'INSERT INTO forum_threads (user_id, title, content, category, language, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [user_id, title, content, category, language]
    );
  },
  
  async findReplies(threadId) {
    return await query('SELECT * FROM forum_replies WHERE thread_id = ? ORDER BY created_at ASC', [threadId]);
  },
  
  async createReply(replyData) {
    const { thread_id, user_id, content } = replyData;
    return await run(
      'INSERT INTO forum_replies (thread_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())',
      [thread_id, user_id, content]
    );
  },
  
  async getCategories() {
    return ['General', 'Recomendaciones', 'Reseñas', 'Discusión', 'Noticias'];
  },
  
  async getLanguages() {
    return [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'it', name: 'Italiano' },
      { code: 'pt', name: 'Português' }
    ];
  }
};

// Servicio de favoritos de tracks
export const trackFavorites = {
  async findByUserId(userId) {
    return await query('SELECT * FROM track_favorites WHERE user_id = ? ORDER BY added_at DESC', [userId]);
  },
  
  async add(userId, trackId) {
    return await run(
      'INSERT INTO track_favorites (user_id, track_id, added_at) VALUES (?, ?, NOW())',
      [userId, trackId]
    );
  },
  
  async remove(userId, trackId) {
    return await run('DELETE FROM track_favorites WHERE user_id = ? AND track_id = ?', [userId, trackId]);
  },
  
  async isFavorite(userId, trackId) {
    const result = await get('SELECT 1 FROM track_favorites WHERE user_id = ? AND track_id = ?', [userId, trackId]);
    return !!result;
  }
};

// Exportación por defecto actualizada
const databaseAdapter = { 
  query, get, run, getDatabaseInfo, allAsync, getAsync, runAsync,
  userService, albumService, reviewService, notificationService,
  customListService, userFollowService, listeningHistoryService,
  watchlistService, artistService, forumService, trackFavorites
};
export default databaseAdapter;
