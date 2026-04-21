// routes/report.routes.js
'use strict';

const express = require('express');
const reportController = require('../controllers/report.controller');
const reportValidator  = require('../validators/report.validator');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

/** All report routes require admin or superadmin role */
router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

/* ─────────────────────────────────────────────────────────
   Generate Routes
───────────────────────────────────────────────────────── */
router.post(
  '/donations',
  reportValidator.validateDonationReport,
  reportController.generateDonationReport
);

router.post(
  '/institutions',
  reportValidator.validateInstitutionReport,
  reportController.generateInstitutionReport
);

router.post(
  '/requests',
  reportValidator.validateRequestReport,
  reportController.generateRequestReport
);

router.post(
  '/matching',
  reportValidator.validateMatchingReport,
  reportController.generateMatchingReport
);

router.post(
  '/monthly-summary',
  reportValidator.validateMonthlySummary,
  reportController.generateMonthlySummaryReport
);

/* ─────────────────────────────────────────────────────────
   Management Routes
───────────────────────────────────────────────────────── */
router.get(
  '/',
  reportValidator.validateListReports,
  reportController.listReports
);

router.get(
  '/:id',
  reportValidator.validateReportId,
  reportController.getReport
);

router.delete(
  '/:id',
  reportValidator.validateReportId,
  reportController.deleteReport
);

module.exports = router;
