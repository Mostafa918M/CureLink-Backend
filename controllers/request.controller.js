const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ApiError = require("../utils/apiError");
const sendResponse = require("../utils/sendResponse");
const RequestService = require("../services/request.service");


class RequestController {
  async getAll(req, res) {
    const undefined = await RequestService.getAll(req.query);
    return sendResponse(res, 200, "success", "Requests fetched successfully", undefined);
  }

  async getOne(req, res) {
    const request = await RequestService.getById(req.params.id);

    if (!request) {
      throw new ApiError("Request not found", 404);
    }

    return sendResponse(res, 200, "success", "Request fetched successfully", request);
  }

  async create(req, res) {
    const request = await RequestService.create(req.body);
    return sendResponse(res, 201, "success", "Request created successfully", request);
  }

  async update(req, res) {
    const request = await RequestService.update(req.params.id, req.body);

    if (!request) {
      throw new ApiError("Request not found", 404);
    }

    return sendResponse(res, 200, "success", "Request updated successfully", request);
  }

  async delete(req, res) {
    const result = await RequestService.delete(req.params.id);

    if (!result) {
      throw new ApiError("Request not found", 404);
    }

    return sendResponse(res, 200, "success", "Request deleted successfully");
  }
}

const controller = new RequestController();

module.exports = {
  getAll: asyncErrorHandler(controller.getAll.bind(controller)),
  getOne: asyncErrorHandler(controller.getOne.bind(controller)),
  create: asyncErrorHandler(controller.create.bind(controller)),
  update: asyncErrorHandler(controller.update.bind(controller)),
  delete: asyncErrorHandler(controller.delete.bind(controller)),
};
