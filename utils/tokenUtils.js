const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/refreshToken.model");

class TokenUtils {
  static generateAccessToken(userId, role) {
    return jwt.sign(
      { userId, role, type: "access" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  }
  static async generateRefreshToken(userId, ipAddress) {
    const token = crypto.randomBytes(40).toString("hex");
    const expireDays = parseInt(
      process.env.REFRESH_TOKEN_EXPIRY.replace("d", "")
    );
    const hashToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  
    const expiresAt = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);
    const refreshToken = await RefreshToken.create({
      hashToken,
      user: userId,
      expiresAt,
      createdByIp: ipAddress,
    });
    return token;
  }

  static verifyAccessToken(token) {
    try {
     const decoded= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     return decoded;
    } catch (err) {
      throw new Error("Invalid or expired access token");
    }
  }

  static async verifyRefreshToken(token) {
    const hashToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const refreshToken = await RefreshToken.findOne({hashToken}).populate("user");

      if (!refreshToken) {
    throw new Error("Refresh token not found");
  }

  if (refreshToken.isExpired) {
    throw new Error("Refresh token expired");
  }

  if (refreshToken.revokedAt) {
    throw new Error("Refresh token revoked");
  }

  if (refreshToken.replacedByToken) {
    throw new Error("Refresh token has been rotated");
  }
  if (!refreshToken.isActive) {
    throw new Error("Refresh token is inactive");
  }

    return refreshToken;
  }

  static async revokeToken(token, ipAddress) {
    const hashToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
      
    const refreshToken = await RefreshToken.findOne({ hashToken });

    if (!refreshToken || !refreshToken.isActive) {
      throw new Error("Token not found or already revoked");
    }

    refreshToken.revokedAt = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.isActive = false;

    await refreshToken.save();
  }

  static async revokeAllUserTokens(userId, ipAddress) {
    await RefreshToken.updateMany(
      { user: userId, isActive: true },
      {
        revokedAt: Date.now(),
        revokedByIp: ipAddress,
        isActive: false,
      }
    );
  }
  static async cleanupExpiredTokens() {
    const result = await RefreshToken.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { revokedAt: { $exists: true } },
      ],
    });
    return result.deletedCount;
  }

  static async rotateRefreshToken(oldToken, ipAddress) {
    const oldRefreshToken = await this.verifyRefreshToken(oldToken);

    const newToken = await this.generateRefreshToken(
      oldRefreshToken.user._id,
      ipAddress
    );

    oldRefreshToken.revokedAt = Date.now();
    oldRefreshToken.revokedByIp = ipAddress;
    oldRefreshToken.replacedByToken = newToken;
    oldRefreshToken.isActive = false;
    await oldRefreshToken.save();

    return newToken;
  }
}

module.exports = TokenUtils;
