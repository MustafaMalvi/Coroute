/**
 * Custom MongoDB sanitization middleware (Express 5 compatible).
 * Recursively removes any keys starting with '$' from objects
 * to prevent NoSQL injection attacks (e.g., { "$gt": "" }).
 */

function sanitizeObject(obj) {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
}

module.exports = function mongoSanitize(req, res, next) {
  if (req.body) sanitizeObject(req.body);
  // req.query and req.params are read-only in Express 5,
  // but body is the main injection vector for JSON APIs.
  next();
};
