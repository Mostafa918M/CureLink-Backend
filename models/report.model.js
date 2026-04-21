// models/report.model.js
'use strict';

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['donations', 'institutions', 'requests', 'matching', 'monthly_summary'],
      required: true,
      index: true,
    },

    format: {
      type: String,
      enum: ['pdf', 'excel'],
      required: true,
    },

    /** The filters/params supplied when the report was generated */
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    filePath: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    /** File size in bytes */
    fileSize: {
      type: Number,
      default: 0,
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
      index: true,
    },

    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ createdAt: -1 });
reportSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
