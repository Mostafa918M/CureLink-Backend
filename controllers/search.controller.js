const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ApiError = require("../utils/apiError");
const sendResponse = require("../utils/sendResponse");
const searchService = require("../services/search.service");


class SearchController {
  async getAll(req, res) {
    const search=req.query.search
    const query = {
      page: req.query.page,
      limit: req.query.limit,
    }

    const result=await searchService.donationSearch(query,search)
    return sendResponse(
      res,
      200, 
      "success", 
      result.message,
      {
        donations: result.donations,
        pagination: result.pagination,
      }
    );
  }

}

const controller = new SearchController();

module.exports = {
  getAll: asyncErrorHandler(controller.getAll.bind(controller)),
};
