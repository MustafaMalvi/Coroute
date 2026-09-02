const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['host', 'partner'], default: 'partner', required: true },
  studentId: { type: String }, 
  phoneNumber: { type: String, default: '' },
  gender: { type: String, default: '' },
  dob: { type: String, default: '' },
  college: { type: String, default: 'Marwadi University' },
  bio: { type: String, default: '', maxlength: 300 },
  avatarUrl: { type: String, default: '' },
  emergencyContact: {
    name: { type: String, default: '' },
    phoneNumber: { type: String, default: '' }
  },
  vehicle: {
    number: { type: String, default: '' },   
    type: { type: String, default: '' },
    model: { type: String, default: '' },
    color: { type: String, default: '' }
  },
  licenseVerified: { type: Boolean, default: false }, 
  rating: { type: Number, default: 5, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  bookedRides: [{
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
    bookedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['booked', 'cancelled', 'completed'], default: 'booked' }
  }]
});

module.exports = mongoose.model('User', UserSchema);