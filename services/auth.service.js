const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const { generateOTP } = require("../utils/otp");
const TokenUtils = require("../utils/tokenUtils");
const bcrypt = require('bcryptjs');


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
    if (!oldRefreshToken) {
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
    const { email, password, ipAddress, res } = data;
    // console.log(password);

    if (!email || !password) {
      throw new ApiError("email and password are required")
    }

    // Find the User by Email
    const user = await User.findOne({ email }).select("+password");
    // console.log(user);

    if (!user) {
      throw new ApiError("Invalid email or password", 400);
    }
    if (user.isLocked) {
      throw new ApiError("Account is locked due to multiple failed login attempts. Please try again later.", 403);
    }
    if (!user.isActive) {
      throw new ApiError("Account is deactivated. Please contact support.", 403);
    }

    // check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      throw new ApiError("Invalid email or password", 400);
    }
    if (user.failedLoginAttempts > 0) {
      await user.resetLoginAttempts();
    }
    user.lastLogin = Date.now();
    await user.save();

    // generate token & store refresh token in DB
    const accessToken = TokenUtils.generateAccessToken(user._id, user.role);
    const refreshToken = await TokenUtils.generateRefreshToken(user._id, ipAddress);

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
      }
    };
  }


  async logout(payload) {
    const { oldRefreshToken, ipAddress, res } = payload
    if (!oldRefreshToken) {
      throw new ApiError("No refresh token provided", 400);
    }

    //search refresh token in db and revoke it
    await TokenUtils.revokeToken(oldRefreshToken, ipAddress);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return { loggedOut: true };
  }

  async logoutAll(payload) {
    const { oldRefreshToken, ipAddress, res, userId } = payload
    if (!oldRefreshToken) {
      throw new ApiError("No refresh token provided", 400);
    }

    //search refresh token in db and revoke it
    await TokenUtils.revokeAllUserTokens(userId, ipAddress);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return { loggedOut: true };
  }

  async getMe(userId) {
    let user = await User
      .findById(userId)
      .lean()

    if (!user) {
      throw new ApiError("user not found", 404)
    }
    return {
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      }
    };
  }
}

module.exports = new AuthService();
