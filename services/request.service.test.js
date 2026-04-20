const RequestService = require('./request.service');
const Request = require('../models/request.model');
const Donation = require('../models/donation.model');
const Medicine = require('../models/medicine.model');
const ApiError = require('../utils/apiError');

jest.mock('../models/request.model');
jest.mock('../models/donation.model');
jest.mock('../models/medicine.model');

// ─── Helpers ────────────────────────────────────────────────────────────────

const buildMockQuery = (resolvedValue) => {
  const q = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(resolvedValue),
  };
  return q;
};

const INSTITUTION_ID = 'inst_abc123';
const REQUEST_ID = 'req_xyz789';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('RequestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ======================================================================
     1. createRequest
     ====================================================================== */
  describe('createRequest', () => {
    it('should create and return a new request', async () => {
      const data = {
        medicineName: 'Panadol',
        requiredQuantity: { amount: 5, unit: 'box' },
        expiresAt: '2027-01-01',
      };
      const created = { _id: REQUEST_ID, institution: INSTITUTION_ID, ...data };
      Request.create.mockResolvedValue(created);

      const result = await RequestService.createRequest(INSTITUTION_ID, data);

      expect(Request.create).toHaveBeenCalledWith(
        expect.objectContaining({ institution: INSTITUTION_ID, medicineName: 'Panadol' })
      );
      expect(result._id).toBe(REQUEST_ID);
    });

    it('should strip forbidden fields before creating', async () => {
      const data = {
        medicineName: 'Aspirin',
        requiredQuantity: { amount: 2, unit: 'strip' },
        expiresAt: '2027-06-01',
        status: 'fulfilled',          // ← forbidden
        fulfilledQuantity: 99,        // ← forbidden
        matchedDonations: ['don1'],  // ← forbidden
      };
      Request.create.mockResolvedValue({ _id: REQUEST_ID });

      await RequestService.createRequest(INSTITUTION_ID, data);

      const callArg = Request.create.mock.calls[0][0];
      expect(callArg.status).toBeUndefined();
      expect(callArg.fulfilledQuantity).toBeUndefined();
      expect(callArg.matchedDonations).toBeUndefined();
    });
  });

  /* ======================================================================
     2. getAllRequests
     ====================================================================== */
  describe('getAllRequests', () => {
    it('should return paginated results for institution (scoped to own requests)', async () => {
      const mockDocs = [{ _id: REQUEST_ID }];
      const mockQ = buildMockQuery(mockDocs);
      Request.find.mockReturnValue(mockQ);
      Request.countDocuments.mockResolvedValue(25);

      const result = await RequestService.getAllRequests(INSTITUTION_ID, 'institution', {
        page: '2',
        limit: '5',
      });

      // Should apply institution filter
      expect(Request.find).toHaveBeenCalledWith(
        expect.objectContaining({ institution: INSTITUTION_ID })
      );
      expect(mockQ.skip).toHaveBeenCalledWith(5); // (page 2 - 1) * 5
      expect(mockQ.limit).toHaveBeenCalledWith(5);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.pages).toBe(5);
    });

    it('should apply no institution filter for admin', async () => {
      const mockQ = buildMockQuery([]);
      Request.find.mockReturnValue(mockQ);
      Request.countDocuments.mockResolvedValue(0);

      await RequestService.getAllRequests('admin_id', 'admin', {});

      expect(Request.find).toHaveBeenCalledWith(expect.not.objectContaining({ institution: expect.anything() }));
    });

    it('should filter by status and priority when provided', async () => {
      const mockQ = buildMockQuery([]);
      Request.find.mockReturnValue(mockQ);
      Request.countDocuments.mockResolvedValue(0);

      await RequestService.getAllRequests(INSTITUTION_ID, 'institution', {
        status: 'open',
        priority: 'urgent',
      });

      expect(Request.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'open', priority: 'urgent' })
      );
    });
  });

  /* ======================================================================
     3. getRequestById
     ====================================================================== */
  describe('getRequestById', () => {
    it('should throw 404 if request is not found', async () => {
      const mockQ = { populate: jest.fn().mockReturnThis() };
      mockQ.populate.mockReturnValueOnce(mockQ).mockResolvedValueOnce(null);
      Request.findById.mockReturnValue(mockQ);

      await expect(
        RequestService.getRequestById('nonexistent', INSTITUTION_ID, 'institution')
      ).rejects.toThrow('Request not found');
    });

    it('should throw 403 if institution tries to access another institution request', async () => {
      const mockQ = { populate: jest.fn().mockReturnThis() };
      const fakeRequest = { institution: { _id: 'other_inst' } };
      mockQ.populate.mockReturnValueOnce(mockQ).mockResolvedValueOnce(fakeRequest);
      Request.findById.mockReturnValue(mockQ);

      await expect(
        RequestService.getRequestById(REQUEST_ID, INSTITUTION_ID, 'institution')
      ).rejects.toThrow('Not authorized to view this request');
    });

    it('should return request for admin regardless of institution', async () => {
      const mockQ = { populate: jest.fn().mockReturnThis() };
      const fakeRequest = { _id: REQUEST_ID, institution: { _id: 'other_inst' } };
      mockQ.populate.mockReturnValueOnce(mockQ).mockResolvedValueOnce(fakeRequest);
      Request.findById.mockReturnValue(mockQ);

      const result = await RequestService.getRequestById(REQUEST_ID, 'admin_id', 'admin');
      expect(result._id).toBe(REQUEST_ID);
    });
  });

  /* ======================================================================
     4. updateRequest
     ====================================================================== */
  describe('updateRequest', () => {
    it('should throw 404 if request does not exist', async () => {
      Request.findById.mockResolvedValue(null);
      await expect(
        RequestService.updateRequest(REQUEST_ID, INSTITUTION_ID, {})
      ).rejects.toThrow('Request not found');
    });

    it('should throw 403 if caller is not the owning institution', async () => {
      Request.findById.mockResolvedValue({ institution: 'other_inst', status: 'open' });
      await expect(
        RequestService.updateRequest(REQUEST_ID, INSTITUTION_ID, {})
      ).rejects.toThrow('Not authorized to update this request');
    });

    it('should throw 400 if request status is not open', async () => {
      Request.findById.mockResolvedValue({
        institution: INSTITUTION_ID,
        status: 'partially_fulfilled',
      });
      await expect(
        RequestService.updateRequest(REQUEST_ID, INSTITUTION_ID, { priority: 'high' })
      ).rejects.toThrow('Cannot update a request after matching has started');
    });

    it('should strip forbidden fields and update successfully', async () => {
      Request.findById.mockResolvedValue({ institution: INSTITUTION_ID, status: 'open' });

      const mockQ = { populate: jest.fn().mockResolvedValue({ _id: REQUEST_ID }) };
      Request.findByIdAndUpdate.mockReturnValue(mockQ);

      const updateData = {
        priority: 'urgent',
        status: 'fulfilled',        // ← forbidden, must be stripped
        institution: 'other_inst',  // ← forbidden, must be stripped
        notes: 'Very urgent',
      };

      await RequestService.updateRequest(REQUEST_ID, INSTITUTION_ID, updateData);

      const savedPayload = Request.findByIdAndUpdate.mock.calls[0][1];
      expect(savedPayload.status).toBeUndefined();
      expect(savedPayload.institution).toBeUndefined();
      expect(savedPayload.priority).toBe('urgent');
      expect(savedPayload.notes).toBe('Very urgent');
    });
  });

  /* ======================================================================
     5. deleteRequest (soft cancel)
     ====================================================================== */
  describe('deleteRequest', () => {
    it('should throw 404 if not found', async () => {
      Request.findById.mockResolvedValue(null);
      await expect(RequestService.deleteRequest(REQUEST_ID, INSTITUTION_ID)).rejects.toThrow(
        'Request not found'
      );
    });

    it('should throw 403 if caller does not own the request', async () => {
      Request.findById.mockResolvedValue({ institution: 'other_inst', status: 'open' });
      await expect(RequestService.deleteRequest(REQUEST_ID, INSTITUTION_ID)).rejects.toThrow(
        'Not authorized to cancel this request'
      );
    });

    it('should throw 400 if request is already cancelled', async () => {
      Request.findById.mockResolvedValue({ institution: INSTITUTION_ID, status: 'cancelled' });
      await expect(RequestService.deleteRequest(REQUEST_ID, INSTITUTION_ID)).rejects.toThrow(
        'Request is already cancelled'
      );
    });

    it('should soft-cancel by setting status to cancelled', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const fakeRequest = { institution: INSTITUTION_ID, status: 'open', save: mockSave };
      Request.findById.mockResolvedValue(fakeRequest);

      await RequestService.deleteRequest(REQUEST_ID, INSTITUTION_ID);

      expect(fakeRequest.status).toBe('cancelled');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  /* ======================================================================
     6. findMatches
     ====================================================================== */
  describe('findMatches', () => {
    it('should throw 404 if request not found', async () => {
      Request.findById.mockResolvedValue(null);
      await expect(RequestService.findMatches('bad_id')).rejects.toThrow('Request not found');
    });

    it('should return matching available donations with pagination', async () => {
      const fakeRequest = {
        _id: REQUEST_ID,
        medicineName: 'Panadol',
        dosageForm: 'tablet',
        requiredQuantity: { amount: 5, unit: 'box' },
        fulfilledQuantity: 0,
      };
      Request.findById.mockResolvedValue(fakeRequest);

      const mockMeds = [{ _id: 'med1' }, { _id: 'med2' }];
      Medicine.find.mockReturnValue({ select: jest.fn().mockResolvedValue(mockMeds) });

      const mockDonations = [{ _id: 'don1' }, { _id: 'don2' }];
      const mockDonationQ = buildMockQuery(mockDonations);
      Donation.find.mockReturnValue(mockDonationQ);
      Donation.countDocuments.mockResolvedValue(2);

      const result = await RequestService.findMatches(REQUEST_ID, { page: '1', limit: '10' });

      expect(Donation.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'available',
          'quantity.unit': 'box',
        })
      );
      expect(result.donations.length).toBe(2);
      expect(result.pagination.total).toBe(2);
      expect(result.request.medicineName).toBe('Panadol');
    });
  });

  /* ======================================================================
     7. getStatistics
     ====================================================================== */
  describe('getStatistics', () => {
    it('should return statistics scoped to institution', async () => {
      const mockAggregate = jest.fn().mockResolvedValue([]);
      Request.aggregate = mockAggregate;

      await RequestService.getStatistics(INSTITUTION_ID, 'institution');

      // All three aggregate calls must be made
      expect(mockAggregate).toHaveBeenCalledTimes(3);

      // The $match stage in every call should scope to the institution
      const firstCall = mockAggregate.mock.calls[0][0];
      expect(firstCall[0].$match).toEqual({ institution: INSTITUTION_ID });
    });

    it('should return unscoped statistics for admin', async () => {
      const mockAggregate = jest.fn().mockResolvedValue([]);
      Request.aggregate = mockAggregate;

      await RequestService.getStatistics('admin_id', 'admin');

      const firstCall = mockAggregate.mock.calls[0][0];
      expect(firstCall[0].$match).toEqual({}); // No institution filter
    });

    it('should calculate fulfilledRate as a percentage string', async () => {
      Request.aggregate = jest
        .fn()
        .mockResolvedValueOnce([]) // statusBreakdown
        .mockResolvedValueOnce([]) // priorityBreakdown
        .mockResolvedValueOnce([  // totals
          { _id: null, total: 10, fulfilled: 4, partiallyFulfilled: 2, open: 3, cancelled: 1 },
        ]);

      const result = await RequestService.getStatistics('admin_id', 'admin');

      expect(result.summary.fulfilledRate).toBe('40%');
      expect(result.summary.total).toBe(10);
      expect(result.summary.fulfilled).toBe(4);
    });

    it('should return 0% fulfilledRate when there are no requests', async () => {
      Request.aggregate = jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]); // No totals document

      const result = await RequestService.getStatistics('admin_id', 'admin');

      expect(result.summary.total).toBe(0);
      expect(result.summary.fulfilledRate).toBe('0%');
    });
  });
});
