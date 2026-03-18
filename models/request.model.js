const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    strength: String, 
    dosageForm: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'],
    },
    requiredQuantity: {
      amount: { type: Number, required: true, min: 1 },
      unit: { 
        type: String, 
        enum: ['box', 'bottle', 'strip', 'unit'], 
        required: true 
      },
    },
    fulfilledQuantity: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'partially_fulfilled', 'fulfilled', 'cancelled', 'expired'],
      default: 'open',
      index: true,
    },
    notes: String,
    expiresAt: {
      type: Date,
      required: true,
    }
  },
  { timestamps: true }
);

requestSchema.index({ medicineName: 'text' });

module.exports = mongoose.model('Request', requestSchema);