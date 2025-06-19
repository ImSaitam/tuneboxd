// Adaptador universal de base de datos para PostgreSQL
import { query as pgQuery, getPool } from './database-postgres.js';

// Función universal para queries
export async function query(sql, params = []) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Please configure a PostgreSQL database.');
  }
  
  // PostgreSQL usa $1, $2, etc.
  const pgSql = sql.replace(/\?/g, (match, offset) => {
    const paramIndex = sql.substring(0, offset).split('?').length;
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
  
  // PostgreSQL usa $1, $2, etc.
  const pgSql = sql.replace(/\?/g, (match, offset) => {
    const paramIndex = sql.substring(0, offset).split('?').length;
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

// Exportación por defecto
const databaseAdapter = { query, get, run, getDatabaseInfo, allAsync, getAsync, runAsync };
export default databaseAdapter;
