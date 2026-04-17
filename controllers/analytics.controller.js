// controllers/analytics.controller.js
'use strict';

const analyticsService  = require('../services/analytics.service');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const sendResponse      = require('../utils/sendResponse');

/* ── Donations ─────────────────────────────────────────────── */

exports.getDonations = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getDonationAnalytics();
  sendResponse(res, 200, 'success', 'Donation analytics fetched', data);
});

exports.getDonationTrends = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getDonationTrends(req.query);
  sendResponse(res, 200, 'success', 'Donation trends fetched', data);
});

exports.getDonationCategories = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getDonationCategories();
  sendResponse(res, 200, 'success', 'Donation categories fetched', data);
});

exports.getDonationGeographic = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getDonationGeographic();
  sendResponse(res, 200, 'success', 'Donation geographic distribution fetched', data);
});

/* ── Institutions ──────────────────────────────────────────── */

exports.getInstitutions = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getInstitutionAnalytics();
  sendResponse(res, 200, 'success', 'Institution analytics fetched', data);
});

exports.getInstitutionTypes = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getInstitutionsByType();
  sendResponse(res, 200, 'success', 'Institution types fetched', data);
});

exports.getInstitutionPerformance = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getInstitutionPerformance(req.query);
  sendResponse(res, 200, 'success', 'Institution performance metrics fetched', data);
});

/* ── Requests ──────────────────────────────────────────────── */

exports.getRequests = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getRequestAnalytics();
  sendResponse(res, 200, 'success', 'Request analytics fetched', data);
});

exports.getRequestTrends = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getRequestTrends(req.query);
  sendResponse(res, 200, 'success', 'Request trends fetched', data);
});

exports.getRequestFulfillment = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getRequestFulfillment();
  sendResponse(res, 200, 'success', 'Request fulfillment rates fetched', data);
});

/* ── Matching ──────────────────────────────────────────────── */

exports.getMatching = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getMatchingAnalytics();
  sendResponse(res, 200, 'success', 'Matching analytics fetched', data);
});

exports.getMatchingSuccessRate = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getMatchingSuccessRate();
  sendResponse(res, 200, 'success', 'Matching success rate fetched', data);
});

exports.getMatchingEfficiency = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getMatchingEfficiency();
  sendResponse(res, 200, 'success', 'Matching efficiency metrics fetched', data);
});

/* ── Users ─────────────────────────────────────────────────── */

exports.getUsers = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getUserAnalytics();
  sendResponse(res, 200, 'success', 'User analytics fetched', data);
});

exports.getUserGrowth = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getUserGrowth(req.query);
  sendResponse(res, 200, 'success', 'User growth data fetched', data);
});

exports.getUserEngagement = asyncErrorHandler(async (req, res) => {
  const data = await analyticsService.getUserEngagement();
  sendResponse(res, 200, 'success', 'User engagement metrics fetched', data);
});
