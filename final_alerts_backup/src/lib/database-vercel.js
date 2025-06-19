// Configuración de base de datos para Vercel con Neon PostgreSQL
import { Pool } from 'pg';

let pool;

function createPool() {
  // Para Vercel, usar connection string directamente
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { 
      rejectUnauthorized: false 
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

export function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

export async function query(text, params) {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Función para cerrar el pool (útil para testing)
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default { query, getPool, closePool };
