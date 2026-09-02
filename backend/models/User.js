const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['host', 'partner'], default: 'partner', required: true },
<<<<<<< HEAD
  studentId: { type: String }, 
  phoneNumber: { type: String, default: '' },
=======
  studentId: { type: String }, // Useful for university verification
  phoneNumber: { type: String, default: '' }, // Mobile Number (required for hosts at registration)
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
  gender: { type: String, default: '' },
  dob: { type: String, default: '' },
  college: { type: String, default: 'Marwadi University' },
  bio: { type: String, default: '', maxlength: 300 },
<<<<<<< HEAD
  avatarUrl: { type: String, default: '' },
=======
  avatarUrl: { type: String, default: '' }, // Profile Photo
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
  emergencyContact: {
    name: { type: String, default: '' },
    phoneNumber: { type: String, default: '' }
  },
<<<<<<< HEAD
  vehicle: {
    number: { type: String, default: '' },   
    type: { type: String, default: '' },
    model: { type: String, default: '' },
    color: { type: String, default: '' }
  },
  licenseVerified: { type: Boolean, default: false }, 
  rating: { type: Number, default: 5, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
=======
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
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
  bookedRides: [{
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
    bookedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['booked', 'cancelled', 'completed'], default: 'booked' }
  }]
});

<<<<<<< HEAD
module.exports = mongoose.model('User', UserSchema);
=======
module.exports = mongoose.model('User', UserSchema);
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
