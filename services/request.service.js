const Request = require('../models/request.model');
const Donation = require('../models/donation.model');
const Medicine = require('../models/medicine.model');
const ApiError = require('../utils/apiError');

// Fields that institutions are not allowed to set directly
const FORBIDDEN_CREATE_FIELDS = ['fulfilledQuantity', 'status', 'matchedDonations'];
const FORBIDDEN_UPDATE_FIELDS = ['institution', 'status', 'fulfilledQuantity', 'matchedDonations'];

class RequestService {
  /* ------------------------------------------------------------------ */
  /*  CREATE                                                               */
  /* ------------------------------------------------------------------ */
  async createRequest(userId, data) {
    const payload = { ...data };
    FORBIDDEN_CREATE_FIELDS.forEach((f) => delete payload[f]);

    return await Request.create({
      institution: userId,
      ...payload,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  LIST                                                                 */
  /* ------------------------------------------------------------------ */
  /**
   * @param {string} userId
   * @param {string} userRole
   * @param {object} query  – page, limit, status, priority, medicineName, sort
   */
  async getAllRequests(userId, userRole, query = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      medicineName,
      sort = '-createdAt',
    } = query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};
    if (userRole === 'institution') filter.institution = userId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (medicineName) {
      filter.$text = { $search: medicineName };
    }

    const [requests, total] = await Promise.all([
      Request.find(filter)
        .populate('institution', 'firstName lastName email phone')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Request.countDocuments(filter),
    ]);

    return {
      requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /*  GET ONE                                                              */
  /* ------------------------------------------------------------------ */
  async getRequestById(id, userId, userRole) {
    const request = await Request.findById(id)
      .populate('institution', 'firstName lastName email phone')
      .populate({
        path: 'matchedDonations.donation',
        match: { deletedAt: { $exists: false } },
      });

    if (!request) throw new ApiError('Request not found', 404);

    if (
      userRole === 'institution' &&
      request.institution._id.toString() !== userId.toString()
    ) {
      throw new ApiError('Not authorized to view this request', 403);
    }

    // Filter out any matched donations that were soft-deleted (and thus are null after populate)
    if (request.matchedDonations && request.matchedDonations.length > 0) {
      request.matchedDonations = request.matchedDonations.filter(
        (match) => match.donation
      );
    }

    return request;
  }

  /* ------------------------------------------------------------------ */
  /*  UPDATE                                                               */
  /* ------------------------------------------------------------------ */
  async updateRequest(id, userId, updateData) {
    const request = await Request.findById(id);
    if (!request) throw new ApiError('Request not found', 404);

    if (request.institution.toString() !== userId.toString()) {
      throw new ApiError('Not authorized to update this request', 403);
    }

    if (request.status !== 'open') {
      throw new ApiError('Cannot update a request after matching has started', 400);
    }

    // Strip forbidden fields
    const payload = { ...updateData };
    FORBIDDEN_UPDATE_FIELDS.forEach((f) => delete payload[f]);

    return await Request.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate('institution', 'firstName lastName email phone');
  }

  /* ------------------------------------------------------------------ */
  /*  CANCEL (soft delete)                                                 */
  /* ------------------------------------------------------------------ */
  async deleteRequest(id, userId) {
    const request = await Request.findById(id);
    if (!request) throw new ApiError('Request not found', 404);

    if (request.institution.toString() !== userId.toString()) {
      throw new ApiError('Not authorized to cancel this request', 403);
    }

    if (['cancelled', 'fulfilled'].includes(request.status)) {
      throw new ApiError(`Request is already ${request.status}`, 400);
    }

    request.status = 'cancelled';
    await request.save();
    return request;
  }

  /* ------------------------------------------------------------------ */
  /*  GET MATCHES                                                          */
  /* ------------------------------------------------------------------ */
  /**
   * Finds available donations whose medicine name matches the request's
   * medicineName. Optionally also filters by dosageForm and unit when the
   * request specifies them.
   *
   * @param {string} requestId
   * @param {object} query  – page, limit
   */
  async findMatches(requestId, query = {}) {
    const request = await Request.findById(requestId);
    if (!request) throw new ApiError('Request not found', 404);

    const { page = 1, limit = 10 } = query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // First resolve matching medicine IDs
    const medicineFilter = {
      name: { $regex: request.medicineName.trim(), $options: 'i' },
    };
    if (request.dosageForm) medicineFilter.dosageForm = request.dosageForm;

    const matchingMedicines = await Medicine.find(medicineFilter).select('_id');
    const medicineIds = matchingMedicines.map((m) => m._id);

    // Build donation filter
    const donationFilter = {
      status: 'available',
      medicine: { $in: medicineIds },
      deletedAt: { $exists: false },
    };

    // Match unit if specified
    if (request.requiredQuantity?.unit) {
      donationFilter['quantity.unit'] = request.requiredQuantity.unit;
    }

    const [donations, total] = await Promise.all([
      Donation.find(donationFilter)
        .populate('medicine', 'name strength dosageForm')
        .populate('donor', 'firstName lastName email phone')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      Donation.countDocuments(donationFilter),
    ]);

    return {
      request: {
        _id: request._id,
        medicineName: request.medicineName,
        requiredQuantity: request.requiredQuantity,
        fulfilledQuantity: request.fulfilledQuantity,
      },
      donations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /*  STATISTICS                                                           */
  /* ------------------------------------------------------------------ */
  async getStatistics(userId, userRole) {
    const matchStage = userRole === 'institution' ? { institution: userId } : {};

    const [statusBreakdown, priorityBreakdown, totals] = await Promise.all([
      // Count by status
      Request.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Count by priority
      Request.aggregate([
        { $match: matchStage },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Overall totals + fulfilled rate
      Request.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            fulfilled: {
              $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] },
            },
            partiallyFulfilled: {
              $sum: { $cond: [{ $eq: ['$status', 'partially_fulfilled'] }, 1, 0] },
            },
            open: {
              $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const summary = totals[0] || {
      total: 0,
      fulfilled: 0,
      partiallyFulfilled: 0,
      open: 0,
      cancelled: 0,
    };

    const fulfilledRate =
      summary.total > 0
        ? parseFloat(((summary.fulfilled / summary.total) * 100).toFixed(2))
        : 0;

    return {
      summary: {
        total: summary.total,
        open: summary.open,
        fulfilled: summary.fulfilled,
        partiallyFulfilled: summary.partiallyFulfilled,
        cancelled: summary.cancelled,
        fulfilledRate: `${fulfilledRate}%`,
      },
      byStatus: statusBreakdown,
      byPriority: priorityBreakdown,
    };
  }
}

module.exports = new RequestService();
