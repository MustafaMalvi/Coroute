const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const RideLocation = require('../models/RideLocation');

// anything older than this is treated as "no longer sharing"
const STALE_MS = 2 * 60 * 1000;

// works whether ride.creator is a raw ObjectId or a populated user doc
function creatorId(ride) {
  return (ride.creator._id || ride.creator).toString();
}

// figures out whether the current user is allowed anywhere near this ride's
// location data, and if so, in which capacity
async function getRideRole(ride, userId) {
  if (creatorId(ride) === userId) return 'host';
  const booking = await Booking.findOne({
    ride: ride._id,
    passenger: userId,
    bookingStatus: { $in: ['active', 'paused'] }
  });
  return booking ? 'partner' : null;
}

// GET /api/location/:rideId — see who's currently sharing on this ride
router.get('/:rideId', auth, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.rideId).populate('creator', 'name');
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });

    const role = await getRideRole(ride, req.user.userId);
    if (!role) return res.status(403).json({ message: "You're not part of this ride." });

    const cutoff = new Date(Date.now() - STALE_MS);
    let others;

    if (role === 'host') {
      // the host gets everyone currently sharing — could be several partners
      others = await RideLocation.find({
        ride: ride._id,
        user: { $ne: req.user.userId },
        updatedAt: { $gte: cutoff }
      }).populate('user', 'name');
    } else {
      // a partner only ever sees the host's pin
      const hostLoc = await RideLocation.findOne({
        ride: ride._id,
        user: ride.creator._id,
        updatedAt: { $gte: cutoff }
      }).populate('user', 'name');
      others = hostLoc ? [hostLoc] : [];
    }

    const mine = await RideLocation.findOne({ ride: ride._id, user: req.user.userId });

    res.json({
      role,
      sharing: !!mine,
      others: others.map(o => ({
        userId: o.user._id,
        name: o.user.name,
        lat: o.lat,
        lng: o.lng,
        accuracy: o.accuracy,
        updatedAt: o.updatedAt
      }))
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/location/:rideId — push my current position
router.put('/:rideId', auth, async (req, res, next) => {
  try {
    const { lat, lng, accuracy } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'lat and lng are required.' });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });

    const role = await getRideRole(ride, req.user.userId);
    if (!role) return res.status(403).json({ message: "You're not part of this ride." });

    const location = await RideLocation.findOneAndUpdate(
      { ride: ride._id, user: req.user.userId },
      { lat, lng, accuracy: accuracy ?? null, updatedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ location });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/location/:rideId — stop sharing
router.delete('/:rideId', auth, async (req, res, next) => {
  try {
    await RideLocation.deleteOne({ ride: req.params.rideId, user: req.user.userId });
    res.json({ message: 'Stopped sharing your location.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
