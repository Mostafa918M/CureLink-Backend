const asyncErrorHandler = require("../utils/asyncErrorHandler");
const sendResponse = require("../utils/sendResponse");
const AdminInstitutionService = require("../services/admin.institution.service");
const ApiError = require("../utils/apiError");

class AdminInstitutionController {
    async getAllInstitutions(req, res) {
        const result = await AdminInstitutionService.getAllInstitutions(req.query);
        return sendResponse(res, 200, "success", "All institutions fetched successfully", result);
    }

    async getPendingInstitutions(req, res) {
        const result = await AdminInstitutionService.getPendingInstitutions(req.query);
        return sendResponse(res, 200, "success", "Pending institutions fetched successfully", result);
    }

    async getInstitutionDetails(req, res) {
        const institution = await AdminInstitutionService.getInstitutionDetails(req.params.id);
        return sendResponse(res, 200, "success", "Institution details fetched successfully", { institution });
    }

    async verifyInstitution(req, res) {
        const institution = await AdminInstitutionService.verifyInstitution(req.params.id);
        return sendResponse(res, 200, "success", "Institution verified successfully", { institution });
    }

    async rejectInstitution(req, res) {
        const reason = req.body.reason || req.body.rejectionReason;
        if (!reason) {
            throw new ApiError("Rejection reason is required", 400);
        }
        const institution = await AdminInstitutionService.rejectInstitution(req.params.id, reason);
        return sendResponse(res, 200, "success", "Institution rejected successfully", { institution });
    }
}

const controller = new AdminInstitutionController();

module.exports = {
    getAllInstitutions: asyncErrorHandler(controller.getAllInstitutions.bind(controller)),
    getPendingInstitutions: asyncErrorHandler(controller.getPendingInstitutions.bind(controller)),
    getInstitutionDetails: asyncErrorHandler(controller.getInstitutionDetails.bind(controller)),
    verifyInstitution: asyncErrorHandler(controller.verifyInstitution.bind(controller)),
    rejectInstitution: asyncErrorHandler(controller.rejectInstitution.bind(controller)),
};
