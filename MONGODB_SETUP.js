// =====================================================
// MongoDB Initialization Script
// Run this to set up initial admin user
// =====================================================

// Connect to MongoDB and run these commands:

// Connect to the database
use suggestion_box

// Create admin user with hashed password "admin123"
// Hash generated using bcryptjs at https://www.bcryptjs.com/
db.admins.insertOne({
  username: "admin",
  password: "$2a$10$QiZb9F3tPL9X8W5J2kB3m.9YX8drPy0qZOQr8t.K3qUvKvqC8GdGS",
  email: "admin@college.edu",
  createdAt: new Date()
});

// Verify insertion
db.admins.findOne({ username: "admin" });

// You can now login with:
// Username: admin
// Password: admin123

// Create indexes for better performance
db.suggestions.createIndex({ submittedAt: -1 });
db.suggestions.createIndex({ area: 1 });
db.suggestions.createIndex({ status: 1 });

// View all admins
db.admins.find();

// View all suggestions count
db.suggestions.countDocuments();
