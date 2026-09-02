const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Ride = require('../models/Ride');

<<<<<<< HEAD
=======
// GET /api/users/profile
// Get current user's profile
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

<<<<<<< HEAD
=======
// PUT /api/users/profile
// Update current user's profile
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { name, phoneNumber, gender, dob, studentId, college, bio, avatarUrl, emergencyContact, vehicle } = req.body;

<<<<<<< HEAD
=======
    // ── Input Validation ──
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    const updateFields = {};

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 50) {
        return res.status(400).json({ message: 'Name must be between 2 and 50 characters.' });
      }
      updateFields.name = trimmedName;
    }

    if (phoneNumber !== undefined) {
      const trimmedPhone = phoneNumber.trim();
      if (trimmedPhone && !/^\+?[\d\s-]{7,15}$/.test(trimmedPhone)) {
        return res.status(400).json({ message: 'Please provide a valid phone number.' });
      }
      updateFields.phoneNumber = trimmedPhone;
    }

    if (gender !== undefined) {
      const validGenders = ['Male', 'Female', 'Other', ''];
      if (!validGenders.includes(gender)) {
        return res.status(400).json({ message: 'Gender must be Male, Female, or Other.' });
      }
      updateFields.gender = gender;
    }

    if (dob !== undefined) updateFields.dob = dob;
    if (studentId !== undefined) updateFields.studentId = studentId;
    if (college !== undefined) updateFields.college = college.trim();
    if (bio !== undefined) updateFields.bio = bio.trim().slice(0, 300);
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;
    if (emergencyContact !== undefined) {
      updateFields.emergencyContact = {
        name: (emergencyContact.name || '').trim(),
        phoneNumber: (emergencyContact.phoneNumber || '').trim()
      };
    }

<<<<<<< HEAD
=======
    // Vehicle Details — Ride Host profile (Section 2 / 11)
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    if (vehicle !== undefined) {
      if (req.user.role === 'host' && !(vehicle.number || '').trim()) {
        return res.status(400).json({ message: 'Vehicle number is required for Ride Hosts.' });
      }
      updateFields.vehicle = {
        number: (vehicle.number || '').trim(),
        type: (vehicle.type || '').trim(),
        model: (vehicle.model || '').trim(),
        color: (vehicle.color || '').trim()
      };
    }
<<<<<<< HEAD

=======
    
    // Find and update user
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
<<<<<<< HEAD

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

=======
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    next(err);
  }
});

<<<<<<< HEAD
router.get('/history', auth, async (req, res, next) => {
  try {
    const offeredRides = await Ride.find({ creator: req.user.userId })
      .sort({ departureTime: -1 })
      .populate('passengers.userId', 'name phoneNumber');

=======
// GET /api/users/history
// Get user's ride history (offered rides and booked rides)
router.get('/history', auth, async (req, res, next) => {
  try {
    // 1. Fetch rides offered by the user (with passenger details)
    const offeredRides = await Ride.find({ creator: req.user.userId })
      .sort({ departureTime: -1 })
      .populate('passengers.userId', 'name phoneNumber');
    
    // 2. Fetch the user's booked rides
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    const user = await User.findById(req.user.userId).populate('bookedRides.rideId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
<<<<<<< HEAD

=======
    
    // Some rideIds might be null if a ride was deleted, so we filter them out
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    const bookedRides = user.bookedRides
      .filter(booking => booking.rideId)
      .map(booking => ({
        ...booking.rideId.toObject(),
        bookedAt: booking.bookedAt
      }))
      .sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));

    res.json({
      offeredRides,
      bookedRides
    });
  } catch (err) {
    next(err);
  }
});

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
