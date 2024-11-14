const statusService = require('../services/statuses.service');
const { ApiResponse, ApiError } = require('../helpers/response.helper');

exports.createStatus = async (req, res) => {
  try {
    const status = await statusService.createStatus(req.body, req.user.id);
    ApiResponse.send(res, 201, 'Status created successfully', status);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};
