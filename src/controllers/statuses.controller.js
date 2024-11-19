const statusService = require('../services/statuses.service');
const { ApiResponse, ApiError } = require('../helpers/response.helper');

const createStatus = async (req, res) => {
  try {
    const status = await statusService.createStatus(req.body, req.user);
    ApiResponse.send(res, 201, 'Status created successfully', status);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};

const getStatusById = async (req, res) => {
  try {
    const status = await statusService.getStatusById(req.params.id);
    if (!status) {
      return ApiResponse.send(res, 404, 'Status not found');
    }
    ApiResponse.send(res, 200, 'Status retrieved successfully', status);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};

const deleteStatus = async (req, res) => {
  try {
    await statusService.deleteStatus(req.params.id, req.user);
    ApiResponse.send(res, 200, 'Status deleted successfully');
  } catch (error) {
    ApiError.handleError(error, res);
  }
};

module.exports = {
  createStatus,
  getStatusById,
  deleteStatus,
};
