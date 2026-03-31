const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../config/database');

/**
 * Middleware to check if user is authenticated
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

/**
 * POST /api/admin/login
 * Authenticate admin user
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password required' 
      });
    }

    const stmt = db.prepare('SELECT * FROM admins WHERE username = ?');
    const admin = await stmt.get(username);

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    req.session.adminId = admin.id;
    res.json({ 
      success: true, 
      message: 'Login successful',
      adminId: admin.id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/admin/logout
 * Destroy admin session
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout error' });
    }
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

/**
 * GET /api/admin/check-auth
 * Check if user is authenticated
 */
router.get('/check-auth', (req, res) => {
  if (req.session && req.session.adminId) {
    res.json({ authenticated: true, adminId: req.session.adminId });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
