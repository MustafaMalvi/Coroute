const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
<<<<<<< HEAD

  const token = req.header('Authorization');

=======
  // Get token from header
  const token = req.header('Authorization');

  // Check if no token
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

<<<<<<< HEAD
  try {
    const bearer = token.split(' ')[1] || token;
    const decoded = jwt.verify(bearer, process.env.JWT_SECRET);
    req.user = decoded; 
=======
  // Verify token
  try {
    const bearer = token.split(' ')[1] || token;
    const decoded = jwt.verify(bearer, process.env.JWT_SECRET);
    req.user = decoded; // { userId: ... }
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
