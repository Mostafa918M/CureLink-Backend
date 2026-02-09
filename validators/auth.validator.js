const ApiError = require('../utils/apiError');
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(errors.array()[0].msg, 400));
  }
  next();
};

const authValidator = {
  register: [
    body('firstName')
      .notEmpty().withMessage('First name is required')
      .isLength({ max: 50 }).withMessage('First name cannot be more than 50 characters'),
    body('lastName')
      .notEmpty().withMessage('Last name is required')
      .isLength({ max: 50 }).withMessage('Last name cannot be more than 50 characters'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phone')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^(010|011|012|015)\d{8}$/).withMessage('Invalid phone number format. Must be a valid Egyptian number (010, 011, 012, 015 followed by 8 digits)'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role')
      .optional()
      .isIn(['donor', 'admin', 'superadmin']).withMessage('Invalid role'),
    handleValidationErrors
  ],

  login: [
    body('identifier')
      .notEmpty().withMessage('Email or phone number is required'),
    body('password')
      .notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ],

  verifyEmail: [
    body('phone')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^(010|011|012|015)\d{8}$/).withMessage('Invalid phone number format'),
    body('otp')
      .notEmpty().withMessage('OTP is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    handleValidationErrors
  ],




 
};

module.exports = authValidator;
