const { db, initDB } = require('./config/database');
const bcrypt = require('bcryptjs');

async function runInitialization() {
  try {
    console.log('Initializing database...');

    // Initialize database
    const initialized = await initDB();

    if (!initialized) {
      console.error('Database initialization failed');
      process.exit(1);
    }

    // Hash password for admin user
    const hashedPassword = bcrypt.hashSync('admin123', 10);

    // Check if admin user already exists
    const existingStmt = db.prepare('SELECT * FROM admins WHERE username = ?');
    const existingAdmin = existingStmt.get('admin');
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      // Insert default admin user
      const stmt = db.prepare(`
        INSERT INTO admins (username, password, email)
        VALUES (?, ?, ?)
      `);

      stmt.run('admin', hashedPassword, 'admin@college.edu');
      console.log('Admin user created successfully');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('Email: admin@college.edu');
    }

    // Display database statistics
    const totalSuggestionsStmt = db.prepare('SELECT COUNT(*) as count FROM suggestions');
    const totalSuggestionsResult = totalSuggestionsStmt.get();
    const totalSuggestions = totalSuggestionsResult ? totalSuggestionsResult.count : 0;

    const totalAdminsStmt = db.prepare('SELECT COUNT(*) as count FROM admins');
    const totalAdminsResult = totalAdminsStmt.get();
    const totalAdmins = totalAdminsResult ? totalAdminsResult.count : 0;

    console.log('\nDatabase Statistics:');
    console.log('Total Suggestions: ' + totalSuggestions);
    console.log('Total Admin Users: ' + totalAdmins);
    console.log('\nDatabase initialization completed');
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization error:', error.message);
    process.exit(1);
  }
}

runInitialization();
