// routes/analytics.routes.js
'use strict';

const express            = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// All analytics routes require admin or superadmin access
router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

/* ── Donation analytics ─────────────────────────────────────
 * @swagger-path defined in docs/swagger/analytics.doc.js
 * ─────────────────────────────────────────────────────────── */
router.get('/donations',            analyticsController.getDonations);
router.get('/donations/trends',     analyticsController.getDonationTrends);
router.get('/donations/categories', analyticsController.getDonationCategories);
router.get('/donations/geographic', analyticsController.getDonationGeographic);

/* ── Institution analytics ──────────────────────────────────── */
router.get('/institutions',              analyticsController.getInstitutions);
router.get('/institutions/types',        analyticsController.getInstitutionTypes);
router.get('/institutions/performance',  analyticsController.getInstitutionPerformance);

/* ── Request analytics ──────────────────────────────────────── */
router.get('/requests',             analyticsController.getRequests);
router.get('/requests/trends',      analyticsController.getRequestTrends);
router.get('/requests/fulfillment', analyticsController.getRequestFulfillment);

/* ── Matching analytics ─────────────────────────────────────── */
router.get('/matching',              analyticsController.getMatching);
router.get('/matching/success-rate', analyticsController.getMatchingSuccessRate);
router.get('/matching/efficiency',   analyticsController.getMatchingEfficiency);

/* ── User analytics ─────────────────────────────────────────── */
router.get('/users',            analyticsController.getUsers);
router.get('/users/growth',     analyticsController.getUserGrowth);
router.get('/users/engagement', analyticsController.getUserEngagement);

module.exports = router;
