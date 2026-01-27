const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
  question: String,
  answer: String,
  careersUsed: [String],
  skillsLearned: [String],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Query', QuerySchema);
