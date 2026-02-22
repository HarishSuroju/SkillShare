const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerNumber: {
    type: String,
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  bookingTime: {
    type: Date,
    default: Date.now
  },
  responseTime: {
    type: Number // minutes
  },
  rating: {
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);