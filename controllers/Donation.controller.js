const donationService = require('../services/Donation.service');
const catchAsync = require('../utils/asyncErrorHandler');
const apiError = require('../utils/apiError');

exports.createDonation = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new apiError('Please upload at least one image', 400));
  }

  const result = await donationService.createDonation(req.user._id, req.files);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});
