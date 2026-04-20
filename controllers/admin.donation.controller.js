const asyncErrorHandler = require('../utils/asyncErrorHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/sendResponse');
const adminDonationService = require('../services/admin.donation.service');

class AdminDonationController {
  /**
   * List all donations
   */
  async getAll(req, res) {
    const result = await adminDonationService.listAllDonations(req.query);
    return sendResponse(res, 200, 'success', 'All donations fetched successfully', result);
  }

  /**
   * Get pending review queue
   */
  async getPending(req, res) {
    const result = await adminDonationService.getPendingQueue(req.query);
    return sendResponse(res, 200, 'success', 'Pending review queue fetched successfully', result);
  }

  /**
   * Approve donation
   */
  async approve(req, res) {
    const { notes } = req.body;
    const result = await adminDonationService.updateStatus(req.params.id, 'available', notes, req.user._id);
    return sendResponse(res, 200, 'success', 'Donation approved successfully', result);
  }

  /**
   * Reject donation
   */
  async reject(req, res) {
    const { notes } = req.body;
    if (!notes) {
      throw new ApiError('Please provide a reason for rejection in the notes field', 400);
    }
    const result = await adminDonationService.updateStatus(req.params.id, 'rejected', notes, req.user._id);
    return sendResponse(res, 200, 'success', 'Donation rejected successfully', result);
  }

  /**
   * Change donation status
   */
  async changeStatus(req, res) {
    const { status, notes } = req.body;
    if (!status) {
      throw new ApiError('Status is required', 400);
    }
    const result = await adminDonationService.updateStatus(req.params.id, status, notes, req.user._id);
    return sendResponse(res, 200, 'success', `Donation status changed to ${status}`, result);
  }

  /**
   * Delete donation
   */
  async delete(req, res) {
    await adminDonationService.deleteDonation(req.params.id);
    return sendResponse(res, 200, 'success', 'Donation deleted successfully', null);
  }

  /**
   * Get expiring donations
   */
  async getExpiring(req, res) {
    const { days } = req.query;
    const result = await adminDonationService.getExpiringDonations(days, req.query);
    return sendResponse(res, 200, 'success', 'Expiring donations fetched successfully', result);
  }

  /**
   * Export donations data
   */
  async exportData(req, res) {
    const csvContent = await adminDonationService.exportToCsv(req.body);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=donations-export-${new Date().toISOString().split('T')[0]}.csv`);
    
    return res.status(200).send(csvContent);
  }
}

const controller = new AdminDonationController();

module.exports = {
  getAll: asyncErrorHandler(controller.getAll.bind(controller)),
  getPending: asyncErrorHandler(controller.getPending.bind(controller)),
  approve: asyncErrorHandler(controller.approve.bind(controller)),
  reject: asyncErrorHandler(controller.reject.bind(controller)),
  changeStatus: asyncErrorHandler(controller.changeStatus.bind(controller)),
  delete: asyncErrorHandler(controller.delete.bind(controller)),
  getExpiring: asyncErrorHandler(controller.getExpiring.bind(controller)),
  exportData: asyncErrorHandler(controller.exportData.bind(controller)),
};
