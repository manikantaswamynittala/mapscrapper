const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
  },
  website: {
    type: String,
  },
  email: {
    type: String,
  },
  rating: {
    type: Number,
  },
  totalReviews: {
    type: Number,
  },
  category: {
    type: String,
  },
  searchKeyword: {
    type: String,
    required: true,
  },
  searchLocation: {
    type: String,
    required: true,
  },
  googleMapsUrl: {
    type: String,
  },
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
businessSchema.index({ searchKeyword: 1, searchLocation: 1 });
businessSchema.index({ name: 1 });
businessSchema.index({ name: 1, searchLocation: 1 }, { unique: true });

module.exports = mongoose.model('Business', businessSchema);