const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { db } = require('../config/database');

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Configure multer for file upload handling
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'suggestion-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter
});

/**
 * Format database row to API response format
 */
const formatSuggestion = (row) => ({
  _id: row.id,
  id: row.id,
  title: row.title,
  message: row.message,
  area: row.area,
  floor: row.floor,
  wing: row.wing,
  imagePath: row.image_path,
  submittedAt: row.submitted_at,
  status: row.status,
  adminResponse: row.admin_response,
  responseDate: row.response_date
});

/**
 * POST /api/suggestions/submit
 * Submit a new suggestion with optional file attachment
 */
router.post('/submit', upload.single('image'), async (req, res) => {
  try {
    const { title, message, area, floor, wing } = req.body;

    // Validate required fields
    if (!title || !message || !area || !wing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields missing' 
      });
    }

    // Validate field lengths
    if (title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 5 characters'
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO suggestions (title, message, area, floor, wing, image_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.run(
      title.trim(),
      message.trim(),
      area,
      floor ? parseInt(floor) : null,
      wing,
      req.file ? '/uploads/' + req.file.filename : null
    );

    res.status(201).json({ 
      success: true, 
      message: 'Suggestion submitted successfully',
      suggestionId: result.lastID
    });
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while processing request' 
    });
  }
});

/**
 * GET /api/suggestions/all
 * Fetch all suggestions
 */
router.get('/all', async (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM suggestions 
      ORDER BY submitted_at DESC
    `);
    const suggestions = await stmt.all();
    res.json(suggestions.map(formatSuggestion));
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Server error while fetching suggestions' });
  }
});

/**
 * GET /api/suggestions/status/:status
 * Fetch suggestions by status
 */
router.get('/status/:status', async (req, res) => {
  try {
    const validStatuses = ['Pending', 'Under Review', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(req.params.status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const stmt = db.prepare(`
      SELECT * FROM suggestions 
      WHERE status = ?
      ORDER BY submitted_at DESC
    `);
    const suggestions = await stmt.all(req.params.status);
    res.json(suggestions.map(formatSuggestion));
  } catch (error) {
    console.error('Error fetching suggestions by status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/suggestions/area/:area
 * Fetch suggestions by area
 */
router.get('/area/:area', async (req, res) => {
  try {
    const validAreas = ['Library', 'Cafeteria', 'Classroom', 'Hostel', 'Laboratory', 'Sports', 'Other'];
    if (!validAreas.includes(req.params.area)) {
      return res.status(400).json({ message: 'Invalid area' });
    }

    const stmt = db.prepare(`
      SELECT * FROM suggestions 
      WHERE area = ?
      ORDER BY submitted_at DESC
    `);
    const suggestions = await stmt.all(req.params.area);
    res.json(suggestions.map(formatSuggestion));
  } catch (error) {
    console.error('Error fetching suggestions by area:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/suggestions/update/:id
 * Update suggestion status and admin response
 */
router.put('/update/:id', async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const validStatuses = ['Pending', 'Under Review', 'Resolved', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const stmt = db.prepare(`
      UPDATE suggestions 
      SET status = ?, admin_response = ?, response_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = await stmt.run(status, adminResponse || null, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    const getSuggestion = db.prepare('SELECT * FROM suggestions WHERE id = ?');
    const suggestion = await getSuggestion.get(req.params.id);

    res.json({ 
      success: true, 
      message: 'Suggestion updated',
      suggestion: formatSuggestion(suggestion)
    });
  } catch (error) {
    console.error('Error updating suggestion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/suggestions/delete/:id
 * Delete a suggestion
 */
router.delete('/delete/:id', async (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM suggestions WHERE id = ?');
    const result = await stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    res.json({ 
      success: true, 
      message: 'Suggestion deleted' 
    });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/suggestions/stats
 * Get suggestion statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM suggestions');
    const totalResult = await totalStmt.get();
    const total = totalResult.count;
    
    const pendingStmt = db.prepare('SELECT COUNT(*) as count FROM suggestions WHERE status = ?');
    const pendingResult = await pendingStmt.get('Pending');
    const pending = pendingResult.count;
    
    const underReviewStmt = db.prepare('SELECT COUNT(*) as count FROM suggestions WHERE status = ?');
    const underReviewResult = await underReviewStmt.get('Under Review');
    const underReview = underReviewResult.count;
    
    const resolvedStmt = db.prepare('SELECT COUNT(*) as count FROM suggestions WHERE status = ?');
    const resolvedResult = await resolvedStmt.get('Resolved');
    const resolved = resolvedResult.count;
    
    const rejectedStmt = db.prepare('SELECT COUNT(*) as count FROM suggestions WHERE status = ?');
    const rejectedResult = await rejectedStmt.get('Rejected');
    const rejected = rejectedResult.count;

    res.json({
      total,
      pending,
      underReview,
      resolved,
      rejected
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
