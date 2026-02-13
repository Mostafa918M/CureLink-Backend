const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const { generateOTP } = require("../utils/otp");
const TokenUtils = require("../utils/tokenUtils");

class AuthService {
  async register(data) {
    const { firstName, lastName, email, phone, password } = data;
    const existedEmail = await User.findOne({ email });
    if (existedEmail) {
      throw new ApiError("Email already in use", 400);
    }
    const existedPhone = await User.findOne({ phone });
    if (existedPhone) {
      throw new ApiError("Phone number already in use", 400);
    }
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      otp,
      otpExpiry,
    });

    return {
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async verifyEmail(data) {
    const { email, otp, ipAddress, res } = data;
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    if (user.isVerified) {
      throw new ApiError("Email already verified", 400);
    }
    if (user.otp !== otp || user.otpExpiry < new Date()) {
      throw new ApiError("Invalid or expired OTP", 400);
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    const accessToken = TokenUtils.generateAccessToken(user._id, user.role);
    const refreshToken = await TokenUtils.generateRefreshToken(
      user._id,
      ipAddress
    );
    TokenUtils.setTokenCookies(res, accessToken, refreshToken);
    return {
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async resendEmailVerification(data) {
    const { email } = data;
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    if (user.isVerified) {
      throw new ApiError("Email already verified", 400);
    }
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    return { message: "Verification email resent successfully" };
  }

  async refreshToken(data) {
    const { oldRefreshToken, ipAddress, res } = data;
    if(!oldRefreshToken){
      throw new ApiError("Refresh token not found", 404);
    }
    const tokenDoc = await TokenUtils.verifyRefreshToken(oldRefreshToken); 
    const refreshToken = await TokenUtils.rotateRefreshToken(oldRefreshToken, ipAddress);
    const user = tokenDoc.user;
    const accessToken = TokenUtils.generateAccessToken(user._id, user.role);
    TokenUtils.setTokenCookies(res, accessToken, refreshToken);
    return {
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async login(data) {
    // Placeholder for login logic (generate tokens etc)
    return { message: "Login placeholder" };
  }


  async logout(token) {
    // Placeholder for logout logic
    return { message: "Logout placeholder" };
  }

  async logoutAll(user) {
    // Placeholder for logout from all devices logic
    return { message: "Logout all placeholder" };
  }

  async getMe(userId) {
    // Placeholder for get current user logic
    return { message: "Get Me placeholder" };
  }
}

module.exports = new AuthService();
