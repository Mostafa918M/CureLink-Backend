const ApiError = require('../utils/apiError');
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(errors.array({ onlyFirstError: true })[0].msg, 400));
  }
  next();
};

const donationValidator = {
  createDonation: [
    body('quantityAmount')
      .optional()
      .isNumeric()
      .withMessage('Quantity amount must be a number')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1')
      .bail(),
    body('quantityUnit')
      .optional()
      .isIn(['box', 'bottle', 'strip', 'unit'])
      .withMessage('Invalid unit type')
      .bail(),
    body('batchNumber')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Batch number is too long')
      .bail(),
    body('conditionNotes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
      .bail(),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high')
      .bail(),
    body('matchedInstitution')
      .optional()
      .isMongoId()
      .withMessage('Invalid institution ID format')
      .bail(),
    handleValidationErrors,
  ],
  updateDonation: [
    body('quantityAmount')
      .optional()
      .isNumeric()
      .withMessage('Quantity amount must be a number')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1')
      .bail(),
    body('quantityUnit')
      .optional()
      .isIn(['box', 'bottle', 'strip', 'unit'])
      .withMessage('Invalid unit type')
      .bail(),
    body('batchNumber')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Batch number is too long')
      .bail(),
    body('conditionNotes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
      .bail(),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high')
      .bail(),
    body('matchedInstitution')
      .optional()
      .isMongoId()
      .withMessage('Invalid institution ID format')
      .bail(),
    handleValidationErrors,
  ],
};

module.exports = donationValidator;
