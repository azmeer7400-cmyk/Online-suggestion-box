const { db, initDB } = require('./config/database');
const bcrypt = require('bcryptjs');

console.log('Initializing database...');

// Initialize database
const initialized = initDB();

if (!initialized) {
  console.error('Database initialization failed');
  process.exit(1);
}

try {
  // Hash password for admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);

  // Check if admin user already exists
  const existingAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
  
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
  const totalSuggestions = db.prepare('SELECT COUNT(*) as count FROM suggestions').get().count;
  const totalAdmins = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;

  console.log('\nDatabase Statistics:');
  console.log('Total Suggestions: ' + totalSuggestions);
  console.log('Total Admin Users: ' + totalAdmins);
  console.log('\nDatabase initialization completed');
} catch (error) {
  console.error('Database initialization error:', error.message);
  process.exit(1);
}
