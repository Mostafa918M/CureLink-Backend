// models/medicine.model.js

const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    genericName: {
      type: String,
      trim: true,
      index: true,
    },

    barcode: {
      type: String,
      unique: true,
      sparse: true, 
      trim: true,
    },

    manufacturer: {
      type: String,
      trim: true,
      index: true,
    },

    strength: {
      type: String, // e.g. "500mg"
      trim: true,
    },

    dosageForm: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'],
    },

    category: {
      type: String,
      trim: true,
      index: true,
    },

    prescriptionRequired: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },

    verification: {
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: Date,
      notes: String,
    },

    usageCount: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* Text index for search */
medicineSchema.index({
  name: 'text',
  genericName: 'text',
  manufacturer: 'text',
  dosageForm: 'text'
});

module.exports = mongoose.model('Medicine', medicineSchema);
