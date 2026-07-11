const mongoose = require('mongoose');

// Booking model — tracks a Ride Partner's booking on a Ride.
// Supports both one-time ("single") bookings and standing ("recurring")
// bookings that apply to every future occurrence of a recurring ride
// until paused or cancelled.
const BookingSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  bookingType: { type: String, enum: ['single', 'recurring'], default: 'single', required: true },
  bookingStatus: { type: String, enum: ['active', 'paused', 'cancelled', 'completed'], default: 'active' },

  // For a 'single' booking on a recurring ride, which calendar date (YYYY-MM-DD)
  // it applies to. Null for one-time rides (the ride's own date applies) and
  // for 'recurring' bookings (applies to every occurrence).
  bookingDate: { type: String, default: null },

  // For 'recurring' bookings: specific dates (YYYY-MM-DD) skipped one-off,
  // e.g. "Cancel Today's Ride" while keeping the standing booking active.
  skipDates: { type: [String], default: [] },

  // For 'recurring' bookings: if the partner clicks "Cancel Future Bookings",
  // we stop generating occurrences after this date (inclusive-exclusive handled
  // in route logic) instead of destroying booking history.
  cancelledFrom: { type: String, default: null },

  createdAt: { type: Date, default: Date.now }
});

BookingSchema.index({ ride: 1, passenger: 1 });
BookingSchema.index({ passenger: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
