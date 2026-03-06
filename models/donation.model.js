// models/donation.model.js

const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true,
    },

    quantity: {
      amount: {
        type: Number,
        required: true,
        min: 1,
      },
      unit: {
        type: String,
        enum: ['box', 'bottle', 'strip', 'unit'],
        required: true,
      },
    },

    batchNumber: {
      type: String,
      trim: true,
    },

    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },

    conditionNotes: {
      type: String,
      trim: true,
    },

    images: [
      {
        url: String,
        caption: String,
      },
    ],

    status: {
      type: String,
      enum: [
        'pending',
        'admin_review',
        'available',
        'matched',
        'approved_by_institution',
        'delivered',
        'rejected',
        'expired',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },

    statusHistory: [
      {
        status: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['donor', 'admin', 'institution'],
        },
        notes: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    matchedInstitution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    matchedAt: Date,

    delivery: {
      method: {
        type: String,
        enum: ['pickup', 'courier'],
      },
      trackingNumber: String,
      status: String,
      dispatchedAt: Date,
      deliveredAt: Date,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    isExpiredAutoFlagged: {
      type: Boolean,
      default: false,
    },

    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* Auto flag expired donation */
donationSchema.pre('save', function () {
  if (this.expiryDate < new Date()) {
    this.status = 'expired';
    this.isExpiredAutoFlagged = true;
  }
});

module.exports = mongoose.model('Donation', donationSchema);
