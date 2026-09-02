const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');

async function recalcHostRating(hostId) {
  const [stats] = await Review.aggregate([
    { $match: { host: hostId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const avg = stats ? Math.round(stats.avg * 10) / 10 : 5;
  const count = stats ? stats.count : 0;
  await User.findByIdAndUpdate(hostId, { rating: avg, reviewCount: count });
}

router.get('/host/:hostId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ host: req.params.hostId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('reviewer', 'name avatarUrl')
      .populate('ride', 'pickupLocation dropoffLocation departureTime');
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

router.get('/ride/:rideId/mine', auth, requireRole('partner'), async (req, res, next) => {
  try {
    const review = await Review.findOne({ ride: req.params.rideId, reviewer: req.user.userId });
    res.json({ review });
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, requireRole('partner'), async (req, res, next) => {
  try {
    const { rideId, rating, comment } = req.body;

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5.' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });

    const booking = await Booking.findOne({ ride: rideId, passenger: req.user.userId });
    if (!booking || booking.bookingStatus === 'cancelled') {
      return res.status(403).json({ message: 'You can only review rides you actually booked.' });
    }
    if (booking.bookingType === 'single' && new Date(ride.departureTime) > new Date()) {
      return res.status(400).json({ message: "You can review this ride once it's actually happened." });
    }

    const trimmedComment = (comment || '').trim().slice(0, 300);

    let review = await Review.findOne({ ride: rideId, reviewer: req.user.userId });
    if (review) {
      review.rating = numericRating;
      review.comment = trimmedComment;
      await review.save();
    } else {
      review = await Review.create({
        ride: rideId,
        host: ride.creator,
        reviewer: req.user.userId,
        rating: numericRating,
        comment: trimmedComment
      });
    }

    await recalcHostRating(ride.creator);

    res.status(201).json({ message: 'Thanks for the feedback!', review });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
