const donationService = require('./donation.service');
const AiService = require('./Ai.service');
const ImageStorageService = require('./imageStorage.service');
const Donation = require('../models/donation.model');
const Medicine = require('../models/medicine.model');
const ApiError = require('../utils/apiError');

jest.mock('./Ai.service');
jest.mock('./imageStorage.service');
jest.mock('../models/donation.model');
jest.mock('../models/medicine.model');

describe('Donation Service', () => {
  const mockUserId = 'user123';
  const mockFiles = [{ buffer: Buffer.from('fake-image-data') }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ==========================================================
     1. Testing createDonation
     ========================================================== */
  describe('createDonation', () => {
    it('should reject the request if the medicine is expired and not upload images', async () => {
      AiService.extractDataFromImage.mockResolvedValue({
        medicine: { name: 'Panadol', dosageForm: 'tablet' },
        donation: { expiryDate: '2020-01-01', quantityAmount: 2, quantityUnit: 'box' },
      });

      await expect(donationService.createDonation(mockUserId, mockFiles)).rejects.toThrow(
        'Sorry, we cannot accept this medicine because it has expired.'
      );
      expect(ImageStorageService.uploadImage).not.toHaveBeenCalled();
    });

    it('should reject the request if AI fails to extract medicine name', async () => {
      AiService.extractDataFromImage.mockResolvedValue({
        medicine: { name: null },
        donation: { expiryDate: '2030-01-01' },
      });

      await expect(donationService.createDonation(mockUserId, mockFiles)).rejects.toThrow(
        'AI could not recognize the medicine name'
      );
    });

    it('should delete images from Cloudinary if database save fails (Rollback)', async () => {
      AiService.extractDataFromImage.mockResolvedValue({
        medicine: { name: 'Aspirin', dosageForm: 'tablet' },
        donation: { expiryDate: '2030-01-01', quantityAmount: 1, quantityUnit: 'box' },
      });

      const mockUploadResult = { url: 'http://image.url', publicId: 'img123' };
      ImageStorageService.uploadImage.mockResolvedValue(mockUploadResult);
      ImageStorageService.deleteImage.mockResolvedValue(true);

      Medicine.findOne.mockResolvedValue({ _id: 'med123', name: 'Aspirin' });
      Donation.create.mockRejectedValue(new Error('Database error'));

      await expect(donationService.createDonation(mockUserId, mockFiles)).rejects.toThrow(
        'An error occurred while saving the donation to the database'
      );

      expect(ImageStorageService.deleteImage).toHaveBeenCalledWith('img123');
    });

    it('should complete successfully when all data is valid', async () => {
      AiService.extractDataFromImage.mockResolvedValue({
        medicine: { name: 'Brufen', dosageForm: 'syrup' },
        donation: { expiryDate: '2030-12-31', quantityAmount: 3, quantityUnit: 'bottle' },
      });

      ImageStorageService.uploadImage.mockResolvedValue({ url: 'http://img', publicId: 'id1' });
      Medicine.findOne.mockResolvedValue(null);
      Medicine.create.mockResolvedValue({ _id: 'newMed123', name: 'Brufen' });

      const mockDonation = {
        _id: 'don123',
        populate: jest.fn().mockResolvedValue(true),
      };
      Donation.create.mockResolvedValue(mockDonation);

      const result = await donationService.createDonation(mockUserId, mockFiles);

      expect(result._id).toBe('don123');
      expect(Medicine.create).toHaveBeenCalled();
      expect(Donation.create).toHaveBeenCalled();
      expect(ImageStorageService.deleteImage).not.toHaveBeenCalled();
    });
  });

  /* ==========================================================
     2. Testing getAllDonations
     ========================================================== */
  describe('getAllDonations', () => {
    it('should return paginated donations, excluding soft-deleted ones', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([{ _id: 'don1' }, { _id: 'don2' }]),
      };
      Donation.find.mockReturnValue(mockQuery);
      Donation.countDocuments.mockResolvedValue(20);

      const result = await donationService.getAllDonations({ page: 2, limit: 10 });
      
      const expectedFilter = { deletedAt: { $exists: false } };
      expect(Donation.find).toHaveBeenCalledWith(expectedFilter);
      expect(Donation.countDocuments).toHaveBeenCalledWith(expectedFilter);

      expect(mockQuery.skip).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result.pagination.total).toBe(20);
      expect(result.donations.length).toBe(2);
    });
  });

  /* ==========================================================
     3. Testing getDonationById
     ========================================================== */
  describe('getDonationById', () => {
    it('should throw 404 if donation is not found', async () => {
      // Mongoose queries are "then-able", so we mock `then` to control await
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(null)), // This makes `await` resolve to null
      };
      Donation.findOne.mockReturnValue(mockQuery);

      await expect(donationService.getDonationById('invalidId')).rejects.toThrow(
        'Donation not found'
      );
    });

    it('should return donation if found', async () => {
      const mockDonation = { _id: 'don123' };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockDonation)),
      };
      Donation.findOne.mockReturnValue(mockQuery);

      const result = await donationService.getDonationById('don123');
      expect(result._id).toBe('don123');
      expect(mockQuery.populate).toHaveBeenCalledTimes(3); // Ensure all populates were chained
    });
  });

  /* ==========================================================
     4. Testing updateDonation
     ========================================================== */
  describe('updateDonation', () => {
    const updateData = { conditionNotes: 'Updated notes', quantityAmount: 5 };

    it('should throw 404 if donation does not exist', async () => {
      Donation.findById.mockResolvedValue(null);
      await expect(
        donationService.updateDonation('don123', mockUserId, 'donor', updateData, [])
      ).rejects.toThrow('Donation not found');
    });

    it("should throw 403 if donor tries to update someone else's donation", async () => {
      Donation.findById.mockResolvedValue({ _id: 'don123', donor: 'otherUser' });
      await expect(
        donationService.updateDonation('don123', mockUserId, 'donor', updateData, [])
      ).rejects.toThrow('You are not authorized to update this donation');
    });

    it('should throw 400 if donor tries to update a donation that is not pending or rejected', async () => {
      Donation.findById.mockResolvedValue({
        _id: 'don123',
        donor: mockUserId,
        status: 'delivered',
      });
      await expect(
        donationService.updateDonation('don123', mockUserId, 'donor', updateData, [])
      ).rejects.toThrow('You can only update pending or rejected donations');
    });

    it('should update successfully and append new images', async () => {
      const existingDonation = {
        _id: 'don123',
        donor: mockUserId,
        status: 'pending',
        images: [{ url: 'old_img.jpg', caption: 'Old' }],
        quantity: { amount: 1, unit: 'box' },
      };
      Donation.findById.mockResolvedValue(existingDonation);
      ImageStorageService.uploadImage.mockResolvedValue({ url: 'new_img.jpg', publicId: 'new1' });
      
      const mockUpdated = { 
        _id: 'don123',
        populate: jest.fn().mockResolvedValue(this) // Make populate chainable for the test
      };
      Donation.findByIdAndUpdate.mockResolvedValue(mockUpdated);

      await donationService.updateDonation(
        'don123',
        mockUserId,
        'donor',
        { quantityAmount: 10 },
        mockFiles
      );

      expect(ImageStorageService.uploadImage).toHaveBeenCalled();
      expect(Donation.findByIdAndUpdate).toHaveBeenCalled();
      const updateArgs = Donation.findByIdAndUpdate.mock.calls[0][1].$set;
      expect(updateArgs.quantity.amount).toBe(10);
      expect(updateArgs.images.length).toBe(2);
      expect(mockUpdated.populate).toHaveBeenCalledTimes(2);
    });
  });

  /* ==========================================================
     5. Testing deleteDonation
     ========================================================== */
  describe('deleteDonation', () => {
    it('should throw 404 if donation does not exist', async () => {
      Donation.findById.mockResolvedValue(null);
      await expect(donationService.deleteDonation('don123', mockUserId, 'donor')).rejects.toThrow(
        'Donation not found'
      );
    });

    it("should throw 403 if donor tries to delete someone else's donation", async () => {
      Donation.findById.mockResolvedValue({ _id: 'don123', donor: 'otherUser' });
      await expect(donationService.deleteDonation('don123', mockUserId, 'donor')).rejects.toThrow(
        'You are not authorized to delete this donation'
      );
    });

    it('should throw 400 if donor tries to delete a donation that is not pending or rejected', async () => {
      Donation.findById.mockResolvedValue({
        _id: 'don123',
        donor: mockUserId,
        status: 'approved_by_institution',
      });
      await expect(donationService.deleteDonation('don123', mockUserId, 'donor')).rejects.toThrow(
        'You can only delete pending or rejected donations'
      );
    });

    it('should soft-delete a donation', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const existingDonation = {
        _id: 'don123',
        donor: mockUserId,
        status: 'pending',
        images: [{ url: 'some-url' }],
        save: mockSave,
      };

      Donation.findById.mockResolvedValue(existingDonation);

      await donationService.deleteDonation('don123', mockUserId, 'admin'); // Admin bypasses status check

      expect(ImageStorageService.deleteImage).not.toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(existingDonation.status).toBe('cancelled');
      expect(existingDonation.deletedAt).toBeInstanceOf(Date);
    });
  });
});
