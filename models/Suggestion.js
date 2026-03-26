const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: String,
    enum: ['Library', 'Cafeteria', 'Classroom', 'Hostel', 'Laboratory', 'Sports', 'Other'],
    required: true
  },
  floor: {
    type: Number,
    min: 0,
    max: 10
  },
  wing: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'N/A'],
    required: true
  },
  imagePath: {
    type: String,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  adminResponse: {
    type: String,
    default: null
  },
  responseDate: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Suggestion', SuggestionSchema);
