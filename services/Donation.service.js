// services/donation.service.js
// const { Donation, User, Institution, Notification, DonationReview } = require('../models/schemas');

class DonationService {
  async getAllDonations(queryParams) {}
  async getMyDonations(userId) {}
  async getAvailableDonations(institutionId) {}
  async getMatchedDonations(institutionId) {}
  async getDonationById(donationId, user, userType) {}
  async createDonation({ userId, body, files }) {}
  async updateDonation({ donationId, userId, body, files }) {}
  async deleteDonation(donationId, userId) {}
  async approveDonation(donationId) {}
  async rejectDonation(donationId, reason, adminId) {}
  async matchDonation(donationId, institutionId) {}
  async updateDelivery({ donationId, institutionId, deliveryData }) {}
  async getDonationStats() {}
}

module.exports = new DonationService();
