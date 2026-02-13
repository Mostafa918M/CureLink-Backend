// controllers/donation.controller.js
const donationService = require('../services/Donation.service');
const catchAsync = require('../utils/asyncErrorHandler');
const apiError = require('../utils/apiError');


exports.getAllDonations = catchAsync(async (req, res, next) => {
  const result = await donationService.getAllDonations(req.query);
  res.status(200).json({
    status: 'success',
    results: result.donations.length,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    data: { donations: result.donations },
  });
});

exports.getMyDonations = catchAsync(async (req, res, next) => {
  const result = await donationService.getMyDonations(req.user._id);
  res.status(200).json({
    status: 'success',
    results: result.donations.length,
    stats: result.stats,
    data: { donations: result.donations },
  });
});

exports.getAvailableDonations = catchAsync(async (req, res, next) => {
  const donations = await donationService.getAvailableDonations(req.user._id);
  res.status(200).json({
    status: 'success',
    results: donations.length,
    data: { donations },
  });
});

exports.getMatchedDonations = catchAsync(async (req, res, next) => {
  const donations = await donationService.getMatchedDonations(req.user._id);
  res.status(200).json({
    status: 'success',
    results: donations.length,
    data: { donations },
  });
});

exports.getDonation = catchAsync(async (req, res, next) => {
  const donation = await donationService.getDonationById(req.params.id, req.user, req.userType);
  res.status(200).json({
    status: 'success',
    data: { donation },
  });
});

exports.createDonation = catchAsync(async (req, res, next) => {
  const donation = await donationService.createDonation({
    userId: req.user._id,
    body: req.body,
    files: req.files,
  });
  res.status(201).json({
    status: 'success',
    message: 'Donation submitted successfully. Awaiting admin approval.',
    data: { donation },
  });
});

exports.updateDonation = catchAsync(async (req, res, next) => {
  const donation = await donationService.updateDonation({
    donationId: req.params.id,
    userId: req.user._id,
    body: req.body,
    files: req.files,
  });
  res.status(200).json({
    status: 'success',
    message: 'Donation updated successfully',
    data: { donation },
  });
});

exports.deleteDonation = catchAsync(async (req, res, next) => {
  await donationService.deleteDonation(req.params.id, req.user._id);
  res.status(200).json({
    status: 'success',
    message: 'Donation cancelled successfully',
    data: null,
  });
});

exports.approveDonation = catchAsync(async (req, res, next) => {
  const donation = await donationService.approveDonation(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Donation approved successfully',
    data: { donation },
  });
});

exports.rejectDonation = catchAsync(async (req, res, next) => {
  const donation = await donationService.rejectDonation(
    req.params.id,
    req.body.reason,
    req.user._id
  );
  res.status(200).json({
    status: 'success',
    message: 'Donation rejected',
    data: { donation },
  });
});

exports.matchDonation = catchAsync(async (req, res, next) => {
  const donation = await donationService.matchDonation(req.params.id, req.body.institutionId);
  res.status(200).json({
    status: 'success',
    message: 'Donation matched successfully',
    data: { donation },
  });
});

exports.updateDelivery = catchAsync(async (req, res, next) => {
  const donation = await donationService.updateDelivery({
    donationId: req.params.id,
    institutionId: req.user._id,
    deliveryData: req.body,
  });
  res.status(200).json({
    status: 'success',
    message: 'Delivery status updated successfully',
    data: { donation },
  });
});

exports.getDonationStats = catchAsync(async (req, res, next) => {
  const stats = await donationService.getDonationStats();
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
