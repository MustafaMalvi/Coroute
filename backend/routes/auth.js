const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// ──────────── Validation Helpers ────────────

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null; // valid
};

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId, gender, role, phoneNumber, vehicle } = req.body;

    // ── Input Validation ──
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (!role || !['host', 'partner'].includes(role)) {
      return res.status(400).json({ message: 'Please choose a valid role: Ride Host or Ride Partner.' });
    }

    // Ride Hosts must provide their mobile number and vehicle number at
    // registration — this is captured once and reused for every ride
    // they publish (see: Ride Host profile / vehicle details).
    let trimmedPhone = (phoneNumber || '').trim();
    let vehicleData = { number: '', type: '', model: '', color: '' };

    if (role === 'host') {
      if (!trimmedPhone) {
        return res.status(400).json({ message: 'Mobile number is required for Ride Hosts.' });
      }
      if (!/^\+?[\d\s-]{7,15}$/.test(trimmedPhone)) {
        return res.status(400).json({ message: 'Please provide a valid mobile number.' });
      }

      const vehicleNumber = (vehicle?.number || '').trim();
      if (!vehicleNumber) {
        return res.status(400).json({ message: 'Vehicle number is required for Ride Hosts.' });
      }

      vehicleData = {
        number: vehicleNumber,
        type: (vehicle?.type || '').trim(),
        model: (vehicle?.model || '').trim(),
        color: (vehicle?.color || '').trim()
      };
    } else if (trimmedPhone && !/^\+?[\d\s-]{7,15}$/.test(trimmedPhone)) {
      return res.status(400).json({ message: 'Please provide a valid mobile number.' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters.' });
    }

    if (!validateEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Check email domain
    if (!trimmedEmail.endsWith('@marwadiuniversity.ac.in')) {
      return res.status(400).json({ message: 'Registration is exclusively for students with an @marwadiuniversity.ac.in email address.' });
    }

    // Password strength check
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Check if user exists
    let user = await User.findOne({ email: trimmedEmail });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      studentId,
      gender,
      role,
      phoneNumber: trimmedPhone,
      vehicle: vehicleData
    });
    await user.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Input Validation ──
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) return res.status(404).json({ message: 'User Not Found' });

    // Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, gender: user.gender, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;