'use strict';

const adminDashboardService = require('../services/adminDashboard.service');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const sendResponse = require('../utils/sendResponse');

exports.getStats = asyncErrorHandler(async (req, res) => {
    const data = await adminDashboardService.getStats();
    sendResponse(res, 200, 'success', 'Dashboard stats retrieved successfully', data);
});

exports.getRecentActivity = asyncErrorHandler(async (req, res) => {
    const data = await adminDashboardService.getRecentActivity();
    sendResponse(res, 200, 'success', 'Recent activity retrieved successfully', data);
});

exports.getSummary = asyncErrorHandler(async (req, res) => {
    const data = await adminDashboardService.getSummary();
    sendResponse(res, 200, 'success', 'System summary retrieved successfully', data);
});

exports.getAlerts = asyncErrorHandler(async (req, res) => {
    const data = await adminDashboardService.getAlerts();
    sendResponse(res, 200, 'success', 'System alerts retrieved successfully', data);
});
