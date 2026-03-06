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
    it('should return paginated donations', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([{ _id: 'don1' }, { _id: 'don2' }]),
      };
      Donation.find.mockReturnValue(mockQuery);
      Donation.countDocuments.mockResolvedValue(20);

      const result = await donationService.getAllDonations({ page: 2, limit: 10 });

      expect(Donation.find).toHaveBeenCalled();
      expect(mockQuery.skip).toHaveBeenCalledWith(10); // (page 2 - 1) * 10
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result.pagination.total).toBe(20);
      expect(result.pagination.pages).toBe(2);
      expect(result.donations.length).toBe(2);
    });
  });

  /* ==========================================================
     3. Testing getDonationById
     ========================================================== */
  describe('getDonationById', () => {
    it('should throw 404 if donation is not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      // Chain the third populate to resolve to null
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(null);
      Donation.findById.mockReturnValue(mockQuery);

      await expect(donationService.getDonationById('invalidId')).rejects.toThrow(
        'Donation not found'
      );
    });

    it('should return donation if found', async () => {
      const mockQuery = { populate: jest.fn().mockReturnThis() };
      const mockDonation = { _id: 'don123' };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(mockDonation);
      Donation.findById.mockReturnValue(mockQuery);

      const result = await donationService.getDonationById('don123');
      expect(result._id).toBe('don123');
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

      // Mock uploading a new image
      ImageStorageService.uploadImage.mockResolvedValue({ url: 'new_img.jpg', publicId: 'new1' });

      // Mock the findByIdAndUpdate chain
      const mockUpdated = { _id: 'don123', populate: jest.fn().mockResolvedValue(true) };
      const mockQuery = { populate: jest.fn().mockResolvedValue(mockUpdated) };
      Donation.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await donationService.updateDonation(
        'don123',
        mockUserId,
        'donor',
        { quantityAmount: 10 },
        mockFiles
      );

      expect(ImageStorageService.uploadImage).toHaveBeenCalled();
      expect(Donation.findByIdAndUpdate).toHaveBeenCalled();
      // Ensure the quantity amount was mapped properly
      const updateArgs = Donation.findByIdAndUpdate.mock.calls[0][1].$set;
      expect(updateArgs.quantity.amount).toBe(10);
      // Ensure images were merged
      expect(updateArgs.images.length).toBe(2);
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

    it('should delete images from Cloudinary and remove document', async () => {
      const mockDeleteOne = jest.fn().mockResolvedValue(true);
      const existingDonation = {
        _id: 'don123',
        donor: mockUserId,
        status: 'pending',
        images: [
          { url: 'http://res.cloudinary.com/demo/image/upload/v1/medicine-donations/img_abc.jpg' },
        ],
        deleteOne: mockDeleteOne,
      };

      Donation.findById.mockResolvedValue(existingDonation);
      ImageStorageService.deleteImage.mockResolvedValue(true);

      await donationService.deleteDonation('don123', mockUserId, 'admin'); // Admin bypasses status check

      // check if the exact publicId was passed to deleteImage
      expect(ImageStorageService.deleteImage).toHaveBeenCalledWith('medicine-donations/img_abc');
      expect(mockDeleteOne).toHaveBeenCalled();
    });
  });
});
