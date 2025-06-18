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
  
  // Si la consulta tiene RETURNING, devolver los datos
  if (sql.toUpperCase().includes('RETURNING')) {
    return result.rows[0] || null;
  }
  
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
  
  async findBySpotifyId(spotifyId) {
    return await get('SELECT * FROM albums WHERE spotify_id = ?', [spotifyId]);
  },
  
  async create(albumData) {
    const { spotify_id, name, artist, image_url, release_date } = albumData;
    return await run(
      'INSERT INTO albums (spotify_id, name, artist_id, image_url, release_date) VALUES (?, ?, ?, ?, ?)',
      [spotify_id, name, artist, image_url, release_date]
    );
  },

  async findOrCreateAlbum(albumData) {
    const { spotify_id, name, artist, image_url, release_date, spotify_url } = albumData;
    
    // Primero buscar si el álbum ya existe
    let album = await this.findBySpotifyId(spotify_id);
    
    if (album) {
      return album;
    }

    // Si no existe, crear el álbum usando RETURNING para obtener los datos
    album = await run(
      'INSERT INTO albums (spotify_id, name, artist_name, image_url, release_date, total_tracks) VALUES (?, ?, ?, ?, ?, 0) RETURNING *',
      [spotify_id, name, artist, image_url, release_date]
    );

    return album;
  },

  async getTotalAlbumsCount() {
    const result = await get('SELECT COUNT(*) as count FROM albums');
    return result ? parseInt(result.count) : 0;
  }
};

// Servicio de reseñas
export const reviewService = {
  async findByAlbumId(albumId) {
    // Buscar por ID de álbum interno (cuando existe un álbum en la tabla albums)
    return await query('SELECT * FROM reviews WHERE spotify_album_id IN (SELECT spotify_id FROM albums WHERE id = ?) ORDER BY created_at DESC', [albumId]);
  },
  
  async findBySpotifyAlbumId(spotifyAlbumId) {
    // Buscar directamente por spotify_album_id
    return await query('SELECT * FROM reviews WHERE spotify_album_id = ? ORDER BY created_at DESC', [spotifyAlbumId]);
  },
  
  async create(reviewData) {
    const { user_id, album_id, spotify_album_id, rating, content, review_text } = reviewData;
    
    // Usar spotify_album_id si se proporciona, sino intentar obtenerlo del álbum
    let finalSpotifyAlbumId = spotify_album_id;
    if (!finalSpotifyAlbumId && album_id) {
      const album = await get('SELECT spotify_id FROM albums WHERE id = ?', [album_id]);
      finalSpotifyAlbumId = album?.spotify_id;
    }
    
    if (!finalSpotifyAlbumId) {
      throw new Error('No se pudo determinar el spotify_album_id');
    }
    
    return await run(
      'INSERT INTO reviews (user_id, spotify_album_id, rating, review_text, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user_id, finalSpotifyAlbumId, rating, content || review_text]
    );
  },

  // Obtener estadísticas de un álbum usando spotify_album_id
  async getAlbumStats(albumId) {
    // Primero obtener el spotify_id del álbum
    const album = await get('SELECT spotify_id FROM albums WHERE id = ?', [albumId]);
    if (!album?.spotify_id) {
      return {
        total_reviews: 0,
        avg_rating: 0,
        five_stars: 0,
        four_stars: 0,
        three_stars: 0,
        two_stars: 0,
        one_star: 0
      };
    }

    const stats = await get(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_stars,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_stars,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_stars,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_stars,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews 
      WHERE spotify_album_id = ?
    `, [album.spotify_id]);

    return stats || {
      total_reviews: 0,
      avg_rating: 0,
      five_stars: 0,
      four_stars: 0,
      three_stars: 0,
      two_stars: 0,
      one_star: 0
    };
  },

  // Obtener reseñas de un álbum con información del usuario
  async getAlbumReviews(albumId, limit = 10, offset = 0) {
    // Primero obtener el spotify_id del álbum
    const album = await get('SELECT spotify_id FROM albums WHERE id = ?', [albumId]);
    if (!album?.spotify_id) {
      return [];
    }

    return await query(`
      SELECT 
        r.*,
        u.username,
        u.profile_image_url,
        r.review_text as content
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.spotify_album_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [album.spotify_id, limit, offset]);
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

    return await run(
      `INSERT INTO notifications 
       (user_id, type, title, message, from_user_id, list_id, thread_id, comment_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, type, title, message, from_user_id, list_id, thread_id, comment_id]
    );
  },

  // Obtener notificaciones de un usuario con JOIN para datos relacionados
  async getUserNotifications(userId, limit = 20, offset = 0, unreadOnly = false) {
    const whereClause = unreadOnly ? 
      'WHERE n.user_id = ? AND n.is_read = FALSE' : 
      'WHERE n.user_id = ?';

    return await query(`
      SELECT 
        n.*,
        u.username as from_username
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `, unreadOnly ? [userId, limit, offset] : [userId, limit, offset]);
  },

  // Marcar notificación como leída
  async markAsRead(notificationId, userId) {
    const result = await run(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    return result.changes > 0;
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId) {
    const result = await run(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return result.changes;
  },

  // Obtener cantidad de notificaciones no leídas
  async getUnreadCount(userId) {
    const result = await get(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return result?.count || 0;
  },

  // Eliminar notificación
  async deleteNotification(notificationId, userId) {
    const result = await run(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    return result.changes > 0;
  },

  // Eliminar todas las notificaciones de un usuario
  async deleteAllUserNotifications(userId) {
    const result = await run(
      'DELETE FROM notifications WHERE user_id = ?',
      [userId]
    );
    return result.changes;
  },

  // Métodos de compatibilidad (legacy)
  async findByUserId(userId) {
    return this.getUserNotifications(userId);
  },
  
  async create(notificationData) {
    return this.createNotification(notificationData);
  },
  
  async markAsRead(id) {
    const result = await run('UPDATE notifications SET is_read = true WHERE id = ?', [id]);
    return result.changes > 0;
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
  },

  // Agregar álbum al historial de escucha - FIXED: Exported correctly
  async addToHistory(userId, albumId) {
    return await run(
      'INSERT INTO listening_history (user_id, album_id, listened_at) VALUES (?, ?, NOW())',
      [userId, albumId]
    );
  },

  // Verificar si un álbum ya está en el historial del usuario (último día)
  async isRecentlyInHistory(userId, albumId) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const result = await get(
      'SELECT id FROM listening_history WHERE user_id = ? AND album_id = ? AND listened_at > ?',
      [userId, albumId, oneDayAgo.toISOString()]
    );
    return !!result;
  },

  // Obtener historial de escucha del usuario agrupado por fecha
  async getUserListeningHistory(userId, limit = 50, offset = 0) {
    return await query(`
      SELECT 
        DATE(lh.listened_at) as listen_date,
        lh.listened_at,
        a.id as album_id,
        a.name as album_name,
        a.artist_name as artist,
        a.image_url,
        a.spotify_id,
        a.release_date
      FROM listening_history lh
      JOIN albums a ON lh.album_id = a.id
      WHERE lh.user_id = ?
      ORDER BY lh.listened_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
  },

  // Obtener historial agrupado por fecha para mostrar en formato lista
  async getUserListeningHistoryGrouped(userId, limit = 30) {
    const history = await query(`
      SELECT 
        DATE(lh.listened_at) as listen_date,
        lh.listened_at,
        a.id as album_id,
        a.name as album_name,
        a.artist_name as artist,
        a.image_url,
        a.spotify_id,
        a.release_date
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
        release_date: entry.release_date,
        listened_at: entry.listened_at
      });
    });

    // Convertir a array y ordenar por fecha
    const result = Object.values(groupedData)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    return result;
  },

  // Obtener total de entradas en el historial de un usuario
  async getHistoryCount(userId) {
    const result = await get('SELECT COUNT(*) as count FROM listening_history WHERE user_id = ?', [userId]);
    return result ? parseInt(result.count) : 0;
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
  },

  // Métodos adicionales requeridos por los endpoints
  async addToWatchlist(userId, albumId) {
    return await run(
      'INSERT INTO watchlist (user_id, album_id, added_at) VALUES (?, ?, NOW())',
      [userId, albumId]
    );
  },

  async removeFromWatchlist(userId, albumId) {
    const result = await run('DELETE FROM watchlist WHERE user_id = ? AND album_id = ?', [userId, albumId]);
    return result.changes || 0;
  },

  async isInWatchlist(userId, albumId) {
    const result = await get(
      'SELECT id FROM watchlist WHERE user_id = ? AND album_id = ?',
      [userId, albumId]
    );
    return !!result;
  },

  async getUserWatchlist(userId, limit = 20, offset = 0) {
    return await query(`
      SELECT w.*, a.name as album_name, a.artist_name as artist, a.image_url, a.spotify_id, a.release_date, a.spotify_url
      FROM watchlist w
      JOIN albums a ON w.album_id = a.id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
  },

  async getWatchlistCount(userId) {
    const result = await get(
      'SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?',
      [userId]
    );
    return result ? parseInt(result.count) : 0;
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
