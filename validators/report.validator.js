// validators/report.validator.js
'use strict';

const { body, query, param } = require('express-validator');

/* ─────────────────────────────────────────────────────────
   Shared rules
───────────────────────────────────────────────────────── */
const formatRule = body('format')
  .notEmpty().withMessage('format is required')
  .isIn(['pdf', 'excel']).withMessage('format must be pdf or excel');

const startDateRule = body('startDate')
  .optional()
  .isISO8601().withMessage('startDate must be a valid ISO 8601 date');

const endDateRule = body('endDate')
  .optional()
  .isISO8601().withMessage('endDate must be a valid ISO 8601 date')
  .custom((endDate, { req }) => {
    if (req.body.startDate && endDate < req.body.startDate) {
      throw new Error('endDate must be after startDate');
    }
    return true;
  });

/* Donation status values from the model */
const donationStatusRule = body('status')
  .optional()
  .isIn(['pending', 'admin_review', 'available', 'matched', 'approved_by_institution', 'delivered', 'rejected', 'expired', 'cancelled'])
  .withMessage('Invalid donation status');

/* Request status values from the model */
const requestStatusRule = body('status')
  .optional()
  .isIn(['open', 'partially_fulfilled', 'fulfilled', 'cancelled', 'expired'])
  .withMessage('Invalid request status');

const priorityRule = body('priority')
  .optional()
  .isIn(['low', 'medium', 'high', 'urgent'])
  .withMessage('priority must be low, medium, high or urgent');

/* ─────────────────────────────────────────────────────────
   Per-route validators
───────────────────────────────────────────────────────── */
exports.validateDonationReport = [
  formatRule,
  startDateRule,
  endDateRule,
  donationStatusRule,
];

exports.validateInstitutionReport = [
  formatRule,
  startDateRule,
  endDateRule,
];

exports.validateRequestReport = [
  formatRule,
  startDateRule,
  endDateRule,
  requestStatusRule,
  priorityRule,
];

exports.validateMatchingReport = [
  formatRule,
  startDateRule,
  endDateRule,
];

exports.validateMonthlySummary = [
  formatRule,
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2100 }).withMessage('year must be an integer between 2020 and 2100'),
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('month must be an integer between 1 and 12'),
];

exports.validateListReports = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['donations', 'institutions', 'requests', 'matching', 'monthly_summary'])
    .withMessage('Invalid report type'),
  query('format')
    .optional()
    .isIn(['pdf', 'excel'])
    .withMessage('format must be pdf or excel'),
];

exports.validateReportId = [
  param('id').isMongoId().withMessage('Invalid report id'),
];
