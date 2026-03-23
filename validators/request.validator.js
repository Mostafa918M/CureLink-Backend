const { body, param, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const DOSAGE_FORMS = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'];
const QUANTITY_UNITS = ['box', 'bottle', 'strip', 'unit'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

/**
 * Reusable final middleware that collects express-validator errors
 * and forwards the first one as an ApiError(400).
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(errors.array()[0].msg, 400));
  }
  next();
};

/**
 * Reusable :id param validator (MongoDB ObjectId)
 */
const idParam = [
  param('id').isMongoId().withMessage('Invalid request ID format'),
  validate,
];

/**
 * Validation rules shared between create and update.
 * Pass `required = true` for create, `false` for update.
 */
const buildBodyRules = (required = true) => {
  const opt = (chain) => (required ? chain : chain.optional());

  return [
    opt(
      body('medicineName')
        .trim()
        .notEmpty()
        .withMessage('Medicine name is required')
        .isLength({ min: 2 })
        .withMessage('Medicine name must be at least 2 characters')
    ),

    body('strength')
      .optional()
      .trim()
      .isString()
      .withMessage('Strength must be a string'),

    body('dosageForm')
      .optional()
      .isIn(DOSAGE_FORMS)
      .withMessage(`Dosage form must be one of: ${DOSAGE_FORMS.join(', ')}`),

    opt(
      body('requiredQuantity.amount')
        .notEmpty()
        .withMessage('Required quantity amount is required')
        .isInt({ min: 1 })
        .withMessage('Required quantity amount must be a positive integer')
    ),

    opt(
      body('requiredQuantity.unit')
        .notEmpty()
        .withMessage('Required quantity unit is required')
        .isIn(QUANTITY_UNITS)
        .withMessage(`Unit must be one of: ${QUANTITY_UNITS.join(', ')}`)
    ),

    body('priority')
      .optional()
      .isIn(PRIORITIES)
      .withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),

    opt(
      body('expiresAt')
        .notEmpty()
        .withMessage('Expiry date is required')
        .isISO8601()
        .withMessage('Expiry date must be a valid ISO 8601 date')
        .custom((value) => {
          if (new Date(value) <= new Date()) {
            throw new Error('Expiry date must be in the future');
          }
          return true;
        })
    ),

    body('notes').optional().isString().withMessage('Notes must be a string'),
  ];
};

const requestValidator = {
  /**
   * POST /api/v1/requests
   */
  create: [...buildBodyRules(true), validate],

  /**
   * PATCH /api/v1/requests/:id
   */
  update: [...idParam, ...buildBodyRules(false), validate],

  /**
   * Routes that only need a valid :id (GET /:id, DELETE /:id, GET /:id/matches)
   */
  idParam,
};

module.exports = requestValidator;
