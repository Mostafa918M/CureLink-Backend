const { body } = require("express-validator");

const userValidator = {
  updateProfile: [
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
  ],

  changePassword:[
    body("oldPassword")
          .notEmpty()
          .withMessage("Password is required")
          .isLength({ min: 8 })
          .withMessage("Password must be at least 8 characters"),

    body("newPassword")
          .notEmpty()
          .withMessage("Password is required")
          .isLength({ min: 8 })
          .withMessage("Password must be at least 8 characters"),  
  ]



}

module.exports = userValidator;

