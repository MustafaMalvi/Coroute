const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Ride = require('../models/Ride');

// GET /api/users/profile
// Get current user's profile
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

// PUT /api/users/profile
// Update current user's profile
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { name, phoneNumber, gender, dob, studentId, college, bio, avatarUrl, emergencyContact, vehicle } = req.body;

    // ── Input Validation ──
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

    // Vehicle Details — Ride Host profile (Section 2 / 11)
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
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/history
// Get user's ride history (offered rides and booked rides)
router.get('/history', auth, async (req, res, next) => {
  try {
    // 1. Fetch rides offered by the user (with passenger details)
    const offeredRides = await Ride.find({ creator: req.user.userId })
      .sort({ departureTime: -1 })
      .populate('passengers.userId', 'name phoneNumber');
    
    // 2. Fetch the user's booked rides
    const user = await User.findById(req.user.userId).populate('bookedRides.rideId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Some rideIds might be null if a ride was deleted, so we filter them out
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

module.exports = router;
