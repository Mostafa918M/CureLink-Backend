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

describe('donationService - createDonation', () => {
  const mockUserId = 'user123';
  const mockFiles = [{ buffer: Buffer.from('fake-image-data') }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      donation: { expiryDate: '2028-12-31', quantityAmount: 3, quantityUnit: 'bottle' },
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
