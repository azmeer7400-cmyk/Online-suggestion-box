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
    const hashedPassword = bcrypt.hashSync('bhaya#69', 10);

    // Check if admin user already exists
    const existingStmt = db.prepare('SELECT * FROM admins WHERE username = ?');
    const existingAdmin = existingStmt.get('bhaya');
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Username: bhaya');
      console.log('Password: bhaya#69');
    } else {
      // Insert default admin user
      const stmt = db.prepare(`
        INSERT INTO admins (username, password, email)
        VALUES (?, ?, ?)
      `);

      stmt.run('bhaya', hashedPassword, 'azmeer7400@gmail.com');
      console.log('Admin user created successfully');
      console.log('Username: bhaya');
      console.log('Password: bhaya#69');
      console.log('Email: azmeer7400@gmail.com');
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
