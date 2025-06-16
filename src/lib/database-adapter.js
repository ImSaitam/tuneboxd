// Adaptador universal de base de datos
// Usa SQLite en desarrollo y PostgreSQL en producción

let db;

async function initDatabase() {
  if (db) return db;

  // Determinar si estamos en producción
  const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('postgres');

  if (isProduction && process.env.DATABASE_URL) {
    console.log('🐘 Inicializando conexión PostgreSQL para producción...');
    const { query, getPool } = await import('./database-postgres.js');
    db = { query, getPool, type: 'postgresql' };
  } else {
    console.log('🗃️ Usando SQLite para desarrollo...');
    const sqlite = await import('./database.js');
    db = { 
      query: sqlite.query, 
      run: sqlite.run,
      get: sqlite.get,
      all: sqlite.all,
      type: 'sqlite' 
    };
  }

  console.log(`✅ Base de datos inicializada: ${db.type}`);
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
    // SQLite
    return new Promise((resolve, reject) => {
      database.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
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
