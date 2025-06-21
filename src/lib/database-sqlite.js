// Configuración para base de datos SQLite en desarrollo
import sqlite3 from 'sqlite3';
import path from 'path';

let db;

function createConnection(dbPath) {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Conectado a SQLite:', dbPath);
        resolve(database);
      }
    });
  });
}

export async function getDatabase() {
  if (!db) {
    const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || './database/dev/tuneboxd_dev.db';
    db = await createConnection(dbPath);
  }
  return db;
}

export async function query(sql, params = []) {
  const database = await getDatabase();
  
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function get(sql, params = []) {
  const database = await getDatabase();
  
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

export async function run(sql, params = []) {
  const database = await getDatabase();
  
  return new Promise((resolve, reject) => {
    database.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ 
          lastID: this.lastID, 
          changes: this.changes 
        });
      }
    });
  });
}

export async function close() {
  if (db) {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          db = null;
          resolve();
        }
      });
    });
  }
}

export default { query, get, run, getDatabase, close };
