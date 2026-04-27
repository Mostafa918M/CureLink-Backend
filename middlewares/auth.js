const jwt = require("jsonwebtoken");
const TokenUtils = require("../utils/tokenUtils");
const sendResponse = require("../utils/sendResponse");
const ApiError = require("../utils/apiError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const User = require("../models/user.model");
const Institution = require("../models/institution.model");

exports.authenticate = asyncErrorHandler(async (req, res, next) => {
    const token = req.cookies.accessToken ||req.headers["authorization"]?.split(" ")[1];
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

    if (decoded.role !== user.role) {
        await TokenUtils.revokeAllUserTokens(user._id, req.ip);
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return next(new ApiError("Your role has been updated. Please login again to apply changes.", 401));
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

/**
 * Middleware: blocks institution users whose verificationStatus is not "verified".
 * Non-institution roles (admin, superadmin, donor) are passed through without a DB lookup.
 * Must be placed AFTER authenticate() so that req.user is already populated.
 */
exports.requireVerifiedInstitution = asyncErrorHandler(async (req, res, next) => {
    // Only enforce verification for institution-role users
    if (req.userRole !== "institution") return next();

    const institution = await Institution.findOne({ user: req.userId }).select("verificationStatus");

    if (!institution) {
        return next(new ApiError("No institution profile found for this account", 403));
    }

    if (institution.verificationStatus !== "verified") {
        return next(
            new ApiError(`Institution access denied. Your verification status is "${institution.verificationStatus}". Please wait for admin approval.`, 403)
        );
    }

    // Attach the institution to the request for downstream use
    req.institution = institution;
    next();
});
