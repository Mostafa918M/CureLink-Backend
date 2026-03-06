const ApiError = require("../utils/apiError");
const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(
      errors.array({ onlyFirstError: true })[0].msg,
      400
    ));
  }
  next();
};

const authValidator = {
  register: [
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ max: 50 })
      .withMessage("First name cannot be more than 50 characters")
      .bail(),
    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ max: 50 })
      .withMessage("Last name cannot be more than 50 characters")
      .bail(),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail()
      .bail(),
    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^(010|011|012|015)\d{8}$/)
      .withMessage(
        "Invalid phone number format. Must be a valid Egyptian number (010, 011, 012, 015 followed by 8 digits)"
      ),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],

  login: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email or phone number is required")
      .custom((value) => {
        const isEmail = /^\S+@\S+\.\S+$/.test(value);
        // const isEgPhone = egyptPhoneRegex.test(value);
        if (!isEmail) return new ApiError("Identifier must be a valid email");
        return true;
      })
    ,body("password").notEmpty().withMessage("Password is required"),
    handleValidationErrors,
  ],

  verifyEmail: [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("otp")
      .notEmpty()
      .withMessage("OTP is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
    handleValidationErrors,
  ],

  resendEmailVerification: [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    handleValidationErrors,
  ],
};

module.exports = authValidator;
