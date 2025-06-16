// Sistema de pool de conexiones para optimizar el acceso a la base de datos
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

class DatabasePool {
  constructor(dbPath, options = {}) {
    this.dbPath = dbPath;
    this.maxConnections = options.maxConnections || 10;
    this.minConnections = options.minConnections || 2;
    this.connectionTimeout = options.connectionTimeout || 30000; // 30 segundos
    
    this.pool = [];
    this.activeConnections = 0;
    this.waitingQueue = [];
    
    // Inicializar conexiones mínimas
    this.initializePool();
  }

  async initializePool() {
    for (let i = 0; i < this.minConnections; i++) {
      const connection = await this.createConnection();
      this.pool.push(connection);
    }
    console.log(`📊 Database pool initialized with ${this.minConnections} connections`);
  }

  async createConnection() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          // Configurar conexión para mejor rendimiento
          db.configure('busyTimeout', 30000);
          db.run('PRAGMA journal_mode = WAL');
          db.run('PRAGMA synchronous = NORMAL');
          db.run('PRAGMA cache_size = 1000');
          db.run('PRAGMA temp_store = MEMORY');
          
          // Promisificar métodos
          db.getAsync = promisify(db.get.bind(db));
          db.allAsync = promisify(db.all.bind(db));
          db.runAsync = promisify(db.run.bind(db));
          
          resolve(db);
        }
      });
    });
  }

  async getConnection() {
    // Si hay conexiones disponibles en el pool
    if (this.pool.length > 0) {
      const connection = this.pool.pop();
      this.activeConnections++;
      return connection;
    }

    // Si podemos crear una nueva conexión
    if (this.activeConnections < this.maxConnections) {
      const connection = await this.createConnection();
      this.activeConnections++;
      return connection;
    }

    // Esperar por una conexión disponible
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(item => item === resolve);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('Connection timeout'));
      }, this.connectionTimeout);

      this.waitingQueue.push({ resolve, reject, timeout });
    });
  }

  releaseConnection(connection) {
    this.activeConnections--;
    
    // Si hay requests esperando
    if (this.waitingQueue.length > 0) {
      const { resolve, timeout } = this.waitingQueue.shift();
      clearTimeout(timeout);
      this.activeConnections++;
      resolve(connection);
      return;
    }

    // Devolver al pool si no excede el mínimo
    if (this.pool.length < this.minConnections) {
      this.pool.push(connection);
    } else {
      // Cerrar conexión extra
      connection.close();
    }
  }

  async executeQuery(query, params = []) {
    const connection = await this.getConnection();
    try {
      const result = await connection.allAsync(query, params);
      return result;
    } finally {
      this.releaseConnection(connection);
    }
  }

  async executeRun(query, params = []) {
    const connection = await this.getConnection();
    try {
      const result = await connection.runAsync(query, params);
      return result;
    } finally {
      this.releaseConnection(connection);
    }
  }

  async executeGet(query, params = []) {
    const connection = await this.getConnection();
    try {
      const result = await connection.getAsync(query, params);
      return result;
    } finally {
      this.releaseConnection(connection);
    }
  }

  async closePool() {
    // Cerrar todas las conexiones del pool
    for (const connection of this.pool) {
      await new Promise(resolve => connection.close(resolve));
    }
    this.pool = [];
    console.log('📊 Database pool closed');
  }

  getStats() {
    return {
      poolSize: this.pool.length,
      activeConnections: this.activeConnections,
      waitingQueue: this.waitingQueue.length,
      maxConnections: this.maxConnections
    };
  }
}

// Instancia global del pool
export const dbPool = new DatabasePool('./users.db', {
  maxConnections: 10,
  minConnections: 3,
  connectionTimeout: 30000
});

// Función helper para usar el pool
export const withDbPool = async (callback) => {
  const connection = await dbPool.getConnection();
  try {
    return await callback(connection);
  } finally {
    dbPool.releaseConnection(connection);
  }
};
