const jwt = require("jsonwebtoken");
const TokenUtils = require("../utils/tokenUtils");
const sendResponse = require("../utils/sendResponse");
const ApiError = require("../utils/apiError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const User = require("../models/user.model");

exports.authenticate = asyncErrorHandler(async (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        sendResponse(res, 401, "fail", "No access token provided");
        return;
    }

    const decoded = TokenUtils.verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
        sendResponse(res, 401, "fail", "User not found");
        return;
    }

    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    next();
})


exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            sendResponse(res, 401, "fail", "Unauthorized");
            return;
        }
        if (!req.userRole || !roles.includes(req.userRole)) {
            sendResponse(res, 403, "fail", "Access denied");
            return;
        }
        next();
    };
};
