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
  },

  // Actualizar perfil de usuario (bio y foto de perfil)
  async updateProfile(userId, profileData) {
    const { bio, profilePicture } = profileData;
    return await run(
      'UPDATE users SET bio = ?, profile_image = ?, updated_at = NOW() WHERE id = ?',
      [bio, profilePicture, userId]
    );
  },

  // Actualizar nombre de usuario
  async updateUsername(userId, newUsername) {
    // Verificar si el username ya existe
    const existingUser = await this.findByUsername(newUsername);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Este nombre de usuario ya está en uso');
    }

    // Actualizar username - sin restricción de tiempo por ahora
    return await run(
      'UPDATE users SET username = ?, updated_at = NOW() WHERE id = ?',
      [newUsername, userId]
    );
  },

  // Verificar si el usuario puede cambiar su username
  async canChangeUsername(userId) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Por ahora permitir cambio siempre (sin restricción de tiempo)
    return { canChange: true, daysRemaining: 0 };
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
  },

  // Obtener reseñas de un usuario específico
  async getUserReviews(userId, limit = 20, offset = 0) {
    return await query(`
      SELECT 
        r.id,
        r.user_id,
        r.spotify_album_id,
        r.rating,
        r.review_text as content,
        r.is_private,
        r.created_at,
        r.updated_at,
        a.name as album_name,
        a.artist_name as artist,
        a.image_url,
        a.spotify_id as album_spotify_id
      FROM reviews r
      LEFT JOIN albums a ON r.spotify_album_id = a.spotify_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
  },

  // Contar total de reseñas de un usuario
  async getUserReviewsCount(userId) {
    const result = await get(
      'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
      [userId]
    );
    return result ? parseInt(result.count) : 0;
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
      'INSERT INTO lists (user_id, name, description, is_private, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user_id, name, description, !is_public] // is_private es lo opuesto de is_public
    );
  },

  // Crear una nueva lista
  async createList(userId, listData) {
    const { name, description = null, is_public = true } = listData;
    
    try {
      // Insertar la nueva lista
      await run(
        'INSERT INTO lists (user_id, name, description, is_private, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [userId, name, description, !is_public] // is_private es lo opuesto de is_public
      );
      
      // Obtener la lista recién creada
      const newList = await get(
        'SELECT * FROM lists WHERE user_id = ? AND name = ? ORDER BY created_at DESC LIMIT 1',
        [userId, name]
      );
      
      if (!newList) {
        throw new Error('No se pudo recuperar la lista creada');
      }
      
      return newList;
      
    } catch (error) {
      console.error('Error creating list:', error);
      throw new Error('Error al crear la lista: ' + error.message);
    }
  },

  // Obtener listas de un usuario - MÉTODO REQUERIDO AGREGADO
  async getUserLists(userId, includePrivate = true) {
    const queryStr = includePrivate 
      ? `SELECT 
          l.*,
          COUNT(la.spotify_album_id) as album_count
         FROM lists l
         LEFT JOIN list_albums la ON l.id = la.list_id
         WHERE l.user_id = ?
         GROUP BY l.id, l.user_id, l.name, l.description, l.is_private, l.created_at, l.updated_at
         ORDER BY l.created_at DESC`
      : `SELECT 
          l.*,
          COUNT(la.spotify_album_id) as album_count
         FROM lists l
         LEFT JOIN list_albums la ON l.id = la.list_id
         WHERE l.user_id = ? AND l.is_private = false
         GROUP BY l.id, l.user_id, l.name, l.description, l.is_private, l.created_at, l.updated_at
         ORDER BY l.created_at DESC`;
    
    return await query(queryStr, [userId]);
  },

  // Obtener listas públicas recientes
  async getPublicLists(limit = 20, offset = 0) {
    return await query(`
      SELECT 
        l.*,
        u.username,
        COUNT(la.spotify_album_id) as album_count
      FROM lists l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN list_albums la ON l.id = la.list_id
      WHERE l.is_private = false
      GROUP BY l.id, l.user_id, l.name, l.description, l.is_private, l.created_at, l.updated_at, u.username
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
  },

  // Obtener una lista específica con sus álbumes
  async getListWithAlbums(listId, userId = null) {
    // Primero obtener la lista con información del usuario
    const list = await get(`
      SELECT l.*, u.username
      FROM lists l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `, [listId]);

    if (!list) {
      return null;
    }

    // Verificar permisos (si es privada, solo el propietario puede verla)
    if (list.is_private && (!userId || list.user_id !== userId)) {
      return null;
    }

    // Obtener los álbumes de la lista (necesitamos JOIN con albums usando spotify_album_id)
    const albums = await query(`
      SELECT 
        la.*,
        a.spotify_id,
        a.name,
        a.artist_name as artist,
        a.release_date,
        a.image_url
      FROM list_albums la
      JOIN albums a ON la.spotify_album_id = a.spotify_id
      WHERE la.list_id = ?
      ORDER BY la.order_index ASC, la.created_at DESC
    `, [listId]);

    return {
      ...list,
      albums
    };
  },

  // Actualizar lista
  async updateList(listId, userId, updates) {
    const { name, description, is_public } = updates;
    
    // Verificar permisos
    const list = await get(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos');
    }

    await run(
      'UPDATE lists SET name = ?, description = ?, is_private = ?, updated_at = NOW() WHERE id = ?',
      [name, description, !is_public, listId] // is_private es lo opuesto de is_public
    );

    return await get('SELECT * FROM lists WHERE id = ?', [listId]);
  },

  // Eliminar lista
  async deleteList(listId, userId) {
    // Verificar permisos
    const list = await get(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos');
    }

    // Eliminar la lista (los álbumes se eliminan automáticamente por CASCADE)
    const result = await run(
      'DELETE FROM lists WHERE id = ?',
      [listId]
    );

    return result.changes > 0;
  },

  // Agregar álbum a una lista
  async addAlbumToList(listId, albumId, userId, notes = null) {
    try {
      // Verificar que la lista existe y el usuario tiene permisos
      const list = await get(
        'SELECT * FROM lists WHERE id = ? AND user_id = ?',
        [listId, userId]
      );

      if (!list) {
        throw new Error('Lista no encontrada o no tienes permisos');
      }

      // Obtener el spotify_id del álbum usando su ID interno
      const album = await get('SELECT spotify_id FROM albums WHERE id = ?', [albumId]);
      if (!album) {
        throw new Error('Álbum no encontrado');
      }

      // Verificar si el álbum ya está en la lista
      const existing = await get(
        'SELECT 1 FROM list_albums WHERE list_id = ? AND spotify_album_id = ?',
        [listId, album.spotify_id]
      );

      if (existing) {
        throw new Error('El álbum ya está en esta lista');
      }

      // Obtener el siguiente order_index
      const maxOrder = await get(
        'SELECT COALESCE(MAX(order_index), -1) as max_order FROM list_albums WHERE list_id = ?',
        [listId]
      );

      const nextOrder = (maxOrder?.max_order || 0) + 1;

      // Agregar álbum a la lista
      const result = await run(
        `INSERT INTO list_albums 
         (list_id, spotify_album_id, notes, order_index, created_at, updated_at) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [listId, album.spotify_id, notes, nextOrder]
      );

      // Actualizar el timestamp de la lista
      await run(
        'UPDATE lists SET updated_at = NOW() WHERE id = ?',
        [listId]
      );

      return result;
    } catch (error) {
      if (error.message.includes('duplicate key') || error.message.includes('UNIQUE constraint')) {
        throw new Error('El álbum ya está en esta lista');
      }
      throw error;
    }
  },

  // Remover álbum de una lista
  async removeAlbumFromList(listId, albumId, userId) {
    try {
      // Verificar que la lista existe y el usuario tiene permisos
      const list = await get(
        'SELECT * FROM lists WHERE id = ? AND user_id = ?',
        [listId, userId]
      );

      if (!list) {
        throw new Error('Lista no encontrada o no tienes permisos');
      }

      // Obtener el spotify_id del álbum usando su ID interno
      const album = await get('SELECT spotify_id FROM albums WHERE id = ?', [albumId]);
      if (!album) {
        throw new Error('Álbum no encontrado');
      }

      // Remover álbum de la lista
      const result = await run(
        'DELETE FROM list_albums WHERE list_id = ? AND spotify_album_id = ?',
        [listId, album.spotify_id]
      );

      if (result.changes === 0) {
        throw new Error('Álbum no encontrado en esta lista');
      }

      // Actualizar el timestamp de la lista
      await run(
        'UPDATE lists SET updated_at = NOW() WHERE id = ?',
        [listId]
      );

      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  },

  // Verificar si un álbum está en una lista específica
  async isAlbumInList(listId, spotifyAlbumId) {
    const result = await get(
      'SELECT 1 FROM list_albums WHERE list_id = ? AND spotify_album_id = ?',
      [listId, spotifyAlbumId]
    );
    return !!result;
  },

  // Obtener álbumes de una lista específica
  async getListAlbums(listId, limit = 50, offset = 0) {
    return await query(`
      SELECT 
        la.*,
        a.spotify_id,
        a.name,
        a.artist_name as artist,
        a.release_date,
        a.image_url,
        a.id as album_id
      FROM list_albums la
      JOIN albums a ON la.spotify_album_id = a.spotify_id
      WHERE la.list_id = ?
      ORDER BY la.order_index ASC, la.created_at DESC
      LIMIT ? OFFSET ?
    `, [listId, limit, offset]);
  },

  // Actualizar el orden de álbumes en una lista
  async updateAlbumOrder(listId, albumId, newOrder, userId) {
    // Verificar permisos
    const list = await get(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no tienes permisos');
    }

    // Obtener el spotify_id del álbum
    const album = await get('SELECT spotify_id FROM albums WHERE id = ?', [albumId]);
    if (!album) {
      throw new Error('Álbum no encontrado');
    }

    // Actualizar el orden
    const result = await run(
      'UPDATE list_albums SET order_index = ?, updated_at = NOW() WHERE list_id = ? AND spotify_album_id = ?',
      [newOrder, listId, album.spotify_id]
    );

    return result.changes > 0;
  },

  // ===== MÉTODOS PARA LIKES DE LISTAS =====
  
  // Dar/quitar like a una lista
  async likeList(listId, userId) {
    // Verificar que la lista existe y es accesible
    const list = await get(
      'SELECT * FROM lists WHERE id = ? AND (is_private = false OR user_id = ?)',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no es accesible');
    }

    // Verificar si ya le dio like
    const existingLike = await get(
      'SELECT id FROM list_likes WHERE list_id = ? AND user_id = ?',
      [listId, userId]
    );

    if (existingLike) {
      throw new Error('Ya le diste like a esta lista');
    }

    // Agregar like
    await run(
      'INSERT INTO list_likes (list_id, user_id, created_at) VALUES (?, ?, NOW())',
      [listId, userId]
    );

    return { success: true };
  },

  // Quitar like de una lista
  async unlikeList(listId, userId) {
    const result = await run(
      'DELETE FROM list_likes WHERE list_id = ? AND user_id = ?',
      [listId, userId]
    );

    if (result.changes === 0) {
      throw new Error('No has dado like a esta lista');
    }

    return { success: true };
  },

  // Obtener likes de una lista
  async getListLikes(listId, limit = 20, offset = 0) {
    return await query(`
      SELECT 
        ll.*,
        u.username,
        u.profile_image_url
      FROM list_likes ll
      JOIN users u ON ll.user_id = u.id
      WHERE ll.list_id = ?
      ORDER BY ll.created_at DESC
      LIMIT ? OFFSET ?
    `, [listId, limit, offset]);
  },

  // Contar likes de una lista
  async getListLikesCount(listId) {
    const result = await get(
      'SELECT COUNT(*) as count FROM list_likes WHERE list_id = ?',
      [listId]
    );
    return result ? parseInt(result.count) : 0;
  },

  // ===== MÉTODOS PARA COMENTARIOS DE LISTAS =====

  // Agregar comentario a una lista
  async addCommentToList(listId, userId, content) {
    // Verificar que la lista existe y es accesible
    const list = await get(
      'SELECT * FROM lists WHERE id = ? AND (is_private = false OR user_id = ?)',
      [listId, userId]
    );

    if (!list) {
      throw new Error('Lista no encontrada o no es accesible');
    }

    // Validar contenido
    if (!content || !content.trim()) {
      throw new Error('El comentario no puede estar vacío');
    }

    if (content.length > 500) {
      throw new Error('El comentario no puede exceder 500 caracteres');
    }

    // Agregar comentario
    const result = await run(
      'INSERT INTO list_comments (list_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())',
      [listId, userId, content.trim()]
    );

    // Obtener el comentario recién creado con información del usuario
    const comment = await get(`
      SELECT 
        lc.*,
        u.username,
        u.profile_image_url
      FROM list_comments lc
      JOIN users u ON lc.user_id = u.id
      WHERE lc.id = ?
    `, [result.lastInsertRowid || result.insertId]);

    return comment;
  },

  // Obtener comentarios de una lista
  async getListComments(listId, limit = 20, offset = 0) {
    return await query(`
      SELECT 
        lc.*,
        u.username,
        u.profile_image_url
      FROM list_comments lc
      JOIN users u ON lc.user_id = u.id
      WHERE lc.list_id = ?
      ORDER BY lc.created_at DESC
      LIMIT ? OFFSET ?
    `, [listId, limit, offset]);
  },

  // Contar comentarios de una lista
  async getListCommentsCount(listId) {
    const result = await get(
      'SELECT COUNT(*) as count FROM list_comments WHERE list_id = ?',
      [listId]
    );
    return result ? parseInt(result.count) : 0;
  },

  // Actualizar comentario
  async updateComment(commentId, userId, content) {
    // Validar contenido
    if (!content || !content.trim()) {
      throw new Error('El comentario no puede estar vacío');
    }

    if (content.length > 500) {
      throw new Error('El comentario no puede exceder 500 caracteres');
    }

    // Verificar permisos
    const comment = await get(
      'SELECT * FROM list_comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (!comment) {
      throw new Error('Comentario no encontrado o no tienes permisos');
    }

    // Actualizar comentario
    await run(
      'UPDATE list_comments SET content = ?, updated_at = NOW() WHERE id = ?',
      [content.trim(), commentId]
    );

    // Retornar comentario actualizado
    return await get(`
      SELECT 
        lc.*,
        u.username,
        u.profile_image_url
      FROM list_comments lc
      JOIN users u ON lc.user_id = u.id
      WHERE lc.id = ?
    `, [commentId]);
  },

  // Eliminar comentario
  async deleteComment(commentId, userId) {
    // Verificar permisos (el usuario debe ser el autor del comentario o el dueño de la lista)
    const comment = await get(`
      SELECT 
        lc.*,
        l.user_id as list_owner_id
      FROM list_comments lc
      JOIN lists l ON lc.list_id = l.id
      WHERE lc.id = ?
    `, [commentId]);

    if (!comment) {
      throw new Error('Comentario no encontrado');
    }

    if (comment.user_id !== userId && comment.list_owner_id !== userId) {
      throw new Error('No tienes permisos para eliminar este comentario');
    }

    // Eliminar comentario
    const result = await run(
      'DELETE FROM list_comments WHERE id = ?',
      [commentId]
    );

    return result.changes > 0;
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
  },

  // Obtener seguidores de un usuario con paginación
  async getFollowers(userId, limit = 20, offset = 0) {
    return await query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.bio,
        u.profile_image,
        f.created_at as followed_at,
        COUNT(r.id) as total_reviews,
        COALESCE(AVG(CAST(r.rating AS FLOAT)), 0) as avg_rating
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      LEFT JOIN reviews r ON u.id = r.user_id
      WHERE f.following_id = ?
      GROUP BY u.id, u.username, u.email, u.bio, u.profile_image, f.created_at
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
  },

  // Obtener usuarios que sigue un usuario con paginación
  async getFollowing(userId, limit = 20, offset = 0) {
    return await query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.bio,
        u.profile_image,
        f.created_at as followed_at,
        COUNT(r.id) as total_reviews,
        COALESCE(AVG(CAST(r.rating AS FLOAT)), 0) as avg_rating
      FROM follows f
      JOIN users u ON f.following_id = u.id
      LEFT JOIN reviews r ON u.id = r.user_id
      WHERE f.follower_id = ?
      GROUP BY u.id, u.username, u.email, u.bio, u.profile_image, f.created_at
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
  },

  // Contar seguidores
  async getFollowersCount(userId) {
    const result = await get(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
      [userId]
    );
    return result ? parseInt(result.count) : 0;
  },

  // Contar usuarios que sigue
  async getFollowingCount(userId) {
    const result = await get(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
      [userId]
    );
    return result ? parseInt(result.count) : 0;
  },

  // Verificar si un usuario sigue a otro
  async isFollowing(followerId, followedId) {
    const result = await get(
      'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followedId]
    );
    return !!result;
  },

  // Obtener estadísticas de seguimiento
  async getFollowStats(userId) {
    const [followers, following] = await Promise.all([
      this.getFollowersCount(userId),
      this.getFollowingCount(userId)
    ]);
    
    return { followers, following };
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
      SELECT w.*, a.name as album_name, a.artist_name as artist, a.image_url, a.spotify_id, a.release_date
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
    // Devolver categorías con conteo de hilos
    const sql = `
      SELECT 
        category,
        COUNT(*) as thread_count
      FROM forum_threads 
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY thread_count DESC, category ASC
    `;
    
    try {
      const dbCategories = await query(sql);
      
      // Categorías predefinidas para asegurar que siempre estén disponibles
      const defaultCategories = [
        'General', 'Recomendaciones', 'Reseñas', 'Discusión', 'Noticias'
      ];
      
      const result = [];
      const existingCategories = dbCategories.map(c => c.category);
      
      // Agregar categorías de la base de datos
      dbCategories.forEach(cat => {
        result.push({
          category: cat.category,
          thread_count: parseInt(cat.thread_count) || 0
        });
      });
      
      // Agregar categorías predefinidas que no estén en la DB
      defaultCategories.forEach(cat => {
        if (!existingCategories.includes(cat)) {
          result.push({
            category: cat,
            thread_count: 0
          });
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error obteniendo categorías de DB:', error);
      // Fallback a categorías estáticas
      return [
        { category: 'General', thread_count: 0 },
        { category: 'Recomendaciones', thread_count: 0 },
        { category: 'Reseñas', thread_count: 0 },
        { category: 'Discusión', thread_count: 0 },
        { category: 'Noticias', thread_count: 0 }
      ];
    }
  },
  
  async getLanguages() {
    // Devolver idiomas con conteo de hilos
    const sql = `
      SELECT 
        language,
        COUNT(*) as thread_count
      FROM forum_threads 
      WHERE language IS NOT NULL
      GROUP BY language
      ORDER BY thread_count DESC, language ASC
    `;
    
    try {
      const dbLanguages = await query(sql);
      
      // Mapeo simplificado con idiomas principales y comunes
      const languageNames = {
        // Idiomas principales
        'es': 'Español',
        'en': 'English',
        'fr': 'Français',
        'de': 'Deutsch',
        'it': 'Italiano',
        'pt': 'Português',
        'pt-br': 'Português (Brasil)',
        
        // Idiomas europeos importantes
        'ru': 'Русский',
        'pl': 'Polski',
        'nl': 'Nederlands',
        'sv': 'Svenska',
        'no': 'Norsk',
        'da': 'Dansk',
        'fi': 'Suomi',
        'el': 'Ελληνικά',
        'tr': 'Türkçe',
        
        // Idiomas asiáticos principales
        'zh': '中文',
        'ja': '日本語',
        'ko': '한국어',
        'hi': 'हिन्दी',
        'ar': 'العربية',
        'th': 'ไทย',
        'vi': 'Tiếng Việt',
        'id': 'Bahasa Indonesia',
        
        // Otros idiomas importantes
        'uk': 'Українська',
        'he': 'עברית',
        'fa': 'فارسی',
        'ur': 'اردو',
        'bn': 'বাংলা',
        'tl': 'Filipino',
        'sw': 'Kiswahili',
        'ms': 'Bahasa Melayu',
        
        // Idiomas regionales destacados
        'ca': 'Català',
        'eu': 'Euskera',
        'gl': 'Galego',
        'cy': 'Cymraeg',
        'ga': 'Gaeilge'
      };
      
      const result = [];
      const existingLanguages = dbLanguages.map(l => l.language);
      
      // Agregar idiomas de la base de datos
      dbLanguages.forEach(lang => {
        result.push({
          code: lang.language,
          name: languageNames[lang.language] || lang.language,
          language: lang.language, // Para compatibilidad
          thread_count: parseInt(lang.thread_count) || 0
        });
      });
      
      // Agregar idiomas predefinidos que no estén en la DB
      Object.entries(languageNames).forEach(([code, name]) => {
        if (!existingLanguages.includes(code)) {
          result.push({
            code: code,
            name: name,
            language: code, // Para compatibilidad
            thread_count: 0
          });
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error obteniendo idiomas de DB:', error);
      // Fallback a idiomas estáticos
      return [
        { code: 'es', name: 'Español', language: 'es', thread_count: 0 },
        { code: 'en', name: 'English', language: 'en', thread_count: 0 },
        { code: 'fr', name: 'Français', language: 'fr', thread_count: 0 },
        { code: 'de', name: 'Deutsch', language: 'de', thread_count: 0 },
        { code: 'it', name: 'Italiano', language: 'it', thread_count: 0 },
        { code: 'pt', name: 'Português', language: 'pt', thread_count: 0 }
      ];
    }
  },

  // Métodos adicionales requeridos por los endpoints
  async getThreads(limit = 20, offset = 0, category = null, language = null) {
    let sql = `
      SELECT 
        ft.*, 
        u.username as author_username,
        u.profile_image as author_profile_picture,
        COALESCE(ft.replies_count, 0) as replies_count,
        COALESCE(ft.likes_count, 0) as likes_count,
        ft.last_activity
      FROM forum_threads ft
      LEFT JOIN users u ON ft.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (category && category !== 'all') {
      sql += ' AND ft.category = ?';
      params.push(category);
    }
    
    if (language && language !== 'all') {
      sql += ' AND ft.language = ?';
      params.push(language);
    }
    
    sql += ' ORDER BY ft.last_activity DESC, ft.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return await query(sql, params);
  },

  async getThreadsOptimized(limit = 20, offset = 0, category = null, language = null) {
    // Versión optimizada con menos JOINs para mejor rendimiento
    return await this.getThreads(limit, offset, category, language);
  },

  async getThread(threadId) {
    const sql = `
      SELECT 
        ft.*, 
        u.username as author_username,
        u.profile_image as author_profile_picture,
        COALESCE(ft.replies_count, 0) as replies_count,
        COALESCE(ft.likes_count, 0) as likes_count
      FROM forum_threads ft
      LEFT JOIN users u ON ft.user_id = u.id
      WHERE ft.id = ?
    `;
    
    return await get(sql, [threadId]);
  },

  async getReplies(threadId, limit = 50, offset = 0) {
    const sql = `
      SELECT 
        fr.*, 
        u.username as author_username,
        u.profile_image as author_profile_picture,
        COALESCE(fr.likes_count, 0) as likes_count
      FROM forum_replies fr
      LEFT JOIN users u ON fr.user_id = u.id
      WHERE fr.thread_id = ?
      ORDER BY fr.created_at ASC
      LIMIT ? OFFSET ?
    `;
    
    return await query(sql, [threadId, limit, offset]);
  },

  async searchThreads(searchTerm, limit = 20, offset = 0) {
    const sql = `
      SELECT 
        ft.*, 
        u.username as author_username,
        u.profile_image as author_profile_picture,
        COALESCE(ft.replies_count, 0) as replies_count,
        COALESCE(ft.likes_count, 0) as likes_count
      FROM forum_threads ft
      LEFT JOIN users u ON ft.user_id = u.id
      WHERE ft.title ILIKE ? OR ft.content ILIKE ?
      ORDER BY ft.last_activity DESC, ft.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    return await query(sql, [searchPattern, searchPattern, limit, offset]);
  },

  // VIEWS FUNCTIONALITY REMOVED
  // async incrementViews(threadId) {
  //   const sql = `
  //     UPDATE forum_threads 
  //     SET views_count = COALESCE(views_count, 0) + 1 
  //     WHERE id = ?
  //   `;
  //   
  //   return await run(sql, [threadId]);
  // },

  async hasLikedThread(userId, threadId) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM forum_thread_likes 
      WHERE user_id = ? AND thread_id = ?
    `;
    
    const result = await get(sql, [userId, threadId]);
    return result && result.count > 0;
  },

  async hasLikedReply(userId, replyId) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM forum_reply_likes 
      WHERE user_id = ? AND reply_id = ?
    `;
    
    const result = await get(sql, [userId, replyId]);
    return result && result.count > 0;
  },

  async likeThread(userId, threadId) {
    // Verificar si ya le dio like
    const hasLiked = await this.hasLikedThread(userId, threadId);
    
    if (hasLiked) {
      // Quitar like
      await run('DELETE FROM forum_thread_likes WHERE user_id = ? AND thread_id = ?', [userId, threadId]);
      await run('UPDATE forum_threads SET likes_count = COALESCE(likes_count, 0) - 1 WHERE id = ?', [threadId]);
      return { action: 'removed', liked: false };
    } else {
      // Agregar like
      await run('INSERT INTO forum_thread_likes (user_id, thread_id, created_at) VALUES (?, ?, NOW())', [userId, threadId]);
      await run('UPDATE forum_threads SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ?', [threadId]);
      return { action: 'added', liked: true };
    }
  },

  async likeReply(userId, replyId) {
    // Verificar si ya le dio like
    const hasLiked = await this.hasLikedReply(userId, replyId);
    
    if (hasLiked) {
      // Quitar like
      await run('DELETE FROM forum_reply_likes WHERE user_id = ? AND reply_id = ?', [userId, replyId]);
      await run('UPDATE forum_replies SET likes_count = COALESCE(likes_count, 0) - 1 WHERE id = ?', [replyId]);
      return { action: 'removed', liked: false };
    } else {
      // Agregar like
      await run('INSERT INTO forum_reply_likes (user_id, reply_id, created_at) VALUES (?, ?, NOW())', [userId, replyId]);
      await run('UPDATE forum_replies SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ?', [replyId]);
      return { action: 'added', liked: true };
    }
  },

  async getUserLikes(userId, threadId) {
    const threadLike = await this.hasLikedThread(userId, threadId);
    const replies = await this.getReplies(threadId);
    
    const replyLikes = {};
    for (const reply of replies) {
      replyLikes[reply.id] = await this.hasLikedReply(userId, reply.id);
    }
    
    return {
      thread: threadLike,
      replies: replyLikes
    };
  },

  async deleteThread(threadId, userId) {
    // Verificar que el usuario es el autor del hilo
    const thread = await this.getThread(threadId);
    if (!thread || thread.user_id !== userId) {
      throw new Error('No tienes permisos para eliminar este hilo');
    }

    // Eliminar respuestas primero (integridad referencial)
    await run('DELETE FROM forum_replies WHERE thread_id = ?', [threadId]);
    
    // Eliminar likes del hilo
    await run('DELETE FROM forum_thread_likes WHERE thread_id = ?', [threadId]);
    
    // Eliminar el hilo
    return await run('DELETE FROM forum_threads WHERE id = ?', [threadId]);
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

  // Método completo para agregar track con toda su información
  async addTrackToFavorites(userId, trackData) {
    try {
      const { id: trackId, name, artists, album, duration_ms, images } = trackData;
      
      // Verificar si ya está en favoritos
      const existing = await this.isFavorite(userId, trackId);
      if (existing) {
        throw new Error('Este track ya está en tus favoritos');
      }

      // Agregar track completo a favoritos
      const result = await run(
        `INSERT INTO track_favorites 
         (user_id, track_id, track_name, artist_name, album_name, image_url, duration_ms, added_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId, 
          trackId, 
          name,
          artists && artists[0] ? artists[0].name : 'Unknown Artist',
          album ? album.name : 'Unknown Album',
          images && images[0] ? images[0].url : null,
          duration_ms || 0
        ]
      );

      return result;
    } catch (error) {
      if (error.message.includes('duplicate key') || error.message.includes('UNIQUE constraint')) {
        throw new Error('Este track ya está en tus favoritos');
      }
      throw error;
    }
  },

  // Método para remover track de favoritos por trackId
  async removeTrackFromFavorites(userId, trackId) {
    const result = await run('DELETE FROM track_favorites WHERE user_id = ? AND track_id = ?', [userId, trackId]);
    return result.changes > 0;
  },
  
  async remove(userId, trackId) {
    return await run('DELETE FROM track_favorites WHERE user_id = ? AND track_id = ?', [userId, trackId]);
  },
  
  async isFavorite(userId, trackId) {
    const result = await get('SELECT 1 FROM track_favorites WHERE user_id = ? AND track_id = ?', [userId, trackId]);
    return !!result;
  },

  // Obtener favoritos de un usuario con paginación
  async getUserFavorites(userId, limit = 20, offset = 0) {
    return await query(
      `SELECT * FROM track_favorites 
       WHERE user_id = ? 
       ORDER BY added_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
  },

  // Contar total de favoritos de un usuario
  async getUserFavoritesCount(userId) {
    const result = await get(
      'SELECT COUNT(*) as count FROM track_favorites WHERE user_id = ?',
      [userId]
    );
    return result ? parseInt(result.count) : 0;
  },

  // Verificar si un track específico está en favoritos del usuario
  async isTrackInFavorites(userId, trackId) {
    return await this.isFavorite(userId, trackId);
  },

  // Obtener estadísticas de un track (cuántos usuarios lo tienen en favoritos)
  async getTrackStats(trackId) {
    const result = await get(
      'SELECT COUNT(*) as favorite_count FROM track_favorites WHERE track_id = ?',
      [trackId]
    );
    return {
      favorite_count: result ? parseInt(result.favorite_count) : 0
    };
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
