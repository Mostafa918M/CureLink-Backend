const { body, validationResult } = require('express-validator');
const apiError = require('../utils/apiError');

const createDonationValidator = [
  body('quantityAmount')
    .optional()
    .isNumeric()
    .withMessage('Quantity amount must be a number')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('quantityUnit')
    .optional()
    .isIn(['box', 'bottle', 'strip', 'unit'])
    .withMessage('Invalid unit type'),

  body('batchNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Batch number is too long'),

  body('conditionNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((err) => err.msg)
        .join(', ');
      return next(new apiError(errorMessages, 400));
    }
    next();
  },
];

module.exports = {
  createDonationValidator,
};
