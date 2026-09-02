const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  bookingType: { type: String, enum: ['single', 'recurring'], default: 'single', required: true },
  bookingStatus: { type: String, enum: ['active', 'paused', 'cancelled', 'completed'], default: 'active' },

  bookingDate: { type: String, default: null },

  skipDates: { type: [String], default: [] },

  cancelledFrom: { type: String, default: null },

  createdAt: { type: Date, default: Date.now }
});

BookingSchema.index({ ride: 1, passenger: 1 });
BookingSchema.index({ passenger: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
