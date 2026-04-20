const asyncErrorHandler = require('../utils/asyncErrorHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/sendResponse');
const donationService = require('../services/donation.service');

class DonationController {
  async getAll(req, res, next) {
    const result = await donationService.getAllDonations(req.query);
    return sendResponse(res, 200, 'success', 'Donations fetched successfully', result);
  }

  async getOne(req, res, next) {
    const donation = await donationService.getDonationById(req.params.id);
    return sendResponse(res, 200, 'success', 'Donation fetched successfully', donation);
  }

  async create(req, res, next) {
    if (!req.files || req.files.length === 0) {
      return next(new ApiError('Please upload at least one image', 400));
    }

    const result = await donationService.createDonation(req.user._id, req.files, req.body);

    return sendResponse(res, 201, 'success', 'Donation created successfully', result);
  }

  async update(req, res, next) {
    const result = await donationService.updateDonation(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body,
      req.files
    );

    return sendResponse(res, 200, 'success', 'Donation updated successfully', result);
  }

  async delete(req, res, next) {
    await donationService.deleteDonation(req.params.id, req.user._id, req.user.role);

    return sendResponse(res, 200, 'success', 'Donation deleted successfully', null);
  }

  async getMyDonations(req, res, next) {
    const result = await donationService.getMyDonations(req.user._id, req.query);
    return sendResponse(res, 200, 'success', 'Your donations fetched successfully', result);
  }
}

const controller = new DonationController();

module.exports = {
  getAll: asyncErrorHandler(controller.getAll.bind(controller)),
  getOne: asyncErrorHandler(controller.getOne.bind(controller)),
  create: asyncErrorHandler(controller.create.bind(controller)),
  update: asyncErrorHandler(controller.update.bind(controller)),
  delete: asyncErrorHandler(controller.delete.bind(controller)),
  getMyDonations: asyncErrorHandler(controller.getMyDonations.bind(controller)),
};
