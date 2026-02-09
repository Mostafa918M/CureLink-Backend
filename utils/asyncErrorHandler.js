/**
 * Async error handler wrapper
 * Catches errors in async route handlers and passes them to error middleware
 */
module.exports = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    if (res.headersSent) return next(err);
    next(err);
  }
};
