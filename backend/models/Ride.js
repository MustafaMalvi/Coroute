const mongoose = require('mongoose');

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const RideSchema = new mongoose.Schema({
  // ── Core ──
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // hostId
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },

  // ── Ride Type ──
  rideType: { type: String, enum: ['one-time', 'recurring'], default: 'one-time', required: true },

  // One-Time Ride: a specific calendar date
  rideDate: { type: Date, default: null },

  // Recurring Ride: weekdays this ride repeats on
  repeatDays: { type: [String], enum: WEEKDAYS, default: [] },

  // Departure time. For one-time rides this is the full date+time of departure.
  // For recurring rides, only the time-of-day portion is meaningful — the ride
  // "occurs" at this clock time on every selected weekday.
  departureTime: { type: Date, required: true },

  availableSeats: { type: Number, default: 3 },
  totalSeats: { type: Number, default: 3 },
  pricePerSeat: { type: Number, required: true, default: 0 },
  notes: { type: String, default: '', maxlength: 300 },

  // Open, Full, Completed, Cancelled (permanently), Paused (recurring only)
  status: { type: String, enum: ['Open', 'Full', 'Completed', 'Cancelled', 'Paused'], default: 'Open' },

  womenOnly: { type: Boolean, default: false },

  // ── Vehicle info — auto-copied from the Host profile at creation time ──
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // points back to host (source of vehicle record)
  vehicleNumber: { type: String, default: '' },
  vehicleType: { type: String, default: '' },
  vehicleModel: { type: String, default: '' },
  vehicleColor: { type: String, default: '' },

  // ── Recurring ride management ──
  isPaused: { type: Boolean, default: false }, // Pause / Resume whole schedule
  // Specific calendar dates (YYYY-MM-DD) skipped for a recurring ride,
  // e.g. "Cancel Today's Ride" / "Cancel Tomorrow's Ride"
  skipDates: { type: [String], default: [] },
  // Per-date time overrides for a recurring ride, e.g. "Reschedule Today's Ride"
  // Map of 'YYYY-MM-DD' -> 'HH:mm'
  dateOverrides: { type: Map, of: String, default: {} },

  passengers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookedAt: { type: Date, default: Date.now },
    bookingType: { type: String, enum: ['single', 'recurring'], default: 'single' }
  }]
});

RideSchema.index({ creator: 1 });
RideSchema.index({ rideType: 1, repeatDays: 1 });

module.exports = mongoose.model('Ride', RideSchema);
module.exports.WEEKDAYS = WEEKDAYS;
