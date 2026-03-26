const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create/Connect to SQLite database file
const dbPath = path.join(dataDir, 'suggestions.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema with tables and indexes
 * Creates tables for admins and suggestions, and sets up performance indexes
 * @returns {boolean} Success status of initialization
 */
const initDB = () => {
  try {
    // Create admins table
    db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create suggestions table
    db.exec(`
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
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
      CREATE INDEX IF NOT EXISTS idx_suggestions_area ON suggestions(area);
      CREATE INDEX IF NOT EXISTS idx_suggestions_submitted_at ON suggestions(submitted_at);
      CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
    `);

    console.log('Database initialized successfully');
    console.log('Database location: ' + dbPath);
    return true;
  } catch (error) {
    console.error('Database initialization error:', error.message);
    return false;
  }
};

module.exports = {
  db,
  initDB
};
