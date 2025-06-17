// Adaptador universal de base de datos
// Solo usa PostgreSQL en producción

import { query as pgQuery, getPool } from './database-postgres.js';

let db;

async function initDatabase() {
  if (db) return db;
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Please configure a PostgreSQL database.');
  }
  
  db = { query: pgQuery, getPool, type: 'postgresql' };
  return db;
}

// Función universal para queries
export async function query(sql, params = []) {
  const database = await initDatabase();
  
  if (database.type === 'postgresql') {
    // PostgreSQL usa $1, $2, etc.
    const pgSql = sql.replace(/\?/g, (match, offset) => {
      const paramIndex = sql.substring(0, offset).split('?').length;
      return `$${paramIndex}`;
    });
    const result = await database.query(pgSql, params);
    return result.rows;
  } else {
    // Si por alguna razón no es PostgreSQL, usar la función directa
    const result = await database.query(sql, params);
    return result.rows;
  }
}

// Función para obtener un solo registro
export async function get(sql, params = []) {
  const database = await initDatabase();
  
  if (database.type === 'postgresql') {
    const pgSql = sql.replace(/\?/g, (match, offset) => {
      const paramIndex = sql.substring(0, offset).split('?').length;
      return `$${paramIndex}`;
    });
    const result = await database.query(pgSql, params);
    return result.rows[0] || null;
  } else {
    return new Promise((resolve, reject) => {
      database.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
}

// Función para INSERT/UPDATE/DELETE
export async function run(sql, params = []) {
  const database = await initDatabase();
  
  if (database.type === 'postgresql') {
    const pgSql = sql.replace(/\?/g, (match, offset) => {
      const paramIndex = sql.substring(0, offset).split('?').length;
      return `$${paramIndex}`;
    });
    const result = await database.query(pgSql, params);
    return {
      lastID: result.rows[0]?.id || null,
      changes: result.rowCount || 0
    };
  } else {
    return new Promise((resolve, reject) => {
      database.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
}

// Función para obtener información de la base de datos
export async function getDatabaseInfo() {
  const database = await initDatabase();
  return {
    type: database.type,
    isProduction: process.env.NODE_ENV === 'production',
    hasPostgresUrl: !!process.env.DATABASE_URL?.includes('postgres')
  };
}

export default { query, get, run, getDatabaseInfo };
