<<<<<<< HEAD
=======
// Usage: router.post('/', auth, requireRole('host'), handler)
// Must run after the `auth` middleware, which attaches req.user = { userId, role }
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
module.exports = function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `This action is restricted to: ${roles.join(', ')}.`
      });
    }
    next();
  };
};
