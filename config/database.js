const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'suggestions.db');
let SQL;
let db;

/**
 * Initialize SQL.js and load or create database
 */
const initializeDb = async () => {
  SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  
  return db;
};

/**
 * Save database to disk
 */
const saveDb = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

/**
 * Wrapper class to provide consistent API
 */
class Database {
  prepare(sql) {
    const stmt = db.prepare(sql);
    return {
      run: (...params) => {
        stmt.bind(params);
        stmt.step();
        const lastID = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] || null;
        stmt.free();
        saveDb();
        return { lastID, changes: 1 };
      },
      get: (...params) => {
        stmt.bind(params);
        if (stmt.step()) {
          const columns = stmt.getColumnNames();
          const values = stmt.get();
          const row = {};
          columns.forEach((col, idx) => {
            row[col] = values[idx];
          });
          stmt.free();
          return row;
        }
        stmt.free();
        return null;
      },
      all: (...params) => {
        stmt.bind(params);
        const results = [];
        const columns = stmt.getColumnNames();
        while (stmt.step()) {
          const row = {};
          const values = stmt.get();
          columns.forEach((col, idx) => {
            row[col] = values[idx];
          });
          results.push(row);
        }
        stmt.free();
        return results;
      }
    };
  }

  exec(sql) {
    db.run(sql);
    saveDb();
  }

  run(sql) {
    db.run(sql);
    saveDb();
  }
}

const dbWrapper = new Database();

/**
 * Initialize database schema
 */
const initDB = async () => {
  try {
    await initializeDb();
    
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
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

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status)
    `);
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_suggestions_area ON suggestions(area)
    `);
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_suggestions_submitted_at ON suggestions(submitted_at)
    `);
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username)
    `);

    saveDb();
    console.log('Database initialized successfully');
    console.log('Database location: ' + dbPath);
    return true;
  } catch (error) {
    console.error('Database initialization error:', error.message);
    return false;
  }
};

module.exports = {
  db: dbWrapper,
  initDB
};
