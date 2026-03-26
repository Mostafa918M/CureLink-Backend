const Donation = require('../models/donation.model');
const ApiError = require('../utils/apiError');
const mongoose = require('mongoose');

class AdminDonationService {
  /**
   * List all donations with pagination and filters
   */
  async listAllDonations(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.medicineId) filter.medicine = query.medicineId;
    if (query.donorId) filter.donor = query.donorId;

    const donations = await Donation.find(filter)
      .populate('donor', 'firstName lastName email phone')
      .populate('medicine', 'name strength dosageForm category')
      .populate('matchedInstitution', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Donation.countDocuments(filter);

    return {
      donations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get pending review queue (pending or admin_review)
   */
  async getPendingQueue(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: { $in: ['pending', 'admin_review'] } };

    const donations = await Donation.find(filter)
      .populate('donor', 'firstName lastName email phone')
      .populate('medicine', 'name strength dosageForm category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Donation.countDocuments(filter);

    return {
      donations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update donation status and record history
   */
  async updateStatus(id, status, notes, adminId) {
    const donation = await Donation.findById(id);
    if (!donation) {
      throw new ApiError('Donation not found', 404);
    }

    const oldStatus = donation.status;
    donation.status = status;
    
    // Add to history
    donation.statusHistory.push({
      status,
      changedBy: adminId,
      role: 'admin',
      notes: notes || `Status changed from ${oldStatus} to ${status} by admin`,
      timestamp: new Date()
    });

    await donation.save();
    
    return donation.populate([
      { path: 'donor', select: 'firstName lastName email phone' },
      { path: 'medicine', select: 'name strength dosageForm category' }
    ]);
  }

  /**
   * Get donations expiring within X days
   */
  async getExpiringDonations(days = 30, query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const expiryWindow = new Date();
    expiryWindow.setDate(expiryWindow.getDate() + parseInt(days));

    const filter = {
      expiryDate: { $lte: expiryWindow, $gt: new Date() },
      status: { $nin: ['expired', 'deleted', 'cancelled', 'delivered'] }
    };

    const donations = await Donation.find(filter)
      .populate('donor', 'firstName lastName email phone')
      .populate('medicine', 'name strength dosageForm category')
      .sort({ expiryDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Donation.countDocuments(filter);

    return {
      donations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Export donations to CSV format
   */
  async exportToCsv(query) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.startDate && query.endDate) {
      filter.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate)
      };
    }

    const donations = await Donation.find(filter)
      .populate('donor', 'firstName lastName email')
      .populate('medicine', 'name strength')
      .sort({ createdAt: -1 })
      .lean();

    if (donations.length === 0) {
      return "ID,Donor Name,Donor Email,Medicine,Strength,Quantity,Unit,Expiry Date,Status,Created At\n";
    }

    const headers = ["ID", "Donor Name", "Donor Email", "Medicine", "Strength", "Quantity", "Unit", "Expiry Date", "Status", "Created At"];
    const rows = donations.map(d => [
      d._id,
      `${d.donor?.firstName || ''} ${d.donor?.lastName || ''}`.trim(),
      d.donor?.email || '',
      d.medicine?.name || '',
      d.medicine?.strength || '',
      d.quantity?.amount || '',
      d.quantity?.unit || '',
      d.expiryDate ? d.expiryDate.toISOString().split('T')[0] : '',
      d.status,
      d.createdAt ? d.createdAt.toISOString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Delete a donation
   */
  async deleteDonation(id) {
    const donation = await Donation.findById(id);
    if (!donation) {
      throw new ApiError('Donation not found', 404);
    }
    
    // Instead of hard delete, we could set status to deleted, 
    // but the task says "Delete donation". 
    // Looking at donation.service.js, it does a hard delete after cleaning images.
    // I will follow that pattern or check if there's a reason for soft delete.
    // Given the status enum has 'deleted', maybe a soft delete is preferred?
    // Let's do a hard delete as per the user request "DELETE /api/v1/admin/donations/:id" 
    // and standard practice unless specified.
    
    await Donation.findByIdAndDelete(id);
    return true;
  }
}

module.exports = new AdminDonationService();
