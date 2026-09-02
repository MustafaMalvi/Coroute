const mongoose = require('mongoose');

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const RideSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // hostId
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },

  rideType: { type: String, enum: ['one-time', 'recurring'], default: 'one-time', required: true },

  rideDate: { type: Date, default: null },

  repeatDays: { type: [String], enum: WEEKDAYS, default: [] },

  departureTime: { type: Date, required: true },

  availableSeats: { type: Number, default: 3 },
  totalSeats: { type: Number, default: 3 },
  pricePerSeat: { type: Number, required: true, default: 0 },
  notes: { type: String, default: '', maxlength: 300 },

  status: { type: String, enum: ['Open', 'Full', 'Completed', 'Cancelled', 'Paused'], default: 'Open' },

  womenOnly: { type: Boolean, default: false },

  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  vehicleNumber: { type: String, default: '' },
  vehicleType: { type: String, default: '' },
  vehicleModel: { type: String, default: '' },
  vehicleColor: { type: String, default: '' },

  isPaused: { type: Boolean, default: false }, 
  skipDates: { type: [String], default: [] },
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
