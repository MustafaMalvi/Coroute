const mongoose = require('mongoose');

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
