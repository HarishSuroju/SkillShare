const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  whatsappNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    trim: true,
    default: "General"
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },
  rating: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 1
  },
  responseTimeAvg: {
    type: Number,
    default: 5
  },
  availability: {
    type: String,
    enum: ["available", "unavailable"],
    default: "available"
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// GEO INDEX
providerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Provider', providerSchema);
