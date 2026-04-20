const ApiError = require("../utils/apiError");
const { param, validationResult } = require('express-validator');

const notificationValidator = {
  validateObjectId:[
   param("id")
   .trim()
   .custom(value=>{
    if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError("Invalid institution ID",400);
   }
   return true;})
   .withMessage("Invalid institution ID")
  ]
};

module.exports = notificationValidator;
