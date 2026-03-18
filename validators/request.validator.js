const ApiError = require('../utils/ApiError');
const { body, param, validationResult } = require('express-validator');

const requestValidator = {
  /**
   * Validation rules for creating request
   */
  create: [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters'),
    // Add more validation rules as needed
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ApiError(errors.array()[0].msg, 400));
      }
      next();
    }
  ],

  /**
   * Validation rules for updating request
   */
  update: [
    param('id')
      .notEmpty()
      .withMessage('ID is required'),
    body('name')
      .optional()
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters'),
    // Add more validation rules as needed
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ApiError(errors.array()[0].msg, 400));
      }
      next();
    }
  ]
};

module.exports = requestValidator;
