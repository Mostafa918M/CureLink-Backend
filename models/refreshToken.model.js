const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  hashToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,

  },
  createdByIp: String,
  revokedAt: Date,
  revokedByIp: String,
  replacedByToken: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);


refreshTokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expiresAt;
});

refreshTokenSchema.virtual("isValid").get(function () {
  return this.isActive && !this.isExpired && !this.revokedAt;
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);