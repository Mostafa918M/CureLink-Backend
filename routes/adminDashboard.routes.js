'use strict';

const express = require('express');
const adminDashboardController = require('../controllers/adminDashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Require admin or superadmin access for all dashboard routes
router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

router.get('/stats', adminDashboardController.getStats);
router.get('/recent-activity', adminDashboardController.getRecentActivity);
router.get('/summary', adminDashboardController.getSummary);
router.get('/alerts', adminDashboardController.getAlerts);

module.exports = router;
