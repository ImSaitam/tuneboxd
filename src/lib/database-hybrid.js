// Adaptador híbrido de base de datos para PostgreSQL y SQLite
import { query as pgQuery, getPool } from './database-postgres.js';
import * as sqliteDb from './database-sqlite.js';

// Detectar tipo de base de datos basado en DATABASE_URL
function getDatabaseType() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  
  if (url.startsWith('sqlite:')) {
    return 'sqlite';
  } else if (url.includes('postgresql') || url.includes('postgres')) {
    return 'postgresql';
  } else {
    throw new Error('Unsupported database type. Use sqlite: or postgresql:// URLs');
  }
}

// Función universal para queries
export async function query(sql, params = []) {
  const dbType = getDatabaseType();
  
  if (dbType === 'sqlite') {
    return await sqliteDb.query(sql, params);
  } else {
    // PostgreSQL - convertir ? a $1, $2, etc.
    let paramIndex = 0;
    const pgSql = sql.replace(/\?/g, () => {
      paramIndex++;
      return `$${paramIndex}`;
    });
    
    const result = await pgQuery(pgSql, params);
    return result.rows;
  }
}

// Función para obtener un solo registro
export async function get(sql, params = []) {
  const dbType = getDatabaseType();
  
  if (dbType === 'sqlite') {
    return await sqliteDb.get(sql, params);
  } else {
    const rows = await query(sql, params);
    return rows[0] || null;
  }
}

// Función para ejecutar sin devolver datos
export async function run(sql, params = []) {
  const dbType = getDatabaseType();
  
  if (dbType === 'sqlite') {
    return await sqliteDb.run(sql, params);
  } else {
    // PostgreSQL - convertir ? a $1, $2, etc.
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
}

// Función para adaptar SQL según el tipo de base de datos
export function adaptSQL(sql, dbType = null) {
  const type = dbType || getDatabaseType();
  
  if (type === 'sqlite') {
    // Convertir NOW() a datetime('now')
    sql = sql.replace(/NOW\(\)/g, "datetime('now')");
    // Convertir CURRENT_TIMESTAMP específicos
    sql = sql.replace(/DEFAULT CURRENT_TIMESTAMP/g, "DEFAULT (datetime('now'))");
  }
  
  return sql;
}

// Alias para compatibilidad
export const allAsync = query;
export const getAsync = get;
export const runAsync = run;

// Información de la base de datos
export function getDatabaseInfo() {
  const dbType = getDatabaseType();
  return {
    type: dbType,
    isProduction: process.env.NODE_ENV === 'production',
    hasPostgresUrl: dbType === 'postgresql',
    hasSqliteUrl: dbType === 'sqlite'
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
    const sql = adaptSQL('INSERT INTO users (username, email, password_hash, verification_token, created_at) VALUES (?, ?, ?, ?, NOW())');
    return await run(sql, [username, email, password_hash, verification_token]);
  },
  
  async update(id, userData) {
    const { username, email, profile_image, bio, location, website } = userData;
    const sql = adaptSQL('UPDATE users SET username = ?, email = ?, profile_image = ?, bio = ?, location = ?, website = ?, updated_at = NOW() WHERE id = ?');
    return await run(sql, [username, email, profile_image, bio, location, website, id]);
  },
  
  async updateVerificationStatus(email) {
    return await run(
      'UPDATE users SET email_verified = 1, verification_token = NULL WHERE email = ?',
      [email]
    );
  },
  
  async findVerificationToken(token) {
    return await get('SELECT * FROM users WHERE verification_token = ?', [token]);
  },
  
  async verifyUser(userId) {
    return await run(
      'UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?',
      [userId]
    );
  },
  
  async deleteVerificationToken(token) {
    return await run(
      'UPDATE users SET verification_token = NULL WHERE verification_token = ?',
      [token]
    );
  },
  
  async setResetToken(email, token, expires) {
    const sql = adaptSQL('UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?');
    return await run(sql, [token, expires, email]);
  },
  
  async findByResetToken(token) {
    const sql = adaptSQL('SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()');
    return await get(sql, [token]);
  },
  
  async updatePassword(userId, hashedPassword) {
    const sql = adaptSQL('UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW() WHERE id = ?');
    return await run(sql, [hashedPassword, userId]);
  },
  
  async updatePrivacy(userId, privacy) {
    const sql = adaptSQL('UPDATE users SET privacy = ?, updated_at = NOW() WHERE id = ?');
    return await run(sql, [privacy, userId]);
  },
  
  async delete(userId) {
    return await run('DELETE FROM users WHERE id = ?', [userId]);
  },
  
  async getPublicUsers(limit = 20, offset = 0) {
    return await query(
      'SELECT id, username, profile_image, bio, location, created_at FROM users WHERE privacy = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      ['public', limit, offset]
    );
  },
  
  async searchUsers(searchTerm, limit = 20) {
    return await query(
      'SELECT id, username, profile_image, bio FROM users WHERE (username LIKE ? OR bio LIKE ?) AND privacy = ? LIMIT ?',
      [`%${searchTerm}%`, `%${searchTerm}%`, 'public', limit]
    );
  }
};

// Resto de servicios (albums, reviews, etc.) - mantener estructura similar
// pero adaptar las consultas SQL según sea necesario

// Exportación por defecto actualizada
const databaseAdapter = { 
  query, get, run, getDatabaseInfo, allAsync, getAsync, runAsync,
  userService, adaptSQL, getDatabaseType
};
export default databaseAdapter;
