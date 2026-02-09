/**
 * Standardized response sender
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} status - "success" | "fail" | "error"
 * @param {string} message - Response message
 * @param {object} data - Response data
 */
module.exports = (res, statusCode, status, message, data = {}) => {
  res.status(statusCode).json({
    status,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};
