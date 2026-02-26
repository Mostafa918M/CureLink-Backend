const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ApiError = require("../utils/apiError");
const sendResponse = require("../utils/sendResponse");
const InstitutionService = require("../services/institution.service");
const { register } = require("../services/auth.service");
const Institution = require("../models/institution.model");


class InstitutionController {

   async register(req, res) {
    const institurionData = {
      name: req.body.name,
      type: req.body.type,
      licenseNumber: req.body.licenseNumber,
      commercialRegister: req.body.commercialRegister,
      taxCard: req.body.taxCard,
      description: req.body.description,
      addresses: req.body.addresses,
      logo: req.body.logo
    };

    const institution = await InstitutionService.register(institurionData,req.user);

    return sendResponse(
      res,
      201,
      "success",
      "Institution registered successfully",
      institution);
  }


  async getProfile(req, res) {    
    const result = await InstitutionService.getProfile(req.user);

    return sendResponse(
      res,
      201,
      "success",
      "Institution profile fetched successfully",
      result);
  }


  async updateProfile(req, res) {
    const institurionData = {
      name: req.body.name,
      type: req.body.type,
      licenseNumber: req.body.licenseNumber,
      commercialRegister: req.body.commercialRegister,
      taxCard: req.body.taxCard,
      description: req.body.description,
      addresses: req.body.addresses,
      logo: req.body.logo
    };

    const updatedInstitution = await InstitutionService.updateProfile(req.user,institurionData);

    return sendResponse(
      res,
      200,
      "success",
      "Institution profile updated successfully",
      updatedInstitution);
  }




  async getAllInstitutions(req, res) {
    const filters={
      search:req.query.search || null,
      page: req.query.page,
      limit: req.query.limit
    }
    const institurionList = await InstitutionService.getAllInstitutions(filters);
    return sendResponse(
      res, 
      200,
      "success", 
      "Institutions fetched successfully", 
      institurionList);
  }


  async getOneInstitution(req, res) {
    const institution = await InstitutionService.getOneInstitution(req.params.id);

    if (!institution) {
      throw new ApiError("Institution not found", 404);
    }

    return sendResponse(
      res,
      200, 
      "success", 
      "Institution fetched successfully", 
      institution);
  }



  async postDocuments(req,res){
    const institution = await InstitutionService.register(req.body);
    return sendResponse(res, 201, "success", "Institution documents uploaded successfully", institution);
  }


  async getDocuments(req,res){
     const institution = await InstitutionService.getOneInstitution(req.params.id);

    if (!institution) {
      throw new ApiError("Institution not found", 404);
    }

    return sendResponse(res, 200, "success", "Institution documents fetched successfully", institution);
  }

}

const controller = new InstitutionController();

module.exports = {
  register: asyncErrorHandler(controller.register.bind(controller)),
  getAllInstitutions: asyncErrorHandler(controller.getAllInstitutions.bind(controller)),
  getOneInstitution: asyncErrorHandler(controller.getOneInstitution.bind(controller)),
  updateProfile: asyncErrorHandler(controller.updateProfile.bind(controller)),
  getProfile: asyncErrorHandler(controller.getProfile.bind(controller)),
  postDocuments: asyncErrorHandler(controller.postDocuments.bind(controller)),
  getDocuments:asyncErrorHandler(controller.getDocuments.bind(controller)),
};
