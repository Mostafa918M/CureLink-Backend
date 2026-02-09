const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ApiError = require("../utils/apiError");
const sendResponse = require("../utils/sendResponse");
const AuthService = require("../services/auth.service");

class AuthController {
  async register(req, res) {
    const result = await AuthService.register(req.body);
    return sendResponse(res, 201, "success", "User registered successfully", result);
  }

  async verifyEmail(req, res) {
    const result = await AuthService.verifyEmail(req.body);
    return sendResponse(res, 200, "success", "Email verified successfully", result);
  }


  async login(req, res) {
    const result = await AuthService.login(req.body);
    return sendResponse(res, 200, "success", "User logged in successfully", result);
  }

  async refreshToken(req, res) {
    const result = await AuthService.refreshToken(req.body.token);
    return sendResponse(res, 200, "success", "Token refreshed successfully", result);
  }

  async logout(req, res) {
    const result = await AuthService.logout(req.body.token);
    return sendResponse(res, 200, "success", "Logged out successfully", result);
  }

  async logoutAll(req, res) {
    const result = await AuthService.logoutAll(req.user);
    return sendResponse(res, 200, "success", "Logged out from all devices successfully", result);
  }

  async getMe(req, res) {
    const result = await AuthService.getMe(req.user?.id);
    return sendResponse(res, 200, "success", "User data fetched successfully", result);
  }
}

const controller = new AuthController();

module.exports = {
  register: asyncErrorHandler(controller.register.bind(controller)),
  verifyEmail: asyncErrorHandler(controller.verifyEmail.bind(controller)),
  login: asyncErrorHandler(controller.login.bind(controller)),
  refreshToken: asyncErrorHandler(controller.refreshToken.bind(controller)),
  logout: asyncErrorHandler(controller.logout.bind(controller)),
  logoutAll: asyncErrorHandler(controller.logoutAll.bind(controller)),
  getMe: asyncErrorHandler(controller.getMe.bind(controller)),
};
