// =====================================================
// MongoDB Initialization Script
// Run this to set up initial admin user
// =====================================================

// Connect to MongoDB and run these commands:

// Connect to the database
use suggestion_box

// Create admin user with hashed password "bhaya#69"
// Hash generated using bcryptjs at https://www.bcryptjs.com/
db.admins.insertOne({
  username: "bhaya",
  password: "$2a$10$...", // hashed password of "bhaya#69"
  email: "azmeer7400@gmail.com",
  createdAt: new Date()
});

// Verify insertion
db.admins.findOne({ username: "bhaya" });

// You can now login with:
// Username: bhaya
// Password: bhaya#69

// Create indexes for better performance
db.suggestions.createIndex({ submittedAt: -1 });
db.suggestions.createIndex({ area: 1 });
db.suggestions.createIndex({ status: 1 });

// View all admins
db.admins.find();

// View all suggestions count
db.suggestions.countDocuments();
