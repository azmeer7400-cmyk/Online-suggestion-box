const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create/Connect to SQLite database file
const dbPath = path.join(dataDir, 'suggestions.db');
const sqliteDb = new sqlite3.Database(dbPath);

// Enable foreign keys
sqliteDb.run('PRAGMA foreign_keys = ON');

/**
 * Wrapper class to provide better-sqlite3-like synchronous API using sqlite3
 */
class Database {
  constructor(sqliteDb) {
    this.db = sqliteDb;
  }

  run(sql, callback) {
    this.db.run(sql, callback);
  }

  exec(sql, callback) {
    this.db.exec(sql, callback);
  }

  prepare(sql) {
    const db = this.db;
    return {
      run: (...args) => {
        return new Promise((resolve, reject) => {
          db.run(sql, args, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        });
      },
      all: (...args) => {
        return new Promise((resolve, reject) => {
          db.all(sql, args, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
      },
      get: (...args) => {
        return new Promise((resolve, reject) => {
          db.get(sql, args, (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      }
    };
  }
}

const db = new Database(sqliteDb);

/**
 * Initialize database schema with tables and indexes
 * Creates tables for admins and suggestions, and sets up performance indexes
 * @returns {boolean} Success status of initialization
 */
const initDB = () => {
  return new Promise((resolve) => {
    try {
      sqliteDb.serialize(() => {
        // Create admins table
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create suggestions table
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS suggestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            area TEXT NOT NULL CHECK(area IN ('Library', 'Cafeteria', 'Classroom', 'Hostel', 'Laboratory', 'Sports', 'Other')),
            floor INTEGER,
            wing TEXT NOT NULL CHECK(wing IN ('A', 'B', 'C', 'D', 'E', 'N/A')),
            image_path TEXT,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Under Review', 'Resolved', 'Rejected')),
            admin_response TEXT,
            response_date DATETIME
          )
        `);

        // Create indexes for better query performance
        sqliteDb.run(`
          CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
          CREATE INDEX IF NOT EXISTS idx_suggestions_area ON suggestions(area);
          CREATE INDEX IF NOT EXISTS idx_suggestions_submitted_at ON suggestions(submitted_at);
          CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
        `, (err) => {
          if (err) {
            console.error('Database initialization error:', err.message);
            resolve(false);
          } else {
            console.log('Database initialized successfully');
            console.log('Database location: ' + dbPath);
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('Database initialization error:', error.message);
      resolve(false);
    }
  });
};

module.exports = {
  db,
  initDB
};
