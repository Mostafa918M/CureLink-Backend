// services/Donation.service.js
const AiService = require('./Ai.service');
const ImageStorageService = require('./imagestorage.service');
const Donation = require('../models/donation.model');
const Medicine = require('../models/medicine.model');
const ApiError = require('../utils/apiError');
const notificationService = require('./notification.service');
const user=require("../models/user.model")

class donationService {
  async createDonation(userId, files, bodyData = {}) {
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

    const uploadPromises = files.map((file) => ImageStorageService.uploadImage(file.buffer,"Donations"));
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

      const donationPayload = {
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
      };

      if (bodyData.matchedInstitution) {
        donationPayload.matchedInstitution = bodyData.matchedInstitution;
        donationPayload.matchedAt = new Date();
      }

      const donation = await Donation.create(donationPayload);

      await donation.populate('medicine', 'name strength dosageForm category');

      if (donation.matchedInstitution) {
        await donation.populate('matchedInstitution', 'firstName lastName email phone');
      }

      //send notifcation from system to admins for review new pending donation 
      const admins=await user.find({role:"admin",isActive:true}).select("_id")
      await Promise.all(
        admins.map(admin=>{
          return notificationService.createNotification({
            userId:admin._id,
            type:"new_donation_submitted",
            data:{medicineName:donation.medicine.name}
        })
        })
      )

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
  async updateDonation(donationId, userId, userRole, updateData, files) {
    const donation = await Donation.findById(donationId);
    if (!donation) throw new ApiError('Donation not found', 404);

    if (userRole === 'donor' && donation.donor.toString() !== userId.toString()) {
      throw new ApiError('You are not authorized to update this donation', 403);
    }

    if (userRole === 'donor' && !['pending', 'rejected'].includes(donation.status)) {
      throw new ApiError('You can only update pending or rejected donations', 400);
    }

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => ImageStorageService.uploadImage(file.buffer,"Donations"));
      const uploadedImages = await Promise.all(uploadPromises);

      const newImageObjects = uploadedImages.map((img) => ({
        url: img.url,
        caption: 'Updated Image',
      }));

      updateData.images = [...donation.images, ...newImageObjects];
    }

    delete updateData.donor;
    delete updateData.medicine;
    delete updateData.statusHistory;
   
    if (updateData.quantityAmount || updateData.quantityUnit) {
      updateData.quantity = {
        amount: updateData.quantityAmount || donation.quantity.amount,
        unit: updateData.quantityUnit || donation.quantity.unit,
      };
      delete updateData.quantityAmount;
      delete updateData.quantityUnit;
    }
    if (updateData.matchedInstitution) {
      if(donation.matchedInstitution?.toString() !== updateData.matchedInstitution.toString()) {
        updateData.matchedAt = new Date();
      }
    }
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('medicine', 'name strength dosageForm category')
    .populate('matchedInstitution', 'firstName lastName email phone');

    return updatedDonation;
  }

  async deleteDonation(donationId, userId, userRole) {
    const donation = await Donation.findById(donationId);
    if (!donation) throw new ApiError('Donation not found', 404);

    if (userRole === 'donor' && donation.donor.toString() !== userId.toString()) {
      throw new ApiError('You are not authorized to delete this donation', 403);
    }

    if (userRole === 'donor' && !['pending', 'rejected'].includes(donation.status)) {
      throw new ApiError('You can only delete pending or rejected donations', 400);
    }

    if (donation.images && donation.images.length > 0) {
      const deletePromises = donation.images.map((img) => {
        const urlParts = img.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `medicine-donations/${filename.split('.')[0]}`;
        return ImageStorageService.deleteImage(publicId);
      });
      await Promise.allSettled(deletePromises);
    }

    await donation.deleteOne();
  }
}

module.exports = new donationService();
