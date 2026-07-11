const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['host', 'partner'], default: 'partner', required: true },
  studentId: { type: String }, // Useful for university verification
  phoneNumber: { type: String, default: '' }, // Mobile Number (required for hosts at registration)
  gender: { type: String, default: '' },
  dob: { type: String, default: '' },
  college: { type: String, default: 'Marwadi University' },
  bio: { type: String, default: '', maxlength: 300 },
  avatarUrl: { type: String, default: '' }, // Profile Photo
  emergencyContact: {
    name: { type: String, default: '' },
    phoneNumber: { type: String, default: '' }
  },
  // ── Vehicle Details (Ride Host only) ──
  // Vehicle information now lives on the Host profile instead of being
  // re-entered on every ride. Automatically applied whenever a host
  // publishes a new ride.
  vehicle: {
    number: { type: String, default: '' },   // Required for hosts
    type: { type: String, default: '' },      // e.g., Car, Auto, Bike
    model: { type: String, default: '' },     // e.g., Maruti Swift
    color: { type: String, default: '' }
  },
  licenseVerified: { type: Boolean, default: false }, // License Verification (optional)
  rating: { type: Number, default: 5, min: 0, max: 5 },
  bookedRides: [{
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
    bookedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['booked', 'cancelled', 'completed'], default: 'booked' }
  }]
});

module.exports = mongoose.model('User', UserSchema);
