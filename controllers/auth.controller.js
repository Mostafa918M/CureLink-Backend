const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ApiError = require("../utils/apiError");
const sendResponse = require("../utils/sendResponse");
const AuthService = require("../services/auth.service");

class AuthController {
  async register(req, res) {
    const payload = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    };

    const result = await AuthService.register(payload);
    return sendResponse(
      res,
      201,
      "success",
      "User registered successfully",
      result
    );
  }

  async verifyEmail(req, res) {
    const payload = {
      email: req.body.email,
      otp: req.body.otp,
      ipAddress: req.ip,
      res,
    };
    const result = await AuthService.verifyEmail(payload);
    return sendResponse(
      res,
      200,
      "success",
      "Email verified successfully",
      result
    );
  }

  async resendEmailVerification(req, res) {
    const payload = {
      email: req.body.email,
    };
    const result = await AuthService.resendEmailVerification(payload);
    return sendResponse(
      res,
      200,
      "success",
      "Verification email resent successfully",
      result
    );
  }

  async refreshToken(req, res) {
    const payload = {
      oldRefreshToken: req.cookies.refreshToken,
      ipAddress: req.ip,
      res,
    }
    const result = await AuthService.refreshToken(payload);
    return sendResponse(
      res,
      200,
      "success",
      "Token refreshed successfully",
      result
    );
  }

    async login(req, res) {
    const result = await AuthService.login(req.body);
    return sendResponse(
      res,
      200,
      "success",
      "User logged in successfully",
      result
    );
  }
//
  async logout(req, res) {
    const payload = {
      oldRefreshToken: req.cookies.refreshToken,
      ipAddress: req.ip,
    }
    const result = await AuthService.logout(payload);
    return sendResponse(res, 200, "success", "Logged out successfully", result);
  }

  async logoutAll(req, res) {
    const payload = {
      oldRefreshToken: req.cookies.refreshToken,
      ipAddress: req.ip,
    }
    const result = await AuthService.logoutAll(payload);
    return sendResponse(
      res,
      200,
      "success",
      "Logged out from all devices successfully",
      result
    );
  }

  async getMe(req, res) {
    const result = await AuthService.getMe(req.user?.id);
    return sendResponse(
      res,
      200,
      "success",
      "User data fetched successfully",
      result
    );
  }
}

const controller = new AuthController();

module.exports = {
  register: asyncErrorHandler(controller.register.bind(controller)),
  verifyEmail: asyncErrorHandler(controller.verifyEmail.bind(controller)),
  resendEmailVerification: asyncErrorHandler(controller.resendEmailVerification.bind(controller)),
  login: asyncErrorHandler(controller.login.bind(controller)),
  refreshToken: asyncErrorHandler(controller.refreshToken.bind(controller)),
  logout: asyncErrorHandler(controller.logout.bind(controller)),
  logoutAll: asyncErrorHandler(controller.logoutAll.bind(controller)),
  getMe: asyncErrorHandler(controller.getMe.bind(controller)),
};
