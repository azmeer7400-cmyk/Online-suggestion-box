const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Use temp directory that's more likely to be writable
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory:', dataDir);
  } catch (e) {
    console.error('Failed to create data directory:', e.message);
  }
}

const dbPath = path.join(dataDir, 'suggestions.db');
let SQL;
let db;

/**
 * Initialize SQL.js and load or create database
 */
const initializeDb = async () => {
  SQL = await initSqlJs();
  
  console.log('Attempting to load database from:', dbPath);
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    try {
      const fileBuffer = fs.readFileSync(dbPath);
      console.log('Loaded existing database file, size:', fileBuffer.length, 'bytes');
      db = new SQL.Database(fileBuffer);
    } catch (e) {
      console.error('Failed to load existing database:', e.message);
      db = new SQL.Database();
    }
  } else {
    console.log('No existing database found, creating new one');
    db = new SQL.Database();
  }
  
  return db;
};

/**
 * Save database to disk
 */
const saveDb = () => {
  if (db) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
      console.log('Database saved successfully, size:', buffer.length, 'bytes');
    } catch (e) {
      console.error('ERROR: Failed to save database:', e.message);
      console.error('Database path:', dbPath);
    }
  }
};

/**
 * Wrapper class to provide consistent API
 */
class Database {
  prepare(sql) {
    const self = this;
    return {
      run: (...params) => {
        try {
          const stmt = db.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params);
          }
          stmt.step();
          stmt.free();
          
          // Get last insert ID
          let lastID = null;
          try {
            const idStmt = db.prepare("SELECT last_insert_rowid() as id");
            if (idStmt.step()) {
              lastID = idStmt.get()[0];
            }
            idStmt.free();
          } catch (e) {
            lastID = null;
          }
          
          console.log('Database insert executed, lastID:', lastID, 'saving...');
          saveDb();
          console.log('Database saved after insert');
          return { lastID, changes: 1 };
        } catch (error) {
          console.error('Database run error:', error.message, 'SQL:', sql.substring(0, 100));
          throw error;
        }
      },
      get: (...params) => {
        try {
          const stmt = db.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params);
          }
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
        } catch (error) {
          console.error('Database get error:', error.message, 'SQL:', sql.substring(0, 100));
          throw error;
        }
      },
      all: (...params) => {
        try {
          const stmt = db.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params);
          }
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
          console.log('Database query returned', results.length, 'rows');
          return results;
        } catch (error) {
          console.error('Database all error:', error.message, 'SQL:', sql.substring(0, 100));
          throw error;
        }
      }
    };
  }

  exec(sql) {
    try {
      db.run(sql);
      saveDb();
    } catch (error) {
      console.error('Database exec error:', error, 'SQL:', sql);
      throw error;
    }
  }

  run(sql) {
    try {
      db.run(sql);
      saveDb();
    } catch (error) {
      console.error('Database run error:', error, 'SQL:', sql);
      throw error;
    }
  }
}

/**
 * Generate unique 6-8 digit tracking ID
 */
const generateTrackingId = () => {
  // Generate random 6-8 digit number
  const min = 100000; // 6 digits
  const max = 99999999; // 8 digits
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Get unique tracking ID (ensure it doesn't exist in database)
 */
const getUniqueTrackingId = () => {
  let trackingId;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    trackingId = generateTrackingId();
    
    // Check if this tracking ID already exists
    try {
      const checkStmt = db.prepare('SELECT * FROM suggestions WHERE tracking_id = ?');
      const exists = checkStmt.get(trackingId);
      
      if (!exists) {
        return trackingId;
      }
    } catch (e) {
      // Table might not exist yet on first run
      return trackingId;
    }
    
    attempts++;
  }

  throw new Error('Unable to generate unique tracking ID after 10 attempts');
};

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
        tracking_id TEXT UNIQUE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        area TEXT NOT NULL,
        floor INTEGER,
        wing TEXT NOT NULL,
        image_path TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'Pending',
        admin_response TEXT,
        response_date DATETIME
      )
    `);

    // Migrate existing database: add tracking_id column if it doesn't exist
    try {
      const checkColumn = db.prepare(`PRAGMA table_info(suggestions)`);
      const columns = checkColumn.all();
      const hasTrackingId = columns.some(col => col.name === 'tracking_id');
      
      if (!hasTrackingId) {
        console.log('Migrating database: adding tracking_id column...');
        try {
          db.run(`ALTER TABLE suggestions ADD COLUMN tracking_id TEXT UNIQUE`);
          saveDb();
          
          // Generate tracking IDs for existing suggestions with simple sequential IDs
          const getAllStmt = db.prepare(`SELECT id FROM suggestions WHERE tracking_id IS NULL`);
          const suggestions = getAllStmt.all();
          
          if (suggestions && suggestions.length > 0) {
            const updateStmt = db.prepare(`UPDATE suggestions SET tracking_id = ? WHERE id = ?`);
            suggestions.forEach((row, index) => {
              // Generate 6-8 digit ID: 100000 + index to ensure uniqueness
              const trackingId = (100000 + index).toString();
              updateStmt.run(trackingId, row.id);
            });
            saveDb();
            console.log(`Generated tracking IDs for ${suggestions.length} existing suggestions`);
          }
        } catch (migrationError) {
          console.log('Migration step failed (this may be normal):', migrationError.message);
        }
      }
    } catch (e) {
      console.log('Column check skipped (table may not exist yet):', e.message);
    }

    try {
      db.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status)`);
    } catch (e) {}
    try {
      db.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_area ON suggestions(area)`);
    } catch (e) {}
    try {
      db.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_submitted_at ON suggestions(submitted_at)`);
    } catch (e) {}
    try {
      db.run(`CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username)`);
    } catch (e) {}

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
  initDB,
  generateTrackingId,
  getUniqueTrackingId
};
