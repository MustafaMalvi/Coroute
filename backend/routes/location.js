const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const RideLocation = require('../models/RideLocation');

const STALE_MS = 2 * 60 * 1000;

function creatorId(ride) {
  return (ride.creator._id || ride.creator).toString();
}

async function getRideRole(ride, userId) {
  if (creatorId(ride) === userId) return 'host';
  const booking = await Booking.findOne({
    ride: ride._id,
    passenger: userId,
    bookingStatus: { $in: ['active', 'paused'] }
  });
  return booking ? 'partner' : null;
}

router.get('/:rideId', auth, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.rideId).populate('creator', 'name');
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });

    const role = await getRideRole(ride, req.user.userId);
    if (!role) return res.status(403).json({ message: "You're not part of this ride." });

    const cutoff = new Date(Date.now() - STALE_MS);
    let others;

    if (role === 'host') {
      others = await RideLocation.find({
        ride: ride._id,
        user: { $ne: req.user.userId },
        updatedAt: { $gte: cutoff }
      }).populate('user', 'name');
    } else {
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

router.delete('/:rideId', auth, async (req, res, next) => {
  try {
    await RideLocation.deleteOne({ ride: req.params.rideId, user: req.user.userId });
    res.json({ message: 'Stopped sharing your location.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
