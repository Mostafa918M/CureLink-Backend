const RequestService = require('../services/request.service');
const sendResponse = require('../utils/sendResponse');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

class RequestController {
  create = asyncErrorHandler(async (req, res) => {
    const request = await RequestService.createRequest(req.userId, req.body);
    sendResponse(res, 201, 'success', 'Request created', request);
  });

  getAll = asyncErrorHandler(async (req, res) => {
    const result = await RequestService.getAllRequests(req.userId, req.userRole, req.query);
    sendResponse(res, 200, 'success', 'Requests fetched', result);
  });

  getOne = asyncErrorHandler(async (req, res) => {
    const request = await RequestService.getRequestById(req.params.id, req.userId, req.userRole);
    sendResponse(res, 200, 'success', 'Request fetched', request);
  });

  update = asyncErrorHandler(async (req, res) => {
    const request = await RequestService.updateRequest(req.params.id, req.userId, req.body);
    sendResponse(res, 200, 'success', 'Request updated', request);
  });

  delete = asyncErrorHandler(async (req, res) => {
    await RequestService.deleteRequest(req.params.id, req.userId);
    sendResponse(res, 200, 'success', 'Request cancelled');
  });

  getMatches = asyncErrorHandler(async (req, res) => {
    const result = await RequestService.findMatches(req.params.id, req.query);
    sendResponse(res, 200, 'success', 'Matches found', result);
  });

  getStats = asyncErrorHandler(async (req, res) => {
    const stats = await RequestService.getStatistics(req.userId, req.userRole);
    sendResponse(res, 200, 'success', 'Statistics fetched', stats);
  });
}

module.exports = new RequestController();
