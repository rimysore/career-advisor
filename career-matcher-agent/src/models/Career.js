const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  requiredSkills: [String],
  timeline: String,
  salaryRange: String,
  learningResources: [String],
  commonTransitions: [String],
  jobGrowth: String,
  source: {
    type: String,
    default: 'user_query'
  },
  // Vector embedding for semantic search
  embedding: {
    type: [Number],
    default: []
  },
  addedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

CareerSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Career', CareerSchema);
