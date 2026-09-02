const mongoose = require('mongoose');

// A Ride Partner leaves this after a ride actually happens, rating the Host.
// Kept one per (ride, reviewer) — submitting again just edits the existing one
// rather than piling up duplicates.
const ReviewSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 300 },
  createdAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ ride: 1, reviewer: 1 }, { unique: true });
ReviewSchema.index({ host: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
