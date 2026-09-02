const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

// connect to the db, then start listening

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected to coroute DB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn("WARNING: MONGO_URI is missing in .env file");
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
