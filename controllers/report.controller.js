// controllers/report.controller.js
'use strict';

const fs = require('fs');
const { validationResult } = require('express-validator');
const reportService = require('../services/report.service');
const sendResponse  = require('../utils/sendResponse');
const ApiError      = require('../utils/apiError');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

/* ─────────────────────────────────────────────────────────
   Validation helper
───────────────────────────────────────────────────────── */
function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array()[0].msg, 400);
  }
}

/* ─────────────────────────────────────────────────────────
   Handlers
───────────────────────────────────────────────────────── */

exports.generateDonationReport = asyncErrorHandler(async (req, res, next) => {
  checkValidation(req);
  const report = await reportService.generateDonationReport(req.body, req.userId);
  sendResponse(res, 201, 'success', 'Donation report generated', report);
});

exports.generateInstitutionReport = asyncErrorHandler(async (req, res, next) => {
  checkValidation(req);
  const report = await reportService.generateInstitutionReport(req.body, req.userId);
  sendResponse(res, 201, 'success', 'Institution report generated', report);
});

exports.generateRequestReport = asyncErrorHandler(async (req, res, next) => {
  checkValidation(req);
  const report = await reportService.generateRequestReport(req.body, req.userId);
  sendResponse(res, 201, 'success', 'Request report generated', report);
});

exports.generateMatchingReport = asyncErrorHandler(async (req, res, next) => {
  checkValidation(req);
  const report = await reportService.generateMatchingReport(req.body, req.userId);
  sendResponse(res, 201, 'success', 'Matching report generated', report);
});

exports.generateMonthlySummaryReport = asyncErrorHandler(async (req, res, next) => {
  checkValidation(req);
  const report = await reportService.generateMonthlySummaryReport(req.body, req.userId);
  sendResponse(res, 201, 'success', 'Monthly summary report generated', report);
});

exports.listReports = asyncErrorHandler(async (req, res, next) => {
  checkValidation(req);

  const page   = parseInt(req.query.page, 10) || 1;
  const limit  = parseInt(req.query.limit, 10) || 10;
  const type   = req.query.type;
  const format = req.query.format;

  const result = await reportService.listReports({ page, limit, type, format });
  sendResponse(res, 200, 'success', 'Reports fetched successfully', result);
});

exports.getReport = asyncErrorHandler(async (req, res, next) => {
  checkValidation(req);
  const report = await reportService.getReportById(req.params.id);

  if (!fs.existsSync(report.filePath)) {
    throw new ApiError('Report file no longer exists on disk', 404);
  }

  /* Serve file to stream downloading */
  res.download(report.filePath, report.fileName, (err) => {
    if (err) {
      next(new ApiError('Error downloading file', 500));
    }
  });
});

exports.deleteReport = asyncErrorHandler(async (req, res, next) => {
  checkValidation(req);
  await reportService.deleteReport(req.params.id);
  sendResponse(res, 200, 'success', 'Report deleted successfully');
});
