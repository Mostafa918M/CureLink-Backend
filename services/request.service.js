const Request = require("../models/request.model");
class RequestService {

  async getAll(filters = {}) {
    return "this action gets all Requests";
  }

  async getById(id) {
    return `this action gets Request by #${id}`;
  }

  async create(data) {
    return `this action creates a new Request ${JSON.stringify(data)}`;
  }

  async update(id, data) {
    return `this action updates Request by #${id} with data ${JSON.stringify(data)}`;
  }

  async delete(id) {
    return `this action deletes Request by #${id}`;
  }
}

module.exports = new RequestService();
