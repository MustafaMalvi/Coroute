const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('./middleware/sanitize');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
// ──────────── Security Middleware ────────────

// Allow React frontend to connect
app.use(cors({ 
  origin: process.env.FRONTEND_URL, // Cannot be '*' if using credentials
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set security HTTP headers (disabled CORP for CORS)
app.use(helmet({ crossOriginResourcePolicy: false }));

// Parse JSON with a 10kb size limit to prevent DoS attacks
app.use(express.json({ limit: '10kb' }));

// Sanitize user input to prevent NoSQL injection attacks ($gt, $ne, etc.)
app.use(mongoSanitize);

// Rate Limiter — max 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use(globalLimiter);

// Stricter rate limit for auth routes (login/register) — max 10 per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login/register attempts. Please try again after 15 minutes.' }
});

// ──────────── Routes ────────────

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/rides', require('./routes/rides'));

// Basic Test Route
app.get('/', (req, res) => {
  res.send('coroute API is running...');
});

// ──────────── Error Handler (must be after routes) ────────────
app.use(errorHandler);

// ──────────── Database & Server Start ────────────

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected to coroute DB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn("WARNING: MONGO_URI is missing in .env file");
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
