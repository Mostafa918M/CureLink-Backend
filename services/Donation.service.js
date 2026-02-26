// services/Donation.service.js
const AiService = require('./Ai.service');
const ImageStorageService = require('./imageStorage.service');
const Donation = require('../models/donation.model');
const Medicine = require('../models/medicine.model');
const ApiError = require('../utils/apiError');

class donationService {
  async createDonation(userId, files) {
    const buffers = files.map((f) => f.buffer);
    const extracted = await AiService.extractDataFromImage(buffers);

    if (!extracted || !extracted.medicine || !extracted.donation) {
      throw new ApiError('AI failed to extract valid data from images', 400);
    }

    const { medicine: medData, donation: donData } = extracted;

    if (!medData.name) {
      throw new ApiError('AI could not recognize the medicine name', 400);
    }

    const expiryDate = new Date(donData.expiryDate);
    if (isNaN(expiryDate.getTime())) {
      throw new ApiError('Extracted expiry date is invalid', 400);
    }

    const isExpired = expiryDate < new Date();
    if (isExpired) {
      throw new ApiError('Sorry, we cannot accept this medicine because it has expired.', 400);
    }

    const uploadPromises = files.map((file) => ImageStorageService.uploadImage(file.buffer));
    const uploadedImages = await Promise.all(uploadPromises);

    const imageObjects = uploadedImages.map((img) => ({
      url: img.url,
      caption: 'AI Extracted Image',
    }));

    try {
      let medicine = await Medicine.findOne({
        name: { $regex: new RegExp(`^${medData.name.trim()}$`, 'i') },
      });

      if (!medicine) {
        const validDosageForms = [
          'tablet',
          'capsule',
          'syrup',
          'injection',
          'cream',
          'drops',
          'other',
        ];
        const dosageForm = validDosageForms.includes(medData.dosageForm)
          ? medData.dosageForm
          : 'other';

        medicine = await Medicine.create({
          name: medData.name,
          strength: medData.strength || undefined,
          dosageForm: dosageForm,
          createdBy: userId,
          status: 'pending',
        });
      }

      const validUnits = ['box', 'bottle', 'strip', 'unit'];
      const quantityUnit = validUnits.includes(donData.quantityUnit)
        ? donData.quantityUnit
        : 'unit';
      const quantityAmount = Number(donData.quantityAmount) || 1;

      const donation = await Donation.create({
        donor: userId,
        medicine: medicine._id,
        quantity: {
          amount: quantityAmount,
          unit: quantityUnit,
        },
        batchNumber: donData.batchNumber || undefined,
        expiryDate: expiryDate,
        conditionNotes: donData.conditionNotes || '',
        images: imageObjects,
        status: 'pending',
        isExpiredAutoFlagged: false,
        statusHistory: [
          {
            status: 'pending',
            changedBy: userId,
            role: 'donor',
            notes: 'Data extracted and request created via AI',
          },
        ],
      });

      await donation.populate('medicine', 'name strength dosageForm category');
      return donation;
    } catch (error) {
      if (uploadedImages && uploadedImages.length > 0) {
        await Promise.all(
          uploadedImages.map((img) => ImageStorageService.deleteImage(img.publicId))
        ).catch((err) => console.error('Failed to delete images during rollback:', err));
      }

      throw new ApiError('An error occurred while saving the donation to the database', 500);
    }
  }
  async getAllDonations(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const donations = await Donation.find()
      .populate('donor', 'firstName lastName email phone')
      .populate('medicine', 'name strength dosageForm category')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Donation.countDocuments();

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

  async getDonationById(id) {
    const donation = await Donation.findById(id)
      .populate('donor', 'firstName lastName email phone')
      .populate('medicine', 'name strength dosageForm category')
      .populate('matchedInstitution', 'firstName lastName email phone'); 

    if (!donation) {
      throw new ApiError('Donation not found', 404);
    }

    return donation;
  }
}

module.exports = new donationService();
