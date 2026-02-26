const { updateProfile } = require("../services/institution.service");
const ApiError = require("../utils/apiError");
const { body, param, validationResult } = require('express-validator');

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



const institutionValidator = {
  // Validation rules for creating institutio
  register: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Institution name is required")
      .isLength({ max: 50 })
      .withMessage("Institution name cannot be more than 50 characters"),

    body("type")
      .notEmpty()
      .withMessage("Institution type is required")
      .isIn(["hospital", "pharmacy", "clinic", "charity", "medical_center", "ngo", "other"])
      .withMessage("Invalid institution type"),

    body("licenseNumber")
      .trim()
      .notEmpty()
      .withMessage("License number is required")
      .isLength({ min: 5, max: 30 })
      .withMessage("License number must be between 5 and 30 characters")
      .matches(/^[A-Za-z0-9\-\/ ]+$/)
      .withMessage("Invalid license number format"),

    body("commercialRegister")
      .trim(),

    body("taxCard")
      .trim(),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),

    body("addresses")
      .isArray({ min: 1 })
      .withMessage("At least one address is required"),

    body("addresses.*.governorate")
      .trim()
      .notEmpty()
      .withMessage("Governorate is required"),

    body("addresses.*.city")
      .trim(),

    body("addresses.*.street")
       .trim(),

    body("addresses.*.type")
      .isIn(["main", "branch"])
      .withMessage("Address type must be main or branch"),

    body("addresses.*.coordinates.coordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage("Coordinates must be [longitude, latitude]"),

    body("addresses.*.coordinates.coordinates.*")
      .isFloat()
      .withMessage("Coordinates must be numbers"),
    
  ],

  /**
   * Validation rules for updating institution
   */
  updateProfile: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Institution name is required")
      .isLength({ max: 50 })
      .withMessage("Institution name cannot be more than 50 characters"),

    body("type")
      .notEmpty()
      .withMessage("Institution type is required")
      .isIn(["hospital", "pharmacy", "clinic", "charity", "medical_center", "ngo", "other"])
      .withMessage("Invalid institution type"),

    body("licenseNumber")
      .trim()
      .notEmpty()
      .withMessage("License number is required")
      .isLength({ min: 5, max: 30 })
      .withMessage("License number must be between 5 and 30 characters")
      .matches(/^[A-Za-z0-9\-\/ ]+$/)
      .withMessage("Invalid license number format"),

    body("commercialRegister")
      .trim(),

    body("taxCard")
      .trim(),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),

    body("addresses")
      .isArray({ min: 1 })
      .withMessage("At least one address is required"),

    body("addresses.*.governorate")
      .trim()
      .notEmpty()
      .withMessage("Governorate is required"),

    body("addresses.*.city")
      .trim(),

    body("addresses.*.street")
       .trim(),

    body("addresses.*.type")
      .isIn(["main", "branch"])
      .withMessage("Address type must be main or branch"),

    body("addresses.*.coordinates.coordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage("Coordinates must be [longitude, latitude]"),

    body("addresses.*.coordinates.coordinates.*")
      .isFloat()
      .withMessage("Coordinates must be numbers"), 
  ]
};

module.exports = institutionValidator;
