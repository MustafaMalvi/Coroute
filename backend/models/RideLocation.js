const mongoose = require('mongoose');

// Live location, shared per-ride. A Host shares theirs so booked Partners can
// see the car coming; a Partner can share theirs back so the Host can spot
// them at the pickup point. Only one row per (ride, user) — every update
// just overwrites the last known position rather than logging a trail.
const RideLocationSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  accuracy: { type: Number, default: null },
  updatedAt: { type: Date, default: Date.now }
});

RideLocationSchema.index({ ride: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('RideLocation', RideLocationSchema);
